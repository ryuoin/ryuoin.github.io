document.addEventListener('DOMContentLoaded', () => {
    initApp();
});
let selectedCards = [];
let deck = [];
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
function handleCardClick(cardElem, cardId) {
    if (selectedCards.length >= 3 || cardElem.classList.contains('flipped')) return;
    cardElem.classList.add('flipped');
    cardElem.classList.add('disabled');
    selectedCards.push(cardId);
    document.getElementById('select-count').innerText = selectedCards.length;
    if (selectedCards.length === 3) {
        document.querySelectorAll('.tarot-card').forEach(card => card.classList.add('disabled'));
        setTimeout(() => { showResult(); }, 1000);
    }
}
function showResult() {
    const modal = document.getElementById('result-modal');
    const pastData = tarotDataList.find(item => item.id === selectedCards[0]);
    const presentData = tarotDataList.find(item => item.id === selectedCards[1]);
    const futureData = tarotDataList.find(item => item.id === selectedCards[2]);
    const setCardImg = (slotName, id, data) => {
        const wrapper = document.getElementById(`res-card-${slotName}`);
        if (!wrapper) return;
        wrapper.innerHTML = '';
        const img = document.createElement('img');
        img.onerror = () => {
            if (img.src.endsWith('.png')) {
                img.src = `images/${id}.jpg`;
            } else {
                img.style.display = 'none';
                const ft = document.createElement('div');
                ft.className = 'fallback-title';
                ft.innerHTML = data && data.name ? data.name : `Card ${id}`;
                wrapper.appendChild(ft);
                ft.style.display = 'flex';
            }
        };
        img.src = `images/${id}.png`;
        wrapper.appendChild(img);
        const nameLabel = document.createElement('div');
        nameLabel.className = 'card-name-label';
        nameLabel.innerHTML = data ? (data.enName || data.name) : `CARD ${id}`;
        wrapper.appendChild(nameLabel);
    };
    if (pastData) setCardImg('past', selectedCards[0], pastData);
    if (presentData) setCardImg('present', selectedCards[1], presentData);
    if (futureData) setCardImg('future', selectedCards[2], futureData);
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
    modal.classList.add('active');
}
function restartGame() {
    document.getElementById('result-modal').classList.remove('active');
    selectedCards = [];
    document.getElementById('select-count').innerText = 0;
    setTimeout(() => { initApp(); }, 500);
}

window.onload = init;
