export const unlockTime = new Date(Date.parse("01 Jan 2023 11:59:55 UTC"));
const now = Date.now();
export const eta = unlockTime.getTime() - now;

export const registrationPrices = {
  1: 340,
  2: 340,
  3: 340,
  4: 340,
};

export const registrationPriceDiff = 20;
