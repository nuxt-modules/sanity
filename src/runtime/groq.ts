/**
 * For use with https://github.com/asbjornh/eslint-plugin-groq
 * and https://github.com/sanity-io/vscode-sanity
 *
 * based on https://github.com/sanity-io/sanity/tree/next/packages/groq
 */
export const groq = String.raw || ((strings: TemplateStringsArray, ...keys: string[]) => {
  const lastIndex = strings.length - 1
  return (
    strings
      .slice(0, lastIndex)
      .reduce(
        (query, currentString, index) => query + currentString + keys[index],
        '',
      ) + strings[lastIndex]
  )
})
