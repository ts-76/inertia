import { expect, test } from '@playwright/test'
import { createInertiaApp, Head, usePage } from '../packages/hono-jsx-dom/src/index'
import { createElement } from '../packages/hono-jsx-dom/node_modules/hono/dist/jsx/index.js'
import { renderToString } from '../packages/hono-jsx-dom/node_modules/hono/dist/jsx/dom/server.js'
import { requests } from './support'

test.setTimeout(15 * 1000)

test('SSR render returns head and body with the initial page script', async () => {
  const response = await createInertiaApp({
    page: {
      component: 'SSR/Home',
      props: {},
      url: '/ssr-home',
      version: 'test',
    },
    render: renderToString,
    resolve: () => () => createElement('div', {}, 'SSR Home'),
    setup: ({ props }) => {
      props.onHeadUpdate?.(['<title data-inertia="">Hono SSR Title</title>'])

      return createElement('div', {}, 'SSR Home')
    },
  })

  expect(response.head).toContain('<title data-inertia="">Hono SSR Title</title>')
  expect(response.body).toContain('data-page="app"')
  expect(response.body).toContain('data-server-rendered="true"')
  expect(response.body).toContain('SSR Home')
})

test('SSR render mounts the resolved page component without custom setup', async () => {
  const response = await createInertiaApp({
    page: {
      component: 'SSR/Default',
      props: {
        message: 'Default SSR body',
      },
      url: '/ssr-default',
      version: 'test',
    },
    render: renderToString,
    resolve: () => ({ message }: { message: string }) => createElement('main', {}, message),
  })

  expect(response.body).toContain('Default SSR body')
})

test('SSR render provides page context to usePage', async () => {
  const Page = () => {
    const page = usePage<{ message: string }>()

    return createElement('main', {}, page.props.message)
  }

  const response = await createInertiaApp({
    page: {
      component: 'SSR/UsePage',
      props: {
        message: 'SSR usePage body',
      },
      url: '/ssr-use-page',
      version: 'test',
    },
    render: renderToString,
    resolve: () => Page,
  })

  expect(response.body).toContain('SSR usePage body')
})

test('SSR render applies Head and layout options', async () => {
  const Page = () =>
    createElement(
      'main',
      {},
      createElement(Head, { title: 'SSR Layout Head' }),
      createElement('h1', {}, 'SSR Layout Page'),
    )

  const Layout = ({ children }: { children?: unknown }) => createElement('section', { 'data-testid': 'ssr-layout' }, children)

  const response = await createInertiaApp({
    page: {
      component: 'SSR/LayoutHead',
      props: {},
      url: '/ssr-layout-head',
      version: 'test',
    },
    render: renderToString,
    resolve: () => Page,
    layout: () => Layout,
  })

  expect(response.head).toContain('<title data-inertia="">SSR Layout Head</title>')
  expect(response.body).toContain('data-testid="ssr-layout"')
  expect(response.body).toContain('SSR Layout Page')
})

test('boots from script JSON and renders the initial page', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Hono JSX DOM Home' })).toBeVisible()
  await expect(page.getByText('Example: FooBar')).toBeVisible()
})

test('supports Head, layout, remember, form state, deferred, visible, poll, and prefetch helpers', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle('Hono JSX DOM Test Home alpha')
  await expect(page.locator('head meta[name="description"]')).toHaveAttribute('content', 'Hono head alpha')
  await expect(page.locator('head meta[name="hono-head-variant"]')).toHaveAttribute('content', 'alpha')
  await expect(page.locator('head meta[name="hono-optional-head"]')).toHaveAttribute('content', 'present')
  await page.getByRole('button', { name: 'Toggle head' }).click()
  await expect(page).toHaveTitle('Hono JSX DOM Test Home beta')
  await expect(page.locator('head meta[name="description"]')).toHaveAttribute('content', 'Hono head beta')
  await expect(page.locator('head meta[name="hono-head-variant"]')).toHaveAttribute('content', 'beta')
  await expect(page.locator('head meta[name="hono-head-variant"]')).toHaveCount(1)
  await page.getByRole('button', { name: 'Toggle optional head' }).click()
  await expect(page.locator('head meta[name="hono-optional-head"]')).toHaveCount(0)
  await expect(page.getByTestId('home-layout')).toBeVisible()
  await expect(page.getByTestId('deferred-fallback')).toHaveText('Deferred fallback')
  await page.getByRole('button', { name: 'Load deferred example' }).click()
  await expect(page.getByTestId('deferred-example')).toHaveText('Deferred: Loaded FooBar')
  await expect(page.getByTestId('visible-example')).toHaveText('Visible: FooBar')
  await expect(page.getByTestId('prefetch-state')).toContainText(/prefetched|not-prefetched/)

  await page.getByTestId('remembered-input').fill('remember me')
  await page.getByRole('link', { name: 'Target page' }).click()
  await expect(page).toHaveURL('/hono/target')
  await page.goBack()
  await expect(page).toHaveURL('/')
  await expect(page.getByTestId('remembered-input')).toHaveValue('remember me')

  await page.getByTestId('form-name').fill('Ada')
  await expect(page.getByTestId('form-dirty')).toHaveText('dirty')
  await page.getByRole('button', { name: 'Reset form' }).click()
  await expect(page.getByTestId('form-dirty')).toHaveText('clean')

  await expect(page.getByRole('button', { name: 'Start poll' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Stop poll' })).toBeVisible()
})

test('Form component submits form data through the core router', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByTestId('form-component-processing')).toHaveText('idle')
  await expect(page.getByTestId('form-component-dirty')).toHaveText('clean')
  await page.getByTestId('form-component-name').fill('Grace Hopper')
  await expect(page.getByTestId('form-component-dirty')).toHaveText('dirty')
  await page.getByRole('button', { name: 'Submit Form component' }).click()

  await expect(page).toHaveURL('/dump/post')
  const dump = JSON.parse((await page.locator('pre').textContent()) || '{}')
  expect(dump.method).toBe('post')
  expect(dump.form).toEqual({ formName: 'Grace Hopper' })
})

test('Form component scopes validation errors by errorBag', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByTestId('form-component-has-errors')).toHaveText('no-errors')
  await page.getByRole('button', { name: 'Submit error Form component' }).click()

  await expect(page).toHaveURL('/hono/form/errors')
  await expect(page.getByTestId('form-component-has-errors')).toHaveText('has-errors')
  await expect(page.getByTestId('form-component-error-message')).toHaveText('The formName field is required.')
})

test('Form component handles success reset defaults transform processing and file upload', async ({ page }) => {
  await page.goto('/hono/form/advanced')

  await page.getByTestId('advanced-name').fill('Updated')
  await page.getByTestId('advanced-file').setInputFiles({
    name: 'avatar.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('avatar'),
  })
  await expect(page.getByTestId('advanced-dirty')).toHaveText('dirty')
  await page.getByRole('button', { name: 'Submit advanced success' }).click()
  await expect(page.locator('form').first()).toHaveAttribute('inert', '')
  await expect(page.getByTestId('advanced-processing')).toHaveText('processing')

  await expect(page).toHaveURL('/hono/form/advanced-success')
  await expect(page.getByTestId('advanced-success')).toHaveText('successful')
  await expect(page.getByTestId('advanced-recent')).toHaveText('recent')
  await expect(page.getByTestId('advanced-name')).toHaveValue('')
  await expect(page.getByTestId('advanced-dirty')).toHaveText('clean')
  const submitted = JSON.parse((await page.getByTestId('advanced-submitted').textContent()) || '{}')
  expect(submitted.name).toBe('Updated')
  expect(submitted.transformed).toBe('yes')
  await expect(page.getByTestId('advanced-upload')).toHaveText('avatar.txt')
})

test('Form component resets selected fields after scoped errors', async ({ page }) => {
  await page.goto('/hono/form/advanced')

  await page.getByTestId('advanced-error-name').fill('Bad value')
  await page.getByRole('button', { name: 'Submit advanced error' }).click()

  await expect(page).toHaveURL('/hono/form/advanced-error')
  await expect(page.getByTestId('advanced-error-name')).toHaveValue('')
  await expect(page.getByTestId('advanced-error-dirty')).toHaveText('clean')
  await expect(page.getByTestId('advanced-error-message')).toHaveText('Advanced name is required.')
})

test('Form component resets array fields and checkboxes after success', async ({ page }) => {
  await page.goto('/hono/form/fields')

  await page.getByTestId('field-tag-0').fill('gamma')
  await page.getByTestId('field-tag-1').fill('delta')
  await page.getByTestId('field-active').uncheck()
  await page.getByTestId('field-active').check()
  await expect(page.getByTestId('field-dirty')).toHaveText('dirty')
  await page.getByRole('button', { name: 'Submit field form' }).click()

  await expect(page).toHaveURL('/hono/form/fields-success')
  await expect(page.getByTestId('field-tag-0')).toHaveValue('')
  await expect(page.getByTestId('field-tag-1')).toHaveValue('')
  await expect(page.getByTestId('field-active')).not.toBeChecked()
  await expect(page.getByTestId('field-dirty')).toHaveText('clean')
  const submitted = JSON.parse((await page.getByTestId('field-submitted').textContent()) || '{}')
  expect(submitted.tags).toEqual(['gamma', 'delta'])
  expect(submitted.active).toBe('yes')
})

test('useForm can cancel an in-flight visit and reset processing state', async ({ page }) => {
  await page.goto('/hono/use-form/cancel')

  await page.getByTestId('cancel-name').fill('Cancel me')
  await page.getByRole('button', { name: 'Submit cancellable form' }).click()
  await expect(page.getByTestId('cancel-processing')).toHaveText('processing')
  await page.getByRole('button', { name: 'Cancel form' }).click()

  await expect(page).toHaveURL('/hono/use-form/cancel')
  await expect(page.getByTestId('cancel-processing')).toHaveText('idle')
  await expect(page.getByTestId('cancel-state')).toHaveText('cancelled')
  await expect(page.getByTestId('cancel-finished')).toHaveText('finished')
})

test('Head replaces duplicate head-key entries and removes stale entries', async ({ page }) => {
  await page.goto('/hono/head-keys')

  await expect(page.locator('head meta[name="hono-dedup"]')).toHaveAttribute('content', 'first')
  await expect(page.locator('head meta[name="hono-dedup"]')).toHaveCount(1)
  await expect(page.locator('head meta[name="hono-extra"]')).toHaveAttribute('content', 'present')
  await page.getByRole('button', { name: 'Swap head keys' }).click()
  await expect(page.locator('head meta[name="hono-dedup"]')).toHaveAttribute('content', 'second')
  await expect(page.locator('head meta[name="hono-dedup"]')).toHaveCount(1)
  await expect(page.locator('head meta[name="hono-extra"]')).toHaveCount(0)
})

test('layout props update shared and named layouts and reset on non-preserved navigation', async ({ page }) => {
  await page.goto('/hono/layout-props')

  await expect(page.getByTestId('named-layout')).toBeVisible()
  await expect(page.getByTestId('named-layout-shared')).toHaveText('shared layout value')
  await expect(page.getByTestId('named-layout-named')).toHaveText('named layout value')
  await page.getByRole('link', { name: 'Preserve layout props' }).click()
  await expect(page).toHaveURL('/hono/layout-props?preserve=1')
  await expect(page.getByTestId('named-layout-shared')).toHaveText('shared layout value')
  await page.getByRole('link', { name: 'Reset layout props' }).click()
  await expect(page).toHaveURL('/hono/use-page')
  await expect(page.getByTestId('default-layout-shared')).toHaveText('no-shared-layout-props')
})

test('visit helpers reload when visible poll repeatedly and reflect prefetch state', async ({ page }) => {
  await page.goto('/hono/visit-helpers')

  await expect(page.getByTestId('prefetch-state')).toHaveText('idle')
  await page.getByRole('button', { name: 'Trigger prefetch' }).click()
  await expect(page.getByTestId('prefetch-state')).toHaveText(/prefetching|prefetched/)
  await expect(page.getByTestId('prefetch-state')).toHaveText('prefetched')
  await page.getByRole('button', { name: 'Flush prefetch' }).click()
  await expect(page.getByTestId('prefetch-state')).toHaveText('idle')

  await expect(page.getByTestId('poll-count')).toHaveText('0')
  await page.getByRole('button', { name: 'Start helper poll' }).click()
  await expect(page.getByTestId('poll-count')).toHaveText(/[1-9]\d*/)
  await page.getByRole('button', { name: 'Stop helper poll' }).click()
  await expect(page.getByRole('button', { name: 'Start helper poll' })).toBeVisible()

  await expect(page.getByTestId('visible-helper-fallback')).toHaveText('Waiting visible helper')
  await page.getByTestId('visible-helper-fallback').scrollIntoViewIfNeeded()
  await expect(page.getByTestId('visible-helper-value')).toHaveText('Visible loaded')
})

test('navigates through Link without a full page reload', async ({ page }) => {
  await page.goto('/')
  requests.listen(page)

  await page.getByRole('link', { name: 'Target page' }).click()

  await expect(page).toHaveURL('/hono/target')
  await expect(page.getByText('Hello from the target page')).toBeVisible()

  const visit = requests.requests.find((request) => request.url().includes('/hono/target'))
  expect(visit?.headers()['x-inertia']).toBe('true')
})

test('usePage exposes the current page props after navigation', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('link', { name: 'Use page props' }).click()

  await expect(page).toHaveURL('/hono/use-page')
  await expect(page.getByTestId('default-layout')).toBeVisible()
  await expect(page.getByTestId('page-name')).toHaveText('Hono User')
})

test('InfiniteScroll renders manual controls and fetches the next page', async ({ page }) => {
  await page.goto('/infinite-scroll/manual')

  await expect(page.getByRole('heading', { name: 'Infinite Scroll Manual' })).toBeVisible()
  await expect(page.getByText('User 1', { exact: true })).toBeVisible()
  await expect(page.getByText('User 15', { exact: true })).toBeVisible()
  await expect(page.getByText('User 16', { exact: true })).not.toBeVisible()

  await page.getByRole('button', { name: 'Fetch next' }).click()

  await expect(page.getByText('User 16', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Fetch next' }).click()
  await expect(page.getByText('User 31', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'No more users' })).toBeDisabled()
})

test('InfiniteScroll reverse mode fetches previous pages and exposes loading slots', async ({ page }) => {
  await page.goto('/infinite-scroll/manual-reverse?page=2')

  await expect(page.getByRole('heading', { name: 'Infinite Scroll Manual Reverse' })).toBeVisible()
  await expect(page.getByText('User 25', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Fetch previous' }).click()
  await expect(page.getByTestId('infinite-reverse-loading')).toBeVisible()
  await expect(page.getByText('User 40', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'No previous users' })).toBeDisabled()
})

test('Link sends GET data as query parameters', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('link', { name: 'GET dump' }).click()

  await expect(page).toHaveURL('/dump/get?foo=bar')
  const dump = JSON.parse((await page.locator('pre').textContent()) || '{}')
  expect(dump.query).toEqual({ foo: 'bar' })
  expect(dump.method).toBe('get')
})

test('Link renders non-GET methods as buttons and sends the selected method', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('button', { name: 'POST dump' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'POST dump' })).not.toBeVisible()

  await page.getByRole('button', { name: 'POST dump' }).click()

  await expect(page).toHaveURL('/dump/post')
  const dump = JSON.parse((await page.locator('pre').textContent()) || '{}')
  expect(dump.form).toEqual({ foo: 'post' })
  expect(dump.method).toBe('post')
})

test('Link forwards partial reload options to the core router', async ({ page }) => {
  await page.goto('/hono/partial')
  requests.listen(page)

  await page.getByRole('link', { name: 'Only message' }).click()

  await expect(page).toHaveURL('/hono/partial?count=1')
  await expect(page.getByTestId('message')).toHaveText('Message 2')

  const visit = requests.requests.find((request) => request.url().includes('/hono/partial?count=1'))
  expect(visit?.headers()['x-inertia-partial-component']).toBe('Hono/Partial')
  expect(visit?.headers()['x-inertia-partial-data']).toBe('headers,message')
})
