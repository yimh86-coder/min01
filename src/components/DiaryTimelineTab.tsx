import { useState } from 'react';
import { DiaryEntry } from '../types';
import { formatDateKR } from '../utils/dateUtils';
import { useAppTheme } from '../context/ThemeContext';
import { Plus, Search, Tag, Trash2, Calendar, Sparkles } from 'lucide-react';

interface DiaryTimelineTabProps {
  entries: DiaryEntry[];
  onAddEntry: () => void;
  onDeleteEntry: (id: string) => void;
}

const MOOD_MAP: Record<DiaryEntry['mood'], { label: string; icon: string }> = {
  happy: { label: '행복해요', icon: '🥰' },
  excited: { label: '신나요', icon: '🥳' },
  proud: { label: '대견해요', icon: '✨' },
  curious: { label: '호기심가득', icon: '👀' },
  sleepy: { label: '쿨쿨자요', icon: '😴' },
  crying: { label: '으앙울어요', icon: '🥺' },
};

export function DiaryTimelineTab({ entries, onAddEntry, onDeleteEntry }: DiaryTimelineTabProps) {
  const { isPink } = useAppTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedEntryForDetail, setSelectedEntryForDetail] = useState<DiaryEntry | null>(null);

  // Collect all unique tags
  const allTags = Array.from(new Set(entries.flatMap((e) => e.tags || [])));

  // Filter entries
  const filtered = entries
    .filter((e) => {
      const matchSearch =
        !searchQuery ||
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchTag = !selectedTag || (e.tags && e.tags.includes(selectedTag));
      return matchSearch && matchTag;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      {/* Top action bar & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex-1 relative max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="추억 이야기, 제목, 내용 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 bg-white rounded-2xl border text-xs sm:text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 ${
              isPink
                ? 'border-pink-200/80 focus:ring-pink-400 focus:border-pink-400'
                : 'border-sky-200/80 focus:ring-sky-400 focus:border-sky-400'
            }`}
          />
        </div>

        <button
          onClick={onAddEntry}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 text-white rounded-2xl text-xs sm:text-sm font-semibold shadow-xs transition-colors ${
            isPink ? 'bg-pink-600 hover:bg-pink-700' : 'bg-sky-600 hover:bg-sky-700'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>소중한 추억 기록하기</span>
        </button>
      </div>

      {/* Tag Filter Chips */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-stone-400 flex items-center gap-1 mr-1">
            <Tag className="w-3 h-3" /> 태그:
          </span>
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              selectedTag === null
                ? isPink ? 'bg-pink-700 text-white' : 'bg-sky-700 text-white'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            전체 보기 ({entries.length})
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedTag === tag
                  ? isPink ? 'bg-pink-600 text-white' : 'bg-sky-600 text-white'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Diary Timeline List */}
      {filtered.length === 0 ? (
        <div className={`bg-white rounded-3xl p-12 text-center border shadow-xs ${
          isPink ? 'border-pink-200/80' : 'border-sky-200/80'
        }`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 ${
            isPink ? 'bg-pink-100 text-pink-600' : 'bg-sky-100 text-sky-600'
          }`}>
            <Sparkles className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-stone-800 mb-1">기록된 추억이 없습니다</h4>
          <p className="text-xs text-stone-500 mb-4">
            {searchQuery || selectedTag
              ? '검색 조건에 맞는 성장 일기가 없습니다.'
              : '아이의 웃는 얼굴, 첫 발걸음, 소소한 일상을 사진과 함께 남겨보세요.'}
          </p>
          <button
            onClick={onAddEntry}
            className={`px-4 py-2 text-white rounded-xl text-xs font-medium transition-colors ${
              isPink ? 'bg-pink-600 hover:bg-pink-700' : 'bg-sky-600 hover:bg-sky-700'
            }`}
          >
            첫 추억 등록하기
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((entry) => {
            const mood = MOOD_MAP[entry.mood] || MOOD_MAP.happy;
            return (
              <article
                key={entry.id}
                className={`bg-white rounded-3xl border overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group ${
                  isPink ? 'border-pink-200/80' : 'border-sky-200/80'
                }`}
              >
                {/* Image Section */}
                {entry.photoUrl ? (
                  <div
                    className="relative w-full h-52 overflow-hidden bg-stone-100 cursor-pointer"
                    onClick={() => setSelectedEntryForDetail(entry)}
                  >
                    <img
                      src={entry.photoUrl}
                      alt={entry.title}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-xs text-xs font-semibold shadow-xs">
                      <span>{mood.icon}</span>
                      <span className="text-stone-700">{mood.label}</span>
                    </div>
                  </div>
                ) : (
                  <div className="pt-5 px-5 pb-0 flex items-center justify-between">
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-stone-700 ${
                      isPink ? 'bg-pink-50' : 'bg-sky-50'
                    }`}>
                      <span>{mood.icon}</span>
                      <span>{mood.label}</span>
                    </div>
                  </div>
                )}

                {/* Content Section */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Date and actions */}
                    <div className="flex items-center justify-between text-xs text-stone-400 mb-2">
                      <span className="flex items-center gap-1 font-medium text-stone-500">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDateKR(entry.date)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('이 추억 일기를 삭제하시겠습니까?')) {
                            onDeleteEntry(entry.id);
                          }
                        }}
                        className="p-1 rounded-lg hover:text-rose-600 hover:bg-rose-50 text-stone-400 transition-colors"
                        title="일기 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4
                      className={`text-base font-bold text-stone-900 mb-2 transition-colors cursor-pointer ${
                        isPink ? 'group-hover:text-pink-700' : 'group-hover:text-sky-700'
                      }`}
                      onClick={() => setSelectedEntryForDetail(entry)}
                    >
                      {entry.title}
                    </h4>

                    <p className="text-xs sm:text-sm text-stone-600 line-clamp-3 leading-relaxed whitespace-pre-line mb-3">
                      {entry.content}
                    </p>
                  </div>

                  {/* Footer tags and measurements */}
                  <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-1">
                      {entry.tags.map((t) => (
                        <span
                          key={t}
                          onClick={() => setSelectedTag(t)}
                          className={`text-[11px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 transition-colors cursor-pointer ${
                            isPink ? 'hover:bg-pink-100 hover:text-pink-800' : 'hover:bg-sky-100 hover:text-sky-800'
                          }`}
                        >
                          #{t}
                        </span>
                      ))}
                    </div>

                    {(entry.height || entry.weight) && (
                      <div className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${
                        isPink ? 'text-pink-800 bg-pink-50' : 'text-sky-800 bg-sky-50'
                      }`}>
                        {entry.height ? `${entry.height}cm ` : ''}
                        {entry.weight ? `${entry.weight}kg` : ''}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedEntryForDetail && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                isPink ? 'text-pink-700 bg-pink-50' : 'text-sky-700 bg-sky-50'
              }`}>
                {formatDateKR(selectedEntryForDetail.date)}
              </span>
              <button
                onClick={() => setSelectedEntryForDetail(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-sm font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            {selectedEntryForDetail.photoUrl && (
              <div className="rounded-2xl overflow-hidden bg-stone-100 max-h-80 flex items-center justify-center">
                <img
                  src={selectedEntryForDetail.photoUrl}
                  alt={selectedEntryForDetail.title}
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            <div>
              <h3 className="text-xl font-bold text-stone-900 mb-2">
                {selectedEntryForDetail.title}
              </h3>
              <p className="text-sm text-stone-700 whitespace-pre-line leading-relaxed">
                {selectedEntryForDetail.content}
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-2">
              {selectedEntryForDetail.tags.map((t) => (
                <span key={t} className={`text-xs px-2.5 py-1 rounded-lg font-medium ${
                  isPink ? 'bg-pink-100/70 text-pink-900' : 'bg-sky-100/70 text-sky-900'
                }`}>
                  #{t}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
