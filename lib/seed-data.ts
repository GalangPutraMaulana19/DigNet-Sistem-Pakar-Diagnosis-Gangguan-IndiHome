import type {
  AdminAccount,
  CertaintyCondition,
  DiagnosisHistoryRecord,
  GuideArticle,
  Incident,
  KnowledgeRule,
  Repair,
} from './types';

export const CERTAINTY_CONDITIONS: CertaintyCondition[] = [
  {
    id: 1,
    label: 'Pasti ya',
    weight: 1.0,
    description: 'Gejala terkonfirmasi secara langsung pada perangkat pelanggan.',
    tone: 'positive-strong',
  },
  {
    id: 2,
    label: 'Hampir pasti ya',
    weight: 0.8,
    description: 'Gejala sangat jelas terlihat atau dilaporkan berulang.',
    tone: 'positive-strong',
  },
  {
    id: 3,
    label: 'Kemungkinan besar ya',
    weight: 0.6,
    description: 'Indikasi kuat gejala terjadi saat pengujian awal.',
    tone: 'positive',
  },
  {
    id: 4,
    label: 'Mungkin ya',
    weight: 0.4,
    description: 'Gejala bersifat intermiten atau baru teramati sebagian.',
    tone: 'positive',
  },
  {
    id: 5,
    label: 'Tidak tahu',
    weight: -0.2,
    description: 'Belum dapat dipastikan karena keterbatasan pengukuran.',
    tone: 'neutral',
  },
  {
    id: 6,
    label: 'Mungkin tidak',
    weight: -0.4,
    description: 'Cenderung normal namun belum diuji menyeluruh.',
    tone: 'negative',
  },
  {
    id: 7,
    label: 'Kemungkinan besar tidak',
    weight: -0.6,
    description: 'Pemeriksaan awal menunjukkan perangkat bekerja normal.',
    tone: 'negative',
  },
  {
    id: 8,
    label: 'Hampir pasti tidak',
    weight: -0.8,
    description: 'Indikator dan pengujian menyatakan gejala tidak muncul.',
    tone: 'negative-strong',
  },
  {
    id: 9,
    label: 'Pasti tidak',
    weight: -1.0,
    description: 'Terkonfirmasi 100% gejala tidak terjadi pada perangkat.',
    tone: 'negative-strong',
  },
];

// Exact 14 symptoms from dignet_indihome.sql (`incident` table)
export const INITIAL_INCIDENTS: Incident[] = [
  { id: 1, name: 'Telepon tidak dapat digunakan', category: 'Telepon & Perangkat' },
  { id: 2, name: 'Internet tidak terhubung', category: 'Internet & ONT' },
  { id: 3, name: 'Lampu indikator PON pada ONU berwarna merah', category: 'Internet & ONT' },
  { id: 4, name: 'Lampu indikator telepon pada ONU padam', category: 'Telepon & Perangkat' },
  { id: 5, name: 'Lampu indikator internet pada ONU berkedip', category: 'Internet & ONT' },
  { id: 6, name: 'ONU offline', category: 'Internet & ONT' },
  { id: 7, name: 'Internet lambat', category: 'Internet & ONT' },
  { id: 8, name: 'UseeTV muncul kode error 1302', category: 'UseeTV & STB' },
  { id: 9, name: 'UseeTV muncul kode error 1305', category: 'UseeTV & STB' },
  { id: 10, name: 'UseeTV muncul kode error 1901 (Kesalahan pada stb)', category: 'UseeTV & STB' },
  { id: 11, name: 'UseeTV blank hitam', category: 'UseeTV & STB' },
  { id: 12, name: 'UseeTV error saat digunakan', category: 'UseeTV & STB' },
  { id: 13, name: 'STB TV rusak', category: 'UseeTV & STB' },
  { id: 14, name: 'Remote STB error', category: 'UseeTV & STB' },
];

// Exact 17 repairs from dignet_indihome.sql (`repair` table), enriched with field SOP details
export const INITIAL_REPAIRS: Repair[] = [
  {
    id: 1,
    name: 'Create Ulang ONT',
    category: 'ONT / Konfigurasi',
    detail:
      'Konfigurasi layanan (provisioning data, VLAN internet, IPTV, atau voice) pada ONT tidak sinkron dengan OLT sehingga layanan terputus atau gagal otentikasi.',
    solutionSteps: [
      'Catat Serial Number (SN) ONT dan pastikan status redaman optik RX berada di rentang normal (-14 dBm s.d. -25 dBm).',
      'Koordinasi dengan HD Provisioning / NOC untuk melakukan unbind dan create ulang konfigurasi ONT pada port OLT.',
      'Verifikasi profil VLAN Internet (HSI), IPTV (UseeTV), dan VoIP (Voice) kembali aktif pada sistem NMS.',
      'Lakukan pengujian koneksi browsing, ping stabil, serta layanan telepon dan UseeTV selama minimal 5 menit.',
    ],
    mediaKey: 'ont',
  },
  {
    id: 2,
    name: 'Create Voice',
    category: 'Kabel & Voice',
    detail:
      'Layanan telepon rumah (VoIP / POTS) pada port Tel-1 ONT gagal registrasi ke server IMS sehingga tidak ada nada sambung atau gagal panggilan.',
    solutionSteps: [
      'Periksa kabel RJ11 dari port Tel-1 ONT menuju pesawat telepon pelanggan serta pastikan pesawat telepon normal.',
      'Cek status registrasi SIP/VoIP pada halaman status ONT (lampu indikator Phone/Tel).',
      'Ajukan permintaan Create Ulang Voice ke HD Provisioning agar akun SIP di-push ulang ke ONT.',
      'Uji panggilan masuk dan keluar menggunakan nomor PSTN pelanggan untuk memastikan nada dering dan suara jernih.',
    ],
    mediaKey: 'ont',
  },
  {
    id: 3,
    name: 'Ex Gamas FO Putus',
    category: 'ODP & Fiber Optik',
    detail:
      'Terjadi gangguan massal (Gamas) atau putusnya kabel distribusi/feeder fiber optik dari arah STO menuju ODP sehingga lampu LOS/PON menyala merah.',
    solutionSteps: [
      'Ukur redaman optik di roset pelanggan dan di port ODP menggunakan Optical Power Meter (OPM).',
      'Bandingkan kondisi pelanggan lain pada ODP yang sama untuk mengonfirmasi indikasi Gamas.',
      'Laporkan tiket eskalasi ke tim Maintenance / Access Network apabila tidak ada sinyal optik pada splitter ODP.',
      'Setelah jalur fiber tersambung kembali (splicing), pastikan redaman kembali normal dan lampu PON menyala hijau stabil.',
    ],
    mediaKey: 'odp',
  },
  {
    id: 4,
    name: 'Ganti Adaptor di ODP',
    category: 'ODP & Fiber Optik',
    detail:
      'Adaptor konektor SC/APC di dalam kotak ODP mengalami kotor, longgar, atau aus sehingga menyebabkan redaman tinggi (high loss) dan ONU sering offline.',
    solutionSteps: [
      'Buka kotak ODP dan identifikasi port splitter pelanggan sesuai label manajemen core.',
      'Bersihkan ujung ferrule konektor dengan one-click fiber cleaner dan ukur ulang daya optik dengan OPM.',
      'Jika redaman tetap tinggi (> -27 dBm) atau tidak stabil, ganti adaptor SC/APC ODP dengan komponen baru.',
      'Kunci kembali dropcore dan pastikan pintu ODP tertutup rapat agar terlindung dari air hujan dan debu.',
    ],
    mediaKey: 'odp',
  },
  {
    id: 5,
    name: 'Ganti Adaptor Power Modem',
    category: 'ONT / Konfigurasi',
    detail:
      'Adaptor daya 12V DC modem ONT mengalami penurunan tegangan atau rusak sehingga perangkat sering restart sendiri atau mati total.',
    solutionSteps: [
      'Periksa kondisi fisik adaptor, kabel daya, dan stopkontak listrik pelanggan.',
      'Uji tegangan keluaran adaptor (standar 12V DC 1A–1.5A) atau coba menggunakan adaptor cadangan yang dipastikan normal.',
      'Ganti adaptor daya dengan spesifikasi resmi yang sesuai dengan tipe ONT.',
      'Pantau kestabilan nyala lampu Power dan PON selama 10 menit tanpa restart mendadak.',
    ],
    mediaKey: 'ont',
  },
  {
    id: 6,
    name: 'Ganti Kabel UTP RJ45',
    category: 'Kabel & Voice',
    detail:
      'Kabel LAN UTP antara port LAN ONT dan perangkat STB/PC mengalami putus inti, pin RJ45 teroksidasi, atau crimping tidak presisi.',
    solutionSteps: [
      'Periksa indikator LED port LAN pada ONT (umumnya LAN 4 untuk UseeTV, LAN 1–3 untuk internet).',
      'Lakukan pengujian kontinuitas 8 pin menggunakan LAN Cable Tester.',
      'Lakukan re-crimping konektor RJ45 (standar T568B) atau ganti kabel UTP Cat5e/Cat6 baru jika jaket kabel rusak.',
      'Pastikan link negosiasi mencapai 100/1000 Mbps stabil tanpa packet loss.',
    ],
    mediaKey: 'stb',
  },
  {
    id: 7,
    name: 'Ganti ONT',
    category: 'ONT / Konfigurasi',
    detail:
      'Kerusakan perangkat keras (hardware) pada modul optik, port LAN, atau chipset Wi-Fi ONT yang tidak dapat dipulihkan melalui reset maupun provisioning ulang.',
    solutionSteps: [
      'Pastikan redaman optik di ujung patchcord normal (-14 s.d. -25 dBm) dan adaptor power dalam kondisi baik.',
      'Lakukan pencatatan berita acara penggantian perangkat (SN ONT lama dan SN ONT baru).',
      'Pasang ONT pengganti, lakukan registrasi/create ulang di OLT melalui HD Provisioning.',
      'Konfigurasi ulang SSID dan password Wi-Fi sesuai permintaan pelanggan lalu uji seluruh layanan triple play.',
    ],
    mediaKey: 'ont',
  },
  {
    id: 8,
    name: 'Ganti Patchcord',
    category: 'ODP & Fiber Optik',
    detail:
      'Kabel patchcord fiber optik dari roset (OTP) menuju ONT mengalami tekukan tajam (macro-bending), retak core, atau konektor SC/APC rusak.',
    solutionSteps: [
      'Inspeksi jalur patchcord dari roset ke port PON ONT untuk mendeteksi lipatan atau jepitan furnitur.',
      'Ukur redaman di sisi roset vs ujung patchcord dengan OPM; selisih > 1 dB menandakan patchcord bermasalah.',
      'Ganti patchcord SC/APC–SC/APC baru dengan panjang sesuai kebutuhan dan rapikan radius lengkung minimal 3 cm.',
      'Verifikasi lampu PON menyala hijau solid dan nilai RX optik membaik.',
    ],
    mediaKey: 'odp',
  },
  {
    id: 9,
    name: 'Ganti Remote',
    category: 'STB & UseeTV',
    detail:
      'Remote kontrol STB UseeTV tidak merespons input tombol akibat kerusakan modul IR/Bluetooth, korosi baterai, atau membran tombol aus.',
    solutionSteps: [
      'Ganti baterai remote dengan dua baterai AAA baru dan bersihkan terminal baterai.',
      'Uji pancaran sinar inframerah remote menggunakan kamera smartphone (atau uji pairing Bluetooth untuk tipe STB Android).',
      'Jika sensor IR pada STB normal namun remote tidak memancarkan sinyal, lakukan penggantian unit remote baru.',
      'Uji tombol navigasi, volume, power, dan menu utama pada layar UseeTV.',
    ],
    mediaKey: 'stb',
  },
  {
    id: 10,
    name: 'Ganti STB',
    category: 'STB & UseeTV',
    detail:
      'Perangkat Set-Top Box (STB) mengalami kerusakan hardware, bootloop permanen, output HDMI mati, atau gagal memuat firmware meski jaringan normal.',
    solutionSteps: [
      'Pastikan adaptor daya STB, kabel HDMI/RCA, dan port LAN 4 IPTV dari ONT bekerja normal.',
      'Coba lakukan hard reset / recovery mode pada STB untuk memastikan kerusakan bukan sekadar hang perangkat lunak.',
      'Siapkan unit STB pengganti, catat MAC Address dan Serial Number untuk migrasi akun UseeTV oleh HD.',
      'Login akun UseeTV pada STB baru dan verifikasi seluruh saluran siaran berjalan lancar tanpa buffering.',
    ],
    mediaKey: 'stb',
  },
  {
    id: 11,
    name: 'Restart ONT',
    category: 'ONT / Konfigurasi',
    detail:
      'Modem ONT mengalami kejenuhan memori (cache overflow), sesi PPPoE menggantung, atau interferensi kanal Wi-Fi yang menyebabkan internet lambat atau terputus sementara.',
    solutionSteps: [
      'Matikan ONT melalui tombol Power atau cabut adaptor listrik selama 30–60 detik.',
      'Nyalakan kembali ONT dan tunggu 2–3 menit hingga lampu Power, PON, Internet, dan WLAN menyala normal.',
      'Periksa apakah alamat IP WAN (PPPoE) berhasil diperoleh kembali dan latency ping kembali rendah.',
      'Uji kecepatan unduh/unggah (speedtest) untuk memastikan throughput sesuai paket berlangganan.',
    ],
    mediaKey: 'ont',
  },
  {
    id: 12,
    name: 'Revisi IKR',
    category: 'ODP & Fiber Optik',
    detail:
      'Instalasi Kabel Rumah (IKR) dari roset menuju perangkat atau jalur kabel dalam rumah mengalami tekukan berlebih, sambungan kurang rapi, atau degradasi sinyal.',
    solutionSteps: [
      'Telusuri jalur kabel IKR mulai dari titik masuk rumah (roset/OTP) hingga posisi penempatan ONT dan STB.',
      'Ukur redaman di titik luar vs dalam rumah untuk mengisolasi titik penurunan sinyal.',
      'Perbaiki jalur penarikan IKR menggunakan klem/ducting rapi tanpa sudut patah (< 90° ketat) dan ganti konektor bila perlu.',
      'Dokumentasikan hasil pengukuran redaman akhir sesuai standar QC instalasi.',
    ],
    mediaKey: 'odp',
  },
  {
    id: 13,
    name: 'Revisi ODP',
    category: 'ODP & Fiber Optik',
    detail:
      'Penataan core, pigtail, atau port distribusi di dalam Optical Distribution Point (ODP) mengalami redaman tidak merata atau terminasi tidak sesuai standar.',
    solutionSteps: [
      'Buka ODP dan verifikasi data port pelanggan terhadap sistem manajemen jaringan.',
      'Ukur seluruh port aktif/cadangan di splitter ODP untuk memastikan kualitas daya optik.',
      'Rapikan routing fiber pada tray ODP, bersihkan seluruh ferrule SC/APC, dan pindahkan ke port sehat jika port lama rusak.',
      'Catat pembaruan port ODP pada sistem agar data inventori akurat.',
    ],
    mediaKey: 'odp',
  },
  {
    id: 14,
    name: 'Revisi Sambung DC',
    category: 'ODP & Fiber Optik',
    detail:
      'Sambungan kabel Drop Core (DC) antara ODP dan rumah pelanggan mengalami retak splicing, kemasukan air, atau fast connector longgar sehingga ONU offline.',
    solutionSteps: [
      'Lakukan penelusuran visual kabel Drop Core dari tiang ODP menuju bangunan pelanggan.',
      'Gunakan Visual Fault Locator (VFL) untuk mendeteksi kebocoran cahaya pada titik sambungan atau fast connector.',
      'Lakukan penyambungan ulang (fusion splicing) dengan protection sleeve rapat atau ganti fast connector baru.',
      'Ukur ulang redaman akhir di roset pelanggan hingga mencapai nilai standar (≤ -24 dBm).',
    ],
    mediaKey: 'odp',
  },
  {
    id: 15,
    name: 'Setting Ulang ONT',
    category: 'ONT / Konfigurasi',
    detail:
      'Parameter konfigurasi lokal ONT (binding port LAN IPTV, pengaturan VoIP, PPPoE, atau kanal Wi-Fi) berubah atau ter-reset sehingga layanan sebagian tidak berjalan.',
    solutionSteps: [
      'Akses antarmuka admin ONT melalui browser (192.168.1.1) menggunakan kredensial teknisi.',
      'Periksa konfigurasi WAN binding: pastikan SSID/LAN 1–3 terikat ke profil HSI dan LAN 4 terikat ke profil IPTV.',
      'Verifikasi parameter VoIP dan atur kanal Wi-Fi ke kanal yang tidak padat (1, 6, atau 11 pada 2.4 GHz).',
      'Simpan konfigurasi (Save/Apply) dan uji ulang layanan telepon, internet, serta UseeTV.',
    ],
    mediaKey: 'ont',
  },
  {
    id: 16,
    name: 'Setting Ulang STB',
    category: 'STB & UseeTV',
    detail:
      'Terjadi galat konfigurasi jaringan, autentikasi akun IPTV, atau cache aplikasi pada STB (seperti kode error 1305 atau 1901).',
    solutionSteps: [
      'Masuk ke menu Pengaturan (Settings) pada STB dan periksa status koneksi Ethernet/DHCP pada port LAN 4.',
      'Hapus cache aplikasi UseeTV/IndiHome TV dan verifikasi format tanggal serta waktu sistem.',
      'Lakukan login ulang akun IPTV atau lakukan Factory Reset STB jika kode error 1305/1901 tetap muncul.',
      'Pastikan STB berhasil memperoleh IP VLAN IPTV dan siaran live TV tampil normal.',
    ],
    mediaKey: 'stb',
  },
  {
    id: 17,
    name: 'Update Profile',
    category: 'ONT / Konfigurasi',
    detail:
      'Profil bandwidth (speed profile) pada OLT/BRAS tidak sesuai dengan paket berlangganan pelanggan atau terdampak FUP/sinkronisasi profil.',
    solutionSteps: [
      'Lakukan pengukuran speedtest melalui kabel LAN langsung ke ONT untuk menyingkirkan faktor interferensi Wi-Fi.',
      'Bandingkan hasil throughput dengan paket resmi pelanggan pada aplikasi monitoring layanan.',
      'Minta HD Assurance/Provisioning melakukan sinkronisasi atau Update Profile bandwidth pada BRAS dan OLT.',
      'Restart sesi PPPoE dan uji ulang kecepatan unduh/unggah hingga sesuai SLA paket.',
    ],
    mediaKey: 'ont',
  },
];

// Exact 30 IF-THEN knowledge rules from dignet_indihome.sql (`basis_pengetahuan` table)
export const INITIAL_RULES: KnowledgeRule[] = [
  { id: 105, repairId: 2, incidentId: 1, mb: 0.8, md: 0.2 },
  { id: 106, repairId: 1, incidentId: 1, mb: 0.7, md: 0.1 },
  { id: 107, repairId: 4, incidentId: 1, mb: 0.4, md: 0.1 },
  { id: 108, repairId: 1, incidentId: 2, mb: 0.8, md: 0.2 },
  { id: 109, repairId: 11, incidentId: 2, mb: 0.7, md: 0.1 },
  { id: 110, repairId: 12, incidentId: 2, mb: 0.6, md: 0.2 },
  { id: 111, repairId: 1, incidentId: 3, mb: 0.9, md: 0.1 },
  { id: 112, repairId: 12, incidentId: 3, mb: 0.7, md: 0.2 },
  { id: 113, repairId: 3, incidentId: 3, mb: 0.8, md: 0.2 },
  { id: 114, repairId: 15, incidentId: 4, mb: 0.8, md: 0.2 },
  { id: 115, repairId: 2, incidentId: 4, mb: 0.8, md: 0.1 },
  { id: 116, repairId: 4, incidentId: 4, mb: 0.8, md: 0.2 },
  { id: 117, repairId: 1, incidentId: 5, mb: 0.8, md: 0.2 },
  { id: 118, repairId: 11, incidentId: 5, mb: 0.7, md: 0.1 },
  { id: 119, repairId: 3, incidentId: 5, mb: 0.6, md: 0.2 },
  { id: 120, repairId: 14, incidentId: 6, mb: 0.7, md: 0.2 },
  { id: 121, repairId: 4, incidentId: 6, mb: 0.5, md: 0.2 },
  { id: 122, repairId: 11, incidentId: 7, mb: 0.6, md: 0.2 },
  { id: 123, repairId: 17, incidentId: 7, mb: 0.7, md: 0.1 },
  { id: 124, repairId: 1, incidentId: 8, mb: 0.8, md: 0.1 },
  { id: 125, repairId: 15, incidentId: 8, mb: 0.7, md: 0.1 },
  { id: 126, repairId: 1, incidentId: 9, mb: 0.8, md: 0.2 },
  { id: 127, repairId: 16, incidentId: 9, mb: 0.7, md: 0.1 },
  { id: 128, repairId: 1, incidentId: 10, mb: 0.8, md: 0.2 },
  { id: 129, repairId: 16, incidentId: 10, mb: 0.8, md: 0.1 },
  { id: 130, repairId: 1, incidentId: 11, mb: 0.9, md: 0.1 },
  { id: 131, repairId: 10, incidentId: 11, mb: 0.8, md: 0.1 },
  { id: 132, repairId: 9, incidentId: 12, mb: 0.6, md: 0.2 },
  { id: 133, repairId: 10, incidentId: 13, mb: 0.9, md: 0.1 },
  { id: 134, repairId: 9, incidentId: 14, mb: 0.9, md: 0.1 },
];

// Exact 5 seeded diagnosis history records from dignet_indihome.sql (`hasil` table)
export const INITIAL_HISTORY: DiagnosisHistoryRecord[] = [
  {
    id: 351,
    timestamp: '2025-08-25 12:29:32',
    selectedIncidents: { 7: 1 },
    repairScores: { 17: 0.6, 11: 0.4 },
    topRepairId: 17,
    topCf: 0.6,
  },
  {
    id: 350,
    timestamp: '2025-08-25 12:29:23',
    selectedIncidents: { 13: 1 },
    repairScores: { 10: 0.8 },
    topRepairId: 10,
    topCf: 0.8,
  },
  {
    id: 349,
    timestamp: '2025-08-25 12:23:06',
    selectedIncidents: { 1: 1, 14: 1 },
    repairScores: { 9: 0.8, 1: 0.6, 2: 0.6, 4: 0.3 },
    topRepairId: 9,
    topCf: 0.8,
  },
  {
    id: 348,
    timestamp: '2025-08-25 12:22:58',
    selectedIncidents: { 1: 1 },
    repairScores: { 1: 0.6, 2: 0.6, 4: 0.3 },
    topRepairId: 1,
    topCf: 0.6,
  },
  {
    id: 347,
    timestamp: '2025-08-25 12:11:24',
    selectedIncidents: { 1: 1, 2: 1 },
    repairScores: { 1: 0.84, 2: 0.6, 11: 0.6, 12: 0.4, 4: 0.3 },
    topRepairId: 1,
    topCf: 0.84,
  },
];

// Technical knowledge guides for Keterangan page
export const INITIAL_POSTS: GuideArticle[] = [
  {
    id: 1,
    title: 'Membaca Lampu Indikator ONT (PON, LOS, Internet & Phone)',
    category: 'ONT / Konfigurasi',
    summary:
      'Panduan cepat mengenali arti warna dan pola kedip lampu LED pada perangkat Optical Network Terminal (ONT) IndiHome saat pengecekan lapangan.',
    detail:
      'Lampu indikator pada ONT merupakan titik diagnostik tercepat bagi teknisi provisioning. Lampu PON yang hijau stabil menandakan registrasi optik ke OLT berhasil. Apabila lampu LOS menyala merah atau PON berkedip terus-menerus, indikasi utama mengarah pada redaman optik berlebih, kabel drop core putus, atau ONT belum ter-create pada OLT.',
    solutionSteps: [
      'PON Hijau Stabil + LOS Padam: Sinyal optik normal, lanjutkan pemeriksaan sesi PPPoE dan VLAN.',
      'LOS Merah Berkedip: Periksa patchcord, roset, sambungan drop core, dan ukur OPM di ODP.',
      'Internet Berkedip / Padam: Cek otentikasi PPPoE, restart ONT, atau ajukan Create Ulang ONT.',
      'Phone Padam: Periksa kabel RJ11 dan status registrasi akun VoIP (Create Voice).',
    ],
    mediaKey: 'ont',
    updatedAt: '2025-08-25',
  },
  {
    id: 2,
    title: 'Penanganan Kode Error UseeTV 1302, 1305 & 1901',
    category: 'STB & UseeTV',
    summary:
      'Identifikasi perbedaan gangguan autentikasi, jaringan VLAN IPTV, dan galat sistem internal pada perangkat Set-Top Box (STB).',
    detail:
      'Kode error 1302 umumnya berkaitan dengan kegagalan mendapatkan alamat IP dari server DHCP IPTV (sering dipicu port LAN binding salah atau konfigurasi ONT). Kode error 1305 menunjukkan kegagalan autentikasi akun atau koneksi jaringan terputus sementara, sedangkan kode 1901 menandakan gangguan pada sistem/profil STB yang memerlukan setting ulang atau penggantian unit.',
    solutionSteps: [
      'Pastikan kabel LAN dari STB terhubung tepat ke port LAN 4 (port khusus IPTV) pada ONT.',
      'Untuk Error 1302: Verifikasi binding VLAN IPTV pada ONT dan lakukan Setting Ulang / Create Ulang ONT.',
      'Untuk Error 1305 & 1901: Lakukan reboot STB, bersihkan cache, atau lakukan Setting Ulang STB.',
      'Jika layar blank hitam atau STB tidak merespons setelah reset, lakukan pengujian unit cadangan dan Ganti STB.',
    ],
    mediaKey: 'stb',
    updatedAt: '2025-08-25',
  },
  {
    id: 3,
    title: 'Standar Pengukuran Redaman Optik ODP, Drop Core & IKR',
    category: 'ODP & Fiber Optik',
    summary:
      'Ambang batas redaman daya optik (dBm) yang direkomendasikan Telkom Akses untuk mencegah gangguan berulang selama masa retensi 60 hari.',
    detail:
      'Kualitas redaman optik sangat menentukan kestabilan layanan FTTH. Nilai daya terima (RX Power) ideal pada sisi pelanggan berada di rentang -14 dBm hingga -24 dBm. Redaman di atas -27 dBm berisiko menyebabkan ONT sering offline, packet loss tinggi, dan peningkatan kunjungan ulang (revisit) selama periode retensi 60 hari.',
    solutionSteps: [
      'Ukur redaman langsung pada port ODP terlebih dahulu sebagai baseline (-15 s.d. -21 dBm).',
      'Pastikan selisih redaman dari ODP hingga roset pelanggan (Drop Core + konektor) tidak melebihi 2–3 dBm.',
      'Bersihkan setiap ujung ferrule konektor SC/APC sebelum dihubungkan ke adaptor ODP maupun ONT.',
      'Hindari radius tekukan kabel fiber di bawah 3 cm pada jalur IKR maupun di dalam kotak roset.',
    ],
    mediaKey: 'odp',
    updatedAt: '2025-08-25',
  },
  {
    id: 4,
    title: 'Prosedur Create Ulang ONT & Create Voice ke Helpdesk',
    category: 'ONT / Konfigurasi',
    summary:
      'Daftar data wajib yang harus disiapkan teknisi sebelum mengajukan eskalasi provisioning ulang ONT dan aktivasi layanan telepon.',
    detail:
      'Proses Create Ulang ONT dan Create Voice memastikan parameter profil di OLT selaras dengan Serial Number perangkat fisik di lokasi pelanggan. Pengajuan yang lengkap mempercepat Mean Time to Repair (MTTR) tanpa perlu bolak-balik verifikasi tiket.',
    solutionSteps: [
      'Siapkan nomor layanan IndiHome (Internet & PSTN), nama ODP, port splitter, serta SN ONT (12–16 karakter).',
      'Lampirkan foto hasil pengukuran redaman OPM dan foto lampu indikator fisik ONT.',
      'Konfirmasi kembali status ONT terdaftar (Online) di NMS setelah Helpdesk mengeksekusi perintah create.',
      'Lakukan pengujian triple play lengkap (speedtest, streaming UseeTV, dan panggilan telepon) bersama pelanggan.',
    ],
    mediaKey: 'hero',
    updatedAt: '2025-08-25',
  },
  {
    id: 5,
    title: 'Analisis Penyebab Internet Lambat & Update Profile Bandwidth',
    category: 'ONT / Konfigurasi',
    summary:
      'Langkah sistematis membedakan gangguan kecepatan akibat profil BRAS/OLT, interferensi Wi-Fi, atau kejenuhan perangkat ONT.',
    detail:
      'Keluhan internet lambat tidak selalu disebabkan gangguan jaringan fiber. Teknisi wajib mengisolasi masalah melalui pengujian langsung via kabel LAN (RJ45) terlebih dahulu. Bila hasil LAN juga jauh di bawah paket berlangganan sementara redaman optik normal, maka penyebab utama adalah ketidaksesuaian profil kecepatan (Update Profile) atau memori ONT jenuh (Restart ONT).',
    solutionSteps: [
      'Lakukan uji kecepatan via kabel LAN Cat5e/Cat6 langsung ke port LAN 1 ONT tanpa perangkat lain terhubung.',
      'Lakukan Restart ONT selama 60 detik untuk menyegarkan sesi PPPoE dan tabel NAT.',
      'Periksa kanal Wi-Fi di sekitar rumah pelanggan dan pindahkan ke kanal paling lengang.',
      'Bila kecepatan via LAN tetap tertahan di bawah SLA paket, ajukan Update Profile ke tim Assurance.',
    ],
    mediaKey: 'ont',
    updatedAt: '2025-08-25',
  },
  {
    id: 6,
    title: 'Menekan Revisit Gangguan Selama Masa Retensi 60 Hari',
    category: 'ODP & Fiber Optik',
    summary:
      'Praktik terbaik quality control teknisi provisioning mitra Telkom Akses (Witel Bekasi) agar instalasi handal pasca aktivasi.',
    detail:
      'Pada proyek instalasi IndiHome oleh mitra pelaksana seperti PT Mutiara Sentosa di wilayah Witel Bekasi, gangguan dalam 60 hari pertama pasca pemasangan (masa retensi) berdampak langsung pada evaluasi kualitas mitra dan MTTR. Penerapan diagnosis sistematis dengan DigNet memastikan akar masalah diselesaikan tuntas sejak kunjungan pertama.',
    solutionSteps: [
      'Selalu dokumentasikan foto redaman OPM di ODP dan di roset pelanggan sebelum menutup tiket.',
      'Gunakan sistem pakar DigNet untuk memverifikasi hipotesis gangguan utama dan kemungkinan alternatif.',
      'Edukasi pelanggan mengenai fungsi tombol power ONT, port LAN 4 khusus STB, serta perawatan kabel patchcord.',
      'Simpan dan cetak hasil diagnosis sebagai referensi catatan teknis apabila diperlukan tindak lanjut.',
    ],
    mediaKey: 'hero',
    updatedAt: '2025-08-25',
  },
];

// Default admin accounts matching dignet_indihome.sql (`admin` table)
export const INITIAL_ADMINS: AdminAccount[] = [
  {
    username: 'admin',
    password: 'admin',
    fullName: 'Administrator',
    role: 'Admin Pakar Utama',
  },
  {
    username: '123',
    password: '123',
    fullName: 'Teknisi Pakar 123',
    role: 'Admin Pakar',
  },
];
