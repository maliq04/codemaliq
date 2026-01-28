import DashboardOverview from '@/components/admin/dashboard/DashboardOverview'

export default function AdminDashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Dashboard</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          Welcome to your admin dashboard. Manage your website content from here.
        </p>
      </div>

      <DashboardOverview />
    </div>
  )
}
