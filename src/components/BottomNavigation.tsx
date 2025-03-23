import { Link, useCanGoBack, useRouter } from "@tanstack/react-router";
import { StackResumeLink } from "./StackResumeLink";

export function BottomNavigation() {
  const router = useRouter();
  const canGoBack = useCanGoBack();
  return (
    <nav className="flex items-center justify-around py-2 px-4 border-t bg-white">
      <button
        rel="prev"
        type="button"
        disabled={!canGoBack}
        onClick={() => router.history.back()}
        className={!canGoBack ? "opacity-50" : ""}
      >
        🔙
      </button>
      <StackResumeLink
        to="/"
        className="flex flex-col items-center p-2"
        activeProps={{ className: "text-blue-500" }}
      >
        <span className="text-xl">📱</span>
        <span className="text-sm">Лента</span>
      </StackResumeLink>

      <StackResumeLink
        to="/search"
        className="flex flex-col items-center p-2"
        activeProps={{ className: "text-blue-500" }}
      >
        <span className="text-xl">🔍</span>
        <span className="text-sm">Поиск</span>
      </StackResumeLink>

      <StackResumeLink
        to="/profile"
        className="flex flex-col items-center p-2"
        activeProps={{ className: "text-blue-500" }}
      >
        <span className="text-xl">👤</span>
        <span className="text-sm">Профиль</span>
      </StackResumeLink>
    </nav>
  );
}
