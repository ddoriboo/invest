# Investment Dashboard

한국어 투자 대시보드 애플리케이션입니다.

## 기능

- 📊 **포트폴리오 대시보드**: 실시간 자산 현황 및 수익률 추적
- 🎯 **인텔리전트 목표 설정**: AI 기반 투자 목표 추천 시스템
- 📅 **배당 캘린더**: 배당 일정 및 성장 분석
- 💡 **넛지 시스템**: 개인화된 투자 액션 추천
- 📈 **시장 현황**: 실시간 증시 지수 및 뉴스
- 📱 **반응형 디자인**: 모바일/데스크톱 최적화

## 기술 스택

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Typography**: 산돌고딕, Inter

## 로컬 개발

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 미리보기
npm run preview
```

## Railway 배포

### 1. GitHub에 푸시
```bash
# GitHub 인증 후
git push -u origin main
```

### 2. Railway 배포
1. [Railway](https://railway.app)에 로그인
2. "New Project" 클릭
3. "Deploy from GitHub repo" 선택
4. `ddoriboo/invest` 저장소 선택
5. 자동 배포 시작

### 3. 환경 설정
- Node.js 18 자동 감지
- 빌드: `npm ci && npm run build`
- 실행: `npm run start`
- 포트: Railway가 자동 할당

## 파일 구조

```
src/
├── App.jsx                 # 메인 앱 컴포넌트
├── InvestmentDashboard.jsx # 투자 대시보드
├── components/
│   ├── DividendCalendar.jsx
│   ├── GoalTrackingDashboard.jsx
│   ├── IntelligentGoalWizard.jsx
│   ├── NudgeCarousel.jsx
│   └── StockIndexCard.jsx
├── utils/
│   └── dividendData.js
└── index.css              # 스타일 및 디자인 시스템
```

## 라이선스

Private Project