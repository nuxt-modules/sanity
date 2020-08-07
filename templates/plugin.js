<%= options.client
  ? "import createClient from '@sanity/client'"
  : "import { createClient } from '@nuxtjs/sanity'"
%>

const options = JSON.parse('<%= options.sanityConfig %>')

/**
 * @type {import('@nuxt/types').Plugin}
 */
export default async (_ctx, inject) => {
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
