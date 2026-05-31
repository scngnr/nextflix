import { listMovieSources } from "~/lib/server-fetchers"
import { SourceManager } from "~/components/admin/source-manager"

export const dynamic = "force-dynamic"

export default async function AdminSourcesPage({
  searchParams,
}: {
  searchParams: { page?: string; q?: string }
}) {
  const page = Math.max(0, Number(searchParams.page ?? 0) || 0)
  const query = searchParams.q ?? ""
  const { items, total, pageSize } = await listMovieSources({ page, query })

  return (
    <SourceManager
      items={items}
      total={total}
      page={page}
      pageSize={pageSize}
      query={query}
    />
  )
}
