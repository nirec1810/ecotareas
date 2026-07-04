import type { TaskStatus } from '@/lib/types'

const colores: Record<TaskStatus, string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-300',
  in_progress: 'bg-[#60A5FA]/20 text-[#1e40af] border-[#60A5FA]',
  completed: 'bg-[#4ADE80]/20 text-[#166534] border-[#4ADE80]',
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
