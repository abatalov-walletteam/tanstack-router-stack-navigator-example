import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/profile/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="p-4">
      <Link
        to="/profile"
        className="mb-4 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 inline-block"
        replace
      >
        ← Назад
      </Link>

      <h1 className="text-2xl font-bold mb-6">Настройки профиля</h1>

      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Имя пользователя
          </label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Введите имя"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Биография
          </label>
          <textarea
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={4}
            placeholder="Расскажите о себе"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
          disabled
        >
          Сохранить изменения
        </button>
      </form>
    </div>
  );
}
