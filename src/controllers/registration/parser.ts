const daysInMonth = (m: number, y: number) => {
  switch (m) {
    case 1:
      return y % 400 === 0 || (y % 4 === 0 && y % 100 !== 0) ? 29 : 28;
    case 3:
    case 5:
    case 8:
    case 10:
      return 30;
    default:
      return 31;
  }
};

const validateDate = (d: number, m: number, y: number) => {
  m -= 1;
  if (m < 0 || m > 11) return false;
  return d > 0 && d <= daysInMonth(m, y);
};

exports.validateIdCode = (code: string) => {
  // The Estonian ID code consists of 11 characters.
  if (code.length !== 11) {
    console.log(code);
    console.log("Wrong length");
    return false;
  }

  // Years 2000 - 2099 start with 5 for boys, 6 for girls.
  const gender = parseInt(code.charAt(0));
  if (isNaN(gender) || gender < 5) {
    console.log(code);
    console.log("Starts with < 5");
    return false;
  }

  if (isNaN(parseInt(code.slice(1, 7), 7))) {
    console.log(code);
    console.log("Birthdate NaN");
    return false;
  }
  const year = 2000 + parseInt(code.slice(1, 3));
  const month = parseInt(code.slice(3, 5));
  const day = parseInt(code.slice(5, 7));

  if (!validateDate(day, month, year)) {
    console.log(code);
    console.log(year);
    console.log(daysInMonth(1, year));
    console.log("Birthday not valid");
    return false;
  }
  const birthday = new Date(year, month - 1, day);

  if (isNaN(parseInt(code.slice(7, 11)))) {
    console.log(code);
    console.log("Suffix NaN");
    return false;
  }

  return {
    birthday,
    gender: gender === 5 ? "M" : "F",
  };
};
