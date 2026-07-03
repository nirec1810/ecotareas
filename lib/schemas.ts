import { z } from 'zod'

export const tiposTarea = ['reforestacion', 'limpieza', 'educacion', 'reciclaje', 'otro'] as const

export const esquemaTarea = z.object({
  title: z.string().min(1, 'El título es obligatorio').max(200, 'Máximo 200 caracteres'),
  description: z.string().max(2000, 'Máximo 2000 caracteres').optional().nullable().default(null),
  type: z.enum(tiposTarea, { message: 'Selecciona un tipo de actividad' }),
  location: z.string().min(1, 'La ubicación es obligatoria'),
  latitude: z.coerce.number().min(-90).max(90).optional().nullable().default(null),
  longitude: z.coerce.number().min(-180).max(180).optional().nullable().default(null),
  scheduled_date: z.string().min(1, 'La fecha es obligatoria'),
})

export type TareaInput = z.infer<typeof esquemaTarea>

export const esquemaRegistro = z.object({
  full_name: z.string().min(2, 'El nombre es obligatorio').max(100, 'Máximo 100 caracteres'),
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmar_password: z.string(),
}).refine((d) => d.password === d.confirmar_password, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmar_password'],
})

export type RegistroInput = z.infer<typeof esquemaRegistro>

export const esquemaLogin = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
})

export type LoginInput = z.infer<typeof esquemaLogin>

export const esquemaPassword = z.object({
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmar_password: z.string(),
}).refine((d) => d.password === d.confirmar_password, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmar_password'],
})
