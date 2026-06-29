import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { BookOpen, List, Tag, Upload, LogOut, MapPin, User } from 'lucide-react'

const navItems = [
  { to: '/', label: '書籍一覧', icon: BookOpen },
  { to: '/loans', label: '貸出管理', icon: List },
  { to: '/categories', label: 'カテゴリ', icon: Tag },
  { to: '/locations', label: '保管場所', icon: MapPin },
  { to: '/import', label: 'インポート', icon: Upload },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 bg-brand-700 text-paper shadow-header">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-y-3 px-4 py-3">
          <Link to="/" className="group flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brass-400 text-brand-900 shadow-sm ring-1 ring-brass-200/60">
              <BookOpen size={20} strokeWidth={2.2} />
            </span>
            <span className="leading-tight">
              <span className="block font-serif text-lg font-bold tracking-wide">書籍管理</span>
              <span className="block text-[10px] font-medium uppercase tracking-[0.25em] text-brass-200">
                Reading Room
              </span>
            </span>
          </Link>

          <nav className="flex flex-wrap items-center gap-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-inner'
                      : 'text-paper/75 hover:bg-brand-600/60 hover:text-white'
                  }`
                }
              >
                <Icon size={16} /> {label}
              </NavLink>
            ))}

            <span className="mx-1 hidden h-6 w-px bg-paper/20 sm:block" />

            <span className="flex items-center gap-1.5 text-sm text-paper/70">
              <User size={15} /> {currentUser?.display_name}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-paper/70 transition-colors hover:bg-clay-600/70 hover:text-white"
              data-testid="logout-button"
            >
              <LogOut size={16} /> ログアウト
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>

      <footer className="border-t border-line/70 py-5 text-center text-xs text-ink-faint">
        書籍管理システム · Reading Room edition
      </footer>
    </div>
  )
}
