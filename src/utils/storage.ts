import { Center, MeetingRoom, Reservation, NotificationLog, GoogleSheetsConfig } from '../types';
import { CENTERS, INITIAL_ROOMS, INITIAL_RESERVATIONS } from '../data/mockData';

const STORAGE_KEYS = {
  CENTERS: 'ccei_meeting_centers_v1',
  ROOMS: 'ccei_meeting_rooms_v1',
  RESERVATIONS: 'ccei_meeting_reservations_v1',
  NOTIFICATIONS: 'ccei_meeting_notifications_v1',
  GOOGLE_SHEETS: 'ccei_meeting_sheets_config_v1',
};

export function loadCenters(): Center[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CENTERS);
    return saved ? JSON.parse(saved) : CENTERS;
  } catch {
    return CENTERS;
  }
}

export function loadRooms(): MeetingRoom[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.ROOMS);
    return saved ? JSON.parse(saved) : INITIAL_ROOMS;
  } catch {
    return INITIAL_ROOMS;
  }
}

export function saveRooms(rooms: MeetingRoom[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
  } catch (e) {
    console.error('Failed to save rooms to localStorage', e);
  }
}

export function loadReservations(): Reservation[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.RESERVATIONS);
    return saved ? JSON.parse(saved) : INITIAL_RESERVATIONS;
  } catch {
    return INITIAL_RESERVATIONS;
  }
}

export function saveReservations(reservations: Reservation[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(reservations));
  } catch (e) {
    console.error('Failed to save reservations to localStorage', e);
  }
}

export function loadNotificationLogs(): NotificationLog[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function saveNotificationLogs(logs: NotificationLog[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save notification logs', e);
  }
}

export const DEFAULT_SPREADSHEET_ID = '18PooDLBvgUDk_gqld8tFGAC2g12dkEPP2LBi1-tCEXY';
export const DEFAULT_SPREADSHEET_URL =
  'https://docs.google.com/spreadsheets/d/18PooDLBvgUDk_gqld8tFGAC2g12dkEPP2LBi1-tCEXY/edit?usp=drive_link';

export function loadGoogleSheetsConfig(): GoogleSheetsConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.GOOGLE_SHEETS);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        webAppUrl: parsed.webAppUrl || '',
        spreadsheetId: parsed.spreadsheetId || DEFAULT_SPREADSHEET_ID,
        spreadsheetUrl: parsed.spreadsheetUrl || DEFAULT_SPREADSHEET_URL,
        autoSync: parsed.autoSync ?? true,
        lastSyncedAt: parsed.lastSyncedAt,
      };
    }
  } catch (e) {
    console.error('Failed to load Google Sheets config', e);
  }
  return {
    webAppUrl: '',
    spreadsheetId: DEFAULT_SPREADSHEET_ID,
    spreadsheetUrl: DEFAULT_SPREADSHEET_URL,
    autoSync: true,
  };
}

export function saveGoogleSheetsConfig(config: GoogleSheetsConfig) {
  try {
    localStorage.setItem(STORAGE_KEYS.GOOGLE_SHEETS, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save google sheets config', e);
  }
}

// Generates the production-grade Google Apps Script code for 4-sheet sync
export function generateGoogleAppsScriptCode(): string {
  return `/**
 * 서울 창조경제혁신센터 회의실 예약 시스템 - Google Apps Script 백엔드
 * 연결된 구글 시트: https://docs.google.com/spreadsheets/d/18PooDLBvgUDk_gqld8tFGAC2g12dkEPP2LBi1-tCEXY/edit?usp=drive_link
 * 시트 ID: 18PooDLBvgUDk_gqld8tFGAC2g12dkEPP2LBi1-tCEXY
 * 
 * [설치 및 연동 방법]
 * 1. 연결된 구글 시트 (18PooDLBvgUDk_gqld8tFGAC2g12dkEPP2LBi1-tCEXY) 접속
 * 2. 상단 메뉴 [확장 프로그램] -> [Apps Script] 클릭
 * 3. 기존 코드를 지우고 아래 전체 코드를 복사하여 붙여넣고 저장 (Ctrl+S)
 * 4. 우측 상단 [배포] -> [새 배포] 클릭
 * 5. 유형: "웹 앱" 선택
 * 6. 다음 사용자로 실행: "나 (Me)", 액세스 권한: "모든 사용자 (Anyone)" 설정 후 [배포]
 * 7. 발급된 "웹 앱 URL (https://script.google.com/...)"을 예약 시스템에 등록
 */

function getTargetSpreadsheet() {
  var TARGET_ID = '18PooDLBvgUDk_gqld8tFGAC2g12dkEPP2LBi1-tCEXY';
  try {
    return SpreadsheetApp.openById(TARGET_ID);
  } catch (e) {
    return SpreadsheetApp.getActiveSpreadsheet();
  }
}

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'read';
  var ss = getTargetSpreadsheet();
  ensureSheetsExist(ss);
  
  if (action === 'read') {
    var resSheet = ss.getSheetByName('Reservations');
    var roomSheet = ss.getSheetByName('Rooms');
    var centerSheet = ss.getSheetByName('Centers');
    
    var resData = getSheetDataAsObjects(resSheet);
    var roomData = getSheetDataAsObjects(roomSheet);
    var centerData = getSheetDataAsObjects(centerSheet);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      spreadsheetId: '18PooDLBvgUDk_gqld8tFGAC2g12dkEPP2LBi1-tCEXY',
      reservations: resData,
      rooms: roomData,
      centers: centerData
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'ok',
    spreadsheetId: '18PooDLBvgUDk_gqld8tFGAC2g12dkEPP2LBi1-tCEXY'
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var contents = JSON.parse(e.postData.contents);
    var ss = getTargetSpreadsheet();
    ensureSheetsExist(ss);
    
    if (contents.action === 'sync') {
      // Sync Reservations
      var resSheet = ss.getSheetByName('Reservations');
      if (resSheet && contents.reservations) {
        updateSheetFromObjects(resSheet, [
          'id', 'centerId', 'roomId', 'date', 'startTime', 'endTime', 
          'purpose', 'applicantName', 'applicantCompany', 'applicantPhone', 
          'status', 'requestedAt', 'approvedAt', 'rejectionReason'
        ], contents.reservations);
      }
      
      // Sync Rooms
      var roomSheet = ss.getSheetByName('Rooms');
      if (roomSheet && contents.rooms) {
        updateSheetFromObjects(roomSheet, [
          'id', 'centerId', 'name', 'capacity', 'floor', 'description', 'isAvailable'
        ], contents.rooms);
      }
      
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Google Sheets DB Synced Successfully',
        spreadsheetId: '18PooDLBvgUDk_gqld8tFGAC2g12dkEPP2LBi1-tCEXY',
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function ensureSheetsExist(ss) {
  var requiredSheets = ['Reservations', 'Rooms', 'Centers', 'Admins'];
  for (var i = 0; i < requiredSheets.length; i++) {
    var sheetName = requiredSheets[i];
    if (!ss.getSheetByName(sheetName)) {
      ss.insertSheet(sheetName);
    }
  }
}

function getSheetDataAsObjects(sheet) {
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  var headers = data[0];
  var result = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j];
    }
    result.push(obj);
  }
  return result;
}

function updateSheetFromObjects(sheet, headers, objects) {
  sheet.clearContents();
  sheet.appendRow(headers);
  for (var i = 0; i < objects.length; i++) {
    var obj = objects[i];
    var row = [];
    for (var j = 0; j < headers.length; j++) {
      var val = obj[headers[j]];
      row.push(val !== undefined && val !== null ? val : '');
    }
    sheet.appendRow(row);
  }
}
`;
}
