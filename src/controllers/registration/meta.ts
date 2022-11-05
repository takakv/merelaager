export const unlockTime = new Date(Date.parse("01 Jan 2022 11:59:50 UTC"));
const now = Date.now();
export const eta = unlockTime.getTime() - now;

export const registrationPrices = {
  1: 240,
  2: 320,
  3: 200,
  4: 320,
  5: 320,
};

export const registrationPriceDiff = 20;
