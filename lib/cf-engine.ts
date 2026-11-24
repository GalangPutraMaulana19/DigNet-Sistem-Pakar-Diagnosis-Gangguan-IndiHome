import { CERTAINTY_CONDITIONS } from './seed-data';
import type {
  DiagnosisCandidate,
  DiagnosisTraceStep,
  Incident,
  KnowledgeRule,
  Repair,
} from './types';

export interface DiagnosisEngineResult {
  ok: boolean;
  error?: string;
  candidates: DiagnosisCandidate[];
  selectedCount: number;
}

const WEIGHT_MAP: Record<number, number> = CERTAINTY_CONDITIONS.reduce(
  (acc, item) => {
    acc[item.id] = item.weight;
    return acc;
  },
  { 0: 0 } as Record<number, number>
);

const LABEL_MAP: Record<number, string> = CERTAINTY_CONDITIONS.reduce(
  (acc, item) => {
    acc[item.id] = item.label;
    return acc;
  },
  { 0: 'Tidak dialami' } as Record<number, string>
);

export function getCertaintyWeight(conditionId: number): number {
  const clamped = Math.max(0, Math.min(9, Math.trunc(conditionId)));
  return WEIGHT_MAP[clamped] ?? 0;
}

export function getCertaintyLabel(conditionId: number): string {
  return LABEL_MAP[conditionId] ?? 'Tidak dialami';
}

export function formatIncidentCode(id: number): string {
  return `G${String(id).padStart(3, '0')}`;
}

export function formatRepairCode(id: number): string {
  return `R${String(id).padStart(2, '0')}`;
}

/**
 * Exact Certainty Factor combination formula from DigNet (`modul/diagnosa/diagnosa.php`):
 * - Both positive (or first rule >= 0): CF_old + CF_new * (1 - CF_old)
 * - Opposite signs (CF_old * CF_new < 0): (CF_old + CF_new) / (1 - min(|CF_old|, |CF_new|))
 * - Both negative (or first rule < 0): CF_old + CF_new * (1 + CF_old)
 */
export function combineCertainty(cfOld: number, cfNew: number): number {
  if (cfNew >= 0 && cfNew * cfOld >= 0) {
    return cfOld + cfNew * (1 - cfOld);
  }
  if (cfNew * cfOld < 0) {
    const denom = 1 - Math.min(Math.abs(cfOld), Math.abs(cfNew));
    if (denom === 0) return 0;
    return (cfOld + cfNew) / denom;
  }
  return cfOld + cfNew * (1 + cfOld);
}

/**
 * Runs Forward Chaining + Certainty Factor inference across all repairs and knowledge rules.
 * Matches `modul/diagnosa/diagnosa.php` behavior: only returns repairs with combined CF > 0,
 * rounded to 4 decimal places and sorted descending by CF.
 */
export function runDiagnosis(
  selectedIncidents: Record<number, number>,
  incidents: Incident[],
  repairs: Repair[],
  rules: KnowledgeRule[]
): DiagnosisEngineResult {
  const activeEntries = Object.entries(selectedIncidents)
    .map(([idStr, condId]) => [Number(idStr), Number(condId)] as const)
    .filter(([id, condId]) => id > 0 && condId >= 1 && condId <= 9);

  if (activeEntries.length === 0) {
    return {
      ok: false,
      error: 'Silakan pilih minimal satu kondisi gejala sebelum melakukan diagnosa.',
      candidates: [],
      selectedCount: 0,
    };
  }

  const incidentMap = new Map<number, Incident>(incidents.map((inc) => [inc.id, inc]));
  const selectedMap = new Map<number, number>(activeEntries);

  const candidates: DiagnosisCandidate[] = [];

  for (const repair of repairs) {
    const matchingRules = rules
      .filter((r) => r.repairId === repair.id && selectedMap.has(r.incidentId))
      .sort((a, b) => a.id - b.id);

    if (matchingRules.length === 0) continue;

    let cfCombined = 0;
    const trace: DiagnosisTraceStep[] = [];

    for (const rule of matchingRules) {
      const conditionId = selectedMap.get(rule.incidentId)!;
      const userWeight = getCertaintyWeight(conditionId);
      const cfExpert = Number((rule.mb - rule.md).toFixed(4));
      const cfRule = cfExpert * userWeight;
      const cfBefore = cfCombined;
      cfCombined = combineCertainty(cfBefore, cfRule);

      trace.push({
        ruleId: rule.id,
        incidentId: rule.incidentId,
        incidentName: incidentMap.get(rule.incidentId)?.name ?? `Gejala #${rule.incidentId}`,
        conditionId,
        conditionLabel: getCertaintyLabel(conditionId),
        mb: rule.mb,
        md: rule.md,
        cfExpert,
        userWeight,
        cfRule: Number(cfRule.toFixed(4)),
        cfBefore: Number(cfBefore.toFixed(4)),
        cfAfter: Number(cfCombined.toFixed(4)),
      });
    }

    if (cfCombined > 0) {
      const roundedCf = Number(cfCombined.toFixed(4));
      candidates.push({
        repairId: repair.id,
        repairName: repair.name,
        category: repair.category,
        detail: repair.detail,
        solutionSteps: repair.solutionSteps,
        mediaKey: repair.mediaKey,
        cf: roundedCf,
        percentage: Number((roundedCf * 100).toFixed(2)),
        matchedRulesCount: matchingRules.length,
        trace,
      });
    }
  }

  candidates.sort((a, b) => {
    if (b.cf !== a.cf) return b.cf - a.cf;
    return a.repairId - b.repairId;
  });

  return {
    ok: true,
    candidates,
    selectedCount: activeEntries.length,
  };
}

export function getConfidenceBand(cf: number): {
  label: string;
  tone: 'high' | 'medium' | 'low';
} {
  if (cf >= 0.75) {
    return { label: 'Keyakinan Sangat Tinggi', tone: 'high' };
  }
  if (cf >= 0.5) {
    return { label: 'Keyakinan Cukup Tinggi', tone: 'medium' };
  }
  return { label: 'Keyakinan Awal / Indikatif', tone: 'low' };
}

export function formatJakartaTimestamp(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
