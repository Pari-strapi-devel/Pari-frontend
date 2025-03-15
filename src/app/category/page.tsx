import { Header } from "@/components/layout/header/Header"
import { CategoryGallery } from "@/components/layout/gallery/CategoryGallery"

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Categories</h1>
        <CategoryGallery />
      </main>
    </div>
  )
}