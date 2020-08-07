import { setupTest, createPage } from '@nuxtjs/module-test-utils'

describe('module', () => {
  // eslint-disable-next-line
  const ctx = setupTest({
    __dirname,
    browser: true,
    fixture: '../example',
  })

  test('Sanity image builder works', async () => {
    const page = await createPage('/')
    const html = await page.getHtml()
    expect(html).toContain(
      'https://cdn.sanity.io/images/j1o4tmjp/production/7aa06723bb01a7a79055b6d6f5be80329a0e5b58-780x1170.jpg?auto=format&amp;w=128'
    )
  })

  test('CMS items are fetched', async () => {
    const page = await createPage('/')
    const html = await page.getHtml()
    expect(html).toContain('Guardians of the Galaxy')
  })

  test('Can view single film page', async () => {
    const page = await createPage('/movie/alien')
    const html = await page.getHtml()
    expect(html).toContain('Arthur Dallas')
  })
})
