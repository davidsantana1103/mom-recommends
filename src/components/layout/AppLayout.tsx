import { Heart, Info, MapPin, Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/', labelKey: 'nav.home', icon: Heart, end: true },
  { to: '/search', labelKey: 'nav.search', icon: MapPin, end: false },
  { to: '/settings', labelKey: 'nav.settings', icon: Settings, end: false },
  { to: '/about', labelKey: 'nav.about', icon: Info, end: false },
] as const

export default function AppLayout() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 border-b border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-4 py-3">
          <NavLink to="/" className="flex items-center gap-2 font-semibold text-ink">
            <Heart aria-hidden className="size-6 text-brand-600" />
            <span>{t('app.name')}</span>
          </NavLink>
          <nav aria-label={t('nav.home')} className="flex items-center gap-1">
            {navItems.map(({ to, labelKey, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-ink-muted hover:bg-surface-alt hover:text-ink'
                  }`
                }
              >
                <Icon aria-hidden className="size-4" />
                <span className="hidden sm:inline">{t(labelKey)}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <Outlet />
      </main>

      <footer className="border-t border-line bg-surface-alt">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-1 px-4 py-4 text-xs text-ink-muted">
          <p>© {new Date().getFullYear()} {t('app.name')}</p>
          <p>{t('app.tagline')}</p>
          <p>{t('app.attribution')}</p>
        </div>
      </footer>
    </div>
  )
}