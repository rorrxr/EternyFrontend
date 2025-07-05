# ER Stats Frontend

이터널리턴 플레이어 전적 검색 및 통계 분석 웹 애플리케이션

## 🚀 기술 스택

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 4
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router DOM
- **HTTP Client**: Fetch API (네이티브)
- **Development**: ESLint, TypeScript

## 📁 프로젝트 구조

```
frontend/
├── src/
│   ├── components/          # React 컴포넌트
│   │   ├── ErrorBoundary.tsx    # 에러 바운더리
│   │   ├── Providers.tsx        # 앱 프로바이더
│   │   ├── CharacterStats.tsx   # 캐릭터 통계
│   │   ├── CharacterWinChart.tsx # 승률 차트
│   │   ├── MatchHistory.tsx     # 매치 히스토리
│   │   └── PlayerProfile.tsx    # 플레이어 프로필
│   ├── hooks/              # 커스텀 훅
│   │   └── useApi.ts       # API 관련 훅들
│   ├── lib/                # 유틸리티 및 설정
│   │   ├── config.ts       # 앱 설정
│   │   └── api/
│   │       └── client.ts   # API 클라이언트
│   ├── pages/              # 페이지 컴포넌트
│   │   ├── PlayerStatsPage.tsx
│   │   └── SearchPage.tsx
│   ├── services/           # 서비스 레이어
│   │   ├── api.ts          # 기존 API 서비스
│   │   └── erApi.ts        # 이터널리턴 API
│   ├── types/              # TypeScript 타입 정의
│   │   └── api.ts          # API 타입들
│   ├── App.tsx             # 메인 앱 컴포넌트
│   ├── main.tsx            # 앱 진입점
│   └── index.css           # 글로벌 스타일
├── .env.local              # 환경변수 (로컬)
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 🛠️ 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# 이터널리턴 API 설정
VITE_ER_API_URL=https://open-api.bser.io
VITE_API_KEY=your_api_key_here

# 개발 환경 설정
NODE_ENV=development
VITE_APP_URL=http://localhost:5173

# 분석 도구 (선택사항)
VITE_ANALYZE=false
```

**중요**: `VITE_API_KEY`를 실제 이터널리턴 API 키로 변경하세요.

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173`으로 접속하세요.

### 4. 프로덕션 빌드

```bash
npm run build
```

빌드된 파일은 `dist/` 디렉토리에 생성됩니다.

## 🔧 주요 기능

### ✅ 완료된 기능

- **강화된 에러 처리**: 사용자 친화적 에러 메시지
- **타입 안정성**: 완전한 TypeScript 지원
- **성능 최적화**: 지능적 캐싱 및 재시도 로직
- **개발자 경험**: 디버깅 도구 및 개발 모드 향상
- **운영 안정성**: 글로벌 에러 바운더리

### 🚧 개발 중인 기능

- 플레이어 검색
- 전적 통계 표시
- 캐릭터별 통계
- 매치 히스토리
- 랭킹 시스템

## 📚 API 사용법

### 기본 사용법

```typescript
import { useSearchUser, useUserStats } from './hooks/useApi'

function PlayerSearch() {
  const { data: user, isLoading, error } = useSearchUser('플레이어닉네임')
  
  if (isLoading) return <div>로딩 중...</div>
  if (error) return <div>에러: {error.message}</div>
  
  return <div>플레이어: {user?.nickname}</div>
}
```

### 고급 사용법

```typescript
import { usePlayerProfile } from './hooks/useApi'

function PlayerProfile({ nickname }: { nickname: string }) {
  const { user, stats, games, isLoading, error } = usePlayerProfile(nickname)
  
  // 사용자 정보, 통계, 최근 게임 기록을 한 번에 가져옴
  return (
    <div>
      {/* UI 컴포넌트들 */}
    </div>
  )
}
```

## 🎨 스타일링

Tailwind CSS를 사용하여 스타일링합니다:

```tsx
<div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen">
  <div className="container mx-auto px-4 py-8">
    {/* 컨텐츠 */}
  </div>
</div>
```

## 🔍 개발 도구

### React Query DevTools

개발 환경에서 자동으로 활성화됩니다. 브라우저 우하단에서 쿼리 상태를 확인할 수 있습니다.

### 에러 바운더리

앱 전체에 에러 바운더리가 적용되어 있어 예상치 못한 오류를 안전하게 처리합니다.

## 🚀 배포

### Vercel 배포

1. Vercel에 프로젝트 연결
2. 환경변수 설정:
   - `VITE_ER_API_URL`
   - `VITE_API_KEY`
   - `VITE_APP_URL`
3. 자동 배포 활성화

### Netlify 배포

1. Netlify에 프로젝트 연결
2. 빌드 명령어: `npm run build`
3. 배포 디렉토리: `dist`
4. 환경변수 설정

## 🐛 문제 해결

### 자주 발생하는 문제

1. **API 키 오류**
   ```
   해결: .env.local 파일에서 API 키가 올바르게 설정되었는지 확인
   ```

2. **타입 에러**
   ```
   해결: npm run build로 타입 체크 후 오류 수정
   ```

3. **빌드 실패**
   ```
   해결: node_modules 삭제 후 재설치
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **환경변수 인식 안됨**
   ```
   해결: 개발 서버 재시작 (환경변수 변경 시 필수)
   npm run dev
   ```

## 📝 라이선스

MIT License

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해주세요.
