import React from 'react';
import { Center, CenterId } from '../types';
import { MapPin, Phone, Users, ShieldAlert, ChevronRight } from 'lucide-react';

interface CenterSelectorProps {
  centers: Center[];
  selectedCenterId: CenterId;
  onSelectCenter: (id: CenterId) => void;
  roomCountByCenter: Record<CenterId, number>;
}

export const CenterSelector: React.FC<CenterSelectorProps> = ({
  centers,
  selectedCenterId,
  onSelectCenter,
  roomCountByCenter,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {centers.map((center) => {
        const isSelected = center.id === selectedCenterId;
        const roomCount = roomCountByCenter[center.id] || 0;

        return (
          <div
            key={center.id}
            onClick={() => onSelectCenter(center.id)}
            className={`rounded-xl p-4 border transition-all cursor-pointer relative overflow-hidden ${
              isSelected
                ? 'bg-gradient-to-br from-blue-50 to-indigo-50/60 border-blue-400 shadow-sm ring-2 ring-blue-500/20'
                : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
            }`}
          >
            {isSelected && (
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
                선택됨
              </div>
            )}

            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="text-[11px] font-semibold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full">
                  {center.badge}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{center.name}</h3>
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                회의실 {roomCount}개
              </span>
            </div>

            <p className="text-xs text-slate-600 mb-3 line-clamp-2">{center.description}</p>

            <div className="space-y-1 text-xs text-slate-500 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-600 truncate">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{center.address}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{center.phone}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
