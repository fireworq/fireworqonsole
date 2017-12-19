export function snakeToCamel(obj: { [key:string]: any }): { [key:string]: any } {
  if (Array.isArray(obj))
    return obj.map((x) => snakeToCamel(x));

  if (obj === null || typeof obj !== 'object')
    return obj;

  let result: { [key:string]: any } = {};
  Object.keys(obj).forEach((k) => {
    const camelKey = k.replace(/_([a-z])/g, (_, x) => x.toUpperCase());
    const value = obj[k];
    result[camelKey] = snakeToCamel(value);
  });
  return result;
}
