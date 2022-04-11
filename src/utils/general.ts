export const capitalizeFirstLetter = (value: string) => {
  return value.charAt(0).toUpperCase() + value.slice(1);
};

export const pushIfNotIncluded = <T>(arr: T[], entry: T) => {
  if(!arr.includes(entry)) arr.push(entry);
};