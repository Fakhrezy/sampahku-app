import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import api from './api/axios'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [laporan, setLaporan] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const u = localStorage.getItem('user')
    if (!u) return router.push('/login')
    setUser(JSON.parse(u))
    api.get('/api/laporan')
      .then(r => setLaporan(r.data))
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false))
  }, [])

  const statusColor = {
    menunggu: 'bg-yellow-100 text-yellow-800',
    diproses: 'bg-blue-100 text-blue-800',
    selesai: 'bg-green-100 text-green-800',
    ditolak: 'bg-red-100 text-red-800'
  }

  const logout = () => {
    localStorage.clear()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <span className="font-bold text-green-700 text-lg">🗑️ SampahKu</span>
        <div className="flex gap-4 items-center">
          <span className="text-sm text-gray-600">Halo, {user?.nama}</span>
          <Link href="/laporan/buat"
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700">
            + Laporan
          </Link>
          <Link href="/jadwal" className="text-sm text-gray-600 hover:underline">
            Jadwal
          </Link>
          <button onClick={logout} className="text-sm text-red-500 hover:underline">
            Keluar
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', val: laporan.length, color: 'bg-blue-50 text-blue-700' },
            { label: 'Menunggu', val: laporan.filter(l => l.status === 'menunggu').length, color: 'bg-yellow-50 text-yellow-700' },
            { label: 'Diproses', val: laporan.filter(l => l.status === 'diproses').length, color: 'bg-purple-50 text-purple-700' },
            { label: 'Selesai', val: laporan.filter(l => l.status === 'selesai').length, color: 'bg-green-50 text-green-700' },
          ].map((s, i) => (
            <div key={i} className={`${s.color} rounded-xl p-4`}>
              <div className="text-3xl font-bold">{loading ? '...' : s.val}</div>
              <div className="text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Laporan list */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg">Laporan Saya</h2>
            <Link href="/laporan/buat" className="text-sm text-green-600 hover:underline">
              + Buat laporan
            </Link>
          </div>
          {loading ? (
            <p className="text-gray-400 text-center py-8">Memuat...</p>
          ) : laporan.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              Belum ada laporan.{' '}
              <Link href="/laporan/buat" className="text-green-600">Buat sekarang →</Link>
            </p>
          ) : (
            <div className="divide-y">
              {laporan.map(l => (
                <div key={l.id} className="py-3 flex justify-between items-start gap-4">
                  <div className="flex gap-3 items-start">
                    {l.foto_url && (
                      <img src={l.foto_url} alt="foto" className="w-12 h-12 object-cover rounded-lg flex-shrink-0" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{l.judul}</p>
                      <p className="text-sm text-gray-500">{l.lokasi}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${statusColor[l.status]}`}>
                    {l.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}