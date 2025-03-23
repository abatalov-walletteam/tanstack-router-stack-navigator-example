import { Await, createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { fetchPosts } from "../posts";

export const Route = createFileRoute("/search")({
  validateSearch: (searchParams): { search?: string } => {
    return {
      search: searchParams.search ? String(searchParams.search) : undefined,
    };
  },
  loaderDeps: ({ search: { search } }) => ({ search }),
  loader: async ({ deps: { search } }) => {
    if (!search) return { feed: Promise.resolve([]) };

    return {
      feed: fetchPosts().then((posts) =>
        posts.filter(
          (post) =>
            post.title.toLowerCase().includes(search?.toLowerCase() || "") ||
            post.body.toLowerCase().includes(search?.toLowerCase() || ""),
        ),
      ),
    };
  },
  component: SearchPage,
  staticData: {
    stackNavigator: true,
  },
});

function SearchPage() {
  const { feed } = Route.useLoaderData();
  const { search } = Route.useSearch();
  const navigate = Route.useNavigate();

  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const saved = sessionStorage.getItem("searchHistory");
    return saved ? JSON.parse(saved) : [];
  });

  const handleSearch = (query: string) => {
    navigate({ search: { search: query } });

    if (query && !searchHistory.includes(query)) {
      const newHistory = [query, ...searchHistory].slice(0, 5);
      setSearchHistory(newHistory);
      sessionStorage.setItem("searchHistory", JSON.stringify(newHistory));
    }
  };

  return (
    <section className="p-4">
      <code className="mb-2 block">
        Параметры поиска восстановятся, после перехода на другой стек, и обратно
      </code>
      <div className="sticky top-0 bg-white pb-4 space-y-2">
        <input
          type="search"
          value={search ?? ""}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Поиск..."
          className="w-full p-2 border rounded-lg"
        />
        {!search && searchHistory.length > 0 && (
          <div className="text-sm text-gray-600">
            <p className="mb-1">История поиска:</p>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((query, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(query)}
                  className="px-2 py-1 bg-gray-100 rounded-full hover:bg-gray-200"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {Boolean(search) && (
        <div className="mt-4">
          <Await
            promise={feed}
            fallback={<div className="text-center py-4">⏳ Loading...</div>}
          >
            {(posts) =>
              posts.length > 0 ? (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <Link
                      key={post.id}
                      to="/feed/$postId"
                      params={{ postId: post.id }}
                      className="block p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <h3 className="font-bold">{post.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {post.body}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : search ? (
                <div className="text-center py-4 text-gray-600">
                  Ничего не найдено
                </div>
              ) : null
            }
          </Await>
        </div>
      )}
    </section>
  );
}
