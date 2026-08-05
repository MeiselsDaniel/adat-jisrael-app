function ProfilePage() {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 text-xl font-black text-[#183b70]">
        DM
      </div>

      <h2 className="mt-4 text-xl font-bold">
        Daniel Meisels
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Medlem i Adat Jisrael
      </p>

      <div className="mt-6 border-t border-slate-200 pt-5">
        <p className="text-sm text-slate-500">
          Här kommer medlemmen senare kunna hantera sina
          uppgifter, anmälningar och inställningar.
        </p>
      </div>
    </div>
  )
}

export default ProfilePage