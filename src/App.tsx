import { useState, useEffect } from 'react';
import {
  ChildProfile,
  GrowthRecord,
  DiaryEntry,
  MilestoneItem,
  ToothRecord,
  AlbumPhoto,
} from './types';
import {
  initialProfile,
  initialGrowthRecords,
  initialDiaryEntries,
  defaultMilestones,
  defaultTeeth,
  initialAlbumPhotos,
} from './data/initialData';
import {
  STORAGE_KEYS,
  loadFromStorage,
  saveToStorage,
} from './utils/storage';

import { ChildProfileHeader } from './components/ChildProfileHeader';
import { PhotoAlbumTab } from './components/PhotoAlbumTab';
import { DiaryTimelineTab } from './components/DiaryTimelineTab';
import { MilestonesTab } from './components/MilestonesTab';
import { TeethChartTab } from './components/TeethChartTab';

import { EditProfileModal } from './components/EditProfileModal';
import { AddGrowthRecordModal } from './components/AddGrowthRecordModal';
import { AddDiaryModal } from './components/AddDiaryModal';
import { AddPhotoModal } from './components/AddPhotoModal';
import { PhotoDetailModal } from './components/PhotoDetailModal';
import { SharePhotoModal } from './components/SharePhotoModal';
import { GrowthMovieMakerModal } from './components/GrowthMovieMakerModal';
import { DataBackupModal } from './components/DataBackupModal';
import { BunnyBackground } from './components/BunnyBackground';

import {
  Camera,
  BookOpen,
  Award,
  Sparkles,
  Heart,
  Film,
  Share2,
} from 'lucide-react';
import { useAppTheme } from './context/ThemeContext';

type TabKey = 'album' | 'diary' | 'milestones' | 'teeth';

export default function App() {
  const { isPink } = useAppTheme();
  // State with LocalStorage persistence
  const [profile, setProfile] = useState<ChildProfile>(() => {
    const saved = loadFromStorage(STORAGE_KEYS.PROFILE, initialProfile);
    if (saved && !saved.heroVideoUrl) {
      return { ...saved, heroVideoUrl: initialProfile.heroVideoUrl };
    }
    return saved;
  });
  const [growthRecords, setGrowthRecords] = useState<GrowthRecord[]>(() =>
    loadFromStorage(STORAGE_KEYS.GROWTH, initialGrowthRecords)
  );
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>(() =>
    loadFromStorage(STORAGE_KEYS.DIARY, initialDiaryEntries)
  );
  const [milestones, setMilestones] = useState<MilestoneItem[]>(() =>
    loadFromStorage(STORAGE_KEYS.MILESTONES, defaultMilestones)
  );
  const [teeth, setTeeth] = useState<ToothRecord[]>(() =>
    loadFromStorage(STORAGE_KEYS.TEETH, defaultTeeth)
  );
  const [albumPhotos, setAlbumPhotos] = useState<AlbumPhoto[]>(() =>
    loadFromStorage(STORAGE_KEYS.ALBUM_PHOTOS, initialAlbumPhotos)
  );

  // Active Tab
  const [activeTab, setActiveTab] = useState<TabKey>('album');

  // Modals
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAddGrowthOpen, setIsAddGrowthOpen] = useState(false);
  const [isAddDiaryOpen, setIsAddDiaryOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);

  // Photo Album & Movie Modals
  const [isAddPhotoOpen, setIsAddPhotoOpen] = useState(false);
  const [isMovieMakerOpen, setIsMovieMakerOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [sharingPhoto, setSharingPhoto] = useState<AlbumPhoto | null>(null);
  const [selectedPhotoDetail, setSelectedPhotoDetail] = useState<AlbumPhoto | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Sync to LocalStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.PROFILE, profile);
  }, [profile]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.GROWTH, growthRecords);
  }, [growthRecords]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.DIARY, diaryEntries);
  }, [diaryEntries]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.MILESTONES, milestones);
  }, [milestones]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.TEETH, teeth);
  }, [teeth]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.ALBUM_PHOTOS, albumPhotos);
  }, [albumPhotos]);

  // Handlers
  const handleSaveProfile = (updated: ChildProfile) => {
    setProfile(updated);
    showToast('아이 프로필이 업데이트되었습니다 ✨');
  };

  const handleAddGrowthRecord = (rec: Omit<GrowthRecord, 'id'>) => {
    const newRecord: GrowthRecord = {
      ...rec,
      id: `growth-${Date.now()}`,
    };
    setGrowthRecords((prev) => [...prev, newRecord]);
    showToast('신체 측정 기록이 추가되었습니다 📏');
  };

  const handleDeleteGrowthRecord = (id: string) => {
    setGrowthRecords((prev) => prev.filter((r) => r.id !== id));
    showToast('측정 기록이 삭제되었습니다.');
  };

  const handleAddDiaryEntry = (entry: Omit<DiaryEntry, 'id'>) => {
    const newEntry: DiaryEntry = {
      ...entry,
      id: `diary-${Date.now()}`,
    };
    setDiaryEntries((prev) => [newEntry, ...prev]);
    showToast('소중한 성장 이야기가 기록되었습니다 📸');
  };

  const handleDeleteDiaryEntry = (id: string) => {
    setDiaryEntries((prev) => prev.filter((e) => e.id !== id));
    showToast('이야기가 삭제되었습니다.');
  };

  // Photo Handlers
  const handleAddPhoto = (photo: Omit<AlbumPhoto, 'id'>) => {
    const newPhoto: AlbumPhoto = {
      ...photo,
      id: `photo-${Date.now()}`,
    };
    setAlbumPhotos((prev) => [newPhoto, ...prev]);
    showToast('새로운 성장 사진이 앨범에 등록되었습니다 📸');
  };

  const handleDeletePhoto = (id: string) => {
    setAlbumPhotos((prev) => prev.filter((p) => p.id !== id));
    if (selectedPhotoDetail?.id === id) {
      setSelectedPhotoDetail(null);
    }
    showToast('사진이 앨범에서 삭제되었습니다.');
  };

  const handleTogglePhotoFavorite = (id: string) => {
    setAlbumPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p))
    );
    if (selectedPhotoDetail && selectedPhotoDetail.id === id) {
      setSelectedPhotoDetail((prev) => (prev ? { ...prev, isFavorite: !prev.isFavorite } : null));
    }
  };

  const handleOpenShareModal = (photo?: AlbumPhoto) => {
    setSharingPhoto(photo || albumPhotos[0] || null);
    setIsShareModalOpen(true);
  };

  // Navigation within PhotoDetailModal
  const currentDetailIndex = selectedPhotoDetail
    ? albumPhotos.findIndex((p) => p.id === selectedPhotoDetail.id)
    : -1;
  const hasPrevDetail = currentDetailIndex > 0;
  const hasNextDetail = currentDetailIndex >= 0 && currentDetailIndex < albumPhotos.length - 1;

  const handlePrevDetail = () => {
    if (hasPrevDetail) {
      setSelectedPhotoDetail(albumPhotos[currentDetailIndex - 1]);
    }
  };

  const handleNextDetail = () => {
    if (hasNextDetail) {
      setSelectedPhotoDetail(albumPhotos[currentDetailIndex + 1]);
    }
  };

  const handleToggleMilestone = (
    id: string,
    achieved: boolean,
    date?: string,
    notes?: string
  ) => {
    setMilestones((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              achieved,
              achievedDate: achieved ? date || m.achievedDate : undefined,
              notes: notes !== undefined ? notes : m.notes,
            }
          : m
      )
    );
    if (achieved) {
      showToast('축하합니다! 마일스톤을 달성했어요 🎉');
    }
  };

  const handleAddCustomMilestone = (item: Omit<MilestoneItem, 'id'>) => {
    const newItem: MilestoneItem = {
      ...item,
      id: `custom-m-${Date.now()}`,
    };
    setMilestones((prev) => [...prev, newItem]);
    showToast('새로운 마일스톤이 등록되었습니다 ⭐');
  };

  const handleUpdateTooth = (
    id: string,
    erupted: boolean,
    date?: string,
    notes?: string
  ) => {
    setTeeth((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              erupted,
              eruptedDate: erupted ? date || t.eruptedDate : undefined,
              notes: notes !== undefined ? notes : t.notes,
            }
          : t
      )
    );
    if (erupted) {
      showToast('예쁜 새 이가 돋아났네요! 맹출 기록 완료 🦷');
    }
  };

  const handleImportAllData = (data: {
    profile: ChildProfile;
    growthRecords: GrowthRecord[];
    diaryEntries: DiaryEntry[];
    milestones: MilestoneItem[];
    teeth: ToothRecord[];
    albumPhotos?: AlbumPhoto[];
  }) => {
    setProfile(data.profile);
    setGrowthRecords(data.growthRecords);
    setDiaryEntries(data.diaryEntries);
    setMilestones(data.milestones);
    setTeeth(data.teeth);
    if (data.albumPhotos && data.albumPhotos.length > 0) {
      setAlbumPhotos(data.albumPhotos);
    }
    showToast('모든 백업 데이터를 정상적으로 복원했습니다!');
  };

  const handleResetSampleData = () => {
    setProfile(initialProfile);
    setGrowthRecords(initialGrowthRecords);
    setDiaryEntries(initialDiaryEntries);
    setMilestones(defaultMilestones);
    setTeeth(defaultTeeth);
    setAlbumPhotos(initialAlbumPhotos);
    showToast('샘플 데이터로 재설정되었습니다.');
  };

  return (
    <div className="min-h-screen pb-16 relative overflow-x-hidden">
      {/* Background Hopping Bunnies */}
      <BunnyBackground />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900/90 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-2xl shadow-xl backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6">
        {/* Child Profile Header */}
        <ChildProfileHeader
          profile={profile}
          growthRecords={growthRecords}
          onEditProfile={() => setIsEditProfileOpen(true)}
          onOpenBackup={() => setIsBackupOpen(true)}
        />

        {/* Tab Navigation */}
        <nav
          aria-label="성장 기록 메뉴"
          className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-pink-200/70 shadow-2xs overflow-x-auto"
        >
          <button
            id="tab-btn-album"
            onClick={() => setActiveTab('album')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'album'
                ? 'bg-pink-400 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-pink-50/50'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>사진 앨범 ({albumPhotos.length})</span>
          </button>

          <button
            id="tab-btn-diary"
            onClick={() => setActiveTab('diary')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'diary'
                ? 'bg-pink-400 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-pink-50/50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>추억 다이어리 ({diaryEntries.length})</span>
          </button>

          <button
            id="tab-btn-milestones"
            onClick={() => setActiveTab('milestones')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'milestones'
                ? 'bg-pink-400 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-pink-50/50'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>성장 마일스톤</span>
          </button>

          <button
            id="tab-btn-teeth"
            onClick={() => setActiveTab('teeth')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'teeth'
                ? 'bg-pink-400 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-pink-50/50'
            }`}
          >
            <span>🦷</span>
            <span>유치 발달도</span>
          </button>
        </nav>

        {/* Tab Content Panels */}
        <section className="transition-opacity duration-300">
          {activeTab === 'album' && (
            <PhotoAlbumTab
              photos={albumPhotos}
              profile={profile}
              onAddPhoto={() => setIsAddPhotoOpen(true)}
              onOpenMovieMaker={() => setIsMovieMakerOpen(true)}
              onOpenShareModal={(photo) => handleOpenShareModal(photo)}
              onSelectPhoto={(photo) => setSelectedPhotoDetail(photo)}
              onToggleFavorite={handleTogglePhotoFavorite}
            />
          )}

          {activeTab === 'diary' && (
            <DiaryTimelineTab
              entries={diaryEntries}
              onAddEntry={() => setIsAddDiaryOpen(true)}
              onDeleteEntry={handleDeleteDiaryEntry}
            />
          )}

          {activeTab === 'milestones' && (
            <MilestonesTab
              milestones={milestones}
              onToggleMilestone={handleToggleMilestone}
              onAddCustomMilestone={handleAddCustomMilestone}
            />
          )}

          {activeTab === 'teeth' && (
            <TeethChartTab
              teeth={teeth}
              onUpdateTooth={handleUpdateTooth}
            />
          )}
        </section>

        {/* Footer */}
        <footer className="pt-8 pb-4 text-center text-xs text-stone-400 space-y-1">
          <p className="flex items-center justify-center gap-1">
            <span>아이의 모든 성장의 순간을 따뜻하게 기억합니다</span>
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
          </p>
          <p>모든 기록은 브라우저 로컬 저장소에 안전하게 유지되며 언제든지 파일로 백업할 수 있습니다.</p>
        </footer>
      </main>

      {/* Modals */}
      <EditProfileModal
        profile={profile}
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        onSave={handleSaveProfile}
      />

      <AddGrowthRecordModal
        birthDateStr={profile.birthDate}
        isOpen={isAddGrowthOpen}
        onClose={() => setIsAddGrowthOpen(false)}
        onSave={handleAddGrowthRecord}
      />

      <AddDiaryModal
        isOpen={isAddDiaryOpen}
        onClose={() => setIsAddDiaryOpen(false)}
        onSave={handleAddDiaryEntry}
      />

      <AddPhotoModal
        isOpen={isAddPhotoOpen}
        onClose={() => setIsAddPhotoOpen(false)}
        onSave={handleAddPhoto}
      />

      <PhotoDetailModal
        photo={selectedPhotoDetail}
        profile={profile}
        isOpen={Boolean(selectedPhotoDetail)}
        onClose={() => setSelectedPhotoDetail(null)}
        onToggleFavorite={handleTogglePhotoFavorite}
        onDelete={handleDeletePhoto}
        onShare={(photo) => {
          setSelectedPhotoDetail(null);
          handleOpenShareModal(photo);
        }}
        onPrev={handlePrevDetail}
        onNext={handleNextDetail}
        hasPrev={hasPrevDetail}
        hasNext={hasNextDetail}
      />

      <SharePhotoModal
        isOpen={isShareModalOpen}
        onClose={() => {
          setIsShareModalOpen(false);
          setSharingPhoto(null);
        }}
        photo={sharingPhoto}
        profile={profile}
      />

      <GrowthMovieMakerModal
        isOpen={isMovieMakerOpen}
        onClose={() => setIsMovieMakerOpen(false)}
        photos={albumPhotos}
        profile={profile}
      />

      <DataBackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        allData={{
          profile,
          growthRecords,
          diaryEntries,
          milestones,
          teeth,
          albumPhotos,
        }}
        onImportData={handleImportAllData}
        onResetSampleData={handleResetSampleData}
      />
    </div>
  );
}

