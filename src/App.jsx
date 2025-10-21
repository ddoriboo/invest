import React, { useState } from 'react';
import InvestmentDashboard from './InvestmentDashboard';
import StockIndexCard from './components/StockIndexCard';
import DividendCalendar from './components/DividendCalendar';
import PensionPage from './components/PensionPage';
import { FinancialProvider } from './contexts/FinancialContext';
import { ChevronLeft, ChevronRight, BarChart3, Zap, TrendingUp, AlertTriangle, Target, DollarSign, X, ArrowRight, Bell, CheckCircle, Building2 } from 'lucide-react';

// 좌측 사이드바 컴포넌트
const Sidebar = ({ activeMenu, setActiveMenu, isCollapsed, setIsCollapsed }) => {
  const menuItems = [
    { id: 'domestic', label: '국내주식' },
    { id: 'overseas', label: '해외주식' },
    { id: 'investment', label: '투자' },
    { id: 'pension', label: '연금', icon: Building2 },
    { id: 'dividend', label: '배당캘린더' }
  ];

  return (
    <div className={`h-full bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-full'
    }`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && <h2 className="text-xl font-bold text-gray-800">자산관리</h2>}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <nav className="flex-1 p-3">
        {menuItems.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              className={`w-full px-3 py-3 mb-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeMenu === item.id
                  ? 'bg-blue-50 text-blue-600 font-bold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
              title={isCollapsed ? item.label : ''}
            >
              {Icon && <Icon className="w-4 h-4" />}
              {isCollapsed ? (
                !Icon && <span className="block text-xs">{item.label.substring(0, 2)}</span>
              ) : (
                <span className={Icon ? '' : 'text-center block'}>{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            최종 업데이트
            <div className="text-gray-700 font-medium mt-1">
              {new Date().toLocaleString('ko-KR', {
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 우측 시장 현황 패널 컴포넌트
const MarketPanel = ({ isCollapsed, setIsCollapsed, focusedNudgeId, setFocusedNudgeId }) => {
  const [activeTab, setActiveTab] = useState('market'); // 'market' or 'nudge'
  const [dismissedNudges, setDismissedNudges] = useState(new Set());
  const marketData = {
    domestic: [
      {
        name: 'KOSPI',
        value: 2645.85,
        change: 12.30,
        changePercent: '+0.47%',
        isPositive: true,
        isOpen: true,
        lastUpdate: '15:30',
        chartData: [2640, 2635, 2642, 2650, 2645, 2648, 2645]
      },
      {
        name: 'KOSDAQ',
        value: 845.23,
        change: -5.42,
        changePercent: '-0.64%',
        isPositive: false,
        isOpen: true,
        lastUpdate: '15:30',
        chartData: [850, 848, 842, 840, 845, 847, 845]
      },
      {
        name: 'KOSPI200',
        value: 348.92,
        change: 2.15,
        changePercent: '+0.62%',
        isPositive: true,
        isOpen: true,
        lastUpdate: '15:30',
        chartData: [346, 345, 347, 349, 348, 349, 349]
      },
      {
        name: 'KRX 300',
        value: 1285.67,
        change: 8.45,
        changePercent: '+0.66%',
        isPositive: true,
        isOpen: true,
        lastUpdate: '15:30',
        chartData: [1280, 1275, 1282, 1288, 1285, 1287, 1286]
      }
    ],
    overseas: [
      {
        name: 'S&P 500',
        value: 4783.45,
        change: 23.80,
        changePercent: '+0.50%',
        isPositive: true,
        isOpen: false,
        lastUpdate: '04:00',
        chartData: [4760, 4755, 4770, 4785, 4780, 4785, 4783]
      },
      {
        name: 'NASDAQ',
        value: 15243.67,
        change: 87.23,
        changePercent: '+0.58%',
        isPositive: true,
        isOpen: false,
        lastUpdate: '04:00',
        chartData: [15200, 15180, 15220, 15260, 15240, 15250, 15244]
      },
      {
        name: 'DOW',
        value: 38456.12,
        change: -45.23,
        changePercent: '-0.12%',
        isPositive: false,
        isOpen: false,
        lastUpdate: '04:00',
        chartData: [38500, 38480, 38490, 38470, 38460, 38465, 38456]
      },
      {
        name: 'Nikkei 225',
        value: 32875.23,
        change: 187.45,
        changePercent: '+0.57%',
        isPositive: true,
        isOpen: false,
        lastUpdate: '15:00',
        chartData: [32700, 32650, 32750, 32900, 32850, 32890, 32875]
      }
    ],
    exchange: [
      { name: 'USD/KRW', value: '1,342.50', change: '+3.20', changePercent: '+0.24%', isPositive: true },
      { name: 'JPY/KRW', value: '8.95', change: '-0.02', changePercent: '-0.22%', isPositive: false }
    ],
    commodities: [
      { name: 'WTI', value: '$78.23', change: '+1.45', changePercent: '+1.89%', isPositive: true },
      { name: '금', value: '$2,045.30', change: '+12.40', changePercent: '+0.61%', isPositive: true }
    ]
  };

  const news = [
    { title: '삼성전자 3분기 실적 발표', time: '30분 전', isPositive: true },
    { title: '연준 금리 동결 가능성 상승', time: '1시간 전', isPositive: false },
    { title: 'SK하이닉스 HBM 수주 확대', time: '2시간 전', isPositive: true },
    { title: '코스피 2,650선 돌파', time: '3시간 전', isPositive: true },
    { title: '미중 무역갈등 심화 우려', time: '4시간 전', isPositive: false },
    { title: '국내 반도체 수출 급증', time: '5시간 전', isPositive: true }
  ];

  const fearGreedIndex = 72; // 0-100 scale

  // 넛지 데이터 (실제로는 분석 시스템에서 생성)
  const nudgeData = [
    {
      id: 'portfolio_concentration',
      type: 'warning',
      priority: 'HIGH',
      title: '포트폴리오 집중도 위험',
      message: 'IT 섹터 비중이 62%로 과도하게 집중되어 있어요',
      suggestion: '리스크 분산을 위해 다른 섹터 투자를 고려해보세요',
      icon: AlertTriangle,
      color: 'orange',
      actions: [
        { label: '추천 종목 보기', action: 'view_recommendations' },
        { label: '리밸런싱 계획', action: 'rebalance' }
      ],
      impact: '리스크 20% 감소 예상'
    },
    {
      id: 'cash_opportunity',
      type: 'opportunity',
      priority: 'MEDIUM',
      title: '유휴자금 활용 기회',
      message: '현금 보유 비율이 28%로 높아요',
      suggestion: '고배당주나 안정적인 투자처를 고려해보세요',
      icon: DollarSign,
      color: 'blue',
      actions: [
        { label: '고배당주 추천', action: 'view_dividend_stocks' },
        { label: '투자 계획', action: 'investment_plan' }
      ],
      impact: '연 112만원 추가 수익 가능'
    },
    {
      id: 'goal_behind',
      type: 'alert',
      priority: 'HIGH',
      title: '목표 달성 지연',
      message: '연간 목표 달성률이 67%로 예상보다 낮아요',
      suggestion: '월 투자금을 30만원 늘리면 목표 달성 가능해요',
      icon: Target,
      color: 'red',
      actions: [
        { label: '투자금 조정', action: 'adjust_amount' },
        { label: '목표 재검토', action: 'review_goal' }
      ],
      impact: '목표 달성 시기 3개월 단축'
    },
    {
      id: 'market_opportunity',
      type: 'timing',
      priority: 'HIGH',
      title: '매수 기회 포착',
      message: '코스피가 3.2% 하락했어요',
      suggestion: '평소 관심 종목 매수 타이밍일 수 있어요',
      icon: TrendingUp,
      color: 'green',
      actions: [
        { label: '관심종목 확인', action: 'check_watchlist' },
        { label: '매수 전략', action: 'buying_strategy' }
      ],
      impact: '장기 수익률 5-8% 개선'
    }
  ].filter(nudge => !dismissedNudges.has(nudge.id));

  // 포커스된 넛지가 있으면 자동으로 넛지 탭 활성화
  React.useEffect(() => {
    if (focusedNudgeId) {
      setActiveTab('nudge');
      setIsCollapsed(false);
      // 포커스 해제 (한 번만 실행)
      setTimeout(() => setFocusedNudgeId(null), 100);
    }
  }, [focusedNudgeId, setFocusedNudgeId]);

  if (isCollapsed) {
    return (
      <div className="w-12 h-full bg-white border-l border-gray-200 flex flex-col items-center">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 mt-4 hover:bg-gray-100 rounded-lg transition-colors"
          title="정보 패널 열기"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="mt-6 space-y-4">
          <div className="text-xs text-center">
            <div className="font-bold">KOS</div>
            <div className={`text-xs ${marketData.domestic[0].isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {marketData.domestic[0].changePercent}
            </div>
          </div>
          <div className="text-xs text-center">
            <div className="font-bold">S&P</div>
            <div className={`text-xs ${marketData.overseas[0].isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {marketData.overseas[0].changePercent}
            </div>
          </div>
          {nudgeData.length > 0 && (
            <div className="mt-6">
              <div className="w-6 h-6 mx-auto bg-red-500 rounded-full flex items-center justify-center">
                <Bell className="w-3 h-3 text-white" />
              </div>
              <div className="text-xs text-center mt-1 font-medium text-red-600">
                {nudgeData.length}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 넛지 액션 핸들러
  const handleNudgeAction = (nudgeId, action) => {
    console.log(`Nudge action: ${action} for ${nudgeId}`);
    // 실제 액션 구현 (라우팅, 모달 열기 등)
  };

  const handleDismissNudge = (nudgeId) => {
    setDismissedNudges(prev => new Set([...prev, nudgeId]));
  };

  // 넛지 카드 컴포넌트
  const NudgeCard = ({ nudge, isFocused = false }) => {
    const getColorClasses = (color) => {
      switch (color) {
        case 'red':
          return {
            bg: 'bg-red-50',
            text: 'text-red-700',
            border: 'border-red-200',
            button: 'bg-red-100 text-red-700 hover:bg-red-200'
          };
        case 'orange':
          return {
            bg: 'bg-orange-50',
            text: 'text-orange-700',
            border: 'border-orange-200',
            button: 'bg-orange-100 text-orange-700 hover:bg-orange-200'
          };
        case 'blue':
          return {
            bg: 'bg-blue-50',
            text: 'text-blue-700',
            border: 'border-blue-200',
            button: 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          };
        case 'green':
          return {
            bg: 'bg-green-50',
            text: 'text-green-700',
            border: 'border-green-200',
            button: 'bg-green-100 text-green-700 hover:bg-green-200'
          };
        default:
          return {
            bg: 'bg-gray-50',
            text: 'text-gray-700',
            border: 'border-gray-200',
            button: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          };
      }
    };

    const colors = getColorClasses(nudge.color);
    const Icon = nudge.icon;

    return (
      <div className={`p-3 rounded-lg border ${colors.border} ${colors.bg} relative transition-all ${
        isFocused ? 'ring-2 ring-blue-500 ring-opacity-50 shadow-lg scale-[1.02]' : ''
      }`}>
        <button
          onClick={() => handleDismissNudge(nudge.id)}
          className="absolute top-2 right-2 p-0.5 hover:bg-white/60 rounded-full transition-colors"
        >
          <X className="w-3 h-3 text-gray-400" />
        </button>

        <div className="flex items-start gap-2 mb-2">
          <Icon className={`w-4 h-4 mt-0.5 ${colors.text}`} />
          <div className="flex-1 pr-4">
            <h5 className={`text-xs font-semibold ${colors.text} mb-1`}>
              {nudge.title}
            </h5>
            <p className="text-xs text-gray-600 mb-1 leading-tight">
              {nudge.message}
            </p>
            <p className="text-xs text-gray-700 mb-2 leading-tight">
              💡 {nudge.suggestion}
            </p>
          </div>
        </div>

        <div className="mb-2 p-2 bg-white/70 rounded text-xs">
          <div className="flex items-center gap-1 mb-1">
            <BarChart3 className="w-3 h-3 text-green-600" />
            <span className="font-medium text-gray-600">예상 효과</span>
          </div>
          <p className="text-gray-700">{nudge.impact}</p>
        </div>

        <div className="space-y-1">
          {nudge.actions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleNudgeAction(nudge.id, action.action)}
              className={`w-full px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                index === 0 ? colors.button : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {action.label}
              {index === 0 && <ArrowRight className="w-3 h-3 inline ml-1" />}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full bg-white border-l border-gray-200 overflow-y-auto">
      {/* 헤더 */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-bold text-gray-800">정보 패널</h3>
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* 탭 버튼 */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('market')}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'market'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-1" />
            시장 현황
          </button>
          <button
            onClick={() => setActiveTab('nudge')}
            className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors relative ${
              activeTab === 'nudge'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Zap className="w-4 h-4 inline mr-1" />
            추천 액션
            {nudgeData.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {nudgeData.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      {activeTab === 'market' ? (
        <>
          {/* 주요 뉴스 - 최상단으로 이동 */}
          <div className="p-3 border-b border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">주요 뉴스</h4>
            <div className="space-y-2">
              {news.map((item, idx) => (
                <div key={idx} className="p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                  <div className="flex items-start gap-2">
                    <div className={`w-2 h-2 rounded-full mt-1 ${
                      item.isPositive
                        ? 'bg-red-500 animate-pulse'
                        : 'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-xs text-gray-700 leading-tight">{item.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{item.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 국내 증시 - 2x2 그리드 */}
          <div className="p-3 border-b border-gray-200">
            <h4 className="text-body font-semibold mb-3" style={{color: 'var(--text-primary)'}}>국내 증시</h4>
            <div className="grid grid-cols-2 gap-2">
              {marketData.domestic.map((item, idx) => (
                <StockIndexCard
                  key={idx}
                  title={item.name}
                  value={item.value}
                  change={item.change}
                  changePercent={item.changePercent}
                  isOpen={item.isOpen}
                  lastUpdate={item.lastUpdate}
                  chartData={item.chartData}
                  compact={true}
                />
              ))}
            </div>
          </div>

          {/* 해외 증시 - 2x2 그리드 */}
          <div className="p-3 border-b border-gray-200">
            <h4 className="text-body font-semibold mb-3" style={{color: 'var(--text-primary)'}}>해외 증시</h4>
            <div className="grid grid-cols-2 gap-2">
              {marketData.overseas.map((item, idx) => (
                <StockIndexCard
                  key={idx}
                  title={item.name}
                  value={item.value}
                  change={item.change}
                  changePercent={item.changePercent}
                  isOpen={item.isOpen}
                  lastUpdate={item.lastUpdate}
                  chartData={item.chartData}
                  compact={true}
                />
              ))}
            </div>
          </div>

          {/* 환율 - 컴팩트 */}
          <div className="p-3 border-b border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">환율</h4>
            <div className="grid grid-cols-2 gap-2">
              {marketData.exchange.map((item, idx) => (
                <div key={idx} className="p-2 bg-gray-50 rounded-lg">
                  <div className="text-xs font-medium text-gray-700 mb-1">{item.name}</div>
                  <div className="text-sm font-semibold text-gray-900">{item.value}</div>
                  <div className={`text-xs ${item.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {item.change}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 원자재 - 컴팩트 */}
          <div className="p-3 border-b border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">원자재</h4>
            <div className="grid grid-cols-2 gap-2">
              {marketData.commodities.map((item, idx) => (
                <div key={idx} className="p-2 bg-gray-50 rounded-lg">
                  <div className="text-xs font-medium text-gray-700 mb-1">{item.name}</div>
                  <div className="text-sm font-semibold text-gray-900">{item.value}</div>
                  <div className={`text-xs ${item.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {item.change}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fear & Greed Index - 컴팩트 */}
          <div className="p-3">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">공포 탐욕 지수</h4>
            <div className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-2 rounded-full relative mb-2">
              <div
                className="absolute w-3 h-3 bg-white border-2 border-gray-800 rounded-full -top-0.5"
                style={{ left: `${fearGreedIndex}%`, marginLeft: '-6px' }}
              />
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-red-600">공포</span>
              <span className="text-sm font-bold text-gray-800">{fearGreedIndex}</span>
              <span className="text-xs text-green-600">탐욕</span>
            </div>
          </div>
        </>
      ) : (
        /* 넛지 섹션 */
        <div className="p-4">
          {nudgeData.length > 0 ? (
            <>
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">오늘의 추천 액션</h4>
                <p className="text-xs text-gray-600">
                  포트폴리오 분석 결과를 바탕으로 개인화된 조언을 제공합니다
                </p>
              </div>
              <div className="space-y-3">
                {nudgeData.map((nudge) => (
                  <NudgeCard
                    key={nudge.id}
                    nudge={nudge}
                    isFocused={focusedNudgeId === nudge.id}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 mx-auto mb-3" style={{color: 'var(--accent-green)'}} />
              <h4 className="text-sm font-semibold mb-2" style={{color: 'var(--text-primary)'}}>
                훌륭해요!
              </h4>
              <p className="text-xs" style={{color: 'var(--text-secondary)'}}>
                현재 포트폴리오가 건강한 상태입니다. 계속 좋은 투자를 이어가세요.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// 국내주식 컴포넌트 (placeholder)
const DomesticStocks = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">국내주식</h1>
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <p className="text-gray-600">국내주식 상세 정보가 여기에 표시됩니다.</p>
      </div>
    </div>
  );
};

// 해외주식 컴포넌트 (placeholder)
const OverseasStocks = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">해외주식</h1>
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <p className="text-gray-600">해외주식 상세 정보가 여기에 표시됩니다.</p>
      </div>
    </div>
  );
};


// 메인 App 컴포넌트
const App = () => {
  const [activeMenu, setActiveMenu] = useState('investment');
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [focusedNudgeId, setFocusedNudgeId] = useState(null);

  const renderContent = () => {
    switch(activeMenu) {
      case 'domestic':
        return <DomesticStocks />;
      case 'overseas':
        return <OverseasStocks />;
      case 'pension':
        return <PensionPage />;
      case 'dividend':
        return <DividendCalendar />;
      case 'investment':
      default:
        return <InvestmentDashboard activeMenu={activeMenu} setActiveMenu={setActiveMenu} setFocusedNudgeId={setFocusedNudgeId} />;
    }
  };

  return (
    <FinancialProvider>
      <div className="flex h-screen bg-gray-50">
        {/* 좌측 사이드바 */}
        <div className={`transition-all duration-300 ${
          leftSidebarCollapsed ? 'w-16' : 'w-[180px]'
        }`}>
          <Sidebar
            activeMenu={activeMenu}
            setActiveMenu={setActiveMenu}
            isCollapsed={leftSidebarCollapsed}
            setIsCollapsed={setLeftSidebarCollapsed}
          />
        </div>

        {/* 중앙 메인 콘텐츠 */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="max-w-full mx-auto">
            {renderContent()}
          </div>
        </div>

        {/* 우측 시장 현황 패널 */}
        <div className={`transition-all duration-300 ${
          rightPanelCollapsed ? 'w-12' : 'w-[280px]'
        }`}>
          <MarketPanel
            isCollapsed={rightPanelCollapsed}
            setIsCollapsed={setRightPanelCollapsed}
            focusedNudgeId={focusedNudgeId}
            setFocusedNudgeId={setFocusedNudgeId}
          />
        </div>
      </div>
    </FinancialProvider>
  );
};

export default App;