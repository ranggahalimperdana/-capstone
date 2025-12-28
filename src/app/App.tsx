import { useState, useEffect } from 'react';
import { BookOpen, ChevronDown, Settings, FileText, Search, Users, ChevronRight } from 'lucide-react';
import CourseDetail from './components/CourseDetail';
import Login from './components/Login';
import Register from './components/Register';
import UploadNotes from './components/UploadNotes';
import FilterSection from './components/FilterSection';
import SettingsAccount from './components/SettingsAccount';
import LandingPage from './components/LandingPage';
import ForgotPassword from './components/ForgotPassword';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import Timeline from './components/Timeline';
import { facultiesWithCoursesData, facultiesData } from './data/coursesData';

interface UserData {
  fullName: string;
  email: string;
  faculty: string;
  prodi: string;
  role?: 'user' | 'admin'; // Add role field
  isSuperAdmin?: boolean; // Super admin flag
  profilePicture?: string;
}

interface Course {
  code: string;
  title: string;
  description: string;
  notes: number;
  faculty?: string;
  prodi?: string;
  semester?: number;
}

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'dashboard' | 'course-detail' | 'upload-notes' | 'settings' | 'landing'>('landing');
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  
  // Filter states
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedProdi, setSelectedProdi] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');

  // Load user data from localStorage on mount
  useEffect(() => {
    // AUTO-CREATE ADMIN ACCOUNT if not exists
    const initializeAdminAccount = () => {
      const savedUsers = localStorage.getItem('uninotes_users');
      const users = savedUsers ? JSON.parse(savedUsers) : {};
      
      // Check if admin account exists
      if (!users['admin@uninotes.com']) {
        // Create default admin account
        users['admin@uninotes.com'] = {
          fullName: 'Super Admin',
          email: 'admin@uninotes.com',
          faculty: 'Administrator',
          prodi: 'System Management',
          role: 'admin',
          isSuperAdmin: true
        };
        
        localStorage.setItem('uninotes_users', JSON.stringify(users));
        
        console.log('%c✅ ADMIN ACCOUNT AUTO-CREATED!', 'background: #34A853; color: white; font-weight: bold; padding: 8px 12px; border-radius: 4px;');
        console.log('%c📧 Email: admin@uninotes.com', 'font-weight: bold; color: #4285F4;');
        console.log('%c🔑 Password: admin123', 'font-weight: bold; color: #4285F4;');
        console.log('%cLogin sekarang untuk akses Admin Panel!', 'color: #666;');
      } else {
        // MIGRATION: Update existing admin account to new format
        const existingAdmin = users['admin@uninotes.com'];
        if (!existingAdmin.isSuperAdmin || existingAdmin.faculty === 'Fakultas Teknik') {
          users['admin@uninotes.com'] = {
            ...existingAdmin,
            fullName: 'Super Admin',
            faculty: 'Administrator',
            prodi: 'System Management',
            role: 'admin',
            isSuperAdmin: true
          };
          localStorage.setItem('uninotes_users', JSON.stringify(users));
          console.log('%c🔄 ADMIN ACCOUNT UPDATED!', 'background: #FBBC05; color: black; font-weight: bold; padding: 8px 12px; border-radius: 4px;');
          console.log('%c✨ Super Admin sekarang punya info khusus: Administrator - System Management', 'color: #666;');
        }
      }
    };
    
    // Initialize admin account first
    initializeAdminAccount();
    
    // Then load user session
    const storedUser = localStorage.getItem('uninotes_user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserData(user);
      setIsLoggedIn(true);
      setCurrentView('home');
    } else {
      setCurrentView('landing');
    }
  }, []);

  const showSuccessNotification = (message: string) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 4000);
  };

  const handleUpdateUser = (updatedUser: UserData) => {
    setUserData(updatedUser);
    localStorage.setItem('uninotes_user', JSON.stringify(updatedUser));
    
    // Also update the main users database in localStorage
    const savedUsers = localStorage.getItem('uninotes_users');
    if (savedUsers) {
      const users = JSON.parse(savedUsers);
      if (users[updatedUser.email]) {
        users[updatedUser.email] = updatedUser;
        localStorage.setItem('uninotes_users', JSON.stringify(users));
      }
    }
    
    showSuccessNotification('Profil berhasil diperbarui!');
  };

  const handleLoginSuccess = () => {
    // Get login data from localStorage (set by Login component)
    const loginData = localStorage.getItem('uninotes_temp_login');
    if (loginData) {
      const user = JSON.parse(loginData);
      
      // Ensure user has role
      if (!user.role) {
        user.role = 'user';
      }
      
      setUserData(user);
      setIsLoggedIn(true);
      
      // Redirect based on role
      // When Supabase is connected, use:
      // const profile = await authService.getCurrentProfile();
      // if (profile.role === 'admin') redirect to admin dashboard
      // else redirect to user home
      
      if (user.role === 'admin') {
        // Admin goes directly to dashboard (admin panel)
        setCurrentView('dashboard');
      } else {
        // Regular user goes to home
        setCurrentView('home');
      }
      
      localStorage.removeItem('uninotes_temp_login');
      // Save to persistent session
      localStorage.setItem('uninotes_user', JSON.stringify(user));
      showSuccessNotification(`Selamat datang kembali, ${user.fullName}!`);
    }
  };

  const handleRegisterSuccess = (newUser: UserData) => {
    setUserData(newUser);
    setIsLoggedIn(true);
    setCurrentView('home');
    localStorage.setItem('uninotes_user', JSON.stringify(newUser));
    showSuccessNotification(`Akun berhasil dibuat! Selamat datang, ${newUser.fullName}!`);
  };

  const handleLogout = () => {
    localStorage.removeItem('uninotes_user');
    setUserData(null);
    setIsLoggedIn(false);
    setShowUserMenu(false);
    setCurrentView('landing');
    showSuccessNotification('Anda telah keluar. Sampai jumpa!');
  };

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course);
    setCurrentView('course-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setSelectedCourse(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  const switchToRegister = () => {
    setShowLogin(false);
    setShowRegister(true);
  };

  const switchToLogin = () => {
    setShowRegister(false);
    setShowForgotPassword(false);
    setShowLogin(true);
  };

  const switchToForgotPassword = () => {
    setShowLogin(false);
    setShowForgotPassword(true);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsSearching(query.length > 0);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
  };

  // Handle filter changes
  const handleFacultyChange = (faculty: string) => {
    setSelectedFaculty(faculty);
    setSelectedProdi(''); // Reset prodi when faculty changes
  };

  const handleProdiChange = (prodi: string) => {
    setSelectedProdi(prodi);
  };

  const handleSemesterChange = (semester: string) => {
    setSelectedSemester(semester);
  };

  const clearAllFilters = () => {
    setSelectedFaculty('');
    setSelectedProdi('');
    setSelectedSemester('');
  };

  // Get filtered courses based on all filters
  const getFilteredCourses = () => {
    let filteredData = facultiesWithCoursesData;

    // Apply faculty filter
    if (selectedFaculty) {
      filteredData = filteredData.filter(f => f.faculty === selectedFaculty);
    }

    // Flatten and filter courses
    const allCourses: Array<Course & { faculty: string }> = [];
    filteredData.forEach(({ faculty, courses }) => {
      courses.forEach(course => {
        // Apply prodi filter
        if (selectedProdi && course.prodi !== selectedProdi) {
          return;
        }

        // Apply semester filter
        if (selectedSemester && course.semester !== parseInt(selectedSemester)) {
          return;
        }

        // Apply search query filter
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchesCode = course.code.toLowerCase().includes(query);
          const matchesTitle = course.title.toLowerCase().includes(query);
          const matchesDescription = course.description.toLowerCase().includes(query);
          
          if (!matchesCode && !matchesTitle && !matchesDescription) {
            return;
          }
        }

        allCourses.push({ ...course, faculty });
      });
    });

    return allCourses;
  };

  // Check if any filters are active
  const hasActiveFilters = selectedFaculty || selectedProdi || selectedSemester || searchQuery.trim();

  // Filter courses based on search query
  const getFilteredResults = () => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase().trim();
    const results: Array<Course & { faculty: string }> = [];

    facultiesWithCoursesData.forEach(({ faculty, courses }) => {
      courses.forEach(course => {
        const matchesCode = course.code.toLowerCase().includes(query);
        const matchesTitle = course.title.toLowerCase().includes(query);
        const matchesDescription = course.description.toLowerCase().includes(query);
        const matchesFaculty = faculty.toLowerCase().includes(query);

        if (matchesCode || matchesTitle || matchesDescription || matchesFaculty) {
          results.push({ ...course, faculty });
        }
      });
    });

    return results;
  };

  // Dashboard View
  if (currentView === 'dashboard' && userData) {
    return (
      <div className="font-mono">
        {userData.role === 'admin' ? (
          <AdminDashboard 
            adminEmail={userData.email} 
            onLogout={handleLogout}
          />
        ) : (
          <Dashboard 
            userEmail={userData.email} 
            onLogout={handleLogout}
          />
        )}
        {/* Notification Toast */}
        {showNotification && (
          <div className="fixed bottom-6 right-6 bg-black text-white px-6 py-4 border-2 border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] flex items-center gap-4 z-50 animate-in slide-in-from-bottom-5 duration-300 rounded-xl">
             <div className="bg-[#34A853] p-2 text-black rounded-lg">
               <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                 <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
               </svg>
             </div>
             <p className="font-bold font-mono">{notificationMessage}</p>
          </div>
        )}
      </div>
    );
  }

  // Upload Notes View
  if (currentView === 'upload-notes') {
    return <UploadNotes 
      onBack={handleBackToHome} 
      userName={userData?.fullName || ''} 
      userEmail={userData?.email || ''}
      userFaculty={userData?.faculty || ''}
      userProdi={userData?.prodi || ''}
    />;
  }

  // Settings View
  if (currentView === 'settings' && userData) {
    return (
      <SettingsAccount 
        onBack={handleBackToHome} 
        userData={userData} 
        onLogout={handleLogout}
        onUpdateUser={handleUpdateUser} 
      />
    );
  }

  if (currentView === 'course-detail' && selectedCourse) {
    return (
      <div className="min-h-screen bg-white font-mono bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
        {/* Navbar */}
        <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b-2 border-black z-50 transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <button onClick={handleBackToHome} className="flex items-center gap-3 group">
                <div className="bg-[#34A853] border-2 border-black p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:shadow-none transition-all duration-200 ease-out rounded-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="font-black text-2xl text-black tracking-tight group-hover:text-[#34A853] transition-colors">
                    Uni<span className="text-[#4285F4]">Notes</span>
                  </h1>
                </div>
              </button>
              <div className="flex items-center gap-4">
                {isLoggedIn && userData ? (
                  <>
                    <span className="text-sm font-bold text-black hidden sm:block">Halo, {userData.fullName.split(' ')[0]}!</span>
                    <div className="relative">
                      <button 
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center gap-2 bg-white border-2 border-black px-4 py-2 hover:bg-gray-50 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none rounded-lg"
                      >
                        <div className="w-6 h-6 bg-[#FBBC05] border border-black flex items-center justify-center rounded-md">
                          <span className="font-bold text-xs text-black">{userData.fullName.charAt(0).toUpperCase()}</span>
                        </div>
                        <span className="hidden sm:inline font-bold text-black">{userData.fullName.split(' ')[0]}</span>
                        <ChevronDown className="w-4 h-4 text-black" />
                      </button>
                      
                      {/* Dropdown Menu */}
                      {showUserMenu && (
                        <div className="absolute right-0 mt-2 w-64 bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] z-10 rounded-xl overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200">
                          <div className="bg-[#4285F4] px-4 py-3 border-b-2 border-black">
                            <p className="font-bold text-white">{userData.fullName}</p>
                            <p className="text-xs text-white opacity-90">{userData.email}</p>
                            <p className="text-xs text-white bg-black/20 inline-block px-1 mt-1 rounded">{userData.faculty}</p>
                          </div>
                          <div className="py-2">
                            <button 
                              onClick={() => {
                                setCurrentView('settings');
                                setShowUserMenu(false);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="w-full px-4 py-2 text-left text-sm font-bold text-black hover:bg-[#FBBC05] transition-colors flex items-center gap-3 border-b border-gray-100"
                            >
                              <Settings className="w-4 h-4" />
                              Pengaturan Akun
                            </button>
                            <button 
                              onClick={() => {
                                setCurrentView('upload-notes');
                                setShowUserMenu(false);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="w-full px-4 py-2 text-left text-sm font-bold text-black hover:bg-[#34A853] hover:text-white transition-colors flex items-center gap-3"
                            >
                              <FileText className="w-4 h-4" />
                              Catatan Saya
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => setShowLogin(true)}
                      className="bg-black text-white px-6 py-2 border-2 border-black font-bold hover:bg-[#EA4335] hover:border-black transition-all rounded-lg flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(100,100,100,0.5)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:-translate-y-0.5"
                    >
                      <FileText className="w-4 h-4" />
                      Masuk
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>

        <div className="pt-24 pb-12">
          <CourseDetail 
            course={selectedCourse} 
            onBack={handleBackToHome}
          />
        </div>
      </div>
    );
  }

  // Landing Page View
  if (currentView === 'landing') {
    return (
      <div className="font-mono">
        <LandingPage 
          onLoginClick={() => setShowLogin(true)}
          onRegisterClick={() => setShowRegister(true)}
        />
        
        {/* Modals - Rendered here so they can overlay the Landing Page */}
        {showLogin && (
          <Login 
            onClose={() => setShowLogin(false)} 
            onLoginSuccess={handleLoginSuccess}
            onSwitchToRegister={switchToRegister}
            onForgotPassword={switchToForgotPassword}
          />
        )}

        {showRegister && (
          <Register 
            onClose={() => setShowRegister(false)} 
            onRegisterSuccess={handleRegisterSuccess}
            onSwitchToLogin={switchToLogin}
          />
        )}

        {showForgotPassword && (
          <ForgotPassword
            onClose={() => setShowForgotPassword(false)}
            onSwitchToLogin={switchToLogin}
          />
        )}
        
        {/* Notification */}
        {showNotification && (
          <div className="fixed bottom-6 right-6 bg-black text-white px-6 py-4 border-2 border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] flex items-center gap-4 z-50 animate-in slide-in-from-bottom-5 duration-300 rounded-xl">
            <div className="bg-[#34A853] p-2 text-black rounded-lg">
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.586 9.172a1 1 0 00-1.414 1.414L8.586 12l-1.293 1.293a1 1 0 001.414 1.414L10 13.414l1.293 1.293a1 1 0 001.414-1.414L11.414 12l1.293-1.293a1 1 0 00-1.414-1.414L10 10.586z" clipRule="evenodd"/>
              </svg>
            </div>
            <p className="font-bold font-mono">{notificationMessage}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-mono text-black bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px]">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b-2 border-black z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3 group cursor-pointer" onClick={clearAllFilters}>
              <div className="bg-[#34A853] border-2 border-black p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:shadow-none transition-all duration-200 rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-black text-2xl text-black tracking-tight group-hover:text-[#34A853] transition-colors">
                  Uni<span className="text-[#4285F4]">Notes</span>
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {isLoggedIn && userData ? (
                <>
                  <span className="text-sm font-bold text-black hidden sm:block">Halo, {userData.fullName.split(' ')[0]}!</span>
                  <div className="relative">
                    <button 
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 bg-white border-2 border-black px-4 py-2 hover:bg-gray-50 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none rounded-lg"
                    >
                      <div className="w-6 h-6 bg-[#FBBC05] border border-black flex items-center justify-center rounded-md">
                        <span className="font-bold text-xs text-black">{userData.fullName.charAt(0).toUpperCase()}</span>
                      </div>
                      <span className="hidden sm:inline font-bold text-black">{userData.fullName.split(' ')[0]}</span>
                      <ChevronDown className="w-4 h-4 text-black" />
                    </button>
                    
                    {/* Dropdown Menu */}
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-64 bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] z-10 rounded-xl overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200">
                        <div className="bg-[#4285F4] px-4 py-3 border-b-2 border-black">
                          <p className="font-bold text-white">{userData.fullName}</p>
                          <p className="text-xs text-white opacity-90">{userData.email}</p>
                          <p className="text-xs text-white bg-black/20 inline-block px-1 mt-1 rounded">{userData.faculty}</p>
                        </div>
                        <div className="py-2">
                          <button 
                            onClick={() => {
                              setCurrentView('settings');
                              setShowUserMenu(false);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="w-full px-4 py-2 text-left text-sm font-bold text-black hover:bg-[#FBBC05] transition-colors flex items-center gap-3 border-b border-gray-100"
                          >
                            <Settings className="w-4 h-4" />
                            Pengaturan Akun
                          </button>
                          <button 
                            onClick={() => {
                              setCurrentView('upload-notes');
                              setShowUserMenu(false);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="w-full px-4 py-2 text-left text-sm font-bold text-black hover:bg-[#34A853] hover:text-white transition-colors flex items-center gap-3"
                          >
                            <FileText className="w-4 h-4" />
                            Catatan Saya
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => setShowLogin(true)}
                    className="bg-black text-white px-6 py-2 border-2 border-black font-bold hover:bg-[#EA4335] hover:border-black transition-all rounded-lg flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(100,100,100,0.5)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:-translate-y-0.5"
                  >
                    <FileText className="w-4 h-4" />
                    Masuk
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      

      {/* Timeline Section - Only show when logged in */}
      {isLoggedIn && userData && (
        <section className="py-20 border-t-2 border-black bg-gradient-to-b from-white to-blue-50">
          <Timeline userEmail={userData.email} />
        </section>
      )}

      {/* Faculty Section */}
      <section className="py-20 border-t-2 border-black bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex items-center gap-4 mb-10">
            <div className="w-3 h-12 bg-[#EA4335] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-full" />
            <h3 className="text-4xl font-black text-black uppercase tracking-tight">
              {hasActiveFilters ? 'Hasil Filter' : 'Jelajahi'}
            </h3>
          </div>

          {/* Filter Section */}
          <FilterSection
            selectedFaculty={selectedFaculty}
            selectedProdi={selectedProdi}
            selectedSemester={selectedSemester}
            onFacultyChange={handleFacultyChange}
            onProdiChange={handleProdiChange}
            onSemesterChange={handleSemesterChange}
            onClearFilters={clearAllFilters}
            facultiesData={facultiesData}
          />

          {/* Filtered Results */}
          {hasActiveFilters ? (
            <FilteredResults results={getFilteredCourses()} onCourseClick={handleCourseClick} onClearFilters={clearAllFilters} />
          ) : (
            <div className="text-center py-20 bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-2xl">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-[#FBBC05] border-2 border-black rounded-full mb-6 shadow-sm">
                <Search className="w-10 h-10 text-black" />
              </div>
              <h4 className="text-2xl font-black text-black mb-2 uppercase">Gunakan Filter</h4>
              <p className="text-gray-600 max-w-md mx-auto font-bold mb-8">
                Pilih fakultas, program studi, dan semester untuk menemukan catatan.
              </p>
              
              <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
                 {/* Quick Tags Suggestions */}
                 {['Teknik', 'Hukum', 'Ekonomi', 'Semester 1', 'Semester 5'].map((tag) => (
                    <button 
                      key={tag}
                      className="px-4 py-2 bg-gray-100 border-2 border-black rounded-full text-sm font-bold hover:bg-[#4285F4] hover:text-white transition-colors"
                      onClick={() => handleSearch(tag)}
                    >
                      {tag}
                    </button>
                 ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Login Modal */}
      {showLogin && (
        <Login 
          onClose={() => setShowLogin(false)} 
          onLoginSuccess={handleLoginSuccess}
          onSwitchToRegister={switchToRegister}
          onForgotPassword={switchToForgotPassword}
        />
      )}

      {/* Register Modal */}
      {showRegister && (
        <Register 
          onClose={() => setShowRegister(false)} 
          onRegisterSuccess={handleRegisterSuccess}
          onSwitchToLogin={switchToLogin}
        />
      )}

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <ForgotPassword
          onClose={() => setShowForgotPassword(false)}
          onSwitchToLogin={switchToLogin}
        />
      )}

      {/* Notification */}
      {showNotification && (
        <div className="fixed bottom-6 right-6 bg-black text-white px-6 py-4 border-2 border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] flex items-center gap-4 z-50 animate-in slide-in-from-bottom-5 duration-300 rounded-xl">
          <div className="bg-[#34A853] p-2 text-black rounded-lg">
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.586 9.172a1 1 0 00-1.414 1.414L8.586 12l-1.293 1.293a1 1 0 001.414 1.414L10 13.414l1.293 1.293a1 1 0 001.414-1.414L11.414 12l1.293-1.293a1 1 0 00-1.414-1.414L10 10.586z" clipRule="evenodd"/>
            </svg>
          </div>
          <p className="font-bold font-mono">{notificationMessage}</p>
        </div>
      )}
    </div>
  );
}

function CourseCard({ course, onClick }: { course: Course; onClick: () => void }) {
  // Random border color for variety
  const colors = ['border-[#4285F4]', 'border-[#EA4335]', 'border-[#34A853]', 'border-[#FBBC05]'];
  const accentColor = colors[course.code.length % colors.length];

  return (
    <div onClick={onClick} className="bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:-translate-y-1 cursor-pointer group flex flex-col h-full overflow-hidden">
      <div className="p-0">
        <div className={`bg-black text-white px-4 py-3 font-black text-sm flex justify-between items-center`}>
          <span className="bg-white/20 px-2 py-0.5 rounded">{course.code}</span>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-[#FBBC05] border border-black/20"></div>
            <div className="w-2 h-2 rounded-full bg-[#EA4335] border border-black/20"></div>
          </div>
        </div>
      </div>
      
      <div className="p-6 flex-1 flex flex-col">
        <h5 className="font-black text-xl text-black mb-3 leading-tight line-clamp-2 uppercase group-hover:text-[#4285F4] transition-colors">
          {course.title}
        </h5>

        <p className="text-sm font-medium text-gray-600 mb-6 line-clamp-3 flex-1 leading-relaxed">
          {course.description}
        </p>

        <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100 group-hover:border-black transition-colors">
          <div className="flex items-center gap-2 font-bold text-black bg-gray-50 px-3 py-1 rounded-lg border border-transparent group-hover:border-black transition-all">
            <FileText className="w-4 h-4" />
            <span className="text-xs">{course.notes} NOTE</span>
          </div>
          <div className="text-xs font-black text-black bg-[#FBBC05] px-3 py-1.5 border-2 border-black rounded-lg group-hover:bg-[#34A853] group-hover:text-white transition-colors flex items-center gap-1">
            LIHAT <ChevronRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    </div>
  );
}

function FilteredResults({ results, onCourseClick, onClearFilters }: { results: Array<Course & { faculty: string }>, onCourseClick: (course: Course) => void, onClearFilters: () => void }) {
  if (results.length === 0) {
    return (
      <div className="text-center py-20 border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-2xl animate-in fade-in zoom-in-95 duration-300">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-[#EA4335] border-2 border-black mb-6 rounded-full shadow-sm">
          <Search className="w-10 h-10 text-white" />
        </div>
        <h4 className="text-2xl font-black text-black mb-3 uppercase">TIDAK ADA HASIL</h4>
        <p className="text-gray-600 mb-8 font-bold">
          Maaf, kami tidak menemukan hasil untuk filter yang Anda gunakan.
        </p>
        <button 
          onClick={onClearFilters}
          className="bg-black text-white font-bold px-8 py-3 border-2 border-transparent rounded-lg hover:border-black hover:bg-white hover:text-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
        >
          BERSIHKAN FILTER
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Result Info */}
      <div className="bg-[#4285F4] border-2 border-black p-4 mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3 text-white">
          <Search className="w-5 h-5 text-white" />
          <p className="font-bold">
            DITEMUKAN <span className="bg-black px-2 py-0.5 rounded text-[#FBBC05]">{results.length}</span> MATA KULIAH
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {results.map((course, index) => (
          <CourseCard key={index} course={course} onClick={() => onCourseClick(course)} />
        ))}
      </div>
    </div>
  );
}