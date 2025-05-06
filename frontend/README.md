# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```

# 이터널 리턴 전적 검색

이터널 리턴 게임의 전적을 검색할 수 있는 웹 애플리케이션입니다.

## 시작하기

### 필수 요구사항

- Node.js 16 이상
- npm 또는 yarn

### 설치

1. 저장소를 클론합니다:
```bash
git clone [repository-url]
cd frontend
```

2. 의존성 패키지를 설치합니다:
```bash
npm install
```

3. 환경 변수 설정:
프로젝트 루트 디렉토리에 `.env` 파일을 생성하고 다음 내용을 추가합니다:
```
VITE_ER_API_KEY=your_api_key_here
```
`your_api_key_here` 부분을 이터널 리턴 API 키로 교체하세요.

### 실행

개발 서버를 시작합니다:
```bash
npm run dev
```

## 기능

- 닉네임으로 유저 검색
- 유저 상세 정보 조회
- 최근 전적 목록 확인
- MMR, 승률, 평균 킬/어시스트 등 통계 정보 표시

## 기술 스택

- React
- TypeScript
- Tailwind CSS
- Axios
- React Router
