import { useState } from 'react';
import { ChildProfile, GrowthRecord } from '../types';
import { calculateDaysSince, calculateAgeDetails, getUpcomingCelebrations, formatDateKR } from '../utils/dateUtils';
import { useAppTheme } from '../context/ThemeContext';
import { getYouTubeEmbedUrl, getYouTubeWatchUrl } from '../utils/videoUtils';
import { Calendar, Heart, Ruler, Scale, Sparkles, Edit3, Download, Baby, Info, Film, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

interface ChildProfileHeaderProps {
  profile: ChildProfile;
  growthRecords: GrowthRecord[];
  onEditProfile: () => void;
  onOpenBackup: () => void;
}

export function ChildProfileHeader({
  profile,
  growthRecords,
  onEditProfile,
  onOpenBackup,
}: ChildProfileHeaderProps) {
  const [showDDayList, setShowDDayList] = useState(false);
  const [isVideoVisible, setIsVideoVisible] = useState(true);
  const { isPink } = useAppTheme();

  const defaultVideoUrl = 'https://youtu.be/xzhxup5c6Q8?si=9xiMI2uU4kIgbfJv';
  const currentVideoUrl = profile.heroVideoUrl || defaultVideoUrl;
  const embedUrl = getYouTubeEmbedUrl(currentVideoUrl);
  const watchUrl = getYouTubeWatchUrl(currentVideoUrl);

  const daysSince = calculateDaysSince(profile.birthDate);
  const ageDetails = calculateAgeDetails(profile.birthDate);
  const upcomingEvents = getUpcomingCelebrations(profile.birthDate);
  const nextEvent = upcomingEvents.find((e) => !e.isPast) || upcomingEvents[upcomingEvents.length - 1];

  // Latest growth record
  const sortedGrowth = [...growthRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const latestGrowth = sortedGrowth[0];

  const heightGrowth = latestGrowth && profile.birthHeight ? (latestGrowth.height - profile.birthHeight).toFixed(1) : null;
  const weightGrowth = latestGrowth && profile.birthWeight ? (latestGrowth.weight - profile.birthWeight).toFixed(2) : null;

  return (
    <header className="relative overflow-hidden rounded-3xl p-6 md:p-8 shadow-xs transition-all duration-300 border bg-gradient-to-br from-[#fff2f5] via-[#fdf2f8] to-[#fff7f9] border-pink-200/70">
      {/* Decorative background warmth */}
      <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl pointer-events-none transition-colors duration-300 bg-pink-200/40" />
      <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full blur-3xl pointer-events-none transition-colors duration-300 bg-rose-200/30" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Profile Details */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden ring-4 ring-white shadow-md flex items-center justify-center transition-colors bg-pink-50 text-pink-400">
              {profile.photoUrl ? (
                <img
                  src={profile.photoUrl}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Baby className="w-12 h-12" />
              )}
            </div>
            <button
              onClick={onEditProfile}
              className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-white text-stone-700 shadow-sm border border-stone-200 transition-colors hover:bg-pink-50 hover:text-pink-600"
              title="아이 정보 수정"
              aria-label="아이 정보 수정"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>

          {/* Texts */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-pink-100/90 text-pink-700">
                {profile.nickname ? `태명 ${profile.nickname}` : '소중한 우리 아이'}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                profile.gender === 'girl' ? 'bg-pink-100 text-pink-700' : 'bg-stone-100 text-stone-700'
              }`}>
                {profile.gender === 'girl' ? '공주님 👧' : '왕자님 👦'}
              </span>
              {profile.bloodType && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-stone-100 text-stone-600">
                  {profile.bloodType}
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 font-serif">
                {profile.name}
              </h1>
              <span className="text-sm sm:text-base font-semibold px-3 py-0.5 rounded-lg text-pink-700 bg-pink-100/90">
                태어난 지 {daysSince}일째
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-stone-600">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                출생일: {formatDateKR(profile.birthDate)}
              </span>
              <span className="flex items-center gap-1 font-medium text-pink-700">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                현재 나이: {ageDetails.formatted}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
          {nextEvent && (
            <div className="relative">
              <button
                onClick={() => setShowDDayList(!showDDayList)}
                className="flex items-center justify-between gap-2.5 px-4 py-2.5 rounded-2xl bg-white/90 hover:bg-white text-stone-700 text-xs font-medium shadow-xs transition-all w-full text-left border border-pink-200/80"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full animate-pulse bg-pink-400" />
                  <span>기념일: <strong className="text-stone-900">{nextEvent.title}</strong></span>
                </div>
                <span className="px-2 py-0.5 rounded-md font-semibold bg-pink-100/80 text-pink-700">
                  {nextEvent.dDayText}
                </span>
              </button>

              {/* D-Day Dropdown */}
              {showDDayList && (
                <div className="absolute right-0 top-full mt-2 w-72 p-3 bg-white rounded-2xl shadow-xl border border-pink-100 z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-100 text-xs font-semibold text-stone-500">
                    <span>주요 성장 기념일 일정</span>
                    <button
                      onClick={() => setShowDDayList(false)}
                      className="text-stone-400 hover:text-stone-600 text-sm font-bold"
                    >
                      ×
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {upcomingEvents.map((ev, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-2 rounded-xl text-xs ${
                          ev.isPast
                            ? 'bg-stone-50 text-stone-400'
                            : 'bg-pink-50/70 text-stone-800 font-medium'
                        }`}
                      >
                        <div>
                          <div>{ev.title}</div>
                          <div className="text-[11px] text-stone-400">{ev.targetDate}</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          ev.isPast
                            ? 'bg-stone-200/60 text-stone-500'
                            : 'bg-pink-100 text-pink-700'
                        }`}>
                          {ev.dDayText}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onEditProfile}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-white text-xs font-medium shadow-xs transition-colors bg-pink-400 hover:bg-pink-500"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>프로필 수정</span>
            </button>
            <button
              onClick={onOpenBackup}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium border border-stone-200 shadow-xs transition-colors"
              title="데이터 백업 및 복원"
            >
              <Download className="w-3.5 h-3.5 text-stone-500" />
              <span className="hidden sm:inline">데이터 보관함</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Growth Bar */}
      <div className="mt-6 pt-5 border-t grid grid-cols-2 sm:grid-cols-4 gap-3 border-pink-200/60">
        <div className="bg-white/80 rounded-2xl p-3 border flex items-center gap-3 border-pink-100/90">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-pink-100 text-pink-500">
            <Ruler className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-stone-500">최근 신장 (키)</div>
            <div className="text-base font-bold text-stone-900">
              {latestGrowth ? `${latestGrowth.height} cm` : '기록 없음'}
            </div>
            {heightGrowth && (
              <div className="text-[10px] font-medium text-pink-600">
                출생 대비 +{heightGrowth} cm
              </div>
            )}
          </div>
        </div>

        <div className="bg-white/80 rounded-2xl p-3 border flex items-center gap-3 border-pink-100/90">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-rose-100 text-rose-500">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-stone-500">최근 몸무게</div>
            <div className="text-base font-bold text-stone-900">
              {latestGrowth ? `${latestGrowth.weight} kg` : '기록 없음'}
            </div>
            {weightGrowth && (
              <div className="text-[10px] font-medium text-pink-600">
                출생 대비 +{weightGrowth} kg
              </div>
            )}
          </div>
        </div>

        <div className="bg-white/80 rounded-2xl p-3 border flex items-center gap-3 border-pink-100/90">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-pink-100 text-pink-500">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-stone-500">머리둘레</div>
            <div className="text-base font-bold text-stone-900">
              {latestGrowth?.headCircumference ? `${latestGrowth.headCircumference} cm` : '기록 없음'}
            </div>
            <div className="text-[10px] text-stone-400">
              {latestGrowth ? formatDateKR(latestGrowth.date) : '정기 측정 권장'}
            </div>
          </div>
        </div>

        <div className="bg-white/80 rounded-2xl p-3 border flex items-center gap-3 border-pink-100/90">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-stone-500">출생 신체 정보</div>
            <div className="text-xs font-semibold text-stone-800">
              {profile.birthHeight ?? 50}cm · {profile.birthWeight ?? 3.2}kg
            </div>
            <div className="text-[10px] text-stone-400">
              성장 기록 총 {growthRecords.length}회 누적
            </div>
          </div>
        </div>
      </div>

      {/* Hero Video Section */}
      {embedUrl && (
        <div className="mt-6 pt-5 border-t border-pink-200/60">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-pink-100 text-pink-500 shadow-2xs">
                <Film className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xs sm:text-sm font-bold text-stone-900">
                    {profile.name}의 대표 성장 영상
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-100/90 text-pink-700">
                    YouTube
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-stone-500">
                  매일 새롭게 자라나는 우리 아이의 소중한 순간을 영상으로 감상하세요
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={watchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-stone-50 text-stone-600 text-xs font-medium border border-pink-200/70 shadow-2xs transition-colors"
                title="YouTube에서 새 창으로 열기"
              >
                <span>YouTube로 보기</span>
                <ExternalLink className="w-3 h-3 text-stone-400" />
              </a>

              <button
                type="button"
                onClick={() => setIsVideoVisible(!isVideoVisible)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-stone-50 text-stone-600 text-xs font-medium border border-pink-200/70 shadow-2xs transition-colors cursor-pointer"
                title={isVideoVisible ? '영상 접기' : '영상 펼치기'}
              >
                <span>{isVideoVisible ? '영상 접기' : '영상 보기'}</span>
                {isVideoVisible ? (
                  <ChevronUp className="w-3.5 h-3.5 text-stone-400" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                )}
              </button>
            </div>
          </div>

          {isVideoVisible && (
            <div className="relative w-full max-w-3xl mx-auto rounded-2xl overflow-hidden shadow-md border border-pink-200/80 bg-stone-950 aspect-video animate-in fade-in zoom-in-98 duration-200">
              <iframe
                src={embedUrl}
                title={`${profile.name} 성장 동영상`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
          )}
        </div>
      )}
    </header>
  );
}
