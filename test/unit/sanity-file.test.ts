import { mount } from '@vue/test-utils'

import { SanityFile } from '../../src/components/sanity-file'

const projectId = 'test-project'

describe('SanityFile', () => {
  it('provides a valid renderless component', () => {
    const wrapper = mount(
      {
        template: `
          <SanityFile asset-id="file-41773b5c55bc5414ab7554a75eefddf8e2e14524-txt">
            <template #default="{ src }">
              <a :href="src">Click here to read</a>
            </template>
          </SanityFile>
      `,
      },
      {
        mocks: {
          $sanity: {
            config: {
              projectId,
            },
          },
        },
        components: { SanityFile },
      },
    )

    expect(wrapper.html()).toMatchSnapshot()
  })

  it('allows injecting download params', () => {
    const wrapper = mount(
      {
        template: `
          <SanityFile asset-id="file-41773b5c55bc5414ab7554a75eefddf8e2e14524-txt" download="myfile.txt">
            <template #default="{ src }">
              <a :href="src">Click here to download</a>
            </template>
          </SanityFile>
      `,
      },
      {
        mocks: {
          $sanity: {
            config: {
              projectId,
            },
          },
        },
        components: { SanityFile },
      },
    )

    expect(wrapper.html()).toMatchSnapshot()
  })
})
