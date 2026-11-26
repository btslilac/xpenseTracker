import {
  ParsedSmsTransaction,
  SmsParseConfidence,
  TransactionChannel,
  TransactionDirection,
  TRUSTED_KENYAN_SENDERS,
} from './smsParser.types';
import { SMS_PATTERNS } from './smsPatterns';

function parseAmount(rawAmount?: string | null): number {
  if (!rawAmount) return 0;
  const normalized = String(rawAmount).replace(/,/g, '').replace(/\s+/g, '');
  const value = parseFloat(normalized);
  return Number.isFinite(value) ? value : 0;
}

function normalizeCurrency(rawCurrency?: string | null): string {
  const c = String(rawCurrency || 'KES').trim().replace(/\.$/, '').toUpperCase();
  if (!c || c === 'KSH' || c === 'KSHS' || c === 'KES') return 'KES';
  if (c === '$') return 'USD';
  return c;
}

function splitRecipientAndPhone(rawRecipient?: string | null): {
  name: string;
  phone: string | null;
} {
  const cleaned = String(rawRecipient || '')
    .replace(/\.$/, '')
    .replace(/\s+New M-PESA.*$/i, '')
    .trim();
  if (!cleaned) {
    return { name: 'Unknown', phone: null };
  }
  const phoneMatch = cleaned.match(SMS_PATTERNS.phoneExtract);
  if (!phoneMatch) {
    return { name: cleaned, phone: null };
  }
  const phone = phoneMatch[1];
  const name = cleaned.replace(phone, '').replace(/\s+/g, ' ').trim();
  return {
    name: name || phone,
    phone,
  };
}

function parseSmsTimestamp(body: string, fallbackMs?: number): string {
  const m = body.match(SMS_PATTERNS.dateTimeExtract);
  if (m) {
    const day = parseInt(m[1], 10);
    const month = parseInt(m[2], 10);
    let year = parseInt(m[3], 10);
    if (year < 100) year += 2000;
    let hours = m[4] ? parseInt(m[4], 10) : 12;
    const mins = m[5] ? parseInt(m[5], 10) : 0;
    const ampm = m[6] ? m[6].toUpperCase() : '';
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    const parsed = new Date(year, month - 1, day, hours, mins, 0);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }
  const dMatch = body.match(SMS_PATTERNS.isoOrSlashDateExtract);
  if (dMatch) {
    const raw = dMatch[1];
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      const parsed = new Date(`${raw}T12:00:00.000Z`);
      if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
    } else {
      const parts = raw.split(/[-/]/).map(Number);
      if (parts.length === 3 && parts[2] > 0) {
        const y = parts[2] < 100 ? parts[2] + 2000 : parts[2];
        const parsed = new Date(y, parts[1] - 1, parts[0], 12, 0, 0);
        if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
      }
    }
  }
  return new Date(fallbackMs && fallbackMs > 0 ? fallbackMs : Date.now()).toISOString();
}

function fnv1aHash(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

export function computeSmsFingerprint(parts: {
  provider: string;
  direction: TransactionDirection;
  amount: number;
  currency: string;
  referenceCode?: string;
  recipient?: string;
  smsTimestamp: string;
}): string {
  const ref = String(parts.referenceCode || '').trim().toUpperCase();
  const dateBucket = String(parts.smsTimestamp || '').slice(0, 13); // YYYY-MM-DDTHH
  const normCounterparty = String(parts.recipient || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 24);
  const stableRef = ref && !ref.startsWith('AUTO-') ? ref : `${dateBucket}|${normCounterparty}`;
  const canonical = [
    parts.provider,
    parts.direction,
    parts.currency,
    parts.amount.toFixed(2),
    stableRef,
  ].join('|');
  return `smsfp_${fnv1aHash(canonical)}`;
}

/**
 * Validates sender ID to block personal phone numbers (anti-spoofing guard).
 */
export function isTrustedSender(senderId: string): boolean {
  const normalized = String(senderId || '').toUpperCase().replace(/\s+/g, '');
  if (!normalized || /^(?:\+?254|0)?[17]\d{8}$/.test(normalized)) {
    return false;
  }
  return Array.from(TRUSTED_KENYAN_SENDERS).some((trusted) =>
    normalized.includes(trusted)
  );
}

function buildResult(args: {
  provider: 'MPESA' | 'BANK' | 'PESALINK';
  direction: TransactionDirection;
  channel: TransactionChannel;
  amount: number;
  currency: string;
  transactionCost: number | null;
  referenceCode: string;
  recipient: string;
  recipientPhone: string | null;
  accountReference: string | null;
  smsTimestamp: string;
  confidence: SmsParseConfidence;
  rawMessage: string;
  senderId: string;
}): ParsedSmsTransaction | null {
  if (!Number.isFinite(args.amount) || args.amount <= 0) {
    return null;
  }
  const suggestedTrigger =
    args.direction === 'INCOMING'
      ? 'PROMPT_INCOMING'
      : args.channel === 'MPESA_BUY_GOODS' || args.channel === 'MPESA_PAYBILL' || args.channel === 'MPESA_AIRTIME' || args.channel === 'CARD_POS'
        ? 'DEFAULT_EXPENSE'
        : 'PROMPT_OUTGOING';

  const cleanRecipient = args.recipient || args.senderId.toUpperCase();
  const refCode =
    args.referenceCode ||
    `AUTO-${fnv1aHash(`${args.provider}|${args.amount}|${cleanRecipient}|${args.smsTimestamp}`).toUpperCase()}`;

  const fingerprint = computeSmsFingerprint({
    provider: args.provider,
    direction: args.direction,
    amount: args.amount,
    currency: args.currency,
    referenceCode: refCode,
    recipient: cleanRecipient,
    smsTimestamp: args.smsTimestamp,
  });

  return {
    provider: args.provider,
    direction: args.direction,
    channel: args.channel,
    amount: args.amount,
    currency: args.currency,
    transactionCost: args.transactionCost,
    referenceCode: refCode,
    recipient: cleanRecipient,
    counterpartyName: cleanRecipient,
    recipientPhone: args.recipientPhone,
    counterpartyPhone: args.recipientPhone,
    accountReference: args.accountReference,
    smsTimestamp: args.smsTimestamp,
    confidence: args.confidence,
    fingerprint,
    suggestedTrigger,
    rawMessage: args.rawMessage,
    senderId: args.senderId,
  };
}

/**
 * Main parser entry point for incoming/outgoing financial SMS notifications.
 * Returns null if the SMS is promotional, OTP, spoofed, or non-transactional.
 */
export function parseTransactionSms(
  senderId: string,
  rawBody: string,
  receivedAtMs?: number
): ParsedSmsTransaction | null {
  if (!senderId || !rawBody || !isTrustedSender(senderId)) {
    return null;
  }

  const body = rawBody.replace(/\s+/g, ' ').trim();
  if (!body || SMS_PATTERNS.ignoreNonTransaction.test(body)) {
    return null;
  }

  const smsTimestamp = parseSmsTimestamp(body, receivedAtMs);
  const feeMatch = body.match(SMS_PATTERNS.mpesaFee);
  const transactionCost = feeMatch ? parseAmount(feeMatch[1]) : null;
  const bankRefMatch = body.match(SMS_PATTERNS.bankRef);
  const bankRef = bankRefMatch ? bankRefMatch[1].toUpperCase() : '';

  // 1. M-PESA PayBill
  const paybillMatch = body.match(SMS_PATTERNS.mpesaPaybill);
  if (paybillMatch) {
    const [, ref, curr, rawAmt, businessName, accountRef] = paybillMatch;
    return buildResult({
      provider: 'MPESA',
      direction: 'OUTGOING',
      channel: 'MPESA_PAYBILL',
      amount: parseAmount(rawAmt),
      currency: normalizeCurrency(curr),
      transactionCost,
      referenceCode: ref.toUpperCase(),
      recipient: businessName.trim(),
      recipientPhone: null,
      accountReference: accountRef.trim(),
      smsTimestamp,
      confidence: 'high',
      rawMessage: rawBody,
      senderId,
    });
  }

  // 2. M-PESA Send Money (P2P Outgoing)
  const sendMoneyMatch = body.match(SMS_PATTERNS.mpesaSendMoney);
  if (sendMoneyMatch) {
    const [, ref, curr, rawAmt, rawRecipient] = sendMoneyMatch;
    const { name, phone } = splitRecipientAndPhone(rawRecipient);
    return buildResult({
      provider: 'MPESA',
      direction: 'OUTGOING',
      channel: 'MPESA_SEND_MONEY',
      amount: parseAmount(rawAmt),
      currency: normalizeCurrency(curr),
      transactionCost,
      referenceCode: ref.toUpperCase(),
      recipient: name,
      recipientPhone: phone,
      accountReference: null,
      smsTimestamp,
      confidence: 'high',
      rawMessage: rawBody,
      senderId,
    });
  }

  // 3. M-PESA Buy Goods (Till)
  const buyGoodsMatch = body.match(SMS_PATTERNS.mpesaBuyGoods);
  if (buyGoodsMatch) {
    const [, ref, curr, rawAmt, merchant] = buyGoodsMatch;
    return buildResult({
      provider: 'MPESA',
      direction: 'OUTGOING',
      channel: 'MPESA_BUY_GOODS',
      amount: parseAmount(rawAmt),
      currency: normalizeCurrency(curr),
      transactionCost,
      referenceCode: ref.toUpperCase(),
      recipient: merchant.replace(/\.$/, '').trim(),
      recipientPhone: null,
      accountReference: null,
      smsTimestamp,
      confidence: 'high',
      rawMessage: rawBody,
      senderId,
    });
  }

  // 4. M-PESA Pochi la Biashara / Business Till
  const pochiMatch = body.match(SMS_PATTERNS.mpesaPochiSent);
  if (pochiMatch) {
    const [, ref, curr, rawAmt, recipient] = pochiMatch;
    const { name, phone } = splitRecipientAndPhone(recipient);
    return buildResult({
      provider: 'MPESA',
      direction: 'OUTGOING',
      channel: 'MPESA_BUY_GOODS',
      amount: parseAmount(rawAmt),
      currency: normalizeCurrency(curr),
      transactionCost,
      referenceCode: ref.toUpperCase(),
      recipient: name,
      recipientPhone: phone,
      accountReference: null,
      smsTimestamp,
      confidence: 'high',
      rawMessage: rawBody,
      senderId,
    });
  }

  // 5. M-PESA Agent Withdrawal
  const withdrawMatch = body.match(SMS_PATTERNS.mpesaWithdraw);
  if (withdrawMatch) {
    const [, ref, curr, rawAmt, agent] = withdrawMatch;
    return buildResult({
      provider: 'MPESA',
      direction: 'OUTGOING',
      channel: 'MPESA_WITHDRAWAL',
      amount: parseAmount(rawAmt),
      currency: normalizeCurrency(curr),
      transactionCost,
      referenceCode: ref.toUpperCase(),
      recipient: agent.trim(),
      recipientPhone: null,
      accountReference: null,
      smsTimestamp,
      confidence: 'high',
      rawMessage: rawBody,
      senderId,
    });
  }

  // 6. M-PESA Airtime / Bundles
  const airtimeMatch = body.match(SMS_PATTERNS.mpesaAirtime);
  if (airtimeMatch) {
    const [, ref, curr, rawAmt, product] = airtimeMatch;
    return buildResult({
      provider: 'MPESA',
      direction: 'OUTGOING',
      channel: 'MPESA_AIRTIME',
      amount: parseAmount(rawAmt),
      currency: normalizeCurrency(curr),
      transactionCost: 0,
      referenceCode: ref.toUpperCase(),
      recipient: `Safaricom ${product}`,
      recipientPhone: null,
      accountReference: null,
      smsTimestamp,
      confidence: 'high',
      rawMessage: rawBody,
      senderId,
    });
  }

  // 7. M-PESA Incoming Money
  const receivedMatch = body.match(SMS_PATTERNS.mpesaReceived);
  if (receivedMatch) {
    const [, ref, curr, rawAmt, rawSender] = receivedMatch;
    const { name, phone } = splitRecipientAndPhone(rawSender);
    return buildResult({
      provider: 'MPESA',
      direction: 'INCOMING',
      channel: 'INCOMING_TRANSFER',
      amount: parseAmount(rawAmt),
      currency: normalizeCurrency(curr),
      transactionCost: 0,
      referenceCode: ref.toUpperCase(),
      recipient: name,
      recipientPhone: phone,
      accountReference: null,
      smsTimestamp,
      confidence: 'high',
      rawMessage: rawBody,
      senderId,
    });
  }

  // 7b. M-PESA Fuliza Credit Usage
  const fulizaMatch = body.match(SMS_PATTERNS.mpesaFuliza);
  if (fulizaMatch) {
    const [, ref, curr, rawAmt] = fulizaMatch;
    return buildResult({
      provider: 'MPESA',
      direction: 'INCOMING',
      channel: 'INCOMING_TRANSFER',
      amount: parseAmount(rawAmt),
      currency: normalizeCurrency(curr),
      transactionCost: null,
      referenceCode: ref.toUpperCase(),
      recipient: 'Fuliza M-PESA',
      recipientPhone: null,
      accountReference: null,
      smsTimestamp,
      confidence: 'high',
      rawMessage: rawBody,
      senderId,
    });
  }

  // 8. Bank & PesaLink Incoming Credit (Check BEFORE outgoing transfer if message indicates receipt)
  const bankInMatch = body.match(SMS_PATTERNS.bankIncomingTransfer);
  if (bankInMatch) {
    const curr = bankInMatch[1] || bankInMatch[5] || bankInMatch[9];
    const rawAmt = bankInMatch[2] || bankInMatch[6] || bankInMatch[10];
    const rawCounterparty = bankInMatch[3] || bankInMatch[7] || bankInMatch[11] || '';
    const isPesaLink = Boolean(bankInMatch[4] || bankInMatch[8] || bankInMatch[12]) || /pesalink/i.test(senderId + body);
    const { name, phone } = splitRecipientAndPhone(rawCounterparty || senderId.toUpperCase());

    return buildResult({
      provider: isPesaLink ? 'PESALINK' : 'BANK',
      direction: 'INCOMING',
      channel: isPesaLink ? 'PESALINK' : 'INCOMING_TRANSFER',
      amount: parseAmount(rawAmt),
      currency: normalizeCurrency(curr),
      transactionCost: null,
      referenceCode: bankRef,
      recipient: name,
      recipientPhone: phone,
      accountReference: null,
      smsTimestamp,
      confidence: rawCounterparty ? 'high' : 'medium',
      rawMessage: rawBody,
      senderId,
    });
  }

  // 9. Bank & PesaLink Outgoing Transfers
  const bankOutMatch = body.match(SMS_PATTERNS.bankOutgoingTransfer);
  if (bankOutMatch) {
    const curr = bankOutMatch[1] || bankOutMatch[5] || bankOutMatch[9];
    const rawAmt = bankOutMatch[2] || bankOutMatch[6] || bankOutMatch[10];
    const rawRecipient = bankOutMatch[3] || bankOutMatch[7] || bankOutMatch[11] || '';
    const isPesaLink = Boolean(bankOutMatch[4] || bankOutMatch[8] || bankOutMatch[12]) || /pesalink/i.test(senderId + body);
    const { name, phone } = splitRecipientAndPhone(rawRecipient);

    return buildResult({
      provider: isPesaLink ? 'PESALINK' : 'BANK',
      direction: 'OUTGOING',
      channel: isPesaLink ? 'PESALINK' : 'BANK_TRANSFER',
      amount: parseAmount(rawAmt),
      currency: normalizeCurrency(curr),
      transactionCost: null,
      referenceCode: bankRef,
      recipient: name,
      recipientPhone: phone,
      accountReference: null,
      smsTimestamp,
      confidence: 'high',
      rawMessage: rawBody,
      senderId,
    });
  }

  // 10. Bank Card / POS / ATM
  const cardPosMatch = body.match(SMS_PATTERNS.bankCardPos);
  if (cardPosMatch) {
    const [, curr, rawAmt, merchant] = cardPosMatch;
    return buildResult({
      provider: 'BANK',
      direction: 'OUTGOING',
      channel: 'CARD_POS',
      amount: parseAmount(rawAmt),
      currency: normalizeCurrency(curr),
      transactionCost: null,
      referenceCode: bankRef,
      recipient: merchant.trim(),
      recipientPhone: null,
      accountReference: null,
      smsTimestamp,
      confidence: 'high',
      rawMessage: rawBody,
      senderId,
    });
  }

  // 11. Partial / Ambiguous Fallback for trusted financial senders with amount + movement keyword
  const amtMatch = body.match(SMS_PATTERNS.currencyAmountExtract);
  const looksTransactional = /\b(debited|credited|sent|received|paid|transferred|transfer|withdraw|withdrawal|deposit|deposited|reversed|reversal|settled|settlement|confirmed|confirmation|payment|purchase|transaction)\b/i.test(body);
  if (amtMatch && looksTransactional) {
    const curr = amtMatch[1] || amtMatch[4];
    const rawAmt = amtMatch[2] || amtMatch[3];
    const hasOutCue = /\b(debited|sent\s+to|paid\s+to|purchase|withdraw)\b/i.test(body);
    const hasInCue = /\b(credited|received|deposited|reversed|refund)\b/i.test(body);
    const direction: TransactionDirection =
      hasInCue && !hasOutCue ? 'INCOMING' : hasOutCue && !hasInCue ? 'OUTGOING' : 'UNKNOWN';

    const mpesaRefMatch = body.match(SMS_PATTERNS.mpesaRef);
    return buildResult({
      provider: /mpesa|safaricom/i.test(senderId + body) ? 'MPESA' : /pesalink/i.test(senderId + body) ? 'PESALINK' : 'BANK',
      direction,
      channel: 'GENERIC_TRANSFER',
      amount: parseAmount(rawAmt),
      currency: normalizeCurrency(curr),
      transactionCost,
      referenceCode: (mpesaRefMatch?.[1] || bankRef || '').toUpperCase(),
      recipient: senderId.toUpperCase(),
      recipientPhone: null,
      accountReference: null,
      smsTimestamp,
      confidence: 'low',
      rawMessage: rawBody,
      senderId,
    });
  }

  return null;
}
