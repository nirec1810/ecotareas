'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Link from 'next/link'
import type { Task } from '@/lib/types'

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const etiquetasEstado: Record<string, string> = {
  pending: 'Pendiente',
  in_progress: 'En progreso',
  completed: 'Completada',
  cancelled: 'Cancelada',
}

const etiquetasTipo: Record<string, string> = {
  reforestacion: 'Reforestación',
  limpieza: 'Limpieza',
  educacion: 'Educación',
  reciclaje: 'Reciclaje',
  otro: 'Otro',
}

export default function MapaTareas({ tareas }: { tareas: Task[] }) {
  const puntos = tareas.filter(
    (t) => t.latitude !== null && t.longitude !== null
  )

  const bounds = puntos.length > 0
    ? L.latLngBounds(puntos.map((t) => [t.latitude!, t.longitude!]))
    : L.latLngBounds([-34.6, -58.4], [-34.5, -58.3])

  return (
    <MapContainer
      bounds={bounds}
      scrollWheelZoom={true}
      style={{ height: '70vh', width: '100%', borderRadius: '0.5rem' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {puntos.map((tarea) => (
        <Marker
          key={tarea.id}
          position={[tarea.latitude!, tarea.longitude!]}
        >
          <Popup>
            <div className="min-w-[180px]">
              <h3 className="font-semibold text-sm text-gray-900 mb-1">{tarea.title}</h3>
              <p className="text-xs text-gray-600 mb-1">
                {etiquetasTipo[tarea.type]} · {etiquetasEstado[tarea.status]}
              </p>
              <Link
                href={`/tareas/${tarea.id}`}
                className="text-xs text-green-700 hover:underline font-medium"
              >
                Ver detalle →
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
