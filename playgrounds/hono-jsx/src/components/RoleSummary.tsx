import { useMemo } from 'hono/jsx'

type User = {
  id: number
  name: string
  role: string
}

export function RoleSummary({ users }: { users: User[] }) {
  const summary = useMemo(() => {
    return users.reduce<Record<string, number>>((counts, user) => {
      counts[user.role] = (counts[user.role] ?? 0) + 1
      return counts
    }, {})
  }, [users])

  return (
    <section>
      <h2>Memoized role summary</h2>
      <dl>
        {Object.entries(summary).map(([role, count]) => (
          <div key={role}>
            <dt>{role}</dt>
            <dd>{count}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

