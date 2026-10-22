import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import SearchPage from '@/pages/SearchPage'
import { useAppStore } from '@/store/useAppStore'

function SearchHarness() {
  return (
    <MemoryRouter initialEntries={['/search']}>
      <Routes>
        <Route path="/" element={<div>HOME_PAGE_MARKER</div>} />
        <Route path="/search" element={<SearchPage />} />
      </Routes>
    </MemoryRouter>
  )
}

const rows = [
  { lat: '40.4168', lon: '-3.7038', display_name: 'Madrid, España', type: 'city' },
  { lat: '38.7167', lon: '-9.1333', display_name: 'Lisbon, Portugal', type: 'city' },
]

function stubSearch() {
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string) => {
      if (String(url).includes('nominatim')) {
        return Promise.resolve({ ok: true, json: async () => rows })
      }
      return Promise.resolve({ ok: true, json: async () => ({}) })
    }),
  )
}

describe('SearchPage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.unstubAllGlobals()
  })

  it('searches and lists places from Nominatim', async () => {
    stubSearch()
    render(
      <MemoryRouter initialEntries={['/search']}>
        <SearchPage />
      </MemoryRouter>,
    )
    // geocode cache could come from a previous run — clear it via the store key
    localStorage.removeItem('mom-recommends:geocode:madrid')

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'madrid' } })
    fireEvent.click(screen.getByRole('button', { name: 'Search' }))

    expect(await screen.findByText('Madrid, España')).toBeInTheDocument()
    expect(screen.getByText('Lisbon, Portugal')).toBeInTheDocument()
  })

  it('selecting a place sets the location and navigates home', async () => {
    stubSearch()
    render(
      <SearchHarness />,
    )
    localStorage.removeItem('mom-recommends:geocode:lisbon')

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'lisbon' } })
    fireEvent.click(screen.getByRole('button', { name: 'Search' }))

    const lisbon = await screen.findByText('Lisbon, Portugal')
    fireEvent.click(lisbon)

    await waitFor(() => {
      expect(useAppStore.getState().location?.displayName).toBe('Lisbon, Portugal')
    })
    // navigates to '/' (the harness marker) after the location is set
    await waitFor(() => expect(screen.getByText('HOME_PAGE_MARKER')).toBeInTheDocument())
  })

  it('shows an empty-state message when there are no matches', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => [] }),
    )
    render(
      <MemoryRouter initialEntries={['/search']}>
        <SearchPage />
      </MemoryRouter>,
    )
    localStorage.removeItem('mom-recommends:geocode:nope')

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'nope' } })
    fireEvent.click(screen.getByRole('button', { name: 'Search' }))

    expect(await screen.findByText(/No places found/i)).toBeInTheDocument()
  })
})