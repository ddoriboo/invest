import React, { useState, useMemo } from 'react';
import { Calculator, TrendingUp, DollarSign, Target, Zap, Settings, Info, X } from 'lucide-react';
import ScenarioComparisonChart from './ScenarioComparisonChart';
import {
  simulateMultipleScenarios,
  calculateRequiredMonthlyInvestment,
  calculateRequiredAssetForDividend,
  analyzeWhatIf,
  calculateGoalAchievement
} from '../utils/simulationEngine';

const InteractiveGoalSimulator = ({
  isOpen = false,
  onClose = () => {},
  initialParams = {},
  goalType = 'asset',
  className = ''
}) => {
  // 시뮬레이션 파라미터
  const [params, setParams] = useState({
    currentAsset: initialParams.currentAsset || 112000000,
    monthlyInvestment: initialParams.monthlyInvestment || 800000,
    years: initialParams.years || 10,
    dividendYield: initialParams.dividendYield || 4.5,
    targetAsset: initialParams.targetAsset || 300000000,
    targetMonthlyDividend: initialParams.targetMonthlyDividend || 2000000,
  });

  const [whatIfMode, setWhatIfMode] = useState(false);
  const [whatIfChanges, setWhatIfChanges] = useState({
    monthlyInvestment: 0,
    annualReturn: 10,
    years: 0
  });

  // 시나리오 시뮬레이션
  const scenarios = useMemo(() => {
    return simulateMultipleScenarios({
      currentAsset: params.currentAsset,
      monthlyInvestment: params.monthlyInvestment,
      years: params.years,
      dividendYield: params.dividendYield
    });
  }, [params]);

  // 목표 달성 분석
  const goalAchievement = useMemo(() => {
    if (goalType === 'asset') {
      return calculateGoalAchievement({
        currentAsset: params.currentAsset,
        targetAsset: params.targetAsset,
        monthlyInvestment: params.monthlyInvestment,
        annualReturn: 10, // 중립 시나리오 기준
        maxYears: 30
      });
    } else {
      const requiredAsset = calculateRequiredAssetForDividend(
        params.targetMonthlyDividend,
        params.dividendYield
      );

      return calculateGoalAchievement({
        currentAsset: params.currentAsset,
        targetAsset: requiredAsset,
        monthlyInvestment: params.monthlyInvestment,
        annualReturn: 10,
        maxYears: 30
      });
    }
  }, [params, goalType]);

  // 필요 투자금 계산
  const requiredInvestment = useMemo(() => {
    if (goalType === 'asset') {
      return calculateRequiredMonthlyInvestment({
        currentAsset: params.currentAsset,
        targetAsset: params.targetAsset,
        annualReturn: 10,
        years: params.years
      });
    } else {
      const requiredAsset = calculateRequiredAssetForDividend(
        params.targetMonthlyDividend,
        params.dividendYield
      );

      return calculateRequiredMonthlyInvestment({
        currentAsset: params.currentAsset,
        targetAsset: requiredAsset,
        annualReturn: 10,
        years: params.years
      });
    }
  }, [params, goalType]);

  // What-if 분석
  const whatIfAnalysis = useMemo(() => {
    if (!whatIfMode) return null;

    const changes = {};
    if (whatIfChanges.monthlyInvestment !== 0) {
      changes.monthlyInvestment = params.monthlyInvestment + whatIfChanges.monthlyInvestment;
    }
    if (whatIfChanges.annualReturn !== 10) {
      changes.annualReturn = whatIfChanges.annualReturn;
    }
    if (whatIfChanges.years !== 0) {
      changes.years = params.years + whatIfChanges.years;
    }

    return analyzeWhatIf(
      {
        currentAsset: params.currentAsset,
        monthlyInvestment: params.monthlyInvestment,
        annualReturn: 10,
        years: params.years
      },
      changes
    );
  }, [whatIfMode, whatIfChanges, params]);

  const handleParamChange = (key, value) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const handleWhatIfChange = (key, value) => {
    setWhatIfChanges(prev => ({ ...prev, [key]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <Calculator className="w-6 h-6" style={{color: 'var(--accent-blue)'}} />
            <h1 className="text-title">인터랙티브 투자 시뮬레이터</h1>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 파라미터 조정 패널 */}
          <div className="card-premium p-6">
            <div className="flex items-center gap-2 mb-6">
              <Settings className="w-5 h-5" style={{color: 'var(--accent-blue)'}} />
              <h3 className="text-subtitle">시뮬레이션 설정</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 현재 자산 */}
              <div>
                <label className="block text-body font-medium mb-2">
                  현재 자산
                </label>
                <input
                  type="range"
                  min="0"
                  max="500000000"
                  step="10000000"
                  value={params.currentAsset}
                  onChange={(e) => handleParamChange('currentAsset', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-gray-500">0원</span>
                  <span className="text-sm font-semibold" style={{color: 'var(--accent-blue)'}}>
                    {(params.currentAsset / 100000000).toFixed(1)}억원
                  </span>
                  <span className="text-xs text-gray-500">5억원</span>
                </div>
              </div>

              {/* 월 투자금 */}
              <div>
                <label className="block text-body font-medium mb-2">
                  월 투자금
                </label>
                <input
                  type="range"
                  min="0"
                  max="5000000"
                  step="100000"
                  value={params.monthlyInvestment}
                  onChange={(e) => handleParamChange('monthlyInvestment', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-gray-500">0원</span>
                  <span className="text-sm font-semibold" style={{color: 'var(--accent-green)'}}>
                    {(params.monthlyInvestment / 10000).toFixed(0)}만원/월
                  </span>
                  <span className="text-xs text-gray-500">500만원</span>
                </div>
              </div>

              {/* 투자 기간 */}
              <div>
                <label className="block text-body font-medium mb-2">
                  투자 기간
                </label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={params.years}
                  onChange={(e) => handleParamChange('years', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-gray-500">1년</span>
                  <span className="text-sm font-semibold" style={{color: 'var(--accent-purple)'}}>
                    {params.years}년
                  </span>
                  <span className="text-xs text-gray-500">30년</span>
                </div>
              </div>

              {/* 배당 수익률 */}
              <div>
                <label className="block text-body font-medium mb-2">
                  평균 배당 수익률
                </label>
                <input
                  type="range"
                  min="2"
                  max="10"
                  step="0.5"
                  value={params.dividendYield}
                  onChange={(e) => handleParamChange('dividendYield', parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-gray-500">2%</span>
                  <span className="text-sm font-semibold" style={{color: 'var(--accent-orange)'}}>
                    연 {params.dividendYield}%
                  </span>
                  <span className="text-xs text-gray-500">10%</span>
                </div>
              </div>
            </div>
          </div>

          {/* 시나리오 비교 차트 */}
          <ScenarioComparisonChart
            scenarios={scenarios}
            viewType={goalType}
          />

          {/* 목표 달성 분석 */}
          <div className="card-premium p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5" style={{color: 'var(--accent-green)'}} />
              <h3 className="text-subtitle">목표 달성 분석</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-caption text-blue-700 mb-1">달성 가능성</div>
                <div className="text-title" style={{color: goalAchievement.achievable ? 'var(--accent-green)' : 'var(--accent-red)'}}>
                  {goalAchievement.achievable ? '가능' : '불가능'}
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  {goalAchievement.message}
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-caption text-green-700 mb-1">필요 월 투자금</div>
                <div className="text-title text-green-700">
                  {(requiredInvestment / 10000).toFixed(0)}만원
                </div>
                <div className="text-xs text-green-600 mt-1">
                  현재 대비 {((requiredInvestment - params.monthlyInvestment) / 10000).toFixed(0)}만원 {
                    requiredInvestment > params.monthlyInvestment ? '추가' : '감소'
                  }
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-caption text-purple-700 mb-1">
                  중립 시나리오 결과
                </div>
                <div className="text-title text-purple-700">
                  {goalType === 'asset'
                    ? `${(scenarios.moderate.finalAsset / 100000000).toFixed(1)}억원`
                    : `${(scenarios.moderate.finalMonthlyDividend / 10000).toFixed(0)}만원/월`
                  }
                </div>
                <div className="text-xs text-purple-600 mt-1">
                  연 10% 수익률 기준
                </div>
              </div>
            </div>
          </div>

          {/* What-if 분석 */}
          <div className="card-premium p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5" style={{color: 'var(--accent-orange)'}} />
                <h3 className="text-subtitle">What-if 분석</h3>
              </div>
              <button
                onClick={() => setWhatIfMode(!whatIfMode)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  whatIfMode
                    ? 'bg-orange-600 text-white'
                    : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                }`}
              >
                {whatIfMode ? '끄기' : '켜기'}
              </button>
            </div>

            {whatIfMode && (
              <div className="space-y-4">
                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-start gap-2 mb-4">
                    <Info className="w-4 h-4 text-orange-600 mt-0.5" />
                    <div className="text-sm text-orange-700">
                      조건을 변경하여 다양한 시나리오의 영향을 즉시 확인할 수 있습니다
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 월 투자금 변경 */}
                    <div>
                      <label className="block text-caption text-orange-900 mb-2">
                        월 투자금 변경
                      </label>
                      <input
                        type="range"
                        min="-2000000"
                        max="2000000"
                        step="100000"
                        value={whatIfChanges.monthlyInvestment}
                        onChange={(e) => handleWhatIfChange('monthlyInvestment', parseInt(e.target.value))}
                        className="w-full"
                      />
                      <div className="text-center mt-2 text-sm font-semibold text-orange-700">
                        {whatIfChanges.monthlyInvestment >= 0 ? '+' : ''}{(whatIfChanges.monthlyInvestment / 10000).toFixed(0)}만원
                      </div>
                    </div>

                    {/* 수익률 변경 */}
                    <div>
                      <label className="block text-caption text-orange-900 mb-2">
                        기대 수익률
                      </label>
                      <input
                        type="range"
                        min="3"
                        max="20"
                        step="0.5"
                        value={whatIfChanges.annualReturn}
                        onChange={(e) => handleWhatIfChange('annualReturn', parseFloat(e.target.value))}
                        className="w-full"
                      />
                      <div className="text-center mt-2 text-sm font-semibold text-orange-700">
                        연 {whatIfChanges.annualReturn}%
                      </div>
                    </div>

                    {/* 기간 변경 */}
                    <div>
                      <label className="block text-caption text-orange-900 mb-2">
                        투자 기간 변경
                      </label>
                      <input
                        type="range"
                        min="-10"
                        max="10"
                        value={whatIfChanges.years}
                        onChange={(e) => handleWhatIfChange('years', parseInt(e.target.value))}
                        className="w-full"
                      />
                      <div className="text-center mt-2 text-sm font-semibold text-orange-700">
                        {whatIfChanges.years >= 0 ? '+' : ''}{whatIfChanges.years}년
                      </div>
                    </div>
                  </div>
                </div>

                {whatIfAnalysis && (
                  <div className="p-4 bg-white border-2 border-orange-200 rounded-lg">
                    <div className="text-subtitle text-orange-900 mb-2">분석 결과</div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-caption text-gray-600">기존 예상 자산</span>
                        <span className="font-semibold">
                          {(whatIfAnalysis.baseResult / 100000000).toFixed(1)}억원
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-caption text-gray-600">변경 후 예상 자산</span>
                        <span className="font-semibold" style={{
                          color: whatIfAnalysis.difference > 0 ? 'var(--accent-green)' : 'var(--accent-red)'
                        }}>
                          {(whatIfAnalysis.changedResult / 100000000).toFixed(1)}억원
                        </span>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="text-sm font-semibold" style={{
                          color: whatIfAnalysis.difference > 0 ? 'var(--accent-green)' : 'var(--accent-red)'
                        }}>
                          {whatIfAnalysis.description}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          ({whatIfAnalysis.percentageChange >= 0 ? '+' : ''}{whatIfAnalysis.percentageChange}% 변화)
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 액션 버튼 */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              닫기
            </button>
            <button
              onClick={() => {
                // 현재 파라미터를 기본값으로 저장하는 기능 (추후 구현)
                alert('현재 설정이 저장되었습니다!');
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              이 설정으로 목표 생성
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveGoalSimulator;
