import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const err = await signIn(email, password)
    if (err) {
      setError('Wrong email or password.')
      setLoading(false)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex flex-col items-center justify-center px-6">
      <div className="mb-10 text-center">
        <h1 className="font-['Barlow_Condensed'] text-6xl font-black text-[#FF5F1F] tracking-tight uppercase">
          MathSesh
        </h1>
        <p className="text-[#FFE600] font-['Space_Mono'] text-sm mt-1 tracking-widest">DROP IN. MATH OUT.</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="w-full bg-[#1a1a1a] border border-[#333] text-white font-['Space_Mono'] px-4 py-4 text-base rounded-none focus:outline-none focus:border-[#FF5F1F]"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="w-full bg-[#1a1a1a] border border-[#333] text-white font-['Space_Mono'] px-4 py-4 text-base rounded-none focus:outline-none focus:border-[#FF5F1F]"
        />

        {error && (
          <p className="text-red-500 font-['Space_Mono'] text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#FF5F1F] text-black font-['Barlow_Condensed'] font-black text-2xl uppercase tracking-widest py-4 active:scale-95 transition-transform disabled:opacity-50"
        >
          {loading ? 'DROPPING IN…' : 'DROP IN'}
        </button>
      </form>
    </div>
  )
}
