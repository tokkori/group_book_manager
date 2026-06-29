import { useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { importService } from '@/services/importService'
import { getApiErrorMessage } from '@/services/apiError'
import type { ImportResult } from '@/types'
import toast from 'react-hot-toast'
import { Upload, FileText, CheckCircle, AlertCircle, SkipForward, Info } from 'lucide-react'

const codeCls = 'rounded bg-paper-dark px-1.5 py-0.5 font-mono text-[11px] text-ink'

export default function ImportPage() {
  const qc = useQueryClient()
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
      // インポートで自動登録された新規カテゴリや書籍を一覧・絞り込みに反映する
      qc.invalidateQueries({ queryKey: ['categories'] })
      qc.invalidateQueries({ queryKey: ['books'] })
      toast.success(`${res.success}件インポートしました`)
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'インポートに失敗しました'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="page-title">書籍データのインポート</h1>
        <p className="mt-1 text-sm text-ink-faint">CSV / Excel から蔵書を一括登録します</p>
      </div>

      <div className="flex gap-3 rounded-2xl border border-brand-100 bg-brand-50/70 p-4 text-sm text-brand-800">
        <Info size={18} className="mt-0.5 shrink-0 text-brand-500" />
        <div className="space-y-1">
          <p className="font-semibold">対応フォーマット</p>
          <p>CSV / Excel（.xlsx, .xls）ファイルをアップロードしてください。ヘッダー行が必要です。</p>
          <p className="flex flex-wrap items-center gap-1">
            列名:
            <code className={codeCls}>title</code>
            <code className={codeCls}>author</code>
            <code className={codeCls}>isbn</code>
            <code className={codeCls}>publisher</code>
            <code className={codeCls}>published_year</code>
            <code className={codeCls}>location</code>
            <code className={codeCls}>category</code>
          </p>
          <p className="text-xs text-brand-700/80">
            日本語ヘッダー（タイトル、著者、ISBN、出版社、出版年、場所、カテゴリ）も対応しています。
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4 p-5">
        <div
          className="cursor-pointer rounded-xl border-2 border-dashed border-line bg-paper/50 p-8 text-center transition-colors hover:border-brand-400 hover:bg-brand-50/40"
          onClick={() => fileRef.current?.click()}
        >
          <Upload size={32} className="mx-auto mb-2 text-brand-300" />
          <p className="text-sm text-ink-soft">
            {file ? (
              <span className="flex items-center justify-center gap-2 font-medium text-brand-700">
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
          className="btn-primary w-full"
          data-testid="import-submit-button"
        >
          {isLoading ? 'インポート中...' : 'インポート開始'}
        </button>
      </form>

      {result && (
        <div className="card space-y-3 p-5" data-testid="import-result">
          <h2 className="section-title">インポート結果</h2>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <span className="flex items-center gap-1.5 font-medium text-brand-600">
              <CheckCircle size={16} /> 成功: {result.success}件
            </span>
            <span className="flex items-center gap-1.5 text-ink-faint">
              <SkipForward size={16} /> スキップ: {result.skipped}件
            </span>
            {result.errors.length > 0 && (
              <span className="flex items-center gap-1.5 font-medium text-clay-600">
                <AlertCircle size={16} /> エラー: {result.errors.length}件
              </span>
            )}
          </div>
          {result.errors.length > 0 && (
            <ul className="space-y-1 rounded-lg bg-clay-50 p-3 text-xs text-clay-700">
              {result.errors.map((err, i) => <li key={i}>{err}</li>)}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
