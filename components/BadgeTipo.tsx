import type { TaskType } from '@/lib/types'

const colores: Record<TaskType, string> = {
  reforestacion: 'bg-[#4ADE80]/20 text-[#166534] border-[#4ADE80]',
  limpieza: 'bg-[#60A5FA]/20 text-[#1e40af] border-[#60A5FA]',
  educacion: 'bg-purple-100 text-purple-800 border-purple-300',
  reciclaje: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  otro: 'bg-gray-100 text-gray-800 border-gray-300',
}

const etiquetas: Record<TaskType, string> = {
  reforestacion: 'Reforestación',
  limpieza: 'Limpieza',
  educacion: 'Educación',
  reciclaje: 'Reciclaje',
  otro: 'Otro',
}

export default function BadgeTipo({ type }: { type: TaskType }) {
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colores[type]}`}
    >
      {etiquetas[type]}
    </span>
  )
}
