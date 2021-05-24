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
export const flattenObject = (ob): { [key: string]: any } => {
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

export type NormalizedObject = {
  // namespace level, eg: 'Onboarding'
  [namespace: string]: {
    // key level, eg: 'goodMorning'
    [key: string]: {
      // language translation level, eg: { en: "Good morning" }
      [translation: string]: string
    }
  }
}

/**
 * normalizeDataShape
 *
 * Takes a flat object with keys formatted as language.namespace.key and value string.
 * For example:
 * {
 *   en.Onboarding.goodMorning: "Good morning",
 *   de.Onboarding.goodMorning: "Guten morgen",
 * }
 *
 * and transforms it to an object with the following shape:
 * {
 *   Onboarding: {
 *     goodMorning: {
 *       en: "Good morning",
 *       de: "Guten Morgen",
 *     }
 *   }
 * }
 *
 * */
export const normalizeDataShape = (flatObject: { [key: string]: string }): NormalizedObject => {
  return Object.keys(flatObject).reduce<NormalizedObject>((acc, cur, index) => {
    const [language, namespace, key] = cur.split('.')

    if (acc[namespace]) {
      if (acc[namespace][key]) {
        acc[namespace][key] = {
          ...acc[namespace][key],
          [language]: Object.values(flatObject)[index],
        }
      } else {
        acc[namespace] = {
          ...acc[namespace],
          [key]: {
            [language]: Object.values(flatObject)[index],
          },
        }
      }
    } else {
      acc = {
        ...acc,
        [namespace]: {
          [key]: {
            [language]: Object.values(flatObject)[index],
          },
        },
      }
    }

    return acc
  }, {})
}
