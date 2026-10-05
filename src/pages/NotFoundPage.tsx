import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'

export function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 pt-24 text-center">
      <Compass className="h-10 w-10 text-brand-500" />
      <h1 className="mt-4 font-display text-2xl font-bold">Sivua ei löytynyt</h1>
      <p className="mt-2 text-[14px] text-[var(--text-dim)]">Tätä sisältöä ei ole, tai se on siirtynyt.</p>
      <Link to="/" className="mt-5 rounded-full bg-brand-500 px-5 py-2.5 text-[13px] font-semibold text-white">
        Etusivulle
      </Link>
    </div>
  )
}
