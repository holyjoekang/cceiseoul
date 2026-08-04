import React, { useState, useEffect } from 'react';
import {
  CenterId,
  MeetingRoom,
  Reservation,
  NotificationLog,
  GoogleSheetsConfig,
  ReservationStatus,
} from './types';
import { CENTERS } from './data/mockData';
import { getTodayDateString } from './data/mockData';
import {
  loadRooms,
  saveRooms,
  loadReservations,
  saveReservations,
  loadNotificationLogs,
  saveNotificationLogs,
  loadGoogleSheetsConfig,
  saveGoogleSheetsConfig,
} from './utils/storage';
import { logNotification } from './utils/notification';
import { getKoreanFormattedDate } from './utils/timeUtils';
import { Header } from './components/Header';
import { CenterSelector } from './components/CenterSelector';
import { DashboardGrid } from './components/DashboardGrid';
import { SlotSelectionModal } from './components/SlotSelectionModal';
import { MyReservationsModal } from './components/MyReservationsModal';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { GoogleSheetsIntegration } from './components/Admin/GoogleSheetsIntegration';
import { Footer } from './components/Footer';
import {
  CheckCircle2,
  XCircle,
  MessageSquareText,
  X,
  Sparkles,
  Info,
  Calendar,
} from 'lucide-react';

export default function App() {
  const [selectedCenterId, setSelectedCenterId] = useState<CenterId>('yongsan');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString(0));
  const [activeTab, setActiveTab] = useState<'dashboard' | 'my-reservations' | 'admin'>(
    'dashboard'
  );

  const [rooms, setRooms] = useState<MeetingRoom[]>(() => loadRooms());
  const [reservations, setReservations] = useState<Reservation[]>(() => loadReservations());
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>(() =>
    loadNotificationLogs()
  );
  const [sheetsConfig, setSheetsConfig] = useState<GoogleSheetsConfig>(() =>
    loadGoogleSheetsConfig()
  );

  const [bookingSlotData, setBookingSlotData] = useState<{
    room: MeetingRoom;
    startTime: string;
    endTime: string;
  } | null>(null);

  const [reservationDetailView, setReservationDetailView] = useState<{
    reservation: Reservation;
    room: MeetingRoom;
  } | null>(null);

  const [toastMessage, setToastMessage] = useState<{
    title: string;
    description: string;
    type: 'success' | 'info' | 'warning';
  } | null>(null);

  const [isSyncingSheets, setIsSyncingSheets] = useState<boolean>(false);
  const [showSyncModal, setShowSyncModal] = useState<boolean>(false);

  // Sync state to local storage on change
  useEffect(() => {
    saveRooms(rooms);
  }, [rooms]);

  useEffect(() => {
    saveReservations(reservations);
  }, [reservations]);

  useEffect(() => {
    saveNotificationLogs(notificationLogs);
  }, [notificationLogs]);

  useEffect(() => {
    saveGoogleSheetsConfig(sheetsConfig);
  }, [sheetsConfig]);

  // Toast Auto Clear
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const currentCenter = CENTERS.find((c) => c.id === selectedCenterId) || CENTERS[0];

  // Room count map
  const roomCountByCenter: Record<CenterId, number> = {
    yongsan: rooms.filter((r) => r.centerId === 'yongsan').length,
    jongno: rooms.filter((r) => r.centerId === 'jongno').length,
    gwanak: rooms.filter((r) => r.centerId === 'gwanak').length,
    etc: rooms.filter((r) => r.centerId === 'etc').length,
  };

  const pendingReservations = reservations.filter((r) => r.status === '승인대기');

  // Submit New Reservation
  const handleSubmitNewReservation = (data: {
    purpose: string;
    applicantName: string;
    applicantCompany: string;
    applicantPhone: string;
    pincode: string;
    startTime: string;
    endTime: string;
  }) => {
    if (!bookingSlotData) return;

    const newRes: Reservation = {
      id: `res-${Date.now()}`,
      centerId: selectedCenterId,
      roomId: bookingSlotData.room.id,
      date: selectedDate,
      startTime: data.startTime,
      endTime: data.endTime,
      purpose: data.purpose,
      applicantName: data.applicantName,
      applicantCompany: data.applicantCompany,
      applicantPhone: data.applicantPhone,
      pincode: data.pincode,
      status: '승인대기',
      requestedAt: new Date().toISOString(),
      notificationSent: false,
    };

    setReservations((prev) => [newRes, ...prev]);

    // Log reception notification
    const notifLog = logNotification(
      newRes,
      currentCenter,
      bookingSlotData.room,
      'REQUESTED'
    );
    setNotificationLogs((prev) => [notifLog, ...prev]);

    setBookingSlotData(null);

    setToastMessage({
      title: '예약 신청 접수 완료 (승인대기)',
      description: `${bookingSlotData.room.name} (${data.startTime}~${data.endTime}) 신청이 접수되었습니다. 담당자 승인 시 알림톡이 발송됩니다.`,
      type: 'info',
    });
  };

  // Approve Reservation Action
  const handleApproveReservation = (reservationId: string) => {
    const resToApprove = reservations.find((r) => r.id === reservationId);
    if (!resToApprove) return;

    const room = rooms.find((r) => r.id === resToApprove.roomId);
    const center = CENTERS.find((c) => c.id === resToApprove.centerId);

    const updated = reservations.map((r) =>
      r.id === reservationId
        ? {
            ...r,
            status: '승인완료' as ReservationStatus,
            approvedAt: new Date().toISOString(),
            notificationSent: true,
          }
        : r
    );

    setReservations(updated);

    if (room && center) {
      const notifLog = logNotification(
        { ...resToApprove, status: '승인완료' },
        center,
        room,
        'APPROVED'
      );
      setNotificationLogs((prev) => [notifLog, ...prev]);
    }

    setToastMessage({
      title: '예약 승인 완료 및 카카오 알림톡 발송',
      description: `${resToApprove.applicantName}님 (${resToApprove.applicantCompany})에게 예약 확정 알림톡이 전송되었습니다.`,
      type: 'success',
    });
  };

  // Reject Reservation Action
  const handleRejectReservation = (reservationId: string, reason: string) => {
    const resToReject = reservations.find((r) => r.id === reservationId);
    if (!resToReject) return;

    const room = rooms.find((r) => r.id === resToReject.roomId);
    const center = CENTERS.find((c) => c.id === resToReject.centerId);

    const updated = reservations.map((r) =>
      r.id === reservationId
        ? {
            ...r,
            status: '반려' as ReservationStatus,
            rejectedAt: new Date().toISOString(),
            rejectionReason: reason,
          }
        : r
    );

    setReservations(updated);

    if (room && center) {
      const notifLog = logNotification(
        { ...resToReject, status: '반려', rejectionReason: reason },
        center,
        room,
        'REJECTED'
      );
      setNotificationLogs((prev) => [notifLog, ...prev]);
    }

    setToastMessage({
      title: '예약 반려 처리 완료',
      description: `${resToReject.applicantName}님에게 반려 사유가 발송되었습니다.`,
      type: 'warning',
    });
  };

  // Approve All Pending
  const handleApproveAllPending = () => {
    const pendingIds = pendingReservations.map((r) => r.id);
    if (pendingIds.length === 0) return;

    const updated = reservations.map((r) => {
      if (r.status === '승인대기') {
        return {
          ...r,
          status: '승인완료' as ReservationStatus,
          approvedAt: new Date().toISOString(),
          notificationSent: true,
        };
      }
      return r;
    });

    setReservations(updated);

    setToastMessage({
      title: '대기 건 일괄 승인 완료',
      description: `총 ${pendingIds.length}건의 예약 신청이 일괄 승인되었으며 알림톡이 전송되었습니다.`,
      type: 'success',
    });
  };

  // Cancel Reservation Action
  const handleCancelReservation = (reservationId: string) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === reservationId ? { ...r, status: '취소' } : r))
    );

    setToastMessage({
      title: '예약 취소 완료',
      description: '선택하신 회의실 예약이 정상적으로 취소되었습니다.',
      type: 'info',
    });
  };

  // Status Change from Admin Table
  const handleUpdateStatus = (reservationId: string, status: ReservationStatus) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === reservationId ? { ...r, status } : r))
    );
  };

  // Delete Reservation
  const handleDeleteReservation = (reservationId: string) => {
    setReservations((prev) => prev.filter((r) => r.id !== reservationId));
  };

  // Room Management
  const handleAddRoom = (newRoomData: Omit<MeetingRoom, 'id'>) => {
    const newRoom: MeetingRoom = {
      ...newRoomData,
      id: `room-${Date.now()}`,
    };
    setRooms((prev) => [...prev, newRoom]);
    setToastMessage({
      title: '신규 회의실 등록 완료',
      description: `${newRoom.name} (${newRoom.capacity}인) 회의실이 등록되었습니다.`,
      type: 'success',
    });
  };

  const handleUpdateRoom = (updatedRoom: MeetingRoom) => {
    setRooms((prev) => prev.map((r) => (r.id === updatedRoom.id ? updatedRoom : r)));
  };

  const handleDeleteRoom = (roomId: string) => {
    setRooms((prev) => prev.filter((r) => r.id !== roomId));
  };

  // Send Test Notification
  const handleSendTestNotification = (phone: string) => {
    const sampleRes: Reservation = {
      id: 'test-res',
      centerId: selectedCenterId,
      roomId: rooms[0]?.id || 'room-01',
      date: selectedDate,
      startTime: '14:00',
      endTime: '15:30',
      purpose: '테스트 예약 알림톡 발송',
      applicantName: '테스터',
      applicantCompany: '서울창조경제혁신센터',
      applicantPhone: phone,
      status: '승인완료',
      requestedAt: new Date().toISOString(),
    };

    const notif = logNotification(sampleRes, currentCenter, rooms[0], 'APPROVED');
    setNotificationLogs((prev) => [notif, ...prev]);
  };

  // Google Sheets Manual Sync Simulator
  const handleManualSyncSheets = () => {
    setIsSyncingSheets(true);
    setTimeout(() => {
      setIsSyncingSheets(false);
      setToastMessage({
        title: 'Google Sheets 동기화 완료',
        description: 'Google Drive 내 회의실 데이터 시트에 최신 예약 정보가 업데이트되었습니다.',
        type: 'success',
      });
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 font-sans text-slate-900 flex flex-col antialiased">
      {/* Header */}
      <Header
        selectedCenterId={selectedCenterId}
        onSelectCenter={setSelectedCenterId}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        pendingCount={pendingReservations.length}
        sheetsConfig={sheetsConfig}
        onOpenSyncModal={() => setShowSyncModal(true)}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Toast Alert Popup */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 max-w-md w-full bg-slate-900 text-white p-4 rounded-xl shadow-2xl border border-slate-700 flex items-start gap-3 animate-in slide-in-from-bottom-5 duration-200">
            <MessageSquareText className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <h4 className="font-bold text-sm text-emerald-300">{toastMessage.title}</h4>
              <p className="text-slate-300 mt-0.5">{toastMessage.description}</p>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tab 1: Dashboard View */}
        {activeTab === 'dashboard' && (
          <div>
            <CenterSelector
              centers={CENTERS}
              selectedCenterId={selectedCenterId}
              onSelectCenter={setSelectedCenterId}
              roomCountByCenter={roomCountByCenter}
            />

            <DashboardGrid
              center={currentCenter}
              rooms={rooms}
              reservations={reservations}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onInitiateBooking={(room, start, end) =>
                setBookingSlotData({ room, startTime: start, endTime: end })
              }
              onViewReservationDetails={(reservation, room) =>
                setReservationDetailView({ reservation, room })
              }
            />
          </div>
        )}

        {/* Tab 2: Guest My Reservation Search */}
        {activeTab === 'my-reservations' && (
          <MyReservationsModal
            reservations={reservations}
            centers={CENTERS}
            rooms={rooms}
            onCancelReservation={handleCancelReservation}
          />
        )}

        {/* Tab 3: Admin Dashboard View */}
        {activeTab === 'admin' && (
          <AdminDashboard
            reservations={reservations}
            centers={CENTERS}
            rooms={rooms}
            notificationLogs={notificationLogs}
            sheetsConfig={sheetsConfig}
            onApproveReservation={handleApproveReservation}
            onRejectReservation={handleRejectReservation}
            onApproveAllPending={handleApproveAllPending}
            onUpdateStatus={handleUpdateStatus}
            onDeleteReservation={handleDeleteReservation}
            onAddRoom={handleAddRoom}
            onUpdateRoom={handleUpdateRoom}
            onDeleteRoom={handleDeleteRoom}
            onSendTestNotification={handleSendTestNotification}
            onSaveSheetsConfig={setSheetsConfig}
            onManualSyncSheets={handleManualSyncSheets}
            isSyncingSheets={isSyncingSheets}
          />
        )}
      </main>

      {/* Reservation Form Modal */}
      {bookingSlotData && (
        <SlotSelectionModal
          room={bookingSlotData.room}
          center={currentCenter}
          date={selectedDate}
          startTime={bookingSlotData.startTime}
          endTime={bookingSlotData.endTime}
          existingReservations={reservations}
          onClose={() => setBookingSlotData(null)}
          onSubmitReservation={handleSubmitNewReservation}
        />
      )}

      {/* Existing Reservation Detail View Popover / Modal */}
      {reservationDetailView && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-md border border-slate-200 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="font-bold text-sm text-slate-900">
                {reservationDetailView.room.name} 예약 상세 정보
              </span>
              <button
                onClick={() => setReservationDetailView(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border">
                <span className="text-slate-500 font-semibold">예약 상태:</span>
                <span className="font-bold text-sm">
                  {reservationDetailView.reservation.status === '승인대기' && '⏳ 승인대기'}
                  {reservationDetailView.reservation.status === '승인완료' && '✅ 승인완료 (확정)'}
                  {reservationDetailView.reservation.status === '반려' && '❌ 반려됨'}
                </span>
              </div>

              <div className="space-y-1 pt-1">
                <p>
                  <strong>일시:</strong> {getKoreanFormattedDate(reservationDetailView.reservation.date)}{' '}
                  {reservationDetailView.reservation.startTime} ~{' '}
                  {reservationDetailView.reservation.endTime}
                </p>
                <p>
                  <strong>회의 목적:</strong> {reservationDetailView.reservation.purpose}
                </p>
                <p>
                  <strong>신청자:</strong> {reservationDetailView.reservation.applicantName} (
                  {reservationDetailView.reservation.applicantCompany})
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setReservationDetailView(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold text-xs cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google Sheets Sync Settings Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-2xl border border-slate-200 shadow-xl space-y-4 relative">
            <button
              onClick={() => setShowSyncModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <GoogleSheetsIntegration
              sheetsConfig={sheetsConfig}
              onSaveSheetsConfig={setSheetsConfig}
              onManualSync={handleManualSyncSheets}
              isSyncing={isSyncingSheets}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
