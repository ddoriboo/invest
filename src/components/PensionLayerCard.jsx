import React from 'react';
import { Building2, Briefcase, PiggyBank } from 'lucide-react';

/**
 * 3층 연금 구조를 시각화하는 레이어 카드 컴포넌트
 * 40대 운용단계 디자인 참고
 */
const PensionLayerCard = ({
  layer = 1, // 1: 국민연금, 2: 퇴직연금, 3: 개인연금
  title = '',
  badge = '',
  status = 'normal', // 'normal' | 'warning'
  currentBalance = 0,
  expectedMonthlyPension = 0,
  startAge = 65,
  contributionYears = 0,
  className = ''
}) => {
  // 층별 설정
  const layerConfig = {
    1: {
      icon: Building2,
      color: '#5B8DEF',
      bgGradient: 'linear-gradient(135deg, #E8F0FF 0%, #F0F6FF 100%)',
      badgeGradient: 'linear-gradient(90deg, #5B8DEF 0%, #7BA3F5 100%)',
      borderColor: '#5B8DEF'
    },
    2: {
      icon: Briefcase,
      color: '#FFA226',
      bgGradient: 'linear-gradient(135deg, #FFF4E8 0%, #FFF8F0 100%)',
      badgeGradient: 'linear-gradient(90deg, #FFA226 0%, #FFB854 100%)',
      borderColor: '#FFA226'
    },
    3: {
      icon: PiggyBank,
      color: '#00DE5A',
      bgGradient: 'linear-gradient(135deg, #E8FFF0 0%, #F0FFF5 100%)',
      badgeGradient: 'linear-gradient(90deg, #00DE5A 0%, #2EE87A 100%)',
      borderColor: '#00DE5A'
    }
  };

  const config = layerConfig[layer];
  const Icon = config.icon;

  const formatCurrency = (amount) => {
    if (amount >= 100000000) {
      return `${(amount / 100000000).toFixed(1)}억원`;
    } else if (amount >= 10000) {
      return `${(amount / 10000).toFixed(0)}만원`;
    }
    return `${amount.toLocaleString()}원`;
  };

  return (
    <div
      className={`flex-shrink-0 w-[322px] h-[180px] bg-white rounded-xl overflow-hidden transition-all hover:translate-y-[-2px] hover:shadow-lg ${className}`}
      style={{
        border: `1px solid ${config.borderColor}`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}
    >
      {/* 헤더 (120px) */}
      <div
        className="w-[120px] h-[180px] p-4 float-left flex flex-col items-center justify-center border-r border-gray-200"
      >
        {/* 아이콘 */}
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center mb-1.5"
          style={{ background: config.bgGradient }}
        >
          <Icon className="w-[18px] h-[18px]" style={{ color: config.color }} />
        </div>

        {/* 뱃지 */}
        <div
          className="text-[8px] font-bold px-1.5 py-0.5 rounded-lg mb-1"
          style={{
            background: config.badgeGradient,
            color: 'white',
            letterSpacing: '0.3px'
          }}
        >
          {badge}
        </div>

        {/* 타이틀 */}
        <div className="text-xs font-bold text-gray-800 mb-1 text-center">
          {title}
        </div>

        {/* 상태 */}
        <div
          className={`text-[8px] font-semibold px-1.5 py-0.5 rounded-lg ${
            status === 'normal'
              ? 'bg-blue-50 text-blue-600'
              : 'bg-orange-50 text-orange-600'
          }`}
        >
          {status === 'normal' ? '정상' : '개선필요'}
        </div>
      </div>

      {/* 컨텐츠 (202px) */}
      <div className="ml-[120px] h-full p-4 flex flex-col justify-between">
        {/* 메인 정보 */}
        <div>
          <div className="text-[9px] text-gray-500 mb-0.5">현재 잔액</div>
          <div className="text-base font-bold text-gray-900 mb-1">
            {formatCurrency(currentBalance)}
          </div>
          <div className="text-[9px] text-gray-600">
            {contributionYears > 0 ? `가입 ${contributionYears}년` : '미가입'}
          </div>
        </div>

        {/* 추가 정보 */}
        <div className="bg-gray-50 rounded p-1.5">
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-[9px] text-gray-600">예상 수령액</span>
            <span className="text-xs font-semibold text-gray-800">
              {formatCurrency(expectedMonthlyPension)}/월
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[9px] text-gray-600">수령 시작</span>
            <span className="text-[9px] text-gray-700">{startAge}세부터</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PensionLayerCard;
