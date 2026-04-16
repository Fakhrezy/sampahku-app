import { useEffect, useState } from 'react'
import Link from 'next/link'
import api from './api/axios'
import { TrashIcon, CalendarIcon, ClockIcon } from '../components/Icons'

export default function Jadwal() {
  const [jadwal, setJadwal] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/jadwal')
      .then(r => setJadwal(r.data))
      .finally(() => setLoading(false))
  }, [])

  const hariColor = {
    Senin: 'bg-blue-100 text-blue-800',
    Selasa: 'bg-purple-100 text-purple-800',
    Rabu: 'bg-green-100 text-green-800',
    Kamis: 'bg-yellow-100 text-yellow-800',
    Jumat: 'bg-orange-100 text-orange-800',
    Sabtu: 'bg-pink-100 text-pink-800',
    Minggu: 'bg-red-100 text-red-800'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <Link href="/" className="inline-flex items-center gap-2 font-bold text-green-700 text-lg">
          <TrashIcon className="w-6 h-6" />
          SampahKu
        </Link>
        <div className="flex gap-3">
          <Link href="/admin"
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700">
            Admin
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Jadwal Pengangkutan Sampah
        </h1>
        <p className="text-gray-500 mb-6">Cek jadwal pengangkutan di wilayah kamu</p>

        {loading ? (
          <p className="text-gray-400 text-center py-12">Memuat jadwal...</p>
        ) : jadwal.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center text-gray-400">
            <div className="mb-3 mx-auto w-14 h-14 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
              <CalendarIcon className="w-7 h-7" />
            </div>
            <p>Belum ada jadwal tersedia.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {jadwal.map(j => (
              <div key={j.id}
                className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-green-500">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{j.wilayah}</h3>
                    <p className="text-sm text-gray-500">{j.kelurahan}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${hariColor[j.hari] || 'bg-gray-100 text-gray-800'}`}>
                    {j.hari}
                  </span>
                </div>
                <p className="text-sm text-gray-600 inline-flex items-center gap-1">
                  <ClockIcon className="w-4 h-4" />
                  {j.jam_mulai?.slice(0, 5)} – {j.jam_selesai?.slice(0, 5)} WIB
                </p>
                {j.keterangan && (
                  <p className="text-sm text-gray-400 mt-2 italic">{j.keterangan}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}