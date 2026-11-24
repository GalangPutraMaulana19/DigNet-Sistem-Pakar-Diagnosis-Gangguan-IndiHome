'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Activity, Building2, GraduationCap, UserCheck } from 'lucide-react';

export function TentangView() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {/* Header Overview */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-6">
        <div className="h-14 w-14 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0">
          <Activity className="h-7 w-7" aria-hidden="true" />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-red-600">
            Tugas Akhir / Skripsi · Teknik Informatika
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            DigNet — Sistem Pakar Diagnosis Gangguan IndiHome
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
            Aplikasi web sistem pakar berbasis aturan IF-THEN dengan metode Forward Chaining
            dan Certainty Factor untuk membantu teknisi provisioning mendiagnosis gangguan
            layanan triple play IndiHome secara objektif dan terukur.
          </p>
        </div>
      </section>

      {/* Attribution & Team */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-2">
          <UserCheck className="h-5 w-5 text-red-600" aria-hidden="true" />
          <p className="text-xs font-medium text-slate-500">Peneliti & Pengembang</p>
          <h2 className="font-display text-base font-bold text-slate-900">
            Galang Putra Maulana
          </h2>
          <p className="text-xs text-slate-600">Mahasiswa Program Studi Teknik Informatika</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-2">
          <Building2 className="h-5 w-5 text-red-600" aria-hidden="true" />
          <p className="text-xs font-medium text-slate-500">Pakar Domain Lapangan</p>
          <h2 className="font-display text-base font-bold text-slate-900">
            PT Mutiara Sentosa
          </h2>
          <p className="text-xs text-slate-600">Mitra Pelaksana Telkom Akses · Witel Bekasi</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-2">
          <GraduationCap className="h-5 w-5 text-red-600" aria-hidden="true" />
          <p className="text-xs font-medium text-slate-500">Institusi Akademik</p>
          <h2 className="font-display text-base font-bold text-slate-900">
            Universitas Bhayangkara Jakarta Raya
          </h2>
          <p className="text-xs text-slate-600">Fakultas Ilmu Komputer · Teknik Informatika</p>
        </div>
      </section>

      {/* Background, Problem, Solution, Method */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-2">
          <h3 className="font-display text-base font-bold text-slate-900">Latar Belakang</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            IndiHome merupakan layanan triple play dari PT Telkom Indonesia yang memadukan
            akses internet berbasis Fiber to the Home (FTTH), layanan TV interaktif melalui
            Set-Top Box (STB), dan telepon rumah. Di wilayah Witel Bekasi, instalasi dilakukan
            melalui kerja sama Telkom Akses bersama mitra pelaksana seperti PT Mutiara Sentosa.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-2">
          <h3 className="font-display text-base font-bold text-slate-900">Permasalahan</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Di lapangan masih dijumpai variasi kualitas analisis karena proses diagnosis
            sering bergantung pada pengalaman individu teknisi. Kondisi ini memperpanjang Mean
            Time to Repair (MTTR) serta meningkatkan frekuensi kunjungan ulang selama masa
            retensi 60 hari pasca instalasi.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-2">
          <h3 className="font-display text-base font-bold text-slate-900">Solusi Sistem</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            DigNet menghadirkan basis pengetahuan terstruktur mencakup komponen ODP, Drop Core,
            IKR, ONT, STB UseeTV, dan Telepon sehingga setiap teknisi memiliki standar acuan
            diagnosis dan prosedur perbaikan (SOP) yang konsisten.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-2">
          <h3 className="font-display text-base font-bold text-slate-900">Metodologi</h3>
          <ul className="space-y-1.5 text-sm text-slate-600 leading-relaxed list-disc pl-5">
            <li>
              <strong className="text-slate-900">Forward Chaining:</strong> Penalaran maju dari
              kumpulan fakta gejala menuju kesimpulan tindakan perbaikan.
            </li>
            <li>
              <strong className="text-slate-900">Certainty Factor:</strong> Mengukur derajat
              kepastian hipotesis pada rentang -1 hingga +1 berdasarkan MB, MD, dan bobot user.
            </li>
            <li>
              <strong className="text-slate-900">Basis Pengetahuan Dinamis:</strong> Dapat
              dikelola dan diperbarui langsung oleh Admin Pakar melalui panel manajemen.
            </li>
          </ul>
        </div>
      </section>
    </motion.div>
  );
}
