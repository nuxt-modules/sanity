---
title: Quick start
description: 'Access text, images, and other media with Nuxt and the Sanity headless CMS.'
category: Getting started
position: 2
---

## Setup

1. **Install Sanity integration**

    <d-code-group>
    <d-code-block label="Yarn" active>

    ```bash
    yarn add @nuxtjs/sanity
    ```

    </d-code-block>
    <d-code-block label="NPM">

    ```bash
    npm install @nuxtjs/sanity --save
    ```

    </d-code-block>
    </d-code-group>

2. **Enable the module in your Nuxt configuration**

    <d-code-group>
    <d-code-block label="Nuxt 2.9+" active>

    ```js{}[nuxt.config.js]
    {
      buildModules: ['@nuxtjs/sanity']
    }
    ```

    </d-code-block>
    <d-code-block label="Nuxt < 2.9">

    ```js{}[nuxt.config.js]
    {
      modules: ['@nuxtjs/sanity']
    }
    ```

    </d-code-block>
    </d-code-group>

3. **Add Sanity configuration**

   `@nuxtjs/sanity` will look for a `sanity.json` file in your project root directory. Just copy over the `sanity.json` from your CMS - and you're fully configured!

   Alternatively, you can pass in an object in your Nuxt config with key details.

   ```js{}[nuxt.config.js]
   {
     sanity: {
       projectId: 'myProject'
     }
   }
   ```

   <d-alert type="info">You can find more about configuring `@nuxtjs/sanity` [here](/configuration).</d-alert>

4. **You're good to go!**

   Check out [how to use Sanity](/usage).

## TypeScript

`@nuxtjs/sanity` offers type definitions. Just add an entry in `tsconfig.json`.

<d-code-group>
  <d-code-block label="Nuxt 2.9+" active>

```json{}[tsconfig.json]
{
  "compilerOptions": {
    "types": ["@nuxt/types", "@nuxtjs/sanity"]
  }
}
```

  </d-code-block>
  <d-code-block label="Nuxt < 2.9">

```json{}[tsconfig.json]
{
  "compilerOptions": {
    "types": ["@nuxt/vue-app", "@nuxtjs/sanity"]
  }
}
```

  </d-code-block>

</d-code-group>
