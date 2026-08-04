export type CenterId = 'yongsan' | 'jongno' | 'gwanak' | 'etc';

export interface Center {
  id: CenterId;
  name: string;
  address: string;
  phone: string;
  description: string;
  badge: string;
}

export type EquipmentType = 'projector' | 'tv' | 'whiteboard' | 'vc' | 'audio' | 'wifi' | 'podium';

export interface MeetingRoom {
  id: string;
  centerId: CenterId;
  name: string;
  capacity: number;
  floor: string;
  equipments: EquipmentType[];
  description: string;
  isAvailable: boolean;
  colorTag?: string;
}

export type ReservationStatus = '승인대기' | '승인완료' | '반려' | '취소';

export interface Reservation {
  id: string;
  centerId: CenterId;
  roomId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm (e.g., '14:00')
  endTime: string; // HH:mm (e.g., '15:30')
  purpose: string;
  applicantName: string;
  applicantCompany: string;
  applicantPhone: string;
  pincode?: string; // 4 digits for guest cancellation
  status: ReservationStatus;
  requestedAt: string; // ISO String
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  adminNote?: string;
  notificationSent?: boolean;
}

export interface NotificationLog {
  id: string;
  reservationId: string;
  type: 'KakaoAlimtalk' | 'SMS';
  recipientName: string;
  recipientPhone: string;
  templateName: string;
  content: string;
  sentAt: string;
  status: 'SUCCESS' | 'FAILED';
}

export interface GoogleSheetsConfig {
  webAppUrl: string;
  spreadsheetId: string;
  spreadsheetUrl?: string;
  autoSync: boolean;
  lastSyncedAt?: string;
}
