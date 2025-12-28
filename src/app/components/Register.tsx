import { BookOpen, Mail, Lock, Eye, EyeOff, X, UserPlus, User, GraduationCap, Building2 } from 'lucide-react';
import { useState } from 'react';
import { getProdiList, getFacultyList, getProdiByFaculty } from '../data/allCoursesData';

interface RegisterProps {
  onClose: () => void;
  onRegisterSuccess: (userData: UserData) => void;
  onSwitchToLogin: () => void;
}

interface UserData {
  fullName: string;
  email: string;
  faculty: string;
  prodi: string;
  role: string;
}

export default function Register({ onClose, onRegisterSuccess, onSwitchToLogin }: RegisterProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    faculty: '',
    prodi: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Get all available faculties and prodi
  const availableFaculties = getFacultyList();
  const availableProdi = formData.faculty 
    ? getProdiByFaculty(formData.faculty)
    : [];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validate full name
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Nama lengkap harus diisi';
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Nama lengkap minimal 3 karakter';
    }

    // Validate email
    if (!formData.email) {
      newErrors.email = 'Email harus diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    // Validate faculty
    if (!formData.faculty) {
      newErrors.faculty = 'Fakultas harus dipilih';
    }

    // Validate prodi
    if (!formData.prodi) {
      newErrors.prodi = 'Program studi harus dipilih';
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = 'Kata sandi harus diisi';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Kata sandi minimal 6 karakter';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = 'Kata sandi harus mengandung huruf besar dan kecil';
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi kata sandi harus diisi';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Kata sandi tidak cocok';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // If faculty changes, reset prodi
      if (field === 'faculty') {
        newData.prodi = '';
      }
      
      return newData;
    });
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    setTimeout(() => {
      const userData: UserData = {
        fullName: formData.fullName,
        email: formData.email,
        faculty: formData.faculty,
        prodi: formData.prodi,
        role: 'user' // Default role is 'user'
      };

      // Save to localStorage for login functionality
      const savedUsers = localStorage.getItem('uninotes_users');
      const users = savedUsers ? JSON.parse(savedUsers) : {};
      users[formData.email] = userData;
      localStorage.setItem('uninotes_users', JSON.stringify(users));

      setIsLoading(false);
      onRegisterSuccess(userData);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto py-8 font-mono">
      {/* Modal */}
      <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-2xl mx-4 animate-in zoom-in-95 duration-300 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-[#EA4335] border-2 border-black flex items-center justify-center transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Header */}
        <div className="pt-12 pb-8 px-8 text-center bg-[#4285F4] border-b-2 border-black">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white border-2 border-black mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <UserPlus className="w-8 h-8 text-black" />
          </div>

          <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tight text-stroke-black">
            Buat Akun Baru
          </h2>
          <p className="text-white font-bold">
            Bergabung dengan ribuan mahasiswa lainnya
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5">
          {/* Grid Layout for Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Full Name */}
            <div className="md:col-span-2">
              <label htmlFor="fullName" className="block text-sm font-black text-black mb-2 uppercase">
                Nama Lengkap <span className="text-[#EA4335]">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center border-r-2 border-black bg-gray-100 z-10 pointer-events-none">
                  <User className="w-5 h-5 text-black" />
                </div>
                <input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  placeholder="Masukkan nama lengkap..."
                  className={`w-full pl-14 pr-4 py-3 border-2 ${
                    errors.fullName ? 'border-[#EA4335] bg-red-50' : 'border-black'
                  } focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-bold placeholder:text-gray-400 placeholder:font-normal`}
                />
              </div>
              {errors.fullName && (
                <p className="mt-1 text-sm text-[#EA4335] font-bold bg-[#EA4335]/10 p-1 border-l-2 border-[#EA4335]">{errors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div className="md:col-span-2">
              <label htmlFor="email" className="block text-sm font-black text-black mb-2 uppercase">
                Email <span className="text-[#EA4335]">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center border-r-2 border-black bg-gray-100 z-10 pointer-events-none">
                  <Mail className="w-5 h-5 text-black" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="nama@email.com"
                  className={`w-full pl-14 pr-4 py-3 border-2 ${
                    errors.email ? 'border-[#EA4335] bg-red-50' : 'border-black'
                  } focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-bold placeholder:text-gray-400 placeholder:font-normal`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-[#EA4335] font-bold bg-[#EA4335]/10 p-1 border-l-2 border-[#EA4335]">{errors.email}</p>
              )}
            </div>

            {/* Faculty */}
            <div className="md:col-span-2">
              <label htmlFor="faculty" className="block text-sm font-black text-black mb-2 uppercase">
                Fakultas <span className="text-[#EA4335]">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center border-r-2 border-black bg-gray-100 z-10 pointer-events-none">
                  <Building2 className="w-5 h-5 text-black" />
                </div>
                <select
                  id="faculty"
                  value={formData.faculty}
                  onChange={(e) => handleChange('faculty', e.target.value)}
                  className={`w-full pl-14 pr-4 py-3 border-2 ${
                    errors.faculty ? 'border-[#EA4335] bg-red-50' : 'border-black'
                  } focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all appearance-none bg-white cursor-pointer font-bold`}
                >
                  <option value="">Pilih fakultas...</option>
                  {availableFaculties.map((faculty) => (
                    <option key={faculty} value={faculty}>
                      {faculty}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-black border-l-2 border-black bg-[#34A853]">
                  <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {errors.faculty && (
                <p className="mt-1 text-sm text-[#EA4335] font-bold bg-[#EA4335]/10 p-1 border-l-2 border-[#EA4335]">{errors.faculty}</p>
              )}
            </div>

            {/* Prodi */}
            <div className="md:col-span-2">
              <label htmlFor="prodi" className="block text-sm font-black text-black mb-2 uppercase">
                Program Studi <span className="text-[#EA4335]">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center border-r-2 border-black bg-gray-100 z-10 pointer-events-none">
                  <GraduationCap className="w-5 h-5 text-black" />
                </div>
                <select
                  id="prodi"
                  value={formData.prodi}
                  onChange={(e) => handleChange('prodi', e.target.value)}
                  className={`w-full pl-14 pr-4 py-3 border-2 ${
                    errors.prodi ? 'border-[#EA4335] bg-red-50' : 'border-black'
                  } focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all appearance-none bg-white cursor-pointer font-bold`}
                >
                  <option value="">Pilih program studi...</option>
                  {availableProdi.map((prodi) => (
                    <option key={prodi} value={prodi}>
                      {prodi}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-black border-l-2 border-black bg-[#34A853]">
                  <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {errors.prodi && (
                <p className="mt-1 text-sm text-[#EA4335] font-bold bg-[#EA4335]/10 p-1 border-l-2 border-[#EA4335]">{errors.prodi}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-black text-black mb-2 uppercase">
                Kata Sandi <span className="text-[#EA4335]">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center border-r-2 border-black bg-gray-100 z-10 pointer-events-none">
                  <Lock className="w-5 h-5 text-black" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Min. 6 karakter"
                  className={`w-full pl-14 pr-12 py-3 border-2 ${
                    errors.password ? 'border-[#EA4335] bg-red-50' : 'border-black'
                  } focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-bold placeholder:text-gray-400 placeholder:font-normal`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black hover:text-[#4285F4] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-[#EA4335] font-bold bg-[#EA4335]/10 p-1 border-l-2 border-[#EA4335]">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-black text-black mb-2 uppercase">
                Konfirmasi Kata Sandi <span className="text-[#EA4335]">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center border-r-2 border-black bg-gray-100 z-10 pointer-events-none">
                  <Lock className="w-5 h-5 text-black" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder="Ulangi kata sandi"
                  className={`w-full pl-14 pr-12 py-3 border-2 ${
                    errors.confirmPassword ? 'border-[#EA4335] bg-red-50' : 'border-black'
                  } focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-bold placeholder:text-gray-400 placeholder:font-normal`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-black hover:text-[#4285F4] transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-[#EA4335] font-bold bg-[#EA4335]/10 p-1 border-l-2 border-[#EA4335]">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="bg-[#4285F4]/10 border-2 border-[#4285F4] p-4 border-dashed">
            <p className="text-sm text-black font-bold">
              Dengan mendaftar, Anda menyetujui{' '}
              <a href="#" className="text-[#4285F4] hover:underline decoration-2">
                Syarat & Ketentuan
              </a>{' '}
              serta{' '}
              <a href="#" className="text-[#4285F4] hover:underline decoration-2">
                Kebijakan Privasi
              </a>{' '}
              UniNotes.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#34A853] text-white font-black uppercase tracking-wider py-4 px-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Mendaftar...
              </span>
            ) : (
              'Daftar Sekarang'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="bg-gray-100 px-8 py-6 text-center border-t-2 border-black">
          <p className="text-black font-bold">
            Sudah punya akun?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-[#4285F4] hover:underline decoration-2 font-black uppercase"
            >
              Masuk di sini
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}