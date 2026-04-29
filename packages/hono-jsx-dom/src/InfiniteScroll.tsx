import {
  getScrollableParent,
  InfiniteScrollActionSlotProps,
  InfiniteScrollComponentBaseProps,
  InfiniteScrollRef,
  InfiniteScrollSlotProps,
  ReloadOptions,
  useInfiniteScroll,
  UseInfiniteScrollProps,
} from '@inertiajs/core'
import {
  createElement,
  forwardRef,
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Child,
  type RefObject,
  type JSXNode,
} from 'hono/jsx/dom'
import type { JSX as HTMLJSX } from 'hono/jsx'
import type { JSX } from 'hono/jsx/dom/jsx-runtime'
import usePage from './usePage'

const resolveHTMLElement = (
  value: string | RefObject<HTMLElement | null> | null,
  fallback: HTMLElement | null,
): HTMLElement | null => {
  if (!value) {
    return fallback
  }

  if (typeof value === 'object' && 'current' in value) {
    return value.current
  }

  if (typeof value === 'string') {
    return document.querySelector(value) as HTMLElement | null
  }

  return fallback
}

const renderSlot = (
  slotContent: Child | ((props: InfiniteScrollActionSlotProps) => Child) | undefined,
  slotProps: InfiniteScrollActionSlotProps,
  fallback: Child = null,
): Child => {
  if (!slotContent) {
    return fallback
  }

  return typeof slotContent === 'function' ? slotContent(slotProps) : slotContent
}

interface ComponentProps
  extends
    InfiniteScrollComponentBaseProps,
    Omit<HTMLJSX.HTMLAttributes, keyof InfiniteScrollComponentBaseProps | 'children'> {
  children?: Child | ((props: InfiniteScrollSlotProps) => Child)
  startElement?: string | RefObject<HTMLElement | null>
  endElement?: string | RefObject<HTMLElement | null>
  itemsElement?: string | RefObject<HTMLElement | null>
  previous?: Child | ((props: InfiniteScrollActionSlotProps) => Child)
  next?: Child | ((props: InfiniteScrollActionSlotProps) => Child)
  loading?: Child | ((props: InfiniteScrollActionSlotProps) => Child)
  params?: ReloadOptions
  onlyNext?: boolean
  onlyPrevious?: boolean
}

const relaxedForwardRef = forwardRef as unknown as <T, P>(
  component: (props: P, ref?: RefObject<T>) => JSXNode,
) => (props: P & { ref?: RefObject<T> }) => JSX.Element

const InfiniteScroll = relaxedForwardRef<InfiniteScrollRef, ComponentProps>(
  (
    {
      data,
      buffer = 0,
      as = 'div',
      manual = false,
      manualAfter = 0,
      preserveUrl = false,
      reverse = false,
      autoScroll,
      children,
      startElement,
      endElement,
      itemsElement,
      previous,
      next,
      loading,
      params = {},
      onlyNext = false,
      onlyPrevious = false,
      ...props
    },
    ref,
  ) => {
    const [startElementFromRef, setStartElementFromRef] = useState<HTMLElement | null>(null)
    const startElementRef = useCallback((node: HTMLElement | null) => setStartElementFromRef(node), [])

    const [endElementFromRef, setEndElementFromRef] = useState<HTMLElement | null>(null)
    const endElementRef = useCallback((node: HTMLElement | null) => setEndElementFromRef(node), [])

    const [itemsElementFromRef, setItemsElementFromRef] = useState<HTMLElement | null>(null)
    const itemsElementRef = useCallback((node: HTMLElement | null) => setItemsElementFromRef(node), [])
    const fallbackRef = useRef<InfiniteScrollRef | null>(null)
    const imperativeRef = ref ?? fallbackRef

    const scrollProp = usePage().scrollProps?.[data]

    const [loadingPrevious, setLoadingPrevious] = useState(false)
    const [loadingNext, setLoadingNext] = useState(false)
    const [requestCount, setRequestCount] = useState(0)
    const [hasPreviousPage, setHasPreviousPage] = useState(!!scrollProp?.previousPage)
    const [hasNextPage, setHasNextPage] = useState(!!scrollProp?.nextPage)

    const [resolvedStartElement, setResolvedStartElement] = useState<HTMLElement | null>(null)
    const [resolvedEndElement, setResolvedEndElement] = useState<HTMLElement | null>(null)
    const [resolvedItemsElement, setResolvedItemsElement] = useState<HTMLElement | null>(null)

    useEffect(() => {
      setResolvedStartElement(startElement ? resolveHTMLElement(startElement, startElementFromRef) : startElementFromRef)
    }, [startElement, startElementFromRef])

    useEffect(() => {
      setResolvedEndElement(endElement ? resolveHTMLElement(endElement, endElementFromRef) : endElementFromRef)
    }, [endElement, endElementFromRef])

    useEffect(() => {
      setResolvedItemsElement(itemsElement ? resolveHTMLElement(itemsElement, itemsElementFromRef) : itemsElementFromRef)
    }, [itemsElement, itemsElementFromRef])

    const scrollableParent = useMemo(() => getScrollableParent(resolvedItemsElement), [resolvedItemsElement])

    const callbackPropsRef = useRef({
      buffer,
      onlyNext,
      onlyPrevious,
      params,
      preserveUrl,
      reverse,
    })

    callbackPropsRef.current = {
      buffer,
      onlyNext,
      onlyPrevious,
      params,
      preserveUrl,
      reverse,
    }

    const [infiniteScroll, setInfiniteScroll] = useState<UseInfiniteScrollProps | null>(null)

    const dataManager = useMemo(() => infiniteScroll?.dataManager, [infiniteScroll])
    const elementManager = useMemo(() => infiniteScroll?.elementManager, [infiniteScroll])

    const scrollToBottom = useCallback(() => {
      if (scrollableParent) {
        scrollableParent.scrollTo({
          behavior: 'instant',
          top: scrollableParent.scrollHeight,
        })
      } else {
        window.scrollTo({
          behavior: 'instant',
          top: document.body.scrollHeight,
        })
      }
    }, [scrollableParent])

    const manualMode = useMemo(
      () => manual || (manualAfter > 0 && requestCount >= manualAfter),
      [manual, manualAfter, requestCount],
    )
    const autoLoad = useMemo(() => !manualMode, [manualMode])

    useEffect(() => {
      if (!resolvedItemsElement) {
        return
      }

      function syncStateFromDataManager() {
        setRequestCount(infiniteScrollInstance.dataManager.getRequestCount())
        setHasPreviousPage(infiniteScrollInstance.dataManager.hasPrevious())
        setHasNextPage(infiniteScrollInstance.dataManager.hasNext())
      }

      const infiniteScrollInstance = useInfiniteScroll({
        getPropName: () => data,
        getReloadOptions: () => callbackPropsRef.current!.params,
        getScrollableParent: () => scrollableParent,
        getEndElement: () => resolvedEndElement!,
        getItemsElement: () => resolvedItemsElement,
        getStartElement: () => resolvedStartElement!,
        getTriggerMargin: () => callbackPropsRef.current!.buffer,
        inReverseMode: () => callbackPropsRef.current!.reverse,
        onBeforeNextRequest: () => setLoadingNext(true),
        onBeforePreviousRequest: () => setLoadingPrevious(true),
        onCompleteNextRequest: () => {
          setLoadingNext(false)
          syncStateFromDataManager()
        },
        onCompletePreviousRequest: () => {
          setLoadingPrevious(false)
          syncStateFromDataManager()
        },
        onDataReset: syncStateFromDataManager,
        shouldFetchNext: () => !callbackPropsRef.current!.onlyPrevious,
        shouldFetchPrevious: () => !callbackPropsRef.current!.onlyNext,
        shouldPreserveUrl: () => callbackPropsRef.current!.preserveUrl,
      })

      setInfiniteScroll(infiniteScrollInstance)
      const { dataManager, elementManager } = infiniteScrollInstance
      syncStateFromDataManager()

      elementManager.setupObservers()
      elementManager.processServerLoadedElements(dataManager.getLastLoadedPage())

      if (autoLoad) {
        elementManager.enableTriggers()
      }

      return () => {
        infiniteScrollInstance.flush()
        setInfiniteScroll(null)
      }
    }, [autoLoad, data, resolvedItemsElement, resolvedStartElement, resolvedEndElement, scrollableParent])

    useEffect(() => {
      autoLoad ? elementManager?.enableTriggers() : elementManager?.disableTriggers()
    }, [autoLoad, elementManager, onlyNext, onlyPrevious, resolvedStartElement, resolvedEndElement])

    useEffect(() => {
      const shouldAutoScroll = autoScroll !== undefined ? autoScroll : reverse

      if (shouldAutoScroll) {
        scrollToBottom()
      }
    }, [autoScroll, reverse, scrollToBottom])

    useEffect(() => {
      imperativeRef.current = {
        fetchNext: dataManager?.fetchNext || (() => {}),
        fetchPrevious: dataManager?.fetchPrevious || (() => {}),
        hasNext: dataManager?.hasNext || (() => false),
        hasPrevious: dataManager?.hasPrevious || (() => false),
      }

      return () => {
        imperativeRef.current = null
      }
    }, [dataManager, imperativeRef])

    const headerAutoMode = autoLoad && !onlyNext
    const footerAutoMode = autoLoad && !onlyPrevious

    const sharedExposed = {
      hasNext: hasNextPage,
      hasPrevious: hasPreviousPage,
      loadingNext,
      loadingPrevious,
    }

    const exposedPrevious: InfiniteScrollActionSlotProps = {
      autoMode: headerAutoMode,
      fetch: dataManager?.fetchPrevious ?? (() => {}),
      hasMore: hasPreviousPage,
      loading: loadingPrevious,
      manualMode: !headerAutoMode,
      ...sharedExposed,
    }

    const exposedNext: InfiniteScrollActionSlotProps = {
      autoMode: footerAutoMode,
      fetch: dataManager?.fetchNext ?? (() => {}),
      hasMore: hasNextPage,
      loading: loadingNext,
      manualMode: !footerAutoMode,
      ...sharedExposed,
    }

    const exposedSlot: InfiniteScrollSlotProps = {
      loading: loadingPrevious || loadingNext,
      loadingNext,
      loadingPrevious,
    }

    const renderElements: Child[] = []

    if (!startElement) {
      renderElements.push(
        createElement(
          'div',
          { ref: startElementRef },
          renderSlot(previous, exposedPrevious, loadingPrevious ? renderSlot(loading, exposedPrevious) : null),
        ),
      )
    }

    renderElements.push(
      createElement(as, { ...props, ref: itemsElementRef }, typeof children === 'function' ? children(exposedSlot) : children),
    )

    if (!endElement) {
      renderElements.push(
        createElement(
          'div',
          { ref: endElementRef },
          renderSlot(next, exposedNext, loadingNext ? renderSlot(loading, exposedNext) : null),
        ),
      )
    }

    return createElement(Fragment, {}, ...(reverse ? [...renderElements].reverse() : renderElements))
  },
)

;(InfiniteScroll as { displayName?: string }).displayName = 'InertiaInfiniteScroll'

export default InfiniteScroll
