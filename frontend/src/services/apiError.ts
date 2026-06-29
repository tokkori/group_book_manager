// API エラーから表示用メッセージを安全に取り出す。
// FastAPI のバリデーションエラー(422)では detail が配列になるため、
// そのまま React で描画すると「Objects are not valid as a React child」で
// 画面が真っ白になる。ここで必ず文字列へ正規化する。
export function getApiErrorMessage(err: unknown, fallback: string): string {
  const detail = (err as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail

  if (typeof detail === 'string' && detail.trim()) {
    return detail
  }

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) =>
        item && typeof item === 'object' && 'msg' in item
          ? // Pydantic は "Value error, ..." を前置するため取り除く
            String((item as { msg: unknown }).msg).replace(/^Value error,\s*/, '')
          : null,
      )
      .filter((msg): msg is string => Boolean(msg))
    if (messages.length > 0) {
      return messages.join(' / ')
    }
  }

  return fallback
}
