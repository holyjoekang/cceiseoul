import React from 'react';
import { Building2, MapPin, Phone, Clock, FileSpreadsheet, ShieldCheck } from 'lucide-react';
import { CENTERS } from '../data/mockData';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-10 pb-8 mt-12 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Centers Grid Footer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-slate-800">
          {CENTERS.map((center) => (
            <div key={center.id} className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded text-[10px]">
                  {center.badge}
                </span>
                <h4 className="font-bold text-white text-sm">{center.name}</h4>
              </div>
              <p className="text-slate-400 flex items-start gap-1.5 pt-1">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                <span>{center.address}</span>
              </p>
              <p className="text-slate-400 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>{center.phone}</span>
              </p>
            </div>
          ))}
        </div>

        {/* Operational Specs */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-slate-400 text-[11px]">
          <div className="space-y-1">
            <p className="font-semibold text-slate-200">
              서울 창조경제혁신센터 회의실 운영 수칙
            </p>
            <p>
              • 운영 시간: 평일 06:00 ~ 22:00 (주말 및 공휴일 이용은 별도 문의) | 예약 단위: 30분
            </p>
            <p>
              • 승인 절차: 신청 후 운영 담당자 확인(승인) 시 카카오 알림톡이 발송되며 최종 확정됩니다.
            </p>
          </div>

          <div className="text-right text-slate-500 space-y-0.5">
            <p>© 2026 Seoul Creative Economy Innovation Center. All rights reserved.</p>
            <p>Google Sheets Data Engine & Kakao Alimtalk Gateway Integrated</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
