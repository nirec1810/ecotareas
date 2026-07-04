'use client'

import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import type { Task } from '@/lib/types'
import { tiposTarea } from '@/lib/schemas'

interface Props {
  onSubmit: (formData: FormData) => Promise<{
    success?: false
    errors?: Record<string, string[] | undefined>
    message?: string
  } | undefined>
  initialData?: Task
}

const etiquetasTipo: Record<string, string> = {
  reforestacion: 'Reforestación',
  limpieza: 'Limpieza',
  educacion: 'Educación',
  reciclaje: 'Reciclaje',
  otro: 'Otro',
}

export default function TareaForm({ onSubmit, initialData }: Props) {
  const router = useRouter()

  const [state, action, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      return await onSubmit(formData)
    },
    null
  )

  const errors = state && 'errors' in state ? (state as { errors: Record<string, string[] | undefined> }).errors : {}

  return (
    <form action={action} className="space-y-5">
      {state && 'message' in state && state.message && !('errors' in state) && (
        <div className="p-3 rounded bg-red-50 border border-red-200 text-red-700 text-sm">
          {state.message}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-dark-carbon mb-1">
          Título *
        </label>
        <input
          id="title"
          name="title"
          type="text"
          defaultValue={initialData?.title ?? ''}
          className={`w-full px-3 py-2 border rounded text-sm ${errors?.title ? 'border-red-500' : 'border-medium-gray/30'} focus:outline-none focus:ring-2 focus:ring-forest-green`}
        />
        {errors?.title && (
          <p className="mt-1 text-xs text-red-600">{errors.title[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-dark-carbon mb-1">
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={initialData?.description ?? ''}
          className={`w-full px-3 py-2 border rounded text-sm ${errors?.description ? 'border-red-500' : 'border-medium-gray/30'} focus:outline-none focus:ring-2 focus:ring-forest-green`}
        />
        {errors?.description && (
          <p className="mt-1 text-xs text-red-600">{errors.description[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-dark-carbon mb-1">
          Tipo de actividad *
        </label>
        <select
          id="type"
          name="type"
          defaultValue={initialData?.type ?? ''}
          className={`w-full px-3 py-2 border rounded text-sm ${errors?.type ? 'border-red-500' : 'border-medium-gray/30'} focus:outline-none focus:ring-2 focus:ring-forest-green`}
        >
          <option value="" disabled>
            Selecciona un tipo
          </option>
          {tiposTarea.map((t) => (
            <option key={t} value={t}>
              {etiquetasTipo[t]}
            </option>
          ))}
        </select>
        {errors?.type && (
          <p className="mt-1 text-xs text-red-600">{errors.type[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-dark-carbon mb-1">
          Ubicación *
        </label>
        <input
          id="location"
          name="location"
          type="text"
          placeholder="Ej: Parque Central, Av. Siempre Viva"
          defaultValue={initialData?.location ?? ''}
          className={`w-full px-3 py-2 border rounded text-sm ${errors?.location ? 'border-red-500' : 'border-medium-gray/30'} focus:outline-none focus:ring-2 focus:ring-forest-green`}
        />
        {errors?.location && (
          <p className="mt-1 text-xs text-red-600">{errors.location[0]}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="latitude" className="block text-sm font-medium text-dark-carbon mb-1">
            Latitud
          </label>
          <input
            id="latitude"
            name="latitude"
            type="number"
            step="any"
            placeholder="-34.6037"
            defaultValue={initialData?.latitude ?? ''}
            className="w-full px-3 py-2 border border-medium-gray/30 rounded text-sm focus:outline-none focus:ring-2 focus:ring-forest-green"
          />
        </div>
        <div>
          <label htmlFor="longitude" className="block text-sm font-medium text-dark-carbon mb-1">
            Longitud
          </label>
          <input
            id="longitude"
            name="longitude"
            type="number"
            step="any"
            placeholder="-58.3816"
            defaultValue={initialData?.longitude ?? ''}
            className="w-full px-3 py-2 border border-medium-gray/30 rounded text-sm focus:outline-none focus:ring-2 focus:ring-forest-green"
          />
        </div>
      </div>

      <div>
        <label htmlFor="scheduled_date" className="block text-sm font-medium text-dark-carbon mb-1">
          Fecha y hora *
        </label>
        <input
          id="scheduled_date"
          name="scheduled_date"
          type="datetime-local"
          defaultValue={
            initialData?.scheduled_date
              ? new Date(initialData.scheduled_date).toISOString().slice(0, 16)
              : ''
          }
          className={`w-full px-3 py-2 border rounded text-sm ${errors?.scheduled_date ? 'border-red-500' : 'border-medium-gray/30'} focus:outline-none focus:ring-2 focus:ring-forest-green`}
        />
        {errors?.scheduled_date && (
          <p className="mt-1 text-xs text-red-600">{errors.scheduled_date[0]}</p>
        )}
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="px-5 py-2 bg-forest-green text-white rounded text-sm font-medium hover:bg-[#14532d] transition-colors disabled:opacity-50"
        >
          {pending ? 'Guardando...' : initialData ? 'Guardar cambios' : 'Crear tarea'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          disabled={pending}
          className="px-5 py-2 border border-gray-200 text-medium-gray rounded text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
