'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { BookOpen, Search, X } from 'lucide-react';
import { useDigNet } from '@/lib/store';
import type { GuideArticle, RepairCategory } from '@/lib/types';
import { MEDIA_ASSETS } from '../media-assets';

type CategoryFilter = 'Semua' | RepairCategory;

const CATEGORIES: CategoryFilter[] = [
  'Semua',
  'ONT / Konfigurasi',
  'ODP & Fiber Optik',
  'STB & UseeTV',
  'Kabel & Voice',
];

export function KeteranganView() {
  const { posts } = useDigNet();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('Semua');
  const [selectedArticle, setSelectedArticle] = useState<{
    article: GuideArticle;
    tab: 'detail' | 'solusi';
  } | null>(null);

  const filteredPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesCat = categoryFilter === 'Semua' || post.category === categoryFilter;
      const matchesQuery =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.summary.toLowerCase().includes(q) ||
        post.detail.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [posts, searchQuery, categoryFilter]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
            Keterangan & Referensi Gangguan
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Panduan teknis komponen FTTH IndiHome, arti lampu indikator ONT, kode error UseeTV,
            serta standar pengukuran redaman ODP.
          </p>
        </div>
        <p className="text-xs font-mono text-slate-500 tabular-nums whitespace-nowrap">
          {filteredPosts.length} dari {posts.length} artikel
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-72">
          <Search
            className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari panduan (mis. 1302, PON, ODP)..."
            aria-label="Cari artikel keterangan"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/15"
          />
        </div>
      </div>

      {/* Articles Grid */}
      {filteredPosts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center space-y-2">
          <BookOpen className="h-7 w-7 text-slate-400 mx-auto" aria-hidden="true" />
          <p className="text-sm font-medium text-slate-900">Artikel tidak ditemukan</p>
          <p className="text-xs text-slate-500">
            Coba kata kunci lain atau pilih kategori &ldquo;Semua&rdquo;.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((article) => (
            <article
              key={article.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="relative aspect-[4/3] w-full bg-slate-100">
                  <Image
                    src={MEDIA_ASSETS[article.mediaKey].src}
                    alt={article.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    referrerPolicy="no-referrer"
                    className="object-cover"
                  />
                </div>
                <div className="p-5 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-medium text-red-600">{article.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{article.updatedAt}</span>
                  </div>
                  <h2 className="font-display text-base font-bold text-slate-900 leading-snug">
                    {article.title}
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                    {article.summary}
                  </p>
                </div>
              </div>

              <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedArticle({ article, tab: 'detail' })}
                  className="text-xs font-semibold text-slate-800 hover:text-red-600 transition-colors whitespace-nowrap"
                >
                  Lihat Detail
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedArticle({ article, tab: 'solusi' })}
                  className="text-xs font-semibold text-red-600 hover:text-red-700 transition-colors whitespace-nowrap"
                >
                  Saran Perbaikan
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Detail & SOP Modal */}
      {selectedArticle && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="article-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-[1px]"
          onClick={() => setSelectedArticle(null)}
        >
          <div
            className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-slate-500">
                  {selectedArticle.article.category} · Diperbarui{' '}
                  <span className="font-mono">{selectedArticle.article.updatedAt}</span>
                </p>
                <h2
                  id="article-modal-title"
                  className="mt-1 font-display text-lg font-bold text-slate-900"
                >
                  {selectedArticle.article.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                aria-label="Tutup modal artikel"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 shrink-0"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedArticle((prev) => (prev ? { ...prev, tab: 'detail' } : null))
                  }
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    selectedArticle.tab === 'detail'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Penjelasan Teknis
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedArticle((prev) => (prev ? { ...prev, tab: 'solusi' } : null))
                  }
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    selectedArticle.tab === 'solusi'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Langkah Penanganan ({selectedArticle.article.solutionSteps.length})
                </button>
              </div>

              {selectedArticle.tab === 'detail' ? (
                <div className="space-y-4">
                  <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                    <Image
                      src={MEDIA_ASSETS[selectedArticle.article.mediaKey].src}
                      alt={selectedArticle.article.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 640px"
                      referrerPolicy="no-referrer"
                      className="object-cover"
                    />
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {selectedArticle.article.detail}
                  </p>
                </div>
              ) : (
                <ol className="space-y-3">
                  {selectedArticle.article.solutionSteps.map((step, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm text-slate-700">
                      <span className="font-mono text-xs font-semibold text-red-700 bg-red-50 rounded-md h-6 w-6 flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
                        {index + 1}
                      </span>
                      <span className="leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
