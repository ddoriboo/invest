import React, { useState, useMemo } from 'react';
import { Target, TrendingUp, Calendar, AlertCircle, CheckCircle, Clock, Zap, Settings, BarChart3, Calculator } from 'lucide-react';
import { getDividendScheduleData } from '../utils/dividendData';
import InteractiveGoalSimulator from './InteractiveGoalSimulator';

const GoalTrackingDashboard = ({
  goals = [],
  currentPortfolio = {},
  onEditGoal = () => {},
  onDeleteGoal = () => {},
  className = ""
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('1Y');
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [simulatorGoal, setSimulatorGoal] = useState(null);

  // 배당 데이터 가져오기
  const { calendarData, monthlyDividendSchedule } = getDividendScheduleData();

  const timeframes = [
    { key: '3M', label: '3개월' },
    { key: '6M', label: '6개월' },
    { key: '1Y', label: '1년' },
    { key: '3Y', label: '3년' },
    { key: '5Y', label: '5년' }
  ];

  // 목표 진행률 계산 (실제 배당 데이터 사용)
  const calculateGoalProgress = (goal) => {
    const now = new Date();
    const startDate = new Date(goal.createdAt);
    const endDate = new Date(goal.targetDate);

    const totalDuration = endDate - startDate;
    const elapsed = now - startDate;
    const timeProgress = Math.min((elapsed / totalDuration) * 100, 100);

    // 실제 배당 데이터 기반 계산
    const annualDividend = monthlyDividendSchedule.reduce((sum, month) => sum + month.total, 0);
    const actualMonthlyDividend = annualDividend / 12;

    let achievementProgress = 0;
    if (goal.type === 'asset') {
      achievementProgress = (currentPortfolio.totalAsset / goal.targetAmount) * 100;
    } else if (goal.type === 'dividend') {
      // 실제 배당 데이터 사용
      achievementProgress = (actualMonthlyDividend / goal.targetAmount) * 100;
    } else if (goal.type === 'hybrid') {
      const assetProgress = (currentPortfolio.totalAsset / goal.assetTarget) * 100;
      const dividendProgress = (actualMonthlyDividend / goal.dividendTarget) * 100;
      achievementProgress = (assetProgress + dividendProgress) / 2;
    }

    const isOnTrack = achievementProgress >= timeProgress * 0.9;
    const remainingTime = Math.max(0, (endDate - now) / (1000 * 60 * 60 * 24));

    return {
      timeProgress: Math.round(timeProgress),
      achievementProgress: Math.round(Math.min(achievementProgress, 100)),
      isOnTrack,
      remainingDays: Math.ceil(remainingTime),
      status: achievementProgress >= 100 ? 'completed' :
              isOnTrack ? 'on-track' : 'behind',
      actualMonthlyDividend,
      projectedAnnualDividend: annualDividend
    };
  };

  // 목표별 통계
  const goalStats = useMemo(() => {
    const stats = goals.map(goal => ({
      ...goal,
      progress: calculateGoalProgress(goal)
    }));

    const completed = stats.filter(g => g.progress.status === 'completed').length;
    const onTrack = stats.filter(g => g.progress.status === 'on-track').length;
    const behind = stats.filter(g => g.progress.status === 'behind').length;

    return {
      goals: stats,
      summary: { completed, onTrack, behind, total: goals.length }
    };
  }, [goals, currentPortfolio]);

  // 다음 마일스톤 계산
  const getNextMilestone = (goal, progress) => {
    const milestones = [25, 50, 75, 100];
    const currentMilestone = milestones.find(m => m > progress.achievementProgress);

    if (!currentMilestone) return null;

    let targetValue, currentValue;
    if (goal.type === 'asset') {
      targetValue = (goal.targetAmount * currentMilestone / 100);
      currentValue = currentPortfolio.totalAsset;
    } else if (goal.type === 'dividend') {
      targetValue = (goal.targetAmount * currentMilestone / 100);
      currentValue = currentPortfolio.monthlyDividend;
    }

    return {
      percentage: currentMilestone,
      targetValue,
      remainingAmount: targetValue - currentValue
    };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'on-track': return 'text-blue-600 bg-blue-50';
      case 'behind': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'on-track': return TrendingUp;
      case 'behind': return AlertCircle;
      default: return Clock;
    }
  };

  if (goals.length === 0) {
    return (
      <div className={`card-premium p-8 text-center ${className}`}>
        <Target className="w-12 h-12 mx-auto mb-4" style={{color: 'var(--text-tertiary)'}} />
        <h3 className="text-subtitle mb-2" style={{color: 'var(--text-secondary)'}}>
          설정된 목표가 없습니다
        </h3>
        <p className="text-caption mb-4" style={{color: 'var(--text-tertiary)'}}>
          투자 목표를 설정하여 체계적인 투자 계획을 세워보세요
        </p>
        <button
          onClick={() => onEditGoal()}
          className="px-4 py-2 rounded-lg bg-blue-50 text-blue-600 text-sm font-medium hover:bg-blue-100 transition-colors"
        >
          <Target className="w-4 h-4 inline mr-1" />
          목표 설정하기
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 목표 요약 */}
      <div className="card-premium p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" style={{color: 'var(--accent-blue)'}} />
            <h3 className="text-subtitle">목표 현황</h3>
          </div>
          <button
            onClick={() => onEditGoal()}
            className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
          >
            <Settings className="w-3 h-3 inline mr-1" />
            목표 관리
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold" style={{color: 'var(--text-primary)'}}>
              {goalStats.summary.total}
            </div>
            <div className="text-xs" style={{color: 'var(--text-tertiary)'}}>전체 목표</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {goalStats.summary.completed}
            </div>
            <div className="text-xs" style={{color: 'var(--text-tertiary)'}}>달성 완료</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {goalStats.summary.onTrack}
            </div>
            <div className="text-xs" style={{color: 'var(--text-tertiary)'}}>순조 진행</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {goalStats.summary.behind}
            </div>
            <div className="text-xs" style={{color: 'var(--text-tertiary)'}}>지연</div>
          </div>
        </div>
      </div>

      {/* 개별 목표 카드 */}
      <div className="space-y-4">
        {goalStats.goals.map((goal) => {
          const StatusIcon = getStatusIcon(goal.progress.status);
          const nextMilestone = getNextMilestone(goal, goal.progress);

          return (
            <div key={goal.id} className="card-premium p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5" style={{color: 'var(--accent-green)'}} />
                  <div>
                    <h4 className="text-body font-semibold" style={{color: 'var(--text-primary)'}}>
                      {goal.name}
                    </h4>
                    <p className="text-caption" style={{color: 'var(--text-secondary)'}}>
                      {goal.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(goal.progress.status)}`}>
                    <StatusIcon className="w-3 h-3 inline mr-1" />
                    {goal.progress.status === 'completed' ? '완료' :
                     goal.progress.status === 'on-track' ? '순조' : '지연'}
                  </span>
                  <button
                    onClick={() => onEditGoal(goal)}
                    className="text-xs px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                    style={{color: 'var(--text-tertiary)'}}
                  >
                    수정
                  </button>
                </div>
              </div>

              {/* 진행률 바 */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-caption" style={{color: 'var(--text-secondary)'}}>
                    달성률
                  </span>
                  <span className="text-caption font-semibold" style={{color: 'var(--text-primary)'}}>
                    {goal.progress.achievementProgress}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${goal.progress.achievementProgress}%`,
                      background: goal.progress.status === 'completed' ?
                        'linear-gradient(90deg, var(--accent-green), #22c55e)' :
                        goal.progress.status === 'on-track' ?
                        'linear-gradient(90deg, var(--accent-blue), #3b82f6)' :
                        'linear-gradient(90deg, #ef4444, #f87171)'
                    }}
                  />
                </div>
              </div>

              {/* 목표 상세 정보 */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-caption mb-1" style={{color: 'var(--text-secondary)'}}>
                    목표 금액
                  </div>
                  <div className="text-body font-semibold" style={{color: 'var(--text-primary)'}}>
                    {goal.targetAmount?.toLocaleString()}원
                  </div>
                </div>
                <div>
                  <div className="text-caption mb-1" style={{color: 'var(--text-secondary)'}}>
                    목표 일자
                  </div>
                  <div className="text-body font-semibold" style={{color: 'var(--text-primary)'}}>
                    {new Date(goal.targetDate).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-caption mb-1" style={{color: 'var(--text-secondary)'}}>
                    남은 기간
                  </div>
                  <div className="text-body font-semibold" style={{color: 'var(--accent-blue)'}}>
                    {goal.progress.remainingDays}일
                  </div>
                </div>
                <div>
                  <div className="text-caption mb-1" style={{color: 'var(--text-secondary)'}}>
                    시간 진행률
                  </div>
                  <div className="text-body font-semibold" style={{color: 'var(--text-primary)'}}>
                    {goal.progress.timeProgress}%
                  </div>
                </div>
              </div>

              {/* 다음 마일스톤 */}
              {nextMilestone && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">
                      다음 마일스톤: {nextMilestone.percentage}%
                    </span>
                  </div>
                  <div className="text-sm text-blue-700">
                    목표까지 <span className="font-semibold">
                      {nextMilestone.remainingAmount.toLocaleString()}원
                    </span> 남았습니다
                  </div>
                </div>
              )}

              {/* 액션 버튼 */}
              <div className="mt-4 flex gap-2">
                <button className="flex-1 px-3 py-2 rounded-lg bg-blue-50 text-blue-600 text-sm font-medium hover:bg-blue-100 transition-colors">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  일정 보기
                </button>
                <button
                  onClick={() => {
                    setSimulatorGoal(goal);
                    setIsSimulatorOpen(true);
                  }}
                  className="flex-1 px-3 py-2 rounded-lg bg-green-50 text-green-600 text-sm font-medium hover:bg-green-100 transition-colors"
                >
                  <Calculator className="w-4 h-4 inline mr-1" />
                  재시뮬레이션
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 인터랙티브 시뮬레이터 모달 */}
      {simulatorGoal && (
        <InteractiveGoalSimulator
          isOpen={isSimulatorOpen}
          onClose={() => {
            setIsSimulatorOpen(false);
            setSimulatorGoal(null);
          }}
          goalType={simulatorGoal.type}
          initialParams={{
            currentAsset: currentPortfolio.totalAsset || 112000000,
            monthlyInvestment: simulatorGoal.monthlyInvestment || 800000,
            targetAsset: simulatorGoal.targetAmount,
            targetMonthlyDividend: simulatorGoal.targetAmount,
            dividendYield: 4.5,
            years: Math.ceil((new Date(simulatorGoal.targetDate) - new Date()) / (1000 * 60 * 60 * 24 * 365))
          }}
        />
      )}
    </div>
  );
};

export default GoalTrackingDashboard;