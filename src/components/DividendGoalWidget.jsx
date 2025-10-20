import React from 'react';
import { TrendingUp, Target, Calendar } from 'lucide-react';

// 배당 목표 위젯 컴포넌트
const DividendGoalWidget = ({ monthlyDividend = 1200000, targetMonthlyDividend = 2000000 }) => {
  const achievementRate = (monthlyDividend / targetMonthlyDividend) * 100;
  const remainingAmount = targetMonthlyDividend - monthlyDividend;
  const monthlyIncome = 4500000; // 월 소득 (실제로는 props로 받아야 함)
  const dividendIncomeRatio = (monthlyDividend / monthlyIncome) * 100;

  // 목표 달성까지 필요한 추가 투자금 계산 (연 배당률 5% 가정)
  const annualDividendYield = 0.05;
  const requiredInvestment = Math.round(remainingAmount * 12 / annualDividendYield);

  // 월 추가 투자 시 목표 달성 기간 계산
  const monthlyAdditionalInvest = 800000; // 월 80만원
  const monthsToGoal = Math.ceil(requiredInvestment / monthlyAdditionalInvest);
  const yearsToGoal = Math.floor(monthsToGoal / 12);
  const remainingMonths = monthsToGoal % 12;

  return (
    <div className="card-premium p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5" style={{color: 'var(--accent-green)'}} />
          <h3 className="text-subtitle">배당 목표 현황</h3>
        </div>
        <button className="text-xs px-3 py-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors">
          목표 수정
        </button>
      </div>

      {/* 진행률 바 */}
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-caption" style={{color: 'var(--text-secondary)'}}>
            현재 월 배당
          </span>
          <span className="text-caption font-semibold" style={{color: 'var(--text-primary)'}}>
            {achievementRate.toFixed(1)}%
          </span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(achievementRate, 100)}%`,
              background: 'linear-gradient(90deg, var(--accent-green) 0%, var(--accent-blue) 100%)'
            }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs text-green-600 font-medium">
            {monthlyDividend.toLocaleString()}원
          </span>
          <span className="text-xs" style={{color: 'var(--text-tertiary)'}}>
            목표: {targetMonthlyDividend.toLocaleString()}원
          </span>
        </div>
      </div>

      {/* 상세 정보 */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-caption" style={{color: 'var(--text-secondary)'}}>
            월소득 대비 비율
          </span>
          <span className="text-body font-semibold" style={{color: 'var(--accent-green)'}}>
            {dividendIncomeRatio.toFixed(1)}%
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-caption" style={{color: 'var(--text-secondary)'}}>
            목표까지 필요 투자금
          </span>
          <span className="text-body font-semibold" style={{color: 'var(--text-primary)'}}>
            {requiredInvestment.toLocaleString()}원
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-caption" style={{color: 'var(--text-secondary)'}}>
            월 80만원 투자 시
          </span>
          <span className="text-body font-semibold" style={{color: 'var(--accent-blue)'}}>
            {yearsToGoal > 0 ? `${yearsToGoal}년 ` : ''}{remainingMonths}개월
          </span>
        </div>
      </div>

      {/* CTA 버튼 */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <button className="px-4 py-2 rounded-lg bg-green-50 text-green-600 text-sm font-medium hover:bg-green-100 transition-colors">
          <Calendar className="w-4 h-4 inline mr-1" />
          배당 캘린더
        </button>
        <button className="px-4 py-2 rounded-lg bg-blue-50 text-blue-600 text-sm font-medium hover:bg-blue-100 transition-colors">
          <TrendingUp className="w-4 h-4 inline mr-1" />
          투자 시뮬레이션
        </button>
      </div>
    </div>
  );
};

export default DividendGoalWidget;