import Link from 'next/link'
import { cerrarSesion } from '@/lib/actions/auth'

interface Props {
  profile: {
    id: string
    full_name: string
    role: 'coordinator' | 'volunteer'
  } | null
}

export default function Navbar({ profile }: Props) {
  return (
    <nav className="bg-green-700 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href={profile?.role === 'coordinator' ? '/tareas' : '/mis-tareas'}
          className="text-xl font-bold tracking-tight"
        >
          EcoTareas
        </Link>

        {profile ? (
          <div className="flex items-center gap-4 text-sm">
            <span className="text-green-200 hidden sm:inline">
              {profile.full_name}
            </span>

            {profile.role === 'coordinator' && (
              <>
                <Link href="/tareas" className="hover:underline">
                  Tareas
                </Link>
                <Link href="/mapa" className="hover:underline">
                  Mapa
                </Link>
                <Link
                  href="/tareas/nueva"
                  className="bg-white text-green-700 px-3 py-1.5 rounded font-medium hover:bg-green-50 transition-colors"
                >
                  Nueva tarea
                </Link>
              </>
            )}

            {profile.role === 'volunteer' && (
              <Link href="/mis-tareas" className="hover:underline">
                Mis tareas
              </Link>
            )}

            <form action={cerrarSesion}>
              <button
                type="submit"
                className="text-sm text-green-200 hover:text-white transition-colors"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-sm">
            <Link href="/login" className="hover:underline">
              Iniciar sesión
            </Link>
            <Link
              href="/registro"
              className="bg-white text-green-700 px-3 py-1.5 rounded font-medium hover:bg-green-50 transition-colors"
            >
              Registrarse
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
