import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { locationService } from '@/services/locationService'
import ConfirmDialog from '@/components/ConfirmDialog'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, Check, X, MapPin } from 'lucide-react'

export default function LocationPage() {
  const qc = useQueryClient()
  const [newName, setNewName] = useState('')
  const [editId, setEditId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null)

  const { data: locations } = useQuery({
    queryKey: ['locations'],
    queryFn: () => locationService.getAll(),
  })

  const refresh = () => qc.invalidateQueries({ queryKey: ['locations'] })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    try {
      await locationService.create(newName.trim())
      toast.success('保管場所を作成しました')
      setNewName('')
      refresh()
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? '作成に失敗しました')
    }
  }

  const startEdit = (id: number, name: string) => {
    setEditId(id); setEditName(name)
  }

  const handleUpdate = async (id: number) => {
    try {
      await locationService.update(id, editName.trim())
      toast.success('更新しました')
      setEditId(null); refresh()
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? '更新に失敗しました')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await locationService.delete(deleteTarget.id)
      toast.success('削除しました')
      setDeleteTarget(null); refresh()
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? '削除に失敗しました')
      setDeleteTarget(null)
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="page-title">保管場所管理</h1>

      <form onSubmit={handleCreate} className="card space-y-3 p-5" data-testid="location-create-form">
        <h2 className="section-title">新しい保管場所を作成</h2>
        <div className="flex gap-2">
          <input
            type="text" placeholder="保管場所名（例: 棚A-1）" value={newName}
            onChange={(e) => setNewName(e.target.value)} required
            className="input flex-1"
            data-testid="location-name-input"
          />
          <button type="submit" className="btn-primary" data-testid="location-create-button">
            <Plus size={16} /> 作成
          </button>
        </div>
      </form>

      <ul className="space-y-2.5" data-testid="location-list">
        {locations?.map((loc) => (
          <li key={loc.id} className="card p-4">
            {editId === loc.id ? (
              <div className="flex items-center gap-2">
                <input
                  value={editName} onChange={(e) => setEditName(e.target.value)}
                  className="input flex-1"
                />
                <button onClick={() => handleUpdate(loc.id)} className="btn-primary px-3 py-2">
                  <Check size={16} />
                </button>
                <button onClick={() => setEditId(null)} className="btn-secondary px-3 py-2">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-500">
                    <MapPin size={15} />
                  </span>
                  <p className="font-medium text-ink">{loc.name}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => startEdit(loc.id, loc.name)}
                    className="rounded-lg p-2 text-ink-faint transition-colors hover:bg-paper-dark hover:text-brand-600"
                    data-testid={`location-edit-button-${loc.id}`}
                    aria-label="編集"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget({ id: loc.id, name: loc.name })}
                    className="rounded-lg p-2 text-ink-faint transition-colors hover:bg-clay-50 hover:text-clay-600"
                    data-testid={`location-delete-button-${loc.id}`}
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
        title="保管場所の削除"
        message={`「${deleteTarget?.name}」を削除しますか？`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
