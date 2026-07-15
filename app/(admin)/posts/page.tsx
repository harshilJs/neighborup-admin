import PageHeader from '@/components/PageHeader'
import StatusBadge from '@/components/StatusBadge'
import PostActionsMenu from '@/components/PostActionsMenu'
import { supabaseAdmin } from '@/lib/supabase'
import { formatDateTime, firstNonEmpty } from '@/lib/format'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const { data: posts, error } = await supabaseAdmin
    .from('posts')
    .select('id, user_id, content, image_url, image_urls, is_business_post, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  const userIds = Array.from(new Set((posts ?? []).map(p => p.user_id).filter(Boolean)))
  const { data: profiles } = userIds.length
    ? await supabaseAdmin.from('profiles').select('id, full_name, email').in('id', userIds)
    : { data: [] as { id: string; full_name: string | null; email: string | null }[] }
  const profileMap = new Map((profiles ?? []).map(p => [p.id, p]))

  return (
    <div>
      <PageHeader title="Posts & Feed" description="Browse and moderate all feed posts" />

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wide">
              <th className="text-left px-4 py-3 font-medium">Author</th>
              <th className="text-left px-4 py-3 font-medium">Content</th>
              <th className="text-left px-4 py-3 font-medium">Type</th>
              <th className="text-left px-4 py-3 font-medium">Posted</th>
              <th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {error && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-red-600">
                  Failed to load posts: {error.message}
                </td>
              </tr>
            )}
            {!error && posts?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                  No posts yet.
                </td>
              </tr>
            )}
            {posts?.map(post => (
              <tr key={post.id} className="border-b border-gray-200 last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-700">
                  {firstNonEmpty(profileMap.get(post.user_id)?.full_name, profileMap.get(post.user_id)?.email) ?? '—'}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {post.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={post.image_url} alt="" className="w-8 h-8 rounded object-cover inline-block mr-2 align-middle" />
                  )}
                  <span className="max-w-sm truncate block" title={post.content ?? undefined}>{post.content}</span>
                </td>
                <td className="px-4 py-3">
                  {post.is_business_post ? (
                    <StatusBadge label="Business" color="blue" />
                  ) : (
                    <StatusBadge label="Personal" color="gray" />
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500">{formatDateTime(post.created_at)}</td>
                <td className="px-4 py-3 text-right">
                  <PostActionsMenu post={post} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
