/**
 * 관리자 대시보드 스크립트
 */

// 1. 메뉴 상태 데이터
const menuStats = [
    { name: "🌟 오늘의 카드", update: "2026.04.24 (v2.7)", status: "정상", type: "Standard" },
    { name: "🔮 이번주 운세", update: "2026.04.24 (v2.7)", status: "정상", type: "Standard" },
    { name: "📈 이 주식 사야해?", update: "2026.04.24 (v2.7)", status: "정상", type: "Premium" },
    { name: "💭 그 사람 지금 내 생각 할까?", update: "2026.04.24 (v2.7)", status: "정상", type: "Premium" },
    { name: "💰 당신의 금전운", update: "2026.04.23 (v2.3)", status: "정상", type: "Standard" },
    { name: "💫 당신의 연애운", update: "2026.04.23 (v2.3)", status: "정상", type: "Standard" },
    { name: "⚖️ 그래 결심했어~! (Yes/No)", update: "2026.04.23 (v2.3)", status: "정상", type: "Standard" },
    { name: "🍀 이번주 행운 번호 (Lotto)", update: "2026.04.24 (v2.7)", status: "정상", type: "Standard" },
    { name: "🛠️ 관리자 대시보드 (Logs)", update: "2026.04.24 (v2.7)", status: "정상", type: "Admin" }
];

// 2. 향후 개발 로드맵 데이터
const roadmapData = [
    { title: "주식 타로(Stock Tarot) 프리미엄 기능 구현", status: "done", tag: "v2.7" },
    { title: "프리미엄 결과 시각적 연출 강화 (Images/Aura/Verdict)", status: "done", tag: "v2.7" },
    { title: "메인 메뉴 전략적 재배치 (프리미엄 우선순위)", status: "done", tag: "v2.7" },
    { title: "관리자 대시보드 & 접속 로그 시스템 구축", status: "done", tag: "v2.3" },
    { title: "데이터 구조 모듈화 및 하위 파일 분리 (js/data/)", status: "done", tag: "Arch" },
    { title: "모바일 실기기 최종 검수 (레이아웃/스크롤)", status: "todo", tag: "Core" },
    { title: "PWA/TWA 상점 배포 점검", status: "todo", tag: "Deploy" }
];

// 접속 로그 GAS URL (공통 사용)
const GAS_URL = 'https://script.google.com/macros/s/AKfycbxbHEkng8MTzisIyM4CZOrCXC90XWTE402Vi6tqWAft_2A1ePtG9SqBflvY6LGktBnL/exec';

// 전역 로그 데이터 보관용
let cachedLogs = [];

// 3. 페이지 초기화
document.addEventListener('DOMContentLoaded', () => {
    checkPremiumTheme();
    renderMenuStats();
    renderRoadmap();
    switchAdminTab('sd'); // 초기 탭 설정
    initVisitorStats(); // 방문자 통계 초기화
});

function checkPremiumTheme() {
    if (localStorage.getItem('isPremium') === 'true') {
        document.body.classList.add('premium-mode');
    }
}

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

// 4. 방문자 통계 초기화 (Google Sheets 로그 기반으로 변경)
async function initVisitorStats() {
    const hitLabel = document.getElementById('hit-counter');

    try {
        // 이미 구현된 구글 시트 로그 시스템에서 데이터를 읽어와 개수 파악
        const response = await fetch(`${GAS_URL}?action=read`);
        if (response.ok) {
            const data = await response.json();
            cachedLogs = data; // 초기화 시 미리 데이터 확보 (성능 최적화)
            hitLabel.innerText = data.length.toLocaleString();
        } else {
            hitLabel.innerText = "0"; 
        }
    } catch (err) {
        console.error('방문자 통계 로드 실패:', err);
        hitLabel.innerText = "Error";
    }
}



// 5. 로그 상세 팝업 열기
async function openLogModal() {
    const modal = document.getElementById('log-modal');
    const logBody = document.getElementById('access-log-body');

    modal.classList.add('active');
    
    // 이미 initVisitorStats에서 데이터를 가져왔다면 바로 표시
    if (cachedLogs.length > 0) {
        displayLogs();
        return;
    }

    logBody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 40px; color: rgba(255,255,255,0.3);">데이터를 불러오고 있습니다...</td></tr>`;

    try {
        const response = await fetch(`${GAS_URL}?action=read`);
        if (!response.ok) throw new Error('조회 실패');
        
        cachedLogs = await response.json();
        displayLogs();

    } catch (err) {
        logBody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 40px; color: #ff6b6b;">데이터 로드에 실패했습니다. <br> 다시 시도해 주세요.</td></tr>`;
    }
}

// 로그 화면 표시 헬퍼
function displayLogs() {
    const logBody = document.getElementById('access-log-body');
    if (cachedLogs.length === 0) {
        logBody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 40px; color: rgba(255,255,255,0.3);">기록된 로그가 없습니다.</td></tr>`;
        return;
    }

    logBody.innerHTML = cachedLogs.map((log, index) => `
        <tr>
            <td>${cachedLogs.length - index}</td>
            <td style="font-size: 0.85rem; color: rgba(255,255,255,0.6);">${log.time}</td>
        </tr>
    `).join('');
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
    csvContent += "No,Access Time\n";

    // 데이터 변환
    cachedLogs.forEach((log, index) => {
        const rowNum = cachedLogs.length - index;
        const row = `${rowNum},"${log.time}"`;
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

// 8. 문서 및 소스 탭 전환 로직
async function switchAdminTab(type) {
    const tabs = document.querySelectorAll('.tab-btn');
    const contentContainer = document.getElementById('handover-content-container');
    const zipContainer = document.getElementById('zip-info-container');
    const contentArea = document.getElementById('handover-content');

    // 탭 활성화 UI 처리
    tabs.forEach(tab => {
        const tabText = tab.innerText.toLowerCase();
        if (tabText.includes(type)) tab.classList.add('active');
        else tab.classList.remove('active');
    });

    // ZIP 정보 탭인 경우
    if (type === 'zip') {
        contentContainer.style.display = 'none';
        zipContainer.style.display = 'block';
        return;
    }

    // 문서 탭인 경우
    contentContainer.style.display = 'block';
    zipContainer.style.display = 'none';

    const filePath = type === 'sd' ? 's2/sd.md' : 's2/hd2.md';
    
    try {
        contentArea.innerText = `${type.toUpperCase()} 데이터를 불러오는 중...`;
        const response = await fetch(filePath);
        if (!response.ok) throw new Error('파일을 찾을 수 없습니다.');
        const text = await response.text();
        contentArea.innerText = text;
    } catch (err) {
        contentArea.innerText = `에러: ${err.message}\n(${filePath} 파일이 서버에 있는지 확인해 주세요.)`;
    }
}
