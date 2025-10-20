import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, TrendingUp, AlertCircle, DollarSign, Info, Receipt, Search, Filter, X, Grid3X3, LayoutGrid, CalendarDays, BarChart3, LineChart, Calculator, Target, RefreshCw } from 'lucide-react';
import { getDividendScheduleData, getAnnualDividendStats, enrichDividendWithTax, calculateDividendTax } from '../utils/dividendData';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Area, AreaChart, ComposedChart } from 'recharts';


// 날짜 관련 유틸리티 함수
const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

// 배당 상태별 색상
const getStatusColor = (status) => {
  switch(status) {
    case 'confirmed': return 'var(--accent-green)';
    case 'predicted': return 'var(--accent-orange)';
    case 'risk': return 'var(--accent-red)';
    default: return 'var(--text-tertiary)';
  }
};

// 배당 날짜 타입별 스타일
const getDateTypeStyle = (type) => {
  switch(type) {
    case 'ex-dividend':
      return {
        backgroundColor: 'var(--accent-orange)',
        borderStyle: 'dashed',
        label: '권리락',
        icon: '⚠️'
      };
    case 'payment':
      return {
        backgroundColor: 'var(--accent-green)',
        borderStyle: 'solid',
        label: '지급일',
        icon: '💰'
      };
    default:
      return {
        backgroundColor: 'var(--text-tertiary)',
        borderStyle: 'solid',
        label: '',
        icon: ''
      };
  }
};

// 필터 바 컴포넌트
const FilterBar = ({ filters, setFilters, onClearFilters }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearchChange = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const handleStatusFilter = (status) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status]
    }));
  };

  const handleAmountRange = (range) => {
    setFilters(prev => ({ ...prev, amountRange: range }));
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status.length < 3) count++;
    if (filters.amountRange !== 'all') count++;
    return count;
  };

  return (
    <div className="card-premium p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5" style={{color: 'var(--accent-blue)'}} />
          <h3 className="text-subtitle">필터 및 검색</h3>
          {getActiveFilterCount() > 0 && (
            <span className="px-2 py-1 text-xs rounded-full" style={{
              backgroundColor: 'var(--accent-blue)20',
              color: 'var(--accent-blue)'
            }}>
              {getActiveFilterCount()}개 적용
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {getActiveFilterCount() > 0 && (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg hover:bg-gray-100 transition-colors"
              style={{color: 'var(--text-secondary)'}}
            >
              <X className="w-4 h-4" />
              초기화
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1.5 text-sm rounded-lg hover:bg-gray-100 transition-colors"
            style={{color: 'var(--accent-blue)'}}
          >
            {isExpanded ? '접기' : '상세 필터'}
          </button>
        </div>
      </div>

      {/* 검색 바 */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{color: 'var(--text-tertiary)'}} />
        <input
          type="text"
          placeholder="종목명으로 검색..."
          value={filters.search}
          onChange={handleSearchChange}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
          style={{
            borderColor: 'var(--border-light)',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)'
          }}
        />
      </div>

      {/* 빠른 필터 */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-caption" style={{color: 'var(--text-secondary)'}}>상태:</span>
          {['confirmed', 'predicted', 'risk'].map(status => (
            <button
              key={status}
              onClick={() => handleStatusFilter(status)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                filters.status.includes(status) ? 'font-semibold' : ''
              }`}
              style={{
                backgroundColor: filters.status.includes(status)
                  ? `${getStatusColor(status)}20`
                  : 'var(--bg-secondary)',
                color: filters.status.includes(status)
                  ? getStatusColor(status)
                  : 'var(--text-secondary)',
                border: `1px solid ${filters.status.includes(status) ? getStatusColor(status) : 'var(--border-light)'}`
              }}
            >
              {status === 'confirmed' ? '확정' : status === 'predicted' ? '예상' : '주의'}
            </button>
          ))}
        </div>
      </div>

      {/* 상세 필터 (확장 시) */}
      {isExpanded && (
        <div className="pt-4 border-t space-y-4">
          <div>
            <span className="text-caption mb-2 block" style={{color: 'var(--text-secondary)'}}>배당금 범위:</span>
            <div className="flex gap-2">
              {[
                { value: 'all', label: '전체' },
                { value: 'under100k', label: '10만원 미만' },
                { value: '100k-300k', label: '10-30만원' },
                { value: 'over300k', label: '30만원 이상' }
              ].map(range => (
                <button
                  key={range.value}
                  onClick={() => handleAmountRange(range.value)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    filters.amountRange === range.value ? 'font-semibold' : ''
                  }`}
                  style={{
                    backgroundColor: filters.amountRange === range.value
                      ? 'var(--accent-blue)20'
                      : 'var(--bg-secondary)',
                    color: filters.amountRange === range.value
                      ? 'var(--accent-blue)'
                      : 'var(--text-secondary)',
                    border: `1px solid ${filters.amountRange === range.value ? 'var(--accent-blue)' : 'var(--border-light)'}`
                  }}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 뷰 전환 컴포넌트
const ViewSwitcher = ({ currentView, setCurrentView }) => {
  const views = [
    { value: 'monthly', label: '월별', icon: CalendarDays },
    { value: 'quarterly', label: '분기별', icon: Grid3X3 },
    { value: 'yearly', label: '연간', icon: LayoutGrid }
  ];

  return (
    <div className="card-premium p-4 mb-6">
      <div className="flex items-center justify-between">
        <h3 className="text-subtitle">보기 옵션</h3>
        <div className="flex rounded-lg overflow-hidden border" style={{borderColor: 'var(--border-light)'}}>
          {views.map(view => {
            const Icon = view.icon;
            return (
              <button
                key={view.value}
                onClick={() => setCurrentView(view.value)}
                className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                  currentView === view.value ? 'font-semibold' : ''
                }`}
                style={{
                  backgroundColor: currentView === view.value
                    ? 'var(--accent-blue)'
                    : 'var(--bg-secondary)',
                  color: currentView === view.value
                    ? 'white'
                    : 'var(--text-secondary)'
                }}
              >
                <Icon className="w-4 h-4" />
                {view.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// 캘린더 헤더 컴포넌트
const CalendarHeader = ({ currentDate, onPrevMonth, onNextMonth, totalDividend }) => {
  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const taxInfo = calculateDividendTax(totalDividend);

  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onPrevMonth}
          className="p-2 card-premium hover:scale-105 transition-transform"
        >
          <ChevronLeft className="w-5 h-5" style={{color: 'var(--text-secondary)'}} />
        </button>
        <h2 className="text-title">
          {year}년 {monthNames[month]}
        </h2>
        <button
          onClick={onNextMonth}
          className="p-2 card-premium hover:scale-105 transition-transform"
        >
          <ChevronRight className="w-5 h-5" style={{color: 'var(--text-secondary)'}} />
        </button>
      </div>
      <div className="flex gap-4">
        <div className="flex items-center gap-3 card-premium px-6 py-3">
          <DollarSign className="w-5 h-5" style={{color: 'var(--accent-blue)'}} />
          <div>
            <div className="text-caption" style={{color: 'var(--text-secondary)'}}>총 배당 (세전)</div>
            <div className="text-subtitle text-number" style={{color: 'var(--accent-blue)'}}>
              {totalDividend.toLocaleString()}원
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 card-premium px-6 py-3">
          <Receipt className="w-5 h-5" style={{color: 'var(--accent-green)'}} />
          <div>
            <div className="text-caption" style={{color: 'var(--text-secondary)'}}>실수령액 (세후)</div>
            <div className="text-subtitle text-number" style={{color: 'var(--accent-green)'}}>
              {taxInfo.net.toLocaleString()}원
            </div>
            <div className="text-xs" style={{color: 'var(--text-tertiary)'}}>
              세금 {taxInfo.tax.toLocaleString()}원
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 캘린더 그리드 컴포넌트
const CalendarGrid = ({ currentDate, dividends, onDateClick }) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  // 날짜별 배당 정보 매핑 (권리락일과 지급일 구분)
  const getDividendsForDate = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const exDividendEvents = dividends.filter(d => d.exDividendDate === dateStr).map(d => ({...d, dateType: 'ex-dividend'}));
    const paymentEvents = dividends.filter(d => d.paymentDate === dateStr).map(d => ({...d, dateType: 'payment'}));
    return [...exDividendEvents, ...paymentEvents];
  };

  // 캘린더 셀 생성
  const renderCalendarCells = () => {
    const cells = [];

    // 빈 셀 추가 (첫 주)
    for (let i = 0; i < firstDay; i++) {
      cells.push(
        <div key={`empty-${i}`} className="aspect-square p-2" />
      );
    }

    // 날짜 셀 추가
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDividends = getDividendsForDate(day);
      const hasDividend = dayDividends.length > 0;
      const isToday = new Date().getDate() === day &&
                      new Date().getMonth() === month &&
                      new Date().getFullYear() === year;

      cells.push(
        <div
          key={day}
          onClick={() => hasDividend && onDateClick(day, dayDividends)}
          className={`aspect-square p-2 card-premium relative group ${
            hasDividend ? 'cursor-pointer hover:scale-105' : ''
          } ${isToday ? 'ring-2 ring-blue-500' : ''} transition-all`}
        >
          <div className="text-body" style={{color: isToday ? 'var(--accent-blue)' : 'var(--text-primary)'}}>
            {day}
          </div>

          {hasDividend && (
            <div className="mt-1 space-y-1">
              {dayDividends.slice(0, 2).map((dividend, idx) => {
                const dateTypeStyle = getDateTypeStyle(dividend.dateType);
                return (
                  <div
                    key={idx}
                    className="text-xs px-1 py-0.5 rounded flex items-center gap-1"
                    style={{
                      backgroundColor: `${dateTypeStyle.backgroundColor}20`,
                      color: dateTypeStyle.backgroundColor,
                      border: `1px ${dateTypeStyle.borderStyle} ${dateTypeStyle.backgroundColor}40`
                    }}
                  >
                    <span className="text-xs">{dateTypeStyle.icon}</span>
                    <span>
                      {dividend.stockName.length > 4 ?
                        dividend.stockName.substring(0, 4) + '..' :
                        dividend.stockName}
                    </span>
                  </div>
                );
              })}
              {dayDividends.length > 2 && (
                <div className="text-xs text-gray-500">+{dayDividends.length - 2}</div>
              )}
            </div>
          )}

          {/* 호버 시 상세 정보 */}
          {hasDividend && (
            <div className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 card-premium opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity w-56">
              {dayDividends.map((dividend, idx) => {
                const dateTypeStyle = getDateTypeStyle(dividend.dateType);
                return (
                  <div key={idx} className="text-xs mb-3 last:mb-0 p-2 rounded border-l-2" style={{borderColor: dateTypeStyle.backgroundColor}}>
                    <div className="flex items-center gap-2 mb-1">
                      <span>{dateTypeStyle.icon}</span>
                      <span className="font-semibold">{dividend.stockName}</span>
                      <span className="text-xs px-1 py-0.5 rounded" style={{
                        backgroundColor: `${dateTypeStyle.backgroundColor}20`,
                        color: dateTypeStyle.backgroundColor
                      }}>
                        {dateTypeStyle.label}
                      </span>
                    </div>
                    {dividend.dateType === 'payment' && (
                      <div style={{color: 'var(--text-secondary)'}}>
                        배당금: {dividend.expectedAmount.toLocaleString()}원
                      </div>
                    )}
                    {dividend.dateType === 'ex-dividend' && (
                      <div style={{color: 'var(--text-secondary)'}}>
                        배당주 매수 마지막일<br/>
                        지급일: {new Date(dividend.paymentDate).toLocaleDateString('ko-KR', {month: 'short', day: 'numeric'})}
                      </div>
                    )}
                    <div className="text-xs mt-1" style={{color: 'var(--text-tertiary)'}}>
                      {dividend.shares}주 보유 · {dividend.status === 'confirmed' ? '확정' : '예상'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return cells;
  };

  return (
    <div className="card-premium p-6 mb-6">
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-caption font-semibold" style={{color: 'var(--text-secondary)'}}>
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {renderCalendarCells()}
      </div>
    </div>
  );
};

// 배당 요약 컴포넌트
const DividendSummary = ({ dividends }) => {
  const sortedDividends = [...dividends].sort((a, b) =>
    new Date(a.paymentDate) - new Date(b.paymentDate)
  );

  const enrichedDividends = sortedDividends.map(enrichDividendWithTax);

  const totalGross = enrichedDividends.reduce((sum, d) => sum + d.grossAmount, 0);
  const totalTax = enrichedDividends.reduce((sum, d) => sum + d.taxAmount, 0);
  const totalNet = enrichedDividends.reduce((sum, d) => sum + d.netAmount, 0);

  return (
    <div className="card-premium p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-subtitle">이번 달 배당 일정</h3>
          <div className="text-caption mt-1" style={{color: 'var(--text-secondary)'}}>
            {enrichedDividends.length}개 종목 표시
          </div>
        </div>
        <div className="text-right text-xs" style={{color: 'var(--text-tertiary)'}}>
          세율 15.4% 적용 (소득세 14% + 지방소득세 1.4%)
        </div>
      </div>

      <div className="space-y-3">
        {enrichedDividends.map(dividend => (
          <div key={dividend.id} className="flex justify-between items-center p-4 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-4">
              <div
                className="w-3 h-3 rounded-full"
                style={{backgroundColor: getStatusColor(dividend.status)}}
              />
              <div>
                <div className="text-body font-semibold">{dividend.stockName}</div>
                <div className="text-caption" style={{color: 'var(--text-secondary)'}}>
                  {new Date(dividend.paymentDate).toLocaleDateString('ko-KR', {
                    month: 'long',
                    day: 'numeric'
                  })} 지급 · {dividend.shares}주 보유
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-body text-number font-semibold" style={{color: 'var(--accent-green)'}}>
                {dividend.netAmount.toLocaleString()}원
              </div>
              <div className="text-caption" style={{color: 'var(--text-secondary)'}}>
                세전 {dividend.grossAmount.toLocaleString()}원
              </div>
              <div className="text-xs flex items-center gap-1" style={{color: 'var(--text-tertiary)'}}>
                {dividend.status === 'confirmed' ? '확정' : '예상'}
                {dividend.status === 'predicted' && (
                  <span>({(dividend.confidence * 100).toFixed(0)}%)</span>
                )}
                · 세금 {dividend.taxAmount.toLocaleString()}원
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 월별 총합 */}
      <div className="mt-6 pt-4 border-t">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-caption mb-1" style={{color: 'var(--text-secondary)'}}>총 배당 (세전)</div>
            <div className="text-body font-semibold" style={{color: 'var(--accent-blue)'}}>
              {totalGross.toLocaleString()}원
            </div>
          </div>
          <div>
            <div className="text-caption mb-1" style={{color: 'var(--text-secondary)'}}>총 세금</div>
            <div className="text-body font-semibold" style={{color: 'var(--accent-red)'}}>
              {totalTax.toLocaleString()}원
            </div>
          </div>
          <div>
            <div className="text-caption mb-1" style={{color: 'var(--text-secondary)'}}>실수령액 (세후)</div>
            <div className="text-body font-semibold" style={{color: 'var(--accent-green)'}}>
              {totalNet.toLocaleString()}원
            </div>
          </div>
        </div>
      </div>

      {/* 범례 */}
      <div className="mt-6 pt-4 border-t space-y-4">
        <div>
          <h5 className="text-caption font-semibold mb-2" style={{color: 'var(--text-primary)'}}>배당 상태</h5>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{backgroundColor: 'var(--accent-green)'}} />
              <span className="text-caption">확정</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{backgroundColor: 'var(--accent-orange)'}} />
              <span className="text-caption">예상</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{backgroundColor: 'var(--accent-red)'}} />
              <span className="text-caption">주의</span>
            </div>
          </div>
        </div>
        <div>
          <h5 className="text-caption font-semibold mb-2" style={{color: 'var(--text-primary)'}}>날짜 구분</h5>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs px-2 py-1 rounded border" style={{
                backgroundColor: 'var(--accent-orange)20',
                color: 'var(--accent-orange)',
                borderStyle: 'dashed',
                borderColor: 'var(--accent-orange)40'
              }}>
                ⚠️ <span>권리락</span>
              </div>
              <span className="text-caption">배당주 매수 마지막일</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs px-2 py-1 rounded border" style={{
                backgroundColor: 'var(--accent-green)20',
                color: 'var(--accent-green)',
                borderStyle: 'solid',
                borderColor: 'var(--accent-green)40'
              }}>
                💰 <span>지급일</span>
              </div>
              <span className="text-caption">배당금 지급일</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 분기별 보기 컴포넌트
const QuarterlyView = ({ year, dividends, filters }) => {
  const quarters = [
    { name: '1분기 (1-3월)', months: [1, 2, 3], key: 'Q1' },
    { name: '2분기 (4-6월)', months: [4, 5, 6], key: 'Q2' },
    { name: '3분기 (7-9월)', months: [7, 8, 9], key: 'Q3' },
    { name: '4분기 (10-12월)', months: [10, 11, 12], key: 'Q4' }
  ];

  const getQuarterData = (quarter) => {
    const quarterDividends = [];
    let quarterTotal = 0;

    quarter.months.forEach(month => {
      const monthKey = `${year}-${String(month).padStart(2, '0')}`;
      const monthDividends = dividendData[monthKey] || [];
      const filteredDividends = applyFilters(monthDividends, filters);
      quarterDividends.push(...filteredDividends);
      quarterTotal += filteredDividends.reduce((sum, d) => sum + d.expectedAmount, 0);
    });

    return { dividends: quarterDividends, total: quarterTotal };
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {quarters.map(quarter => {
          const quarterData = getQuarterData(quarter);
          const taxInfo = calculateDividendTax(quarterData.total);

          return (
            <div key={quarter.key} className="card-premium p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-subtitle">{quarter.name}</h3>
                <div className="text-right">
                  <div className="text-body font-semibold" style={{color: 'var(--accent-green)'}}>
                    {taxInfo.net.toLocaleString()}원
                  </div>
                  <div className="text-caption" style={{color: 'var(--text-secondary)'}}>
                    세전 {quarterData.total.toLocaleString()}원
                  </div>
                </div>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {quarterData.dividends.map((dividend, idx) => {
                  const enrichedDividend = enrichDividendWithTax(dividend);
                  return (
                    <div key={`${dividend.id}-${idx}`} className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{backgroundColor: getStatusColor(dividend.status)}}
                        />
                        <div>
                          <div className="text-body font-medium">{dividend.stockName}</div>
                          <div className="text-xs" style={{color: 'var(--text-secondary)'}}>
                            {new Date(dividend.paymentDate).toLocaleDateString('ko-KR')}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold" style={{color: 'var(--accent-green)'}}>
                          {enrichedDividend.netAmount.toLocaleString()}원
                        </div>
                        <div className="text-xs" style={{color: 'var(--text-tertiary)'}}>
                          세전 {enrichedDividend.grossAmount.toLocaleString()}원
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {quarterData.dividends.length === 0 && (
                <div className="text-center py-8" style={{color: 'var(--text-tertiary)'}}>
                  해당 분기에 배당이 없습니다
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 연간 보기 컴포넌트
const YearlyView = ({ year, dividends, filters }) => {
  const months = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ];

  const getMonthData = (monthIndex) => {
    const monthKey = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
    const monthDividends = dividendData[monthKey] || [];
    const filteredDividends = applyFilters(monthDividends, filters);
    const total = filteredDividends.reduce((sum, d) => sum + d.expectedAmount, 0);
    return { dividends: filteredDividends, total };
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {months.map((monthName, monthIndex) => {
          const monthData = getMonthData(monthIndex);
          const taxInfo = calculateDividendTax(monthData.total);

          return (
            <div key={monthIndex} className="card-premium p-4">
              <div className="text-center mb-3">
                <h4 className="text-body font-semibold">{monthName}</h4>
                <div className="text-sm font-semibold mt-1" style={{color: 'var(--accent-green)'}}>
                  {taxInfo.net.toLocaleString()}원
                </div>
                <div className="text-xs" style={{color: 'var(--text-secondary)'}}>
                  세전 {monthData.total.toLocaleString()}원
                </div>
              </div>

              <div className="space-y-2">
                {monthData.dividends.slice(0, 3).map((dividend, idx) => (
                  <div key={`${dividend.id}-${idx}`} className="flex items-center gap-2">
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{backgroundColor: getStatusColor(dividend.status)}}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs truncate">{dividend.stockName}</div>
                      <div className="text-xs" style={{color: 'var(--accent-green)'}}>
                        {enrichDividendWithTax(dividend).netAmount.toLocaleString()}원
                      </div>
                    </div>
                  </div>
                ))}
                {monthData.dividends.length > 3 && (
                  <div className="text-xs text-center" style={{color: 'var(--text-tertiary)'}}>
                    +{monthData.dividends.length - 3}개 더
                  </div>
                )}
                {monthData.dividends.length === 0 && (
                  <div className="text-xs text-center" style={{color: 'var(--text-tertiary)'}}>
                    배당 없음
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 배당 성장 트렌드 차트 컴포넌트
const DividendGrowthChart = ({ filters, monthlyDividendSchedule }) => {
  const [chartType, setChartType] = useState('line');
  const [showNetAmounts, setShowNetAmounts] = useState(true);

  // 차트 데이터 준비
  const chartData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    return monthlyDividendSchedule.map((monthData, index) => {
      const monthNumber = index + 1;
      const filteredDividends = applyFilters(monthData.dividends, filters);
      const grossAmount = filteredDividends.reduce((sum, d) => sum + d.amount, 0);
      const taxInfo = calculateDividendTax(grossAmount);

      // 작년 데이터 시뮬레이션 (실제로는 DB에서 가져와야 함)
      const lastYearAmount = grossAmount * (0.85 + Math.random() * 0.3); // 85-115% 범위
      const lastYearTaxInfo = calculateDividendTax(lastYearAmount);

      // 성장률 계산
      const growthRate = lastYearAmount > 0 ? ((grossAmount - lastYearAmount) / lastYearAmount * 100) : 0;

      return {
        month: monthData.month,
        monthNumber: monthNumber,
        currentYearGross: grossAmount,
        currentYearNet: taxInfo.net,
        lastYearGross: Math.round(lastYearAmount),
        lastYearNet: Math.round(lastYearTaxInfo.net),
        growthRate: Math.round(growthRate * 10) / 10,
        isCurrentMonth: monthNumber === currentMonth,
        isPast: monthNumber < currentMonth,
        isFuture: monthNumber > currentMonth,
        count: filteredDividends.length
      };
    });
  }, [filters]);

  // 누적 차트 데이터
  const cumulativeData = useMemo(() => {
    let currentYearCumulative = 0;
    let lastYearCumulative = 0;

    return chartData.map(month => {
      currentYearCumulative += showNetAmounts ? month.currentYearNet : month.currentYearGross;
      lastYearCumulative += showNetAmounts ? month.lastYearNet : month.lastYearGross;

      return {
        ...month,
        currentYearCumulative,
        lastYearCumulative
      };
    });
  }, [chartData, showNetAmounts]);

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="card-premium p-4 shadow-lg">
          <h4 className="text-body font-semibold mb-2">{label}</h4>
          <div className="space-y-1">
            {payload.map((entry, index) => (
              <div key={index} className="flex justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-caption">{entry.name}:</span>
                </div>
                <span className="text-caption font-semibold">
                  {entry.value.toLocaleString()}원
                </span>
              </div>
            ))}
            {data.growthRate !== undefined && (
              <div className="mt-2 pt-2 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-caption">전년 대비:</span>
                  <span className={`text-caption font-semibold ${
                    data.growthRate > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {data.growthRate > 0 ? '+' : ''}{data.growthRate}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const chartOptions = [
    { value: 'line', label: '선형 차트', icon: LineChart },
    { value: 'area', label: '영역 차트', icon: BarChart3 },
    { value: 'bar', label: '막대 차트', icon: BarChart3 }
  ];

  return (
    <div className="card-premium p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6" style={{color: 'var(--accent-blue)'}} />
          <h3 className="text-subtitle">배당 성장 트렌드</h3>
        </div>

        <div className="flex items-center gap-4">
          {/* 차트 타입 선택 */}
          <div className="flex rounded-lg overflow-hidden border" style={{borderColor: 'var(--border-light)'}}>
            {chartOptions.map(option => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => setChartType(option.value)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm transition-colors ${
                    chartType === option.value ? 'font-semibold' : ''
                  }`}
                  style={{
                    backgroundColor: chartType === option.value
                      ? 'var(--accent-blue)'
                      : 'var(--bg-secondary)',
                    color: chartType === option.value
                      ? 'white'
                      : 'var(--text-secondary)'
                  }}
                >
                  <Icon className="w-4 h-4" />
                  {option.label}
                </button>
              );
            })}
          </div>

          {/* 세전/세후 토글 */}
          <button
            onClick={() => setShowNetAmounts(!showNetAmounts)}
            className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              showNetAmounts ? 'font-semibold' : ''
            }`}
            style={{
              backgroundColor: showNetAmounts
                ? 'var(--accent-green)20'
                : 'var(--bg-secondary)',
              color: showNetAmounts
                ? 'var(--accent-green)'
                : 'var(--text-secondary)',
              borderColor: showNetAmounts ? 'var(--accent-green)' : 'var(--border-light)'
            }}
          >
            {showNetAmounts ? '세후 금액' : '세전 금액'}
          </button>
        </div>
      </div>

      {/* 월별 트렌드 차트 */}
      <div className="mb-8">
        <h4 className="text-body font-semibold mb-4">월별 배당 현황</h4>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            {chartType === 'line' && (
              <RechartsLineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                />
                <YAxis
                  tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                  tickFormatter={(value) => `${(value / 10000).toFixed(0)}만`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey={showNetAmounts ? "currentYearNet" : "currentYearGross"}
                  stroke="var(--accent-blue)"
                  strokeWidth={3}
                  name="올해"
                  dot={{ fill: 'var(--accent-blue)', strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey={showNetAmounts ? "lastYearNet" : "lastYearGross"}
                  stroke="var(--text-tertiary)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="작년"
                  dot={{ fill: 'var(--text-tertiary)', strokeWidth: 2, r: 3 }}
                />
              </RechartsLineChart>
            )}

            {chartType === 'area' && (
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                />
                <YAxis
                  tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                  tickFormatter={(value) => `${(value / 10000).toFixed(0)}만`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey={showNetAmounts ? "currentYearNet" : "currentYearGross"}
                  stroke="var(--accent-blue)"
                  fill="var(--accent-blue)20"
                  name="올해"
                />
                <Area
                  type="monotone"
                  dataKey={showNetAmounts ? "lastYearNet" : "lastYearGross"}
                  stroke="var(--text-tertiary)"
                  fill="var(--text-tertiary)20"
                  name="작년"
                />
              </AreaChart>
            )}

            {chartType === 'bar' && (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                />
                <YAxis
                  tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                  tickFormatter={(value) => `${(value / 10000).toFixed(0)}만`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey={showNetAmounts ? "currentYearNet" : "currentYearGross"}
                  fill="var(--accent-blue)"
                  name="올해"
                  radius={[2, 2, 0, 0]}
                />
                <Bar
                  dataKey={showNetAmounts ? "lastYearNet" : "lastYearGross"}
                  fill="var(--text-tertiary)"
                  name="작년"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* 누적 트렌드 차트 */}
      <div>
        <h4 className="text-body font-semibold mb-4">누적 배당 현황</h4>
        <div style={{ width: '100%', height: 250 }}>
          <ResponsiveContainer>
            <AreaChart data={cumulativeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
              <XAxis
                dataKey="month"
                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
              />
              <YAxis
                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                tickFormatter={(value) => `${(value / 10000).toFixed(0)}만`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="currentYearCumulative"
                stroke="var(--accent-green)"
                fill="var(--accent-green)20"
                name="올해 누적"
              />
              <Area
                type="monotone"
                dataKey="lastYearCumulative"
                stroke="var(--text-tertiary)"
                fill="var(--text-tertiary)20"
                name="작년 누적"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 주요 지표 요약 */}
      <div className="mt-6 pt-6 border-t">
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-caption mb-1" style={{color: 'var(--text-secondary)'}}>평균 월 배당</div>
            <div className="text-body font-semibold" style={{color: 'var(--accent-blue)'}}>
              {Math.round(chartData.reduce((sum, month) => sum + (showNetAmounts ? month.currentYearNet : month.currentYearGross), 0) / 12).toLocaleString()}원
            </div>
          </div>
          <div className="text-center">
            <div className="text-caption mb-1" style={{color: 'var(--text-secondary)'}}>최고 월 배당</div>
            <div className="text-body font-semibold" style={{color: 'var(--accent-green)'}}>
              {Math.max(...chartData.map(month => showNetAmounts ? month.currentYearNet : month.currentYearGross)).toLocaleString()}원
            </div>
          </div>
          <div className="text-center">
            <div className="text-caption mb-1" style={{color: 'var(--text-secondary)'}}>평균 성장률</div>
            <div className="text-body font-semibold" style={{color: 'var(--accent-orange)'}}>
              {(chartData.reduce((sum, month) => sum + month.growthRate, 0) / 12).toFixed(1)}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-caption mb-1" style={{color: 'var(--text-secondary)'}}>총 종목 수</div>
            <div className="text-body font-semibold" style={{color: 'var(--text-primary)'}}>
              {Math.max(...chartData.map(month => month.count))}개
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 배당 재투자 계산기 컴포넌트
const DividendReinvestmentCalculator = ({ filters }) => {
  const [calculatorParams, setCalculatorParams] = useState({
    currentMonthlyDividend: 500000, // 현재 월 배당
    reinvestmentRate: 80, // 재투자 비율 (%)
    expectedGrowthRate: 6, // 연간 성장률 (%)
    timeHorizon: 10, // 투자 기간 (년)
    additionalMonthlyInvestment: 300000, // 추가 월 투자금
    dividendYield: 4.5 // 평균 배당률 (%)
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  // 재투자 시뮬레이션 계산
  const calculationResults = useMemo(() => {
    const {
      currentMonthlyDividend,
      reinvestmentRate,
      expectedGrowthRate,
      timeHorizon,
      additionalMonthlyInvestment,
      dividendYield
    } = calculatorParams;

    const results = [];
    let currentPrincipal = currentMonthlyDividend * 12 / (dividendYield / 100); // 현재 원금 역산
    let withoutReinvestment = currentPrincipal;

    for (let year = 0; year <= timeHorizon; year++) {
      // 재투자하는 경우
      const yearlyDividend = currentPrincipal * (dividendYield / 100);
      const reinvestedAmount = yearlyDividend * (reinvestmentRate / 100);
      const additionalYearlyInvestment = additionalMonthlyInvestment * 12;

      // 재투자와 추가 투자로 원금 증가
      if (year > 0) {
        currentPrincipal += reinvestedAmount + additionalYearlyInvestment;
        currentPrincipal *= (1 + expectedGrowthRate / 100);
      }

      // 재투자하지 않는 경우 비교
      if (year > 0) {
        withoutReinvestment += additionalYearlyInvestment;
        withoutReinvestment *= (1 + expectedGrowthRate / 100);
      }

      const monthlyDividendWithReinvestment = (currentPrincipal * (dividendYield / 100)) / 12;
      const monthlyDividendWithoutReinvestment = (withoutReinvestment * (dividendYield / 100)) / 12;

      results.push({
        year,
        principalWithReinvestment: Math.round(currentPrincipal),
        principalWithoutReinvestment: Math.round(withoutReinvestment),
        monthlyDividendWithReinvestment: Math.round(monthlyDividendWithReinvestment),
        monthlyDividendWithoutReinvestment: Math.round(monthlyDividendWithoutReinvestment),
        yearlyDividendWithReinvestment: Math.round(monthlyDividendWithReinvestment * 12),
        yearlyDividendWithoutReinvestment: Math.round(monthlyDividendWithoutReinvestment * 12),
        difference: Math.round(monthlyDividendWithReinvestment - monthlyDividendWithoutReinvestment),
        cumulativeDifference: results.length > 0
          ? results[results.length - 1].cumulativeDifference + Math.round((monthlyDividendWithReinvestment - monthlyDividendWithoutReinvestment) * 12)
          : 0
      });
    }

    return results;
  }, [calculatorParams]);

  const handleParamChange = (param, value) => {
    setCalculatorParams(prev => ({
      ...prev,
      [param]: parseFloat(value) || 0
    }));
  };

  const resetToDefaults = () => {
    setCalculatorParams({
      currentMonthlyDividend: 500000,
      reinvestmentRate: 80,
      expectedGrowthRate: 6,
      timeHorizon: 10,
      additionalMonthlyInvestment: 300000,
      dividendYield: 4.5
    });
  };

  const finalResults = calculationResults[calculationResults.length - 1];

  return (
    <div className="card-premium p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Calculator className="w-6 h-6" style={{color: 'var(--accent-green)'}} />
          <h3 className="text-subtitle">배당 재투자 계산기</h3>
        </div>
        <button
          onClick={resetToDefaults}
          className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg hover:bg-gray-100 transition-colors"
          style={{color: 'var(--text-secondary)'}}
        >
          <RefreshCw className="w-4 h-4" />
          초기화
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 입력 패널 */}
        <div className="space-y-6">
          <div>
            <h4 className="text-body font-semibold mb-4">계산 조건</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-caption mb-2" style={{color: 'var(--text-secondary)'}}>
                  현재 월 배당금
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={calculatorParams.currentMonthlyDividend}
                    onChange={(e) => handleParamChange('currentMonthlyDividend', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      borderColor: 'var(--border-light)',
                      backgroundColor: 'var(--bg-secondary)'
                    }}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-caption" style={{color: 'var(--text-tertiary)'}}>원</span>
                </div>
              </div>

              <div>
                <label className="block text-caption mb-2" style={{color: 'var(--text-secondary)'}}>
                  재투자 비율
                </label>
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={calculatorParams.reinvestmentRate}
                    onChange={(e) => handleParamChange('reinvestmentRate', e.target.value)}
                    className="w-full"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs" style={{color: 'var(--text-tertiary)'}}>0%</span>
                    <span className="text-xs font-semibold" style={{color: 'var(--accent-green)'}}>
                      {calculatorParams.reinvestmentRate}%
                    </span>
                    <span className="text-xs" style={{color: 'var(--text-tertiary)'}}>100%</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-caption mb-2" style={{color: 'var(--text-secondary)'}}>
                  추가 월 투자금
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={calculatorParams.additionalMonthlyInvestment}
                    onChange={(e) => handleParamChange('additionalMonthlyInvestment', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      borderColor: 'var(--border-light)',
                      backgroundColor: 'var(--bg-secondary)'
                    }}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-caption" style={{color: 'var(--text-tertiary)'}}>원</span>
                </div>
              </div>

              <div>
                <label className="block text-caption mb-2" style={{color: 'var(--text-secondary)'}}>
                  투자 기간
                </label>
                <div className="relative">
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={calculatorParams.timeHorizon}
                    onChange={(e) => handleParamChange('timeHorizon', e.target.value)}
                    className="w-full"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs" style={{color: 'var(--text-tertiary)'}}>1년</span>
                    <span className="text-xs font-semibold" style={{color: 'var(--accent-blue)'}}>
                      {calculatorParams.timeHorizon}년
                    </span>
                    <span className="text-xs" style={{color: 'var(--text-tertiary)'}}>30년</span>
                  </div>
                </div>
              </div>

              {/* 고급 설정 */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm text-blue-600 hover:underline"
              >
                {showAdvanced ? '고급 설정 숨기기' : '고급 설정 보기'}
              </button>

              {showAdvanced && (
                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <label className="block text-caption mb-2" style={{color: 'var(--text-secondary)'}}>
                      연간 성장률 (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={calculatorParams.expectedGrowthRate}
                      onChange={(e) => handleParamChange('expectedGrowthRate', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                      style={{
                        borderColor: 'var(--border-light)',
                        backgroundColor: 'var(--bg-secondary)'
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-caption mb-2" style={{color: 'var(--text-secondary)'}}>
                      평균 배당률 (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={calculatorParams.dividendYield}
                      onChange={(e) => handleParamChange('dividendYield', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                      style={{
                        borderColor: 'var(--border-light)',
                        backgroundColor: 'var(--bg-secondary)'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 결과 요약 */}
        <div className="space-y-6">
          <div>
            <h4 className="text-body font-semibold mb-4">
              {calculatorParams.timeHorizon}년 후 예상 결과
            </h4>
            <div className="space-y-4">
              <div className="p-4 rounded-lg" style={{backgroundColor: 'var(--accent-green)10'}}>
                <div className="text-caption mb-1" style={{color: 'var(--text-secondary)'}}>
                  재투자 시 월 배당
                </div>
                <div className="text-title font-bold" style={{color: 'var(--accent-green)'}}>
                  {finalResults?.monthlyDividendWithReinvestment.toLocaleString()}원
                </div>
                <div className="text-xs mt-1" style={{color: 'var(--text-tertiary)'}}>
                  연간 {finalResults?.yearlyDividendWithReinvestment.toLocaleString()}원
                </div>
              </div>

              <div className="p-4 rounded-lg" style={{backgroundColor: 'var(--text-tertiary)10'}}>
                <div className="text-caption mb-1" style={{color: 'var(--text-secondary)'}}>
                  재투자 미실시 시 월 배당
                </div>
                <div className="text-subtitle font-semibold" style={{color: 'var(--text-primary)'}}>
                  {finalResults?.monthlyDividendWithoutReinvestment.toLocaleString()}원
                </div>
                <div className="text-xs mt-1" style={{color: 'var(--text-tertiary)'}}>
                  연간 {finalResults?.yearlyDividendWithoutReinvestment.toLocaleString()}원
                </div>
              </div>

              <div className="p-4 rounded-lg border-2" style={{borderColor: 'var(--accent-blue)', backgroundColor: 'var(--accent-blue)05'}}>
                <div className="text-caption mb-1" style={{color: 'var(--text-secondary)'}}>
                  월 배당 차이
                </div>
                <div className="text-subtitle font-bold" style={{color: 'var(--accent-blue)'}}>
                  +{finalResults?.difference.toLocaleString()}원
                </div>
                <div className="text-xs mt-1" style={{color: 'var(--text-tertiary)'}}>
                  누적 {finalResults?.cumulativeDifference.toLocaleString()}원 증가
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 rounded-lg" style={{backgroundColor: 'var(--bg-secondary)'}}>
                  <div className="text-caption" style={{color: 'var(--text-secondary)'}}>재투자 원금</div>
                  <div className="text-body font-semibold" style={{color: 'var(--accent-green)'}}>
                    {(finalResults?.principalWithReinvestment / 100000000).toFixed(1)}억원
                  </div>
                </div>
                <div className="text-center p-3 rounded-lg" style={{backgroundColor: 'var(--bg-secondary)'}}>
                  <div className="text-caption" style={{color: 'var(--text-secondary)'}}>일반 원금</div>
                  <div className="text-body font-semibold" style={{color: 'var(--text-primary)'}}>
                    {(finalResults?.principalWithoutReinvestment / 100000000).toFixed(1)}억원
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 차트 */}
        <div>
          <h4 className="text-body font-semibold mb-4">성장 시뮬레이션</h4>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <ComposedChart data={calculationResults}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                <XAxis
                  dataKey="year"
                  tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                  label={{ value: '년', position: 'insideBottom', offset: -5 }}
                />
                <YAxis
                  tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                  tickFormatter={(value) => `${(value / 10000).toFixed(0)}만`}
                />
                <Tooltip
                  formatter={(value, name) => [
                    `${value.toLocaleString()}원`,
                    name === 'monthlyDividendWithReinvestment' ? '재투자 시' :
                    name === 'monthlyDividendWithoutReinvestment' ? '재투자 미실시' : name
                  ]}
                  labelFormatter={(label) => `${label}년 후`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="monthlyDividendWithReinvestment"
                  stroke="var(--accent-green)"
                  strokeWidth={3}
                  name="재투자 시 월 배당"
                  dot={{ fill: 'var(--accent-green)', strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="monthlyDividendWithoutReinvestment"
                  stroke="var(--text-tertiary)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="재투자 미실시 월 배당"
                  dot={{ fill: 'var(--text-tertiary)', strokeWidth: 2, r: 3 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 상세 테이블 */}
      <div className="mt-8 pt-6 border-t">
        <h4 className="text-body font-semibold mb-4">연도별 상세 결과</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{borderColor: 'var(--border-light)'}}>
                <th className="text-left py-3 px-2" style={{color: 'var(--text-secondary)'}}>년도</th>
                <th className="text-right py-3 px-2" style={{color: 'var(--text-secondary)'}}>재투자 시 월 배당</th>
                <th className="text-right py-3 px-2" style={{color: 'var(--text-secondary)'}}>일반 월 배당</th>
                <th className="text-right py-3 px-2" style={{color: 'var(--text-secondary)'}}>차이</th>
                <th className="text-right py-3 px-2" style={{color: 'var(--text-secondary)'}}>누적 차이</th>
              </tr>
            </thead>
            <tbody>
              {calculationResults.slice(0, 11).map((result, index) => (
                <tr key={index} className="border-b hover:bg-gray-50" style={{borderColor: 'var(--border-light)'}}>
                  <td className="py-2 px-2 font-medium">{result.year}년</td>
                  <td className="py-2 px-2 text-right font-semibold" style={{color: 'var(--accent-green)'}}>
                    {result.monthlyDividendWithReinvestment.toLocaleString()}원
                  </td>
                  <td className="py-2 px-2 text-right" style={{color: 'var(--text-primary)'}}>
                    {result.monthlyDividendWithoutReinvestment.toLocaleString()}원
                  </td>
                  <td className="py-2 px-2 text-right font-semibold" style={{color: 'var(--accent-blue)'}}>
                    +{result.difference.toLocaleString()}원
                  </td>
                  <td className="py-2 px-2 text-right" style={{color: 'var(--text-secondary)'}}>
                    {result.cumulativeDifference.toLocaleString()}원
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// 필터링 로직
const applyFilters = (dividends, filters) => {
  return dividends.filter(dividend => {
    // 검색 필터
    if (filters.search && !dividend.stockName.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }

    // 상태 필터
    if (filters.status.length > 0 && !filters.status.includes(dividend.status)) {
      return false;
    }

    // 금액 범위 필터
    if (filters.amountRange !== 'all') {
      const amount = dividend.expectedAmount;
      switch (filters.amountRange) {
        case 'under100k':
          if (amount >= 100000) return false;
          break;
        case '100k-300k':
          if (amount < 100000 || amount >= 300000) return false;
          break;
        case 'over300k':
          if (amount < 300000) return false;
          break;
      }
    }

    return true;
  });
};

// 메인 배당 캘린더 컴포넌트
const DividendCalendar = () => {
  // 실제 보유 종목의 배당 데이터 가져오기
  const { calendarData: dividendData, monthlyDividendSchedule } = getDividendScheduleData();
  const annualStats = getAnnualDividendStats(monthlyDividendSchedule);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDividends, setSelectedDividends] = useState(null);
  const [currentView, setCurrentView] = useState('monthly');
  const [filters, setFilters] = useState({
    search: '',
    status: ['confirmed', 'predicted', 'risk'],
    amountRange: 'all'
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;

  const allMonthDividends = dividendData[monthKey] || [];
  const currentMonthDividends = useMemo(() =>
    applyFilters(allMonthDividends, filters),
    [allMonthDividends, filters]
  );

  const totalMonthlyDividend = currentMonthDividends.reduce(
    (sum, d) => sum + d.expectedAmount, 0
  );

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: ['confirmed', 'predicted', 'risk'],
      amountRange: 'all'
    });
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1));
  };

  const handleDateClick = (day, dividends) => {
    setSelectedDividends({ day, dividends });
  };

  return (
    <div className="w-full h-full overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-8 h-8" style={{color: 'var(--accent-blue)'}} />
          <h1 className="text-display">배당 캘린더</h1>
        </div>

        <FilterBar
          filters={filters}
          setFilters={setFilters}
          onClearFilters={handleClearFilters}
        />

        <ViewSwitcher
          currentView={currentView}
          setCurrentView={setCurrentView}
        />

        {currentView === 'monthly' && (
          <>
            <CalendarHeader
              currentDate={currentDate}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              totalDividend={totalMonthlyDividend}
            />

            <CalendarGrid
              currentDate={currentDate}
              dividends={currentMonthDividends}
              onDateClick={handleDateClick}
            />

            <DividendSummary dividends={currentMonthDividends} />
          </>
        )}

        {currentView === 'quarterly' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 card-premium hover:scale-105 transition-transform"
                >
                  <ChevronLeft className="w-5 h-5" style={{color: 'var(--text-secondary)'}} />
                </button>
                <h2 className="text-title">{year}년 분기별 배당 현황</h2>
                <button
                  onClick={handleNextMonth}
                  className="p-2 card-premium hover:scale-105 transition-transform"
                >
                  <ChevronRight className="w-5 h-5" style={{color: 'var(--text-secondary)'}} />
                </button>
              </div>
            </div>
            <QuarterlyView year={year} dividends={allMonthDividends} filters={filters} />
          </>
        )}

        {currentView === 'yearly' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 card-premium hover:scale-105 transition-transform"
                >
                  <ChevronLeft className="w-5 h-5" style={{color: 'var(--text-secondary)'}} />
                </button>
                <h2 className="text-title">{year}년 연간 배당 현황</h2>
                <button
                  onClick={handleNextMonth}
                  className="p-2 card-premium hover:scale-105 transition-transform"
                >
                  <ChevronRight className="w-5 h-5" style={{color: 'var(--text-secondary)'}} />
                </button>
              </div>
            </div>
            <YearlyView year={year} dividends={allMonthDividends} filters={filters} />
          </>
        )}

        <DividendGrowthChart filters={filters} monthlyDividendSchedule={monthlyDividendSchedule} />

        <DividendReinvestmentCalculator filters={filters} />

        {/* 연간 배당 예측 */}
        <div className="mt-6 card-premium p-6">
          <h3 className="text-subtitle mb-4">연간 배당 예측</h3>
          <div className="grid grid-cols-2 gap-8">
            {/* 누적 배당 */}
            <div>
              <h4 className="text-body font-semibold mb-4" style={{color: 'var(--text-primary)'}}>
                올해 누적 배당 ({new Date().getMonth() + 1}월까지)
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-caption" style={{color: 'var(--text-secondary)'}}>세전 총액</span>
                  <span className="text-body font-semibold" style={{color: 'var(--accent-blue)'}}>
                    {annualStats.accumulated.toLocaleString()}원
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-caption" style={{color: 'var(--text-secondary)'}}>총 세금</span>
                  <span className="text-body font-semibold" style={{color: 'var(--accent-red)'}}>
                    {annualStats.accumulatedTax.toLocaleString()}원
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-body font-semibold" style={{color: 'var(--text-primary)'}}>실수령액</span>
                  <span className="text-title text-number" style={{color: 'var(--accent-green)'}}>
                    {annualStats.accumulatedNet.toLocaleString()}원
                  </span>
                </div>
              </div>
            </div>

            {/* 연간 예상 */}
            <div>
              <h4 className="text-body font-semibold mb-4" style={{color: 'var(--text-primary)'}}>
                올해 예상 총 배당
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-caption" style={{color: 'var(--text-secondary)'}}>세전 총액</span>
                  <span className="text-body font-semibold" style={{color: 'var(--accent-blue)'}}>
                    {annualStats.annualExpected.toLocaleString()}원
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-caption" style={{color: 'var(--text-secondary)'}}>총 세금</span>
                  <span className="text-body font-semibold" style={{color: 'var(--accent-red)'}}>
                    {annualStats.annualExpectedTax.toLocaleString()}원
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-body font-semibold" style={{color: 'var(--text-primary)'}}>실수령액</span>
                  <span className="text-title text-number" style={{color: 'var(--accent-green)'}}>
                    {annualStats.annualExpectedNet.toLocaleString()}원
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 성장률 */}
          <div className="mt-6 pt-6 border-t text-center">
            <div className="text-caption mb-2" style={{color: 'var(--text-secondary)'}}>
              전년 대비 성장률
            </div>
            <div className="text-title text-number" style={{color: annualStats.growthRate > 0 ? 'var(--accent-green)' : 'var(--accent-red)'}}>
              {annualStats.growthRate > 0 ? '+' : ''}{annualStats.growthRate}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DividendCalendar;