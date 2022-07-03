// Gets the currently "active" year.
// The active year lasts from december-december to allow
// for preparations before registrations in January.
export const getYear = () => {
  const now = new Date();
  let year = now.getFullYear();
  if (now.getMonth() === 11) ++year;
  return year;
};
