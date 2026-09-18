import { useState } from 'react';
import { ToothRecord } from '../types';
import { formatDateKR } from '../utils/dateUtils';
import confetti from 'canvas-confetti';
import { Sparkles, Calendar, CheckCircle, Info, Heart } from 'lucide-react';

interface TeethChartTabProps {
  teeth: ToothRecord[];
  onUpdateTooth: (id: string, erupted: boolean, date?: string, notes?: string) => void;
}

export function TeethChartTab({ teeth, onUpdateTooth }: TeethChartTabProps) {
  const [selectedTooth, setSelectedTooth] = useState<ToothRecord | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const upperTeeth = teeth.filter((t) => t.arch === 'upper');
  const lowerTeeth = teeth.filter((t) => t.arch === 'lower');

  const eruptedCount = teeth.filter((t) => t.erupted).length;

  const handleToothClick = (tooth: ToothRecord) => {
    setSelectedTooth(tooth);
    setEditDate(tooth.eruptedDate || new Date().toISOString().split('T')[0]);
    setEditNotes(tooth.notes || '');
  };

  const handleSaveStatus = (nextErupted: boolean) => {
    if (!selectedTooth) return;

    if (nextErupted && !selectedTooth.erupted) {
      try {
        confetti({
          particleCount: 50,
          spread: 50,
          origin: { y: 0.6 },
          colors: ['#38bdf8', '#fbbf24', '#f43f5e'],
        });
      } catch {
        // Fallback
      }
    }

    onUpdateTooth(
      selectedTooth.id,
      nextErupted,
      nextErupted ? editDate : undefined,
      nextErupted ? editNotes : undefined
    );

    setSelectedTooth(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 rounded-3xl p-6 text-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <Sparkles className="w-5 h-5 text-sky-200" />
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-100">
              유치 발달 다이어리
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold">
            작고 소중한 첫 이 맹출 기록 ({eruptedCount} / 20개)
          </h3>
          <p className="text-xs text-sky-100/90 max-w-md">
            생후 6개월경 아래 앞니부터 시작해 총 20개의 유치가 차례로 돋아납니다. 치아를 클릭해 맹출 날짜를 기록해보세요!
          </p>
        </div>

        <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 w-full md:w-64 border border-white/20 text-center">
          <div className="text-xs font-medium text-sky-100 mb-1">현재 유치 맹출 현황</div>
          <div className="text-2xl font-black text-white">
            {eruptedCount} <span className="text-sm font-normal text-sky-200">/ 20개</span>
          </div>
          <div className="w-full h-2.5 bg-white/20 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-700"
              style={{ width: `${(eruptedCount / 20) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Visual Teeth Dental Arch Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200/60 shadow-xs">
        <div className="max-w-xl mx-auto space-y-8 text-center">
          {/* Upper Arch */}
          <div>
            <div className="text-xs font-bold text-stone-500 mb-3 flex items-center justify-center gap-1.5">
              <span>윗니 (상악 유치 10개)</span>
            </div>
            <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
              {upperTeeth.map((tooth) => (
                <button
                  key={tooth.id}
                  onClick={() => handleToothClick(tooth)}
                  className={`group relative flex flex-col items-center justify-center p-2 rounded-2xl border transition-all ${
                    tooth.erupted
                      ? 'bg-amber-100/90 border-amber-400 text-amber-950 shadow-xs hover:scale-105 ring-2 ring-amber-200'
                      : 'bg-stone-50 border-stone-200 text-stone-400 hover:border-amber-300 hover:bg-amber-50/50'
                  } w-14 sm:w-16 h-18 sm:h-20`}
                >
                  <div
                    className={`w-6 h-7 sm:w-7 sm:h-8 rounded-t-xl rounded-b-md flex items-center justify-center text-xs font-bold shadow-2xs transition-colors ${
                      tooth.erupted
                        ? 'bg-white text-amber-700 border-2 border-amber-300'
                        : 'bg-stone-200/80 text-stone-400 border border-stone-300'
                    }`}
                  >
                    🦷
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-semibold mt-1 truncate max-w-[50px]">
                    {tooth.name.split('(')[0].replace('상악 ', '')}
                  </span>
                  {tooth.erupted && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 rounded-full text-white text-[8px] flex items-center justify-center">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Center Guide Divider */}
          <div className="relative py-2">
            <div className="border-t border-dashed border-stone-200" />
            <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold px-3 py-0.5 rounded-full">
              입술 / 중심선
            </span>
          </div>

          {/* Lower Arch */}
          <div>
            <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
              {lowerTeeth.map((tooth) => (
                <button
                  key={tooth.id}
                  onClick={() => handleToothClick(tooth)}
                  className={`group relative flex flex-col items-center justify-center p-2 rounded-2xl border transition-all ${
                    tooth.erupted
                      ? 'bg-amber-100/90 border-amber-400 text-amber-950 shadow-xs hover:scale-105 ring-2 ring-amber-200'
                      : 'bg-stone-50 border-stone-200 text-stone-400 hover:border-amber-300 hover:bg-amber-50/50'
                  } w-14 sm:w-16 h-18 sm:h-20`}
                >
                  <div
                    className={`w-6 h-7 sm:w-7 sm:h-8 rounded-b-xl rounded-t-md flex items-center justify-center text-xs font-bold shadow-2xs transition-colors ${
                      tooth.erupted
                        ? 'bg-white text-amber-700 border-2 border-amber-300'
                        : 'bg-stone-200/80 text-stone-400 border border-stone-300'
                    }`}
                  >
                    🦷
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-semibold mt-1 truncate max-w-[50px]">
                    {tooth.name.split('(')[0].replace('하악 ', '')}
                  </span>
                  {tooth.erupted && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 rounded-full text-white text-[8px] flex items-center justify-center">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="text-xs font-bold text-stone-500 mt-3 flex items-center justify-center gap-1.5">
              <span>아랫니 (하악 유치 10개)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tooth Edit Modal */}
      {selectedTooth && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  {selectedTooth.name}
                </h3>
                <div className="text-xs text-stone-400">
                  평균 맹출 시기: {selectedTooth.typicalMonthRange}
                </div>
              </div>
              <button
                onClick={() => setSelectedTooth(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  맹출 일자 (이가 잇몸을 뚫고 나온 날)
                </label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  메모 (이앓이 증상, 치발기 반응 등)
                </label>
                <input
                  type="text"
                  placeholder="예: 침을 많이 흘리고 밤에 보챔"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center gap-2">
                {selectedTooth.erupted && (
                  <button
                    type="button"
                    onClick={() => handleSaveStatus(false)}
                    className="flex-1 py-2.5 text-xs text-rose-600 hover:bg-rose-50 rounded-xl font-medium"
                  >
                    맹출 취소 (미맹출로)
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleSaveStatus(true)}
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs"
                >
                  {selectedTooth.erupted ? '정보 수정' : '이가 났어요! (맹출 완료)'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pediatric Dental Care Guide */}
      <div className="bg-amber-50/70 rounded-3xl p-5 sm:p-6 border border-amber-200/60">
        <h4 className="text-sm font-bold text-amber-950 flex items-center gap-2 mb-2">
          <Info className="w-4 h-4 text-amber-600" />
          시기별 유치 관리 꿀팁
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-stone-600">
          <div className="bg-white/80 p-3.5 rounded-2xl border border-amber-100">
            <div className="font-bold text-stone-800 mb-1">1. 생후 6~8개월 (첫 유치)</div>
            <p className="leading-relaxed">
              수유 후 멸균 구강 거즈나 실리콘 핑거 칫솔에 끓여 식힌 물을 묻혀 잇몸과 이를 부드럽게 닦아주세요.
            </p>
          </div>
          <div className="bg-white/80 p-3.5 rounded-2xl border border-amber-100">
            <div className="font-bold text-stone-800 mb-1">2. 생후 12개월경 (어금니 준비)</div>
            <p className="leading-relaxed">
              첫 돌 즈음 영유아 구강검진을 권장합니다. 밤중 수유는 충치의 주원인이 되므로 보리차나 물로 서서히 교체해주세요.
            </p>
          </div>
          <div className="bg-white/80 p-3.5 rounded-2xl border border-amber-100">
            <div className="font-bold text-stone-800 mb-1">3. 생후 24개월 이후 (20개 완성)</div>
            <p className="leading-relaxed">
              쌀알 크기만큼의 저불소 치약으로 하루 2~3회 양치질을 지도하고 양치 후 뱉어내는 습관을 연습합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
