import React, { useState } from 'react';
import { MeetingRoom, Center, Reservation } from '../types';
import { formatDuration, getKoreanFormattedDate, checkCollision } from '../utils/timeUtils';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Building2,
  Users,
  CheckCircle2,
  Sparkles,
  Lock,
  Phone,
  User,
  FileText,
  AlertCircle,
  MessageSquareText,
} from 'lucide-react';

interface SlotSelectionModalProps {
  room: MeetingRoom;
  center: Center;
  date: string;
  startTime: string;
  endTime: string;
  existingReservations: Reservation[];
  onClose: () => void;
  onSubmitReservation: (data: {
    purpose: string;
    applicantName: string;
    applicantCompany: string;
    applicantPhone: string;
    pincode: string;
    startTime: string;
    endTime: string;
  }) => void;
}

const PURPOSE_PRESETS = [
  '입주기업 3분기 IR 피칭',
  '팀 내부 전략 주간 회의',
  '외부 투자자 / 바이어 미팅',
  '전문가 1:1 멘토링 상담',
  '창업 세미나 / 워크숍',
];

export const SlotSelectionModal: React.FC<SlotSelectionModalProps> = ({
  room,
  center,
  date,
  startTime: initialStartTime,
  endTime: initialEndTime,
  existingReservations,
  onClose,
  onSubmitReservation,
}) => {
  const [startTime, setStartTime] = useState<string>(initialStartTime);
  const [endTime, setEndTime] = useState<string>(initialEndTime);
  const [purpose, setPurpose] = useState<string>('');
  const [applicantName, setApplicantName] = useState<string>('');
  const [applicantCompany, setApplicantCompany] = useState<string>('');
  const [applicantPhone, setApplicantPhone] = useState<string>('');
  const [pincode, setPincode] = useState<string>('1234');
  const [agreedTerms, setAgreedTerms] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const durationStr = formatDuration(startTime, endTime);

  // Phone formatting helper
  const handlePhoneChange = (val: string) => {
    const raw = val.replace(/[^0-9]/g, '');
    let formatted = raw;
    if (raw.length > 3 && raw.length <= 7) {
      formatted = `${raw.slice(0, 3)}-${raw.slice(3)}`;
    } else if (raw.length > 7) {
      formatted = `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7, 11)}`;
    }
    setApplicantPhone(formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!purpose.trim()) {
      setErrorMessage('회의 목적을 입력해 주세요.');
      return;
    }
    if (!applicantName.trim()) {
      setErrorMessage('신청자 이름을 입력해 주세요.');
      return;
    }
    if (!applicantCompany.trim()) {
      setErrorMessage('소속 / 입주기업명을 입력해 주세요.');
      return;
    }
    if (!applicantPhone.trim() || applicantPhone.length < 10) {
      setErrorMessage('올바른 연락처(휴대폰 번호)를 입력해 주세요.');
      return;
    }
    if (!pincode.trim() || pincode.length < 4) {
      setErrorMessage('예약 확인용 비밀번호 4자리를 입력해 주세요.');
      return;
    }
    if (!agreedTerms) {
      setErrorMessage('개인정보 수집 및 이용 수칙 동의가 필요합니다.');
      return;
    }

    // Verify time collision
    const collisionCheck = checkCollision(
      existingReservations,
      room.id,
      date,
      startTime,
      endTime
    );

    if (collisionCheck.hasCollision) {
      setErrorMessage(
        `선택하신 시간대에 이미 다른 예약이 진행 중입니다 (${collisionCheck.collidingRes?.startTime} ~ ${collisionCheck.collidingRes?.endTime}).`
      );
      return;
    }

    onSubmitReservation({
      purpose,
      applicantName,
      applicantCompany,
      applicantPhone,
      pincode,
      startTime,
      endTime,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <span className="bg-blue-500/30 text-blue-200 text-xs font-semibold px-2.5 py-0.5 rounded-full inline-block mb-1">
            {center.name} • {room.floor}
          </span>
          <h2 className="text-xl font-bold">{room.name} 예약 신청</h2>
          <p className="text-xs text-blue-100 mt-1 flex items-center gap-2">
            <span>수용인원: 최대 {room.capacity}명</span>
            <span>•</span>
            <span>{center.address}</span>
          </p>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Reservation Summary Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between font-bold text-slate-800 text-sm pb-2 border-b border-slate-200">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>{getKoreanFormattedDate(date)}</span>
              </div>
              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
                {durationStr}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-700 font-medium pt-1">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>예약 시간:</span>
              </div>
              <div className="font-bold text-slate-900 text-sm">
                {startTime} ~ {endTime}
              </div>
            </div>
          </div>

          {/* Form Error Message */}
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-300 text-rose-800 p-3 rounded-lg text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Purpose Input & Presets */}
          <div>
            <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>회의 목적 *</span>
            </label>
            <input
              type="text"
              placeholder="예: 입주기업 3분기 성과 공유 및 투자 IR"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1 mt-1.5">
              {PURPOSE_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setPurpose(preset)}
                  className="bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 text-[10px] px-2 py-0.5 rounded transition-colors cursor-pointer"
                >
                  + {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Applicant & Company Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>신청자 이름 *</span>
              </label>
              <input
                type="text"
                placeholder="홍길동"
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>소속 / 입주기업명 *</span>
              </label>
              <input
                type="text"
                placeholder="네오스타트업 주식회사"
                value={applicantCompany}
                onChange={(e) => setApplicantCompany(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Phone & Pincode Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-blue-600" />
                <span>연락처 (휴대폰) *</span>
              </label>
              <input
                type="tel"
                placeholder="010-1234-5678"
                value={applicantPhone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-blue-600" />
                <span>예약 비밀번호 (4자리) *</span>
              </label>
              <input
                type="password"
                maxLength={4}
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 font-mono tracking-widest focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Terms & Guidelines */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-900 space-y-1">
            <div className="font-bold flex items-center gap-1 text-amber-950">
              <MessageSquareText className="w-3.5 h-3.5 text-amber-600" />
              <span>알림톡 안내 및 이용 수칙</span>
            </div>
            <p className="text-slate-600">
              1. 예약 제출 시 상태는 &apos;승인대기&apos; 상태로 등록됩니다.
              <br />
              2. 관리자 승인 완료 시 신청자 휴대폰 번호로 카카오 알림톡이 자동 발송됩니다.
            </p>
            <label className="flex items-center gap-2 pt-1 font-bold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span>개인정보 수집 및 이용 수칙에 동의합니다.</span>
            </label>
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className="w-2/3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>예약 신청 제출하기</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
