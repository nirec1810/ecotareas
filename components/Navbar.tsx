'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cerrarSesion } from '@/lib/actions/auth'

interface Props {
  profile: {
    id: string
    full_name: string
    role: 'coordinator' | 'volunteer'
    avatar_url: string | null
  } | null
}

export default function Navbar({ profile }: Props) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/tareas') return pathname === '/tareas' || pathname.startsWith('/tareas/')
    if (href === '/mis-tareas') return pathname === '/mis-tareas' || pathname.startsWith('/mis-tareas/')
    if (href === '/dashboard') return pathname === '/dashboard'
    if (href === '/calendario') return pathname === '/calendario'
    if (href === '/usuarios') return pathname === '/usuarios'
    if (href === '/ranking') return pathname === '/ranking'
    return pathname === href
  }

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href={profile?.role === 'coordinator' ? '/tareas' : '/mis-tareas'}
          className="text-xl font-bold text-eco-green"
        >
          EcoTareas
        </Link>

        {profile ? (
          <div className="flex items-center gap-4 text-sm">
            <span className="text-medium-gray hidden sm:inline">
              {profile.full_name}
            </span>

            {profile.role === 'coordinator' && (
              <>
                <Link
                  href="/tareas"
                  className={`px-1 pb-1 border-b-2 transition-colors ${
                    isActive('/tareas')
                      ? 'text-forest-green border-forest-green'
                      : 'text-dark-carbon border-transparent hover:text-forest-green'
                  }`}
                >
                  Tareas
                </Link>
                <Link
                  href="/dashboard"
                  className={`px-1 pb-1 border-b-2 transition-colors ${
                    isActive('/dashboard')
                      ? 'text-forest-green border-forest-green'
                      : 'text-dark-carbon border-transparent hover:text-forest-green'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/calendario"
                  className={`px-1 pb-1 border-b-2 transition-colors ${
                    isActive('/calendario')
                      ? 'text-forest-green border-forest-green'
                      : 'text-dark-carbon border-transparent hover:text-forest-green'
                  }`}
                >
                  Calendario
                </Link>
                <Link
                  href="/usuarios"
                  className={`px-1 pb-1 border-b-2 transition-colors ${
                    isActive('/usuarios')
                      ? 'text-forest-green border-forest-green'
                      : 'text-dark-carbon border-transparent hover:text-forest-green'
                  }`}
                >
                  Usuarios
                </Link>
                <Link
                  href="/mapa"
                  className={`px-1 pb-1 border-b-2 transition-colors ${
                    isActive('/mapa')
                      ? 'text-forest-green border-forest-green'
                      : 'text-dark-carbon border-transparent hover:text-forest-green'
                  }`}
                >
                  Mapa
                </Link>
                <Link
                  href="/tareas/nueva"
                  className="bg-forest-green text-white px-3 py-1.5 rounded font-medium hover:bg-[#14532d] transition-colors"
                >
                  Nueva tarea
                </Link>
              </>
            )}

            {profile.role === 'volunteer' && (
              <>
                <Link
                  href="/mis-tareas"
                  className={`px-1 pb-1 border-b-2 transition-colors ${
                    isActive('/mis-tareas')
                      ? 'text-forest-green border-forest-green'
                      : 'text-dark-carbon border-transparent hover:text-forest-green'
                  }`}
                >
                  Mis tareas
                </Link>
                <Link
                  href="/ranking"
                  className={`px-1 pb-1 border-b-2 transition-colors ${
                    isActive('/ranking')
                      ? 'text-forest-green border-forest-green'
                      : 'text-dark-carbon border-transparent hover:text-forest-green'
                  }`}
                >
                  Ranking
                </Link>
              </>
            )}

            <Link
              href="/perfil"
              className={`px-1 pb-1 border-b-2 transition-colors ${
                isActive('/perfil')
                  ? 'text-forest-green border-forest-green'
                  : 'text-dark-carbon border-transparent hover:text-forest-green'
              }`}
            >
              Perfil
            </Link>

            <form action={cerrarSesion}>
              <button
                type="submit"
                className="text-sm text-medium-gray hover:text-dark-carbon transition-colors"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-sm">
            <Link href="/login" className="text-dark-carbon hover:text-forest-green transition-colors">
              Iniciar sesión
            </Link>
            <Link
              href="/registro"
              className="bg-forest-green text-white px-3 py-1.5 rounded font-medium hover:bg-[#14532d] transition-colors"
            >
              Registrarse
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
