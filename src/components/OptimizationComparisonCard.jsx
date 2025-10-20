import React from 'react';
import { TrendingUp } from 'lucide-react';

/**
 * 현재 vs 최적화 후 비교 카드 컴포넌트
 * 40대 운용단계 디자인의 optimization-comparison 참고
 */
const OptimizationComparisonCard = ({
  currentValue = 0,
  optimizedValue = 0,
  label = '월 예상 수령액',
  showImprovement = true,
  className = ''
}) => {
  const formatCurrency = (amount) => {
    if (amount >= 100000000) {
      return `${(amount / 100000000).toFixed(1)}억원`;
    } else if (amount >= 10000) {
      return `${(amount / 10000).toFixed(0)}만원`;
    }
    return `${amount.toLocaleString()}원`;
  };

  const improvement = optimizedValue - currentValue;
  const improvementPercent = currentValue > 0
    ? ((improvement / currentValue) * 100).toFixed(1)
    : 0;

  return (
    <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
      <div className="text-sm font-semibold text-gray-800 mb-3">
        {label}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* 현재 */}
        <div className="text-center p-2 bg-white rounded-md">
          <div className="text-xs text-gray-500 mb-1">현재</div>
          <div className="text-[17px] font-bold text-gray-900">
            {formatCurrency(currentValue)}
          </div>
        </div>

        {/* 개선 후 */}
        <div className="text-center p-2 bg-white rounded-md relative">
          <div className="text-xs text-gray-500 mb-1">개선 후</div>
          <div className="text-[17px] font-bold text-green-600">
            {formatCurrency(optimizedValue)}
          </div>
          {showImprovement && improvement > 0 && (
            <div className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
              <TrendingUp className="w-2.5 h-2.5" />
              +{improvementPercent}%
            </div>
          )}
        </div>
      </div>

      {showImprovement && improvement > 0 && (
        <div className="mt-3 text-center text-xs text-green-700 font-medium">
          💡 최적화 시 월 {formatCurrency(improvement)} 증가
        </div>
      )}
    </div>
  );
};

export default OptimizationComparisonCard;
