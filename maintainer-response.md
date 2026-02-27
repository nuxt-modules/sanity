Thanks for the detailed review — you were right on all counts.

The reproduction scenario I described was poorly framed. The actual bug is
specific to `previewMode: false` (always-on visual editing): at page load
perspective defaults to `'published'`, so `client` is captured as
`sanity.client`. When Presentation Tool subsequently sets the perspective to
`'previewDrafts'`, `useAsyncData` re-runs (perspective is in `options.watch`)
but reuses the stale client — and since `visualEditing.token` is server-only
and not available in the browser, the re-fetch can't authenticate and draft
content is never returned.

With `previewMode` configured (cookie-based), you're right that a full page
reload happens on activation, so setup-time state is always correct there.

I've implemented your suggestion: client and stega selection are now evaluated
inside the `useAsyncData` callback directly in `useSanityQuery`, and
`useSanitySmartQuery` has been removed entirely. The change is minimal and has
no effect on SSR behavior or the common `'published'` perspective case.

`useSanityPreviewState` is kept as a separate addition since it's a standalone
public API with no overlap with the bug fix.

Happy to adjust the issue link if #1408 doesn't accurately describe this —
let me know if you'd prefer a dedicated issue.
