import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '@/services/authService'
import { getApiErrorMessage } from '@/services/apiError'
import toast from 'react-hot-toast'
import { BookOpen, AlertCircle } from 'lucide-react'

export default function UserRegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', displayName: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) {
      setError('パスワードが一致しません')
      return
    }
    setIsLoading(true)
    try {
      await authService.register(form.username, form.displayName, form.password)
      toast.success('ユーザーを登録しました')
      navigate('/login')
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, '登録に失敗しました'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="card overflow-hidden">
          <div className="flex flex-col items-center gap-3 bg-brand-700 px-8 py-7 text-center text-paper">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brass-400 text-brand-900 shadow-sm ring-1 ring-brass-200/60">
              <BookOpen size={24} strokeWidth={2.2} />
            </span>
            <h1 className="font-serif text-lg font-bold tracking-wide">新規ユーザー登録</h1>
          </div>

          <form onSubmit={handleSubmit} data-testid="register-form" className="space-y-4 p-8">
            <div>
              <label className="field-label">ユーザー名</label>
              <input
                type="text" value={form.username} onChange={set('username')} required
                className="input"
                data-testid="register-username-input"
              />
              <p className="mt-1 text-xs text-ink-faint">3〜50文字、英数字・アンダースコア・ハイフンのみ</p>
            </div>
            <div>
              <label className="field-label">表示名</label>
              <input
                type="text" value={form.displayName} onChange={set('displayName')} required
                className="input"
                data-testid="register-displayname-input"
              />
            </div>
            <div>
              <label className="field-label">パスワード</label>
              <input
                type="password" value={form.password} onChange={set('password')} required
                className="input"
                data-testid="register-password-input"
              />
              <p className="mt-1 text-xs text-ink-faint">8文字以上</p>
            </div>
            <div>
              <label className="field-label">パスワード（確認）</label>
              <input
                type="password" value={form.confirm} onChange={set('confirm')} required
                className="input"
                data-testid="register-confirm-password-input"
              />
            </div>
            {error && (
              <p
                className="flex items-center gap-1.5 rounded-lg bg-clay-50 px-3 py-2 text-sm text-clay-700"
                data-testid="register-error-message"
              >
                <AlertCircle size={15} className="shrink-0" /> {error}
              </p>
            )}
            <button
              type="submit" disabled={isLoading}
              className="btn-primary w-full"
              data-testid="register-submit-button"
            >
              {isLoading ? '登録中...' : '登録する'}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-ink-soft">
          <Link to="/login" className="font-medium text-brand-700 underline-offset-2 hover:underline">
            ← ログインに戻る
          </Link>
        </p>
      </div>
    </div>
  )
}
