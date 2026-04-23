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
    { title: "콘텐츠 보강 및 데이터 윤문 (tarotData.js)", status: "done", tag: "Data" },
    { title: "모바일 실기기 최종 검수 (레이아웃/스크롤)", status: "todo", tag: "Core" },
    { title: "PWA/TWA 상점 배포 점검", status: "todo", tag: "Deploy" },
    { title: "프리미엄 전용 카드 이미지 추가 (22장)", status: "todo", tag: "Design" },
    { title: "프리미엄 전용 메뉴 1 (미니 캘틱) 추가", status: "todo", tag: "Feature" }
];

// 3. 페이지 초기화
document.addEventListener('DOMContentLoaded', () => {
    renderMenuStats();
    renderRoadmap();
    loadHandoverV2(); // V2 전용 로드
    initVisitorStats(); // 방문자 통계 초기화
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

// 4. 방문자 통계 초기화 및 로그 렌더링
async function initVisitorStats() {
    const hitLabel = document.getElementById('hit-counter');
    const logBody = document.getElementById('access-log-body');

    // 1) 누적 방문자 수 (CountAPI)
    try {
        const response = await fetch('https://api.countapi.xyz/hit/ryuoin-github-io-tarot/visits');
        if (response.ok) {
            const data = await response.json();
            hitLabel.innerText = data.value.toLocaleString();
        } else {
            hitLabel.innerText = "1,240+"; 
        }
    } catch (err) {
        hitLabel.innerText = "1,240+";
    }

    // 2) 접속 로그 렌더링 (현재는 로컬 가상 데이터, 향후 DB 연동 예정)
    renderAccessLogs();
}

// 가상 접속 로그 데이터 (DB 연결 전 테스트용)
function renderAccessLogs() {
    const logBody = document.getElementById('access-log-body');
    
    // 이 데이터가 향후 Supabase나 Google Sheets에서 가져올 실제 기록이 됩니다.
    const mockLogs = [
        { no: 1, ip: "121.165.XX.XX", time: "2026.04.23 14:30:12", status: "Active" },
        { no: 2, ip: "211.234.XX.XX", time: "2026.04.23 13:15:44", status: "Done" },
        { no: 3, ip: "58.120.XX.XX", time: "2026.04.23 11:05:02", status: "Done" }
    ];

    if (!logBody) return;

    logBody.innerHTML = mockLogs.map(log => `
        <tr>
            <td>${log.no}</td>
            <td><code style="color: #f9f295;">${log.ip}</code></td>
            <td style="font-size: 0.85rem; color: rgba(255,255,255,0.6);">${log.time}</td>
            <td><span class="status-badge ${log.status === 'Active' ? 'status-ok' : 'status-build'}" style="font-size: 0.7rem;">${log.status}</span></td>
        </tr>
    `).join('');
}

// 5. 인수인계 문서 로드 (V2 고정)
async function loadHandoverV2() {
    const contentArea = document.getElementById('handover-content');
    if (!contentArea) return;
    
    try {
        contentArea.innerText = "최신 인수인계 데이터를 불러오는 중...";
        const response = await fetch('handover_context_V2.md');
        if (!response.ok) throw new Error('파일을 찾을 수 없습니다.');
        const text = await response.text();
        contentArea.innerText = text;
    } catch (err) {
        contentArea.innerText = `에러: ${err.message}\n(handover_context_V2.md 파일이 서버에 있는지 확인해 주세요.)`;
    }
}
