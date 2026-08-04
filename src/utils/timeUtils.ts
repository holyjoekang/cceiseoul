import { Reservation } from '../types';

export const START_HOUR = 6;  // 06:00
export const END_HOUR = 22;   // 22:00

// Generate 30-minute slots from 06:00 to 21:30 (32 slots)
export function generate30MinSlots(): string[] {
  const slots: string[] = [];
  for (let hour = START_HOUR; hour < END_HOUR; hour++) {
    const hStr = String(hour).padStart(2, '0');
    slots.push(`${hStr}:00`);
    slots.push(`${hStr}:30`);
  }
  return slots;
}

// Generate 1-hour headers for grid top row
export function generateHourHeaders(): string[] {
  const hours: string[] = [];
  for (let hour = START_HOUR; hour <= END_HOUR; hour++) {
    hours.push(`${String(hour).padStart(2, '0')}:00`);
  }
  return hours;
}

export function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function formatDuration(startTime: string, endTime: string): string {
  const startM = timeToMinutes(startTime);
  const endM = timeToMinutes(endTime);
  const diffM = Math.max(0, endM - startM);
  const hours = Math.floor(diffM / 60);
  const mins = diffM % 60;

  if (hours > 0 && mins > 0) {
    return `${hours}시간 ${mins}분`;
  } else if (hours > 0) {
    return `${hours}시간`;
  } else {
    return `${mins}분`;
  }
}

export function isSlotInReservation(slotTime: string, startTime: string, endTime: string): boolean {
  const slotM = timeToMinutes(slotTime);
  const startM = timeToMinutes(startTime);
  const endM = timeToMinutes(endTime);
  return slotM >= startM && slotM < endM;
}

export function checkCollision(
  reservations: Reservation[],
  roomId: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeReservationId?: string
): { hasCollision: boolean; collidingRes?: Reservation } {
  const newStartM = timeToMinutes(startTime);
  const newEndM = timeToMinutes(endTime);

  const activeRes = reservations.filter(
    (r) =>
      r.roomId === roomId &&
      r.date === date &&
      r.status !== '반려' &&
      r.status !== '취소' &&
      r.id !== excludeReservationId
  );

  for (const res of activeRes) {
    const resStartM = timeToMinutes(res.startTime);
    const resEndM = timeToMinutes(res.endTime);

    // Overlap condition: start < existingEnd AND end > existingStart
    if (newStartM < resEndM && newEndM > resStartM) {
      return { hasCollision: true, collidingRes: res };
    }
  }

  return { hasCollision: false };
}

export function getKoreanFormattedDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];
  const dayName = daysOfWeek[dateObj.getDay()];
  return `${year}년 ${month}월 ${day}일 (${dayName})`;
}
