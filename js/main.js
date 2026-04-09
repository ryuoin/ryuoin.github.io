// Tarot App Main Logic
let selectedCards = [];
const deck = Object.keys(tarotData);

function init() {
            shuffleArray(deck);
            renderCards();
            document.getElementById('btn-restart').onclick = restartGame;
}

function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                            const j = Math.floor(Math.random() * (i + 1));
                            [array[i], array[j]] = [array[j], array[i]];
            }
}

function renderCards() {
            const container = document.getElementById('card-container');
            container.innerHTML = '';
            deck.forEach(cardId => {
                            const cardEl = document.createElement('div');
                            cardEl.className = 'tarot-card';
                            cardEl.innerHTML = `
                                        <div class="card-inner">
                                                        <div class="card-cover"></div>
                                                                        <div class="card-reveal">
                                                                                            <img src="images/${cardId}.png" alt="${tarotData[cardId].name}" onerror="handleImageError(this, '${cardId}')">
                                                                                                                <div class="fallback-title">${tarotData[cardId].name}</div>
                                                                                                                                    <div class="card-name-label">${tarotData[cardId].name}</div>
                                                                                                                                                    </div>
                                                                                                                                                                </div>
                                                                                                                                                                        `;
                            cardEl.onclick = () => flipCard(cardId, cardEl);
                            container.appendChild(cardEl);
            });
}

function handleImageError(img, cardId) {
            if (img.src.includes('.png')) {
                            img.src = "images/" + cardId + ".jpg";
            } else {
                            img.style.display = 'none';
                            img.nextElementSibling.style.display = 'flex';
            }
}

function flipCard(cardId, element) {
            if (selectedCards.length >= 3 || element.classList.contains('flipped')) return;
            element.classList.add('flipped');
            selectedCards.push(cardId);
            document.getElementById('select-count').innerText = selectedCards.length;
            if (selectedCards.length === 3) setTimeout(showResult, 800);
}

function showResult() {
            const modal = document.getElementById('result-modal');
            const slots = ['res-card-past', 'res-card-present', 'res-card-future'];
            const descBox = document.getElementById('res-desc-combined');
            const labels = ['Past (Cause)', 'Present (Situation)', 'Future (Advice)'];
            let combinedHtml = '';
            selectedCards.forEach((id, i) => {
                            const card = tarotData[id];
                            document.getElementById(slots[i]).innerHTML =
                                                '<div class="res-card-wrapper">' +
                                                '<img src="images/' + id + '.png" alt="' + card.name + '" onerror="handleImageError(this, \'' + id + '\')">' +
                                                '<div class="fallback-title">' + card.name + '</div>' +
                                                '</div>';
                            combinedHtml +=
                                                '<div class="reading-section">' +
                                                '<h3><span class="card-name-highlight">' + labels[i] + ': ' + card.name + '</span></h3>' +
                                                '<p><strong>Keywords:</strong> ' + card.keyword + '</p>' +
                                                '<p>' + card.description + '</p>' +
                                                '</div>';
            });
            descBox.innerHTML = combinedHtml;
            modal.classList.add('active');
}

function restartGame() {
            selectedCards = [];
            document.getElementById('result-modal').classList.remove('active');
            document.getElementById('select-count').innerText = '0';
            document.querySelectorAll('.tarot-card').forEach(card => card.classList.remove('flipped'));
            setTimeout(() => { shuffleArray(deck); renderCards(); }, 500);
}

window.onload = init;
