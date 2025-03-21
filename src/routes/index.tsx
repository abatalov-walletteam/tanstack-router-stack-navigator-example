import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
  staticData: {
    stackNavigator: true
  }
})

function Home() {
  return (
    <div className="p-2">
      <h3>Welcome Home!</h3>
    </div>
  )
}
