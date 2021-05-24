// Derived from https://2ality.com/2015/08/es6-map-json.html#converting-a-string-map-to-and-from-an-object
export function mapToObject(
  map: ReadonlyMap<number | string, number | string>
) {
  let obj = Object.create(null);
  for (let [k, v] of map) {
    obj[k] = v;
  }
  return obj;
}
