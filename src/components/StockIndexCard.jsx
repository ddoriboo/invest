import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

// 미니 차트 컴포넌트
const MiniChart = ({ data, isPositive }) => {
  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = range === 0 ? 50 : ((maxValue - value) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="absolute left-4 right-4 bottom-10 h-8">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* 배경 영역 */}
        <defs>
          <linearGradient id={`gradient-${isPositive ? 'positive' : 'negative'}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{stopColor: isPositive ? 'var(--accent-blue)' : 'var(--accent-red)', stopOpacity: 0.3}} />
            <stop offset="100%" style={{stopColor: isPositive ? 'var(--accent-blue)' : 'var(--accent-red)', stopOpacity: 0.05}} />
          </linearGradient>
        </defs>

        {/* 참조선 */}
        <line
          x1="0" y1="50" x2="100" y2="50"
          stroke="var(--chart-dashed)"
          strokeWidth="0.5"
          strokeDasharray="2,2"
        />

        {/* 차트 영역 */}
        <polygon
          points={`0,100 ${points} 100,100`}
          fill={`url(#gradient-${isPositive ? 'positive' : 'negative'})`}
        />

        {/* 차트 라인 */}
        <polyline
          points={points}
          fill="none"
          stroke={isPositive ? 'var(--accent-blue)' : 'var(--accent-red)'}
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
};

// 주식 지수 카드 컴포넌트
const StockIndexCard = ({
  title,
  value,
  change,
  changePercent,
  isOpen,
  lastUpdate,
  chartData = [2640, 2645, 2638, 2650, 2645, 2648, 2652],
  compact = false
}) => {
  const isPositive = change >= 0;

  if (compact) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-2 cursor-pointer group hover:shadow-md transition-all duration-200 min-h-[100px] relative">
        {/* 헤더 */}
        <div className="mb-1">
          <h3 className="text-xs font-medium text-gray-900 truncate">{title}</h3>
        </div>

        {/* 메인 가격 */}
        <div className="mb-1">
          <div className="text-sm font-semibold text-number text-gray-900">
            {typeof value === 'string' ? value : value.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}
          </div>
        </div>

        {/* 변동사항 */}
        <div className="flex items-center justify-between mb-2">
          <div className={`flex items-center gap-0.5 ${isPositive ? 'text-positive' : 'text-negative'}`}>
            {isPositive ? (
              <TrendingUp className="w-2 h-2" />
            ) : (
              <TrendingDown className="w-2 h-2" />
            )}
            <span className="text-xs text-number font-medium">
              {changePercent}
            </span>
          </div>
          <span className={`text-xs ${isOpen ? 'status-open' : 'status-closed'}`}>
            {isOpen ? '장중' : '마감'}
          </span>
        </div>

        {/* 컴팩트 미니 차트 */}
        <div className="absolute left-2 right-2 bottom-2 h-4">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {(() => {
              const maxValue = Math.max(...chartData);
              const minValue = Math.min(...chartData);
              const range = maxValue - minValue;
              const points = chartData.map((value, index) => {
                const x = (index / (chartData.length - 1)) * 100;
                const y = range === 0 ? 50 : ((maxValue - value) / range) * 100;
                return `${x},${y}`;
              }).join(' ');

              return (
                <>
                  <defs>
                    <linearGradient id={`compact-gradient-${isPositive ? 'positive' : 'negative'}-${title}`} x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{stopColor: isPositive ? 'var(--accent-blue)' : 'var(--accent-red)', stopOpacity: 0.2}} />
                      <stop offset="100%" style={{stopColor: isPositive ? 'var(--accent-blue)' : 'var(--accent-red)', stopOpacity: 0.05}} />
                    </linearGradient>
                  </defs>

                  {/* 차트 영역 */}
                  <polygon
                    points={`0,100 ${points} 100,100`}
                    fill={`url(#compact-gradient-${isPositive ? 'positive' : 'negative'}-${title})`}
                  />

                  {/* 차트 라인 */}
                  <polyline
                    points={points}
                    fill="none"
                    stroke={isPositive ? 'var(--accent-blue)' : 'var(--accent-red)'}
                    strokeWidth="1"
                  />
                </>
              );
            })()}
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="card-index cursor-pointer group">
      {/* 헤더 */}
      <div className="absolute left-4 top-4">
        <h3 className="text-body text-gray-900">{title}</h3>
      </div>

      {/* 메인 가격 */}
      <div className="absolute left-4 top-9">
        <div className="text-subtitle text-number text-gray-900">
          {typeof value === 'string' ? value : value.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>

      {/* 변동사항 */}
      <div className="absolute left-4 top-16">
        <div className="flex items-center gap-1">
          <div className={`flex items-center gap-1 ${isPositive ? 'text-positive' : 'text-negative'}`}>
            {isPositive ? (
              <TrendingUp className="w-2 h-2" />
            ) : (
              <TrendingDown className="w-2 h-2" />
            )}
            <span className="text-xs text-number font-medium">
              {isPositive ? '+' : ''}{typeof change === 'string' ? change : change.toFixed(2)}
            </span>
          </div>
          <div className={`text-xs text-number font-medium ${isPositive ? 'text-positive' : 'text-negative'}`}>
            ({changePercent})
          </div>
        </div>
      </div>

      {/* 미니 차트 */}
      <MiniChart data={chartData} isPositive={isPositive} />

      {/* 하단 상태 */}
      <div className="absolute left-4 bottom-4 flex items-center gap-1">
        <div className="flex items-center gap-1">
          <span className="text-caption">{lastUpdate}</span>
          <span className={`text-caption ${isOpen ? 'status-open' : 'status-closed'}`}>
            {isOpen ? '장중' : '장마감'}
          </span>
        </div>
      </div>

      {/* 호버 효과 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl pointer-events-none" />
    </div>
  );
};

export default StockIndexCard;