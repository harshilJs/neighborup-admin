import PageHeader from '@/components/PageHeader'

export default function Page() {
  return (
    <div>
      <PageHeader title="Audit Logs" description="Immutable log of all admin actions" />
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-10 text-center">
        <p className="text-gray-400 text-sm">
          No audit log table exists yet. Admin actions taken in this panel (report resolutions,
          moderation reviews, verification decisions) aren&apos;t currently recorded anywhere.
          Add an <code className="text-gray-500">audit_logs</code> table and write to it from each
          admin action to populate this page.
        </p>
      </div>
    </div>
  )
}
