import * as React from "react";
import { Link, Outlet, createFileRoute } from "@tanstack/react-router";
import { fetchPosts } from "../posts";

export const Route = createFileRoute("/posts")({
  loader: fetchPosts,
  component: PostsLayoutComponent,
  staticData: {
    stackNavigator: true,
  },
});

function PostsLayoutComponent() {
  const posts = Route.useLoaderData();

  return (
    <div className="p-2 flex gap-2">
      <ul className="list-disc pl-4">
        <div>📬</div>
        {posts.map((post) => {
          return (
            <li key={post.id} className="whitespace-nowrap">
              <Link
                to="/posts/$postId"
                params={{
                  postId: post.id,
                }}
                className="block py-1 text-blue-600 hover:opacity-75"
                activeProps={{ className: "font-bold underline" }}
              >
                <div>{post.title.substring(0, 20)}</div>
              </Link>
            </li>
          );
        })}
      </ul>
      <hr />
      <Outlet />
    </div>
  );
}
