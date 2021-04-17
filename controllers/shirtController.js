const db = require("../models/database");

const Campers = db.campers;

exports.fetch = async () => {
  let children;
  try {
    children = await Campers.findAll({
      order: [["id", "ASC"]],
      where: { isRegistered: true },
    });
  } catch (e) {
    console.error(e);
    return null;
  }

  if (children.length === 0) return null;

  const shirtBlocks = {
    "1v": {},
    "2v": {},
    "3v": {},
    "4v": {},
    total: {},
  };

  children.forEach((child) => {
    shirtBlocks[child.shift][child.tsSize] =
      (shirtBlocks[child.shift][child.tsSize] ?? 0) + 1;
    shirtBlocks.total[child.tsSize] =
      (shirtBlocks.total[child.tsSize] ?? 0) + 1;
  });

  return shirtBlocks;
};
