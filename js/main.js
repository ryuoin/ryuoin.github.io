document.addEventListener('DOMContentLoaded', () => {
    initModeSelect();
    updateDailyBtnStatus();
});

let selectedCards = [];
let deck = [];
let currentMode = null;

// ========== 광고 카운터 (3회마다 1번) ==========
function incrementReadingCount() {
    let count = parseInt(localStorage.getItem('readingCount') || '0') + 1;
    localStorage.setItem('readingCount', count);
    if (count % 3 === 0) {
        setTimeout(() => showAdOverlay(), 800);
    }
}

function showAdOverlay() {
    const overlay = document.getElementById('ad-overlay');
    if (overlay) overlay.classList.add('active');
}

document.addEventListener('click', (e) => {
    if (e.target.id === 'btn-ad-close') {
        document.getElementById('ad-overlay').classList.remove('active');
    }
});

// ========== 프리미엄 시스템 ==========
function isPremium() {
    return localStorage.getItem('isPremium') === 'true';
}

function showPremiumInfo() {
    document.getElementById('premium-info-overlay').classList.add('active');
}

function closePremiumInfo() {
    document.getElementById('premium-info-overlay').classList.remove('active');
}

function activatePremium() {
    // 실제 구매 후 이 함수를 호출 (Google Play Billing 연동 전 임시)
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
    if (isPremium()) {
        banner.style.display = 'none';
    } else {
        banner.style.display = 'block';
    }
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

// ========== 모드 선택 화면 ==========
function initModeSelect() {
    const modeScreen = document.getElementById('mode-select-screen');
    const readingScreen = document.getElementById('reading-screen');
    modeScreen.classList.remove('hidden');
    readingScreen.classList.add('hidden');
    updatePremiumTestButton();

    document.getElementById('btn-mode-daily').addEventListener('click', () => startMode('daily'));
    document.getElementById('btn-mode-weekly').addEventListener('click', () => startMode('weekly'));
    document.getElementById('btn-mode-love').addEventListener('click', () => startMode('love'));
    document.getElementById('btn-mode-money').addEventListener('click', () => startMode('money'));
    document.getElementById('btn-mode-yesno').addEventListener('click', () => startMode('yesno'));
    document.getElementById('btn-mode-lotto').addEventListener('click', () => startMode('lotto'));

    document.getElementById('btn-restart').addEventListener('click', restartGame);
    document.getElementById('btn-love-restart').addEventListener('click', restartGame);
    document.getElementById('btn-money-restart').addEventListener('click', restartGame);
    document.getElementById('btn-yesno-restart').addEventListener('click', restartGame);
    document.getElementById('btn-lotto-restart').addEventListener('click', restartGame);
    document.getElementById('btn-lotto-home').addEventListener('click', restartGame);
    document.getElementById('btn-back-to-mode').addEventListener('click', restartGame);
    document.getElementById('btn-daily-restart').addEventListener('click', restartGame);

    const lottoBtn = document.getElementById('btn-lotto-start');
    if (lottoBtn) lottoBtn.addEventListener('click', startLottoDraw);
}

// ========== 오늘의 카드 버튼 상태 업데이트 ==========
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

function startMode(mode) {
    currentMode = mode;
    selectedCards = [];

    const modeScreen = document.getElementById('mode-select-screen');
    const readingScreen = document.getElementById('reading-screen');

    // 로또 모드
    if (mode === 'lotto') {
        modeScreen.classList.add('hidden');
        document.getElementById('lotto-result-modal').classList.add('active');
        initLotto();
        return;
    }

    // 오늘의 카드 모드
    if (mode === 'daily') {
        const today = new Date().toISOString().slice(0, 10);
        const savedDate = localStorage.getItem('dailyCardDate');
        const savedCardId = parseInt(localStorage.getItem('dailyCardId'));

        if (savedDate === today && !isNaN(savedCardId)) {
            // 이미 오늘 뽑은 경우 → 결과 바로 보여주기
            modeScreen.classList.add('hidden');
            showDailyResult(savedCardId);
            return;
        }

        // 새로 뽑기 → 스프레드 UI
        modeScreen.classList.add('hidden');
        readingScreen.classList.remove('hidden');
        document.getElementById('header-title').textContent = '🌟 오늘의 카드';
        document.getElementById('header-desc').textContent = '카드에 손을 가져다 대세요. 오늘의 에너지를 품은 카드가 당신을 기다립니다.';
        document.getElementById('select-count').textContent = '0';
        document.getElementById('max-count').textContent = '1';

        document.getElementById('card-container').classList.add('hidden');
        document.getElementById('daily-spread-container').classList.remove('hidden');
        initDailySpread();
        return;
    }

    // 일반 모드 텍스트 설정
    const modeConfig = {
        weekly: { title: '당신의 이번주 운세', desc: '당신의 운명을 이끌어줄 3장의 카드를 선택하세요. 끌리는 카드를 골라보세요.', max: 3 },
        love:   { title: '당신의 연애운',      desc: '당신의 사랑을 비추어줄 카드 한 장이 당신을 기다립니다.',                  max: 1 },
        yesno:  { title: '그래 결심했어~!',    desc: '명쾌한 해답을 원하나요? 마음이 이끌리는 카드 한 장을 선택하세요.',         max: 1 },
        money:  { title: '당신의 금전운',      desc: '재물과 풍요의 흐름을 비추어줄 카드를 한 장 선택하세요.',                  max: 1 },
    };
    const cfg = modeConfig[mode];
    document.getElementById('header-title').textContent = cfg.title;
    document.getElementById('header-desc').textContent  = cfg.desc;
    document.getElementById('max-count').textContent    = cfg.max;
    document.getElementById('select-count').textContent = '0';

    // 모든 모드: 스프레드 UI 사용
    document.getElementById('card-container').classList.add('hidden');
    document.getElementById('daily-spread-container').classList.remove('hidden');
    modeScreen.classList.add('hidden');
    readingScreen.classList.remove('hidden');
    initSpread(mode);
}

// ========== 통합 스프레드 UI (모든 모드 공통) ==========
function initSpread(mode) {
    const container = document.getElementById('daily-spread-container');
    container.innerHTML = '';
    
    // 프리미엄 상태에 따라 클래스 토글 (프리미엄 전용 뒷면 이미지 적용을 위함)
    if (isPremium()) {
        document.body.classList.add('premium-mode');
    } else {
        document.body.classList.remove('premium-mode');
    }

    const deckAll = Array.from({length: 22}, (_, i) => i);
    shuffleArray(deckAll);

    const row1 = deckAll.slice(0, 11);
    const row2 = deckAll.slice(11, 22);

    [row1, row2].forEach((rowCards, rowIdx) => {
        const rowEl = document.createElement('div');
        rowEl.className = 'daily-spread-row';

        rowCards.forEach((cardId, i) => {
            const card = document.createElement('div');
            card.className = 'daily-spread-card';
            card.dataset.id = cardId;

            const cover = document.createElement('div');
            cover.className = 'daily-spread-cover';
            const num = document.createElement('span');
            num.className = 'daily-spread-num';
            num.textContent = rowIdx * 11 + i + 1;
            cover.appendChild(num);
            card.appendChild(cover);

            card.addEventListener('mouseenter', () => {
                if (!card.classList.contains('selected') && !card.classList.contains('disabled')) {
                    card.classList.add('hovered');
                }
            });
            card.addEventListener('mouseleave', () => {
                card.classList.remove('hovered');
            });
            card.addEventListener('touchstart', () => {
                if (!card.classList.contains('disabled')) card.classList.add('hovered');
            }, {passive: true});
            card.addEventListener('touchend', () => {
                card.classList.remove('hovered');
            }, {passive: true});

            card.addEventListener('click', () => handleSpreadCardClick(card, cardId, mode));
            rowEl.appendChild(card);

            // 카드 딜링 애니메이션: deal-init(중앙 스택) → deal-animate(부채꼴)
            // rAF 이중 중첩으로 브라우저가 초기 상태를 먼저 페인트한 뒤 트랜지션 시작
            const baseDelay = rowIdx * 600; // 두 번째 줄은 첫 줄 끝난 뒤 시작
            const cardDelay = baseDelay + (i * 45); // 카드마다 45ms 간격

            // 즉시 deal-init 클래스 추가 (DOM 삽입 직후 opacity:0, 중앙 위치)
            card.classList.add('deal-init');

            setTimeout(() => {
                // rAF 두 번 중첩: 첫 번째 rAF에서 레이아웃 계산, 두 번째 rAF에서 클래스 교체
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        card.classList.remove('deal-init');
                        card.classList.add('deal-animate');
                    });
                });
            }, cardDelay);
        });

        container.appendChild(rowEl);
    });
}

function handleSpreadCardClick(cardEl, cardId, mode) {
    if (cardEl.classList.contains('selected') || cardEl.classList.contains('disabled')) return;

    const maxCards = mode === 'weekly' ? 3 : (mode === 'daily' ? 1 : 1);

    // daily: localStorage 저장
    if (mode === 'daily') {
        const today = new Date().toISOString().slice(0, 10);
        localStorage.setItem('dailyCardDate', today);
        localStorage.setItem('dailyCardId', cardId);
    }

    cardEl.classList.add('selected', 'flipping');
    cardEl.classList.remove('hovered');
    selectedCards.push(cardId);

    const cnt = selectedCards.length;
    document.getElementById('select-count').textContent = cnt;

    if (cnt < maxCards) {
        // 이번주 운세: 3장 다 뽑을 때까지 계속 선택 가능 (선택된 카드만 잠금)
        setTimeout(() => { cardEl.classList.remove('flipping'); }, 800);
        return;
    }

    // 최대 장 수 도달 → 나머지 비활성화 후 결과 표시
    document.querySelectorAll('.daily-spread-card').forEach(c => {
        if (!c.classList.contains('selected')) {
            c.classList.add('disabled');
            c.classList.remove('hovered');
        }
    });

    setTimeout(() => {
        document.getElementById('reading-screen').classList.add('hidden');
        document.getElementById('card-container').classList.remove('hidden');
        document.getElementById('daily-spread-container').classList.add('hidden');

        if (mode === 'daily')  { showDailyResult(cardId);   }
        else if (mode === 'weekly') { showWeeklyResult();   }
        else if (mode === 'love')   { showLoveResult();     }
        else if (mode === 'yesno')  { showYesNoResult();    }
        else                        { showMoneyResult();    }

        incrementReadingCount();
    }, 900);
}

// ========== 오늘의 카드 전용 진입 (daily 모드에서 initSpread 호출 via startMode) ==========
function initDailySpread() { initSpread('daily'); }
function handleDailyCardClick(cardEl, cardId) { handleSpreadCardClick(cardEl, cardId, 'daily'); }

// ========== 일반 덱 ==========
function initDeck() {
    deck = Array.from({length: 22}, (_, i) => i);
    shuffleArray(deck);
    renderCards();
}

function renderCards() {
    const container = document.getElementById('card-container');
    container.innerHTML = '';
    deck.forEach((cardId, index) => {
        const cardElem = document.createElement('div');
        cardElem.className = 'tarot-card';
        cardElem.dataset.id = cardId;

        const cardInner = document.createElement('div');
        cardInner.className = 'card-inner';
        const cardCover = document.createElement('div');
        cardCover.className = 'card-cover';
        const cardReveal = document.createElement('div');
        cardReveal.className = 'card-reveal';

        const img = document.createElement('img');
        const tryLoadImage = (ext) => { img.src = `images/${cardId}.${ext}`; };
        img.onerror = () => {
            if (img.src.endsWith('.png')) {
                tryLoadImage('jpg');
            } else {
                img.style.display = 'none';
                const fallbackInfo = tarotDataList.find(c => c.id === cardId);
                const fallbackText = document.createElement('div');
                fallbackText.className = 'fallback-title';
                fallbackText.innerHTML = fallbackInfo ? fallbackInfo.name : `Card ${cardId}`;
                cardReveal.appendChild(fallbackText);
                fallbackText.style.display = 'flex';
            }
        };
        tryLoadImage('png');
        cardReveal.appendChild(img);

        const labelText = tarotDataList.find(c => c.id === cardId)?.enName || `CARD ${cardId}`;
        const nameLabel = document.createElement('div');
        nameLabel.className = 'card-name-label';
        nameLabel.innerHTML = labelText;
        cardReveal.appendChild(nameLabel);

        cardInner.appendChild(cardCover);
        cardInner.appendChild(cardReveal);
        cardElem.appendChild(cardInner);
        cardElem.addEventListener('click', () => handleCardClick(cardElem, cardId));

        setTimeout(() => { container.appendChild(cardElem); }, index * 30);
    });
}

function getMaxCards() { return currentMode === 'weekly' ? 3 : 1; }

function handleCardClick(cardElem, cardId) {
    const maxCards = getMaxCards();
    if (selectedCards.length >= maxCards || cardElem.classList.contains('flipped')) return;
    cardElem.classList.add('flipped', 'disabled');
    selectedCards.push(cardId);
    document.getElementById('select-count').innerText = selectedCards.length;
    if (selectedCards.length === maxCards) {
        document.querySelectorAll('.tarot-card').forEach(card => card.classList.add('disabled'));
        setTimeout(() => {
            if (currentMode === 'weekly') showWeeklyResult();
            else if (currentMode === 'love') showLoveResult();
            else if (currentMode === 'yesno') showYesNoResult();
            else showMoneyResult();
            incrementReadingCount();
        }, 1000);
    }
}

// ========== 카드 이미지 렌더 헬퍼 ==========
function renderCardImg(wrapper, cardId, data) {
    wrapper.innerHTML = '';
    const img = document.createElement('img');
    const tryLoad = (ext) => { img.src = `images/${cardId}.${ext}`; };
    img.onerror = () => {
        if (img.src.endsWith('.png')) { tryLoad('jpg'); }
        else {
            img.style.display = 'none';
            const fb = document.createElement('div');
            fb.className = 'fallback-title';
            fb.innerHTML = data && data.name ? data.name : `Card ${cardId}`;
            wrapper.appendChild(fb);
            fb.style.display = 'flex';
        }
    };
    tryLoad('png');
    wrapper.appendChild(img);
    const label = document.createElement('div');
    label.className = 'card-name-label';
    label.innerHTML = data ? (data.enName || data.name) : `CARD ${cardId}`;
    wrapper.appendChild(label);
}

// ========== 오늘의 카드 결과 ==========
function getDailyRatingInfo(rating) {
    const map = {
        1: { emoji: '☀️', label: '오늘은 아주 좋은 날', conclusion: '우주의 모든 에너지가 오늘 당신의 편입니다!<br>자신감을 가지고 하루를 마음껏 빛내세요. ✨' },
        2: { emoji: '🌤️', label: '오늘은 좋은 날', conclusion: '긍정적인 에너지가 가득한 하루입니다.<br>좋은 일들이 하나씩 찾아올 것입니다. 💫' },
        3: { emoji: '⛅', label: '오늘은 평범한 날', conclusion: '평온하고 차분한 하루입니다.<br>소소한 행복을 발견하는 연습을 해보세요. 🌙' },
        4: { emoji: '🌥️', label: '오늘은 조금 주의가 필요한 날', conclusion: '중요한 결정은 신중하게 내리세요.<br>서두르지 않으면 충분히 좋은 하루가 됩니다. 🛡️' },
        5: { emoji: '🌧️', label: '오늘은 많이 조심해야 하는 날', conclusion: '비 오는 날엔 우산을 쓰면 됩니다.<br>조심하면서 지내면 반드시 맑은 날이 옵니다. 🌈' }
    };
    return map[rating] || map[3];
}

function showDailyResult(cardId) {
    const modal = document.getElementById('daily-result-modal');
    const cardData = tarotDataList.find(item => item.id === cardId);
    const daily = (typeof dailyCardData !== 'undefined') ? dailyCardData[cardId] : null;
    if (!cardData || !daily) return;

    const ratingInfo = getDailyRatingInfo(daily.rating);

    // 등급 배지
    const badge = document.getElementById('daily-rating-badge');
    badge.className = `daily-rating-badge rating-${daily.rating}`;
    badge.innerHTML = `<span>${ratingInfo.emoji}</span> <span>${ratingInfo.label}</span>`;

    // 카드 이미지
    renderCardImg(document.getElementById('daily-res-card'), cardId, cardData);

    // 텍스트
    document.getElementById('daily-card-name').textContent = cardData.name;
    const prem = (typeof premiumData !== 'undefined') ? premiumData[cardId] : null;

    if (isPremium() && prem && prem.daily) {
        document.getElementById('daily-message').innerHTML = `<div class="premium-text-glow"><div class="premium-label">💎 프리미엄 심층 에너지 분석</div><p>${prem.daily.message.replace(/\n/g, '<br>')}</p></div>`;
        document.getElementById('daily-advice').textContent = prem.daily.advice;
    } else {
        document.getElementById('daily-message').textContent = daily.message;
        document.getElementById('daily-advice').textContent = daily.advice;
    }
    
    document.getElementById('daily-conclusion').innerHTML = ratingInfo.conclusion;
    handlePremiumBanner('banner-daily');

    modal.classList.add('active');
}

// ========== 이번주 운세 결과 ==========
function showWeeklyResult() {
    const modal = document.getElementById('result-modal');
    const pastId = selectedCards[0], presentId = selectedCards[1], futureId = selectedCards[2];
    const pastData = tarotDataList.find(item => item.id === pastId);
    const presentData = tarotDataList.find(item => item.id === presentId);
    const futureData = tarotDataList.find(item => item.id === futureId);

    const setCardImg = (slotName, id, data) => {
        const wrapper = document.getElementById(`res-card-${slotName}`);
        if (wrapper) renderCardImg(wrapper, id, data);
    };
    if (pastData) setCardImg('past', pastId, pastData);
    if (presentData) setCardImg('present', presentId, presentData);
    if (futureData) setCardImg('future', futureId, futureData);

    const prem0 = (typeof premiumData !== 'undefined') ? premiumData[pastId] : null;
    const prem1 = (typeof premiumData !== 'undefined') ? premiumData[presentId] : null;
    const prem2 = (typeof premiumData !== 'undefined') ? premiumData[futureId] : null;

    const combinedDescDiv = document.getElementById('res-desc-combined');
    if (combinedDescDiv && pastData && presentData && futureData) {
        if (isPremium() && prem0 && prem1 && prem2) {
             combinedDescDiv.innerHTML = `
                 <div class="reading-section">
                     <p><div class="premium-label">💎 과거의 흐름 심층 해석</div><strong><span class="card-name-highlight">${pastData.name}</span></strong></p>
                     <div class="premium-text-glow"><p>${prem0.weekly.past.replace(/\n/g, '<br>')}</p></div>
                 </div>
                 <div class="reading-section">
                     <p><div class="premium-label">💎 현재의 상황 심층 해석</div><strong><span class="card-name-highlight">${presentData.name}</span></strong></p>
                     <div class="premium-text-glow"><p>${prem1.weekly.present.replace(/\n/g, '<br>')}</p></div>
                 </div>
                 <div class="reading-section" style="border-bottom:none;">
                     <p><div class="premium-label">💎 미래의 조언 심층 해석</div><strong><span class="card-name-highlight">${futureData.name}</span></strong></p>
                     <div class="premium-text-glow"><p>${prem2.weekly.future.replace(/\n/g, '<br>')}</p></div>
                 </div>
                 <div class="conclusion-image-wrapper">
                     <img src="images/conclusion.png" alt="Mystical Tarot Conclusion" class="conclusion-image">
                 </div>
                 <p class="conclusion-text">
                     당신이 걸어온 모든 길은,<br>오늘의 당신을 빚어낸 소중한 기적이었습니다.<br><br>
                     지금 이 순간, 두려워하지 마세요.<br>
                     당신은 이미 충분히 용감하고, 충분히 아름답습니다.<br><br>
                     우주는 언제나 당신의 편에서 당신을 응원하고 있습니다.
                 </p>
             `;
        } else {
             combinedDescDiv.innerHTML = `
                 <div class="reading-section">
                     <p><strong>[과거의 흐름] <span class="card-name-highlight">${pastData.name}</span></strong><br>${pastData.past}</p>
                 </div>
                 <div class="reading-section">
                     <p><strong>[현재의 상황] <span class="card-name-highlight">${presentData.name}</span></strong><br>${presentData.present}</p>
                 </div>
                 <div class="reading-section" style="border-bottom:none;">
                     <p><strong>[미래의 조언] <span class="card-name-highlight">${futureData.name}</span></strong><br>${futureData.future}</p>
                 </div>
                 <div class="conclusion-image-wrapper">
                     <img src="images/conclusion.png" alt="Mystical Tarot Conclusion" class="conclusion-image">
                 </div>
                 <p class="conclusion-text">
                     당신이 걸어온 모든 길은,<br>오늘의 당신을 빚어낸 소중한 기적이었습니다.<br><br>
                     지금 이 순간, 두려워하지 마세요.<br>
                     당신은 이미 충분히 용감하고, 충분히 아름답습니다.<br><br>
                     우주는 언제나 당신의 편에서 당신을 응원하고 있습니다.
                 </p>
             `;
        }
    }
    handlePremiumBanner('banner-weekly');
    modal.classList.add('active');
}

// ========== 연애운 결과 ==========
function showLoveResult() {
    const modal = document.getElementById('love-result-modal');
    const cardId = selectedCards[0];
    const cardData = tarotDataList.find(item => item.id === cardId);
    if (!cardData) return;

    const ratingInfo = getLoveRatingInfo(cardData.loveRating);
    const badge = document.getElementById('love-rating-badge');
    badge.className = `love-rating-badge rating-${cardData.loveRating}`;
    badge.innerHTML = `<span>${ratingInfo.emoji}</span> <span>${ratingInfo.label}</span>`;

    renderCardImg(document.getElementById('love-res-card'), cardId, cardData);
    document.getElementById('love-card-name').textContent = cardData.name;
    const prem = (typeof premiumData !== 'undefined') ? premiumData[cardId] : null;
    
    if (isPremium() && prem && prem.love) {
        document.getElementById('love-meaning').innerHTML = `<div class="premium-text-glow"><div class="premium-label">💎 프리미엄 심층 연애 해석</div><p>${prem.love.meaning.replace(/\n/g, '<br>')}</p></div>`;
        document.getElementById('love-advice').textContent = prem.love.advice;
    } else {
        document.getElementById('love-meaning').textContent = cardData.loveMeaning;
        document.getElementById('love-advice').textContent = cardData.loveAdvice;
    }
    document.getElementById('love-conclusion').innerHTML = ratingInfo.conclusion;
    handlePremiumBanner('banner-love');

    modal.classList.add('active');
}

function getLoveRatingInfo(rating) {
    const ratings = {
        1: { emoji: '🟢', label: '아주 좋다 (Very Good)', conclusion: '최고의 연애운입니다!<br>지금의 행복한 에너지를 만끽하세요.<br>우주가 두 사람의 궤도를 축복하고 있습니다. ✨' },
        2: { emoji: '🔵', label: '좋다 (Good)', conclusion: '긍정적인 에너지가 흐르고 있습니다.<br>조금만 더 용기를 내면<br>당신의 별은 반드시 빛날 것입니다. 💫' },
        3: { emoji: '🟡', label: '보통 (Average)', conclusion: '차분한 관리가 필요한 시기입니다.<br>서두르지 말고 천천히,<br>두 사람의 주파수를 조율해 보세요. 🌙' },
        4: { emoji: '🟠', label: '주의 (Caution)', conclusion: '주의가 필요한 시기입니다.<br>잠시 멈춰서 자신의 마음에 귀를 기울여 보세요.<br>코어 시스템 점검의 시간이 필요합니다. 🛡️' },
        5: { emoji: '🔴', label: '위험 (Warning)', conclusion: '마음의 방어 시스템을 가동할 때입니다.<br>자신을 가장 먼저 지켜주세요.<br>폭풍이 지나면, 더 단단한 내가 기다립니다. 🔥' }
    };
    return ratings[rating] || ratings[3];
}

// ========== 금전운 결과 ==========
function showMoneyResult() {
    const modal = document.getElementById('money-result-modal');
    const cardId = selectedCards[0];
    const cardData = tarotDataList.find(item => item.id === cardId);
    if (!cardData) return;

    const ratingInfo = getMoneyRatingInfo(cardData.moneyRating);
    const badge = document.getElementById('money-rating-badge');
    badge.className = `money-rating-badge rating-${cardData.moneyRating}`;
    badge.innerHTML = `<span>${ratingInfo.emoji}</span> <span>${ratingInfo.label}</span>`;

    renderCardImg(document.getElementById('money-res-card'), cardId, cardData);
    document.getElementById('money-card-name').textContent = cardData.name;
    const prem = (typeof premiumData !== 'undefined') ? premiumData[cardId] : null;
    
    if (isPremium() && prem && prem.money) {
        document.getElementById('money-meaning').innerHTML = `<div class="premium-text-glow"><div class="premium-label">💎 프리미엄 심층 금전 해석</div><p>${prem.money.meaning.replace(/\n/g, '<br>')}</p></div>`;
        document.getElementById('money-advice').textContent = prem.money.advice;
    } else {
        document.getElementById('money-meaning').textContent = cardData.moneyMeaning;
        document.getElementById('money-advice').textContent = cardData.moneyAdvice;
    }
    document.getElementById('money-conclusion').innerHTML = ratingInfo.conclusion;
    handlePremiumBanner('banner-money');

    modal.classList.add('active');
}

function getMoneyRatingInfo(rating) {
    const ratings = {
        1: { emoji: '💰', label: '풍요로움 (Very Good)', conclusion: '금전적으로 최고의 흐름입니다!<br>뿌린 대로 거두는 풍성한 결실이 기다립니다. ✨' },
        2: { emoji: '💵', label: '안정적 (Good)', conclusion: '원활한 자금 흐름이 예상됩니다.<br>계획적인 소비와 투자가 있다면<br>자산은 꾸준히 늘어날 것입니다. 💫' },
        3: { emoji: '⚖️', label: '보통 (Average)', conclusion: '수입과 지출의 균형이 필요한 때입니다.<br>충동적인 지출을 줄이고<br>현재의 재정 상태를 유지하는 데 집중하세요. 🌙' },
        4: { emoji: '🚫', label: '주의 (Caution)', conclusion: '불필요한 지출이 발생할 수 있습니다.<br>금전 거래나 새로운 투자는 신중히 검토하세요. 🛡️' },
        5: { emoji: '⚠️', label: '위험 (Warning)', conclusion: '재정적 손실에 대비해야 합니다.<br>무리한 확장은 피하고 비상금을 확보하세요. 🔥' }
    };
    return ratings[rating] || ratings[3];
}

// ========== Yes or No 결과 ==========
const yesCardsList = [0, 1, 3, 4, 6, 7, 8, 10, 17, 19, 21];

function showYesNoResult() {
    const modal = document.getElementById('yesno-result-modal');
    const cardId = selectedCards[0];
    const cardData = tarotDataList.find(item => item.id === cardId);
    if (!cardData) return;

    const isYes = yesCardsList.includes(cardId);
    const badge = document.getElementById('yesno-rating-badge');
    badge.className = 'yesno-rating-badge rating-' + (isYes ? 'yes' : 'no');
    badge.innerHTML = '<span>' + (isYes ? '⭕' : '❌') + '</span> <span>' + (isYes ? '하자~!!' : '하지마~!!') + '</span>';

    renderCardImg(document.getElementById('yesno-res-card'), cardId, cardData);
    document.getElementById('yesno-card-name').textContent = cardData.name;
    document.getElementById('yesno-meaning').textContent = cardData.keyword;

    const adviceEl = document.getElementById('yesno-advice');
    const conclusionEl = document.getElementById('yesno-conclusion');
    if (isYes) {
        adviceEl.innerHTML = '이 카드는 <strong>강력한 긍정의 힘</strong>을 품고 있습니다.<br>당신의 선택은 올바른 궤도에 올랐으며, 주저하지 말고 나아가야 할 때입니다.';
        conclusionEl.innerHTML = '우주가 당신의 에너지를 지지합니다.<br>용기를 내어 과감하게 실행하세요! ✨';
    } else {
        adviceEl.innerHTML = '이 카드는 <strong>신중함과 재고의 메시지</strong>를 전하고 있습니다.<br>지금은 잠시 멈추어 상황을 되돌아보고 냉정하게 판단해야 할 때입니다.';
        conclusionEl.innerHTML = '무리한 진행은 피하는 것이 좋습니다.<br>쉬어가는 것도 하나의 훌륭한 선택입니다. 🛡️';
    }

    const prem = (typeof premiumData !== 'undefined') ? premiumData[cardId] : null;

    if (isPremium() && prem && prem.weekly) {
        const yesnoText = isYes ? prem.weekly.future : prem.weekly.past;
        const premContainer = document.getElementById('yesno-premium-content');
        if (premContainer) {
            premContainer.innerHTML = `<div class="premium-text-glow"><div class="premium-label">💎 심층 우주 조언</div><p>${yesnoText.replace(/\n/g, '<br>')}</p></div>`;
            premContainer.style.display = 'block';
        }
    } else {
        const premContainer = document.getElementById('yesno-premium-content');
        if (premContainer) premContainer.style.display = 'none';
    }

    handlePremiumBanner('banner-yesno');
    modal.classList.add('active');
}

// ========== 초기화 ==========
function restartGame() {
    ['result-modal','love-result-modal','money-result-modal','yesno-result-modal','lotto-result-modal','daily-result-modal'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('active');
    });
    selectedCards = [];
    currentMode = null;
    if (typeof lottoInterval !== 'undefined' && lottoInterval) clearInterval(lottoInterval);

    // 카드 컨테이너 복구
    document.getElementById('card-container').classList.remove('hidden');
    document.getElementById('daily-spread-container').classList.add('hidden');
    document.getElementById('reading-screen').classList.add('hidden');
    document.getElementById('mode-select-screen').classList.remove('hidden');
    updateDailyBtnStatus();
}

// ========== 로또 ==========
let lottoNumbers = [];
let lottoInterval = null;

function initLotto() {
    lottoNumbers = [];
    const drawResults = document.getElementById('lotto-draw-results');
    if (drawResults) drawResults.innerHTML = '';
    const conclusion = document.getElementById('lotto-conclusion-text');
    if (conclusion) conclusion.style.opacity = '0';
    document.getElementById('btn-lotto-restart').classList.add('hidden');
    const startBtn = document.getElementById('btn-lotto-start');
    const homeBtn = document.getElementById('btn-lotto-home');
    startBtn.classList.remove('hidden');
    startBtn.disabled = false;
    homeBtn.classList.remove('hidden');
    const spinner = document.getElementById('lotto-balls-spinner');
    if (spinner) {
        spinner.innerHTML = '';
        spinner.classList.remove('spinning');
        for (let i = 1; i <= 45; i++) {
            const ball = createLottoBall(i);
            ball.style.position = 'absolute';
            ball.style.left = (Math.random() * 80 + 10) + '%';
            ball.style.top = (Math.random() * 80 + 10) + '%';
            spinner.appendChild(ball);
        }
    }
}

function createLottoBall(num) {
    const ball = document.createElement('div');
    let group = Math.floor((num - 1) / 10);
    ball.className = 'lotto-ball num-group-' + group;
    const numText = document.createElement('span');
    numText.textContent = num;
    ball.appendChild(numText);
    return ball;
}

function startLottoDraw() {
    document.getElementById('btn-lotto-start').disabled = true;
    document.getElementById('btn-lotto-start').classList.add('hidden');
    document.getElementById('btn-lotto-home').classList.add('hidden');
    let nums = [];
    for (let i = 1; i <= 45; i++) nums.push(i);
    shuffleArray(nums);
    lottoNumbers = nums.slice(0, 6).sort((a, b) => a - b);
    const spinner = document.getElementById('lotto-balls-spinner');
    if (spinner) spinner.classList.add('spinning');
    let drawCount = 0;
    const drawResults = document.getElementById('lotto-draw-results');
    lottoInterval = setInterval(() => {
        if (drawCount >= 6) {
            clearInterval(lottoInterval);
            if (spinner) spinner.classList.remove('spinning');
            document.getElementById('lotto-conclusion-text').style.opacity = '1';
            document.getElementById('btn-lotto-restart').classList.remove('hidden');
            incrementReadingCount();
            return;
        }
        const num = lottoNumbers[drawCount];
        const ball = createLottoBall(num);
        ball.classList.add('pop-out');
        drawResults.appendChild(ball);
        drawCount++;
    }, 1200);
}

// ========== 프리미엄 모드: 그 사람 지금 내 생각 할까? ==========
let thinkingRelation = '';
let thinkingCards = []; // 4장의 뽑힌 카드 ID 저장
let thinkingCurrentPos = 1;

function checkPremiumAccess() {
    if (!isPremium()) {
        showPremiumInfo();
        return false;
    }
    return true;
}

function startThinkingMode() {
    if (!checkPremiumAccess()) return;
    
    // const today = new Date().toDateString();
    // if (localStorage.getItem('thinkingLastUsed') === today) {
    //     alert('이 집중 리딩은 하루 한 번만 에너지를 정확히 읽어낼 수 있습니다.\n내일 다시 찾아와 주세요.');
    //     return; // 실서비스 배포 시 주석 해제하여 활성화
    // }

    thinkingRelation = '';
    thinkingCards = [];
    thinkingCurrentPos = 1;
    
    // 모달 및 스텝1 초기화
    document.getElementById('thinking-modal').classList.add('active');
    switchThinkingStep(1);
    
    // STEP 3 초기화
    const readingBox = document.getElementById('thinking-reading-box');
    readingBox.style.display = 'none';
    readingBox.innerHTML = '';
    const btnNext = document.getElementById('btn-thinking-next');
    btnNext.style.opacity = '0';
    btnNext.style.pointerEvents = 'none';
    
    for (let i = 1; i <= 4; i++) {
        const wrapper = document.querySelector(`.thinking-card-wrapper[data-pos="${i}"]`);
        const card = document.getElementById(`tc-${i}`);
        card.classList.remove('flipped');
        if(i === 1) wrapper.classList.remove('locked');
        else wrapper.classList.add('locked');
    }
}

function closeThinkingMode() {
    document.getElementById('thinking-modal').classList.remove('active');
}

function switchThinkingStep(stepNum) {
    document.querySelectorAll('.thinking-step').forEach(step => step.classList.remove('active'));
    document.getElementById('thinking-step-'+stepNum).classList.add('active');
}

function selectRelationship(type) {
    thinkingRelation = type;
    switchThinkingStep(2);
    startFocusRitual();
}

function startFocusRitual() {
    let count = 3;
    const numEl = document.getElementById('countdown-number');
    const circle = document.querySelector('.countdown-circle');
    
    numEl.innerText = count;
    circle.style.strokeDashoffset = '0';
    
    setTimeout(() => {
        circle.style.strokeDashoffset = '339.292'; // 원형 줄어드는 애니메이션 기준 길이
    }, 50);

    const intv = setInterval(() => {
        count--;
        if (count > 0) {
            numEl.innerText = count;
        } else if (count === 0) {
            numEl.innerText = '눈을 뜨세요';
        } else {
            clearInterval(intv);
            initThinkingCards();
        }
    }, 1000);
}

function initThinkingCards() {
    // 22장 중 4장 뽑기
    const deck = [];
    for(let i=0; i<22; i++) deck.push(i);
    shuffleArray(deck);
    thinkingCards = deck.slice(0,4);
    
    // 카드 뒷면(결과 이미지) 세팅
    for(let i=1; i<=4; i++) {
        const back = document.querySelector(`#tc-${i} .thinking-card-back`);
        back.style.backgroundImage = `url('media/cards/${thinkingCards[i-1]}.jpg')`;
    }
    
    switchThinkingStep(3);
}

function revealThinkingCard(pos) {
    if (pos !== thinkingCurrentPos) return;
    
    const cardId = thinkingCards[pos-1];
    const data = thinkingData[cardId];
    
    document.getElementById(`tc-${pos}`).classList.add('flipped');
    
    const readingBox = document.getElementById('thinking-reading-box');
    readingBox.style.display = 'block';
    
    let textHTML = '';
    if (pos === 1) textHTML = `<strong style="color:var(--gold);">[그 사람의 현재]</strong><br>${data.pos1.text}`;
    else if (pos === 2) textHTML = `<strong style="color:var(--gold);">[나를 향한 마음]</strong><br>${data.pos2.text}`;
    else if (pos === 3) textHTML = `<strong style="color:var(--gold);">[둘 사이의 에너지 온도]</strong><br>${data.pos3.text}`;
    else if (pos === 4) textHTML = `<strong style="color:var(--gold);">[앞으로 7일 내 변화 신호]</strong><br>${data.pos4.text}`;
    
    const newP = document.createElement('p');
    newP.innerHTML = textHTML;
    newP.style.animation = 'fadeIn 0.5s ease';
    newP.style.borderTop = '1px solid rgba(255,255,255,0.1)';
    newP.style.paddingTop = '10px';
    if(pos === 1) newP.style.borderTop = 'none';
    
    readingBox.appendChild(newP);
    readingBox.scrollTop = readingBox.scrollHeight;
    
    thinkingCurrentPos++;
    if (thinkingCurrentPos <= 4) {
        document.querySelector(`.thinking-card-wrapper[data-pos="${thinkingCurrentPos}"]`).classList.remove('locked');
    } else {
        const btnNext = document.getElementById('btn-thinking-next');
        btnNext.style.opacity = '1';
        btnNext.style.pointerEvents = 'auto';
        localStorage.setItem('thinkingLastUsed', new Date().toDateString());
    }
}

function showThinkingSummary() {
    switchThinkingStep(5);
    incrementReadingCount();
    
    const card2 = thinkingCards[1];
    const card3 = thinkingCards[2];
    const card4 = thinkingCards[3];
    
    const d2 = thinkingData[card2].pos2;
    const d3 = thinkingData[card3].pos3;
    const d4 = thinkingData[card4].pos4;

    // 감정 온도계 애니메이션
    setTimeout(() => {
        const tempObj = document.getElementById('temp-marker');
        tempObj.style.left = d2.temperature + '%';
        document.getElementById('temp-text').innerText = `현재 감정 온도 ${d2.temperature}° : ${d2.state}`;
    }, 300);

    // 에너지 게이지 애니메이션
    const gaugeObj = document.getElementById('energy-fill');
    const valObj = document.getElementById('energy-value');
    const targetVal = Math.floor(Math.random() * (d3.gaugeMax - d3.gaugeMin + 1)) + d3.gaugeMin;
    setTimeout(() => {
        gaugeObj.style.width = targetVal + '%';
        document.getElementById('energy-desc').innerText = d3.flow;
        let curr = 0;
        const intv = setInterval(() => {
            curr += 2;
            if(curr >= targetVal) { curr = targetVal; clearInterval(intv); }
            valObj.innerText = curr;
        }, 30);
    }, 600);

    // 타임라인 설정
    setTimeout(() => {
        document.querySelectorAll('.timeline-bar .day').forEach(el => el.classList.remove('active'));
        d4.focusDays.forEach(dayIndex => {
            document.getElementById('day-' + dayIndex).classList.add('active');
        });
        document.getElementById('timeline-text').innerText = d4.signal;
    }, 900);

    // 조언 버튼 활성화
    setTimeout(() => {
        document.querySelectorAll('.action-btn').forEach(el => el.classList.remove('active'));
        if (d4.action === 'wait') {
            document.getElementById('action-wait').classList.add('active');
        } else if (d4.action === 'contact') {
            document.getElementById('action-contact').classList.add('active');
        } else {
            document.getElementById('action-focus').classList.add('active');
        }
    }, 1200);
}

function shareThinkingResult() {
    const textTarget = document.getElementById('energy-value').innerText;
    const text = `오늘 타로가 감지한 우리 사이 연락 에너지: ${textTarget}%\n과연 그 사람도 내 생각을 하고 있을까? 지금 확인해보세요.`;
    
    if (navigator.share) {
        navigator.share({
            title: '타로 - 그 사람 지금 내 생각 할까?',
            text: text,
            url: window.location.href,
        }).catch(err => console.error('공유 실패:', err));
    } else {
        alert('현재 브라우저에서는 공유 기능을 지원하지 않습니다.\n\n' + text);
    }
}
