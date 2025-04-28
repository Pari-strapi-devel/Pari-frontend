import { useCategories } from './Category'
import Image from 'next/image'

export function CategoryList() {
  const { categories, loading, error } = useCategories()

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        <p>Error: {error}</p>
        <p className="text-sm mt-2">Showing default categories instead</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.length > 0 ? (
        categories.map((category) => (
          <div 
            key={category.id}
            className="relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <Image
              src={category.imageUrl}
              alt={category.title}
              width={400}
              height={192}
              className="w-full h-48 object-cover bg-cover bg-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex flex-col justify-end">
              <h3 className="text-white text-xl font-bold">{category.title}</h3>
              <p className="text-white/80 text-sm">{category.description}</p>
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-full text-center py-8">No categories found</div>
      )}
    </div>
  )
}
