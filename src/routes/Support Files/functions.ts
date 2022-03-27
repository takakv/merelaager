export const getYear = () => {
  const now = new Date();
  let year = now.getFullYear();
  if (now.getMonth() === 11) ++year;
  return year;
};