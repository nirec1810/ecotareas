import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { listarVoluntarios } from '@/lib/actions/users'
import ListaVoluntarios from '@/components/ListaVoluntarios'

export default async function UsuariosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'coordinator') redirect('/mis-tareas')

  const voluntarios = await listarVoluntarios()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-dark-carbon mb-6">Voluntarios</h1>
      <ListaVoluntarios voluntarios={voluntarios} />
    </div>
  )
}
