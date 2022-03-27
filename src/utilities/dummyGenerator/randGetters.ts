const getRandomDate = (start: Date, end: Date) => {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
};

const tsSizes = ["118/128", "130/140", "142/152", "152/164", "M", "L", "XL"];

exports.getTsSize = () => {
  return tsSizes[Math.floor(Math.random() * tsSizes.length)];
};

exports.getIdCode = (gender: string) => {
  let idCode = gender === "M" ? "5" : "6";
  const bDay = getRandomDate(new Date(2005, 0, 1), new Date(2016, 11, 31));

  const year = bDay.getFullYear().toString().substring(-2);
  const month = (bDay.getMonth() + 1).toLocaleString("en-GB", {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });
  const day = bDay
    .getDate()
    .toLocaleString("en-US", { minimumIntegerDigits: 2, useGrouping: false });
  idCode += `${year}${month}${day}1234`;
  return idCode;
};
