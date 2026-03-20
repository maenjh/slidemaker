# Slidemaker

방송 스크립트(.docx, .txt, .md)를 업로드하면 AI가 내용을 분석하여 PPTX 프레젠테이션을 자동 생성하는 시스템.

## 구조

```
slidemaker/
├── server.mjs              # Express 브릿지 서버 (port 3001)
├── src/                    # Claude 콘텐츠 추출 및 프롬프트
│   ├── extractContentClaude.mjs
│   ├── prompts.mjs
│   └── config.mjs
├── public/
│   └── index.html          # 업로드 UI
├── backend/                # Presenton FastAPI 백엔드 (port 8000)
│   ├── api/                # API 라우트 (/api/v1/ppt/*)
│   ├── services/           # LLM, 이미지 생성, 아이콘 검색
│   ├── static/             # 아이콘 SVG, placeholder 이미지
│   └── utils/
├── frontend/               # Presenton Next.js 프론트엔드 (port 3000)
│   ├── app/                # 프레젠테이션 편집기, pdf-maker
│   └── next.config.mjs     # API/static 프록시 설정
├── output/                 # PPTX 내보내기 저장 경로
├── Makefile                # 개발 서버 실행
└── .env                    # API 키 설정
```

## 동작 흐름

1. 사용자가 `localhost:3001`에서 스크립트 파일 업로드
2. **Claude**가 스크립트를 분석하여 슬라이드별 구조화된 콘텐츠 추출
3. 추출된 콘텐츠를 마크다운으로 변환 후 **FastAPI** 백엔드에 전달
4. 백엔드가 LLM으로 슬라이드 콘텐츠 생성 + OpenAI로 이미지 생성
5. **Puppeteer**가 Next.js의 pdf-maker 페이지를 렌더링하여 PPTX 모델 추출
6. 최종 PPTX 파일을 `output/` 디렉토리에 저장
7. 생성 완료 후 `localhost:3000/presentation?id=XXX`에서 슬라이드 편집 가능

## 사전 요구사항

- **Python** 3.11 + [uv](https://docs.astral.sh/uv/)
- **Node.js** 18+
- **Chromium** (Puppeteer용, `PUPPETEER_EXECUTABLE_PATH` 환경변수로 지정 가능)

## 설정

`.env` 파일을 프로젝트 루트에 생성:

```env
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
```

백엔드 의존성 설치:

```bash
cd backend && uv sync
```

프론트엔드 및 브릿지 서버 의존성 설치:

```bash
cd frontend && npm install
cd .. && npm install
```

## 실행

```bash
make dev
```

세 개 서버가 동시에 시작됩니다:

| 서비스 | 포트 | 설명 |
|--------|------|------|
| FastAPI 백엔드 | 8000 | 프레젠테이션 생성 API, 아이콘/이미지 서빙 |
| Next.js 프론트엔드 | 3000 | 프레젠테이션 편집기, Puppeteer PPTX 렌더링 |
| Slidemaker 브릿지 | 3001 | 파일 업로드 UI, Claude 콘텐츠 추출 |

업로드 UI: http://localhost:3001

## 종료

```bash
make stop
```

임시 데이터까지 정리:

```bash
make clean
```

## 주요 설정

`Makefile`에서 자동 생성하는 `userConfig.json`:

| 항목 | 값 | 설명 |
|------|-----|------|
| `LLM` | `anthropic` | 슬라이드 콘텐츠 생성용 LLM |
| `IMAGE_PROVIDER` | `gpt-image-1.5` | 슬라이드 이미지 생성 모델 |
| `DISABLE_IMAGE_GENERATION` | `false` | 이미지 생성 활성화 여부 |

## 참고

이 프로젝트의 `backend/`와 `frontend/`는 오픈소스 AI 프레젠테이션 생성기인 [Presenton](https://github.com/AJV009/presenton)을 기반으로 합니다. Slidemaker는 방송 스크립트에 특화된 콘텐츠 추출 파이프라인(Claude)과 업로드 브릿지 서버를 추가하여 Presenton의 슬라이드 생성/편집 엔진을 활용합니다.
