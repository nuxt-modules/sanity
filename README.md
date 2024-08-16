[![@nuxtjs/sanity](./docs/public/cover.jpg)](https://sanity.nuxtjs.org)

# Nuxt Sanity

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Codecov][codecov-src]][codecov-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]
[![Volta][volta-src]][volta-href]

> [Sanity](https://sanity.io/) integration for [Nuxt](https://nuxt.com)

- [✨ &nbsp;Release Notes](https://sanity.nuxtjs.org/releases)
- [📖 &nbsp;Documentation](https://sanity.nuxtjs.org)

## Features

- Just bring your `sanity.config.ts` - no additional configuration required
- Ultra-lightweight Sanity client
- Zero-config image/file components + portable text renderer
- Supports GROQ syntax highlighting
- Nuxt 3 and Nuxt Bridge support

[📖 &nbsp;Read more](https://sanity.nuxtjs.org)

## Quick setup

1. Add `@nuxtjs/sanity` dependency to your project

```bash
npx nuxi@latest module add sanity
```

2. Add `@nuxtjs/sanity` to the `modules` section of `nuxt.config.ts`

```js
{
  modules: [
    '@nuxtjs/sanity',
  ],
  sanity: {
    // module options
  }
}
```

**Note**: For Nuxt 2 support without Bridge, install `@nuxtjs/sanity@0.10.0` and follow the instructions at https://v0.sanity.nuxtjs.org.

## Development

1. Clone this repository
2. Install dependencies using `pnpm install`
3. Stub module with `pnpm dev:prepare`
3. Start development server using `pnpm dev`

## License

[MIT License](./LICENSE)

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/@nuxtjs/sanity/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/@nuxtjs/sanity
[npm-downloads-src]: https://img.shields.io/npm/dm/@nuxtjs/sanity.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/@nuxtjs/sanity
[codecov-src]: https://img.shields.io/codecov/c/github/nuxt-modules/sanity.svg?style=flat&colorA=18181B&colorB=28CF8D
[codecov-href]: https://codecov.io/gh/nuxt-modules/sanity
[license-src]: https://img.shields.io/npm/l/@nuxtjs/sanity.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://npmjs.com/package/@nuxtjs/sanity
[volta-src]: https://user-images.githubusercontent.com/904724/209143798-32345f6c-3cf8-4e06-9659-f4ace4a6acde.svg
[volta-href]: https://volta.net/nuxt-modules/sanity?utm_source=readme_nuxt_sanity
[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?&logo=nuxt.js
[nuxt-href]: https://nuxt.com
