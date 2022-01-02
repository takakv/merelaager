const Chance = require("chance");
const rand = require("./randGetters");

const separator = "&amp;";

const getFirstName = (firstNames, gender) => {
  const count = firstNames[gender].length;
  return firstNames[gender][Math.floor(Math.random() * count)];
};

const getChildData = (name, shiftNr, gender) => {
  let res = "";

  const idCode = rand.getIdCode(gender);
  const tsSize = rand.getTsSize();

  res += `name=${encodeURIComponent(name)}` + separator;
  res += `idCode=${idCode}` + separator;
  res += `isNew=${Math.round(Math.random())}` + separator;
  res += `shiftNr=${shiftNr}` + separator;
  res += `road=Merelaagri tee` + separator;
  res += `city=${encodeURIComponent("Laoküla")}` + separator;
  res += `county=Harju` + separator;
  res += `tsSize=${tsSize}` + separator;
  // res += `addendum:\n`;
  // res += `country:Eesti\n`;

  return res;
};

exports.getMeta = (simCount, fNames, lName) => {
  const gender = Math.round(Math.random()) === 1 ? "M" : "F";
  const fName = getFirstName(fNames, gender);

  let res = "";
  res += `contactName=${encodeURIComponent(`${fName} ${lName}`)}` + separator;
  res += `contactNumber=%2B372 xxx` + separator;
  res +=
    `contactEmail=${encodeURIComponent(
      `${fName.toLowerCase()}@${lName.toLowerCase()}`
    )}` + separator;
  res += `childCount=${simCount}` + separator;
  res += `noEmail=true`;
  return res;
};

exports.getData = (names, simCount, lName, gender, shiftNr) => {
  let res = "";
  let name;

  // for (let shiftNr = 1; shiftNr <= 5; ++shiftNr) {
  for (let i = 0; i < simCount; ++i) {
    name = `${getFirstName(names.childFirst, gender)} ${lName}`;
    res += getChildData(name, shiftNr, gender);
  }
  //}

  return res;
};

exports.getAccurate = (names, lName) => {
  const chance = new Chance();

  let childCount;
  if (chance.bool({ likelihood: 45 })) childCount = 1;
  else if (chance.bool({ likelihood: 50 })) childCount = 2;
  else if (chance.bool({ likelihood: 60 })) childCount = 3;
  else childCount = 4;

  let res = "";

  let shiftNr = chance.integer({ min: 1, max: 5 });
  let randomisedShift = false;

  for (let i = 0; i < childCount; ++i) {
    const gender = chance.bool() ? "M" : "F";
    if (!randomisedShift && chance.bool({ likelihood: 35 })) {
      shiftNr = chance.integer({ min: 1, max: 5 });
      randomisedShift = true;
    }
    const name = `${getFirstName(names.childFirst, gender)} ${lName}`;
    res += getChildData(name, shiftNr, gender);
  }

  return { res, childCount };
};
