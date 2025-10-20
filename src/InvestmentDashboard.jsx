import React, { useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, BarChart3, Settings, ArrowLeft, ChevronDown, ChevronUp, Target, Zap, AlertTriangle, DollarSign } from 'lucide-react';
import IntelligentGoalWizard from './components/IntelligentGoalWizard';
import GoalTrackingDashboard from './components/GoalTrackingDashboard';
import NudgeCarousel from './components/NudgeCarousel';

// 공통 데이터 및 유틸리티
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ko-KR').format(amount);
};

const formatPercentage = (rate) => {
  return rate >= 0 ? `+${rate.toFixed(1)}%` : `${rate.toFixed(1)}%`;
};

// 1. 헤더 모듈
const Header = ({ timeRange, setTimeRange }) => {
  return (
    <div className="flex justify-between items-center mb-10">
      <h1 className="text-display">내 자산 현황</h1>
      <div className="flex gap-4 items-center">
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-3 card-premium text-body border-0 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          style={{color: 'var(--text-primary)'}}
        >
          <option value="daily">일간</option>
          <option value="weekly">주간</option>
          <option value="monthly">월간</option>
          <option value="quarterly">분기</option>
          <option value="yearly">연간</option>
        </select>
        <button className="p-3 card-premium hover:scale-105 transition-transform">
          <Settings className="w-6 h-6" style={{color: 'var(--text-secondary)'}} />
        </button>
      </div>
    </div>
  );
};

// 2. 총 자산 박스 모듈
const TotalAssetBox = ({
  totalAssets,
  returnPeriod,
  setReturnPeriod,
  marketIndices,
  goalType,
  setGoalType,
  monthlyDividend,
  currentReturn,
  setActiveView,
  monthlyRealizedData,
  userGoals,
  setShowGoalWizard,
  setActiveMenu
}) => {
  // 기간별 데이터 설정
  const getPeriodData = () => {
    const baseData = {
      daily: {
        title: '일',
        returnTitle: '일 수익률',
        dividendTitle: '일 배당 수익', 
        realizedTitle: '일 실현 수익',
        returnValue: currentReturn.return,
        returnRate: currentReturn.rate,
        dividendValue: Math.round(monthlyDividend / 30),
        realizedValue: Math.round(monthlyRealizedData.reduce((sum, month) => sum + month.realizedGain, 0) / 365)
      },
      monthly: {
        title: '월',
        returnTitle: '월 수익률',
        dividendTitle: '월 배당 수익',
        realizedTitle: '월 실현 수익', 
        returnValue: currentReturn.return,
        returnRate: currentReturn.rate,
        dividendValue: monthlyDividend,
        realizedValue: Math.round(monthlyRealizedData.reduce((sum, month) => sum + month.realizedGain, 0) / 12)
      },
      yearly: {
        title: '연간',
        returnTitle: '연간 수익률',
        dividendTitle: '연간 배당 수익',
        realizedTitle: '연간 실현 수익',
        returnValue: currentReturn.return,
        returnRate: currentReturn.rate,
        dividendValue: monthlyDividend * 12,
        realizedValue: monthlyRealizedData.reduce((sum, month) => sum + month.realizedGain, 0)
      }
    };
    return baseData[returnPeriod];
  };

  const periodData = getPeriodData();
  
  // 시장 비교 메시지
  const getMarketComparisonMessage = () => {
    const userReturn = currentReturn.rate;
    const marketReturn = returnPeriod === 'monthly' ? 2.3 : returnPeriod === 'daily' ? 0.08 : 14.2; // S&P 500 기준
    
    if (userReturn > marketReturn) {
      return {
        message: `S&P 500 대비 +${(userReturn - marketReturn).toFixed(1)}%p 우수`,
        color: 'text-green-600',
        icon: '📈'
      };
    } else {
      return {
        message: `S&P 500 대비 ${(userReturn - marketReturn).toFixed(1)}%p 개선 필요`,
        color: 'text-orange-600', 
        icon: '📊'
      };
    }
  };

  const marketComparison = getMarketComparisonMessage();
  
  // 월소득 대비 배당 비율
  const dividendToIncomeRatio = returnPeriod === 'monthly' 
    ? ((monthlyDividend / marketIndices.currentMonthlyIncome) * 100).toFixed(1)
    : returnPeriod === 'daily'
    ? (((monthlyDividend / 30) / (marketIndices.currentMonthlyIncome / 30)) * 100).toFixed(1)
    : (((monthlyDividend * 12) / (marketIndices.currentMonthlyIncome * 12)) * 100).toFixed(1);

  // 실현 수익 재투자 기대수익 계산 (연 12% 가정)
  const getReInvestmentReturn = () => {
    const annualRate = 0.12;
    const realizedAmount = monthlyRealizedData.reduce((sum, month) => sum + month.realizedGain, 0);
    
    const expectedReturns = {
      daily: Math.round((realizedAmount * annualRate) / 365),
      monthly: Math.round((realizedAmount * annualRate) / 12),
      yearly: Math.round(realizedAmount * annualRate)
    };
    
    return expectedReturns[returnPeriod];
  };

  const reinvestmentReturn = getReInvestmentReturn();

  return (
    <div className="card-premium p-8 mb-6">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-title">총 자산</h2>

        <div className="flex rounded-lg p-1" style={{background: 'var(--bg-secondary)'}}>
          <button
            onClick={() => setReturnPeriod('daily')}
            className={`px-4 py-2 rounded-md text-caption font-medium transition-all ${
              returnPeriod === 'daily'
                ? 'bg-white shadow-sm'
                : 'hover:bg-white/50'
            }`}
            style={{
              color: returnPeriod === 'daily' ? 'var(--accent-blue)' : 'var(--text-secondary)'
            }}
          >
            일별
          </button>
          <button
            onClick={() => setReturnPeriod('monthly')}
            className={`px-4 py-2 rounded-md text-caption font-medium transition-all ${
              returnPeriod === 'monthly'
                ? 'bg-white shadow-sm'
                : 'hover:bg-white/50'
            }`}
            style={{
              color: returnPeriod === 'monthly' ? 'var(--accent-blue)' : 'var(--text-secondary)'
            }}
          >
            월별
          </button>
          <button
            onClick={() => setReturnPeriod('yearly')}
            className={`px-4 py-2 rounded-md text-caption font-medium transition-all ${
              returnPeriod === 'yearly'
                ? 'bg-white shadow-sm'
                : 'hover:bg-white/50'
            }`}
            style={{
              color: returnPeriod === 'yearly' ? 'var(--accent-blue)' : 'var(--text-secondary)'
            }}
          >
            연간
          </button>
        </div>
      </div>
      
      <div className="mb-8">
        <div className="text-display text-number mb-2" style={{fontSize: '3rem', lineHeight: '1.1'}}>
          {formatCurrency(totalAssets)}
          <span className="text-lg ml-2" style={{color: 'var(--text-secondary)'}}>원</span>
        </div>
      </div>

      {/* 목표 달성 현황 - 향상된 버전 */}
      <div className="relative overflow-hidden rounded-xl p-4 mb-6" style={{
        background: 'linear-gradient(135deg, var(--chart-blue-bg) 0%, var(--bg-secondary) 100%)',
        border: '1px solid var(--border-light)'
      }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6" style={{color: 'var(--accent-green)'}} />
            <h3 className="text-subtitle">나의 목표</h3>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveView('goal-tracking')}
              className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100 transition-colors"
            >
              <BarChart3 className="w-3 h-3 inline mr-1" />
              목표 관리
            </button>
            <button
              onClick={() => setShowGoalWizard(true)}
              className="px-3 py-1.5 rounded-lg bg-green-50 text-green-600 text-xs font-medium hover:bg-green-100 transition-colors"
            >
              <Zap className="w-3 h-3 inline mr-1" />
              목표 설정
            </button>
          </div>
        </div>

        {userGoals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userGoals.slice(0, 2).map((goal) => {
              const currentValue = goal.type === 'asset' ? totalAssets : monthlyDividend;
              const achievementRate = (currentValue / goal.targetAmount) * 100;
              const remainingTime = Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24));

              return (
                <div key={goal.id} className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/20 relative">
                  {/* 목표 타입 태그 */}
                  <div className={`absolute -top-2 -right-1 px-2 py-1 rounded-full text-xs font-medium ${
                    goal.type === 'asset'
                      ? 'bg-blue-300 text-blue-800'
                      : goal.type === 'dividend'
                      ? 'bg-green-300 text-green-800'
                      : 'bg-purple-300 text-purple-800'
                  }`}>
                    {goal.type === 'asset' ? '자산늘리기' :
                     goal.type === 'dividend' ? '배당늘리기' : '하이브리드'}
                  </div>

                  <div className="flex items-center justify-between mb-2 mt-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-800 text-sm truncate">{goal.name}</h4>
                      <p className="text-xs text-gray-600 truncate">{goal.description}</p>
                    </div>
                    <div className="text-right ml-2">
                      <div className="text-xl font-bold" style={{color: goal.type === 'asset' ? 'var(--accent-blue)' : 'var(--accent-green)'}}>
                        {achievementRate.toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  <div className="mb-2">
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(achievementRate, 100)}%`,
                          background: goal.type === 'asset'
                            ? 'linear-gradient(90deg, var(--accent-blue), #3b82f6)'
                            : 'linear-gradient(90deg, var(--accent-green), #22c55e)'
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-gray-500">현재</div>
                      <div className="font-semibold text-gray-800">{formatCurrency(currentValue)}원</div>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-500">목표까지</div>
                      <div className="font-semibold text-gray-800">{Math.ceil(remainingTime/365)}년</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-4">
            <Target className="w-8 h-8 mx-auto mb-2" style={{color: 'var(--text-tertiary)'}} />
            <h4 className="text-sm font-semibold mb-1" style={{color: 'var(--text-secondary)'}}>
              설정된 목표가 없습니다
            </h4>
            <p className="text-xs mb-3" style={{color: 'var(--text-tertiary)'}}>
              AI 기반 목표 설정으로 체계적인 투자 계획을 세워보세요
            </p>
            <button
              onClick={() => setShowGoalWizard(true)}
              className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
            >
              <Zap className="w-3 h-3 inline mr-1" />
              첫 목표 설정하기
            </button>
          </div>
        )}
      </div>

      {/* 3개 버튼 - 기간별 동적 변경 */}
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => setActiveView('monthly-returns')}
          className="card-premium p-4 text-left transition-all hover:scale-[1.02] hover:shadow-lg group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-body font-semibold" style={{color: 'var(--accent-blue)'}}>
              {periodData.returnTitle}
            </h3>
            <TrendingUp className="w-5 h-5" style={{color: 'var(--accent-blue)'}} />
          </div>
          <div className="text-subtitle text-number mb-2" style={{color: 'var(--accent-blue)'}}>
            {formatPercentage(periodData.returnRate)}
          </div>
          <div className="text-caption mb-4" style={{color: 'var(--text-secondary)'}}>
            {formatCurrency(periodData.returnValue)}원
          </div>

          {/* 시장 비교 정보 */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:shadow-md cursor-pointer ${
            marketComparison.color === 'text-green-600'
              ? 'bg-blue-50 hover:bg-blue-100'
              : 'bg-red-50 hover:bg-red-100'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              marketComparison.color === 'text-green-600' ? 'bg-blue-500' : 'bg-red-500'
            }`}></div>
            <span className="text-xs font-medium" style={{
              color: marketComparison.color === 'text-green-600' ? 'var(--accent-blue)' : 'var(--accent-red)'
            }}>{marketComparison.message}</span>
          </div>
        </button>

        <button
          onClick={() => setActiveMenu('dividend')}
          className="card-premium p-4 text-left transition-all hover:scale-[1.02] hover:shadow-lg group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-body font-semibold" style={{color: 'var(--accent-green)'}}>
              {periodData.dividendTitle}
            </h3>
            <TrendingUp className="w-5 h-5" style={{color: 'var(--accent-green)'}} />
          </div>
          <div className="text-subtitle text-number mb-2" style={{color: 'var(--accent-green)'}}>
            {formatCurrency(periodData.dividendValue)}원
          </div>
          <div className="text-caption mb-4" style={{color: 'var(--text-secondary)'}}>
            {returnPeriod === 'yearly' ? '연간 배당 수익' :
             returnPeriod === 'daily' ? '일 배당 수익' : '월 배당 수익'}
          </div>

          {/* 월소득 대비 비율 */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 hover:bg-green-100 transition-all hover:shadow-md cursor-pointer">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-xs font-medium" style={{color: 'var(--accent-green)'}}>
              월소득 대비 {dividendToIncomeRatio}%
            </span>
          </div>
        </button>

        <button
          onClick={() => setActiveView('realized')}
          className="card-premium p-4 text-left transition-all hover:scale-[1.02] hover:shadow-lg group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-body font-semibold" style={{color: 'var(--accent-purple)'}}>
              {periodData.realizedTitle}
            </h3>
            <TrendingUp className="w-5 h-5" style={{color: 'var(--accent-purple)'}} />
          </div>
          <div className="text-subtitle text-number mb-2" style={{color: 'var(--accent-purple)'}}>
            {formatCurrency(periodData.realizedValue)}원
          </div>
          <div className="text-caption mb-4" style={{color: 'var(--text-secondary)'}}>
            {returnPeriod === 'yearly' ? '연간 총 실현 수익' :
             returnPeriod === 'daily' ? '일 평균 실현 수익' : '월 평균 실현 수익'}
          </div>

          {/* 실현 수익 정보 */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-50 hover:bg-purple-100 transition-all hover:shadow-md cursor-pointer">
            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
            <span className="text-xs font-medium" style={{color: 'var(--accent-purple)'}}>
              전체 수익의 {((periodData.realizedValue / (periodData.returnValue + periodData.realizedValue + periodData.dividendValue)) * 100).toFixed(0)}%
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};

// 3. 인사이트 밴드 모듈
const InsightBand = ({ nudgeData, currentWisdom }) => {
  return (
    <div className="card-premium p-5 mb-6" style={{
      background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-secondary) 100%)'
    }}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full animate-pulse-soft" style={{background: 'var(--accent-green)'}}></div>
            <h3 className="text-lg font-semibold">투자 성장 하이라이트</h3>
          </div>
          <div className="space-y-3">
            {nudgeData.motivation.map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/50 transition-colors">
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm" style={{color: 'var(--text-primary)'}}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pl-6" style={{borderLeft: '1px solid var(--border-light)'}}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full" style={{background: 'var(--accent-blue)'}}></div>
            <h3 className="text-lg font-semibold">이주의 투자 지혜</h3>
          </div>
          <div className="card-premium p-4" style={{
            borderLeft: '4px solid var(--accent-blue)'
          }}>
            <div className="text-sm mb-3 italic leading-relaxed" style={{color: 'var(--text-primary)'}}>
              "{nudgeData.wisdom[currentWisdom].text}"
            </div>
            <div className="text-xs font-medium" style={{color: 'var(--accent-blue)'}}>
              - {nudgeData.wisdom[currentWisdom].author}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 4. 자산 구성 차트 박스 모듈
const AssetCompositionBox = ({ 
  portfolioData, 
  totalAssets, 
  includeRealEstate, 
  setIncludeRealEstate,
  expandedAsset,
  setExpandedAsset,
  detailStocks,
  nudgeData,
  recommendedProducts 
}) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-700">자산 구성</h3>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="includeRealEstate"
            checked={includeRealEstate}
            onChange={(e) => setIncludeRealEstate(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="includeRealEstate" className="text-sm text-gray-700 cursor-pointer">
            부동산 포함
          </label>
        </div>
      </div>

      {/* 행동 패턴 분석 */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${nudgeData.behaviorAnalysis.holdingPeriod.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
            <span className="text-gray-600">{nudgeData.behaviorAnalysis.holdingPeriod.message}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${nudgeData.behaviorAnalysis.tradingFreq.status === 'good' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <span className="text-gray-600">{nudgeData.behaviorAnalysis.tradingFreq.message}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${nudgeData.behaviorAnalysis.diversification.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
            <span className="text-gray-600">{nudgeData.behaviorAnalysis.diversification.message}</span>
          </div>
        </div>
      </div>
      
      {/* 파이 차트 */}
      <div className="h-64 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={portfolioData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              label={({name, percent}) => `${name} ${(percent * 100).toFixed(1)}%`}
              labelLine={false}
            >
              {portfolioData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${formatCurrency(value)}원`, '']} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* 자산 상세 리스트 */}
      <div className="space-y-3">
        {portfolioData.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm font-medium text-gray-700">{item.name}</span>
                {item.name !== '부동산' && (
                  <button
                    onClick={() => setExpandedAsset(expandedAsset === item.name ? null : item.name)}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    {expandedAsset === item.name ? 
                      <ChevronUp className="w-4 h-4" /> : 
                      <ChevronDown className="w-4 h-4" />
                    }
                  </button>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-900">
                  {formatCurrency(item.value)}원
                </div>
                <div className="text-xs text-gray-500">
                  {((item.value / totalAssets) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
            
            {expandedAsset === item.name && detailStocks[item.name] && (
              <div className="mt-2 ml-6 space-y-2 bg-gray-50 rounded-lg p-3">
                {detailStocks[item.name].map((stock, stockIndex) => (
                  <div key={stockIndex} className="flex justify-between items-center text-xs">
                    <span className="text-gray-600">{stock.name}</span>
                    {stock.price ? (
                      <div className="text-right">
                        <div>{formatCurrency(stock.price)}원</div>
                        <div className="text-gray-500">{stock.shares}주</div>
                      </div>
                    ) : (
                      <div className="text-gray-600">
                        {formatCurrency(stock.value)}원
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 추천 투자상품 */}
      <div className="mt-6 border-t pt-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-base font-semibold text-gray-700">추천 투자상품</h4>
          <div className="flex gap-2">
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">높은수익률</span>
            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">많이본상품</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <div className="flex gap-3 pb-2" style={{ width: 'max-content' }}>
            {recommendedProducts.map((product, index) => (
              <div key={index} className="flex-shrink-0 w-48 bg-gray-50 rounded-lg p-3 border hover:bg-gray-100 transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-semibold text-gray-800">{product.name}</div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    product.category === '높은수익률' 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-green-100 text-green-600'
                  }`}>
                    {product.category}
                  </span>
                </div>
                
                <div className="text-xs text-gray-600 mb-2">{product.description}</div>
                
                <div className="flex justify-between items-center mb-2">
                  <div className="text-xs text-gray-500">수익률</div>
                  <div className="text-sm font-bold text-green-600">+{product.returnRate}%</div>
                </div>
                
                <div className="flex justify-between items-center mb-2">
                  <div className="text-xs text-gray-500">위험도</div>
                  <div className={`text-xs px-2 py-1 rounded ${
                    product.riskLevel === '낮음' ? 'bg-green-100 text-green-700' :
                    product.riskLevel === '중간' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {product.riskLevel}
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 mb-3">
                  최소투자: {formatCurrency(product.minAmount)}원
                </div>
                
                <button className="w-full text-xs py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                  관심상품 추가
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="text-center mt-2">
          <button className="text-sm text-blue-600 hover:text-blue-800">
            더 많은 상품 보기 →
          </button>
        </div>
      </div>
    </div>
  );
};

// 5. 자산 증가 추이 박스 모듈  
const AssetTrendBox = ({ assetTrendData, nudgeData }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-700">자산 증가 추이</h3>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={assetTrendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => `${value/10000000}천만`} />
            <Tooltip 
              formatter={(value, name) => [`${formatCurrency(value)}원`, name]} 
              labelFormatter={(label) => `${label}`}
            />
            <Bar dataKey="국내주식" stackId="a" fill="#3B82F6" />
            <Bar dataKey="해외주식" stackId="a" fill="#10B981" />
            <Bar dataKey="ETF" stackId="a" fill="#F59E0B" />
            <Bar dataKey="채권" stackId="a" fill="#EF4444" />
            <Bar dataKey="예금" stackId="a" fill="#8B5CF6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">지난 6개월 증가</div>
          <div className="text-lg font-semibold text-green-600">
            +{formatCurrency(17000000)}원
          </div>
        </div>

        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <h4 className="text-sm font-semibold text-blue-800">이번 달 체크포인트</h4>
          </div>
          <div className="space-y-1">
            {nudgeData.actionItems.slice(0, 2).map((item, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${
                  item.priority === 'high' ? 'bg-red-400' : 
                  item.priority === 'medium' ? 'bg-yellow-400' : 'bg-gray-400'
                }`}></div>
                <span className="text-xs text-gray-700 leading-tight">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// 메인 대시보드 컴포넌트
const InvestmentDashboard = ({ activeMenu, setActiveMenu, setFocusedNudgeId }) => {
  const [timeRange, setTimeRange] = useState('monthly');
  const [activeView, setActiveView] = useState('main');
  const [includeRealEstate, setIncludeRealEstate] = useState(false);
  const [returnPeriod, setReturnPeriod] = useState('monthly');
  const [expandedAsset, setExpandedAsset] = useState(null);
  const [selectedDividendMonth, setSelectedDividendMonth] = useState(null);
  const [selectedRealizedMonth, setSelectedRealizedMonth] = useState(null);
  const [goalType, setGoalType] = useState('asset');
  const [showGoalWizard, setShowGoalWizard] = useState(false);
  const [userGoals, setUserGoals] = useState([
    {
      id: 'goal-1',
      name: '은퇴 자산 2억 달성',
      description: '안정적인 은퇴를 위한 자산 목표',
      type: 'asset',
      targetAmount: 200000000,
      targetDate: '2029-12-31',
      createdAt: '2024-01-01',
      status: 'active'
    },
    {
      id: 'goal-2',
      name: '월 배당 200만원 달성',
      description: '배당소득으로 월 생활비 충당',
      type: 'dividend',
      targetAmount: 2000000,
      targetDate: '2034-12-31',
      createdAt: '2024-01-01',
      status: 'active'
    }
  ]);

  // 데이터 정의
  const nudgeData = {
    motivation: [
      { text: "작년 대비 분산투자 23% 개선", icon: "📈", type: "improvement" },
      { text: "꾸준한 월 투자로 3년간 연평균 12% 수익률 달성", icon: "🎯", type: "achievement" },
      { text: "직접투자로 연간 수수료 120만원 절약", icon: "💰", type: "saving" }
    ],
    wisdom: [
      { text: "시간은 좋은 기업의 친구, 나쁜 기업의 적", author: "워렌 버핏" },
      { text: "분산투자는 무지에 대한 보호책이다", author: "워렌 버핏" },
      { text: "시장을 이기려 하지 말고, 시장과 함께 성장하라", author: "존 보글" },
      { text: "가장 위험한 것은 위험을 감수하지 않는 것이다", author: "피터 린치" }
    ],
    behaviorAnalysis: {
      holdingPeriod: { value: 8, status: "warning", message: "평균 8개월 - 장기투자 권장" },
      tradingFreq: { value: 3, status: "good", message: "월 3회 (적정 수준)" },
      diversification: { value: 65, status: "warning", message: "상위 3종목 집중도 65%" }
    },
    actionItems: [
      { text: "3개월 미검토 종목 5개 → 투자 논리 재점검", priority: "high" },
      { text: "배당소득 240만원 → 세무 신고 준비", priority: "medium" },
      { text: "비상금 점검 → 생활비 6개월분 확보 권장", priority: "low" }
    ]
  };

  const marketIndices = {
    kospi: { value: 2645.85, change: +12.3, changePercent: +0.47 },
    sp500: { value: 4783.45, change: +23.8, changePercent: +0.50 },
    currentMonthlyIncome: 4500000
  };

  const portfolioDataWithoutRealEstate = [
    { name: '국내주식', value: 45000000, color: '#3B82F6' },
    { name: '해외주식', value: 32000000, color: '#10B981' },
    { name: 'ETF', value: 15000000, color: '#F59E0B' },
    { name: '채권', value: 8000000, color: '#EF4444' },
    { name: '예금', value: 12000000, color: '#8B5CF6' }
  ];

  const portfolioDataWithRealEstate = [
    { name: '부동산', value: 260000000, color: '#F97316' },
    ...portfolioDataWithoutRealEstate
  ];

  const portfolioData = includeRealEstate ? portfolioDataWithRealEstate : portfolioDataWithoutRealEstate;
  const totalAssets = portfolioData.reduce((sum, item) => sum + item.value, 0);
  
  const returnData = {
    daily: { return: 180000, rate: 0.16 },
    monthly: { return: 3200000, rate: 2.8 },
    yearly: { return: 15800000, rate: 16.4 }
  };
  
  const currentReturn = returnData[returnPeriod];
  const monthlyDividend = 1200000;

  const monthlyRealizedData = [
    { month: '1월', realizedGain: -120000 },
    { month: '2월', realizedGain: 450000 },
    { month: '3월', realizedGain: 780000 },
    { month: '4월', realizedGain: -230000 },
    { month: '5월', realizedGain: 1200000 },
    { month: '6월', realizedGain: 650000 },
    { month: '7월', realizedGain: -180000 },
    { month: '8월', realizedGain: 920000 },
    { month: '9월', realizedGain: 340000 },
    { month: '10월', realizedGain: -90000 },
    { month: '11월', realizedGain: 1500000 },
    { month: '12월', realizedGain: 2100000 }
  ];

  const assetTrendData = [
    { month: '1월', 국내주식: 40000000, 해외주식: 28000000, ETF: 12000000, 채권: 7000000, 예금: 8000000 },
    { month: '2월', 국내주식: 42000000, 해외주식: 29000000, ETF: 13000000, 채권: 7000000, 예금: 7000000 },
    { month: '3월', 국내주식: 44000000, 해외주식: 30000000, ETF: 14000000, 채권: 7000000, 예금: 7000000 },
    { month: '4월', 국내주식: 43000000, 해외주식: 31000000, ETF: 14000000, 채권: 8000000, 예금: 9000000 },
    { month: '5월', 국내주식: 44000000, 해외주식: 31000000, ETF: 14500000, 채권: 8000000, 예금: 10500000 },
    { month: '6월', 국내주식: 45000000, 해외주식: 32000000, ETF: 15000000, 채권: 8000000, 예금: 12000000 }
  ];

  const detailStocks = {
    '국내주식': [
      { name: '삼성전자', price: 72000, shares: 167, value: 12000000 },
      { name: 'SK하이닉스', price: 125000, shares: 68, value: 8500000 },
      { name: 'NAVER', price: 170000, shares: 40, value: 6800000 },
      { name: 'LG에너지솔루션', price: 520000, shares: 10, value: 5200000 }
    ],
    '해외주식': [
      { name: 'TSLA', price: 410, shares: 200, value: 8200000 },
      { name: 'AAPL', price: 175, shares: 406, value: 7100000 },
      { name: 'MSFT', price: 420, shares: 95, value: 3990000 },
      { name: 'GOOGL', price: 165, shares: 146, value: 2409000 }
    ],
    'ETF': [
      { name: 'KODEX 200', price: 41200, shares: 121, value: 4985200 },
      { name: 'TIGER 미국S&P500', price: 18500, shares: 270, value: 4995000 },
      { name: 'KODEX 코스닥150', price: 12800, shares: 195, value: 2496000 }
    ],
    '채권': [
      { name: '국고채 10년', price: 102500, shares: 39, value: 3997500 },
      { name: '회사채 AA', price: 100800, shares: 40, value: 4032000 }
    ],
    '예금': [
      { name: 'KB국민은행 정기예금', value: 5000000 },
      { name: '신한은행 적금', value: 4000000 },
      { name: '하나은행 CMA', value: 3000000 }
    ]
  };

  const recommendedProducts = [
    { name: 'KODEX 200', type: 'ETF', returnRate: 12.3, riskLevel: '중간', minAmount: 50000, description: '국내 대표 200개 기업', category: '높은수익률' },
    { name: 'TIGER 미국S&P500', type: 'ETF', returnRate: 15.8, riskLevel: '중간', minAmount: 100000, description: '미국 주요 500개 기업', category: '많이본상품' },
    { name: 'ARIRANG 고배당', type: 'ETF', returnRate: 8.7, riskLevel: '낮음', minAmount: 30000, description: '안정적 배당 수익', category: '높은수익률' },
    { name: 'KODEX 코스닥150', type: 'ETF', returnRate: 18.2, riskLevel: '높음', minAmount: 40000, description: '성장성 높은 기술주', category: '많이본상품' },
    { name: 'TIGER 중국CSI300', type: 'ETF', returnRate: 6.4, riskLevel: '높음', minAmount: 80000, description: '중국 주요 기업', category: '높은수익률' },
    { name: 'KODEX 선진국MSCI World', type: 'ETF', returnRate: 11.2, riskLevel: '중간', minAmount: 70000, description: '글로벌 분산투자', category: '많이본상품' }
  ];

  const [currentWisdom] = useState(0);

  // 목표 관련 핸들러
  const handleGoalCreated = (newGoal) => {
    const goal = {
      ...newGoal,
      id: `goal-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active'
    };
    setUserGoals(prev => [...prev, goal]);
    setShowGoalWizard(false);
  };

  const handleGoalEdit = (goal) => {
    if (goal) {
      // 기존 목표 편집
      setShowGoalWizard(true);
    } else {
      // 새로운 목표 생성
      setShowGoalWizard(true);
    }
  };

  const handleGoalDelete = (goalId) => {
    setUserGoals(prev => prev.filter(g => g.id !== goalId));
  };

  // 현재 포트폴리오 정보
  const currentPortfolio = {
    totalAsset: totalAssets,
    monthlyDividend: monthlyDividend,
    monthlyIncome: marketIndices.currentMonthlyIncome
  };

  // 넛지 데이터 (캐러셀용)
  const carouselNudges = [
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
  ];

  const handleNudgeClick = (nudge) => {
    setFocusedNudgeId(nudge.id);
  };

  const MainView = () => {
    return (
      <div className="relative">
        <Header timeRange={timeRange} setTimeRange={setTimeRange} />

        {/* 넛지 캐러셀 */}
        {carouselNudges.length > 0 && (
          <div className="mb-6">
            <NudgeCarousel
              nudges={carouselNudges}
              onNudgeClick={handleNudgeClick}
              autoPlay={true}
              interval={5000}
            />
          </div>
        )}

        <TotalAssetBox
          totalAssets={totalAssets}
          returnPeriod={returnPeriod}
          setReturnPeriod={setReturnPeriod}
          marketIndices={marketIndices}
          goalType={goalType}
          setGoalType={setGoalType}
          monthlyDividend={monthlyDividend}
          currentReturn={currentReturn}
          setActiveView={setActiveView}
          monthlyRealizedData={monthlyRealizedData}
          userGoals={userGoals}
          setShowGoalWizard={setShowGoalWizard}
          setActiveMenu={setActiveMenu}
        />

        <InsightBand nudgeData={nudgeData} currentWisdom={currentWisdom} />

        <div className="grid grid-cols-1 gap-4">
          <AssetCompositionBox 
            portfolioData={portfolioData}
            totalAssets={totalAssets}
            includeRealEstate={includeRealEstate}
            setIncludeRealEstate={setIncludeRealEstate}
            expandedAsset={expandedAsset}
            setExpandedAsset={setExpandedAsset}
            detailStocks={detailStocks}
            nudgeData={nudgeData}
            recommendedProducts={recommendedProducts}
          />

          <AssetTrendBox assetTrendData={assetTrendData} nudgeData={nudgeData} />
        </div>
      </div>
    );
  };

  // 6. 월별 수익률 상세 페이지 모듈
  const MonthlyReturnsView = () => {
    const monthlyReturnsData = [
      { name: '삼성전자', price: 72000, shares: 167, amount: 12000000, dailyReturn: 28000, monthlyReturn: 850000, yearlyReturn: 1200000 },
      { name: 'SK하이닉스', price: 125000, shares: 68, amount: 8500000, dailyReturn: 22000, monthlyReturn: 680000, yearlyReturn: 980000 },
      { name: 'NAVER', price: 170000, shares: 40, amount: 6800000, dailyReturn: 17000, monthlyReturn: 520000, yearlyReturn: 750000 },
      { name: 'TSLA', price: 410, shares: 200, amount: 8200000, dailyReturn: 15000, monthlyReturn: 450000, yearlyReturn: 680000 },
      { name: 'AAPL', price: 175, shares: 406, amount: 7100000, dailyReturn: 11000, monthlyReturn: 320000, yearlyReturn: 480000 }
    ].map(item => ({
      ...item,
      currentReturn: returnPeriod === 'daily' ? item.dailyReturn : 
                    returnPeriod === 'monthly' ? item.monthlyReturn : item.yearlyReturn,
      returnRate: returnPeriod === 'daily' ? (item.dailyReturn / item.amount) * 100 * 365 : 
                  returnPeriod === 'monthly' ? (item.monthlyReturn / item.amount) * 100 * 12 : 
                  (item.yearlyReturn / item.amount) * 100
    }));

    // 월별 수익률 차트 데이터
    const monthlyReturnChartData = [
      { month: '1월', returnRate: 8.2, assetChange: +2800000 },
      { month: '2월', returnRate: -3.1, assetChange: -1200000 },
      { month: '3월', returnRate: 12.5, assetChange: +4200000 },
      { month: '4월', returnRate: -5.8, assetChange: -2100000 },
      { month: '5월', returnRate: 15.3, assetChange: +5800000 },
      { month: '6월', returnRate: 9.7, assetChange: +3200000 },
      { month: '7월', returnRate: 6.4, assetChange: +2100000 },
      { month: '8월', returnRate: -2.3, assetChange: -800000 },
      { month: '9월', returnRate: 11.8, assetChange: +3900000 },
      { month: '10월', returnRate: 7.2, assetChange: +2400000 },
      { month: '11월', returnRate: 13.6, assetChange: +4500000 },
      { month: '12월', returnRate: 18.4, assetChange: +6200000 }
    ];
    
    return (
      <div>
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => setActiveView('main')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="w-5 h-5" />
            돌아가기
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {returnPeriod === 'daily' ? '일별' : returnPeriod === 'monthly' ? '월별' : '연간'} 수익률 상세
          </h1>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border mb-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              {returnPeriod === 'daily' ? '일별' : returnPeriod === 'monthly' ? '월별' : '연간'} 총 수익
            </h2>
            <div className="text-4xl font-bold text-green-600 mb-2">
              {formatCurrency(currentReturn.return)}원
            </div>
            <div className="text-lg text-green-600">
              수익률 {formatPercentage(currentReturn.rate)}
            </div>
          </div>
        </div>

        {/* 월별 수익률 및 자산 증감 차트 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">월별 수익률 및 자산 증감 현황</h3>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyReturnChartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis 
                  yAxisId="left"
                  tickFormatter={(value) => `${value}%`}
                  domain={['dataMin - 2', 'dataMax + 2']}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right"
                  tickFormatter={(value) => `${value/1000000}백만`}
                />
                <Tooltip 
                  formatter={(value, name, props) => {
                    if (name === 'returnRate') {
                      return [`${value}%`, '수익률'];
                    } else {
                      return [`${value >= 0 ? '+' : ''}${formatCurrency(value)}원`, '자산 증감'];
                    }
                  }}
                  labelFormatter={(label) => `${label}`}
                />
                <ReferenceLine yAxisId="left" y={0} stroke="#666" strokeDasharray="2 2" />
                
                <Bar yAxisId="left" dataKey="returnRate" name="returnRate">
                  {monthlyReturnChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.returnRate >= 0 ? '#10B981' : '#EF4444'} />
                  ))}
                </Bar>
                <Bar yAxisId="right" dataKey="assetChange" name="assetChange" opacity={0.6}>
                  {monthlyReturnChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.assetChange >= 0 ? '#3B82F6' : '#F59E0B'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">연간 평균 수익률</div>
              <div className="text-xl font-bold text-green-600">
                +{(monthlyReturnChartData.reduce((sum, month) => sum + month.returnRate, 0) / 12).toFixed(1)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">연간 총 자산 증가</div>
              <div className="text-xl font-bold text-blue-600">
                +{formatCurrency(monthlyReturnChartData.reduce((sum, month) => sum + month.assetChange, 0))}원
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">주요 자산별 수익 현황</h3>
          
          <div className="space-y-4">
            {monthlyReturnsData.map((item, index) => (
              <div key={index} className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-semibold text-gray-900 text-lg">{item.name}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {item.shares}주 보유 
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600">주당 가격</div>
                  <div className="font-semibold text-gray-900">
                    {item.name === 'TSLA' || item.name === 'AAPL' ? 
                      `${item.price}` : 
                      `${formatCurrency(item.price)}원`
                    }
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">현재 보유 가치</div>
                  <div className="font-semibold text-gray-900">
                    {formatCurrency(item.amount)}원
                  </div>
                  <div className="text-sm font-bold text-green-600">
                    +{formatCurrency(item.currentReturn)}원
                  </div>
                  <div className="text-xs text-green-600">
                    {formatPercentage(item.returnRate)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // 7. 배당 수익 상세 페이지 모듈
  const DividendsView = () => {
    const monthlyDividendSchedule = [
      { month: '1월', total: 448000, dividends: [
        { name: 'KODEX 고배당', amount: 125000, date: '1/31' },
        { name: 'ARIRANG 고배당', amount: 120000, date: '1/15' },
        { name: 'TIGER 미국배당다우존스', amount: 135000, date: '1/10' },
        { name: 'SPYD ETF', amount: 68000, date: '1/31' }
      ]},
      { month: '2월', total: 448000, dividends: [
        { name: 'KODEX 고배당', amount: 125000, date: '2/28' },
        { name: 'ARIRANG 고배당', amount: 120000, date: '2/15' },
        { name: 'TIGER 미국배당다우존스', amount: 135000, date: '2/10' },
        { name: 'SPYD ETF', amount: 68000, date: '2/28' }
      ]},
      { month: '3월', total: 448000, dividends: [
        { name: 'KODEX 고배당', amount: 125000, date: '3/31' },
        { name: 'ARIRANG 고배당', amount: 120000, date: '3/15' },
        { name: 'TIGER 미국배당다우존스', amount: 135000, date: '3/10' },
        { name: 'SPYD ETF', amount: 68000, date: '3/31' }
      ]},
      { month: '4월', total: 613000, dividends: [
        { name: 'LG화학', amount: 165000, date: '4/15' },
        { name: 'KODEX 고배당', amount: 125000, date: '4/30' },
        { name: 'ARIRANG 고배당', amount: 120000, date: '4/15' },
        { name: 'TIGER 미국배당다우존스', amount: 135000, date: '4/10' },
        { name: 'SPYD ETF', amount: 68000, date: '4/30' }
      ]},
      { month: '5월', total: 693000, dividends: [
        { name: '한국전력공사', amount: 245000, date: '5/10' },
        { name: 'KODEX 고배당', amount: 125000, date: '5/31' },
        { name: 'ARIRANG 고배당', amount: 120000, date: '5/15' },
        { name: 'TIGER 미국배당다우존스', amount: 135000, date: '5/10' },
        { name: 'SPYD ETF', amount: 68000, date: '5/31' }
      ]},
      { month: '6월', total: 448000, dividends: [
        { name: 'KODEX 고배당', amount: 125000, date: '6/30' },
        { name: 'ARIRANG 고배당', amount: 120000, date: '6/15' },
        { name: 'TIGER 미국배당다우존스', amount: 135000, date: '6/10' },
        { name: 'SPYD ETF', amount: 68000, date: '6/30' }
      ]},
      { month: '7월', total: 448000, dividends: [
        { name: 'KODEX 고배당', amount: 125000, date: '7/31' },
        { name: 'ARIRANG 고배당', amount: 120000, date: '7/15' },
        { name: 'TIGER 미국배당다우존스', amount: 135000, date: '7/10' },
        { name: 'SPYD ETF', amount: 68000, date: '7/31' }
      ]},
      { month: '8월', total: 448000, dividends: [
        { name: 'KODEX 고배당', amount: 125000, date: '8/31' },
        { name: 'ARIRANG 고배당', amount: 120000, date: '8/15' },
        { name: 'TIGER 미국배당다우존스', amount: 135000, date: '8/10' },
        { name: 'SPYD ETF', amount: 68000, date: '8/31' }
      ]},
      { month: '9월', total: 448000, dividends: [
        { name: 'KODEX 고배당', amount: 125000, date: '9/30' },
        { name: 'ARIRANG 고배당', amount: 120000, date: '9/15' },
        { name: 'TIGER 미국배당다우존스', amount: 135000, date: '9/10' },
        { name: 'SPYD ETF', amount: 68000, date: '9/30' }
      ]},
      { month: '10월', total: 448000, dividends: [
        { name: 'KODEX 고배당', amount: 125000, date: '10/31' },
        { name: 'ARIRANG 고배당', amount: 120000, date: '10/15' },
        { name: 'TIGER 미국배당다우존스', amount: 135000, date: '10/10' },
        { name: 'SPYD ETF', amount: 68000, date: '10/31' }
      ]},
      { month: '11월', total: 448000, dividends: [
        { name: 'KODEX 고배당', amount: 125000, date: '11/30' },
        { name: 'ARIRANG 고배당', amount: 120000, date: '11/15' },
        { name: 'TIGER 미국배당다우존스', amount: 135000, date: '11/10' },
        { name: 'SPYD ETF', amount: 68000, date: '11/30' }
      ]},
      { month: '12월', total: 993000, dividends: [
        { name: 'SK텔레콤', amount: 280000, date: '12/15' },
        { name: 'KT&G', amount: 265000, date: '12/20' },
        { name: 'KODEX 고배당', amount: 125000, date: '12/31' },
        { name: 'ARIRANG 고배당', amount: 120000, date: '12/15' },
        { name: 'TIGER 미국배당다우존스', amount: 135000, date: '12/10' },
        { name: 'SPYD ETF', amount: 68000, date: '12/31' }
      ]}
    ];

    const dividendChartData = monthlyDividendSchedule.map(month => ({
      month: month.month,
      amount: month.total
    }));

    const selectedMonthData = selectedDividendMonth ? 
      monthlyDividendSchedule.find(m => m.month === selectedDividendMonth) : null;

    const dividendData = [
      { name: 'SK텔레콤', price: 52000, shares: 163, amount: 8500000, monthlyDividend: 280000, yield: 4.2, nextPayDate: '12월 15일' },
      { name: 'KT&G', price: 77500, shares: 80, amount: 6200000, monthlyDividend: 265000, yield: 5.3, nextPayDate: '12월 20일' },
      { name: '한국전력공사', price: 19300, shares: 300, amount: 5800000, monthlyDividend: 245000, yield: 5.0, nextPayDate: '5월 10일' }
    ];

    const handleBarClick = (data, index) => {
      setSelectedDividendMonth(data.month);
    };

    return (
      <div>
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => setActiveView('main')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="w-5 h-5" />
            돌아가기
          </button>
          <h1 className="text-3xl font-bold text-gray-900">월 배당 수익 상세</h1>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border mb-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">연간 총 배당 예상</h2>
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {formatCurrency(monthlyDividendSchedule.reduce((sum, month) => sum + month.total, 0))}원
            </div>
            <div className="text-lg text-blue-600">
              월 평균 {formatCurrency(Math.round(monthlyDividendSchedule.reduce((sum, month) => sum + month.total, 0) / 12))}원
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            월별 배당 현황 
            <span className="text-sm text-gray-500 ml-2">(차트를 클릭하면 해당 월 상세 내역으로 이동)</span>
          </h3>
          
          <div className="h-64 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dividendChartData} onClick={handleBarClick}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${value/10000}만`} />
                <Tooltip 
                  formatter={(value) => [`${formatCurrency(value)}원`, '배당금']}
                  labelFormatter={(label) => `${label} 배당`}
                />
                <Bar 
                  dataKey="amount" 
                  fill="#3B82F6"
                  className="cursor-pointer hover:opacity-80"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-6 gap-2 mb-4">
            {dividendChartData.map((monthData, index) => (
              <button
                key={index}
                onClick={() => setSelectedDividendMonth(
                  selectedDividendMonth === monthData.month ? null : monthData.month
                )}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedDividendMonth === monthData.month
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {monthData.month}
              </button>
            ))}
          </div>

          {selectedMonthData && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-blue-900 text-lg">
                  {selectedMonthData.month} 배당 상세 내역
                </h4>
                <div className="text-xl font-bold text-blue-600">
                  총 {formatCurrency(selectedMonthData.total)}원
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedMonthData.dividends.map((dividend, index) => (
                  <div key={index} className="flex justify-between items-center bg-white p-3 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{dividend.name}</div>
                      <div className="text-sm text-gray-600">지급일: {dividend.date}</div>
                    </div>
                    <div className="font-semibold text-blue-600">
                      {formatCurrency(dividend.amount)}원
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 전체 배당 내역 리스트 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">연간 전체 배당 내역</h3>
          
          <div className="space-y-4">
            {monthlyDividendSchedule.map((month, monthIndex) => (
              <div key={monthIndex} className="border-b pb-4 last:border-b-0">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-gray-800 text-lg">{month.month}</h4>
                  <div className="text-lg font-bold text-blue-600">
                    {formatCurrency(month.total)}원
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {month.dividends.map((dividend, dividendIndex) => (
                    <div key={dividendIndex} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-800 text-sm">{dividend.name}</div>
                          <div className="text-xs text-gray-600 mt-1">{dividend.date}</div>
                        </div>
                        <div className="text-sm font-semibold text-blue-600">
                          {formatCurrency(dividend.amount)}원
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">보유 배당주 상세 현황</h3>
          
          <div className="space-y-4">
            {dividendData.map((item, index) => (
              <div key={index} className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-semibold text-gray-900 text-lg">{item.name}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {item.shares}주 보유 
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    배당 주기: {item.nextPayDate}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600">주당 가격</div>
                  <div className="font-semibold text-gray-900">
                    {formatCurrency(item.price)}원
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">현재 보유 가치</div>
                  <div className="font-semibold text-gray-900">
                    {formatCurrency(item.amount)}원
                  </div>
                  <div className="text-sm font-bold text-blue-600">
                    {formatCurrency(item.monthlyDividend)}원/년
                  </div>
                  <div className="text-xs text-blue-600">
                    배당률 {item.yield}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // 8. 실현 수익 상세 페이지 모듈
  const RealizedView = () => {
    const realizedDetailData = [
      { month: '1월', realizedGain: -120000, trades: [
        { name: '삼성바이오로직스', buyPrice: 850000, buyTotal: 8500000, sellPrice: 835000, sellTotal: 8350000, shares: 10 },
        { name: 'SK하이닉스', buyPrice: 135000, buyTotal: 2700000, sellPrice: 133000, sellTotal: 2660000, shares: 20 }
      ]},
      { month: '2월', realizedGain: 450000, trades: [
        { name: 'NAVER', buyPrice: 165000, buyTotal: 3300000, sellPrice: 175000, sellTotal: 3500000, shares: 20 },
        { name: 'LG에너지솔루션', buyPrice: 480000, buyTotal: 2400000, sellPrice: 495000, sellTotal: 2475000, shares: 5 }
      ]},
      { month: '3월', realizedGain: 780000, trades: [
        { name: '삼성전자', buyPrice: 68000, buyTotal: 6800000, sellPrice: 75000, sellTotal: 7500000, shares: 100 },
        { name: 'TSLA', buyPrice: 380, buyTotal: 3800000, sellPrice: 395, sellTotal: 3950000, shares: 1000 }
      ]},
      { month: '4월', realizedGain: -230000, trades: [
        { name: '카카오', buyPrice: 95000, buyTotal: 1900000, sellPrice: 87000, sellTotal: 1740000, shares: 20 },
        { name: 'AAPL', buyPrice: 185, buyTotal: 1850000, sellPrice: 178, sellTotal: 1780000, shares: 100 }
      ]},
      { month: '5월', realizedGain: 1200000, trades: [
        { name: 'Microsoft', buyPrice: 390, buyTotal: 3900000, sellPrice: 420, sellTotal: 4200000, shares: 100 },
        { name: '현대차', buyPrice: 170000, buyTotal: 5100000, sellPrice: 190000, sellTotal: 5700000, shares: 30 }
      ]},
      { month: '6월', realizedGain: 650000, trades: [
        { name: '셀트리온', buyPrice: 195000, buyTotal: 3900000, sellPrice: 210000, sellTotal: 4200000, shares: 20 },
        { name: 'KODEX 200', buyPrice: 38000, buyTotal: 3800000, sellPrice: 41500, sellTotal: 4150000, shares: 100 }
      ]},
      { month: '7월', realizedGain: -180000, trades: [
        { name: '포스코홀딩스', buyPrice: 420000, buyTotal: 4200000, sellPrice: 402000, sellTotal: 4020000, shares: 10 }
      ]},
      { month: '8월', realizedGain: 920000, trades: [
        { name: 'NVDA', buyPrice: 450, buyTotal: 4500000, sellPrice: 520, sellTotal: 5200000, shares: 100 },
        { name: '기아', buyPrice: 88000, buyTotal: 2640000, sellPrice: 96000, sellTotal: 2880000, shares: 30 }
      ]},
      { month: '9월', realizedGain: 340000, trades: [
        { name: 'LG화학', buyPrice: 430000, buyTotal: 2150000, sellPrice: 465000, sellTotal: 2325000, shares: 5 },
        { name: 'Amazon', buyPrice: 165, buyTotal: 1650000, sellTotal: 1815000, sellPrice: 181.5, shares: 100 }
      ]},
      { month: '10월', realizedGain: -90000, trades: [
        { name: '삼성SDI', buyPrice: 520000, buyTotal: 2600000, sellPrice: 502000, sellTotal: 2510000, shares: 5 }
      ]},
      { month: '11월', realizedGain: 1500000, trades: [
        { name: '삼성전자', buyPrice: 72000, buyTotal: 7200000, sellPrice: 84000, sellTotal: 8400000, shares: 100 },
        { name: 'Google', buyPrice: 140, buyTotal: 2800000, sellPrice: 155, sellTotal: 3100000, shares: 200 }
      ]},
      { month: '12월', realizedGain: 2100000, trades: [
        { name: 'SK하이닉스', buyPrice: 110000, buyTotal: 5500000, sellPrice: 135000, sellTotal: 6750000, shares: 50 },
        { name: 'Tesla', buyPrice: 380, buyTotal: 3800000, sellPrice: 420, sellTotal: 4200000, shares: 100 }
      ]}
    ];

    const realizedChartData = monthlyRealizedData.map(month => ({
      month: month.month,
      amount: month.realizedGain
    }));

    const selectedMonthData = selectedRealizedMonth ? 
      realizedDetailData.find(m => m.month === selectedRealizedMonth) : null;

    const handleBarClick = (data, index) => {
      setSelectedRealizedMonth(data.month);
    };

    return (
      <div>
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => setActiveView('main')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="w-5 h-5" />
            돌아가기
          </button>
          <h1 className="text-3xl font-bold text-gray-900">실현 수익 상세</h1>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border mb-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">연간 총 실현 수익</h2>
            <div className={`text-4xl font-bold mb-2 ${
              monthlyRealizedData.reduce((sum, month) => sum + month.realizedGain, 0) >= 0 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              {monthlyRealizedData.reduce((sum, month) => sum + month.realizedGain, 0) >= 0 ? '+' : ''}
              {formatCurrency(monthlyRealizedData.reduce((sum, month) => sum + month.realizedGain, 0))}원
            </div>
            <div className="text-lg text-gray-600">
              총 {monthlyRealizedData.filter(m => m.realizedGain !== 0).length}개월 거래 완료
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            월별 실현 수익 현황 
            <span className="text-sm text-gray-500 ml-2">(차트를 클릭하면 해당 월 상세 내역으로 이동)</span>
          </h3>
          
          <div className="h-64 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={realizedChartData} onClick={handleBarClick}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${value/10000}만`} />
                <Tooltip 
                  formatter={(value) => [`${value >= 0 ? '+' : ''}${formatCurrency(Math.abs(value))}원`, '실현 수익']}
                  labelFormatter={(label) => `${label} 실현 수익`}
                />
                <ReferenceLine y={0} stroke="#666" strokeDasharray="2 2" />
                <Bar dataKey="amount" className="cursor-pointer hover:opacity-80">
                  {realizedChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.amount >= 0 ? '#10B981' : '#EF4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-6 gap-2 mb-4">
            {realizedDetailData.map((monthData, index) => (
              <button
                key={index}
                onClick={() => setSelectedRealizedMonth(
                  selectedRealizedMonth === monthData.month ? null : monthData.month
                )}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedRealizedMonth === monthData.month
                    ? 'bg-purple-600 text-white' 
                    : monthData.realizedGain >= 0
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
              >
                {monthData.month}
              </button>
            ))}
          </div>

          {selectedMonthData && (
            <div className={`mt-6 p-4 rounded-lg border-l-4 ${
              selectedMonthData.realizedGain >= 0 
                ? 'bg-green-50 border-green-500' 
                : 'bg-red-50 border-red-500'
            }`}>
              <div className="flex justify-between items-center mb-3">
                <h4 className={`font-semibold text-lg ${
                  selectedMonthData.realizedGain >= 0 ? 'text-green-900' : 'text-red-900'
                }`}>
                  {selectedMonthData.month} 거래 상세 내역
                </h4>
                <div className={`text-xl font-bold ${
                  selectedMonthData.realizedGain >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {selectedMonthData.realizedGain >= 0 ? '+' : ''}
                  {formatCurrency(selectedMonthData.realizedGain)}원
                </div>
              </div>
              
              <div className="space-y-3">
                {selectedMonthData.trades.map((trade, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg">
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <div className="font-semibold text-gray-900 text-lg">{trade.name}</div>
                        <div className="text-sm text-gray-600">{trade.shares}주 거래</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-600">매수가</div>
                        <div className="text-sm text-gray-700">
                          {trade.name.includes('Microsoft') || trade.name.includes('Google') || trade.name.includes('Tesla') || trade.name.includes('TSLA') || trade.name.includes('AAPL') || trade.name.includes('NVDA') || trade.name.includes('Amazon') ? 
                            `${trade.buyPrice}` : 
                            `${formatCurrency(trade.buyPrice)}원`
                          }
                        </div>
                        <div className="font-bold text-gray-900">
                          {formatCurrency(trade.buyTotal)}원
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-600">매도가</div>
                        <div className="text-sm text-gray-700">
                          {trade.name.includes('Microsoft') || trade.name.includes('Google') || trade.name.includes('Tesla') || trade.name.includes('TSLA') || trade.name.includes('AAPL') || trade.name.includes('NVDA') || trade.name.includes('Amazon') ? 
                            `${trade.sellPrice}` : 
                            `${formatCurrency(trade.sellPrice)}원`
                          }
                        </div>
                        <div className="font-bold text-gray-900">
                          {formatCurrency(trade.sellTotal)}원
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">실현 손익</div>
                        <div className={`text-lg font-bold ${
                          (trade.sellTotal - trade.buyTotal) >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {(trade.sellTotal - trade.buyTotal) >= 0 ? '+' : ''}
                          {formatCurrency(trade.sellTotal - trade.buyTotal)}원
                        </div>
                        <div className={`text-sm ${
                          (trade.sellTotal - trade.buyTotal) >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {(((trade.sellTotal - trade.buyTotal) / trade.buyTotal) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 전체 실현 수익 내역 리스트 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">연간 전체 거래 내역</h3>
          
          <div className="space-y-4">
            {realizedDetailData.map((month, monthIndex) => (
              <div key={monthIndex} className="border-b pb-4 last:border-b-0">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-gray-800 text-lg">{month.month}</h4>
                  <div className={`text-lg font-bold ${
                    month.realizedGain >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {month.realizedGain >= 0 ? '+' : ''}{formatCurrency(month.realizedGain)}원
                  </div>
                </div>
                
                <div className="space-y-3">
                  {month.trades.map((trade, tradeIndex) => (
                    <div key={tradeIndex} className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-5 gap-4 items-center">
                        <div>
                          <div className="font-medium text-gray-800">{trade.name}</div>
                          <div className="text-xs text-gray-600">{trade.shares}주</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-600">매수가</div>
                          <div className="text-sm font-medium">
                            {trade.name.includes('Microsoft') || trade.name.includes('Google') || trade.name.includes('Tesla') || trade.name.includes('TSLA') || trade.name.includes('AAPL') || trade.name.includes('NVDA') || trade.name.includes('Amazon') ? 
                              `${trade.buyPrice}` : 
                              `${formatCurrency(trade.buyPrice)}`
                            }
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-600">매도가</div>
                          <div className="text-sm font-medium">
                            {trade.name.includes('Microsoft') || trade.name.includes('Google') || trade.name.includes('Tesla') || trade.name.includes('TSLA') || trade.name.includes('AAPL') || trade.name.includes('NVDA') || trade.name.includes('Amazon') ? 
                              `${trade.sellPrice}` : 
                              `${formatCurrency(trade.sellPrice)}`
                            }
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-600">거래금액</div>
                          <div className="text-sm font-medium">{formatCurrency(trade.sellTotal)}원</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-600">손익</div>
                          <div className={`text-sm font-bold ${
                            (trade.sellTotal - trade.buyTotal) >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {(trade.sellTotal - trade.buyTotal) >= 0 ? '+' : ''}
                            {formatCurrency(trade.sellTotal - trade.buyTotal)}원
                          </div>
                          <div className={`text-xs ${
                            (trade.sellTotal - trade.buyTotal) >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {(((trade.sellTotal - trade.buyTotal) / trade.buyTotal) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // 목표 추적 뷰
  const GoalTrackingView = () => {
    return (
      <div>
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => setActiveView('main')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="w-5 h-5" />
            돌아가기
          </button>
          <h1 className="text-display">목표 관리</h1>
        </div>

        <GoalTrackingDashboard
          goals={userGoals}
          currentPortfolio={currentPortfolio}
          onEditGoal={handleGoalEdit}
          onDeleteGoal={handleGoalDelete}
        />
      </div>
    );
  };

  return (
    <div className="w-full h-full">
      {activeView === 'main' && <MainView />}
      {activeView === 'goal-tracking' && <GoalTrackingView />}
      {activeView === 'monthly-returns' && <MonthlyReturnsView />}
      {activeView === 'dividends' && <DividendsView />}
      {activeView === 'realized' && <RealizedView />}

      {/* 목표 설정 위자드 모달 */}
      {showGoalWizard && (
        <IntelligentGoalWizard
          currentPortfolio={currentPortfolio}
          onGoalCreated={handleGoalCreated}
          onClose={() => setShowGoalWizard(false)}
        />
      )}
    </div>
  );
};

export default InvestmentDashboard;