export default defineEventHandler(() => {
  const sanity = useSanity()

  const fetchMovieQuery = groq`*[_type == "movie" && slug.current == "walle"][0] {
        title,
        "poster": poster.asset._ref,
        "slug": slug.current
      }`
  return sanity.fetch<FetchMovieQueryResult>(fetchMovieQuery)
})
