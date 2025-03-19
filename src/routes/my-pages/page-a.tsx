import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/my-pages/page-a')(
  {
    component: LayoutAComponent,
  },
)

function LayoutAComponent() {
  return <div>I'm layout A!</div>
}
