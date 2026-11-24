'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  AlertCircle,
  CheckCircle2,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { formatIncidentCode, formatRepairCode } from '@/lib/cf-engine';
import { useDigNet } from '@/lib/store';
import type {
  AppView,
  MediaKey,
  RepairCategory,
  SymptomCategory,
} from '@/lib/types';

const SYMPTOM_CATEGORIES: SymptomCategory[] = [
  'Internet & ONT',
  'UseeTV & STB',
  'Telepon & Perangkat',
];

const REPAIR_CATEGORIES: RepairCategory[] = [
  'ONT / Konfigurasi',
  'ODP & Fiber Optik',
  'STB & UseeTV',
  'Kabel & Voice',
];

const MEDIA_OPTIONS: Array<{ value: MediaKey; label: string }> = [
  { value: 'ont', label: 'Foto Perangkat ONT' },
  { value: 'odp', label: 'Foto Kotak ODP Fiber' },
  { value: 'stb', label: 'Foto Perangkat STB UseeTV' },
  { value: 'hero', label: 'Foto Teknisi Lapangan' },
];

export function AdminCrudView({ mode }: { mode: AppView }) {
  if (mode === 'admin-gejala') return <ManageIncidents />;
  if (mode === 'admin-gangguan') return <ManageRepairs />;
  if (mode === 'admin-pengetahuan') return <ManageRules />;
  if (mode === 'admin-post') return <ManagePosts />;
  if (mode === 'admin-users') return <ManageAdmins />;
  return <ChangePasswordSection />;
}

/* ============================================================
   1. DATA GEJALA (INCIDENTS)
   ============================================================ */
function ManageIncidents() {
  const { incidents, addIncident, updateIncident, deleteIncident } = useDigNet();
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<SymptomCategory>('Internet & ONT');
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return incidents;
    return incidents.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        formatIncidentCode(i.id).toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)
    );
  }, [incidents, search]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = editingId
      ? updateIncident(editingId, name, category)
      : addIncident(name, category);
    if (!res.ok) {
      setFeedback({ type: 'err', msg: res.error ?? 'Gagal menyimpan.' });
      return;
    }
    setFeedback({
      type: 'ok',
      msg: editingId ? 'Data gejala berhasil diperbarui.' : 'Gejala baru berhasil ditambahkan.',
    });
    setEditingId(null);
    setName('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Kelola Data Gejala</h1>
        <p className="mt-1 text-sm text-slate-600">
          Tambah, ubah, atau hapus daftar gejala gangguan perangkat IndiHome.
        </p>
      </div>

      {feedback && <FeedbackBanner type={feedback.type} message={feedback.msg} />}

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-xl p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
      >
        <div className="md:col-span-6">
          <label htmlFor="inc-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
            {editingId ? `Edit Gejala (${formatIncidentCode(editingId)})` : 'Nama Gejala Baru'}
          </label>
          <input
            id="inc-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Lampu LOS pada ONT berkedip merah"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:border-red-600 focus:outline-none"
          />
        </div>
        <div className="md:col-span-3">
          <label htmlFor="inc-cat" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Kategori
          </label>
          <select
            id="inc-cat"
            value={category}
            onChange={(e) => setCategory(e.target.value as SymptomCategory)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:bg-white focus:border-red-600 focus:outline-none"
          >
            {SYMPTOM_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-3 flex items-center gap-2">
          <button
            type="submit"
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 whitespace-nowrap"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>{editingId ? 'Simpan' : 'Tambah Gejala'}</span>
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setName('');
              }}
              aria-label="Batal edit gejala"
              className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </form>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs font-mono text-slate-500 tabular-nums">
            Menampilkan {filtered.length} dari {incidents.length} gejala
          </span>
          <div className="relative w-full sm:w-64">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter gejala..."
              aria-label="Filter daftar gejala"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 py-1.5 text-sm focus:bg-white focus:border-red-600 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-medium text-slate-500">
                <th className="py-3 px-6 w-24">Kode</th>
                <th className="py-3 px-4">Nama Gejala</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-6 font-mono text-xs font-semibold text-slate-700">
                    {formatIncidentCode(item.id)}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-900">{item.name}</td>
                  <td className="py-3 px-4 text-xs text-slate-600">{item.category}</td>
                  <td className="py-3 px-6 text-right whitespace-nowrap space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(item.id);
                        setName(item.name);
                        setCategory(item.category);
                        setFeedback(null);
                      }}
                      aria-label={`Edit gejala ${item.name}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        deleteIncident(item.id);
                        setFeedback({ type: 'ok', msg: `Gejala "${item.name}" dihapus.` });
                      }}
                      aria-label={`Hapus gejala ${item.name}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Hapus</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

/* ============================================================
   2. DATA GANGGUAN (REPAIRS)
   ============================================================ */
function ManageRepairs() {
  const { repairs, addRepair, updateRepair, deleteRepair } = useDigNet();
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<RepairCategory>('ONT / Konfigurasi');
  const [mediaKey, setMediaKey] = useState<MediaKey>('ont');
  const [detail, setDetail] = useState('');
  const [stepsText, setStepsText] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return repairs;
    return repairs.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        formatRepairCode(r.id).toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q)
    );
  }, [repairs, search]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const solutionSteps = stepsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const payload = { name, category, detail, solutionSteps, mediaKey };
    const res = editingId ? updateRepair(editingId, payload) : addRepair(payload);
    if (!res.ok) {
      setFeedback({ type: 'err', msg: res.error ?? 'Gagal menyimpan data gangguan.' });
      return;
    }
    setFeedback({
      type: 'ok',
      msg: editingId
        ? 'Data gangguan dan SOP berhasil diperbarui.'
        : 'Data gangguan baru berhasil ditambahkan.',
    });
    setEditingId(null);
    setName('');
    setDetail('');
    setStepsText('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">
          Kelola Data Gangguan & SOP
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Kelola daftar rekomendasi tindakan perbaikan beserta detail dan langkah penanganan
          lapangan.
        </p>
      </div>

      {feedback && <FeedbackBanner type={feedback.type} message={feedback.msg} />}

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-xl p-5 space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="rep-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
              {editingId ? `Edit Gangguan (${formatRepairCode(editingId)})` : 'Nama Gangguan / Solusi'}
            </label>
            <input
              id="rep-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Ganti Roset Optik"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm focus:bg-white focus:border-red-600 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="rep-cat" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Kategori Komponen
            </label>
            <select
              id="rep-cat"
              value={category}
              onChange={(e) => setCategory(e.target.value as RepairCategory)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:border-red-600 focus:outline-none"
            >
              {REPAIR_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="rep-media" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Foto Referensi
            </label>
            <select
              id="rep-media"
              value={mediaKey}
              onChange={(e) => setMediaKey(e.target.value as MediaKey)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:border-red-600 focus:outline-none"
            >
              {MEDIA_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="rep-detail" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Detail Teknis Gangguan
            </label>
            <textarea
              id="rep-detail"
              rows={3}
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="Jelaskan penyebab teknis gangguan..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm focus:bg-white focus:border-red-600 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="rep-steps" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Langkah SOP Penanganan (pisahkan per baris)
            </label>
            <textarea
              id="rep-steps"
              rows={3}
              value={stepsText}
              onChange={(e) => setStepsText(e.target.value)}
              placeholder={'Ukur redaman optik dengan OPM\nBersihkan konektor SC/APC\nUji koneksi pelanggan'}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm focus:bg-white focus:border-red-600 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>{editingId ? 'Simpan Perubahan' : 'Tambah Gangguan'}</span>
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setName('');
                setDetail('');
                setStepsText('');
              }}
              className="rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Batal
            </button>
          )}
        </div>
      </form>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs font-mono text-slate-500 tabular-nums">
            Total {filtered.length} tindakan gangguan
          </span>
          <div className="relative w-full sm:w-64">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter gangguan..."
              aria-label="Filter daftar gangguan"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 py-1.5 text-sm focus:bg-white focus:border-red-600 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-medium text-slate-500">
                <th className="py-3 px-6 w-20">Kode</th>
                <th className="py-3 px-4">Nama Gangguan</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4 text-right">Langkah SOP</th>
                <th className="py-3 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-6 font-mono text-xs font-semibold text-slate-700">
                    {formatRepairCode(item.id)}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-500 line-clamp-1 max-w-md">{item.detail}</p>
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-600">{item.category}</td>
                  <td className="py-3 px-4 text-right font-mono text-xs text-slate-600 tabular-nums">
                    {item.solutionSteps.length}
                  </td>
                  <td className="py-3 px-6 text-right whitespace-nowrap space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(item.id);
                        setName(item.name);
                        setCategory(item.category);
                        setMediaKey(item.mediaKey);
                        setDetail(item.detail);
                        setStepsText(item.solutionSteps.join('\n'));
                        setFeedback(null);
                      }}
                      aria-label={`Edit gangguan ${item.name}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        deleteRepair(item.id);
                        setFeedback({ type: 'ok', msg: `Gangguan "${item.name}" dihapus.` });
                      }}
                      aria-label={`Hapus gangguan ${item.name}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Hapus</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

/* ============================================================
   3. BASIS PENGETAHUAN (KNOWLEDGE RULES - MB / MD)
   ============================================================ */
function ManageRules() {
  const { rules, repairs, incidents, addRule, updateRule, deleteRule } = useDigNet();
  const [filterRepairId, setFilterRepairId] = useState<number>(0);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [repairId, setRepairId] = useState<number>(repairs[0]?.id ?? 1);
  const [incidentId, setIncidentId] = useState<number>(incidents[0]?.id ?? 1);
  const [mb, setMb] = useState<string>('0.8');
  const [md, setMd] = useState<string>('0.2');
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  const repairMap = useMemo(() => new Map(repairs.map((r) => [r.id, r])), [repairs]);
  const incidentMap = useMemo(() => new Map(incidents.map((i) => [i.id, i])), [incidents]);

  const filteredRules = useMemo(() => {
    if (filterRepairId === 0) return rules;
    return rules.filter((r) => r.repairId === filterRepairId);
  }, [rules, filterRepairId]);

  const cfPreview = useMemo(() => {
    const numMb = Number(mb);
    const numMd = Number(md);
    if (Number.isNaN(numMb) || Number.isNaN(numMd)) return '—';
    return (numMb - numMd).toFixed(2);
  }, [mb, md]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      repairId,
      incidentId,
      mb: Number(mb),
      md: Number(md),
    };
    const res = editingId ? updateRule(editingId, payload) : addRule(payload);
    if (!res.ok) {
      setFeedback({ type: 'err', msg: res.error ?? 'Gagal menyimpan aturan.' });
      return;
    }
    setFeedback({
      type: 'ok',
      msg: editingId
        ? `Aturan #${editingId} berhasil diperbarui.`
        : 'Aturan IF-THEN baru berhasil ditambahkan ke basis pengetahuan.',
    });
    setEditingId(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">
          Basis Pengetahuan (Aturan IF-THEN & CF)
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Hubungkan gejala dengan tindakan gangguan serta atur bobot MB (Measure of Belief) dan
          MD (Measure of Disbelief).
        </p>
      </div>

      {feedback && <FeedbackBanner type={feedback.type} message={feedback.msg} />}

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-xl p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
      >
        <div className="md:col-span-4">
          <label htmlFor="rule-repair" className="block text-xs font-semibold text-slate-700 mb-1.5">
            THEN Gangguan / Solusi
          </label>
          <select
            id="rule-repair"
            value={repairId}
            onChange={(e) => setRepairId(Number(e.target.value))}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:border-red-600 focus:outline-none"
          >
            {repairs.map((r) => (
              <option key={r.id} value={r.id}>
                {formatRepairCode(r.id)} — {r.name}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-4">
          <label htmlFor="rule-incident" className="block text-xs font-semibold text-slate-700 mb-1.5">
            IF Gejala
          </label>
          <select
            id="rule-incident"
            value={incidentId}
            onChange={(e) => setIncidentId(Number(e.target.value))}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:border-red-600 focus:outline-none"
          >
            {incidents.map((inc) => (
              <option key={inc.id} value={inc.id}>
                {formatIncidentCode(inc.id)} — {inc.name}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-1">
          <label htmlFor="rule-mb" className="block text-xs font-semibold text-slate-700 mb-1.5">
            MB
          </label>
          <input
            id="rule-mb"
            type="number"
            step="0.1"
            min="0"
            max="1"
            value={mb}
            onChange={(e) => setMb(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm font-mono tabular-nums focus:bg-white focus:border-red-600 focus:outline-none"
          />
        </div>

        <div className="md:col-span-1">
          <label htmlFor="rule-md" className="block text-xs font-semibold text-slate-700 mb-1.5">
            MD
          </label>
          <input
            id="rule-md"
            type="number"
            step="0.1"
            min="0"
            max="1"
            value={md}
            onChange={(e) => setMd(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm font-mono tabular-nums focus:bg-white focus:border-red-600 focus:outline-none"
          />
        </div>

        <div className="md:col-span-2 flex items-center gap-2">
          <button
            type="submit"
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-red-700 whitespace-nowrap"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>{editingId ? 'Update' : 'Simpan'}</span>
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => setEditingId(null)}
              aria-label="Batal edit aturan"
              className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="md:col-span-12 text-xs text-slate-500 font-mono tabular-nums">
          Pratinjau CF Pakar (MB − MD):{' '}
          <strong className="text-slate-900">{cfPreview}</strong>
        </div>
      </form>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs font-mono text-slate-500 tabular-nums">
            Menampilkan {filteredRules.length} dari {rules.length} aturan
          </span>
          <select
            aria-label="Filter aturan berdasarkan gangguan"
            value={filterRepairId}
            onChange={(e) => setFilterRepairId(Number(e.target.value))}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700 focus:bg-white focus:border-red-600 focus:outline-none"
          >
            <option value={0}>Semua Gangguan</option>
            {repairs.map((r) => (
              <option key={r.id} value={r.id}>
                {formatRepairCode(r.id)} — {r.name}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-medium text-slate-500">
                <th className="py-3 px-6 w-20">ID</th>
                <th className="py-3 px-4">Gangguan (THEN)</th>
                <th className="py-3 px-4">Gejala (IF)</th>
                <th className="py-3 px-4 text-right">MB</th>
                <th className="py-3 px-4 text-right">MD</th>
                <th className="py-3 px-4 text-right">CF Pakar</th>
                <th className="py-3 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredRules.map((rule) => {
                const rep = repairMap.get(rule.repairId);
                const inc = incidentMap.get(rule.incidentId);
                const cfExpert = (rule.mb - rule.md).toFixed(2);
                return (
                  <tr key={rule.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-6 font-mono text-xs text-slate-500 tabular-nums">
                      #{rule.id}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {rep?.name ?? `Gangguan #${rule.repairId}`}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      <span className="font-mono text-xs text-slate-400 mr-1.5">
                        {formatIncidentCode(rule.incidentId)}
                      </span>
                      {inc?.name ?? `Gejala #${rule.incidentId}`}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-xs tabular-nums">
                      {rule.mb.toFixed(1)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-xs tabular-nums">
                      {rule.md.toFixed(1)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-xs font-semibold text-red-700 tabular-nums">
                      {cfExpert}
                    </td>
                    <td className="py-3 px-6 text-right whitespace-nowrap space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(rule.id);
                          setRepairId(rule.repairId);
                          setIncidentId(rule.incidentId);
                          setMb(String(rule.mb));
                          setMd(String(rule.md));
                          setFeedback(null);
                        }}
                        aria-label={`Edit aturan #${rule.id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          deleteRule(rule.id);
                          setFeedback({ type: 'ok', msg: `Aturan #${rule.id} dihapus.` });
                        }}
                        aria-label={`Hapus aturan #${rule.id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Hapus</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

/* ============================================================
   4. POST KETERANGAN (ARTICLES)
   ============================================================ */
function ManagePosts() {
  const { posts, addPost, updatePost, deletePost } = useDigNet();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<RepairCategory>('ONT / Konfigurasi');
  const [mediaKey, setMediaKey] = useState<MediaKey>('ont');
  const [summary, setSummary] = useState('');
  const [detail, setDetail] = useState('');
  const [stepsText, setStepsText] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const solutionSteps = stepsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const payload = { title, category, summary, detail, solutionSteps, mediaKey };
    const res = editingId ? updatePost(editingId, payload) : addPost(payload);
    if (!res.ok) {
      setFeedback({ type: 'err', msg: res.error ?? 'Gagal menyimpan artikel.' });
      return;
    }
    setFeedback({
      type: 'ok',
      msg: editingId ? 'Artikel keterangan diperbarui.' : 'Artikel keterangan baru diterbitkan.',
    });
    setEditingId(null);
    setTitle('');
    setSummary('');
    setDetail('');
    setStepsText('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">
          Kelola Post Keterangan
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Publikasikan panduan teknis dan artikel referensi yang tampil pada halaman Keterangan.
        </p>
      </div>

      {feedback && <FeedbackBanner type={feedback.type} message={feedback.msg} />}

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-xl p-5 space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="post-title" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Judul Artikel
            </label>
            <input
              id="post-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Standar Splicing Drop Core"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm focus:bg-white focus:border-red-600 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="post-cat" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Kategori
            </label>
            <select
              id="post-cat"
              value={category}
              onChange={(e) => setCategory(e.target.value as RepairCategory)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:border-red-600 focus:outline-none"
            >
              {REPAIR_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="post-media" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Ilustrasi
            </label>
            <select
              id="post-media"
              value={mediaKey}
              onChange={(e) => setMediaKey(e.target.value as MediaKey)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:border-red-600 focus:outline-none"
            >
              {MEDIA_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="post-summary" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Ringkasan Singkat
          </label>
          <input
            id="post-summary"
            type="text"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Ringkasan 1–2 kalimat untuk tampilan kartu..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm focus:bg-white focus:border-red-600 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="post-detail" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Uraian Teknis Lengkap
            </label>
            <textarea
              id="post-detail"
              rows={3}
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm focus:bg-white focus:border-red-600 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="post-steps" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Langkah Penanganan (per baris)
            </label>
            <textarea
              id="post-steps"
              rows={3}
              value={stepsText}
              onChange={(e) => setStepsText(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm focus:bg-white focus:border-red-600 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>{editingId ? 'Simpan Artikel' : 'Terbitkan Artikel'}</span>
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setTitle('');
                setSummary('');
                setDetail('');
                setStepsText('');
              }}
              className="rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Batal
            </button>
          )}
        </div>
      </form>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-medium text-slate-500">
                <th className="py-3 px-6">Judul Artikel</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Diperbarui</th>
                <th className="py-3 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-slate-50/70">
                  <td className="py-3.5 px-6 font-medium text-slate-900">{post.title}</td>
                  <td className="py-3.5 px-4 text-xs text-slate-600">{post.category}</td>
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-500 tabular-nums">
                    {post.updatedAt}
                  </td>
                  <td className="py-3.5 px-6 text-right whitespace-nowrap space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(post.id);
                        setTitle(post.title);
                        setCategory(post.category);
                        setMediaKey(post.mediaKey);
                        setSummary(post.summary);
                        setDetail(post.detail);
                        setStepsText(post.solutionSteps.join('\n'));
                        setFeedback(null);
                      }}
                      aria-label={`Edit artikel ${post.title}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        deletePost(post.id);
                        setFeedback({ type: 'ok', msg: `Artikel "${post.title}" dihapus.` });
                      }}
                      aria-label={`Hapus artikel ${post.title}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Hapus</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

/* ============================================================
   5. KELOLA ADMIN
   ============================================================ */
function ManageAdmins() {
  const { admins, currentAdmin, addAdmin, deleteAdmin } = useDigNet();
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('Admin Pakar');
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = addAdmin({ username, fullName, role, password });
    if (!res.ok) {
      setFeedback({ type: 'err', msg: res.error ?? 'Gagal menambahkan admin.' });
      return;
    }
    setFeedback({ type: 'ok', msg: `Akun admin "${username}" berhasil ditambahkan.` });
    setUsername('');
    setFullName('');
    setPassword('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Kelola Admin Pakar</h1>
        <p className="mt-1 text-sm text-slate-600">
          Daftar akun yang memiliki hak akses untuk memperbarui basis pengetahuan DigNet.
        </p>
      </div>

      {feedback && <FeedbackBanner type={feedback.type} message={feedback.msg} />}

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-xl p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
      >
        <div className="md:col-span-3">
          <label htmlFor="adm-user" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Username
          </label>
          <input
            id="adm-user"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="pakar_bekasi"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:border-red-600 focus:outline-none"
          />
        </div>
        <div className="md:col-span-3">
          <label htmlFor="adm-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Nama Lengkap
          </label>
          <input
            id="adm-name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nama Pakar"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:border-red-600 focus:outline-none"
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="adm-role" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Peran
          </label>
          <input
            id="adm-role"
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:border-red-600 focus:outline-none"
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="adm-pass" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Password
          </label>
          <input
            id="adm-pass"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:border-red-600 focus:outline-none"
          />
        </div>
        <div className="md:col-span-2">
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-red-700 whitespace-nowrap"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Tambah</span>
          </button>
        </div>
      </form>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-medium text-slate-500">
              <th className="py-3 px-6">Username</th>
              <th className="py-3 px-4">Nama Lengkap</th>
              <th className="py-3 px-4">Peran</th>
              <th className="py-3 px-6 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {admins.map((adm) => {
              const isSelf = currentAdmin?.username === adm.username;
              return (
                <tr key={adm.username} className="hover:bg-slate-50/70">
                  <td className="py-3.5 px-6 font-mono text-xs font-semibold text-slate-900">
                    @{adm.username}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-900">{adm.fullName}</td>
                  <td className="py-3.5 px-4 text-xs text-slate-600">
                    {adm.role}
                    {isSelf && ' · Sesi Aktif'}
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    {isSelf ? (
                      <span className="text-xs text-slate-400">Aktif</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          const res = deleteAdmin(adm.username);
                          setFeedback(
                            res.ok
                              ? { type: 'ok', msg: `Admin @${adm.username} dihapus.` }
                              : { type: 'err', msg: res.error ?? 'Gagal menghapus.' }
                          );
                        }}
                        aria-label={`Hapus admin ${adm.username}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Hapus</span>
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

/* ============================================================
   6. UBAH PASSWORD
   ============================================================ */
function ChangePasswordSection() {
  const { currentAdmin, changePassword } = useDigNet();
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      setFeedback({ type: 'err', msg: 'Konfirmasi password baru tidak cocok.' });
      return;
    }
    const res = changePassword(currentPass, newPass);
    if (!res.ok) {
      setFeedback({ type: 'err', msg: res.error ?? 'Gagal mengubah password.' });
      return;
    }
    setFeedback({ type: 'ok', msg: 'Password berhasil diperbarui.' });
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="max-w-lg space-y-6"
    >
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">Ubah Password</h1>
        <p className="mt-1 text-sm text-slate-600">
          Perbarui password untuk akun aktif{' '}
          <span className="font-mono font-semibold text-slate-900">
            @{currentAdmin?.username}
          </span>
          .
        </p>
      </div>

      {feedback && <FeedbackBanner type={feedback.type} message={feedback.msg} />}

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
      >
        <div>
          <label htmlFor="old-pass" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Password Saat Ini
          </label>
          <input
            id="old-pass"
            type="password"
            value={currentPass}
            onChange={(e) => setCurrentPass(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm focus:bg-white focus:border-red-600 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="new-pass" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Password Baru
          </label>
          <input
            id="new-pass"
            type="password"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm focus:bg-white focus:border-red-600 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="conf-pass" className="block text-xs font-semibold text-slate-700 mb-1.5">
            Konfirmasi Password Baru
          </label>
          <input
            id="conf-pass"
            type="password"
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm focus:bg-white focus:border-red-600 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
        >
          Simpan Password Baru
        </button>
      </form>
    </motion.div>
  );
}

function FeedbackBanner({ type, message }: { type: 'ok' | 'err'; message: string }) {
  return (
    <div
      role="status"
      className={`rounded-xl border px-4 py-3 flex items-center gap-2.5 text-sm ${
        type === 'ok'
          ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
          : 'border-red-200 bg-red-50 text-red-900'
      }`}
    >
      {type === 'ok' ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" aria-hidden="true" />
      ) : (
        <AlertCircle className="h-4 w-4 text-red-600 shrink-0" aria-hidden="true" />
      )}
      <span>{message}</span>
    </div>
  );
}
