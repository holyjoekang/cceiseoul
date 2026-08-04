import React, { useState, useMemo } from 'react';
import { MeetingRoom, Reservation, Center } from '../types';
import {
  generate30MinSlots,
  generateHourHeaders,
  timeToMinutes,
  formatDuration,
  getKoreanFormattedDate,
  checkCollision,
} from '../utils/timeUtils';
import { EQUIPMENT_LABELS } from '../data/mockData';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Info,
  Sparkles,
  Plus,
} from 'lucide-react';

interface DashboardGridProps {
  center: Center;
  rooms: MeetingRoom[];
  reservations: Reservation[];
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  onInitiateBooking: (room: MeetingRoom, startTime: string, endTime: string) => void;
  onViewReservationDetails: (reservation: Reservation, room: MeetingRoom) => void;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({
  center,
  rooms,
  reservations,
  selectedDate,
  onSelectDate,
  onInitiateBooking,
  onViewReservationDetails,
}) => {
  const [minCapacity, setMinCapacity] = useState<number>(0);
  const [selectedEquipment, setSelectedEquipment] = useState<string>('all');
  const [selectedSlotRoom, setSelectedSlotRoom] = useState<MeetingRoom | null>(null);
  const [selectionRange, setSelectionRange] = useState<{ start: string; end: string } | null>(null);

  const slots = useMemo(() => generate30MinSlots(), []);
  const hourHeaders = useMemo(() => generateHourHeaders(), []);

  // Handle Date Navigation
  const handleOffsetDate = (days: number) => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + days);
    const ny = date.getFullYear();
    const nm = String(date.getMonth() + 1).padStart(2, '0');
    const nd = String(date.getDate()).padStart(2, '0');
    onSelectDate(`${ny}-${nm}-${nd}`);
  };

  const handleTodayClick = () => {
    const today = new Date();
    const ny = today.getFullYear();
    const nm = String(today.getMonth() + 1).padStart(2, '0');
    const nd = String(today.getDate()).padStart(2, '0');
    onSelectDate(`${ny}-${nm}-${nd}`);
  };

  // Filter rooms by center & capacity & equipment
  const filteredRooms = useMemo(() => {
    return rooms
      .filter((r) => r.centerId === center.id && r.isAvailable)
      .filter((r) => r.capacity >= minCapacity)
      .filter((r) => {
        if (selectedEquipment === 'all') return true;
        return r.equipments.includes(selectedEquipment as any);
      });
  }, [rooms, center.id, minCapacity, selectedEquipment]);

  // Today indicator minutes
  const isToday = useMemo(() => {
    const today = new Date();
    const ny = today.getFullYear();
    const nm = String(today.getMonth() + 1).padStart(2, '0');
    const nd = String(today.getDate()).padStart(2, '0');
    return selectedDate === `${ny}-${nm}-${nd}`;
  }, [selectedDate]);

  const currentMinutesNow = useMemo(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  }, []);

  // Quick slot click handler: 1-hour default booking or extending slot
  const handleSlotClick = (room: MeetingRoom, slotTime: string) => {
    const startM = timeToMinutes(slotTime);
    let endM = startM + 60; // default 1 hour slot
    if (endM > 22 * 60) endM = 22 * 60;

    let endStr = `${String(Math.floor(endM / 60)).padStart(2, '0')}:${String(endM % 60).padStart(2, '0')}`;

    // Check collision for default 1 hr range
    const collisionCheck = checkCollision(reservations, room.id, selectedDate, slotTime, endStr);
    if (collisionCheck.hasCollision) {
      // fallback to 30 min if 1 hr collides
      endM = startM + 30;
      endStr = `${String(Math.floor(endM / 60)).padStart(2, '0')}:${String(endM % 60).padStart(2, '0')}`;
    }

    onInitiateBooking(room, slotTime, endStr);
  };

  // Calculate stats for today summary card
  const todayReservations = reservations.filter((r) => r.date === selectedDate && r.status !== '취소');
  const approvedTodayCount = todayReservations.filter((r) => r.status === '승인완료').length;
  const pendingTodayCount = todayReservations.filter((r) => r.status === '승인대기').length;

  return (
    <div className="grid grid-cols-12 gap-4 mb-8">
      {/* Left Column: Room Inventory & Quick Summary Bento Cards */}
      <div className="col-span-12 lg:col-span-3 space-y-4 flex flex-col">
        {/* Room Inventory Bento */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-4 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              회의실 목록 ({filteredRooms.length})
            </h2>
            <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-full border border-blue-200/60">
              {center.name}
            </span>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[380px] lg:max-h-none pr-1 flex-1">
            {filteredRooms.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">등록된 회의실이 없습니다.</p>
            ) : (
              filteredRooms.map((room) => (
                <div
                  key={room.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: room.colorTag || '#3b82f6' }}
                      />
                      <p className="font-bold text-xs text-slate-900">{room.name}</p>
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md shadow-2xs">
                      최대 {room.capacity}인
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500">{room.floor}</p>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {room.equipments.map((eq) => (
                      <span
                        key={eq}
                        className="bg-white text-slate-600 border border-slate-200/80 text-[9px] px-1.5 py-0.5 rounded font-medium"
                      >
                        {EQUIPMENT_LABELS[eq]?.label}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Summary Bento */}
        <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-xs">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              {getKoreanFormattedDate(selectedDate)} 현황
            </p>
            <span className="bg-blue-500 h-2.5 w-2.5 rounded-full animate-pulse"></span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
              <p className="text-2xl font-bold text-emerald-400">
                {String(approvedTodayCount).padStart(2, '0')}
              </p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">예약 확정</p>
            </div>

            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
              <p className="text-2xl font-bold text-amber-400">
                {String(pendingTodayCount).padStart(2, '0')}
              </p>
              <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">승인 대기</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Main Dashboard Grid Bento */}
      <div className="col-span-12 lg:col-span-9 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col overflow-hidden">
        {/* Top Toolbar: Date Navigation & Legend */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          {/* Date Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-white border border-slate-300 rounded-lg p-1 shadow-2xs">
              <button
                onClick={() => handleOffsetDate(-1)}
                className="p-1.5 rounded-md text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                title="이전일"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleTodayClick}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                  isToday ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                오늘
              </button>
              <button
                onClick={() => handleOffsetDate(1)}
                className="p-1.5 rounded-md text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                title="다음일"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => e.target.value && onSelectDate(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 shadow-2xs cursor-pointer focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />

            <span className="text-xs font-bold text-slate-900 ml-1">
              {getKoreanFormattedDate(selectedDate)}
            </span>
          </div>

          {/* Legend Pills */}
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-100 border border-slate-300"></span>
              <span className="text-slate-700 font-medium">예약 가능</span>
            </div>

            <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-300/80">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-400"></span>
              <span className="text-amber-900 font-bold">승인 대기</span>
            </div>

            <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-300/80">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600"></span>
              <span className="text-emerald-900 font-bold">확정 완료</span>
            </div>
          </div>
        </div>

        {/* Filter Options Bar */}
        <div className="p-3 bg-white border-b border-slate-100 flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 font-semibold shrink-0">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span>조건 필터:</span>
          </div>

          <select
            value={minCapacity}
            onChange={(e) => setMinCapacity(Number(e.target.value))}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 font-medium focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
          >
            <option value={0}>전체 인원</option>
            <option value={6}>6인 이상</option>
            <option value={10}>10인 이상</option>
            <option value={15}>15인 이상</option>
            <option value={30}>30인 대회의실</option>
          </select>

          <select
            value={selectedEquipment}
            onChange={(e) => setSelectedEquipment(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 font-medium focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
          >
            <option value="all">전체 장비 보유</option>
            <option value="projector">📽️ 4K 프로젝터</option>
            <option value="tv">📺 대형 스마트 TV</option>
            <option value="vc">📹 화상회의 전용 시스템</option>
            <option value="whiteboard">📋 대형 화이트보드</option>
            <option value="audio">🎙️ 음향/마이크 시스템</option>
          </select>

          <span className="text-slate-400 ml-auto text-[11px] hidden sm:inline">
            * 빈 슬롯 클릭 시 30분 단위 예약 신청
          </span>
        </div>

        {/* Timeline Grid Table */}
        <div className="overflow-x-auto relative min-h-[420px]">
          <table className="w-full border-collapse text-left text-xs min-w-[1100px]">
            {/* Timeline Header Row */}
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200">
                <th className="sticky left-0 z-20 bg-slate-100 border-r border-slate-200 p-3 w-[180px] font-bold text-slate-800 shadow-2xs">
                  ROOM / TIME
                </th>
                {hourHeaders.map((hour) => (
                  <th
                    key={hour}
                    colSpan={2}
                    className="border-r border-slate-200 p-2 text-center font-bold text-slate-600 text-xs w-[65px]"
                  >
                    {hour}
                  </th>
                ))}
              </tr>

              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-400">
                <th className="sticky left-0 z-20 bg-slate-50 border-r border-slate-200 p-1 font-semibold text-slate-500 text-center">
                  30분 단위 슬롯
                </th>
                {slots.map((sTime) => (
                  <th
                    key={sTime}
                    className="border-r border-slate-200/60 py-1 text-center font-mono text-[9px] w-[32px]"
                  >
                    {sTime.endsWith(':00') ? ':00' : ':30'}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Grid Rows (Rooms) */}
            <tbody className="divide-y divide-slate-200">
              {filteredRooms.length === 0 ? (
                <tr>
                  <td colSpan={33} className="text-center py-12 text-slate-500 font-medium">
                    조건에 맞는 회의실이 없습니다. 필터를 변경해 보세요.
                  </td>
                </tr>
              ) : (
                filteredRooms.map((room) => {
                  const roomResList = reservations.filter(
                    (res) =>
                      res.roomId === room.id &&
                      res.date === selectedDate &&
                      res.status !== '취소'
                  );

                  return (
                    <tr key={room.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50 border-r border-slate-200 p-2.5 shadow-2xs">
                        <div className="flex items-center justify-between gap-1">
                          <div className="truncate">
                            <p className="font-bold text-slate-900 text-xs truncate flex items-center gap-1.5">
                              <span
                                className="w-2 h-2 rounded-full inline-block shrink-0"
                                style={{ backgroundColor: room.colorTag || '#3b82f6' }}
                              />
                              <span className="truncate">{room.name}</span>
                            </p>
                            <p className="text-[10px] text-slate-400 uppercase mt-0.5">{room.floor}</p>
                          </div>
                          <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                            {room.capacity}인
                          </span>
                        </div>
                      </td>

                      {slots.map((slotTime) => {
                        const slotM = timeToMinutes(slotTime);

                        const activeRes = roomResList.find((res) => {
                          const startM = timeToMinutes(res.startTime);
                          const endM = timeToMinutes(res.endTime);
                          return slotM >= startM && slotM < endM;
                        });

                        if (activeRes) {
                          const isStartSlot = activeRes.startTime === slotTime;
                          const isPending = activeRes.status === '승인대기';
                          const isApproved = activeRes.status === '승인완료';

                          return (
                            <td
                              key={slotTime}
                              onClick={() => onViewReservationDetails(activeRes, room)}
                              className={`border-r border-slate-200/80 p-0 cursor-pointer relative transition-all group/slot ${
                                isApproved
                                  ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-2xs'
                                  : isPending
                                  ? 'bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold'
                                  : 'bg-rose-200 text-rose-800 opacity-70'
                              }`}
                              title={`${room.name} (${activeRes.startTime}~${activeRes.endTime}): ${activeRes.purpose} - ${activeRes.applicantName}`}
                            >
                              {isStartSlot && (
                                <div className="absolute inset-0 z-10 px-1 py-0.5 text-[9px] font-bold truncate flex items-center justify-start pointer-events-none">
                                  <span className="truncate">
                                    {isPending ? '⏳ ' : '✅ '}
                                    {activeRes.applicantCompany || activeRes.applicantName}
                                  </span>
                                </div>
                              )}
                            </td>
                          );
                        }

                        return (
                          <td
                            key={slotTime}
                            onClick={() => handleSlotClick(room, slotTime)}
                            className="border-r border-slate-200/60 p-0 bg-white hover:bg-blue-50 transition-colors cursor-pointer group/empty relative"
                            title={`${room.name} - ${slotTime} 클릭하여 예약`}
                          >
                            <div className="w-full h-9 flex items-center justify-center opacity-0 group-hover/empty:opacity-100 transition-opacity">
                              <Plus className="w-3.5 h-3.5 text-blue-600" />
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Dashboard Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-1.5">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>운영 시간: 평일 06:00 ~ 22:00 | 예약 단위: 30분</span>
          </div>
          <p className="text-slate-400 text-[11px]">
            * 승인 완료 시 신청자 휴대폰으로 카카오 알림톡이 발송됩니다.
          </p>
        </div>
      </div>
    </div>
  );
};
