export const capitalizeFirstLetter = (value: string) => {
  return value.charAt(0).toUpperCase() + value.slice(1);
};

export const pushIfNotIncluded = <T>(arr: T[], entry: T) => {
  if(!arr.includes(entry)) arr.push(entry);
};

// Kudos https://stackoverflow.com/a/64489535
export const groupBy = <T>(array: T[], predicate: (v: T) => string) =>
  array.reduce((acc, value) => {
    (acc[predicate(value)] ||= []).push(value);
    return acc;
  }, {} as { [key: string]: T[] });