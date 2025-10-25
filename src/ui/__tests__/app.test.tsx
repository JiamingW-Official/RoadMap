import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { App } from '../App'
import { Settings } from '../Settings'
import { SelectionProvider } from '../../store/selection'

function renderWithRoutes(initialEntries: string[]) {
  const router = createMemoryRouter([
    { path: '/', element: <App /> },
    { path: '/settings', element: <Settings /> },
  ], { initialEntries })
  return render(
    <SelectionProvider>
      <RouterProvider router={router} />
    </SelectionProvider>
  )
}

describe('App', () => {
  it('renders title in TopBar', () => {
    renderWithRoutes(['/'])
    expect(screen.getByText('Roadmap')).toBeInTheDocument()
  })

  it('routes to settings', async () => {
    renderWithRoutes(['/settings'])
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument()
  })
})
