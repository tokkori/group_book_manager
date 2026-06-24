import { useRef, useState } from 'react'
import { importService } from '@/services/importService'
import type { ImportResult } from '@/types'
import toast from 'react-hot-toast'
import { Upload, FileText, CheckCircle, AlertCircle, SkipForward } from 'lucide-react'

export default function ImportPage() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null)
    setResult(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return
    setIsLoading(true)
    try {
      const res = await importService.importBooks(file)
      setResult(res)
      toast.success(`${res.success}件インポートしました`)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      toast.error(msg ?? 'インポートに失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-xl font-bold text-gray-800">書籍データのインポート</h1>

      <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
        <p className="font-medium mb-1">対応フォーマット</p>
        <p>CSV / Excel（.xlsx, .xls）ファイルをアップロードしてください。</p>
        <p className="mt-1">ヘッダー行が必要です。列名: <code>title</code>, <code>author</code>, <code>isbn</code>, <code>publisher</code>, <code>published_year</code>, <code>location</code>, <code>category</code></p>
        <p className="mt-1 text-xs">日本語ヘッダー（タイトル、著者、ISBN、出版社、出版年、場所、カテゴリ）も対応しています。</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border p-5 space-y-4">
        <div
          className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          <Upload size={32} className="mx-auto text-gray-300 mb-2" />
          <p className="text-sm text-gray-500">
            {file ? (
              <span className="flex items-center justify-center gap-2 text-blue-600">
                <FileText size={16} /> {file.name}
              </span>
            ) : 'ここをクリックしてファイルを選択'}
          </p>
        </div>
        <input
          type="file"
          ref={fileRef}
          onChange={handleFileChange}
          accept=".csv,.xlsx,.xls"
          className="hidden"
          data-testid="import-file-input"
        />
        <button
          type="submit"
          disabled={!file || isLoading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
          data-testid="import-submit-button"
        >
          {isLoading ? 'インポート中...' : 'インポート開始'}
        </button>
      </form>

      {result && (
        <div className="bg-white rounded-lg border p-5 space-y-3" data-testid="import-result">
          <h2 className="font-semibold text-gray-700">インポート結果</h2>
          <div className="flex gap-6 text-sm">
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle size={16} /> 成功: {result.success}件
            </span>
            <span className="flex items-center gap-1 text-gray-500">
              <SkipForward size={16} /> スキップ: {result.skipped}件
            </span>
            {result.errors.length > 0 && (
              <span className="flex items-center gap-1 text-red-500">
                <AlertCircle size={16} /> エラー: {result.errors.length}件
              </span>
            )}
          </div>
          {result.errors.length > 0 && (
            <ul className="text-xs text-red-600 bg-red-50 rounded p-3 space-y-1">
              {result.errors.map((err, i) => <li key={i}>{err}</li>)}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
