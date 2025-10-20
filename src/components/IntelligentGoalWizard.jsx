import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Target, TrendingUp, Calculator, Brain, CheckCircle, AlertCircle, Info, DollarSign, Calendar, BarChart3, Zap, Settings } from 'lucide-react';
import { getDividendScheduleData } from '../utils/dividendData';

// 목표 계산 엔진
const GoalCalculationEngine = {
  // 자산 목표 계산
  calculateAssetGoal: (currentAsset, targetAsset, monthlyInvestment, expectedReturn, timeHorizon) => {
    const monthlyReturn = expectedReturn / 12 / 100;
    const totalMonths = timeHorizon * 12;

    // 복리 계산: 현재 자산의 미래가치 + 월 투자의 미래가치
    const currentAssetFuture = currentAsset * Math.pow(1 + monthlyReturn, totalMonths);
    const monthlyInvestmentFuture = monthlyInvestment *
      ((Math.pow(1 + monthlyReturn, totalMonths) - 1) / monthlyReturn);

    const projectedAsset = currentAssetFuture + monthlyInvestmentFuture;
    const achievabilityRate = Math.min((projectedAsset / targetAsset) * 100, 100);

    // 목표 달성에 필요한 월 투자금 계산
    const requiredFutureValue = targetAsset - currentAssetFuture;
    const requiredMonthlyInvestment = requiredFutureValue /
      ((Math.pow(1 + monthlyReturn, totalMonths) - 1) / monthlyReturn);

    return {
      projectedAsset: Math.round(projectedAsset),
      achievabilityRate: Math.round(achievabilityRate * 10) / 10,
      requiredMonthlyInvestment: Math.max(0, Math.round(requiredMonthlyInvestment)),
      isAchievable: achievabilityRate >= 95
    };
  },

  // 배당 목표 계산
  calculateDividendGoal: (currentDividend, targetDividend, monthlyInvestment, dividendYield, expectedGrowth, timeHorizon) => {
    const annualInvestment = monthlyInvestment * 12;
    let projectedAsset = 0;
    let projectedDividend = currentDividend;

    // 연도별 시뮬레이션
    for (let year = 1; year <= timeHorizon; year++) {
      projectedAsset += annualInvestment;
      projectedAsset *= (1 + expectedGrowth / 100);
      projectedDividend = (projectedAsset * dividendYield / 100) / 12;
    }

    const achievabilityRate = Math.min((projectedDividend / targetDividend) * 100, 100);

    // 목표 달성에 필요한 총 자산
    const requiredAsset = (targetDividend * 12) / (dividendYield / 100);
    const additionalAssetNeeded = Math.max(0, requiredAsset - projectedAsset);

    return {
      projectedDividend: Math.round(projectedDividend),
      projectedAsset: Math.round(projectedAsset),
      achievabilityRate: Math.round(achievabilityRate * 10) / 10,
      requiredAsset: Math.round(requiredAsset),
      additionalAssetNeeded: Math.round(additionalAssetNeeded),
      isAchievable: achievabilityRate >= 95
    };
  },

  // 리스크 성향별 추천 수익률
  getRecommendedReturn: (riskProfile) => {
    const returns = {
      conservative: { min: 5, max: 8, recommended: 6 },
      balanced: { min: 8, max: 12, recommended: 10 },
      aggressive: { min: 12, max: 18, recommended: 15 }
    };
    return returns[riskProfile] || returns.balanced;
  },

  // 연령대별 추천 목표
  getAgeBasedRecommendation: (age, currentAsset, monthlyIncome) => {
    const recommendations = {
      twenties: {
        assetMultiplier: 3,
        dividendRatio: 0.2,
        timeHorizon: 10,
        riskProfile: 'aggressive'
      },
      thirties: {
        assetMultiplier: 5,
        dividendRatio: 0.3,
        timeHorizon: 15,
        riskProfile: 'balanced'
      },
      forties: {
        assetMultiplier: 8,
        dividendRatio: 0.5,
        timeHorizon: 20,
        riskProfile: 'balanced'
      },
      fifties: {
        assetMultiplier: 10,
        dividendRatio: 0.8,
        timeHorizon: 15,
        riskProfile: 'conservative'
      }
    };

    const ageGroup = age < 30 ? 'twenties' :
                    age < 40 ? 'thirties' :
                    age < 50 ? 'forties' : 'fifties';

    const rec = recommendations[ageGroup];

    return {
      recommendedAssetGoal: currentAsset * rec.assetMultiplier,
      recommendedDividendGoal: monthlyIncome * rec.dividendRatio,
      recommendedTimeHorizon: rec.timeHorizon,
      recommendedRiskProfile: rec.riskProfile
    };
  }
};

// AI 기반 목표 추천 시스템
const AIRecommendationEngine = {
  analyzeCurrentSituation: (userData) => {
    const {
      currentAsset,
      monthlyDividend,
      monthlyIncome,
      age,
      investmentExperience,
      riskTolerance
    } = userData;

    const dividendIncomeRatio = (monthlyDividend / monthlyIncome) * 100;
    const assetToIncomeRatio = currentAsset / (monthlyIncome * 12);

    const analysis = {
      strengths: [],
      improvements: [],
      recommendations: [],
      riskAssessment: 'balanced'
    };

    // 강점 분석
    if (dividendIncomeRatio > 20) {
      analysis.strengths.push('월 소득 대비 배당 비율이 우수합니다');
    }
    if (assetToIncomeRatio > 3) {
      analysis.strengths.push('연 소득 대비 자산 비율이 건전합니다');
    }
    if (age < 40 && riskTolerance === 'aggressive') {
      analysis.strengths.push('젊은 나이의 적극적 투자 성향이 유리합니다');
    }

    // 개선점 분석
    if (dividendIncomeRatio < 10) {
      analysis.improvements.push('배당 수익 비중을 늘려 수동 소득을 확대하세요');
    }
    if (assetToIncomeRatio < 2) {
      analysis.improvements.push('자산 축적 속도를 높이기 위해 저축률을 증가시키세요');
    }

    // 추천사항
    const ageRec = GoalCalculationEngine.getAgeBasedRecommendation(age, currentAsset, monthlyIncome);
    analysis.recommendations.push({
      type: 'asset',
      title: '자산 목표 추천',
      value: ageRec.recommendedAssetGoal,
      reason: `${age}대 적정 자산 목표입니다`
    });
    analysis.recommendations.push({
      type: 'dividend',
      title: '배당 목표 추천',
      value: ageRec.recommendedDividendGoal,
      reason: '월 소득의 안정적인 배당 비율입니다'
    });

    return analysis;
  },

  generateSmartGoals: (userData, preferences) => {
    const aiAnalysis = this.analyzeCurrentSituation(userData);
    const ageRec = GoalCalculationEngine.getAgeBasedRecommendation(
      userData.age,
      userData.currentAsset,
      userData.monthlyIncome
    );

    const smartGoals = [
      {
        id: 'asset_growth',
        type: 'asset',
        title: '자산 성장 목표',
        currentValue: userData.currentAsset,
        targetValue: ageRec.recommendedAssetGoal,
        timeHorizon: ageRec.recommendedTimeHorizon,
        priority: 'high',
        description: '장기 자산 축적을 통한 경제적 안정성 확보',
        milestones: [
          { year: 3, target: userData.currentAsset * 1.5 },
          { year: 7, target: userData.currentAsset * 2.5 },
          { year: ageRec.recommendedTimeHorizon, target: ageRec.recommendedAssetGoal }
        ]
      },
      {
        id: 'dividend_income',
        type: 'dividend',
        title: '배당 소득 목표',
        currentValue: userData.monthlyDividend,
        targetValue: ageRec.recommendedDividendGoal,
        timeHorizon: Math.min(ageRec.recommendedTimeHorizon, 10),
        priority: preferences.goalType === 'dividend' ? 'high' : 'medium',
        description: '안정적인 배당 수익을 통한 수동 소득 창출',
        milestones: [
          { year: 2, target: userData.monthlyDividend * 1.3 },
          { year: 5, target: userData.monthlyDividend * 2 },
          { year: 10, target: ageRec.recommendedDividendGoal }
        ]
      }
    ];

    return smartGoals;
  }
};

// 단계별 마법사 컴포넌트들
const Step1GoalType = ({ selectedGoalType, setSelectedGoalType, onNext }) => {
  const goalTypes = [
    {
      id: 'asset',
      title: '자산 늘리기',
      description: '장기적인 자산 축적을 통한 경제적 안정성 확보',
      icon: TrendingUp,
      color: 'var(--accent-blue)',
      benefits: ['복리 효과 극대화', '인플레이션 대응', '장기 안정성']
    },
    {
      id: 'dividend',
      title: '배당 늘리기',
      description: '안정적인 배당 수익을 통한 수동 소득 창출',
      icon: DollarSign,
      color: 'var(--accent-green)',
      benefits: ['월 현금흐름 개선', '수동 소득 창출', '경제적 자유']
    },
    {
      id: 'hybrid',
      title: '통합 목표',
      description: '자산 성장과 배당 수익을 균형있게 추구',
      icon: BarChart3,
      color: 'var(--accent-purple)',
      benefits: ['균형잡힌 포트폴리오', '리스크 분산', '다양한 수익원']
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-title mb-3">어떤 목표를 설정하고 싶으신가요?</h2>
        <p className="text-body" style={{color: 'var(--text-secondary)'}}>
          투자 목표 유형을 선택하면 맞춤형 목표를 제안해드립니다
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {goalTypes.map(type => {
          const Icon = type.icon;
          const isSelected = selectedGoalType === type.id;

          return (
            <button
              key={type.id}
              onClick={() => setSelectedGoalType(type.id)}
              className={`p-6 rounded-xl border-2 transition-all hover:scale-105 ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  isSelected ? 'bg-blue-500' : 'bg-gray-100'
                }`}>
                  <Icon
                    className="w-8 h-8"
                    style={{color: isSelected ? 'white' : type.color}}
                  />
                </div>

                <h3 className={`text-subtitle mb-2 ${
                  isSelected ? 'text-blue-900' : ''
                }`}>
                  {type.title}
                </h3>

                <p className="text-caption mb-4" style={{color: 'var(--text-secondary)'}}>
                  {type.description}
                </p>

                <div className="space-y-1">
                  {type.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <CheckCircle className="w-3 h-3" style={{color: 'var(--accent-green)'}} />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-end pt-6">
        <button
          onClick={onNext}
          disabled={!selectedGoalType}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            selectedGoalType
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          다음 단계 <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const Step2PersonalInfo = ({ personalInfo, setPersonalInfo, onNext, onPrev }) => {
  const handleInputChange = (field, value) => {
    setPersonalInfo(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = personalInfo.age && personalInfo.monthlyIncome &&
                     personalInfo.monthlyInvestment && personalInfo.riskTolerance &&
                     personalInfo.investmentExperience;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-title mb-3">개인 정보를 입력해주세요</h2>
        <p className="text-body" style={{color: 'var(--text-secondary)'}}>
          맞춤형 목표 제안을 위해 기본 정보가 필요합니다
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-body font-medium mb-2">나이</label>
          <input
            type="number"
            value={personalInfo.age}
            onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
            placeholder="만 나이를 입력하세요"
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-body font-medium mb-2">월 소득</label>
          <div className="relative">
            <input
              type="number"
              value={personalInfo.monthlyIncome}
              onChange={(e) => handleInputChange('monthlyIncome', parseInt(e.target.value))}
              placeholder="월 소득을 입력하세요"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">원</span>
          </div>
        </div>

        <div>
          <label className="block text-body font-medium mb-2">월 투자 가능 금액</label>
          <div className="relative">
            <input
              type="number"
              value={personalInfo.monthlyInvestment}
              onChange={(e) => handleInputChange('monthlyInvestment', parseInt(e.target.value))}
              placeholder="월 투자 가능 금액을 입력하세요"
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">원</span>
          </div>
        </div>

        <div>
          <label className="block text-body font-medium mb-2">투자 경험</label>
          <select
            value={personalInfo.investmentExperience}
            onChange={(e) => handleInputChange('investmentExperience', e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">선택하세요</option>
            <option value="beginner">초보자 (1년 이하)</option>
            <option value="intermediate">중급자 (1-5년)</option>
            <option value="advanced">고급자 (5년 이상)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-body font-medium mb-4">투자 성향</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { value: 'conservative', label: '안정형', desc: '원금 보존 중시, 낮은 변동성 선호' },
            { value: 'balanced', label: '균형형', desc: '적당한 수익과 안정성 추구' },
            { value: 'aggressive', label: '적극형', desc: '높은 수익 추구, 변동성 감수' }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => handleInputChange('riskTolerance', option.value)}
              className={`p-4 rounded-lg border-2 transition-colors ${
                personalInfo.riskTolerance === option.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <div className="font-medium mb-1">{option.label}</div>
                <div className="text-sm text-gray-600">{option.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <button
          onClick={onPrev}
          className="flex items-center gap-2 px-6 py-3 border rounded-lg hover:bg-gray-50"
        >
          <ChevronLeft className="w-4 h-4" /> 이전
        </button>

        <button
          onClick={onNext}
          disabled={!isFormValid}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            isFormValid
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          다음 단계 <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const Step3GoalSetting = ({ goalType, personalInfo, goalSettings, setGoalSettings, onNext, onPrev }) => {
  const handleGoalChange = (field, value) => {
    setGoalSettings(prev => ({ ...prev, [field]: value }));
  };

  // AI 추천값 계산 (실제 포트폴리오 데이터 사용)
  const aiRecommendation = useMemo(() => {
    if (!personalInfo.age || !personalInfo.monthlyIncome) return null;

    // 실제 포트폴리오 데이터 사용
    const currentAssetValue = currentPortfolio.totalAsset || currentAsset || 112000000;
    const currentMonthlyDividend = currentPortfolio.monthlyDividend || monthlyDividend || 0;

    // 배당 데이터 기반 분석
    const annualDividend = monthlyDividendSchedule.reduce((sum, month) => sum + month.total, 0);
    const currentDividendYield = currentAssetValue > 0 ? (annualDividend / currentAssetValue) * 100 : 4.5;

    const baseRecommendation = GoalCalculationEngine.getAgeBasedRecommendation(
      personalInfo.age,
      currentAssetValue,
      personalInfo.monthlyIncome
    );

    // 배당 성과 반영하여 조정
    const dividendPerformanceMultiplier = currentDividendYield > 5 ? 1.2 :
                                        currentDividendYield > 4 ? 1.1 : 1.0;

    return {
      ...baseRecommendation,
      recommendedDividendGoal: Math.round(baseRecommendation.recommendedDividendGoal * dividendPerformanceMultiplier),
      currentDividendYield: currentDividendYield.toFixed(1),
      currentMonthlyDividend: Math.round(annualDividend / 12),
      dividendAnalysis: {
        annual: annualDividend,
        monthly: Math.round(annualDividend / 12),
        yield: currentDividendYield.toFixed(1)
      }
    };
  }, [personalInfo, currentPortfolio, monthlyDividendSchedule]);

  const applyRecommendation = () => {
    if (aiRecommendation) {
      setGoalSettings({
        targetAmount: goalType === 'asset' ? aiRecommendation.recommendedAssetGoal : aiRecommendation.recommendedDividendGoal,
        timeHorizon: aiRecommendation.recommendedTimeHorizon,
        expectedReturn: GoalCalculationEngine.getRecommendedReturn(aiRecommendation.recommendedRiskProfile).recommended
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-title mb-3">목표를 구체적으로 설정해보세요</h2>
        <p className="text-body" style={{color: 'var(--text-secondary)'}}>
          AI가 분석한 추천값을 참고하여 목표를 설정하세요
        </p>
      </div>

      {aiRecommendation && (
        <div className="card-premium p-6 mb-6" style={{backgroundColor: 'var(--accent-blue)10', borderLeft: '4px solid var(--accent-blue)'}}>
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-5 h-5" style={{color: 'var(--accent-blue)'}} />
            <h3 className="text-subtitle">AI 목표 추천</h3>
            <button
              onClick={applyRecommendation}
              className="ml-auto px-3 py-1 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              추천값 적용
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-caption" style={{color: 'var(--text-secondary)'}}>
                추천 {goalType === 'asset' ? '자산' : '배당'} 목표
              </div>
              <div className="text-subtitle font-semibold" style={{color: 'var(--accent-blue)'}}>
                {goalType === 'asset'
                  ? `${(aiRecommendation.recommendedAssetGoal / 100000000).toFixed(1)}억원`
                  : `${(aiRecommendation.recommendedDividendGoal / 10000).toFixed(0)}만원/월`
                }
              </div>
            </div>
            <div>
              <div className="text-caption" style={{color: 'var(--text-secondary)'}}>추천 기간</div>
              <div className="text-subtitle font-semibold" style={{color: 'var(--accent-blue)'}}>
                {aiRecommendation.recommendedTimeHorizon}년
              </div>
            </div>
            <div>
              <div className="text-caption" style={{color: 'var(--text-secondary)'}}>추천 수익률</div>
              <div className="text-subtitle font-semibold" style={{color: 'var(--accent-blue)'}}>
                연 {GoalCalculationEngine.getRecommendedReturn(aiRecommendation.recommendedRiskProfile).recommended}%
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-body font-medium mb-2">
            목표 {goalType === 'asset' ? '자산' : goalType === 'dividend' ? '월 배당' : '금액'}
          </label>
          <div className="relative">
            <input
              type="number"
              value={goalSettings.targetAmount}
              onChange={(e) => handleGoalChange('targetAmount', parseInt(e.target.value))}
              placeholder={goalType === 'asset' ? '목표 자산을 입력하세요' : '목표 월 배당을 입력하세요'}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
              {goalType === 'asset' ? '원' : '원/월'}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-body font-medium mb-2">목표 달성 기간</label>
          <div className="relative">
            <input
              type="range"
              min="1"
              max="30"
              value={goalSettings.timeHorizon}
              onChange={(e) => handleGoalChange('timeHorizon', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between mt-2">
              <span className="text-xs text-gray-500">1년</span>
              <span className="text-sm font-medium" style={{color: 'var(--accent-blue)'}}>
                {goalSettings.timeHorizon}년
              </span>
              <span className="text-xs text-gray-500">30년</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-body font-medium mb-2">기대 수익률</label>
          <div className="relative">
            <input
              type="range"
              min="3"
              max="20"
              step="0.5"
              value={goalSettings.expectedReturn}
              onChange={(e) => handleGoalChange('expectedReturn', parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between mt-2">
              <span className="text-xs text-gray-500">3%</span>
              <span className="text-sm font-medium" style={{color: 'var(--accent-green)'}}>
                연 {goalSettings.expectedReturn}%
              </span>
              <span className="text-xs text-gray-500">20%</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-body font-medium mb-2">우선순위</label>
          <select
            value={goalSettings.priority}
            onChange={(e) => handleGoalChange('priority', e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="high">높음 - 최우선 목표</option>
            <option value="medium">보통 - 중요한 목표</option>
            <option value="low">낮음 - 장기 목표</option>
          </select>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <button
          onClick={onPrev}
          className="flex items-center gap-2 px-6 py-3 border rounded-lg hover:bg-gray-50"
        >
          <ChevronLeft className="w-4 h-4" /> 이전
        </button>

        <button
          onClick={onNext}
          disabled={!goalSettings.targetAmount || !goalSettings.timeHorizon}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            goalSettings.targetAmount && goalSettings.timeHorizon
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          분석 결과 보기 <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const Step4Analysis = ({ goalType, personalInfo, goalSettings, onNext, onPrev, onComplete }) => {
  // 목표 달성 가능성 분석
  const analysis = useMemo(() => {
    if (goalType === 'asset') {
      return GoalCalculationEngine.calculateAssetGoal(
        112000000, // 현재 자산
        goalSettings.targetAmount,
        personalInfo.monthlyInvestment,
        goalSettings.expectedReturn,
        goalSettings.timeHorizon
      );
    } else {
      return GoalCalculationEngine.calculateDividendGoal(
        1200000, // 현재 월 배당
        goalSettings.targetAmount,
        personalInfo.monthlyInvestment,
        4.5, // 평균 배당률
        goalSettings.expectedReturn,
        goalSettings.timeHorizon
      );
    }
  }, [goalType, goalSettings, personalInfo]);

  // AI 분석
  const aiAnalysis = useMemo(() => {
    return AIRecommendationEngine.analyzeCurrentSituation({
      currentAsset: 112000000,
      monthlyDividend: 1200000,
      monthlyIncome: personalInfo.monthlyIncome,
      age: personalInfo.age,
      investmentExperience: personalInfo.investmentExperience,
      riskTolerance: personalInfo.riskTolerance
    });
  }, [personalInfo]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-title mb-3">목표 분석 결과</h2>
        <p className="text-body" style={{color: 'var(--text-secondary)'}}>
          AI가 분석한 목표 달성 가능성과 개선 방안을 확인하세요
        </p>
      </div>

      {/* 달성 가능성 */}
      <div className="card-premium p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            analysis.isAchievable ? 'bg-green-100' : 'bg-orange-100'
          }`}>
            {analysis.isAchievable ?
              <CheckCircle className="w-6 h-6 text-green-600" /> :
              <AlertCircle className="w-6 h-6 text-orange-600" />
            }
          </div>
          <div>
            <h3 className="text-subtitle">목표 달성 가능성</h3>
            <p className="text-caption" style={{color: 'var(--text-secondary)'}}>
              현재 계획으로 달성 확률 {analysis.achievabilityRate}%
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-body font-medium mb-3">예상 결과</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-caption">목표 {goalType === 'asset' ? '자산' : '월 배당'}</span>
                <span className="font-medium">
                  {goalType === 'asset'
                    ? `${(goalSettings.targetAmount / 100000000).toFixed(1)}억원`
                    : `${(goalSettings.targetAmount / 10000).toFixed(0)}만원`
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-caption">예상 달성값</span>
                <span className="font-medium" style={{color: analysis.isAchievable ? 'var(--accent-green)' : 'var(--accent-orange)'}}>
                  {goalType === 'asset'
                    ? `${(analysis.projectedAsset / 100000000).toFixed(1)}억원`
                    : `${(analysis.projectedDividend / 10000).toFixed(0)}만원`
                  }
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-body font-medium mb-3">개선 방안</h4>
            <div className="space-y-2">
              {!analysis.isAchievable && goalType === 'asset' && (
                <div className="text-caption">
                  목표 달성을 위한 권장 월 투자금:
                  <span className="font-medium ml-1" style={{color: 'var(--accent-blue)'}}>
                    {(analysis.requiredMonthlyInvestment / 10000).toFixed(0)}만원
                  </span>
                </div>
              )}
              {!analysis.isAchievable && goalType === 'dividend' && (
                <div className="text-caption">
                  추가 필요 자산:
                  <span className="font-medium ml-1" style={{color: 'var(--accent-blue)'}}>
                    {(analysis.additionalAssetNeeded / 100000000).toFixed(1)}억원
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI 분석 */}
      <div className="card-premium p-6">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-6 h-6" style={{color: 'var(--accent-purple)'}} />
          <h3 className="text-subtitle">AI 종합 분석</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-body font-medium mb-3 text-green-700">강점</h4>
            <div className="space-y-2">
              {aiAnalysis.strengths.map((strength, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 text-green-600" />
                  <span className="text-caption">{strength}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-body font-medium mb-3 text-orange-700">개선점</h4>
            <div className="space-y-2">
              {aiAnalysis.improvements.map((improvement, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <Info className="w-4 h-4 mt-0.5 text-orange-600" />
                  <span className="text-caption">{improvement}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <button
          onClick={onPrev}
          className="flex items-center gap-2 px-6 py-3 border rounded-lg hover:bg-gray-50"
        >
          <ChevronLeft className="w-4 h-4" /> 이전
        </button>

        <button
          onClick={onComplete}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <CheckCircle className="w-4 h-4" />
          목표 설정 완료
        </button>
      </div>
    </div>
  );
};

// 메인 마법사 컴포넌트
const IntelligentGoalWizard = ({ isOpen, onClose, currentAsset, monthlyDividend, onGoalSet, currentPortfolio = {}, onGoalCreated = () => {} }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedGoalType, setSelectedGoalType] = useState('');
  const [personalInfo, setPersonalInfo] = useState({
    age: '',
    monthlyIncome: '',
    monthlyInvestment: '',
    investmentExperience: '',
    riskTolerance: ''
  });

  // 배당 데이터 가져오기
  const { calendarData, monthlyDividendSchedule } = getDividendScheduleData();
  const [goalSettings, setGoalSettings] = useState({
    targetAmount: '',
    timeHorizon: 10,
    expectedReturn: 10,
    priority: 'high'
  });

  const steps = [
    { number: 1, title: '목표 유형', component: Step1GoalType },
    { number: 2, title: '개인 정보', component: Step2PersonalInfo },
    { number: 3, title: '목표 설정', component: Step3GoalSetting },
    { number: 4, title: '분석 결과', component: Step4Analysis }
  ];

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    const goalData = {
      type: selectedGoalType,
      personalInfo,
      settings: goalSettings,
      createdAt: new Date().toISOString()
    };

    onGoalSet(goalData);
    onClose();
  };

  const resetWizard = () => {
    setCurrentStep(1);
    setSelectedGoalType('');
    setPersonalInfo({
      age: '',
      monthlyIncome: '',
      monthlyInvestment: '',
      investmentExperience: '',
      riskTolerance: ''
    });
    setGoalSettings({
      targetAmount: '',
      timeHorizon: 10,
      expectedReturn: 10,
      priority: 'high'
    });
  };

  if (!isOpen) return null;

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6" style={{color: 'var(--accent-blue)'}} />
            <h1 className="text-title">인텔리전트 목표 설정</h1>
          </div>
          <button
            onClick={() => {
              resetWizard();
              onClose();
            }}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* 진행률 표시 */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-center justify-between mb-2">
            {steps.map(step => (
              <div
                key={step.number}
                className={`flex items-center ${step.number < steps.length ? 'flex-1' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step.number
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step.number}
                </div>
                <div className="ml-2">
                  <div className={`text-sm font-medium ${
                    currentStep >= step.number ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </div>
                </div>
                {step.number < steps.length && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 콘텐츠 */}
        <div className="p-6">
          <CurrentStepComponent
            selectedGoalType={selectedGoalType}
            setSelectedGoalType={setSelectedGoalType}
            personalInfo={personalInfo}
            setPersonalInfo={setPersonalInfo}
            goalType={selectedGoalType}
            goalSettings={goalSettings}
            setGoalSettings={setGoalSettings}
            onNext={handleNext}
            onPrev={handlePrev}
            onComplete={handleComplete}
          />
        </div>
      </div>
    </div>
  );
};

export default IntelligentGoalWizard;