import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Scale, 
  Table as TableIcon, 
  Target, 
  Loader2, 
  Sparkles,
  RefreshCw,
  Info
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { generateAnalysis, AnalysisType } from './services/gemini';
import { cn } from './lib/utils';

export default function App() {
  const [decision, setDecision] = useState('');
  const [analysisType, setAnalysisType] = useState<AnalysisType>('pros-cons');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleAnalyze = async (customDecision?: string) => {
    const finalDecision = customDecision || decision;
    if (!finalDecision.trim()) return;
    
    if (customDecision) setDecision(customDecision);
    
    setIsLoading(true);
    setError(null);
    try {
      const analysis = await generateAnalysis(finalDecision, analysisType);
      setResult(analysis || "No analysis generated.");
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const examples = [
    "Should I buy a new electric car or keep my current gas car?",
    "Should I host the family dinner at my house or go to a restaurant?",
    "Should I start a small garden in the backyard or join a community garden?",
  ];

  const renderWithMarkers = (children: React.ReactNode): React.ReactNode => {
    if (typeof children === 'string') {
      const parts = children.split(/(\(L\)|\(M\)|\(H\))/g);
      return (
        <>
          {parts.map((part, i) => {
            if (part === '(L)') return (
              <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Low
              </span>
            );
            if (part === '(M)') return (
              <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Medium
              </span>
            );
            if (part === '(H)') return (
              <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                High
              </span>
            );
            return part;
          })}
        </>
      );
    }
    
    if (Array.isArray(children)) {
      return children.map((child, index) => <span key={index}>{renderWithMarkers(child)}</span>);
    }
    
    return children;
  };

  const analysisOptions = [
    { id: 'pros-cons', label: 'Pros & Cons', icon: Scale, description: 'A balanced look at advantages and disadvantages.' },
    { id: 'comparison', label: 'Comparison', icon: TableIcon, description: 'Side-by-side evaluation of options.' },
    { id: 'swot', label: 'SWOT Analysis', icon: Target, description: 'Strengths, Weaknesses, Opportunities, Threats.' },
  ] as const;

  return (
    <div className="min-h-screen bg-[#fdfcfb] text-[#2c2c2c] font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Header */}
      <header className="border-b border-amber-100 bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-md">
              <Scale size={24} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-emerald-900">The Tiebreaker</h1>
          </div>
          <div className="text-xs font-bold text-emerald-600/60 uppercase tracking-widest hidden sm:block">
            Your Friendly Decision Assistant
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 md:py-16">
        {/* Hero Section */}
        <section className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 text-emerald-950 leading-tight">
              Let's figure this out <span className="text-emerald-600 italic">together.</span>
            </h2>
            <p className="text-xl text-black/60 max-w-xl mx-auto leading-relaxed">
              Stuck on a big choice? Tell me what's on your mind, and I'll help you look at it from every angle.
            </p>
          </motion.div>
        </section>

        {/* Input Section */}
        <section className="space-y-10">
          <motion.div 
            className="bg-white rounded-3xl shadow-xl shadow-emerald-900/5 border border-emerald-100 p-8 md:p-10"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <label htmlFor="decision" className="block text-base font-bold text-emerald-900 uppercase tracking-widest">
                  What are you deciding on?
                </label>
                <div className="flex gap-2">
                  {examples.map((ex, i) => (
                    <button
                      key={i}
                      onClick={() => handleAnalyze(ex)}
                      className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded-full hover:bg-amber-100 transition-colors"
                      title={ex}
                    >
                      Example {i + 1}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                id="decision"
                className="w-full min-h-[160px] p-6 rounded-2xl border-2 border-emerald-50 focus:border-emerald-500 focus:ring-8 focus:ring-emerald-500/5 outline-none transition-all resize-none text-xl leading-relaxed placeholder:text-black/10 bg-emerald-50/30"
                placeholder="e.g., Should I host the family dinner at my house this year or go to a restaurant?"
                value={decision}
                onChange={(e) => setDecision(e.target.value)}
              />
            </div>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
              {analysisOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setAnalysisType(option.id)}
                  className={cn(
                    "flex flex-col items-center p-6 rounded-2xl border-2 transition-all text-center group",
                    analysisType === option.id 
                      ? "bg-emerald-50 border-emerald-500 ring-4 ring-emerald-500/10" 
                      : "bg-white border-emerald-50 hover:border-emerald-200 hover:bg-emerald-50/20"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors",
                    analysisType === option.id ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100"
                  )}>
                    <option.icon size={24} />
                  </div>
                  <span className={cn(
                    "font-bold text-lg mb-2",
                    analysisType === option.id ? "text-emerald-900" : "text-emerald-800/70"
                  )}>{option.label}</span>
                  <span className="text-sm text-black/40 leading-relaxed">{option.description}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => handleAnalyze()}
              disabled={isLoading || !decision.trim()}
              className="w-full mt-10 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white font-bold text-lg py-5 rounded-2xl shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  <span>Thinking carefully...</span>
                </>
              ) : (
                <>
                  <Sparkles size={24} />
                  <span>Help me decide!</span>
                </>
              )}
            </button>
          </motion.div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-xl text-sm flex items-start gap-3"
              >
                <Info className="shrink-0 mt-0.5" size={16} />
                <p>{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Result Section */}
          <AnimatePresence>
            {result && (
              <motion.div
                ref={resultRef}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden"
              >
                <div className="bg-emerald-600/5 px-6 py-4 border-b border-emerald-600/10 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm uppercase tracking-wider">
                    <Sparkles size={16} />
                    <span>Analysis Result</span>
                  </div>
                  <button 
                    onClick={() => handleAnalyze()}
                    className="text-emerald-600 hover:text-emerald-700 p-1 rounded-lg hover:bg-emerald-600/10 transition-colors"
                    title="Regenerate"
                  >
                    <RefreshCw size={18} />
                  </button>
                </div>
                
                <div className="p-8 md:p-12 prose prose-emerald max-w-none prose-headings:tracking-tight prose-headings:font-bold prose-p:text-black/70 prose-li:text-black/70 prose-table:border prose-table:border-emerald-100 prose-th:bg-emerald-50/50 prose-th:p-4 prose-td:p-4 prose-td:border-t prose-td:border-emerald-50 overflow-x-auto">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ children }) => <p>{renderWithMarkers(children)}</p>,
                      li: ({ children }) => <li>{renderWithMarkers(children)}</li>,
                      td: ({ children }) => <td>{renderWithMarkers(children)}</td>,
                    }}
                  >
                    {result}
                  </ReactMarkdown>
                </div>

                <div className="bg-black/[0.02] px-6 py-4 border-t border-black/5 text-center">
                  <p className="text-xs text-black/40 italic">
                    AI-generated analysis. Use as a guide, not absolute truth.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-6 py-12 border-t border-black/5 text-center">
        <div className="flex items-center justify-center gap-2 mb-4 opacity-40">
          <Scale size={16} />
          <span className="text-sm font-semibold uppercase tracking-widest">The Tiebreaker</span>
        </div>
        <p className="text-sm text-black/40">
          Helping you break the tie since 2026.
        </p>
      </footer>
    </div>
  );
}
