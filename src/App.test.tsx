import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '@/App'
import i18n from '@/i18n'
import { useAppStore } from '@/store/useAppStore'

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
    useAppStore.setState({ language: 'en' })
    void i18n.changeLanguage('en')
  })

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

  it('keeps document language, title and meta in sync with the UI language (D17/D15)', async () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    )

    await waitFor(() => expect(document.documentElement.lang).toBe('en'))
    expect(document.title).toBe('Mom Recommends')
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute(
      'content',
      expect.stringContaining('images'),
    )

    useAppStore.getState().setLanguage('es')

    await waitFor(() => expect(document.documentElement.lang).toBe('es'))
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toContain(
      'imágenes',
    )
  })

  it('marks the active navigation link with aria-current', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )
    const active = screen.getByRole('link', { name: 'Home' })
    expect(active).toHaveAttribute('aria-current', 'page')
  })
})