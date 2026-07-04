'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { listarComentariosPorTarea, crearComentario } from '@/lib/actions/comments'
import type { CommentWithAuthor } from '@/lib/types'

function formatearFecha(iso: string) {
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso))
}

export default function ComentariosTarea({ taskId }: { taskId: string }) {
  const [comentarios, setComentarios] = useState<CommentWithAuthor[]>([])
  const [contenido, setContenido] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const cargar = useCallback(async () => {
    try {
      const data = await listarComentariosPorTarea(taskId)
      setComentarios(data)
    } catch {
      setError('Error al cargar comentarios')
    }
  }, [taskId])

  useEffect(() => {
    cargar()
  }, [cargar])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmed = contenido.trim()
    if (!trimmed) return

    setEnviando(true)
    setError('')

    const formData = new FormData()
    formData.set('content', trimmed)

    const result = await crearComentario(taskId, formData)

    if (result.success) {
      setContenido('')
      await cargar()
      router.refresh()
    } else {
      setError(result.message)
    }

    setEnviando(false)
  }

  return (
    <div>
      <h3 className="text-xs font-semibold text-medium-gray uppercase tracking-wide mb-3">
        Comentarios
      </h3>

      {comentarios.length === 0 && (
        <p className="text-sm text-gray-400 mb-4">No hay comentarios todavía</p>
      )}

      {comentarios.length > 0 && (
        <div className="space-y-3 mb-4">
          {comentarios.map((c) => (
            <div key={c.id} className="bg-light-gray rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-7 h-7 rounded-full bg-forest-green text-white flex items-center justify-center text-xs font-bold">
                  {c.profiles?.full_name?.charAt(0) ?? '?'}
                </span>
                <span className="text-sm font-medium text-dark-carbon">
                  {c.profiles?.full_name ?? 'Desconocido'}
                </span>
                <span className="text-xs text-gray-400">
                  {formatearFecha(c.created_at)}
                </span>
              </div>
              <p className="text-sm text-medium-gray whitespace-pre-wrap ml-9">
                {c.content}
              </p>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
          placeholder="Escribí un comentario..."
          maxLength={2000}
          className="flex-1 px-3 py-2 border border-medium-gray/30 rounded text-sm focus:outline-none focus:ring-2 focus:ring-forest-green"
          disabled={enviando}
        />
        <button
          type="submit"
          disabled={enviando || !contenido.trim()}
          className="px-4 py-2 bg-forest-green text-white rounded text-sm font-medium hover:bg-[#14532d] transition-colors disabled:opacity-50"
        >
          {enviando ? '...' : 'Comentar'}
        </button>
      </form>

      {error && (
        <p className="mt-2 text-xs text-red-600">{error}</p>
      )}
    </div>
  )
}
