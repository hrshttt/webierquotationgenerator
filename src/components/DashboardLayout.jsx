import { useState } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  FileText,
  Receipt,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Phone,
} from 'lucide-react'

const navItems = [
  {
    to: '/quotation',
    label: 'Quotation Generator',
    icon: FileText,
    description: 'Create professional quotations',
  },
  {
    to: '/invoice',
    label: 'Invoice Generator',
    icon: Receipt,
    description: 'Generate & manage invoices',
  },
  {
    to: '/dialer',
    label: 'Sales Dialer',
    icon: Phone,
    description: 'Make voice calls via Twilio',
  },
]

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { logout } = useAuth()
  const location = useLocation()

  return (
    <div className="min-h-screen bg-navy-900 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-72 bg-surface border-r border-white/5
          transform transition-transform duration-300 ease-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
        `}
      >
        {/* Logo section */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric to-electric-dark flex items-center justify-center shadow-lg shadow-electric/20">
                <span className="text-lg font-bold text-white">W</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight">Webier OS</h1>
                <p className="text-[11px] text-gray-500 font-medium tracking-wider uppercase">Studio Tools</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest px-3 mb-3">
            Tools
          </p>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.to

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`
                  group flex items-center gap-3 px-3 py-3 rounded-xl
                  transition-all duration-200
                  ${
                    isActive
                      ? 'bg-electric/10 text-electric border border-electric/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }
                `}
              >
                <div
                  className={`
                    w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0
                    transition-all duration-200
                    ${
                      isActive
                        ? 'bg-electric/20 text-electric'
                        : 'bg-white/5 text-gray-500 group-hover:bg-white/10 group-hover:text-gray-300'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.label}</p>
                  <p className={`text-[11px] truncate ${isActive ? 'text-electric/60' : 'text-gray-600'}`}>
                    {item.description}
                  </p>
                </div>
                {isActive && (
                  <ChevronRight className="w-4 h-4 text-electric/50 flex-shrink-0" />
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-gray-500 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all duration-200 group"
          >
            <LogOut className="w-4 h-4 group-hover:text-red-400 transition-colors" />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-navy-900/80 backdrop-blur-xl border-b border-white/5 px-4 lg:px-6 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-white">
                {navItems.find((i) => i.to === location.pathname)?.label || 'Webier OS'}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-gray-500 font-medium hidden sm:block">System Online</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
