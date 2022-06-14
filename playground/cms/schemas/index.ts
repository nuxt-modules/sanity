// We import object and document schemas
import blockContent from './blockContent'
import crewMember from './crewMember'
import castMember from './castMember'
import movie from './movie'
import person from './person'
import screening from './screening'
import plotSummary from './plotSummary'
import plotSummaries from './plotSummaries'

// Then we give our schema to the builder and provide the result to Sanity
export const schemaTypes = [
  // The following are document types which will appear
  // in the studio.
  movie,
  person,
  screening,
  // When added to this list, object types can be used as
  // { type: 'typename' } in other document schemas
  blockContent,
  plotSummary,
  plotSummaries,
  castMember,
  crewMember,
]
