export function keys(object) {
  return Object.keys(object)
}

export function values(object) {
  return Object.values(object)
}

export default function items(object) {
  return keys(object).map(key => [key, object[key]])
}
