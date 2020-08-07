---
title: Configuration
description: 'Sanity integration for Nuxt.js.'
category: Getting started
position: 3
---

By default, `@nuxtjs/sanity` will look for a `sanity.json` file in your project root directory, and it will read your `projectId` and `dataset` from there.

```json{}[sanity.json]
{
  "api": {
    "projectId": "sample-project-id",
    "dataset": "production"
  }
}
```

If you need to provide additional configuration, you can pass in an object in your Nuxt config with key details:

```js{}[nuxt.config.js]
{
  sanity: {
    projectId: 'myProject',
    token: process.env.SANITY_TOKEN
  }
}
```

## Reference

### `projectId`

- **Required**
- Type: **string**

Your Sanity Project ID, which you can find in your Sanity dashboard.

![](/sanity-dashboard.png)

### `dataset`

- Type: **string**
- Default: **`'production'`**

### `token`

- Type: **string**

You can provide a token or leave blank to be an anonymous user. (You can also set a token programmatically in a Nuxt plugin.)

### `withCredentials`

- Type: **boolean**
- Default: **false**

Include credentials in requests made to Sanity. Useful if you want to take advantage of an existing authorisation to the Sanity CMS.

### `useCdn`

- Type: **boolean**
- Default: **process.env.NODE_ENV === production**

### `minimal`

- Type: **boolean**
- Default: **false**

Use an ultra-minimal Sanity client for making requests. It only supports `fetch` requests, but will significantly decrease your bundle size.

<alert type="info">If you don't have `@sanity/client` installed, then `@nuxtjs/sanity` will use the minimal client by default.</alert>

### `imageHelper`

- Type: **boolean**
- Default: **true**

Add a global `<SanityImage>` component to assist with URL transformations. See [the docs](/helpers/images) for more information.
