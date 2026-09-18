import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlbumPhoto, ChildProfile, BgmTrackId, MoviePeriodFilter } from '../types';
import { calculateAgeAtDate, formatDateKR } from '../utils/dateUtils';
import { soundManager } from '../utils/audioSynth';
import { useAppTheme } from '../context/ThemeContext';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Music,
  Download,
  Calendar,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Upload,
  Clock,
  Film,
  Check,
  ExternalLink,
  Disc,
} from 'lucide-react';

interface GrowthMovieMakerModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: AlbumPhoto[];
  profile: ChildProfile;
}

// Official YouTube original song configurations
const ORIGINAL_SONGS = {
  akmu: {
    id: 'akmu',
    title: '기쁨, 슬픔, 아름다운 마음',
    artist: '악뮤 (AKMU)',
    album: '정규 4집 [개화] · 2026',
    videoId: 'k-a2z5z7Xw8',
    thumbnail: 'https://img.youtube.com/vi/k-a2z5z7Xw8/mqdefault.jpg',
    description: '이찬혁 & 이수현의 따뜻하고 서정적인 보컬로 아기의 성장을 축복하는 원곡',
  },
  yoon: {
    id: 'yoon',
    title: 'O my baby',
    artist: '윤종신',
    album: '11집 [동네 한 바퀴] · 2008',
    videoId: 'I08oBWfGqxA',
    thumbnail: 'https://img.youtube.com/vi/I08oBWfGqxA/mqdefault.jpg',
    description: '아이를 처음 품에 안았을 때의 벅찬 감동을 노래한 아빠 윤종신의 감동 원곡',
  },
};

export function GrowthMovieMakerModal({
  isOpen,
  onClose,
  photos,
  profile,
}: GrowthMovieMakerModalProps) {
  const { isPink } = useAppTheme();

  // Period filter
  const [periodFilter, setPeriodFilter] = useState<MoviePeriodFilter>({ type: 'all' });
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([]);
  const [slideDuration, setSlideDuration] = useState<number>(3.5); // seconds per slide

  // BGM selection: 'akmu' | 'yoon' | 'custom' | 'none'
  const [bgmTrack, setBgmTrack] = useState<BgmTrackId>('akmu');
  const [volume, setVolume] = useState<number>(0.7);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [customAudioName, setCustomAudioName] = useState<string | null>(null);
  const [showYoutubeVideo, setShowYoutubeVideo] = useState<boolean>(false);

  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Recording / Export state
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);

  // Refs
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const youtubeIframeRef = useRef<HTMLIFrameElement>(null);
  const customAudioInputRef = useRef<HTMLInputElement>(null);
  const playTimerRef = useRef<number | null>(null);
  const exportCanvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Filter photos based on period
  const filteredPhotos = React.useMemo(() => {
    // Sort chronologically (earliest to latest for movie storyline)
    const sorted = [...photos].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (periodFilter.type === 'all') return sorted;

    const now = new Date();
    if (periodFilter.type === '1m') {
      const past = new Date();
      past.setDate(now.getDate() - 30);
      return sorted.filter((p) => new Date(p.date) >= past);
    }
    if (periodFilter.type === '3m') {
      const past = new Date();
      past.setDate(now.getDate() - 90);
      return sorted.filter((p) => new Date(p.date) >= past);
    }
    if (periodFilter.type === '6m') {
      const past = new Date();
      past.setDate(now.getDate() - 180);
      return sorted.filter((p) => new Date(p.date) >= past);
    }
    if (periodFilter.type === '1y') {
      const birth = new Date(profile.birthDate);
      const oneYear = new Date(birth);
      oneYear.setFullYear(birth.getFullYear() + 1);
      return sorted.filter((p) => {
        const d = new Date(p.date);
        return d >= birth && d <= oneYear;
      });
    }
    if (periodFilter.type === 'category' && periodFilter.category) {
      return sorted.filter((p) => p.category === periodFilter.category);
    }

    return sorted;
  }, [photos, periodFilter, profile.birthDate]);

  // Actual photos used in the movie
  const moviePhotos = React.useMemo(() => {
    if (selectedPhotoIds.length > 0) {
      return filteredPhotos.filter((p) => selectedPhotoIds.includes(p.id));
    }
    return filteredPhotos;
  }, [filteredPhotos, selectedPhotoIds]);

  // Current active photo
  const currentPhoto = moviePhotos[currentIndex] || moviePhotos[0];

  // YouTube Control helper
  const postYoutubeCommand = useCallback((func: string, args: any[] = []) => {
    if (youtubeIframeRef.current && youtubeIframeRef.current.contentWindow) {
      youtubeIframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func, args }),
        '*'
      );
    }
  }, []);

  // Sync YouTube player volume and mute
  useEffect(() => {
    if (bgmTrack === 'akmu' || bgmTrack === 'yoon') {
      if (isMuted) {
        postYoutubeCommand('mute');
      } else {
        postYoutubeCommand('unMute');
        postYoutubeCommand('setVolume', [Math.round(volume * 100)]);
      }
    } else if (bgmTrack === 'custom') {
      soundManager.setVolume(isMuted ? 0 : volume);
    }
  }, [volume, isMuted, bgmTrack, postYoutubeCommand]);

  // Play slideshow & audio
  const handlePlay = useCallback(() => {
    if (moviePhotos.length === 0) return;
    setIsPlaying(true);

    if (bgmTrack === 'akmu' || bgmTrack === 'yoon') {
      postYoutubeCommand('playVideo');
    } else if (bgmTrack === 'custom') {
      if (!isMuted) {
        soundManager.setVolume(volume);
      }
    }
  }, [moviePhotos.length, bgmTrack, isMuted, volume, postYoutubeCommand]);

  // Pause slideshow & audio
  const handlePause = useCallback(() => {
    setIsPlaying(false);

    if (bgmTrack === 'akmu' || bgmTrack === 'yoon') {
      postYoutubeCommand('pauseVideo');
    } else if (bgmTrack === 'custom') {
      soundManager.stopBgm();
    }

    if (playTimerRef.current) {
      clearTimeout(playTimerRef.current);
      playTimerRef.current = null;
    }
  }, [bgmTrack, postYoutubeCommand]);

  // Slide advance ticker
  useEffect(() => {
    if (isPlaying && moviePhotos.length > 0) {
      playTimerRef.current = window.setTimeout(() => {
        setCurrentIndex((prev) => {
          if (prev >= moviePhotos.length - 1) {
            return 0; // loop
          }
          return prev + 1;
        });
      }, slideDuration * 1000);
    }

    return () => {
      if (playTimerRef.current) {
        clearTimeout(playTimerRef.current);
        playTimerRef.current = null;
      }
    };
  }, [isPlaying, currentIndex, moviePhotos.length, slideDuration]);

  // Track change handler
  const handleBgmChange = (newTrack: BgmTrackId) => {
    setBgmTrack(newTrack);

    if (newTrack === 'none') {
      postYoutubeCommand('pauseVideo');
      soundManager.stopBgm();
    } else if (newTrack === 'custom') {
      postYoutubeCommand('pauseVideo');
    } else {
      // akmu or yoon
      soundManager.stopBgm();
      if (isPlaying) {
        setTimeout(() => {
          postYoutubeCommand('playVideo');
        }, 300);
      }
    }
  };

  // Custom audio file upload
  const handleCustomAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCustomAudioName(file.name);
    setBgmTrack('custom');
    postYoutubeCommand('pauseVideo');
    soundManager.playCustomAudio(file, isMuted ? 0 : volume);
    if (!isPlaying) {
      setIsPlaying(true);
    }
  };

  // Cleanup on close
  useEffect(() => {
    if (!isOpen) {
      postYoutubeCommand('pauseVideo');
      soundManager.stopBgm();
      setIsPlaying(false);
      if (playTimerRef.current) {
        clearTimeout(playTimerRef.current);
      }
    }
  }, [isOpen, postYoutubeCommand]);

  const toggleSelectPhoto = (id: string) => {
    setSelectedPhotoIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Toggle Fullscreen
  const handleToggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen?.().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false));
    }
  };

  // -------------------------------------------------------------
  // Video Export Engine (Canvas + MediaRecorder -> .webm)
  // -------------------------------------------------------------
  const handleExportMovie = async () => {
    if (moviePhotos.length === 0) return;

    handlePause();
    setIsExporting(true);
    setExportProgress(0);

    const canvas = exportCanvasRef.current;
    if (!canvas) {
      setIsExporting(false);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsExporting(false);
      return;
    }

    canvas.width = 1280;
    canvas.height = 720;

    // Load all images first
    const loadedImages: HTMLImageElement[] = [];
    for (let i = 0; i < moviePhotos.length; i++) {
      setExportProgress(Math.round((i / moviePhotos.length) * 30));
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve(); // skip on error
        img.src = moviePhotos[i].photoUrl;
      });
      loadedImages.push(img);
    }

    // Set up canvas stream
    const canvasStream = canvas.captureStream(30);

    // If custom audio is playing, attach audio track
    const audioTrack = soundManager.getAudioStreamTrack();
    if (audioTrack && bgmTrack === 'custom') {
      canvasStream.addTrack(audioTrack);
    }

    const recordedChunks: Blob[] = [];
    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(canvasStream, {
        mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
          ? 'video/webm;codecs=vp9'
          : 'video/webm',
        videoBitsPerSecond: 3000000,
      });
    } catch {
      recorder = new MediaRecorder(canvasStream);
    }
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        recordedChunks.push(e.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${profile.name}_성장영상_${formatDateKR(new Date().toISOString().slice(0, 10))}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setIsExporting(false);
      setExportProgress(100);
    };

    recorder.start();

    // Render loop for each photo
    const framesPerSlide = Math.round(slideDuration * 30);
    const totalPhotos = loadedImages.length;

    for (let pIdx = 0; pIdx < totalPhotos; pIdx++) {
      const img = loadedImages[pIdx];
      const photoData = moviePhotos[pIdx];
      const ageInfo = calculateAgeAtDate(profile.birthDate, photoData.date);

      for (let frame = 0; frame < framesPerSlide; frame++) {
        const progress = frame / framesPerSlide; // 0 -> 1

        // Light Pastel Background gradient
        const bgGrad = ctx.createLinearGradient(0, 0, 1280, 720);
        bgGrad.addColorStop(0, '#fff7f9');
        bgGrad.addColorStop(1, '#fdebf1');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 1280, 720);

        // Draw image with smooth zoom effect
        if (img.complete && img.naturalWidth > 0) {
          const scale = 1 + progress * 0.08;
          ctx.save();
          ctx.translate(640, 360);
          ctx.scale(scale, scale);

          const imgRatio = img.naturalWidth / img.naturalHeight;
          const targetRatio = 1280 / 720;
          let dw = 1280;
          let dh = 720;
          if (imgRatio > targetRatio) {
            dw = 720 * imgRatio;
          } else {
            dh = 1280 / imgRatio;
          }

          ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
          ctx.restore();
        }

        // Soft white gradient overlay at bottom for subtitle readability
        const grad = ctx.createLinearGradient(0, 480, 0, 720);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.85)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0.98)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 480, 1280, 240);

        // Top banner (Soft white glass bar)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(0, 0, 1280, 70);

        // Title and Age
        ctx.fillStyle = '#1c1917';
        ctx.font = 'bold 30px "Noto Sans KR", sans-serif';
        ctx.fillText(`${profile.name}의 성장 기록`, 50, 47);

        ctx.fillStyle = '#f472b6';
        ctx.font = 'bold 22px "Noto Sans KR", sans-serif';
        ctx.fillText(ageInfo.label, 1230 - ctx.measureText(ageInfo.label).width, 47);

        // Bottom Subtitles (High contrast dark text on clean white plate)
        ctx.fillStyle = '#1c1917';
        ctx.font = 'bold 32px "Noto Sans KR", sans-serif';
        ctx.fillText(photoData.title, 50, 615);

        ctx.fillStyle = '#64748b';
        ctx.font = '20px "Noto Sans KR", sans-serif';
        const subText = `${photoData.date} · [${photoData.category}] ${photoData.memo ? `· ${photoData.memo}` : ''}`;
        ctx.fillText(subText, 50, 660);

        await new Promise((r) => setTimeout(r, 1000 / 30));
      }

      const completedPercent = 30 + Math.round(((pIdx + 1) / totalPhotos) * 65);
      setExportProgress(completedPercent);
    }

    recorder.stop();
  };

  if (!isOpen) return null;

  const currentSong = bgmTrack === 'yoon' ? ORIGINAL_SONGS.yoon : ORIGINAL_SONGS.akmu;
  const currentAge = currentPhoto ? calculateAgeAtDate(profile.birthDate, currentPhoto.date) : null;
  const activeVideoId = bgmTrack === 'yoon' ? ORIGINAL_SONGS.yoon.videoId : ORIGINAL_SONGS.akmu.videoId;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex flex-col items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Hidden canvas for export */}
      <canvas ref={exportCanvasRef} className="hidden" />

      {/* Hidden YouTube IFrame Player (Controls background music) */}
      <div className="hidden">
        <iframe
          ref={youtubeIframeRef}
          id="yt-bgm-player"
          title="BGM Player"
          width="320"
          height="180"
          src={`https://www.youtube.com/embed/${activeVideoId}?enablejsapi=1&autoplay=0&loop=1&playlist=${activeVideoId}&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
          allow="autoplay; encrypted-media"
        />
      </div>

      {/* Modal Card */}
      <div className="bg-white border border-stone-200/90 rounded-3xl w-full max-w-6xl max-h-[96vh] flex flex-col overflow-hidden shadow-2xl text-stone-800 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${isPink ? 'bg-pink-100 text-pink-600' : 'bg-sky-100 text-sky-600'}`}>
              <Film className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-stone-900">
                  {profile.name}의 성장 동영상 제작소
                </h2>
                <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                  isPink ? 'bg-pink-100 text-pink-700' : 'bg-sky-100 text-sky-700'
                }`}>
                  무비 메이커
                </span>
              </div>
              <p className="text-xs text-stone-500">
                사진들을 감성적인 원곡 BGM과 함께 이어지는 화사한 영상으로 감상하고 소장용 파일로 다운로드하세요.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors"
              title="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-[#fafafa]">
          {/* VIDEO PLAYER SCREEN */}
          <div
            ref={playerContainerRef}
            className={`relative w-full aspect-16/9 rounded-3xl overflow-hidden shadow-md border flex items-center justify-center group ${
              isPink
                ? 'bg-gradient-to-br from-[#fff5f7] via-pink-50/60 to-[#fdf2f8] border-pink-200/80'
                : 'bg-gradient-to-br from-[#f0f9ff] via-sky-50/60 to-[#e0f2fe] border-sky-200/80'
            }`}
          >
            {moviePhotos.length === 0 ? (
              <div className="text-center p-8 space-y-2">
                <Film className="w-12 h-12 text-stone-400 mx-auto" />
                <p className="text-sm font-semibold text-stone-600">
                  선택한 조건에 해당하는 사진이 없습니다.
                </p>
                <p className="text-xs text-stone-400">
                  아래에서 기간이나 카테고리 필터를 변경해보세요.
                </p>
              </div>
            ) : (
              <>
                {/* Photo slide with Ken Burns Zoom Effect */}
                <div className="absolute inset-0 overflow-hidden flex items-center justify-center">
                  <img
                    key={currentPhoto.id}
                    src={currentPhoto.photoUrl}
                    alt={currentPhoto.title}
                    className="w-full h-full object-contain sm:object-cover transition-all duration-1000 ease-out transform scale-105"
                  />
                  {/* Gentle white pastel vignette overlay for subtitle legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/25 to-transparent pointer-events-none" />
                  <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-white/75 via-white/15 to-transparent pointer-events-none" />
                </div>

                {/* Top Overlay Badge */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold shadow-xs border bg-pink-100/95 text-pink-700 border-pink-200">
                      🌸 {profile.name} 성장기록
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/95 text-stone-700 shadow-xs border border-stone-200">
                      {currentIndex + 1} / {moviePhotos.length}
                    </span>
                  </div>

                  {currentAge && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold shadow-xs border bg-pink-400 text-white border-pink-300">
                      {currentAge.label}
                    </span>
                  )}
                </div>

                {/* Bottom Subtitle / Caption (Frosted White Card) */}
                <div className="absolute bottom-4 left-4 right-4 z-10">
                  <div className="bg-white/95 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-white/90 shadow-md space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-pink-100 text-pink-700">
                        {currentPhoto.category}
                      </span>
                      <span className="text-xs text-stone-500 font-medium">
                        {currentPhoto.date}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-stone-900 line-clamp-1">
                      {currentPhoto.title}
                    </h3>
                    {currentPhoto.memo && (
                      <p className="text-xs sm:text-sm text-stone-600 line-clamp-1">
                        {currentPhoto.memo}
                      </p>
                    )}
                  </div>
                </div>

                {/* Left/Right Click Navigators */}
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : moviePhotos.length - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/90 hover:bg-white text-stone-700 hover:text-stone-900 shadow-md border border-stone-200/80 backdrop-blur-xs transition-opacity opacity-0 group-hover:opacity-100 z-20"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => (prev < moviePhotos.length - 1 ? prev + 1 : 0))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/90 hover:bg-white text-stone-700 hover:text-stone-900 shadow-md border border-stone-200/80 backdrop-blur-xs transition-opacity opacity-0 group-hover:opacity-100 z-20"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* PLAYBACK CONTROLS STRIP */}
          <div className="p-4 bg-white rounded-2xl border border-stone-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            {/* Play/Pause & Speed */}
            <div className="flex items-center gap-3">
              <button
                id="btn-play-movie"
                type="button"
                onClick={isPlaying ? handlePause : handlePlay}
                disabled={moviePhotos.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 font-bold rounded-xl shadow-xs transition-colors bg-pink-400 hover:bg-pink-500 text-white"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isPlaying ? '일시정지' : '슬라이드쇼 재생'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentIndex(0);
                  postYoutubeCommand('seekTo', [0, true]);
                }}
                className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors"
                title="처음부터 다시보기"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Speed selector */}
              <div className="flex items-center gap-1.5 text-xs text-stone-600 pl-2 border-l border-stone-200">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                <span>속도:</span>
                {[2, 3.5, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSlideDuration(s)}
                    className={`px-2 py-1 rounded-md text-xs font-semibold transition-colors ${
                      slideDuration === s
                        ? 'bg-pink-400 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {s}초
                  </button>
                ))}
              </div>
            </div>

            {/* Volume & Fullscreen */}
            <div className="flex items-center gap-3">
              {bgmTrack !== 'none' && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsMuted(!isMuted)}
                    className="text-stone-500 hover:text-stone-800"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-stone-600" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      setVolume(parseFloat(e.target.value));
                      setIsMuted(false);
                    }}
                    className="w-20 h-1.5 bg-stone-200 rounded-lg cursor-pointer accent-pink-400"
                  />
                  <span className="text-[11px] text-stone-500 w-8">{Math.round((isMuted ? 0 : volume) * 100)}%</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleToggleFullscreen}
                className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors border border-stone-200/80"
                title="전체화면"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* ORIGINAL SONG SELECTION & LIVE PLAYER CARD */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/90 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-pink-100 text-pink-500">
                  <Disc className="w-4 h-4 animate-spin-slow" />
                </div>
                <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <span>배경음악 선택 (공식 원곡 수록)</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-50 text-pink-700 border border-pink-200">
                    🎵 원곡 재생 지원
                  </span>
                </h4>
              </div>

              {/* YouTube video toggle */}
              {(bgmTrack === 'akmu' || bgmTrack === 'yoon') && (
                <button
                  type="button"
                  onClick={() => setShowYoutubeVideo(!showYoutubeVideo)}
                  className="text-xs text-stone-500 hover:text-stone-800 underline"
                >
                  {showYoutubeVideo ? '유튜브 영상 닫기' : '🎥 원곡 뮤직비디오 플레이어 열기'}
                </button>
              )}
            </div>

            {/* Song Choice Tabs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* AKMU */}
              <div
                onClick={() => handleBgmChange('akmu')}
                className={`flex items-center gap-3.5 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  bgmTrack === 'akmu'
                    ? 'bg-pink-50/90 border-pink-200 shadow-xs ring-2 ring-pink-200/50'
                    : 'bg-stone-50/70 border-stone-200 hover:bg-stone-100/80'
                }`}
              >
                <img
                  src={ORIGINAL_SONGS.akmu.thumbnail}
                  alt={ORIGINAL_SONGS.akmu.title}
                  className="w-16 h-16 rounded-xl object-cover shrink-0 border border-stone-200"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-bold text-pink-700">공식 원곡 1</span>
                    {bgmTrack === 'akmu' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-400 text-white">
                        {isPlaying ? '재생 중' : '선택됨'}
                      </span>
                    )}
                  </div>
                  <h5 className="text-xs sm:text-sm font-bold text-stone-900 truncate">
                    {ORIGINAL_SONGS.akmu.title}
                  </h5>
                  <p className="text-[11px] text-stone-500 truncate">
                    {ORIGINAL_SONGS.akmu.artist} · {ORIGINAL_SONGS.akmu.album}
                  </p>
                  <p className="text-[10px] text-stone-400 line-clamp-1 mt-0.5">
                    {ORIGINAL_SONGS.akmu.description}
                  </p>
                </div>
              </div>

              {/* Yoon Jong Shin */}
              <div
                onClick={() => handleBgmChange('yoon')}
                className={`flex items-center gap-3.5 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  bgmTrack === 'yoon'
                    ? 'bg-pink-50/90 border-pink-200 shadow-xs ring-2 ring-pink-200/50'
                    : 'bg-stone-50/70 border-stone-200 hover:bg-stone-100/80'
                }`}
              >
                <img
                  src={ORIGINAL_SONGS.yoon.thumbnail}
                  alt={ORIGINAL_SONGS.yoon.title}
                  className="w-16 h-16 rounded-xl object-cover shrink-0 border border-stone-200"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-bold text-pink-700">공식 원곡 2</span>
                    {bgmTrack === 'yoon' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-400 text-white">
                        {isPlaying ? '재생 중' : '선택됨'}
                      </span>
                    )}
                  </div>
                  <h5 className="text-xs sm:text-sm font-bold text-stone-900 truncate">
                    {ORIGINAL_SONGS.yoon.title}
                  </h5>
                  <p className="text-[11px] text-stone-500 truncate">
                    {ORIGINAL_SONGS.yoon.artist} · {ORIGINAL_SONGS.yoon.album}
                  </p>
                  <p className="text-[10px] text-stone-400 line-clamp-1 mt-0.5">
                    {ORIGINAL_SONGS.yoon.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Custom file or mute controls */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100 text-xs">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={customAudioInputRef}
                  accept="audio/*"
                  onChange={handleCustomAudioUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => customAudioInputRef.current?.click()}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
                    bgmTrack === 'custom'
                      ? 'bg-pink-100 border-pink-300 text-pink-700 font-bold'
                      : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{customAudioName ? `첨부됨: ${customAudioName}` : '소장 중인 MP3 파일 첨부'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleBgmChange('none')}
                  className={`px-3 py-1.5 rounded-xl border transition-all ${
                    bgmTrack === 'none'
                      ? 'bg-rose-100 border-rose-300 text-rose-700 font-bold'
                      : 'bg-stone-100 border-stone-200 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  음악 끔
                </button>
              </div>

              {/* YouTube Link out */}
              {(bgmTrack === 'akmu' || bgmTrack === 'yoon') && (
                <a
                  href={`https://www.youtube.com/watch?v=${activeVideoId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-stone-500 hover:text-stone-800 transition-colors"
                >
                  <span>유튜브 공식 영상 바로가기</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* Optional Embedded YouTube Player Frame */}
            {showYoutubeVideo && (bgmTrack === 'akmu' || bgmTrack === 'yoon') && (
              <div className="pt-2 animate-in fade-in">
                <div className="rounded-xl overflow-hidden border border-stone-200 aspect-16/9 max-w-md mx-auto shadow-sm">
                  <iframe
                    title="YouTube Video Player"
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1&enablejsapi=1`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
          </div>

          {/* PERIOD FILTER & PHOTO SELECTOR */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs sm:text-sm font-bold text-stone-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-stone-400" />
                <span>영상에 담을 성장 기간 선택</span>
              </h4>
              <span className="text-xs text-stone-500">
                총 {moviePhotos.length}장의 사진 포함
              </span>
            </div>

            {/* Quick Period Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[
                { label: '전체 성장기', type: 'all' as const },
                { label: '최근 1개월', type: '1m' as const },
                { label: '최근 3개월', type: '3m' as const },
                { label: '최근 6개월', type: '6m' as const },
                { label: '첫 돌까지(0~1세)', type: '1y' as const },
                { label: '👣 첫걸음마', type: 'category' as const, category: '첫걸음마' },
                { label: '🎂 생일', type: 'category' as const, category: '생일' },
                { label: '✈️ 여행', type: 'category' as const, category: '여행' },
              ].map((filterItem, idx) => {
                const isActive =
                  filterItem.type === periodFilter.type &&
                  (filterItem.type !== 'category' || filterItem.category === periodFilter.category);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPeriodFilter(filterItem);
                      setCurrentIndex(0);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-pink-400 text-white shadow-xs'
                        : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {filterItem.label}
                  </button>
                );
              })}
            </div>

            {/* Thumbnail Timeline Strip */}
            <div className="flex items-center gap-2 overflow-x-auto py-2 scrollbar-thin">
              {moviePhotos.map((p, idx) => (
                <div
                  key={p.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`relative shrink-0 w-20 h-16 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                    currentIndex === idx
                      ? 'border-pink-400 ring-2 ring-pink-300/40 scale-105 shadow-sm'
                      : 'border-stone-200 opacity-70 hover:opacity-100 bg-white'
                  }`}
                >
                  <img
                    src={p.photoUrl}
                    alt={p.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-0 inset-x-0 bg-white/90 text-[9px] text-center text-stone-700 font-medium border-t border-stone-200/80 truncate px-1">
                    {p.date.slice(5)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer: Export Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-stone-200 bg-white shrink-0">
          <div className="text-xs text-stone-500">
            <span className="text-stone-800 font-bold">{moviePhotos.length}장의 사진</span>으로 약{' '}
            <span className="text-stone-900 font-bold">{Math.round(moviePhotos.length * slideDuration)}초</span> 분량의 성장 영상이 재생됩니다.
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              id="btn-export-movie"
              type="button"
              onClick={handleExportMovie}
              disabled={isExporting || moviePhotos.length === 0}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 font-bold rounded-2xl shadow-md transition-all active:scale-98 disabled:opacity-50 text-white bg-pink-400 hover:bg-pink-500"
            >
              <Download className="w-4 h-4" />
              <span>
                {isExporting ? `영상 제작 중 (${exportProgress}%)` : '동영상(.webm) 파일로 내보내기'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
