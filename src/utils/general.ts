export const capitalizeFirstLetter = (value: string) => {
  return value.charAt(0).toUpperCase() + value.slice(1);
};

// based on https://stackoverflow.com/a/7225450
export const camelCaseToTitleCase = (text: string, toLowerCase = false) => {
  const result = text.replace(/([A-Z])/g, ' $1');
  const titleCase = (result.charAt(0).toUpperCase() + result.slice(1));
  if(toLowerCase) return titleCase.toLocaleLowerCase();
  return titleCase;
};

export const pushIfNotIncluded = <T>(arr: T[], entry: T) => {
  if(!arr.includes(entry)) arr.push(entry);
};

// from https://stackoverflow.com/a/34566587
export const arrayContentsEqual = <T>(array1: T[], array2: T[]) => {
  const set1 = new Set(array1);
  const set2 = new Set(array2);
  return (
    array1.every(item => set2.has(item)) &&
    array2.every(item => set1.has(item))
  )
}

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