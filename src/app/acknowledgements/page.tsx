'use client'

import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'

const API_BASE_URL = 'https://dev.ruralindiaonline.org'

interface MemberItem {
  id?: number
  Name?: string
}

interface ContributionItem {
  id: number
  Title: string
  Members?: MemberItem[]
  Names?: string | null
}

interface BannerSection {
  id?: number
  Title?: string | null
  Quote?: string | null
}

interface ApiResponse {
  data: {
    id: number
    attributes: {
      Acknowledgment_Title: string
      Acknowledgment_Content: string
      More_Content?: string
      Contribution_list?: ContributionItem[]
      Banner_Section?: BannerSection
    }
  }
  meta: Record<string, unknown>
}

export default function AcknowledgementsPage() {
  const [data, setData] = useState<ApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [activeIndex, setActiveIndex] = useState(0)

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await axios.get<ApiResponse>(`${API_BASE_URL}/v1/api/acknowledgment?populate=*`)
      setData(response.data)

    } catch (err) {
      console.error('Error fetching acknowledgements:', err)
      setError('Failed to load acknowledgements')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Loading Acknowledgements...</h1>
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Data</h1>
          <p className="text-gray-600">No acknowledgement data found.</p>
        </div>
      </div>
    )
  }

  const acknowledgementData = data.data

  const contributionList = acknowledgementData?.attributes?.Contribution_list ?? []

  const strap = 'PARI: a living journal, a breathing archive'

  const extractYearLabel = (title: string) => {
    const years = (title || '').match(/\d{4}/g)
    if (!years) return null
    const unique = Array.from(new Set(years))
    if (unique.length === 1) return unique[0]
    return `${unique[0]} - ${unique[unique.length - 1]}`
  }

  const stripYearFromTitle = (title: string) => {
    if (!title) return ''
    return title.replace(/\s*\(\d{4}\)\s*$/g, '').replace(/\s\d{4}\s*$/g, '').trim()
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar */}
          <aside className="col-span-12 lg:col-span-3">
            <div className="space-y-4">
              <div className="pl-3 border-l-4 border-pari-red border-red-600">
                <div className="text-sm font-semibold text-gray-900">Acknowledgements</div>
              </div>
              <ul className="divide-y divide-gray-200">
                {contributionList?.map((item, idx) => {
                  const year = extractYearLabel(item.Title)
                  const titleText = stripYearFromTitle(item.Title)
                  const active = idx === activeIndex
                  return (
                    <li key={item.id} className="py-4">
                      {year && (
                        <div className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">{year}</div>
                      )}
                      <button
                        onClick={() => setActiveIndex(idx)}
                        className="w-full text-left flex items-center gap-2 hover:text-gray-900"
                        aria-pressed={active}
                      >
                        <span className={`inline-block w-[6px] h-4 rounded-sm ${active ? 'bg-red-600' : 'bg-transparent'}`}></span>
                        <span className={`text-sm ${active ? 'font-semibold text-gray-900' : 'text-gray-800'}`}>
                          {titleText || item.Title}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          </aside>

          {/* Main content */}
          <main className="col-span-12 lg:col-span-9">
            <header className="mb-8">
              <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">
                {acknowledgementData?.attributes?.Acknowledgment_Title || 'Acknowledgements'}
              </h1>
              <p className="mt-2 text-2xl text-gray-700">{strap}</p>
              <hr className="mt-6 border-gray-200" />
            </header>

            {(() => {
              const activeItem = contributionList[activeIndex]
              const memberNames = (activeItem?.Members || [])
                .map(m => (m?.Name || '').trim())
                .filter(Boolean)
              const parsedNames = memberNames.length
                ? memberNames
                : (activeItem?.Names
                    ? (activeItem.Names || '')
                        .split(/[\n,]+/)
                        .map(s => s.trim())
                        .filter(Boolean)
                    : [])

              const mid = Math.ceil(parsedNames.length / 2)
              const left = parsedNames.slice(0, mid)
              const right = parsedNames.slice(mid)

              return (
                <section>
                  <h2 className="text-3xl font-extrabold text-gray-900 mb-6">
                    {activeItem ? stripYearFromTitle(activeItem.Title) : ''}
                  </h2>
                  {parsedNames.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <ul className="space-y-4">
                        {left.map((name, i) => (
                          <li key={`l-${i}`} className="text-gray-900">{name}</li>
                        ))}
                      </ul>
                      <ul className="space-y-4">
                        {right.map((name, i) => (
                          <li key={`r-${i}`} className="text-gray-900">{name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </section>
              )
            })()}
          </main>
        </div>
      </div>
    </div>
  )
}
