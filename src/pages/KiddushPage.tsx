import KiddushCard from '../components/KiddushCard'
import { kiddushDates } from '../data/sampleData'

function KiddushPage() {
  return (
    <div>
      <p className="mb-5 text-sm leading-6 text-slate-500">
        Se vem som står för kommande kiddush eller boka ett
        ledigt datum.
      </p>

      <div className="space-y-3">
        {kiddushDates.map((item) => (
          <KiddushCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}

export default KiddushPage