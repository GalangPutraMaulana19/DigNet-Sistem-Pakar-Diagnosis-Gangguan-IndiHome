'use client';

import React, { createContext, useContext, useMemo, useState, useSyncExternalStore } from 'react';
import { formatJakartaTimestamp, runDiagnosis } from './cf-engine';
import {
  INITIAL_ADMINS,
  INITIAL_HISTORY,
  INITIAL_INCIDENTS,
  INITIAL_POSTS,
  INITIAL_REPAIRS,
  INITIAL_RULES,
} from './seed-data';
import type {
  AdminAccount,
  AppView,
  DiagnosisHistoryRecord,
  GuideArticle,
  Incident,
  KnowledgeRule,
  MediaKey,
  Repair,
  RepairCategory,
  SymptomCategory,
} from './types';

const STORAGE_KEY = 'dignet_indihome_state_v2';

interface PersistedState {
  incidents: Incident[];
  repairs: Repair[];
  rules: KnowledgeRule[];
  history: DiagnosisHistoryRecord[];
  posts: GuideArticle[];
  admins: AdminAccount[];
  activeAdminUsername: string | null;
}

const DEFAULT_PERSISTED_STATE: PersistedState = {
  incidents: INITIAL_INCIDENTS,
  repairs: INITIAL_REPAIRS,
  rules: INITIAL_RULES,
  history: INITIAL_HISTORY,
  posts: INITIAL_POSTS,
  admins: INITIAL_ADMINS,
  activeAdminUsername: null,
};

let cachedRaw: string | null = null;
let cachedSnapshot: PersistedState = DEFAULT_PERSISTED_STATE;
const listeners = new Set<() => void>();

function readPersistedSnapshot(): PersistedState {
  if (typeof window === 'undefined') return DEFAULT_PERSISTED_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === cachedRaw) return cachedSnapshot;
    cachedRaw = raw;
    if (!raw) {
      cachedSnapshot = DEFAULT_PERSISTED_STATE;
      return cachedSnapshot;
    }
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    cachedSnapshot = {
      incidents:
        Array.isArray(parsed.incidents) && parsed.incidents.length > 0
          ? parsed.incidents
          : INITIAL_INCIDENTS,
      repairs:
        Array.isArray(parsed.repairs) && parsed.repairs.length > 0
          ? parsed.repairs
          : INITIAL_REPAIRS,
      rules:
        Array.isArray(parsed.rules) && parsed.rules.length > 0
          ? parsed.rules
          : INITIAL_RULES,
      history: Array.isArray(parsed.history) ? parsed.history : INITIAL_HISTORY,
      posts: Array.isArray(parsed.posts) ? parsed.posts : INITIAL_POSTS,
      admins:
        Array.isArray(parsed.admins) && parsed.admins.length > 0
          ? parsed.admins
          : INITIAL_ADMINS,
      activeAdminUsername:
        typeof parsed.activeAdminUsername === 'string'
          ? parsed.activeAdminUsername
          : null,
    };
    return cachedSnapshot;
  } catch {
    return DEFAULT_PERSISTED_STATE;
  }
}

function writePersistedState(updater: (prev: PersistedState) => PersistedState) {
  const prev = readPersistedSnapshot();
  const next = updater(prev);
  const serialized = JSON.stringify(next);
  cachedRaw = serialized;
  cachedSnapshot = next;
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, serialized);
    } catch {
      // Ignore storage quota errors
    }
  }
  listeners.forEach((listener) => listener());
}

function subscribePersistedStore(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) listener();
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', onStorage);
  }
  return () => {
    listeners.delete(listener);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', onStorage);
    }
  };
}

interface DigNetContextValue {
  hydrated: boolean;
  view: AppView;
  setView: (view: AppView) => void;
  selectedHistoryId: number | null;
  openHistoryDetail: (id: number) => void;
  clearHistoryDetail: () => void;

  incidents: Incident[];
  repairs: Repair[];
  rules: KnowledgeRule[];
  history: DiagnosisHistoryRecord[];
  posts: GuideArticle[];
  admins: AdminAccount[];
  currentAdmin: AdminAccount | null;

  // Diagnosis action
  recordDiagnosis: (
    selectedIncidents: Record<number, number>,
    technicianNote?: string
  ) => { ok: boolean; error?: string; record?: DiagnosisHistoryRecord };
  deleteHistoryRecord: (id: number) => void;

  // Auth actions
  loginAdmin: (username: string, password: string) => { ok: boolean; error?: string };
  logoutAdmin: () => void;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => { ok: boolean; error?: string };

  // CRUD: Gejala (Incidents)
  addIncident: (name: string, category: SymptomCategory) => { ok: boolean; error?: string };
  updateIncident: (id: number, name: string, category: SymptomCategory) => { ok: boolean; error?: string };
  deleteIncident: (id: number) => void;

  // CRUD: Gangguan (Repairs)
  addRepair: (payload: {
    name: string;
    category: RepairCategory;
    detail: string;
    solutionSteps: string[];
    mediaKey: MediaKey;
  }) => { ok: boolean; error?: string };
  updateRepair: (
    id: number,
    payload: {
      name: string;
      category: RepairCategory;
      detail: string;
      solutionSteps: string[];
      mediaKey: MediaKey;
    }
  ) => { ok: boolean; error?: string };
  deleteRepair: (id: number) => void;

  // CRUD: Basis Pengetahuan (Rules)
  addRule: (payload: {
    repairId: number;
    incidentId: number;
    mb: number;
    md: number;
  }) => { ok: boolean; error?: string };
  updateRule: (
    id: number,
    payload: { repairId: number; incidentId: number; mb: number; md: number }
  ) => { ok: boolean; error?: string };
  deleteRule: (id: number) => void;

  // CRUD: Post Keterangan (Guide Articles)
  addPost: (payload: {
    title: string;
    category: RepairCategory;
    summary: string;
    detail: string;
    solutionSteps: string[];
    mediaKey: MediaKey;
  }) => { ok: boolean; error?: string };
  updatePost: (
    id: number,
    payload: {
      title: string;
      category: RepairCategory;
      summary: string;
      detail: string;
      solutionSteps: string[];
      mediaKey: MediaKey;
    }
  ) => { ok: boolean; error?: string };
  deletePost: (id: number) => void;

  // CRUD: Admin Accounts
  addAdmin: (payload: {
    username: string;
    password: string;
    fullName: string;
    role: string;
  }) => { ok: boolean; error?: string };
  deleteAdmin: (username: string) => { ok: boolean; error?: string };

  // Maintenance
  resetToSeedData: () => void;
}

const DigNetContext = createContext<DigNetContextValue | null>(null);

export function DigNetProvider({ children }: { children: React.ReactNode }) {
  const state = useSyncExternalStore(
    subscribePersistedStore,
    readPersistedSnapshot,
    () => DEFAULT_PERSISTED_STATE
  );
  const setState = writePersistedState;
  const hydrated = true;
  const [view, setViewState] = useState<AppView>('beranda');
  const [selectedHistoryId, setSelectedHistoryId] = useState<number | null>(null);

  const currentAdmin = useMemo(() => {
    if (!state.activeAdminUsername) return null;
    return state.admins.find((a) => a.username === state.activeAdminUsername) ?? null;
  }, [state.activeAdminUsername, state.admins]);

  const setView = (nextView: AppView) => {
    const adminViews: AppView[] = [
      'admin-dashboard',
      'admin-gejala',
      'admin-gangguan',
      'admin-pengetahuan',
      'admin-post',
      'admin-users',
      'admin-password',
    ];
    if (adminViews.includes(nextView) && !currentAdmin) {
      setViewState('admin-login');
      return;
    }
    if (nextView !== 'riwayat') {
      setSelectedHistoryId(null);
    }
    setViewState(nextView);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const openHistoryDetail = (id: number) => {
    setSelectedHistoryId(id);
    setViewState('riwayat');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const clearHistoryDetail = () => setSelectedHistoryId(null);

  const recordDiagnosis = (
    selectedIncidents: Record<number, number>,
    technicianNote?: string
  ) => {
    const result = runDiagnosis(
      selectedIncidents,
      state.incidents,
      state.repairs,
      state.rules
    );
    if (!result.ok) {
      return { ok: false, error: result.error };
    }

    const nextId =
      state.history.reduce((max, item) => (item.id > max ? item.id : max), 351) + 1;

    const repairScores: Record<number, number> = {};
    for (const cand of result.candidates) {
      repairScores[cand.repairId] = cand.cf;
    }

    const cleanSelected: Record<number, number> = {};
    for (const [key, val] of Object.entries(selectedIncidents)) {
      if (val >= 1 && val <= 9) {
        cleanSelected[Number(key)] = val;
      }
    }

    const top = result.candidates[0];
    const record: DiagnosisHistoryRecord = {
      id: nextId,
      timestamp: formatJakartaTimestamp(),
      selectedIncidents: cleanSelected,
      repairScores,
      topRepairId: top ? top.repairId : 0,
      topCf: top ? top.cf : 0,
      technicianNote: technicianNote?.trim() || undefined,
    };

    setState((prev) => ({
      ...prev,
      history: [record, ...prev.history],
    }));

    return { ok: true, record };
  };

  const deleteHistoryRecord = (id: number) => {
    setState((prev) => ({
      ...prev,
      history: prev.history.filter((item) => item.id !== id),
    }));
    if (selectedHistoryId === id) {
      setSelectedHistoryId(null);
    }
  };

  const loginAdmin = (username: string, password: string) => {
    const trimmedUser = username.trim();
    if (!trimmedUser || !password) {
      return { ok: false, error: 'Username dan password wajib diisi.' };
    }
    const found = state.admins.find(
      (a) => a.username.toLowerCase() === trimmedUser.toLowerCase() && a.password === password
    );
    if (!found) {
      return {
        ok: false,
        error: 'Username atau password yang Anda masukkan tidak sesuai.',
      };
    }
    setState((prev) => ({ ...prev, activeAdminUsername: found.username }));
    setViewState('admin-dashboard');
    return { ok: true };
  };

  const logoutAdmin = () => {
    setState((prev) => ({ ...prev, activeAdminUsername: null }));
    setViewState('beranda');
  };

  const changePassword = (currentPassword: string, newPassword: string) => {
    if (!currentAdmin) {
      return { ok: false, error: 'Sesi admin tidak aktif.' };
    }
    if (currentAdmin.password !== currentPassword) {
      return { ok: false, error: 'Password saat ini tidak sesuai.' };
    }
    if (newPassword.trim().length < 4) {
      return { ok: false, error: 'Password baru minimal 4 karakter.' };
    }
    setState((prev) => ({
      ...prev,
      admins: prev.admins.map((a) =>
        a.username === currentAdmin.username ? { ...a, password: newPassword } : a
      ),
    }));
    return { ok: true };
  };

  const addIncident = (name: string, category: SymptomCategory) => {
    const trimmed = name.trim();
    if (!trimmed) return { ok: false, error: 'Nama gejala wajib diisi.' };
    const nextId = state.incidents.reduce((m, i) => Math.max(m, i.id), 0) + 1;
    setState((prev) => ({
      ...prev,
      incidents: [...prev.incidents, { id: nextId, name: trimmed, category }],
    }));
    return { ok: true };
  };

  const updateIncident = (id: number, name: string, category: SymptomCategory) => {
    const trimmed = name.trim();
    if (!trimmed) return { ok: false, error: 'Nama gejala wajib diisi.' };
    setState((prev) => ({
      ...prev,
      incidents: prev.incidents.map((i) =>
        i.id === id ? { ...i, name: trimmed, category } : i
      ),
    }));
    return { ok: true };
  };

  const deleteIncident = (id: number) => {
    setState((prev) => ({
      ...prev,
      incidents: prev.incidents.filter((i) => i.id !== id),
      rules: prev.rules.filter((r) => r.incidentId !== id),
    }));
  };

  const addRepair = (payload: {
    name: string;
    category: RepairCategory;
    detail: string;
    solutionSteps: string[];
    mediaKey: MediaKey;
  }) => {
    if (!payload.name.trim()) return { ok: false, error: 'Nama gangguan wajib diisi.' };
    const nextId = state.repairs.reduce((m, r) => Math.max(m, r.id), 0) + 1;
    setState((prev) => ({
      ...prev,
      repairs: [
        ...prev.repairs,
        {
          id: nextId,
          name: payload.name.trim(),
          category: payload.category,
          detail: payload.detail.trim() || payload.name.trim(),
          solutionSteps:
            payload.solutionSteps.length > 0
              ? payload.solutionSteps
              : ['Lakukan pemeriksaan perangkat dan dokumentasikan hasil penanganan.'],
          mediaKey: payload.mediaKey,
        },
      ],
    }));
    return { ok: true };
  };

  const updateRepair = (
    id: number,
    payload: {
      name: string;
      category: RepairCategory;
      detail: string;
      solutionSteps: string[];
      mediaKey: MediaKey;
    }
  ) => {
    if (!payload.name.trim()) return { ok: false, error: 'Nama gangguan wajib diisi.' };
    setState((prev) => ({
      ...prev,
      repairs: prev.repairs.map((r) =>
        r.id === id
          ? {
              ...r,
              name: payload.name.trim(),
              category: payload.category,
              detail: payload.detail.trim() || payload.name.trim(),
              solutionSteps:
                payload.solutionSteps.length > 0 ? payload.solutionSteps : r.solutionSteps,
              mediaKey: payload.mediaKey,
            }
          : r
      ),
    }));
    return { ok: true };
  };

  const deleteRepair = (id: number) => {
    setState((prev) => ({
      ...prev,
      repairs: prev.repairs.filter((r) => r.id !== id),
      rules: prev.rules.filter((rule) => rule.repairId !== id),
    }));
  };

  const addRule = (payload: {
    repairId: number;
    incidentId: number;
    mb: number;
    md: number;
  }) => {
    if (payload.mb < 0 || payload.mb > 1 || payload.md < 0 || payload.md > 1) {
      return { ok: false, error: 'Nilai MB dan MD harus berada di antara 0.0 hingga 1.0.' };
    }
    const duplicate = state.rules.some(
      (r) => r.repairId === payload.repairId && r.incidentId === payload.incidentId
    );
    if (duplicate) {
      return { ok: false, error: 'Kombinasi aturan gangguan dan gejala tersebut sudah terdaftar.' };
    }
    const nextId = state.rules.reduce((m, r) => Math.max(m, r.id), 134) + 1;
    setState((prev) => ({
      ...prev,
      rules: [
        {
          id: nextId,
          repairId: payload.repairId,
          incidentId: payload.incidentId,
          mb: Number(payload.mb.toFixed(2)),
          md: Number(payload.md.toFixed(2)),
        },
        ...prev.rules,
      ],
    }));
    return { ok: true };
  };

  const updateRule = (
    id: number,
    payload: { repairId: number; incidentId: number; mb: number; md: number }
  ) => {
    if (payload.mb < 0 || payload.mb > 1 || payload.md < 0 || payload.md > 1) {
      return { ok: false, error: 'Nilai MB dan MD harus berada di antara 0.0 hingga 1.0.' };
    }
    const duplicate = state.rules.some(
      (r) =>
        r.id !== id && r.repairId === payload.repairId && r.incidentId === payload.incidentId
    );
    if (duplicate) {
      return { ok: false, error: 'Kombinasi aturan gangguan dan gejala tersebut sudah terdaftar.' };
    }
    setState((prev) => ({
      ...prev,
      rules: prev.rules.map((r) =>
        r.id === id
          ? {
              ...r,
              repairId: payload.repairId,
              incidentId: payload.incidentId,
              mb: Number(payload.mb.toFixed(2)),
              md: Number(payload.md.toFixed(2)),
            }
          : r
      ),
    }));
    return { ok: true };
  };

  const deleteRule = (id: number) => {
    setState((prev) => ({
      ...prev,
      rules: prev.rules.filter((r) => r.id !== id),
    }));
  };

  const addPost = (payload: {
    title: string;
    category: RepairCategory;
    summary: string;
    detail: string;
    solutionSteps: string[];
    mediaKey: MediaKey;
  }) => {
    if (!payload.title.trim()) return { ok: false, error: 'Judul artikel wajib diisi.' };
    const nextId = state.posts.reduce((m, p) => Math.max(m, p.id), 0) + 1;
    const today = new Date().toISOString().slice(0, 10);
    setState((prev) => ({
      ...prev,
      posts: [
        {
          id: nextId,
          title: payload.title.trim(),
          category: payload.category,
          summary: payload.summary.trim() || payload.detail.slice(0, 140),
          detail: payload.detail.trim(),
          solutionSteps: payload.solutionSteps,
          mediaKey: payload.mediaKey,
          updatedAt: today,
        },
        ...prev.posts,
      ],
    }));
    return { ok: true };
  };

  const updatePost = (
    id: number,
    payload: {
      title: string;
      category: RepairCategory;
      summary: string;
      detail: string;
      solutionSteps: string[];
      mediaKey: MediaKey;
    }
  ) => {
    if (!payload.title.trim()) return { ok: false, error: 'Judul artikel wajib diisi.' };
    const today = new Date().toISOString().slice(0, 10);
    setState((prev) => ({
      ...prev,
      posts: prev.posts.map((p) =>
        p.id === id
          ? {
              ...p,
              title: payload.title.trim(),
              category: payload.category,
              summary: payload.summary.trim() || payload.detail.slice(0, 140),
              detail: payload.detail.trim(),
              solutionSteps: payload.solutionSteps,
              mediaKey: payload.mediaKey,
              updatedAt: today,
            }
          : p
      ),
    }));
    return { ok: true };
  };

  const deletePost = (id: number) => {
    setState((prev) => ({
      ...prev,
      posts: prev.posts.filter((p) => p.id !== id),
    }));
  };

  const addAdmin = (payload: {
    username: string;
    password: string;
    fullName: string;
    role: string;
  }) => {
    const username = payload.username.trim();
    if (!username || !payload.password.trim() || !payload.fullName.trim()) {
      return { ok: false, error: 'Username, nama lengkap, dan password wajib diisi.' };
    }
    if (state.admins.some((a) => a.username.toLowerCase() === username.toLowerCase())) {
      return { ok: false, error: `Username "${username}" sudah terdaftar.` };
    }
    setState((prev) => ({
      ...prev,
      admins: [
        ...prev.admins,
        {
          username,
          password: payload.password,
          fullName: payload.fullName.trim(),
          role: payload.role.trim() || 'Admin Pakar',
        },
      ],
    }));
    return { ok: true };
  };

  const deleteAdmin = (username: string) => {
    if (currentAdmin && currentAdmin.username === username) {
      return { ok: false, error: 'Tidak dapat menghapus akun admin yang sedang login.' };
    }
    if (state.admins.length <= 1) {
      return { ok: false, error: 'Minimal harus tersedia satu akun admin aktif.' };
    }
    setState((prev) => ({
      ...prev,
      admins: prev.admins.filter((a) => a.username !== username),
    }));
    return { ok: true };
  };

  const resetToSeedData = () => {
    setState((prev) => ({
      ...DEFAULT_PERSISTED_STATE,
      activeAdminUsername: prev.activeAdminUsername,
    }));
  };

  const value: DigNetContextValue = {
    hydrated,
    view,
    setView,
    selectedHistoryId,
    openHistoryDetail,
    clearHistoryDetail,
    incidents: state.incidents,
    repairs: state.repairs,
    rules: state.rules,
    history: state.history,
    posts: state.posts,
    admins: state.admins,
    currentAdmin,
    recordDiagnosis,
    deleteHistoryRecord,
    loginAdmin,
    logoutAdmin,
    changePassword,
    addIncident,
    updateIncident,
    deleteIncident,
    addRepair,
    updateRepair,
    deleteRepair,
    addRule,
    updateRule,
    deleteRule,
    addPost,
    updatePost,
    deletePost,
    addAdmin,
    deleteAdmin,
    resetToSeedData,
  };

  return <DigNetContext.Provider value={value}>{children}</DigNetContext.Provider>;
}

export function useDigNet() {
  const ctx = useContext(DigNetContext);
  if (!ctx) {
    throw new Error('useDigNet must be used inside DigNetProvider');
  }
  return ctx;
}
