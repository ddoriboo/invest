import React, { useState } from 'react';
import { Building2, Briefcase, PiggyBank, ChevronDown, ChevronUp, Check, AlertCircle, Info } from 'lucide-react';
import PensionLayerCard from './PensionLayerCard';

const ThreeLayerPensionCard = ({
  pensionData = {},
  isCollapsed = true,
  onToggle = () => {},
  onOpenFullDashboard = () => {},
  className = ""
}) => {
  const {
    nationalPension = {},
    dcPension = {},
    irp = {},
    pensionSavings = {}
  } = pensionData;

  // 총 예상 연금 수령액
  const totalMonthlyPension =
    (nationalPension.monthlyAmount || 0) +
    (dcPension.monthlyPension || 0) +
    (irp.monthlyPension || 0) +
    (pensionSavings.monthlyPension || 0);

  // 3층 구조
  const layers = [
    {
      id: 1,
      name: '국민연금',
      icon: Building2,
      color: 'blue',
      status: nationalPension.monthlyAmount > 0 ? 'active' : 'inactive',
      amount: nationalPension.monthlyAmount || 0,
      description: '공적연금 (65세부터)',
      badge: '1층'
    },
    {
      id: 2,
      name: '퇴직연금',
      icon: Briefcase,
      color: 'green',
      status: (dcPension.totalBalance > 0 || irp.totalBalance > 0) ? 'active' : 'inactive',
      amount: (dcPension.monthlyPension || 0) + (irp.monthlyPension || 0),
      description: 'DC/DB/IRP (60세부터)',
      badge: '2층'
    },
    {
      id: 3,
      name: '개인연금',
      icon: PiggyBank,
      color: 'purple',
      status: pensionSavings.totalBalance > 0 ? 'active' : 'partial',
      amount: pensionSavings.monthlyPension || 0,
      description: '연금저축/보험 (55세부터)',
      badge: '3층'
    }
  ];

  const getColorClasses = (color, type = 'bg') => {
    const colors = {
      blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-500',
        text: 'text-blue-700',
        icon: 'text-blue-600'
      },
      green: {
        bg: 'bg-green-50',
        border: 'border-green-500',
        text: 'text-green-700',
        icon: 'text-green-600'
      },
      purple: {
        bg: 'bg-purple-50',
        border: 'border-purple-500',
        text: 'text-purple-700',
        icon: 'text-purple-600'
      }
    };
    return colors[color] || colors.blue;
  };

  // 접힌 상태 (한 줄 요약)
  if (isCollapsed) {
    return (
      <div
        className={`card-premium p-4 cursor-pointer hover:shadow-md transition-shadow ${className}`}
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">연금 준비 현황</div>
              <div className="text-xs text-gray-500">
                예상 월 수령액: <span className="font-semibold text-blue-600">
                  {totalMonthlyPension.toLocaleString()}원
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600">
              3층 구조
            </span>
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>
    );
  }

  // 펼쳐진 상태 (상세)
  return (
    <div className={`card-premium p-6 ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-subtitle font-semibold">3층 연금 구조</h3>
            <p className="text-caption text-gray-600">노후 준비 현황</p>
          </div>
        </div>
        <button
          onClick={onToggle}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronUp className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* 총 예상 수령액 */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-l-4 border-blue-500">
        <div className="text-sm text-gray-700 mb-1">은퇴 후 예상 월 수령액</div>
        <div className="text-2xl font-bold text-blue-700">
          {totalMonthlyPension.toLocaleString()}원
        </div>
        <div className="text-xs text-gray-600 mt-1">
          연간 약 {(totalMonthlyPension * 12 / 10000).toFixed(0)}만원
        </div>
      </div>

      {/* 3층 구조 시각화 (수평 스크롤 레이어 카드) */}
      <div className="mb-6">
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4">
            {/* Layer 1: 국민연금 */}
            <PensionLayerCard
              layer={1}
              title={layers[0].name}
              badge={layers[0].badge}
              status={layers[0].status}
              currentBalance={0} // 국민연금은 잔액 개념 없음
              expectedMonthlyPension={layers[0].amount}
              startAge={65}
              contributionYears={10}
            />

            {/* Layer 2: 퇴직연금 */}
            <PensionLayerCard
              layer={2}
              title={layers[1].name}
              badge={layers[1].badge}
              status={layers[1].status}
              currentBalance={(dcPension.totalBalance || 0) + (irp.totalBalance || 0)}
              expectedMonthlyPension={layers[1].amount}
              startAge={60}
              contributionYears={20}
            />

            {/* Layer 3: 개인연금 */}
            <PensionLayerCard
              layer={3}
              title={layers[2].name}
              badge={layers[2].badge}
              status={layers[2].status}
              currentBalance={pensionSavings.totalBalance || 0}
              expectedMonthlyPension={layers[2].amount}
              startAge={55}
              contributionYears={20}
            />
          </div>
        </div>
      </div>

      {/* 인포메이션 */}
      <div className="p-3 bg-blue-50 rounded-lg mb-4">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-700">
            <strong>3층 연금 구조</strong>는 안정적인 노후를 위한 기본 틀입니다.
            1층(국민연금), 2층(퇴직연금), 3층(개인연금)을 모두 갖추면 든든한 노후 준비가 가능합니다.
          </div>
        </div>
      </div>

      {/* 액션 버튼 */}
      <button
        onClick={onOpenFullDashboard}
        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        연금 상세 분석 보기
      </button>
    </div>
  );
};

export default ThreeLayerPensionCard;
