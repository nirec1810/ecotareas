'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { esquemaRegistro, esquemaLogin, esquemaPassword } from '@/lib/schemas'

export async function registrarUsuario(formData: FormData) {
  const supabase = await createClient()

  const raw = Object.fromEntries(formData.entries())
  const parsed = esquemaRegistro.safeParse(raw)

  if (!parsed.success) {
    return {
      success: false as const,
      errors: parsed.error.flatten().fieldErrors,
      message: 'Corrige los errores del formulario',
    }
  }

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.full_name,
        role: 'volunteer',
      },
    },
  })

  if (error) {
    if (error.message.includes('already registered') || error.message.includes('User already')) {
      return {
        success: false as const,
        message: 'Este correo electrónico ya está registrado',
      }
    }
    return {
      success: false as const,
      message: 'Error al registrar: ' + error.message,
    }
  }

  if (!data.user) {
    return {
      success: false as const,
      message: 'No se pudo crear el usuario',
    }
  }

  redirect('/mis-tareas')
}

export async function iniciarSesion(formData: FormData) {
  const supabase = await createClient()

  const raw = Object.fromEntries(formData.entries())
  const parsed = esquemaLogin.safeParse(raw)

  if (!parsed.success) {
    return {
      success: false as const,
      errors: parsed.error.flatten().fieldErrors,
      message: 'Corrige los errores del formulario',
    }
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    return {
      success: false as const,
      message: 'Credenciales inválidas',
    }
  }

  const user = data.user
  if (!user) {
    return {
      success: false as const,
      message: 'Error al iniciar sesión',
    }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role

  if (role === 'coordinator') {
    redirect('/tareas')
  }

  redirect('/mis-tareas')
}

export async function cerrarSesion() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function solicitarRecuperacion(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string

  if (!email || !email.includes('@')) {
    return {
      success: false as const,
      message: 'Ingresa un correo electrónico válido',
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/actualizar-password`,
  })

  if (error) {
    return {
      success: false as const,
      message: 'Error al enviar el correo: ' + error.message,
    }
  }

  return {
    success: true as const,
    message: 'Si el correo está registrado, recibirás un enlace para recuperar tu contraseña',
  }
}

export async function actualizarPassword(formData: FormData) {
  const supabase = await createClient()

  const raw = Object.fromEntries(formData.entries())
  const parsed = esquemaPassword.safeParse(raw)

  if (!parsed.success) {
    return {
      success: false as const,
      errors: parsed.error.flatten().fieldErrors,
      message: 'Corrige los errores del formulario',
    }
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  })

  if (error) {
    return {
      success: false as const,
      message: 'Error al actualizar la contraseña: ' + error.message,
    }
  }

  redirect('/login?recuperado=1')
}
