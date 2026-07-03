import { notFound } from 'next/navigation'
import { obtenerTareaPorId } from '@/lib/actions/tasks'
import EditarTareaClient from './EditarTareaClient'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditarTareaPage({ params }: Props) {
  const { id } = await params
  const tarea = await obtenerTareaPorId(id)

  if (!tarea || !tarea.is_active) {
    notFound()
  }

  return <EditarTareaClient tarea={tarea} />
}
