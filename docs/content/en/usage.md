---
title: Usage
description: 'Access text, images, and other media with Nuxt and the Sanity headless CMS.'
category: Getting started
position: 4
version: 0.39
---

This module globally injects a `$sanity` helper, meaning that you can access it anywhere using `this.$sanity`. For plugins, asyncData, fetch, nuxtServerInit and middleware, you can access it from `context.$sanity`.

## Reference

### fetch

This enables you to perform a GROQ query against your Sanity dataset.

#### Example with `asyncData`

<code-group>
  <code-block label="JavaScript" active>

```js
import { groq } from '@nuxtjs/sanity'

const query = groq`{ "articles": *[_type == "article"] }`

export default {
  asyncData({ $sanity }) {
    return $sanity.fetch(query)
  },
}
```

  </code-block>
  <code-block label="TypeScript">

```ts
import { groq } from '@nuxtjs/sanity'

const query = groq`{ "articles": *[_type == "article"] }`

export default {
  asyncData({ $sanity }) {
    // By default it returns a `Promise<unknown>`,
    // but you can customise the type of the return.
    return $sanity.fetch<string>(query)
  },
}
```

  </code-block>
</code-group>

<alert type="info">By wrapping the GROQ query into an object, you can return the promise directly. The data will be available in your component under the key used in the query.</alert>

#### Example with `fetch`

<code-group>
  <code-block label="JavaScript" active>

```js
import { groq } from '@nuxtjs/sanity'

const query = groq`*[_type == "article"][0].title`

export default {
  async fetch() {
    this.title = await this.$sanity.fetch(query)
  },
  data: () => ({ title: '' }),
}
```

  </code-block>
  <code-block label="TypeScript">

```ts
import { groq } from '@nuxtjs/sanity'

const query = groq`*[_type == "article"][0].title`

export default {
  async fetch() {
    // By default it returns a `Promise<unknown>`,
    // but you can customise the type of the return.
    this.title = await this.$sanity.fetch<string>(query)
  },
  data: () => ({ title: '' }),
}
```

  </code-block>
</code-group>

### `client`

You can access the underlying client with this property. This is most useful if not using the minimal client.

```ts
const query = groq`*[_type == "article"][0].title`

export default {
  mounted() {
    this.observable = this.$sanity.client.listen(query)
    this.observable.subscribe(event => {
      // Do something
    })
  },
  data: () => ({ observable: null }),
}
```

### `setToken`

You can securely set the token for your Sanity client in a Nuxt plugin.

```js{}[plugins/sanity.js]
export default async ({ req, $sanity }) => {
  const token = getTokenFromReq(req)
  $sanity.setToken(token)
}
```

### `config`

You can access the Sanity config you have passed into the module if you need to do so (for example, with `@sanity/image-url`):

```js{}[plugins/sanity.js]
import imageUrlBuilder from '@sanity/image-url'
export default ({ $sanity }, inject) => {
  const builder = imageUrlBuilder($sanity.config)

  function urlFor(source) {
    return builder.image(source)
  }

  inject('urlFor', urlFor)
}
```

### Additional clients

If you have [configured additional clients](/configuration#additionalclients) you can access them directly off `$sanity`, with all the same properties and methods as specified above. So, for example:

```js{}[plugins/fetch.js]
export default async ({ $sanity }) => {
  $sanity.another.fetch('*[type == "article"][0]')
}
```
