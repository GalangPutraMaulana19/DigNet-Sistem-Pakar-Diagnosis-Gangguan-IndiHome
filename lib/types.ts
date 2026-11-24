export type SymptomCategory = 'Internet & ONT' | 'UseeTV & STB' | 'Telepon & Perangkat';

export type RepairCategory = 'ONT / Konfigurasi' | 'ODP & Fiber Optik' | 'STB & UseeTV' | 'Kabel & Voice';

export type MediaKey = 'hero' | 'ont' | 'odp' | 'stb';

export interface Incident {
  id: number;
  name: string;
  category: SymptomCategory;
}

export interface Repair {
  id: number;
  name: string;
  category: RepairCategory;
  detail: string;
  solutionSteps: string[];
  mediaKey: MediaKey;
}

export interface KnowledgeRule {
  id: number;
  repairId: number;
  incidentId: number;
  mb: number;
  md: number;
}

export interface CertaintyCondition {
  id: number;
  label: string;
  weight: number;
  description: string;
  tone: 'positive-strong' | 'positive' | 'neutral' | 'negative' | 'negative-strong';
}

export interface DiagnosisTraceStep {
  ruleId: number;
  incidentId: number;
  incidentName: string;
  conditionId: number;
  conditionLabel: string;
  mb: number;
  md: number;
  cfExpert: number;
  userWeight: number;
  cfRule: number;
  cfBefore: number;
  cfAfter: number;
}

export interface DiagnosisCandidate {
  repairId: number;
  repairName: string;
  category: RepairCategory;
  detail: string;
  solutionSteps: string[];
  mediaKey: MediaKey;
  cf: number;
  percentage: number;
  matchedRulesCount: number;
  trace: DiagnosisTraceStep[];
}

export interface DiagnosisHistoryRecord {
  id: number;
  timestamp: string;
  selectedIncidents: Record<number, number>;
  repairScores: Record<number, number>;
  topRepairId: number;
  topCf: number;
  technicianNote?: string;
}

export interface GuideArticle {
  id: number;
  title: string;
  category: RepairCategory;
  summary: string;
  detail: string;
  solutionSteps: string[];
  mediaKey: MediaKey;
  updatedAt: string;
}

export interface AdminAccount {
  username: string;
  password: string;
  fullName: string;
  role: string;
}

export type AppView =
  | 'beranda'
  | 'diagnosa'
  | 'riwayat'
  | 'keterangan'
  | 'bantuan'
  | 'tentang'
  | 'admin-login'
  | 'admin-dashboard'
  | 'admin-gejala'
  | 'admin-gangguan'
  | 'admin-pengetahuan'
  | 'admin-post'
  | 'admin-users'
  | 'admin-password';
