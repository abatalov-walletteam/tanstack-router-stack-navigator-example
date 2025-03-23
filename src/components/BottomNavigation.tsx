import { Link } from '@tanstack/react-router'

export function BottomNavigation() {
  return (
    <nav className="flex items-center justify-around py-2 px-4 border-t bg-white">
      <Link
        to="/feed"
        className="flex flex-col items-center p-2"
        activeProps={{ className: 'text-blue-500' }}
      >
        <span className="text-xl">📱</span>
        <span className="text-sm">Лента</span>
      </Link>
      
      <Link
        to="/search"
        className="flex flex-col items-center p-2"
        activeProps={{ className: 'text-blue-500' }}
      >
        <span className="text-xl">🔍</span>
        <span className="text-sm">Поиск</span>
      </Link>
      
      <Link
        to="/profile"
        className="flex flex-col items-center p-2"
        activeProps={{ className: 'text-blue-500' }}
      >
        <span className="text-xl">👤</span>
        <span className="text-sm">Профиль</span>
      </Link>
    </nav>
  )
} 