import { Link } from 'react-router-dom'

export default function NavBar() {
  return (
    <header className="h-14 bg-header px-6 grid grid-cols-3 items-center">
      {/* Left: logo + name */}
      <div className="flex items-center gap-3">
        <div className="size-7 rounded bg-line" />
        <span className="text-lg font-bold">443 Guardian</span>
      </div>

      {/* Middle: page links */}
      <nav className="flex justify-center gap-6 text-sm font-medium">
        <span className="pb-1 border-b-2 border-ink">Dashboard</span>
        <Link to="/investigation" className="pb-1 text-muted hover:text-ink">
          Investigation
        </Link>
      </nav>

      {/* Right: avatar placeholder */}
      <div className="flex justify-end">
        <div className="size-8 rounded-full bg-line" />
      </div>
    </header>
  )
}