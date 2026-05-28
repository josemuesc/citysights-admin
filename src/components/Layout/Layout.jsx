import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

const titles = {
  '/': 'Dashboard',
  '/businesses': 'Negocios',
  '/businesses/new': 'Nuevo Negocio',
  '/users': 'Usuarios',
  '/reviews': 'Reseñas',
}

export default function Layout() {
  const { pathname } = useLocation()
  const title = titles[pathname] ?? 'CitySights Admin'

  return (
    <div className="flex min-h-screen bg-[var(--cream)]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={title} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
