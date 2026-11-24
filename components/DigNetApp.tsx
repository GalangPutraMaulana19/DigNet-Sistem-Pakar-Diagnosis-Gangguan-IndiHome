'use client';

import React from 'react';
import { DigNetProvider, useDigNet } from '@/lib/store';
import { AppShell } from './AppShell';
import { HomeView } from './views/HomeView';
import { DiagnosaView } from './views/DiagnosaView';
import { RiwayatView } from './views/RiwayatView';
import { KeteranganView } from './views/KeteranganView';
import { BantuanView } from './views/BantuanView';
import { TentangView } from './views/TentangView';
import { AdminLoginView } from './views/AdminLoginView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { AdminCrudView } from './views/AdminCrudView';

function DigNetRouter() {
  const { view } = useDigNet();

  return (
    <AppShell>
      {view === 'beranda' && <HomeView />}
      {view === 'diagnosa' && <DiagnosaView />}
      {view === 'riwayat' && <RiwayatView />}
      {view === 'keterangan' && <KeteranganView />}
      {view === 'bantuan' && <BantuanView />}
      {view === 'tentang' && <TentangView />}
      {view === 'admin-login' && <AdminLoginView />}
      {view === 'admin-dashboard' && <AdminDashboardView />}
      {(view === 'admin-gejala' ||
        view === 'admin-gangguan' ||
        view === 'admin-pengetahuan' ||
        view === 'admin-post' ||
        view === 'admin-users' ||
        view === 'admin-password') && <AdminCrudView mode={view} />}
    </AppShell>
  );
}

export function DigNetApp() {
  return (
    <DigNetProvider>
      <DigNetRouter />
    </DigNetProvider>
  );
}
