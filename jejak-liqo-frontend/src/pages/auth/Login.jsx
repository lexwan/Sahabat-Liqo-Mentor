import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, Loader2, Sparkles, Award, Users, TrendingUp } from 'lucide-react';
import { login } from '../../api/auth';
import toast, { Toaster } from 'react-hot-toast';

import BlockedAccountModal from '../../components/ui/BlockedAccountModal';
import useLoginRedirect from '../../hooks/useLoginRedirect';
import logoLight from '../../assets/images/logo/LogoShaf_Terang.png';
import carousel1 from '../../assets/images/carousel1.jpeg';
import carousel3 from '../../assets/images/carousel3.jpeg';
import carousel5 from '../../assets/images/carousel5.jpeg';

const Login = () => {
  const { redirectByRole } = useLoginRedirect();


  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [blockedMessage, setBlockedMessage] = useState('');
  const [blockedAt, setBlockedAt] = useState('');


  const slideshowImages = [
    {
      url: carousel3,
      alt: 'Mentoring',
      title: 'Kolaborasi Tim',
      description: 'Aplikasi terbaik untuk pencatatan',
      icon: Users
    },
    {
      url: carousel1,
      alt: 'Education',
      title: 'Laporan Terbaru',
      description: 'Generate laporan dengan satu klik',
      icon: Award
    },
    {
      url: carousel5,
      alt: 'Teamwork',
      title: 'Pengembangan Karakter',
      description: 'Membimbing generasi muda menuju Karaktek yang baik',
      icon: TrendingUp
    }
  ];

  const features = [
    { icon: Sparkles, text: 'Dashboard Intuitif', color: 'from-emerald-400 to-teal-400' },
    { icon: Award, text: 'Tracking Progress', color: 'from-green-400 to-emerald-400' },
    { icon: Users, text: 'Kolaborasi Tim', color: 'from-teal-400 to-cyan-400' }
  ];


  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideshowImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slideshowImages.length]);

  useEffect(() => {
    const showLogoutToast = localStorage.getItem('showLogoutSuccessToast');
    if (showLogoutToast === 'true') {
      toast.success('Logout berhasil.', { duration: 2000 });
      localStorage.removeItem('showLogoutSuccessToast');
    }
  }, []);


  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { user } = await login(email, password);
      
      toast.success('Login berhasil! Mengalihkan ke dashboard...', {
        duration: 2000,
        style: {
          background: '#10b981',
          color: '#ffffff',
          fontWeight: '600'
        }
      });

      setTimeout(() => {
        redirectByRole(user);
      }, 2000);

    } catch (err) {
      if (err.response && err.response.status === 422 && err.response.data.errors && err.response.data.errors.email) {
        const emailError = err.response.data.errors.email[0];
        if (emailError.includes('diblokir') || emailError.includes('blocked')) {
          setBlockedMessage(emailError);
          const dateMatch = emailError.match(/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}/);
          if (dateMatch) {
            setBlockedAt(dateMatch[0]);
          }
          setShowBlockedModal(true);
          return;
        }
      }
      
      let errorMessage = 'Email atau password salah. Silakan periksa kembali.';
      
      if (err.response) {
        if (err.response.status === 401 || err.response.status === 422) {
          errorMessage = 'Email atau password salah. Silakan periksa kembali.';
        } else if (err.response.status === 429) {
          errorMessage = 'Terlalu banyak percobaan login. Silakan tunggu beberapa saat.';
        } else if (err.response.status >= 500) {
          errorMessage = 'Server sedang bermasalah. Silakan coba lagi nanti.';
        }
      } else if (err.request) {
        errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 relative overflow-hidden">
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-300/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>


      <div className="hidden lg:flex lg:w-1/2 relative z-10 p-12 flex-col justify-between">
        

        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/30 transform hover:scale-110 transition-transform">
              <img src={logoLight} alt="Logo" className="w-12 h-12 object-contain" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Sahabat Liqo
              </h1>
              <p className="text-emerald-600 font-medium">Mentoring Management System</p>
            </div>
          </div>
        </div>


        <div className="flex-1 flex items-center justify-center mb-8">
          <div className="relative w-full max-w-2xl">

            <div className="relative h-96 rounded-3xl overflow-hidden shadow-2xl">
              {slideshowImages.map((image, index) => {
                const Icon = image.icon;
                return (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-all duration-1000 ${
                      index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                    }`}
                  >
                    <img 
                      src={image.url} 
                      alt={image.alt}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/90 via-emerald-900/50 to-transparent"></div>
                    

                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-3xl font-bold text-white">{image.title}</h3>
                      </div>
                      <p className="text-white/90 text-lg">{image.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>


            <div className="flex justify-center gap-2 mt-6">
              {slideshowImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? 'bg-emerald-600 w-8'
                      : 'bg-emerald-300 w-2 hover:bg-emerald-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>


        <div className="grid grid-cols-3 gap-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 border border-emerald-100"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-3 shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-semibold text-gray-700">{feature.text}</p>
              </div>
            );
          })}
        </div>
      </div>


      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative z-10">
        <div className="w-full max-w-md">
          

          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl shadow-2xl shadow-emerald-500/30 mb-4">
              <img src={logoLight} alt="Logo" className="w-14 h-14 object-contain" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Shaf Pembangunan
            </h1>
          </div>


          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 lg:p-10 border border-emerald-100 hover:shadow-emerald-200/50 transition-all">
            

            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mb-4 shadow-lg shadow-emerald-500/30">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Selamat Datang!
              </h2>
              <p className="text-gray-600">Silakan masuk ke akun Anda</p>
            </div>


            <form onSubmit={handleLogin} className="space-y-5">
              

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-emerald-500 group-focus-within:text-emerald-600 transition-colors" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@example.com"
                    required
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200
                             bg-gray-50 text-gray-800
                             focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500
                             placeholder-gray-400 transition-all hover:border-emerald-300"
                  />
                </div>
              </div>


              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-emerald-500 group-focus-within:text-emerald-600 transition-colors" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password"
                    required
                    className="w-full pl-12 pr-12 py-3.5 rounded-xl border-2 border-gray-200
                             bg-gray-50 text-gray-800
                             focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500
                             placeholder-gray-400 transition-all hover:border-emerald-300"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>


              <div className="text-right">
                <a
                  href="#"
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold transition-colors hover:underline"
                  onClick={(e) => e.preventDefault()}
                >
                  Lupa password?
                </a>
              </div>


              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 animate-shake">
                  <p className="text-red-600 text-sm text-center font-medium">{error}</p>
                </div>
              )}


              <button
                type="submit"
                disabled={isLoading || !email || !password}
                className="w-full py-4 px-4 bg-gradient-to-r from-emerald-500 to-teal-600
                         hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-lg
                         rounded-xl transition-all duration-300 transform hover:scale-[1.02]
                         focus:outline-none focus:ring-4 focus:ring-emerald-500/50
                         shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40
                         active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed 
                         disabled:hover:scale-100 disabled:shadow-none
                         flex items-center justify-center gap-3 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                {isLoading && <Loader2 className="w-5 h-5 animate-spin relative z-10" />}
                <span className="relative z-10">{isLoading ? 'Memproses...' : 'Masuk Sekarang'}</span>
              </button>
            </form>


            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">Atau hubungi admin</span>
              </div>
            </div>


            <div className="text-center">
              <p className="text-sm text-gray-600">
                Butuh bantuan?{' '}
                <a href="#" className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline">
                  Hubungi Support
                </a>
              </p>
            </div>
          </div>


          <div className="lg:hidden grid grid-cols-3 gap-3 mt-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-lg text-center border border-emerald-100"
                >
                  <div className={`w-10 h-10 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center mx-auto mb-2 shadow-md`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-xs font-semibold text-gray-700">{feature.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>


      <BlockedAccountModal
        isOpen={showBlockedModal}
        onClose={() => {
          setShowBlockedModal(false);
          setBlockedMessage('');
          setBlockedAt('');
        }}
        message={blockedMessage}
        blockedAt={blockedAt}
      />

      <Toaster position="top-right" />
    </div>
  );
};

export default Login;