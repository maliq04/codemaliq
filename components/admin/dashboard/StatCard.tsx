interface StatCardProps {
  title: string
  value: number | string
  icon: React.ReactNode
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red'
  subtitle?: string
  loading?: boolean
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-900',
    text: 'text-blue-600 dark:text-blue-300'
  },
  green: {
    bg: 'bg-green-100 dark:bg-green-900',
    text: 'text-green-600 dark:text-green-300'
  },
  purple: {
    bg: 'bg-purple-100 dark:bg-purple-900',
    text: 'text-purple-600 dark:text-purple-300'
  },
  orange: {
    bg: 'bg-orange-100 dark:bg-orange-900',
    text: 'text-orange-600 dark:text-orange-300'
  },
  red: {
    bg: 'bg-red-100 dark:bg-red-900',
    text: 'text-red-600 dark:text-red-300'
  }
}

export default function StatCard({ title, value, icon, color, subtitle, loading }: StatCardProps) {
  const colors = colorClasses[color]

  if (loading) {
    return (
      <div className="rounded-lg bg-white p-6 shadow dark:bg-neutral-800">
        <div className="animate-pulse">
          <div className="mb-2 h-4 w-24 rounded bg-neutral-200 dark:bg-neutral-700"></div>
          <div className="h-8 w-16 rounded bg-neutral-200 dark:bg-neutral-700"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-md dark:bg-neutral-800">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-neutral-100">{value}</p>
          {subtitle && <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{subtitle}</p>}
        </div>
        <div className={`rounded-full p-3 ${colors.bg}`}>
          <div className={colors.text}>{icon}</div>
        </div>
      </div>
    </div>
  )
}
