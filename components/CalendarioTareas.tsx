'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay, addMonths, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import type { Task } from '@/lib/types'

const locales = { 'es': es }

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
})

interface Props {
  tareas: Task[]
}

export default function CalendarioTareas({ tareas }: Props) {
  const [vista, setVista] = useState<'month' | 'week'>('month')
  const router = useRouter()

  const eventos = useMemo(() => {
    return tareas.map((tarea) => ({
      id: tarea.id,
      title: tarea.title,
      start: new Date(tarea.scheduled_date),
      end: new Date(tarea.scheduled_date),
      resource: tarea,
    }))
  }, [tareas])

  const mensajes = {
    date: 'Fecha',
    time: 'Hora',
    event: 'Evento',
    allDay: 'Todo el día',
    week: 'Semana',
    workWeek: 'Semana laboral',
    day: 'Día',
    month: 'Mes',
    previous: 'Anterior',
    next: 'Siguiente',
    today: 'Hoy',
    agenda: 'Agenda',
    noEventsInRange: 'No hay tareas programadas',
    showMore: (total: number) => `+ ${total} más`,
  }

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setVista('month')}
          className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
            vista === 'month'
              ? 'bg-forest-green text-white border-forest-green'
              : 'border-gray-200 text-medium-gray hover:bg-gray-50'
          }`}
        >
          Mensual
        </button>
        <button
          onClick={() => setVista('week')}
          className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
            vista === 'week'
              ? 'bg-forest-green text-white border-forest-green'
              : 'border-gray-200 text-medium-gray hover:bg-gray-50'
          }`}
        >
          Semanal
        </button>
      </div>

      <div style={{ height: 600 }}>
        <Calendar
          localizer={localizer}
          events={eventos}
          startAccessor="start"
          endAccessor="end"
          view={vista}
          onView={(v) => setVista(v as 'month' | 'week')}
          views={['month', 'week']}
          messages={mensajes}
          culture="es"
          onSelectEvent={(event) => router.push(`/tareas/${event.id}`)}
          style={{ height: '100%' }}
        />
      </div>
    </div>
  )
}
