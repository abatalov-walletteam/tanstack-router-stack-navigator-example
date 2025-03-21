import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_my-pages/page-a')(
  {
    component: LayoutAComponent,
  },
)

function LayoutAComponent() {
  return <div>I'm 📃 Page A!</div>
}
