import { useEffect, useState } from 'react'
import Link from 'next/link'
import api from './api/axios'
import { TrashIcon, ReportIcon, CalendarIcon, LocationIcon, ArrowLeftIcon } from '../components/Icons'

export default function Admin() {
  const [laporan, setLaporan] = useState([])
  const [jadwal, setJadwal] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('laporan')
  const [formJadwal, setFormJadwal] = useState({
    wilayah: '', kelurahan: '', hari: 'Senin',
    jam_mulai: '', jam_selesai: '', keterangan: ''
  })
  const [savingJadwal, setSavingJadwal] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [lRes, jRes] = await Promise.all([
        api.get('/api/laporan'),
        api.get('/api/jadwal')
      ])
      setLaporan(lRes.data)
      setJadwal(jRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/api/laporan/${id}/status`, { status })
      fetchAll()
    } catch (err) {
      alert('Gagal update status')
    }
  }

  const tambahJadwal = async (e) => {
    e.preventDefault()
    setSavingJadwal(true)
    setMsg('')
    try {
      await api.post('/api/jadwal', formJadwal)
      setMsg('Jadwal berhasil ditambahkan!')
      setFormJadwal({ wilayah: '', kelurahan: '', hari: 'Senin', jam_mulai: '', jam_selesai: '', keterangan: '' })
      fetchAll()
    } catch (err) {
      setMsg('Gagal menambahkan jadwal')
    } finally {
      setSavingJadwal(false)
    }
  }

  const statusColor = {
    menunggu: 'bg-yellow-100 text-yellow-800',
    diproses: 'bg-blue-100 text-blue-800',
    selesai: 'bg-green-100 text-green-800',
    ditolak: 'bg-red-100 text-red-800'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
        <div className="flex items-center gap-2 text-lg font-bold text-green-700">
          <TrashIcon className="w-6 h-6" />
          <span>SampahKu Admin</span>
        </div>
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:underline">
          <ArrowLeftIcon className="w-4 h-4" />
          Kembali ke beranda
        </Link>
      </nav>

      <div className="max-w-5xl p-6 mx-auto">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Panel Admin</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab('laporan')}
            className={`px-5 py-2 rounded-lg font-medium text-sm transition-colors ${tab === 'laporan' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'}`}>
            <span className="inline-flex items-center gap-2">
              <ReportIcon className="w-5 h-5" />
              Laporan ({laporan.length})
            </span>
          </button>
          <button onClick={() => setTab('jadwal')}
            className={`px-5 py-2 rounded-lg font-medium text-sm transition-colors ${tab === 'jadwal' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'}`}>
            <span className="inline-flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Jadwal ({jadwal.length})
            </span>
          </button>
        </div>

        {/* Tab Laporan */}
        {tab === 'laporan' && (
          <div className="overflow-hidden bg-white shadow-sm rounded-xl">
            {loading ? (
              <p className="p-6 text-gray-400">Memuat...</p>
            ) : laporan.length === 0 ? (
              <p className="p-12 text-center text-gray-400">Belum ada laporan masuk.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 font-medium text-left text-gray-600">Laporan</th>
                    <th className="px-4 py-3 font-medium text-left text-gray-600">Foto</th>
                    <th className="px-4 py-3 font-medium text-left text-gray-600">Pelapor</th>
                    <th className="px-4 py-3 font-medium text-left text-gray-600">Status</th>
                    <th className="px-4 py-3 font-medium text-left text-gray-600">Ubah</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {laporan.map(l => (
                    <tr key={l.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{l.judul}</p>
                        <p className="inline-flex items-center gap-1 text-xs text-gray-400">
                        <LocationIcon className="w-3.5 h-3.5" />
                        {l.lokasi}
                      </p>
                      </td>
                      <td className="px-4 py-3">
                        {l.foto_url ? (
                          <a href={l.foto_url} target="_blank" rel="noreferrer">
                            <img src={l.foto_url} alt="foto" className="object-cover w-12 h-12 rounded-lg hover:opacity-80" />
                          </a>
                        ) : <span className="text-gray-300">–</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{l.nama_pelapor}</td>
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
            )}
          </div>
        )}

        {/* Tab Jadwal */}
        {tab === 'jadwal' && (
          <div className="space-y-6">
            {/* Form tambah jadwal */}
            <div className="p-6 bg-white shadow-sm rounded-xl">
              <h2 className="mb-4 text-lg font-semibold">Tambah Jadwal Baru</h2>
              {msg && <div className="p-3 mb-4 text-sm rounded-lg bg-gray-50">{msg}</div>}
              <form onSubmit={tambahJadwal} className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Wilayah *</label>
                  <input type="text" required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="cth: Bandung Wetan"
                    value={formJadwal.wilayah}
                    onChange={e => setFormJadwal({ ...formJadwal, wilayah: e.target.value })} />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Kelurahan *</label>
                  <input type="text" required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="cth: Cihapit"
                    value={formJadwal.kelurahan}
                    onChange={e => setFormJadwal({ ...formJadwal, kelurahan: e.target.value })} />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Hari *</label>
                  <select required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={formJadwal.hari}
                    onChange={e => setFormJadwal({ ...formJadwal, hari: e.target.value })}>
                    {['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu'].map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Keterangan</label>
                  <input type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="cth: Setiap minggu"
                    value={formJadwal.keterangan}
                    onChange={e => setFormJadwal({ ...formJadwal, keterangan: e.target.value })} />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Jam Mulai *</label>
                  <input type="time" required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={formJadwal.jam_mulai}
                    onChange={e => setFormJadwal({ ...formJadwal, jam_mulai: e.target.value })} />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Jam Selesai *</label>
                  <input type="time" required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={formJadwal.jam_selesai}
                    onChange={e => setFormJadwal({ ...formJadwal, jam_selesai: e.target.value })} />
                </div>
                <div className="col-span-2">
                  <button type="submit" disabled={savingJadwal}
                    className="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50">
                    {savingJadwal ? 'Menyimpan...' : 'Tambah Jadwal'}
                  </button>
                </div>
              </form>
            </div>

            {/* List jadwal */}
            <div className="overflow-hidden bg-white shadow-sm rounded-xl">
              <table className="w-full text-sm">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 font-medium text-left text-gray-600">Wilayah</th>
                    <th className="px-4 py-3 font-medium text-left text-gray-600">Kelurahan</th>
                    <th className="px-4 py-3 font-medium text-left text-gray-600">Hari</th>
                    <th className="px-4 py-3 font-medium text-left text-gray-600">Jam</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {jadwal.map(j => (
                    <tr key={j.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{j.wilayah}</td>
                      <td className="px-4 py-3 text-gray-600">{j.kelurahan}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                          {j.hari}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {j.jam_mulai?.slice(0,5)} – {j.jam_selesai?.slice(0,5)} WIB
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}