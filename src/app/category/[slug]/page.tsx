import { Header } from "@/components/layout/header/Header"

interface CategoryPageProps {
  params: {
    slug: string
  }
}

export default function CategoryPage({ params }: CategoryPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Category: {params.slug}</h1>
        {/* Add your category content here */}
      </main>
    </div>
  )
}