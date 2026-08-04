import React, { useState } from 'react';
import { NotificationLog } from '../../types';
import {
  MessageSquare,
  CheckCircle2,
  Clock,
  Phone,
  Send,
  Sliders,
  Sparkles,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

interface NotificationLogModalProps {
  logs: NotificationLog[];
  onSendTestNotification: (phone: string) => void;
}

export const NotificationLogModal: React.FC<NotificationLogModalProps> = ({
  logs,
  onSendTestNotification,
}) => {
  const [testPhone, setTestPhone] = useState<string>('010-1234-5678');
  const [activeSubTab, setActiveSubTab] = useState<'logs' | 'api-settings'>('logs');
  const [apiVendor, setApiVendor] = useState<'solapi' | 'aligo' | 'popbill'>('solapi');
  const [apiKey, setApiKey] = useState<string>('NCS1234567890ABCDEF');
  const [apiSecret, setApiSecret] = useState<string>('******************');

  const handleTestSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone) return;
    onSendTestNotification(testPhone);
    alert(`[알림톡 테스트] ${testPhone} 번호로 카카오 알림톡 전송 테스트 로그가 기록되었습니다.`);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-5">
      {/* Tab Switcher */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('logs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
              activeSubTab === 'logs'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            카카오 알림톡 / 문자 발송 로그 ({logs.length}건)
          </button>
          <button
            onClick={() => setActiveSubTab('api-settings')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
              activeSubTab === 'api-settings'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            발신대행사 API 연동 설정 (솔라피/알리고/팝빌)
          </button>
        </div>
      </div>

      {activeSubTab === 'logs' ? (
        <div className="space-y-4">
          {/* Test Sender */}
          <form
            onSubmit={handleTestSend}
            className="bg-amber-50/70 border border-amber-200 p-3 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-2 text-xs"
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="font-bold text-amber-950">알림톡 테스트 전송:</span>
              <input
                type="tel"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="010-0000-0000"
                className="bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 w-36 font-mono"
              />
            </div>
            <button
              type="submit"
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1 rounded shadow-2xs cursor-pointer flex items-center gap-1"
            >
              <Send className="w-3.5 h-3.5" />
              <span>테스트 발송</span>
            </button>
          </form>

          {/* Log List */}
          <div className="space-y-3">
            {logs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                발송된 알림톡 기록이 없습니다. 예약 승인 시 이곳에 실시간 로그가 수집됩니다.
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-400 text-amber-950 font-bold px-2 py-0.5 rounded text-[10px]">
                        카카오 알림톡
                      </span>
                      <span className="font-bold text-slate-800">{log.templateName}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-600">
                        수신자: {log.recipientName} ({log.recipientPhone})
                      </span>
                    </div>

                    <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 발송 성공
                    </span>
                  </div>

                  <pre className="bg-white border border-slate-200 p-2.5 rounded-lg text-[11px] font-sans text-slate-800 whitespace-pre-wrap leading-relaxed">
                    {log.content}
                  </pre>

                  <div className="text-[10px] text-slate-400 text-right">
                    발송시각: {new Date(log.sentAt).toLocaleString('ko-KR')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* API Config Tab */
        <div className="space-y-4 text-xs">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-blue-900 space-y-1">
            <h4 className="font-bold text-sm flex items-center gap-1.5 text-blue-950">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>알림톡 딜러사(발신대행사) REST API 연동 가이드</span>
            </h4>
            <p className="text-slate-600">
              실무 운영 환경에서는 Solapi(솔라피), Aligo(알리고), Popbill(팝빌) 등의 REST API Key와 승인된 카카오 알림톡 템플릿 코드(Template ID)를 연동합니다.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">발신 대행사 선택</label>
                <select
                  value={apiVendor}
                  onChange={(e) => setApiVendor(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-slate-800"
                >
                  <option value="solapi">Solapi (솔라피 / 쿨SMS)</option>
                  <option value="aligo">Aligo (알리고 알림톡)</option>
                  <option value="popbill">Popbill (팝빌 REST API)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">API Key</label>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">API Secret / Token</label>
                <input
                  type="password"
                  value={apiSecret}
                  onChange={(e) => setApiSecret(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-slate-800"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => alert('API 설정이 저장되었습니다. (테스트 연동 모드 활성화됨)')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer"
              >
                API 설정 저장하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
