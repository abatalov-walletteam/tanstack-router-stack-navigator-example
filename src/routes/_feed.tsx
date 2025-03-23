import * as React from "react";
import { Link, Outlet, createFileRoute } from "@tanstack/react-router";
import { fetchPosts } from "../posts";

export const Route = createFileRoute("/_feed")({
  component: PostsLayoutComponent,
  staticData: {
    stackNavigator: true,
  },
});

function PostsLayoutComponent() {
  return (
    <section className="p-4">
      <div>📬 Лента</div>
      <hr />
      <Outlet />
    </section>
  );
}
