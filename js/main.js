document.addEventListener('DOMContentLoaded', () => {
    initModeSelect();
    updateDailyBtnStatus();
    logVisit(); // 접속 로그 기록 호출
});

// ========== 접속 로그 기록 (Google Sheets API) ==========
async function logVisit() {
    const GAS_URL = 'https://script.google.com/macros/s/AKfycbxbHEkng8MTzisIyM4CZOrCXC90XWTE402Vi6tqWAft_2A1ePtG9SqBflvY6LGktBnL/exec';
    
    if (window.location.pathname.includes('admin.html')) return;

    try {
        const targetUrl = `${GAS_URL}?type=ping`;
        fetch(targetUrl, { mode: 'no-cors' });
    } catch (err) {
        console.log('Logging failed:', err);
    }
}

let selectedCards = [];
let deck = [];
let currentMode = null;

// ========== 광고 카운터 (3회마다 1번) ==========
function incrementReadingCount() {
    let count = parseInt(localStorage.getItem('readingCount') || '0') + 1;
    localStorage.setItem('readingCount', count);
    if (count % 3 === 0) {
        if (!isPremium()) {
            setTimeout(() => showAdOverlay(), 800);
        }
    }
}

function showAdOverlay() {
    const overlay = document.getElementById('ad-overlay');
    if (overlay) overlay.classList.add('active');
}

document.addEventListener('click', (e) => {
    if (e.target.id === 'btn-ad-close') {
        const ad = document.getElementById('ad-overlay');
        if (ad) ad.classList.remove('active');
    }
});

// ========== 프리미엄 시스템 ==========
function isPremium() {
    return localStorage.getItem('isPremium') === 'true';
}

function showPremiumInfo() {
    const el = document.getElementById('premium-info-overlay');
    if (el) el.classList.add('active');
}

function closePremiumInfo() {
    const el = document.getElementById('premium-info-overlay');
    if (el) el.classList.remove('active');
}

function activatePremium() {
    localStorage.setItem('isPremium', 'true');
    closePremiumInfo();
    alert('프리미엄이 활성화되었습니다! 이제 상세 해석을 이용할 수 있습니다.');
    location.reload();
}

function toggleTestPremium() {
    const isPrem = localStorage.getItem('isPremium') === 'true';
    localStorage.setItem('isPremium', !isPrem);
    updatePremiumTestButton();
    const btnText = !isPrem ? '프리미엄 모드가 켜졌습니다.' : '프리미엄 모드가 꺼졌습니다.';
    alert(btnText);
}

function updatePremiumTestButton() {
    const isPrem = isPremium();
    if (isPrem) {
        document.body.classList.add('premium-mode');
    } else {
        document.body.classList.remove('premium-mode');
    }

    const btn = document.getElementById('test-premium-toggle');
    if (btn) {
        const isPrem = localStorage.getItem('isPremium') === 'true';
        btn.innerHTML = isPrem ? '✨ 프리미엄 모드 [ON]' : '🔧 테스트: 프리미엄 모드 [OFF]';
        btn.style.color = isPrem ? 'var(--gold)' : '#ccc';
        btn.style.borderColor = isPrem ? 'var(--gold)' : 'rgba(212,175,55,0.5)';
    }
}

function handlePremiumBanner(bannerId) {
    const banner = document.getElementById(bannerId);
    if (!banner) return;
    banner.style.display = isPremium() ? 'none' : 'block';
}

// Fisher-Yates 셔플
function shuffleArray(array) {
    let curId = array.length;
    while (0 !== curId) {
        let randId = Math.floor(Math.random() * curId);
        curId -= 1;
        let tmp = array[curId];
        array[curId] = array[randId];
        array[randId] = tmp;
    }
    return array;
}

// ========== 모드 선택 화면 초기화 ==========
function initModeSelect() {
    const modeScreen = document.getElementById('mode-select-screen');
    const readingScreen = document.getElementById('reading-screen');
    if (modeScreen) modeScreen.classList.remove('hidden');
    if (readingScreen) readingScreen.classList.add('hidden');
    updatePremiumTestButton();

    const safeAddListener = (id, callback) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', callback);
    };

    safeAddListener('btn-mode-daily', () => openMode('daily'));
    safeAddListener('btn-mode-weekly', () => openMode('weekly'));
    safeAddListener('btn-mode-love', () => openMode('love'));
    safeAddListener('btn-mode-money', () => openMode('money'));
    safeAddListener('btn-mode-yesno', () => openMode('yesno'));
    safeAddListener('btn-mode-lotto', () => openMode('lotto'));

    // 결과 화면들에서의 '처음으로' 버튼들
    ['btn-restart', 'btn-love-restart', 'btn-money-restart', 'btn-yesno-restart', 
     'btn-lotto-restart', 'btn-lotto-home', 'btn-back-to-mode', 'btn-daily-restart', 
     'btn-thinking-restart'].forEach(id => safeAddListener(id, restartGame));
    
    safeAddListener('btn-lotto-start', startLottoDraw);
}

function updateDailyBtnStatus() {
    const btn = document.getElementById('btn-mode-daily');
    if (!btn) return;
    const today = new Date().toISOString().slice(0, 10);
    const savedDate = localStorage.getItem('dailyCardDate');
    if (savedDate === today) {
        btn.classList.add('daily-done');
        const desc = btn.querySelector('.daily-desc');
        if (desc) desc.textContent = '오늘의 카드를 이미 뽑았습니다 · 다시 보기';
        const badge = btn.querySelector('.daily-badge');
        if (badge) { badge.textContent = 'DONE'; badge.style.background = 'rgba(100,100,100,0.6)'; }
    }
}

function openMode(mode) {
    currentMode = mode;
    selectedCards = []; // 모드 진입 시 선택 리스트 초기화

    const modeScreen = document.getElementById('mode-select-screen');
    
    // 로또 모드
    if (mode === 'lotto') {
        if (modeScreen) modeScreen.classList.add('hidden');
        const modal = document.getElementById('lotto-result-modal');
        if (modal) modal.classList.add('active');
        initLotto();
        return;
    }

    // 오늘의 카드 모드
    if (mode === 'daily') {
        const today = new Date().toISOString().slice(0, 10);
        const savedDate = localStorage.getItem('dailyCardDate');
        const savedCardId = parseInt(localStorage.getItem('dailyCardId'));

        if (savedDate === today && !isNaN(savedCardId)) {
            if (modeScreen) modeScreen.classList.add('hidden');
            showDailyResult(savedCardId);
            return;
        }
        if (modeScreen) modeScreen.classList.add('hidden');
        const readingScreen = document.getElementById('reading-screen');
        if (readingScreen) readingScreen.classList.remove('hidden');
        
        const hTitle = document.getElementById('header-title');
        const hDesc = document.getElementById('header-desc');
        if (hTitle) hTitle.textContent = '🌟 오늘의 카드';
        if (hDesc) hDesc.textContent = '카드에 손을 가져다 대세요. 오늘의 에너지를 품은 카드가 당신을 기다립니다.';
        
        const sCount = document.getElementById('select-count');
        const mCount = document.getElementById('max-count');
        if (sCount) sCount.textContent = '0';
        if (mCount) mCount.textContent = '1';

        const cContainer = document.getElementById('card-container');
        const dSpread = document.getElementById('daily-spread-container');
        if (cContainer) cContainer.classList.add('hidden');
        if (dSpread) dSpread.classList.remove('hidden');
        initDailySpread();
        return;
    }

    if (mode === 'yesno') {
        startYesNoRitual();
        return;
    }

    startMode(mode);
}

function startMode(mode) {
    const modeConfig = {
        weekly: { title: '당신의 이번주 운세', desc: '당신의 운명을 이끌어줄 3장의 카드를 선택하세요. 끌리는 카드를 골라보세요.', max: 3 },
        love:   { title: '당신의 연애운',      desc: '당신의 사랑을 비추어줄 카드 한 장이 당신을 기다립니다.',                  max: 1 },
        yesno:  { title: '그래 결심했어~!',    desc: '해답을 원하는 것에 집중해 보세요! 마음이 이끌리는 카드 한 장을 선택하세요.', max: 1 },
        money:  { title: '당신의 금전운',      desc: '재물과 풍요의 흐름을 비추어줄 카드를 한 장 선택하세요.',                  max: 1 },
        thinking: { title: '그 사람 지금 내 생각 할까?', desc: '당신과 그 사람을 이어줄 4장의 카드를 선택하세요.', max: 4 },
        stock: { title: '📈 이 주식 사야해?', desc: '시장의 에너지와 종목 고유의 에너지를 해독합니다. 3장의 카드를 선택하세요.', max: 3 }
    };

    const cfg = modeConfig[mode];
    const modeScreen = document.getElementById('mode-select-screen');
    const readingScreen = document.getElementById('reading-screen');

    const hTitle = document.getElementById('header-title');
    const hDesc = document.getElementById('header-desc');
    const mCount = document.getElementById('max-count');
    const sCount = document.getElementById('select-count');
    
    if (hTitle) hTitle.textContent = cfg.title;
    if (hDesc) hDesc.textContent = cfg.desc;
    if (mCount) mCount.textContent = cfg.max;
    if (sCount) sCount.textContent = '0';

    if (isPremium()) document.body.classList.add('premium-mode');
    else document.body.classList.remove('premium-mode');

    const cContainer = document.getElementById('card-container');
    const dSpread = document.getElementById('daily-spread-container');
    if (cContainer) cContainer.classList.add('hidden');
    if (dSpread) dSpread.classList.remove('hidden');
    if (modeScreen) modeScreen.classList.add('hidden');
    if (readingScreen) readingScreen.classList.remove('hidden');
