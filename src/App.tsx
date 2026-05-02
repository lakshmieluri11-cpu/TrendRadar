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
  ListRestart,
  Youtube,
  CheckCircle2,
  AlertCircle,
  Play
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
  const [activeTab, setActiveTab] = useState<'daily' | 'research' | 'scripts' | 'automation'>('daily');
  
  // YouTube state
  const [ytTokens, setYtTokens] = useState<any>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [workflowStatus, setWorkflowStatus] = useState<'idle' | 'rendering' | 'uploading' | 'complete' | 'error'>('idle');
  const [finalVideoUrl, setFinalVideoUrl] = useState<string | null>(null);

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
    setWorkflowStatus('idle');
    try {
      const data = await geminiService.generateVideoPackage(product);
      setVideoPackage(data);
    } catch (error) {
      console.error("Failed to generate package", error);
    } finally {
      setGeneratingPackage(false);
    }
  };

  const handleConnectYoutube = async () => {
    try {
      const res = await fetch('/api/auth/youtube/url');
      const { url } = await res.json();
      const popup = window.open(url, 'youtube_auth', 'width=600,height=700');
      if (!popup) alert("Please allow popups!");
    } catch (err) {
      console.error("Auth error", err);
    }
  };

  const startFullWorkflow = async () => {
    if (!ytTokens || !videoPackage) return;
    
    setWorkflowStatus('rendering');
    try {
      // 1. Render Video (Proxy call to HeyGen/Runway mock)
      const renderRes = await fetch('/api/video/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script: videoPackage.script, product: selectedProduct })
      });
      const renderData = await renderRes.json();
      
      setWorkflowStatus('uploading');
      // 2. Upload to YouTube
      const uploadRes = await fetch('/api/youtube/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokens: ytTokens,
          videoUrl: renderData.videoUrl,
          title: videoPackage.package.title,
          description: videoPackage.package.description,
          tags: videoPackage.package.tags
        })
      });
      const uploadData = await uploadRes.json();
      
      setFinalVideoUrl(uploadData.url);
      setWorkflowStatus('complete');
    } catch (err) {
      console.error("Workflow error", err);
      setWorkflowStatus('error');
    }
  };

  useEffect(() => {
    fetchDailyTrends();

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'YOUTUBE_AUTH_SUCCESS') {
        setYtTokens(event.data.tokens);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 font-sans selection:bg-orange-500/30">
      {/* Sidebar */}
      <nav className="fixed left-0 top-0 bottom-0 w-20 md:w-64 bg-[#0a0a0a] border-r border-white/5 flex flex-col z-50">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-orange-500 p-2 rounded-lg shadow-lg rotate-3">
            <Zap className="w-6 h-6 text-black fill-black" />
          </div>
          <span className="hidden md:block font-bold text-xl tracking-tighter text-white">VIRAL AGENT</span>
        </div>

        <div className="flex-1 px-4 py-8 space-y-2">
          <NavItem active={activeTab === 'daily'} onClick={() => setActiveTab('daily')} icon={<LayoutDashboard className="w-5 h-5" />} label="Daily Brief" />
          <NavItem active={activeTab === 'research'} onClick={() => setActiveTab('research')} icon={<Search className="w-5 h-5" />} label="Product Lab" />
          <NavItem active={activeTab === 'scripts'} onClick={() => setActiveTab('scripts')} icon={<Video className="w-5 h-5" />} label="Video Studio" />
        </div>

        <div className="p-6 space-y-4">
          {!ytTokens ? (
            <button 
              onClick={handleConnectYoutube}
              className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-xl font-bold text-xs hover:bg-red-700 transition-all"
            >
              <Youtube className="w-4 h-4" />
              <span className="hidden md:block">Connect YouTube</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-green-500/10 text-green-500 p-3 rounded-xl border border-green-500/20">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="hidden md:block text-[10px] font-bold uppercase truncate">YouTube Linked</span>
            </div>
          )}
          
          <div className="bg-white/5 p-4 rounded-xl hidden md:block">
            <p className="text-xs text-gray-400 mb-2 font-black uppercase tracking-widest">Efficiency</p>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full w-4/5 bg-orange-500"></div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="ml-20 md:ml-64 p-4 md:p-10 transition-all duration-300">
        <header className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-orange-500 font-mono text-[10px] uppercase tracking-widest mb-1">
              <Clock className="w-3 h-3" />
              {report?.date || 'Syncing Intelligence...'}
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2 underline decoration-orange-500/50 decoration-4 underline-offset-8">
              Mission Control
            </h1>
            <p className="text-gray-400 max-w-lg text-sm">
              Hunt for viral hooks, architect AI scripts, and deploy high-fidelity content to YouTube automatically.
            </p>
          </div>
          <button 
            onClick={fetchDailyTrends}
            disabled={loading}
            className="group flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-orange-500 hover:text-white transition-all active:scale-95 disabled:opacity-50 shadow-xl"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ListRestart className="w-4 h-4" />}
            Refresh Trends
          </button>
        </header>

        {/* Content Tabs */}
        <AnimatePresence mode="wait">
          {activeTab === 'daily' && (
            <motion.div key="daily" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="w-6 h-6 text-orange-500" />
                  <h2 className="text-2xl font-bold tracking-tight">Today's Viral Highs</h2>
                </div>
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-[450px] bg-white/5 rounded-[2.5rem] animate-pulse" />)}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {report?.topPicks.map((product, idx) => (
                      <motion.div key={product.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1 }}>
                        <ProductCard product={product} onGenerate={() => handleGeneratePackage(product)} isFeatured />
                      </motion.div>
                    ))}
                  </div>
                )}
              </section>

              <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Detected Trends" value={report?.trendingProducts.length || 0} icon={<Search />} />
                <StatCard label="Viral Potential" value="9.4/10" icon={<TrendingUp />} color="text-green-500" />
                <StatCard label="Automation Ready" value="100%" icon={<Zap />} />
                <StatCard label="Growth Speed" value="+18%" icon={<TrendingUp />} color="text-orange-500" />
              </section>
            </motion.div>
          )}

          {activeTab === 'research' && (
            <motion.div key="research" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <Search className="w-6 h-6 text-orange-500" />
                  <h2 className="text-2xl font-bold tracking-tight">Product Laboratory</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {report?.trendingProducts.map((product, idx) => (
                  <motion.div key={product.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                    <ProductCard product={product} onGenerate={() => handleGeneratePackage(product)} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'scripts' && (
            <motion.div key="scripts" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-7xl mx-auto pb-20">
              {!selectedProduct ? (
                <div className="text-center py-40 border-2 border-dashed border-white/5 rounded-[3rem]">
                  <Package className="w-16 h-16 text-white/10 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-500">Pick a trend from Mission Control to start</h3>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left Column: Script Visualizer */}
                  <div className="lg:col-span-7 space-y-6">
                    <div className="bg-[#0a0a0a] border border-white/5 rounded-[3rem] p-10 relative overflow-hidden">
                      {generatingPackage && (
                        <div className="absolute inset-0 bg-[#0a0a0a]/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
                          <p className="text-xl font-black text-white px-8 text-center italic tracking-tight">AI is architecting psychological hooks and pattern interrupts...</p>
                        </div>
                      )}
                      
                      <div className="flex items-start justify-between mb-12">
                        <div>
                          <div className="flex gap-2 mb-3">
                            <span className="bg-orange-500/10 text-orange-500 text-[10px] uppercase font-black px-3 py-1 rounded-full border border-orange-500/20">60-Sec Short</span>
                            <span className="bg-white/5 text-gray-400 text-[10px] uppercase font-black px-3 py-1 rounded-full">{selectedProduct.category}</span>
                          </div>
                          <h2 className="text-4xl font-black text-white tracking-tighter leading-none">{videoPackage?.script.productName}</h2>
                        </div>
                      </div>

                      <div className="space-y-8 relative">
                        <div className="absolute left-[17px] top-4 bottom-4 w-px bg-white/5" />
                        <ScriptSection title="HOOK (0-3s)" content={videoPackage?.script.hook} icon={<Zap className="w-4 h-4 text-yellow-400" />} />
                        <ScriptSection title="PROBLEM (3-10s)" content={videoPackage?.script.problem} icon={<Target className="w-4 h-4 text-red-500" />} />
                        <ScriptSection title="SOLUTION (10-20s)" content={videoPackage?.script.solution} icon={<Sparkles className="w-4 h-4 text-blue-400" />} />
                        <ScriptSection title="FEATURES (20-45s)" content={videoPackage?.script.features} icon={<Package className="w-4 h-4 text-green-400" />} />
                        <ScriptSection title="SOCIAL PROOF (45-55s)" content={videoPackage?.script.socialProof} icon={<BarChart3 className="w-4 h-4 text-purple-400" />} />
                        <ScriptSection title="CTA (55-60s)" content={videoPackage?.script.cta} icon={<Share2 className="w-4 h-4 text-orange-500" />} />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Execution Control */}
                  <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-10">
                    {/* Automation Panel */}
                    <div className="bg-orange-600 rounded-[3rem] p-10 text-black shadow-2xl shadow-orange-600/20 group">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-black lowercase tracking-tighter flex items-center gap-2">
                          <Play className="w-6 h-6 fill-black" />
                          deploy_automation.io
                        </h3>
                        {ytTokens ? (
                           <Youtube className="w-6 h-6 opacity-40" />
                        ) : (
                          <AlertCircle className="w-6 h-6 opacity-60 animate-pulse" />
                        )}
                      </div>

                      {ytTokens ? (
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase opacity-60">Status</p>
                            <div className="flex items-center gap-3">
                              <StepIndicator active={workflowStatus === 'rendering'} complete={['uploading', 'complete'].includes(workflowStatus)} label="AI Video Rendering" />
                              <div className="h-px flex-1 bg-black/10" />
                              <StepIndicator active={workflowStatus === 'uploading'} complete={workflowStatus === 'complete'} label="YouTube Deployment" />
                            </div>
                          </div>

                          {workflowStatus === 'idle' ? (
                            <button 
                              onClick={startFullWorkflow}
                              className="w-full bg-black text-white py-5 rounded-[1.5rem] font-black text-lg uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3"
                            >
                              Render & Upload to YouTube
                              <ChevronRight className="w-6 h-6" />
                            </button>
                          ) : workflowStatus === 'complete' ? (
                            <div className="bg-black/10 p-6 rounded-[1.5rem] border border-black/5 text-center">
                              <p className="font-black text-xl mb-4">SUCCESSFULLY DEPLOYED!</p>
                              <a 
                                href={finalVideoUrl || '#'} 
                                target="_blank" 
                                className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full font-bold text-sm hover:bg-black hover:text-white transition-all shadow-lg"
                              >
                                View on YouTube
                                <Youtube className="w-4 h-4" />
                              </a>
                            </div>
                          ) : workflowStatus === 'error' ? (
                            <div className="bg-red-500/20 p-6 rounded-[1.5rem] border border-red-500/20 text-center">
                              <p className="font-black">Deployment Interrupted</p>
                              <button onClick={startFullWorkflow} className="mt-2 underline text-white font-bold">Retry Execution</button>
                            </div>
                          ) : (
                            <div className="bg-white/20 backdrop-blur-xl p-8 rounded-[2rem] text-center">
                              <Loader2 className="w-10 h-10 mx-auto animate-spin mb-4" />
                              <p className="font-black uppercase tracking-widest">{workflowStatus === 'rendering' ? "Synthesizing Frames & Voice" : "Bypassing Filter & Uploading"}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <p className="text-sm font-bold leading-snug">YouTube integration required to enable autonomous deployment.</p>
                          <button 
                            onClick={handleConnectYoutube}
                            className="w-full bg-white text-black py-4 rounded-[1.5rem] font-bold text-sm uppercase flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-all"
                          >
                            <Youtube className="w-5 h-5" />
                            Connect YouTube Channel
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Metadata View */}
                    <div className="bg-[#0a0a0a] border border-white/5 rounded-[3rem] p-10">
                      <div className="space-y-6">
                        <div>
                          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Optimized Title</label>
                          <p className="text-lg font-bold text-white leading-tight">{videoPackage?.package.title}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <ProductionDetail label="Voice Tone" value={videoPackage?.package.voiceStyle} />
                          <ProductionDetail label="Avatar Path" value="Cinematic AI Host" />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Visual Prompt</label>
                          <p className="text-xs text-gray-400 italic leading-relaxed">"{videoPackage?.package.visualInstructions}"</p>
                        </div>
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

function StepIndicator({ active, complete, label }: { active: boolean, complete: boolean, label: string }) {
  return (
    <div className={`p-3 rounded-2xl border transition-all ${complete ? 'bg-black text-white border-black' : active ? 'bg-white text-black border-white' : 'bg-transparent text-black/40 border-black/10'}`}>
       {complete ? <CheckCircle2 className="w-5 h-5" /> : active ? <Loader2 className="w-5 h-5 animate-spin" /> : <div className="w-5 h-5 rounded-full border-2 border-current" />}
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

