import { priceAffectingFields, priceDisplay } from "./htmlElements.js";
import { ChildPrice } from "../classes/ChildPrice.js";

const shiftPrices = {
  "1v": 200,
  "2v": 290,
  "3v": 290,
  "4v": 290,
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
    else return;
    childPrices[i].isOld = !priceAffectingFields[1][i].checked;
    const city = priceAffectingFields[2][i].value;
    childPrices[i].isFromTallinn = city.toLowerCase() === "tallinn";
  }
};

const calculatePrice = (count) => {
  getValues(count);
  let price = 0;
  childPrices.forEach((child) => {
    console.log(child);
    if (child.shiftPrice) price += child.shiftPrice;
    else return;
    if (child.isFromTallinn) price -= 20;
    else if (child.isOld) price -= 10;
  });
  return price;
};

export const updatePrice = (childCount) => {
  priceDisplay.innerText = `${calculatePrice(childCount)}`;
};
