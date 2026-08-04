import React, { useState } from 'react';
import { Reservation, Center, MeetingRoom, NotificationLog, GoogleSheetsConfig, ReservationStatus } from '../../types';
import { PendingApprovalList } from './PendingApprovalList';
import { AllReservationsTable } from './AllReservationsTable';
import { RoomManagement } from './RoomManagement';
import { NotificationLogModal } from './NotificationLogModal';
import { GoogleSheetsIntegration } from './GoogleSheetsIntegration';
import {
  ShieldCheck,
  Lock,
  Clock,
  CheckCircle2,
  ListFilter,
  Building2,
  MessageSquare,
  Database,
  BarChart3,
  Unlock,
  Sparkles,
} from 'lucide-react';

interface AdminDashboardProps {
  reservations: Reservation[];
  centers: Center[];
  rooms: MeetingRoom[];
  notificationLogs: NotificationLog[];
  sheetsConfig: GoogleSheetsConfig;
  onApproveReservation: (reservationId: string) => void;
  onRejectReservation: (reservationId: string, reason: string) => void;
  onApproveAllPending: () => void;
  onUpdateStatus: (reservationId: string, status: ReservationStatus) => void;
  onDeleteReservation: (reservationId: string) => void;
  onAddRoom: (room: Omit<MeetingRoom, 'id'>) => void;
  onUpdateRoom: (room: MeetingRoom) => void;
  onDeleteRoom: (roomId: string) => void;
  onSendTestNotification: (phone: string) => void;
  onSaveSheetsConfig: (config: GoogleSheetsConfig) => void;
  onManualSyncSheets: () => void;
  isSyncingSheets: boolean;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  reservations,
  centers,
  rooms,
  notificationLogs,
  sheetsConfig,
  onApproveReservation,
  onRejectReservation,
  onApproveAllPending,
  onUpdateStatus,
  onDeleteReservation,
  onAddRoom,
  onUpdateRoom,
  onDeleteRoom,
  onSendTestNotification,
  onSaveSheetsConfig,
  onManualSyncSheets,
  isSyncingSheets,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true); // Default unlocked for easy inspection
  const [passcode, setPasscode] = useState<string>('');
  const [adminSubTab, setAdminSubTab] = useState<
    'pending' | 'all-reservations' | 'rooms' | 'notifications' | 'sheets'
  >('pending');

  const pendingList = reservations.filter((r) => r.status === '승인대기');
  const approvedList = reservations.filter((r) => r.status === '승인완료');
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayReservations = reservations.filter((r) => r.date === todayStr);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === 'admin1234' || passcode === '1234' || passcode === 'admin') {
      setIsAuthenticated(true);
    } else {
      alert('관리자 암호가 일치하지 않습니다. (기본 암호: admin1234)');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md mx-auto shadow-md my-8 text-center space-y-4">
        <div className="w-12 h-12 bg-slate-900 text-amber-400 rounded-2xl flex items-center justify-center mx-auto shadow-xs font-bold">
          <Lock className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">센터 관리자 로그인</h3>
          <p className="text-xs text-slate-500 mt-1">
            승인 대기 건 확인 및 카카오 알림톡 발송 관리를 위한 관리자 인증
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-3 pt-2">
          <input
            type="password"
            placeholder="비밀번호 입력 (기본: admin1234)"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-center font-bold tracking-widest text-slate-900 focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
          >
            관리자 인증 로그인
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-8">
      {/* Top Admin Stats Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold">오늘 전체 예약</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{todayReservations.length}건</div>
          <p className="text-[11px] text-blue-600 mt-0.5">실시간 대시보드 반영</p>
        </div>

        <div className="bg-amber-50 rounded-xl border border-amber-300 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-900 font-bold">승인 대기건</span>
            {pendingList.length > 0 && (
              <span className="bg-amber-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full animate-pulse">
                Action 필요
              </span>
            )}
          </div>
          <div className="text-2xl font-extrabold text-amber-950 mt-1">{pendingList.length}건</div>
          <p className="text-[11px] text-amber-800 mt-0.5">1클릭 승인 시 알림톡 즉시 발송</p>
        </div>

        <div className="bg-emerald-50 rounded-xl border border-emerald-300 p-4 shadow-2xs">
          <span className="text-xs text-emerald-900 font-bold">승인 완료 (확정)</span>
          <div className="text-2xl font-extrabold text-emerald-950 mt-1">{approvedList.length}건</div>
          <p className="text-[11px] text-emerald-800 mt-0.5">정상 확정 처리됨</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold">알림톡 발송 성공</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{notificationLogs.length}건</div>
          <p className="text-[11px] text-slate-500 mt-0.5">카카오 알림톡/SMS 이력</p>
        </div>
      </div>

      {/* Admin Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-2 text-xs">
        <button
          onClick={() => setAdminSubTab('pending')}
          className={`px-4 py-2 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer relative ${
            adminSubTab === 'pending'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <span>⏳ 승인 대기 목록</span>
          {pendingList.length > 0 && (
            <span className="ml-1.5 bg-amber-400 text-amber-950 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
              {pendingList.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setAdminSubTab('all-reservations')}
          className={`px-4 py-2 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
            adminSubTab === 'all-reservations'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <span>📋 전체 예약 대장</span>
        </button>

        <button
          onClick={() => setAdminSubTab('rooms')}
          className={`px-4 py-2 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
            adminSubTab === 'rooms'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <span>🏢 회의실 시설 관리</span>
        </button>

        <button
          onClick={() => setAdminSubTab('notifications')}
          className={`px-4 py-2 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
            adminSubTab === 'notifications'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <span>💬 카카오 알림톡/문자 연동</span>
        </button>

        <button
          onClick={() => setAdminSubTab('sheets')}
          className={`px-4 py-2 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
            adminSubTab === 'sheets'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <span>📊 Google Sheets DB</span>
        </button>
      </div>

      {/* Render Selected SubTab */}
      {adminSubTab === 'pending' && (
        <PendingApprovalList
          pendingReservations={pendingList}
          centers={centers}
          rooms={rooms}
          onApprove={onApproveReservation}
          onReject={onRejectReservation}
          onApproveAll={onApproveAllPending}
        />
      )}

      {adminSubTab === 'all-reservations' && (
        <AllReservationsTable
          reservations={reservations}
          centers={centers}
          rooms={rooms}
          onUpdateStatus={onUpdateStatus}
          onDeleteReservation={onDeleteReservation}
        />
      )}

      {adminSubTab === 'rooms' && (
        <RoomManagement
          rooms={rooms}
          centers={centers}
          onAddRoom={onAddRoom}
          onUpdateRoom={onUpdateRoom}
          onDeleteRoom={onDeleteRoom}
        />
      )}

      {adminSubTab === 'notifications' && (
        <NotificationLogModal
          logs={notificationLogs}
          onSendTestNotification={onSendTestNotification}
        />
      )}

      {adminSubTab === 'sheets' && (
        <GoogleSheetsIntegration
          sheetsConfig={sheetsConfig}
          onSaveSheetsConfig={onSaveSheetsConfig}
          onManualSync={onManualSyncSheets}
          isSyncing={isSyncingSheets}
        />
      )}
    </div>
  );
};
