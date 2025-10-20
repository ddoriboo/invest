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
      <div className="bg-white rounded-xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b bg-white z-10 flex-shrink-0">
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

        {/* 2-Column 레이아웃 */}
        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-5 h-full gap-6 p-6">
            {/* 왼쪽 컬럼: 컨트롤 패널 (Scrollable) */}
            <div className="md:col-span-2 overflow-y-auto pr-2">
              <div className="space-y-6 pb-6">
                {/* 파라미터 조정 패널 */}
                <div className="card-premium p-5">
                  <div className="flex items-center gap-2 mb-5">
                    <Settings className="w-4 h-4" style={{color: 'var(--accent-blue)'}} />
                    <h3 className="text-body font-semibold">시뮬레이션 설정</h3>
                  </div>

                  <div className="space-y-4">
                    {/* 현재 자산 */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-sm font-medium text-gray-700">현재 자산</label>
                        <span className="text-sm font-bold" style={{color: 'var(--accent-blue)'}}>
                          {(params.currentAsset / 100000000).toFixed(1)}억원
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="500000000"
                        step="10000000"
                        value={params.currentAsset}
                        onChange={(e) => handleParamChange('currentAsset', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>

                    {/* 월 투자금 */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-sm font-medium text-gray-700">월 투자금</label>
                        <span className="text-sm font-bold" style={{color: 'var(--accent-green)'}}>
                          {(params.monthlyInvestment / 10000).toFixed(0)}만원
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="5000000"
                        step="100000"
                        value={params.monthlyInvestment}
                        onChange={(e) => handleParamChange('monthlyInvestment', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                      />
                    </div>

                    {/* 투자 기간 */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-sm font-medium text-gray-700">투자 기간</label>
                        <span className="text-sm font-bold" style={{color: 'var(--accent-purple)'}}>
                          {params.years}년
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="30"
                        value={params.years}
                        onChange={(e) => handleParamChange('years', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                      />
                    </div>

                    {/* 배당 수익률 */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-sm font-medium text-gray-700">평균 배당률</label>
                        <span className="text-sm font-bold text-orange-600">
                          연 {params.dividendYield}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="10"
                        step="0.5"
                        value={params.dividendYield}
                        onChange={(e) => handleParamChange('dividendYield', parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                      />
                    </div>
                  </div>
                </div>

                {/* What-if 분석 */}
                <div className="card-premium p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-orange-600" />
                      <h3 className="text-body font-semibold">What-if 분석</h3>
                    </div>
                    <button
                      onClick={() => setWhatIfMode(!whatIfMode)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                        whatIfMode
                          ? 'bg-orange-600 text-white'
                          : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                      }`}
                    >
                      {whatIfMode ? 'OFF' : 'ON'}
                    </button>
                  </div>

                  {whatIfMode && (
                    <div className="space-y-4">
                      <div className="text-xs text-orange-700 bg-orange-50 p-2 rounded">
                        조건을 변경하여 영향을 확인하세요
                      </div>

                      {/* 월 투자금 변경 */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-sm font-medium text-gray-700">월 투자금 변경</label>
                          <span className="text-sm font-bold text-orange-600">
                            {whatIfChanges.monthlyInvestment >= 0 ? '+' : ''}{(whatIfChanges.monthlyInvestment / 10000).toFixed(0)}만원
                          </span>
                        </div>
                        <input
                          type="range"
                          min="-2000000"
                          max="2000000"
                          step="100000"
                          value={whatIfChanges.monthlyInvestment}
                          onChange={(e) => handleWhatIfChange('monthlyInvestment', parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                        />
                      </div>

                      {/* 수익률 변경 */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-sm font-medium text-gray-700">기대 수익률</label>
                          <span className="text-sm font-bold text-orange-600">
                            연 {whatIfChanges.annualReturn}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="3"
                          max="20"
                          step="0.5"
                          value={whatIfChanges.annualReturn}
                          onChange={(e) => handleWhatIfChange('annualReturn', parseFloat(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                        />
                      </div>

                      {/* 기간 변경 */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-sm font-medium text-gray-700">기간 변경</label>
                          <span className="text-sm font-bold text-orange-600">
                            {whatIfChanges.years >= 0 ? '+' : ''}{whatIfChanges.years}년
                          </span>
                        </div>
                        <input
                          type="range"
                          min="-10"
                          max="10"
                          value={whatIfChanges.years}
                          onChange={(e) => handleWhatIfChange('years', parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 액션 버튼 */}
                <button
                  onClick={() => {
                    alert('현재 설정이 저장되었습니다!');
                  }}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  이 설정으로 목표 생성
                </button>
              </div>
            </div>

            {/* 오른쪽 컬럼: 결과 영역 (Scrollable) */}
            <div className="md:col-span-3 overflow-y-auto pl-2">
              <div className="space-y-6 pb-6">
              {/* 핵심 지표 요약 */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <div className="text-xs text-blue-700 mb-1">달성 가능성</div>
                  <div className="text-lg font-bold" style={{color: goalAchievement.achievable ? 'var(--accent-green)' : 'var(--accent-red)'}}>
                    {goalAchievement.achievable ? '가능' : '불가능'}
                  </div>
                  <div className="text-xs text-blue-600 mt-1 truncate">
                    {goalAchievement.years}년 후
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <div className="text-xs text-green-700 mb-1">필요 투자금</div>
                  <div className="text-lg font-bold text-green-700">
                    {(requiredInvestment / 10000).toFixed(0)}만원
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    월 투자금
                  </div>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                  <div className="text-xs text-purple-700 mb-1">중립 시나리오</div>
                  <div className="text-lg font-bold text-purple-700">
                    {goalType === 'asset'
                      ? `${(scenarios.moderate.finalAsset / 100000000).toFixed(1)}억`
                      : `${(scenarios.moderate.finalMonthlyDividend / 10000).toFixed(0)}만원`
                    }
                  </div>
                  <div className="text-xs text-purple-600 mt-1">
                    예상 결과
                  </div>
                </div>
              </div>

              {/* 시나리오 비교 차트 */}
              <ScenarioComparisonChart
                scenarios={scenarios}
                viewType={goalType}
              />

              {/* What-if 분석 결과 */}
              {whatIfMode && whatIfAnalysis && (
                <div className="card-premium p-5 bg-orange-50 border-l-4 border-orange-500">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-orange-700" />
                    <h3 className="text-body font-semibold text-orange-900">What-if 분석 결과</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-orange-800">기존 예상</span>
                      <span className="font-semibold">
                        {(whatIfAnalysis.baseResult / 100000000).toFixed(1)}억원
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-orange-800">변경 후</span>
                      <span className="font-bold text-lg" style={{
                        color: whatIfAnalysis.difference > 0 ? 'var(--accent-green)' : 'var(--accent-red)'
                      }}>
                        {(whatIfAnalysis.changedResult / 100000000).toFixed(1)}억원
                      </span>
                    </div>
                    <div className="pt-2 border-t border-orange-200">
                      <div className="text-sm font-semibold" style={{
                        color: whatIfAnalysis.difference > 0 ? 'var(--accent-green)' : 'var(--accent-red)'
                      }}>
                        {whatIfAnalysis.description}
                      </div>
                      <div className="text-xs text-orange-700 mt-1">
                        ({whatIfAnalysis.percentageChange >= 0 ? '+' : ''}{whatIfAnalysis.percentageChange}% 변화)
                      </div>
                    </div>
                  </div>
                </div>
              )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveGoalSimulator;
