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

- Just bring your sanity.json - no additional configuration required
- Ultra-lightweight Sanity client
- Zero-config image/file components + portable text renderer
- Supports GROQ syntax highlighting
- Nuxt 3 and Nuxt Bridge support

[📖 &nbsp;Read more](https://sanity.nuxtjs.org)

## Quick setup

1. Add `@nuxtjs/sanity` dependency to your project

```bash
yarn add @nuxtjs/sanity # or npm install @nuxtjs/sanity
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
[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD0AAAAoCAYAAABNefLBAAAAAXNSR0IArs4c6QAAA91JREFUaEPNWdtV20AQvSsVEDoIPoh8QwWBDkwFkApiCrCQ5QICFcSpIKQCoAL4DuJgOoAC2M0Zy8Y23pl9SEqyv9rH3J2rO3d3Fdpuv4s9JMkZgP586glSPUKvmLa9VOx8Knagddz9+ADKXFm+PSPV+/8L8PZAPxZbeE1uAWwzG3mNLD9sdZMjJ2sP9P2ogFJEa6GpI2TDy8hYWxvWDujHYhuvyaNHVNM5zZ89+nbWpR3QVUn/8YFXlMaMsHtWePXtqFNz0NW4D5ifQfGluuclarUwfgWwBWAKrS/wqbgLWsvSuRlot3hx8blFrSq/AzixTPAFWT5pArwZaFm8nuYZ+mAPUBA1mT2Ny188aJd4GXUI6ANB0e2i5sceN1OkGhJNE1m8fiHLa0dWleTEPlrXsYmaV+kDQJu6O7yOiT8u0y7xWhUq3qVRvOtUdbFnHeEUWd77i6BLqsl252XLXlVSRj4zAV4iy4/mrPAvfTQgsvyFZ9olXqneQ69YNx+uDM7+f4Dx7VIyo0QtDHQdPPlrqpu2CsjbTHmzFicwzre/AGCqAJZM8eR6GOiqJBOyODK+X+IGWc67slqVyVjYRY0P+Ala95HMNtveAkXNH7QsSICPy3IJoMQeF1MCRM0fdBUoXlxWZFHj2eNiSoCo+YGOES8OtEvUVse9Z09LTs0Nuol4ccB9DAiXOd/y18iRNREvPtsuUXuCrfTRfPUdXCNRkzPdhnjZgDdlTzU6BxQdOTebUnfYGe5L1UsG/TC+hTF7TJ24QHY28CyN692asqcWNart9tqtcIqd/JyLjQf9UA5g8I0Z+IJUb284L58daIs9VUlnbTpz2xo5NbqosF5L2UHXO0n+mnFeiD/It1X6CKooauoHsqHtEgJ20NV4AphjZhdl5yVlW1btcPZEitomaBf9tN6Puqfqij0RorYJujPx6og9EaK2DvpfiVcsexa/UqCoLUF3RT+aV6dXnZS+Vf0IELUl6K7Ei7/KpZDDxYu1tuzjYT1i5fhZg+5KvGTAtHJ86bOBlxP3doNagxZvNvl6x1ananQMlQx4Ss9Gxpc+bmGXqM03WUEWAYC8rDEhD24+b1pEa7pLsz/U1zFxPsHl+8g2c6Zq5tQUxBLlmj/6O09rt6BGLzobqHBKmTbNZgkeLf/H8n8ZvNjGAGNGBJp/gWi+xOoMdKM5EB/fXLayjXhmmfa5xWi+2A1SfeJ8ng15546LaaYlc/UWLWLc9FSDoS5hMPF6c3IJamwUy3EvMKpPsSzNCVFLKe5O239JpaYwauoFdHVWssDacKrrv76tZ6KekejJ4nz9B5NWGK+XC+AAAAAAAElFTkSuQmCC
[nuxt-href]: https://nuxt.com
