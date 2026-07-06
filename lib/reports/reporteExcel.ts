import * as XLSX from 'xlsx'
import type { ImpactIndicators } from '@/lib/types'

export function generarReporteExcel(indicadores: ImpactIndicators) {
  const ws = XLSX.utils.aoa_to_sheet([
    ['Reporte de Impacto - EcoTareas'],
    [],
    ['Indicador', 'Valor'],
    ['Tareas completadas', indicadores.tareasCompletadas],
    ['Voluntarios participantes', indicadores.voluntariosParticipantes],
    ['Árboles plantados', indicadores.arbolesPlantados],
    ['Residuos recolectados (kg)', indicadores.residuosRecolectados],
  ])

  ws['!cols'] = [{ wch: 30 }, { wch: 15 }]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Impacto')

  XLSX.writeFile(wb, `reporte-impacto-${Date.now()}.xlsx`)
}
