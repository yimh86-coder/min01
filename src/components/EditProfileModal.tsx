import { useState } from 'react';
import { ChildProfile, Gender } from '../types';
import { processImageFile } from '../utils/storage';
import { Upload, X, Baby, Film } from 'lucide-react';

interface EditProfileModalProps {
  profile: ChildProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: ChildProfile) => void;
}

export function EditProfileModal({ profile, isOpen, onClose, onSave }: EditProfileModalProps) {
  const [name, setName] = useState(profile.name);
  const [nickname, setNickname] = useState(profile.nickname);
  const [birthDate, setBirthDate] = useState(profile.birthDate);
  const [gender, setGender] = useState<Gender>(profile.gender);
  const [bloodType, setBloodType] = useState(profile.bloodType || '');
  const [birthHeight, setBirthHeight] = useState<string>(profile.birthHeight ? String(profile.birthHeight) : '');
  const [birthWeight, setBirthWeight] = useState<string>(profile.birthWeight ? String(profile.birthWeight) : '');
  const [photoUrl, setPhotoUrl] = useState(profile.photoUrl || '');
  const [heroVideoUrl, setHeroVideoUrl] = useState(profile.heroVideoUrl || 'https://youtu.be/xzhxup5c6Q8?si=9xiMI2uU4kIgbfJv');
  const [isProcessingImg, setIsProcessingImg] = useState(false);

  if (!isOpen) return null;

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsProcessingImg(true);
      const dataUrl = await processImageFile(file, 600, 0.85);
      setPhotoUrl(dataUrl);
    } catch (err) {
      alert('이미지를 불러오는데 실패했습니다.');
    } finally {
      setIsProcessingImg(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !birthDate) {
      alert('아이 이름과 생년월일은 필수입니다.');
      return;
    }

    onSave({
      ...profile,
      name: name.trim(),
      nickname: nickname.trim(),
      birthDate,
      gender,
      bloodType: bloodType.trim(),
      birthHeight: birthHeight ? parseFloat(birthHeight) : undefined,
      birthWeight: birthWeight ? parseFloat(birthWeight) : undefined,
      photoUrl,
      heroVideoUrl: heroVideoUrl.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-stone-200 space-y-5 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <Baby className="w-5 h-5 text-pink-500" />
            <h3 className="text-base font-bold text-stone-900">우리 아이 프로필 설정</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-sm font-bold transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Photo & Upload */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-pink-50 border-2 border-dashed border-pink-300 overflow-hidden flex items-center justify-center relative shrink-0">
              {photoUrl ? (
                <img src={photoUrl} alt="미리보기" className="w-full h-full object-cover" />
              ) : (
                <Baby className="w-8 h-8 text-pink-300" />
              )}
            </div>

            <div className="space-y-1.5 flex-1">
              <label className="text-xs font-semibold text-stone-700 block">
                아이 프로필 사진
              </label>
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-medium cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>{isProcessingImg ? '처리 중...' : '사진 파일 선택'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFile}
                  className="hidden"
                />
              </label>
              <div className="text-[10px] text-stone-400">
                기기 속 예쁜 사진을 골라보세요.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                아이 이름 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 김하은"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                태명 (애칭)
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="예: 햇살이"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                생년월일 <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                성별 <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setGender('girl')}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all border ${
                    gender === 'girl'
                      ? 'bg-pink-100 border-pink-300 text-pink-800'
                      : 'bg-stone-50 border-stone-200 text-stone-600'
                  }`}
                >
                  공주님 👧
                </button>
                <button
                  type="button"
                  onClick={() => setGender('boy')}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all border ${
                    gender === 'boy'
                      ? 'bg-blue-100 border-blue-300 text-blue-800'
                      : 'bg-stone-50 border-stone-200 text-stone-600'
                  }`}
                >
                  왕자님 👦
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                출생 시 키(cm)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="50.0"
                value={birthHeight}
                onChange={(e) => setBirthHeight(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                출생 체중(kg)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="3.2"
                value={birthWeight}
                onChange={(e) => setBirthWeight(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-pink-300/40 focus:border-pink-300"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                혈액형
              </label>
              <input
                type="text"
                placeholder="A형 (Rh+)"
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-pink-300/40 focus:border-pink-300"
              />
            </div>
          </div>

          {/* Hero YouTube Video Field */}
          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1 flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-pink-500" />
              <span>대표 성장 동영상 (YouTube URL)</span>
            </label>
            <input
              type="url"
              placeholder="예: https://youtu.be/xzhxup5c6Q8?si=9xiMI2uU4kIgbfJv"
              value={heroVideoUrl}
              onChange={(e) => setHeroVideoUrl(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-pink-300/40 focus:border-pink-300"
            />
            <p className="text-[11px] text-stone-400 mt-1">
              상단 히어로 섹션에 재생될 YouTube 영상 주소입니다. (기본: https://youtu.be/xzhxup5c6Q8)
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-500 hover:bg-stone-100 rounded-xl cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-pink-400 hover:bg-pink-500 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              프로필 저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
