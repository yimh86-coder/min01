import { useState, useEffect } from 'react';
import { GrowthRecord } from '../types';
import { X, Ruler, Scale } from 'lucide-react';

interface AddGrowthRecordModalProps {
  birthDateStr: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: Omit<GrowthRecord, 'id'>) => void;
}

export function AddGrowthRecordModal({
  birthDateStr,
  isOpen,
  onClose,
  onSave,
}: AddGrowthRecordModalProps) {
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [ageMonths, setAgeMonths] = useState<number>(0);
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [headCircumference, setHeadCircumference] = useState('');
  const [memo, setMemo] = useState('');

  // Auto-calculate months based on measurement date vs birth date
  useEffect(() => {
    if (!birthDateStr || !date) return;
    const b = new Date(birthDateStr);
    const d = new Date(date);
    const diffMonths = (d.getFullYear() - b.getFullYear()) * 12 + (d.getMonth() - b.getMonth());
    setAgeMonths(Math.max(0, diffMonths));
  }, [birthDateStr, date]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const h = parseFloat(height);
    const w = parseFloat(weight);

    if (isNaN(h) || isNaN(w)) {
      alert('키와 몸무게를 정확히 입력해주세요.');
      return;
    }

    onSave({
      date,
      ageMonths,
      height: h,
      weight: w,
      headCircumference: headCircumference ? parseFloat(headCircumference) : undefined,
      memo: memo.trim() || undefined,
    });

    // Reset fields
    setHeight('');
    setWeight('');
    setHeadCircumference('');
    setMemo('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-bold text-stone-900">신체 치수 측정 기록 추가</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-sm font-bold"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                측정 일자 <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                측정 당시 월령 (자동 계산)
              </label>
              <div className="flex items-center px-3 py-2 bg-stone-100 rounded-xl border border-stone-200 text-xs font-bold text-amber-800">
                {ageMonths} 개월
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                키 (cm) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                required
                placeholder="예: 68.5"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                몸무게 (kg) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="예: 8.2"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">
              머리둘레 (cm, 선택 사항)
            </label>
            <input
              type="number"
              step="0.1"
              placeholder="예: 42.1"
              value={headCircumference}
              onChange={(e) => setHeadCircumference(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">
              측정 메모 및 의사 소견
            </label>
            <textarea
              rows={2}
              placeholder="예: 6개월 영유아 검진 통과, 상위 40%로 고르게 잘 자라는 중"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-500 hover:bg-stone-100 rounded-xl"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs"
            >
              측정 기록 저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
