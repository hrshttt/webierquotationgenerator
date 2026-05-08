import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Lock, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const { login } = useAuth()
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [shaking, setShaking] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    const success = login(password)
    if (!success) {
      setError(true)
      setShaking(true)
      setTimeout(() => setShaking(false), 500)
      setTimeout(() => setError(false), 3000)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-900 relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-electric/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-electric/5 rounded-full blur-3xl" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-electric/20 to-transparent" />
      </div>

      <div
        className={`relative w-full max-w-md mx-4 ${shaking ? 'animate-shake' : ''}`}
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-electric to-electric-dark mb-6 shadow-lg shadow-electric/20">
            <span className="text-3xl font-bold text-white">W</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Webier OS</h1>
          <p className="text-gray-400 mt-2 text-sm">Internal Operations Platform</p>
        </div>

        {/* Login Card */}
        <div className="bg-surface border border-white/5 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="password-input"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Enter Access Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-gray-500" />
                </div>
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3.5 bg-navy-900 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric/50 transition-all duration-200"
                  autoFocus
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="animate-fadeIn">
                <p className="text-red-400 text-sm font-medium text-center flex items-center justify-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                  Access Denied
                </p>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-electric to-electric-dark text-white font-semibold rounded-xl hover:opacity-90 transition-all duration-200 animate-pulse-glow focus:outline-none focus:ring-2 focus:ring-electric/50 focus:ring-offset-2 focus:ring-offset-navy-900"
            >
              Unlock Access
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-xs mt-8">
          © {new Date().getFullYear()} Webier Studio · Restricted Access
        </p>
      </div>
    </div>
  )
}
