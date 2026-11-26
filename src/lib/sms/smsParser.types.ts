export type TransactionDirection = 'OUTGOING' | 'INCOMING' | 'UNKNOWN';

export type TransactionChannel =
  | 'MPESA_SEND_MONEY'
  | 'MPESA_PAYBILL'
  | 'MPESA_BUY_GOODS'
  | 'MPESA_WITHDRAWAL'
  | 'MPESA_AIRTIME'
  | 'BANK_TRANSFER'
  | 'PESALINK'
  | 'CARD_POS'
  | 'INCOMING_TRANSFER'
  | 'GENERIC_TRANSFER';

export type SuggestedTrigger =
  | 'PROMPT_OUTGOING'
  | 'PROMPT_INCOMING'
  | 'DEFAULT_EXPENSE'
  | 'PROMPT_EXPENSE_OR_LOAN'
  | 'IGNORE_INCOMING';

export type SmsParseConfidence = 'high' | 'medium' | 'low';

export interface ParsedSmsTransaction {
  provider: 'MPESA' | 'BANK' | 'PESALINK';
  direction: TransactionDirection;
  channel: TransactionChannel;
  amount: number;
  currency: string;
  transactionCost: number | null;
  referenceCode: string;
  recipient: string;
  counterpartyName: string;
  recipientPhone: string | null;
  counterpartyPhone: string | null;
  accountReference: string | null;
  smsTimestamp: string;
  confidence: SmsParseConfidence;
  fingerprint: string;
  suggestedTrigger: SuggestedTrigger;
  rawMessage: string;
  senderId?: string;
}

export type PendingSmsStatus =
  | 'pending'
  | 'awaiting_details'
  | 'posted'
  | 'dismissed'
  | 'duplicate';

export interface PendingSmsDetection {
  id: string;
  userId: string;
  senderId: string;
  parsed: ParsedSmsTransaction;
  status: PendingSmsStatus;
  detectedAt: string;
  nativeEventId?: string;
  pendingRouteAction?: 'casual_lent' | 'casual_borrowed' | 'formal_lent' | 'formal_borrowed';
}

export interface NativeCapturedSmsEvent {
  id: string;
  userId: string;
  sender: string;
  rawBody: string;
  receivedAt: number;
}

/**
 * Official sender IDs to prevent spoofing from regular 07xx/01xx numbers.
 */
export const TRUSTED_KENYAN_SENDERS = new Set([
  'MPESA',
  'M-PESA',
  'MPESAKE',
  'SAFARICOM',
  'KCB',
  'KCBKENYA',
  'EQUITY',
  'EQUITYBANK',
  'EQUITYKE',
  'CO-OP',
  'COOP',
  'COOPBANK',
  'NCBA',
  'LOOP',
  'ABSA',
  'ABSAKENYA',
  'STANBIC',
  'STANCHART',
  'I&M',
  'IMBANK',
  'PESALINK',
  'DTB',
  'FAMILY',
  'FAMILYBANK',
  'SIDIAN',
  'FULIZA',
  'TIMIZA',
  'TALA',
  'BRANCH',
  'HF',
  'MSHWARI',
  'M-SHWARI',
  'AIRTEL',
  'AIRTELMONEY',
  'T-KASH',
]);
