'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { confirmarCompletarTarea } from '@/lib/actions/tasks'

interface Props {
  taskId: string
  onCerrar: () => void
}

export default function FormularioMetricas({ taskId, onCerrar }: Props) {
  const [arboles, setArboles] = useState('')
  const [residuos, setResiduos] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [errores, setErrores] = useState<Record<string, string[]>>({})
  const router = useRouter()

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setEnviando(true)
    setError('')
    setErrores({})

    const formData = new FormData()
    formData.set('trees_planted', arboles || '0')
    formData.set('waste_kg', residuos || '0')

    const result = await confirmarCompletarTarea(taskId, formData)

    if (result.success) {
      router.refresh()
      onCerrar()
    } else {
      setError(result.message)
      if (result.errors) setErrores(result.errors)
    }

    setEnviando(false)
  }, [taskId, arboles, residuos, router, onCerrar])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
        <h2 className="text-lg font-bold text-dark-carbon mb-1">Impacto de la tarea</h2>
        <p className="text-sm text-medium-gray mb-4">
          Registrá los resultados de la brigada antes de completar.
        </p>

        {error && (
          <div className="mb-3 p-2 rounded bg-red-50 border border-red-200 text-red-700 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-medium-gray uppercase tracking-wide mb-1">
              Árboles plantados
            </label>
            <input
              type="number"
              min={0}
              max={99999}
              value={arboles}
              onChange={(e) => setArboles(e.target.value)}
              placeholder="0"
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm text-dark-carbon placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-green/30 focus:border-forest-green"
            />
            {errores.trees_planted && (
              <p className="mt-1 text-xs text-red-600">{errores.trees_planted[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-medium-gray uppercase tracking-wide mb-1">
              Residuos recolectados (kg)
            </label>
            <input
              type="number"
              min={0}
              max={999999}
              step={0.01}
              value={residuos}
              onChange={(e) => setResiduos(e.target.value)}
              placeholder="0"
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm text-dark-carbon placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-green/30 focus:border-forest-green"
            />
            {errores.waste_kg && (
              <p className="mt-1 text-xs text-red-600">{errores.waste_kg[0]}</p>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onCerrar}
              disabled={enviando}
              className="px-4 py-2 rounded text-sm font-medium border border-gray-200 text-medium-gray hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={enviando}
              className="px-4 py-2 rounded text-sm font-medium bg-forest-green text-white hover:bg-[#14532d] transition-colors disabled:opacity-50"
            >
              {enviando ? 'Guardando...' : 'Completar tarea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
