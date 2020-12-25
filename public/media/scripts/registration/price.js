import { priceDisplay } from "./htmlElements.js";

const calculatePrice = (children, count) => {
  let price = 0;
  for (let i = 0; i < count; ++i) {
    const child = children[i];
    price += child.shiftPrice;
    if (child.isFromTallinn) price -= 20;
    else if (child.isOld) price -= 10;
    console.log(child);
  }
  return price;
};

export const displayPrice = (data, count) => {
  const price = calculatePrice(data, count);
  priceDisplay.innerText = price > 0 ? price : "---";
};
