import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, DM_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'DigNet — Sistem Pakar Diagnosis Gangguan IndiHome',
  description:
    'Sistem pakar berbasis Forward Chaining dan Certainty Factor untuk mendiagnosis gangguan layanan IndiHome (FTTH, ONT, ODP, STB UseeTV, dan Telepon) bagi teknisi provisioning.',
  openGraph: {
    title: 'DigNet — Sistem Pakar Diagnosis Gangguan IndiHome',
    description:
      'Sistem pakar berbasis Forward Chaining dan Certainty Factor untuk diagnosis cepat dan akurat gangguan jaringan IndiHome.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DigNet — Sistem Pakar Diagnosis Gangguan IndiHome',
    description:
      'Sistem pakar berbasis Forward Chaining dan Certainty Factor untuk diagnosis cepat dan akurat gangguan jaringan IndiHome.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      className={`${plusJakartaSans.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
