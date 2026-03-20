import { COLORS, SLIDES } from './config.mjs';

/* ──────────────────────────────────────────────
   VISUAL_TEMPLATES – PDF 분석 기반 슬라이드별 상세 시각 묘사
   ────────────────────────────────────────────── */
export const VISUAL_TEMPLATES = {
  1: `중앙에 해당 지역의 실제 지리적 윤곽선(실루엣)을 네이비 선으로 그려줘. 윤곽선 내부 중심에 틸그린 동심원(3겹)을 배치하고, 가장 안쪽 원 안에 핵심 키워드를 넣어줘. 윤곽선 오른쪽 상단에 네이비 직사각형 박스(제목)를 놓고 가는 선으로 동심원과 연결해줘. 지역 윤곽선은 실제 지도처럼 자연스러운 해안선/경계선 형태여야 하고, 내부에 작은 산/건물 실루엣을 은은하게 넣어도 좋아.`,

  2: `두 개의 큰 도넛차트를 좌우로 배치해줘. 각 도넛 중앙에는 사람 실루엣 아이콘(상반신 윤곽)을 넣어줘. 성장률이 높은 쪽 도넛 옆에 틸그린 상승 화살표(↑)를 크게 배치하고, 우상단에 방패 모양 아이콘 뱃지(위험도/등급 표시)를 넣어줘. 도넛의 채움 비율은 데이터에 맞게 조정하고, 하단에 비교 라벨을 배치해줘.`,

  3: `2x2 그리드의 4개 카드를 배치하되, 각 카드의 상단 2/3 영역에 해당 주제를 나타내는 큰 상세 플랫 일러스트를 넣어줘. 예: 주거→건물+아파트 일러스트, 교육→학교 건물+졸업모자, 녹지→공원 나무+벤치, 상업→상가 건물+간판. 일러스트는 단색 플랫 디자인(네이비 또는 틸그린 톤)으로 그리고, 하단 1/3에 라벨과 간단한 설명을 넣어줘. 하이라이트 카드는 틸그린 배경으로 강조.`,

  4: `3개의 거대한 네이비 채움 쉐브론 화살표(▶ 형태)를 가로로 나열해줘. 각 쉐브론 안에 단계명을 흰색 굵은 글씨로 넣고, 쉐브론 사이는 자연스럽게 연결해줘. 하단에는 톱니바퀴 아이콘(⚙)을 나열하고 그 옆에 도전과제 세부항목을 점 리스트로 표시해줘. 톱니바퀴는 코랄색으로 강조.`,

  5: `시소(seesaw) 구조를 중앙에 배치해줘. 삼각형 받침점 위에 수평 막대가 놓이고, 왼쪽에는 코랄색 배경 위에 문제 상황의 미니 씬(예: 차량 정체, 공사 현장, 혼잡한 거리 등)을 실루엣/아이콘으로 그려줘. 오른쪽에는 틸그린 배경 위에 해결 상황의 미니 씬(예: 보행자 도로, 깨끗한 거리, 공원 등)을 실루엣/아이콘으로 그려줘. 양쪽을 잇는 점선 아치를 상단에 그려서 전환을 표현해줘.`,

  6: `좌측에 코랄색 원 안에 버스 아이콘을 넣고, 실선으로 중앙의 하늘색 다이아몬드(환승 포인트)에 연결해줘. 다이아몬드에서 오른쪽으로 틸그린 점선 곡선 경로를 그리고, 경로 끝에 비행기 궤적 아이콘이나 화살표를 넣어줘. 점선 경로는 완만한 곡선으로 날아가는 느낌을 줘. 경로 위에 작은 이동 아이콘(자전거, 보행자 등)을 점점이 배치해도 좋아.`,

  7: `상단에 코랄색 둥근 박스 2개를 나란히 배치하고, 각 박스 안에 흰색 아이콘(예: 아령/운동, 휠체어/복지, 쇼핑카트/상업, 집/주거 등)을 넣어줘. 하단에는 네이비 벽돌 그리드 형태로 3개 인프라 박스를 배치하고 각각 흰색 아이콘을 넣어줘. 상단과 하단 사이에 점선 갭 표시(빈 공간+점선 테두리)를 넣어서 부족한 부분을 시각화해줘.`,

  8: `중앙에 큰 틸그린 원을 놓고 그 안에 하트 아이콘(❤ 또는 사람+하트)을 넣어줘. 사방(좌상, 우상, 좌하, 우하) 코너에 각각 고유한 아이콘이 든 점선 원을 배치해줘: 건물 아이콘(도시개발), 저울 아이콘(균형/공정), 버스 아이콘(교통), 퍼즐 아이콘(통합/협력). 각 코너에서 중앙 하트 원을 향해 수렴하는 화살표를 그려줘.`,
};

/* ──────────────────────────────────────────────
   Stage 1: 콘텐츠 추출 프롬프트
   ────────────────────────────────────────────── */
export function buildExtractionPrompt(scriptText) {
  return `당신은 프레젠테이션 콘텐츠 구조화 전문가입니다.
아래 스크립트를 분석하여 8개 슬라이드에 맞는 콘텐츠를 JSON으로 추출하세요.

## 슬라이드 구조

slide_1 (Title + Map): 전체 주제를 요약하는 타이틀 슬라이드
- title: 프레젠테이션 제목 (한 줄)
- subtitle: 부제목 (한 줄)
- centerLabel: 중앙 지도/동심원에 들어갈 핵심 키워드
- mapShape: 해당 지역의 지리적 윤곽선 묘사 (예: "제주도 섬 형태의 타원형 윤곽선, 한라산 중앙 돌출" 또는 "서울 강남구 사다리꼴 형태 윤곽")

slide_2 (Donut Compare): 두 영역을 도넛차트로 비교
- statusBadge: 상태 요약 텍스트 (예: "현황 분석")
- areaA: { label: 영역A 이름, value: 핵심 수치/설명, growth: 성장률/변화 (예: "+12%↑") }
- areaB: { label: 영역B 이름, value: 핵심 수치/설명, growth: 성장률/변화 }
- bottomLabel: 하단 비교 요약 라벨 (예: "인구 증가율 비교")
- riskBadge: 위험도/등급 뱃지 텍스트 (예: "관심 지역")

slide_3 (2x2 Grid Cards): 4가지 핵심 항목을 카드로 정리
- title: 슬라이드 제목
- cards: 4개 배열 [{ label: 카드 제목, detail: 한 줄 설명, highlighted: boolean (하나만 true), iconDesc: AI가 그릴 수 있는 구체적 일러스트 묘사 (예: "네이비색 아파트 건물 3채와 작은 나무") }]

slide_4 (Chevron Timeline): 진행 과정 3단계 + 도전과제
- timelineTitle: 타임라인 제목 (예: "사업 추진 경과")
- progressLabel: 진행 상황 요약 라벨
- steps: 3개 단계 텍스트 배열
- challenge: 현재 도전과제/이슈 (빨간색으로 강조될 내용)
- challengeDetails: 도전과제 세부항목 배열 (예: ["허가 지연", "주민 반대", "예산 부족"])

slide_5 (Seesaw Balance): 문제 vs 해결 대비
- title: 슬라이드 제목
- problemA: 문제점/현재 이슈
- solutionB: 해결책/대안
- problemScene: 문제 상황의 미니 씬 묘사 (예: "코랄색 배경 위 정체된 차량 3대와 매연 구름")
- solutionScene: 해결 상황의 미니 씬 묘사 (예: "틸그린 배경 위 넓은 보행자 도로와 자전거 타는 사람")

slide_6 (Route Flow): 흐름/경로 변화
- start: 시작점/현재 상태
- transfer: 전환점/매개 요소
- newRoute: 새로운 방향/목표
- startIcon: 시작점 아이콘 묘사 (예: "빨간 버스 아이콘")
- endIcon: 도착점 아이콘 묘사 (예: "비행기 궤적과 점선 경로")

slide_7 (Block Layout): 필요 vs 인프라 vs 갭 분석
- slideTitle: 슬라이드 제목 (예: "주민 필요 vs 인프라 현황")
- needs: 2개 필요 항목 배열
- needIcons: 2개 아이콘 묘사 배열 (예: ["아령/운동 아이콘", "쇼핑카트 아이콘"])
- infrastructure: 3개 기반/인프라 항목 배열
- infraIcons: 3개 아이콘 묘사 배열 (예: ["건물 아이콘", "버스 아이콘", "공원 나무 아이콘"])
- gaps: 2개 갭/부족 항목 배열

slide_8 (Hub Summary): 중심 목표 + 4개 이슈 수렴
- summaryTitle: 슬라이드 제목 (예: "핵심 과제 종합")
- goal: 중심 목표/비전
- goalIcon: 목표 아이콘 묘사 (예: "하트 아이콘" 또는 "사람과 하트")
- issues: 4개 핵심 이슈/과제 배열
- issueIcons: 4개 아이콘 묘사 배열 (예: ["건물 아이콘", "저울 아이콘", "버스 아이콘", "퍼즐 아이콘"])

## 규칙
- 스크립트의 맥락과 핵심 내용을 정확히 반영할 것
- 각 텍스트는 슬라이드에 표시할 수 있도록 간결하게 (최대 15자 내외)
- 수치 데이터가 있으면 적극 활용
- 아이콘/일러스트 설명(iconDesc, needIcons, infraIcons, issueIcons, problemScene, solutionScene 등)은 AI 이미지 생성 도구가 그릴 수 있도록 구체적 사물/장면으로 묘사할 것 (예: "네이비색 학교 건물 옆에 졸업 모자", "코랄색 차량 3대가 줄지어 선 정체 장면")
- 단순 기하학적 도형(원, 사각형 등)만으로 설명하지 말고, 구체적 사물/아이콘/장면으로 묘사할 것
- 반드시 위 구조의 JSON만 반환 (다른 텍스트 없이)

## 스크립트
${scriptText}`;
}

/* ──────────────────────────────────────────────
   buildImagePrompt (English – legacy)
   ────────────────────────────────────────────── */
export function buildImagePrompt(slideConfig, content) {
  const designRules = `
Design System Rules:
- Background: pure white (${COLORS.bg})
- Primary color (headings, frames): Navy (${COLORS.navy})
- Accent color (highlights, positive): Teal (${COLORS.teal})
- Warning/emphasis color: Coral (${COLORS.coral})
- Font style: Bold gothic/sans-serif, large text, minimal words
- Style: Clean consulting report infographic, professional, minimal text
- Visual elements should be the hero (70%+ of slide area), not text
- Consistent spacing and visual grammar across slides
- All text must be in Korean
- DO NOT include any English text except numbers
- Use flat design icons and illustrations, NOT simple geometric shapes
`;

  /* ── Coordinate-based layout instructions (percentage of slide area) ── */
  const layoutInstructions = {
    1: `Create a title slide.
LAYOUT (coordinate-based):
- Region map silhouette: centered at x:25-65%, y:15-85% of slide. Draw the actual geographic outline of the region described in "${content.mapShape || '지역 윤곽선'}". Inside the silhouette, place 3 concentric teal circles at the center with "${content.centerLabel}" in the innermost circle.
- Title box: navy rectangle at x:60-95%, y:10-35%. Contains "${content.title}" in white bold text. A thin line connects this box to the concentric circles.
- Subtitle: "${content.subtitle}" at x:60-95%, y:38-45% in navy text.
VISUAL DETAILS: ${VISUAL_TEMPLATES[1]}`,

    2: `Create a donut chart comparison slide.
LAYOUT (coordinate-based):
- Status badge: teal rounded rectangle at x:35-65%, y:3-10% with "${content.statusBadge}".
- Left donut chart: centered at x:10-45%, y:20-80%. Navy color segments. Label "${content.areaA?.label}" below. Value "${content.areaA?.value}" inside donut. Person silhouette icon in the donut hole. Growth indicator "${content.areaA?.growth}" in teal arrow nearby.
- Right donut chart: centered at x:55-90%, y:20-80%. Teal color segments. Label "${content.areaB?.label}" below. Value "${content.areaB?.value}" inside donut. Person silhouette icon in the donut hole. Growth indicator "${content.areaB?.growth}".
- Risk badge: shield icon at x:80-95%, y:3-15% with "${content.riskBadge}".
- Bottom label: "${content.bottomLabel}" at x:25-75%, y:88-95%.
VISUAL DETAILS: ${VISUAL_TEMPLATES[2]}`,

    3: `Create a 2x2 grid cards slide.
LAYOUT (coordinate-based):
- Title: "${content.title}" at x:5-95%, y:2-10% in navy bold.
- Card grid (2x2) filling x:5-95%, y:12-95%:
  - Top-left card (x:5-48%, y:12-52%): ${(content.cards || [])[0] ? `"${content.cards[0].label}" - ${content.cards[0].detail}. Icon: ${content.cards[0].iconDesc || 'flat illustration'}${content.cards[0].highlighted ? '. TEAL background highlight.' : '. White bg, navy border.'}` : ''}
  - Top-right card (x:52-95%, y:12-52%): ${(content.cards || [])[1] ? `"${content.cards[1].label}" - ${content.cards[1].detail}. Icon: ${content.cards[1].iconDesc || 'flat illustration'}${content.cards[1].highlighted ? '. TEAL background highlight.' : '. White bg, navy border.'}` : ''}
  - Bottom-left card (x:5-48%, y:55-95%): ${(content.cards || [])[2] ? `"${content.cards[2].label}" - ${content.cards[2].detail}. Icon: ${content.cards[2].iconDesc || 'flat illustration'}${content.cards[2].highlighted ? '. TEAL background highlight.' : '. White bg, navy border.'}` : ''}
  - Bottom-right card (x:52-95%, y:55-95%): ${(content.cards || [])[3] ? `"${content.cards[3].label}" - ${content.cards[3].detail}. Icon: ${content.cards[3].iconDesc || 'flat illustration'}${content.cards[3].highlighted ? '. TEAL background highlight.' : '. White bg, navy border.'}` : ''}
- Each card: top 2/3 area has a large flat illustration, bottom 1/3 has label + detail text.
VISUAL DETAILS: ${VISUAL_TEMPLATES[3]}`,

    4: `Create a chevron timeline slide.
LAYOUT (coordinate-based):
- Title: "${content.progressLabel}" at x:5-95%, y:2-10% in navy bold.
- 3 large navy-filled chevron arrows spanning x:5-95%, y:15-55%, evenly distributed:
  - Chevron 1 (x:5-33%): "${(content.steps || [])[0]}" in white bold text inside.
  - Chevron 2 (x:34-65%): "${(content.steps || [])[1]}" in white bold text inside.
  - Chevron 3 (x:66-95%): "${(content.steps || [])[2]}" in white bold text inside.
  - Chevrons connect seamlessly left-to-right (▶ shape).
- Challenge section at x:5-95%, y:60-95%:
  - Coral gear icons (⚙) in a row at y:62-72%.
  - Challenge title: "${content.challenge}" in coral bold.
  - Details as bullet list: ${(content.challengeDetails || []).map(d => `"${d}"`).join(', ')}
VISUAL DETAILS: ${VISUAL_TEMPLATES[4]}`,

    5: `Create a seesaw/balance diagram slide.
LAYOUT (coordinate-based):
- Title: "${content.title}" at x:5-95%, y:2-10%.
- Seesaw structure centered at x:10-90%, y:20-85%:
  - Triangle fulcrum: centered at x:50%, y:75-85% (inverted triangle base).
  - Horizontal beam: x:10-90%, y:55-65% resting on fulcrum.
  - Left platform (x:10-45%, y:25-55%): coral background box. Problem: "${content.problemA}". Mini scene: ${content.problemScene || 'problem situation icons'}.
  - Right platform (x:55-90%, y:25-55%): teal background box. Solution: "${content.solutionB}". Mini scene: ${content.solutionScene || 'solution situation icons'}.
  - Dashed arch connecting left to right at y:15-25% showing transformation.
VISUAL DETAILS: ${VISUAL_TEMPLATES[5]}`,

    6: `Create a route/flow diagram slide.
LAYOUT (coordinate-based):
- Start point (x:5-25%, y:30-70%): coral circle with bus icon inside. Label "${content.start}" below.
- Solid line from x:25% to x:40%.
- Transfer point (x:35-55%, y:30-70%): light blue diamond shape. Label "${content.transfer}" inside.
- Teal dashed curved line from x:55% to x:85%, gentle arc upward.
- End point (x:75-95%, y:30-70%): teal arrow/airplane trajectory icon. Label "${content.newRoute}".
- Small movement icons (bicycle, pedestrian) scattered along the dashed path.
VISUAL DETAILS: ${VISUAL_TEMPLATES[6]}`,

    7: `Create a block layout diagram slide.
LAYOUT (coordinate-based):
- Title: "${content.slideTitle}" at x:5-95%, y:2-10% in navy bold.
- Top row (needs) at x:10-90%, y:12-35%: 2 coral rounded boxes side by side.
  - Box 1 (x:10-42%): "${(content.needs || [])[0]}" with white icon (${(content.needIcons || [])[0] || 'need icon'}).
  - "+" symbol at x:45-50%.
  - Box 2 (x:52-90%): "${(content.needs || [])[1]}" with white icon (${(content.needIcons || [])[1] || 'need icon'}).
- Gap indicators at x:10-90%, y:38-55%: coral dashed border boxes showing "${(content.gaps || [])[0]}" and "${(content.gaps || [])[1]}".
- Bottom row (infrastructure) at x:5-95%, y:58-90%: 3 navy brick-style boxes.
  - Box 1 (x:5-32%): "${(content.infrastructure || [])[0]}" with white icon (${(content.infraIcons || [])[0] || 'infra icon'}).
  - Box 2 (x:34-66%): "${(content.infrastructure || [])[1]}" with white icon (${(content.infraIcons || [])[1] || 'infra icon'}).
  - Box 3 (x:68-95%): "${(content.infrastructure || [])[2]}" with white icon (${(content.infraIcons || [])[2] || 'infra icon'}).
VISUAL DETAILS: ${VISUAL_TEMPLATES[7]}`,

    8: `Create a hub/spoke summary diagram.
LAYOUT (coordinate-based):
- Title: "${content.summaryTitle}" at x:5-95%, y:2-10% in navy bold.
- Center hub: large teal filled circle at x:35-65%, y:30-70%. Inside: heart icon (${content.goalIcon || '❤'}) and "${content.goal}" text.
- 4 corner boxes with dashed circle borders, each with unique icon and arrow pointing to center:
  - Top-left (x:3-28%, y:12-35%): "${(content.issues || [])[0]}" with icon (${(content.issueIcons || [])[0] || 'icon'}). Arrow → center.
  - Top-right (x:72-97%, y:12-35%): "${(content.issues || [])[1]}" with icon (${(content.issueIcons || [])[1] || 'icon'}). Arrow → center.
  - Bottom-left (x:3-28%, y:65-88%): "${(content.issues || [])[2]}" with icon (${(content.issueIcons || [])[2] || 'icon'}). Arrow → center.
  - Bottom-right (x:72-97%, y:65-88%): "${(content.issues || [])[3]}" with icon (${(content.issueIcons || [])[3] || 'icon'}). Arrow → center.
VISUAL DETAILS: ${VISUAL_TEMPLATES[8]}`,
  };

  return `Generate a single presentation slide image (16:9 aspect ratio, 1536x1024).

${designRules}

Layout Description: ${slideConfig.layoutDesc}

Specific Instructions:
${layoutInstructions[slideConfig.id]}

IMPORTANT: This should look like a polished, professional consulting presentation slide.
Use flat design with clean geometric shapes and meaningful icons/illustrations. No 3D effects, no gradients, no shadows.
Text should be bold, large, and minimal. Korean text only (except numbers).
Match the layout structure from the reference sketch image provided.
Icons and illustrations must be concrete objects (buildings, people, vehicles, charts), NOT abstract geometric shapes.`;
}

/* ──────────────────────────────────────────────
   buildGeminiImagePrompt (Korean – for Gemini)
   ────────────────────────────────────────────── */
export function buildGeminiImagePrompt(slideConfig, content) {
  const layoutInstructions = {
    1: `타이틀 슬라이드를 만들어줘.
중앙에 틸그린(#0D9488) 색상의 동심원 그래픽을 배치하고, 가장 안쪽 원 안에 "${content.centerLabel}" 텍스트를 넣어줘.
동심원 오른쪽 상단에 네이비(#1B2A4A) 배경의 직사각형 박스를 놓고, 선으로 동심원과 연결해줘.
박스 안에 "${content.title}" 제목을 흰색 굵은 글씨로 써줘.
그 아래에 "${content.subtitle}" 부제목을 작게 넣어줘.`,

    2: `비교 슬라이드를 만들어줘.
상단 중앙에 틸그린(#0D9488) 배경의 둥근 배지에 "${content.statusBadge}" 텍스트.
왼쪽에 네이비(#1B2A4A) 색상 도넛차트, 아래에 "${content.areaA?.label}" 라벨, 도넛 안쪽에 "${content.areaA?.value}" 수치.
오른쪽에 틸그린(#0D9488) 색상 도넛차트, 아래에 "${content.areaB?.label}" 라벨, 도넛 안쪽에 "${content.areaB?.value}" 수치.
각 도넛 중앙에 사람 아이콘을 넣어줘.`,

    3: `2x2 그리드 카드 슬라이드를 만들어줘.
상단에 네이비(#1B2A4A)로 "${content.title}" 제목.
2행 2열로 4개의 둥근 직사각형 카드를 배치:
${(content.cards || []).map((c, i) => `카드${i + 1}: "${c.label}" - ${c.detail}${c.highlighted ? ' → 이 카드만 틸그린(#0D9488) 배경으로 하이라이트' : ' → 흰색 배경에 네이비 테두리'}`).join('\n')}
각 카드 안에 라벨은 굵게, 설명은 작게 넣어줘.`,

    4: `쉐브론 타임라인 슬라이드를 만들어줘.
상단에 네이비(#1B2A4A)로 "${content.progressLabel}" 라벨.
가로로 3개의 다이아몬드(마름모) 도형을 연결해서 타임라인을 만들어줘: ${(content.steps || []).map(s => `"${s}"`).join(' → ')}
다이아몬드는 하늘색 채우기에 네이비 테두리.
오른쪽 아래에 코랄(#F87171) 점선 테두리 박스를 넣고 안에 "${content.challenge}" 텍스트를 빨간색으로 써줘.`,

    5: `시소 균형 슬라이드를 만들어줘.
상단에 "${content.title}" 제목.
중앙에 수평 막대가 다이아몬드 받침점 위에 놓인 시소 구조.
왼쪽: 코랄(#F87171) 배경 박스에 "${content.problemA}" (문제).
오른쪽: 틸그린(#0D9488) 배경 박스에 "${content.solutionB}" (해결책).
두 요소가 팽팽한 균형을 이루는 느낌으로.`,

    6: `노선도/흐름 슬라이드를 만들어줘.
왼쪽: 코랄(#F87171) 원 안에 "${content.start}" (출발점).
가운데: 실선으로 연결된 하늘색 다이아몬드에 "${content.transfer}" (환승/전환점).
오른쪽: 틸그린(#0D9488) 점선으로 연결된 화살표에 "${content.newRoute}" (새 노선/방향).
왼쪽에서 오른쪽으로 흐르는 경로 전환을 보여줘.`,

    7: `블록 레이아웃 슬라이드를 만들어줘.
상단 행: 코랄(#F87171) 둥근 박스 2개를 나란히 → "${(content.needs || [])[0]}" + "${(content.needs || [])[1]}", 사이에 "+" 기호.
하단 행: 하늘색/네이비 박스 3개 → "${(content.infrastructure || [])[0]}", "${(content.infrastructure || [])[1]}", "${(content.infrastructure || [])[2]}".
상단과 하단 사이에 코랄 점선 박스로 갭 표시 → "${(content.gaps || [])[0]}", "${(content.gaps || [])[1]}".
위에 필요, 아래에 인프라, 사이에 부족한 부분을 보여주는 구조.`,

    8: `허브 수렴형 요약 슬라이드를 만들어줘.
중앙: 큰 틸그린(#0D9488) 원 안에 "${content.goal}" 텍스트.
사방(좌상, 우상, 좌하, 우하)에 4개 박스를 배치:
${(content.issues || []).map((issue, i) => `박스${i + 1}: "${issue}"`).join('\n')}
각 박스에서 중앙 원을 향해 화살표가 수렴하는 구조.`,
  };

  return `첨부한 스케치 이미지를 참고해서, 이 레이아웃 구조를 그대로 유지하면서 세련되고 전문적인 프레젠테이션 슬라이드 이미지 1장을 생성해줘.

## 디자인 규칙
- 비율: 16:9 가로형 슬라이드
- 배경: 순백색(#FFFFFF)
- 주요색(제목, 프레임): 네이비(#1B2A4A)
- 강조색(하이라이트, 긍정): 틸그린(#0D9488)
- 경고/강조색: 코랄(#F87171)
- 폰트: 굵은 고딕체(산세리프), 큰 글씨, 최소한의 텍스트
- 스타일: 깔끔한 컨설팅 보고서 인포그래픽, 플랫 디자인
- 3D 효과, 그라데이션, 그림자 없음
- 모든 텍스트는 한국어로 (숫자 제외)
- 시각 요소가 주인공, 텍스트는 보조 역할

## 레이아웃: ${slideConfig.layoutDesc}

## 구체적 지시사항
${layoutInstructions[slideConfig.id]}

중요: 스케치의 레이아웃 배치와 구조를 충실히 따르되, 컨설팅 보고서 수준으로 깔끔하고 세련되게 완성해줘. 기하학적 도형은 깨끗하고 정확하게, 텍스트는 굵고 크게, 여백은 충분히 확보해줘.`;
}

/* ──────────────────────────────────────────────
   Stage 2: 슬라이드 프롬프트 생성 프롬프트
   ────────────────────────────────────────────── */
export function buildSlidePromptGenerationPrompt(extractedContent) {
  const slideDescriptions = SLIDES.map(s => {
    const key = `slide_${s.id}`;
    const content = extractedContent[key] || {};
    return `### 슬라이드 ${s.id}: ${s.name}
- 레이아웃: ${s.layoutDesc}
- 추출된 콘텐츠: ${JSON.stringify(content, null, 2)}`;
  }).join('\n\n');

  const visualTemplateSection = Object.entries(VISUAL_TEMPLATES).map(
    ([id, desc]) => `슬라이드 ${id}: ${desc}`
  ).join('\n\n');

  return `당신은 프레젠테이션 슬라이드 디자인 프롬프트를 작성하는 전문가입니다.

아래 정보를 바탕으로 8개 슬라이드 각각에 대한 **한국어 자연어 프롬프트**를 생성하세요.
이 프롬프트는 AI 이미지 생성 도구나 디자이너에게 전달하여 슬라이드를 제작할 때 사용됩니다.

## 디자인 시스템
- 배경: 순백 (${COLORS.bg})
- 주요색 (제목, 프레임): 네이비 (${COLORS.navy})
- 강조색 (하이라이트, 긍정): 틸그린 (${COLORS.teal})
- 경고/강조색: 코랄 (${COLORS.coral})
- 폰트: 굵은 고딕체, 큰 텍스트, 최소 글자
- 스타일: 깔끔한 컨설팅 보고서 인포그래픽, 전문적, 텍스트 최소화
- 시각 요소가 주인공, 텍스트는 보조
- 슬라이드 간 시각 문법(색상 역할, 여백, 아이콘 크기) 통일
- 모든 텍스트는 한국어 (숫자 제외)

## 참고 스타일
다음은 전체 프레젠테이션의 톤앤매너 참고 프롬프트입니다:
"선거구 분석 보고서를 프레젠테이션으로 만들어줘. 배경은 흰색, 주요 색상은 네이비(#1B2A4A)와 틸그린(#0D9488), 강조/경고색은 코랄(#F87171)로 3색 체계를 사용하고, 슬라이드당 핵심 메시지 하나만 담아서 텍스트는 최소화해줘. 각 슬라이드에 개념을 직관적으로 전달하는 큰 아이콘이나 인포그래픽 다이어그램을 하나씩 배치하고, 본문 폰트는 굵은 고딕체로 크게, 수치 데이터는 볼드 강조 처리해줘."

## 슬라이드별 시각 참고 템플릿
아래는 각 슬라이드가 포함해야 할 핵심 시각 요소의 상세 묘사입니다. 생성하는 프롬프트에 이 시각 요소들을 반드시 반영하세요:

${visualTemplateSection}

## 슬라이드별 정보

${slideDescriptions}

## 출력 규칙
1. 각 슬라이드 프롬프트는 구체적인 색상 코드(#1B2A4A, #0D9488, #F87171)를 포함할 것
2. 레이아웃 구성 요소의 위치, 크기, 배치를 구체적으로 기술할 것
3. 인포그래픽 요소(도넛차트, 타임라인, 시소 등)를 명확히 지시할 것
4. 실제 콘텐츠 텍스트를 프롬프트에 포함할 것
5. 한국어로 작성할 것
6. **구체적 아이콘/일러스트를 반드시 포함할 것** – 추출된 콘텐츠의 iconDesc, needIcons, infraIcons, issueIcons, problemScene, solutionScene 등을 활용하여 구체적인 사물/장면을 묘사할 것
7. **단순 기하학적 도형(원, 사각형, 다이아몬드)만으로 설명 금지** – 반드시 의미 있는 아이콘, 일러스트, 실루엣을 포함할 것
8. **시각 요소가 슬라이드 면적의 70% 이상을 차지하도록 지시할 것** – 텍스트보다 그래픽이 주인공
9. 반드시 아래 JSON 형식으로만 반환할 것 (다른 텍스트 없이):

{
  "slide_1": "슬라이드 1의 자연어 프롬프트...",
  "slide_2": "슬라이드 2의 자연어 프롬프트...",
  "slide_3": "슬라이드 3의 자연어 프롬프트...",
  "slide_4": "슬라이드 4의 자연어 프롬프트...",
  "slide_5": "슬라이드 5의 자연어 프롬프트...",
  "slide_6": "슬라이드 6의 자연어 프롬프트...",
  "slide_7": "슬라이드 7의 자연어 프롬프트...",
  "slide_8": "슬라이드 8의 자연어 프롬프트..."
}`;
}
