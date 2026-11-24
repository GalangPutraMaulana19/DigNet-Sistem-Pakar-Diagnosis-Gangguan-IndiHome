'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, ArrowLeft, Lock, ShieldCheck } from 'lucide-react';
import { useDigNet } from '@/lib/store';

export function AdminLoginView() {
  const { loginAdmin, setView } = useDigNet();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = loginAdmin(username, password);
    if (!res.ok) {
      setError(res.error ?? 'Gagal masuk.');
    } else {
      setError(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="max-w-md mx-auto py-8"
    >
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6">
        <div className="space-y-2">
          <div className="h-10 w-10 rounded-lg bg-slate-900 text-white flex items-center justify-center">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Login Admin Pakar
          </h1>
          <p className="text-sm text-slate-600">
            Masuk untuk mengelola master gejala, gangguan, aturan basis pengetahuan CF, dan
            artikel keterangan.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 flex items-start gap-2.5 text-sm text-red-800"
          >
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="admin-username"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Username
            </label>
            <input
              id="admin-username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError(null);
              }}
              placeholder="Masukkan username"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/15"
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              placeholder="Masukkan password"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/15"
            />
          </div>

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
          >
            <Lock className="h-4 w-4" aria-hidden="true" />
            <span>Masuk ke Panel Pakar</span>
          </button>
        </form>

        <div className="pt-4 border-t border-slate-200 space-y-3">
          <div className="rounded-lg bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-xs text-slate-600">
            Akun default basis data:{' '}
            <span className="font-mono font-semibold text-slate-900">admin</span> /{' '}
            <span className="font-mono font-semibold text-slate-900">admin</span>
          </div>
          <button
            type="button"
            onClick={() => setView('beranda')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Kembali ke Beranda</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
