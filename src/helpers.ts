/**
 * From https://github.com/sanity-io/sanity/tree/next/packages/groq
 */
export const groq = (strings: TemplateStringsArray, ...keys: any[]) => {
  const lastIndex = strings.length - 1
  return (
    strings
      .slice(0, lastIndex)
      .reduce(
        (query, currentString, index) => query + currentString + keys[index],
        ''
      ) + strings[lastIndex]
  )
}
