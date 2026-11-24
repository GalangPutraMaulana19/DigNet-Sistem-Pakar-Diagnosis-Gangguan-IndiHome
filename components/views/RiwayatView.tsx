'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Eye,
  Printer,
  Search,
  Stethoscope,
  Trash2,
} from 'lucide-react';
import {
  formatIncidentCode,
  formatRepairCode,
  getCertaintyLabel,
  getCertaintyWeight,
  getConfidenceBand,
} from '@/lib/cf-engine';
import { useDigNet } from '@/lib/store';
import { MEDIA_ASSETS } from '../media-assets';

export function RiwayatView() {
  const {
    history,
    incidents,
    repairs,
    selectedHistoryId,
    openHistoryDetail,
    clearHistoryDetail,
    deleteHistoryRecord,
    setView,
  } = useDigNet();

  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const repairMap = useMemo(() => new Map(repairs.map((r) => [r.id, r])), [repairs]);
  const incidentMap = useMemo(() => new Map(incidents.map((i) => [i.id, i])), [incidents]);

  const activeRecord = useMemo(
    () => history.find((item) => item.id === selectedHistoryId) ?? null,
    [history, selectedHistoryId]
  );

  const filteredHistory = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return history;
    return history.filter((record) => {
      const repairName = repairMap.get(record.topRepairId)?.name.toLowerCase() ?? '';
      return (
        String(record.id).includes(q) ||
        record.timestamp.toLowerCase().includes(q) ||
        repairName.includes(q) ||
        (record.technicianNote?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [history, searchQuery, repairMap]);

  if (activeRecord) {
    const topRepair = repairMap.get(activeRecord.topRepairId);
    const rankedRepairs = Object.entries(activeRecord.repairScores)
      .map(([idStr, cf]) => ({
        id: Number(idStr),
        cf: Number(cf),
        repair: repairMap.get(Number(idStr)),
      }))
      .sort((a, b) => b.cf - a.cf);
    const alternatives = rankedRepairs.slice(1);
    const selectedSymptoms = Object.entries(activeRecord.selectedIncidents).map(
      ([idStr, condId]) => ({
        id: Number(idStr),
        condId: Number(condId),
        incident: incidentMap.get(Number(idStr)),
      })
    );

    const mediaKey = topRepair?.mediaKey ?? 'ont';

    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="space-y-6 print-container"
      >
        <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-mono text-slate-500 tabular-nums">
              ID Riwayat #{activeRecord.id} · {activeRecord.timestamp}
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold text-slate-900">
              Detail Hasil Diagnosa
            </h1>
            {activeRecord.technicianNote && (
              <p className="mt-1 text-sm text-slate-600">
                Catatan Teknisi: {activeRecord.technicianNote}
              </p>
            )}
          </div>
          <div className="no-print flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={clearHistoryDetail}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Kembali</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 whitespace-nowrap"
            >
              <Printer className="h-4 w-4" aria-hidden="true" />
              <span>Cetak</span>
            </button>
          </div>
        </div>

        {/* Main Result Card */}
        <section className="bg-white border border-slate-200 rounded-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-4 relative min-h-[220px] bg-slate-100">
            <Image
              src={MEDIA_ASSETS[mediaKey].src}
              alt={topRepair?.name ?? 'Ilustrasi perangkat IndiHome'}
              fill
              sizes="(max-width: 1024px) 100vw, 33vw"
              referrerPolicy="no-referrer"
              className="object-cover"
            />
          </div>
          <div className="lg:col-span-8 p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-red-600">
                Hasil Diagnosa Utama ·{' '}
                <span className="font-mono">{formatRepairCode(activeRecord.topRepairId)}</span>
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
                {topRepair?.name ?? `Gangguan #${activeRecord.topRepairId}`}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {topRepair?.detail ?? 'Tidak ada detail tambahan.'}
              </p>
            </div>
            <div className="pt-4 border-t border-slate-200 flex items-baseline justify-between gap-4">
              <span className="text-xs font-medium text-slate-500">
                {getConfidenceBand(activeRecord.topCf).label}
              </span>
              <span className="font-mono text-2xl font-bold text-red-600 tabular-nums">
                {(activeRecord.topCf * 100).toFixed(2)}%
              </span>
            </div>
          </div>
        </section>

        {/* Symptoms Table */}
        <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="font-display text-base font-bold text-slate-900">
              Gejala yang Dialami ({selectedSymptoms.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-medium text-slate-500">
                  <th className="py-3 px-6 w-14">No</th>
                  <th className="py-3 px-4 w-24">Kode</th>
                  <th className="py-3 px-4">Gejala / Keluhan</th>
                  <th className="py-3 px-6 text-right">Kondisi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {selectedSymptoms.map((item, idx) => (
                  <tr key={item.id}>
                    <td className="py-3 px-6 font-mono text-xs text-slate-500 tabular-nums">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs font-semibold text-slate-700">
                      {formatIncidentCode(item.id)}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {item.incident?.name ?? `Gejala #${item.id}`}
                    </td>
                    <td className="py-3 px-6 text-right font-mono text-xs text-slate-600 tabular-nums whitespace-nowrap">
                      {getCertaintyLabel(item.condId)} (
                      {getCertaintyWeight(item.condId) > 0
                        ? `+${getCertaintyWeight(item.condId).toFixed(1)}`
                        : getCertaintyWeight(item.condId).toFixed(1)}
                      )
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* SOP & Alternatives */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="font-display text-base font-bold text-slate-900">
              Saran Penanganan
            </h3>
            <ol className="mt-4 space-y-3">
              {(topRepair?.solutionSteps ?? ['Lakukan pemeriksaan teknis perangkat.']).map(
                (step, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                    <span className="font-mono text-xs font-semibold text-red-700 bg-red-50 rounded h-5 w-5 flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                )
              )}
            </ol>
          </section>

          <section className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="font-display text-base font-bold text-slate-900">
              Kemungkinan Lainnya ({alternatives.length})
            </h3>
            {alternatives.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">
                Tidak ada kemungkinan gangguan alternatif lain.
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-slate-200">
                {alternatives.map((item) => (
                  <li
                    key={item.id}
                    className="py-3 flex items-center justify-between gap-4 text-sm"
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {item.repair?.name ?? `Gangguan #${item.id}`}
                      </p>
                      <p className="text-xs font-mono text-slate-400">
                        {formatRepairCode(item.id)}
                      </p>
                    </div>
                    <span className="font-mono font-semibold text-slate-800 tabular-nums">
                      {(item.cf * 100).toFixed(2)}%
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            Riwayat Diagnosa
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Arsip seluruh hasil diagnosis gangguan IndiHome lengkap dengan skor Certainty Factor.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search
            className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari ID, tanggal, atau gangguan..."
            aria-label="Cari riwayat diagnosa"
            className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/15"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {filteredHistory.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <p className="text-sm text-slate-600">
              {history.length === 0
                ? 'Belum ada data riwayat diagnosa.'
                : `Tidak ditemukan riwayat untuk pencarian "${searchQuery}".`}
            </p>
            <button
              type="button"
              onClick={() => setView('diagnosa')}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              <Stethoscope className="h-4 w-4" aria-hidden="true" />
              <span>Mulai Diagnosis Baru</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-500">
                  <th className="py-3.5 px-6">ID</th>
                  <th className="py-3.5 px-4">Tanggal & Waktu</th>
                  <th className="py-3.5 px-4">Gangguan Terdiagnosa</th>
                  <th className="py-3.5 px-4 text-right">Gejala</th>
                  <th className="py-3.5 px-4 text-right">Nilai CF</th>
                  <th className="py-3.5 px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredHistory.map((item) => {
                  const repair = repairMap.get(item.topRepairId);
                  const symptomCount = Object.keys(item.selectedIncidents).length;
                  const band = getConfidenceBand(item.topCf);
                  const isConfirming = confirmDeleteId === item.id;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-6 font-mono text-xs text-slate-500 tabular-nums">
                        #{item.id}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-600 tabular-nums whitespace-nowrap">
                        {item.timestamp}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-slate-900">
                          {repair?.name ?? `Gangguan #${item.topRepairId}`}
                        </p>
                        {item.technicianNote && (
                          <p className="text-xs text-slate-500 truncate max-w-xs">
                            {item.technicianNote}
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-xs text-slate-600 tabular-nums">
                        {symptomCount}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums whitespace-nowrap">
                        <span
                          className={
                            band.tone === 'high'
                              ? 'font-semibold text-emerald-700'
                              : band.tone === 'medium'
                              ? 'font-semibold text-amber-700'
                              : 'font-semibold text-slate-700'
                          }
                        >
                          {(item.topCf * 100).toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right whitespace-nowrap">
                        {isConfirming ? (
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                deleteHistoryRecord(item.id);
                                setConfirmDeleteId(null);
                              }}
                              className="text-xs font-semibold text-red-600 hover:text-red-700"
                            >
                              Ya, Hapus
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-xs font-medium text-slate-500 hover:text-slate-700"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => openHistoryDetail(item.id)}
                              aria-label={`Lihat detail riwayat #${item.id}`}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700"
                            >
                              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>Detail</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(item.id)}
                              aria-label={`Hapus riwayat #${item.id}`}
                              className="inline-flex items-center text-slate-400 hover:text-red-600"
                            >
                              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}
