import { Reservation, Center, MeetingRoom, NotificationLog } from '../types';
import { getKoreanFormattedDate } from './timeUtils';

export function createKakaoAlimtalkMessage(
  reservation: Reservation,
  center: Center,
  room: MeetingRoom,
  action: 'APPROVED' | 'REJECTED' | 'REQUESTED'
): { templateName: string; content: string } {
  const formattedDate = getKoreanFormattedDate(reservation.date);

  if (action === 'APPROVED') {
    return {
      templateName: '회의실_예약_확정_알림',
      content: `[${center.name}] 회의실 예약이 확정되었습니다.

- 회의실: ${room.name} (${room.floor})
- 일시: ${formattedDate} ${reservation.startTime} ~ ${reservation.endTime}
- 회의 목적: ${reservation.purpose}
- 신청자: ${reservation.applicantName} (${reservation.applicantCompany})
- 문의: ${center.phone}

※ 사용 후 정돈 및 퇴실 시간을 엄수해주시기 바랍니다.`,
    };
  } else if (action === 'REJECTED') {
    return {
      templateName: '회의실_예약_반려_안내',
      content: `[${center.name}] 회의실 예약이 반려되었습니다.

- 회의실: ${room.name}
- 일시: ${formattedDate} ${reservation.startTime} ~ ${reservation.endTime}
- 신청자: ${reservation.applicantName}
- 반려 사유: ${reservation.rejectionReason || '센터 내부 일정 또는 중복 신청'}
- 문의: ${center.phone}

불편을 드려 죄송합니다. 다른 날짜나 시간대로 재신청해주시기 바랍니다.`,
    };
  } else {
    return {
      templateName: '회의실_예약_접수_안내',
      content: `[${center.name}] 회의실 예약 신청이 정상 접수되었습니다.

- 회의실: ${room.name}
- 일시: ${formattedDate} ${reservation.startTime} ~ ${reservation.endTime}
- 신청자: ${reservation.applicantName}
- 현재 상태: 승인 대기중

담당자가 확인 후 승인 처리 시 최종 확정 알림톡이 발송됩니다.`,
    };
  }
}

export function logNotification(
  reservation: Reservation,
  center: Center,
  room: MeetingRoom,
  action: 'APPROVED' | 'REJECTED' | 'REQUESTED'
): NotificationLog {
  const { templateName, content } = createKakaoAlimtalkMessage(reservation, center, room, action);

  return {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    reservationId: reservation.id,
    type: 'KakaoAlimtalk',
    recipientName: reservation.applicantName,
    recipientPhone: reservation.applicantPhone,
    templateName,
    content,
    sentAt: new Date().toISOString(),
    status: 'SUCCESS',
  };
}
