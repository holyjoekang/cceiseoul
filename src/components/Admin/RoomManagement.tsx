import React, { useState } from 'react';
import { MeetingRoom, Center, EquipmentType } from '../../types';
import { EQUIPMENT_LABELS } from '../../data/mockData';
import { Plus, Edit2, Trash2, Building2, Users, Check, X } from 'lucide-react';

interface RoomManagementProps {
  rooms: MeetingRoom[];
  centers: Center[];
  onAddRoom: (room: Omit<MeetingRoom, 'id'>) => void;
  onUpdateRoom: (room: MeetingRoom) => void;
  onDeleteRoom: (roomId: string) => void;
}

export const RoomManagement: React.FC<RoomManagementProps> = ({
  rooms,
  centers,
  onAddRoom,
  onUpdateRoom,
  onDeleteRoom,
}) => {
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [newCenterId, setNewCenterId] = useState<string>(centers[0]?.id || 'yongsan');
  const [newName, setNewName] = useState<string>('');
  const [newCapacity, setNewCapacity] = useState<number>(8);
  const [newFloor, setNewFloor] = useState<string>('5층');
  const [newDescription, setNewDescription] = useState<string>('');
  const [selectedEquipments, setSelectedEquipments] = useState<EquipmentType[]>([
    'tv',
    'whiteboard',
    'wifi',
  ]);

  const handleEquipmentToggle = (eq: EquipmentType) => {
    if (selectedEquipments.includes(eq)) {
      setSelectedEquipments(selectedEquipments.filter((e) => e !== eq));
    } else {
      setSelectedEquipments([...selectedEquipments, eq]);
    }
  };

  const handleSaveNewRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    onAddRoom({
      centerId: newCenterId as any,
      name: newName,
      capacity: newCapacity,
      floor: newFloor,
      equipments: selectedEquipments,
      description: newDescription || '서울창조경제혁신센터 공동 회의실',
      isAvailable: true,
      colorTag: '#3b82f6',
    });

    setNewName('');
    setIsAdding(false);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">센터별 회의실 등록 및 시설 관리</h3>
          <p className="text-xs text-slate-500">
            총 {rooms.length}개의 회의실이 등록되어 있습니다.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>신규 회의실 추가</span>
        </button>
      </div>

      {/* Add New Room Form */}
      {isAdding && (
        <form
          onSubmit={handleSaveNewRoom}
          className="bg-slate-50 border border-blue-200 rounded-xl p-4 space-y-3 text-xs"
        >
          <h4 className="font-bold text-blue-900 text-sm">새 회의실 정보 입력</h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">소속 센터 *</label>
              <select
                value={newCenterId}
                onChange={(e) => setNewCenterId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
              >
                {centers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">회의실 명칭 *</label>
              <input
                type="text"
                placeholder="예: 아이디어실 3"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">수용 인원 (명) *</label>
              <input
                type="number"
                min={2}
                max={100}
                value={newCapacity}
                onChange={(e) => setNewCapacity(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">층수/위치</label>
              <input
                type="text"
                placeholder="예: 5층 B동"
                value={newFloor}
                onChange={(e) => setNewFloor(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">설명</label>
              <input
                type="text"
                placeholder="간단한 회의실 설명"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">보유 기기/장비 선택</label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(EQUIPMENT_LABELS) as EquipmentType[]).map((eq) => {
                const isSelected = selectedEquipments.includes(eq);
                return (
                  <button
                    type="button"
                    key={eq}
                    onClick={() => handleEquipmentToggle(eq)}
                    className={`px-2.5 py-1 rounded-md border text-xs font-medium cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-700'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {EQUIPMENT_LABELS[eq]?.icon} {EQUIPMENT_LABELS[eq]?.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
            >
              저장
            </button>
          </div>
        </form>
      )}

      {/* Room Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {rooms.map((room) => {
          const center = centers.find((c) => c.id === room.centerId);

          return (
            <div
              key={room.id}
              className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2 hover:border-slate-300 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                    {center?.name}
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm mt-0.5">{room.name}</h4>
                  <p className="text-xs text-slate-500">{room.floor}</p>
                </div>

                <span className="bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold px-2 py-0.5 rounded">
                  {room.capacity}인
                </span>
              </div>

              <div className="flex flex-wrap gap-1 pt-1">
                {room.equipments.map((eq) => (
                  <span
                    key={eq}
                    className="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded"
                  >
                    {EQUIPMENT_LABELS[eq]?.icon} {EQUIPMENT_LABELS[eq]?.label}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <button
                  onClick={() =>
                    onUpdateRoom({ ...room, isAvailable: !room.isAvailable })
                  }
                  className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                    room.isAvailable
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {room.isAvailable ? '● 정상 운영중' : '● 점검중/비활성'}
                </button>

                <button
                  onClick={() => {
                    if (confirm('이 회의실 정보를 삭제하시겠습니까?')) {
                      onDeleteRoom(room.id);
                    }
                  }}
                  className="text-slate-400 hover:text-rose-600 cursor-pointer p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
