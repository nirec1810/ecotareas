'use client'

import type { ImpactIndicators } from '@/lib/types'
import { generarReportePdf } from '@/lib/reports/reportePDF'
import { generarReporteExcel } from '@/lib/reports/reporteExcel'

interface Props {
  indicadores: ImpactIndicators
}

export default function BotonesExportacion({ indicadores }: Props) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => generarReportePdf(indicadores)}
        className="px-4 py-2 rounded text-sm font-medium border border-gray-200 text-dark-carbon hover:bg-gray-50 transition-colors"
      >
        Exportar PDF
      </button>
      <button
        onClick={() => generarReporteExcel(indicadores)}
        className="px-4 py-2 rounded text-sm font-medium border border-gray-200 text-dark-carbon hover:bg-gray-50 transition-colors"
      >
        Exportar Excel
      </button>
    </div>
  )
}
