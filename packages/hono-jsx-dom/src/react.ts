import { useEffect, useLayoutEffect } from 'hono/jsx'

export const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

