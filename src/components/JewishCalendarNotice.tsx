import { MoonStar } from 'lucide-react'
import { getTodayEvents } from '../utils/hebcal'

type JewishCalendarNoticeProps = {
  dateValue?: string
}

function JewishCalendarNotice({
  dateValue,
}: JewishCalendarNoticeProps) {
  if (!dateValue) {
    return null
  }

  const date = new Date(
    `${dateValue}T12:00:00`,
  )

  const roshChodeshEvent =
    getTodayEvents(date).find((event) =>
      event
        .getDesc()
        .startsWith('Rosh Chodesh'),
    )

  if (!roshChodeshEvent) {
    return null
  }

  return (
    <article className="rounded-3xl bg-sky-50 px-5 py-4 shadow-sm ring-1 ring-sky-200">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-[#183b70]">
          <MoonStar className="h-5 w-5" />
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-sky-700">
            Rosh Chodesh
          </p>

          <h2 className="mt-1 font-bold text-[#183b70]">
            {roshChodeshEvent.getDesc()}
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-600">
            Tillägg i dagens tefilah.
          </p>
        </div>
      </div>
    </article>
  )
}

export default JewishCalendarNotice