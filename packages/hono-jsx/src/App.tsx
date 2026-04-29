import {
  createHeadManager,
  isPropsObject,
  isPropsObjectOrCallback,
  normalizeLayouts,
  router,
  type Page,
  type PageHandler,
  type PageProps,
} from '@inertiajs/core'
import { createElement, isValidElement, useEffect, useMemo, useState, useSyncExternalStore } from 'hono/jsx'
import HeadContext from './HeadContext'
import { resetLayoutProps, store } from './layoutProps'
import PageContext from './PageContext'
import type { InertiaAppProps, ResolvedComponent } from './types'

function isComponent(value: unknown): value is ResolvedComponent {
  return typeof value === 'function'
}

function isRenderFunction(value: unknown): boolean {
  return typeof value === 'function' && (value as Function).length === 1 && typeof (value as Function).prototype === 'undefined'
}

function isLayoutResolver(value: unknown): boolean {
  return typeof value === 'function' && (value as Function).length <= 1 && typeof (value as Function).prototype === 'undefined'
}

let currentIsInitialPage = true
let routerIsInitialized = false
let swapComponent: PageHandler<ResolvedComponent> = async () => {
  currentIsInitialPage = false
}

type CurrentPage = {
  component: ResolvedComponent | null
  page: Page
  key: number | null
}

const emptySnapshot = {
  shared: {} as Record<string, unknown>,
  named: {} as Record<string, Record<string, unknown>>,
}

export default function App<SharedProps extends PageProps = PageProps>({
  children,
  initialPage,
  initialComponent,
  resolveComponent,
  titleCallback,
  onHeadUpdate,
  defaultLayout,
}: InertiaAppProps<SharedProps>) {
  const [current, setCurrent] = useState<CurrentPage>({
    component: initialComponent || null,
    page: { ...initialPage, flash: initialPage.flash ?? {} },
    key: null,
  })

  const headManager = useMemo(() => {
    return createHeadManager(
      typeof window === 'undefined',
      titleCallback || ((title) => title),
      onHeadUpdate || (() => {}),
    )
  }, [])

  const dynamicLayoutProps = useSyncExternalStore(store.subscribe, store.get, () => emptySnapshot)

  if (!routerIsInitialized) {
    router.init<ResolvedComponent>({
      initialPage,
      resolveComponent: resolveComponent!,
      swapComponent: async (args) => swapComponent(args),
      onFlash: (flash) => {
        setCurrent((current) => ({
          ...current,
          page: { ...current.page, flash },
        }))
      },
    })

    routerIsInitialized = true
  }

  useEffect(() => {
    swapComponent = async ({ component, page, preserveState }) => {
      if (currentIsInitialPage) {
        currentIsInitialPage = false
        return
      }

      if (!preserveState) {
        resetLayoutProps()
      }

      setCurrent((current) => ({
        component,
        page,
        key: preserveState ? current.key : Date.now(),
      }))
    }

    router.on('navigate', () => headManager.forceUpdate())
  }, [])

  const Component = current.component

  if (!Component) {
    return (
      <HeadContext.Provider value={headManager}>
        <PageContext.Provider value={current.page}>{null}</PageContext.Provider>
      </HeadContext.Provider>
    )
  }

  const renderChildren =
    children ||
    (({ Component, props, key }: { Component: ResolvedComponent; props: PageProps; key: number | null }) => {
      const child = createElement(Component, { key, ...props })

      let effectiveLayout: unknown
      let callbackProps: Record<string, unknown> | null = null
      const layoutValue = Component.layout

      if (isLayoutResolver(layoutValue)) {
        const result = (layoutValue as Function)(props)

        if (isValidElement(result)) {
          return (layoutValue as Function)(child)
        }

        if (isPropsObjectOrCallback(result, isComponent)) {
          effectiveLayout = defaultLayout?.(current.page.component, current.page)
          callbackProps = result as Record<string, unknown>
        } else {
          effectiveLayout = result
        }
      } else if (isPropsObject(layoutValue, isComponent)) {
        effectiveLayout = defaultLayout?.(current.page.component, current.page)
        callbackProps = layoutValue as unknown as Record<string, unknown>
      } else {
        effectiveLayout = layoutValue ?? defaultLayout?.(current.page.component, current.page)
      }

      let layouts = normalizeLayouts(
        effectiveLayout,
        isComponent,
        layoutValue && !callbackProps ? isRenderFunction : undefined,
      )

      if (callbackProps) {
        layouts = layouts.map((layout) => ({ ...layout, props: { ...layout.props, ...callbackProps } }))
      }

      if (layouts.length > 0) {
        return layouts.reduceRight((childNode: any, layout: any) => {
          return createElement(
            layout.component,
            {
              ...props,
              ...layout.props,
              ...dynamicLayoutProps.shared,
              ...(layout.name ? dynamicLayoutProps.named[layout.name] || {} : {}),
            },
            childNode as any,
          )
        }, child as any)
      }

      return child
    })

  return (
    <HeadContext.Provider value={headManager}>
      <PageContext.Provider value={current.page}>
        {renderChildren({
          Component,
          key: current.key,
          props: current.page.props,
        })}
      </PageContext.Provider>
    </HeadContext.Provider>
  )
}

App.displayName = 'Inertia'
