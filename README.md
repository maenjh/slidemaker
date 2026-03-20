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

## API 레퍼런스

### Slidemaker 브릿지 서버 (port 3001)

| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/generate-pptx` | 스크립트 파일 업로드 → Claude 추출 → PPTX 생성 (multipart: `script`) |

### FastAPI 백엔드 (port 8000)

#### 프레젠테이션 (`/api/v1/ppt/presentation`)

| Method | Path | 설명 |
|--------|------|------|
| GET | `/presentation/all` | 전체 프레젠테이션 목록 (첫 슬라이드 포함) |
| GET | `/presentation/{id}` | 프레젠테이션 상세 조회 (전체 슬라이드) |
| DELETE | `/presentation/{id}` | 프레젠테이션 삭제 |
| POST | `/presentation/create` | 프레젠테이션 생성 (동기) |
| POST | `/presentation/prepare` | 아웃라인/레이아웃으로 프레젠테이션 준비 |
| GET | `/presentation/stream/{id}` | 프레젠테이션 생성 SSE 스트림 |
| PATCH | `/presentation/update` | 프레젠테이션 속성 수정 |
| POST | `/presentation/export/pptx` | PPTX 모델로 직접 내보내기 |
| POST | `/presentation/export` | PPTX 또는 PDF로 내보내기 |
| POST | `/presentation/generate` | 콘텐츠/마크다운으로 프레젠테이션 생성 (동기) |
| POST | `/presentation/generate/async` | 비동기 프레젠테이션 생성 |
| GET | `/presentation/status/{id}` | 비동기 생성 상태 확인 |
| POST | `/presentation/edit` | 슬라이드 콘텐츠 편집 |
| POST | `/presentation/derive` | 기존 프레젠테이션 기반 파생 생성 |

#### 슬라이드 (`/api/v1/ppt/slide`)

| Method | Path | 설명 |
|--------|------|------|
| POST | `/slide/edit` | 프롬프트로 슬라이드 편집 |
| POST | `/slide/edit-html` | 프롬프트로 슬라이드 HTML 편집 |

#### 아웃라인 (`/api/v1/ppt/outlines`)

| Method | Path | 설명 |
|--------|------|------|
| GET | `/outlines/stream/{id}` | 아웃라인 생성 SSE 스트림 |

#### 파일 (`/api/v1/ppt/files`)

| Method | Path | 설명 |
|--------|------|------|
| POST | `/files/upload` | 문서 파일 업로드 |
| POST | `/files/decompose` | 업로드 파일을 텍스트로 분해 |
| POST | `/files/update` | 기존 파일 업데이트 |

#### PPTX/PDF 처리 (`/api/v1/ppt`)

| Method | Path | 설명 |
|--------|------|------|
| POST | `/pptx-slides/process` | PPTX 업로드 → 슬라이드/스크린샷/폰트 추출 |
| POST | `/pptx-fonts/process` | PPTX 폰트 정보 분석 |
| POST | `/pdf-slides/process` | PDF 업로드 → 페이지 스크린샷 추출 |

#### 이미지 (`/api/v1/ppt/images`)

| Method | Path | 설명 |
|--------|------|------|
| GET | `/images/generate` | AI 이미지 생성 (`?prompt=...`) |
| GET | `/images/generated` | 생성된 이미지 목록 |
| POST | `/images/upload` | 커스텀 이미지 업로드 |
| GET | `/images/uploaded` | 업로드된 이미지 목록 |
| DELETE | `/images/{id}` | 이미지 삭제 |

#### 아이콘 (`/api/v1/ppt/icons`)

| Method | Path | 설명 |
|--------|------|------|
| GET | `/icons/search` | 아이콘 검색 (`?query=...&limit=20`) |

#### 폰트 (`/api/v1/ppt/fonts`)

| Method | Path | 설명 |
|--------|------|------|
| POST | `/fonts/upload` | 커스텀 폰트 업로드 (TTF, OTF, WOFF, WOFF2) |
| GET | `/fonts/uploaded` | 업로드된 폰트 목록 |
| DELETE | `/fonts/{font_id}` | 폰트 삭제 |

#### 테마 (`/api/v1/ppt/themes`)

| Method | Path | 설명 |
|--------|------|------|
| GET | `/themes/default` | 기본 내장 테마 목록 |
| GET | `/themes/all` | 전체 커스텀 테마 목록 |
| POST | `/themes/create` | 커스텀 테마 생성 |
| PATCH | `/themes/update/{theme_id}` | 테마 수정 |
| DELETE | `/themes/delete/{theme_id}` | 테마 삭제 |
| POST | `/theme/generate` | 색상으로 테마 자동 생성 |

#### HTML 변환 (`/api/v1/ppt`)

| Method | Path | 설명 |
|--------|------|------|
| POST | `/slide-to-html/` | 슬라이드 이미지 + OXML → HTML 변환 |
| POST | `/html-to-react/` | HTML → React TSX 컴포넌트 변환 |
| POST | `/html-edit/` | 이미지/프롬프트로 HTML 편집 |

#### 템플릿 관리 (`/api/v1/ppt/template-management`)

| Method | Path | 설명 |
|--------|------|------|
| POST | `/template-management/save-templates` | 레이아웃 저장 |
| GET | `/template-management/get-templates/{id}` | 프레젠테이션별 레이아웃 조회 |
| GET | `/template-management/summary` | 전체 템플릿 요약 |
| POST | `/template-management/templates` | 템플릿 생성/수정 |
| DELETE | `/template-management/delete-templates/{id}` | 템플릿 삭제 |

#### AI 모델 확인

| Method | Path | 설명 |
|--------|------|------|
| POST | `/anthropic/models/available` | 사용 가능한 Anthropic 모델 확인 |
| POST | `/openai/models/available` | 사용 가능한 OpenAI 호환 모델 확인 |
| POST | `/google/models/available` | 사용 가능한 Google 모델 확인 |
| GET | `/ollama/models/supported` | 지원되는 Ollama 모델 목록 |
| GET | `/ollama/models/available` | 로컬에 설치된 Ollama 모델 목록 |
| GET | `/ollama/model/pull` | Ollama 모델 다운로드 |

#### Webhook (`/api/v1/webhook`)

| Method | Path | 설명 |
|--------|------|------|
| POST | `/webhook/subscribe` | 웹훅 이벤트 구독 |
| DELETE | `/webhook/unsubscribe` | 웹훅 구독 해제 |

### Next.js 프론트엔드 API (port 3000)

| Method | Path | 설명 |
|--------|------|------|
| GET | `/api/can-change-keys` | API 키 변경 가능 여부 확인 |
| GET | `/api/user-config` | 사용자 LLM 설정 조회 |
| POST | `/api/user-config` | 사용자 LLM 설정 저장 |
| GET | `/api/has-required-key` | OpenAI API 키 설정 여부 확인 |
| GET | `/api/telemetry-status` | 텔레메트리 활성화 상태 |
| POST | `/api/read-file` | 허용 디렉토리 내 파일 읽기 |
| POST | `/api/save-layout` | 레이아웃 컴포넌트 디스크 저장 |
| POST | `/api/upload-image` | 이미지 업로드 |
| POST | `/api/export-as-pdf` | Puppeteer로 PDF 내보내기 |
| GET | `/api/template` | 템플릿 그룹 스키마 조회 |
| GET | `/api/templates` | 전체 프레젠테이션 템플릿 목록 |
| GET | `/api/presentation_to_pptx_model` | Puppeteer로 PPTX 모델 추출 |

## 참고

이 프로젝트의 `backend/`와 `frontend/`는 오픈소스 AI 프레젠테이션 생성기인 [Presenton](https://github.com/AJV009/presenton)을 기반으로 합니다. Slidemaker는 방송 스크립트에 특화된 콘텐츠 추출 파이프라인(Claude)과 업로드 브릿지 서버를 추가하여 Presenton의 슬라이드 생성/편집 엔진을 활용합니다.
