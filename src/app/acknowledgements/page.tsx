'use client'

import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'

const API_BASE_URL = 'https://merge.ruralindiaonline.org'

interface AcknowledgementGroup {
  id: number
  GroupName: string
  Content: string
}

interface TabItem {
  id: number
  TabName: string
  Content: string | null
  AcknowledgementGroup: AcknowledgementGroup[]
}

interface ApiResponse {
  data: {
    id: number
    attributes: {
      Title: string
      Strap: string
      StartContent: string
      EndContent: string
      Tab: TabItem[]
      createdAt: string
      updatedAt: string
      publishedAt: string
      locale: string
    }
  }
  meta: Record<string, unknown>
}

export default function AcknowledgementsPage() {
  const [data, setData] = useState<ApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTabId, setActiveTabId] = useState<number | null>(null)
  const [showMainAcknowledgements, setShowMainAcknowledgements] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await axios.get<ApiResponse>(`${API_BASE_URL}/v1/api/page-acknowledgement?populate=deep`)
      setData(response.data)

      // Set the first tab as active by default
      if (response.data?.data?.attributes?.Tab && response.data.data.attributes.Tab.length > 0) {
        setActiveTabId(response.data.data.attributes.Tab[0].id)
      }

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

  const { Title, Strap, StartContent, EndContent, Tab } = data.data.attributes
  const tabs = Tab || []

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <div className="flex gap-16">
          {/* Sidebar - Only show if tabs exist */}
          {tabs.length > 0 && (
            <aside className="w-[180px] flex-shrink-0">
              <div className="sticky top-6">
                {/* Sidebar Navigation */}
                <nav>
                  <ul className="space-y-4">
                    {/* Acknowledgements - Main section */}
                    <li>
                      <button
                        onClick={() => {
                          setShowMainAcknowledgements(true)
                          setActiveTabId(null)
                        }}
                        className="w-full text-left"
                      >
                        <div className="flex items-start gap-2">
                          <div
                            className={`w-1 h-5 rounded flex-shrink-0 mt-0.5 ${
                              showMainAcknowledgements && !activeTabId ? 'bg-primary-PARI-Red' : 'bg-transparent'
                            }`}
                          ></div>
                          <span
                            className={`font-noto ${
                              showMainAcknowledgements && !activeTabId ? 'text-foreground font-semibold' : 'text-discreet-text'
                            }`}
                            style={{
                              fontWeight: showMainAcknowledgements && !activeTabId ? 600 : 400,
                              fontSize: '13px',
                              lineHeight: '150%'
                            }}
                          >
                            Acknowledgements
                          </span>
                        </div>
                      </button>
                    </li>

                    {/* Year tabs */}
                    {tabs.map((tab) => {
                      const isActive = activeTabId === tab.id

                      return (
                        <li key={tab.id}>
                          <button
                            onClick={() => {
                              setShowMainAcknowledgements(false)
                              setActiveTabId(tab.id)
                            }}
                            className="w-full text-left"
                          >
                            <div className="flex items-start gap-2">
                              <div
                                className={`w-1 h-5 rounded flex-shrink-0 mt-0.5 ${
                                  isActive ? 'bg-primary-PARI-Red' : 'bg-transparent'
                                }`}
                              ></div>
                              <span
                                className={`font-noto ${
                                  isActive ? 'text-foreground font-semibold' : 'text-foreground'
                                }`}
                                style={{
                                  fontWeight: isActive ? 600 : 400,
                                  fontSize: '13px',
                                  lineHeight: '150%'
                                }}
                              >
                                {tab.TabName}
                              </span>
                            </div>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </nav>
              </div>
            </aside>
          )}

          {/* Main Content */}
          <main className="flex-1">
            {/* Header */}
            <header className="mb-8">
              <h1
                className="font-noto text-foreground mb-2"
                
              >
                {Title}
              </h1>
              <h2
                className="font-noto text-foreground"
                
              >
                {Strap}
              </h2>
            </header>

            {/* Content */}
            <div>
              {/* Show StartContent and EndContent when "Acknowledgements" is selected */}
              {showMainAcknowledgements && !activeTabId ? (
                <>
                  {/* Start Content */}
                  <div
                    className="font-noto text-foreground acknowledgement-content mb-12"
                    style={{
                      fontWeight: 400,
                      fontSize: '16px',
                      lineHeight: '170%',
                      letterSpacing: '-0.01em'
                    }}
                    dangerouslySetInnerHTML={{ __html: StartContent }}
                  />

                  {/* End Content */}
                  <div
                    className="font-noto text-foreground acknowledgement-content"
                    style={{
                      fontWeight: 400,
                      fontSize: '16px',
                      lineHeight: '170%',
                      letterSpacing: '-0.01em'
                    }}
                    dangerouslySetInnerHTML={{ __html: EndContent }}
                  />
                </>
              ) : null}

              {/* Show ONLY the selected year's groups when a year is selected */}
              {!showMainAcknowledgements && activeTabId && (
                <div>
                  {tabs.map((tab) => {
                    if (tab.id !== activeTabId) return null

                    return (
                      <div key={tab.id}>
                        {/* Render Acknowledgement Groups */}
                        {tab.AcknowledgementGroup && tab.AcknowledgementGroup.length > 0 ? (
                          <div className="space-y-10">
                            {tab.AcknowledgementGroup.map((group) => (
                              <div key={group.id} className="acknowledgement-group">
                                <h3
                                  className="text-lg  text-foreground mb-2"
                                  
                                >
                                  {group.GroupName}
                                </h3>
                                <div
                                  className="font-noto text-foreground acknowledgement-content"
                                  style={{
                                    fontWeight: 400,
                                    fontSize: '16px',
                                    lineHeight: '170%',
                                    letterSpacing: '-0.01em'
                                  }}
                                  dangerouslySetInnerHTML={{ __html: group.Content }}
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="font-noto text-discreet-text italic">
                            No acknowledgement groups available for this section yet.
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </main>
        </div>

        <style jsx>{`
          .acknowledgement-content :global(p) {
            margin-bottom: 1.5rem;
          }
          .acknowledgement-content :global(p:last-child) {
            margin-bottom: 0;
          }
          .acknowledgement-content :global(br) {
            display: block;
            content: "";
            margin-top: 0.5rem;
          }
          .acknowledgement-content :global(ul) {
            list-style-type: none;
            padding-left: 0;
            margin: 0;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.5rem 2rem;
          }
          .acknowledgement-content :global(li) {
            margin-bottom: 0;
            padding-left: 0;
            break-inside: avoid;
          }
          .acknowledgement-group {
            margin-bottom: 0;
          }
        `}</style>
      </div>
    </div>
  )
}
