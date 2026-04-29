import { escape } from 'es-toolkit/compat'
import { useContext, useEffect, useMemo } from 'hono/jsx'
import type { Child } from 'hono/jsx/dom'
import HeadContext from './HeadContext'

type InertiaHeadProps = {
  title?: string
  children?: Child
}

type InertiaHead = (props: InertiaHeadProps) => null

const Head: InertiaHead = function ({ children, title }) {
  const headManager = useContext(HeadContext)
  const provider = useMemo(() => headManager!.createProvider(), [headManager])
  const isServer = typeof window === 'undefined'

  useEffect(() => {
    provider.reconnect()
    provider.update(renderNodes(children))
    return () => {
      provider.disconnect()
    }
  }, [provider, children, title])

  type HeadNode = {
    type?: unknown
    tag?: unknown
    props?: Record<string, unknown>
    children?: unknown
  }

  function nodeType(node: HeadNode): string {
    const type = node.type ?? node.tag ?? ''

    if (typeof type === 'string') {
      return type
    }

    if (typeof type === 'function') {
      const source = Function.prototype.toString.call(type)
      const sourceTag = ['title', 'meta', 'link', 'base', 'style', 'script', 'noscript'].find((tag) =>
        source.includes(`"${tag}"`) || source.includes(`'${tag}'`),
      )

      if (sourceTag) {
        return sourceTag
      }

      return type.name
    }

    return String(type)
  }

  function nodeProps(node: HeadNode): Record<string, unknown> {
    return node.props ?? {}
  }

  function isSupportedHeadTag(tag: string): boolean {
    return [
      'title',
      'meta',
      'link',
      'base',
      'style',
      'script',
      'noscript',
    ].includes(tag)
  }

  function isHeadNode(node: unknown): node is HeadNode {
    return typeof node === 'object' && node !== null && isSupportedHeadTag(resolveHeadTag(node as HeadNode))
  }

  function resolveHeadTag(node: HeadNode): string {
    const tag = nodeType(node)

    if (isSupportedHeadTag(tag)) {
      return tag
    }

    const props = nodeProps(node)

    if ('name' in props || 'property' in props || 'httpEquiv' in props || 'charSet' in props || 'charset' in props) {
      return 'meta'
    }

    if ('rel' in props || 'href' in props) {
      return 'link'
    }

    if ('src' in props || 'async' in props || 'defer' in props) {
      return 'script'
    }

    return tag
  }

  function flattenNodes(nodes: unknown): unknown[] {
    if (Array.isArray(nodes)) {
      return nodes.flatMap((node) => flattenNodes(node))
    }

    if (nodes === null || nodes === undefined || nodes === false || nodes === true) {
      return []
    }

    return [nodes]
  }

  function isUnaryTag(node: HeadNode) {
    return (
      resolveHeadTag(node).length > 0 &&
      [
        'area',
        'base',
        'br',
        'col',
        'embed',
        'hr',
        'img',
        'input',
        'keygen',
        'link',
        'meta',
        'param',
        'source',
        'track',
        'wbr',
      ].indexOf(resolveHeadTag(node)) > -1
    )
  }

  function renderTagStart(node: HeadNode): string {
    const props = nodeProps(node)
    const attrs = Object.keys(props).reduce((carry, name) => {
      if (['head-key', 'children', 'dangerouslySetInnerHTML'].includes(name)) {
        return carry
      }

      const value = String(props[name])

      if (value === '') {
        return carry + ` ${name}`
      }

      return carry + ` ${name}="${escape(value)}"`
    }, '')

    return `<${resolveHeadTag(node)}${attrs}>`
  }

  function renderTagChildren(node: HeadNode): string {
    const children = nodeProps(node).children ?? node.children

    if (typeof children === 'string') {
      return escape(children)
    }

    if (typeof children === 'number') {
      return String(children)
    }

    if (Array.isArray(children)) {
      return children.map((child) => renderNode(child)).join('')
    }

    return ''
  }

  function renderTag(node: HeadNode): string {
    let html = renderTagStart(node)

    const props = nodeProps(node)

    if (props.children || node.children) {
      html += renderTagChildren(node)
    }

    if (props.dangerouslySetInnerHTML && typeof props.dangerouslySetInnerHTML === 'object') {
      html += String((props.dangerouslySetInnerHTML as { __html?: unknown }).__html ?? '')
    }

    if (!isUnaryTag(node)) {
      html += `</${resolveHeadTag(node)}>`
    }

    return html
  }

  function renderNode(node: unknown) {
    if (!isHeadNode(node) || !resolveHeadTag(node)) {
      return ''
    }

    const props = nodeProps(node)

    return renderTag({
      ...node,
      props: {
        ...props,
        'data-inertia': props['head-key'] !== undefined ? props['head-key'] : '',
      },
    })
  }

  function renderNodes(nodes: Child) {
    const elements = flattenNodes(nodes)
      .filter((node) => node)
      .map((node) => renderNode(node))
      .filter((node) => node.includes('<'))

    if (title && !elements.find((tag) => tag.startsWith('<title'))) {
      elements.push(`<title data-inertia="">${title}</title>`)
    }

    return elements
  }

  if (isServer) {
    provider.update(renderNodes(children))
  }

  return null
}
export default Head

