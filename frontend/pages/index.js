import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <div className="text-6xl mb-4">🗑️</div>
        <h1 className="text-4xl font-bold text-green-800 mb-4">SampahKu</h1>
        <p className="text-lg text-gray-600 mb-8">
          Platform pelaporan sampah liar, jadwal pengangkutan, dan monitoring kebersihan kota.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/laporan/buat" className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700">
            Buat Laporan
          </Link>
          <Link href="/jadwal" className="bg-white text-green-700 border border-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50">
            Jadwal Pengangkutan
          </Link>
          <Link href="/login" className="bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-900">
            Masuk
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-6 mt-16 max-w-3xl w-full">
        {[
          { icon: '📍', title: 'Laporkan Sampah', desc: 'Upload foto dan lokasi sampah liar di sekitar kamu' },
          { icon: '📅', title: 'Jadwal Angkut', desc: 'Cek jadwal pengangkutan sampah di wilayahmu' },
          { icon: '✅', title: 'Pantau Status', desc: 'Lacak status laporan kamu secara real-time' },
        ].map((f, i) => (
          <div key={i} className="bg-white rounded-xl p-5 shadow-sm text-center">
            <div className="text-3xl mb-2">{f.icon}</div>
            <h3 className="font-semibold text-gray-800 mb-1">{f.title}</h3>
            <p className="text-sm text-gray-500">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}