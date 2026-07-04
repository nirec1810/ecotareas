import { crearTarea } from '@/lib/actions/tasks'
import TareaForm from '@/components/TareaForm'

export default function NuevaTarea() {
  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-dark-carbon mb-6">Nueva tarea</h1>
        <TareaForm onSubmit={crearTarea} />
      </div>
    </div>
  )
}
