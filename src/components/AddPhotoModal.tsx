import React, { useState, useRef } from 'react';
import { AlbumPhoto, PhotoCategory } from '../types';
import { processImageFile } from '../utils/storage';
import { useAppTheme } from '../context/ThemeContext';
import { X, Upload, Calendar, Tag, MapPin, Sparkles } from 'lucide-react';

interface AddPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (photo: Omit<AlbumPhoto, 'id'>) => void;
}

const PRESET_CATEGORIES: { key: PhotoCategory; label: string; icon: string }[] = [
  { key: '첫걸음마', label: '첫걸음마', icon: '👣' },
  { key: '생일', label: '생일', icon: '🎂' },
  { key: '여행', label: '여행', icon: '✈️' },
  { key: '일상', label: '일상', icon: '🧸' },
  { key: '기념일', label: '기념일', icon: '🌿' },
  { key: '이유식', label: '이유식', icon: '🥣' },
  { key: '가족', label: '가족', icon: '👪' },
];

export function AddPhotoModal({ isOpen, onClose, onSave }: AddPhotoModalProps) {
  const { isPink } = useAppTheme();
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<string>('일상');
  const [customCategory, setCustomCategory] = useState<string>('');
  const [isCustomCategory, setIsCustomCategory] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [memo, setMemo] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [tagInput, setTagInput] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('이미지 파일(JPG, PNG, WebP 등)만 업로드할 수 있습니다.');
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMsg(null);
      const compressedDataUrl = await processImageFile(file, 1600, 0.88);
      setPhotoUrl(compressedDataUrl);

      // Auto title if empty
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, '').slice(0, 30));
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('이미지를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('이미지 파일만 드래그하여 업로드할 수 있습니다.');
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMsg(null);
      const compressedDataUrl = await processImageFile(file, 1600, 0.88);
      setPhotoUrl(compressedDataUrl);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, '').slice(0, 30));
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('이미지를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddTag = () => {
    const clean = tagInput.trim().replace(/^#/, '');
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrl) {
      setErrorMsg('사진을 선택하거나 업로드해주세요.');
      return;
    }

    const finalCategory = (isCustomCategory ? customCategory.trim() : category) || '일상';

    onSave({
      photoUrl,
      date,
      category: finalCategory,
      title: title.trim() || '소중한 성장 기록',
      memo: memo.trim() || undefined,
      location: location.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
      isFavorite: false,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-pink-50/50 border-pink-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-pink-100/80 text-pink-500">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900">
                성장 앨범에 사진 추가
              </h2>
              <p className="text-xs text-stone-500">
                첫걸음마, 생일, 여행 등 기억하고 싶은 소중한 순간을 올려보세요.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Photo Upload Zone */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              성장 사진 업로드 *
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {photoUrl ? (
              <div className="relative aspect-16/9 rounded-2xl overflow-hidden border border-stone-200 group bg-stone-100">
                <img src={photoUrl} alt="업로드 미리보기" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 bg-white/90 text-stone-900 text-xs font-bold rounded-lg shadow-sm hover:bg-white"
                  >
                    사진 변경
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhotoUrl('')}
                    className="px-3.5 py-1.5 bg-rose-600/90 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-rose-600"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
                  isProcessing
                    ? 'border-pink-300 bg-pink-50/50'
                    : 'border-stone-300 hover:border-pink-300 hover:bg-pink-50/30'
                }`}
              >
                <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center bg-pink-100 text-pink-500">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-stone-800">
                  {isProcessing ? '이미지 최적화 중...' : '클릭하거나 사진을 이곳으로 드래그하세요'}
                </p>
                <p className="text-xs text-stone-500 mt-1">JPG, PNG, HEIC, WebP (고화질 자동 압축 지원)</p>
              </div>
            )}
          </div>

          {/* Date & Location Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-pink-500" />
                <span>촬영 날짜 *</span>
              </label>
              <input
                type="date"
                value={date}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-pink-300/30 focus:border-pink-300"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-pink-500" />
                <span>장소 (선택)</span>
              </label>
              <input
                type="text"
                placeholder="예: 제주 협재해변, 우리집 거실"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-pink-300/30 focus:border-pink-300"
              />
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-2">
              카테고리 *
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {PRESET_CATEGORIES.map((cat) => {
                const isSelected = !isCustomCategory && category === cat.key;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => {
                      setIsCustomCategory(false);
                      setCategory(cat.key);
                    }}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-pink-400 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setIsCustomCategory(true)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  isCustomCategory
                    ? 'bg-pink-400 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <span>✨</span>
                <span>직접 입력</span>
              </button>
            </div>

            {isCustomCategory && (
              <input
                type="text"
                placeholder="새 카테고리 이름 입력 (예: 어린이집, 병원, 소풍)"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-pink-300/30 focus:border-pink-300 mt-1 animate-in fade-in"
                autoFocus
              />
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">사진 제목 *</label>
            <input
              type="text"
              placeholder="예: 두 발로 아장아장 첫 걸음마 성공한 날!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-pink-300/30 focus:border-pink-300"
            />
          </div>

          {/* Memo */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">그날의 추억 메모 (선택)</label>
            <textarea
              rows={2}
              placeholder="그날 아이의 표정, 가족들의 대화, 기억하고 싶은 마음을 적어주세요."
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-pink-300/30 focus:border-pink-300 resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-pink-500" />
              <span>해시태그 (선택)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="태그 입력 (예: 첫걸음마, 심쿵)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="flex-1 px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-pink-300/30 focus:border-pink-300"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition-colors"
              >
                추가
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="text-pink-500 hover:text-pink-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-stone-600 hover:bg-stone-100 text-xs sm:text-sm font-bold rounded-xl transition-colors"
            >
              취소
            </button>
            <button
              id="btn-save-photo"
              type="submit"
              disabled={isProcessing || !photoUrl}
              className="flex items-center gap-1.5 px-5 py-2.5 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors disabled:bg-stone-300 bg-pink-400 hover:bg-pink-500"
            >
              <Sparkles className="w-4 h-4" />
              <span>앨범에 저장하기</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
