const fs = require("fs");
const config = require("./configGetters");
const dataGetters = require("./dataGetters");

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

        let data = dataGetters.getData(names, simCount, lName, gender, shift);
        data += dataGetters.getMeta(simCount, names.first, lName);

        stream.write(config.getRequestSampler(data));
      }
      stream.write(config.getParallelFooter());
    });
  });

  stream.write(config.getConfigFooter());

  stream.end();
};
