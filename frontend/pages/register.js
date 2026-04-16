import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import api from './api/axios'

export default function Register() {
  const router = useRouter()
  const [form, setForm] = useState({ nama: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/api/auth/register', form)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      router.push('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registrasi gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🗑️</div>
          <h1 className="text-2xl font-bold text-gray-900">Daftar Akun Baru</h1>
        </div>
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: 'Nama Lengkap', key: 'nama', type: 'text' },
            { label: 'Email', key: 'email', type: 'email' },
            { label: 'Password', key: 'password', type: 'password' },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input type={type} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                value={form[key]}
                onChange={e => setForm({ ...form, [key]: e.target.value })} />
            </div>
          ))}
          <button type="submit" disabled={loading}
            className="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50">
            {loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-4">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-green-600 font-semibold">Masuk</Link>
        </p>
      </div>
    </div>
  )
}