import { useState, useId } from 'react';
import { GrowthRecord, Gender } from '../types';
import { formatDateKR } from '../utils/dateUtils';
import { Plus, Trash2, TrendingUp, Calendar, Ruler, Scale } from 'lucide-react';

interface GrowthTrackerTabProps {
  records: GrowthRecord[];
  gender: Gender;
  onAddRecord: () => void;
  onDeleteRecord: (id: string) => void;
}

// WHO / 한국 소아청소년 표준 성장도표 50백분위수(중앙값) 참조 데이터 (0 ~ 24개월)
const STANDARD_GROWTH = {
  boy: [
    { m: 0, h: 49.9, w: 3.3 },
    { m: 1, h: 54.7, w: 4.5 },
    { m: 2, h: 58.4, w: 5.6 },
    { m: 3, h: 61.4, w: 6.4 },
    { m: 4, h: 63.9, w: 7.0 },
    { m: 6, h: 67.6, w: 7.9 },
    { m: 8, h: 70.6, w: 8.6 },
    { m: 10, h: 73.3, w: 9.2 },
    { m: 12, h: 75.7, w: 9.6 },
    { m: 15, h: 79.1, w: 10.3 },
    { m: 18, h: 82.3, w: 10.9 },
    { m: 24, h: 87.8, w: 12.2 },
  ],
  girl: [
    { m: 0, h: 49.1, w: 3.2 },
    { m: 1, h: 53.7, w: 4.2 },
    { m: 2, h: 57.1, w: 5.1 },
    { m: 3, h: 59.8, w: 5.8 },
    { m: 4, h: 62.1, w: 6.4 },
    { m: 6, h: 65.7, w: 7.3 },
    { m: 8, h: 68.7, w: 7.9 },
    { m: 10, h: 71.5, w: 8.5 },
    { m: 12, h: 74.0, w: 8.9 },
    { m: 15, h: 77.5, w: 9.6 },
    { m: 18, h: 80.7, w: 10.2 },
    { m: 24, h: 86.4, w: 11.5 },
  ],
};

export function GrowthTrackerTab({
  records,
  gender,
  onAddRecord,
  onDeleteRecord,
}: GrowthTrackerTabProps) {
  const [activeMetric, setActiveMetric] = useState<'height' | 'weight' | 'head'>('height');
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    label: string;
    value: string;
    date: string;
    memo?: string;
  } | null>(null);

  const heightGradId = useId();
  const weightGradId = useId();

  // Sort chronological for chart
  const sortedAsc = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  // Sort reverse chronological for table
  const sortedDesc = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Chart layout config
  const chartWidth = 640;
  const chartHeight = 280;
  const padLeft = 46;
  const padRight = 24;
  const padTop = 30;
  const padBottom = 40;
  const innerW = chartWidth - padLeft - padRight;
  const innerH = chartHeight - padTop - padBottom;

  const maxMonth = Math.max(
    12,
    ...sortedAsc.map((r) => r.ageMonths),
    STANDARD_GROWTH[gender][STANDARD_GROWTH[gender].length - 1].m
  );

  const metricConfig = {
    height: {
      name: '키 (신장)',
      unit: 'cm',
      color: '#d97706', // amber-600
      refColor: '#9ca3af',
      min: 40,
      max: 100,
      getValue: (r: GrowthRecord) => r.height,
      getRefValue: (s: { h: number }) => s.h,
    },
    weight: {
      name: '몸무게 (체중)',
      unit: 'kg',
      color: '#e11d48', // rose-600
      refColor: '#9ca3af',
      min: 2,
      max: 16,
      getValue: (r: GrowthRecord) => r.weight,
      getRefValue: (s: { w: number }) => s.w,
    },
    head: {
      name: '머리둘레',
      unit: 'cm',
      color: '#7c3aed', // purple-600
      refColor: '#9ca3af',
      min: 30,
      max: 54,
      getValue: (r: GrowthRecord) => r.headCircumference || 0,
      getRefValue: () => 0,
    },
  }[activeMetric];

  const minVal = metricConfig.min;
  const maxVal = metricConfig.max;

  const getX = (month: number) => padLeft + (month / maxMonth) * innerW;
  const getY = (val: number) => padTop + innerH - ((val - minVal) / (maxVal - minVal)) * innerH;

  // Generate paths
  const userPoints = sortedAsc
    .filter((r) => metricConfig.getValue(r) > 0)
    .map((r) => ({
      x: getX(r.ageMonths),
      y: getY(metricConfig.getValue(r)),
      record: r,
    }));

  const userPathD = userPoints.length > 0
    ? `M ${userPoints.map((p) => `${p.x},${p.y}`).join(' L ')}`
    : '';

  const refData = STANDARD_GROWTH[gender];
  const refPoints = refData.map((s) => ({
    x: getX(s.m),
    y: getY(metricConfig.getRefValue(s)),
  }));
  const refPathD = refPoints.length > 0
    ? `M ${refPoints.map((p) => `${p.x},${p.y}`).join(' L ')}`
    : '';

  return (
    <div className="space-y-6">
      {/* Metric Selector & Add button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-stone-200/60 rounded-2xl w-fit">
          <button
            onClick={() => setActiveMetric('height')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeMetric === 'height'
                ? 'bg-white text-amber-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Ruler className="w-3.5 h-3.5 text-amber-600" />
            키 (신장)
          </button>
          <button
            onClick={() => setActiveMetric('weight')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeMetric === 'weight'
                ? 'bg-white text-rose-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-rose-600" />
            몸무게 (체중)
          </button>
          <button
            onClick={() => setActiveMetric('head')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeMetric === 'head'
                ? 'bg-white text-purple-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
            머리둘레
          </button>
        </div>

        <button
          onClick={onAddRecord}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          신체 측정치 기록하기
        </button>
      </div>

      {/* Chart Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-amber-200/60 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-stone-100 gap-3">
          <div>
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <span>{metricConfig.name} 성장 곡선도</span>
              <span className="text-xs font-normal text-stone-500">
                (단위: {metricConfig.unit})
              </span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              우리 아이의 실제 기록과 표준(WHO/질병관리청 50백분위수 평균 기준선)을 한눈에 비교할 수 있습니다.
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: metricConfig.color }} />
              <span className="font-semibold text-stone-700">우리 아이 기록</span>
            </div>
            {activeMetric !== 'head' && (
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-0.5 border-t-2 border-dashed border-stone-400" />
                <span className="text-stone-500 font-medium">표준 평균치 (50%)</span>
              </div>
            )}
          </div>
        </div>

        {/* SVG Chart */}
        <div className="relative w-full overflow-x-auto pt-4">
          <div className="min-w-[560px]">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto overflow-visible select-none"
            >
              <defs>
                <linearGradient id={heightGradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d97706" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#d97706" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id={weightGradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e11d48" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#e11d48" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines (Horizontal) */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                const y = padTop + ratio * innerH;
                const val = Math.round(maxVal - ratio * (maxVal - minVal));
                return (
                  <g key={i}>
                    <line
                      x1={padLeft}
                      y1={y}
                      x2={padLeft + innerW}
                      y2={y}
                      stroke="#f1f5f9"
                      strokeWidth="1"
                    />
                    <text
                      x={padLeft - 8}
                      y={y + 4}
                      textAnchor="end"
                      fontSize="10"
                      fill="#94a3b8"
                      className="font-mono"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Month X-Axis labels */}
              {[0, 2, 4, 6, 8, 10, 12, 15, 18, 24].map((m) => {
                if (m > maxMonth) return null;
                const x = getX(m);
                return (
                  <g key={m}>
                    <line
                      x1={x}
                      y1={padTop}
                      x2={x}
                      y2={padTop + innerH}
                      stroke="#f8fafc"
                      strokeWidth="1"
                    />
                    <text
                      x={x}
                      y={padTop + innerH + 18}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#64748b"
                      className="font-medium"
                    >
                      {m}개월
                    </text>
                  </g>
                );
              })}

              {/* Standard Reference Curve (Dashed) */}
              {activeMetric !== 'head' && (
                <path
                  d={refPathD}
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="1.75"
                  strokeDasharray="4 4"
                />
              )}

              {/* User Data Path Area Gradient */}
              {userPoints.length > 1 && (
                <path
                  d={`${userPathD} L ${userPoints[userPoints.length - 1].x},${padTop + innerH} L ${userPoints[0].x},${padTop + innerH} Z`}
                  fill={`url(#${activeMetric === 'height' ? heightGradId : weightGradId})`}
                />
              )}

              {/* User Line */}
              {userPathD && (
                <path
                  d={userPathD}
                  fill="none"
                  stroke={metricConfig.color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* User Points */}
              {userPoints.map((p, idx) => (
                <g key={idx}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="5"
                    fill="#ffffff"
                    stroke={metricConfig.color}
                    strokeWidth="2.5"
                    className="cursor-pointer transition-transform hover:scale-125"
                    onMouseEnter={() =>
                      setHoveredPoint({
                        x: p.x,
                        y: p.y,
                        label: `${p.record.ageMonths}개월`,
                        value: `${metricConfig.getValue(p.record)} ${metricConfig.unit}`,
                        date: p.record.date,
                        memo: p.record.memo,
                      })
                    }
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                </g>
              ))}
            </svg>

            {/* Hover Tooltip */}
            {hoveredPoint && (
              <div
                className="absolute z-20 pointer-events-none -translate-x-1/2 -translate-y-full mb-3 bg-stone-900/90 text-white rounded-xl px-3 py-2 text-xs shadow-lg backdrop-blur-xs min-w-[120px]"
                style={{
                  left: `${(hoveredPoint.x / chartWidth) * 100}%`,
                  top: `${(hoveredPoint.y / chartHeight) * 100}%`,
                }}
              >
                <div className="font-semibold text-amber-300">{hoveredPoint.label}</div>
                <div className="text-sm font-bold">{hoveredPoint.value}</div>
                <div className="text-[10px] text-stone-300">{formatDateKR(hoveredPoint.date)}</div>
                {hoveredPoint.memo && (
                  <div className="text-[10px] text-stone-300 mt-1 border-t border-stone-700 pt-1 line-clamp-2">
                    {hoveredPoint.memo}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Records History Table */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-amber-200/60 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-600" />
            성장 측정 상세 히스토리 ({records.length}건)
          </h3>
          <span className="text-xs text-stone-400">최근 날짜순</span>
        </div>

        {sortedDesc.length === 0 ? (
          <div className="py-12 text-center text-stone-400 text-sm">
            아직 신체 측정 기록이 없습니다. '신체 측정치 기록하기'를 눌러 시작해보세요!
          </div>
        ) : (
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-stone-100 text-stone-400 font-medium">
                  <th className="py-3 px-3">측정일자</th>
                  <th className="py-3 px-3">월령</th>
                  <th className="py-3 px-3 text-amber-800">키(cm)</th>
                  <th className="py-3 px-3 text-rose-800">몸무게(kg)</th>
                  <th className="py-3 px-3 text-purple-800">머리둘레(cm)</th>
                  <th className="py-3 px-3">특이사항 및 메모</th>
                  <th className="py-3 px-3 text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {sortedDesc.map((rec) => (
                  <tr key={rec.id} className="hover:bg-amber-50/40 transition-colors">
                    <td className="py-3 px-3 font-medium text-stone-800 whitespace-nowrap">
                      {formatDateKR(rec.date)}
                    </td>
                    <td className="py-3 px-3 font-semibold text-stone-600 whitespace-nowrap">
                      {rec.ageMonths}개월
                    </td>
                    <td className="py-3 px-3 font-bold text-amber-700 whitespace-nowrap">
                      {rec.height} cm
                    </td>
                    <td className="py-3 px-3 font-bold text-rose-700 whitespace-nowrap">
                      {rec.weight} kg
                    </td>
                    <td className="py-3 px-3 text-purple-700 whitespace-nowrap">
                      {rec.headCircumference ? `${rec.headCircumference} cm` : '-'}
                    </td>
                    <td className="py-3 px-3 text-stone-600 max-w-xs truncate">
                      {rec.memo || '-'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onDeleteRecord(rec.id)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="기록 삭제"
                        aria-label="기록 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
