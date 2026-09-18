import { useState } from 'react';
import { ChildProfile, GrowthRecord, DiaryEntry, MilestoneItem, ToothRecord, AlbumPhoto } from '../types';
import { Download, Upload, RefreshCw, AlertTriangle, X, Check, ShieldCheck } from 'lucide-react';

interface DataBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  allData: {
    profile: ChildProfile;
    growthRecords: GrowthRecord[];
    diaryEntries: DiaryEntry[];
    milestones: MilestoneItem[];
    teeth: ToothRecord[];
    albumPhotos: AlbumPhoto[];
  };
  onImportData: (data: {
    profile: ChildProfile;
    growthRecords: GrowthRecord[];
    diaryEntries: DiaryEntry[];
    milestones: MilestoneItem[];
    teeth: ToothRecord[];
    albumPhotos?: AlbumPhoto[];
  }) => void;
  onResetSampleData: () => void;
}

export function DataBackupModal({
  isOpen,
  onClose,
  allData,
  onImportData,
  onResetSampleData,
}: DataBackupModalProps) {
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    const jsonStr = JSON.stringify(
      {
        version: 1,
        exportedAt: new Date().toISOString(),
        data: allData,
      },
      null,
      2
    );

    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filename = `${allData.profile.name}_성장기록_${new Date().toISOString().split('T')[0]}.json`;
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const importedData = parsed.data || parsed;

        if (!importedData.profile || !Array.isArray(importedData.growthRecords)) {
          throw new Error('올바른 성장기록 데이터 포맷이 아닙니다.');
        }

        onImportData({
          profile: importedData.profile,
          growthRecords: importedData.growthRecords || [],
          diaryEntries: importedData.diaryEntries || [],
          milestones: importedData.milestones || [],
          teeth: importedData.teeth || [],
          albumPhotos: importedData.albumPhotos || [],
        });

        setImportStatus('데이터를 성공적으로 복원했습니다! 🎉');
        setTimeout(() => {
          setImportStatus(null);
          onClose();
        }, 1200);
      } catch (err: any) {
        alert(err.message || '파일을 읽는 중 오류가 발생했습니다.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-5 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-bold text-stone-900">데이터 보관 및 백업</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-sm font-bold"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 text-xs text-stone-600">
          <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200/80">
            <p className="leading-relaxed">
              아이의 소중한 사진과 신체 기록은 현재 브라우저의 로컬 저장소에 안전하게 보관되고 있습니다.
              기기를 변경하거나 영구 소장하시려면 <strong>'백업 파일 다운로드'</strong>를 이용하세요.
            </p>
          </div>

          {importStatus && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl font-medium border border-emerald-200 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{importStatus}</span>
            </div>
          )}

          {/* Export Action */}
          <div className="border border-stone-200 rounded-2xl p-4 space-y-2">
            <div className="font-bold text-stone-800 text-sm flex items-center gap-1.5">
              <Download className="w-4 h-4 text-amber-600" />
              1. 성장 기록 백업 다운로드
            </div>
            <p className="text-stone-500 text-[11px]">
              프로필, 키·몸무게 그래프 데이터, 추억 일기 사진, 치아 발달 현황을 하나의 JSON 파일로 내보냅니다.
            </p>
            <button
              type="button"
              onClick={handleExport}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors"
            >
              내 컴퓨터/폰에 백업 파일 저장 (.json)
            </button>
          </div>

          {/* Import Action */}
          <div className="border border-stone-200 rounded-2xl p-4 space-y-2">
            <div className="font-bold text-stone-800 text-sm flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-blue-600" />
              2. 저장된 백업 파일 불러오기
            </div>
            <p className="text-stone-500 text-[11px]">
              이전에 백업해둔 파일(.json)을 선택해 기존 기록을 복원합니다.
            </p>
            <label className="block w-full py-2.5 text-center bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-bold text-xs cursor-pointer transition-colors">
              파일 선택하여 복원하기
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>
          </div>

          {/* Sample Data Reset */}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
            <span className="text-[11px] text-stone-400">초기화가 필요하신가요?</span>
            <button
              type="button"
              onClick={() => {
                if (confirm('예시 샘플 데이터로 다시 초기화하시겠습니까? 현재 변경사항은 덮어씌워집니다.')) {
                  onResetSampleData();
                  onClose();
                }
              }}
              className="text-[11px] text-stone-500 hover:text-rose-600 flex items-center gap-1 underline"
            >
              <RefreshCw className="w-3 h-3" />
              샘플 데이터로 되돌리기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
