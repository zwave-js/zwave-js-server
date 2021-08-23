export const normalizeKey = (
  key: string,
  keyName: string,
  supportOZWFormat: boolean = false
): Buffer => {
  if (key.length === 32) return Buffer.from(key, "hex");
  if (supportOZWFormat && key.includes("0x"))
    return Buffer.from(key.replace(/0x/g, "").replace(/, /g, ""), "hex");
  throw new Error(`Invalid key format for ${keyName} option`);
};
