import type { StaticImageData } from 'next/image';
import heroFiberImg from '@/src/assets/images/hero_fiber_technician_1795460850497.jpg';
import guideOntImg from '@/src/assets/images/guide_ont_modem_1795460848756.jpg';
import guideOdpImg from '@/src/assets/images/guide_odp_fiber_1795460851444.jpg';
import guideStbImg from '@/src/assets/images/guide_stb_useetv_1795460849610.jpg';
import type { MediaKey } from '@/lib/types';

export const MEDIA_ASSETS: Record<
  MediaKey,
  { src: StaticImageData; alt: string; caption: string }
> = {
  hero: {
    src: heroFiberImg,
    alt: 'Teknisi fiber optik memeriksa perangkat ONT IndiHome pada panel instalasi',
    caption: 'Inspeksi perangkat ONT dan jalur patchcord fiber optik',
  },
  ont: {
    src: guideOntImg,
    alt: 'Modem Optical Network Terminal (ONT) FTTH dengan konektor SC/APC',
    caption: 'Perangkat ONT Gigabit dan indikator PON/Internet',
  },
  odp: {
    src: guideOdpImg,
    alt: 'Kotak Optical Distribution Point (ODP) fiber optik dengan adaptor SC/APC',
    caption: 'Optical Distribution Point (ODP) & terminasi fiber',
  },
  stb: {
    src: guideStbImg,
    alt: 'Set-Top Box (STB) UseeTV beserta remote kontrol dan kabel HDMI',
    caption: 'Perangkat STB UseeTV, remote kontrol, dan koneksi HDMI',
  },
};
