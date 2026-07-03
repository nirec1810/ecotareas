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
      <div className="mb-4">
        <Link
          href={`/tareas/${tarea.id}`}
          className="text-sm text-green-700 hover:underline"
        >
          &larr; Volver al detalle
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Editar tarea</h1>

      <TareaForm
        onSubmit={async (formData) => {
          return await actualizarTarea(tarea.id, formData)
        }}
        initialData={tarea}
      />

      <div className="mt-8 pt-6 border-t border-gray-200">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Zona de peligro
        </h2>
        <p className="text-sm text-gray-600 mb-3">
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
