import { useState, useEffect } from 'react';
import { Shield, Trash2, UserPlus, LogOut, Search, Filter, AlertTriangle, BarChart3, FileText, Users as UsersIcon, TrendingUp, Activity, Clock, Eye } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';

interface Post {
  id: string;
  title: string;
  courseCode: string;
  courseTitle: string;
  faculty: string;
  prodi: string;
  uploadedBy: string;
  author: string;
  createdAt: string;
  fileType: string;
  fileName?: string;
  fileSize?: string;
  fileData?: string;
  description?: string;
}

interface User {
  email: string;
  fullName: string;
  faculty: string;
  prodi: string;
  role: 'user' | 'admin';
  isSuperAdmin?: boolean;
}

interface AdminLog {
  adminEmail: string;
  actionType: string;
  targetId: string;
  timestamp: string;
}

interface AdminDashboardProps {
  adminEmail: string;
  onLogout: () => void;
}

export default function AdminDashboard({ adminEmail, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'posts' | 'users'>('overview');
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [adminLogs, setAdminLogs] = useState<AdminLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showPromoteConfirm, setShowPromoteConfirm] = useState<string | null>(null);
  const [showDemoteConfirm, setShowDemoteConfirm] = useState<string | null>(null);
  const [previewPost, setPreviewPost] = useState<Post | null>(null);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);
  const [corruptedPostsCount, setCorruptedPostsCount] = useState(0);
  const [postSearchQuery, setPostSearchQuery] = useState('');

  // Load data from localStorage
  useEffect(() => {
    loadPosts();
    loadUsers();
    loadAdminLogs();
  }, []);

  const loadPosts = () => {
    // Migrasi data lama jika ada
    const oldData = localStorage.getItem('uninotes_uploaded_notes');
    const oldUserData = localStorage.getItem('uninotes_user_uploads');
    const newData = localStorage.getItem('uninotes_all_posts');
    
    if ((oldData || oldUserData) && !newData) {
      // Gabungkan data lama
      const oldNotes = oldData ? JSON.parse(oldData) : [];
      const oldUserNotes = oldUserData ? JSON.parse(oldUserData) : [];
      const combined = [...oldNotes, ...oldUserNotes];
      
      localStorage.setItem('uninotes_all_posts', JSON.stringify(combined));
      localStorage.removeItem('uninotes_uploaded_notes');
      localStorage.removeItem('uninotes_user_uploads');
    }
    
    const savedNotes = localStorage.getItem('uninotes_all_posts');
    if (savedNotes) {
      const notes = JSON.parse(savedNotes);
      
      // AUTO-CLEANUP: Filter out posts without fileData
      const validNotes = notes.filter((note: any) => {
        const hasFileData = !!note.fileData;
        if (!hasFileData) {
          console.warn('🗑️ Auto-cleanup posting lama tanpa fileData:', note.title);
        }
        return hasFileData;
      });
      
      // Count removed posts
      const removedCount = notes.length - validNotes.length;
      if (removedCount > 0) {
        console.log(`%c🧹 AUTO-CLEANUP BERHASIL!`, 'background: #10B981; color: white; font-weight: bold; padding: 8px 12px; border-radius: 4px;');
        console.log(`%c✅ Dihapus: ${removedCount} posting tanpa file`, 'font-weight: bold; color: #EF4444;');
        console.log(`%c✅ Tersisa: ${validNotes.length} posting valid`, 'font-weight: bold; color: #10B981;');
        
        // Save cleaned data back to localStorage
        localStorage.setItem('uninotes_all_posts', JSON.stringify(validNotes));
      }
      
      console.log('📊 Total posting loaded:', validNotes.length);
      if (validNotes.length > 0) {
        console.log('🔍 Sample post data:', validNotes[0]);
      }
      
      // Ensure all posts have required fields with fallbacks
      const normalizedNotes = validNotes.map((note: any) => ({
        ...note,
        createdAt: note.createdAt || note.uploadDate || new Date().toISOString(),
        uploadDate: note.uploadDate || note.createdAt || new Date().toISOString(),
        fileData: note.fileData || null,
        fileName: note.fileName || 'unknown',
        fileSize: note.fileSize || 'N/A',
        fileType: note.fileType || note.type || 'PDF',
        author: note.author || 'Unknown',
        uploadedBy: note.uploadedBy || 'Unknown',
        faculty: note.faculty || 'Unknown',
        prodi: note.prodi || 'Unknown'
      }));
      
      setPosts(normalizedNotes);
      setCorruptedPostsCount(0); // No corrupted posts after auto-cleanup
    }
  };

  const loadUsers = () => {
    const savedUsers = localStorage.getItem('uninotes_users');
    if (savedUsers) {
      const usersObj = JSON.parse(savedUsers);
      const usersList: User[] = Object.values(usersObj);
      setUsers(usersList);
    }
  };

  const loadAdminLogs = () => {
    const logs = localStorage.getItem('uninotes_admin_logs');
    if (logs) {
      setAdminLogs(JSON.parse(logs));
    }
  };

  const handleDeletePost = (postId: string) => {
    const savedNotes = localStorage.getItem('uninotes_all_posts');
    if (savedNotes) {
      const notes = JSON.parse(savedNotes);
      const updatedNotes = notes.filter((note: Post) => note.id !== postId);
      localStorage.setItem('uninotes_all_posts', JSON.stringify(updatedNotes));
      loadPosts();
      setShowDeleteConfirm(null);
      logAdminAction('delete_post', postId);
    }
  };

  const handlePromoteUser = (userEmail: string) => {
    const savedUsers = localStorage.getItem('uninotes_users');
    if (savedUsers) {
      const usersObj = JSON.parse(savedUsers);
      if (usersObj[userEmail]) {
        usersObj[userEmail].role = 'admin';
        localStorage.setItem('uninotes_users', JSON.stringify(usersObj));
        loadUsers();
        setShowPromoteConfirm(null);
        logAdminAction('promote_user', userEmail);
      }
    }
  };

  const handleDemoteAdmin = (userEmail: string) => {
    const savedUsers = localStorage.getItem('uninotes_users');
    if (savedUsers) {
      const usersObj = JSON.parse(savedUsers);
      if (usersObj[userEmail] && !usersObj[userEmail].isSuperAdmin) {
        usersObj[userEmail].role = 'user';
        localStorage.setItem('uninotes_users', JSON.stringify(usersObj));
        loadUsers();
        setShowDemoteConfirm(null);
        logAdminAction('demote_admin', userEmail);
      }
    }
  };

  const handleClearAllPosts = () => {
    localStorage.setItem('uninotes_all_posts', JSON.stringify([]));
    setPosts([]);
    setShowClearAllConfirm(false);
    logAdminAction('clear_all_posts', 'all');
  };

  const handleCleanupCorruptedPosts = () => {
    const savedNotes = localStorage.getItem('uninotes_all_posts');
    if (savedNotes) {
      const notes = JSON.parse(savedNotes);
      const validNotes = notes.filter((note: Post) => note.fileData);
      localStorage.setItem('uninotes_all_posts', JSON.stringify(validNotes));
      loadPosts();
      logAdminAction('cleanup_corrupted_posts', `removed_${notes.length - validNotes.length}`);
    }
  };

  const logAdminAction = (actionType: string, targetId: string) => {
    const logs = JSON.parse(localStorage.getItem('uninotes_admin_logs') || '[]');
    logs.push({
      adminEmail,
      actionType,
      targetId,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('uninotes_admin_logs', JSON.stringify(logs));
    loadAdminLogs();
  };

  // Filter posts
  const filteredPosts = (posts || []).filter(post => {
    const matchesSearch = !postSearchQuery || 
      post.title?.toLowerCase().includes(postSearchQuery.toLowerCase()) ||
      post.courseCode?.toLowerCase().includes(postSearchQuery.toLowerCase()) ||
      post.author?.toLowerCase().includes(postSearchQuery.toLowerCase());
    
    const matchesFaculty = !selectedFaculty || post.faculty === selectedFaculty;
    
    return matchesSearch && matchesFaculty;
  });

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchQuery ||
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const faculties = Array.from(new Set((posts || []).map(p => p.faculty || 'Unknown')));

  // Calculate statistics
  const totalPosts = posts?.length || 0;
  const totalUsers = users.length;
  const totalAdmins = users.filter(u => u.role === 'admin').length;
  const totalRegularUsers = users.filter(u => u.role === 'user').length;

  // Get posts by faculty for charts
  const postsByFaculty = faculties.map(faculty => ({
    name: faculty.length > 20 ? faculty.substring(0, 20) + '...' : faculty,
    posts: (posts || []).filter(p => p.faculty === faculty).length
  }));

  // Get posts by file type
  const fileTypes = Array.from(new Set((posts || []).map(p => p.fileType || 'Unknown')));
  const postsByFileType = fileTypes.map(type => ({
    name: type,
    value: (posts || []).filter(p => p.fileType === type).length
  }));

  // Get recent posts (last 7 days trend)
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push({
        date: date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
        posts: (posts || []).filter(p => {
          const postDate = new Date(p.createdAt || p.uploadDate);
          return postDate.toDateString() === date.toDateString();
        }).length
      });
    }
    return days;
  };

  const weeklyTrend = getLast7Days();

  // Chart colors
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  // Recent admin logs (last 5)
  const recentLogs = adminLogs.slice(-5).reverse();

  return (
    <div className="min-h-screen bg-gray-50 font-mono">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-red-500 via-orange-500 to-red-600 border-b-4 border-black shadow-[0_6px_0_0_rgba(0,0,0,1)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-black p-4 border-4 border-white shadow-[6px_6px_0px_0px_rgba(255,255,255,0.5)] rounded-xl rotate-3 hover:rotate-0 transition-transform">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-white uppercase tracking-tight drop-shadow-[3px_3px_0px_rgba(0,0,0,0.3)]">
                  Admin Panel
                </h1>
                <p className="text-white/95 font-bold text-sm mt-1 bg-black/20 px-3 py-1 rounded-full inline-block">
                  {adminEmail}
                </p>
              </div>
            </div>
            
            <button
              onClick={onLogout}
              className="flex items-center gap-2 bg-black text-white px-8 py-4 border-4 border-white font-black text-lg hover:bg-white hover:text-black hover:border-black transition-all rounded-xl shadow-[6px_6px_0px_0px_rgba(255,255,255,0.5)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              <LogOut className="w-6 h-6" />
              <span className="hidden sm:inline">KELUAR</span>
            </button>
          </div>
        </div>
      </header>

      {/* Warning Banner */}
      <div className="bg-yellow-400 border-y-4 border-black py-4 shadow-[0_4px_0_0_rgba(0,0,0,1)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 p-2 border-2 border-black rounded-lg">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <p className="font-black text-black text-lg">
              <span className="text-red-600">⚠️ PENTING:</span> Sebagai admin, Anda tidak dapat membuat posting atau berinteraksi sebagai user biasa.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-6 px-6 font-black text-xl border-4 border-black transition-all rounded-xl ${
              activeTab === 'overview'
                ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] scale-105'
                : 'bg-white text-black hover:bg-gray-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
            }`}
          >
            <BarChart3 className="w-8 h-8 mx-auto mb-2" />
            OVERVIEW
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`py-6 px-6 font-black text-xl border-4 border-black transition-all rounded-xl ${
              activeTab === 'posts'
                ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] scale-105'
                : 'bg-white text-black hover:bg-gray-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
            }`}
          >
            <FileText className="w-8 h-8 mx-auto mb-2" />
            POSTING ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-6 px-6 font-black text-xl border-4 border-black transition-all rounded-xl ${
              activeTab === 'users'
                ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] scale-105'
                : 'bg-white text-black hover:bg-gray-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
            }`}
          >
            <UsersIcon className="w-8 h-8 mx-auto mb-2" />
            USERS ({users.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === 'overview' ? (
          <div className="space-y-8">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <FileText className="w-12 h-12 text-white" />
                  <div className="bg-white/20 p-2 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-white/80 font-bold text-sm uppercase mb-1">Total Posting</h3>
                <p className="text-white font-black text-5xl">{totalPosts}</p>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <UsersIcon className="w-12 h-12 text-white" />
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-white/80 font-bold text-sm uppercase mb-1">Total Users</h3>
                <p className="text-white font-black text-5xl">{totalUsers}</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <Shield className="w-12 h-12 text-white" />
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-white/80 font-bold text-sm uppercase mb-1">Admin</h3>
                <p className="text-white font-black text-5xl">{totalAdmins}</p>
              </div>
            </div>
          </div>
        ) : activeTab === 'posts' ? (
          <div className="space-y-6">
            {/* Search & Filter */}
            <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                  <input
                    type="text"
                    placeholder="CARI POSTING (judul, kode, author)..."
                    value={postSearchQuery}
                    onChange={(e) => setPostSearchQuery(e.target.value)}
                    className="w-full pl-14 pr-4 py-4 border-4 border-black font-black text-lg rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500 placeholder:text-sm"
                  />
                </div>

                {/* Faculty Filter */}
                <div className="relative">
                  <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                  <select
                    value={selectedFaculty}
                    onChange={(e) => setSelectedFaculty(e.target.value)}
                    className="w-full pl-14 pr-4 py-4 border-4 border-black font-black text-lg rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500 appearance-none cursor-pointer bg-white"
                  >
                    <option value="">SEMUA FAKULTAS</option>
                    {faculties.map(faculty => (
                      <option key={faculty} value={faculty}>{faculty}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Search Results Counter */}
              {(postSearchQuery || selectedFaculty) && (
                <div className="mt-4 pt-4 border-t-4 border-black">
                  <p className="font-black text-gray-700">
                    🔍 Ditemukan <span className="text-blue-500 text-2xl">{filteredPosts.length}</span> dari <span className="text-gray-400">{posts.length}</span> posting
                  </p>
                </div>
              )}
            </div>

            {/* Corrupted Posts Warning */}
            {corruptedPostsCount > 0 && (
              <div className="bg-orange-100 border-4 border-orange-500 p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="bg-orange-500 p-2 border-2 border-black rounded-lg flex-shrink-0">
                      <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-black text-orange-800 text-xl mb-2">
                        ⚠️ POSTING LAMA TERDETEKSI!
                      </p>
                      <p className="font-bold text-orange-700 mb-1">
                        Ditemukan <span className="font-black text-2xl">{corruptedPostsCount}</span> posting tanpa file data.
                      </p>
                      <p className="text-sm font-bold text-orange-600">
                        Posting ini dibuat sebelum sistem file preview diterapkan dan tidak memiliki konten file.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleCleanupCorruptedPosts}
                    className="flex items-center gap-2 bg-orange-500 text-white px-6 py-3 border-4 border-black font-black hover:bg-orange-600 transition-all rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none whitespace-nowrap"
                  >
                    <Trash2 className="w-5 h-5" />
                    HAPUS SEMUA
                  </button>
                </div>
              </div>
            )}

            {/* Posts List */}
            <div className="space-y-4">
              {!filteredPosts || filteredPosts.length === 0 ? (
                <div className="bg-white border-4 border-black p-16 text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl">
                  <FileText className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                  <p className="font-black text-gray-400 text-2xl">
                    {postSearchQuery || selectedFaculty ? 'TIDAK DITEMUKAN' : 'TIDAK ADA POSTING'}
                  </p>
                </div>
              ) : (
                filteredPosts.map(post => (
                  <div
                    key={post.id}
                    className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all rounded-xl"
                  >
                    <div className="flex items-start justify-between gap-6">
                      {/* Thumbnail Preview */}
                      {post.fileData && post.fileType === 'IMG' ? (
                        <div className="flex-shrink-0 w-32 h-32 border-4 border-black rounded-lg overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-gray-100">
                          <img
                            src={post.fileData}
                            alt={post.title}
                            className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform"
                            onClick={() => setPreviewPost(post)}
                          />
                        </div>
                      ) : (
                        <div className="flex-shrink-0 w-32 h-32 border-4 border-black rounded-lg flex items-center justify-center bg-gradient-to-br from-red-500 to-orange-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                          <FileText className="w-16 h-16 text-white" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <span className="bg-blue-500 text-white px-4 py-2 text-sm font-black border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            {post.courseCode}
                          </span>
                          {post.fileName && (
                            <span className="bg-gray-800 text-white px-3 py-1 text-xs font-bold border-2 border-black rounded-lg">
                              {post.fileName.substring(post.fileName.lastIndexOf('.'))}
                            </span>
                          )}
                          {post.fileSize && (
                            <span className="bg-purple-200 text-black px-3 py-1 text-xs font-bold border-2 border-black rounded-lg">
                              💾 {post.fileSize}
                            </span>
                          )}
                        </div>
                        <h3 className="font-black text-2xl mb-2">{post.title}</h3>
                        <p className="text-sm font-bold text-gray-600 mb-1">{post.courseTitle}</p>
                        {post.description && (
                          <p className="text-sm text-gray-600 mb-2 border-l-4 border-blue-500 pl-3 italic line-clamp-2">
                            "{post.description}"
                          </p>
                        )}
                        <p className="text-sm font-bold text-gray-500 mb-3">
                          🏛️ {post.faculty} • 📚 {post.prodi}
                        </p>
                        
                        {/* Upload Info */}
                        <div className="bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-black px-4 py-3 rounded-lg">
                          <p className="text-xs font-bold text-gray-400 uppercase mb-2">📋 Info Upload</p>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm font-bold">
                              <span className="text-gray-500">Diupload oleh:</span>
                              <span className="text-gray-900">{post.author}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm font-bold">
                              <span className="text-gray-500">Email:</span>
                              <span className="text-blue-600 text-xs">{post.uploadedBy}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm font-bold">
                              <span className="text-gray-500">Tanggal:</span>
                              <span className="text-green-600">
                                {new Date(post.createdAt).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm font-bold">
                              <span className="text-gray-500">File:</span>
                              <span className="text-gray-700 text-xs truncate max-w-xs">{post.fileName || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => setPreviewPost(post)}
                          className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 border-4 border-black font-black hover:bg-blue-600 transition-all rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                        >
                          <Eye className="w-5 h-5" />
                          <span className="hidden sm:inline">LIHAT</span>
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(post.id)}
                          className="flex items-center gap-2 bg-red-500 text-white px-6 py-3 border-4 border-black font-black hover:bg-red-600 transition-all rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                        >
                          <Trash2 className="w-5 h-5" />
                          <span className="hidden sm:inline">HAPUS</span>
                        </button>
                      </div>
                    </div>

                    {/* Delete Confirmation */}
                    {showDeleteConfirm === post.id && (
                      <div className="mt-6 pt-6 border-t-4 border-black bg-red-50 -mx-6 -mb-6 p-6 rounded-b-xl">
                        <p className="font-black mb-4 text-red-600 text-xl">
                          ⚠️ YAKIN HAPUS POSTING INI?
                        </p>
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="flex-1 bg-red-500 text-white px-6 py-3 border-4 border-black font-black hover:bg-red-600 transition-all rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                          >
                            YA, HAPUS
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(null)}
                            className="flex-1 bg-white text-black px-6 py-3 border-4 border-black font-black hover:bg-gray-100 transition-all rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                          >
                            BATAL
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Search */}
            <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-black" />
                <input
                  type="text"
                  placeholder="CARI USER..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-4 py-4 border-4 border-black font-black text-lg rounded-lg focus:outline-none focus:ring-4 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Users List */}
            <div className="space-y-4">
              {filteredUsers.length === 0 ? (
                <div className="bg-white border-4 border-black p-16 text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl">
                  <UsersIcon className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                  <p className="font-black text-gray-400 text-2xl">TIDAK ADA USER</p>
                </div>
              ) : (
                filteredUsers.map(user => (
                  <div
                    key={user.email}
                    className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all rounded-xl"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 border-4 border-black flex items-center justify-center rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                          <span className="font-black text-white text-3xl">
                            {user.fullName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-black text-2xl">{user.fullName}</h3>
                          <p className="text-sm font-bold text-gray-600 mb-3">{user.email}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="bg-gray-200 text-black px-3 py-1 text-xs font-black border-2 border-black rounded-lg">
                              {user.faculty}
                            </span>
                            <span className="bg-gray-200 text-black px-3 py-1 text-xs font-black border-2 border-black rounded-lg">
                              {user.prodi}
                            </span>
                            <span className={`px-3 py-1 text-xs font-black border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                              user.role === 'admin' 
                                ? 'bg-red-500 text-white' 
                                : 'bg-green-500 text-white'
                            }`}>
                              {user.role === 'admin' ? '🛡️ ADMIN' : '👤 USER'}
                            </span>
                            {user.isSuperAdmin && (
                              <span className="px-3 py-1 text-xs font-black border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-gradient-to-r from-yellow-400 to-orange-500 text-white animate-pulse">
                                ⭐ SUPER ADMIN
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {user.role !== 'admin' && user.email !== adminEmail && (
                        <button
                          onClick={() => setShowPromoteConfirm(user.email)}
                          className="flex items-center gap-2 bg-green-500 text-white px-6 py-3 border-4 border-black font-black hover:bg-green-600 transition-all rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                        >
                          <UserPlus className="w-5 h-5" />
                          <span className="hidden sm:inline">JADIKAN ADMIN</span>
                        </button>
                      )}
                      
                      {user.role === 'admin' && !user.isSuperAdmin && user.email !== adminEmail && (
                        <button
                          onClick={() => setShowDemoteConfirm(user.email)}
                          className="flex items-center gap-2 bg-orange-500 text-white px-6 py-3 border-4 border-black font-black hover:bg-orange-600 transition-all rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                        >
                          <Trash2 className="w-5 h-5" />
                          <span className="hidden sm:inline">JADIKAN USER</span>
                        </button>
                      )}
                    </div>

                    {/* Promote Confirmation */}
                    {showPromoteConfirm === user.email && (
                      <div className="mt-6 pt-6 border-t-4 border-black bg-green-50 -mx-6 -mb-6 p-6 rounded-b-xl">
                        <p className="font-black mb-2 text-green-600 text-xl">
                          ⚠️ PROMOSIKAN {user.fullName.toUpperCase()} JADI ADMIN?
                        </p>
                        <p className="text-sm font-bold text-gray-600 mb-4">
                          ⚡ User tidak akan bisa lagi membuat posting setelah menjadi admin!
                        </p>
                        <div className="flex gap-3">
                          <button
                            onClick={() => handlePromoteUser(user.email)}
                            className="flex-1 bg-green-500 text-white px-6 py-3 border-4 border-black font-black hover:bg-green-600 transition-all rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                          >
                            YA, PROMOSIKAN
                          </button>
                          <button
                            onClick={() => setShowPromoteConfirm(null)}
                            className="flex-1 bg-white text-black px-6 py-3 border-4 border-black font-black hover:bg-gray-100 transition-all rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                          >
                            BATAL
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Demote Confirmation */}
                    {showDemoteConfirm === user.email && (
                      <div className="mt-6 pt-6 border-t-4 border-black bg-red-50 -mx-6 -mb-6 p-6 rounded-b-xl">
                        <p className="font-black mb-2 text-red-600 text-xl">
                          ⚠️ DEMOTING {user.fullName.toUpperCase()} DARI ADMIN?
                        </p>
                        <p className="text-sm font-bold text-gray-600 mb-4">
                          ⚡ Admin akan kembali menjadi user biasa!
                        </p>
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleDemoteAdmin(user.email)}
                            className="flex-1 bg-red-500 text-white px-6 py-3 border-4 border-black font-black hover:bg-red-600 transition-all rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                          >
                            YA, DEMOTING
                          </button>
                          <button
                            onClick={() => setShowDemoteConfirm(null)}
                            className="flex-1 bg-white text-black px-6 py-3 border-4 border-black font-black hover:bg-gray-100 transition-all rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                          >
                            BATAL
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewPost && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4" onClick={() => setPreviewPost(null)}>
          <div className="relative max-w-6xl w-full max-h-[95vh]" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              onClick={() => setPreviewPost(null)}
              className="absolute -top-12 right-0 bg-white text-black px-8 py-3 border-4 border-white font-black hover:bg-black hover:text-white transition-all rounded-lg shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none z-20"
            >
              ✕ TUTUP
            </button>

            {/* File Preview Only */}
            <div className="bg-white border-4 border-black rounded-xl overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
              {previewPost.fileData ? (
                <>
                  {previewPost.fileType === 'IMG' ? (
                    <img
                      src={previewPost.fileData}
                      alt={previewPost.title}
                      className="w-full h-auto max-h-[90vh] object-contain bg-gray-100"
                    />
                  ) : (
                    <div className="bg-gradient-to-br from-red-500 to-orange-500 p-20 text-center min-h-[500px] flex flex-col items-center justify-center">
                      <FileText className="w-32 h-32 text-white mb-6" />
                      <p className="font-black text-white text-4xl mb-3">FILE PDF</p>
                      <p className="text-white/90 font-bold text-lg">{previewPost.fileName}</p>
                      <p className="text-white/80 font-bold text-sm mt-4">Preview PDF tidak tersedia di browser</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-gray-200 p-20 text-center min-h-[500px] flex flex-col items-center justify-center">
                  <FileText className="w-32 h-32 text-gray-400 mb-6" />
                  <p className="font-black text-gray-600 text-3xl">FILE TIDAK TERSEDIA</p>
                  <p className="text-gray-500 font-bold mt-4">File lama tidak memiliki preview</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}