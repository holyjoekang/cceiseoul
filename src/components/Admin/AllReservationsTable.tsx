import React, { useState, useMemo } from 'react';
import { Reservation, Center, MeetingRoom, ReservationStatus } from '../../types';
import { getKoreanFormattedDate } from '../../utils/timeUtils';
import {
  Search,
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  RefreshCw,
  Building2,
} from 'lucide-react';

interface AllReservationsTableProps {
  reservations: Reservation[];
  centers: Center[];
  rooms: MeetingRoom[];
  onUpdateStatus: (reservationId: string, newStatus: ReservationStatus) => void;
  onDeleteReservation: (reservationId: string) => void;
}

export const AllReservationsTable: React.FC<AllReservationsTableProps> = ({
  reservations,
  centers,
  rooms,
  onUpdateStatus,
  onDeleteReservation,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [centerFilter, setCenterFilter] = useState<string>('all');

  const filteredReservations = useMemo(() => {
    return reservations.filter((res) => {
      // Search term
      const term = searchTerm.toLowerCase();
      const nameMatch = res.applicantName.toLowerCase().includes(term);
      const companyMatch = res.applicantCompany.toLowerCase().includes(term);
      const purposeMatch = res.purpose.toLowerCase().includes(term);
      const phoneMatch = res.applicantPhone.includes(term);

      if (searchTerm && !(nameMatch || companyMatch || purposeMatch || phoneMatch)) {
        return false;
      }

      // Status
      if (statusFilter !== 'all' && res.status !== statusFilter) {
        return false;
      }

      // Center
      if (centerFilter !== 'all' && res.centerId !== centerFilter) {
        return false;
      }

      return true;
    });
  }, [reservations, searchTerm, statusFilter, centerFilter]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      '예약ID',
      '센터',
      '회의실',
      '날짜',
      '시작시간',
      '종료시간',
      '회의목적',
      '신청자',
      '소속/회사',
      '연락처',
      '상태',
      '신청시각',
    ];

    const rows = filteredReservations.map((r) => {
      const center = centers.find((c) => c.id === r.centerId);
      const room = rooms.find((rm) => rm.id === r.roomId);
      return [
        r.id,
        center?.name || r.centerId,
        room?.name || r.roomId,
        r.date,
        r.startTime,
        r.endTime,
        `"${r.purpose.replace(/"/g, '""')}"`,
        r.applicantName,
        `"${r.applicantCompany.replace(/"/g, '""')}"`,
        r.applicantPhone,
        r.status,
        r.requestedAt,
      ];
    });

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ccei_reservations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
      {/* Search & Action Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="신청자, 소속, 목적, 연락처 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">전체 상태</option>
            <option value="승인대기">⏳ 승인대기</option>
            <option value="승인완료">✅ 승인완료</option>
            <option value="반려">❌ 반려</option>
            <option value="취소">🚫 취소</option>
          </select>

          {/* Center Filter */}
          <select
            value={centerFilter}
            onChange={(e) => setCenterFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">전체 센터</option>
            {centers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* CSV Export */}
        <button
          onClick={handleExportCSV}
          className="w-full md:w-auto bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3 py-2 rounded-lg text-xs border border-slate-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Download className="w-4 h-4 text-blue-600" />
          <span>CSV 데이터 다운로드</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full text-left text-xs text-slate-700 min-w-[900px]">
          <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-800">
            <tr>
              <th className="p-3">센터/회의실</th>
              <th className="p-3">예약 일시</th>
              <th className="p-3">회의 목적</th>
              <th className="p-3">신청자 (소속)</th>
              <th className="p-3">연락처</th>
              <th className="p-3 text-center">상태</th>
              <th className="p-3 text-right">관리 상태 변경</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {filteredReservations.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-500">
                  조회된 예약 내역이 없습니다.
                </td>
              </tr>
            ) : (
              filteredReservations.map((res) => {
                const center = centers.find((c) => c.id === res.centerId);
                const room = rooms.find((r) => r.id === res.roomId);

                return (
                  <tr key={res.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 font-semibold text-slate-900">
                      <div>{room?.name}</div>
                      <div className="text-[10px] text-slate-500 font-normal">{center?.name}</div>
                    </td>

                    <td className="p-3 font-medium text-slate-800 whitespace-nowrap">
                      <div>{getKoreanFormattedDate(res.date)}</div>
                      <div className="text-blue-700 font-bold">
                        {res.startTime} ~ {res.endTime}
                      </div>
                    </td>

                    <td className="p-3 max-w-[200px] truncate font-medium text-slate-800">
                      {res.purpose}
                    </td>

                    <td className="p-3 font-medium text-slate-800">
                      <div>{res.applicantName}</div>
                      <div className="text-[10px] text-slate-500">{res.applicantCompany}</div>
                    </td>

                    <td className="p-3 font-mono text-slate-700 whitespace-nowrap">
                      {res.applicantPhone}
                    </td>

                    <td className="p-3 text-center whitespace-nowrap">
                      {res.status === '승인대기' && (
                        <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full text-[11px] font-bold">
                          ⏳ 승인대기
                        </span>
                      )}
                      {res.status === '승인완료' && (
                        <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-full text-[11px] font-bold">
                          ✅ 승인완료
                        </span>
                      )}
                      {res.status === '반려' && (
                        <span className="bg-rose-100 text-rose-800 border border-rose-300 px-2 py-0.5 rounded-full text-[11px] font-bold">
                          ❌ 반려
                        </span>
                      )}
                      {res.status === '취소' && (
                        <span className="bg-slate-100 text-slate-600 border border-slate-300 px-2 py-0.5 rounded-full text-[11px]">
                          🚫 취소
                        </span>
                      )}
                    </td>

                    <td className="p-3 text-right space-x-1 whitespace-nowrap">
                      <select
                        value={res.status}
                        onChange={(e) =>
                          onUpdateStatus(res.id, e.target.value as ReservationStatus)
                        }
                        className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-[11px] font-semibold text-slate-800"
                      >
                        <option value="승인대기">승인대기</option>
                        <option value="승인완료">승인완료</option>
                        <option value="반려">반려</option>
                        <option value="취소">취소</option>
                      </select>

                      <button
                        onClick={() => {
                          if (confirm('이 예약을 영구 삭제하시겠습니까?')) {
                            onDeleteReservation(res.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        title="예약 영구 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
