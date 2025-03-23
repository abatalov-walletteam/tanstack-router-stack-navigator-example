import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/profile/")({
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <div className="p-4">
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
        <div>
          <h1 className="text-xl font-bold">Имя пользователя</h1>
          <p className="text-gray-600">@username</p>
          <Link
            to="/profile/settings"
            className="text-blue-500 hover:underline mt-2 inline-block"
          >
            Настройки
          </Link>
        </div>
      </div>
    </div>
  );
}
