export default defineEventHandler(() => {
  const sanity = useSanity()

  const query = groq`*[_type == "movie"] {
        title,
        "poster": poster.asset._ref,
        "slug": slug.current
      }`
  return sanity.fetch(query)
})
