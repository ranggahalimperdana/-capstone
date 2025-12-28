import { Mail, Lock, Eye, EyeOff, X, Key, ArrowRight, Check, AlertCircle, ShieldCheck, RefreshCw } from 'lucide-react';
import { useState } from 'react';

interface ForgotPasswordProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export default function ForgotPassword({ onClose, onSwitchToLogin }: ForgotPasswordProps) {
  const [step, setStep] = useState<'email' | 'verify-pin' | 'new-password' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [passwordForm, setPasswordForm] = useState({
    new: '',
    confirm: ''
  });
  const [showPassword, setShowPassword] = useState({
    new: false,
    confirm: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // PIN Verification State
  const [inputPin, setInputPin] = useState('');
  const [generatedPin, setGeneratedPin] = useState('');
  const [pinNotification, setPinNotification] = useState<string | null>(null);

  // Step 1: Verify Email & Generate PIN
  const handleVerifyEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Email harus diisi');
      return;
    }

    setIsLoading(true);

    // Simulate API Check
    setTimeout(() => {
      const allUsersStr = localStorage.getItem('uninotes_users');
      if (allUsersStr) {
        const allUsers = JSON.parse(allUsersStr);
        if (allUsers[email]) {
          // Email found -> Generate PIN
          const mockPin = Math.floor(100000 + Math.random() * 900000).toString();
          setGeneratedPin(mockPin);
          
          setIsLoading(false);
          setStep('verify-pin');
          
          // Show simulated email notification
          setPinNotification(`Kode Verifikasi: ${mockPin}`);
          
          // Hide notification after 10 seconds
          setTimeout(() => setPinNotification(null), 10000);
        } else {
          setIsLoading(false);
          setError('Email tidak ditemukan dalam sistem kami.');
        }
      } else {
        setIsLoading(false);
        setError('Belum ada pengguna terdaftar.');
      }
    }, 1500);
  };

  // Step 2: Verify PIN
  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (inputPin.length !== 6) {
      setError('Masukkan 6 digit kode PIN');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      if (inputPin === generatedPin) {
        setIsLoading(false);
        setStep('new-password');
      } else {
        setIsLoading(false);
        setError('Kode PIN salah. Silakan coba lagi.');
      }
    }, 1000);
  };

  const handleResendPin = () => {
    const mockPin = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedPin(mockPin);
    setPinNotification(`Kode Verifikasi Baru: ${mockPin}`);
    setTimeout(() => setPinNotification(null), 10000);
  };

  // Step 3: Reset Password
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (passwordForm.new.length < 6) {
      setError('Kata sandi minimal 6 karakter');
      return;
    }

    if (passwordForm.new !== passwordForm.confirm) {
      setError('Konfirmasi kata sandi tidak cocok');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const allUsersStr = localStorage.getItem('uninotes_users');
      if (allUsersStr) {
        const allUsers = JSON.parse(allUsersStr);
        
        // Update password for this user
        if (allUsers[email]) {
          allUsers[email].password = passwordForm.new;
          localStorage.setItem('uninotes_users', JSON.stringify(allUsers));
          
          setIsLoading(false);
          setStep('success');
        } else {
           setIsLoading(false);
           setError('Terjadi kesalahan. Silakan coba lagi.');
        }
      }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 font-mono">
      <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-md mx-4 animate-in zoom-in-95 duration-300 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-[#EA4335] border-2 border-black flex items-center justify-center transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] z-10"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* HEADER */}
        <div className="pt-12 pb-8 px-8 text-center bg-[#4285F4] border-b-2 border-black">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white border-2 border-black mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Key className="w-8 h-8 text-black" />
          </div>
          <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tight text-stroke-black">
            Lupa Sandi?
          </h2>
          <p className="text-white font-bold opacity-90">
            {step === 'email' && 'Masukkan email untuk mencari akunmu'}
            {step === 'verify-pin' && 'Cek email Anda untuk kode verifikasi'}
            {step === 'new-password' && 'Buat kata sandi baru yang aman'}
            {step === 'success' && 'Kata sandi berhasil diperbarui!'}
          </p>
        </div>

        {/* BODY */}
        <div className="p-8">

           {/* PIN NOTIFICATION (Simulated Email) */}
           {pinNotification && (
              <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[90%] bg-[#34A853] text-white border-2 border-black p-3 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-50 animate-bounce">
                <div className="flex items-center gap-3">
                  <Mail className="w-6 h-6" />
                  <div>
                     <p className="text-xs font-bold uppercase opacity-80">Email Masuk</p>
                     <p className="font-black text-lg">{pinNotification}</p>
                  </div>
                </div>
              </div>
           )}
          
          {/* STEP 1: EMAIL */}
          {step === 'email' && (
            <form onSubmit={handleVerifyEmail} className="space-y-6">
              {error && (
                <div className="bg-red-50 border-2 border-[#EA4335] p-3 flex items-center gap-3 text-[#EA4335] font-bold text-sm">
                  <AlertCircle className="w-5 h-5" />
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-black text-black mb-2 uppercase">Email Terdaftar</label>
                <div className="relative">
                   <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center border-r-2 border-black bg-gray-100 z-10 pointer-events-none">
                    <Mail className="w-5 h-5 text-black" />
                  </div>
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-16 pr-4 py-3 border-2 border-black font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all placeholder:font-normal placeholder:text-gray-400"
                    placeholder="nama@email.com"
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-black text-white px-6 py-4 border-2 border-black hover:bg-[#FBBC05] hover:text-black transition-all flex items-center justify-center gap-3 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                   <>Processing...</>
                ) : (
                  <>
                    Kirim Kode <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: VERIFY PIN */}
          {step === 'verify-pin' && (
            <form onSubmit={handleVerifyPin} className="space-y-6">
              {error && (
                <div className="bg-red-50 border-2 border-[#EA4335] p-3 flex items-center gap-3 text-[#EA4335] font-bold text-sm">
                  <AlertCircle className="w-5 h-5" />
                  {error}
                </div>
              )}

              <div className="text-center mb-6">
                 <div className="bg-gray-100 border-2 border-black p-4 inline-block rounded-full mb-4">
                    <ShieldCheck className="w-8 h-8 text-[#4285F4]" />
                 </div>
                 <h3 className="font-bold text-lg">Verifikasi Identitas</h3>
                 <p className="text-sm text-gray-600">Kode PIN telah dikirim ke <span className="font-bold text-black">{email}</span></p>
              </div>

              <div>
                <label className="block text-sm font-black text-black mb-2 uppercase text-center">Masukkan 6 Digit PIN</label>
                <div className="flex justify-center">
                  <input 
                    type="text"
                    maxLength={6}
                    value={inputPin}
                    onChange={(e) => setInputPin(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-48 text-center text-3xl tracking-[0.5em] font-black py-3 border-b-4 border-black focus:border-[#4285F4] focus:outline-none transition-all placeholder:text-gray-300"
                    placeholder="••••••"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#4285F4] text-white px-6 py-4 border-2 border-black hover:bg-[#3367d6] transition-all flex items-center justify-center gap-3 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Memverifikasi...' : 'Verifikasi PIN'}
                </button>
                
                <button
                  type="button"
                  onClick={handleResendPin}
                  className="w-full bg-white text-black px-4 py-2 hover:bg-gray-100 transition-all flex items-center justify-center gap-2 font-bold text-sm"
                >
                  <RefreshCw className="w-4 h-4" /> Kirim Ulang Kode
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: NEW PASSWORD */}
          {step === 'new-password' && (
            <form onSubmit={handleResetPassword} className="space-y-6">
               {error && (
                <div className="bg-red-50 border-2 border-[#EA4335] p-3 flex items-center gap-3 text-[#EA4335] font-bold text-sm">
                  <AlertCircle className="w-5 h-5" />
                  {error}
                </div>
              )}

              {/* New Password */}
              <div>
                <label className="block text-sm font-black text-black mb-2 uppercase">Kata Sandi Baru</label>
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center border-r-2 border-black bg-gray-100 z-10 pointer-events-none">
                    <Key className="w-5 h-5 text-black" />
                  </div>
                  <input 
                    type={showPassword.new ? "text" : "password"}
                    value={passwordForm.new}
                    onChange={(e) => setPasswordForm({...passwordForm, new: e.target.value})}
                    className="w-full pl-16 pr-12 py-3 border-2 border-black font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all placeholder:font-normal placeholder:text-gray-400"
                    placeholder="Minimal 6 karakter"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword({...showPassword, new: !showPassword.new})}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black hover:text-[#4285F4]"
                  >
                    {showPassword.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-black text-black mb-2 uppercase">Konfirmasi Kata Sandi</label>
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center border-r-2 border-black bg-gray-100 z-10 pointer-events-none">
                    <Lock className="w-5 h-5 text-black" />
                  </div>
                  <input 
                    type={showPassword.confirm ? "text" : "password"}
                    value={passwordForm.confirm}
                    onChange={(e) => setPasswordForm({...passwordForm, confirm: e.target.value})}
                    className="w-full pl-16 pr-12 py-3 border-2 border-black font-bold focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all placeholder:font-normal placeholder:text-gray-400"
                    placeholder="Ulangi kata sandi"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword({...showPassword, confirm: !showPassword.confirm})}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black hover:text-[#4285F4]"
                  >
                    {showPassword.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#34A853] text-white px-6 py-4 border-2 border-black hover:bg-[#2d9147] transition-all flex items-center justify-center gap-3 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Menyimpan...' : 'Simpan Kata Sandi'}
              </button>
            </form>
          )}

          {/* STEP 3: SUCCESS */}
          {step === 'success' && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-[#34A853] text-white rounded-full flex items-center justify-center mx-auto border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Check className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-xl font-black text-black uppercase mb-2">Berhasil!</h3>
                <p className="text-gray-600 font-bold">Kata sandi Anda telah diperbarui. Silakan masuk menggunakan kata sandi baru.</p>
              </div>
              <button
                onClick={onSwitchToLogin}
                className="w-full bg-black text-white px-6 py-4 border-2 border-black hover:bg-gray-800 transition-all font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                Masuk Sekarang
              </button>
            </div>
          )}

        </div>
        
        {/* Footer Link */}
        {step !== 'success' && (
          <div className="bg-gray-50 px-8 py-4 text-center border-t-2 border-black">
             <button
                onClick={onSwitchToLogin}
                className="text-gray-500 font-bold text-sm hover:text-black hover:underline"
              >
                Batal & Kembali ke Login
              </button>
          </div>
        )}
      </div>
    </div>
  );
}
