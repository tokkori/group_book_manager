import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { locationService } from '@/services/locationService'
import ConfirmDialog from '@/components/ConfirmDialog'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react'

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
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-gray-800">保管場所管理</h1>

      <form onSubmit={handleCreate} className="bg-white rounded-lg border p-4 space-y-3" data-testid="location-create-form">
        <h2 className="font-medium text-gray-700">新しい保管場所を作成</h2>
        <div className="flex gap-2">
          <input
            type="text" placeholder="保管場所名（例: 棚A-1）" value={newName}
            onChange={(e) => setNewName(e.target.value)} required
            className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
            data-testid="location-name-input"
          />
          <button
            type="submit"
            className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
            data-testid="location-create-button"
          >
            <Plus size={16} /> 作成
          </button>
        </div>
      </form>

      <ul className="space-y-2" data-testid="location-list">
        {locations?.map((loc) => (
          <li key={loc.id} className="bg-white rounded-lg border p-3">
            {editId === loc.id ? (
              <div className="flex items-center gap-2">
                <input
                  value={editName} onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
                <button onClick={() => handleUpdate(loc.id)} className="p-1 text-green-600 hover:text-green-800">
                  <Check size={18} />
                </button>
                <button onClick={() => setEditId(null)} className="p-1 text-gray-400 hover:text-gray-600">
                  <X size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-800">{loc.name}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(loc.id, loc.name)}
                    className="p-1 text-gray-400 hover:text-blue-600"
                    data-testid={`location-edit-button-${loc.id}`}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget({ id: loc.id, name: loc.name })}
                    className="p-1 text-gray-400 hover:text-red-600"
                    data-testid={`location-delete-button-${loc.id}`}
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
