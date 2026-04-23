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

// 4. 방문자 통계 초기화 (메인 화면 로딩 최적화)
async function initVisitorStats() {
    const hitLabel = document.getElementById('hit-counter');

    // 누적 방문자 수만 먼저 가져옴 (빠른 응답)
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
}

// 전역 로그 데이터 보관용
let cachedLogs = [];

// 5. 로그 상세 팝업 열기
async function openLogModal() {
    const modal = document.getElementById('log-modal');
    const logBody = document.getElementById('access-log-body');
    const GAS_URL = 'https://script.google.com/macros/s/AKfycbxbHEkng8MTzisIyM4CZOrCXC90XWTE402Vi6tqWAft_2A1ePtG9SqBflvY6LGktBnL/exec';

    modal.classList.add('active');
    logBody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 40px; color: rgba(255,255,255,0.3);">데이터를 불러오고 있습니다...</td></tr>`;

    try {
        const response = await fetch(`${GAS_URL}?action=read`);
        if (!response.ok) throw new Error('조회 실패');
        
        cachedLogs = await response.json();

        if (cachedLogs.length === 0) {
            logBody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 40px; color: rgba(255,255,255,0.3);">기록된 로그가 없습니다.</td></tr>`;
            return;
        }

        logBody.innerHTML = cachedLogs.map((log, index) => `
            <tr>
                <td>${cachedLogs.length - index}</td>
                <td><code style="color: #f9f295;">${log.ip}</code></td>
                <td style="font-size: 0.85rem; color: rgba(255,255,255,0.6);">${log.time}</td>
                <td><span class="status-badge status-ok" style="font-size: 0.7rem; opacity: 0.8;">Visit</span></td>
            </tr>
        `).join('');

    } catch (err) {
        logBody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 40px; color: #ff6b6b;">데이터 로드에 실패했습니다. <br> 다시 시도해 주세요.</td></tr>`;
    }
}

// 6. 팝업 닫기
function closeLogModal() {
    document.getElementById('log-modal').classList.remove('active');
}

// 7. 엑셀(CSV) 다운로드 기능
function downloadLogs() {
    if (cachedLogs.length === 0) {
        alert('다운로드할 데이터가 없습니다.');
        return;
    }

    // CSV 헤더
    let csvContent = "\uFEFF"; // 한글 깨짐 방지 BOM
    csvContent += "No,IP Address,Access Time,User Agent\n";

    // 데이터 변환
    cachedLogs.forEach((log, index) => {
        const rowNum = cachedLogs.length - index;
        const row = `${rowNum},"${log.ip}","${log.time}","${(log.ua || '').replace(/"/g, '""')}"`;
        csvContent += row + "\n";
    });

    // 다운로드 실행
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    
    link.setAttribute("href", url);
    link.setAttribute("download", `Tarot_Access_Log_${dateStr}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
