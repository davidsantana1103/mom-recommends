import { Route, Routes } from 'react-router-dom'
import AppLayout from '@/components/layout/AppLayout'
import AboutPage from '@/pages/AboutPage'
import HomePage from '@/pages/HomePage'
import SearchPage from '@/pages/SearchPage'
import SettingsPage from '@/pages/SettingsPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="about" element={<AboutPage />} />
      </Route>
    </Routes>
  )
}