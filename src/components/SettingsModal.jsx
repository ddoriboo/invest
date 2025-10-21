import React, { useState } from 'react';
import { X, User, Wallet, TrendingUp, Building2, Save, RotateCcw } from 'lucide-react';
import { useFinancial } from '../contexts/FinancialContext';

const SettingsModal = ({ isOpen, onClose }) => {
  const { data, updatePersonal, updateAssets, updateStocks, updateIncome, updatePension, resetToDefaults } = useFinancial();
  const [activeTab, setActiveTab] = useState('personal');

  if (!isOpen) return null;

  const tabs = [
    { id: 'personal', label: '개인 정보', icon: User },
    { id: 'assets', label: '자산', icon: Wallet },
    { id: 'income', label: '수입', icon: TrendingUp },
    { id: 'pension', label: '연금', icon: Building2 }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">설정</h2>
            <p className="text-sm text-gray-600">재무 정보를 관리하세요</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetToDefaults}
              className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              초기화
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 탭 */}
        <div className="flex border-b px-6">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
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
          {activeTab === 'personal' && (
            <PersonalTab
              data={data.personal}
              updatePersonal={updatePersonal}
            />
          )}
          {activeTab === 'assets' && (
            <AssetsTab
              data={data.assets}
              updateAssets={updateAssets}
              updateStocks={updateStocks}
            />
          )}
          {activeTab === 'income' && (
            <IncomeTab
              data={data.income}
              updateIncome={updateIncome}
            />
          )}
          {activeTab === 'pension' && (
            <PensionTab
              data={data.pension}
              updatePension={updatePension}
              personalAge={data.personal.age}
            />
          )}
        </div>

        {/* 푸터 */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-600">
              💾 변경사항은 자동으로 저장됩니다
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              완료
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 개인 정보 탭
const PersonalTab = ({ data, updatePersonal }) => {
  const [formData, setFormData] = useState(data);

  const handleChange = (field, value) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    updatePersonal({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {/* 이름 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            이름
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="홍길동"
          />
        </div>

        {/* 나이 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            나이
          </label>
          <input
            type="number"
            value={formData.age}
            onChange={(e) => handleChange('age', parseInt(e.target.value) || 0)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="35"
          />
        </div>

        {/* 은퇴 희망 나이 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            은퇴 희망 나이
          </label>
          <input
            type="number"
            value={formData.retirementAge}
            onChange={(e) => handleChange('retirementAge', parseInt(e.target.value) || 0)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="60"
          />
        </div>

        {/* 월 소득 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            월 소득
          </label>
          <input
            type="number"
            value={formData.monthlyIncome}
            onChange={(e) => handleChange('monthlyIncome', parseInt(e.target.value) || 0)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="5000000"
          />
          <p className="text-xs text-gray-500 mt-1">
            {(formData.monthlyIncome / 10000).toLocaleString()}만원
          </p>
        </div>

        {/* 가족 구성원 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            가족 구성원
          </label>
          <input
            type="number"
            value={formData.familyMembers}
            onChange={(e) => handleChange('familyMembers', parseInt(e.target.value) || 0)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="3"
          />
          <p className="text-xs text-gray-500 mt-1">본인 포함</p>
        </div>

        {/* 투자 성향 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            투자 성향
          </label>
          <select
            value={formData.riskProfile}
            onChange={(e) => handleChange('riskProfile', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="conservative">보수적 (안정형)</option>
            <option value="balanced">중립 (균형형)</option>
            <option value="aggressive">공격적 (적극형)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

// 자산 탭
const AssetsTab = ({ data, updateAssets, updateStocks }) => {
  const [formData, setFormData] = useState(data);

  const handleChange = (field, value) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    updateAssets({ [field]: value });
  };

  const handleStockChange = (field, value) => {
    const newStocks = { ...formData.stocks, [field]: value };
    setFormData({ ...formData, stocks: newStocks });
    updateStocks({ [field]: value });
  };

  // 총 투자 자산 자동 계산
  const totalCalculated =
    formData.cash +
    formData.stocks.domestic +
    formData.stocks.overseas +
    formData.etf +
    formData.bonds;

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">총 투자 자산</h3>
        <p className="text-2xl font-bold text-blue-600">
          {(totalCalculated / 100000000).toFixed(2)}억원
        </p>
        <p className="text-xs text-blue-700 mt-1">
          하위 자산들의 합계입니다
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* 현금/예금 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            현금/예금
          </label>
          <input
            type="number"
            value={formData.cash}
            onChange={(e) => handleChange('cash', parseInt(e.target.value) || 0)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            {(formData.cash / 10000).toLocaleString()}만원
          </p>
        </div>

        {/* 국내주식 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            국내주식
          </label>
          <input
            type="number"
            value={formData.stocks.domestic}
            onChange={(e) => handleStockChange('domestic', parseInt(e.target.value) || 0)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            {(formData.stocks.domestic / 10000).toLocaleString()}만원
          </p>
        </div>

        {/* 해외주식 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            해외주식
          </label>
          <input
            type="number"
            value={formData.stocks.overseas}
            onChange={(e) => handleStockChange('overseas', parseInt(e.target.value) || 0)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            {(formData.stocks.overseas / 10000).toLocaleString()}만원
          </p>
        </div>

        {/* ETF */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ETF
          </label>
          <input
            type="number"
            value={formData.etf}
            onChange={(e) => handleChange('etf', parseInt(e.target.value) || 0)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            {(formData.etf / 10000).toLocaleString()}만원
          </p>
        </div>

        {/* 채권 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            채권
          </label>
          <input
            type="number"
            value={formData.bonds}
            onChange={(e) => handleChange('bonds', parseInt(e.target.value) || 0)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            {(formData.bonds / 10000).toLocaleString()}만원
          </p>
        </div>

        {/* 월 투자금 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            월 투자금
          </label>
          <input
            type="number"
            value={formData.monthlyInvestment}
            onChange={(e) => handleChange('monthlyInvestment', parseInt(e.target.value) || 0)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            {(formData.monthlyInvestment / 10000).toLocaleString()}만원
          </p>
        </div>
      </div>
    </div>
  );
};

// 수입 탭
const IncomeTab = ({ data, updateIncome }) => {
  const [formData, setFormData] = useState(data);

  const handleChange = (field, value) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    updateIncome({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {/* 월 배당 수익 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            월 배당 수익
          </label>
          <input
            type="number"
            value={formData.monthlyDividend}
            onChange={(e) => handleChange('monthlyDividend', parseInt(e.target.value) || 0)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            {(formData.monthlyDividend / 10000).toLocaleString()}만원
          </p>
        </div>

        {/* 연간 보너스 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            연간 보너스
          </label>
          <input
            type="number"
            value={formData.annualBonus}
            onChange={(e) => handleChange('annualBonus', parseInt(e.target.value) || 0)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            {(formData.annualBonus / 10000).toLocaleString()}만원
          </p>
        </div>

        {/* 기타 수입 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            기타 월 수입
          </label>
          <input
            type="number"
            value={formData.otherIncome}
            onChange={(e) => handleChange('otherIncome', parseInt(e.target.value) || 0)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            {(formData.otherIncome / 10000).toLocaleString()}만원
          </p>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-green-900 mb-2">총 월 수입</h3>
        <p className="text-2xl font-bold text-green-600">
          {((formData.monthlyDividend + formData.otherIncome) / 10000).toLocaleString()}만원
        </p>
        <p className="text-xs text-green-700 mt-1">
          배당 수익 + 기타 수입
        </p>
      </div>
    </div>
  );
};

// 연금 탭
const PensionTab = ({ data, updatePension, personalAge }) => {
  const [formData, setFormData] = useState(data);

  const handleChange = (category, field, value) => {
    const newCategoryData = { ...formData[category], [field]: value };
    setFormData({ ...formData, [category]: newCategoryData });
    updatePension(category, { [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* 1층: 국민연금 */}
      <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">1층: 국민연금</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              가입 연수
            </label>
            <input
              type="number"
              value={formData.nationalPension.contributionYears}
              onChange={(e) => handleChange('nationalPension', 'contributionYears', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.nationalPension.contributionYears}년
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              평균 월급
            </label>
            <input
              type="number"
              value={formData.nationalPension.averageSalary}
              onChange={(e) => handleChange('nationalPension', 'averageSalary', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              {(formData.nationalPension.averageSalary / 10000).toLocaleString()}만원
            </p>
          </div>
        </div>
      </div>

      {/* 2층: 퇴직연금 */}
      <div className="border border-green-200 rounded-lg p-4 bg-green-50">
        <h3 className="text-lg font-semibold text-green-900 mb-4">2층: 퇴직연금</h3>

        {/* DC */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-800 mb-2">DC (확정기여형)</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                현재 잔액
              </label>
              <input
                type="number"
                value={formData.dc.currentBalance}
                onChange={(e) => handleChange('dc', 'currentBalance', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                {(formData.dc.currentBalance / 10000).toLocaleString()}만원
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                본인 월 납입
              </label>
              <input
                type="number"
                value={formData.dc.monthlyContribution}
                onChange={(e) => handleChange('dc', 'monthlyContribution', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                {(formData.dc.monthlyContribution / 10000).toLocaleString()}만원
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                회사 납입
              </label>
              <input
                type="number"
                value={formData.dc.employerContribution}
                onChange={(e) => handleChange('dc', 'employerContribution', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                {(formData.dc.employerContribution / 10000).toLocaleString()}만원
              </p>
            </div>
          </div>
        </div>

        {/* IRP */}
        <div>
          <h4 className="text-sm font-semibold text-gray-800 mb-2">IRP (개인형 퇴직연금)</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                현재 잔액
              </label>
              <input
                type="number"
                value={formData.irp.currentBalance}
                onChange={(e) => handleChange('irp', 'currentBalance', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                {(formData.irp.currentBalance / 10000).toLocaleString()}만원
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                월 납입
              </label>
              <input
                type="number"
                value={formData.irp.monthlyContribution}
                onChange={(e) => handleChange('irp', 'monthlyContribution', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                {(formData.irp.monthlyContribution / 10000).toLocaleString()}만원
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3층: 개인연금 */}
      <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
        <h3 className="text-lg font-semibold text-purple-900 mb-4">3층: 개인연금 (연금저축)</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              현재 잔액
            </label>
            <input
              type="number"
              value={formData.pensionSavings.currentBalance}
              onChange={(e) => handleChange('pensionSavings', 'currentBalance', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              {(formData.pensionSavings.currentBalance / 10000).toLocaleString()}만원
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              월 납입
            </label>
            <input
              type="number"
              value={formData.pensionSavings.monthlyContribution}
              onChange={(e) => handleChange('pensionSavings', 'monthlyContribution', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              {(formData.pensionSavings.monthlyContribution / 10000).toLocaleString()}만원
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
