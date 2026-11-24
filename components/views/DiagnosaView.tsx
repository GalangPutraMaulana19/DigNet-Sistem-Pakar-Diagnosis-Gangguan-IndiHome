'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Printer,
  RotateCcw,
  Search,
  Stethoscope,
} from 'lucide-react';
import {
  formatIncidentCode,
  formatRepairCode,
  getCertaintyLabel,
  getCertaintyWeight,
  getConfidenceBand,
  runDiagnosis,
} from '@/lib/cf-engine';
import { CERTAINTY_CONDITIONS } from '@/lib/seed-data';
import { useDigNet } from '@/lib/store';
import type { DiagnosisCandidate, SymptomCategory } from '@/lib/types';
import { MEDIA_ASSETS } from '../media-assets';

type CategoryFilter = 'Semua' | SymptomCategory;

const CATEGORIES: CategoryFilter[] = [
  'Semua',
  'Internet & ONT',
  'UseeTV & STB',
  'Telepon & Perangkat',
];

export function DiagnosaView() {
  const { incidents, repairs, rules, recordDiagnosis, openHistoryDetail } = useDigNet();

  const [selections, setSelections] = useState<Record<number, number>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('Semua');
  const [technicianNote, setTechnicianNote] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submittedResult, setSubmittedResult] = useState<{
    historyId: number;
    timestamp: string;
    selectedSnapshot: Record<number, number>;
    candidates: DiagnosisCandidate[];
    note?: string;
  } | null>(null);
  const [showTrace, setShowTrace] = useState(true);

  const selectedEntries = useMemo(
    () =>
      Object.entries(selections)
        .map(([k, v]) => [Number(k), v] as const)
        .filter(([, v]) => v >= 1 && v <= 9),
    [selections]
  );

  const filteredIncidents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return incidents.filter((inc) => {
      const matchesCat = categoryFilter === 'Semua' || inc.category === categoryFilter;
      const matchesQuery =
        !q ||
        inc.name.toLowerCase().includes(q) ||
        formatIncidentCode(inc.id).toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [incidents, searchQuery, categoryFilter]);

  const handleSelectChange = (incidentId: number, conditionId: number) => {
    setValidationError(null);
    setSelections((prev) => {
      const next = { ...prev };
      if (conditionId === 0) {
        delete next[incidentId];
      } else {
        next[incidentId] = conditionId;
      }
      return next;
    });
  };

  const handleReset = () => {
    setSelections({});
    setTechnicianNote('');
    setValidationError(null);
    setSubmittedResult(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const engineOutput = runDiagnosis(selections, incidents, repairs, rules);
    if (!engineOutput.ok) {
      setValidationError(engineOutput.error ?? 'Silakan pilih minimal satu gejala.');
      return;
    }

    const saved = recordDiagnosis(selections, technicianNote);
    if (!saved.ok || !saved.record) {
      setValidationError(saved.error ?? 'Gagal menyimpan hasil diagnosa.');
      return;
    }

    setValidationError(null);
    setSubmittedResult({
      historyId: saved.record.id,
      timestamp: saved.record.timestamp,
      selectedSnapshot: { ...saved.record.selectedIncidents },
      candidates: engineOutput.candidates,
      note: saved.record.technicianNote,
    });
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  };

  if (submittedResult) {
    const primary = submittedResult.candidates[0];
    const alternatives = submittedResult.candidates.slice(1);
    const incidentMap = new Map(incidents.map((i) => [i.id, i]));
    const selectedList = Object.entries(submittedResult.selectedSnapshot).map(([id, cond]) => ({
      incidentId: Number(id),
      incidentName: incidentMap.get(Number(id))?.name ?? `Gejala #${id}`,
      conditionId: cond,
    }));

    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="space-y-6 print-container"
      >
        {/* Result Header */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-slate-500 font-mono tabular-nums">
              Laporan Diagnosis #{submittedResult.historyId} · {submittedResult.timestamp}
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold text-slate-900">
              Hasil Diagnosis Gangguan IndiHome
            </h1>
            {submittedResult.note && (
              <p className="mt-1 text-sm text-slate-600">
                Catatan Teknisi: {submittedResult.note}
              </p>
            )}
          </div>
          <div className="no-print flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
            >
              <Printer className="h-4 w-4" aria-hidden="true" />
              <span>Cetak Laporan</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 whitespace-nowrap"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span>Diagnosis Baru</span>
            </button>
          </div>
        </div>

        {!primary ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-3">
            <AlertCircle className="h-8 w-8 text-amber-600 mx-auto" aria-hidden="true" />
            <h2 className="font-display text-lg font-bold text-slate-900">
              Tidak Ditemukan Gangguan Positif
            </h2>
            <p className="text-sm text-slate-600 max-w-lg mx-auto">
              Kombinasi bobot kepastian yang Anda pilih menghasilkan nilai CF ≤ 0 untuk seluruh
              aturan di basis pengetahuan. Periksa kembali observasi gejala atau pilih kondisi
              positif pada gejala yang benar-benar terjadi.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="mt-2 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Ulangi Diagnosis
            </button>
          </div>
        ) : (
          <>
            {/* Primary Recommendation Split */}
            <section className="bg-white border border-slate-200 rounded-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
              <div className="lg:col-span-4 relative min-h-[220px] bg-slate-100">
                <Image
                  src={MEDIA_ASSETS[primary.mediaKey].src}
                  alt={primary.repairName}
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  referrerPolicy="no-referrer"
                  className="object-cover"
                />
              </div>
              <div className="lg:col-span-8 p-6 sm:p-8 flex flex-col justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-red-600">Diagnosis Utama</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">{formatRepairCode(primary.repairId)}</span>
                    <span aria-hidden="true">·</span>
                    <span>{primary.category}</span>
                  </div>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
                    {primary.repairName}
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed">{primary.detail}</p>
                </div>

                <div className="pt-4 border-t border-slate-200 space-y-2">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-xs font-medium text-slate-600">
                      Tingkat Kepercayaan Certainty Factor ({getConfidenceBand(primary.cf).label})
                    </span>
                    <span className="font-mono text-2xl font-bold text-red-600 tabular-nums">
                      {primary.percentage.toFixed(2)}%
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-red-600 transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(4, primary.percentage))}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 font-mono tabular-nums">
                    Nilai CF Gabungan: {primary.cf.toFixed(4)} · Cocok pada{' '}
                    {primary.matchedRulesCount} aturan basis pengetahuan
                  </p>
                </div>
              </div>
            </section>

            {/* Step-by-Step Field SOP */}
            <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
              <h3 className="font-display text-lg font-bold text-slate-900">
                Langkah Penanganan Lapangan (SOP)
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Rekomendasi prosedur perbaikan untuk {primary.repairName}:
              </p>
              <ol className="mt-5 space-y-3">
                {primary.solutionSteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-3.5 text-sm text-slate-700">
                    <span className="font-mono text-xs font-semibold text-red-700 bg-red-50 rounded-md h-6 w-6 flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
                      {index + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </section>

            {/* Transparent Forward Chaining & CF Calculation Trace */}
            <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowTrace((v) => !v)}
                aria-expanded={showTrace}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
              >
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900">
                    Transparansi Perhitungan Forward Chaining & Certainty Factor
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Rincian aturan IF-THEN yang aktif untuk {primary.repairName}
                  </p>
                </div>
                {showTrace ? (
                  <ChevronUp className="h-4 w-4 text-slate-500" aria-hidden="true" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-500" aria-hidden="true" />
                )}
              </button>

              {showTrace && (
                <div className="border-t border-slate-200 overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-xs font-medium text-slate-500">
                        <th className="py-3 px-6">Aturan</th>
                        <th className="py-3 px-4">Gejala Terpilih</th>
                        <th className="py-3 px-4 text-right">MB / MD</th>
                        <th className="py-3 px-4 text-right">CF Pakar</th>
                        <th className="py-3 px-4 text-right">CF User</th>
                        <th className="py-3 px-4 text-right">CF Gejala</th>
                        <th className="py-3 px-6 text-right">CF Gabungan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {primary.trace.map((step) => (
                        <tr key={step.ruleId}>
                          <td className="py-3 px-6 font-mono text-xs text-slate-500 tabular-nums">
                            #{step.ruleId}
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-medium text-slate-900">
                              <span className="font-mono text-xs text-slate-500 mr-1.5">
                                {formatIncidentCode(step.incidentId)}
                              </span>
                              {step.incidentName}
                            </p>
                            <p className="text-xs text-slate-500">{step.conditionLabel}</p>
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-xs text-slate-600 tabular-nums">
                            {step.mb.toFixed(1)} / {step.md.toFixed(1)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-xs text-slate-700 tabular-nums">
                            {step.cfExpert.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-xs text-slate-700 tabular-nums">
                            {step.userWeight.toFixed(1)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-xs font-medium text-slate-900 tabular-nums">
                            {step.cfRule.toFixed(4)}
                          </td>
                          <td className="py-3 px-6 text-right font-mono text-xs font-bold text-red-700 tabular-nums">
                            {step.cfAfter.toFixed(4)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Selected Symptoms & Alternative Candidates Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200">
                  <h3 className="font-display text-base font-bold text-slate-900">
                    Gejala yang Dilaporkan ({selectedList.length})
                  </h3>
                </div>
                <ul className="divide-y divide-slate-200">
                  {selectedList.map((item) => (
                    <li
                      key={item.incidentId}
                      className="px-6 py-3.5 flex items-center justify-between gap-4 text-sm"
                    >
                      <div>
                        <span className="font-mono text-xs text-slate-400 mr-2">
                          {formatIncidentCode(item.incidentId)}
                        </span>
                        <span className="text-slate-900 font-medium">{item.incidentName}</span>
                      </div>
                      <span className="text-xs font-medium text-slate-600 whitespace-nowrap font-mono tabular-nums">
                        {getCertaintyLabel(item.conditionId)} (
                        {getCertaintyWeight(item.conditionId) > 0
                          ? `+${getCertaintyWeight(item.conditionId).toFixed(1)}`
                          : getCertaintyWeight(item.conditionId).toFixed(1)}
                        )
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200">
                  <h3 className="font-display text-base font-bold text-slate-900">
                    Kemungkinan Gangguan Lainnya ({alternatives.length})
                  </h3>
                </div>
                {alternatives.length === 0 ? (
                  <p className="p-6 text-sm text-slate-500">
                    Tidak ada kandidat gangguan alternatif lainnya untuk gejala terpilih.
                  </p>
                ) : (
                  <ul className="divide-y divide-slate-200">
                    {alternatives.map((cand) => (
                      <li
                        key={cand.repairId}
                        className="px-6 py-3.5 flex items-center justify-between gap-4 text-sm"
                      >
                        <div>
                          <p className="font-medium text-slate-900">{cand.repairName}</p>
                          <p className="text-xs text-slate-500">
                            {formatRepairCode(cand.repairId)} · {cand.category}
                          </p>
                        </div>
                        <span className="font-mono text-sm font-semibold text-slate-800 tabular-nums whitespace-nowrap">
                          {cand.percentage.toFixed(2)}%
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>

            <div className="no-print flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => openHistoryDetail(submittedResult.historyId)}
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Buka arsip riwayat #{submittedResult.historyId}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="text-sm font-semibold text-red-600 hover:text-red-700"
              >
                Lakukan Diagnosis Lainnya
              </button>
            </div>
          </>
        )}
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
      {/* Page Heading */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            Diagnosis Gangguan IndiHome
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Pilih tingkat kepastian pada gejala yang dialami pelanggan. Sistem menghitung
            kemungkinan gangguan secara langsung menggunakan Forward Chaining & Certainty Factor.
          </p>
        </div>
        <div className="text-sm text-slate-600 font-mono tabular-nums whitespace-nowrap">
          Terpilih: <strong className="text-slate-900">{selectedEntries.length}</strong> /{' '}
          {incidents.length} gejala
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-72">
          <Search
            className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari gejala atau kode (mis. G003)..."
            aria-label="Cari gejala"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/15"
          />
        </div>
      </div>

      {validationError && (
        <div
          role="alert"
          className="rounded-xl border border-amber-300 bg-amber-50 px-5 py-4 flex items-start gap-3 text-sm text-amber-900"
        >
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="font-semibold">Peringatan Validasi</p>
            <p className="mt-0.5 text-amber-800">{validationError}</p>
          </div>
        </div>
      )}

      {/* Diagnosis Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50/70">
            <h2 className="font-display text-base font-bold text-slate-900">
              Daftar Gejala Gangguan
            </h2>
            {selectedEntries.length > 0 && (
              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-medium text-slate-600 hover:text-red-600 transition-colors"
              >
                Reset Pilihan
              </button>
            )}
          </div>

          {filteredIncidents.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Tidak ada gejala yang cocok dengan pencarian &ldquo;{searchQuery}&rdquo;.
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredIncidents.map((incident) => {
                const selectedCond = selections[incident.id] ?? 0;
                const isSelected = selectedCond > 0;
                return (
                  <div
                    key={incident.id}
                    className={`px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                      isSelected ? 'bg-red-50/40' : 'hover:bg-slate-50/70'
                    }`}
                  >
                    <label
                      htmlFor={`gejala-${incident.id}`}
                      className="flex-1 min-w-0 cursor-pointer"
                    >
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="font-mono font-semibold text-slate-700">
                          {formatIncidentCode(incident.id)}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{incident.category}</span>
                      </div>
                      <p className="mt-0.5 text-sm font-medium text-slate-900">
                        {incident.name}
                      </p>
                    </label>

                    <div className="sm:w-64 shrink-0">
                      <select
                        id={`gejala-${incident.id}`}
                        aria-label={`Tingkat kepastian untuk ${incident.name}`}
                        value={selectedCond}
                        onChange={(e) =>
                          handleSelectChange(incident.id, Number(e.target.value))
                        }
                        className={`w-full rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-600/20 ${
                          isSelected
                            ? 'border-red-500 bg-white text-slate-900'
                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <option value={0}>Pilih kondisi (Tidak dialami)</option>
                        {CERTAINTY_CONDITIONS.map((cond) => (
                          <option key={cond.id} value={cond.id}>
                            {cond.label} ({cond.weight > 0 ? `+${cond.weight}` : cond.weight})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Optional Field Note & Submit Footer */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col lg:flex-row lg:items-end justify-between gap-5">
          <div className="flex-1 max-w-xl">
            <label
              htmlFor="technician-note"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Catatan Lapangan / Nomor Tiket (Opsional)
            </label>
            <input
              id="technician-note"
              type="text"
              value={technicianNote}
              onChange={(e) => setTechnicianNote(e.target.value)}
              placeholder="Contoh: IN20260114 · ODP-BKS-FA/04 · RX -21.4 dBm"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/15"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span>Reset</span>
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
            >
              <Stethoscope className="h-4 w-4" aria-hidden="true" />
              <span>Proses Diagnosa</span>
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
