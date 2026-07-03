'use client'

import { useEffect } from 'react'

interface Props {
  abierto: boolean
  titulo: string
  mensaje: string
  onConfirmar: () => void
  onCancelar: () => void
  confirmando?: boolean
}

export default function ModalConfirmacion({
  abierto,
  titulo,
  mensaje,
  onConfirmar,
  onCancelar,
  confirmando = false,
}: Props) {
  useEffect(() => {
    if (!abierto) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancelar()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [abierto, onCancelar])

  if (!abierto) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 p-6">
        <h3 className="text-lg font-semibold text-gray-900">{titulo}</h3>
        <p className="mt-2 text-sm text-gray-600">{mensaje}</p>
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancelar}
            disabled={confirmando}
            className="px-4 py-2 text-sm rounded border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            disabled={confirmando}
            className="px-4 py-2 text-sm rounded bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {confirmando ? 'Desactivando...' : 'Sí, desactivar'}
          </button>
        </div>
      </div>
    </div>
  )
}
