document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

let selectedCards = [];
let deck = [];

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

function initApp() {
    // 0 ~ 21까지의 카드 아이디 배열 생성
    deck = Array.from({length: 22}, (_, i) => i);
    shuffleArray(deck);
    
    renderCards();
    
    document.getElementById('btn-restart').addEventListener('click', restartGame);
}

function renderCards() {
    const container = document.getElementById('card-container');
    container.innerHTML = '';
    
    deck.forEach((cardId, index) => {
        // 카드 컨테이너
        const cardElem = document.createElement('div');
        cardElem.className = 'tarot-card';
        cardElem.dataset.id = cardId;
        cardElem.dataset.index = index;
        
        // 카드 이너 (3d flip 적용부)
        const cardInner = document.createElement('div');
        cardInner.className = 'card-inner';
        
        // 카드 뒷면 (커버 무늬)
        const cardCover = document.createElement('div');
        cardCover.className = 'card-cover';
        
        // 카드 앞면 (타로 내용)
        const cardReveal = document.createElement('div');
        cardReveal.className = 'card-reveal';
        
        // 이미지 추가
        const img = document.createElement('img');
        // images 폴더 내 0.jpg ~ 21.jpg 매핑 (이미지가 없을 경우 fallback)
        img.src = `images/${cardId}.jpg`;
        // 이미지 에러 시 CSS로 디자인된 대체 텍스트 표시
        img.onerror = () => {
            img.style.display = 'none';
            const fallbackInfo = tarotDataList.find(c => c.id === cardId);
            const fallbackText = document.createElement('div');
            fallbackText.className = 'fallback-title';
            fallbackText.innerHTML = fallbackInfo ? `${fallbackInfo.name}` : `Card ${cardId}`;
            cardReveal.appendChild(fallbackText);
            // 보이게 처리
            fallbackText.style.display = 'flex';
        };

        cardReveal.appendChild(img);
        
        // 영문 이름 라벨 추가 (SF 홀로그램 느낌)
        const labelText = tarotDataList.find(c => c.id === cardId)?.enName || `CARD ${cardId}`;
        const nameLabel = document.createElement('div');
        nameLabel.className = 'card-name-label';
        nameLabel.innerHTML = labelText;
        cardReveal.appendChild(nameLabel);
        
        cardInner.appendChild(cardCover);
        cardInner.appendChild(cardReveal);
        cardElem.appendChild(cardInner);
        
        // 클릭 이벤트 등록
        cardElem.addEventListener('click', () => handleCardClick(cardElem, cardId));
        
        // 순차적으로 등장하는 부드러운 애니메이션 (딜레이)
        setTimeout(() => {
            container.appendChild(cardElem);
        }, index * 30);
    });
}

function handleCardClick(cardElem, cardId) {
    // 이미 3장 뽑았거나 현재 카드가 이미 뒤집힌 경우 무시
    if (selectedCards.length >= 3 || cardElem.classList.contains('flipped')) {
        return;
    }
    
    // 카드 뒤집기
    cardElem.classList.add('flipped');
    cardElem.classList.add('disabled');
    
    selectedCards.push(cardId);
    
    // 상단 카운트 업데이트
    document.getElementById('select-count').innerText = selectedCards.length;
    
    if (selectedCards.length === 3) {
        // 모든 카드 클릭 방지
        const allCards = document.querySelectorAll('.tarot-card');
        allCards.forEach(card => card.classList.add('disabled'));
        
        // 1초 후 모달 팝업
        setTimeout(() => {
            showResult();
        }, 1000);
    }
}

function showResult() {
    const modal = document.getElementById('result-modal');
    
    // 뽑은 카드 3장
    const pastId = selectedCards[0];
    const presentId = selectedCards[1];
    const futureId = selectedCards[2];
    
    const pastData = tarotDataList.find(item => item.id === pastId);
    const presentData = tarotDataList.find(item => item.id === presentId);
    const futureData = tarotDataList.find(item => item.id === futureId);

    // 카드 이미지 세팅 함수
    const setCardImg = (slotName, id, data) => {
        const wrapper = document.getElementById(`res-card-${slotName}`);
        if (!wrapper) return;
        wrapper.innerHTML = '';
        
        const img = document.createElement('img');
        img.src = `images/${id}.jpg`;
        img.onerror = () => {
            img.style.display = 'none';
            const fallbackText = document.createElement('div');
            fallbackText.className = 'fallback-title';
            fallbackText.innerHTML = data && data.name ? data.name : `Card ${id}`;
            wrapper.appendChild(fallbackText);
            fallbackText.style.display = 'flex';
        };
        wrapper.appendChild(img);
        
        // 영문 이름 라벨 추가 (SF 홀로그램 느낌)
        const labelText = data ? (data.enName || data.name) : `CARD ${id}`;
        const nameLabel = document.createElement('div');
        nameLabel.className = 'card-name-label';
        nameLabel.innerHTML = labelText;
        wrapper.appendChild(nameLabel);
    };

    if (pastData) setCardImg('past', pastId, pastData);
    if (presentData) setCardImg('present', presentId, presentData);
    if (futureData) setCardImg('future', futureId, futureData);

    // 묶어서 하나로 설명하는 통합 텍스트
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
                "과거는 당신의 기초를 다졌고, 현재는 당신이 선택할 수 있는 기회의 시간입니다.<br>위의 조언을 바탕으로 당신만의 찬란한 미래를 그려나가시길 바랍니다."
            </p>
        `;
    }
    
    // 모달 표시
    modal.classList.add('active');
}

function restartGame() {
    // 모달 닫기
    const modal = document.getElementById('result-modal');
    modal.classList.remove('active');
    
    // 데이터 초기화
    selectedCards = [];
    document.getElementById('select-count').innerText = 0;
    
    // 약간의 딜레이 후 다시 렌더링
    setTimeout(() => {
        initApp();
    }, 500);
}
