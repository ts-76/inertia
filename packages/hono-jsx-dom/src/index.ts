import { config as coreConfig } from '@inertiajs/core'
import type { HonoInertiaAppConfig } from './types'

export { http, progress, router } from '@inertiajs/core'
export { default as App } from './App'
export { default as createInertiaApp } from './createInertiaApp'
export { default as Deferred } from './Deferred'
export { default as Form, useFormContext } from './Form'
export { default as Head } from './Head'
export { default as InfiniteScroll } from './InfiniteScroll'
export { resetLayoutProps, setLayoutProps } from './layoutProps'
export { default as Link } from './Link'
export type { InertiaLinkProps } from './Link'
export type { ComponentResolver, HonoComponent, InertiaApp, InertiaAppProps, ResolvedComponent } from './types'
export {
  default as useForm,
  type InertiaForm,
  type InertiaFormProps,
  type InertiaPrecognitiveFormProps,
  type SetDataAction,
  type SetDataByKeyValuePair,
  type SetDataByMethod,
  type SetDataByObject,
} from './useForm'
export { default as useHttp, type UseHttp, type UseHttpPrecognitiveProps, type UseHttpProps } from './useHttp'
export { default as usePage } from './usePage'
export { default as usePoll } from './usePoll'
export { default as usePrefetch } from './usePrefetch'
export { default as useRemember } from './useRemember'
export { default as WhenVisible } from './WhenVisible'

export const config = coreConfig.extend<HonoInertiaAppConfig>()
