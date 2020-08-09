---
title: Image formatting
description: 'Sanity integration for Nuxt.js.'
category: Helpers
position: 10
---

## Global helper

This module defines a global `<SanityImage>` component to assist with auto-generating your image URLs. It is a lightweight functional component that simply turns the props into a valid image URL.

### Props

#### `assetId`

The Sanity asset ID (of the form `image-G3i4emG6B8JnTmGoN0UjgAp8-300x450-jpg`).

- Type: **string**
- **Required**

#### `projectId` and `dataset`

These default to the `projectId` and `dataset` passed into the module options but can be overridden.

- Type: **string**

#### Image transformation props

All other image transformation options are valid props - see [the Sanity documentation](https://www.sanity.io/docs/image-urls) for more details.

### Example

```vue
<template>
  <SanityImage
    asset-id="image-G3i4emG6B8JnTmGoN0UjgAp8-300x450-jpg"
    auto="format"
  />
</template>
```

## Local import

You may wish to import `SanityImage` only in the components that need it. If you do so, you can do so - but note that you will need to provide your `projectId` (and `dataset` if not `production`):

### Example

```vue
<template>
  <SanityImage
    project-id="my-project-id"
    asset-id="image-G3i4emG6B8JnTmGoN0UjgAp8-300x450-jpg"
    auto="format"
  />
</template>

<script>
import { SanityImage } from '@nuxtjs/sanity/components/sanity-image'

export default {
  components: { SanityImage },
}
</script>
```

## Other resources

If you are procedurally generating your image URLs you may wish to use [the `@sanity/image-url` package](https://github.com/sanity-io/image-url).
