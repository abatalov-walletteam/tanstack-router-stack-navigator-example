import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/feed')({
  component: FeedPage,
})

function FeedPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Лента</h1>
      <div className="space-y-4">
        {/* Здесь будет список постов */}
      </div>
    </div>
  )
} 