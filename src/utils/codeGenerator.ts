const STATE_PREFIXES: Record<string, string> = {
  FCT: 'FCT',
  NIGER: 'NIG',
  KADUNA: 'KAD',
};

export const generateUniqueCode = (state: string): string => {
  const prefix = STATE_PREFIXES[state] ?? 'REG';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${suffix}`;
};
