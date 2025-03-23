import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/search')({
  component: SearchPage,
})

function SearchPage() {
  return (
    <div className="p-4">
      <div className="sticky top-0 bg-white pb-4">
        <input
          type="search"
          placeholder="Поиск..."
          className="w-full p-2 border rounded-lg"
        />
      </div>
      <div className="mt-4">
        {/* Здесь будут результаты поиска */}
      </div>
    </div>
  )
} 