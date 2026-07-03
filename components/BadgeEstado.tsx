import type { TaskStatus } from '@/lib/types'

const colores: Record<TaskStatus, string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-300',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-300',
  completed: 'bg-green-100 text-green-800 border-green-300',
  cancelled: 'bg-red-100 text-red-800 border-red-300',
}

const etiquetas: Record<TaskStatus, string> = {
  pending: 'Pendiente',
  in_progress: 'En progreso',
  completed: 'Completada',
  cancelled: 'Cancelada',
}

export default function BadgeEstado({ status }: { status: TaskStatus }) {
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colores[status]}`}
    >
      {etiquetas[status]}
    </span>
  )
}
