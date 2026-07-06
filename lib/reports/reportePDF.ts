import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { ImpactIndicators } from '@/lib/types'

export function generarReportePdf(indicadores: ImpactIndicators) {
  const doc = new jsPDF()

  doc.setFontSize(18)
  doc.text('Reporte de Impacto - EcoTareas', 14, 22)

  doc.setFontSize(10)
  doc.setTextColor(107, 114, 128)
  const fecha = new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date())
  doc.text(`Generado el ${fecha}`, 14, 30)

  autoTable(doc, {
    startY: 40,
    head: [['Indicador', 'Valor']],
    body: [
      ['Tareas completadas', String(indicadores.tareasCompletadas)],
      ['Voluntarios participantes', String(indicadores.voluntariosParticipantes)],
      ['Árboles plantados', String(indicadores.arbolesPlantados)],
      ['Residuos recolectados (kg)', String(indicadores.residuosRecolectados)],
    ],
    styles: { fontSize: 11 },
    headStyles: { fillColor: [22, 101, 52] },
    alternateRowStyles: { fillColor: [249, 250, 251] },
  })

  doc.save(`reporte-impacto-${Date.now()}.pdf`)
}
