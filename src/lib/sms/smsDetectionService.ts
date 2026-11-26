import { Platform, PermissionsAndroid } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LoanPayment, Transaction } from '../../types';
import {
  NativeCapturedSmsEvent,
  ParsedSmsTransaction,
  PendingSmsDetection,
  PendingSmsStatus,
} from './smsParser.types';
import { parseTransactionSms } from './parseTransactionSms';
import {
  checkSmsPermissionsSilently,
  hasNotificationAccess,
  hasOverlayPermission,
} from '../../native/smsExpenseCapture';

const STORAGE_PROCESSED_PREFIX = '@processedSmsFingerprints_';
const STORAGE_PENDING_PREFIX = '@pendingSmsDetections_';
const MAX_PROCESSED_HISTORY = 400;

export interface OsPermissionsSnapshot {
  notificationsGranted: boolean;
  smsGranted: boolean;
  notificationListenerGranted: boolean;
  overlayGranted: boolean;
  platform: 'android' | 'ios' | 'web';
}

export class SmsDetectionService {
  private static instance: SmsDetectionService;
  private isListening = false;
  private activeUserId = 'guest';
  private notificationSubscription: Notifications.EventSubscription | null = null;
  private processedFingerprints = new Set<string>();
  private loadedForUserId: string | null = null;
  private ledgerTransactions: Transaction[] = [];
  private ledgerPayments: LoanPayment[] = [];
  private onQueueChangedCallback: ((pending: PendingSmsDetection | null, totalPending: number) => void) | null = null;

  private constructor() { }

  public static getInstance(): SmsDetectionService {
    if (!SmsDetectionService.instance) {
      SmsDetectionService.instance = new SmsDetectionService();
    }
    return SmsDetectionService.instance;
  }

  private getProcessedKey(userId: string) {
    return `${STORAGE_PROCESSED_PREFIX}${userId || 'guest'}`;
  }

  private getPendingKey(userId: string) {
    return `${STORAGE_PENDING_PREFIX}${userId || 'guest'}`;
  }

  private async ensureUserLoaded(userId: string) {
    const uid = userId || 'guest';
    if (this.loadedForUserId === uid) return;
    this.loadedForUserId = uid;
    this.processedFingerprints.clear();
    try {
      const raw = await AsyncStorage.getItem(this.getProcessedKey(uid));
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          parsed.forEach((fp) => {
            if (typeof fp === 'string') this.processedFingerprints.add(fp);
          });
        }
      }
    } catch {
      // ignore corrupt storage
    }
  }

  public setLedgerContext(transactions: Transaction[], payments: LoanPayment[]) {
    this.ledgerTransactions = transactions || [];
    this.ledgerPayments = payments || [];
  }

  private async persistProcessedFingerprint(userId: string, fingerprint: string) {
    await this.ensureUserLoaded(userId);
    this.processedFingerprints.add(fingerprint);
    try {
      const sliced = Array.from(this.processedFingerprints).slice(-MAX_PROCESSED_HISTORY);
      await AsyncStorage.setItem(this.getProcessedKey(userId), JSON.stringify(sliced));
    } catch {
      // ignore
    }
  }

  public async loadPendingQueue(userId: string): Promise<PendingSmsDetection[]> {
    try {
      const raw = await AsyncStorage.getItem(this.getPendingKey(userId));
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }

  private async savePendingQueue(userId: string, queue: PendingSmsDetection[]) {
    try {
      const bounded = queue.slice(-40);
      await AsyncStorage.setItem(this.getPendingKey(userId), JSON.stringify(bounded));
    } catch {
      // ignore
    }
  }

  /**
   * Checks OS permissions WITHOUT triggering any interactive system prompts.
   */
  public async checkPermissionsStatus(): Promise<OsPermissionsSnapshot> {
    const platform = Platform.OS === 'ios' ? 'ios' : Platform.OS === 'web' ? 'web' : 'android';
    let notificationsGranted = false;
    try {
      const notifStatus = await Notifications.getPermissionsAsync();
      notificationsGranted = notifStatus.status === 'granted';
    } catch {
      notificationsGranted = false;
    }

    if (platform !== 'android') {
      return {
        notificationsGranted,
        smsGranted: false,
        notificationListenerGranted: false,
        overlayGranted: false,
        platform,
      };
    }

    const [smsGranted, notificationListenerGranted, overlayGranted] = await Promise.all([
      checkSmsPermissionsSilently(),
      hasNotificationAccess().catch(() => false),
      hasOverlayPermission().catch(() => false),
    ]);

    return {
      notificationsGranted,
      smsGranted,
      notificationListenerGranted,
      overlayGranted,
      platform,
    };
  }

  /**
   * Explicitly requests SMS and Notification permissions on Android (call ONLY on user intent).
   */
  public async requestPermissions(): Promise<{
    ok: boolean;
    smsGranted: boolean;
    notificationsGranted: boolean;
    neverAskAgain?: boolean;
    reason?: string;
  }> {
    try {
      let notificationsGranted = false;
      const existingNotif = await Notifications.getPermissionsAsync();
      if (existingNotif.status === 'granted') {
        notificationsGranted = true;
      } else {
        const reqNotif = await Notifications.requestPermissionsAsync();
        notificationsGranted = reqNotif.status === 'granted';
      }

      if (Platform.OS === 'android') {
        const permissionsToRequest: any[] = [];
        if ('RECEIVE_SMS' in PermissionsAndroid.PERMISSIONS) {
          permissionsToRequest.push(PermissionsAndroid.PERMISSIONS.RECEIVE_SMS);
        }
        if ('READ_SMS' in PermissionsAndroid.PERMISSIONS) {
          permissionsToRequest.push(PermissionsAndroid.PERMISSIONS.READ_SMS);
        }

        let receiveGranted = false;
        let readGranted = false;
        let neverAskAgain = false;

        if (permissionsToRequest.length > 0) {
          const results = (await PermissionsAndroid.requestMultiple(permissionsToRequest)) as Record<string, string>;
          const recKey = String(PermissionsAndroid.PERMISSIONS.RECEIVE_SMS || 'android.permission.RECEIVE_SMS');
          const readKey = String(PermissionsAndroid.PERMISSIONS.READ_SMS || 'android.permission.READ_SMS');
          receiveGranted = results[recKey] === PermissionsAndroid.RESULTS.GRANTED;
          readGranted = !('READ_SMS' in PermissionsAndroid.PERMISSIONS) || results[readKey] === PermissionsAndroid.RESULTS.GRANTED;
          neverAskAgain = Object.values(results).some((v) => v === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN);
        }

        const smsGranted = receiveGranted || readGranted;
        if (smsGranted) {
          return { ok: true, smsGranted: true, notificationsGranted, neverAskAgain: false };
        }
        return {
          ok: false,
          smsGranted: false,
          notificationsGranted,
          neverAskAgain,
          reason: neverAskAgain
            ? 'SMS permission is blocked in Android settings. Open App Settings -> Permissions -> SMS to allow transaction detection.'
            : 'SMS Read/Receive permissions are required on Android to detect incoming M-PESA & bank alerts.',
        };
      }

      if (notificationsGranted) {
        return { ok: true, smsGranted: false, notificationsGranted: true };
      }

      return {
        ok: false,
        smsGranted: false,
        notificationsGranted: false,
        reason: 'Notification permissions are required to detect incoming transaction alerts.',
      };
    } catch (err) {
      return {
        ok: false,
        smsGranted: false,
        notificationsGranted: false,
        reason: 'Failed to check/request permissions: ' + String(err),
      };
    }
  }

  private matchesExistingLedgerRecord(parsed: ParsedSmsTransaction): boolean {
    const ref = (parsed.referenceCode || '').trim().toUpperCase();
    const smsDay = (parsed.smsTimestamp || '').slice(0, 10);
    const amount = parsed.amount;

    const paymentHit = this.ledgerPayments.some((p) => {
      const pRef = (p.referenceNumber || '').trim().toUpperCase();
      if (ref && !ref.startsWith('AUTO-') && pRef && pRef === ref) {
        return true;
      }
      const pDay = String(p.paymentDate || '').slice(0, 10);
      return pDay === smsDay && Math.abs(Number(p.amount) - amount) < 0.01;
    });
    if (paymentHit) return true;

    return this.ledgerTransactions.some((t) => {
      const noteUpper = String(t.note || '').toUpperCase();
      if (ref && !ref.startsWith('AUTO-') && noteUpper.includes(ref)) {
        return true;
      }
      const tDay = String(t.date || '').slice(0, 10);
      if (tDay === smsDay && Math.abs(Number(t.amount) - amount) < 0.01) {
        const cp = parsed.recipient.toLowerCase().split(' ')[0];
        if (cp && cp.length >= 3 && noteUpper.toLowerCase().includes(cp)) {
          return true;
        }
      }
      return false;
    });
  }

  public async enqueueParsedSms(
    userId: string,
    senderId: string,
    parsed: ParsedSmsTransaction,
    nativeEventId?: string
  ): Promise<PendingSmsDetection | null> {
    const uid = userId || this.activeUserId || 'guest';
    await this.ensureUserLoaded(uid);

    // 1. Already processed or dismissed previously
    if (this.processedFingerprints.has(parsed.fingerprint)) {
      return null;
    }

    const queue = await this.loadPendingQueue(uid);

    // 2. Already queued waiting for classification
    if (
      queue.some(
        (item) =>
          item.parsed.fingerprint === parsed.fingerprint &&
          (item.status === 'pending' || item.status === 'awaiting_details')
      )
    ) {
      return null;
    }

    // 3. Already recorded in transactions or loan payments
    if (this.matchesExistingLedgerRecord(parsed)) {
      await this.persistProcessedFingerprint(uid, parsed.fingerprint);
      return null;
    }

    const detection: PendingSmsDetection = {
      id: `det_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      userId: uid,
      senderId,
      parsed,
      status: 'pending',
      detectedAt: new Date().toISOString(),
      nativeEventId,
    };

    const nextQueue = [...queue, detection];
    await this.savePendingQueue(uid, nextQueue);

    if (this.onQueueChangedCallback) {
      const actionable = nextQueue.filter((item) => item.status === 'pending');
      this.onQueueChangedCallback(actionable[0] ?? null, actionable.length);
    }
    return detection;
  }

  public async ingestNativeCapturedSms(
    userId: string,
    events: NativeCapturedSmsEvent[]
  ): Promise<{ processedIds: string[]; addedCount: number }> {
    const processedIds: string[] = [];
    let addedCount = 0;

    for (const evt of events) {
      processedIds.push(evt.id);
      if (evt.userId && evt.userId !== userId) {
        continue;
      }
      const parsed = parseTransactionSms(evt.sender, evt.rawBody, evt.receivedAt);
      if (!parsed) {
        continue;
      }
      const added = await this.enqueueParsedSms(userId, evt.sender, parsed, evt.id);
      if (added) addedCount++;
    }

    return { processedIds, addedCount };
  }

  public async getNextPendingDetection(
    userId: string
  ): Promise<{ detection: PendingSmsDetection | null; totalPending: number }> {
    const queue = await this.loadPendingQueue(userId);
    const actionable = queue.filter((item) => item.status === 'pending');
    return {
      detection: actionable[0] ?? null,
      totalPending: actionable.length,
    };
  }

  public async markDetectionStatus(
    userId: string,
    detectionId: string,
    status: PendingSmsStatus
  ): Promise<void> {
    const uid = userId || this.activeUserId || 'guest';
    const queue = await this.loadPendingQueue(uid);
    let targetFingerprint = '';

    const nextQueue = queue.map((item) => {
      if (item.id === detectionId) {
        targetFingerprint = item.parsed.fingerprint;
        return { ...item, status };
      }
      return item;
    });

    const filteredQueue =
      status === 'posted' || status === 'dismissed' || status === 'duplicate'
        ? nextQueue.filter((item) => item.id !== detectionId)
        : nextQueue;

    if (
      targetFingerprint &&
      (status === 'posted' || status === 'dismissed' || status === 'duplicate')
    ) {
      await this.persistProcessedFingerprint(uid, targetFingerprint);
    }

    await this.savePendingQueue(uid, filteredQueue);
  }

  public start(
    userId: string,
    onQueueChanged: (pending: PendingSmsDetection | null, totalPending: number) => void
  ) {
    this.activeUserId = userId || 'guest';
    this.onQueueChangedCallback = onQueueChanged;
    void this.ensureUserLoaded(this.activeUserId);

    if (this.isListening) return;
    this.isListening = true;

    this.notificationSubscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        try {
          const content = notification.request.content;
          const title = content.title || '';
          const body = content.body || '';
          void this.processRawAlert(this.activeUserId, title, body);
        } catch {
          // Never log raw SMS notification content
        }
      }
    );
  }

  public stop() {
    this.isListening = false;
    this.onQueueChangedCallback = null;
    if (this.notificationSubscription) {
      this.notificationSubscription.remove();
      this.notificationSubscription = null;
    }
  }

  public async processRawAlert(
    userId: string,
    sender: string,
    body: string,
    receivedAtMs?: number
  ): Promise<PendingSmsDetection | null> {
    if (!this.isListening) return null;
    const parsed = parseTransactionSms(sender, body, receivedAtMs);
    if (!parsed) return null;
    return this.enqueueParsedSms(userId || this.activeUserId, sender, parsed);
  }
}

export const smsDetectionService = SmsDetectionService.getInstance();
