const fs = require("fs");

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

exports.generateData = () => {
  const names = JSON.parse(fs.readFileSync("./data/names.json", "utf-8"));

  const firstNames = names.first;
  const lastNames = names.last;

  const mCount = firstNames.M.length;
  const fCount = firstNames.F.length;
  const lCount = lastNames.length;

  const path = "./data/files/dummy.txt";

  fs.unlinkSync(path);
  const stream = fs.createWriteStream(path, { flags: "a" });

  const simCount = 10;

  for (let shiftNr = 1; shiftNr <= 5; ++shiftNr) {
    for (let i = 0; i < simCount; ++i) {
      let fName = firstNames.M[Math.floor(Math.random() * mCount)];
      let lName = lastNames[Math.floor(Math.random() * lCount)];
      let idCode = getIdCode("M");

      let name = `${fName} ${lName}`;

      stream.write(`name=${encodeURIComponent(name)}&`);
      stream.write(`idCode=${idCode}&`);
      stream.write(`isNew=${Math.round(Math.random())}&`);
      stream.write(`shiftNr=${shiftNr}&`);
      stream.write(`road=Merelaagri tee&`);
      stream.write(`city=${encodeURIComponent("Laoküla")}&`);
      stream.write(`county=Harju&`);
      stream.write(`tsSize=M&`);
      // stream.write(`addendum:\n`);
      // stream.write(`country:Eesti\n`);

      fName = firstNames.F[Math.floor(Math.random() * fCount)];
      lName = lastNames[Math.floor(Math.random() * lCount)];
      idCode = getIdCode("F");

      name = `${fName} ${lName}`;

      stream.write(`name=${encodeURIComponent(name)}&`);
      stream.write(`idCode=${idCode}&`);
      stream.write(`isNew=${Math.round(Math.random())}&`);
      stream.write(`shiftNr=${shiftNr}&`);
      stream.write(`road=Merelaagri tee&`);
      stream.write(`city=${encodeURIComponent("Laoküla")}&`);
      stream.write(`county=Harju&`);
      stream.write(`tsSize=M&`);
      // stream.write(`addendum:\n`);
      // stream.write(`country:Eesti\n`);
    }
  }

  stream.write(`contactName=Admin&`);
  stream.write(`contactNumber=1234&`);
  stream.write(`contactEmail=${encodeURIComponent("admin@merelaager")}&`);
  stream.write(`childCount=${simCount * 2 * 5}&`);
  stream.write(`noEmail=true`);

  stream.end();
};
