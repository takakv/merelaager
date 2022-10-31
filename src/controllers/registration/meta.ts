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

interface slotCounter {
  M: number,
  F: number,
}

interface shiftSlotCounter {
  1: slotCounter,
  2: slotCounter,
  3: slotCounter,
  4: slotCounter,
  5: slotCounter
}

export const openSlots: shiftSlotCounter = {
  1: {M: 20, F: 20},
  2: {M: 20, F: 20},
  3: {M: 24, F: 16},
  4: {M: 20, F: 20},
  5: {M: 20, F: 20},
};
