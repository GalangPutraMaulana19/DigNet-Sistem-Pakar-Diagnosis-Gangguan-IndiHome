'use client';

import React, { useState } from 'react';
import {
  Activity,
  BookOpen,
  Brain,
  Clock,
  HelpCircle,
  Home,
  Info,
  KeyRound,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Newspaper,
  ShieldCheck,
  Stethoscope,
  UserCog,
  Wrench,
  X,
  AlertTriangle,
} from 'lucide-react';
import { useDigNet } from '@/lib/store';
import type { AppView } from '@/lib/types';

interface NavItem {
  id: AppView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PUBLIC_NAV: NavItem[] = [
  { id: 'beranda', label: 'Beranda', icon: Home },
  { id: 'diagnosa', label: 'Diagnosa', icon: Stethoscope },
  { id: 'riwayat', label: 'Riwayat', icon: Clock },
  { id: 'keterangan', label: 'Keterangan', icon: BookOpen },
  { id: 'bantuan', label: 'Bantuan', icon: HelpCircle },
  { id: 'tentang', label: 'Tentang', icon: Info },
];

const ADMIN_NAV: NavItem[] = [
  { id: 'admin-dashboard', label: 'Dashboard Admin', icon: LayoutDashboard },
  { id: 'admin-gejala', label: 'Data Gejala', icon: AlertTriangle },
  { id: 'admin-gangguan', label: 'Data Gangguan', icon: Wrench },
  { id: 'admin-pengetahuan', label: 'Basis Pengetahuan', icon: Brain },
  { id: 'admin-post', label: 'Post Keterangan', icon: Newspaper },
  { id: 'admin-users', label: 'Kelola Admin', icon: UserCog },
  { id: 'admin-password', label: 'Ubah Password', icon: KeyRound },
];

const VIEW_BREADCRUMB: Record<AppView, { section: string; page: string }> = {
  beranda: { section: 'DigNet', page: 'Beranda' },
  diagnosa: { section: 'Teknisi', page: 'Diagnosa Gangguan' },
  riwayat: { section: 'Teknisi', page: 'Riwayat Diagnosa' },
  keterangan: { section: 'Referensi', page: 'Keterangan & SOP' },
  bantuan: { section: 'Referensi', page: 'Panduan & Bantuan' },
  tentang: { section: 'Informasi', page: 'Tentang DigNet' },
  'admin-login': { section: 'Admin Pakar', page: 'Masuk' },
  'admin-dashboard': { section: 'Admin Pakar', page: 'Dashboard' },
  'admin-gejala': { section: 'Admin Pakar', page: 'Data Gejala' },
  'admin-gangguan': { section: 'Admin Pakar', page: 'Data Gangguan' },
  'admin-pengetahuan': { section: 'Admin Pakar', page: 'Basis Pengetahuan' },
  'admin-post': { section: 'Admin Pakar', page: 'Post Keterangan' },
  'admin-users': { section: 'Admin Pakar', page: 'Kelola Admin' },
  'admin-password': { section: 'Admin Pakar', page: 'Ubah Password' },
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const { view, setView, currentAdmin, logoutAdmin, selectedHistoryId } = useDigNet();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const breadcrumb = VIEW_BREADCRUMB[view];

  const handleNavClick = (target: AppView) => {
    setView(target);
    setMobileMenuOpen(false);
  };

  const renderSidebarContent = () => (
    <div className="flex h-full flex-col bg-white border-r border-slate-200">
      <div className="flex h-16 items-center justify-between px-5 border-b border-slate-200">
        <button
          type="button"
          onClick={() => handleNavClick('beranda')}
          className="flex items-center gap-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 rounded-md"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white shrink-0">
            <Activity className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
            DigNet
          </span>
        </button>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Tutup menu navigasi"
          className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6" aria-label="Navigasi utama">
        <div>
          <p className="px-3 mb-2 text-xs font-medium text-slate-500">Menu Teknisi</p>
          <ul className="space-y-1">
            {PUBLIC_NAV.map((item) => {
              const Icon = item.icon;
              const isActive = view === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleNavClick(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                      isActive
                        ? 'bg-red-50 text-red-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        isActive ? 'text-red-600' : 'text-slate-400'
                      }`}
                      aria-hidden="true"
                    />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="pt-4 border-t border-slate-200">
          <p className="px-3 mb-2 text-xs font-medium text-slate-500">
            {currentAdmin ? 'Panel Admin Pakar' : 'Akses Pakar'}
          </p>
          {currentAdmin ? (
            <ul className="space-y-1">
              {ADMIN_NAV.map((item) => {
                const Icon = item.icon;
                const isActive = view === item.id;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => handleNavClick(item.id)}
                      aria-current={isActive ? 'page' : undefined}
                      className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                        isActive
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 shrink-0 ${
                          isActive ? 'text-white' : 'text-slate-400'
                        }`}
                        aria-hidden="true"
                      />
                      <span>{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <button
              type="button"
              onClick={() => handleNavClick('admin-login')}
              aria-current={view === 'admin-login' ? 'page' : undefined}
              className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                view === 'admin-login'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <ShieldCheck
                className={`h-4 w-4 shrink-0 ${
                  view === 'admin-login' ? 'text-white' : 'text-slate-400'
                }`}
                aria-hidden="true"
              />
              <span>Login Admin Pakar</span>
            </button>
          )}
        </div>
      </nav>

      <div className="p-4 border-t border-slate-200 bg-slate-50/70">
        {currentAdmin ? (
          <div className="space-y-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {currentAdmin.fullName}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {currentAdmin.role} · @{currentAdmin.username}
              </p>
            </div>
            <button
              type="button"
              onClick={logoutAdmin}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors whitespace-nowrap"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Keluar Admin</span>
            </button>
          </div>
        ) : (
          <p className="text-xs leading-relaxed text-slate-500">
            Sistem Pakar Forward Chaining & Certainty Factor · Witel Bekasi
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      {/* Desktop Sidebar */}
      <aside className="no-print hidden lg:block lg:w-64 lg:shrink-0">
        <div className="fixed inset-y-0 left-0 w-64">{renderSidebarContent()}</div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="no-print fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px]"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-72 max-w-[85vw] h-full shadow-xl">
            {renderSidebarContent()}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="no-print sticky top-0 z-30 h-16 bg-white/95 backdrop-blur border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Buka menu navigasi"
              className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 shrink-0"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>

            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm min-w-0">
              <span className="text-slate-500 whitespace-nowrap">{breadcrumb.section}</span>
              <span className="text-slate-300" aria-hidden="true">
                /
              </span>
              <span className="font-semibold text-slate-900 truncate">
                {view === 'riwayat' && selectedHistoryId
                  ? `Detail Riwayat #${selectedHistoryId}`
                  : breadcrumb.page}
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {view !== 'diagnosa' ? (
              <button
                type="button"
                onClick={() => setView('diagnosa')}
                className="inline-flex items-center gap-1.5 sm:gap-2 rounded-lg bg-red-600 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white hover:bg-red-700 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
              >
                <Stethoscope className="h-4 w-4" aria-hidden="true" />
                <span>Mulai Diagnosa</span>
              </button>
            ) : currentAdmin ? (
              <button
                type="button"
                onClick={() => setView('admin-dashboard')}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0"
              >
                <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                <span>Dashboard Admin</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setView('admin-login')}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0"
              >
                <LogIn className="h-4 w-4" aria-hidden="true" />
                <span>Login Admin</span>
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-6xl w-full mx-auto">
          {children}
        </main>

        <footer className="no-print border-t border-slate-200 bg-white px-4 sm:px-6 lg:px-8 py-4 mt-auto">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <p>
              DigNet · Sistem Pakar Diagnosis Gangguan IndiHome · Universitas Bhayangkara Jakarta Raya
            </p>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setView('bantuan')}
                className="hover:text-slate-900 transition-colors"
              >
                Panduan
              </button>
              <button
                type="button"
                onClick={() => setView('tentang')}
                className="hover:text-slate-900 transition-colors"
              >
                Tentang Sistem
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
