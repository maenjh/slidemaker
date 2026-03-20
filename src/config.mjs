export const COLORS = {
  navy: '#1B2A4A',
  teal: '#0D9488',
  coral: '#F87171',
  bg: '#FFFFFF',
};

/**
 * Figma 파일에서 슬라이드를 추출할 때 사용하는 노드 설정.
 * 각 슬라이드 프레임의 nodeId를 Figma에서 확인하여 입력.
 * (Figma URL의 node-id 파라미터에서 추출, "-"를 ":"로 변환)
 *
 * 사용하려면 .env에 FIGMA_ACCESS_TOKEN과 FIGMA_FILE_KEY를 설정하세요.
 */
export const FIGMA_NODES = [
  // { slideId: 1, nodeId: '123:456', outputFile: 'slide_1_title_map.png' },
  // { slideId: 2, nodeId: '123:457', outputFile: 'slide_2_donut_compare.png' },
  // { slideId: 3, nodeId: '123:458', outputFile: 'slide_3_2x2_grid_cards.png' },
  // { slideId: 4, nodeId: '123:459', outputFile: 'slide_4_chevron_timeline.png' },
  // { slideId: 5, nodeId: '123:460', outputFile: 'slide_5_seesaw_balance.png' },
  // { slideId: 6, nodeId: '123:461', outputFile: 'slide_6_route_flow.png' },
  // { slideId: 7, nodeId: '123:462', outputFile: 'slide_7_block_layout.png' },
  // { slideId: 8, nodeId: '123:463', outputFile: 'slide_8_hub_summary.png' },
];

export const SLIDES = [
  {
    id: 1,
    name: 'title_map',
    sketchFile: 'slide_1_title_map.png',
    referenceFile: 'ref_slide_1.png',
    layoutDesc: 'Title + Map: 중앙에 해당 지역의 지리적 윤곽선 실루엣 + 동심원 그래픽, 오른쪽 상단에 제목 박스가 선으로 연결됨',
    contentSchema: { title: '', subtitle: '', centerLabel: '', mapShape: '' },
  },
  {
    id: 2,
    name: 'donut_compare',
    sketchFile: 'slide_2_donut_compare.png',
    referenceFile: 'ref_slide_2.png',
    layoutDesc: 'Donut Compare: 상단 중앙에 상태 배지, 좌측에 Area A 도넛차트(사람 실루엣 아이콘 내부), 우측에 Area B 도넛차트, 성장 화살표와 방패 뱃지',
    contentSchema: {
      statusBadge: '',
      areaA: { label: '', value: '', growth: '' },
      areaB: { label: '', value: '', growth: '' },
      bottomLabel: '',
      riskBadge: '',
    },
  },
  {
    id: 3,
    name: '2x2_grid_cards',
    sketchFile: 'slide_3_2x2_grid_cards.png',
    referenceFile: 'ref_slide_3.png',
    layoutDesc: '2x2 Grid Cards: 제목 아래 2x2 그리드로 4개 카드 배치, 각 카드 상단에 해당 주제의 상세 플랫 일러스트, 하단에 라벨',
    contentSchema: { title: '', cards: [{ label: '', detail: '', highlighted: false, iconDesc: '' }] },
  },
  {
    id: 4,
    name: 'chevron_timeline',
    sketchFile: 'slide_4_chevron_timeline.png',
    referenceFile: 'ref_slide_4.png',
    layoutDesc: 'Chevron Timeline: 상단에 타이틀, 중앙에 3개 거대한 채움 쉐브론 화살표 타임라인, 하단에 톱니바퀴 아이콘과 도전과제 세부항목',
    contentSchema: {
      timelineTitle: '',
      progressLabel: '',
      steps: ['', '', ''],
      challenge: '',
      challengeDetails: [],
    },
  },
  {
    id: 5,
    name: 'seesaw_balance',
    sketchFile: 'slide_5_seesaw_balance.png',
    referenceFile: 'ref_slide_5.png',
    layoutDesc: 'Seesaw Balance: 시소 위에 대비되는 미니 씬(차량 정체 vs 보행자), 삼각형 받침점, 점선 아치 연결',
    contentSchema: { title: '', problemA: '', solutionB: '', problemScene: '', solutionScene: '' },
  },
  {
    id: 6,
    name: 'route_flow',
    sketchFile: 'slide_6_route_flow.png',
    referenceFile: 'ref_slide_6.png',
    layoutDesc: 'Route/Flow: 좌측 코랄 원(버스 아이콘) → 다이아몬드(환승) → 틸그린 점선 곡선에 비행기 궤적 아이콘',
    contentSchema: { start: '', transfer: '', newRoute: '', startIcon: '', endIcon: '' },
  },
  {
    id: 7,
    name: 'block_layout',
    sketchFile: 'slide_7_block_layout.png',
    referenceFile: 'ref_slide_7.png',
    layoutDesc: 'Block Layout: 코랄 박스에 흰색 아이콘(아령, 휠체어 등), 네이비 벽돌 그리드에 흰색 아이콘, 사이에 점선 갭',
    contentSchema: {
      slideTitle: '',
      needs: ['', ''],
      needIcons: ['', ''],
      infrastructure: ['', '', ''],
      infraIcons: ['', '', ''],
      gaps: ['', ''],
    },
  },
  {
    id: 8,
    name: 'hub_summary',
    sketchFile: 'slide_8_hub_summary.png',
    referenceFile: 'ref_slide_8.png',
    layoutDesc: 'Hub Summary: 틸그린 원에 하트 아이콘(목표), 사방에 고유 아이콘(건물/저울/버스/퍼즐)+점선 원, 수렴 화살표',
    contentSchema: {
      summaryTitle: '',
      goal: '',
      goalIcon: '',
      issues: ['', '', '', ''],
      issueIcons: ['', '', '', ''],
    },
  },
];
