import { createClient } from '@/lib/supabase/server'

export default async function TestConexion() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('tasks').select('*').limit(1)

  return (
    <div>
      <h1>Test de conexión Supabase</h1>
      <p>Error: {error ? error.message : 'Ninguno ✅'}</p>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}