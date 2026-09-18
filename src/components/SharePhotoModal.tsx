import { useState, useRef, useEffect, useCallback } from 'react';
import { AlbumPhoto, ChildProfile } from '../types';
import { calculateAgeAtDate, formatDateKR } from '../utils/dateUtils';
import { useAppTheme } from '../context/ThemeContext';
import {
  X,
  Share2,
  Download,
  Copy,
  Check,
  Heart,
  QrCode,
  MessageCircle,
  Sparkles,
} from 'lucide-react';

interface SharePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  photo?: AlbumPhoto | null;
  profile: ChildProfile;
}

export function SharePhotoModal({
  isOpen,
  onClose,
  photo,
  profile,
}: SharePhotoModalProps) {
  const { isPink } = useAppTheme();
  const [activeShareTab, setActiveShareTab] = useState<'card' | 'message' | 'qr'>('card');
  const [cardGenerated, setCardGenerated] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [selectedMessageRole, setSelectedMessageRole] = useState<'grandparents' | 'relatives' | 'friends'>('grandparents');

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const ageInfo = photo ? calculateAgeAtDate(profile.birthDate, photo.date) : null;
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  // Generate Photo Card on Canvas
  const generatePhotoCard = useCallback(() => {
    if (!photo) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Card dimensions (Instagram/Mobile friendly: 800 x 1000)
    const width = 800;
    const height = 1000;
    canvas.width = width;
    canvas.height = height;

    // Background gradient: Soft pastel pink
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#fff5f7');
    bgGrad.addColorStop(1, '#fdebf1');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Decorative border frame
    ctx.strokeStyle = '#fbcfe8';
    ctx.lineWidth = 14;
    ctx.strokeRect(20, 20, width - 40, height - 40);

    // Header Title
    ctx.fillStyle = '#e07a9b';
    ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`✨ ${profile.name} (${profile.nickname || '아가'})의 성장 이야기 ✨`, width / 2, 75);

    // Draw Photo
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Photo area: 700 x 520, centered, rounded corners
      const photoX = 50;
      const photoY = 110;
      const photoW = 700;
      const photoH = 520;
      const radius = 24;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(photoX + radius, photoY);
      ctx.arcTo(photoX + photoW, photoY, photoX + photoW, photoY + photoH, radius);
      ctx.arcTo(photoX + photoW, photoY + photoH, photoX, photoY + photoH, radius);
      ctx.arcTo(photoX, photoY + photoH, photoX, photoY, radius);
      ctx.arcTo(photoX, photoY, photoX + photoW, photoY, radius);
      ctx.closePath();
      ctx.clip();

      // Aspect cover calculation
      const imgAspect = img.width / img.height;
      const targetAspect = photoW / photoH;
      let renderW = photoW;
      let renderH = photoH;
      let offsetX = photoX;
      let offsetY = photoY;

      if (imgAspect > targetAspect) {
        renderW = photoH * imgAspect;
        offsetX = photoX - (renderW - photoW) / 2;
      } else {
        renderH = photoW / imgAspect;
        offsetY = photoY - (renderH - photoH) / 2;
      }

      ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
      ctx.restore();

      // Photo border
      ctx.strokeStyle = '#fbcfe8';
      ctx.lineWidth = 3;
      ctx.strokeRect(50, 110, 700, 520);

      // Category Pill badge on bottom of photo
      const badgeY = 675;
      ctx.fillStyle = '#f472b6';
      ctx.beginPath();
      ctx.roundRect(width / 2 - 80, badgeY - 26, 160, 36, 18);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`🏷️ ${photo.category}`, width / 2, badgeY - 2);

      // Photo Title
      ctx.fillStyle = '#1c1917'; // stone-900
      ctx.font = 'bold 30px -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(photo.title.slice(0, 24), width / 2, 745);

      // Date & Age info
      ctx.fillStyle = '#78716c'; // stone-500
      ctx.font = '500 20px -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", sans-serif';
      const dateText = `${formatDateKR(photo.date)} · ${ageInfo ? ageInfo.label : ''}`;
      ctx.fillText(dateText, width / 2, 785);

      // Memo (quote card)
      if (photo.memo) {
        ctx.fillStyle = isPink ? 'rgba(255, 241, 242, 0.9)' : 'rgba(240, 249, 255, 0.9)';
        ctx.strokeStyle = isPink ? '#fbcfe8' : '#bae6fd';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(80, 815, 640, 80, 16);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#44403c';
        ctx.font = 'italic 18px -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", sans-serif';
        const memoSnippet = photo.memo.length > 50 ? photo.memo.slice(0, 48) + '...' : photo.memo;
        ctx.fillText(`" ${memoSnippet} "`, width / 2, 862);
      }

      // Footer Watermark
      ctx.fillStyle = isPink ? '#f472b6' : '#0284c7';
      ctx.font = '600 16px -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", sans-serif';
      ctx.fillText(`우리 아이 성장일기 · ${profile.name}`, width / 2, 945);

      // Save as data url
      setCardGenerated(canvas.toDataURL('image/png'));
    };

    img.src = photo.photoUrl;
  }, [photo, profile.name, profile.nickname, ageInfo, isPink]);

  useEffect(() => {
    if (isOpen && photo) {
      // Allow DOM to settle then draw canvas
      const timer = setTimeout(() => {
        generatePhotoCard();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, photo, generatePhotoCard]);

  if (!isOpen) return null;

  // Pre-crafted message templates for different recipients
  const getShareMessage = () => {
    const photoTitle = photo ? `[${photo.title}]` : '성장 앨범';
    const photoDate = photo ? `(${photo.date})` : '';
    const ageLabel = ageInfo ? ageInfo.label : '';

    if (selectedMessageRole === 'grandparents') {
      return `할머니, 할아버지! 안녕하세요 😊\n우리 사랑스러운 ${profile.name}(이)의 새로운 성장 사진 ${photoTitle} ${photoDate}을 전해드려요.\n벌써 ${ageLabel}이 되었답니다!\n항상 예뻐해 주시고 응원해 주셔서 감사해요. 건강하세요! 사랑해요 ❤️\n\n아이 성장 앨범 보러가기: ${currentUrl}`;
    }
    if (selectedMessageRole === 'relatives') {
      return `안녕하세요! 우리 ${profile.name}(이)가 무럭무럭 자라서 ${ageLabel}이 되었어요 🌱\n이번에 남긴 ${photoTitle} 추억을 가족들과 함께 나누고 싶어 보내드립니다.\n늘 많은 사랑과 관심 보내주셔서 감사합니다!\n\n성장 앨범 링크: ${currentUrl}`;
    }
    return `친구야 안녕! 우리 ${profile.name}(이)의 최신 성장 근황 ${photoTitle} 공유해 🎉\n${ageLabel} 맞이해서 너무 귀엽게 잘 자라고 있어!\n시간 날 때 사진 한번 구경해봐 :)\n\n링크: ${currentUrl}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(getShareMessage());
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  const handleDownloadCard = () => {
    if (!cardGenerated || !photo) return;
    const a = document.createElement('a');
    a.href = cardGenerated;
    a.download = `${profile.name}_성장카드_${photo.date}_${photo.title}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-pink-50/50 border-pink-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-pink-100/80 text-pink-500">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900">
                가족 & 친구와 추억 공유하기
              </h2>
              <p className="text-xs text-stone-500">
                {profile.name}의 소중한 순간을 감성 포토 카드와 안부 편지로 전해보세요.
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

        {/* Tab Selection */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-stone-100 bg-white">
          <button
            onClick={() => setActiveShareTab('card')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeShareTab === 'card'
                ? 'border-pink-400 text-pink-600'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>감성 성장 카드</span>
          </button>

          <button
            onClick={() => setActiveShareTab('message')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeShareTab === 'message'
                ? 'border-pink-400 text-pink-600'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>가족 안부 편지</span>
          </button>

          <button
            onClick={() => setActiveShareTab('qr')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeShareTab === 'qr'
                ? 'border-pink-400 text-pink-600'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>QR 코드</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {/* Hidden Canvas used for generating the card */}
          <canvas ref={canvasRef} className="hidden" />

          {/* TAB 1: Visual Photo Card */}
          {activeShareTab === 'card' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-6 items-center">
                {/* Card Preview */}
                <div className="w-full sm:w-1/2 flex justify-center">
                  {cardGenerated ? (
                    <div className="rounded-2xl overflow-hidden shadow-lg border border-stone-200 max-w-[280px] bg-stone-50">
                      <img
                        src={cardGenerated}
                        alt="생성된 성장 카드"
                        className="w-full h-auto object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-[260px] h-[320px] bg-stone-100 rounded-2xl flex items-center justify-center text-xs text-stone-400">
                      카드 렌더링 중...
                    </div>
                  )}
                </div>

                {/* Actions & Info */}
                <div className="w-full sm:w-1/2 space-y-3">
                  <div className="p-3 rounded-xl border text-xs text-stone-700 space-y-1 bg-pink-50/60 border-pink-200/60">
                    <p className="font-bold flex items-center gap-1 text-pink-800">
                      <Heart className="w-3.5 h-3.5 fill-current text-pink-500" />
                      <span>{photo?.title || '성장 사진'}</span>
                    </p>
                    <p className="text-stone-500">
                      {photo?.date} · {ageInfo?.label}
                    </p>
                    {photo?.category && (
                      <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold bg-pink-100 text-pink-700">
                        {photo.category}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-stone-500 leading-relaxed">
                    아기의 사진, 촬영일, 개월수와 따뜻한 메모가 담긴 고화질 포토 카드가 생성되었습니다. 이미지로 저장해 카카오톡, 인스타그램, 가족 단톡방에 바로 보내보세요!
                  </p>

                  <div className="flex flex-col gap-2 pt-2">
                    <button
                      id="btn-download-photo-card"
                      type="button"
                      onClick={handleDownloadCard}
                      disabled={!cardGenerated}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors disabled:bg-stone-300 bg-pink-400 hover:bg-pink-500"
                    >
                      <Download className="w-4 h-4" />
                      <span>포토 카드 이미지 다운로드</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs sm:text-sm font-semibold rounded-xl transition-colors"
                    >
                      {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedLink ? '홈페이지 주소 복사 완료!' : '앨범 링크 복사하기'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Prepared Message */}
          {activeShareTab === 'message' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-600">받는 분 선택:</span>
                {[
                  { id: 'grandparents' as const, label: '할머니·할아버지' },
                  { id: 'relatives' as const, label: '친척·이모·삼촌' },
                  { id: 'friends' as const, label: '친구·지인' },
                ].map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedMessageRole(role.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedMessageRole === role.id
                        ? 'bg-pink-400 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>

              {/* Message Box */}
              <div className="relative">
                <textarea
                  readOnly
                  rows={6}
                  value={getShareMessage()}
                  className="w-full p-4 bg-stone-50 border border-stone-200 rounded-2xl text-xs sm:text-sm text-stone-800 leading-relaxed resize-none focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-stone-400">
                  메시지를 복사한 후 카카오톡이나 문자로 간편하게 전송할 수 있습니다.
                </p>

                <button
                  id="btn-copy-family-message"
                  onClick={handleCopyMessage}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors shrink-0 bg-pink-400 hover:bg-pink-500"
                >
                  {copiedMessage ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedMessage ? '복사되었습니다!' : '메시지 복사하기'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: QR Code */}
          {activeShareTab === 'qr' && (
            <div className="space-y-4 text-center py-4">
              <div className="inline-block p-4 bg-white rounded-2xl border-2 border-stone-200 shadow-md">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                    currentUrl
                  )}`}
                  alt="QR Code"
                  className="w-44 h-44 object-contain mx-auto"
                />
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-bold text-stone-800">
                  스마트폰 카메라로 스캔하여 접속
                </h4>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  가족들이 스마트폰으로 QR 코드를 비추면 {profile.name}의 성장 홈페이지로 바로 연결됩니다.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedLink ? '링크 복사됨' : '웹사이트 링크 복사'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
