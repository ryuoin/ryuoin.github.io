/**
 * 관리자 대시보드 스크립트
 */

// 1. 메뉴 상태 데이터
const menuStats = [
    { name: "🌟 오늘의 카드", update: "2026.04.22 (v2.0)", status: "정상", type: "Standard" },
    { name: "🔮 이번주 운세", update: "2026.04.22 (v2.0)", status: "정상", type: "Standard" },
    { name: "⚖️ 그래 결심했어~! (Yes/No)", update: "2026.04.22 (v2.0)", status: "정상", type: "Standard" },
    { name: "💫 당신의 연애운", update: "2026.04.22 (v2.0)", status: "정상", type: "Standard" },
    { name: "💰 당신의 금전운", update: "2026.04.22 (v2.0)", status: "정상", type: "Standard" },
    { name: "🍀 이번주 행운 번호 (Lotto)", update: "2026.04.22 (v2.0)", status: "정상", type: "Standard" },
    { name: "💭 그 사람 지금 내 생각 할까?", update: "2026.04.22 (v2.1)", status: "정상", type: "Premium" }
];

// 2. 향후 개발 로드맵 데이터
const roadmapData = [
    { title: "관리자 관리 페이지 구축 (Dashboard)", status: "done", tag: "v2.2" },
    { title: "모바일 실기기 최종 검수 (레이아웃/스크롤)", status: "todo", tag: "Core" },
    { title: "콘텐츠 보강 및 데이터 윤문 (tarotData.js)", status: "todo", tag: "Data" },
    { title: "PWA/TWA 상점 배포 점검", status: "todo", tag: "Deploy" },
    { title: "프리미엄 전용 카드 이미지 추가 (22장)", status: "todo", tag: "Design" },
    { title: "프리미엄 전용 메뉴 1 (미니 캘틱) 추가", status: "todo", tag: "Feature" }
];

// 3. 페이지 초기화
document.addEventListener('DOMContentLoaded', () => {
    renderMenuStats();
    renderRoadmap();
    loadHandover('v2'); // 기본으로 V2 로드
});

// 메뉴 상태 렌더링
function renderMenuStats() {
    const tbody = document.getElementById('menu-status-body');
    if (!tbody) return;

    tbody.innerHTML = menuStats.map(item => `
        <tr>
            <td>${item.name}</td>
            <td>${item.update}</td>
            <td><span class="status-badge ${item.status === '정상' ? 'status-ok' : 'status-build'}">${item.status}</span></td>
            <td><span class="${item.type === 'Premium' ? 'type-premium' : 'type-standard'}">${item.type === 'Premium' ? '💎 Premium' : '⚪ Standard'}</span></td>
        </tr>
    `).join('');
}

// 로드맵 렌더링
function renderRoadmap() {
    const list = document.getElementById('roadmap-list');
    if (!list) return;

    list.innerHTML = roadmapData.map(item => `
        <li class="roadmap-item">
            <span class="roadmap-check">${item.status === 'done' ? '✓' : ''}</span>
            <span class="roadmap-text ${item.status === 'done' ? 'text-dim' : ''}">${item.title}</span>
            <span class="roadmap-tag">${item.tag}</span>
        </li>
    `).join('');
}

// 인수인계 문서 로드 (Fetch)
async function loadHandover(version) {
    const buttons = document.querySelectorAll('.tab-btn');
    const contentArea = document.getElementById('handover-content');
    
    // 버튼 활성화 상태 변경
    buttons.forEach(btn => {
        if ((version === 'v1' && btn.innerText.includes('V1')) || 
            (version === 'v2' && btn.innerText.includes('V2'))) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    const fileName = version === 'v2' ? 'handover_context_V2.md' : 'handover_context.md';
    
    try {
        contentArea.innerText = "불러오는 중...";
        const response = await fetch(fileName);
        if (!response.ok) throw new Error('파일을 찾을 수 없습니다.');
        const text = await response.text();
        contentArea.innerText = text;
    } catch (err) {
        contentArea.innerText = `에러: ${err.message}`;
    }
}
