import React, { useState, useMemo } from 'react';
import { X, Building2, TrendingUp, Calculator, Package, Target, ChevronRight } from 'lucide-react';
import {
  calculateNationalPension,
  calculateDCPension,
  calculateIRP,
  calculatePensionSavings,
  calculateTaxDeduction,
  calculateRetirementIncome,
  diagnosePensionCompleteness
} from '../utils/pensionCalculator';

const PensionDashboard = ({
  isOpen = false,
  onClose = () => {},
  initialData = {},
  currentInvestmentAssets = 112000000,
  monthlyDividend = 1200000,
  className = ""
}) => {
  const [activeTab, setActiveTab] = useState('overview'); // overview, simulator, tax, products

  // 예시 데이터 (실제로는 사용자 입력이나 DB에서 가져옴)
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

    const diagnosis = diagnosePensionCompleteness({
      nationalPension,
      dcPension,
      irp,
      pensionSavings
    });

    return {
      nationalPension,
      dcPension,
      irp,
      pensionSavings,
      taxDeduction,
      retirementIncome,
      diagnosis
    };
  }, [pensionParams, currentInvestmentAssets]);

  if (!isOpen) return null;

  const tabs = [
    { id: 'overview', label: '종합 현황', icon: Building2 },
    { id: 'simulator', label: '노후 시뮬레이터', icon: TrendingUp },
    { id: 'tax', label: '세액공제', icon: Calculator },
    { id: 'products', label: '상품 추천', icon: Package }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-title">연금 종합 플래너</h1>
              <p className="text-caption text-gray-600">3층 연금으로 든든한 노후 준비</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex border-b px-6 flex-shrink-0 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 콘텐츠 */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <OverviewTab
              calculations={calculations}
              pensionParams={pensionParams}
              currentInvestmentAssets={currentInvestmentAssets}
            />
          )}
          {activeTab === 'simulator' && (
            <SimulatorTab
              calculations={calculations}
              pensionParams={pensionParams}
              setPensionParams={setPensionParams}
            />
          )}
          {activeTab === 'tax' && (
            <TaxTab
              calculations={calculations}
              pensionParams={pensionParams}
              setPensionParams={setPensionParams}
            />
          )}
          {activeTab === 'products' && (
            <ProductsTab
              diagnosis={calculations.diagnosis}
              pensionParams={pensionParams}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// 종합 현황 탭
const OverviewTab = ({ calculations, pensionParams, currentInvestmentAssets }) => {
  const { nationalPension, dcPension, irp, pensionSavings, retirementIncome, diagnosis } = calculations;

  const totalPensionAssets =
    (dcPension.totalBalance || 0) +
    (irp.totalBalance || 0) +
    (pensionSavings.totalBalance || 0);

  return (
    <div className="space-y-6">
      {/* 총 노후 자산 */}
      <div className="card-premium p-6">
        <h3 className="text-subtitle mb-4">총 노후 자산 (예상)</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-xs text-blue-700 mb-1">투자 자산</div>
            <div className="text-xl font-bold text-blue-900">
              {(currentInvestmentAssets / 100000000).toFixed(1)}억원
            </div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-xs text-green-700 mb-1">연금 자산</div>
            <div className="text-xl font-bold text-green-900">
              {(totalPensionAssets / 100000000).toFixed(1)}억원
            </div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg border-2 border-purple-500">
            <div className="text-xs text-purple-700 mb-1">총 노후 자산</div>
            <div className="text-2xl font-bold text-purple-900">
              {((currentInvestmentAssets + totalPensionAssets) / 100000000).toFixed(1)}억원
            </div>
          </div>
        </div>
      </div>

      {/* 예상 월 소득 */}
      <div className="card-premium p-6">
        <h3 className="text-subtitle mb-4">은퇴 후 예상 월 소득 ({pensionParams.retirementAge}세 기준)</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-xs text-blue-700 mb-1">국민연금</div>
            <div className="text-lg font-bold text-blue-900">
              {(nationalPension.monthlyAmount / 10000).toFixed(0)}만원
            </div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="text-xs text-green-700 mb-1">퇴직연금</div>
            <div className="text-lg font-bold text-green-900">
              {(dcPension.monthlyPension / 10000).toFixed(0)}만원
            </div>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <div className="text-xs text-purple-700 mb-1">IRP</div>
            <div className="text-lg font-bold text-purple-900">
              {(irp.monthlyPension / 10000).toFixed(0)}만원
            </div>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg">
            <div className="text-xs text-orange-700 mb-1">연금저축</div>
            <div className="text-lg font-bold text-orange-900">
              {(pensionSavings.monthlyPension / 10000).toFixed(0)}만원
            </div>
          </div>
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <div className="text-xs text-white mb-1">총 월 소득</div>
            <div className="text-xl font-bold text-white">
              {(retirementIncome.totalMonthlyIncome / 10000).toFixed(0)}만원
            </div>
          </div>
        </div>
      </div>

      {/* 3층 완성도 */}
      <div className="card-premium p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-subtitle">3층 연금 완성도</h3>
          <div className="text-2xl font-bold text-blue-600">{diagnosis.overallScore}점</div>
        </div>
        <div className="space-y-2">
          {diagnosis.recommendations.map((rec, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm text-orange-700 bg-orange-50 p-2 rounded">
              <ChevronRight className="w-4 h-4" />
              {rec}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 시뮬레이터 탭 (간단 버전)
const SimulatorTab = ({ calculations, pensionParams, setPensionParams }) => {
  return (
    <div className="space-y-6">
      <div className="card-premium p-6">
        <h3 className="text-subtitle mb-4">연령별 예상 월 소득</h3>
        <div className="space-y-3">
          {calculations.retirementIncome.incomeByAge.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-semibold">{item.age}세</span>
              <span className="text-lg font-bold text-blue-600">
                {(item.total / 10000).toFixed(0)}만원/월
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 세액공제 탭 (간단 버전)
const TaxTab = ({ calculations }) => {
  const { taxDeduction } = calculations;

  return (
    <div className="space-y-6">
      <div className="card-premium p-6">
        <h3 className="text-subtitle mb-4">연간 세액공제 혜택</h3>
        <div className="text-center p-6 bg-green-50 rounded-xl">
          <div className="text-sm text-green-700 mb-2">총 세액공제</div>
          <div className="text-4xl font-bold text-green-900 mb-1">
            {(taxDeduction.totalTaxDeduction / 10000).toFixed(0)}만원
          </div>
          <div className="text-xs text-green-600">연간 절세 효과</div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-xs text-blue-700 mb-1">연금저축</div>
            <div className="text-lg font-bold text-blue-900">
              {(taxDeduction.pensionSavingsTaxDeduction / 10000).toFixed(0)}만원
            </div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="text-xs text-purple-700 mb-1">IRP</div>
            <div className="text-lg font-bold text-purple-900">
              {(taxDeduction.irpTaxDeduction / 10000).toFixed(0)}만원
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 상품 추천 탭 (간단 버전)
const ProductsTab = ({ diagnosis, pensionParams }) => {
  const age = pensionParams.age;
  const ageGroup = age < 30 ? '20대' : age < 40 ? '30대' : age < 50 ? '40대' : '50대';

  const recommendations = [
    {
      priority: 1,
      product: '국민연금',
      reason: '기본 공적연금으로 필수',
      action: diagnosis.layer1.status === 'active' ? '가입 완료 ✓' : '가입 필요'
    },
    {
      priority: 2,
      product: 'IRP (개인형 퇴직연금)',
      reason: '세액공제 최대 900만원',
      action: diagnosis.layer2.status === 'active' ? '가입 완료 ✓' : '가입 추천'
    },
    {
      priority: 3,
      product: '연금저축',
      reason: '세액공제 600만원 + 복리 효과',
      action: diagnosis.layer3.status === 'active' ? '가입 완료 ✓' : '가입 추천'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="card-premium p-6">
        <h3 className="text-subtitle mb-4">{ageGroup} 추천 연금 상품</h3>
        <div className="space-y-3">
          {recommendations.map((rec, idx) => (
            <div key={idx} className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">{rec.priority}. {rec.product}</span>
                <span className={`text-sm px-2 py-1 rounded ${
                  rec.action.includes('완료') ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {rec.action}
                </span>
              </div>
              <div className="text-sm text-gray-700">{rec.reason}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PensionDashboard;
