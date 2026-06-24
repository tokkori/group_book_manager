import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '@/services/authService'
import toast from 'react-hot-toast'
import { BookOpen } from 'lucide-react'

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
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(msg ?? '登録に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-6 text-blue-600">
          <BookOpen size={28} />
          <h1 className="text-xl font-bold">新規ユーザー登録</h1>
        </div>
        <form onSubmit={handleSubmit} data-testid="register-form" className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ユーザー名</label>
            <input
              type="text" value={form.username} onChange={set('username')} required
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              data-testid="register-username-input"
            />
            <p className="text-xs text-gray-400 mt-1">3〜50文字、英数字・アンダースコア・ハイフンのみ</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">表示名</label>
            <input
              type="text" value={form.displayName} onChange={set('displayName')} required
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              data-testid="register-displayname-input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">パスワード</label>
            <input
              type="password" value={form.password} onChange={set('password')} required
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              data-testid="register-password-input"
            />
            <p className="text-xs text-gray-400 mt-1">8文字以上</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">パスワード（確認）</label>
            <input
              type="password" value={form.confirm} onChange={set('confirm')} required
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              data-testid="register-confirm-password-input"
            />
          </div>
          {error && <p className="text-red-600 text-sm" data-testid="register-error-message">{error}</p>}
          <button
            type="submit" disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
            data-testid="register-submit-button"
          >
            {isLoading ? '登録中...' : '登録する'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-500">
          <Link to="/login" className="text-blue-600 hover:underline">ログインに戻る</Link>
        </p>
      </div>
    </div>
  )
}
