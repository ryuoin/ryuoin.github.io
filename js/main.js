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
    deck = Array.from({length: 22}, (_, i) => i);
    shuffleArray(deck);
    renderCards();
    document.getElementById('btn-restart').addEventListener('click', restartGame);
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
function handleCardClick(cardElem, cardId) {
    if (selectedCards.length >= 3 || cardElem.classList.contains('flipped')) {
        return;
    }
    
    cardElem.classList.add('flipped');
    cardElem.classList.add('disabled');
    selectedCards.push(cardId);
    
    document.getElementById('select-count').innerText = selectedCards.length;
    
    if (selectedCards.length === 3) {
        const allCards = document.querySelectorAll('.tarot-card');
        allCards.forEach(card => card.classList.add('disabled'));
        
        setTimeout(() => {
            showResult();
        }, 1000);
    }
}
function showResult() {
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
function restartGame() {
    const modal = document.getElementById('result-modal');
    modal.classList.remove('active');
    selectedCards = [];
    document.getElementById('select-count').innerText = 0;
    
    setTimeout(() => {
        initApp();
    }, 500);
}
