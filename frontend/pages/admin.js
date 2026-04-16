import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import api from './api/axios'

export default function Admin() {
  const router = useRouter()
  const [laporan, setLaporan] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (!user?.id || user.role !== 'admin') return router.push('/login')
    fetchLaporan()
  }, [])

  const fetchLaporan = () => {
    api.get('/api/laporan')
      .then(r => setLaporan(r.data))
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false))
  }

  const updateStatus = async (id, status) => {
    await api.patch(`/api/laporan/${id}/status`, { status })
    fetchLaporan()
  }

  const logout = () => {
    localStorage.clear()
    router.push('/login')
  }

  const statusColor = {
    menunggu: 'bg-yellow-100 text-yellow-800',
    diproses: 'bg-blue-100 text-blue-800',
    selesai: 'bg-green-100 text-green-800',
    ditolak: 'bg-red-100 text-red-800'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <span className="font-bold text-green-700 text-lg">🗑️ SampahKu Admin</span>
        <div className="flex gap-4 items-center">
          <span className="text-sm text-gray-500">
            Total: {laporan.length} laporan
          </span>
          <button onClick={logout} className="text-sm text-red-500 hover:underline">
            Keluar
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Kelola Laporan</h1>

        {loading ? (
          <p className="text-gray-400">Memuat...</p>
        ) : laporan.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center text-gray-400">
            <p className="text-4xl mb-3">📋</p>
            <p>Belum ada laporan masuk.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Laporan</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Foto</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Pelapor</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Ubah Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {laporan.map(l => (
                  <tr key={l.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{l.judul}</p>
                      <p className="text-xs text-gray-400">{l.lokasi}</p>
                    </td>
                    <td className="px-4 py-3">
                      {l.foto_url ? (
                        <a href={l.foto_url} target="_blank" rel="noreferrer">
                          <img src={l.foto_url} alt="foto"
                            className="w-12 h-12 object-cover rounded-lg hover:opacity-80" />
                        </a>
                      ) : (
                        <span className="text-gray-300">–</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{l.pelapor || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[l.status]}`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={l.status}
                        onChange={e => updateStatus(l.id, e.target.value)}>
                        <option value="menunggu">Menunggu</option>
                        <option value="diproses">Diproses</option>
                        <option value="selesai">Selesai</option>
                        <option value="ditolak">Ditolak</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}