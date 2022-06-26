export const capitalizeFirstLetter = (value: string) => {
  return value.charAt(0).toUpperCase() + value.slice(1);
};

// based on https://stackoverflow.com/a/7225450
export const camelCaseToTitleCase = (text: string) => {
  const result = text.replace(/([A-Z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1);
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


export const promptDownload = (dataURL: string, name: string) => {
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = name;
  link.click();
};