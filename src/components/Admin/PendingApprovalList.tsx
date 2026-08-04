import React, { useState } from 'react';
import { Reservation, Center, MeetingRoom } from '../../types';
import { getKoreanFormattedDate } from '../../utils/timeUtils';
import {
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Building2,
  Phone,
  FileText,
  MessageSquare,
  AlertTriangle,
  Send,
  X,
  Sparkles,
} from 'lucide-react';

interface PendingApprovalListProps {
  pendingReservations: Reservation[];
  centers: Center[];
  rooms: MeetingRoom[];
  onApprove: (reservationId: string) => void;
  onReject: (reservationId: string, reason: string) => void;
  onApproveAll: () => void;
}

export const PendingApprovalList: React.FC<PendingApprovalListProps> = ({
  pendingReservations,
  centers,
  rooms,
  onApprove,
  onReject,
  onApproveAll,
}) => {
  const [rejectingResId, setRejectingResId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');

  const handleConfirmReject = () => {
    if (!rejectingResId) return;
    onReject(rejectingResId, rejectionReason || '센터 내부 일정으로 인한 반려');
    setRejectingResId(null);
    setRejectionReason('');
  };

  if (pendingReservations.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800">승인 대기 중인 예약 신청이 없습니다</h3>
        <p className="text-xs text-slate-500 mt-1">
          새로운 예약 신청이 도착하면 이곳에서 1클릭 승인 및 카카오 알림톡을 발송할 수 있습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-amber-50/80 border border-amber-200 p-4 rounded-xl">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-600 animate-pulse shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-amber-950">
              승인 대기 중인 예약: 총 {pendingReservations.length}건
            </h3>
            <p className="text-xs text-amber-800">
              승인 버튼을 클릭하면 신청자 휴대폰으로 카카오 확정 알림톡이 즉시 발송됩니다.
            </p>
          </div>
        </div>

        <button
          onClick={onApproveAll}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>대기 건 전체 일괄 승인</span>
        </button>
      </div>

      {/* Pending Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pendingReservations.map((res) => {
          const center = centers.find((c) => c.id === res.centerId);
          const room = rooms.find((r) => r.id === res.roomId);

          return (
            <div
              key={res.id}
              className="bg-white rounded-xl border border-amber-200 shadow-2xs hover:shadow-md transition-all p-4 space-y-3 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 bg-amber-400 text-amber-950 text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
                승인 대기
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    {center?.name}
                  </span>
                  <h4 className="text-base font-bold text-slate-900 mt-1">{room?.name}</h4>
                  <p className="text-xs text-slate-500">{room?.floor}</p>
                </div>
              </div>

              {/* Purpose & Info */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 text-slate-900 font-bold text-sm">
                  <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="truncate">{res.purpose}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1">
                  <div className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{res.applicantName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{res.applicantCompany}</span>
                  </div>
                  <div className="flex items-center gap-1 col-span-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{res.applicantPhone}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                  <div className="font-bold text-blue-800">
                    일시: {getKoreanFormattedDate(res.date)} {res.startTime} ~ {res.endTime}
                  </div>
                </div>
              </div>

              {/* Actions: Approve & Reject */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    setRejectingResId(res.id);
                    setRejectionReason('센터 내부 공식 일정 중복으로 인한 반려');
                  }}
                  className="w-1/3 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>반려하기</span>
                </button>

                <button
                  onClick={() => onApprove(res.id)}
                  className="w-2/3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>승인 및 알림톡 발송</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rejection Reason Modal */}
      {rejectingResId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-md border border-slate-200 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-rose-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>예약 반려 사유 입력</span>
              </h3>
              <button
                onClick={() => setRejectingResId(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                신청자에게 발송할 반려 사유 (알림톡/문자 안내문구 포함)
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2 justify-end pt-2">
              <button
                onClick={() => setRejectingResId(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-2xs cursor-pointer"
              >
                반려 처리 및 알림 발송
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
