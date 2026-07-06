'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { actualizarPerfil, subirAvatar } from '@/lib/actions/profile'
import type { Profile } from '@/lib/types'

interface Props {
  perfil: Profile
}

export default function FormularioPerfil({ perfil }: Props) {
  const [nombre, setNombre] = useState(perfil.full_name)
  const [telefono, setTelefono] = useState(perfil.phone ?? '')
  const [bio, setBio] = useState(perfil.bio ?? '')
  const [avatar, setAvatar] = useState<File | null>(null)
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(perfil.avatar_url)
  const [enviando, setEnviando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleAvatar = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setAvatar(file)
    const reader = new FileReader()
    reader.onload = (ev) => setPreviewAvatar(ev.target?.result as string)
    reader.readAsDataURL(file)
  }, [])

  const handleGuardarPerfil = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setEnviando(true)
    setMensaje('')
    setError('')

    if (avatar) {
      const fd = new FormData()
      fd.set('avatar', avatar)
      const avatarResult = await subirAvatar(fd)
      if (avatarResult.success && avatarResult.avatar_url) {
        setPreviewAvatar(avatarResult.avatar_url)
      }
    }

    const formData = new FormData()
    formData.set('full_name', nombre)
    formData.set('phone', telefono || '')
    formData.set('bio', bio || '')

    const result = await actualizarPerfil(formData)

    if (result.success) {
      setMensaje(result.message)
      router.refresh()
    } else {
      setError(result.message)
    }

    setEnviando(false)
  }, [nombre, telefono, bio, avatar, router])

  return (
    <form onSubmit={handleGuardarPerfil} className="space-y-6">
      {mensaje && (
        <div className="p-2 rounded bg-eco-green/10 border border-eco-green/30 text-forest-green text-xs">
          {mensaje}
        </div>
      )}
      {error && (
        <div className="p-2 rounded bg-red-50 border border-red-200 text-red-700 text-xs">
          {error}
        </div>
      )}

      <div className="flex items-center gap-6">
        <div className="shrink-0">
          {previewAvatar ? (
            <img src={previewAvatar} alt="Avatar" className="w-20 h-20 rounded-full object-cover border border-gray-200" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-forest-green/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-forest-green">
                {nombre.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div>
          <label className="block">
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatar}
              className="hidden"
            />
            <span className="text-sm text-forest-green font-medium hover:text-[#14532d] cursor-pointer transition-colors">
              Cambiar foto
            </span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-medium-gray uppercase tracking-wide mb-1">
          Nombre completo
        </label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          className="w-full border border-gray-200 rounded px-3 py-2 text-sm text-dark-carbon focus:outline-none focus:ring-2 focus:ring-forest-green/30 focus:border-forest-green"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-medium-gray uppercase tracking-wide mb-1">
          Teléfono
        </label>
        <input
          type="tel"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          placeholder="Opcional"
          className="w-full border border-gray-200 rounded px-3 py-2 text-sm text-dark-carbon placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-green/30 focus:border-forest-green"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-medium-gray uppercase tracking-wide mb-1">
          Biografía
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          placeholder="Contanos sobre vos..."
          className="w-full border border-gray-200 rounded px-3 py-2 text-sm text-dark-carbon placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-forest-green/30 focus:border-forest-green resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={enviando}
        className="px-4 py-2 rounded text-sm font-medium bg-forest-green text-white hover:bg-[#14532d] transition-colors disabled:opacity-50"
      >
        {enviando ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  )
}
