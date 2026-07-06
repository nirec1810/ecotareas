import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { obtenerPerfil } from '@/lib/actions/profile'
import { obtenerInsigniasUsuario } from '@/lib/actions/gamification'
import FormularioPerfil from '@/components/FormularioPerfil'
import BadgeTipo from '@/components/BadgeTipo'
import type { Profile } from '@/lib/types'

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const perfil = await obtenerPerfil()
  if (!perfil) redirect('/login')

  const insignias = await obtenerInsigniasUsuario(perfil.id)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-dark-carbon mb-6">Mi perfil</h1>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <FormularioPerfil perfil={perfil} />
      </div>

      {insignias.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mt-4 p-6">
          <h2 className="text-sm font-semibold text-medium-gray uppercase tracking-wide mb-3">
            Mis insignias
          </h2>
          <div className="flex flex-wrap gap-3">
            {insignias.map((insignia) => (
              <div
                key={insignia.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest-green/10 text-forest-green text-xs font-medium"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {insignia.description}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mt-4 p-6">
        <h2 className="text-sm font-semibold text-medium-gray uppercase tracking-wide mb-3">
          Puntos acumulados
        </h2>
        <p className="text-3xl font-bold text-forest-green">{perfil.points}</p>
      </div>
    </div>
  )
}
