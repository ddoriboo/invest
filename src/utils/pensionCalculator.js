// 3층 연금 계산 유틸리티

/**
 * 1층: 국민연금 예상 수령액 계산
 * 간이 계산식 사용 (실제는 더 복잡함)
 */
export const calculateNationalPension = ({
  averageSalary = 3000000, // 평균 월급
  contributionYears = 20, // 가입 기간 (년)
  inflationRate = 2.5 // 물가상승률
}) => {
  // 2024년 기준 A값 (전체 가입자 평균소득월액): 약 2,861,091원
  const aValue = 2861091;

  // B값 (본인의 가입기간 중 기준소득월액의 평균액)
  const bValue = averageSalary;

  // 기본연금액 = 1.2 × (A값 + B값) / 2 × (1 + 0.05 × 가입연수/12)
  // 단순화: 기본연금액 = (A + B) / 2 × 가입연수 계수
  const yearCoefficient = 1 + (0.05 * contributionYears / 12);
  const basicAmount = 1.2 * (aValue + bValue) / 2 * yearCoefficient;

  // 월 예상 수령액 (소득대체율 고려)
  const monthlyAmount = Math.round(basicAmount * 0.85); // 약 85% 수준

  // 65세 수령 기준
  const startAge = 65;

  // 연간 총액
  const annualAmount = monthlyAmount * 12;

  return {
    monthlyAmount,
    annualAmount,
    startAge,
    contributionYears,
    estimatedLifeExpectancy: 85, // 평균 기대수명
    totalLifetimeAmount: monthlyAmount * 12 * (85 - 65) // 20년간 총 수령액
  };
};

/**
 * 2층: 퇴직연금 (DC형) 예상 잔액 계산
 */
export const calculateDCPension = ({
  currentBalance = 0, // 현재 잔액
  monthlyContribution = 200000, // 월 납입액
  employerContribution = 200000, // 회사 분담금
  annualReturn = 5.0, // 연 수익률 (%)
  yearsToRetirement = 20, // 은퇴까지 년수
  retirementAge = 60 // 은퇴 연령
}) => {
  const monthlyReturn = annualReturn / 12 / 100;
  const totalMonths = yearsToRetirement * 12;
  const totalMonthlyContribution = monthlyContribution + employerContribution;

  // 현재 잔액의 미래가치
  const currentBalanceFuture = currentBalance * Math.pow(1 + monthlyReturn, totalMonths);

  // 월 납입금의 미래가치 (연금의 미래가치 공식)
  const contributionFuture = totalMonthlyContribution *
    ((Math.pow(1 + monthlyReturn, totalMonths) - 1) / monthlyReturn);

  const totalBalance = Math.round(currentBalanceFuture + contributionFuture);

  // 연금 수령 계산 (20년 분할)
  const withdrawalYears = 20;
  const withdrawalMonths = withdrawalYears * 12;
  const monthlyWithdrawalReturn = 3.0 / 12 / 100; // 수령 기간 중 3% 수익률

  // 연금 월 수령액 계산 (정액형 연금 공식)
  const monthlyPension = Math.round(
    totalBalance * monthlyWithdrawalReturn /
    (1 - Math.pow(1 + monthlyWithdrawalReturn, -withdrawalMonths))
  );

  return {
    totalBalance,
    monthlyPension,
    annualPension: monthlyPension * 12,
    startAge: retirementAge,
    withdrawalYears,
    totalContributed: (monthlyContribution + employerContribution) * totalMonths
  };
};

/**
 * 2층: IRP (개인형 퇴직연금) 계산
 */
export const calculateIRP = ({
  currentBalance = 0,
  monthlyContribution = 300000,
  annualReturn = 5.5,
  yearsToRetirement = 20,
  retirementAge = 60
}) => {
  // DC형과 동일한 로직
  return calculateDCPension({
    currentBalance,
    monthlyContribution,
    employerContribution: 0, // IRP는 개인만 납입
    annualReturn,
    yearsToRetirement,
    retirementAge
  });
};

/**
 * 3층: 연금저축 계산
 */
export const calculatePensionSavings = ({
  currentBalance = 0,
  monthlyPayment = 300000,
  annualReturn = 6.0,
  yearsToRetirement = 20,
  retirementAge = 55 // 연금저축은 55세부터 수령 가능
}) => {
  const monthlyReturn = annualReturn / 12 / 100;
  const totalMonths = yearsToRetirement * 12;

  // 현재 잔액의 미래가치
  const currentBalanceFuture = currentBalance * Math.pow(1 + monthlyReturn, totalMonths);

  // 월 납입금의 미래가치
  const paymentFuture = monthlyPayment *
    ((Math.pow(1 + monthlyReturn, totalMonths) - 1) / monthlyReturn);

  const totalBalance = Math.round(currentBalanceFuture + paymentFuture);

  // 연금 수령 (10년 이상 분할 수령 시 비과세)
  const withdrawalYears = 20;
  const withdrawalMonths = withdrawalYears * 12;
  const monthlyWithdrawalReturn = 4.0 / 12 / 100;

  const monthlyPension = Math.round(
    totalBalance * monthlyWithdrawalReturn /
    (1 - Math.pow(1 + monthlyWithdrawalReturn, -withdrawalMonths))
  );

  return {
    totalBalance,
    monthlyPension,
    annualPension: monthlyPension * 12,
    startAge: retirementAge,
    withdrawalYears,
    totalContributed: monthlyPayment * totalMonths
  };
};

/**
 * 세액공제 계산
 */
export const calculateTaxDeduction = ({
  annualIncome = 50000000, // 연간 총급여
  irpContribution = 0, // IRP 연간 납입액
  pensionSavingsContribution = 0 // 연금저축 연간 납입액
}) => {
  // 세액공제율: 총급여 5,500만원 이하 15%, 초과 12%
  const deductionRate = annualIncome <= 55000000 ? 0.15 : 0.12;

  // 연금저축 한도: 600만원
  const pensionSavingsLimit = 6000000;
  const pensionSavingsDeductible = Math.min(pensionSavingsContribution, pensionSavingsLimit);

  // IRP 추가 한도: 300만원 (연금저축과 합쳐 900만원)
  const irpLimit = 3000000;
  const totalLimit = pensionSavingsLimit + irpLimit;
  const totalContribution = pensionSavingsContribution + irpContribution;
  const totalDeductible = Math.min(totalContribution, totalLimit);

  // 연금저축 세액공제
  const pensionSavingsTaxDeduction = Math.round(pensionSavingsDeductible * deductionRate);

  // IRP 세액공제 (연금저축 초과분만)
  const irpDeductible = Math.max(0, totalDeductible - pensionSavingsDeductible);
  const irpTaxDeduction = Math.round(irpDeductible * deductionRate);

  // 총 세액공제
  const totalTaxDeduction = pensionSavingsTaxDeduction + irpTaxDeduction;

  // 최대 세액공제 (최적 납입 시)
  const maxTaxDeduction = Math.round(totalLimit * deductionRate);

  return {
    totalTaxDeduction,
    pensionSavingsTaxDeduction,
    irpTaxDeduction,
    maxTaxDeduction,
    remainingLimit: Math.max(0, totalLimit - totalContribution),
    deductionRate: deductionRate * 100,
    recommendation: {
      pensionSavings: Math.min(pensionSavingsContribution || pensionSavingsLimit, pensionSavingsLimit),
      irp: Math.min(irpContribution || irpLimit, irpLimit)
    }
  };
};

/**
 * 노후 월 소득 통합 계산
 */
export const calculateRetirementIncome = ({
  age = 35, // 현재 나이
  retirementAge = 60, // 은퇴 희망 연령
  currentAssets = 0, // 현재 투자 자산
  monthlyInvestment = 0, // 월 투자금
  expectedReturn = 8.0, // 투자 수익률
  dividendYield = 4.5, // 배당 수익률
  nationalPension = {}, // 국민연금 정보
  dcPension = {}, // 퇴직연금 정보
  irp = {}, // IRP 정보
  pensionSavings = {} // 연금저축 정보
}) => {
  const yearsToRetirement = retirementAge - age;

  // 투자 자산 예상 (배당 재투자 고려)
  const monthlyReturn = expectedReturn / 12 / 100;
  const totalMonths = yearsToRetirement * 12;

  const futureInvestmentAssets = currentAssets * Math.pow(1 + monthlyReturn, totalMonths) +
    monthlyInvestment * ((Math.pow(1 + monthlyReturn, totalMonths) - 1) / monthlyReturn);

  // 배당 수익 (은퇴 후)
  const monthlyDividend = Math.round(futureInvestmentAssets * (dividendYield / 100) / 12);

  // 각 연금 계산
  const nationalPensionAmount = nationalPension.monthlyAmount || 0;
  const dcPensionAmount = dcPension.monthlyPension || 0;
  const irpAmount = irp.monthlyPension || 0;
  const pensionSavingsAmount = pensionSavings.monthlyPension || 0;

  // 총 월 소득
  const totalMonthlyIncome = nationalPensionAmount + dcPensionAmount +
    irpAmount + pensionSavingsAmount + monthlyDividend;

  // 연령대별 시뮬레이션
  const incomeByAge = [];
  for (let simAge = retirementAge; simAge <= 85; simAge += 5) {
    let income = {
      age: simAge,
      nationalPension: simAge >= 65 ? nationalPensionAmount : 0,
      dcPension: dcPensionAmount,
      irp: irpAmount,
      pensionSavings: simAge >= 55 ? pensionSavingsAmount : 0,
      dividend: monthlyDividend,
      total: 0
    };

    income.total = income.nationalPension + income.dcPension +
      income.irp + income.pensionSavings + income.dividend;

    incomeByAge.push(income);
  }

  return {
    retirementAge,
    totalMonthlyIncome,
    breakdown: {
      nationalPension: nationalPensionAmount,
      dcPension: dcPensionAmount,
      irp: irpAmount,
      pensionSavings: pensionSavingsAmount,
      dividend: monthlyDividend
    },
    futureInvestmentAssets: Math.round(futureInvestmentAssets),
    incomeByAge
  };
};

/**
 * 3층 연금 완성도 진단
 */
export const diagnosePensionCompleteness = (pensionData) => {
  const diagnosis = {
    layer1: { status: 'unknown', score: 0 },
    layer2: { status: 'unknown', score: 0 },
    layer3: { status: 'unknown', score: 0 },
    overallScore: 0,
    recommendations: []
  };

  // 1층: 국민연금
  if (pensionData.nationalPension?.monthlyAmount > 0) {
    diagnosis.layer1.status = 'active';
    diagnosis.layer1.score = 100;
  } else {
    diagnosis.layer1.status = 'missing';
    diagnosis.recommendations.push('국민연금 가입이 필요합니다');
  }

  // 2층: 퇴직연금
  const hasRetirementPension =
    (pensionData.dcPension?.totalBalance > 0) ||
    (pensionData.irp?.totalBalance > 0);

  if (hasRetirementPension) {
    diagnosis.layer2.status = 'active';
    diagnosis.layer2.score = 100;
  } else {
    diagnosis.layer2.status = 'missing';
    diagnosis.recommendations.push('퇴직연금(DC/IRP) 가입을 추천합니다');
  }

  // 3층: 개인연금
  if (pensionData.pensionSavings?.totalBalance > 0) {
    diagnosis.layer3.status = 'active';
    diagnosis.layer3.score = 100;
  } else {
    diagnosis.layer3.status = 'partial';
    diagnosis.layer3.score = 50;
    diagnosis.recommendations.push('세액공제 혜택을 위해 연금저축 가입을 추천합니다');
  }

  diagnosis.overallScore = Math.round(
    (diagnosis.layer1.score + diagnosis.layer2.score + diagnosis.layer3.score) / 3
  );

  return diagnosis;
};

/**
 * 연금 수령액 최적화 계산
 * 현재 납입액 대비 최적 납입액으로 증액 시 예상 수령액
 */
export const calculateOptimizedPension = ({
  currentParams = {},
  targetReturnRate = 6.0, // 목표 수익률
  taxDeductionLimit = 9000000 // 세액공제 한도
}) => {
  const {
    age = 35,
    retirementAge = 60,
    dcBalance = 0,
    dcMonthlyContribution = 0,
    irpBalance = 0,
    irpMonthlyContribution = 0,
    pensionSavingsBalance = 0,
    pensionSavingsMonthly = 0
  } = currentParams;

  const yearsToRetirement = retirementAge - age;

  // 세액공제 한도를 최대로 활용하는 최적 납입액
  // 연금저축: 6백만원, IRP: 3백만원 (합계 9백만원)
  const optimalPensionSavingsMonthly = 6000000 / 12; // 50만원
  const optimalIrpMonthly = 3000000 / 12; // 25만원

  // 최적화된 IRP 계산
  const optimizedIrp = calculateIRP({
    currentBalance: irpBalance,
    monthlyContribution: optimalIrpMonthly,
    annualReturn: targetReturnRate,
    yearsToRetirement
  });

  // 최적화된 연금저축 계산
  const optimizedPensionSavings = calculatePensionSavings({
    currentBalance: pensionSavingsBalance,
    monthlyPayment: optimalPensionSavingsMonthly,
    annualReturn: targetReturnRate,
    yearsToRetirement
  });

  // 최적화된 DC (현재 유지)
  const optimizedDc = calculateDCPension({
    currentBalance: dcBalance,
    monthlyContribution: dcMonthlyContribution,
    employerContribution: dcMonthlyContribution,
    annualReturn: targetReturnRate,
    yearsToRetirement
  });

  // 총 최적화된 월 수령액
  const totalOptimizedMonthly =
    optimizedDc.monthlyPension +
    optimizedIrp.monthlyPension +
    optimizedPensionSavings.monthlyPension;

  // 현재 대비 증가분
  const currentTotal =
    (dcMonthlyContribution || 0) +
    (irpMonthlyContribution || 0) +
    (pensionSavingsMonthly || 0);

  const optimalTotal =
    (dcMonthlyContribution || 0) +
    optimalIrpMonthly +
    optimalPensionSavingsMonthly;

  const monthlyIncrease = optimalTotal - currentTotal;

  return {
    optimizedIrp,
    optimizedPensionSavings,
    optimizedDc,
    totalOptimizedMonthly,
    monthlyIncrease,
    recommendations: {
      irpMonthly: optimalIrpMonthly,
      pensionSavingsMonthly: optimalPensionSavingsMonthly,
      dcMonthly: dcMonthlyContribution
    }
  };
};

export default {
  calculateNationalPension,
  calculateDCPension,
  calculateIRP,
  calculatePensionSavings,
  calculateTaxDeduction,
  calculateRetirementIncome,
  diagnosePensionCompleteness,
  calculateOptimizedPension
};
