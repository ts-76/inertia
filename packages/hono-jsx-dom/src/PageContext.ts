import type { Page } from '@inertiajs/core'
import { createContext } from 'hono/jsx'

export default createContext<Page | null>(null)
