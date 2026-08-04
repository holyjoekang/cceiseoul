import React, { useState, useEffect } from 'react';
import { CenterId, GoogleSheetsConfig } from '../types';
import { CENTERS } from '../data/mockData';
import {
  Building2,
  CalendarCheck,
  ShieldCheck,
  Search,
  Database,
  Clock,
  Sparkles,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface HeaderProps {
  selectedCenterId: CenterId;
  onSelectCenter: (id: CenterId) => void;
  activeTab: 'dashboard' | 'my-reservations' | 'admin';
  onChangeTab: (tab: 'dashboard' | 'my-reservations' | 'admin') => void;
  pendingCount: number;
  sheetsConfig: GoogleSheetsConfig;
  onOpenSyncModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedCenterId,
  onSelectCenter,
  activeTab,
  onChangeTab,
  pendingCount,
  sheetsConfig,
  onOpenSyncModal,
}) => {
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentCenter = CENTERS.find((c) => c.id === selectedCenterId) || CENTERS[0];

  return (
    <header className="sticky top-0 z-40 bg-slate-100/90 backdrop-blur-md pt-4 pb-2 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Header Bento Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Brand & Title */}
          <div className="flex items-center space-x-4">
            <div className="bg-blue-600 h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-xs shrink-0">
              C
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2 flex-wrap">
                <span>창조경제혁신센터</span>
                <span className="text-blue-600">회의실 예약 시스템</span>
                <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-emerald-200/80">
                  실시간
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
                <span>{currentCenter.name}</span>
                <span>•</span>
                <span>INTEGRATED BENTO DASHBOARD</span>
              </p>
            </div>
          </div>

          {/* Center Selector Pills Bento */}
          <div className="flex items-center space-x-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200 overflow-x-auto">
            {CENTERS.map((center) => {
              const isSelected = center.id === selectedCenterId;
              return (
                <button
                  key={center.id}
                  onClick={() => onSelectCenter(center.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-white shadow-xs text-blue-600 border border-slate-200/80 font-bold'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  {center.name}
                </button>
              );
            })}
          </div>

          {/* Actions & Status */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="hidden sm:flex items-center bg-slate-100 rounded-lg px-3 py-1.5 border border-slate-200/60 text-xs text-slate-700 font-bold gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>{currentTimeStr || '00:00:00'}</span>
            </div>

            <button
              onClick={onOpenSyncModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 cursor-pointer transition-colors"
              title="Google Sheets DB 연동 설정"
            >
              <Database className="w-3.5 h-3.5 text-emerald-500" />
              <span className="hidden sm:inline">
                {sheetsConfig.webAppUrl ? '시트 연동됨' : '시트 연동'}
              </span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Bento Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-2 flex items-center justify-between gap-2 overflow-x-auto text-xs">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onChangeTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              <CalendarCheck className="w-4 h-4" />
              <span>대시보드 예약 타임라인</span>
            </button>

            <button
              onClick={() => onChangeTab('my-reservations')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'my-reservations'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>내 예약 조회 / 취소</span>
            </button>

            <button
              onClick={() => onChangeTab('admin')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer relative ${
                activeTab === 'admin'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>관리자 승인 센터</span>
              {pendingCount > 0 && (
                <span className="bg-amber-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full animate-pulse">
                  {pendingCount}
                </span>
              )}
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-slate-400 text-[11px] pr-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>30분 단위 선택 및 카카오 알림톡 자동연동</span>
          </div>
        </div>
      </div>
    </header>
  );
};
