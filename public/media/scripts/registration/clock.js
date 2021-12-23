const fetchTime = async () => {
  const res = await fetch("/api/pb/time");
  const data = await res.json();
  return data.isOk ? data.time : null;
};

export const getSyncTime = async () => {
  const t1 = Date.now();
  const t2 = await fetchTime();
  const t3 = Date.now();
  const rtt = t3 - t1;
  return Math.floor(t2 + rtt / 2);
};
