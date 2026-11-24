'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  GitBranch,
  SlidersHorizontal,
  Stethoscope,
} from 'lucide-react';
import { useDigNet } from '@/lib/store';
import { formatRepairCode, getConfidenceBand } from '@/lib/cf-engine';
import { MEDIA_ASSETS } from '../media-assets';

export function HomeView() {
  const { incidents, repairs, rules, history, setView, openHistoryDetail } = useDigNet();

  const recentHistory = history.slice(0, 4);
  const repairMap = new Map(repairs.map((r) => [r.id, r]));

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-8"
    >
      {/* Hero Split Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 flex flex-col justify-between">
          <div className="space-y-4">
            <p className="text-xs font-semibold tracking-wide text-red-600">
              Sistem Pakar Gangguan FTTH IndiHome · Masa Retensi 60 Hari
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-[1.15] [text-wrap:balance]">
              Diagnosis Cepat & Terukur untuk Gangguan Jaringan IndiHome
            </h1>
            <p className="text-base text-slate-600 leading-relaxed max-w-2xl">
              DigNet memadukan inferensi Forward Chaining dan perhitungan Certainty Factor
              untuk membantu teknisi provisioning mengidentifikasi akar gangguan pada ONT, ODP,
              STB UseeTV, dan layanan telepon secara konsisten di lapangan.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setView('diagnosa')}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
            >
              <Stethoscope className="h-4 w-4" aria-hidden="true" />
              <span>Mulai Diagnosis Baru</span>
            </button>
            <button
              type="button"
              onClick={() => setView('keterangan')}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors whitespace-nowrap"
            >
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              <span>Lihat Panduan SOP</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-5 relative min-h-[260px] lg:min-h-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
          <Image
            src={MEDIA_ASSETS.hero.src}
            alt={MEDIA_ASSETS.hero.alt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 42vw"
            referrerPolicy="no-referrer"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent" />
          <div className="absolute bottom-0 inset-x-0 p-5 text-white">
            <p className="text-xs font-medium text-slate-200">
              Mitra Telkom Akses · Witel Bekasi
            </p>
            <p className="mt-1 text-sm font-semibold leading-snug">
              Standarisasi diagnosis teknis ONT, ODP, dan UseeTV untuk menekan kunjungan ulang.
            </p>
          </div>
        </div>
      </section>

      {/* Full-width 4-Column KPI Strip */}
      <section aria-label="Ringkasan basis pengetahuan">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-xs font-medium text-slate-500">Total Gejala Terdaftar</p>
            <p className="mt-2 font-mono text-3xl font-bold text-slate-900 tabular-nums">
              {incidents.length}
            </p>
            <p className="mt-1 text-xs text-slate-500">ONT, ODP, STB & Telepon</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-xs font-medium text-slate-500">Jenis Tindakan & Gangguan</p>
            <p className="mt-2 font-mono text-3xl font-bold text-slate-900 tabular-nums">
              {repairs.length}
            </p>
            <p className="mt-1 text-xs text-slate-500">Dilengkapi SOP penanganan</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-xs font-medium text-slate-500">Aturan Basis Pengetahuan</p>
            <p className="mt-2 font-mono text-3xl font-bold text-slate-900 tabular-nums">
              {rules.length}
            </p>
            <p className="mt-1 text-xs text-slate-500">Relasi IF-THEN berbobot MB/MD</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-xs font-medium text-slate-500">Riwayat Diagnosis</p>
            <p className="mt-2 font-mono text-3xl font-bold text-slate-900 tabular-nums">
              {history.length}
            </p>
            <p className="mt-1 text-xs text-slate-500">Tersimpan & siap dicetak</p>
          </div>
        </div>
      </section>

      {/* Methodology Overview */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900">
              Alur Inferensi Sistem Pakar
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Tiga tahapan sistematis dari observasi gejala di lokasi hingga rekomendasi tindakan.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setView('bantuan')}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700 whitespace-nowrap"
          >
            <span>Pelajari rumus CF</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 text-slate-900">
              <SlidersHorizontal className="h-4 w-4 text-red-600 shrink-0" aria-hidden="true" />
              <h3 className="font-display text-base font-semibold">
                01. Observasi & Bobot Keyakinan
              </h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Teknisi memilih gejala yang tampak pada ONT, lampu PON, UseeTV, atau telepon
              beserta skala kepastian dari Pasti Ya (+1.0) hingga Pasti Tidak (-1.0).
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2.5 text-slate-900">
              <GitBranch className="h-4 w-4 text-red-600 shrink-0" aria-hidden="true" />
              <h3 className="font-display text-base font-semibold">
                02. Forward Chaining & Kombinasi CF
              </h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Mesin mencocokkan fakta gejala dengan aturan IF-THEN di basis pengetahuan lalu
              menggabungkan nilai CF setiap aturan secara berurutan.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2.5 text-slate-900">
              <CheckCircle2 className="h-4 w-4 text-red-600 shrink-0" aria-hidden="true" />
              <h3 className="font-display text-base font-semibold">
                03. Peringkat Solusi & Cetak Laporan
              </h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Hasil diurutkan berdasarkan persentase keyakinan tertinggi lengkap dengan langkah
              SOP perbaikan, jejak perhitungan, dan laporan siap cetak.
            </p>
          </div>
        </div>
      </section>

      {/* Recent Diagnosis Activity */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Clock className="h-4 w-4 text-slate-500" aria-hidden="true" />
            <h2 className="font-display text-lg font-bold text-slate-900">
              Riwayat Diagnosis Terbaru
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setView('riwayat')}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 whitespace-nowrap"
          >
            <span>Lihat semua</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {recentHistory.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-slate-600">Belum ada riwayat diagnosis tersimpan.</p>
            <button
              type="button"
              onClick={() => setView('diagnosa')}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Mulai Diagnosis Pertama
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-500">
                  <th className="py-3 px-6">ID</th>
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">Hasil Utama</th>
                  <th className="py-3 px-4 text-right">Keyakinan CF</th>
                  <th className="py-3 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {recentHistory.map((item) => {
                  const repair = repairMap.get(item.topRepairId);
                  const pct = (item.topCf * 100).toFixed(2);
                  const band = getConfidenceBand(item.topCf);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-6 font-mono text-xs text-slate-500 tabular-nums">
                        #{item.id}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-600 tabular-nums whitespace-nowrap">
                        {item.timestamp}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-900">
                          {repair ? repair.name : `Gangguan #${item.topRepairId}`}
                        </span>
                        {repair && (
                          <>
                            <span className="mx-1.5 text-slate-300" aria-hidden="true">
                              ·
                            </span>
                            <span className="font-mono text-xs text-slate-400">
                              {formatRepairCode(repair.id)}
                            </span>
                          </>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums">
                        <span
                          className={
                            band.tone === 'high'
                              ? 'font-semibold text-emerald-700'
                              : band.tone === 'medium'
                              ? 'font-semibold text-amber-700'
                              : 'font-semibold text-slate-700'
                          }
                        >
                          {pct}%
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <button
                          type="button"
                          onClick={() => openHistoryDetail(item.id)}
                          aria-label={`Lihat detail riwayat #${item.id}`}
                          className="text-xs font-semibold text-red-600 hover:text-red-700 whitespace-nowrap"
                        >
                          Lihat Detail
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </motion.div>
  );
}
