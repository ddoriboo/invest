import React from 'react';

/**
 * 연금 요약 정보를 3칸 그리드로 표시하는 컴포넌트
 * 40대 운용단계 디자인의 pension-summary 참고
 */
const PensionSummaryGrid = ({
  totalPensionAssets = 0,
  expectedMonthlyIncome = 0,
  annualTaxDeduction = 0,
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

  const items = [
    {
      label: '총 연금 자산',
      value: formatCurrency(totalPensionAssets),
      color: 'primary'
    },
    {
      label: '월 예상 수령액',
      value: formatCurrency(expectedMonthlyIncome),
      color: 'primary'
    },
    {
      label: '연간 세액 공제',
      value: formatCurrency(annualTaxDeduction),
      color: 'success'
    }
  ];

  return (
    <div className={`grid grid-cols-3 gap-1 ${className}`}>
      {items.map((item, index) => (
        <div
          key={index}
          className="flex flex-col items-center p-2.5 bg-white border border-gray-200 rounded-lg transition-all hover:border-green-400 hover:-translate-y-0.5"
        >
          <div className="text-[10px] text-gray-500 mb-1 whitespace-nowrap">
            {item.label}
          </div>
          <div className={`text-[15px] font-bold whitespace-nowrap ${
            item.color === 'success' ? 'text-green-600' : 'text-gray-900'
          }`}>
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PensionSummaryGrid;
