export type FirstNames = {
  M: string[];
  F: string[];
};

export type Gender = keyof FirstNames;

export type RandNames = {
  childFirst: FirstNames;
  first: FirstNames;
  last: string[];
};
