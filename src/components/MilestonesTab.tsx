import { useState } from 'react';
import { MilestoneItem } from '../types';
import { formatDateKR } from '../utils/dateUtils';
import confetti from 'canvas-confetti';
import { CheckCircle2, Circle, Sparkles, Plus, Calendar, Award, Heart, HelpCircle } from 'lucide-react';

interface MilestonesTabProps {
  milestones: MilestoneItem[];
  onToggleMilestone: (id: string, achieved: boolean, date?: string, notes?: string) => void;
  onAddCustomMilestone: (item: Omit<MilestoneItem, 'id'>) => void;
}

const AGE_RANGES = [
  { id: 'all', label: '전체 단계' },
  { id: '0-3m', label: '0~3개월 (신생아/초기)' },
  { id: '4-6m', label: '4~6개월 (뒤집기/이유식)' },
  { id: '7-12m', label: '7~12개월 (앉기/첫걸음)' },
  { id: '1-2y', label: '1~2세 (걸음마/단어)' },
  { id: '2y+', label: '2세 이상 (문장/사회성)' },
];

export function MilestonesTab({
  milestones,
  onToggleMilestone,
  onAddCustomMilestone,
}: MilestonesTabProps) {
  const [selectedRange, setSelectedRange] = useState<string>('all');
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Custom Milestone state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newAgeRange, setNewAgeRange] = useState<MilestoneItem['ageRange']>('7-12m');
  const [newCategory, setNewCategory] = useState<MilestoneItem['category']>('special');

  const achievedCount = milestones.filter((m) => m.achieved).length;
  const progressPercent = Math.round((achievedCount / (milestones.length || 1)) * 100);

  const filtered = selectedRange === 'all'
    ? milestones
    : milestones.filter((m) => m.ageRange === selectedRange);

  const handleCheck = (m: MilestoneItem) => {
    const nextAchieved = !m.achieved;
    if (nextAchieved) {
      // Confetti burst!
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#f59e0b', '#ec4899', '#3b82f6', '#10b981'],
        });
      } catch {
        // Safe fallback
      }
      const todayStr = new Date().toISOString().split('T')[0];
      onToggleMilestone(m.id, true, todayStr, m.notes);
    } else {
      onToggleMilestone(m.id, false);
    }
  };

  const handleSaveEdit = (id: string) => {
    onToggleMilestone(id, true, editDate, editNotes);
    setEditingMilestoneId(null);
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddCustomMilestone({
      title: newTitle.trim(),
      description: newDesc.trim() || '우리 아이만의 특별한 성장 마일스톤',
      ageRange: newAgeRange,
      category: newCategory,
      achieved: true,
      achievedDate: new Date().toISOString().split('T')[0],
    });
    setNewTitle('');
    setNewDesc('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Overview Progress Card */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-6 text-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <Award className="w-6 h-6 text-amber-200" />
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-100">
              성장 발달 마일스톤
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold">
            소중한 첫 순간들의 기록 ({achievedCount}/{milestones.length})
          </h3>
          <p className="text-xs text-amber-100/90 max-w-md">
            눈맞춤부터 첫 뒤집기, 첫 이유식, 첫 걸음마까지! 아이가 한 걸음씩 세상을 향해 나아가는 발자취입니다.
          </p>
        </div>

        {/* Circular / Bar Progress */}
        <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 w-full md:w-64 border border-white/20">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span>전체 마일스톤 달성률</span>
            <span className="text-amber-200">{progressPercent}%</span>
          </div>
          <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="mt-2 text-[11px] text-amber-100 text-center">
            {achievedCount}개의 눈부신 순간을 완성했어요 🎉
          </div>
        </div>
      </div>

      {/* Filter and Add Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {AGE_RANGES.map((range) => (
            <button
              key={range.id}
              onClick={() => setSelectedRange(range.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedRange === range.id
                  ? 'bg-amber-800 text-white shadow-xs'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl text-xs font-semibold shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          마일스톤 직접 추가
        </button>
      </div>

      {/* Milestones List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => {
          const isEditing = editingMilestoneId === item.id;
          return (
            <div
              key={item.id}
              className={`rounded-3xl p-5 border transition-all ${
                item.achieved
                  ? 'bg-white border-amber-300/80 shadow-xs ring-1 ring-amber-100'
                  : 'bg-stone-50/70 border-stone-200/80 text-stone-500'
              }`}
            >
              <div className="flex items-start gap-3.5">
                {/* Checkbox */}
                <button
                  onClick={() => handleCheck(item)}
                  className="mt-0.5 text-amber-600 hover:scale-110 transition-transform focus:outline-none"
                  title={item.achieved ? '달성 완료 취소' : '달성 체크!'}
                >
                  {item.achieved ? (
                    <CheckCircle2 className="w-6 h-6 fill-amber-500 text-white" />
                  ) : (
                    <Circle className="w-6 h-6 text-stone-300 hover:text-amber-400" />
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4
                      className={`text-sm font-bold ${
                        item.achieved ? 'text-stone-900' : 'text-stone-600'
                      }`}
                    >
                      {item.title}
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 shrink-0">
                      {item.ageRange}
                    </span>
                  </div>

                  <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Achieved Info */}
                  {item.achieved && (
                    <div className="mt-3 pt-3 border-t border-amber-100/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1 text-amber-800 font-medium">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>달성일: {item.achievedDate ? formatDateKR(item.achievedDate) : '날짜 미지정'}</span>
                      </div>
                      <button
                        onClick={() => {
                          setEditingMilestoneId(item.id);
                          setEditDate(item.achievedDate || new Date().toISOString().split('T')[0]);
                          setEditNotes(item.notes || '');
                        }}
                        className="text-[11px] text-stone-500 hover:text-amber-700 underline"
                      >
                        날짜/메모 수정
                      </button>
                    </div>
                  )}

                  {item.notes && item.achieved && (
                    <div className="mt-1 text-[11px] text-stone-600 bg-amber-50/60 p-2 rounded-xl">
                      "{item.notes}"
                    </div>
                  )}

                  {/* Inline edit panel */}
                  {isEditing && (
                    <div className="mt-3 p-3 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
                      <div className="text-xs font-semibold text-amber-900">달성 정보 기록</div>
                      <div>
                        <label className="text-[11px] text-stone-600 block mb-1">달성 일자</label>
                        <input
                          type="date"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-stone-200"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-stone-600 block mb-1">메모 (당시 상황/느낌)</label>
                        <input
                          type="text"
                          value={editNotes}
                          placeholder="예: 엄마 보고 방긋 웃어줌"
                          onChange={(e) => setEditNotes(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white rounded-lg border border-stone-200"
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          onClick={() => setEditingMilestoneId(null)}
                          className="px-2.5 py-1 text-xs text-stone-500 hover:bg-stone-100 rounded-md"
                        >
                          취소
                        </button>
                        <button
                          onClick={() => handleSaveEdit(item.id)}
                          className="px-3 py-1 text-xs bg-amber-600 text-white font-medium rounded-md hover:bg-amber-700"
                        >
                          저장
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-base font-bold text-stone-900">
                우리 아이 맞춤 마일스톤 추가
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCustom} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  마일스톤 제목 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 처음으로 물놀이 수영장 들어간 날"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  설명 또는 메모
                </label>
                <textarea
                  rows={2}
                  placeholder="상세 내용을 적어주세요"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    발달 단계
                  </label>
                  <select
                    value={newAgeRange}
                    onChange={(e) => setNewAgeRange(e.target.value as MilestoneItem['ageRange'])}
                    className="w-full px-3 py-2 text-xs bg-stone-50 rounded-xl border border-stone-200"
                  >
                    <option value="0-3m">0~3개월</option>
                    <option value="4-6m">4~6개월</option>
                    <option value="7-12m">7~12개월</option>
                    <option value="1-2y">1~2세</option>
                    <option value="2y+">2세 이상</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    분류
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as MilestoneItem['category'])}
                    className="w-full px-3 py-2 text-xs bg-stone-50 rounded-xl border border-stone-200"
                  >
                    <option value="special">특별한 순간</option>
                    <option value="motor">대/소근육 운동</option>
                    <option value="language">언어/표현</option>
                    <option value="social">사회성/정서</option>
                    <option value="feeding">수유/이유식</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-500 hover:bg-stone-100 rounded-xl"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl"
                >
                  마일스톤 등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
