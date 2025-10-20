import React, { useState, useMemo } from 'react';
import { Building2, TrendingUp, Calculator, ChevronDown, ChevronUp } from 'lucide-react';
import PensionLayerCard from './PensionLayerCard';
import PensionSummaryGrid from './PensionSummaryGrid';
import OptimizationComparisonCard from './OptimizationComparisonCard';
import {
  calculateNationalPension,
  calculateDCPension,
  calculateIRP,
  calculatePensionSavings,
  calculateTaxDeduction,
  calculateRetirementIncome,
  calculateOptimizedPension
} from '../utils/pensionCalculator';

/**
 * 연금 종합 플래너 페이지
 * 3개 HTML 디자인 참고 (20대/40대/55+)
 */
const PensionPage = ({
  currentInvestmentAssets = 112000000,
  monthlyDividend = 1200000
}) => {
  // 연금 파라미터 (예시 데이터)
  const [pensionParams, setPensionParams] = useState({
    age: 35,
    retirementAge: 60,
    averageSalary: 4000000,
    contributionYears: 10,
    dcBalance: 20000000,
    dcMonthlyContribution: 300000,
    irpBalance: 5000000,
    irpMonthlyContribution: 300000,
    pensionSavingsBalance: 10000000,
    pensionSavingsMonthly: 400000,
    annualIncome: 50000000
  });

  const [expandedSections, setExpandedSections] = useState({
    ageGuide: false,
    simulator: false,
    taxOptimization: false,
    qna: false
  });

  // 연금 계산
  const calculations = useMemo(() => {
    const nationalPension = calculateNationalPension({
      averageSalary: pensionParams.averageSalary,
      contributionYears: pensionParams.contributionYears
    });

    const dcPension = calculateDCPension({
      currentBalance: pensionParams.dcBalance,
      monthlyContribution: pensionParams.dcMonthlyContribution,
      employerContribution: pensionParams.dcMonthlyContribution,
      yearsToRetirement: pensionParams.retirementAge - pensionParams.age
    });

    const irp = calculateIRP({
      currentBalance: pensionParams.irpBalance,
      monthlyContribution: pensionParams.irpMonthlyContribution,
      yearsToRetirement: pensionParams.retirementAge - pensionParams.age
    });

    const pensionSavings = calculatePensionSavings({
      currentBalance: pensionParams.pensionSavingsBalance,
      monthlyPayment: pensionParams.pensionSavingsMonthly,
      yearsToRetirement: pensionParams.retirementAge - pensionParams.age
    });

    const taxDeduction = calculateTaxDeduction({
      annualIncome: pensionParams.annualIncome,
      irpContribution: pensionParams.irpMonthlyContribution * 12,
      pensionSavingsContribution: pensionParams.pensionSavingsMonthly * 12
    });

    const retirementIncome = calculateRetirementIncome({
      age: pensionParams.age,
      retirementAge: pensionParams.retirementAge,
      currentAssets: currentInvestmentAssets,
      monthlyInvestment: 800000,
      expectedReturn: 8.0,
      dividendYield: 4.5,
      nationalPension,
      dcPension,
      irp,
      pensionSavings
    });

    const optimized = calculateOptimizedPension({
      currentParams: pensionParams
    });

    return {
      nationalPension,
      dcPension,
      irp,
      pensionSavings,
      taxDeduction,
      retirementIncome,
      optimized
    };
  }, [pensionParams, currentInvestmentAssets]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // 총 연금 자산
  const totalPensionAssets =
    (calculations.dcPension.totalBalance || 0) +
    (calculations.irp.totalBalance || 0) +
    (calculations.pensionSavings.totalBalance || 0);

  // 총 월 예상 수령액
  const totalMonthlyIncome = calculations.retirementIncome.totalMonthlyIncome;

  // 최적화된 수령액 (calculateOptimizedPension의 결과)
  const optimizedMonthlyIncome = calculations.optimized.totalOptimizedMonthly +
    (calculations.nationalPension.monthlyAmount || 0) +
    (calculations.retirementIncome.breakdown.dividend || 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* 헤더 */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">연금 종합 플래너</h1>
            <p className="text-gray-600">3층 연금으로 든든한 노후 준비</p>
          </div>
        </div>
      </div>

      {/* Dashboard Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="text-sm text-gray-600 mb-2">
          {pensionParams.age}세, 은퇴까지 {pensionParams.retirementAge - pensionParams.age}년
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-1">
          {(totalPensionAssets / 100000000).toFixed(1)}억원
        </div>
        <div className="text-sm text-gray-700">현재 연금 자산</div>

        {/* 최적화 비교 카드 */}
        <div className="mt-4">
          <OptimizationComparisonCard
            currentValue={totalMonthlyIncome}
            optimizedValue={optimizedMonthlyIncome}
            label="은퇴 후 월 예상 수령액"
          />
        </div>
      </div>

      {/* Pension Summary Grid */}
      <PensionSummaryGrid
        totalPensionAssets={totalPensionAssets}
        expectedMonthlyIncome={totalMonthlyIncome}
        annualTaxDeduction={calculations.taxDeduction.totalTaxDeduction}
        className="mb-6"
      />

      {/* 3층 연금 레이어 카드 (수평 스크롤) */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-3">3층 연금 구조</h2>
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4">
            <PensionLayerCard
              layer={1}
              title="국민연금"
              badge="1층"
              status="normal"
              currentBalance={0} // 국민연금은 잔액 개념이 없음
              expectedMonthlyPension={calculations.nationalPension.monthlyAmount}
              startAge={65}
              contributionYears={pensionParams.contributionYears}
            />
            <PensionLayerCard
              layer={2}
              title="퇴직연금"
              badge="2층"
              status="normal"
              currentBalance={calculations.dcPension.totalBalance + calculations.irp.totalBalance}
              expectedMonthlyPension={calculations.dcPension.monthlyPension + calculations.irp.monthlyPension}
              startAge={60}
              contributionYears={pensionParams.retirementAge - pensionParams.age}
            />
            <PensionLayerCard
              layer={3}
              title="개인연금"
              badge="3층"
              status={calculations.pensionSavings.totalBalance > 0 ? 'normal' : 'warning'}
              currentBalance={calculations.pensionSavings.totalBalance}
              expectedMonthlyPension={calculations.pensionSavings.monthlyPension}
              startAge={55}
              contributionYears={pensionParams.retirementAge - pensionParams.age}
            />
          </div>
        </div>
      </div>

      {/* 연령대별 맞춤 가이드 (확장/축소) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
        <button
          onClick={() => toggleSection('ageGuide')}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              {pensionParams.age < 30 ? '20대' : pensionParams.age < 40 ? '30대' : pensionParams.age < 50 ? '40대' : '50대'}
              {' '}맞춤 가이드
            </h2>
          </div>
          {expandedSections.ageGuide ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
        {expandedSections.ageGuide && (
          <div className="p-6 border-t border-gray-200">
            {pensionParams.age < 30 && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-2">⏰ 복리의 마법</h3>
                  <p className="text-sm text-green-700">
                    25세 시작하면 1억 2천만원, 35세 시작하면 6천만원!<br />
                    10년 늦으면 6천만원 차이입니다.
                  </p>
                </div>
                <div className="text-sm text-gray-700">
                  <strong>추천 전략:</strong> 월 10만원으로 시작 → 점차 증액<br />
                  <strong>핵심:</strong> 금액보다 시간이 더 중요합니다
                </div>
              </div>
            )}
            {pensionParams.age >= 30 && pensionParams.age < 50 && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">🎯 운용 최적화</h3>
                  <p className="text-sm text-blue-700">
                    납입액 증액과 포트폴리오 리밸런싱으로 수령액을 20% 이상 늘릴 수 있습니다.
                  </p>
                </div>
                <div className="text-sm text-gray-700">
                  <strong>추천 전략:</strong> 세액공제 한도 최대 활용 (연 900만원)<br />
                  <strong>핵심:</strong> 꾸준한 증액이 관건입니다
                </div>
              </div>
            )}
            {pensionParams.age >= 50 && (
              <div className="space-y-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h3 className="font-semibold text-orange-800 mb-2">💰 수령 전략</h3>
                  <p className="text-sm text-orange-700">
                    일시 수령 vs 연금 수령 세금 차이가 최대 30%!<br />
                    연금 수령이 절대적으로 유리합니다.
                  </p>
                </div>
                <div className="text-sm text-gray-700">
                  <strong>추천 전략:</strong> 10년 이상 분할 수령 (비과세)<br />
                  <strong>핵심:</strong> 수령 시기와 방법이 중요합니다
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 세액공제 최적화 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
        <button
          onClick={() => toggleSection('taxOptimization')}
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">세액공제 최적화</h2>
          </div>
          {expandedSections.taxOptimization ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>
        {expandedSections.taxOptimization && (
          <div className="p-6 border-t border-gray-200">
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">세액공제 한도 달성률</span>
                <span className="text-sm font-semibold text-gray-900">
                  {((calculations.taxDeduction.totalTaxDeduction / calculations.taxDeduction.maxTaxDeduction) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (calculations.taxDeduction.totalTaxDeduction / calculations.taxDeduction.maxTaxDeduction) * 100)}%`
                  }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-xs text-blue-700 mb-1">연금저축 공제</div>
                <div className="text-lg font-bold text-blue-900">
                  {(calculations.taxDeduction.pensionSavingsTaxDeduction / 10000).toFixed(0)}만원
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-xs text-purple-700 mb-1">IRP 공제</div>
                <div className="text-lg font-bold text-purple-900">
                  {(calculations.taxDeduction.irpTaxDeduction / 10000).toFixed(0)}만원
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
              💡 <strong>추천:</strong> 연간 {(calculations.taxDeduction.remainingLimit / 10000).toFixed(0)}만원 추가 납입 시
              최대 세액공제 혜택을 받을 수 있습니다.
            </div>
          </div>
        )}
      </div>

      {/* 액션 버튼 */}
      <div className="flex gap-3">
        <button className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
          연금 상담 신청
        </button>
        <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
          맞춤 연금 설계
        </button>
      </div>
    </div>
  );
};

export default PensionPage;
