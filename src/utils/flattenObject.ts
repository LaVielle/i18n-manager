/**
 * flattenObject
 *
 * returns a flattened object. Used to flatten the translation objects, to make them easier to loop over.
 *
 * For example,
 * {
 *   HomeScreen: {
 *     hello: "Hello",
 *     bye: "Bye",
 *   }
 * }
 * will turn into:
 *    HomeScreen.hello: "Hello",
 *    HomeScreen.bye: "Bye",
 *    ... and so on
 *
 * taken from: https://stackoverflow.com/a/53739792/9957187
 * */
export const flattenObject = (ob) => {
  const toReturn = {}

  for (const i in ob) {
    // eslint-disable-next-line no-prototype-builtins
    if (!ob.hasOwnProperty(i)) continue

    if (typeof ob[i] === 'object' && ob[i] !== null) {
      const flatObject = flattenObject(ob[i])
      for (const x in flatObject) {
        // eslint-disable-next-line no-prototype-builtins
        if (!flatObject.hasOwnProperty(x)) continue

        toReturn[`${i}.${x}`] = flatObject[x]
      }
    } else {
      toReturn[i] = ob[i]
    }
  }
  return toReturn
}
