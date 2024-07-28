import { readFileSync, existsSync, unlinkSync, createWriteStream } from "fs";
import { Gender, RandNames } from "./types";

import DummyConf from "./DummyConf";
import DataGetters from "./DataGetters";

const dc = DummyConf;
const dg = DataGetters;

class DummyGenerator {
  public static generate = async (authentic: boolean, factor: number) => {
    const names = JSON.parse(
      readFileSync("./data/names.json", "utf-8")
    ) as RandNames;
    const path = "./data/files/regTest.jmx";

    if (existsSync(path)) unlinkSync(path);
    const stream = createWriteStream(path, { flags: "a" });

    const count = 22;
    let authenticCount = 10;

    stream.write(dc.getHeader());

    const shifts = [1, 2, 3, 4];
    const genders: Gender[] = ["M", "F"];

    if (authentic) {
      if (factor > 10) {
        [factor, authenticCount] = [authenticCount, factor];
      }
      // Attempt to generate authentic data.
      for (let i = 0; i < factor; ++i) {
        stream.write(dc.getThreadGroup(i, "t"));
        stream.write(dc.getParallelHeader());
        for (let i = 0; i < authenticCount; ++i) {
          const lastNames = names.last;
          const lName = lastNames[Math.floor(Math.random() * lastNames.length)];

          const res = dg.getAccurate(names, lName);
          let data = res.res;
          const { childCount } = res;
          data += dg.getMeta(childCount, names.first, lName);

          stream.write(dc.getRequestSampler(data));
        }

        stream.write(dc.getParallelFooter());
      }
    } else {
      // Generate separately 22 boys and 22 girls for each shift.
      shifts.forEach((shift) => {
        genders.forEach((gender) => {
          stream.write(dc.getThreadGroup(shift, gender));
          stream.write(dc.getParallelHeader());

          for (let i = 1; i <= count; ++i) {
            const simCount = 1; //Math.floor(300 / count / (2 * 5));
            const lastNames = names.last;
            const lName =
              lastNames[Math.floor(Math.random() * lastNames.length)];

            let data = dg.getData(names, simCount, lName, gender, shift);
            data += dg.getMeta(simCount, names.first, lName);

            stream.write(dc.getRequestSampler(data));
          }
          stream.write(dc.getParallelFooter());
        });
      });
    }

    stream.write(dc.getFooter());

    stream.end();
    await new Promise((fulfill) => stream.on("finish", fulfill));
    return path;
  };
}

export default DummyGenerator;
