import {
  ArrowLeft,
  Bell,
  BookOpen,
  Megaphone,
  PartyPopper,
  Star,
  Landmark,
  Flame,
} from 'lucide-react'
import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from '../hooks/useAuth'
import {
  defaultNotificationPreferences,
  updateUserProfile,
  type NotificationPreferences,
} from '../firebase/users'
import {
  enablePushNotifications,
  getNotificationPermission,
  hasPushRegistration,
} from '../services/pushNotificationService'

type ProfilePageProps = {
  onBack: () => void
}

function ProfilePage({
  onBack,
}: ProfilePageProps) {
  const {
    firebaseUser,
    profile,
  } = useAuth()

  const initialPreferences =
    useMemo(
      () => ({
        ...defaultNotificationPreferences,
        ...(profile?.notificationPreferences ??
          {}),
      }),
      [
        profile?.notificationPreferences,
      ],
    )

  const [
    preferences,
    setPreferences,
  ] = useState<NotificationPreferences>(
    initialPreferences,
  )

  const [savingKey, setSavingKey] =
    useState<
      keyof NotificationPreferences | null
    >(null)

  const [error, setError] =
    useState('')

  const [
    pushPermission,
    setPushPermission,
  ] = useState(
    getNotificationPermission(),
  )

  const [
    enablingPush,
    setEnablingPush,
  ] = useState(false)

  const [
    pushMessage,
    setPushMessage,
  ] = useState('')

  const [
    pushRegistered,
    setPushRegistered,
  ] = useState(false)

  const [
    checkingPush,
    setCheckingPush,
  ] = useState(true)

  useEffect(() => {
    if (!firebaseUser) {
      return
    }

    let active = true

    async function checkPushRegistration() {
      try {
        const registered =
          await hasPushRegistration(
            firebaseUser!.uid,
          )

        if (!active) {
          return
        }

        if (registered) {
          setPushRegistered(true)
          setCheckingPush(false)
          return
        }

        /*
         * Webbläsaren har redan fått lov att
         * visa notiser men Firestore saknar FID.
         *
         * Kör register() igen. Firebase triggar
         * då onRegistered() med aktuell FID och
         * vår service laddar upp den på nytt.
         */
        if (
          getNotificationPermission() ===
          'granted'
        ) {
          await enablePushNotifications(
            firebaseUser!.uid,
          )

          if (!active) {
            return
          }

          setPushRegistered(true)
        } else {
          setPushRegistered(false)
        }
      } catch (caughtError) {
        console.error(
          'Kunde inte synka pushregistrering:',
          caughtError,
        )

        if (active) {
          setPushRegistered(false)
        }
      } finally {
        if (active) {
          setCheckingPush(false)
        }
      }
    }

    void checkPushRegistration()

    return () => {
      active = false
    }
  }, [firebaseUser])

  async function activatePush() {
    if (!firebaseUser) {
      return
    }

    setEnablingPush(true)
    setError('')
    setPushMessage('')

    try {
      await enablePushNotifications(
        firebaseUser.uid,
      )

      setPushPermission(
        getNotificationPermission(),
      )

      setPushRegistered(true)

      setPushMessage(
        'Pushnotiser är aktiverade på den här enheten.',
      )
    } catch (caughtError) {
      console.error(
        'Kunde inte aktivera pushnotiser:',
        caughtError,
      )

      if (caughtError instanceof Error) {
        console.error(
          'Push error details:',
          {
            name: caughtError.name,
            message: caughtError.message,
            stack: caughtError.stack,
            code:
              'code' in caughtError
                ? caughtError.code
                : undefined,
          },
        )
      }

      setPushPermission(
        getNotificationPermission(),
      )

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Pushnotiser kunde inte aktiveras.',
      )
    } finally {
      setEnablingPush(false)
    }
  }

  async function togglePreference(
    key: keyof NotificationPreferences,
  ) {
    if (!firebaseUser) {
      return
    }

    const next = {
      ...preferences,
      [key]: !preferences[key],
    }

    setPreferences(next)
    setSavingKey(key)
    setError('')

    try {
      await updateUserProfile(
        firebaseUser.uid,
        {
          notificationPreferences:
            next,
        },
      )
    } catch (caughtError) {
      console.error(
        'Kunde inte spara notisinställning:',
        caughtError,
      )

      setPreferences(
        preferences,
      )

      setError(
        'Inställningen kunde inte sparas.',
      )
    } finally {
      setSavingKey(null)
    }
  }

  return (
    <div className="space-y-5">
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#183b70] shadow-sm ring-1 ring-slate-200"
          aria-label="Tillbaka"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div>
          <p className="text-sm font-semibold text-sky-700">
            Inställningar
          </p>

          <h1 className="text-2xl font-bold text-[#183b70]">
            Min profil
          </h1>
        </div>
      </header>

      {profile && (
        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="font-bold text-slate-900">
            {profile.name}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {profile.email}
          </p>
        </section>
      )}

      <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center gap-3 border-b border-slate-100 p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-[#183b70]">
            <Bell className="h-5 w-5" />
          </div>

          <div>
            <h2 className="font-bold text-[#183b70]">
              Pushnotiser
            </h2>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Välj vad du vill få notiser om.
            </p>
          </div>
        </div>

        <NotificationToggle
          icon={
            <Megaphone className="h-5 w-5" />
          }
          title="Viktig information"
          description="Viktiga meddelanden och nyheter från församlingen."
          checked={
            preferences.importantInformation
          }
          saving={
            savingKey ===
            'importantInformation'
          }
          onChange={() => {
            void togglePreference(
              'importantInformation',
            )
          }}
        />

        <NotificationToggle
          icon={
            <Landmark className="h-5 w-5" />
          }
          title="Tfilot"
          description="Påminnelser och viktiga ändringar kring gudstjänster."
          checked={preferences.tfilot}
          saving={
            savingKey === 'tfilot'
          }
          onChange={() => {
            void togglePreference(
              'tfilot',
            )
          }}
        />

        <NotificationToggle
          icon={
            <BookOpen className="h-5 w-5" />
          }
          title="Shiurim"
          description="Nya shiurim och relevanta påminnelser."
          checked={preferences.shiurim}
          saving={
            savingKey === 'shiurim'
          }
          onChange={() => {
            void togglePreference(
              'shiurim',
            )
          }}
        />

        <NotificationToggle
          icon={
            <PartyPopper className="h-5 w-5" />
          }
          title="Fester"
          description="Fester och andra större medlemsaktiviteter."
          checked={preferences.parties}
          saving={
            savingKey === 'parties'
          }
          onChange={() => {
            void togglePreference(
              'parties',
            )
          }}
        />

        <NotificationToggle
          icon={
            <Flame className="h-5 w-5" />
          }
          title="Jahrzeit"
          description="Påminn mig en vecka före en Jahrzeit som jag lagt in."
          checked={preferences.jahrzeit}
          saving={
            savingKey === 'jahrzeit'
          }
          onChange={() => {
            void togglePreference(
              'jahrzeit',
            )
          }}
        />

        <NotificationToggle
          icon={
            <Star className="h-5 w-5" />
          }
          title="Mazel Tov"
          description="Mazel Tov och andra glada nyheter från församlingen."
          checked={preferences.mazelTov}
          saving={
            savingKey === 'mazelTov'
          }
          onChange={() => {
            void togglePreference(
              'mazelTov',
            )
          }}
          last
        />
      </section>

      {error && (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
          {error}
        </p>
      )}

      <section className="rounded-3xl bg-sky-50 p-5 ring-1 ring-sky-100">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-[#183b70]">
            <Bell className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-bold text-[#183b70]">
              Notiser på den här enheten
            </p>

            {checkingPush ? (
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Kontrollerar pushnotiser…
              </p>
            ) : pushPermission === 'granted' &&
              pushRegistered ? (
              <p className="mt-1 text-sm leading-6 text-emerald-700">
                Pushnotiser är aktiverade på den här enheten.
              </p>
            ) : pushPermission === 'denied' ? (
              <p className="mt-1 text-sm leading-6 text-rose-700">
                Notiser är blockerade i webbläsaren.
                Du behöver tillåta dem i webbläsarens
                inställningar.
              </p>
            ) : pushPermission === 'unsupported' ? (
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Den här webbläsaren stöder inte
                pushnotiser.
              </p>
            ) : (
              <>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Aktivera push för att få de
                  notiser du valt ovan även när
                  appen inte är öppen.
                </p>

                <button
                  type="button"
                  disabled={enablingPush}
                  onClick={() => {
                    void activatePush()
                  }}
                  className="mt-4 rounded-2xl bg-[#183b70] px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
                >
                  {enablingPush
                    ? 'Aktiverar…'
                    : 'Aktivera pushnotiser'}
                </button>
              </>
            )}

            {pushMessage && (
              <p className="mt-3 text-sm font-semibold text-emerald-700">
                {pushMessage}
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

type NotificationToggleProps = {
  icon: ReactNode
  title: string
  description: string
  checked: boolean
  saving: boolean
  onChange: () => void
  last?: boolean
}

function NotificationToggle({
  icon,
  title,
  description,
  checked,
  saving,
  onChange,
  last = false,
}: NotificationToggleProps) {
  return (
    <div
      className={`flex items-center gap-4 px-5 py-4 ${
        last
          ? ''
          : 'border-b border-slate-100'
      }`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[#183b70]">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-bold text-slate-800">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={saving}
        onClick={onChange}
        className={`relative h-7 w-12 shrink-0 rounded-full transition disabled:opacity-50 ${
          checked
            ? 'bg-[#183b70]'
            : 'bg-slate-300'
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${
            checked
              ? 'left-6'
              : 'left-1'
          }`}
        />
      </button>
    </div>
  )
}

export default ProfilePage
