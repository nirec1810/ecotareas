import type { ReactNode } from 'react'

interface Props {
  titulo: string
  valor: string | number
  icono: ReactNode
}

export default function TarjetaIndicador({ titulo, valor, icono }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-forest-green/10 text-forest-green">
          {icono}
        </div>
        <div>
          <p className="text-xs font-semibold text-medium-gray uppercase tracking-wide">{titulo}</p>
          <p className="text-2xl font-bold text-dark-carbon">{valor}</p>
        </div>
      </div>
    </div>
  )
}
