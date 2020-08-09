import { mount } from '@vue/test-utils'

import { SanityImage } from '../../templates/sanity-image'

const getWrapper = propsData => mount(SanityImage, { propsData })

describe('SanityImage', () => {
  test('it parses asset IDs correctly', () => {
    const wrapper = getWrapper({
      assetId: 'image-7aa06723bb01a7a79055b6d6f5be80329a0e5b58-780x1170-jpg'
    })

    expect(wrapper.attributes().src).toBe(
      'https://cdn.sanity.io/images/<%= options.projectId %>/<%= options.dataset %>/7aa06723bb01a7a79055b6d6f5be80329a0e5b58-780x1170.jpg'
    )
  })

  test('it correctly adds query params', () => {
    const wrapper = getWrapper({
      assetId: 'image-7aa06723bb01a7a79055b6d6f5be80329a0e5b58-780x1170-jpg',
      w: 20,
      h: '21'
    })

    expect(wrapper.attributes().src).toBe(
      'https://cdn.sanity.io/images/<%= options.projectId %>/<%= options.dataset %>/7aa06723bb01a7a79055b6d6f5be80329a0e5b58-780x1170.jpg?h=21&w=20'
    )
  })
})
