import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { categoryService } from '@/services/categoryService'
import ConfirmDialog from '@/components/ConfirmDialog'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, Check, X, Tag } from 'lucide-react'

export default function CategoryPage() {
  const qc = useQueryClient()
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [editId, setEditId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null)

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAll(),
  })

  const refresh = () => qc.invalidateQueries({ queryKey: ['categories'] })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    try {
      await categoryService.create(newName.trim(), newDesc.trim() || undefined)
      toast.success('カテゴリを作成しました')
      setNewName(''); setNewDesc('')
      refresh()
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? '作成に失敗しました')
    }
  }

  const startEdit = (id: number, name: string, desc: string | null) => {
    setEditId(id); setEditName(name); setEditDesc(desc ?? '')
  }

  const handleUpdate = async (id: number) => {
    try {
      await categoryService.update(id, editName.trim(), editDesc.trim() || undefined)
      toast.success('更新しました')
      setEditId(null); refresh()
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? '更新に失敗しました')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await categoryService.delete(deleteTarget.id)
      toast.success('削除しました')
      setDeleteTarget(null); refresh()
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? '削除に失敗しました')
      setDeleteTarget(null)
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="page-title">カテゴリ管理</h1>

      {/* 新規作成フォーム */}
      <form onSubmit={handleCreate} className="card space-y-3 p-5" data-testid="category-create-form">
        <h2 className="section-title">新しいカテゴリを作成</h2>
        <input
          type="text" placeholder="カテゴリ名（必須）" value={newName}
          onChange={(e) => setNewName(e.target.value)} required
          className="input"
          data-testid="category-name-input"
        />
        <input
          type="text" placeholder="説明（任意）" value={newDesc}
          onChange={(e) => setNewDesc(e.target.value)}
          className="input"
          data-testid="category-desc-input"
        />
        <button type="submit" className="btn-primary" data-testid="category-create-button">
          <Plus size={16} /> 作成
        </button>
      </form>

      {/* カテゴリ一覧 */}
      <ul className="space-y-2.5" data-testid="category-list">
        {categories?.map((cat) => (
          <li key={cat.id} className="card p-4">
            {editId === cat.id ? (
              <div className="space-y-2.5">
                <input
                  value={editName} onChange={(e) => setEditName(e.target.value)}
                  className="input"
                />
                <input
                  value={editDesc} onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="説明"
                  className="input"
                />
                <div className="flex gap-2">
                  <button onClick={() => handleUpdate(cat.id)} className="btn-primary px-3 py-1.5">
                    <Check size={16} /> 保存
                  </button>
                  <button onClick={() => setEditId(null)} className="btn-secondary px-3 py-1.5">
                    <X size={16} /> キャンセル
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-500">
                    <Tag size={15} />
                  </span>
                  <div>
                    <p className="font-medium text-ink">{cat.name}</p>
                    {cat.description && <p className="mt-0.5 text-xs text-ink-faint">{cat.description}</p>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => startEdit(cat.id, cat.name, cat.description)}
                    className="rounded-lg p-2 text-ink-faint transition-colors hover:bg-paper-dark hover:text-brand-600"
                    data-testid={`category-edit-button-${cat.id}`}
                    aria-label="編集"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget({ id: cat.id, name: cat.name })}
                    className="rounded-lg p-2 text-ink-faint transition-colors hover:bg-clay-50 hover:text-clay-600"
                    data-testid={`category-delete-button-${cat.id}`}
                    aria-label="削除"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="カテゴリの削除"
        message={`「${deleteTarget?.name}」を削除しますか？`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
