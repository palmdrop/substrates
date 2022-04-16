export const getPropertyObjectFromStyles = (
  keys: string[], 
  styles: CSSStyleDeclaration,
  keyConverter?: (key: string) => string 
) => {
  return keys.reduce((acc, key) => {
    acc[key] = styles.getPropertyValue(
      `--${ keyConverter ? keyConverter(key) : key }`
    );
    return acc;
  }, {} as { [key: string]: string});
};