/* eslint-disable @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access */
import Chance from "chance";

import DummyRand from "./DummyRand";
import { FirstNames, Gender, RandNames } from "./types";

const rand = DummyRand;
const separator = "&amp;";
const MAX_SHIFTS = 4;

class DataGetters {
  public static getFirstName = (firstNames: FirstNames, gender: Gender) => {
    const count = firstNames[gender].length;
    return firstNames[gender][Math.floor(Math.random() * count)];
  };

  public static getChildData = (
    name: string,
    shiftNr: number,
    gender: string
  ) => {
    let res = "";

    const idCode = rand.getIdCode(gender);
    const tsSize = rand.getTsSize();

    res += `name[]=${encodeURIComponent(name)}` + separator;
    res += `idCode[]=${idCode}` + separator;
    res += `newcomer[]=${Math.round(Math.random()) === 1 ? "yes" : "no"}` + separator;
    res += `shiftNr[]=${shiftNr}` + separator;
    res += `road[]=Merelaagri tee` + separator;
    res += `city[]=${encodeURIComponent("Laoküla")}` + separator;
    res += `county[]=Harju` + separator;
    res += `tsSize[]=${tsSize}` + separator;
    res += `addendum[]=` + separator;
    res += `country[]=Eesti` + separator;

    return res;
  };

  public static getMeta = (
    simCount: number,
    fNames: FirstNames,
    lName: string
  ) => {
    const gender: Gender = Math.round(Math.random()) === 1 ? "M" : "F";
    const fName = this.getFirstName(fNames, gender);

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

  public static getData = (
    names: RandNames,
    simCount: number,
    lName: string,
    gender: Gender,
    shiftNr: number
  ) => {
    let res = "";
    let name: string;

    // for (let shiftNr = 1; shiftNr <= 5; ++shiftNr) {
    for (let i = 0; i < simCount; ++i) {
      name = `${this.getFirstName(names.childFirst, gender)} ${lName}`;
      res += this.getChildData(name, shiftNr, gender);
    }
    //}

    return res;
  };

  public static getAccurate = (names: RandNames, lName: string) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const chance = new Chance();

    let childCount: number;
    if (chance.bool({ likelihood: 50 })) childCount = 1;
    else if (chance.bool({ likelihood: 70 })) childCount = 2;
    else if (chance.bool({ likelihood: 60 })) childCount = 3;
    else childCount = 4;

    let res = "";

    let shiftNr = chance.integer({ min: 1, max: MAX_SHIFTS }) as number;
    let randomisedShift = false;

    for (let i = 0; i < childCount; ++i) {
      const gender = chance.bool() ? "M" : "F";
      if (!randomisedShift && chance.bool({ likelihood: 35 })) {
        shiftNr = chance.integer({ min: 1, max: MAX_SHIFTS }) as number;
        randomisedShift = true;
      }
      const name = `${this.getFirstName(names.childFirst, gender)} ${lName}`;
      res += this.getChildData(name, shiftNr, gender);
    }

    return { res, childCount };
  };
}

export default DataGetters;
