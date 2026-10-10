'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/auth';
import {
  X,
  User,
  Building2,
  ShieldCheck,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';

export function AuthModal() {
  const {
    isAuthModalOpen,
    authModalDefaultRole,
    closeAuthModal,
    login,
    register,
    quickLogin,
    isLoading,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>(authModalDefaultRole);
  const [showPassword, setShowPassword] = useState(false);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [travelName, setTravelName] = useState('');
  const [skKemenag, setSkKemenag] = useState('');
  const [city, setCity] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setSelectedRole(authModalDefaultRole);
    setErrorMessage(null);
  }, [authModalDefaultRole, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (mode === 'login') {
      const res = await login({
        email,
        password,
        roleHint: selectedRole,
      });
      if (!res.success) {
        setErrorMessage(res.message || 'Login gagal. Silakan periksa email dan password.');
      }
    } else {
      const res = await register({
        name,
        email,
        password,
        phone,
        role: selectedRole === 'TRAVEL' ? 'TRAVEL' : 'CUSTOMER',
        travelName,
        skKemenag,
        city,
      });
      if (!res.success) {
        setErrorMessage(res.message || 'Registrasi gagal. Coba lagi.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 relative">
          <button
            type="button"
            onClick={closeAuthModal}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-8 rounded-xl bg-emerald-500/30 border border-emerald-400/40 flex items-center justify-center text-emerald-300 font-black text-sm">
              UH
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Enterprise Authentication Portal
            </span>
          </div>

          <h2 className="text-xl font-extrabold text-white">
            {mode === 'login' ? 'Masuk ke UmrohHub' : 'Daftar Akun Baru'}
          </h2>
          <p className="text-xs text-emerald-200/90 mt-1">
            Pilih portal sesuai peran Anda untuk melanjutkan ke layanan terintegrasi
          </p>

          {/* Role Selector Tabs */}
          <div className="grid grid-cols-3 gap-1.5 mt-5 bg-black/20 p-1.5 rounded-2xl backdrop-blur-xs">
            <button
              type="button"
              onClick={() => {
                setSelectedRole('CUSTOMER');
                setErrorMessage(null);
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedRole === 'CUSTOMER'
                  ? 'bg-white text-emerald-950 shadow-xs'
                  : 'text-emerald-100/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Jamaah</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedRole('TRAVEL');
                setErrorMessage(null);
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedRole === 'TRAVEL'
                  ? 'bg-white text-emerald-950 shadow-xs'
                  : 'text-emerald-100/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Biro PPIU</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedRole('SUPER_ADMIN');
                setErrorMessage(null);
                setMode('login'); // Super admin cannot register freely
              }}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedRole === 'SUPER_ADMIN'
                  ? 'bg-white text-emerald-950 shadow-xs'
                  : 'text-emerald-100/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* Tab Switch: Masuk / Daftar */}
        {selectedRole !== 'SUPER_ADMIN' && (
          <div className="flex border-b border-slate-100 bg-slate-50/70 px-6 pt-3">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`pb-3 text-xs font-bold border-b-2 px-4 cursor-pointer transition-colors ${
                mode === 'login'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`pb-3 text-xs font-bold border-b-2 px-4 cursor-pointer transition-colors ${
                mode === 'register'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {selectedRole === 'TRAVEL' ? 'Daftar Mitra Biro PPIU' : 'Daftar Jamaah'}
            </button>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap {selectedRole === 'TRAVEL' ? 'Penanggung Jawab Biro' : 'Jamaah'}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: H. Ahmad Syarifuddin"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            )}

            {mode === 'register' && selectedRole === 'TRAVEL' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Resmi Biro PPIU
                    </label>
                    <input
                      type="text"
                      required
                      value={travelName}
                      onChange={(e) => setTravelName(e.target.value)}
                      placeholder="Contoh: PT Barakah Wisata"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nomor SK Kemenag RI
                    </label>
                    <input
                      type="text"
                      required
                      value={skKemenag}
                      onChange={(e) => setSkKemenag(e.target.value)}
                      placeholder="PPIU No. 412/2021"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kota Domisili Kantor Pusat
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Contoh: Jakarta Selatan"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Alamat Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    selectedRole === 'TRAVEL'
                      ? 'direktur@namabiro.com'
                      : selectedRole === 'SUPER_ADMIN'
                      ? 'admin@kemenag-hub.id'
                      : 'jamaah@email.com'
                  }
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nomor WhatsApp / HP Aktif
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="081234567890"
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2 rounded-xl border border-slate-200 text-xs focus:outline-emerald-600"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>
                {isLoading
                  ? 'Memproses...'
                  : mode === 'login'
                  ? `Masuk Portal ${
                      selectedRole === 'TRAVEL'
                        ? 'Biro PPIU'
                        : selectedRole === 'SUPER_ADMIN'
                        ? 'Super Admin'
                        : 'Jamaah'
                    }`
                  : 'Daftar Sekarang'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Login Bar (1-Click Switch untuk evaluasi instan) */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Akses Cepat Demo (1-Klik Tanpa Mengetik):</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => quickLogin('CUSTOMER')}
                className="p-2 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-900 text-[11px] font-bold transition-all text-center cursor-pointer shadow-2xs"
              >
                👤 Jamaah Demo
              </button>

              <button
                type="button"
                onClick={() => quickLogin('TRAVEL')}
                className="p-2 rounded-xl border border-sky-200 bg-sky-50/70 hover:bg-sky-100 text-sky-900 text-[11px] font-bold transition-all text-center cursor-pointer shadow-2xs"
              >
                🏢 Biro Al-Madinah
              </button>

              <button
                type="button"
                onClick={() => quickLogin('SUPER_ADMIN')}
                className="p-2 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100 text-purple-900 text-[11px] font-bold transition-all text-center cursor-pointer shadow-2xs"
              >
                🛡️ Super Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
