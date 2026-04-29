import { HeadManager } from '@inertiajs/core'
import { createContext } from 'hono/jsx'

const headContext = createContext<HeadManager | null>(null)
headContext.displayName = 'InertiaHeadContext'

export default headContext
