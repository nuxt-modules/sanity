### [0.9.4](https://github.com/nuxt-community/sanity-module/compare/0.9.3...0.9.4) (2021-05-15)


### Bug Fixes

* don't set empty keys on marks ([cefdaaa](https://github.com/nuxt-community/sanity-module/commit/cefdaaa453bef3b7dc76c5d6977a87364b68ff36)), closes [#116](https://github.com/nuxt-community/sanity-module/issues/116)

### [0.9.3](https://github.com/nuxt-community/sanity-module/compare/0.9.2...0.9.3) (2021-05-15)


### Bug Fixes

* add missing blockquote style ([#144](https://github.com/nuxt-community/sanity-module/issues/144)) ([b2e55d8](https://github.com/nuxt-community/sanity-module/commit/b2e55d896a12aa428aa49c2f761b759a3402b78b))

### [0.9.2](https://github.com/nuxt-community/sanity-module/compare/0.9.1...0.9.2) (2021-04-23)

### [0.9.1](https://github.com/nuxt-community/sanity-module/compare/0.9.0...0.9.1) (2021-04-14)


### Bug Fixes

* don't break if no `apiVersion` is set ([0023bfe](https://github.com/nuxt-community/sanity-module/commit/0023bfec6578b0183fe92354d3af4397bc8c7f2d)), closes [#120](https://github.com/nuxt-community/sanity-module/issues/120)

## [0.9.0](https://github.com/nuxt-community/sanity-module/compare/0.8.0...0.9.0) (2021-04-11)


### Features

* add `<SanityFile>` component to assist with auto-generating file URLs ([0b2d353](https://github.com/nuxt-community/sanity-module/commit/0b2d35391433752b57085a852abc859a49ece803)), closes [#70](https://github.com/nuxt-community/sanity-module/issues/70)


### Bug Fixes

* list rendering fixes for SanityContent ([db4408a](https://github.com/nuxt-community/sanity-module/commit/db4408ad3fb36a0ba690d6aaa129636b72bd1705)), closes [#102](https://github.com/nuxt-community/sanity-module/issues/102)

## [0.8.0](https://github.com/nuxt-community/sanity-module/compare/0.7.1...0.8.0) (2021-03-31)


### ⚠ BREAKING CHANGES

* `@nuxtjs/sanity/module` is now how the module should be imported in `nuxt.config`

### Features

* support sanity `apiVersion` option ([6a2c956](https://github.com/nuxt-community/sanity-module/commit/6a2c9569f079bdce222dbcd9c37fefec0c40866d))


### Bug Fixes

* add entrypoint for pre-exports support ([a053822](https://github.com/nuxt-community/sanity-module/commit/a053822dfee85ae4b9ffd129a67a01b2faa988ec))


### Code Refactoring

* change how library is imported ([#101](https://github.com/nuxt-community/sanity-module/issues/101)) ([21c4fa9](https://github.com/nuxt-community/sanity-module/commit/21c4fa9c30edc7a9b5601b1d8529ce6f599269ae))

### [0.7.1](https://github.com/nuxt-community/sanity-module/compare/0.7.0...0.7.1) (2021-02-16)


### Bug Fixes

* exclude .d.ts files from `@nuxt/components` treatment ([df53978](https://github.com/nuxt-community/sanity-module/commit/df53978cd31d0ffd54760b6ca88737da479bdb46)), closes [#68](https://github.com/nuxt-community/sanity-module/issues/68)

## [0.7.0](https://github.com/nuxt-community/sanity-module/compare/0.6.2...0.7.0) (2021-01-31)


### ⚠ BREAKING CHANGES

* change minimum supported node version to 12

### Bug Fixes

* exclude `upath` from client bundle ([88b7d58](https://github.com/nuxt-community/sanity-module/commit/88b7d5871879f369e0b759513c7b23796bfe1f33)), closes [#66](https://github.com/nuxt-community/sanity-module/issues/66)


### Miscellaneous Chores

* change minimum supported node version to 12 ([adcde28](https://github.com/nuxt-community/sanity-module/commit/adcde28c292f23bdfb052ce1b0862be6f922f079))

### [0.6.2](https://github.com/nuxt-community/sanity-module/compare/0.6.1...0.6.2) (2021-01-20)


### Bug Fixes

* export types for components ([dab55f2](https://github.com/nuxt-community/sanity-module/commit/dab55f2776631749e8235043055320430cf0cda8))

### [0.6.1](https://github.com/nuxt-community/sanity-module/compare/0.6.0...0.6.1) (2021-01-18)


### Bug Fixes

* add default exports for compatibility with `@nuxt/components` ([d48f61a](https://github.com/nuxt-community/sanity-module/commit/d48f61ab205b3126c5ba788a1a418d20d35a24d3)), closes [#51](https://github.com/nuxt-community/sanity-module/issues/51)
* hotfix to use backwards-compatible imports ([f36a3c4](https://github.com/nuxt-community/sanity-module/commit/f36a3c43a7996c66acd0a68d8145f6e411a18788)), closes [#64](https://github.com/nuxt-community/sanity-module/issues/64)

## [0.6.0](https://github.com/nuxt-community/sanity-module/compare/0.5.0...0.6.0) (2021-01-17)


### Features

* re-enable autoregistration of components ([1af262e](https://github.com/nuxt-community/sanity-module/commit/1af262e13281df7f45ad6ca92ed4332fc182a50e)), closes [#53](https://github.com/nuxt-community/sanity-module/issues/53) [#51](https://github.com/nuxt-community/sanity-module/issues/51)


### Bug Fixes

* correctly generate url params for sanity images ([cb9c223](https://github.com/nuxt-community/sanity-module/commit/cb9c2233879b33d21d3c1e958df9e3d95a694ecf)), closes [#63](https://github.com/nuxt-community/sanity-module/issues/63)
* get `<SanityImage>` config from injected config ([4d5684f](https://github.com/nuxt-community/sanity-module/commit/4d5684f961b23e606f1bfaf2f254d3a887d1982b))
* improve windows compatibility ([6efe29a](https://github.com/nuxt-community/sanity-module/commit/6efe29a85548110691baadda78550e334b7f42f9))
* use nuxt resolver to suppress warnings about missing dependency ([b0d7222](https://github.com/nuxt-community/sanity-module/commit/b0d7222e937d46b120eb485e3adae38f986e9b5e)), closes [#33](https://github.com/nuxt-community/sanity-module/issues/33)

## [0.5.0](https://github.com/nuxt-community/sanity-module/compare/0.4.2...0.5.0) (2021-01-08)


### Features

* disable cdn when enablePreview is called ([137149a](https://github.com/nuxt-community/sanity-module/commit/137149a2e689a7f7be53701a4e76e00ff1eca959)), closes [#45](https://github.com/nuxt-community/sanity-module/issues/45)


### Bug Fixes

* don't fail when no sanity object exists in nuxt.config.js ([f5ab953](https://github.com/nuxt-community/sanity-module/commit/f5ab953d47daad2458cbec6ff258efaeb1ff1d4a)), closes [#62](https://github.com/nuxt-community/sanity-module/issues/62)

### [0.4.2](https://github.com/nuxt-community/sanity-module/compare/0.4.0...0.4.2) (2020-11-18)


### Bug Fixes

* correctly use `q` prop in `<SanityImage>` ([#52](https://github.com/nuxt-community/sanity-module/issues/52)) ([7f5eeba](https://github.com/nuxt-community/sanity-module/commit/7f5eebae6e449c224ce1e2dd02c86d4f9e712990))
* temporarily disable autoregistration of components ([b5abd8d](https://github.com/nuxt-community/sanity-module/commit/b5abd8d76fb9ade8443ff9916802d691fccb8f7a)), closes [#51](https://github.com/nuxt-community/sanity-module/issues/51)

## [0.4.0](https://github.com/nuxt-community/sanity-module/compare/0.3.11...0.4.0) (2020-11-11)


### Features

* expose generated sanity config within nuxt config for later use ([0b4ebe8](https://github.com/nuxt-community/sanity-module/commit/0b4ebe89cc2acfad8b629551fe9311b3424f5e35))
* use `@nuxt/components` for auto-registration of helper components ([4ea5796](https://github.com/nuxt-community/sanity-module/commit/4ea57969e562435a3e69e54d5c97b575fab4bd91))


### Bug Fixes

* add name to `<SanityImage>` component for better DX ([8d581ce](https://github.com/nuxt-community/sanity-module/commit/8d581ce2493c77e9f96a897c61beb075e80b7b3a))
* correctly handle vue keys from portable text ([9e6ca61](https://github.com/nuxt-community/sanity-module/commit/9e6ca617a4355113b6d34abf7a275f06f59271bc))

### [0.3.11](https://github.com/nuxt-community/sanity-module/compare/0.3.10...0.3.11) (2020-10-27)


### Bug Fixes

* set Content-Type header for POST query ([c251a21](https://github.com/nuxt-community/sanity-module/commit/c251a21318a1da95f5441d2fe9a11d0e9e666411))

### [0.3.10](https://github.com/nuxt-community/sanity-module/compare/0.3.9...0.3.10) (2020-10-27)


### Features

* make POST requests for large queries ([12c7bb1](https://github.com/nuxt-community/sanity-module/commit/12c7bb14ef6a1121eea1775ff1beb55ad288ae0e)), closes [/www.sanity.io/docs/http-query#the-post-form-J0Wj7](https://github.com/nuxt-community//www.sanity.io/docs/http-query/issues/the-post-form-J0Wj7)


### Performance Improvements

* use built-in `String.raw` if available ([0da5573](https://github.com/nuxt-community/sanity-module/commit/0da55733ba6bc3a61fc892961980f51ebdbe5bb7))

### [0.3.9](https://github.com/nuxt-community/sanity-module/compare/0.3.8...0.3.9) (2020-10-11)


### Features

* expose sanity configuration as `$sanity.config` ([35f3e92](https://github.com/nuxt-community/sanity-module/commit/35f3e92255911244ac77a11a8c71bbe5ef84a08b)), closes [#19](https://github.com/nuxt-community/sanity-module/issues/19)

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

