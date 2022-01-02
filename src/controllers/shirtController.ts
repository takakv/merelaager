import {Registration} from "../db/models/Registration";

export const fetch = async () => {
  let children;
  try {
    children = await Registration.findAll({
      order: [["id", "ASC"]],
      where: { isRegistered: true },
    });
  } catch (e) {
    console.error(e);
    return null;
  }

  if (children.length === 0) return null;

  const shirtBlocks = {
    total: {},
  };

  children.forEach((child) => {
    if (!shirtBlocks.hasOwnProperty(child.shiftNr))
      shirtBlocks[child.shiftNr] = {};

    shirtBlocks[child.shiftNr][child.tsSize] =
      (shirtBlocks[child.shiftNr][child.tsSize] ?? 0) + 1;
    shirtBlocks.total[child.tsSize] =
      (shirtBlocks.total[child.tsSize] ?? 0) + 1;
  });

  return shirtBlocks;
};
