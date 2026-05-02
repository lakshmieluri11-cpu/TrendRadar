/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Video, 
  Search, 
  TrendingUp, 
  Package, 
  Clock, 
  LayoutDashboard, 
  ChevronRight, 
  Loader2,
  Sparkles,
  Zap,
  Target,
  Share2,
  ListRestart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, VideoScript, ProductionPackage, DailyReport } from './types';
import * as geminiService from './services/geminiService';

export default function App() {
  const [report, setReport] = useState<DailyReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [videoPackage, setVideoPackage] = useState<{ script: VideoScript, package: ProductionPackage } | null>(null);
  const [generatingPackage, setGeneratingPackage] = useState(false);
  const [activeTab, setActiveTab] = useState<'daily' | 'research' | 'scripts'>('daily');

  const fetchDailyTrends = async () => {
    setLoading(true);
    try {
      const data = await geminiService.researchDailyTrends();
      setReport(data);
    } catch (error) {
      console.error("Failed to fetch trends", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePackage = async (product: Product) => {
    setGeneratingPackage(true);
    setSelectedProduct(product);
    setActiveTab('scripts');
    try {
      const data = await geminiService.generateVideoPackage(product);
      setVideoPackage(data);
    } catch (error) {
      console.error("Failed to generate package", error);
    } finally {
      setGeneratingPackage(false);
    }
  };

  useEffect(() => {
    fetchDailyTrends();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 font-sans selection:bg-orange-500/30">
      {/* Sidebar */}
      <nav className="fixed left-0 top-0 bottom-0 w-20 md:w-64 bg-[#0a0a0a] border-r border-white/5 flex flex-col z-50">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-orange-500 p-2 rounded-lg shadow-lg rotate-3 group-hover:rotate-0 transition-transform">
            <Zap className="w-6 h-6 text-black fill-black" />
          </div>
          <span className="hidden md:block font-bold text-xl tracking-tighter text-white">VIRAL AGENT</span>
        </div>

        <div className="flex-1 px-4 py-8 space-y-2">
          <NavItem 
            active={activeTab === 'daily'} 
            onClick={() => setActiveTab('daily')} 
            icon={<LayoutDashboard className="w-5 h-5" />} 
            label="Daily Brief" 
          />
          <NavItem 
            active={activeTab === 'research'} 
            onClick={() => setActiveTab('research')} 
            icon={<Search className="w-5 h-5" />} 
            label="Product Lab" 
          />
          <NavItem 
            active={activeTab === 'scripts'} 
            onClick={() => setActiveTab('scripts')} 
            icon={<Video className="w-5 h-5" />} 
            label="Video Packages" 
          />
        </div>

        <div className="p-6">
          <div className="bg-white/5 p-4 rounded-xl hidden md:block">
            <p className="text-xs text-gray-400 mb-2">QUOTA STATUS</p>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full w-2/3 bg-orange-500"></div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="ml-20 md:ml-64 p-4 md:p-10 transition-all duration-300">
        <header className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-orange-500 font-mono text-xs uppercase tracking-widest mb-1">
              <Clock className="w-3 h-3" />
              {report?.date || 'Syncing...'}
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2 underline decoration-orange-500/50 decoration-4 underline-offset-8">
              Mission Control
            </h1>
            <p className="text-gray-400 max-w-lg">
              Analyze marketplace shifts, hunt for viral hooks, and automate high-fidelity content scripts daily.
            </p>
          </div>
          <button 
            onClick={fetchDailyTrends}
            disabled={loading}
            className="group flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-orange-500 hover:text-white transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ListRestart className="w-5 h-5" />}
            Refresh Intelligence
          </button>
        </header>

        {/* Content Tabs */}
        <AnimatePresence mode="wait">
          {activeTab === 'daily' && (
            <motion.div 
              key="daily"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              {/* Daily Highlights */}
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="w-6 h-6 text-orange-500" />
                  <h2 className="text-2xl font-bold">Top Viral Picks</h2>
                </div>
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-[400px] bg-white/5 rounded-3xl animate-pulse" />)}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {report?.topPicks.map((product, idx) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <ProductCard 
                          product={product} 
                          onGenerate={() => handleGeneratePackage(product)} 
                          isFeatured
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </section>

              {/* Stats Bar */}
              <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Detected Trends" value={report?.trendingProducts.length || 0} icon={<Search />} />
                <StatCard label="Viral Potential" value="High" icon={<TrendingUp />} color="text-green-500" />
                <StatCard label="Avg. Order Value" value="$42.50" icon={<Zap />} />
                <StatCard label="Market Velocity" value="+12%" icon={<TrendingUp />} color="text-orange-500" />
              </section>
            </motion.div>
          )}

          {activeTab === 'research' && (
            <motion.div 
              key="research"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <Search className="w-6 h-6 text-orange-500" />
                  <h2 className="text-2xl font-bold">Marketplace Intel</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {report?.trendingProducts.map((product, idx) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <ProductCard 
                      product={product} 
                      onGenerate={() => handleGeneratePackage(product)} 
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'scripts' && (
            <motion.div 
              key="scripts"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-6xl mx-auto"
            >
              {!selectedProduct ? (
                <div className="text-center py-40 border-2 border-dashed border-white/10 rounded-3xl">
                  <Package className="w-16 h-16 text-white/20 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-500">Pick a product into the lab to generate scripts</h3>
                  <button 
                    onClick={() => setActiveTab('daily')}
                    className="mt-4 text-orange-500 hover:underline"
                  >
                    Back to Trends
                  </button>
                </div>
              ) : generatingPackage ? (
                <div className="text-center py-40">
                  <div className="relative inline-block">
                    <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
                    <Sparkles className="w-4 h-4 text-white absolute -top-1 -right-1 animate-bounce" />
                  </div>
                  <h3 className="text-xl font-bold text-white mt-4 animate-pulse">Architecting Viral Script...</h3>
                  <p className="text-gray-500">Calculating psychological triggers & pattern interrupts</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Script Column */}
                  <div className="lg:col-span-7 space-y-8">
                    <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8 shadow-2xl">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h2 className="text-3xl font-black text-white">{videoPackage?.script.productName}</h2>
                          <div className="flex gap-2 mt-2">
                            <span className="bg-orange-500/20 text-orange-500 text-[10px] uppercase font-bold px-2 py-0.5 rounded">60-Sec Short</span>
                            <span className="bg-blue-500/20 text-blue-500 text-[10px] uppercase font-bold px-2 py-0.5 rounded">TikTok / Reels / Shorts</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 uppercase font-bold">Target</p>
                          <p className="text-sm font-mono">{selectedProduct.targetAudience}</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <ScriptSection title="HOOK (0-3s)" content={videoPackage?.script.hook} icon={<Zap className="text-yellow-500" />} />
                        <ScriptSection title="PROBLEM (3-10s)" content={videoPackage?.script.problem} icon={<Target className="text-red-500" />} />
                        <ScriptSection title="SOLUTION (10-20s)" content={videoPackage?.script.solution} icon={<Sparkles className="text-blue-500" />} />
                        <ScriptSection title="FEATURES (20-45s)" content={videoPackage?.script.features} icon={<Package className="text-green-500" />} />
                        <ScriptSection title="RESULTS (45-55s)" content={videoPackage?.script.socialProof} icon={<BarChart3 className="text-purple-500" />} />
                        <ScriptSection title="CTA (55-60s)" content={videoPackage?.script.cta} icon={<Share2 className="text-orange-500" />} />
                      </div>
                    </div>
                  </div>

                  {/* Metadata Column */}
                  <div className="lg:col-span-5 space-y-6">
                    <div className="bg-orange-600 rounded-3xl p-8 text-black shadow-lg shadow-orange-600/20">
                      <h3 className="text-xl font-black mb-4 flex items-center gap-2 lowercase">
                        <TrendingUp className="w-5 h-5" />
                        youtube_package.json
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-[10px] font-black uppercase opacity-60">Title</label>
                          <p className="font-bold leading-tight mt-1">{videoPackage?.package.title}</p>
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase opacity-60">Description</label>
                          <p className="text-sm mt-1 line-clamp-3 opacity-90">{videoPackage?.package.description}</p>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-4">
                          {videoPackage?.package.hashtags.map(tag => (
                            <span key={tag} className="text-[10px] font-bold bg-black text-white px-2 py-0.5 rounded italic">#{tag.replace('#', '')}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-8">
                      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Video className="w-5 h-5 text-orange-500" />
                        AI Production Intel
                      </h3>
                      <div className="space-y-4 text-sm">
                        <ProductionDetail label="Avatar Dialogue" value={videoPackage?.package.avatarDialogue} />
                        <ProductionDetail label="Visual Instructions" value={videoPackage?.package.visualInstructions} />
                        <ProductionDetail label="Voice Style" value={videoPackage?.package.voiceStyle} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function NavItem({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        active 
          ? 'bg-orange-500 text-black font-bold shadow-lg shadow-orange-500/20' 
          : 'text-gray-500 hover:text-white hover:bg-white/5'
      }`}
    >
      {icon}
      <span className="hidden md:block transition-all">{label}</span>
      {active && <div className="hidden md:block ml-auto w-1.5 h-1.5 bg-black rounded-full" />}
    </button>
  );
}

function StatCard({ label, value, icon, color = 'text-white' }: { label: string, value: string | number, icon: React.ReactNode, color?: string }) {
  return (
    <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-3xl">
      <div className="flex items-center justify-between mb-4">
        <div className="bg-white/5 p-2 rounded-lg text-gray-400">
          {icon}
        </div>
      </div>
      <p className="text-xs text-gray-500 uppercase font-black tracking-widest">{label}</p>
      <h4 className={`text-2xl md:text-3xl font-black mt-1 ${color}`}>{value}</h4>
    </div>
  );
}

function ProductCard({ product, onGenerate, isFeatured = false }: { product: Product, onGenerate: () => void, isFeatured?: boolean }) {
  return (
    <div className={`group relative bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] overflow-hidden transition-all hover:border-orange-500/50 hover:shadow-2xl hover:shadow-orange-500/10 ${isFeatured ? 'h-full flex flex-col' : ''}`}>
      <div className={`relative ${isFeatured ? 'aspect-[4/5]' : 'aspect-square'} bg-white/5 overflow-hidden`}>
        <img 
          src={`https://picsum.photos/seed/${product.id}/600/800?blur=1`} 
          alt={product.name}
          className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all group-hover:scale-110 duration-700"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
        
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex gap-2 mb-2">
            <span className="bg-white/10 backdrop-blur-md text-[10px] text-white font-bold px-2 py-0.5 rounded-full border border-white/10">
              {product.category}
            </span>
            <span className="bg-orange-500 text-[10px] text-black font-black px-2 py-0.5 rounded-full">
              SCORE: {product.viralScore}/10
            </span>
          </div>
          <h3 className="text-2xl font-black text-white leading-tight">{product.name}</h3>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex-1 space-y-4 mb-6">
          <div>
            <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">Pain Point</p>
            <p className="text-xs text-gray-400 line-clamp-2 italic">"{product.painPoint}"</p>
          </div>
          <div>
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Trending Intelligence</p>
            <p className="text-xs text-gray-300 line-clamp-3">{product.trendingReason}</p>
          </div>
        </div>

        <button 
          onClick={onGenerate}
          className="w-full bg-white text-black py-4 rounded-2xl font-black text-sm uppercase tracking-tighter hover:bg-orange-500 hover:text-white transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
        >
          Generate Video Package
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function ScriptSection({ title, content, icon }: { title: string, content?: string, icon: React.ReactNode }) {
  return (
    <div className="relative pl-12 border-l-2 border-white/5 py-2">
      <div className="absolute -left-4 top-2 bg-[#151515] border border-white/10 p-2 rounded-xl shadow-lg">
        {icon}
      </div>
      <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 italic">{title}</h4>
      <p className="text-lg text-gray-200 leading-relaxed font-medium">{content || "Drafting section content..."}</p>
    </div>
  );
}

function ProductionDetail({ label, value }: { label: string, value?: string }) {
  return (
    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
      <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-2">{label}</p>
      <p className="text-xs text-gray-300 leading-relaxed italic">{value || "Waiting for data..."}</p>
    </div>
  );
}

