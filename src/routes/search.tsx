import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { fetchPosts, PostType } from "../posts";

export const Route = createFileRoute("/search")({
  component: SearchPage,
  staticData: {
    stackNavigator: true,
  },
});

function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const saved = sessionStorage.getItem("searchHistory");
    return saved ? JSON.parse(saved) : [];
  });
  const [posts, setPosts] = useState<PostType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadPosts = async () => {
      if (!searchQuery) {
        setPosts([]);
        return;
      }

      setIsLoading(true);
      try {
        const allPosts = await fetchPosts();
        const filtered = allPosts.filter(
          (post) =>
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.body.toLowerCase().includes(searchQuery.toLowerCase()),
        );
        setPosts(filtered);
      } catch (error) {
        console.error("Ошибка при поиске:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(loadPosts, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query && !searchHistory.includes(query)) {
      const newHistory = [query, ...searchHistory].slice(0, 5);
      setSearchHistory(newHistory);
      sessionStorage.setItem("searchHistory", JSON.stringify(newHistory));
    }
  };

  return (
    <section className="p-4">
      <div className="sticky top-0 bg-white pb-4 space-y-2">
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Поиск..."
          className="w-full p-2 border rounded-lg"
        />
        {!searchQuery && searchHistory.length > 0 && (
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

      <div className="mt-4">
        {isLoading ? (
          <div className="text-center py-4">Загрузка...</div>
        ) : posts.length > 0 ? (
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
        ) : searchQuery ? (
          <div className="text-center py-4 text-gray-600">
            Ничего не найдено
          </div>
        ) : null}
      </div>
    </section>
  );
}
