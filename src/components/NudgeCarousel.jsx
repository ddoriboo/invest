import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  TrendingUp,
  Target,
  DollarSign,
  Zap,
  ArrowRight,
  Pause,
  Play
} from 'lucide-react';

const NudgeCarousel = ({
  nudges = [],
  onNudgeClick = () => {},
  autoPlay = true,
  interval = 5000,
  className = ""
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef(null);

  // 자동 순환 로직
  useEffect(() => {
    if (isPlaying && !isHovered && nudges.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % nudges.length);
      }, interval);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isPlaying, isHovered, nudges.length, interval]);

  // 넛지 데이터가 변경되면 인덱스 리셋
  useEffect(() => {
    if (currentIndex >= nudges.length) {
      setCurrentIndex(0);
    }
  }, [nudges.length, currentIndex]);

  const handlePrevious = () => {
    setCurrentIndex(prev => prev === 0 ? nudges.length - 1 : prev - 1);
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % nudges.length);
  };

  const handleIndicatorClick = (index) => {
    setCurrentIndex(index);
  };

  const handleNudgeClick = (nudge) => {
    onNudgeClick(nudge);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  if (!nudges || nudges.length === 0) {
    return null;
  }

  const currentNudge = nudges[currentIndex];

  // 색상 설정 함수
  const getColorClasses = (color, priority) => {
    switch (color) {
      case 'red':
        return {
          bg: 'bg-gradient-to-r from-red-500/10 to-red-600/20',
          border: 'border-red-300/50',
          text: 'text-red-700',
          icon: 'text-red-600',
          pulse: priority === 'HIGH' || priority === 'CRITICAL'
        };
      case 'orange':
        return {
          bg: 'bg-gradient-to-r from-orange-500/10 to-orange-600/20',
          border: 'border-orange-300/50',
          text: 'text-orange-700',
          icon: 'text-orange-600',
          pulse: priority === 'CRITICAL'
        };
      case 'blue':
        return {
          bg: 'bg-gradient-to-r from-blue-500/10 to-blue-600/20',
          border: 'border-blue-300/50',
          text: 'text-blue-700',
          icon: 'text-blue-600',
          pulse: false
        };
      case 'green':
        return {
          bg: 'bg-gradient-to-r from-green-500/10 to-green-600/20',
          border: 'border-green-300/50',
          text: 'text-green-700',
          icon: 'text-green-600',
          pulse: false
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-gray-500/10 to-gray-600/20',
          border: 'border-gray-300/50',
          text: 'text-gray-700',
          icon: 'text-gray-600',
          pulse: false
        };
    }
  };

  const colors = getColorClasses(currentNudge.color, currentNudge.priority);
  const Icon = currentNudge.icon;

  return (
    <div
      className={`relative w-full ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 메인 캐러셀 카드 */}
      <div
        className={`relative overflow-hidden rounded-lg border ${colors.border} ${colors.bg} ${
          colors.pulse ? 'animate-pulse-soft' : ''
        } transition-all duration-500 ease-in-out`}
      >
        <div className="flex items-center justify-between py-2.5 px-4 min-h-[45px]">
          {/* 왼쪽: 상태점 + 콘텐츠 */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {/* 상태점 */}
              <div
                className={`w-2 h-2 rounded-full ${colors.pulse ? 'animate-pulse' : ''}`}
                style={{
                  backgroundColor:
                    currentNudge.color === 'red' ? '#ef4444' :
                    currentNudge.color === 'orange' ? '#f97316' :
                    currentNudge.color === 'blue' ? '#3b82f6' :
                    currentNudge.color === 'green' ? '#22c55e' : '#6b7280'
                }}
              />
              <h3 className={`text-responsive-lg font-semibold ${colors.text} text-no-wrap`}>
                {currentNudge.title}
              </h3>
              <span className={`px-1.5 py-0.5 rounded text-responsive-sm font-medium bg-white/60 ${colors.text} hidden sm:inline`}>
                {currentNudge.priority === 'CRITICAL' ? '긴급' :
                 currentNudge.priority === 'HIGH' ? '중요' :
                 currentNudge.priority === 'MEDIUM' ? '권장' : '참고'}
              </span>
            </div>

            <div className="flex-1 min-w-0 ml-1">
              <p className="text-responsive text-gray-600 leading-tight text-no-wrap">
                {currentNudge.message} → {currentNudge.suggestion}
              </p>
            </div>
          </div>

          {/* 오른쪽: 컨트롤 + 액션 버튼 */}
          <div className="flex items-center gap-2 ml-2">
            {/* 인디케이터 (넛지가 여러 개일 때만) */}
            {nudges.length > 1 && (
              <div className="flex items-center gap-1">
                {nudges.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleIndicatorClick(index)}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      index === currentIndex
                        ? 'bg-gray-600 w-3'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    title={`추천 ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* 재생/일시정지 (넛지가 여러 개일 때만) */}
            {nudges.length > 1 && (
              <button
                onClick={togglePlayPause}
                className="p-1 hover:bg-white/60 rounded transition-colors"
                title={isPlaying ? '일시정지' : '재생'}
              >
                {isPlaying ? (
                  <Pause className="w-3 h-3 text-gray-600" />
                ) : (
                  <Play className="w-3 h-3 text-gray-600" />
                )}
              </button>
            )}

            {/* 액션 버튼 */}
            <button
              onClick={() => handleNudgeClick(currentNudge)}
              className={`px-3 py-1.5 rounded text-responsive-sm font-medium transition-all hover:scale-105 bg-white/80 hover:bg-white ${colors.text} hover:shadow-sm flex items-center gap-1 whitespace-nowrap`}
            >
              <span className="hidden sm:inline">자세히</span>
              <span className="sm:hidden">보기</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* 진행률 바 (자동 재생 시) - 더 얇게 */}
        {isPlaying && !isHovered && nudges.length > 1 && (
          <div className="absolute bottom-0 left-0 h-0.5 bg-black/10 w-full">
            <div
              className={`h-full ${colors.bg.replace('/10', '/40')} transition-all ease-linear`}
              style={{
                width: '100%',
                animation: `progress ${interval}ms linear`
              }}
            />
          </div>
        )}
      </div>

      {/* CSS 애니메이션 정의 */}
      <style jsx>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }

        .animate-pulse-soft {
          animation: pulse-soft 3s ease-in-out infinite;
        }

        @keyframes pulse-soft {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};

export default NudgeCarousel;