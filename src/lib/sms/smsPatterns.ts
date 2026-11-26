export const SMS_PATTERNS = {
  // Ignore non-transactional security/balance/promotional messages
  ignoreNonTransaction:
    /\b(OTP|one[- ]?time\s+(?:password|pin|code)|verification\s+code|do not share(?:\s+this)?(?:\s+code|\s+pin)?|your\s+pin\s+is|fuliza\s+limit\s+is\s+(?:now\s+)?(?:Kshs?|KES)|your\s+fuliza\s+M-?PESA\s+limit\s+is|balance\s+inquiry|account\s+balance\s+is\s+(?:only|currently)|dear\s+customer,?\s+enjoy|promo(?:tion)?|win\s+big|bonus)\b/i,

  // Common helper extractors (Postel's Law spacing & currency tolerance)
  mpesaRef: /^([A-Z0-9]{10})\s+Confirmed\b/i,
  mpesaFee: /Transaction cost,?\s*(?:Kshs?|KES|USD|EUR|GBP|UGX|TZS|\$)\.?\s*([\d,]+(?:\.\s*\d{1,2})?)/i,
  mpesaNewBalance: /New\s+M-?PESA\s+balance\s+is\s+(?:Kshs?|KES)\.?\s*([\d,]+(?:\.\s*\d{1,2})?)/i,
  fulizaAccessFee: /(?:Access\s*fee(?:\s+charged)?|Facilitation\s*fee)[:\s]+(?:charged\s+)?(?:Kshs?|KES)\.?\s*([\d,]+(?:\.\s*\d{1,2})?)/i,
  fulizaInterest: /(?:Total\s+)?(?:Interest|Daily\s*fee)\s*(?:charged|is)?[:\s]*(?:Kshs?|KES)\.?\s*([\d,]+(?:\.\s*\d{1,2})?)/i,
  fulizaOutstanding: /(?:Total\s+)?(?:Fuliza\s+M-?PESA\s+)?outstanding\s+balance\s+(?:is\s+)?(?:Kshs?|KES)\.?\s*([\d,]+(?:\.\s*\d{1,2})?)/i,
  fulizaLimit: /(?:Available\s+)?Fuliza\s+(?:M-?PESA\s+)?limit\s+is\s+(?:Kshs?|KES)\.?\s*([\d,]+(?:\.\s*\d{1,2})?)/i,
  phoneExtract: /((?:\+?254|0)[17]\d{8})\b/,
  dateTimeExtract: /\bon\s+(\d{1,2})\/(\d{1,2})\/(\d{2,4})(?:\s+at\s+(\d{1,2}):(\d{2})\s*(AM|PM)?)?/i,
  isoOrSlashDateExtract: /\b(\d{4}-\d{2}-\d{2}|\d{1,2}[-/]\d{1,2}[-/]\d{2,4})\b/,
  currencyAmountExtract: /(?:(Kshs?|KES|USD|EUR|GBP|UGX|TZS|\$)\.?\s*([\d,]+(?:\.\s*\d{1,2})?)|([\d,]+(?:\.\s*\d{1,2})?)\s*(Kshs?|KES|USD|EUR|GBP|UGX|TZS))/i,

  // 1. M-PESA PayBill
  mpesaPaybill:
    /^([A-Z0-9]{10})\s+Confirmed\.?\s*(Kshs?|KES|USD|EUR|GBP|UGX|TZS|\$)?\.?\s*([\d,]+(?:\.\s*\d{1,2})?)\s+sent to\s+(.+?)\s+for account\s+(.+?)\s+on\s+\d{1,2}\/\d{1,2}\/\d{2,4}/i,

  // 2. M-PESA Send Money (P2P) — safe lookahead preserves initials like "ST. JOHN" or "J. KAMAU"
  mpesaSendMoney:
    /^([A-Z0-9]{10})\s+Confirmed\.?\s*(Kshs?|KES|USD|EUR|GBP|UGX|TZS|\$)?\.?\s*([\d,]+(?:\.\s*\d{1,2})?)\s+sent to\s+(.+?)(?=\s+on\s+\d{1,2}\/\d{1,2}\/\d{2,4}|\s+New\s+M-?PESA|\.\s*$|$)/i,

  // 3. M-PESA Buy Goods (Till / Lipa na M-PESA)
  mpesaBuyGoods:
    /^([A-Z0-9]{10})\s+Confirmed\.?\s*(Kshs?|KES|USD|EUR|GBP|UGX|TZS|\$)?\.?\s*([\d,]+(?:\.\s*\d{1,2})?)\s+paid to\s+(.+?)(?=\s+on\s+\d{1,2}\/\d{1,2}\/\d{2,4}|\s+New\s+M-?PESA|\.\s*$|$)/i,

  // 4. M-PESA Pochi la Biashara / Business Till Variant
  mpesaPochiSent:
    /^([A-Z0-9]{10})\s+Confirmed\.?\s*You sent:\s*(Kshs?|KES|USD|EUR|GBP|UGX|TZS|\$)?\.?\s*([\d,]+(?:\.\s*\d{1,2})?)\.?\s*Received by:\s*(.+?)(?=\s+on\s+\d{1,2}\/\d{1,2}\/\d{2,4}|\s+New\s+M-?PESA|\.\s*$|$)/i,

  // 5. M-PESA Agent Withdrawal
  mpesaWithdraw:
    /^([A-Z0-9]{10})\s+Confirmed\.?.*?Withdraw\s+(Kshs?|KES|USD|EUR|GBP|UGX|TZS|\$)?\.?\s*([\d,]+(?:\.\s*\d{1,2})?)\s+from\s+(.+?)(?=\s+New\s+M-?PESA|\s+on\s+\d{1,2}\/\d{1,2}\/\d{2,4}|\.\s*$|$)/i,

  // 6. M-PESA Airtime / Bundles
  mpesaAirtime:
    /^([A-Z0-9]{10})\s+Confirmed\.?\s*You bought\s+(Kshs?|KES|USD|EUR|GBP|UGX|TZS|\$)?\.?\s*([\d,]+(?:\.\s*\d{1,2})?)\s+of\s+(airtime|bundles)/i,

  // 7. M-PESA Incoming Money
  mpesaReceived:
    /^([A-Z0-9]{10})\s+Confirmed\.?\s*You have received\s+(Kshs?|KES|USD|EUR|GBP|UGX|TZS|\$)?\.?\s*([\d,]+(?:\.\s*\d{1,2})?)\s+from\s+(.+?)(?=\s+on\s+\d{1,2}\/\d{1,2}\/\d{2,4}|\s+New\s+M-?PESA|\.\s*$|$)/i,

  // 7b. M-PESA Fuliza Repayment / Automatic Recovery (check BEFORE general M-PESA/Fuliza borrow)
  mpesaFulizaRepayment:
    /^([A-Z0-9]{10})\s+Confirmed\.?\s*(Kshs?|KES)?\.?\s*([\d,]+(?:\.\s*\d{1,2})?)\s+(?:from\s+your\s+M-?PESA\s+(?:account\s+)?has\s+been\s+used\s+to\s+(partially|fully)?\s*pay|has\s+been\s+deducted\s+(?:from\s+your\s+M-?PESA\s+(?:account\s+)?)?to\s+(partially|fully)?\s*pay|used\s+to\s+(partially|fully)?\s*(?:pay|settle))\s+(?:your\s+)?Fuliza\s+M-?PESA/i,

  // Inline Fuliza recovery appended inside a primary incoming M-PESA message
  mpesaFulizaInlineRecovery:
    /(Kshs?|KES)\.?\s*([\d,]+(?:\.\s*\d{1,2})?)\s+(?:from\s+your\s+M-?PESA\s+)?has\s+been\s+used\s+to\s+(partially|fully)?\s*pay\s+(?:your\s+)?Fuliza\s+M-?PESA/i,

  // 8. M-PESA Fuliza Borrowing / Overdraft Usage (NEVER incoming income!)
  mpesaFuliza:
    /^([A-Z0-9]{10})\s+Confirmed\.?\s*(?:You\s+have\s+used\s+)?Fuliza\s+M-?PESA\s+amount\s+(?:is|of)\s+(Kshs?|KES)?\.?\s*([\d,]+(?:\.\s*\d{1,2})?)/i,

  // 8b. M-PESA Reversal / Refund confirmation (safely routed for user review)
  mpesaReversal:
    /^([A-Z0-9]{10})\s+Confirmed\.?.*?\b(Kshs?|KES)\.?\s*([\d,]+(?:\.\s*\d{1,2})?)\s+(?:has\s+been\s+reversed|reversal|refunded)/i,

  // 9. Bank / PesaLink Incoming Credit
  bankIncomingTransfer:
    /(?:(?:You have\s+)?received\s+(Kshs?|KES|USD|EUR|GBP|UGX|TZS|\$)\.?\s*([\d,]+(?:\.\s*\d{1,2})?)\s+(?:from|sent by)\s+(.+?)(?:\s+via\s+(PesaLink)|\.|\s+Ref|\s+on\s+|$))|(?:(?:credited with|deposited(?:\s+with)?)\s+(Kshs?|KES|USD|EUR|GBP|UGX|TZS|\$)\.?\s*([\d,]+(?:\.\s*\d{1,2})?)(?:\s+(?:from|by)\s+(.+?))?(?:\s+via\s+(PesaLink)|\.|\s+Ref|\s+on\s+|\s+Your\s+|$))|(?:(Kshs?|KES|USD|EUR|GBP|UGX|TZS|\$)\.?\s*([\d,]+(?:\.\s*\d{1,2})?)\s+(?:has been\s+)?(?:credited to|deposited(?: into| to)?)\s+(?:your\s+)?(?:account\s*\S*)?(?:\s+from\s+(.+?))?(?:\s+via\s+(PesaLink)|\.|\s+Ref|\s+on\s+|$))/i,

  // 10. Bank Outgoing / PesaLink Transfers
  bankOutgoingTransfer:
    /(?:(Kshs?|KES|USD|EUR|GBP|UGX|TZS|\$)\.?\s*([\d,]+(?:\.\s*\d{1,2})?)\s+(?:has been\s+)?(?:debited|sent|transferred|paid)\s+(?:from\s+(?:your\s+)?(?:account|A\/C)\s*\S*\s+)?to\s+(.+?)(?:\s+via\s+(PesaLink)|\.|\s+Ref|\s+on\s+|$))|(?:(?:debited(?:\s+with)?|transfer of|sent|paid)\s+(Kshs?|KES|USD|EUR|GBP|UGX|TZS|\$)\.?\s*([\d,]+(?:\.\s*\d{1,2})?)\s+to\s+(.+?)(?:\s+via\s+(PesaLink)|\.|\s+Ref|\s+on\s+|$))|(?:Confirmed\.\s*(Kshs?|KES|USD|EUR|GBP|UGX|TZS|\$)\.?\s*([\d,]+(?:\.\s*\d{1,2})?)\s+(?:sent|transferred|paid)\s+to\s+(.+?)(?:\s+via\s+(PesaLink)|\.|\s+Ref|\s+on\s+|$))/i,

  // 11. Bank Card / POS Purchase / ATM Withdrawal
  bankCardPos:
    /(?:POS|Card|ATM)\s+(?:Purchase|Payment|Transaction|Withdrawal)\s+(?:of\s+)?(Kshs?|KES|USD|EUR|GBP|UGX|TZS|\$)\.?\s*([\d,]+(?:\.\s*\d{1,2})?)\s+(?:at|from)\s+(.+?)(?:\s+on\s+|\s+Ref|\s+Card|\.|$)/i,

  // 12. Bank Reference Code Extractor
  bankRef: /(?:Ref(?:erence)?|Txn\s*ID|Trans\s*ID|FT\s*Ref|M-?PESA\s*Ref)[:.\s#-]*([A-Z0-9]{6,22})/i,
};
