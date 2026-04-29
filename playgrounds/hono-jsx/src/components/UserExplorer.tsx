import { useMemo, useState } from 'hono/jsx'
import { Link } from '@inertiajs/hono-jsx'

type User = {
  id: number
  name: string
  role: string
}

export function UserExplorer({ users }: { users: User[] }) {
  const [query, setQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState('all')
  const [showRoles, setShowRoles] = useState(true)

  const roles = useMemo(() => ['all', ...Array.from(new Set(users.map((user) => user.role)))], [users])

  const visibleUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return users.filter((user) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        user.name.toLowerCase().includes(normalizedQuery) ||
        user.role.toLowerCase().includes(normalizedQuery)

      const matchesRole = selectedRole === 'all' || user.role === selectedRole

      return matchesQuery && matchesRole
    })
  }, [query, selectedRole, users])

  return (
    <section>
      <h2>Client-side user explorer</h2>

      <label>
        Search users
        <input
          value={query}
          placeholder="Try Mika or Engineer"
          onInput={(event) => setQuery((event.currentTarget as HTMLInputElement).value)}
        />
      </label>

      <fieldset>
        <legend>Role filter</legend>

        {roles.map((role) => (
          <label key={role}>
            <input
              type="radio"
              name="role"
              checked={selectedRole === role}
              onChange={() => setSelectedRole(role)}
            />
            {role}
          </label>
        ))}
      </fieldset>

      <button type="button" onClick={() => setShowRoles((current) => !current)}>
        {showRoles ? 'Hide roles' : 'Show roles'}
      </button>

      <p>
        Showing {visibleUsers.length} of {users.length}
      </p>

      <ul>
        {visibleUsers.map((user) => (
          <li key={user.id}>
            <Link href={`/users/${user.id}`} preserveState>
              {user.name}
              {showRoles ? ` - ${user.role}` : ''}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

