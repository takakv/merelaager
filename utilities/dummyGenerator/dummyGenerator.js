const fs = require("fs");
const config = require("./configGetters");
const dataGetters = require("./dataGetters");

const getAuthentic = (names) => {
  const lastNames = names.last;
  const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
};

exports.generate = async (authentic, factor) => {
  const names = JSON.parse(fs.readFileSync("./data/names.json", "utf-8"));
  const path = "./data/files/regTest.jmx";

  if (fs.existsSync(path)) fs.unlinkSync(path);
  const stream = fs.createWriteStream(path, { flags: "a" });

  const count = 22;

  stream.write(config.getConfigHeader());

  const shifts = [1, 2, 3, 4, 5];
  const genders = ["M", "F"];

  if (authentic) {
    // Attempt to generate authentic data.
    for (let i = 0; i < factor; ++i) {
      stream.write(config.getThreadGroup(i, "t"));
      stream.write(config.getParallelHeader());
      for (let i = 0; i < 10; ++i) {
        const lastNames = names.last;
        const lName = lastNames[Math.floor(Math.random() * lastNames.length)];

        const res = dataGetters.getAccurate(names, lName);
        let data = res.res;
        const { childCount } = res;
        data += dataGetters.getMeta(childCount, names.first, lName);

        stream.write(config.getRequestSampler(data));
      }

      stream.write(config.getParallelFooter());
    }
  } else {
    // Generate separately 22 boys and 22 girls for each shift.
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
  }

  stream.write(config.getConfigFooter());

  stream.end();
  await new Promise((fulfill) => stream.on("finish", fulfill));
  return path;
};
