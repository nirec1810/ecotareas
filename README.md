# EcoTareas

Gestión de brigadas de voluntariado ambiental. Aplicación web con Next.js 16 + Supabase + Tailwind CSS v4.

## Funcionalidades

- **Autenticación** con roles (coordinator/volunteer), registro, login, recuperación de contraseña
- **CRUD de tareas** con tipos (reforestación, limpieza, educación, reciclaje, otro), ubicación con coordenadas, fechas programadas
- **Asignación de voluntarios** a tareas, cambio de estado (pendiente → en progreso → completada)
- **Evidencias fotográficas** con geolocalización, subidas a Supabase Storage
- **Comentarios** por tarea
- **Mapa interactivo** con Leaflet mostrando todas las tareas activas
- **Filtros** por estado, fecha y ubicación
- **Dashboard de impacto**: tareas completadas, voluntarios participantes, árboles plantados, residuos recolectados
- **Calendario de brigadas**: vista mensual/semanal con react-big-calendar
- **Reportes exportables**: PDF (jsPDF) y Excel (SheetJS)
- **Recordatorios**: tareas próximas en 24h visibles en el listado del voluntario
- **Perfil de usuario**: nombre, foto (bucket avatars), teléfono, biografía
- **Administración de cuentas**: coordinador puede activar/desactivar voluntarios, buscar por nombre/correo
- **Gamificación**: puntos por completar tareas (+10), subir evidencias (+2) y comentar (+1); 5 insignias por thresholds; ranking público
- **Auditoría**: historial inmutable de cambios sobre cada tarea

## Requisitos

- Node.js 20+
- Cuenta Supabase (gratuita)

## Instalación

```bash
npm install
cp .env.local.example .env.local  # Completar vars de Supabase
npm run dev
```

## Variables de entorno

```
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon_key]
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Base de datos

Ejecutar las migraciones SQL de los sprints en Supabase Studio (ver historial de sprints). No hay migraciones automáticas — el schema se aplica manualmente.

## Stack

Next.js 16 (proxy.ts middleware, Server Actions, App Router), Supabase (auth, PostgreSQL, Storage), Tailwind CSS v4, TypeScript, Zod, Leaflet, react-big-calendar, jsPDF, SheetJS.
