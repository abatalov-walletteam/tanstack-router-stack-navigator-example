import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_my-pages/page-b")({
  component: LayoutBComponent,
});

function LayoutBComponent() {
  return (
    <div>
      <h2>I'm 🔲 Layout B!</h2>
      <Outlet />
    </div>
  );
}
