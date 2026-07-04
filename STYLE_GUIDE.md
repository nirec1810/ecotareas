# Guía de Estilo — EcoTareas

## Paleta de Colores

| Token CSS | Hex | Tailwind | Uso |
|-----------|-----|----------|-----|
| `--color-eco-green` | `#4ADE80` | `text-eco-green`, `bg-eco-green/*` | Logotipo, badges "Completada", alertas de éxito |
| `--color-forest-green` | `#166534` | `bg-forest-green`, `text-forest-green` | Botones principales, pestaña activa, enlaces, badges |
| `--color-sky-blue` | `#60A5FA` | Via `bg-[#60A5FA]/*` | Badge "En progreso", acentos |
| `--color-light-gray` | `#F9FAFB` | `bg-light-gray` | Fondo de página principal, fondos de comentarios |
| `--color-bg-gray` | `#F3F4F6` | `bg-bg-gray` | Filas alternas en tablas, encabezados de tabla |
| `--color-dark-carbon` | `#111827` | `text-dark-carbon` | Texto principal, títulos, encabezados |
| `--color-medium-gray` | `#6B7280` | `text-medium-gray` | Texto secundario, etiquetas, placeholders |

## Tipografía

- **Fuente principal**: Geist Sans (`--font-geist-sans`) — todos los textos de UI
- **Fuente mono**: Geist Mono (`--font-geist-mono`) — código y coordenadas
- **Tamaños**: `text-xs` (labels, metadatos), `text-sm` (cuerpo, tablas), `text-base` (párrafos), `text-xl`/`text-2xl` (títulos)
- **Pesos**: `font-medium` (énfasis suave), `font-semibold` (subtítulos), `font-bold` (títulos)

## Patrones de UI

### Cards
```
bg-white rounded-xl shadow-sm border border-gray-200 p-6
```
Usado en: formularios, detalle de tareas, filtros, páginas de auth.

### Tabla
```html
<div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
  <table class="w-full text-sm">
    <thead class="bg-bg-gray text-dark-carbon text-xs uppercase tracking-wider font-semibold">
    <tbody class="divide-y divide-gray-200">
      <tr class="even:bg-bg-gray hover:bg-bg-gray/70 transition-colors">
```

### Botón Primario
```
bg-forest-green text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#14532d] transition-colors
```

### Botón Ghost
```
text-forest-green hover:bg-forest-green/5 font-medium px-3 py-1.5 rounded-lg transition-colors
```

### Botón Secundario (Cancelar)
```
border border-gray-200 text-medium-gray rounded text-sm font-medium hover:bg-gray-50 transition-colors
```

### Input / Select
```
w-full px-3 py-2 border border-medium-gray/30 rounded text-sm focus:outline-none focus:ring-2 focus:ring-forest-green
```
Error state: reemplazar `border-medium-gray/30` por `border-red-500`.

### Badges
```
inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border
```

Estados:
- `pending`: `bg-amber-100 text-amber-800 border-amber-300`
- `in_progress`: `bg-[#60A5FA]/20 text-[#1e40af] border-[#60A5FA]`
- `completed`: `bg-[#4ADE80]/20 text-[#166534] border-[#4ADE80]`
- `cancelled`: `bg-red-100 text-red-800 border-red-300`

Tipos:
- `reforestacion`: `bg-[#4ADE80]/20 text-[#166534] border-[#4ADE80]`
- `limpieza`: `bg-[#60A5FA]/20 text-[#1e40af] border-[#60A5FA]`
- `educacion`: `bg-purple-100 text-purple-800 border-purple-300`
- `reciclaje`: `bg-yellow-100 text-yellow-800 border-yellow-300`
- `otro`: `bg-gray-100 text-gray-800 border-gray-300`

### Paginación
```
Página activa: bg-forest-green text-white w-8 h-8 rounded
Página inactiva: text-dark-carbon hover:bg-gray-50 border border-gray-200 w-8 h-8 rounded
Botón Anterior/Siguiente: px-2.5 py-1.5 rounded border border-gray-200 text-dark-carbon hover:bg-gray-50
```

### Alertas
- **Éxito**: `bg-eco-green/10 border border-eco-green/30 text-forest-green`
- **Error**: `bg-red-50 border border-red-200 text-red-700`

### Navbar
```
Fondo: bg-white border-b border-gray-200 shadow-sm
Logo: text-eco-green font-bold
Enlaces: text-dark-carbon, active = text-forest-green + border-forest-green border-b-2
Botón CTA: bg-forest-green text-white
Nombre usuario: text-medium-gray
```

## Espaciado

- **Contenedor página**: `max-w-5xl mx-auto px-4 py-8` (tareas), `max-w-4xl` (mis-tareas), `max-w-2xl` (detalle), `max-w-xl` (formularios), `max-w-sm` (auth)
- **Entre secciones**: `gap-4`, `space-y-4`, `mt-4`, `mb-6`
- **Padding interno cards**: `p-6`
- **Padding inputs**: `px-3 py-2`

## Sombras

- `shadow-sm` — cards, contenedores
- `shadow-md` — hover en cards de mis-tareas
- `shadow-lg` — modales
