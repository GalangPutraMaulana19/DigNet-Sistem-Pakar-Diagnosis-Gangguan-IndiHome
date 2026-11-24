'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, BookOpen, Calculator, ShieldCheck, Stethoscope } from 'lucide-react';
import { CERTAINTY_CONDITIONS } from '@/lib/seed-data';
import { useDigNet } from '@/lib/store';

type HelpTab = 'teknisi' | 'cf' | 'admin';

export function BantuanView() {
  const { setView } = useDigNet();
  const [activeTab, setActiveTab] = useState<HelpTab>('teknisi');

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
          Panduan & Bantuan Penggunaan
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Dokumentasi operasional teknisi lapangan, rumus perhitungan Certainty Factor, serta
          panduan pengelolaan basis pengetahuan bagi Admin Pakar.
        </p>
      </div>

      {/* Segmented Tab Controls */}
      <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-200/70 rounded-lg w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('teknisi')}
          className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'teknisi'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Stethoscope className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Panduan Diagnosa Teknisi</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('cf')}
          className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'cf'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calculator className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Rumus & Skala CF</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('admin')}
          className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'admin'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Panduan Admin Pakar</span>
        </button>
      </div>

      {activeTab === 'teknisi' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">
              Cara Melakukan Diagnosis Gangguan IndiHome
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Ikuti empat langkah berikut saat menangani laporan gangguan pelanggan di lokasi.
            </p>
          </div>

          <ol className="space-y-5">
            {[
              {
                title: '01. Lakukan Pemeriksaan Fisik Awal',
                desc: 'Periksa lampu indikator pada ONT (Power, PON, LOS, Internet, Phone), kondisi kabel patchcord/drop core, serta pesan kode error pada layar TV apabila pelanggan menggunakan UseeTV.',
              },
              {
                title: '02. Pilih Gejala & Tingkat Kepastian',
                desc: 'Buka menu Diagnosa, gunakan filter kategori (Internet & ONT, UseeTV & STB, Telepon) bila perlu, lalu tentukan tingkat keyakinan pada setiap gejala yang teramati (minimal 1 gejala).',
              },
              {
                title: '03. Proses & Evaluasi Hasil CF',
                desc: 'Klik tombol Proses Diagnosa. Sistem akan menjalankan inferensi Forward Chaining dan menampilkan rekomendasi tindakan utama dengan persentase keyakinan tertinggi beserta kemungkinan alternatif.',
              },
              {
                title: '04. Eksekusi SOP & Cetak Dokumentasi',
                desc: 'Jalankan langkah penanganan lapangan yang disarankan, audit jejak perhitungan CF bila diperlukan, dan cetak laporan atau tinjau kembali arsip melalui menu Riwayat.',
              },
            ].map((item) => (
              <li
                key={item.title}
                className="pb-5 border-b border-slate-200 last:border-b-0 last:pb-0"
              >
                <h3 className="font-display text-sm font-bold text-slate-900">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </li>
            ))}
          </ol>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setView('diagnosa')}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
            >
              <span>Buka Halaman Diagnosa</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {activeTab === 'cf' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-4">
            <h2 className="font-display text-lg font-bold text-slate-900">
              Formulasi Certainty Factor (CF)
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Setiap aturan pada basis pengetahuan menyimpan bobot pakar{' '}
              <span className="font-mono font-semibold text-slate-800">MB</span> (Measure of
              Belief) dan <span className="font-mono font-semibold text-slate-800">MD</span>{' '}
              (Measure of Disbelief). Nilai keyakinan tiap gejala dihitung lalu digabungkan secara
              berurutan untuk setiap kandidat gangguan:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-1.5">
                <p className="text-xs font-semibold text-slate-700">1. CF Per Aturan</p>
                <p className="font-mono text-sm text-slate-900">
                  CF(H, E) = (MB − MD) × CF_user
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-1.5">
                <p className="text-xs font-semibold text-slate-700">
                  2. Kombinasi Dua CF Positif
                </p>
                <p className="font-mono text-sm text-slate-900">
                  CF_combine = CF_1 + CF_2 × (1 − CF_1)
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-1.5">
                <p className="text-xs font-semibold text-slate-700">
                  3. Kombinasi Tanda Berlawanan
                </p>
                <p className="font-mono text-sm text-slate-900">
                  CF_combine = (CF_1 + CF_2) / (1 − min(|CF_1|, |CF_2|))
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-1.5">
                <p className="text-xs font-semibold text-slate-700">
                  4. Kombinasi Dua CF Negatif
                </p>
                <p className="font-mono text-sm text-slate-900">
                  CF_combine = CF_1 + CF_2 × (1 + CF_1)
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h3 className="font-display text-base font-bold text-slate-900">
                Tabel Bobot Tingkat Kepastian Pengguna
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-medium text-slate-500">
                    <th className="py-3 px-6 w-16">ID</th>
                    <th className="py-3 px-4">Label Kondisi</th>
                    <th className="py-3 px-4 text-right">Bobot CF User</th>
                    <th className="py-3 px-6">Interpretasi Lapangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {CERTAINTY_CONDITIONS.map((cond) => (
                    <tr key={cond.id}>
                      <td className="py-3 px-6 font-mono text-xs text-slate-500 tabular-nums">
                        {cond.id}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">{cond.label}</td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-slate-800 tabular-nums">
                        {cond.weight > 0 ? `+${cond.weight.toFixed(1)}` : cond.weight.toFixed(1)}
                      </td>
                      <td className="py-3 px-6 text-slate-600">{cond.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'admin' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-5">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">
              Pengelolaan Basis Pengetahuan oleh Admin Pakar
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Admin Pakar berwenang memperbarui master gejala, master gangguan & SOP, relasi
              aturan MB/MD, artikel keterangan, serta akun administrator.
            </p>
          </div>
          <ul className="space-y-3 text-sm text-slate-700">
            <li className="flex items-start gap-2.5">
              <BookOpen className="h-4 w-4 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                Perubahan pada Data Gejala, Data Gangguan, dan Basis Pengetahuan langsung
                berlaku pada mesin inferensi Diagnosa secara seketika.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <BookOpen className="h-4 w-4 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                Kredensial bawaan sistem sesuai basis data awal adalah{' '}
                <span className="font-mono font-semibold text-slate-900">admin / admin</span>.
              </span>
            </li>
          </ul>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setView('admin-login')}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
            >
              <span>Masuk ke Panel Admin Pakar</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
