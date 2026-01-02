export default defineEventHandler(() => {
  const sanity = useSanity()

  const fetchMovieQuery = defineQuery(`*[_type == "movie" && slug.current == "walle"][0] {
        title,
        "poster": poster.asset._ref,
        "slug": slug.current
      }`)
  return sanity.fetch(fetchMovieQuery)
})
