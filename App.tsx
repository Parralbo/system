
import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  Link2
} from 'lucide-react';
import { getTopicExplanation } from './geminiService';

// --- Utility: Safe Unicode Base64 ---
const toBase64 = (obj: any) => {
  const str = JSON.stringify(obj);
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => 
    String.fromCharCode(parseInt(p1, 16))
  ));
};

const fromBase64 = (str: string) => {
  try {
    const decoded = atob(str).split('').map(c => 
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join('');
    return JSON.parse(decodeURIComponent(decoded));
  } catch (e) {
    return null;
  }
};

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

const ProfileViewer: React.FC<{ 
  user: UserProfile | null; 
  isOpen: boolean; 
  onClose: () => void 
}> = ({ user, isOpen, onClose }) => {
  if (!isOpen || !user) return null;

  const subDetails = Object.entries(INITIAL_SUBJECTS).map(([name, sub]) => {
    let subTotal = 0;
    let subDone = 0;
    Object.entries(sub.chapters).forEach(([chapName, topics]) => {
      subTotal += topics.length;
      topics.forEach(t => {
        if (user.progress.completedTopics[`${name}-${chapName}-${t}`]) subDone++;
      });
    });
    return { name, percent: subTotal > 0 ? (subDone / subTotal) * 100 : 0 };
  });

  const currentLevel = LEVELS.find(l => user.xp >= l.min && user.xp <= l.max) || LEVELS[0];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-white rounded-[3rem] w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 bg-gradient-to-br from-indigo-700 to-blue-900 text-white flex justify-between items-start relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12"><Trophy size={120} /></div>
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center text-4xl shadow-inner backdrop-blur-md border border-white/10">
              {currentLevel.emoji}
            </div>
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tighter leading-tight">{user.username}</h3>
              <p className="text-indigo-200 text-[10px] font-black uppercase tracking-[0.2em]">{currentLevel.name} • {user.xp.toLocaleString()} XP</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-2xl transition-colors relative z-10">
            <X size={24} />
          </button>
        </div>
        <div className="p-8 overflow-y-auto flex-1 space-y-8">
          <div className="space-y-4">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-1">Curriculum Mastery</h4>
             <div className="grid grid-cols-1 gap-4">
               {subDetails.map(sub => (
                 <div key={sub.name} className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100">
                    <div className="flex justify-between items-center mb-3">
                       <span className="text-[11px] font-black text-slate-600 uppercase tracking-tight">{sub.name}</span>
                       <span className="text-xs font-black text-indigo-600 bg-white px-3 py-1 rounded-full border border-indigo-50 shadow-sm">{Math.round(sub.percent)}%</span>
                    </div>
                    <ProgressBar progress={sub.percent} color="bg-indigo-500" className="h-2" />
                 </div>
               ))}
             </div>
          </div>
          <div className="p-5 bg-indigo-50/50 rounded-3xl border border-indigo-100 text-center">
             <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest leading-relaxed">
               Last Synchronized: {new Date(user.lastActive).toLocaleDateString()}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const SyncModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void;
  user: UserProfile | null;
  onImport: (data: string) => void;
  onFollow: (data: string) => void;
}> = ({ isOpen, onClose, user, onImport, onFollow }) => {
  const [keyInput, setKeyInput] = useState('');
  const [activeTab, setActiveTab] = useState<'qr' | 'link' | 'paste'>('link');

  const profileData = useMemo(() => {
    if (!user) return "";
    const shareable = { ...user, password: undefined, followedUsers: undefined };
    return toBase64(shareable);
  }, [user]);

  const shareLink = useMemo(() => {
    const base = window.location.origin + window.location.pathname;
    return `${base}#follow=${profileData}`;
  }, [profileData]);

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shareLink)}&bgcolor=ffffff&color=4f46e5&margin=15`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="bg-white rounded-[3rem] w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 bg-indigo-600 text-white flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
               <Globe className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tighter">Student Hub</h3>
              <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest">Connect & Sync</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-2xl transition-all">
            <X size={28} />
          </button>
        </div>

        <div className="flex bg-slate-100 p-1.5 mx-8 mt-8 rounded-[2rem] border border-slate-200">
          <button onClick={() => setActiveTab('link')} className={`flex-1 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'link' ? 'bg-white text-indigo-600 shadow-xl' : 'text-slate-400'}`}>Share Link</button>
          <button onClick={() => setActiveTab('qr')} className={`flex-1 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'qr' ? 'bg-white text-indigo-600 shadow-xl' : 'text-slate-400'}`}>Scan ID</button>
          <button onClick={() => setActiveTab('paste')} className={`flex-1 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'paste' ? 'bg-white text-indigo-600 shadow-xl' : 'text-slate-400'}`}>Paster</button>
        </div>

        <div className="p-10 overflow-y-auto flex-1 flex flex-col items-center justify-center text-center">
          {activeTab === 'link' && (
            <div className="space-y-8 w-full animate-in fade-in zoom-in-95">
              <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-[2.5rem] mx-auto flex items-center justify-center shadow-inner">
                 <Link2 size={48} />
              </div>
              <div className="space-y-3">
                <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight">Broadcast Profile</h4>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed px-6">
                  Sharing this link adds you to your friend's leaderboard. Your password is never shared.
                </p>
              </div>
              <button 
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: 'HSC Elite Profile', text: `Follow my HSC progress!`, url: shareLink });
                  } else {
                    navigator.clipboard.writeText(shareLink);
                    alert('Link copied to clipboard!');
                  }
                }}
                className="w-full py-6 bg-indigo-600 text-white rounded-[2.2rem] font-black uppercase tracking-widest text-xs shadow-2xl shadow-indigo-200 flex items-center justify-center gap-3 active:scale-95 transition-all"
              >
                <Share2 size={20} /> Copy Invite Link
              </button>
            </div>
          )}

          {activeTab === 'qr' && (
            <div className="space-y-8 w-full animate-in fade-in zoom-in-95">
              <div className="bg-white p-6 rounded-[3rem] border-8 border-indigo-50 shadow-2xl inline-block">
                 <img src={qrUrl} alt="QR Code" className="w-60 h-60 rounded-2xl" />
              </div>
              <div className="space-y-3">
                <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight">Personal ID</h4>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                  Ask a friend to scan this with their camera to follow you.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'paste' && (
            <div className="space-y-8 w-full animate-in fade-in zoom-in-95">
              <textarea 
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="Paste Follow-Link or Profile Key..."
                className="w-full h-40 p-6 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] text-xs font-mono focus:border-indigo-500 focus:bg-white outline-none transition-all shadow-inner"
              />
              <div className="grid grid-cols-2 gap-4">
                <button 
                  disabled={!keyInput}
                  onClick={() => { 
                    const data = keyInput.includes('follow=') ? keyInput.split('follow=')[1] : keyInput;
                    onFollow(data); 
                    setKeyInput(''); 
                  }}
                  className="py-5 bg-indigo-600 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-100 disabled:opacity-50 active:scale-95 transition-all"
                >
                  Follow Friend
                </button>
                <button 
                  disabled={!keyInput}
                  onClick={() => { 
                    const data = keyInput.includes('follow=') ? keyInput.split('follow=')[1] : keyInput;
                    onImport(data); 
                    setKeyInput(''); 
                  }}
                  className="py-5 bg-slate-800 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-100 disabled:opacity-50 active:scale-95 transition-all"
                >
                  Restore Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'subjects' | 'leaderboard' | 'aki'>('dashboard');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [isLevelsModalOpen, setIsLevelsModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState<UserProfile | null>(null);
  
  // Auth state
  const [isSignup, setIsSignup] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  // AKI Assistant State
  const [akiModal, setAkiModal] = useState<{ open: boolean; title: string; content: string; loading: boolean }>({
    open: false,
    title: '',
    content: '',
    loading: false
  });

  // Safe Follow Logic
  const processFollowLink = useCallback((data: string) => {
    try {
      const u = fromBase64(data) as UserProfile;
      if (!u) throw new Error("Invalid Data");

      const session = localStorage.getItem('hsc-elite-session');
      if (session) {
        const userData = localStorage.getItem(`hsc-user-${session}`);
        if (userData) {
          const current = JSON.parse(userData) as UserProfile;
          if (u.username !== current.username) {
            const follows = [...(current.followedUsers || [])];
            const idx = follows.findIndex(f => f.username === u.username);
            if (idx > -1) follows[idx] = u;
            else follows.push(u);
            
            const updated = { ...current, followedUsers: follows };
            localStorage.setItem(`hsc-user-${current.username}`, JSON.stringify(updated));
            setCurrentUser(updated);
            alert(`Automatically followed ${u.username}!`);
            window.location.hash = ''; 
          }
        }
      }
    } catch (e) {
      console.error("Link follow failed", e);
    }
  }, []);

  // URL Link Follow Detection
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#follow=')) {
      const data = hash.split('#follow=')[1];
      processFollowLink(data);
    }
  }, [processFollowLink]);

  // Load session
  useEffect(() => {
    const session = localStorage.getItem('hsc-elite-session');
    if (session) {
      const userData = localStorage.getItem(`hsc-user-${session}`);
      if (userData) {
        try { 
          setCurrentUser(JSON.parse(userData)); 
        } catch (e) { 
          localStorage.removeItem('hsc-elite-session'); 
        }
      }
    }
  }, []);

  // Progress Update
  const updateProgress = useCallback((newProgress: ProgressState) => {
    if (!currentUser) return;
    const completedTopicsCount = Object.values(newProgress.completedTopics || {}).filter(Boolean).length;
    const checksCount = Object.values(newProgress.chapterCheckboxes || {}).filter(Boolean).length;
    const newXp = (completedTopicsCount * 10) + (checksCount * 50);

    const updatedUser: UserProfile = { ...currentUser, progress: newProgress, xp: newXp, lastActive: Date.now() };
    setCurrentUser(updatedUser);
    localStorage.setItem(`hsc-user-${currentUser.username}`, JSON.stringify(updatedUser));
  }, [currentUser]);

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

  const handleExplain = async (subject: string, chapter: string, topic: string) => {
    setAkiModal({ open: true, title: topic, content: '', loading: true });
    try {
      const explanation = await getTopicExplanation(subject, chapter, topic);
      setAkiModal(prev => ({ ...prev, content: explanation, loading: false }));
    } catch (error) {
      setAkiModal(prev => ({ ...prev, content: "Internal connection error. Please verify your environment API key.", loading: false }));
    }
  };

  // Calculations
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

  // Auth
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const u = usernameInput.trim();
    const p = passwordInput.trim();
    if (!u || !p) { setAuthError('Fields Required'); return; }
    const key = `hsc-user-${u}`;
    const existing = localStorage.getItem(key);
    if (isSignup) {
      if (existing) { setAuthError('Account Exists'); return; }
      const user: UserProfile = { username: u, password: p, xp: 0, progress: { completedTopics: {}, chapterCheckboxes: {} }, lastActive: Date.now(), followedUsers: [] };
      localStorage.setItem(key, JSON.stringify(user));
      setCurrentUser(user);
      localStorage.setItem('hsc-elite-session', u);
    } else {
      if (!existing) { setAuthError('Account Not Found'); return; }
      const user: UserProfile = JSON.parse(existing);
      if (user.password !== p) { setAuthError('Incorrect Password'); return; }
      setCurrentUser(user);
      localStorage.setItem('hsc-elite-session', u);
    }
  };

  const handleImport = (data: string) => {
    try {
      const u = fromBase64(data) as UserProfile;
      if (!u) throw new Error("Corrupt Key");
      localStorage.setItem(`hsc-user-${u.username}`, JSON.stringify(u));
      localStorage.setItem('hsc-elite-session', u.username);
      setCurrentUser(u);
      setIsSyncModalOpen(false);
      alert('Account Successfully Restored!');
    } catch (e) { alert('Invalid or Corrupt Key'); }
  };

  const handleFollow = (data: string) => {
    try {
      const u = fromBase64(data) as UserProfile;
      if (!u || !currentUser) return;
      if (u.username === currentUser.username) { alert('Self-following is redundant.'); return; }
      const updatedFollows = [...(currentUser.followedUsers || [])];
      const existingIdx = updatedFollows.findIndex(f => f.username === u.username);
      if (existingIdx > -1) updatedFollows[existingIdx] = u;
      else updatedFollows.push(u);
      
      const updatedUser = { ...currentUser, followedUsers: updatedFollows };
      setCurrentUser(updatedUser);
      localStorage.setItem(`hsc-user-${currentUser.username}`, JSON.stringify(updatedUser));
      setIsSyncModalOpen(false);
      alert(`Synchronized with ${u.username}!`);
    } catch (e) { alert('Synchronization Data Corrupt'); }
  };

  const handleLogout = () => {
    localStorage.removeItem('hsc-elite-session');
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  // UI Renders
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-12">
          <div className="text-center space-y-4">
            <div className="w-24 h-24 bg-indigo-600 rounded-[2.5rem] mx-auto flex items-center justify-center shadow-3xl shadow-indigo-200 rotate-6 hover:rotate-0 transition-transform duration-500">
              <Zap className="text-white fill-white" size={48} />
            </div>
            <div className="space-y-1">
              <h1 className="text-4xl font-black text-slate-800 uppercase tracking-tighter">HSC ELITE</h1>
              <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.4em]">The Intelligence Layer</p>
            </div>
          </div>
          <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100/50">
            <form onSubmit={handleAuth} className="space-y-5">
               <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
                  <input type="text" value={usernameInput} onChange={e => setUsernameInput(e.target.value)} placeholder="Enter alias..." className="w-full p-5 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:border-indigo-500 focus:bg-white outline-none font-bold text-sm text-black transition-all" />
               </div>
               <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Security Key</label>
                  <input type="password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} placeholder="••••••••" className="w-full p-5 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:border-indigo-500 focus:bg-white outline-none font-bold text-sm text-black transition-all" />
               </div>
               {authError && <p className="text-center text-red-500 text-[10px] font-black uppercase bg-red-50 py-3 rounded-xl border border-red-100 animate-bounce">{authError}</p>}
               <button type="submit" className="w-full py-6 bg-indigo-600 text-white font-black rounded-2xl uppercase tracking-widest text-xs shadow-xl shadow-indigo-100 active:scale-95 transition-all mt-4">{isSignup ? 'Initialize Account' : 'Authenticate Access'}</button>
            </form>
            <div className="mt-8 flex flex-col gap-5">
               <button onClick={() => setIsSignup(!isSignup)} className="text-indigo-600 font-black text-[10px] uppercase tracking-widest text-center hover:opacity-70">{isSignup ? 'Switch to Login' : 'Register New Cadet'}</button>
               <div className="h-px bg-slate-100" />
               <button onClick={() => setIsSyncModalOpen(true)} className="w-full py-5 bg-slate-50 text-slate-500 font-black rounded-2xl text-[10px] uppercase tracking-widest border border-slate-100 active:bg-slate-100 transition-colors">Restore Profile Key</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderDashboard = () => (
    <div className="p-6 space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
         <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black shadow-xl shadow-indigo-100 text-xl border-4 border-white">
              {currentUser.username[0].toUpperCase()}
            </div>
            <div>
               <h2 className="text-lg font-black text-slate-800 leading-none">@{currentUser.username}</h2>
               <div className="flex items-center gap-2 mt-2">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                 <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Active System</p>
               </div>
            </div>
         </div>
         <div className="flex gap-2.5">
            <button onClick={() => setIsSyncModalOpen(true)} className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"><Globe size={22} /></button>
            <button onClick={handleLogout} className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"><LogOut size={22} /></button>
         </div>
      </div>

      <div className="bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-900 rounded-[3rem] p-8 text-white shadow-3xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-16 opacity-5 rotate-12 group-hover:rotate-45 transition-transform duration-1000"><Star size={200} /></div>
         <button onClick={() => setIsLevelsModalOpen(true)} className="absolute top-8 right-8 p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 hover:bg-white/20 transition-all"><QrCode size={22} /></button>
         <div className="flex items-center gap-6 mb-8 relative z-10">
            <div className="text-7xl drop-shadow-3xl animate-float">{stats?.currentLevel.emoji}</div>
            <div className="space-y-1">
               <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">{stats?.currentLevel.name}</h2>
               <p className="text-indigo-200/80 text-[11px] font-black uppercase tracking-[0.3em]">Grade Level {stats?.currentLevel.level} • {stats?.xp.toLocaleString()} XP</p>
            </div>
         </div>
         <div className="bg-white/10 p-6 rounded-[2rem] space-y-4 backdrop-blur-xl border border-white/10 shadow-inner">
            <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
               <span className="text-white">To {stats?.nextLevel?.name || 'LIMIT'}</span>
               <span className="text-indigo-100">{Math.round(stats?.progressToNext || 0)}%</span>
            </div>
            <ProgressBar progress={stats?.progressToNext || 0} color="bg-indigo-400" className="h-3 shadow-[0_0_15px_rgba(129,140,248,0.5)]" />
         </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex flex-col items-center shadow-xl shadow-slate-100/50 hover:scale-105 transition-transform">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4"><Target size={28} /></div>
            <span className="text-4xl font-black text-slate-800 tracking-tighter">{Math.round(stats?.percent || 0)}%</span>
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Total Mastery</span>
         </div>
         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex flex-col items-center shadow-xl shadow-slate-100/50 hover:scale-105 transition-transform">
            <div className="w-12 h-12 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center mb-4"><Users size={28} /></div>
            <span className="text-4xl font-black text-slate-800 tracking-tighter">{(currentUser.followedUsers || []).length}</span>
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Circle Size</span>
         </div>
      </div>

      <div className="space-y-5">
         <div className="flex justify-between items-center px-4">
            <h3 className="font-black text-slate-800 text-[11px] uppercase tracking-[0.3em] flex items-center gap-2">
               <Award className="text-indigo-600" size={18} /> High Priority
            </h3>
            <button onClick={() => setActiveTab('subjects')} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1.5 hover:translate-x-1 transition-transform">View All Pathways <ChevronRight size={14} /></button>
         </div>
         <div className="space-y-4">
            {Object.entries(stats?.subjectDetails || {}).slice(0, 3).map(([name, d]: [string, any]) => (
               <div key={name} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-indigo-100/30 hover:border-indigo-100 transition-all cursor-pointer group" onClick={() => { setSelectedSubject(name); setActiveTab('subjects'); }}>
                  <div className="flex justify-between items-center mb-5">
                     <span className="font-black text-base text-slate-700 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{name}</span>
                     <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-2xl border border-indigo-100 shadow-sm">{Math.round(d.percent)}%</span>
                  </div>
                  <ProgressBar progress={d.percent} color="bg-indigo-600" className="h-2.5" />
               </div>
            ))}
         </div>
      </div>
    </div>
  );

  const renderLeaderboard = () => {
    const list = [
      currentUser,
      ...(currentUser.followedUsers || [])
    ].sort((a, b) => b.xp - a.xp);

    return (
      <div className="p-6 space-y-8 animate-in fade-in duration-500 pb-20">
         <div className="bg-slate-900 rounded-[3.5rem] px-10 py-10 text-white shadow-3xl flex items-center justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 space-y-2">
               <h2 className="text-4xl font-black uppercase tracking-tighter leading-tight">STUDENT HUB</h2>
               <p className="text-indigo-400 text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-2"><Globe size={14} /> Peer Network Status</p>
            </div>
            <button 
              onClick={() => setIsSyncModalOpen(true)} 
              className="w-20 h-20 bg-indigo-600 text-white rounded-[2rem] shadow-2xl shadow-indigo-500/50 flex items-center justify-center hover:bg-white hover:text-indigo-600 active:scale-90 transition-all relative z-10 border-4 border-slate-800"
            >
              <UserPlus size={32} />
            </button>
         </div>

         <div className="space-y-5">
            {list.length === 1 && (
              <div className="text-center py-20 px-10 bg-white rounded-[3rem] border-4 border-dashed border-slate-100 flex flex-col items-center">
                <Users size={64} className="text-slate-200 mb-6" />
                <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] leading-relaxed mb-8">No peers found in your sector.</p>
                <button onClick={() => setIsSyncModalOpen(true)} className="px-10 py-5 bg-indigo-50 text-indigo-600 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-indigo-100 transition-all border border-indigo-100 shadow-sm">Sync with Real Friends</button>
              </div>
            )}
            {list.map((u, idx) => {
              const lvl = LEVELS.find(l => u.xp >= l.min && u.xp <= l.max) || LEVELS[0];
              const isMe = u.username === currentUser.username;
              return (
                <div 
                  key={u.username} 
                  onClick={() => setViewingUser(u)} 
                  className={`p-7 rounded-[3rem] border flex items-center gap-6 transition-all active:scale-[0.98] cursor-pointer group relative overflow-hidden ${isMe ? 'bg-indigo-600 border-indigo-400 text-white shadow-2xl shadow-indigo-200' : 'bg-white border-slate-100 text-slate-800 shadow-xl shadow-slate-100/50 hover:border-indigo-200'}`}
                >
                   <div className="w-10 text-center font-black text-2xl">
                      {idx === 0 ? '🏆' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx+1}`}
                   </div>

                   <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                         <span className="font-black text-lg uppercase tracking-tight leading-none">{u.username} {isMe && '(YOU)'}</span>
                         <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest border ${isMe ? 'bg-white/20 border-white/20' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
                           LVL {lvl.level}
                         </span>
                      </div>
                      <div className="space-y-2">
                         <ProgressBar 
                           progress={(u.xp / 30000) * 100} 
                           color={isMe ? 'bg-white' : 'bg-indigo-600'} 
                           className="h-2.5 opacity-90" 
                         />
                         <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em]">
                           <span className={isMe ? 'text-indigo-100' : 'text-slate-400'}>{lvl.name}</span>
                           <span className={isMe ? 'text-white' : 'text-indigo-600'}>{u.xp.toLocaleString()} XP</span>
                         </div>
                      </div>
                   </div>
                   
                   <div className={`p-2 rounded-2xl ${isMe ? 'bg-white/10' : 'bg-slate-50 text-slate-300'} group-hover:translate-x-1 transition-transform`}>
                     <ChevronRight size={24} />
                   </div>
                </div>
              );
            })}
         </div>
      </div>
    );
  };

  const renderSubjectList = () => (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <h2 className="text-4xl font-black text-slate-800 uppercase tracking-tighter px-2">Pathways</h2>
      <div className="grid grid-cols-1 gap-5">
         {Object.keys(INITIAL_SUBJECTS).map(n => {
           const d = stats?.subjectDetails[n];
           return (
             <div key={n} onClick={() => setSelectedSubject(n)} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/50 flex items-center justify-between group active:bg-slate-50 cursor-pointer hover:border-indigo-400 transition-all">
                <div className="flex items-center gap-6">
                   <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner border border-indigo-100"><BookOpen size={32} /></div>
                   <div className="space-y-1">
                      <h4 className="font-black text-lg text-slate-800 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{n}</h4>
                      <p className="text-[11px] text-indigo-500 font-black uppercase tracking-widest">{Math.round(d.percent)}% COMPLETED</p>
                   </div>
                </div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all border border-transparent group-hover:border-indigo-100">
                   <ChevronRight size={32} />
                </div>
             </div>
           );
         })}
      </div>
    </div>
  );

  const renderSubjectDetails = (subjectName: string) => {
    const sub = INITIAL_SUBJECTS[subjectName];
    return (
      <div className="animate-in slide-in-from-right-12 duration-500">
        <div className="p-6 bg-white border-b border-slate-100 sticky top-0 z-40 flex items-center justify-between backdrop-blur-xl bg-white/90">
          <button onClick={() => setSelectedSubject(null)} className="text-indigo-600 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 bg-indigo-50 px-6 py-3 rounded-2xl active:scale-90 transition-all shadow-sm border border-indigo-100"><ChevronLeft size={18} /> Back</button>
          <div className="text-center">
            <h2 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">Knowledge Pathway</h2>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">{subjectName}</h3>
          </div>
          <div className="w-20"></div>
        </div>
        <div className="p-6 space-y-5 pb-32">
           {Object.keys(sub.chapters).map(chapName => {
              const topics = sub.chapters[chapName];
              const doneCount = topics.filter(t => currentUser.progress.completedTopics[`${subjectName}-${chapName}-${t}`]).length;
              const p = topics.length > 0 ? (doneCount / topics.length) * 100 : 0;
              const isExpanded = selectedChapter === chapName;

              return (
                <div key={chapName} className={`bg-white rounded-[3rem] border transition-all duration-300 ${isExpanded ? 'border-indigo-400 ring-8 ring-indigo-50 shadow-2xl scale-[1.02]' : 'border-slate-100 shadow-lg shadow-slate-200/50'}`}>
                   <div onClick={() => setSelectedChapter(isExpanded ? null : chapName)} className={`p-7 flex flex-col cursor-pointer ${isExpanded ? 'bg-indigo-50/20' : ''}`}>
                      <div className="flex justify-between items-start mb-6">
                         <h4 className="font-black text-slate-700 text-sm uppercase tracking-tight flex-1 mr-6 leading-tight">{chapName}</h4>
                         <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border ${p === 100 ? 'bg-green-100 border-green-200 text-green-700' : 'bg-indigo-600 border-indigo-700 text-white shadow-lg shadow-indigo-200'}`}>{Math.round(p)}%</span>
                      </div>
                      <ProgressBar progress={p} color={p === 100 ? 'bg-green-500' : 'bg-indigo-600'} className="h-3" />
                   </div>
                   {isExpanded && (
                     <div className="p-8 bg-slate-50/50 border-t border-slate-100 space-y-8 animate-in fade-in duration-500">
                        <div className="grid grid-cols-2 gap-3">
                           {Object.values(PrepType).map(type => (
                             <button key={type} onClick={() => toggleCheck(subjectName, chapName, type)} className={`py-4 px-2 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all ${currentUser.progress.chapterCheckboxes[`${subjectName}-${chapName}-${type}`] ? 'bg-indigo-600 border-indigo-700 text-white shadow-xl shadow-indigo-100' : 'bg-white border-slate-200 text-slate-400 hover:border-indigo-300'}`}>
                                {type.replace('-', ' ')}
                             </button>
                           ))}
                        </div>
                        <div className="space-y-3 pt-6 border-t border-slate-200/50">
                           <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Core Concepts</h5>
                           {topics.map(t => (
                             <div key={t} className="flex items-center justify-between bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm group hover:border-indigo-300 transition-all">
                                <button onClick={() => toggleTopic(subjectName, chapName, t)} className="flex items-center gap-4 flex-1 text-left">
                                   {currentUser.progress.completedTopics[`${subjectName}-${chapName}-${t}`] ? <CheckCircle2 className="text-green-500" size={24} /> : <Circle className="text-slate-200" size={24} />}
                                   <span className={`text-xs font-bold uppercase tracking-tight ${currentUser.progress.completedTopics[`${subjectName}-${chapName}-${t}`] ? 'text-slate-300 line-through' : 'text-slate-600'}`}>{t}</span>
                                </button>
                                <button onClick={() => handleExplain(subjectName, chapName, t)} className="w-12 h-12 flex items-center justify-center text-indigo-600 bg-indigo-50 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"><Sparkles size={20} /></button>
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
    );
  };

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col bg-[#F8FAFC] select-none pb-28 font-sans overflow-x-hidden">
      {activeTab === 'dashboard' && (
        <header className="p-8 pb-4 flex items-center justify-between">
           <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-black text-slate-800 tracking-tighter">HSC ELITE</h1>
                <Zap className="text-indigo-600 fill-indigo-600" size={22} />
              </div>
              <p className="text-indigo-400 text-[11px] font-black uppercase tracking-[0.4em] mt-1">Intelligence Protocol</p>
           </div>
           <button onClick={() => setIsLevelsModalOpen(true)} className="w-14 h-14 bg-white shadow-xl shadow-slate-200/50 border border-slate-100 rounded-[1.5rem] flex items-center justify-center text-indigo-600 hover:scale-110 active:scale-90 transition-all"><QrCode size={24} /></button>
        </header>
      )}

      <main className="flex-1 overflow-x-hidden">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'subjects' && (selectedSubject ? renderSubjectDetails(selectedSubject) : renderSubjectList())}
        {activeTab === 'leaderboard' && renderLeaderboard()}
        {activeTab === 'aki' && (
          <div className="p-10 flex flex-col items-center justify-center min-h-[75vh] text-center space-y-10 animate-in zoom-in-95 duration-500">
             <div className="w-40 h-40 bg-indigo-600 rounded-[3.5rem] flex items-center justify-center shadow-3xl shadow-indigo-200 rotate-6 hover:rotate-0 transition-transform duration-700 relative">
                <Sparkles className="text-white" size={80} />
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center text-white shadow-lg border-4 border-white animate-bounce"><BrainCircuit size={24} /></div>
             </div>
             <div className="space-y-5">
                <h2 className="text-4xl font-black text-slate-800 uppercase tracking-tighter leading-tight">AI PROTOCOL: AKI</h2>
                <p className="text-slate-400 text-xs font-bold uppercase leading-relaxed tracking-widest max-w-[300px]">Access expert breakdowns of complex HSC concepts. Access AKI by selecting the sparkle icon on any module.</p>
             </div>
             <button onClick={() => { setActiveTab('subjects'); setSelectedSubject(null); }} className="w-full max-w-xs py-6 bg-indigo-600 text-white font-black rounded-[2.5rem] shadow-2xl shadow-indigo-100 uppercase tracking-[0.3em] text-xs active:scale-95 transition-all">Initialize Learning</button>
          </div>
        )}
      </main>

      <nav className="fixed bottom-8 left-8 right-8 max-w-md mx-auto bg-white/80 backdrop-blur-3xl border border-white/50 shadow-[0_40px_80px_-20px_rgba(79,70,229,0.15)] rounded-[3rem] px-10 py-6 safe-bottom z-[90] flex justify-between items-center ring-1 ring-black/5">
        <NavBtn active={activeTab === 'dashboard'} icon={<LayoutDashboard size={28} />} onClick={() => setActiveTab('dashboard')} />
        <NavBtn active={activeTab === 'subjects'} icon={<BookOpen size={28} />} onClick={() => setActiveTab('subjects')} />
        <NavBtn active={activeTab === 'leaderboard'} icon={<Globe size={28} />} onClick={() => setActiveTab('leaderboard')} />
        <NavBtn active={activeTab === 'aki'} icon={<Sparkles size={28} />} onClick={() => setActiveTab('aki')} />
      </nav>

      <AKIModal isOpen={akiModal.open} onClose={() => setAkiModal(prev => ({ ...prev, open: false }))} title={akiModal.title} content={akiModal.content} loading={akiModal.loading} />
      <SyncModal isOpen={isSyncModalOpen} onClose={() => setIsSyncModalOpen(false)} user={currentUser} onImport={handleImport} onFollow={handleFollow} />
      <LevelsInfoModal isOpen={isLevelsModalOpen} onClose={() => setIsLevelsModalOpen(false)} />
      <ProfileViewer user={viewingUser} isOpen={!!viewingUser} onClose={() => setViewingUser(null)} />
    </div>
  );
};

const NavBtn: React.FC<{ active: boolean; icon: React.ReactNode; onClick: () => void }> = ({ active, icon, onClick }) => (
  <button onClick={onClick} className={`p-3 rounded-2xl transition-all duration-500 ease-spring ${active ? 'text-indigo-600 scale-125 bg-indigo-50 shadow-inner' : 'text-slate-300 hover:text-slate-400 active:scale-90'}`}>{icon}</button>
);

const LevelsInfoModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-white rounded-[3.5rem] w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-indigo-600 text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-indigo-600 to-indigo-800" />
          <h3 className="text-2xl font-black uppercase tracking-tighter relative z-10">Evolution Matrix</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-2xl transition-all relative z-10"><X size={32} /></button>
        </div>
        <div className="p-8 overflow-y-auto flex-1 space-y-5 bg-slate-50">
           {LEVELS.map(lvl => (
             <div key={lvl.level} className="flex items-center justify-between p-6 rounded-[2.5rem] border border-slate-100 bg-white hover:border-indigo-200 transition-all shadow-sm">
                <div className="flex items-center gap-6">
                   <span className="text-4xl drop-shadow-xl animate-float">{lvl.emoji}</span>
                   <div>
                      <h4 className={`text-base font-black ${lvl.color} leading-none mb-2`}>LVL {lvl.level}: {lvl.name}</h4>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{lvl.min.toLocaleString()} - {lvl.max.toLocaleString()} XP</p>
                   </div>
                </div>
                {lvl.level >= 11 && <Zap className="text-amber-500 fill-amber-500 w-5 h-5 animate-pulse" />}
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default App;
