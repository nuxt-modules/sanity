# Sanity Movies Content Studio

Congratulations, you have now installed the Sanity Content Studio, an open source real-time content editing environment connected to the Sanity backend.

Now you can do the following things:

- [Read “getting started” in the docs](https://www.sanity.io/docs/introduction/getting-started?utm_source=readme)
- Check out one of the example frontends: [React](https://github.com/sanity-io/example-frontend-next-js) | [React Native](https://github.com/sanity-io/example-app-react-native) | [Vue](https://github.com/sanity-io/example-frontend-vue-js) | [PHP](https://github.com/sanity-io/example-frontend-silex-twig)
- [Join the community Slack](https://slack.sanity.io/?utm_source=readme)
- [Extend and build plugins](https://www.sanity.io/docs/content-studio/extending?utm_source=readme)

#### Import Sample Data (optional)

*Refactored from [sanity-template-nuxt-clean](https://github.com/sanity-io/sanity-template-nuxt-clean)*

You may want to start with some sample content and we've got you covered. Run this command from the root of your project to import the provided dataset (sample-data.tar.gz) into your Sanity project. This step is optional but can be helpful for getting started with development quickly.

This will activate the [Sanity Import CLI](https://www.sanity.io/docs/content-lake/importing-data#d183adde8ef9).

```shell
pnpm import-sample-data
```