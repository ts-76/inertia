import { useState } from 'hono/jsx'

export function VisitCounter() {
  const [count, setCount] = useState(0)

  return (
    <section>
      <h2>Local Hono JSX state</h2>
      <p>Count: {count}</p>
      <button type="button" onClick={() => setCount((current) => current + 1)}>
        Increment
      </button>
      <button type="button" onClick={() => setCount(0)}>
        Reset
      </button>
    </section>
  )
}

