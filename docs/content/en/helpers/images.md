---
title: Image formatting
description: 'Sanity integration for Nuxt.js.'
category: Helpers
position: 10
---

This module defines a global `<SanityImage>` component to assist with auto-generating your image URLs. It is a lightweight functional component that simply turns the props into a valid image URL. For more details on the props it accepts, see [the Sanity documentation](https://www.sanity.io/docs/image-urls) - all those options are accepted.

Alternatively, if you are procedurally generating your image URLs you may wish to use [the `@sanity/image-url` package](https://github.com/sanity-io/image-url).

## Example

```vue
<template>
  <SanityImage
    assetId="image-G3i4emG6B8JnTmGoN0UjgAp8-300x450-jpg"
    auto="format"
  />
</template>
```
