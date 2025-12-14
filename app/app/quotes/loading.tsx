/**
 * Quotes Page Loading State
 * 
 * Next.js convention: loading.tsx provides a loading UI while the page is being rendered.
 * This creates a Suspense boundary automatically wrapping the page.
 * 
 * @module app/quotes/loading
 */

import { InternalPageHeader } from '../_components'

export default function QuotesLoading() {
  return (
    <>
      <InternalPageHeader
        title="Quotes"
        description="Manage customer quote requests"
      />

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          {/* Skeleton table header */}
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="bg-base-200">
                    <div className="skeleton h-4 w-20" />
                  </th>
                  <th className="bg-base-200">
                    <div className="skeleton h-4 w-24" />
                  </th>
                  <th className="bg-base-200">
                    <div className="skeleton h-4 w-32" />
                  </th>
                  <th className="bg-base-200">
                    <div className="skeleton h-4 w-24" />
                  </th>
                  <th className="bg-base-200">
                    <div className="skeleton h-4 w-16" />
                  </th>
                  <th className="bg-base-200">
                    <div className="skeleton h-4 w-24" />
                  </th>
                  <th className="bg-base-200">
                    <div className="skeleton h-4 w-16" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Skeleton rows */}
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td>
                      <div className="skeleton h-4 w-24" />
                    </td>
                    <td>
                      <div className="skeleton h-4 w-32" />
                    </td>
                    <td>
                      <div className="skeleton h-4 w-40" />
                    </td>
                    <td>
                      <div className="skeleton h-4 w-28" />
                    </td>
                    <td>
                      <div className="skeleton h-6 w-16 rounded-full" />
                    </td>
                    <td>
                      <div className="skeleton h-4 w-24" />
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <div className="skeleton h-8 w-8 rounded" />
                        <div className="skeleton h-8 w-8 rounded" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Skeleton pagination */}
          <div className="flex justify-between items-center mt-4">
            <div className="skeleton h-4 w-32" />
            <div className="flex gap-2">
              <div className="skeleton h-8 w-8 rounded" />
              <div className="skeleton h-8 w-8 rounded" />
              <div className="skeleton h-8 w-8 rounded" />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

