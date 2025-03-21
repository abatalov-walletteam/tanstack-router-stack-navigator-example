import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_my-pages/page-b')(
  {
    component: LayoutBComponent,
  },
)

function LayoutBComponent() {
  return <div>I'm layout B!</div>
}
