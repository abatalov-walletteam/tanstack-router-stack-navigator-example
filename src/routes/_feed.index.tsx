import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { fetchPosts } from "../posts";

export const Route = createFileRoute("/_feed/")({
  loader: fetchPosts,
  component: PostsIndexComponent,
});

function PostsIndexComponent() {
  const posts = Route.useLoaderData();

  return (
    <ul>
      {posts.map((post) => {
        return (
          <li key={post.id} className="whitespace-nowrap">
            <Link
              to="/feed/$postId"
              params={{ postId: post.id }}
              className="block py-1 text-blue-600 hover:opacity-75"
              activeProps={{ className: "font-bold underline" }}
            >
              <div>{post.title.substring(0, 20)}</div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
