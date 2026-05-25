import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSpriteStore } from '../store/useSpriteStore';
import { ImageUploader } from '../components/uploader/ImageUploader';
import { Layers, Code, Sparkles, Zap, Shield, Play } from 'lucide-react';
import { getSampleSpriteSheet, type SampleType } from '../lib/sampleSprites';

export const LandingPage: React.FC = () => {
  const { imageElement, setImage } = useSpriteStore();
  const navigate = useNavigate();

  // Auto-navigate to editor when an image is loaded
  useEffect(() => {
    if (imageElement) {
      navigate('/editor');
    }
  }, [imageElement, navigate]);

  const handleTrySample = async (type: SampleType) => {
    try {
      const { dataUrl, name } = await getSampleSpriteSheet(type);
      const img = new Image();
      img.onload = () => {
        setImage(img, name);
      };
      img.src = dataUrl;
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b19] text-foreground flex flex-col relative overflow-hidden">
      {/* Background Liquid Glass Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] left-[10%] w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-[20%] right-[10%] w-[450px] h-[450px] bg-cyan-500/10 rounded-full blur-[120px] animate-float-slow" />
        <div className="absolute top-[40%] right-[30%] w-[300px] h-[300px] bg-pink-500/5 rounded-full blur-[90px] animate-float-reverse" />
      </div>

      <header className="border-b border-white/5 bg-transparent backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center shadow-lg shadow-primary/20">
              <Layers className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
              SpriteSplit
            </span>
          </div>
          <nav className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="glass-button h-9 w-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-white"
            >
              <Code className="w-4 h-4" />
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1 z-10 relative">
        {/* Hero Section */}
        <section className="pt-20 pb-8 px-6 text-center">
          <div className="container mx-auto max-w-4xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/5 text-xs font-semibold text-cyan-400 mb-6 backdrop-blur-sm animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              100% Client-Side &amp; Private Sprite Splitting
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1] bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent">
              Split Sprite Sheets into{' '}
              <span className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
                Separate PNGs
              </span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Upload your sprite sheets and let our smart pixel-detection algorithm isolate, wrap, and package every asset instantly.
            </p>
          </div>

          {/* Animated showcase */}
          <div className="relative mx-auto mt-6 mb-12 w-full max-w-lg aspect-[16/9] rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md overflow-hidden flex items-center justify-center shadow-2xl">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:20px_20px] opacity-40" />
            <div className="relative w-4/5 h-4/5 flex items-center justify-around z-10">
              <div className="flex flex-col items-center gap-2">
                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Sprite Sheet</span>
                <div className="w-28 h-20 rounded-xl bg-slate-900/60 border border-white/5 p-2 flex items-center justify-center">
                  <div className="grid grid-cols-3 gap-2 w-full">
                    <div className="h-5 bg-indigo-500/20 rounded border border-indigo-500/30 animate-pulse" />
                    <div className="h-5 bg-cyan-500/20 rounded border border-cyan-500/30 animate-pulse" />
                    <div className="h-5 bg-purple-500/20 rounded border border-purple-500/30 animate-pulse" />
                    <div className="h-5 bg-emerald-500/20 rounded border border-emerald-500/30 animate-pulse" />
                    <div className="h-5 bg-pink-500/20 rounded border border-pink-500/30 animate-pulse" />
                    <div className="h-5 bg-amber-500/20 rounded border border-amber-500/30 animate-pulse" />
                  </div>
                </div>
              </div>

              <div className="relative h-full flex flex-col items-center justify-center">
                <div className="w-[1.5px] h-[70%] bg-gradient-to-b from-transparent via-primary to-transparent relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rounded-full blur-xs animate-bounce" />
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold shadow-lg animate-pulse">
                  ⚡
                </div>
              </div>

              <div className="flex flex-col items-center gap-2">
                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Transparent Sprites</span>
                <div className="w-28 h-20 rounded-xl bg-slate-900/60 border border-white/5 p-2 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center gap-2">
                    <div className="w-7 h-7 rounded bg-cyan-500/20 border border-cyan-400 shadow-[0_0_8px_rgba(0,255,255,0.4)] animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-7 h-7 rounded bg-indigo-500/20 border border-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.4)] animate-bounce" style={{ animationDelay: '0.3s' }} />
                    <div className="w-7 h-7 rounded bg-pink-500/20 border border-pink-400 shadow-[0_0_8px_rgba(236,72,153,0.4)] animate-bounce" style={{ animationDelay: '0.5s' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Uploader Section */}
        <section className="pb-12 px-6">
          <div className="container mx-auto max-w-4xl relative">
            <ImageUploader />
          </div>
        </section>

        {/* Sample Sprite Sheets Showcase */}
        <section className="pb-24 px-6">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-white mb-2">No sprite sheet handy?</h2>
              <p className="text-sm text-muted-foreground">Select one of our programmatically generated demo assets below to try it out instantly.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Character Card */}
              <div className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col justify-between hover:border-primary/30 hover:bg-white/[0.04] transition-all group">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Play className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">Pixel Adventurer</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                    A 4-frame retro walking animation character. Perfect for testing layout grid and individual frame extraction.
                  </p>
                </div>
                <button
                  onClick={() => handleTrySample('character')}
                  className="glass-button w-full py-2.5 rounded-xl text-xs font-semibold text-indigo-400 hover:text-white cursor-pointer"
                >
                  Load Sample
                </button>
              </div>

              {/* Items Card */}
              <div className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col justify-between hover:border-primary/30 hover:bg-white/[0.04] transition-all group">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Zap className="w-5 h-5 text-amber-400" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">RPG Items Loot</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                    An 8-item inventory sheet grid: red/blue potions, swords, golden coins, shields, and magic gems.
                  </p>
                </div>
                <button
                  onClick={() => handleTrySample('items')}
                  className="glass-button w-full py-2.5 rounded-xl text-xs font-semibold text-amber-400 hover:text-white cursor-pointer"
                >
                  Load Sample
                </button>
              </div>

              {/* Neon Shapes Card */}
              <div className="glass-panel p-5 rounded-2xl border border-white/5 flex flex-col justify-between hover:border-primary/30 hover:bg-white/[0.04] transition-all group">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Shield className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">Neon Shapes</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                    6 colorful geometric glowing shapes. Verify alpha threshold sensitivity on gradient borders and translucent objects.
                  </p>
                </div>
                <button
                  onClick={() => handleTrySample('shapes')}
                  className="glass-button w-full py-2.5 rounded-xl text-xs font-semibold text-cyan-400 hover:text-white cursor-pointer"
                >
                  Load Sample
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 border-t border-white/5 bg-slate-950/20 text-center text-xs text-muted-foreground mt-auto relative z-10">
        <p>© {new Date().getFullYear()} SpriteSplit. Client-only processing, no servers involved.</p>
      </footer>
    </div>
  );
};
