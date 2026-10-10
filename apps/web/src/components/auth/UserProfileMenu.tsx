'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  User,
  Building2,
  ShieldCheck,
  LogOut,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface UserProfileMenuProps {
  onNavigatePortal?: (view: 'marketplace' | 'pdp' | 'passport' | 'biro' | 'admin') => void;
}

export function UserProfileMenu({ onNavigatePortal }: UserProfileMenuProps) {
  const { user, logout, openAuthModal, quickLogin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => openAuthModal('CUSTOMER')}
          className="px-3 py-1.5 rounded-xl border border-emerald-600 text-emerald-700 hover:bg-emerald-50 text-xs font-bold transition-colors cursor-pointer"
        >
          Masuk
        </button>
        <button
          type="button"
          onClick={() => openAuthModal('CUSTOMER')}
          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
        >
          Daftar
        </button>
      </div>
    );
  }

  const roleBadgeConfig = {
    CUSTOMER: {
      label: 'Jamaah',
      bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: User,
    },
    TRAVEL: {
      label: 'Biro PPIU',
      bg: 'bg-sky-100 text-sky-800 border-sky-200',
      icon: Building2,
    },
    SUPER_ADMIN: {
      label: 'Super Admin',
      bg: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: ShieldCheck,
    },
    ADMIN: {
      label: 'Admin',
      bg: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: ShieldCheck,
    },
    AFFILIATE: {
      label: 'Afiliasi',
      bg: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: Sparkles,
    },
  }[user.role];

  const RoleIcon = roleBadgeConfig.icon;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-2xl border border-slate-200 hover:border-emerald-600 bg-white hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
          {user.name.charAt(0).toUpperCase()}
        </div>

        <div className="text-left hidden sm:block">
          <div className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[130px]">
            {user.name}
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md text-[9px] font-bold border ${roleBadgeConfig.bg}`}
            >
              <RoleIcon className="w-2.5 h-2.5" />
              {roleBadgeConfig.label}
            </span>
          </div>
        </div>

        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-fade-in">
          {/* User Info Card */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 mb-2">
            <div className="text-xs font-extrabold text-slate-900">{user.name}</div>
            <div className="text-[11px] text-slate-500 font-mono truncate">{user.email}</div>
            {user.travelName && (
              <div className="mt-1.5 pt-1.5 border-t border-slate-200/60 text-[10px] text-sky-900 font-semibold flex items-center gap-1">
                <Building2 className="w-3 h-3 text-sky-600" />
                <span className="truncate">{user.travelName}</span>
              </div>
            )}
            {user.skKemenag && (
              <div className="text-[9px] text-emerald-800 font-medium">
                {user.skKemenag}
              </div>
            )}
          </div>

          {/* Portal Navigation Shortcuts */}
          <div className="space-y-1 mb-2 pb-2 border-b border-slate-100 text-xs">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onNavigatePortal?.('marketplace');
              }}
              className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-50 font-medium text-slate-700 cursor-pointer"
            >
              🛒 Katalog Paket Umroh
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onNavigatePortal?.('passport');
              }}
              className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-50 font-medium text-slate-700 cursor-pointer"
            >
              📑 Dokumen Paspor Saya
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onNavigatePortal?.('biro');
              }}
              className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-50 font-medium text-slate-700 cursor-pointer flex items-center justify-between"
            >
              <span>🏢 Dashboard Biro B2B</span>
              {user.role !== 'TRAVEL' && user.role !== 'SUPER_ADMIN' && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">Khusus Biro</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onNavigatePortal?.('admin');
              }}
              className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-50 font-medium text-slate-700 cursor-pointer flex items-center justify-between"
            >
              <span>🛡️ Super Admin Backoffice</span>
              {user.role !== 'SUPER_ADMIN' && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">Khusus Auditor</span>
              )}
            </button>
          </div>

          {/* Quick Role Switcher (Praktis untuk review & demo) */}
          <div className="px-2 py-1 mb-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Ganti Role Demo:
            </div>
            <div className="grid grid-cols-3 gap-1">
              <button
                type="button"
                onClick={() => {
                  quickLogin('CUSTOMER');
                  setIsOpen(false);
                }}
                className={`text-[10px] py-1 px-1.5 rounded-md font-bold transition-all cursor-pointer ${
                  user.role === 'CUSTOMER'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Jamaah
              </button>
              <button
                type="button"
                onClick={() => {
                  quickLogin('TRAVEL');
                  setIsOpen(false);
                }}
                className={`text-[10px] py-1 px-1.5 rounded-md font-bold transition-all cursor-pointer ${
                  user.role === 'TRAVEL'
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Biro PPIU
              </button>
              <button
                type="button"
                onClick={() => {
                  quickLogin('SUPER_ADMIN');
                  setIsOpen(false);
                }}
                className={`text-[10px] py-1 px-1.5 rounded-md font-bold transition-all cursor-pointer ${
                  user.role === 'SUPER_ADMIN'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Admin
              </button>
            </div>
          </div>

          {/* Logout */}
          <div className="pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Keluar (Logout)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
