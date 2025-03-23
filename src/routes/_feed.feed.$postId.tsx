import * as React from "react";
import { ErrorComponent, createFileRoute, Await } from "@tanstack/react-router";
import { fetchPost, fetchPosts, PostType } from "../posts";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { Feed } from "../components/Feed";

export const Route = createFileRoute("/_feed/feed/$postId")({
  loader: async ({ params: { postId } }) => {
    const post = await fetchPost(postId);
    return {
      post,
      feed: fetchPosts(),
    };
  },
  errorComponent: PostErrorComponent,
  notFoundComponent: () => {
    return <p>Post not found</p>;
  },
  component: PostComponent,
});

export function PostErrorComponent({ error }: ErrorComponentProps) {
  return <ErrorComponent error={error} />;
}

function PostComponent() {
  const { post, feed } = Route.useLoaderData();

  return (
    <article className="p-4">
      <h4 className="text-xl font-bold underline">{post.title}</h4>
      <div className="text-sm">{post.body}</div>

      <Await promise={feed} fallback={<div>⏳ Loading...</div>}>
        {(feedData) => {
          const nextPosts = getNextPosts(feedData, post.id);
          return (
            <div>
              <Feed posts={nextPosts} />
            </div>
          );
        }}
      </Await>
    </article>
  );
}

function getNextPosts(feed: PostType[], currentPostId: PostType["id"]) {
  const currentPostIndex = feed.findIndex((item) => item.id === currentPostId);
  let nextPosts = [];

  if (currentPostIndex === -1) {
    nextPosts = feed.slice(0, 3);
  } else {
    const remainingPosts = feed.length - currentPostIndex - 1;

    if (remainingPosts >= 3) {
      nextPosts = feed.slice(currentPostIndex + 1, currentPostIndex + 4);
    } else {
      const postsAfter = feed.slice(currentPostIndex + 1);
      const postsFromStart = feed.slice(0, 3 - remainingPosts);
      nextPosts = [...postsAfter, ...postsFromStart];
    }
  }

  return nextPosts;
}
