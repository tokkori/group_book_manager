import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { BookOpen, List, Tag, Upload, LogOut, MapPin } from 'lucide-react'

export default function Layout({ children }: { children: React.ReactNode }) {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-blue-600">
            <BookOpen size={24} />
            <span>書籍管理</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/" className="flex items-center gap-1 text-gray-600 hover:text-blue-600">
              <BookOpen size={16} /> 書籍一覧
            </Link>
            <Link to="/loans" className="flex items-center gap-1 text-gray-600 hover:text-blue-600">
              <List size={16} /> 貸出管理
            </Link>
            <Link to="/categories" className="flex items-center gap-1 text-gray-600 hover:text-blue-600">
              <Tag size={16} /> カテゴリ
            </Link>
            <Link to="/locations" className="flex items-center gap-1 text-gray-600 hover:text-blue-600">
              <MapPin size={16} /> 保管場所
            </Link>
            <Link to="/import" className="flex items-center gap-1 text-gray-600 hover:text-blue-600">
              <Upload size={16} /> インポート
            </Link>
            <span className="text-gray-400">|</span>
            <span className="text-gray-600">{currentUser?.display_name}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-red-500 hover:text-red-700"
              data-testid="logout-button"
            >
              <LogOut size={16} /> ログアウト
            </button>
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        {children}
      </main>
    </div>
  )
}
