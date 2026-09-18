import { useEffect } from 'react';
import { AlbumPhoto, ChildProfile } from '../types';
import { calculateAgeAtDate, formatDateKR } from '../utils/dateUtils';
import { useAppTheme } from '../context/ThemeContext';
import {
  X,
  Star,
  Share2,
  Calendar,
  MapPin,
  Tag,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface PhotoDetailModalProps {
  photo: AlbumPhoto | null;
  profile: ChildProfile;
  isOpen: boolean;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onShare: (photo: AlbumPhoto) => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export function PhotoDetailModal({
  photo,
  profile,
  isOpen,
  onClose,
  onToggleFavorite,
  onDelete,
  onShare,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: PhotoDetailModalProps) {
  const { isPink } = useAppTheme();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && onPrev && hasPrev) onPrev();
      if (e.key === 'ArrowRight' && onNext && hasNext) onNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onPrev, onNext, hasPrev, hasNext]);

  if (!isOpen || !photo) return null;

  const ageInfo = calculateAgeAtDate(profile.birthDate, photo.date);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[92vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 p-2 bg-stone-900/60 hover:bg-stone-900 text-white rounded-full transition-colors"
          title="닫기 (ESC)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Previous / Next Arrows */}
        {hasPrev && (
          <button
            onClick={onPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2.5 bg-stone-900/60 hover:bg-stone-900 text-white rounded-full shadow-lg transition-colors"
            title="이전 사진 (←)"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        {hasNext && (
          <button
            onClick={onNext}
            className="absolute right-3 md:right-[340px] top-1/2 -translate-y-1/2 z-20 p-2.5 bg-stone-900/60 hover:bg-stone-900 text-white rounded-full shadow-lg transition-colors"
            title="다음 사진 (→)"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {/* Left: Big Photo */}
        <div className="relative flex-1 bg-stone-950 flex items-center justify-center min-h-[300px] md:min-h-[500px]">
          <img
            src={photo.photoUrl}
            alt={photo.title}
            className="max-h-[85vh] w-full object-contain"
          />
        </div>

        {/* Right: Info & Actions */}
        <div className="w-full md:w-80 lg:w-96 p-6 flex flex-col justify-between bg-white overflow-y-auto">
          <div className="space-y-4">
            {/* Category & Favorite Header */}
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 bg-pink-100/90 text-pink-700">
                🏷️ {photo.category}
              </span>
              <button
                onClick={() => onToggleFavorite(photo.id)}
                className={`p-2 rounded-full transition-colors ${
                  photo.isFavorite
                    ? 'text-pink-500 hover:text-pink-600 bg-pink-50'
                    : 'text-stone-400 hover:text-stone-600 hover:bg-stone-100'
                }`}
                title={photo.isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
              >
                <Star
                  className={`w-5 h-5 ${photo.isFavorite ? 'fill-pink-400 text-pink-400' : ''}`}
                />
              </button>
            </div>

            {/* Title */}
            <h2 className="text-lg sm:text-xl font-bold text-stone-900 leading-snug">
              {photo.title}
            </h2>

            {/* Date & Age Info */}
            <div className="space-y-1.5 p-3.5 bg-stone-50 rounded-2xl border border-stone-100 text-xs">
              <div className="flex items-center gap-2 text-stone-700 font-semibold">
                <Calendar className="w-4 h-4 text-pink-500" />
                <span>{formatDateKR(photo.date)}</span>
              </div>
              <div className="font-bold pl-6 text-pink-600">
                🌱 {ageInfo.label}
              </div>
              {photo.location && (
                <div className="flex items-center gap-2 text-stone-600 pl-6 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  <span>{photo.location}</span>
                </div>
              )}
            </div>

            {/* Memo */}
            {photo.memo && (
              <div className="space-y-1">
                <p className="text-xs font-bold text-stone-500">기억하고 싶은 순간</p>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed p-3 rounded-xl border bg-pink-50/40 border-pink-100/60">
                  {photo.memo}
                </p>
              </div>
            )}

            {/* Tags */}
            {photo.tags && photo.tags.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-stone-500 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" />
                  <span>태그</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {photo.tags.map((t, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-stone-100 text-stone-600 rounded-md text-xs font-medium"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-stone-100 space-y-2">
            <button
              onClick={() => onShare(photo)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors bg-pink-400 hover:bg-pink-500"
            >
              <Share2 className="w-4 h-4" />
              <span>가족/친구에게 공유하기</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm('이 사진을 앨범에서 삭제하시겠습니까?')) {
                  onDelete(photo.id);
                  onClose();
                }
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-stone-400 hover:text-rose-600 text-xs font-medium transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>사진 삭제</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
