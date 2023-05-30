type IDData = {
  isMale: boolean;
  dob: Date;
};

/**
 * A utility class for parsing various types of structured string data.
 */
class Parser {
  /**
   * Parses Estonian ID codes and return data in a structured format.
   * Only parses ID codes for people born in 2000 or later.
   *
   * @param {string} code - The ID code string to parse.
   * @return An IDData object if parsing is successful, null
   * otherwise.
   */
  static parseIdCode = (code: string): IDData | null => {
    // The Estonian ID code is 11 characters long.
    if (code.length !== 11) return null;

    const data: IDData = { isMale: false, dob: null };

    // The first number represents the birth-century and the person's sex.
    // Odd numbers refer to males, while even numbers to females.
    // For 1900-1999, the numbers are 3, 4.
    // For 2000-2099, the numbers are 5, 6.
    // Since camp-aged kids are always born after 2000, we only consider this
    // case.
    const gender = parseInt(code[0], 10);
    switch (gender) {
      case 5:
        data.isMale = true;
        break;
      case 6:
        data.isMale = false;
        break;
      default:
        return null;
    }

    // Since we only consider people born in the 21st century, we can prefix
    // the birth year.
    const year = parseInt(`20${code[1]}${code[2]}`, 10);
    const month = parseInt(`${code[3]}${code[4]}`, 10);
    const day = parseInt(`${code[5]}${code[6]}`, 10);

    if (isNaN(year)) return null;
    // ID card months are in range 1-12.
    if (isNaN(month) || month < 1 || month > 12) return null;
    // ID card days are in range 1-31.
    if (isNaN(day) || day < 1 || day > 31) return null;

    const shortMonths = [4, 6, 9, 11];
    if (shortMonths.includes(month) && day > 30) return null;
    if (month === 2) {
      if (day > 29) return null;
      // A year is a leap year only if it is exactly divisible by 4, with some
      // exceptions. Namely, if the year is also exactly divisible by 100, but
      // not by 400, then it is not a leap year.
      // In the timeframe 2000-2099, only 2000 is exactly divisible by 100,
      // but it is a leap year, so we do not have to patch our checking logic.
      if (day == 29 && !Number.isInteger(year / 4)) return null;
    }

    // Date takes in the month index, not the month number in common language.
    data.dob = new Date(Date.UTC(year, month - 1, day));
    return data;
  };
}
