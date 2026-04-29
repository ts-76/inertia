import type { Page, PageProps, SharedPageProps } from '@inertiajs/core'
import type { Child, JSXNode } from 'hono/jsx/dom'

export type LayoutFunction = (page: Child) => Child
export type LayoutComponent<TProps = Record<string, unknown>> = ((props: TProps & { children?: Child }) => Child) & {
  name?: string
}

export type LayoutDefinition<TProps = Record<string, unknown>> =
  | LayoutFunction
  | LayoutComponent<TProps>
  | LayoutComponent<TProps>[]
  | Record<string, unknown>
  | null
  | undefined

export type HonoComponent<TProps = Record<string, unknown>> = ((props: TProps) => Child | JSXNode) & {
  layout?: LayoutDefinition<TProps> | ((props: TProps) => LayoutDefinition<TProps> | Child)
}

export type ResolvedComponent<TProps = Record<string, unknown>> = HonoComponent<TProps> & {
  default?: HonoComponent<TProps>
}

export type ComponentResolver = (
  name: string,
  page?: Page<SharedPageProps>,
) => ResolvedComponent | Promise<ResolvedComponent> | { default: ResolvedComponent }

export type HonoInertiaAppConfig = Record<string, never>

export interface InertiaAppProps<SharedProps extends PageProps = PageProps> {
  children?: (options: { Component: ResolvedComponent; props: PageProps; key: number | null }) => Child
  initialPage: Page<SharedProps>
  initialComponent?: ResolvedComponent
  resolveComponent?: (name: string, page?: Page) => ResolvedComponent | Promise<ResolvedComponent>
  titleCallback?: (title: string) => string
  onHeadUpdate?: (elements: string[]) => void
  defaultLayout?: (name: string, page: Page) => LayoutDefinition
}

export type InertiaApp = (props: InertiaAppProps) => Child
