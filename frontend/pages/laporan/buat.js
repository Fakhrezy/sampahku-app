import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import api from '../api/axios'
import { CheckIcon, ArrowLeftIcon, CrossIcon, CameraIcon } from '../../components/Icons'

export default function BuatLaporan() {
  const router = useRouter()
  const [form, setForm] = useState({ nama_pelapor: '', judul: '', deskripsi: '', lokasi: '' })
  const [foto, setFoto] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

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
      fd.append('nama_pelapor', form.nama_pelapor)
      fd.append('judul', form.judul)
      fd.append('deskripsi', form.deskripsi)
      fd.append('lokasi', form.lokasi)
      if (foto) fd.append('foto', foto)
      await api.post('/api/laporan', fd)
      setSuccess(true)
      setTimeout(() => router.push('/'), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim laporan')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-10 text-center bg-white shadow-lg rounded-2xl">
          <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-700">
            <CheckIcon className="w-8 h-8" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-gray-900">Laporan Berhasil Dikirim!</h2>
          <p className="text-gray-500">Mengalihkan ke halaman utama...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="flex items-center gap-4 px-6 py-4 bg-white shadow-sm">
        <Link href="/" className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700">
          <ArrowLeftIcon className="w-4 h-4" />
          Kembali
        </Link>
        <span className="font-bold text-green-700">Buat Laporan Sampah</span>
      </nav>

      <div className="max-w-2xl p-6 mx-auto">
        <div className="p-6 bg-white shadow-sm rounded-xl">
          {error && (
            <div className="p-3 mb-4 text-sm text-red-600 rounded-lg bg-red-50">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Nama Pelapor *</label>
              <input type="text" required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Nama kamu"
                value={form.nama_pelapor}
                onChange={e => setForm({ ...form, nama_pelapor: e.target.value })} />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Judul Laporan *</label>
              <input type="text" required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="cth: Tumpukan sampah di Jl. Merdeka"
                value={form.judul}
                onChange={e => setForm({ ...form, judul: e.target.value })} />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Deskripsi *</label>
              <textarea rows={4} required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Jelaskan kondisi sampah secara detail..."
                value={form.deskripsi}
                onChange={e => setForm({ ...form, deskripsi: e.target.value })} />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Lokasi / Alamat *</label>
              <input type="text" required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="cth: Jl. Merdeka No. 10, Bandung"
                value={form.lokasi}
                onChange={e => setForm({ ...form, lokasi: e.target.value })} />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Foto Bukti (Upload ke S3)
              </label>
              {preview ? (
                <div className="relative">
                  <img src={preview} alt="preview" className="object-cover w-full h-48 rounded-lg" />
                  <button type="button"
                    onClick={() => { setFoto(null); setPreview(null) }}
                    className="absolute flex items-center justify-center text-white bg-red-500 rounded-full top-2 right-2 w-7 h-7 hover:bg-red-600">
                    <CrossIcon className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                  <span className="mb-1 text-green-600">
                    <CameraIcon className="w-10 h-10" />
                  </span>
                  <span className="text-sm text-gray-500">Klik untuk upload foto</span>
                  <span className="mt-1 text-xs text-gray-400">JPG/PNG maks 5MB · Tersimpan di AWS S3</span>
                  <input type="file" className="hidden" accept="image/jpeg,image/png" onChange={handleFoto} />
                </label>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Link href="/"
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