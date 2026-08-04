import React, { useState } from 'react';
import { Reservation, Center, MeetingRoom } from '../types';
import { getKoreanFormattedDate } from '../utils/timeUtils';
import {
  Search,
  Phone,
  Lock,
  Calendar,
  Clock,
  Building2,
  XCircle,
  CheckCircle2,
  AlertCircle,
  Trash2,
  RefreshCw,
} from 'lucide-react';

interface MyReservationsModalProps {
  reservations: Reservation[];
  centers: Center[];
  rooms: MeetingRoom[];
  onCancelReservation: (reservationId: string) => void;
}

export const MyReservationsModal: React.FC<MyReservationsModalProps> = ({
  reservations,
  centers,
  rooms,
  onCancelReservation,
}) => {
  const [searchPhone, setSearchPhone] = useState<string>('');
  const [searchPincode, setSearchPincode] = useState<string>('');
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const matchedReservations = reservations.filter((r) => {
    if (!searchPhone) return false;
    const cleanInputPhone = searchPhone.replace(/[^0-9]/g, '');
    const cleanResPhone = r.applicantPhone.replace(/[^0-9]/g, '');

    const phoneMatches = cleanResPhone.includes(cleanInputPhone);
    const pinMatches = !searchPincode || r.pincode === searchPincode;

    return phoneMatches && pinMatches;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-2 font-bold">
            <Search className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">내 회의실 예약 조회 및 취소</h2>
          <p className="text-xs text-slate-500 mt-1">
            신청 시 입력하신 휴대폰 번호 또는 비밀번호 4자리를 입력하여 상태를 확인하세요.
          </p>
        </div>

        {/* Search Input Box */}
        <form onSubmit={handleSearch} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-blue-600" />
                <span>휴대폰 번호 *</span>
              </label>
              <input
                type="tel"
                placeholder="예: 01012345678"
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-blue-600" />
                <span>비밀번호 (4자리)</span>
              </label>
              <input
                type="password"
                maxLength={4}
                placeholder="1234"
                value={searchPincode}
                onChange={(e) => setSearchPincode(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>예약 내역 검색하기</span>
          </button>
        </form>

        {/* Search Results */}
        {hasSearched && (
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-slate-800 flex items-center justify-between">
              <span>조회 결과 ({matchedReservations.length}건)</span>
              <button
                onClick={() => setHasSearched(false)}
                className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> 초기화
              </button>
            </h3>

            {matchedReservations.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-500">
                입력하신 연락처로 등록된 예약 내역이 없거나 번호가 일치하지 않습니다.
              </div>
            ) : (
              <div className="space-y-3">
                {matchedReservations.map((res) => {
                  const center = centers.find((c) => c.id === res.centerId);
                  const room = rooms.find((r) => r.id === res.roomId);

                  const isPending = res.status === '승인대기';
                  const isApproved = res.status === '승인완료';
                  const isRejected = res.status === '반려';
                  const isCancelled = res.status === '취소';

                  return (
                    <div
                      key={res.id}
                      className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:border-slate-300 transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between border-b border-slate-100 pb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{room?.name || '회의실'}</span>
                            <span className="text-xs text-slate-500">({center?.name})</span>
                          </div>
                          <p className="text-xs font-semibold text-blue-700 mt-0.5">{res.purpose}</p>
                        </div>

                        {/* Status Badge */}
                        <div>
                          {isPending && (
                            <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1">
                              ⏳ 승인대기
                            </span>
                          )}
                          {isApproved && (
                            <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1">
                              ✅ 승인완료 (확정)
                            </span>
                          )}
                          {isRejected && (
                            <span className="bg-rose-100 text-rose-800 border border-rose-300 px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1">
                              ❌ 반려됨
                            </span>
                          )}
                          {isCancelled && (
                            <span className="bg-slate-100 text-slate-600 border border-slate-300 px-2.5 py-1 rounded-full text-xs font-bold">
                              🚫 취소완료
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>날짜: {getKoreanFormattedDate(res.date)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          <span>시간: {res.startTime} ~ {res.endTime}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>신청자: {res.applicantName} ({res.applicantCompany})</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>연락처: {res.applicantPhone}</span>
                        </div>
                      </div>

                      {/* Rejection reason if any */}
                      {isRejected && res.rejectionReason && (
                        <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-lg text-xs text-rose-800">
                          <strong>반려 사유:</strong> {res.rejectionReason}
                        </div>
                      )}

                      {/* Cancellation button */}
                      {(isPending || isApproved) && (
                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => {
                              if (confirm('이 회의실 예약을 취소하시겠습니까?')) {
                                onCancelReservation(res.id);
                              }
                            }}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>예약 취소 신청</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
