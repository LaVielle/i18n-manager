export const logJsonObject = (obj: Record<string, unknown>) =>
  console.log(JSON.stringify(obj, null, 2))
