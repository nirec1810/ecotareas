import { obtenerRanking } from '@/lib/actions/gamification'

export default async function RankingPage() {
  const ranking = await obtenerRanking()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-dark-carbon mb-6">Ranking de voluntarios</h1>

      {ranking.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg text-medium-gray">No hay voluntarios activos todavía</p>
        </div>
      ) : (
        <div className="space-y-3">
          {ranking.map((entry) => (
            <div
              key={entry.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
            >
              <div className="shrink-0 w-10 text-center">
                <span className={`text-lg font-bold ${
                  entry.position === 1 ? 'text-yellow-500' :
                  entry.position === 2 ? 'text-gray-400' :
                  entry.position === 3 ? 'text-amber-600' :
                  'text-medium-gray'
                }`}>
                  {entry.position}
                </span>
              </div>

              <div className="shrink-0">
                {entry.avatar_url ? (
                  <img src={entry.avatar_url} alt={entry.full_name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-forest-green/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-forest-green">
                      {entry.full_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-semibold text-dark-carbon truncate">{entry.full_name}</p>
                {entry.badges.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {entry.badges.map((badge) => (
                      <span
                        key={badge.id}
                        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-forest-green/10 text-forest-green text-[10px] font-medium"
                      >
                        <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {badge.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="shrink-0 text-right">
                <span className="text-xl font-bold text-forest-green">{entry.points}</span>
                <p className="text-[10px] text-medium-gray">puntos</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
