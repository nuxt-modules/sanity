---
title: Image formatting
description: 'Access text, images, and other media with Nuxt and the Sanity headless CMS.'
category: Helpers
position: 11
version: 0.33
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

You may wish to import `SanityImage` only in the components that need it, if you have disabled the global `imageHelper` option. Note that you will need to provide your `projectId` (and `dataset` if not `production`):

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
import { SanityImage } from '@nuxtjs/sanity/dist/sanity-image'

export default {
  components: { SanityImage },
}
</script>
```

## Renderless usage

If you pass in a default scopedSlot you can use the `<SanityImage>` component as a renderless component to allow you to take full control of the functionality.

### Example

```vue
<template>
  <SanityImage
    asset-id="image-G3i4emG6B8JnTmGoN0UjgAp8-300x450-jpg"
    auto="format"
  >
    <template #default="{ src }">
      <img :src="src" />
    </template>
  </SanityImage>
</template>
```

## Using @sanity/image-url

If the `SanityContent` helper doesn't cover your needs, you can use [the `@sanity/image-url` package](https://github.com/sanity-io/image-url). One way to add it to your Nuxt project is through a plugin:

```js{}[plugins/sanity-image-builder.js]
import imageUrlBuilder from '@sanity/image-url'

export default ({ $sanity }, inject) => {
  const builder = imageUrlBuilder($sanity.config)
  function urlFor(source) {
    return builder.image(source).auto('format')
  }
  inject('urlFor', urlFor)
}
```

Then you can use the global `$urlFor` helper:

```vue
<template>
  <img
    :src="$urlFor(movie.image).size(426)"
    :alt="movie.title"
    height="426"
    width="426"
    loading="lazy"
  />
</template>
```
