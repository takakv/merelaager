import { priceAffectingFields, priceDisplay } from "./htmlElements.js";
import { ChildPrice } from "../classes/ChildPrice.js";

const shiftPrices = {
  1: 240,
  2: 320,
  3: 200,
  4: 320,
  5: 320,
};

const childPrices = [
  new ChildPrice(),
  new ChildPrice(),
  new ChildPrice(),
  new ChildPrice(),
];

const getValues = (count) => {
  for (let i = 0; i < count; ++i) {
    const shiftValue = priceAffectingFields[0][i].value;

    if (shiftValue) childPrices[i].shiftPrice = shiftPrices[shiftValue];
    else childPrices[i].shiftPrice = null;

    childPrices[i].isOld = !priceAffectingFields[1][i].checked;
  }
};

const calculatePrice = (count) => {
  getValues(count);
  let price = 0;
  childPrices.forEach((child) => {
    if (child.shiftPrice) price += child.shiftPrice;
    else return;
    if (child.isOld) price -= 20;
  });
  return price;
};

export const updatePrice = (childCount) => {
  priceDisplay.innerText = `${calculatePrice(childCount)}`;
};
