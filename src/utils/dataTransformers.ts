/* eslint-disable */
// @ts-nocheck

export const getDataFromFlatKeyId = (flatKey: string) => {
  const [language, namespace, key] = flatKey.split('.')

  return { language, namespace, key }
}

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

/**
 * Taken from https://stackoverflow.com/a/19204980/9957187
 * */
export const unflattenObject = (table) => {
  const result = {}

  for (const path in table) {
    var cursor = result,
      length = path.length,
      property = '',
      index = 0

    while (index < length) {
      const char = path.charAt(index)

      if (char === '[') {
        var start = index + 1,
          end = path.indexOf(']', start),
          cursor = (cursor[property] = cursor[property] || []),
          property = path.slice(start, end),
          index = end + 1
      } else {
        var cursor = (cursor[property] = cursor[property] || {}),
          start = char === '.' ? index + 1 : index,
          bracket = path.indexOf('[', start),
          dot = path.indexOf('.', start)

        if (bracket < 0 && dot < 0) var end = (index = length)
        else if (bracket < 0) var end = (index = dot)
        else if (dot < 0) var end = (index = bracket)
        else var end = (index = bracket < dot ? bracket : dot)

        var property = path.slice(start, end)
      }
    }

    cursor[property] = table[path]
  }

  return result['']
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
    const { language, namespace, key } = getDataFromFlatKeyId(cur)

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

const constructHierachicalObjectFromFlat = () => {}
