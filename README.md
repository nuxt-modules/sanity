# @nuxtjs/sanity

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Github Actions CI][github-actions-ci-src]][github-actions-ci-href]
[![Codecov][codecov-src]][codecov-href]
[![License][license-src]][license-href]

> [Sanity](https://sanity.io/) integration for [NuxtJS](https://nuxtjs.org)

- [✨ &nbsp;Release Notes](https://sanity.nuxtjs.org/releases)
- [📖 &nbsp;Documentation](https://sanity.nuxtjs.org)

## Features

- Just bring your sanity.json - no additional configuration required
- Ultra-lightweight Sanity client
- Zero-config image component
- Supports GROQ syntax highlighting
- Full support for TypeScript

[📖 &nbsp;Read more](https://sanity.nuxtjs.org)

## Quick setup

1. Add `@nuxtjs/sanity` dependency to your project

```bash
yarn add @nuxtjs/sanity # or npm install @nuxtjs/sanity
```

2. Add `@nuxtjs/sanity/module` to the `buildModules` section of `nuxt.config.js`

```js
{
  buildModules: [
    '@nuxtjs/sanity/module',
  ],
  sanity: {
    // module options
  }
}
```

## Development

1. Clone this repository
2. Install dependencies using `yarn install`
3. Start development server using `yarn dev`

## License

[MIT License](./LICENSE)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/@nuxtjs/sanity/latest.svg
[npm-version-href]: https://npmjs.com/package/@nuxtjs/sanity
[npm-downloads-src]: https://img.shields.io/npm/dm/@nuxtjs/sanity.svg
[npm-downloads-href]: https://npmjs.com/package/@nuxtjs/sanity
[github-actions-ci-src]: https://github.com/nuxt-community/sanity-module/workflows/ci/badge.svg
[github-actions-ci-href]: https://github.com/nuxt-community/sanity-module/actions?query=workflow%3Aci
[codecov-src]: https://img.shields.io/codecov/c/github/nuxt-community/sanity-module.svg
[codecov-href]: https://codecov.io/gh/nuxt-community/sanity-module
[license-src]: https://img.shields.io/npm/l/@nuxtjs/sanity.svg
[license-href]: https://npmjs.com/package/@nuxtjs/sanity
