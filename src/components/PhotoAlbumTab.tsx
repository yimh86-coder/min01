import { useState, useMemo } from 'react';
import { AlbumPhoto, ChildProfile, PhotoCategory } from '../types';
import { calculateAgeAtDate } from '../utils/dateUtils';
import { useAppTheme } from '../context/ThemeContext';
import {
  Camera,
  Film,
  Plus,
  Search,
  Star,
  Share2,
  Calendar,
  Grid,
  ListFilter,
  ArrowUpDown,
  Sparkles,
} from 'lucide-react';

interface PhotoAlbumTabProps {
  photos: AlbumPhoto[];
  profile: ChildProfile;
  onAddPhoto: () => void;
  onSelectPhoto: (photo: AlbumPhoto) => void;
  onOpenMovieMaker: () => void;
  onOpenShareModal: (photo?: AlbumPhoto) => void;
  onToggleFavorite: (id: string) => void;
}

export function PhotoAlbumTab({
  photos,
  profile,
  onAddPhoto,
  onSelectPhoto,
  onOpenMovieMaker,
  onOpenShareModal,
  onToggleFavorite,
}: PhotoAlbumTabProps) {
  const { isPink } = useAppTheme();

  // Filters & States
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyFavorites, setOnlyFavorites] = useState<boolean>(false);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc'); // Date sort
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');

  // Categories list
  const allCategories: PhotoCategory[] = [
    '첫걸음마',
    '생일',
    '여행',
    '일상',
    '기념일',
    '이유식',
    '가족',
    '기타',
  ];

  // Filtered & Sorted photos
  const filteredPhotos = useMemo(() => {
    let result = [...photos];

    // Category
    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Favorites
    if (onlyFavorites) {
      result = result.filter((p) => p.isFavorite);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.memo?.toLowerCase().includes(q) ||
          p.location?.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sort by date
    result.sort((a, b) => {
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });

    return result;
  }, [photos, selectedCategory, onlyFavorites, searchQuery, sortOrder]);

  // Group by month for timeline view
  const timelineGroups = useMemo(() => {
    const groups: { [key: string]: AlbumPhoto[] } = {};
    filteredPhotos.forEach((photo) => {
      const ym = photo.date.slice(0, 7); // YYYY-MM
      if (!groups[ym]) groups[ym] = [];
      groups[ym].push(photo);
    });
    return groups;
  }, [filteredPhotos]);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case '첫걸음마':
        return '👣';
      case '생일':
        return '🎂';
      case '여행':
        return '✈️';
      case '일상':
        return '🧸';
      case '기념일':
        return '🌿';
      case '이유식':
        return '🥣';
      case '가족':
        return '👪';
      default:
        return '📸';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner with Action Buttons */}
      <div className="rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden bg-gradient-to-r from-pink-400 via-pink-300 to-rose-300 transition-colors duration-300">
        {/* Subtle decorative circles */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-48 h-48 bg-white/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/25 backdrop-blur-md rounded-full text-xs font-bold text-white shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>성장 사진 앨범 & 무비 메이커</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white drop-shadow-xs">
              {profile.name}의 모든 성장 순간을 한눈에
            </h2>
            <p className="text-xs sm:text-sm text-white/95 leading-relaxed">
              첫걸음마, 생일, 여행, 일상 사진들을 날짜별로 모아보고, 감성 BGM과 함께 이어지는 성장 동영상을 제작하거나 가족들에게 공유해보세요.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <button
              id="btn-open-add-photo"
              onClick={onAddPhoto}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-3 bg-white text-stone-900 rounded-2xl font-bold text-xs sm:text-sm shadow-sm hover:bg-pink-50 transition-all active:scale-98"
            >
              <Plus className="w-4 h-4 text-pink-500" />
              <span>사진 올리기</span>
            </button>

            <button
              id="btn-open-movie-maker"
              onClick={onOpenMovieMaker}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-sm transition-all active:scale-98"
            >
              <Film className="w-4 h-4 text-pink-300" />
              <span>성장 영상 만들기</span>
            </button>

            <button
              id="btn-open-share-album"
              onClick={() => onOpenShareModal()}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-2xl font-bold text-xs sm:text-sm border border-white/30 transition-all active:scale-98"
            >
              <Share2 className="w-4 h-4" />
              <span>가족과 공유</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-pink-200/70 shadow-2xs space-y-4 transition-colors">
        {/* Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-pink-400 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-pink-50/50'
            }`}
          >
            전체 ({photos.length})
          </button>

          {allCategories.map((cat) => {
            const count = photos.filter((p) => p.category === cat).length;
            if (count === 0 && !['첫걸음마', '생일', '여행'].includes(cat)) return null;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-pink-400 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-pink-50/50'
                }`}
              >
                <span>{getCategoryIcon(cat)}</span>
                <span>{cat}</span>
                <span className="text-[10px] opacity-70">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Search & Sort & View Mode Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-stone-100">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="제목, 메모, 태그, 장소 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-pink-300/30 focus:border-pink-300"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Filters: Favorites, Sort, View Toggle */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {/* Only Favorites */}
            <button
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                onlyFavorites
                  ? 'bg-pink-50 border-pink-200 text-pink-700'
                  : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-pink-400 text-pink-400' : ''}`} />
              <span>즐겨찾기</span>
            </button>

            {/* Sort Order Toggle */}
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="flex items-center gap-1 px-3 py-1.5 bg-white border border-stone-200 hover:bg-stone-50 text-stone-600 rounded-xl text-xs font-bold transition-colors"
              title={sortOrder === 'desc' ? '최신순 (클릭시 오래된순)' : '오래된순 (클릭시 최신순)'}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>{sortOrder === 'desc' ? '최신순' : '오래된순'}</span>
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-stone-100 p-0.5 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white shadow-xs text-pink-600'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
                title="그리드 뷰"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'timeline'
                    ? 'bg-white shadow-xs text-pink-600'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
                title="월별 타임라인 뷰"
              >
                <ListFilter className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PHOTOS DISPLAY */}
      {filteredPhotos.length === 0 ? (
        <div className={`bg-white rounded-3xl p-12 text-center border shadow-2xs space-y-3 ${
          isPink ? 'border-pink-200/80' : 'border-sky-200/80'
        }`}>
          <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
            isPink ? 'bg-pink-100 text-pink-700' : 'bg-sky-100 text-sky-700'
          }`}>
            <Camera className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-stone-800">일치하는 성장 사진이 없습니다</h3>
          <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto">
            {searchQuery || selectedCategory !== 'all' || onlyFavorites
              ? '필터 조건을 변경하거나 검색어를 지워보세요.'
              : '소중한 아이의 사진을 업로드하여 첫걸음마, 생일, 여행 추억을 기록해보세요!'}
          </p>
          <button
            onClick={onAddPhoto}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors bg-pink-400 hover:bg-pink-500"
          >
            <Plus className="w-4 h-4" />
            <span>새 사진 올리기</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPhotos.map((photo) => {
            const ageInfo = calculateAgeAtDate(profile.birthDate, photo.date);
            return (
              <div
                key={photo.id}
                onClick={() => onSelectPhoto(photo)}
                className="group relative bg-white rounded-2xl overflow-hidden border border-stone-200/80 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col"
              >
                {/* Image Container */}
                <div className="relative aspect-4/3 overflow-hidden bg-stone-100">
                  <img
                    src={photo.photoUrl}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />

                  {/* Top Badges */}
                  <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-10">
                    <span className="px-2 py-0.5 bg-stone-900/70 backdrop-blur-xs text-white text-[11px] font-bold rounded-md shadow-xs">
                      {getCategoryIcon(photo.category)} {photo.category}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(photo.id);
                      }}
                      className={`p-1.5 rounded-full backdrop-blur-xs transition-transform active:scale-90 ${
                        photo.isFavorite
                          ? 'bg-pink-400 text-white shadow-xs'
                          : 'bg-black/40 text-white/80 hover:bg-black/60'
                      }`}
                      title={photo.isFavorite ? '즐겨찾기 해제' : '즐겨찾기'}
                    >
                      <Star className={`w-3.5 h-3.5 ${photo.isFavorite ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Quick Share Button on hover */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenShareModal(photo);
                    }}
                    className="absolute bottom-2.5 right-2.5 p-1.5 bg-white/90 hover:bg-white text-stone-800 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    title="가족/친구에게 공유"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Info */}
                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-1.5">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-stone-900 line-clamp-1 transition-colors group-hover:text-pink-600">
                      {photo.title}
                    </h3>
                    {photo.memo && (
                      <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                        {photo.memo}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1 border-t border-stone-100">
                    <span>{photo.date}</span>
                    <span className="font-semibold text-pink-600">
                      {ageInfo.label.split('·')[0]}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TIMELINE VIEW (Month Grouped) */
        <div className="space-y-8">
          {Object.entries(timelineGroups).map(([yearMonth, groupPhotos]) => {
            const [y, m] = yearMonth.split('-');
            return (
              <div key={yearMonth} className="space-y-4">
                {/* Month Sticky Header */}
                <div className="flex items-center gap-3">
                  <div className="px-3.5 py-1 font-bold text-xs sm:text-sm rounded-xl flex items-center gap-1.5 shadow-2xs bg-pink-100/90 text-pink-700">
                    <Calendar className="w-4 h-4" />
                    <span>{y}년 {Number(m)}월</span>
                  </div>
                  <div className="h-px flex-1 bg-pink-200/60" />
                  <span className="text-xs text-stone-400">{groupPhotos.length}장의 사진</span>
                </div>

                {/* Photos in this month */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {groupPhotos.map((photo) => {
                    const ageInfo = calculateAgeAtDate(profile.birthDate, photo.date);
                    return (
                      <div
                        key={photo.id}
                        onClick={() => onSelectPhoto(photo)}
                        className="group bg-white rounded-2xl overflow-hidden border border-stone-200/80 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col"
                      >
                        <div className="relative aspect-4/3 overflow-hidden bg-stone-100">
                          <img
                            src={photo.photoUrl}
                            alt={photo.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                          <div className="absolute top-2.5 left-2.5">
                            <span className="px-2 py-0.5 bg-stone-900/70 backdrop-blur-xs text-white text-[11px] font-bold rounded-md shadow-xs">
                              {getCategoryIcon(photo.category)} {photo.category}
                            </span>
                          </div>
                        </div>

                        <div className="p-3.5 space-y-1">
                          <h4 className="text-xs sm:text-sm font-bold text-stone-900 line-clamp-1">
                            {photo.title}
                          </h4>
                          <div className="flex items-center justify-between text-[11px] text-stone-400">
                            <span>{photo.date}</span>
                            <span className="font-semibold text-pink-600">
                              {ageInfo.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
