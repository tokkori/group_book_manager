import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { bookService } from '@/services/bookService'
import { categoryService } from '@/services/categoryService'
import { locationService } from '@/services/locationService'
import { getApiErrorMessage } from '@/services/apiError'
import toast from 'react-hot-toast'

const currentYear = new Date().getFullYear()

const bookSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です').max(500, 'タイトルは500文字以内'),
  author: z.string().max(200).optional().or(z.literal('')),
  isbn: z.string().max(20).optional().or(z.literal('')),
  publisher: z.string().max(200).optional().or(z.literal('')),
  published_year: z.union([
    z.number().int().min(1000, `出版年は1000以上`).max(currentYear, `出版年は${currentYear}以下`),
    z.nan(),
    z.undefined(),
  ]).optional(),
  category_id: z.union([z.number().int().positive(), z.nan(), z.undefined()]).optional(),
  location_id: z.union([z.number().int().positive(), z.nan(), z.undefined()]).optional(),
})

type BookFormValues = z.infer<typeof bookSchema>

interface BookFormPageProps {
  mode: 'create' | 'edit'
}

export default function BookFormPage({ mode }: BookFormPageProps) {
  const { id } = useParams<{ id: string }>()
  const bookId = id ? Number(id) : undefined
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAll(),
  })

  const { data: locations } = useQuery({
    queryKey: ['locations'],
    queryFn: () => locationService.getAll(),
  })

  const { data: existingBook } = useQuery({
    queryKey: ['book', bookId],
    queryFn: () => bookService.getBook(bookId!),
    enabled: mode === 'edit' && !!bookId,
  })

  const {
    register, handleSubmit, reset, watch,
    formState: { errors, isSubmitting },
  } = useForm<BookFormValues>({
    resolver: zodResolver(bookSchema),
  })

  useEffect(() => {
    if (mode === 'edit' && existingBook) {
      reset({
        title: existingBook.title,
        author: existingBook.author ?? '',
        isbn: existingBook.isbn ?? '',
        publisher: existingBook.publisher ?? '',
        published_year: existingBook.published_year ?? undefined,
        category_id: existingBook.category?.id,
        location_id: existingBook.location?.id,
      })
    }
  }, [existingBook, mode, reset])

  const isbnValue = watch('isbn')

  const onSubmit = async (values: BookFormValues) => {
    const payload = {
      ...values,
      author: values.author || undefined,
      isbn: values.isbn || undefined,
      publisher: values.publisher || undefined,
      published_year: values.published_year && !isNaN(values.published_year as number)
        ? values.published_year : undefined,
      category_id: values.category_id && !isNaN(values.category_id as number)
        ? values.category_id : undefined,
      location_id: values.location_id && !isNaN(values.location_id as number)
        ? values.location_id : undefined,
    }

    try {
      if (mode === 'create') {
        const result = await bookService.createBook(payload)
        if (result.isbn_duplicate) {
          toast('ISBNが重複する書籍が既に登録されています', { icon: '⚠️' })
        }
        toast.success('書籍を登録しました')
        navigate(`/books/${result.id}`)
      } else {
        await bookService.updateBook(bookId!, payload)
        qc.invalidateQueries({ queryKey: ['book', bookId] })
        // 一覧画面に戻ったときに編集内容が反映されるようにする
        qc.invalidateQueries({ queryKey: ['books'] })
        toast.success('書籍を更新しました')
        navigate(`/books/${bookId}`)
      }
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, '保存に失敗しました'))
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="page-title mb-6">
        {mode === 'create' ? '書籍を登録' : '書籍を編集'}
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} data-testid="book-form" className="card space-y-4 p-6">
        <div>
          <label className="field-label">
            タイトル <span className="text-clay-600">*</span>
          </label>
          <input {...register('title')} className="input" data-testid="book-form-title-input" />
          {errors.title && <p className="mt-1 text-xs text-clay-600">{errors.title.message}</p>}
        </div>

        <div>
          <label className="field-label">著者</label>
          <input {...register('author')} className="input" data-testid="book-form-author-input" />
        </div>

        <div>
          <label className="field-label">ISBN</label>
          <input {...register('isbn')} className="input" data-testid="book-form-isbn-input" />
          {isbnValue && (
            <p className="mt-1 text-xs text-brass-600" data-testid="book-form-isbn-warning" style={{ display: 'none' }}>
              このISBNは既に登録されています
            </p>
          )}
        </div>

        <div>
          <label className="field-label">出版社</label>
          <input {...register('publisher')} className="input" data-testid="book-form-publisher-input" />
        </div>

        <div>
          <label className="field-label">出版年</label>
          <input
            type="number"
            {...register('published_year', { valueAsNumber: true })}
            min={1000}
            max={currentYear}
            className="input"
            data-testid="book-form-year-input"
          />
          {errors.published_year && <p className="mt-1 text-xs text-clay-600">{errors.published_year.message}</p>}
        </div>

        <div>
          <label className="field-label">カテゴリ</label>
          <select
            {...register('category_id', { valueAsNumber: true })}
            className="input"
            data-testid="book-form-category-select"
          >
            <option value="">カテゴリなし</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label">保管場所</label>
          <select
            {...register('location_id', { valueAsNumber: true })}
            className="input"
            data-testid="book-form-location-select"
          >
            <option value="">保管場所なし</option>
            {locations?.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3 border-t border-line/70 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary"
            data-testid="book-form-cancel-button"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
            data-testid="book-form-submit-button"
          >
            {isSubmitting ? '保存中...' : '保存'}
          </button>
        </div>
      </form>
    </div>
  )
}
