
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { INITIAL_SUBJECTS, LEVELS } from './constants';
import { ProgressState, PrepType, LevelInfo, UserProfile } from './types';
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
  LogIn,
  UserPlus,
  LogOut,
  Medal,
  Users,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Info,
  HelpCircle,
  TrendingUp,
  CloudSync,
  Copy,
  Download,
  UploadCloud,
  RefreshCcw,
  ShieldCheck,
  Globe,
  UserCheck,
  Search,
  Share2,
  QrCode,
  Link2,
  ExternalLink
} from 'lucide-react';
import { getTopicExplanation } from './geminiService';

// --- Helper Components ---

const ProgressBar: React.FC<{ progress: number; color?: string; className?: string }> = ({ progress, color = 'bg-blue-600', className = "" }) => (
  <div className={`w-full bg-gray-200/20 rounded-full h-2.5 overflow-hidden ${className}`}>
    <div 
      className={`h-full transition-all duration-500 ease-out ${color}`} 
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b flex justify-between items-center bg-indigo-50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h3 className="font-semibold text-indigo-900">{title}</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-indigo-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-indigo-900" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
              <p className="text-gray-500 animate-pulse font-medium">AKI is thinking...</p>
            </div>
          ) : (
            <div className="prose prose-sm prose-indigo max-w-none text-gray-800 font-science">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          )}
        </div>
        <div className="p-4 bg-gray-50 border-t flex justify-center">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Profile Viewer Modal ---
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6 bg-gradient-to-br from-indigo-600 to-blue-700 text-white flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl shadow-inner backdrop-blur-md">
              {currentLevel.emoji}
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight">{user.username}</h3>
              <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest">{currentLevel.name} • {user.xp} XP</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="space-y-4">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Detailed Mastery Breakdown</h4>
             <div className="grid grid-cols-1 gap-3">
               {subDetails.map(sub => (
                 <div key={sub.name} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-[10px] font-black text-slate-600 uppercase">{sub.name}</span>
                       <span className="text-xs font-black text-indigo-600">{Math.round(sub.percent)}%</span>
                    </div>
                    <ProgressBar progress={sub.percent} color="bg-indigo-500" className="h-1.5" />
                 </div>
               ))}
             </div>
          </div>
          <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
             <p className="text-[9px] text-indigo-600 font-bold uppercase text-center leading-relaxed">
               Last active: {new Date(user.lastActive).toLocaleString()}
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
    return btoa(JSON.stringify(shareable));
  }, [user]);

  const shareLink = useMemo(() => {
    const base = window.location.origin + window.location.pathname;
    return `${base}#follow=${profileData}`;
  }, [profileData]);

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(shareLink)}&bgcolor=ffffff&color=4f46e5&margin=10`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6 bg-indigo-600 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Globe className="w-6 h-6" />
            <h3 className="text-xl font-black uppercase tracking-tighter">Student Hub</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full">
            <X size={28} />
          </button>
        </div>

        <div className="flex bg-indigo-700/10 p-1 mx-6 mt-6 rounded-2xl">
          <button onClick={() => setActiveTab('link')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'link' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Join Link</button>
          <button onClick={() => setActiveTab('qr')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'qr' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Scan ID</button>
          <button onClick={() => setActiveTab('paste')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'paste' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>Paster</button>
        </div>

        <div className="p-8 overflow-y-auto flex-1 flex flex-col items-center justify-center text-center">
          {activeTab === 'link' && (
            <div className="space-y-6 w-full animate-in fade-in zoom-in-95">
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl mx-auto flex items-center justify-center shadow-inner">
                 <Link2 size={40} />
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight">Broadcast Profile</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed px-4">
                  Send this link to friends. When they click it, you'll be added to their leaderboard instantly.
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
                className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 active:scale-95 transition-all"
              >
                <Share2 size={18} /> Send Join Link
              </button>
            </div>
          )}

          {activeTab === 'qr' && (
            <div className="space-y-6 w-full animate-in fade-in zoom-in-95">
              <div className="bg-white p-4 rounded-3xl border-4 border-indigo-50 shadow-xl inline-block">
                 <img src={qrUrl} alt="QR Code" className="w-56 h-56 rounded-xl" />
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight">Your Student ID</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                  Show this to a friend to scan with their camera.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'paste' && (
            <div className="space-y-6 w-full animate-in fade-in zoom-in-95">
              <textarea 
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="Paste Link or Profile Key here..."
                className="w-full h-32 p-4 bg-slate-50 border-2 border-slate-100 rounded-3xl text-[10px] font-mono focus:border-indigo-500 outline-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <button 
                  disabled={!keyInput}
                  onClick={() => { 
                    const data = keyInput.includes('follow=') ? keyInput.split('follow=')[1] : keyInput;
                    onFollow(data); 
                    setKeyInput(''); 
                  }}
                  className="py-4 bg-green-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest disabled:opacity-50 active:scale-95"
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
                  className="py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest disabled:opacity-50 active:scale-95"
                >
                  Restore Me
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
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  // AKI Assistant State
  const [akiModal, setAkiModal] = useState<{ open: boolean; title: string; content: string; loading: boolean }>({
    open: false,
    title: '',
    content: '',
    loading: false
  });

  // URL Link Follow Detection
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#follow=')) {
      const data = hash.split('#follow=')[1];
      try {
        const u = JSON.parse(atob(data)) as UserProfile;
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
              window.location.hash = ''; // Clear hash
            }
          }
        }
      } catch (e) {
        console.error("Link follow failed", e);
      }
    }
  }, []);

  // Load session
  useEffect(() => {
    const session = localStorage.getItem('hsc-elite-session');
    if (session) {
      const userData = localStorage.getItem(`hsc-user-${session}`);
      if (userData) {
        try { setCurrentUser(JSON.parse(userData)); } catch (e) { localStorage.removeItem('hsc-elite-session'); }
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
      setAkiModal(prev => ({ ...prev, content: "Sorry, I couldn't get an explanation right now. Please try again later.", loading: false }));
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
    if (!u || !p) { setAuthError('Missing fields'); return; }
    const key = `hsc-user-${u}`;
    const existing = localStorage.getItem(key);
    if (isSignup) {
      if (existing) { setAuthError('User exists'); return; }
      const user: UserProfile = { username: u, password: p, xp: 0, progress: { completedTopics: {}, chapterCheckboxes: {} }, lastActive: Date.now(), followedUsers: [] };
      localStorage.setItem(key, JSON.stringify(user));
      setCurrentUser(user);
      localStorage.setItem('hsc-elite-session', u);
    } else {
      if (!existing) { setAuthError('User not found. Try "Restore via Key"'); return; }
      const user: UserProfile = JSON.parse(existing);
      if (user.password !== p) { setAuthError('Wrong password'); return; }
      setCurrentUser(user);
      localStorage.setItem('hsc-elite-session', u);
    }
  };

  const handleImport = (data: string) => {
    try {
      const u = JSON.parse(atob(data)) as UserProfile;
      localStorage.setItem(`hsc-user-${u.username}`, JSON.stringify(u));
      localStorage.setItem('hsc-elite-session', u.username);
      setCurrentUser(u);
      setIsSyncModalOpen(false);
      alert('Account Restored!');
    } catch (e) { alert('Invalid Key'); }
  };

  const handleFollow = (data: string) => {
    try {
      const u = JSON.parse(atob(data)) as UserProfile;
      if (!currentUser) return;
      if (u.username === currentUser.username) { alert('Already following yourself!'); return; }
      const updatedFollows = [...(currentUser.followedUsers || [])];
      const existingIdx = updatedFollows.findIndex(f => f.username === u.username);
      if (existingIdx > -1) updatedFollows[existingIdx] = u;
      else updatedFollows.push(u);
      
      const updatedUser = { ...currentUser, followedUsers: updatedFollows };
      setCurrentUser(updatedUser);
      localStorage.setItem(`hsc-user-${currentUser.username}`, JSON.stringify(updatedUser));
      setIsSyncModalOpen(false);
      alert(`Following ${u.username}!`);
    } catch (e) { alert('Invalid Student Data'); }
  };

  const handleLogout = () => {
    localStorage.removeItem('hsc-elite-session');
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  // UI Renders
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center space-y-3">
            <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] mx-auto flex items-center justify-center shadow-2xl rotate-3">
              <Zap className="text-white fill-white" size={40} />
            </div>
            <h1 className="text-3xl font-black text-slate-800 uppercase mt-6 tracking-tighter">HSC ELITE</h1>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em]">Smart Mastery Platform</p>
          </div>
          <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl border border-slate-100">
            <form onSubmit={handleAuth} className="space-y-4">
               <input type="text" value={usernameInput} onChange={e => setUsernameInput(e.target.value)} placeholder="Username" className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:border-indigo-500 outline-none font-bold text-sm text-black" />
               <input type="password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} placeholder="Password" className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-slate-50 focus:border-indigo-500 outline-none font-bold text-sm text-black" />
               {authError && <p className="text-center text-red-500 text-[10px] font-bold uppercase">{authError}</p>}
               <button type="submit" className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl uppercase tracking-widest text-xs shadow-lg shadow-indigo-200 active:scale-95 transition-transform">{isSignup ? 'Create Account' : 'Login Securely'}</button>
            </form>
            <div className="mt-6 flex flex-col gap-4">
               <button onClick={() => setIsSignup(!isSignup)} className="text-indigo-600 font-black text-[10px] uppercase tracking-widest text-center">{isSignup ? 'Back to Login' : 'Join as New Student'}</button>
               <div className="h-px bg-slate-50" />
               <button onClick={() => setIsSyncModalOpen(true)} className="w-full py-4 bg-blue-50 text-blue-600 font-black rounded-2xl text-[10px] uppercase tracking-widest">Restore Profile</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderDashboard = () => (
    <div className="p-4 space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-100">{currentUser.username[0].toUpperCase()}</div>
            <div>
               <h2 className="text-base font-black text-slate-800 leading-none">@{currentUser.username}</h2>
               <p className="text-[10px] text-green-500 font-black uppercase tracking-widest mt-1 flex items-center gap-1"><Circle size={8} fill="currentColor" className="animate-pulse" /> Active Session</p>
            </div>
         </div>
         <div className="flex gap-2">
            <button onClick={() => setIsSyncModalOpen(true)} className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"><Globe size={20} /></button>
            <button onClick={handleLogout} className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><LogOut size={20} /></button>
         </div>
      </div>

      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 rounded-[2.5rem] p-7 text-white shadow-2xl relative overflow-hidden ring-4 ring-white/10">
         <button onClick={() => setIsLevelsModalOpen(true)} className="absolute top-6 right-6 p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-all"><QrCode size={20} /></button>
         <div className="flex items-center gap-5 mb-6">
            <div className="text-6xl drop-shadow-2xl animate-bounce duration-[3s]">{stats?.currentLevel.emoji}</div>
            <div>
               <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">{stats?.currentLevel.name}</h2>
               <p className="text-indigo-200 text-xs font-bold mt-1 uppercase tracking-widest">Lvl {stats?.currentLevel.level} • {stats?.xp.toLocaleString()} XP</p>
            </div>
         </div>
         <div className="bg-black/20 p-5 rounded-3xl space-y-3 backdrop-blur-md border border-white/5">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
               <span>Next: {stats?.nextLevel?.name || 'GOD MODE'}</span>
               <span>{Math.round(stats?.progressToNext || 0)}%</span>
            </div>
            <ProgressBar progress={stats?.progressToNext || 0} color="bg-yellow-400" className="h-2.5" />
         </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
         <div className="bg-white p-6 rounded-3xl border border-slate-100 flex flex-col items-center shadow-sm">
            <Target className="text-red-500 mb-3" size={28} />
            <span className="text-3xl font-black text-slate-800">{Math.round(stats?.percent || 0)}%</span>
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Mastery</span>
         </div>
         <div className="bg-white p-6 rounded-3xl border border-slate-100 flex flex-col items-center shadow-sm">
            <UserCheck className="text-green-500 mb-3" size={28} />
            <span className="text-3xl font-black text-slate-800">{(currentUser.followedUsers || []).length}</span>
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Followers</span>
         </div>
      </div>

      <div className="space-y-4">
         <div className="flex justify-between items-center px-2">
            <h3 className="font-black text-slate-800 text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
               <Award className="text-indigo-500" size={16} /> Proficiency
            </h3>
            <button onClick={() => setActiveTab('subjects')} className="text-[9px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1">View All <ChevronRight size={12} /></button>
         </div>
         <div className="space-y-3">
            {Object.entries(stats?.subjectDetails || {}).slice(0, 3).map(([name, d]: [string, any]) => (
               <div key={name} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:border-indigo-100 transition-all cursor-pointer" onClick={() => { setSelectedSubject(name); setActiveTab('subjects'); }}>
                  <div className="flex justify-between items-center mb-4">
                     <span className="font-black text-sm text-slate-700 uppercase tracking-tight">{name}</span>
                     <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-xl">{Math.round(d.percent)}%</span>
                  </div>
                  <ProgressBar progress={d.percent} color="bg-indigo-600" className="h-2" />
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
      <div className="p-4 space-y-6 animate-in fade-in duration-300 pb-12">
         {/* Refined Student Hub Header */}
         <div className="bg-gradient-to-br from-indigo-700 to-indigo-900 rounded-[4rem] px-10 py-8 text-white shadow-2xl flex items-center justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-[-10%] opacity-10 group-hover:rotate-12 transition-transform duration-700"><Globe size={180} /></div>
            <div className="relative z-10 space-y-1">
               <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">STUDENT HUB</h2>
               <p className="text-indigo-200/60 text-[10px] font-black uppercase tracking-[0.3em]">Real-time Peer Compare</p>
            </div>
            <button 
              onClick={() => setIsSyncModalOpen(true)} 
              className="w-16 h-16 bg-white/20 backdrop-blur-md text-white rounded-full shadow-xl flex items-center justify-center hover:bg-white hover:text-indigo-700 active:scale-90 transition-all relative z-10 border border-white/30"
            >
              <UserPlus size={28} />
            </button>
         </div>

         {/* Leaderboard User List */}
         <div className="space-y-4">
            {list.length === 1 && (
              <div className="text-center py-16 px-8 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
                <Users size={48} className="mx-auto text-slate-200 mb-4" />
                <p className="text-slate-400 text-xs font-bold leading-relaxed uppercase tracking-wider mb-6">Your circle is empty.</p>
                <button onClick={() => setIsSyncModalOpen(true)} className="px-8 py-4 bg-indigo-50 text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-100 transition-all">Add Real Friends</button>
              </div>
            )}
            {list.map((u, idx) => {
              const lvl = LEVELS.find(l => u.xp >= l.min && u.xp <= l.max) || LEVELS[0];
              const isMe = u.username === currentUser.username;
              return (
                <div 
                  key={u.username} 
                  onClick={() => setViewingUser(u)} 
                  className={`p-6 rounded-[2.5rem] border flex items-center gap-4 transition-all active:scale-[0.98] cursor-pointer group bg-gradient-to-br from-indigo-600 to-indigo-700 border-indigo-400/30 text-white shadow-2xl shadow-indigo-100/50 relative overflow-hidden`}
                >
                   {/* Rank Badge */}
                   <div className="w-10 text-center font-black text-lg drop-shadow-md">
                      {idx === 0 ? '👑' : `#${idx+1}`}
                   </div>

                   <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                         <span className="font-black text-base uppercase tracking-tight">{u.username} {isMe && '(YOU)'}</span>
                         <span className={`text-[10px] px-2.5 py-1 rounded-xl font-black uppercase bg-white/20 text-white backdrop-blur-sm border border-white/10`}>
                           Lvl {lvl.level}
                         </span>
                      </div>
                      <div className="flex items-center gap-4">
                         <div className="flex-1">
                           <ProgressBar 
                             progress={(u.xp / 30000) * 100} 
                             color="bg-white" 
                             className="h-2 shadow-[0_0_10px_rgba(255,255,255,0.3)]" 
                           />
                         </div>
                         <span className={`text-[10px] font-black uppercase tracking-widest text-indigo-100 drop-shadow-sm`}>
                           {u.xp.toLocaleString()} XP
                         </span>
                      </div>
                   </div>

                   {/* Crown Icon Decoration for Top Rank */}
                   {idx === 0 && <Award className="absolute -right-4 -bottom-4 w-16 h-16 text-white/5" />}
                   
                   <ChevronRight className={`transition-all text-white/40 group-hover:text-white group-hover:translate-x-1`} size={24} />
                </div>
              );
            })}
         </div>

         {list.length > 1 && (
           <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em] leading-relaxed">
                PEER DATA IS A SNAPSHOT. TO SEE THEIR LATEST UPDATES, ASK THEM FOR A <span className="text-indigo-600 border-b-2 border-indigo-200">SYNC LINK</span>.
              </p>
           </div>
         )}
      </div>
    );
  };

  const renderSubjectList = () => (
    <div className="p-4 space-y-5 animate-in fade-in duration-300">
      <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter px-2">Pathways</h2>
      <div className="grid grid-cols-1 gap-4">
         {Object.keys(INITIAL_SUBJECTS).map(n => {
           const d = stats?.subjectDetails[n];
           return (
             <div key={n} onClick={() => setSelectedSubject(n)} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group active:bg-slate-50 cursor-pointer hover:border-indigo-200 transition-all">
                <div className="flex items-center gap-5">
                   <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner"><BookOpen size={28} /></div>
                   <div>
                      <h4 className="font-black text-slate-800 uppercase tracking-tight group-hover:text-indigo-600">{n}</h4>
                      <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest">{Math.round(d.percent)}% Complete</p>
                   </div>
                </div>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-slate-200 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-all">
                   <ChevronRight size={24} />
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
      <div className="animate-in slide-in-from-right-4 duration-300">
        <div className="p-5 bg-white border-b sticky top-0 z-10 flex items-center justify-between shadow-sm">
          <button onClick={() => setSelectedSubject(null)} className="text-indigo-600 font-black text-[10px] uppercase tracking-widest flex items-center gap-1 bg-indigo-50 px-4 py-2 rounded-xl active:scale-90"><ChevronLeft size={16} /> Back</button>
          <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest">{subjectName}</h2>
          <div className="w-10"></div>
        </div>
        <div className="p-4 space-y-4 pb-24">
           {Object.keys(sub.chapters).map(chapName => {
              const topics = sub.chapters[chapName];
              const doneCount = topics.filter(t => currentUser.progress.completedTopics[`${subjectName}-${chapName}-${t}`]).length;
              const p = topics.length > 0 ? (doneCount / topics.length) * 100 : 0;
              const isExpanded = selectedChapter === chapName;

              return (
                <div key={chapName} className={`bg-white rounded-3xl border transition-all ${isExpanded ? 'border-indigo-400 ring-4 ring-indigo-50 shadow-xl' : 'border-slate-100 shadow-sm'}`}>
                   <div onClick={() => setSelectedChapter(isExpanded ? null : chapName)} className={`p-5 flex flex-col cursor-pointer ${isExpanded ? 'bg-indigo-50/10' : ''}`}>
                      <div className="flex justify-between items-center mb-4">
                         <h4 className="font-black text-slate-700 text-xs uppercase tracking-tight flex-1 mr-4">{chapName}</h4>
                         <span className={`text-[9px] font-black px-3 py-1 rounded-xl uppercase ${p === 100 ? 'bg-green-100 text-green-700' : 'bg-indigo-600 text-white'}`}>{Math.round(p)}%</span>
                      </div>
                      <ProgressBar progress={p} color={p === 100 ? 'bg-green-500' : 'bg-indigo-600'} className="h-1.5" />
                   </div>
                   {isExpanded && (
                     <div className="p-5 bg-slate-50/50 border-t space-y-5 animate-in fade-in">
                        <div className="grid grid-cols-2 gap-2">
                           {Object.values(PrepType).map(type => (
                             <button key={type} onClick={() => toggleCheck(subjectName, chapName, type)} className={`p-3 rounded-2xl text-[9px] font-black uppercase border transition-all ${currentUser.progress.chapterCheckboxes[`${subjectName}-${chapName}-${type}`] ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-400 hover:border-indigo-300'}`}>
                                {type.replace('-', ' ')}
                             </button>
                           ))}
                        </div>
                        <div className="space-y-2 pt-2 border-t border-slate-100">
                           {topics.map(t => (
                             <div key={t} className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm group hover:border-indigo-200 transition-all">
                                <button onClick={() => toggleTopic(subjectName, chapName, t)} className="flex items-center gap-3 flex-1 text-left">
                                   {currentUser.progress.completedTopics[`${subjectName}-${chapName}-${t}`] ? <CheckCircle2 className="text-green-500" size={20} /> : <Circle className="text-slate-200" size={20} />}
                                   <span className={`text-xs font-black uppercase tracking-tight ${currentUser.progress.completedTopics[`${subjectName}-${chapName}-${t}`] ? 'text-slate-300 line-through' : 'text-slate-600'}`}>{t}</span>
                                </button>
                                <button onClick={() => handleExplain(subjectName, chapName, t)} className="p-2 text-indigo-500 bg-indigo-50 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"><Sparkles size={18} /></button>
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
    <div className="max-w-md mx-auto min-h-screen flex flex-col bg-[#F8FAFC] select-none pb-28 font-sans">
      {activeTab === 'dashboard' && (
        <header className="p-6 pb-2 flex items-center justify-between">
           <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tighter flex items-center gap-2">HSC ELITE <Zap className="text-yellow-400 fill-yellow-400" size={20} /></h1>
              <p className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.3em]">Mastery Intelligence</p>
           </div>
           <button onClick={() => setIsLevelsModalOpen(true)} className="p-3 bg-white shadow-sm border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all active:scale-90"><QrCode size={22} /></button>
        </header>
      )}

      <main className="flex-1 overflow-x-hidden">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'subjects' && (selectedSubject ? renderSubjectDetails(selectedSubject) : renderSubjectList())}
        {activeTab === 'leaderboard' && renderLeaderboard()}
        {activeTab === 'aki' && (
          <div className="p-8 flex flex-col items-center justify-center min-h-[75vh] text-center space-y-8 animate-in zoom-in-95">
             <div className="w-32 h-32 bg-indigo-600 rounded-[3rem] flex items-center justify-center shadow-2xl rotate-6 hover:rotate-0 transition-transform duration-500"><Sparkles className="text-white" size={64} /></div>
             <div className="space-y-4">
                <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">AI Guide AKI</h2>
                <p className="text-slate-400 text-xs font-bold uppercase leading-relaxed tracking-widest max-w-[280px]">Ask AKI to break down complex HSC topics into easy steps. Tap the sparkle icon next to any topic.</p>
             </div>
             <button onClick={() => { setActiveTab('subjects'); setSelectedSubject(null); }} className="w-full max-w-xs py-5 bg-indigo-600 text-white font-black rounded-[2rem] shadow-xl shadow-indigo-100 uppercase tracking-[0.2em] text-xs active:scale-95 transition-all">Start Learning</button>
          </div>
        )}
      </main>

      <nav className="fixed bottom-6 left-6 right-6 max-w-md mx-auto bg-white/95 backdrop-blur-3xl border border-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.1)] rounded-[2.5rem] px-8 py-5 safe-bottom z-40 flex justify-between items-center ring-1 ring-black/5">
        <NavBtn active={activeTab === 'dashboard'} icon={<LayoutDashboard size={24} />} onClick={() => setActiveTab('dashboard')} />
        <NavBtn active={activeTab === 'subjects'} icon={<BookOpen size={24} />} onClick={() => setActiveTab('subjects')} />
        <NavBtn active={activeTab === 'leaderboard'} icon={<Globe size={24} />} onClick={() => setActiveTab('leaderboard')} />
        <NavBtn active={activeTab === 'aki'} icon={<Sparkles size={24} />} onClick={() => setActiveTab('aki')} />
      </nav>

      <AKIModal isOpen={akiModal.open} onClose={() => setAkiModal(prev => ({ ...prev, open: false }))} title={akiModal.title} content={akiModal.content} loading={akiModal.loading} />
      <SyncModal isOpen={isSyncModalOpen} onClose={() => setIsSyncModalOpen(false)} user={currentUser} onImport={handleImport} onFollow={handleFollow} />
      <LevelsInfoModal isOpen={isLevelsModalOpen} onClose={() => setIsLevelsModalOpen(false)} />
      <ProfileViewer user={viewingUser} isOpen={!!viewingUser} onClose={() => setViewingUser(null)} />
    </div>
  );
};

const NavBtn: React.FC<{ active: boolean; icon: React.ReactNode; onClick: () => void }> = ({ active, icon, onClick }) => (
  <button onClick={onClick} className={`p-2 rounded-2xl transition-all duration-300 ${active ? 'text-indigo-600 scale-125 bg-indigo-50' : 'text-slate-300 hover:text-slate-400'}`}>{icon}</button>
);

const LevelsInfoModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b flex justify-between items-center bg-indigo-600 text-white">
          <h3 className="text-xl font-black uppercase tracking-tighter">Evolution System</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full"><X size={28} /></button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
           {LEVELS.map(lvl => (
             <div key={lvl.level} className="flex items-center justify-between p-4 rounded-3xl border border-slate-100 bg-white hover:border-indigo-200 transition-colors">
                <div className="flex items-center gap-4">
                   <span className="text-3xl drop-shadow-md">{lvl.emoji}</span>
                   <div>
                      <h4 className={`text-sm font-black ${lvl.color}`}>Lvl {lvl.level}: {lvl.name}</h4>
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{lvl.min.toLocaleString()} - {lvl.max.toLocaleString()} XP</p>
                   </div>
                </div>
                {lvl.level >= 11 && <Zap className="text-amber-500 fill-amber-500 w-4 h-4 animate-pulse" />}
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default App;
