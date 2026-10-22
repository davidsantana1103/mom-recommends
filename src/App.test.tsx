import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from '@/App'

describe('App', () => {
  it('renders the app shell with navigation and headings', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('navigation')).toBeInTheDocument()
    expect(screen.getByText("Today's outfit")).toBeInTheDocument()
    expect(screen.getByLabelText('Home')).toBeInTheDocument()
  })
})