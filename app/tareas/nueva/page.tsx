import { crearTarea } from '@/lib/actions/tasks'
import TareaForm from '@/components/TareaForm'

export default function NuevaTarea() {
  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Nueva tarea</h1>
      <TareaForm onSubmit={crearTarea} />
    </div>
  )
}
