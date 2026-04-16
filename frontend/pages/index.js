import { useEffect, useState } from "react";
import Link from "next/link";
import api from "./api/axios";
import {
	TrashIcon,
	LocationIcon,
	CalendarIcon,
	ReportIcon,
	PhotoIcon,
	ArrowRightIcon
} from "../components/Icons";

export default function Home() {
	const [laporan, setLaporan] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		api
			.get("/api/laporan")
			.then(r => setLaporan(r.data))
			.finally(() => setLoading(false));
	}, []);

	const statusColor = {
		menunggu: "bg-yellow-100 text-yellow-800",
		diproses: "bg-blue-100 text-blue-800",
		selesai: "bg-green-100 text-green-800",
		ditolak: "bg-red-100 text-red-800"
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<nav className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
				<div className="flex items-center gap-2 text-xl font-bold text-green-700">
					<TrashIcon className="w-7 h-7" />
					<span>SampahKu</span>
				</div>
				<div className="flex gap-3">
					<Link
						href="/jadwal"
						className="text-sm text-gray-600 hover:underline">
						Jadwal
					</Link>
					<Link
						href="/laporan/buat"
						className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700">
						+ Buat Laporan
					</Link>
					<Link href="/admin" className="text-sm text-gray-500 hover:underline">
						Admin
					</Link>
				</div>
			</nav>

			<div className="max-w-4xl p-6 mx-auto">
				<div className="mb-10 text-center">
					<h1 className="mb-2 text-3xl font-bold text-gray-900">
						Sistem Manajemen Persampahan
					</h1>
					<p className="text-gray-500">
						Laporkan sampah liar di sekitar kamu, cek jadwal pengangkutan, dan
						pantau status penanganan.
					</p>
				</div>

				<div className="grid grid-cols-3 gap-4 mb-10">
					{[
						{
							icon: (
								<LocationIcon className="mx-auto w-10 h-10 text-green-600" />
							),
							title: "Laporkan Sampah",
							desc: "Upload foto dan lokasi",
							href: "/laporan/buat"
						},
						{
							icon: (
								<CalendarIcon className="mx-auto w-10 h-10 text-green-600" />
							),
							title: "Jadwal Angkut",
							desc: "Cek jadwal di wilayahmu",
							href: "/jadwal"
						},
						{
							icon: <ReportIcon className="mx-auto w-10 h-10 text-green-600" />,
							title: "Semua Laporan",
							desc: "Lihat status laporan",
							href: "#laporan"
						}
					].map((f, i) =>
						<Link
							key={i}
							href={f.href}
							className="p-5 text-center transition-shadow bg-white shadow-sm rounded-xl hover:shadow-md">
							<div className="mb-2">
								{f.icon}
							</div>
							<h3 className="mb-1 font-semibold text-gray-800">
								{f.title}
							</h3>
							<p className="text-sm text-gray-500">
								{f.desc}
							</p>
						</Link>
					)}
				</div>

				<div id="laporan">
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-xl font-bold text-gray-900">Laporan Terbaru</h2>
						<Link
							href="/laporan/buat"
							className="text-sm text-green-600 hover:underline">
							+ Buat laporan
						</Link>
					</div>

					{loading
						? <p className="py-12 text-center text-gray-400">
								Memuat laporan...
							</p>
						: laporan.length === 0
							? <div className="p-12 text-center text-gray-400 bg-white rounded-xl">
									<div className="mb-3 mx-auto w-14 h-14 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
										<ReportIcon className="w-7 h-7" />
									</div>
									<p>Belum ada laporan.</p>
									<Link
										href="/laporan/buat"
										className="inline-flex items-center gap-1 mt-2 text-sm text-green-600">
										Buat laporan pertama <ArrowRightIcon className="w-4 h-4" />
									</Link>
								</div>
							: <div className="space-y-4">
									{laporan.map(l =>
										<div
											key={l.id}
											className="flex gap-4 p-5 bg-white shadow-sm rounded-xl">
											{l.foto_url
												? <img
														src={l.foto_url}
														alt="foto"
														className="flex-shrink-0 object-cover w-20 h-20 rounded-lg"
													/>
												: <div className="flex items-center justify-center flex-shrink-0 w-20 h-20 text-gray-500 bg-gray-100 rounded-lg">
														<PhotoIcon className="w-10 h-10" />
													</div>}
											<div className="flex-1 min-w-0">
												<div className="flex items-start justify-between gap-2 mb-1">
													<h3 className="font-semibold text-gray-900">
														{l.judul}
													</h3>
													<span
														className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${statusColor[
															l.status
														]}`}>
														{l.status}
													</span>
												</div>
												<p className="mb-1 text-sm text-gray-500 inline-flex items-center gap-1">
													<LocationIcon className="w-4 h-4" />
													{l.lokasi}
												</p>
												<p className="text-sm text-gray-600 line-clamp-2">
													{l.deskripsi}
												</p>
												<p className="mt-1 text-xs text-gray-400">
													Oleh: {l.nama_pelapor}
												</p>
											</div>
										</div>
									)}
								</div>}
				</div>
			</div>
		</div>
	);
}
