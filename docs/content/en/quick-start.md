---
title: Quick start
description: 'Sanity integration for Nuxt.js.'
category: Getting started
position: 2
---

## Setup

1. **Install Sanity integration**

  <code-group>
    <code-block label="Yarn" active>

    ```bash
    yarn add @nuxtjs/sanity
    ```

    </code-block>
    <code-block label="NPM">

    ```bash
    npm install @nuxtjs/sanity --save
    ```

    </code-block>

  </code-group>

2. **Enable the module in your Nuxt configuration**

   ```js{}[nuxt.config.js]
   {
     buildModules: ['@nuxtjs/sanity']
   }
   ```

   Note that [using `buildModules`](https://nuxtjs.org/api/configuration-modules#-code-buildmodules-code-) requires Nuxt >= 2.9. Just add it to your `modules` if you're on a lower version.

3. **Add Sanity configuration**

   `@nuxtjs/sanity` will look for a `sanity.json` file in your project root directory. Alternatively, you can pass in an object in your Nuxt config with key details.

   ```js{}[nuxt.config.js]
   {
     sanity: {
       projectId: 'myProject'
     }
   }
   ```

   <alert type="info">You can find more about configuring `@nuxtjs/sanity` [here](/configuration).</alert>

4. **You're good to go!**

## TypeScript

`@nuxtjs/sanity` offers type definitions. Just make sure to add an entry in `tsconfig.json` after `@nuxt/types` (Nuxt 2.9.0+) or `@nuxt/vue-app`.

```json{}[tsconfig.json]
{
  "compilerOptions": {
    "types": ["@nuxt/types", "@nuxtjs/sanity"]
  }
}
```
