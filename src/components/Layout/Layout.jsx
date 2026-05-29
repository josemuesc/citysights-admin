import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

const routeMap = {
  '/': { title: 'Dashboard', breadcrumb: ['Dashboard'] },
  '/businesses': { title: 'Negocios', breadcrumb: ['Negocios'] },
  '/businesses/new': { title: 'Nuevo Negocio', breadcrumb: ['Negocios', 'Nuevo negocio'] },
  '/users': { title: 'Usuarios', breadcrumb: ['Usuarios'] },
  '/reviews': { title: 'Reseñas', breadcrumb: ['Reseñas'] },
}

export default function Layout() {
  const { pathname } = useLocation()

  const matchEdit = pathname.match(/^\/businesses\/(.+)\/edit$/)
  let meta = routeMap[pathname]
  if (!meta && matchEdit) {
    meta = { title: 'Editar Negocio', breadcrumb: ['Negocios', 'Editar negocio'] }
  }
  meta = meta ?? { title: 'CitySights Admin', breadcrumb: [] }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={meta.title} breadcrumb={meta.breadcrumb} />
        <main className="flex-1 overflow-y-auto p-8 bg-[var(--cream)]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
