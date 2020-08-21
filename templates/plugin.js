import Vue from 'vue'
import defu from 'defu'

<%= options.client
  ? "import createClient from '@sanity/client'"
  : "import { createClient } from '@nuxtjs/sanity'"
%>

<% if (options.components.imageHelper) { %>
import { SanityImage } from './sanity-image'
Vue.component('SanityImage', SanityImage)
<% } %>

<% if (options.components.contentHelper) { %>
import { SanityContent } from '@nuxtjs/sanity/dist/sanity-content'
Vue.component('SanityContent', SanityContent)
<% } %>

const _options = JSON.parse('<%= options.sanityConfig %>')

/**
 * @type {import('@nuxt/types').Plugin}
 */
export default async ({ $config }, inject) => {
  const options = defu($config.sanity || {}, _options)
  inject('sanity', {
    client: createClient(options),
    fetch(...args) {
      return this.client.fetch(...args)
    },
    setToken(token) {
      this.client = createClient({ ...options, token })
    }
  })
}
