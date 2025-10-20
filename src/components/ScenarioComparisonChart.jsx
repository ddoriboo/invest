import React, { useState } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, BarChart3, DollarSign } from 'lucide-react';

const ScenarioComparisonChart = ({ scenarios, viewType = 'asset', className = '' }) => {
  const [chartType, setChartType] = useState('line'); // 'line' or 'area'
  const [selectedMetric, setSelectedMetric] = useState(viewType); // 'asset' or 'dividend'

  // 데이터 변환: 3가지 시나리오를 하나의 배열로 병합
  const chartData = scenarios.conservative.data.map((item, index) => ({
    year: item.year,
    보수적_자산: scenarios.conservative.data[index].asset,
    중립_자산: scenarios.moderate.data[index].asset,
    공격적_자산: scenarios.aggressive.data[index].asset,
    보수적_배당: scenarios.conservative.data[index].monthlyDividend,
    중립_배당: scenarios.moderate.data[index].monthlyDividend,
    공격적_배당: scenarios.aggressive.data[index].monthlyDividend,
  }));

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload) return null;

    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border">
        <p className="font-semibold mb-2">{label}년 후</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-600">{entry.name}:</span>
            <span className="font-semibold">
              {selectedMetric === 'asset'
                ? `${(entry.value / 100000000).toFixed(1)}억원`
                : `${(entry.value / 10000).toFixed(0)}만원/월`
              }
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Y축 포맷터
  const formatYAxis = (value) => {
    if (selectedMetric === 'asset') {
      return `${(value / 100000000).toFixed(0)}억`;
    } else {
      return `${(value / 10000).toFixed(0)}만`;
    }
  };

  const dataKeys = selectedMetric === 'asset'
    ? ['보수적_자산', '중립_자산', '공격적_자산']
    : ['보수적_배당', '중립_배당', '공격적_배당'];

  const colors = {
    '보수적_자산': '#ef4444',
    '중립_자산': '#3b82f6',
    '공격적_자산': '#22c55e',
    '보수적_배당': '#ef4444',
    '중립_배당': '#3b82f6',
    '공격적_배당': '#22c55e',
  };

  const labels = {
    '보수적_자산': '보수적 (5%)',
    '중립_자산': '중립 (10%)',
    '공격적_자산': '공격적 (15%)',
    '보수적_배당': '보수적 (5%)',
    '중립_배당': '중립 (10%)',
    '공격적_배당': '공격적 (15%)',
  };

  return (
    <div className={`card-premium p-6 ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" style={{color: 'var(--accent-blue)'}} />
          <h3 className="text-subtitle">시나리오 비교 분석</h3>
        </div>

        <div className="flex gap-2">
          {/* 차트 타입 선택 */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                chartType === 'line'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              라인
            </button>
            <button
              onClick={() => setChartType('area')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                chartType === 'area'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              영역
            </button>
          </div>

          {/* 지표 선택 */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setSelectedMetric('asset')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                selectedMetric === 'asset'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <TrendingUp className="w-3 h-3 inline mr-1" />
              자산
            </button>
            <button
              onClick={() => setSelectedMetric('dividend')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                selectedMetric === 'dividend'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <DollarSign className="w-3 h-3 inline mr-1" />
              배당
            </button>
          </div>
        </div>
      </div>

      {/* 차트 */}
      <ResponsiveContainer width="100%" height={300}>
        {chartType === 'line' ? (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="year"
              label={{ value: '투자 기간 (년)', position: 'insideBottom', offset: -5 }}
              stroke="#6b7280"
            />
            <YAxis
              tickFormatter={formatYAxis}
              stroke="#6b7280"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => labels[value]}
              wrapperStyle={{ paddingTop: '20px' }}
            />
            {dataKeys.map((key) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[key]}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                name={key}
              />
            ))}
          </LineChart>
        ) : (
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="year"
              label={{ value: '투자 기간 (년)', position: 'insideBottom', offset: -5 }}
              stroke="#6b7280"
            />
            <YAxis
              tickFormatter={formatYAxis}
              stroke="#6b7280"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => labels[value]}
              wrapperStyle={{ paddingTop: '20px' }}
            />
            {dataKeys.map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[key]}
                fill={colors[key]}
                fillOpacity={0.3 - index * 0.05}
                name={key}
              />
            ))}
          </AreaChart>
        )}
      </ResponsiveContainer>

      {/* 시나리오 요약 */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
        {Object.entries(scenarios).map(([key, scenario]) => {
          const isConservative = key === 'conservative';
          const isModerate = key === 'moderate';
          const isAggressive = key === 'aggressive';

          return (
            <div
              key={key}
              className="p-4 rounded-lg"
              style={{
                backgroundColor: isConservative ? '#fef2f2' :
                               isModerate ? '#eff6ff' : '#f0fdf4',
                borderLeft: `3px solid ${scenario.color}`
              }}
            >
              <div className="text-caption mb-2" style={{
                color: isConservative ? '#991b1b' :
                       isModerate ? '#1e40af' : '#166534'
              }}>
                {scenario.label} ({scenario.annualReturn}%)
              </div>

              <div className="space-y-2">
                <div>
                  <div className="text-xs text-gray-600">최종 자산</div>
                  <div className="text-body font-semibold">
                    {(scenario.finalAsset / 100000000).toFixed(1)}억원
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-600">월 배당</div>
                  <div className="text-body font-semibold">
                    {(scenario.finalMonthlyDividend / 10000).toFixed(0)}만원
                  </div>
                </div>

                <div>
                  <div className="text-xs text-gray-600">총 수익</div>
                  <div className="text-sm font-semibold" style={{
                    color: isConservative ? '#dc2626' :
                           isModerate ? '#2563eb' : '#16a34a'
                  }}>
                    +{(scenario.totalGains / 100000000).toFixed(1)}억원
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 인사이트 */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start gap-2">
          <div className="w-1 h-full bg-blue-500 rounded" />
          <div className="flex-1">
            <div className="text-sm font-medium text-blue-900 mb-1">
              💡 시나리오 분석 인사이트
            </div>
            <div className="text-xs text-blue-700">
              {(() => {
                const conservative = scenarios.conservative.finalAsset;
                const aggressive = scenarios.aggressive.finalAsset;
                const diff = aggressive - conservative;
                const percentage = ((diff / conservative) * 100).toFixed(0);

                return `공격적 시나리오는 보수적 대비 약 ${percentage}% 더 높은 자산 축적이 가능하지만,
                시장 변동성에 따른 리스크가 높습니다. 본인의 투자 성향과 목표에 맞는 전략을 선택하세요.`;
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScenarioComparisonChart;
