export const truncateAddress = (address: string, chars = 5): string => {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};

export const truncateChars = (fullStr: string, strLen: number, separator = "..."): string => {
  if (fullStr.length <= strLen) return fullStr;
  const sepLen = separator.length;
  const charsToShow = strLen - sepLen;
  const frontChars = Math.ceil(charsToShow / 2);
  const backChars = Math.floor(charsToShow / 2);
  return (
    fullStr.substring(0, frontChars) + separator + fullStr.substring(fullStr.length - backChars)
  );
};

export const formatNumber = (num: number | string, places = 2): string =>
  parseFloat(String(num)).toLocaleString(undefined, {
    minimumFractionDigits: places,
    maximumFractionDigits: places,
  });

export const formatToken = (value: number | string, symbol: string, decimals = 2): string => {
  const num = Number(value);
  if (!isFinite(num)) return "—";
  return `${num.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })} ${symbol}`;
};

export const formatPercent = (value: number | string, decimals = 2): string => {
  const num = Number(value);
  if (!isFinite(num)) return "—";
  return `${num.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}%`;
};

export const formatUsd = (value: number | string, decimals = 2): string => {
  const num = Number(value);
  if (!isFinite(num)) return "—";
  return formatToken(num, "$", decimals);
};
