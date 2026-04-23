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

    // 2) 실제 구글 시트 접속 로그 렌더링
    await fetchAndRenderLogs();
}

// 구글 시트에서 실제 로그 데이터 가져오기
async function fetchAndRenderLogs() {
    const logBody = document.getElementById('access-log-body');
    const GAS_URL = 'https://script.google.com/macros/s/AKfycbxbHEkng8MTzisIyM4CZOrCXC90XWTE402Vi6tqWAft_2A1ePtG9SqBflvY6LGktBnL/exec';

    if (!logBody) return;

    try {
        // GAS에 action=read 파라미터를 보내서 데이터를 가져옴
        const response = await fetch(`${GAS_URL}?action=read`);
        if (!response.ok) throw new Error('조회 실패');
        
        const logs = await response.json();

        if (logs.length === 0) {
            logBody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 40px; color: rgba(255,255,255,0.3);">아직 기록된 로그가 없습니다.</td></tr>`;
            return;
        }

        logBody.innerHTML = logs.map((log, index) => `
            <tr>
                <td>${logs.length - index}</td>
                <td><code style="color: #f9f295;">${log.ip}</code></td>
                <td style="font-size: 0.85rem; color: rgba(255,255,255,0.6);">${log.time}</td>
                <td><span class="status-badge status-ok" style="font-size: 0.7rem; opacity: 0.8;">Visit</span></td>
            </tr>
        `).join('');

    } catch (err) {
        logBody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 40px; color: #ff6b6b;">로그를 불러올 수 없습니다.<br>(GAS 코드가 최신 버전인지 확인해 주세요.)</td></tr>`;
        console.error('Fetch logs error:', err);
    }
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
