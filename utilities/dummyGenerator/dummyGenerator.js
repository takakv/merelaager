const fs = require("fs");
const config = require("./configGetters");

const separator = "&amp;";

const tsSizes = ["118/128", "130/140", "142/152", "152/164", "M", "L", "XL"];

const getRandomDate = (start, end) => {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
};

const getIdCode = (gender) => {
  let idCode = gender === "M" ? "5" : "6";
  const bDay = getRandomDate(new Date(2004, 0, 1), new Date(2017, 11, 31));

  const year = bDay.getFullYear().toString().substr(-2);
  let month = bDay.getMonth() + 1;
  month = month.toLocaleString("en-US", {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });
  const day = bDay
    .getDate()
    .toLocaleString("en-US", { minimumIntegerDigits: 2, useGrouping: false });
  idCode += `${year}${month}${day}1234`;
  return idCode;
};

const getSingle = (name, shiftNr, gender) => {
  let res = "";

  const idCode = getIdCode(gender);
  const tsSize = tsSizes[Math.floor(Math.random() * tsSizes.length)];

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

const getFirstName = (firstNames, gender) => {
  const count = firstNames[gender].length;
  return firstNames[gender][Math.floor(Math.random() * count)];
};

const getData = (names, simCount, lName, gender, shiftNr) => {
  let res = "";
  let name;

  // for (let shiftNr = 1; shiftNr <= 5; ++shiftNr) {
  for (let i = 0; i < simCount; ++i) {
    name = `${getFirstName(names.first, gender)} ${lName}`;
    res += getSingle(name, shiftNr, gender);
  }
  //}

  return res;
};

const getMeta = (simCount, fNames, lName) => {
  const gender = Math.round(Math.random()) === 1 ? "M" : "F";
  const fName = getFirstName(fNames, gender);

  let res = "";
  res += `contactName=${encodeURIComponent(`${fName} ${lName}`)}` + separator;
  res += `contactNumber=%2B372 xxx` + separator;
  res += `contactEmail=${encodeURIComponent(`${fName}@${lName}`)}` + separator;
  res += `childCount=${simCount}` + separator;
  res += `noEmail=true`;
  return res;
};

exports.generate = () => {
  const names = JSON.parse(fs.readFileSync("./data/names.json", "utf-8"));
  const path = "./data/files/regTest.jmx";

  if (fs.existsSync(path)) fs.unlinkSync(path);
  const stream = fs.createWriteStream(path, { flags: "a" });

  const count = 22;

  stream.write(config.getConfigHeader());

  const shifts = [1, 2, 3, 4, 5];
  const genders = ["M", "F"];

  shifts.forEach((shift) => {
    genders.forEach((gender) => {
      stream.write(config.getThreadGroup(shift, gender));
      stream.write(config.getParallelHeader());

      for (let i = 1; i <= count; ++i) {
        const simCount = 1; //Math.floor(300 / count / (2 * 5));
        const lastNames = names.last;
        const lName = lastNames[Math.floor(Math.random() * lastNames.length)];

        let data = getData(names, simCount, lName, gender, shift);
        data += getMeta(simCount, names.first, lName);

        stream.write(config.getRequestSampler(data));
      }
      stream.write(config.getParallelFooter());
    });
  });

  stream.write(config.getConfigFooter());

  stream.end();
};
