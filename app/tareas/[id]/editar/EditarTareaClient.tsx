'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { actualizarTarea, desactivarTarea } from '@/lib/actions/tasks'
import TareaForm from '@/components/TareaForm'
import ModalConfirmacion from '@/components/ModalConfirmacion'
import type { Task } from '@/lib/types'

interface Props {
  tarea: Task
}

export default function EditarTareaClient({ tarea }: Props) {
  const [modalAbierto, setModalAbierto] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  const router = useRouter()

  const handleDesactivar = async () => {
    setConfirmando(true)
    await desactivarTarea(tarea.id)
    router.push('/tareas')
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <Link
        href={`/tareas/${tarea.id}`}
        className="inline-flex items-center gap-1 text-sm text-forest-green hover:text-[#14532d] font-medium mb-6"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Volver al detalle
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-dark-carbon mb-6">Editar tarea</h1>
        <TareaForm
          onSubmit={async (formData) => {
            return await actualizarTarea(tarea.id, formData)
          }}
          initialData={tarea}
        />
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <h2 className="text-xs font-semibold text-medium-gray uppercase tracking-wide mb-2">
          Zona de peligro
        </h2>
        <p className="text-sm text-medium-gray mb-3">
          Desactivar una tarea la oculta del listado sin eliminarla definitivamente.
        </p>
        <button
          type="button"
          onClick={() => setModalAbierto(true)}
          className="px-4 py-2 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 transition-colors"
        >
          Desactivar tarea
        </button>
      </div>

      <ModalConfirmacion
        abierto={modalAbierto}
        titulo="Desactivar tarea"
        mensaje={`¿Estás seguro de que querés desactivar "${tarea.title}"? Esta acción la ocultará del listado.`}
        onConfirmar={handleDesactivar}
        onCancelar={() => setModalAbierto(false)}
        confirmando={confirmando}
      />
    </div>
  )
}
