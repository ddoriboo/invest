// 공유 배당 데이터
export const getDividendScheduleData = () => {
  const currentYear = new Date().getFullYear();

  // 실제 보유 종목의 배당 데이터 (InvestmentDashboard의 데이터와 동기화)
  const monthlyDividendSchedule = [
    {
      month: '1월',
      total: 448000,
      dividends: [
        { name: 'KODEX 고배당', amount: 125000, date: '1/31', shares: 1000, status: 'confirmed' },
        { name: 'ARIRANG 고배당', amount: 120000, date: '1/15', shares: 800, status: 'confirmed' },
        { name: 'TIGER 미국배당다우존스', amount: 135000, date: '1/10', shares: 500, status: 'confirmed' },
        { name: 'SPYD ETF', amount: 68000, date: '1/31', shares: 300, status: 'confirmed' }
      ]
    },
    {
      month: '2월',
      total: 448000,
      dividends: [
        { name: 'KODEX 고배당', amount: 125000, date: '2/28', shares: 1000, status: 'confirmed' },
        { name: 'ARIRANG 고배당', amount: 120000, date: '2/15', shares: 800, status: 'confirmed' },
        { name: 'TIGER 미국배당다우존스', amount: 135000, date: '2/10', shares: 500, status: 'confirmed' },
        { name: 'SPYD ETF', amount: 68000, date: '2/28', shares: 300, status: 'confirmed' }
      ]
    },
    {
      month: '3월',
      total: 448000,
      dividends: [
        { name: 'KODEX 고배당', amount: 125000, date: '3/31', shares: 1000, status: 'confirmed' },
        { name: 'ARIRANG 고배당', amount: 120000, date: '3/15', shares: 800, status: 'confirmed' },
        { name: 'TIGER 미국배당다우존스', amount: 135000, date: '3/10', shares: 500, status: 'confirmed' },
        { name: 'SPYD ETF', amount: 68000, date: '3/31', shares: 300, status: 'confirmed' }
      ]
    },
    {
      month: '4월',
      total: 613000,
      dividends: [
        { name: 'LG화학', amount: 165000, date: '4/15', shares: 30, status: 'confirmed' },
        { name: 'KODEX 고배당', amount: 125000, date: '4/30', shares: 1000, status: 'confirmed' },
        { name: 'ARIRANG 고배당', amount: 120000, date: '4/15', shares: 800, status: 'confirmed' },
        { name: 'TIGER 미국배당다우존스', amount: 135000, date: '4/10', shares: 500, status: 'confirmed' },
        { name: 'SPYD ETF', amount: 68000, date: '4/30', shares: 300, status: 'confirmed' }
      ]
    },
    {
      month: '5월',
      total: 693000,
      dividends: [
        { name: '한국전력공사', amount: 245000, date: '5/10', shares: 300, status: 'confirmed' },
        { name: 'KODEX 고배당', amount: 125000, date: '5/31', shares: 1000, status: 'confirmed' },
        { name: 'ARIRANG 고배당', amount: 120000, date: '5/15', shares: 800, status: 'confirmed' },
        { name: 'TIGER 미국배당다우존스', amount: 135000, date: '5/10', shares: 500, status: 'confirmed' },
        { name: 'SPYD ETF', amount: 68000, date: '5/31', shares: 300, status: 'confirmed' }
      ]
    },
    {
      month: '6월',
      total: 448000,
      dividends: [
        { name: 'KODEX 고배당', amount: 125000, date: '6/30', shares: 1000, status: 'confirmed' },
        { name: 'ARIRANG 고배당', amount: 120000, date: '6/15', shares: 800, status: 'confirmed' },
        { name: 'TIGER 미국배당다우존스', amount: 135000, date: '6/10', shares: 500, status: 'confirmed' },
        { name: 'SPYD ETF', amount: 68000, date: '6/30', shares: 300, status: 'confirmed' }
      ]
    },
    {
      month: '7월',
      total: 448000,
      dividends: [
        { name: 'KODEX 고배당', amount: 125000, date: '7/31', shares: 1000, status: 'confirmed' },
        { name: 'ARIRANG 고배당', amount: 120000, date: '7/15', shares: 800, status: 'confirmed' },
        { name: 'TIGER 미국배당다우존스', amount: 135000, date: '7/10', shares: 500, status: 'confirmed' },
        { name: 'SPYD ETF', amount: 68000, date: '7/31', shares: 300, status: 'confirmed' }
      ]
    },
    {
      month: '8월',
      total: 448000,
      dividends: [
        { name: 'KODEX 고배당', amount: 125000, date: '8/31', shares: 1000, status: 'confirmed' },
        { name: 'ARIRANG 고배당', amount: 120000, date: '8/15', shares: 800, status: 'confirmed' },
        { name: 'TIGER 미국배당다우존스', amount: 135000, date: '8/10', shares: 500, status: 'confirmed' },
        { name: 'SPYD ETF', amount: 68000, date: '8/31', shares: 300, status: 'confirmed' }
      ]
    },
    {
      month: '9월',
      total: 448000,
      dividends: [
        { name: 'KODEX 고배당', amount: 125000, date: '9/30', shares: 1000, status: 'confirmed' },
        { name: 'ARIRANG 고배당', amount: 120000, date: '9/15', shares: 800, status: 'confirmed' },
        { name: 'TIGER 미국배당다우존스', amount: 135000, date: '9/10', shares: 500, status: 'confirmed' },
        { name: 'SPYD ETF', amount: 68000, date: '9/30', shares: 300, status: 'confirmed' }
      ]
    },
    {
      month: '10월',
      total: 448000,
      dividends: [
        { name: 'KODEX 고배당', amount: 125000, date: '10/31', shares: 1000, status: 'predicted', confidence: 0.95 },
        { name: 'ARIRANG 고배당', amount: 120000, date: '10/15', shares: 800, status: 'confirmed', confidence: 1.0 },
        { name: 'TIGER 미국배당다우존스', amount: 135000, date: '10/10', shares: 500, status: 'confirmed', confidence: 1.0 },
        { name: 'SPYD ETF', amount: 68000, date: '10/31', shares: 300, status: 'predicted', confidence: 0.9 }
      ]
    },
    {
      month: '11월',
      total: 448000,
      dividends: [
        { name: 'KODEX 고배당', amount: 125000, date: '11/30', shares: 1000, status: 'predicted', confidence: 0.95 },
        { name: 'ARIRANG 고배당', amount: 120000, date: '11/15', shares: 800, status: 'predicted', confidence: 0.95 },
        { name: 'TIGER 미국배당다우존스', amount: 135000, date: '11/10', shares: 500, status: 'predicted', confidence: 0.95 },
        { name: 'SPYD ETF', amount: 68000, date: '11/30', shares: 300, status: 'predicted', confidence: 0.9 }
      ]
    },
    {
      month: '12월',
      total: 993000,
      dividends: [
        { name: 'SK텔레콤', amount: 280000, date: '12/15', shares: 163, status: 'predicted', confidence: 0.88 },
        { name: 'KT&G', amount: 265000, date: '12/20', shares: 120, status: 'predicted', confidence: 0.92 },
        { name: 'KODEX 고배당', amount: 125000, date: '12/31', shares: 1000, status: 'predicted', confidence: 0.95 },
        { name: 'ARIRANG 고배당', amount: 120000, date: '12/15', shares: 800, status: 'predicted', confidence: 0.95 },
        { name: 'TIGER 미국배당다우존스', amount: 135000, date: '12/10', shares: 500, status: 'predicted', confidence: 0.95 },
        { name: 'SPYD ETF', amount: 68000, date: '12/31', shares: 300, status: 'predicted', confidence: 0.9 }
      ]
    }
  ];

  // 캘린더용 형식으로 변환
  const calendarData = {};

  monthlyDividendSchedule.forEach((monthData, index) => {
    const monthNumber = index + 1;
    const monthKey = `${currentYear}-${String(monthNumber).padStart(2, '0')}`;

    calendarData[monthKey] = monthData.dividends.map((dividend, idx) => {
      // 날짜 파싱 (예: "10/31" -> "2024-10-31")
      const [month, day] = dividend.date.split('/');
      const paymentDate = `${currentYear}-${String(monthNumber).padStart(2, '0')}-${day.padStart(2, '0')}`;
      const exDividendDate = `${currentYear}-${String(monthNumber).padStart(2, '0')}-${String(parseInt(day) - 1).padStart(2, '0')}`;

      return {
        id: `${dividend.name.replace(/\s/g, '_')}_${currentYear}_${monthNumber}_${idx}`,
        stockName: dividend.name,
        stockCode: '', // 실제 종목 코드 필요시 추가
        exDividendDate: exDividendDate,
        paymentDate: paymentDate,
        dividendPerShare: Math.round(dividend.amount / (dividend.shares || 1)),
        expectedAmount: dividend.amount,
        shares: dividend.shares || 0,
        status: dividend.status || 'confirmed',
        confidence: dividend.confidence || 1.0,
        paymentQuarter: getQuarter(monthNumber)
      };
    });
  });

  return { calendarData, monthlyDividendSchedule };
};

// 분기 계산 헬퍼
const getQuarter = (month) => {
  if (month <= 3) return 'Q1';
  if (month <= 6) return 'Q2';
  if (month <= 9) return 'Q3';
  return 'Q4';
};

// 배당 세금 계산 유틸리티
export const calculateDividendTax = (grossAmount) => {
  const DIVIDEND_TAX_RATE = 0.154; // 15.4% (소득세 14% + 지방소득세 1.4%)
  const tax = Math.round(grossAmount * DIVIDEND_TAX_RATE);
  const netAmount = grossAmount - tax;

  return {
    gross: grossAmount,
    tax: tax,
    net: netAmount,
    taxRate: DIVIDEND_TAX_RATE
  };
};

// 배당 정보에 세금 계산 추가
export const enrichDividendWithTax = (dividend) => {
  const taxInfo = calculateDividendTax(dividend.expectedAmount);
  return {
    ...dividend,
    grossAmount: taxInfo.gross,
    taxAmount: taxInfo.tax,
    netAmount: taxInfo.net,
    taxRate: taxInfo.taxRate
  };
};

// 연간 배당 통계
export const getAnnualDividendStats = (monthlyDividendSchedule) => {
  const currentMonth = new Date().getMonth() + 1;

  // 현재까지 누적 배당 (이미 받은 배당)
  const accumulatedDividend = monthlyDividendSchedule
    .slice(0, currentMonth)
    .reduce((sum, month) => sum + month.total, 0);

  const accumulatedTaxInfo = calculateDividendTax(accumulatedDividend);

  // 연간 예상 총 배당
  const annualExpected = monthlyDividendSchedule
    .reduce((sum, month) => sum + month.total, 0);

  const annualTaxInfo = calculateDividendTax(annualExpected);

  // 작년 총 배당 (예시 - 실제로는 DB에서 가져와야 함)
  const lastYearTotal = 5280000; // 작년 총 배당 예시

  // 성장률 계산
  const growthRate = ((annualExpected - lastYearTotal) / lastYearTotal * 100).toFixed(1);

  return {
    accumulated: accumulatedDividend,
    accumulatedNet: accumulatedTaxInfo.net,
    accumulatedTax: accumulatedTaxInfo.tax,
    annualExpected: annualExpected,
    annualExpectedNet: annualTaxInfo.net,
    annualExpectedTax: annualTaxInfo.tax,
    growthRate: growthRate
  };
};