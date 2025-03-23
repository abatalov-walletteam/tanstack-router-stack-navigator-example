import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
  staticData: {
    stackNavigator: true,
  },
})

function ProfilePage() {
  return (
    <div className="p-4">
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
        <div>
          <h1 className="text-xl font-bold">Имя пользователя</h1>
          <p className="text-gray-600">@username</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1">
        {/* Здесь будет галерея постов */}
      </div>
    </div>
  )
} 