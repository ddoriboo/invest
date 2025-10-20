// 고급 투자 시뮬레이션 엔진

/**
 * 복리 계산을 통한 미래 자산 가치 계산
 * @param {number} currentAsset - 현재 자산
 * @param {number} monthlyInvestment - 월 투자금
 * @param {number} annualReturn - 연간 수익률 (%)
 * @param {number} years - 투자 기간 (년)
 * @returns {number} 미래 자산 가치
 */
export const calculateFutureValue = (currentAsset, monthlyInvestment, annualReturn, years) => {
  const monthlyReturn = annualReturn / 12 / 100;
  const totalMonths = years * 12;

  // 현재 자산의 미래가치
  const currentAssetFuture = currentAsset * Math.pow(1 + monthlyReturn, totalMonths);

  // 월 투자금의 미래가치 (연금의 미래가치 공식)
  const monthlyInvestmentFuture = monthlyInvestment *
    ((Math.pow(1 + monthlyReturn, totalMonths) - 1) / monthlyReturn);

  return Math.round(currentAssetFuture + monthlyInvestmentFuture);
};

/**
 * 배당 수익 계산
 * @param {number} totalAsset - 총 자산
 * @param {number} dividendYield - 배당 수익률 (%)
 * @returns {number} 월 배당 수익
 */
export const calculateMonthlyDividend = (totalAsset, dividendYield) => {
  const annualDividend = totalAsset * (dividendYield / 100);
  return Math.round(annualDividend / 12);
};

/**
 * 연도별 자산 및 배당 증가 시뮬레이션
 * @param {Object} params - 시뮬레이션 파라미터
 * @returns {Array} 연도별 데이터
 */
export const simulateYearlyGrowth = ({
  currentAsset = 0,
  monthlyInvestment = 0,
  annualReturn = 10,
  dividendYield = 4.5,
  years = 10,
  dividendGrowthRate = 0 // 배당 성장률 (%)
}) => {
  const result = [];
  let asset = currentAsset;
  const monthlyReturn = annualReturn / 12 / 100;

  for (let year = 0; year <= years; year++) {
    const totalDividend = asset * (dividendYield / 100);
    const monthlyDividend = totalDividend / 12;

    result.push({
      year,
      asset: Math.round(asset),
      monthlyDividend: Math.round(monthlyDividend),
      annualDividend: Math.round(totalDividend),
      totalInvested: currentAsset + (monthlyInvestment * 12 * year),
      gains: Math.round(asset - currentAsset - (monthlyInvestment * 12 * year))
    });

    // 다음 연도 계산
    if (year < years) {
      // 12개월간 월 투자
      for (let month = 0; month < 12; month++) {
        asset = asset * (1 + monthlyReturn) + monthlyInvestment;
      }

      // 배당 성장 반영
      if (dividendGrowthRate > 0) {
        dividendYield *= (1 + dividendGrowthRate / 100);
      }
    }
  }

  return result;
};

/**
 * 3가지 시나리오 (보수적/중립/공격적) 동시 시뮬레이션
 * @param {Object} params - 기본 파라미터
 * @returns {Object} 3가지 시나리오 결과
 */
export const simulateMultipleScenarios = ({
  currentAsset = 0,
  monthlyInvestment = 0,
  years = 10,
  dividendYield = 4.5
}) => {
  const scenarios = {
    conservative: {
      label: '보수적',
      annualReturn: 5,
      color: '#ef4444',
      description: '안정적이지만 낮은 수익률'
    },
    moderate: {
      label: '중립',
      annualReturn: 10,
      color: '#3b82f6',
      description: '균형잡힌 수익률'
    },
    aggressive: {
      label: '공격적',
      annualReturn: 15,
      color: '#22c55e',
      description: '높은 수익률, 높은 변동성'
    }
  };

  const results = {};

  Object.entries(scenarios).forEach(([key, scenario]) => {
    const simulation = simulateYearlyGrowth({
      currentAsset,
      monthlyInvestment,
      annualReturn: scenario.annualReturn,
      dividendYield,
      years
    });

    results[key] = {
      ...scenario,
      data: simulation,
      finalAsset: simulation[simulation.length - 1].asset,
      finalMonthlyDividend: simulation[simulation.length - 1].monthlyDividend,
      totalGains: simulation[simulation.length - 1].gains
    };
  });

  return results;
};

/**
 * 목표 달성에 필요한 월 투자금 계산
 * @param {Object} params - 파라미터
 * @returns {number} 필요한 월 투자금
 */
export const calculateRequiredMonthlyInvestment = ({
  currentAsset,
  targetAsset,
  annualReturn,
  years
}) => {
  const monthlyReturn = annualReturn / 12 / 100;
  const totalMonths = years * 12;

  // 현재 자산의 미래가치
  const currentAssetFuture = currentAsset * Math.pow(1 + monthlyReturn, totalMonths);

  // 필요한 추가 자산
  const requiredFutureValue = targetAsset - currentAssetFuture;

  if (requiredFutureValue <= 0) return 0;

  // 연금의 미래가치 공식을 역산
  const requiredMonthlyInvestment = requiredFutureValue /
    ((Math.pow(1 + monthlyReturn, totalMonths) - 1) / monthlyReturn);

  return Math.max(0, Math.round(requiredMonthlyInvestment));
};

/**
 * 목표 배당 달성에 필요한 자산 계산
 * @param {number} targetMonthlyDividend - 목표 월 배당
 * @param {number} dividendYield - 배당 수익률 (%)
 * @returns {number} 필요한 총 자산
 */
export const calculateRequiredAssetForDividend = (targetMonthlyDividend, dividendYield) => {
  const targetAnnualDividend = targetMonthlyDividend * 12;
  return Math.round(targetAnnualDividend / (dividendYield / 100));
};

/**
 * What-if 분석: 변수 변화에 따른 영향 계산
 * @param {Object} baseParams - 기본 파라미터
 * @param {Object} changes - 변경사항
 * @returns {Object} 변화 영향 분석
 */
export const analyzeWhatIf = (baseParams, changes) => {
  const baseResult = calculateFutureValue(
    baseParams.currentAsset,
    baseParams.monthlyInvestment,
    baseParams.annualReturn,
    baseParams.years
  );

  const changedParams = { ...baseParams, ...changes };
  const changedResult = calculateFutureValue(
    changedParams.currentAsset,
    changedParams.monthlyInvestment,
    changedParams.annualReturn,
    changedParams.years
  );

  const difference = changedResult - baseResult;
  const percentageChange = ((difference / baseResult) * 100).toFixed(1);

  return {
    baseResult,
    changedResult,
    difference,
    percentageChange,
    description: generateWhatIfDescription(changes, difference)
  };
};

/**
 * What-if 변경사항 설명 생성
 */
const generateWhatIfDescription = (changes, difference) => {
  const descriptions = [];

  if (changes.monthlyInvestment) {
    const change = changes.monthlyInvestment;
    descriptions.push(`월 투자금을 ${change > 0 ? '+' : ''}${change.toLocaleString()}원 변경`);
  }

  if (changes.annualReturn) {
    descriptions.push(`연 수익률을 ${changes.annualReturn}%로 변경`);
  }

  if (changes.years) {
    descriptions.push(`투자 기간을 ${changes.years}년으로 변경`);
  }

  return `${descriptions.join(', ')}하면 ${difference > 0 ? '+' : ''}${difference.toLocaleString()}원 ${difference > 0 ? '증가' : '감소'}`;
};

/**
 * 민감도 분석: 수익률 변화에 따른 결과 계산
 * @param {Object} params - 기본 파라미터
 * @param {Array} returnRates - 분석할 수익률 배열
 * @returns {Array} 수익률별 결과
 */
export const analyzeSensitivity = (params, returnRates = [3, 5, 7, 10, 12, 15, 18, 20]) => {
  return returnRates.map(rate => ({
    returnRate: rate,
    finalAsset: calculateFutureValue(
      params.currentAsset,
      params.monthlyInvestment,
      rate,
      params.years
    ),
    monthlyDividend: calculateMonthlyDividend(
      calculateFutureValue(
        params.currentAsset,
        params.monthlyInvestment,
        rate,
        params.years
      ),
      params.dividendYield || 4.5
    )
  }));
};

/**
 * 목표 달성 시점 계산
 * @param {Object} params - 파라미터
 * @returns {Object} 달성 시점 및 경로
 */
export const calculateGoalAchievement = ({
  currentAsset,
  targetAsset,
  monthlyInvestment,
  annualReturn,
  maxYears = 30
}) => {
  const monthlyReturn = annualReturn / 12 / 100;
  let asset = currentAsset;
  let months = 0;
  const path = [{ month: 0, asset: currentAsset }];

  while (asset < targetAsset && months < maxYears * 12) {
    asset = asset * (1 + monthlyReturn) + monthlyInvestment;
    months++;

    // 6개월마다 기록
    if (months % 6 === 0) {
      path.push({
        month: months,
        year: (months / 12).toFixed(1),
        asset: Math.round(asset)
      });
    }
  }

  const achievable = asset >= targetAsset;
  const years = (months / 12).toFixed(1);

  return {
    achievable,
    months,
    years,
    finalAsset: Math.round(asset),
    path,
    message: achievable
      ? `목표 달성 예상: 약 ${years}년 후`
      : `현재 조건으로는 ${maxYears}년 내 달성 불가능`
  };
};

/**
 * 복수 목표 최적화 분석
 * @param {Array} goals - 목표 배열
 * @param {number} totalMonthlyBudget - 총 월 투자 가능 금액
 * @returns {Object} 최적 배분 제안
 */
export const optimizeMultipleGoals = (goals, totalMonthlyBudget) => {
  // 우선순위와 달성 난이도를 고려한 최적 배분
  const priorityWeights = {
    high: 3,
    medium: 2,
    low: 1
  };

  const totalWeight = goals.reduce((sum, goal) =>
    sum + priorityWeights[goal.priority || 'medium'], 0
  );

  const allocations = goals.map(goal => {
    const weight = priorityWeights[goal.priority || 'medium'];
    const allocation = Math.round((weight / totalWeight) * totalMonthlyBudget);

    const simulation = calculateGoalAchievement({
      currentAsset: goal.currentValue || 0,
      targetAsset: goal.targetValue,
      monthlyInvestment: allocation,
      annualReturn: goal.expectedReturn || 10,
      maxYears: goal.timeHorizon || 10
    });

    return {
      goalId: goal.id,
      goalName: goal.title,
      allocation,
      percentage: ((allocation / totalMonthlyBudget) * 100).toFixed(1),
      ...simulation
    };
  });

  return {
    totalBudget: totalMonthlyBudget,
    allocations,
    summary: {
      achievableGoals: allocations.filter(a => a.achievable).length,
      totalGoals: goals.length
    }
  };
};

export default {
  calculateFutureValue,
  calculateMonthlyDividend,
  simulateYearlyGrowth,
  simulateMultipleScenarios,
  calculateRequiredMonthlyInvestment,
  calculateRequiredAssetForDividend,
  analyzeWhatIf,
  analyzeSensitivity,
  calculateGoalAchievement,
  optimizeMultipleGoals
};
