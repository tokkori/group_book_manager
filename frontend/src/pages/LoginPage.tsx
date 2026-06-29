import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { BookOpen, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      await login(username, password)
      navigate('/')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(msg ?? 'ログインに失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="card overflow-hidden">
          <div className="flex flex-col items-center gap-3 bg-brand-700 px-8 py-8 text-center text-paper">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brass-400 text-brand-900 shadow-sm ring-1 ring-brass-200/60">
              <BookOpen size={28} strokeWidth={2.2} />
            </span>
            <div>
              <h1 className="font-serif text-xl font-bold tracking-wide">書籍管理システム</h1>
              <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.3em] text-brass-200">
                Reading Room
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} data-testid="login-form" className="space-y-4 p-8">
            <div>
              <label className="field-label">ユーザー名</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="input"
                data-testid="login-username-input"
                autoFocus
              />
            </div>
            <div>
              <label className="field-label">パスワード</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input"
                data-testid="login-password-input"
              />
            </div>
            {error && (
              <p
                className="flex items-center gap-1.5 rounded-lg bg-clay-50 px-3 py-2 text-sm text-clay-700"
                data-testid="login-error-message"
              >
                <AlertCircle size={15} className="shrink-0" /> {error}
              </p>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full"
              data-testid="login-submit-button"
            >
              {isLoading ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-ink-soft">
          アカウントをお持ちでない方は{' '}
          <Link to="/register" className="font-medium text-brand-700 underline-offset-2 hover:underline">
            新規ユーザー登録
          </Link>
        </p>
      </div>
    </div>
  )
}
