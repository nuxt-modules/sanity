### [0.3.8](https://github.com/nuxt-community/sanity-module/compare/0.3.7...0.3.8) (2020-10-10)


### Bug Fixes

* resolve `unexpected token` error ([ac9c52c](https://github.com/nuxt-community/sanity-module/commit/ac9c52cf4945e6a8f522e2a60e7cd1fbbd5a1307)), closes [#19](https://github.com/nuxt-community/sanity-module/issues/19)

### [0.3.7](https://github.com/nuxt-community/sanity-module/compare/0.3.6...0.3.7) (2020-10-10)


### Bug Fixes

* correctly detect `@sanity/client` ([0792049](https://github.com/nuxt-community/sanity-module/commit/07920495700120223254acf5aaa0d679db344266))

### [0.3.6](https://github.com/nuxt-community/sanity-module/compare/0.3.5...0.3.6) (2020-10-07)


### Bug Fixes

* correctly extend `@nuxt/types` ([7f54ba7](https://github.com/nuxt-community/sanity-module/commit/7f54ba7d114e132ec5c52a71e507b1d3c2d45b58))

### [0.3.5](https://github.com/nuxt-community/sanity-module/compare/0.3.4...0.3.5) (2020-10-06)


### Bug Fixes

* correct type error of renderless component ([b4679f7](https://github.com/nuxt-community/sanity-module/commit/b4679f731406c3405cbf8bbfd599cf7ae22265fb))

### [0.3.4](https://github.com/nuxt-community/sanity-module/compare/0.3.3...0.3.4) (2020-10-06)


### Features

* allow using scoped slots for full control of `<SanityImage>` ([c40313d](https://github.com/nuxt-community/sanity-module/commit/c40313d37933d9c601a30c7cce22ee4de44c5491))

### [0.3.3](https://github.com/nuxt-community/sanity-module/compare/0.3.2...0.3.3) (2020-09-27)


### Features

* add vetur auto-completion for `<SanityImage>` and `<SanityContent>` ([01ddb19](https://github.com/nuxt-community/sanity-module/commit/01ddb1916a43fb58d02164632af693366c941aea))

### [0.3.2](https://github.com/nuxt-community/sanity-module/compare/0.3.1...0.3.2) (2020-08-21)


### Bug Fixes

* read `sanity.json` at build time ([b3e804f](https://github.com/nuxt-community/sanity-module/commit/b3e804fd4ed9a0ea9c5e509575ed85144aa9e3d9))

### [0.3.1](https://github.com/nuxt-community/sanity-module/compare/0.3.0...0.3.1) (2020-08-21)


### Bug Fixes

* add default object for `additionalClients` ([9452722](https://github.com/nuxt-community/sanity-module/commit/9452722ce080a4e1525f9cde20901a6dc5361812))

## [0.3.0](https://github.com/nuxt-community/sanity-module/compare/0.2.2...0.3.0) (2020-08-21)


### Features

* add multiple sanity client capability ([0b04120](https://github.com/nuxt-community/sanity-module/commit/0b04120585db27e6336baa55a83d033f4f07f7ae)), closes [#2](https://github.com/nuxt-community/sanity-module/issues/2)
* allow using `runtimeConfig` to set sanity options ([8657d48](https://github.com/nuxt-community/sanity-module/commit/8657d4842e5d448c51079d696536633c6886dd19))


### Bug Fixes

* avoid accidentally including `@sanity/client` in bundle ([7dcbe39](https://github.com/nuxt-community/sanity-module/commit/7dcbe39a2b2cac598decdd0002abb3940d43ce57))
* prevent `chalk` and `consola` from being included in client build ([e16e297](https://github.com/nuxt-community/sanity-module/commit/e16e29727805227e7472f11e6fd1cfc00626fb56))

### [0.2.2](https://github.com/nuxt-community/sanity-module/compare/0.2.1...0.2.2) (2020-08-10)


### Bug Fixes

* build components in `cjs` format ([742cfa1](https://github.com/nuxt-community/sanity-module/commit/742cfa1b6bfe48ef28714f1a8949d3f7c647754f))

### [0.2.1](https://github.com/nuxt-community/sanity-module/compare/0.2.0...0.2.1) (2020-08-10)


### Bug Fixes

* correct import path for `<SanityContent>` helper ([2aa00c4](https://github.com/nuxt-community/sanity-module/commit/2aa00c49aea623c030f01390bd577217386b2c58))

## [0.2.0](https://github.com/nuxt-community/sanity-module/compare/0.1.0...0.2.0) (2020-08-09)


### Features

* ✨ add new `<SanityContent>` component to handle portable text ([0839b97](https://github.com/nuxt-community/sanity-module/commit/0839b97369dbd44826f707df6077aca50eaac789))
* allow local import of `<SanityImage>` ([762df3c](https://github.com/nuxt-community/sanity-module/commit/762df3c805ba89df3f96279d065ad4debc7323c0))


### Performance Improvements

* ⚡️ improve options dx and decrease final bundle size ([d1c4a76](https://github.com/nuxt-community/sanity-module/commit/d1c4a76c769c1479bcd319f9f4c6839c4a53832d))

## 0.1.0 (2020-08-08)


### Features

* initial sanity module for Nuxt ([0b204ee](https://github.com/nuxt-community/sanity-module/commit/0b204ee8b1d8fac241602bf7ad8180bbb534265b))

