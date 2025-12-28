
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
  BrainCircuit, 
  Award,
  Zap,
  Star,
  ChevronLeft,
  Loader2,
  X,
  UserPlus,
  LogOut,
  Users,
  Sparkles,
  Globe,
  Share2,
  QrCode,
  Link2,
  CloudSync,
  ShieldCheck,
  RefreshCcw
} from 'lucide-react';
import { getTopicExplanation } from './geminiService';
import { cloudSync } from './databaseService';

// --- Helper Components ---

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
      <div className="bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] w-full max-w-lg h-[90vh] sm:h-auto max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
        <div className="p-5 border-b flex justify-between items-center bg-indigo-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
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
              <div className="relative">
                <Loader2 className="w-14 h-14 text-indigo-500 animate-spin" />
                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-300 w-6 h-6" />
              </div>
              <p className="text-slate-400 animate-pulse font-black text-[10px] uppercase tracking-[0.2em]">Processing Mastery...</p>
            </div>
          ) : (
            <div className="prose prose-sm prose-indigo max-w-none text-slate-800 font-science">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          )}
        </div>
        <div className="p-6 bg-slate-50 border-t flex justify-center safe-bottom">
          <button 
            onClick={onClose}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-100 active:scale-95 transition-all"
          >
            I Mastered This
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
  const [isLevelsModalOpen, setIsLevelsModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Auth state
  const [isSignup, setIsSignup] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // AKI Assistant State
  const [akiModal, setAkiModal] = useState<{ open: boolean; title: string; content: string; loading: boolean }>({
    open: false,
    title: '',
    content: '',
    loading: false
  });

  // --- Session Management ---
  useEffect(() => {
    const restoreSession = async () => {
      const savedAlias = localStorage.getItem('hsc-elite-session');
      if (savedAlias) {
        // Load local fallback first
        const localData = localStorage.getItem(`hsc-user-${savedAlias}`);
        if (localData) {
          setCurrentUser(JSON.parse(localData));
        }

        // Immediately try to sync from cloud
        if (cloudSync.isAvailable()) {
          const cloudUser = await cloudSync.getUser(savedAlias);
          if (cloudUser) {
            setCurrentUser(cloudUser);
            localStorage.setItem(`hsc-user-${savedAlias}`, JSON.stringify(cloudUser));
          }
        }
      }
      // Brief delay to ensure splash screen looks intentional
      setTimeout(() => setIsBooting(false), 800);
    };
    restoreSession();
  }, []);

  const handleExplain = async (sub: string, chap: string, topic: string) => {
    setAkiModal({ open: true, title: topic, content: '', loading: true });
    try {
      const explanation = await getTopicExplanation(sub, chap, topic);
      setAkiModal({ open: true, title: topic, content: explanation, loading: false });
    } catch (error) {
      setAkiModal({ 
        open: true, 
        title: topic, 
        content: "Satellite connection interrupted. AKI could not process the request.", 
        loading: false 
      });
    }
  };

  const syncDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const performCloudSync = useCallback(async (user: UserProfile) => {
    if (!cloudSync.isAvailable()) return;
    setIsSyncing(true);
    try {
      await cloudSync.saveUser(user);
    } catch (e) {
      console.warn("Cloud sync failed, will retry on next change.");
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const updateProgress = useCallback((newProgress: ProgressState) => {
    if (!currentUser) return;
    const completedTopicsCount = Object.values(newProgress.completedTopics || {}).filter(Boolean).length;
    const checksCount = Object.values(newProgress.chapterCheckboxes || {}).filter(Boolean).length;
    const newXp = (completedTopicsCount * 10) + (checksCount * 50);

    const updatedUser: UserProfile = { ...currentUser, progress: newProgress, xp: newXp, lastActive: Date.now() };
    
    setCurrentUser(updatedUser);
    localStorage.setItem(`hsc-user-${currentUser.username}`, JSON.stringify(updatedUser));

    if (syncDebounceRef.current) clearTimeout(syncDebounceRef.current);
    syncDebounceRef.current = setTimeout(() => {
      performCloudSync(updatedUser);
    }, 1500);
  }, [currentUser, performCloudSync]);

  const toggleTopic = (sub: string, chap: string, topic: string) => {
    if (!currentUser) return;
    const key = `${sub}-${chap}-${topic}`;
    const completedTopics = { ...currentUser.progress.completedTopics };
    completedTopics[key] = !completedTopics[key];
    updateProgress({ ...currentUser.progress, completedTopics });
  };

  const toggleCheck = (sub: string, chap: string, type: string) => {
    if (!currentUser) return;
    const key = `${sub}-${chap}-${type}`;
    const chapterCheckboxes = { ...currentUser.progress.chapterCheckboxes };
    chapterCheckboxes[key] = !chapterCheckboxes[key];
    updateProgress({ ...currentUser.progress, chapterCheckboxes });
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoading(true);
    
    const u = usernameInput.trim().toLowerCase();
    const p = passwordInput.trim();
    if (!u || !p) { setAuthError('Credentials Missing'); setIsLoading(false); return; }

    try {
      if (isSignup) {
        const cloudUser = await cloudSync.getUser(u);
        if (cloudUser) { setAuthError('Alias already taken'); setIsLoading(false); return; }

        const newUser: UserProfile = { 
          username: u, 
          password: p, 
          xp: 0, 
          progress: { completedTopics: {}, chapterCheckboxes: {} }, 
          lastActive: Date.now(), 
          followedUsers: [] 
        };

        await cloudSync.saveUser(newUser);
        localStorage.setItem(`hsc-user-${u}`, JSON.stringify(newUser));
        localStorage.setItem('hsc-elite-session', u);
        setCurrentUser(newUser);
      } else {
        let targetUser = await cloudSync.getUser(u);
        if (!targetUser) {
          const localData = localStorage.getItem(`hsc-user-${u}`);
          if (localData) targetUser = JSON.parse(localData);
        }

        if (!targetUser) { setAuthError('No cadet found'); setIsLoading(false); return; }
        if (targetUser.password !== p) { setAuthError('Access Denied'); setIsLoading(false); return; }

        localStorage.setItem(`hsc-user-${u}`, JSON.stringify(targetUser));
        localStorage.setItem('hsc-elite-session', u);
        setCurrentUser(targetUser);
      }
    } catch (err) {
      setAuthError('Connection Failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('hsc-elite-session');
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  const stats = useMemo(() => {
    if (!currentUser) return null;
    let totalTopicsCount = 0;
    let completedTopicsCount = 0;
    const subjectDetails: any = {};

    Object.entries(INITIAL_SUBJECTS).forEach(([name, sub]) => {
      let subTotal = 0;
      let subDone = 0;
      Object.entries(sub.chapters || {}).forEach(([chapName, topics]) => {
        subTotal += topics.length;
        totalTopicsCount += topics.length;
        topics.forEach(t => {
          if (currentUser.progress?.completedTopics?.[`${name}-${chapName}-${t}`]) {
            subDone++;
            completedTopicsCount++;
          }
        });
      });
      subjectDetails[name] = { total: subTotal, done: subDone, percent: subTotal > 0 ? (subDone / subTotal) * 100 : 0 };
    });

    const currentLevel = LEVELS.find(l => currentUser.xp >= l.min && currentUser.xp <= l.max) || LEVELS[0];
    const nextLevel = LEVELS[LEVELS.indexOf(currentLevel) + 1] || null;
    const progressToNext = nextLevel ? ((currentUser.xp - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100 : 100;

    return { totalTopics: totalTopicsCount, completedTopics: completedTopicsCount, percent: totalTopicsCount > 0 ? (completedTopicsCount / totalTopicsCount) * 100 : 0, xp: currentUser.xp, currentLevel, nextLevel, progressToNext, subjectDetails };
  }, [currentUser]);

  // Booting Splash Screen
  if (isBooting) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center">
         <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center animate-bounce shadow-2xl shadow-indigo-500/50">
           <Zap className="text-white fill-white" size={40} />
         </div>
         <p className="mt-8 text-indigo-400 font-black text-[10px] uppercase tracking-[0.5em] animate-pulse">Syncing Protocols...</p>
      </div>
    );
  }

  // Auth Screen
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
           <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500 rounded-full blur-[120px]" />
           <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[120px]" />
        </div>
        <div className="w-full max-w-sm space-y-12 relative z-10">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] mx-auto flex items-center justify-center shadow-3xl shadow-indigo-500/50 rotate-6 border-4 border-white/10">
              <Zap className="text-white fill-white" size={40} />
            </div>
            <div className="space-y-1">
              <h1 className="text-4xl font-black text-white uppercase tracking-tighter">HSC ELITE</h1>
              <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.4em]">Multi-Device Access</p>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-[3rem] p-10 shadow-2xl border border-white/10">
            <form onSubmit={handleAuth} className="space-y-5">
               <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Cadet Alias</label>
                  <input type="text" value={usernameInput} onChange={e => setUsernameInput(e.target.value)} placeholder="Enter ID..." className="w-full p-5 rounded-2xl bg-white/5 border-2 border-white/5 focus:border-indigo-500 outline-none font-bold text-sm text-white transition-all" />
               </div>
               <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Security Key</label>
                  <input type="password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} placeholder="••••••••" className="w-full p-5 rounded-2xl bg-white/5 border-2 border-white/5 focus:border-indigo-500 outline-none font-bold text-sm text-white transition-all" />
               </div>
               {authError && <p className="text-center text-red-400 text-[10px] font-black uppercase bg-red-500/10 py-3 rounded-xl">{authError}</p>}
               <button type="submit" disabled={isLoading} className="w-full py-6 bg-indigo-600 text-white font-black rounded-2xl uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all mt-4 flex items-center justify-center gap-2">
                 {isLoading ? <Loader2 size={18} className="animate-spin" /> : (isSignup ? 'Create Account' : 'Authenticate')}
               </button>
            </form>
            <button onClick={() => setIsSignup(!isSignup)} className="w-full mt-8 text-indigo-400 font-black text-[10px] uppercase tracking-widest text-center hover:opacity-70">
              {isSignup ? 'Existing Cadet? Login' : 'New Cadet? Register'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col bg-[#F8FAFC] select-none pb-28 font-sans overflow-x-hidden">
      <header className="p-8 pb-4 flex items-center justify-between">
         <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-black text-slate-800 tracking-tighter">HSC ELITE</h1>
              <Zap className={`text-indigo-600 fill-indigo-600 ${isSyncing ? 'animate-pulse' : ''}`} size={22} />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-indigo-400 text-[11px] font-black uppercase tracking-[0.4em]">Active</p>
              {cloudSync.isAvailable() && (
                <div className="flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                   <CloudSync size={10} className="text-green-500" />
                   <span className="text-[7px] font-black text-green-600 uppercase">Synced</span>
                </div>
              )}
            </div>
         </div>
         <div className="flex gap-2">
            <button onClick={() => setIsLevelsModalOpen(true)} className="w-12 h-12 bg-white shadow-xl shadow-slate-200/50 border border-slate-100 rounded-2xl flex items-center justify-center text-indigo-600 active:scale-90 transition-all"><Trophy size={20} /></button>
            <button onClick={handleLogout} className="w-12 h-12 bg-white shadow-xl shadow-slate-200/50 border border-slate-100 rounded-2xl flex items-center justify-center text-red-500 active:scale-90 transition-all"><LogOut size={20} /></button>
         </div>
      </header>

      <main className="flex-1 overflow-x-hidden">
        {activeTab === 'dashboard' && (
          <div className="p-6 space-y-8 animate-in fade-in duration-700">
            <div className="bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-900 rounded-[3rem] p-8 text-white shadow-3xl relative overflow-hidden">
               <div className="flex items-center gap-6 mb-8 relative z-10">
                  <div className="text-7xl animate-float">{stats?.currentLevel.emoji}</div>
                  <div className="space-y-1">
                     <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">{stats?.currentLevel.name}</h2>
                     <p className="text-indigo-200/80 text-[11px] font-black uppercase tracking-[0.3em]">Grade {stats?.currentLevel.level} • {stats?.xp.toLocaleString()} XP</p>
                  </div>
               </div>
               <div className="bg-white/10 p-6 rounded-[2rem] space-y-4 backdrop-blur-xl border border-white/10">
                  <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                     <span className="text-white">To {stats?.nextLevel?.name || 'MAX'}</span>
                     <span className="text-indigo-100">{Math.round(stats?.progressToNext || 0)}%</span>
                  </div>
                  <ProgressBar progress={stats?.progressToNext || 0} color="bg-indigo-400" className="h-3" />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
               <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/50">
                  <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4"><Target size={28} /></div>
                  <span className="text-4xl font-black text-slate-800 tracking-tighter">{Math.round(stats?.percent || 0)}%</span>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Mastery</p>
               </div>
               <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/50">
                  <div className="w-12 h-12 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center mb-4"><Users size={28} /></div>
                  <span className="text-4xl font-black text-slate-800 tracking-tighter">{(currentUser.followedUsers || []).length}</span>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Circle</p>
               </div>
            </div>

            <div className="space-y-5">
               <h3 className="font-black text-slate-800 text-[11px] uppercase tracking-[0.3em] px-4">Priority Subjects</h3>
               <div className="space-y-4">
                  {Object.entries(stats?.subjectDetails || {}).slice(0, 3).map(([name, d]: [string, any]) => (
                     <div key={name} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm transition-all cursor-pointer" onClick={() => { setSelectedSubject(name); setActiveTab('subjects'); }}>
                        <div className="flex justify-between items-center mb-5">
                           <span className="font-black text-base text-slate-700 uppercase tracking-tight">{name}</span>
                           <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-2xl border border-indigo-100">{Math.round(d.percent)}%</span>
                        </div>
                        <ProgressBar progress={d.percent} color="bg-indigo-600" className="h-2.5" />
                     </div>
                  ))}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'subjects' && (selectedSubject ? (
          <div className="animate-in slide-in-from-right-12 duration-500">
            <div className="p-6 bg-white border-b border-slate-100 sticky top-0 z-40 flex items-center justify-between backdrop-blur-xl bg-white/90">
              <button onClick={() => setSelectedSubject(null)} className="text-indigo-600 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 bg-indigo-50 px-6 py-3 rounded-2xl active:scale-90 transition-all shadow-sm border border-indigo-100"><ChevronLeft size={18} /> Back</button>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">{selectedSubject}</h3>
              <div className="w-20"></div>
            </div>
            <div className="p-6 space-y-5 pb-32">
              {Object.keys(INITIAL_SUBJECTS[selectedSubject].chapters).map(chapName => {
                const topics = INITIAL_SUBJECTS[selectedSubject].chapters[chapName];
                const doneCount = topics.filter(t => currentUser.progress.completedTopics[`${selectedSubject}-${chapName}-${t}`]).length;
                const p = topics.length > 0 ? (doneCount / topics.length) * 100 : 0;
                const isExpanded = selectedChapter === chapName;

                return (
                  <div key={chapName} className={`bg-white rounded-[3rem] border transition-all duration-300 ${isExpanded ? 'border-indigo-400 shadow-2xl scale-[1.02]' : 'border-slate-100 shadow-lg shadow-slate-200/50'}`}>
                    <div onClick={() => setSelectedChapter(isExpanded ? null : chapName)} className="p-7 flex flex-col cursor-pointer">
                        <div className="flex justify-between items-start mb-6">
                           <h4 className="font-black text-slate-700 text-sm uppercase tracking-tight flex-1 mr-6 leading-tight">{chapName}</h4>
                           <span className="text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest bg-indigo-600 text-white">{Math.round(p)}%</span>
                        </div>
                        <ProgressBar progress={p} color={p === 100 ? 'bg-green-500' : 'bg-indigo-600'} className="h-3" />
                    </div>
                    {isExpanded && (
                       <div className="p-8 bg-slate-50/50 border-t border-slate-100 space-y-8 animate-in fade-in duration-500">
                          <div className="grid grid-cols-2 gap-3">
                             {Object.values(PrepType).map(type => (
                               <button key={type} onClick={() => toggleCheck(selectedSubject!, chapName, type)} className={`py-4 px-2 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all ${currentUser.progress.chapterCheckboxes[`${selectedSubject}-${chapName}-${type}`] ? 'bg-indigo-600 border-indigo-700 text-white shadow-xl' : 'bg-white border-slate-200 text-slate-400'}`}>
                                  {type.replace('-', ' ')}
                               </button>
                             ))}
                          </div>
                          <div className="space-y-3 pt-6 border-t border-slate-200/50">
                             {topics.map(t => (
                               <div key={t} className="flex items-center justify-between bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm">
                                  <button onClick={() => toggleTopic(selectedSubject!, chapName, t)} className="flex items-center gap-4 flex-1 text-left">
                                     {currentUser.progress.completedTopics[`${selectedSubject}-${chapName}-${t}`] ? <CheckCircle2 className="text-green-500" size={24} /> : <Circle className="text-slate-200" size={24} />}
                                     <span className={`text-xs font-bold uppercase tracking-tight ${currentUser.progress.completedTopics[`${selectedSubject}-${chapName}-${t}`] ? 'text-slate-300 line-through' : 'text-slate-600'}`}>{t}</span>
                                  </button>
                                  <button onClick={() => handleExplain(selectedSubject!, chapName, t)} className="w-12 h-12 flex items-center justify-center text-indigo-600 bg-indigo-50 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all"><Sparkles size={20} /></button>
                               </div>
                             ))}
                          </div>
                       </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-6 animate-in fade-in duration-500">
            <h2 className="text-4xl font-black text-slate-800 uppercase tracking-tighter px-2">Pathways</h2>
            <div className="grid grid-cols-1 gap-5">
               {Object.keys(INITIAL_SUBJECTS).map(n => (
                 <div key={n} onClick={() => setSelectedSubject(n)} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl flex items-center justify-between group cursor-pointer hover:border-indigo-400 transition-all">
                    <div className="flex items-center gap-6">
                       <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner border border-indigo-100"><BookOpen size={32} /></div>
                       <div className="space-y-1">
                          <h4 className="font-black text-lg text-slate-800 uppercase tracking-tight transition-colors">{n}</h4>
                          <p className="text-[11px] text-indigo-500 font-black uppercase tracking-widest">{Math.round(stats?.subjectDetails[n].percent)}% Mastery</p>
                       </div>
                    </div>
                    <ChevronRight size={32} className="text-slate-300 transition-all" />
                 </div>
               ))}
            </div>
          </div>
        ))}

        {activeTab === 'leaderboard' && (
           <div className="p-8 text-center space-y-4 animate-in fade-in duration-500">
              <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-[2.5rem] mx-auto flex items-center justify-center mb-6">
                 <Globe size={48} />
              </div>
              <h2 className="text-4xl font-black text-slate-800 uppercase tracking-tighter">Global Ranking</h2>
              <p className="text-slate-500 text-sm font-medium">Coming soon: Compete with other HSC cadets across the nation.</p>
           </div>
        )}

        {activeTab === 'aki' && (
           <div className="p-8 text-center space-y-4 animate-in fade-in duration-500">
              <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-[2.5rem] mx-auto flex items-center justify-center mb-6">
                 <Sparkles size={48} />
              </div>
              <h2 className="text-4xl font-black text-slate-800 uppercase tracking-tighter">AKI Assistant</h2>
              <p className="text-slate-500 text-sm font-medium">AKI is available for any specific topic inside your subject pathways.</p>
           </div>
        )}
      </main>

      <nav className="fixed bottom-8 left-8 right-8 max-w-md mx-auto bg-white/80 backdrop-blur-3xl border border-white/50 shadow-2xl rounded-[3rem] px-10 py-6 z-[90] flex justify-between items-center ring-1 ring-black/5">
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
  <button onClick={onClick} className={`p-3 rounded-2xl transition-all duration-500 ${active ? 'text-indigo-600 scale-125 bg-indigo-50' : 'text-slate-300'}`}>{icon}</button>
);

export default App;
