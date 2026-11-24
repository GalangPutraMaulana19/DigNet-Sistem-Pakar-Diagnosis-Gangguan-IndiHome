'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  ArrowRight,
  Brain,
  Clock,
  Newspaper,
  RotateCcw,
  UserCog,
  Wrench,
} from 'lucide-react';
import { useDigNet } from '@/lib/store';
import type { AppView } from '@/lib/types';

export function AdminDashboardView() {
  const {
    currentAdmin,
    incidents,
    repairs,
    rules,
    history,
    posts,
    admins,
    setView,
    resetToSeedData,
  } = useDigNet();
  const [confirmReset, setConfirmReset] = useState(false);

  const statCards: Array<{
    label: string;
    value: number;
    target: AppView;
    actionLabel: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    {
      label: 'Total Gejala',
      value: incidents.length,
      target: 'admin-gejala',
      actionLabel: 'Kelola Gejala',
      icon: AlertTriangle,
    },
    {
      label: 'Total Gangguan',
      value: repairs.length,
      target: 'admin-gangguan',
      actionLabel: 'Kelola Gangguan',
      icon: Wrench,
    },
    {
      label: 'Basis Pengetahuan',
      value: rules.length,
      target: 'admin-pengetahuan',
      actionLabel: 'Kelola Aturan CF',
      icon: Brain,
    },
    {
      label: 'Riwayat Diagnosis',
      value: history.length,
      target: 'riwayat',
      actionLabel: 'Lihat Riwayat',
      icon: Clock,
    },
    {
      label: 'Post Keterangan',
      value: posts.length,
      target: 'admin-post',
      actionLabel: 'Kelola Artikel',
      icon: Newspaper,
    },
    {
      label: 'Admin Pakar',
      value: admins.length,
      target: 'admin-users',
      actionLabel: 'Kelola Admin',
      icon: UserCog,
    },
  ];

  // Calculate knowledge base coverage per repair
  const coverageStats = repairs
    .map((repair) => ({
      repair,
      ruleCount: rules.filter((r) => r.repairId === repair.id).length,
    }))
    .sort((a, b) => b.ruleCount - a.ruleCount)
    .slice(0, 6);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {/* Welcome Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-red-600">
            Panel Admin Pakar · {currentAdmin?.role}
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-slate-900">
            Selamat datang, {currentAdmin?.fullName}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Ringkasan basis pengetahuan sistem pakar DigNet IndiHome.
          </p>
        </div>

        <div className="shrink-0">
          {confirmReset ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600">Reset ke data SQL awal?</span>
              <button
                type="button"
                onClick={() => {
                  resetToSeedData();
                  setConfirmReset(false);
                }}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
              >
                Ya, Reset
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Pulihkan Data Awal</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.label}
              type="button"
              onClick={() => setView(card.target)}
              className="bg-white border border-slate-200 rounded-xl p-5 text-left hover:border-slate-300 transition-colors flex flex-col justify-between gap-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">{card.label}</span>
                <Icon className="h-4 w-4 text-slate-400" aria-hidden="true" />
              </div>
              <p className="font-mono text-3xl font-bold text-slate-900 tabular-nums">
                {card.value}
              </p>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600">
                <span>{card.actionLabel}</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </button>
          );
        })}
      </section>

      {/* Rule Coverage Breakdown */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-base font-bold text-slate-900">
              Cakupan Aturan Terbanyak pada Basis Pengetahuan
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Distribusi relasi gejala per jenis tindakan perbaikan IndiHome
            </p>
          </div>
          <button
            type="button"
            onClick={() => setView('admin-pengetahuan')}
            className="text-xs font-semibold text-red-600 hover:text-red-700 whitespace-nowrap"
          >
            Kelola Semua Aturan
          </button>
        </div>

        <div className="divide-y divide-slate-200">
          {coverageStats.map(({ repair, ruleCount }) => {
            const maxRules = Math.max(1, coverageStats[0]?.ruleCount ?? 1);
            const widthPct = Math.round((ruleCount / maxRules) * 100);
            return (
              <div
                key={repair.id}
                className="px-6 py-3.5 flex items-center justify-between gap-6"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="font-medium text-slate-900 truncate">{repair.name}</span>
                    <span className="font-mono text-xs text-slate-600 tabular-nums whitespace-nowrap">
                      {ruleCount} aturan
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-slate-800"
                      style={{ width: `${Math.max(4, widthPct)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </motion.div>
  );
}
