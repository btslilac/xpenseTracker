import {
  ClassificationCategory,
  FulizaDetails,
  ParsedSmsTransaction,
  SmsParseConfidence,
  SmsParseOutcome,
  SuggestedTrigger,
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

function parseOptionalAmount(match: RegExpMatchArray | null): number | null {
  if (!match || !match[1]) return null;
  const val = parseAmount(match[1]);
  return Number.isFinite(val) ? val : null;
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
    .replace(/\s+New M-?PESA.*$/i, '')
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
  channel?: TransactionChannel;
  classificationCategory?: ClassificationCategory;
  amount: number;
  currency: string;
  referenceCode?: string;
  recipient?: string;
  smsTimestamp: string;
}): string {
  const ref = String(parts.referenceCode || '').trim().toUpperCase();
  const dateBucket = String(parts.smsTimestamp || '').slice(0, 13);
  const normCounterparty = String(parts.recipient || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 24);
  const stableRef = ref && !ref.startsWith('AUTO-') ? ref : `${dateBucket}|${normCounterparty}`;
  const canonical = [
    parts.provider,
    parts.classificationCategory || parts.direction,
    parts.channel || '',
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

function extractFulizaMetaFromBody(body: string): {
  fulizaAccessFee: number | null;
  fulizaInterest: number | null;
  outstandingFulizaBalance: number | null;
  availableFulizaLimit: number | null;
} {
  return {
    fulizaAccessFee: parseOptionalAmount(body.match(SMS_PATTERNS.fulizaAccessFee)),
    fulizaInterest: parseOptionalAmount(body.match(SMS_PATTERNS.fulizaInterest)),
    outstandingFulizaBalance: parseOptionalAmount(body.match(SMS_PATTERNS.fulizaOutstanding)),
    availableFulizaLimit: parseOptionalAmount(body.match(SMS_PATTERNS.fulizaLimit)),
  };
}

function buildResult(args: {
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
  recipientPhone: string | null;
  accountReference: string | null;
  smsTimestamp: string;
  confidence: SmsParseConfidence;
  rawMessage: string;
  senderId: string;
  fulizaDetails?: FulizaDetails | null;
  suggestedTriggerOverride?: SuggestedTrigger;
}): ParsedSmsTransaction | null {
  if (!Number.isFinite(args.amount) || args.amount <= 0) {
    return null;
  }

  let suggestedTrigger: SuggestedTrigger =
    args.suggestedTriggerOverride ||
    (args.classificationCategory === 'FULIZA_BORROWING' || args.classificationCategory === 'FULIZA_REPAYMENT'
      ? 'PROMPT_FULIZA_REVIEW'
      : args.direction === 'INCOMING'
        ? 'PROMPT_INCOMING'
        : args.channel === 'MPESA_BUY_GOODS' ||
          args.channel === 'MPESA_POCHI' ||
          args.channel === 'MPESA_PAYBILL' ||
          args.channel === 'MPESA_AIRTIME' ||
          args.channel === 'CARD_POS'
          ? 'DEFAULT_EXPENSE'
          : 'PROMPT_OUTGOING');

  const cleanRecipient = args.recipient || args.senderId.toUpperCase();
  const refCode =
    args.referenceCode ||
    `AUTO-${fnv1aHash(`${args.provider}|${args.amount}|${cleanRecipient}|${args.smsTimestamp}`).toUpperCase()}`;

  const fingerprint = computeSmsFingerprint({
    provider: args.provider,
    direction: args.direction,
    channel: args.channel,
    classificationCategory: args.classificationCategory,
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
    classificationCategory: args.classificationCategory,
    amount: args.amount,
    currency: args.currency,
    transactionCost: args.transactionCost,
    walletBalanceAfter: args.walletBalanceAfter ?? null,
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
    senderId: args.senderId,
    fulizaDetails: args.fulizaDetails ?? null,
    correlatedFingerprints: [fingerprint],
  };
}

/**
 * Rich parser outcome with explicit taxonomy classification.
 */
export function parseTransactionSmsOutcome(
  senderId: string,
  rawBody: string,
  receivedAtMs?: number
): SmsParseOutcome {
  if (!senderId || !rawBody || !isTrustedSender(senderId)) {
    return { status: 'unsupported', reason: 'Sender is missing or not in trusted Kenyan financial sender list.' };
  }

  const body = rawBody.replace(/\s+/g, ' ').trim();
  if (!body || SMS_PATTERNS.ignoreNonTransaction.test(body)) {
    return { status: 'unsupported', reason: 'Non-transactional notification (OTP, promo, balance or limit notice).' };
  }

  const smsTimestamp = parseSmsTimestamp(body, receivedAtMs);
  const feeMatch = body.match(SMS_PATTERNS.mpesaFee);
  const transactionCost = feeMatch ? parseAmount(feeMatch[1]) : null;
  const newBalMatch = body.match(SMS_PATTERNS.mpesaNewBalance);
  const walletBalanceAfter = newBalMatch ? parseAmount(newBalMatch[1]) : null;
  const bankRefMatch = body.match(SMS_PATTERNS.bankRef);
  const bankRef = bankRefMatch ? bankRefMatch[1].toUpperCase() : '';

  // 0a. M-PESA Fuliza Repayment / Automatic Recovery (MUST run before generic M-PESA & Fuliza Borrow)
  const fulizaRepayMatch = body.match(SMS_PATTERNS.mpesaFulizaRepayment);
  if (fulizaRepayMatch) {
    const ref = fulizaRepayMatch[1];
    const curr = fulizaRepayMatch[2];
    const rawAmt = fulizaRepayMatch[3];
    const qualifier = String(fulizaRepayMatch[4] || fulizaRepayMatch[5] || fulizaRepayMatch[6] || '').toLowerCase();
    const meta = extractFulizaMetaFromBody(body);
    const isPartial =
      qualifier === 'partially' ||
      (meta.outstandingFulizaBalance !== null && meta.outstandingFulizaBalance > 0.009);
    const amount = parseAmount(rawAmt);
    const tx = buildResult({
      provider: 'MPESA',
      direction: 'UNKNOWN',
      channel: 'MPESA_FULIZA_REPAYMENT',
      classificationCategory: 'FULIZA_REPAYMENT',
      amount,
      currency: normalizeCurrency(curr),
      transactionCost,
      walletBalanceAfter,
      referenceCode: ref.toUpperCase(),
      recipient: isPartial ? 'Fuliza M-PESA (Partial Recovery)' : 'Fuliza M-PESA (Repayment)',
      recipientPhone: null,
      accountReference: null,
      smsTimestamp,
      confidence: 'high',
      rawMessage: rawBody,
      senderId,
      fulizaDetails: {
        isFulizaInvolved: true,
        fulizaAmount: amount,
        walletPortion: null,
        fulizaAccessFee: meta.fulizaAccessFee,
        fulizaInterest: meta.fulizaInterest,
        outstandingFulizaBalance: meta.outstandingFulizaBalance,
        availableFulizaLimit: meta.availableFulizaLimit,
        isPartialRecovery: isPartial,
      },
    });
    return tx
      ? { status: 'classified', transaction: tx }
      : { status: 'unsupported', reason: 'Zero or invalid Fuliza repayment amount.' };
  }

  // 0b. M-PESA Fuliza Overdraft / Borrowing Usage (NEVER incoming income!)
  const fulizaMatch = body.match(SMS_PATTERNS.mpesaFuliza);
  if (fulizaMatch) {
    const [, ref, curr, rawAmt] = fulizaMatch;
    const meta = extractFulizaMetaFromBody(body);
    const amount = parseAmount(rawAmt);
    const tx = buildResult({
      provider: 'MPESA',
      direction: 'OUTGOING',
      channel: 'MPESA_FULIZA_USAGE',
      classificationCategory: 'FULIZA_BORROWING',
      amount,
      currency: normalizeCurrency(curr),
      transactionCost: meta.fulizaAccessFee,
      walletBalanceAfter,
      referenceCode: ref.toUpperCase(),
      recipient: 'Fuliza M-PESA Credit',
      recipientPhone: null,
      accountReference: null,
      smsTimestamp,
      confidence: 'high',
      rawMessage: rawBody,
      senderId,
      fulizaDetails: {
        isFulizaInvolved: true,
        fulizaAmount: amount,
        walletPortion: null,
        fulizaAccessFee: meta.fulizaAccessFee,
        fulizaInterest: meta.fulizaInterest,
        outstandingFulizaBalance: meta.outstandingFulizaBalance,
        availableFulizaLimit: meta.availableFulizaLimit,
      },
    });
    return tx
      ? { status: 'classified', transaction: tx }
      : { status: 'unsupported', reason: 'Zero or invalid Fuliza borrowing amount.' };
  }

  // 0c. M-PESA Reversal / Refund -> safe review queue
  const reversalMatch = body.match(SMS_PATTERNS.mpesaReversal);
  if (reversalMatch) {
    const [, ref, curr, rawAmt] = reversalMatch;
    const tx = buildResult({
      provider: 'MPESA',
      direction: 'UNKNOWN',
      channel: 'GENERIC_TRANSFER',
      classificationCategory: 'NEEDS_USER_REVIEW',
      amount: parseAmount(rawAmt),
      currency: normalizeCurrency(curr),
      transactionCost,
      walletBalanceAfter,
      referenceCode: ref.toUpperCase(),
      recipient: 'M-PESA Reversal / Refund',
      recipientPhone: null,
      accountReference: null,
      smsTimestamp,
      confidence: 'medium',
      rawMessage: rawBody,
      senderId,
      suggestedTriggerOverride: 'PROMPT_FULIZA_REVIEW',
    });
    return tx
      ? { status: 'needs_review', reason: 'Reversal/refund requires confirmation.', transaction: tx }
      : { status: 'unsupported', reason: 'Invalid reversal amount.' };
  }

  // 1. M-PESA PayBill
  const paybillMatch = body.match(SMS_PATTERNS.mpesaPaybill);
  if (paybillMatch) {
    const [, ref, curr, rawAmt, businessName, accountRef] = paybillMatch;
    const tx = buildResult({
      provider: 'MPESA',
      direction: 'OUTGOING',
      channel: 'MPESA_PAYBILL',
      classificationCategory: 'CONFIRMED_EXPENSE',
      amount: parseAmount(rawAmt),
      currency: normalizeCurrency(curr),
      transactionCost,
      walletBalanceAfter,
      referenceCode: ref.toUpperCase(),
      recipient: businessName.trim(),
      recipientPhone: null,
      accountReference: accountRef.trim(),
      smsTimestamp,
      confidence: 'high',
      rawMessage: rawBody,
      senderId,
    });
    return tx ? { status: 'classified', transaction: tx } : { status: 'unsupported', reason: 'Invalid Paybill amount.' };
  }

  // 2. M-PESA Send Money (P2P Outgoing)
  const sendMoneyMatch = body.match(SMS_PATTERNS.mpesaSendMoney);
  if (sendMoneyMatch) {
    const [, ref, curr, rawAmt, rawRecipient] = sendMoneyMatch;
    const { name, phone } = splitRecipientAndPhone(rawRecipient);
    const tx = buildResult({
      provider: 'MPESA',
      direction: 'OUTGOING',
      channel: 'MPESA_SEND_MONEY',
      classificationCategory: 'CONFIRMED_EXPENSE',
      amount: parseAmount(rawAmt),
      currency: normalizeCurrency(curr),
      transactionCost,
      walletBalanceAfter,
      referenceCode: ref.toUpperCase(),
      recipient: name,
      recipientPhone: phone,
      accountReference: null,
      smsTimestamp,
      confidence: 'high',
      rawMessage: rawBody,
      senderId,
    });
    return tx ? { status: 'classified', transaction: tx } : { status: 'unsupported', reason: 'Invalid Send Money amount.' };
  }

  // 3. M-PESA Buy Goods (Till)
  const buyGoodsMatch = body.match(SMS_PATTERNS.mpesaBuyGoods);
  if (buyGoodsMatch) {
    const [, ref, curr, rawAmt, merchant] = buyGoodsMatch;
    const tx = buildResult({
      provider: 'MPESA',
      direction: 'OUTGOING',
      channel: 'MPESA_BUY_GOODS',
      classificationCategory: 'CONFIRMED_EXPENSE',
      amount: parseAmount(rawAmt),
      currency: normalizeCurrency(curr),
      transactionCost,
      walletBalanceAfter,
      referenceCode: ref.toUpperCase(),
      recipient: merchant.replace(/\.$/, '').trim(),
      recipientPhone: null,
      accountReference: null,
      smsTimestamp,
      confidence: 'high',
      rawMessage: rawBody,
      senderId,
    });
    return tx ? { status: 'classified', transaction: tx } : { status: 'unsupported', reason: 'Invalid Buy Goods amount.' };
  }

  // 4. M-PESA Pochi la Biashara
  const pochiMatch = body.match(SMS_PATTERNS.mpesaPochiSent);
  if (pochiMatch) {
    const [, ref, curr, rawAmt, recipient] = pochiMatch;
    const { name, phone } = splitRecipientAndPhone(recipient);
    const tx = buildResult({
      provider: 'MPESA',
      direction: 'OUTGOING',
      channel: 'MPESA_POCHI',
      classificationCategory: 'CONFIRMED_EXPENSE',
      amount: parseAmount(rawAmt),
      currency: normalizeCurrency(curr),
      transactionCost,
      walletBalanceAfter,
      referenceCode: ref.toUpperCase(),
      recipient: name,
      recipientPhone: phone,
      accountReference: null,
      smsTimestamp,
      confidence: 'high',
      rawMessage: rawBody,
      senderId,
    });
    return tx ? { status: 'classified', transaction: tx } : { status: 'unsupported', reason: 'Invalid Pochi amount.' };
  }

  // 5. M-PESA Agent Withdrawal
  const withdrawMatch = body.match(SMS_PATTERNS.mpesaWithdraw);
  if (withdrawMatch) {
    const [, ref, curr, rawAmt, agent] = withdrawMatch;
    const tx = buildResult({
      provider: 'MPESA',
      direction: 'OUTGOING',
      channel: 'MPESA_WITHDRAWAL',
      classificationCategory: 'CONFIRMED_EXPENSE',
      amount: parseAmount(rawAmt),
      currency: normalizeCurrency(curr),
      transactionCost,
      walletBalanceAfter,
      referenceCode: ref.toUpperCase(),
      recipient: agent.trim(),
      recipientPhone: null,
      accountReference: null,
      smsTimestamp,
      confidence: 'high',
      rawMessage: rawBody,
      senderId,
    });
    return tx ? { status: 'classified', transaction: tx } : { status: 'unsupported', reason: 'Invalid Withdrawal amount.' };
  }

  // 6. M-PESA Airtime / Bundles
  const airtimeMatch = body.match(SMS_PATTERNS.mpesaAirtime);
  if (airtimeMatch) {
    const [, ref, curr, rawAmt, product] = airtimeMatch;
    const tx = buildResult({
      provider: 'MPESA',
      direction: 'OUTGOING',
      channel: 'MPESA_AIRTIME',
      classificationCategory: 'CONFIRMED_EXPENSE',
      amount: parseAmount(rawAmt),
      currency: normalizeCurrency(curr),
      transactionCost: 0,
      walletBalanceAfter,
      referenceCode: ref.toUpperCase(),
      recipient: `Safaricom ${product}`,
      recipientPhone: null,
      accountReference: null,
      smsTimestamp,
      confidence: 'high',
      rawMessage: rawBody,
      senderId,
    });
    return tx ? { status: 'classified', transaction: tx } : { status: 'unsupported', reason: 'Invalid Airtime amount.' };
  }

  // 7. M-PESA Incoming Money (plus inline Fuliza recovery check for Scenario C)
  const receivedMatch = body.match(SMS_PATTERNS.mpesaReceived);
  if (receivedMatch) {
    const [, ref, curr, rawAmt, rawSender] = receivedMatch;
    const { name, phone } = splitRecipientAndPhone(rawSender);
    const grossAmount = parseAmount(rawAmt);
    const inlineRecovery = body.match(SMS_PATTERNS.mpesaFulizaInlineRecovery);
    let fulizaDetails: FulizaDetails | null = null;
    if (inlineRecovery) {
      const recoveredAmt = parseAmount(inlineRecovery[2]);
      const meta = extractFulizaMetaFromBody(body);
      const isPartial =
        String(inlineRecovery[3] || '').toLowerCase() === 'partially' ||
        (meta.outstandingFulizaBalance !== null && meta.outstandingFulizaBalance > 0.009);
      fulizaDetails = {
        isFulizaInvolved: true,
        fulizaAmount: recoveredAmt,
        walletPortion: null,
        fulizaAccessFee: meta.fulizaAccessFee,
        fulizaInterest: meta.fulizaInterest,
        outstandingFulizaBalance: meta.outstandingFulizaBalance,
        availableFulizaLimit: meta.availableFulizaLimit,
        isPartialRecovery: isPartial,
        grossInflowAmount: grossAmount,
        netWalletImpact: Math.max(0, grossAmount - recoveredAmt),
      };
    }

    const tx = buildResult({
      provider: 'MPESA',
      direction: 'INCOMING',
      channel: 'INCOMING_TRANSFER',
      classificationCategory: 'CONFIRMED_INCOME',
      amount: grossAmount,
      currency: normalizeCurrency(curr),
      transactionCost: 0,
      walletBalanceAfter,
      referenceCode: ref.toUpperCase(),
      recipient: name,
      recipientPhone: phone,
      accountReference: null,
      smsTimestamp,
      confidence: 'high',
      rawMessage: rawBody,
      senderId,
      fulizaDetails,
    });
    return tx ? { status: 'classified', transaction: tx } : { status: 'unsupported', reason: 'Invalid Received amount.' };
  }

  // 8. Bank & PesaLink Incoming Credit
  const bankInMatch = body.match(SMS_PATTERNS.bankIncomingTransfer);
  if (bankInMatch) {
    const curr = bankInMatch[1] || bankInMatch[5] || bankInMatch[9];
    const rawAmt = bankInMatch[2] || bankInMatch[6] || bankInMatch[10];
    const rawCounterparty = bankInMatch[3] || bankInMatch[7] || bankInMatch[11] || '';
    const isPesaLink = Boolean(bankInMatch[4] || bankInMatch[8] || bankInMatch[12]) || /pesalink/i.test(senderId + body);
    const { name, phone } = splitRecipientAndPhone(rawCounterparty || senderId.toUpperCase());

    const tx = buildResult({
      provider: isPesaLink ? 'PESALINK' : 'BANK',
      direction: 'INCOMING',
      channel: isPesaLink ? 'PESALINK' : 'INCOMING_TRANSFER',
      classificationCategory: 'CONFIRMED_INCOME',
      amount: parseAmount(rawAmt),
      currency: normalizeCurrency(curr),
      transactionCost: null,
      walletBalanceAfter,
      referenceCode: bankRef,
      recipient: name,
      recipientPhone: phone,
      accountReference: null,
      smsTimestamp,
      confidence: rawCounterparty ? 'high' : 'medium',
      rawMessage: rawBody,
      senderId,
    });
    return tx ? { status: 'classified', transaction: tx } : { status: 'unsupported', reason: 'Invalid bank incoming amount.' };
  }

  // 9. Bank & PesaLink Outgoing Transfers
  const bankOutMatch = body.match(SMS_PATTERNS.bankOutgoingTransfer);
  if (bankOutMatch) {
    const curr = bankOutMatch[1] || bankOutMatch[5] || bankOutMatch[9];
    const rawAmt = bankOutMatch[2] || bankOutMatch[6] || bankOutMatch[10];
    const rawRecipient = bankOutMatch[3] || bankOutMatch[7] || bankOutMatch[11] || '';
    const isPesaLink = Boolean(bankOutMatch[4] || bankOutMatch[8] || bankOutMatch[12]) || /pesalink/i.test(senderId + body);
    const { name, phone } = splitRecipientAndPhone(rawRecipient);

    const tx = buildResult({
      provider: isPesaLink ? 'PESALINK' : 'BANK',
      direction: 'OUTGOING',
      channel: isPesaLink ? 'PESALINK' : 'BANK_TRANSFER',
      classificationCategory: 'CONFIRMED_EXPENSE',
      amount: parseAmount(rawAmt),
      currency: normalizeCurrency(curr),
      transactionCost: null,
      walletBalanceAfter,
      referenceCode: bankRef,
      recipient: name,
      recipientPhone: phone,
      accountReference: null,
      smsTimestamp,
      confidence: 'high',
      rawMessage: rawBody,
      senderId,
    });
    return tx ? { status: 'classified', transaction: tx } : { status: 'unsupported', reason: 'Invalid bank outgoing amount.' };
  }

  // 10. Bank Card / POS / ATM
  const cardPosMatch = body.match(SMS_PATTERNS.bankCardPos);
  if (cardPosMatch) {
    const [, curr, rawAmt, merchant] = cardPosMatch;
    const tx = buildResult({
      provider: 'BANK',
      direction: 'OUTGOING',
      channel: 'CARD_POS',
      classificationCategory: 'CONFIRMED_EXPENSE',
      amount: parseAmount(rawAmt),
      currency: normalizeCurrency(curr),
      transactionCost: null,
      walletBalanceAfter,
      referenceCode: bankRef,
      recipient: merchant.trim(),
      recipientPhone: null,
      accountReference: null,
      smsTimestamp,
      confidence: 'high',
      rawMessage: rawBody,
      senderId,
    });
    return tx ? { status: 'classified', transaction: tx } : { status: 'unsupported', reason: 'Invalid Card/POS amount.' };
  }

  // 11. Fallback Heuristic for partially formatted trusted financial SMS (user confirmation required)
  const genericAmountMatch = body.match(SMS_PATTERNS.currencyAmountExtract);
  if (genericAmountMatch) {
    const curr = genericAmountMatch[1] || genericAmountMatch[4];
    const rawAmt = genericAmountMatch[2] || genericAmountMatch[3];
    const amount = parseAmount(rawAmt);
    const isIn = /\b(received|credited|deposited)\b/i.test(body);
    const isOut = /\b(sent|paid|debited|withdrawn|bought|transfer(?:red)?|purchase)\b/i.test(body);
    const direction: TransactionDirection = isIn && !isOut ? 'INCOMING' : isOut && !isIn ? 'OUTGOING' : 'UNKNOWN';
    const isPesaLink = /pesalink/i.test(senderId + body);
    const isMpesa = /m-?pesa|safaricom|fuliza/i.test(senderId + body);

    if (amount > 0 && (isIn || isOut || /\b(confirmed|transaction|mpesa|m-pesa)\b/i.test(body))) {
      const tx = buildResult({
        provider: isMpesa ? 'MPESA' : isPesaLink ? 'PESALINK' : 'BANK',
        direction,
        channel: isPesaLink ? 'PESALINK' : 'GENERIC_TRANSFER',
        classificationCategory: 'NEEDS_USER_REVIEW',
        amount,
        currency: normalizeCurrency(curr),
        transactionCost,
        walletBalanceAfter,
        referenceCode: (body.match(SMS_PATTERNS.mpesaRef)?.[1] || bankRef || '').toUpperCase(),
        recipient: senderId.toUpperCase(),
        recipientPhone: null,
        accountReference: null,
        smsTimestamp,
        confidence: 'low',
        rawMessage: rawBody,
        senderId,
        suggestedTriggerOverride: 'PROMPT_OUTGOING',
      });
      if (tx) {
        return {
          status: 'needs_review',
          reason: 'Partially matched financial SMS — confirm transaction details.',
          transaction: tx,
        };
      }
    }
  }

  return { status: 'unsupported', reason: 'Message does not match any supported financial transaction format.' };
}

export function parseTransactionSms(
  senderId: string,
  rawBody: string,
  receivedAtMs?: number
): ParsedSmsTransaction | null {
  const outcome = parseTransactionSmsOutcome(senderId, rawBody, receivedAtMs);
  if (outcome.status === 'unsupported') return null;
  return outcome.transaction || null;
}

const CORRELATION_WINDOW_MS = 5 * 60 * 1000;

function isOutgoingPrimaryExpense(tx: ParsedSmsTransaction): boolean {
  return (
    tx.provider === 'MPESA' &&
    tx.direction === 'OUTGOING' &&
    tx.classificationCategory === 'CONFIRMED_EXPENSE'
  );
}

function isIncomingPrimary(tx: ParsedSmsTransaction): boolean {
  return (
    tx.provider === 'MPESA' &&
    tx.direction === 'INCOMING' &&
    tx.classificationCategory === 'CONFIRMED_INCOME'
  );
}

/**
 * Merges a primary outgoing expense SMS with a Fuliza borrowing SMS (Scenario A).
 */
export function mergeOutgoingExpenseWithFulizaBorrow(
  primary: ParsedSmsTransaction,
  fulizaBorrow: ParsedSmsTransaction
): ParsedSmsTransaction {
  const fulizaAmt = fulizaBorrow.fulizaDetails?.fulizaAmount ?? fulizaBorrow.amount;
  const walletPortion =
    primary.amount >= fulizaAmt ? Number((primary.amount - fulizaAmt).toFixed(2)) : null;

  const mergedFingerprints = Array.from(
    new Set([
      ...(primary.correlatedFingerprints || [primary.fingerprint]),
      ...(fulizaBorrow.correlatedFingerprints || [fulizaBorrow.fingerprint]),
    ])
  );

  return {
    ...primary,
    confidence: primary.isAmbiguousMatch ? 'medium' : 'high',
    fulizaDetails: {
      isFulizaInvolved: true,
      fulizaAmount: fulizaAmt,
      walletPortion,
      fulizaAccessFee: fulizaBorrow.fulizaDetails?.fulizaAccessFee ?? null,
      fulizaInterest: fulizaBorrow.fulizaDetails?.fulizaInterest ?? null,
      outstandingFulizaBalance: fulizaBorrow.fulizaDetails?.outstandingFulizaBalance ?? null,
      availableFulizaLimit: fulizaBorrow.fulizaDetails?.availableFulizaLimit ?? null,
      correlatedPrimaryRef: primary.referenceCode,
      correlatedSecondaryRef: fulizaBorrow.referenceCode,
    },
    correlatedFingerprints: mergedFingerprints,
  };
}

/**
 * Merges an incoming M-PESA transfer with an automatic Fuliza recovery SMS (Scenario B / C)
 * so Fuliza recovery is annotated alongside gross inflow without double-counting.
 */
export function mergeIncomingWithFulizaRepayment(
  incoming: ParsedSmsTransaction,
  repayment: ParsedSmsTransaction
): ParsedSmsTransaction {
  const recoveredAmt = repayment.fulizaDetails?.fulizaAmount ?? repayment.amount;
  const netWalletImpact = Number(Math.max(0, incoming.amount - recoveredAmt).toFixed(2));
  const mergedFingerprints = Array.from(
    new Set([
      ...(incoming.correlatedFingerprints || [incoming.fingerprint]),
      ...(repayment.correlatedFingerprints || [repayment.fingerprint]),
    ])
  );

  return {
    ...incoming,
    fulizaDetails: {
      isFulizaInvolved: true,
      fulizaAmount: recoveredAmt,
      walletPortion: incoming.fulizaDetails?.walletPortion ?? null,
      fulizaAccessFee: repayment.fulizaDetails?.fulizaAccessFee ?? incoming.fulizaDetails?.fulizaAccessFee ?? null,
      fulizaInterest: repayment.fulizaDetails?.fulizaInterest ?? incoming.fulizaDetails?.fulizaInterest ?? null,
      outstandingFulizaBalance:
        repayment.fulizaDetails?.outstandingFulizaBalance ?? incoming.fulizaDetails?.outstandingFulizaBalance ?? null,
      availableFulizaLimit:
        repayment.fulizaDetails?.availableFulizaLimit ?? incoming.fulizaDetails?.availableFulizaLimit ?? null,
      isPartialRecovery: repayment.fulizaDetails?.isPartialRecovery,
      grossInflowAmount: incoming.amount,
      netWalletImpact,
      correlatedPrimaryRef: incoming.referenceCode,
      correlatedSecondaryRef: repayment.referenceCode,
    },
    correlatedFingerprints: mergedFingerprints,
  };
}

/**
 * Deterministic multi-message correlation engine (Scenarios A, B, C, D).
 * Safely avoids guessing when multiple plausible candidates overlap ambiguously.
 */
export function correlateParsedSmsTransactions(
  items: ParsedSmsTransaction[]
): ParsedSmsTransaction[] {
  if (items.length <= 1) return [...items];

  const sorted = [...items].sort(
    (a, b) => new Date(a.smsTimestamp).getTime() - new Date(b.smsTimestamp).getTime()
  );
  const consumed = new Set<number>();
  const pairedIndices = new Set<number>();
  const output: ParsedSmsTransaction[] = [];

  for (let i = 0; i < sorted.length; i++) {
    if (consumed.has(i)) continue;
    let current = sorted[i];

    // Check if an outgoing expense has a paired FULIZA_BORROWING message
    if (isOutgoingPrimaryExpense(current) && !current.fulizaDetails?.isFulizaInvolved) {
      const curTs = new Date(current.smsTimestamp).getTime();
      const candidates: number[] = [];
      for (let j = 0; j < sorted.length; j++) {
        if (i === j || consumed.has(j) || pairedIndices.has(j)) continue;
        const sec = sorted[j];
        if (sec.classificationCategory !== 'FULIZA_BORROWING') continue;
        const secTs = new Date(sec.smsTimestamp).getTime();
        if (Math.abs(secTs - curTs) > CORRELATION_WINDOW_MS) continue;
        if (sec.referenceCode === current.referenceCode) {
          candidates.length = 0;
          candidates.push(j);
          break;
        }
        if (sec.amount <= current.amount) {
          candidates.push(j);
        }
      }

      if (candidates.length === 1) {
        const idx = candidates[0];
        // Check reverse ambiguity against ALL unpaired outgoing expenses in sorted (not just un-emitted ones)
        const secTs = new Date(sorted[idx].smsTimestamp).getTime();
        const competingPrimaries = sorted.filter(
          (other, oIdx) =>
            oIdx !== i &&
            !pairedIndices.has(oIdx) &&
            isOutgoingPrimaryExpense(other) &&
            !other.fulizaDetails?.isFulizaInvolved &&
            other.amount >= sorted[idx].amount &&
            Math.abs(new Date(other.smsTimestamp).getTime() - secTs) <= 60_000
        );
        if (competingPrimaries.length === 0 || sorted[idx].referenceCode === current.referenceCode) {
          consumed.add(idx);
          pairedIndices.add(i);
          pairedIndices.add(idx);
          current = mergeOutgoingExpenseWithFulizaBorrow(current, sorted[idx]);
        }
      }
    }

    // Check if an incoming receipt has a paired FULIZA_REPAYMENT recovery message
    if (isIncomingPrimary(current) && !current.fulizaDetails?.isFulizaInvolved) {
      const curTs = new Date(current.smsTimestamp).getTime();
      const candidates: number[] = [];
      for (let j = 0; j < sorted.length; j++) {
        if (i === j || consumed.has(j) || pairedIndices.has(j)) continue;
        const sec = sorted[j];
        if (sec.classificationCategory !== 'FULIZA_REPAYMENT') continue;
        const secTs = new Date(sec.smsTimestamp).getTime();
        if (Math.abs(secTs - curTs) > CORRELATION_WINDOW_MS) continue;
        if (sec.referenceCode === current.referenceCode) {
          candidates.length = 0;
          candidates.push(j);
          break;
        }
        if (sec.amount <= current.amount && secTs >= curTs - 10_000) {
          candidates.push(j);
        }
      }

      if (candidates.length === 1) {
        const idx = candidates[0];
        const secTs = new Date(sorted[idx].smsTimestamp).getTime();
        const competingInflows = sorted.filter(
          (other, oIdx) =>
            oIdx !== i &&
            !pairedIndices.has(oIdx) &&
            isIncomingPrimary(other) &&
            !other.fulizaDetails?.isFulizaInvolved &&
            other.amount >= sorted[idx].amount &&
            Math.abs(new Date(other.smsTimestamp).getTime() - secTs) <= 60_000
        );
        if (competingInflows.length === 0 || sorted[idx].referenceCode === current.referenceCode) {
          consumed.add(idx);
          pairedIndices.add(i);
          pairedIndices.add(idx);
          current = mergeIncomingWithFulizaRepayment(current, sorted[idx]);
        }
      }
    }

    consumed.add(i);
    output.push(current);
  }

  return output;
}
