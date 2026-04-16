import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import api from '../api/axios'

export default function BuatLaporan() {
  const router = useRouter()
  const [form, setForm] = useState({ judul: '', deskripsi: '', lokasi: '' })
  const [foto, setFoto] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!localStorage.getItem('token')) router.push('/login')
  }, [])

  const handleFoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) return setError('Foto maksimal 5MB')
    setFoto(file)
    setPreview(URL.createObjectURL(file))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('judul', form.judul)
      fd.append('deskripsi', form.deskripsi)
      fd.append('lokasi', form.lokasi)
      if (foto) fd.append('foto', foto)
      await api.post('/api/laporan', fd)
      router.push('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal membuat laporan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex items-center gap-4">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">← Kembali</Link>
        <span className="font-bold text-green-700">Buat Laporan</span>
      </nav>

      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Judul Laporan *
              </label>
              <input type="text" required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="cth: Tumpukan sampah di Jl. Merdeka"
                value={form.judul}
                onChange={e => setForm({ ...form, judul: e.target.value })} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deskripsi *
              </label>
              <textarea rows={4} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                placeholder="Jelaskan kondisi sampah secara detail..."
                value={form.deskripsi}
                onChange={e => setForm({ ...form, deskripsi: e.target.value })} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lokasi / Alamat *
              </label>
              <input type="text" required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="cth: Jl. Merdeka No. 10, Bandung"
                value={form.lokasi}
                onChange={e => setForm({ ...form, lokasi: e.target.value })} />
            </div>

            {/* Upload foto ke S3 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Foto Bukti (Upload ke S3)
              </label>
              {preview ? (
                <div className="relative">
                  <img src={preview} alt="preview"
                    className="w-full h-48 object-cover rounded-lg" />
                  <button type="button"
                    onClick={() => { setFoto(null); setPreview(null) }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-red-600">
                    ✕
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <span className="text-2xl mb-1">📸</span>
                  <span className="text-sm text-gray-500">Klik untuk upload foto</span>
                  <span className="text-xs text-gray-400 mt-1">JPG/PNG maks 5MB · Tersimpan di AWS S3</span>
                  <input type="file" className="hidden"
                    accept="image/jpeg,image/png"
                    onChange={handleFoto} />
                </label>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Link href="/dashboard"
                className="flex-1 text-center border border-gray-300 text-gray-700 py-2.5 rounded-lg font-semibold hover:bg-gray-50">
                Batal
              </Link>
              <button type="submit" disabled={loading}
                className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50">
                {loading ? 'Mengirim...' : 'Kirim Laporan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}