import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { categoryService } from '@/services/categoryService'
import ConfirmDialog from '@/components/ConfirmDialog'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react'

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
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-gray-800">カテゴリ管理</h1>

      {/* 新規作成フォーム */}
      <form onSubmit={handleCreate} className="bg-white rounded-lg border p-4 space-y-3" data-testid="category-create-form">
        <h2 className="font-medium text-gray-700">新しいカテゴリを作成</h2>
        <input
          type="text" placeholder="カテゴリ名（必須）" value={newName}
          onChange={(e) => setNewName(e.target.value)} required
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
          data-testid="category-name-input"
        />
        <input
          type="text" placeholder="説明（任意）" value={newDesc}
          onChange={(e) => setNewDesc(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
          data-testid="category-desc-input"
        />
        <button
          type="submit"
          className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
          data-testid="category-create-button"
        >
          <Plus size={16} /> 作成
        </button>
      </form>

      {/* カテゴリ一覧 */}
      <ul className="space-y-2" data-testid="category-list">
        {categories?.map((cat) => (
          <li key={cat.id} className="bg-white rounded-lg border p-3">
            {editId === cat.id ? (
              <div className="space-y-2">
                <input
                  value={editName} onChange={(e) => setEditName(e.target.value)}
                  className="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
                <input
                  value={editDesc} onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="説明"
                  className="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
                <div className="flex gap-2">
                  <button onClick={() => handleUpdate(cat.id)} className="p-1 text-green-600 hover:text-green-800">
                    <Check size={18} />
                  </button>
                  <button onClick={() => setEditId(null)} className="p-1 text-gray-400 hover:text-gray-600">
                    <X size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">{cat.name}</p>
                  {cat.description && <p className="text-xs text-gray-400 mt-0.5">{cat.description}</p>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(cat.id, cat.name, cat.description)}
                    className="p-1 text-gray-400 hover:text-blue-600"
                    data-testid={`category-edit-button-${cat.id}`}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget({ id: cat.id, name: cat.name })}
                    className="p-1 text-gray-400 hover:text-red-600"
                    data-testid={`category-delete-button-${cat.id}`}
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
