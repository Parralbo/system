
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { INITIAL_SUBJECTS, LEVELS } from './constants';
import { ProgressState, PrepType, UserProfile } from './types';
import { 
  Trophy, 
  BookOpen, 
  LayoutDashboard, 
  ChevronRight, 
  CheckCircle2, 
  Circle, 
  Target, 
  Zap,
  ChevronLeft,
  Loader2,
  X,
  LogOut,
  Users,
  Sparkles,
  Globe,
  Wifi,
  WifiOff,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { getTopicExplanation } from './geminiService';
import { cloudSync } from './databaseService';

// --- Components ---

const ProgressBar: React.FC<{ progress: number; color?: string; className?: string }> = ({ progress, color = 'bg-blue-600', className = "" }) => (
  <div className={`w-full bg-gray-200/20 rounded-full h-2.5 overflow-hidden ${className}`}>
    <div 
      className={`h-full transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1) ${color}`} 
      style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
    />
  </div>
);

const AKIModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  title: string; 
  content: string; 
  loading: boolean 
}> = ({ isOpen, onClose, title, content, loading }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] w-full max-w-lg h-[90vh] sm:h-auto max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="p-5 border-b flex justify-between items-center bg-indigo-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
               <Sparkles size={20} />
            </div>
            <div>
              <h3 className="font-black text-slate-800 uppercase text-xs tracking-tight">{title}</h3>
              <p className="text-[9px] text-indigo-500 font-bold uppercase tracking-widest">AKI Analysis</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-200/50 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} className="text-slate-600" />
          </button>
        </div>
        <div className="p-8 overflow-y-auto flex-1 bg-white">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-5">
              <Loader2 className="w-14 h-14 text-indigo-500 animate-spin" />
              <p className="text-slate-400 animate-pulse font-black text-[10px] uppercase tracking-[0.2em]">Analyzing Concept...</p>
            </div>
          ) : (
            <div className="prose prose-sm prose-indigo max-w-none text-slate-800 font-science">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          )}
        </div>
        <div className="p-6 bg-slate-50 border-t flex justify-center safe-bottom">
          <button onClick={onClose} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all">
            Mastery Confirmed
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isBooting, setIsBooting] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'subjects' | 'leaderboard' | 'aki'>('dashboard');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [cloudStatus, setCloudStatus] = useState<{ok: boolean, message: string}>({ ok: false, message: "Initializing" });
  
  const [isSignup, setIsSignup] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [akiModal, setAkiModal] = useState({ open: false, title: '', content: '', loading: false });

  const stats = useMemo(() => {
    if (!currentUser) return null;
    const subjectDetails: Record<string, { percent: number }> = {};
    let totalCompleted = 0;
    let totalCount = 0;

    Object.entries(INITIAL_SUBJECTS).forEach(([subName, subject]) => {
      let subDone = 0;
      let subMax = 0;
      Object.entries(subject.chapters).forEach(([chapName, topics]) => {
        topics.forEach(topic => {
          subMax++;
          if (currentUser.progress.completedTopics[`${subName}-${chapName}-${topic}`]) subDone++;
        });
      });
      subjectDetails[subName] = { percent: subMax > 0 ? (subDone / subMax) * 100 : 0 };
      totalCompleted += subDone;
      totalCount += subMax;
    });

    const percent = totalCount > 0 ? (totalCompleted / totalCount) * 100 : 0;
    const currentLevel = LEVELS.find(l => currentUser.xp >= l.min && currentUser.xp <= l.max) || LEVELS[0];
    const nextLevel = LEVELS.find(l => l.level === currentLevel.level + 1) || currentLevel;
    
    let progressToNext = 100;
    if (nextLevel !== currentLevel) {
      progressToNext = Math.min(100, ((currentUser.xp - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100);
    }

    return { xp: currentUser.xp, currentLevel, progressToNext, percent, subjectDetails };
  }, [currentUser]);

  const checkCloudHealth = async () => {
    const health = await cloudSync.checkConnection();
    setCloudStatus(health);
    return health;
  };

  useEffect(() => {
    const restoreSession = async () => {
      const health = await checkCloudHealth();
      const savedAlias = localStorage.getItem('hsc-elite-session');
      if (savedAlias) {
        const local = localStorage.getItem(`hsc-user-${savedAlias}`);
        if (local) setCurrentUser(JSON.parse(local));
        if (health.ok) {
          const cloudUser = await cloudSync.getUser(savedAlias);
          if (cloudUser) {
            setCurrentUser(cloudUser);
            localStorage.setItem(`hsc-user-${savedAlias}`, JSON.stringify(cloudUser));
          }
        }
      }
      setTimeout(() => setIsBooting(false), 800);
    };
    restoreSession();
  }, []);

  const syncDebounce = useRef<NodeJS.Timeout | null>(null);

  const updateProgress = useCallback((newProgress: ProgressState) => {
    if (!currentUser) return;
    const completedCount = Object.values(newProgress.completedTopics || {}).filter(Boolean).length;
    const checksCount = Object.values(newProgress.chapterCheckboxes || {}).filter(Boolean).length;
    const newXp = (completedCount * 10) + (checksCount * 50);

    const updatedUser: UserProfile = { ...currentUser, progress: newProgress, xp: newXp, lastActive: Date.now() };
    setCurrentUser(updatedUser);
    localStorage.setItem(`hsc-user-${currentUser.username}`, JSON.stringify(updatedUser));

    if (syncDebounce.current) clearTimeout(syncDebounce.current);
    syncDebounce.current = setTimeout(async () => {
      if (cloudSync.isAvailable()) {
        setIsSyncing(true);
        await cloudSync.saveUser(updatedUser);
        setIsSyncing(false);
        await checkCloudHealth();
      }
    }, 2000);
  }, [currentUser]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoading(true);
    const u = usernameInput.trim().toLowerCase();
    const p = passwordInput.trim();
    if (!u || !p) { setAuthError('Missing ID or Key'); setIsLoading(false); return; }

    try {
      const health = await checkCloudHealth();
      if (!health.ok) { setAuthError(health.message); setIsLoading(false); return; }

      if (isSignup) {
        const existing = await cloudSync.getUser(u);
        if (existing) { setAuthError('Alias already registered'); setIsLoading(false); return; }
        const newUser: UserProfile = { 
          username: u, password: p, xp: 0, 
          progress: { completedTopics: {}, chapterCheckboxes: {} }, 
          lastActive: Date.now(), followedUsers: [] 
        };
        const res = await cloudSync.saveUser(newUser);
        if (!res.success) throw new Error(res.error);
        setCurrentUser(newUser);
      } else {
        const target = await cloudSync.getUser(u);
        if (!target) { setAuthError('Cadet not found'); setIsLoading(false); return; }
        if (target.password !== p) { setAuthError('Access Denied'); setIsLoading(false); return; }
        setCurrentUser(target);
      }
      localStorage.setItem('hsc-elite-session', u);
    } catch (err: any) {
      setAuthError(err.message || 'System error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('hsc-elite-session');
    setCurrentUser(null);
    window.location.reload();
  };

  if (isBooting) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center">
         <Zap className="text-indigo-600 fill-indigo-600 animate-bounce" size={64} />
         <p className="mt-8 text-indigo-400 font-black text-[10px] uppercase tracking-[0.5em] animate-pulse">Syncing Protocols...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-10">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] mx-auto flex items-center justify-center shadow-2xl rotate-6 border border-white/10">
              <Zap className="text-white fill-white" size={40} />
            </div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter">HSC ELITE</h1>
            <p className="text-slate-400 font-black text-[9px] uppercase tracking-[0.4em]">Multi-Device Access</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-[3rem] p-10 border border-white/10 shadow-3xl">
            <form onSubmit={handleAuth} className="space-y-6">
               <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Alias</label>
                  <input type="text" value={usernameInput} onChange={e => setUsernameInput(e.target.value)} placeholder="Username..." className="w-full p-5 rounded-2xl bg-white/5 border-2 border-white/10 focus:border-indigo-500 outline-none font-bold text-white transition-all" />
               </div>
               <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Key</label>
                  <input type="password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} placeholder="••••••" className="w-full p-5 rounded-2xl bg-white/5 border-2 border-white/10 focus:border-indigo-500 outline-none font-bold text-white transition-all" />
               </div>
               {authError && <p className="text-center text-red-400 text-[10px] font-black uppercase tracking-tight bg-red-500/10 p-4 rounded-xl border border-red-500/20">{authError}</p>}
               <button type="submit" disabled={isLoading} className="w-full py-6 bg-indigo-600 text-white font-black rounded-2xl uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2">
                 {isLoading ? <Loader2 size={18} className="animate-spin" /> : (isSignup ? 'Register' : 'Login')}
               </button>
            </form>
            <button onClick={() => setIsSignup(!isSignup)} className="w-full mt-8 text-indigo-400 font-black text-[10px] uppercase tracking-widest text-center hover:opacity-70 transition-all">
              {isSignup ? 'Switch to Login' : 'Create New Alias'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#F8FAFC] flex flex-col pb-28">
      <header className="p-8 pb-4 flex justify-between items-center">
         <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tighter">HSC ELITE</h1>
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border mt-2 ${cloudStatus.ok ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
              {cloudStatus.ok ? <Wifi size={10} className="text-green-500" /> : <WifiOff size={10} className="text-red-500" />}
              <span className={`text-[8px] font-black uppercase tracking-widest ${cloudStatus.ok ? 'text-green-600' : 'text-red-600'}`}>
                {cloudStatus.ok ? 'Cloud Linked' : 'Sync Offline'}
              </span>
            </div>
         </div>
         <button onClick={handleLogout} className="w-12 h-12 bg-white shadow-xl rounded-2xl flex items-center justify-center text-red-500 active:scale-90 transition-all"><LogOut size={20} /></button>
      </header>

      <main className="flex-1 overflow-x-hidden">
        {activeTab === 'dashboard' && stats && (
          <div className="p-6 space-y-8 animate-in fade-in duration-700">
            <div className="bg-indigo-600 rounded-[3rem] p-8 text-white shadow-3xl relative overflow-hidden">
               <div className="flex items-center gap-6 mb-8 relative z-10">
                  <div className="text-7xl animate-float">{stats.currentLevel.emoji}</div>
                  <div>
                     <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">{stats.currentLevel.name}</h2>
                     <p className="text-indigo-200 text-[11px] font-black uppercase tracking-[0.3em] mt-1">Lvl {stats.currentLevel.level} • {stats.xp.toLocaleString()} XP</p>
                  </div>
               </div>
               <div className="bg-white/10 p-6 rounded-[2rem] space-y-4 border border-white/10 backdrop-blur-sm">
                  <ProgressBar progress={stats.progressToNext} color="bg-indigo-400" className="h-3" />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
               <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl">
                  <Target className="text-red-500 mb-4" size={28} />
                  <span className="text-4xl font-black text-slate-800 tracking-tighter">{Math.round(stats.percent)}%</span>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Mastery</p>
               </div>
               <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl">
                  <Sparkles className="text-green-500 mb-4" size={28} />
                  <span className="text-4xl font-black text-slate-800 tracking-tighter">{stats.xp}</span>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Experience</p>
               </div>
            </div>

            <div className="space-y-5">
               <h3 className="font-black text-slate-800 text-[11px] uppercase tracking-[0.3em] px-4">Study Tracks</h3>
               <div className="space-y-4">
                  {Object.entries(stats.subjectDetails).map(([name, d]: [string, any]) => (
                     <div key={name} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 active:scale-95 transition-all cursor-pointer" onClick={() => { setSelectedSubject(name); setActiveTab('subjects'); }}>
                        <div className="flex justify-between items-center mb-5">
                           <span className="font-black text-base text-slate-700 uppercase">{name}</span>
                           <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-2xl">{Math.round(d.percent)}%</span>
                        </div>
                        <ProgressBar progress={d.percent} color="bg-indigo-600" />
                     </div>
                  ))}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'subjects' && (selectedSubject ? (
          <div className="p-6 pb-32 space-y-5 animate-in slide-in-from-right duration-500">
             <button onClick={() => setSelectedSubject(null)} className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest bg-indigo-50 px-6 py-3 rounded-2xl mb-4"><ChevronLeft size={16} /> Back</button>
             {Object.keys(INITIAL_SUBJECTS[selectedSubject].chapters).map(chap => {
               const topics = INITIAL_SUBJECTS[selectedSubject].chapters[chap];
               const done = topics.filter(t => currentUser.progress.completedTopics[`${selectedSubject}-${chap}-${t}`]).length;
               const p = (done / topics.length) * 100;
               const expanded = selectedChapter === chap;
               return (
                 <div key={chap} className={`bg-white rounded-[3rem] border transition-all ${expanded ? 'border-indigo-400 shadow-2xl scale-[1.02]' : 'border-slate-100 shadow-lg'}`}>
                   <div onClick={() => setSelectedChapter(expanded ? null : chap)} className="p-7 cursor-pointer">
                      <div className="flex justify-between items-start mb-6">
                         <h4 className="font-black text-slate-700 text-sm uppercase leading-tight flex-1 mr-4">{chap}</h4>
                         <span className="bg-indigo-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full">{Math.round(p)}%</span>
                      </div>
                      <ProgressBar progress={p} color={p === 100 ? 'bg-green-500' : 'bg-indigo-600'} />
                   </div>
                   {expanded && (
                     <div className="p-8 bg-slate-50 border-t border-slate-100 space-y-6 animate-in fade-in">
                        <div className="grid grid-cols-2 gap-3">
                           {Object.values(PrepType).map(type => (
                             <button key={type} onClick={() => {
                               const key = `${selectedSubject}-${chap}-${type}`;
                               const chapterCheckboxes = { ...currentUser.progress.chapterCheckboxes };
                               chapterCheckboxes[key] = !chapterCheckboxes[key];
                               updateProgress({ ...currentUser.progress, chapterCheckboxes });
                             }} className={`py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all ${currentUser.progress.chapterCheckboxes[`${selectedSubject}-${chap}-${type}`] ? 'bg-indigo-600 border-indigo-700 text-white' : 'bg-white text-slate-400'}`}>
                                {type.split('-')[1]}
                             </button>
                           ))}
                        </div>
                        <div className="space-y-3">
                           {topics.map(t => (
                             <div key={t} className="flex items-center justify-between bg-white p-5 rounded-[2rem] border border-slate-100">
                                <button onClick={() => {
                                  const key = `${selectedSubject}-${chap}-${t}`;
                                  const completedTopics = { ...currentUser.progress.completedTopics };
                                  completedTopics[key] = !completedTopics[key];
                                  updateProgress({ ...currentUser.progress, completedTopics });
                                }} className="flex items-center gap-4 flex-1">
                                   {currentUser.progress.completedTopics[`${selectedSubject}-${chap}-${t}`] ? <CheckCircle2 className="text-green-500" size={24} /> : <Circle className="text-slate-200" size={24} />}
                                   <span className={`text-xs font-bold uppercase tracking-tight ${currentUser.progress.completedTopics[`${selectedSubject}-${chap}-${t}`] ? 'text-slate-300 line-through' : 'text-slate-600'}`}>{t}</span>
                                </button>
                                <button onClick={() => {
                                  setAkiModal({ open: true, title: t, content: '', loading: true });
                                  getTopicExplanation(selectedSubject!, chap, t).then(res => setAkiModal(p => ({ ...p, content: res, loading: false })));
                                }} className="w-12 h-12 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-2xl"><Sparkles size={20} /></button>
                             </div>
                           ))}
                        </div>
                     </div>
                   )}
                 </div>
               );
             })}
          </div>
        ) : (
          <div className="p-6 space-y-6 animate-in fade-in">
            <h2 className="text-4xl font-black text-slate-800 uppercase tracking-tighter">Pathways</h2>
            <div className="grid gap-5">
               {Object.keys(INITIAL_SUBJECTS).map(n => (
                 <div key={n} onClick={() => setSelectedSubject(n)} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl flex items-center justify-between group cursor-pointer hover:border-indigo-400 transition-all">
                    <div className="flex items-center gap-6">
                       <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all"><BookOpen size={32} /></div>
                       <h4 className="font-black text-lg text-slate-800 uppercase">{n}</h4>
                    </div>
                    <ChevronRight className="text-slate-300" size={32} />
                 </div>
               ))}
            </div>
          </div>
        ))}
        {/* Placeholder for future expansion */}
        {(activeTab === 'leaderboard' || activeTab === 'aki') && (
           <div className="p-20 text-center space-y-4">
              <Globe className="mx-auto text-indigo-200" size={80} />
              <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em]">Module under maintenance</p>
           </div>
        )}
      </main>

      <nav className="fixed bottom-8 left-8 right-8 max-w-md mx-auto bg-white/90 backdrop-blur-xl border border-white shadow-2xl rounded-[3rem] px-10 py-6 z-[90] flex justify-between items-center">
        <NavBtn active={activeTab === 'dashboard'} icon={<LayoutDashboard size={28} />} onClick={() => setActiveTab('dashboard')} />
        <NavBtn active={activeTab === 'subjects'} icon={<BookOpen size={28} />} onClick={() => setActiveTab('subjects')} />
        <NavBtn active={activeTab === 'leaderboard'} icon={<Globe size={28} />} onClick={() => setActiveTab('leaderboard')} />
        <NavBtn active={activeTab === 'aki'} icon={<Sparkles size={28} />} onClick={() => setActiveTab('aki')} />
      </nav>

      <AKIModal isOpen={akiModal.open} onClose={() => setAkiModal(prev => ({ ...prev, open: false }))} title={akiModal.title} content={akiModal.content} loading={akiModal.loading} />
    </div>
  );
};

const NavBtn: React.FC<{ active: boolean; icon: React.ReactNode; onClick: () => void }> = ({ active, icon, onClick }) => (
  <button onClick={onClick} className={`p-3 rounded-2xl transition-all ${active ? 'text-indigo-600 scale-125 bg-indigo-50' : 'text-slate-300'}`}>{icon}</button>
);

export default App;
