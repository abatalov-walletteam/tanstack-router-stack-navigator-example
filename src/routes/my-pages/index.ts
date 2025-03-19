import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/my-pages/')({
  beforeLoad() {
    throw redirect({to: '/my-pages/page-a'})
  }
})

