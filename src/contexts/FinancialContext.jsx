import React, { createContext, useContext, useState, useEffect } from 'react';

const FinancialContext = createContext(null);

// 기본 데이터
const defaultData = {
  personal: {
    name: '사용자',
    age: 35,
    retirementAge: 60,
    riskProfile: 'balanced', // conservative | balanced | aggressive
    monthlyIncome: 5000000,
    familyMembers: 3
  },
  assets: {
    totalInvestmentAssets: 112000000,
    cash: 12000000,
    stocks: {
      domestic: 45000000,
      overseas: 32000000
    },
    etf: 15000000,
    bonds: 8000000,
    monthlyInvestment: 800000
  },
  income: {
    monthlyDividend: 1200000,
    annualBonus: 10000000,
    otherIncome: 0
  },
  pension: {
    nationalPension: {
      contributionYears: 10,
      averageSalary: 4000000
    },
    dc: {
      currentBalance: 20000000,
      monthlyContribution: 300000,
      employerContribution: 300000
    },
    irp: {
      currentBalance: 5000000,
      monthlyContribution: 300000
    },
    pensionSavings: {
      currentBalance: 10000000,
      monthlyContribution: 400000
    }
  },
  goals: []
};

export const FinancialProvider = ({ children }) => {
  // localStorage에서 불러오기 (영속성)
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem('financialData');
      return saved ? JSON.parse(saved) : defaultData;
    } catch (error) {
      console.error('Failed to load financial data from localStorage:', error);
      return defaultData;
    }
  });

  // 데이터 변경 시 localStorage에 저장
  useEffect(() => {
    try {
      localStorage.setItem('financialData', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save financial data to localStorage:', error);
    }
  }, [data]);

  // 개인 정보 업데이트
  const updatePersonal = (updates) => {
    setData(prev => ({
      ...prev,
      personal: { ...prev.personal, ...updates }
    }));
  };

  // 자산 정보 업데이트
  const updateAssets = (updates) => {
    setData(prev => ({
      ...prev,
      assets: { ...prev.assets, ...updates }
    }));
  };

  // 주식 자산 업데이트 (nested)
  const updateStocks = (updates) => {
    setData(prev => ({
      ...prev,
      assets: {
        ...prev.assets,
        stocks: { ...prev.assets.stocks, ...updates }
      }
    }));
  };

  // 수입 정보 업데이트
  const updateIncome = (updates) => {
    setData(prev => ({
      ...prev,
      income: { ...prev.income, ...updates }
    }));
  };

  // 연금 정보 업데이트
  const updatePension = (category, updates) => {
    setData(prev => ({
      ...prev,
      pension: {
        ...prev.pension,
        [category]: { ...prev.pension[category], ...updates }
      }
    }));
  };

  // 목표 추가
  const addGoal = (goal) => {
    setData(prev => ({
      ...prev,
      goals: [...prev.goals, { ...goal, id: `goal-${Date.now()}` }]
    }));
  };

  // 목표 업데이트
  const updateGoal = (goalId, updates) => {
    setData(prev => ({
      ...prev,
      goals: prev.goals.map(g =>
        g.id === goalId ? { ...g, ...updates } : g
      )
    }));
  };

  // 목표 삭제
  const deleteGoal = (goalId) => {
    setData(prev => ({
      ...prev,
      goals: prev.goals.filter(g => g.id !== goalId)
    }));
  };

  // 초기화
  const resetToDefaults = () => {
    if (window.confirm('모든 데이터를 초기화하시겠습니까?')) {
      setData(defaultData);
      localStorage.removeItem('financialData');
    }
  };

  // 데이터 전체 교체 (import 기능용)
  const setAllData = (newData) => {
    setData(newData);
  };

  const value = {
    data,
    updatePersonal,
    updateAssets,
    updateStocks,
    updateIncome,
    updatePension,
    addGoal,
    updateGoal,
    deleteGoal,
    resetToDefaults,
    setAllData
  };

  return (
    <FinancialContext.Provider value={value}>
      {children}
    </FinancialContext.Provider>
  );
};

// Custom Hook
export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error('useFinancial must be used within FinancialProvider');
  }
  return context;
};

export default FinancialContext;
