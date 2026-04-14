document.addEventListener('DOMContentLoaded', () => {
    initModeSelect();
});

let selectedCards = [];
let deck = [];
let currentMode = null; // 'weekly' or 'love'

// Fisher-Yates 셔플 알고리즘
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

    // 모드 선택 화면 보이기, 카드 화면 숨기기
    modeScreen.classList.remove('hidden');
    readingScreen.classList.add('hidden');

    document.getElementById('btn-mode-weekly').addEventListener('click', () => startMode('weekly'));
    document.getElementById('btn-mode-love').addEventListener('click', () => startMode('love'));
    document.getElementById('btn-mode-money').addEventListener('click', () => startMode('money'));
    document.getElementById('btn-mode-yesno').addEventListener('click', () => startMode('yesno'));
}

function startMode(mode) {
    currentMode = mode;
    selectedCards = [];

    const modeScreen = document.getElementById('mode-select-screen');
    const readingScreen = document.getElementById('reading-screen');

    // 모드에 따른 텍스트 변경
    if (mode === 'weekly') {
        document.getElementById('header-title').textContent = '당신의 이번주 운세';
        document.getElementById('header-desc').textContent = '당신의 운명을 이끌어줄 3장의 카드를 선택하세요.';
        document.getElementById('max-count').textContent = '3';
    } else if (mode === 'love') {
        document.getElementById('header-title').textContent = '당신의 연애운';
        document.getElementById('header-desc').textContent = '당신의 사랑을 비추어줄 1장의 카드를 선택하세요.';
        document.getElementById('max-count').textContent = '1';
    } else if (mode === 'yesno') {
        document.getElementById('header-title').textContent = '그래 결심했어~!';
        document.getElementById('header-desc').textContent = '명쾌한 해답이 필요한가요? 당신의 결정을 비추어줄 1장의 카드를 선택하세요.';
        document.getElementById('max-count').textContent = '1';
    } else {
        document.getElementById('header-title').textContent = '당신의 금전운';
        document.getElementById('header-desc').textContent = '당신의 재물을 비추어줄 1장의 카드를 선택하세요.';
        document.getElementById('max-count').textContent = '1';
    }
    document.getElementById('select-count').textContent = '0';

    // 화면 전환
    modeScreen.classList.add('hidden');
    readingScreen.classList.remove('hidden');

    // 덱 초기화 및 카드 렌더링
    initDeck();
}

function initDeck() {
    deck = Array.from({length: 22}, (_, i) => i);
    shuffleArray(deck);
    renderCards();

    // 다시하기 버튼 등록
    document.getElementById('btn-restart').addEventListener('click', restartGame);
    document.getElementById('btn-love-restart').addEventListener('click', restartGame);
    document.getElementById('btn-money-restart').addEventListener('click', restartGame);
    document.getElementById('btn-yesno-restart').addEventListener('click', restartGame);
}

function renderCards() {
    const container = document.getElementById('card-container');
    container.innerHTML = '';

    deck.forEach((cardId, index) => {
        const cardElem = document.createElement('div');
        cardElem.className = 'tarot-card';
        cardElem.dataset.id = cardId;
        cardElem.dataset.index = index;

        const cardInner = document.createElement('div');
        cardInner.className = 'card-inner';

        const cardCover = document.createElement('div');
        cardCover.className = 'card-cover';

        const cardReveal = document.createElement('div');
        cardReveal.className = 'card-reveal';

        const img = document.createElement('img');
        const tryLoadImage = (ext) => {
            img.src = `images/${cardId}.${ext}`;
        };

        img.onerror = () => {
            if (img.src.endsWith('.png')) {
                tryLoadImage('jpg');
            } else {
                img.style.display = 'none';
                const fallbackInfo = tarotDataList.find(c => c.id === cardId);
                const fallbackText = document.createElement('div');
                fallbackText.className = 'fallback-title';
                fallbackText.innerHTML = fallbackInfo ? `${fallbackInfo.name}` : `Card ${cardId}`;
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

        setTimeout(() => {
            container.appendChild(cardElem);
        }, index * 30);
    });
}

function getMaxCards() {
    return currentMode === 'weekly' ? 3 : 1;
}

function handleCardClick(cardElem, cardId) {
    const maxCards = getMaxCards();
    if (selectedCards.length >= maxCards || cardElem.classList.contains('flipped')) {
        return;
    }

    cardElem.classList.add('flipped');
    cardElem.classList.add('disabled');

    selectedCards.push(cardId);

    document.getElementById('select-count').innerText = selectedCards.length;

    if (selectedCards.length === maxCards) {
        const allCards = document.querySelectorAll('.tarot-card');
        allCards.forEach(card => card.classList.add('disabled'));

        setTimeout(() => {
            if (currentMode === 'weekly') {
                showWeeklyResult();
            } else if (currentMode === 'love') {
                showLoveResult();
            } else if (currentMode === 'yesno') {
                showYesNoResult();
            } else {
                showMoneyResult();
            }
        }, 1000);
    }
}

// ========== 이번주 운세 결과 ==========
function showWeeklyResult() {
    const modal = document.getElementById('result-modal');

    const pastId = selectedCards[0];
    const presentId = selectedCards[1];
    const futureId = selectedCards[2];

    const pastData = tarotDataList.find(item => item.id === pastId);
    const presentData = tarotDataList.find(item => item.id === presentId);
    const futureData = tarotDataList.find(item => item.id === futureId);

    const setCardImg = (slotName, id, data) => {
        const wrapper = document.getElementById(`res-card-${slotName}`);
        if (!wrapper) return;
        wrapper.innerHTML = '';

        const img = document.createElement('img');
        const tryLoadImage = (ext) => {
            img.src = `images/${id}.${ext}`;
        };

        img.onerror = () => {
            if (img.src.endsWith('.png')) {
                tryLoadImage('jpg');
            } else {
                img.style.display = 'none';
                const fallbackText = document.createElement('div');
                fallbackText.className = 'fallback-title';
                fallbackText.innerHTML = data && data.name ? data.name : `Card ${id}`;
                wrapper.appendChild(fallbackText);
                fallbackText.style.display = 'flex';
            }
        };

        tryLoadImage('png');
        wrapper.appendChild(img);

        const labelText = data ? (data.enName || data.name) : `CARD ${id}`;
        const nameLabel = document.createElement('div');
        nameLabel.className = 'card-name-label';
        nameLabel.innerHTML = labelText;
        wrapper.appendChild(nameLabel);
    };

    if (pastData) setCardImg('past', pastId, pastData);
    if (presentData) setCardImg('present', presentId, presentData);
    if (futureData) setCardImg('future', futureId, futureData);

    const combinedDescDiv = document.getElementById('res-desc-combined');
    if (combinedDescDiv && pastData && presentData && futureData) {
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

    modal.classList.add('active');
}

// ========== 연애운 결과 ==========
function showLoveResult() {
    const modal = document.getElementById('love-result-modal');
    const cardId = selectedCards[0];
    const cardData = tarotDataList.find(item => item.id === cardId);

    if (!cardData) return;

    // 등급 정보
    const ratingInfo = getLoveRatingInfo(cardData.loveRating);

    // 등급 배지
    const badge = document.getElementById('love-rating-badge');
    badge.className = `love-rating-badge rating-${cardData.loveRating}`;
    badge.innerHTML = `<span>${ratingInfo.emoji}</span> <span>${ratingInfo.label}</span>`;

    // 카드 이미지
    const cardWrapper = document.getElementById('love-res-card');
    cardWrapper.innerHTML = '';
    const img = document.createElement('img');
    const tryLoadImage = (ext) => { img.src = `images/${cardId}.${ext}`; };
    img.onerror = () => {
        if (img.src.endsWith('.png')) {
            tryLoadImage('jpg');
        } else {
            img.style.display = 'none';
            const fallbackText = document.createElement('div');
            fallbackText.className = 'fallback-title';
            fallbackText.innerHTML = cardData.name;
            cardWrapper.appendChild(fallbackText);
            fallbackText.style.display = 'flex';
        }
    };
    tryLoadImage('png');
    cardWrapper.appendChild(img);

    const nameLabel = document.createElement('div');
    nameLabel.className = 'card-name-label';
    nameLabel.innerHTML = cardData.enName || cardData.name;
    cardWrapper.appendChild(nameLabel);

    // 텍스트 채우기
    document.getElementById('love-card-name').textContent = cardData.name;
    document.getElementById('love-meaning').textContent = cardData.loveMeaning;
    document.getElementById('love-advice').textContent = cardData.loveAdvice;

    // 결론 메시지 (등급별)
    const conclusionEl = document.getElementById('love-conclusion');
    conclusionEl.innerHTML = ratingInfo.conclusion;

    modal.classList.add('active');
}

function getLoveRatingInfo(rating) {
    const ratings = {
        1: {
            emoji: '🟢',
            label: '아주 좋다 (Very Good)',
            conclusion: '최고의 연애운입니다!<br>지금의 행복한 에너지를 만끽하세요.<br>우주가 두 사람의 궤도를 축복하고 있습니다. ✨'
        },
        2: {
            emoji: '🔵',
            label: '좋다 (Good)',
            conclusion: '긍정적인 에너지가 흐르고 있습니다.<br>조금만 더 용기를 내면<br>당신의 별은 반드시 빛날 것입니다. 💫'
        },
        3: {
            emoji: '🟡',
            label: '보통 (Average)',
            conclusion: '차분한 관리가 필요한 시기입니다.<br>서두르지 말고 천천히,<br>두 사람의 주파수를 조율해 보세요. 🌙'
        },
        4: {
            emoji: '🟠',
            label: '주의 (Caution)',
            conclusion: '주의가 필요한 시기입니다.<br>잠시 멈춰서 자신의 마음에 귀를 기울여 보세요.<br>코어 시스템 점검의 시간이 필요합니다. 🛡️'
        },
        5: {
            emoji: '🔴',
            label: '위험 (Warning)',
            conclusion: '마음의 방어 시스템을 가동할 때입니다.<br>자신을 가장 먼저 지켜주세요.<br>폭풍이 지나면, 더 단단한 내가 기다립니다. 🔥'
        }
    };
    return ratings[rating] || ratings[3];
}

// ========== 초기화 ==========
function restartGame() {
    // 모달 닫기
    document.getElementById('result-modal').classList.remove('active');
    document.getElementById('love-result-modal').classList.remove('active');
    document.getElementById('money-result-modal').classList.remove('active');
    document.getElementById('yesno-result-modal').classList.remove('active');

    // 데이터 초기화
    selectedCards = [];
    currentMode = null;

    // 카드 화면 숨기기, 모드 선택 화면 보이기
    document.getElementById('reading-screen').classList.add('hidden');
    document.getElementById('mode-select-screen').classList.remove('hidden');
}

// ========== 금전운 결과 ==========
function showMoneyResult() {
    const modal = document.getElementById('money-result-modal');
    const cardId = selectedCards[0];
    const cardData = tarotDataList.find(item => item.id === cardId);

    if (!cardData) return;

    // 등급 정보
    const ratingInfo = getMoneyRatingInfo(cardData.moneyRating);

    // 등급 배지
    const badge = document.getElementById('money-rating-badge');
    badge.className = `money-rating-badge rating-${cardData.moneyRating}`;
    badge.innerHTML = `<span>${ratingInfo.emoji}</span> <span>${ratingInfo.label}</span>`;

    // 카드 이미지
    const cardWrapper = document.getElementById('money-res-card');
    cardWrapper.innerHTML = '';
    const img = document.createElement('img');
    const tryLoadImage = (ext) => { img.src = `images/${cardId}.${ext}`; };
    img.onerror = () => {
        if (img.src.endsWith('.png')) {
            tryLoadImage('jpg');
        } else {
            img.style.display = 'none';
            const fallbackText = document.createElement('div');
            fallbackText.className = 'fallback-title';
            fallbackText.innerHTML = cardData.name;
            cardWrapper.appendChild(fallbackText);
            fallbackText.style.display = 'flex';
        }
    };
    tryLoadImage('png');
    cardWrapper.appendChild(img);

    const nameLabel = document.createElement('div');
    nameLabel.className = 'card-name-label';
    nameLabel.innerHTML = cardData.enName || cardData.name;
    cardWrapper.appendChild(nameLabel);

    // 텍스트 채우기
    document.getElementById('money-card-name').textContent = cardData.name;
    document.getElementById('money-meaning').textContent = cardData.moneyMeaning;
    document.getElementById('money-advice').textContent = cardData.moneyAdvice;

    // 결론 메시지 (등급별)
    const conclusionEl = document.getElementById('money-conclusion');
    conclusionEl.innerHTML = ratingInfo.conclusion;

    modal.classList.add('active');
}

function getMoneyRatingInfo(rating) {
    const ratings = {
        1: {
            emoji: '💰',
            label: '풍요로움 (Very Good)',
            conclusion: '금전적으로 최고의 흐름입니다!<br>뿌린 대로 거두는 풍성한 결실이 기다립니다.<br>우주의 풍요가 당신의 금고로 향하고 있습니다. ✨'
        },
        2: {
            emoji: '💵',
            label: '안정적 (Good)',
            conclusion: '원활한 자금 흐름이 예상됩니다.<br>계획적인 소비와 투자가 있다면<br>자산은 꾸준히 늘어날 것입니다. 💫'
        },
        3: {
            emoji: '⚖️',
            label: '보통 (Average)',
            conclusion: '수입과 지출의 균형이 필요한 때입니다.<br>충동적인 지출을 줄이고<br>현재의 재정 상태를 유지하는 데 집중하세요. 🌙'
        },
        4: {
            emoji: '🚫',
            label: '주의 (Caution)',
            conclusion: '불필요한 지출이 발생할 수 있습니다.<br>금전 거래나 새로운 투자는 신중히 검토하고<br>자산 보호에 힘써야 할 시기입니다. 🛡️'
        },
        5: {
            emoji: '⚠️',
            label: '위험 (Warning)',
            conclusion: '재정적 손실에 대비해야 합니다.<br>무리한 확장은 피하고 비상금을 확보하세요.<br>소나기를 피하면 다시 맑은 날이 올 것입니다. 🔥'
        }
    };
    return ratings[rating] || ratings[3];
}

// ========== Yes or No 운세 결과 ==========
const yesCardsList = [0, 1, 3, 4, 6, 7, 8, 10, 17, 19, 21];

function showYesNoResult() {
    const modal = document.getElementById('yesno-result-modal');
    const cardId = selectedCards[0];
    const cardData = tarotDataList.find(item => item.id === cardId);

    if (!cardData) return;

    const isYes = yesCardsList.includes(cardId);
    
    // 등급 배지 
    const badge = document.getElementById('yesno-rating-badge');
    badge.className = 'yesno-rating-badge rating-' + (isYes ? 'yes' : 'no');
    badge.innerHTML = '<span>' + (isYes ? '⭕' : '❌') + '</span> <span>' + (isYes ? '하자~!!' : '하지마~!!') + '</span>';

    // 카드 이미지
    const cardWrapper = document.getElementById('yesno-res-card');
    cardWrapper.innerHTML = '';
    const img = document.createElement('img');
    const tryLoadImage = (ext) => { img.src = 'images/' + cardId + '.' + ext; };
    img.onerror = () => {
        if (img.src.endsWith('.png')) {
            tryLoadImage('jpg');
        } else {
            img.style.display = 'none';
            const fallbackText = document.createElement('div');
            fallbackText.className = 'fallback-title';
            fallbackText.innerHTML = cardData.name;
            cardWrapper.appendChild(fallbackText);
            fallbackText.style.display = 'flex';
        }
    };
    tryLoadImage('png');
    cardWrapper.appendChild(img);

    const nameLabel = document.createElement('div');
    nameLabel.className = 'card-name-label';
    nameLabel.innerHTML = cardData.enName || cardData.name;
    cardWrapper.appendChild(nameLabel);

    // 텍스트 채우기
    document.getElementById('yesno-card-name').textContent = cardData.name;
    document.getElementById('yesno-meaning').textContent = cardData.keyword;
    
    // Yes or No 운세 결론
    const adviceEl = document.getElementById('yesno-advice');
    const conclusionEl = document.getElementById('yesno-conclusion');

    if (isYes) {
        adviceEl.innerHTML = '이 카드는 <strong>강력한 긍정의 힘</strong>을 품고 있습니다.<br>당신의 선택은 올바른 궤도에 올랐으며, 주저하지 말고 나아가야 할 때입니다.';
        conclusionEl.innerHTML = '우주가 당신의 에너지를 지지합니다.<br>용기를 내어 과감하게 실행하세요! ✨';
    } else {
        adviceEl.innerHTML = '이 카드는 <strong>신중함과 재고의 메시지</strong>를 전하고 있습니다.<br>지금은 잠시 멈추어 상황을 되돌아보고 냉정하게 판단해야 할 때입니다.';
        conclusionEl.innerHTML = '무리한 진행은 피하는 것이 좋습니다.<br>쉬어가는 것도 하나의 훌륭한 선택입니다. 🛡️';
    }

    modal.classList.add('active');
}
