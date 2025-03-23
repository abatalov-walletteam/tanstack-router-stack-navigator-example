import { createFileRoute, Link } from "@tanstack/react-router";
import { fetchPosts } from "../posts";

export const Route = createFileRoute("/profile/")({
  component: ProfilePage,
  loader: async () => {
    return {
      posts: await fetchPosts(),
    };
  },
  staticData: {
    stackNavigator: true,
  },
});

function ProfilePage() {
  const { posts } = Route.useLoaderData();

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

      <div className="grid grid-cols-3 gap-1">
        {posts.map((post) => (
          <Link
            key={post.id}
            to="/feed/$postId"
            params={{ postId: post.id }}
            className="aspect-square bg-gray-100 p-2 hover:bg-gray-200"
          >
            <div className="text-sm truncate">{post.title}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
