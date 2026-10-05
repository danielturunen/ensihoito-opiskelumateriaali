import { useRegisterSW } from 'virtual:pwa-register/react'
import { Download, WifiOff, X } from 'lucide-react'

export function UpdateToast() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!offlineReady && !needRefresh) return null

  const close = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  return (
    <div className="pb-safe fixed inset-x-0 bottom-20 z-50 flex justify-center px-4 lg:bottom-6">
      <div className="flex animate-fade-up items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-raised)] px-4 py-3 shadow-2xl">
        {needRefresh ? <Download className="h-4 w-4 shrink-0 text-brand-500" /> : <WifiOff className="h-4 w-4 shrink-0 text-teal-500" />}
        <p className="text-[13px] font-medium">
          {needRefresh ? 'Uusi versio saatavilla.' : 'Sivusto on nyt käytettävissä offline.'}
        </p>
        {needRefresh && (
          <button
            onClick={() => updateServiceWorker(true)}
            className="shrink-0 rounded-full bg-brand-500 px-3 py-1.5 text-[12px] font-semibold text-white"
          >
            Päivitä
          </button>
        )}
        <button onClick={close} aria-label="Sulje" className="shrink-0 text-[var(--text-dim)]">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
