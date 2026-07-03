'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { subirEvidencia, listarEvidenciasPorTarea } from '@/lib/actions/evidences'
import type { Evidence } from '@/lib/types'

export default function SubirEvidencia({ taskId }: { taskId: string }) {
  const [evidencias, setEvidencias] = useState<Evidence[]>([])
  const [preview, setPreview] = useState<string | null>(null)
  const [archivo, setArchivo] = useState<File | null>(null)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [geoError, setGeoError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const cargar = useCallback(async () => {
    try {
      const data = await listarEvidenciasPorTarea(taskId)
      setEvidencias(data)
    } catch {}
  }, [taskId])

  useEffect(() => {
    cargar()
  }, [cargar])

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError('Geolocalización no disponible')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      },
      () => {
        setGeoError('No se pudo obtener la ubicación')
      }
    )
  }, [])

  const handleArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setArchivo(file)
    setMensaje('')
    setError('')

    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!archivo) return

    setEnviando(true)
    setMensaje('')
    setError('')

    const formData = new FormData()
    formData.set('image', archivo)
    formData.set('taskId', taskId)
    if (coords) {
      formData.set('latitude', coords.lat.toString())
      formData.set('longitude', coords.lng.toString())
    }

    const result = await subirEvidencia(formData)

    if (result.success) {
      setMensaje(result.message)
      setArchivo(null)
      setPreview(null)
      await cargar()
      router.refresh()
    } else {
      setError(result.message)
    }

    setEnviando(false)
  }

  return (
    <div className="border-t border-gray-100 pt-4">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Evidencia fotográfica
      </h3>

      {evidencias.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          {evidencias.map((ev) => (
            <div key={ev.id} className="relative group">
              <img
                src={ev.image_url}
                alt="Evidencia"
                className="w-full h-32 object-cover rounded border border-gray-200"
              />
              {ev.latitude && ev.longitude && (
                <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                  {ev.latitude.toFixed(4)}, {ev.longitude.toFixed(4)}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {evidencias.length === 0 && (
        <p className="text-sm text-gray-400 mb-3">No hay evidencia todavía</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {preview && (
          <img
            src={preview}
            alt="Vista previa"
            className="w-full max-w-xs h-40 object-cover rounded border border-gray-200"
          />
        )}

        <div className="flex items-center gap-3">
          <label className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={handleArchivo}
              className="hidden"
              disabled={enviando}
            />
            <span className="inline-block px-4 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors">
              {archivo ? archivo.name : 'Seleccionar imagen'}
            </span>
          </label>
          <button
            type="submit"
            disabled={!archivo || enviando}
            className="px-4 py-2 bg-green-700 text-white rounded text-sm font-medium hover:bg-green-800 transition-colors disabled:opacity-50"
          >
            {enviando ? 'Subiendo...' : 'Subir'}
          </button>
        </div>

        {!coords && geoError && (
          <p className="text-xs text-amber-600">{geoError}</p>
        )}
        {coords && (
          <p className="text-xs text-gray-400">
            Ubicación: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
          </p>
        )}
      </form>

      {mensaje && (
        <p className="mt-2 text-xs text-green-600">{mensaje}</p>
      )}
      {error && (
        <p className="mt-2 text-xs text-red-600">{error}</p>
      )}
    </div>
  )
}
