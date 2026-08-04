import React, { useState } from 'react';
import { GoogleSheetsConfig } from '../../types';
import { generateGoogleAppsScriptCode } from '../../utils/storage';
import {
  Database,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Table,
  Code,
  FileSpreadsheet,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface GoogleSheetsIntegrationProps {
  sheetsConfig: GoogleSheetsConfig;
  onSaveSheetsConfig: (config: GoogleSheetsConfig) => void;
  onManualSync: () => void;
  isSyncing: boolean;
}

export const GoogleSheetsIntegration: React.FC<GoogleSheetsIntegrationProps> = ({
  sheetsConfig,
  onSaveSheetsConfig,
  onManualSync,
  isSyncing,
}) => {
  const [webAppUrl, setWebAppUrl] = useState<string>(sheetsConfig.webAppUrl || '');
  const [copied, setCopied] = useState<boolean>(false);
  const scriptCode = generateGoogleAppsScriptCode();

  const handleCopyScript = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSheetsConfig({
      ...sheetsConfig,
      webAppUrl,
    });
    alert('Google Sheets Web App URL 연결 설정이 저장되었습니다.');
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">Google Sheets DB 연동 & Apps Script 코드</h3>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200">
              No-DB 백엔드
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            별도 DB 구축 없이 Google Sheets를 4개 시트(Centers, Rooms, Reservations, Admins) 데이터 저장소로 사용합니다.
          </p>
        </div>

        <button
          onClick={onManualSync}
          disabled={isSyncing}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Google Sheets 동기화 중...' : '지금 Google Sheets 수동 동기화'}</span>
        </button>
      </div>

      {/* Connected Sheet Info Box */}
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-3">
          <div className="bg-emerald-600 text-white p-2 rounded-lg shrink-0 mt-0.5">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">연결된 Google Sheet</span>
              <span className="bg-emerald-200/80 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                활성화됨
              </span>
            </div>
            <p className="text-slate-600 font-mono text-[11px] mt-0.5 truncate max-w-md sm:max-w-lg">
              https://docs.google.com/spreadsheets/d/18PooDLBvgUDk_gqld8tFGAC2g12dkEPP2LBi1-tCEXY/edit?usp=drive_link
            </p>
            <p className="text-slate-500 text-[10px] mt-1">
              시트 ID: <code className="bg-white/80 px-1.5 py-0.5 rounded border border-emerald-200 font-mono font-bold text-slate-800">18PooDLBvgUDk_gqld8tFGAC2g12dkEPP2LBi1-tCEXY</code>
            </p>
          </div>
        </div>

        <a
          href="https://docs.google.com/spreadsheets/d/18PooDLBvgUDk_gqld8tFGAC2g12dkEPP2LBi1-tCEXY/edit?usp=drive_link"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 shadow-2xs"
        >
          <span>Google Sheet 열기</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* 4 Sheets Schema Map */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Google Sheets 4개 시트 구조 스키마 (자동 생성 가이드)</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <span className="font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded text-[10px] inline-block mb-1">
              시트 1: Centers (센터 목록)
            </span>
            <p className="text-slate-600 text-[11px] font-mono">
              center_id | center_name | address | phone | badge
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <span className="font-bold text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded text-[10px] inline-block mb-1">
              시트 2: Rooms (회의실 목록)
            </span>
            <p className="text-slate-600 text-[11px] font-mono">
              room_id | center_id | room_name | capacity | floor | equipments
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-[10px] inline-block mb-1">
              시트 3: Reservations (예약 데이터 대장)
            </span>
            <p className="text-slate-600 text-[11px] font-mono">
              reservation_id | center_id | room_id | date | start_time | end_time | purpose | applicant_name | applicant_company | status
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <span className="font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded text-[10px] inline-block mb-1">
              시트 4: Admins (관리자 계정)
            </span>
            <p className="text-slate-600 text-[11px] font-mono">
              admin_id | name | phone | center_id | role
            </p>
          </div>
        </div>
      </div>

      {/* WebApp URL Input */}
      <form onSubmit={handleSaveConfig} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3 text-xs">
        <label className="block font-bold text-slate-800">
          Google Apps Script 배포 URL (Web App URL)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="url"
            placeholder="https://script.google.com/macros/s/AKfycb.../exec"
            value={webAppUrl}
            onChange={(e) => setWebAppUrl(e.target.value)}
            className="flex-1 bg-white border border-slate-300 rounded-lg p-2.5 font-mono text-slate-800 text-xs focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-lg transition-colors shadow-2xs shrink-0 cursor-pointer"
          >
            연결 URL 저장
          </button>
        </div>
      </form>

      {/* Google Apps Script Code Box */}
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
            <Code className="w-4 h-4 text-blue-600" />
            <span>Google Apps Script 백엔드 소스코드 (원클릭 복사)</span>
          </h4>

          <button
            onClick={handleCopyScript}
            className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>복사 완료!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>코드 전체 복사</span>
              </>
            )}
          </button>
        </div>

        <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-[11px] overflow-x-auto max-h-[280px] border border-slate-800">
          {scriptCode}
        </pre>
      </div>
    </div>
  );
};
