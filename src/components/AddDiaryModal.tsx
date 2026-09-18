import { useState } from 'react';
import { DiaryEntry } from '../types';
import { processImageFile } from '../utils/storage';
import { X, Upload, Sparkles, Tag, Image as ImageIcon } from 'lucide-react';

interface AddDiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Omit<DiaryEntry, 'id'>) => void;
}

const QUICK_TAGS = ['첫뒤집기', '이유식', '첫걸음마', '첫돌', '옹알이', '예방접종', '백일', '가족나들이', '미소'];

export function AddDiaryModal({ isOpen, onClose, onSave }: AddDiaryModalProps) {
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [mood, setMood] = useState<DiaryEntry['mood']>('happy');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isProcessingImg, setIsProcessingImg] = useState(false);

  if (!isOpen) return null;

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsProcessingImg(true);
      const dataUrl = await processImageFile(file, 900, 0.85);
      setPhotoUrl(dataUrl);
    } catch {
      alert('이미지를 불러오는데 실패했습니다.');
    } finally {
      setIsProcessingImg(false);
    }
  };

  const handleAddTag = (tagToAdd: string) => {
    const clean = tagToAdd.replace(/^#/, '').trim();
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (t: string) => {
    setTags(tags.filter((item) => item !== t));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('제목과 일기 내용을 입력해주세요.');
      return;
    }

    onSave({
      date,
      title: title.trim(),
      content: content.trim(),
      photoUrl: photoUrl || undefined,
      mood,
      tags,
    });

    // Reset fields
    setTitle('');
    setContent('');
    setPhotoUrl('');
    setTags([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-bold text-stone-900">새로운 성장 이야기 기록</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-sm font-bold"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                날짜 <span className="text-rose-500">*</span>
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
                아이의 오늘 기분/분위기
              </label>
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value as DiaryEntry['mood'])}
                className="w-full px-3 py-2 text-xs bg-stone-50 rounded-xl border border-stone-200"
              >
                <option value="happy">🥰 방긋방긋 행복해요</option>
                <option value="excited">🥳 에너자이저 신나요</option>
                <option value="proud">✨ 기특하고 대견해요</option>
                <option value="curious">👀 눈망울 똘망 호기심</option>
                <option value="sleepy">😴 새근새근 잠와요</option>
                <option value="crying">🥺 칭얼칭얼 눈물</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">
              이야기 제목 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="예: 처음으로 혼자 서서 손뼉을 쳤어요!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Photo Upload Area */}
          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">
              사진 첨부 (추억 사진)
            </label>
            {photoUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 max-h-48 flex items-center justify-center group">
                <img src={photoUrl} alt="업로드 미리보기" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setPhotoUrl('')}
                  className="absolute top-2 right-2 p-1.5 bg-stone-900/70 text-white rounded-lg text-xs hover:bg-rose-600 transition-colors"
                >
                  삭제
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-stone-200 hover:border-amber-400 rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-stone-50/60 hover:bg-amber-50/30 transition-all">
                <Upload className="w-5 h-5 text-stone-400" />
                <span className="text-xs font-medium text-stone-600">
                  {isProcessingImg ? '사진 처리 중...' : '클릭하여 사진 파일 올리기'}
                </span>
                <span className="text-[10px] text-stone-400">JPG, PNG, GIF 파일 지원</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFile}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">
              성장 이야기 내용 <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              placeholder="오늘 아이의 사랑스러운 행동이나 기억하고 싶은 특별한 감정을 적어주세요."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">
              키워드 태그
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="태그 입력 후 추가 (예: 이유식, 첫걸음)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag(tagInput);
                  }
                }}
                className="flex-1 px-3 py-1.5 text-xs bg-stone-50 rounded-xl border border-stone-200"
              />
              <button
                type="button"
                onClick={() => handleAddTag(tagInput)}
                className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-semibold rounded-xl"
              >
                추가
              </button>
            </div>

            {/* Quick tag chips */}
            <div className="flex flex-wrap gap-1 mb-2">
              {QUICK_TAGS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleAddTag(t)}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 hover:bg-amber-100 hover:text-amber-800"
                >
                  +{t}
                </button>
              ))}
            </div>

            {/* Selected tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 font-medium"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="text-amber-700 hover:text-rose-700 font-bold ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
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
              추억 저장하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
