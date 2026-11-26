export type TransactionDirection = 'OUTGOING' | 'INCOMING' | 'UNKNOWN';

export type TransactionChannel =
  | 'MPESA_SEND_MONEY'
  | 'MPESA_PAYBILL'
  | 'MPESA_BUY_GOODS'
  | 'MPESA_POCHI'
  | 'MPESA_WITHDRAWAL'
  | 'MPESA_AIRTIME'
  | 'MPESA_FULIZA_USAGE'
  | 'MPESA_FULIZA_REPAYMENT'
  | 'BANK_TRANSFER'
  | 'PESALINK'
  | 'CARD_POS'
  | 'INCOMING_TRANSFER'
  | 'GENERIC_TRANSFER';

export type ClassificationCategory =
  | 'CONFIRMED_EXPENSE'
  | 'CONFIRMED_INCOME'
  | 'FULIZA_BORROWING'
  | 'FULIZA_REPAYMENT'
  | 'TRANSACTION_FEE'
  | 'NEEDS_USER_REVIEW'
  | 'UNSUPPORTED_MESSAGE';

export type SuggestedTrigger =
  | 'PROMPT_OUTGOING'
  | 'PROMPT_INCOMING'
  | 'DEFAULT_EXPENSE'
  | 'PROMPT_EXPENSE_OR_LOAN'
  | 'PROMPT_FULIZA_REVIEW'
  | 'IGNORE_INCOMING';

export type SmsParseConfidence = 'high' | 'medium' | 'low';

export interface FulizaDetails {
  isFulizaInvolved: boolean;
  fulizaAmount: number | null;
  walletPortion: number | null;
  fulizaAccessFee: number | null;
  fulizaInterest: number | null;
  outstandingFulizaBalance: number | null;
  availableFulizaLimit: number | null;
  isPartialRecovery?: boolean;
  grossInflowAmount?: number | null;
  netWalletImpact?: number | null;
  correlatedPrimaryRef?: string;
  correlatedSecondaryRef?: string;
}

export interface ParsedSmsTransaction {
  provider: 'MPESA' | 'BANK' | 'PESALINK';
  direction: TransactionDirection;
  channel: TransactionChannel;
  classificationCategory: ClassificationCategory;
  amount: number;
  currency: string;
  transactionCost: number | null;
  walletBalanceAfter?: number | null;
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
  rawMessage?: string;
  senderId?: string;
  fulizaDetails?: FulizaDetails | null;
  correlatedMessageIds?: string[];
  correlatedFingerprints?: string[];
  isAmbiguousMatch?: boolean;
}

export type SmsParseOutcome =
  | { status: 'classified'; transaction: ParsedSmsTransaction }
  | { status: 'needs_review'; reason: string; transaction?: ParsedSmsTransaction }
  | { status: 'unsupported'; reason: string };

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
  'FULIZAMPESA',
  'MPESAFULIZA',
]);
