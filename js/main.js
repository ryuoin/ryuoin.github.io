document.addEventListener('DOMContentLoaded', () => {
        initApp();
});

let selectedCards = [];
let deck = [];

// Fisher-Yates shuffle algorithm
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
        // MAJOR ARCANA (0-21)
    deck = Array.from({ length: 22 }, (_, i) => i);
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
                // PNG first, fallback to JPG
                         img.src = `images/${cardId}.png`;

                         img.onerror = () => {
                                         if (img.src.includes('.png')) {
                                                             img.src = `images/${cardId}.jpg`;
                                         } else {
                                                             img.style.display = 'none';
                                                             const fallbackText = document.createElement('div');
                                                             fallbackText.className = 'card-fallback-text';
                                                             fallbackText.innerText = tarotData[cardId].name;
                                                             cardReveal.appendChild(fallbackText);
                                         }
                         };

                         cardReveal.appendChild(img);
                cardInner.appendChild(cardCover);
                cardInner.appendChild(cardReveal);
                cardElem.appendChild(cardInner);

                         cardElem.addEventListener('click', handleCardClick);
                container.appendChild(cardElem);
    });
}
function handleCardClick(e) {
        const cardElem = e.currentTarget;
        if (selectedCards.length >= 3 || cardElem.classList.contains('flipped')) return;

    cardElem.classList.add('flipped');
        const cardId = parseInt(cardElem.dataset.id);
        selectedCards.push(cardId);

    if (selectedCards.length === 3) {
                setTimeout(showResult, 600);
    }
}

function showResult() {
        const resultArea = document.getElementById('result-area');
        const cardsInfo = document.getElementById('cards-info');
        const conclusion = document.getElementById('conclusion-text');

    cardsInfo.innerHTML = '';

    selectedCards.forEach((id, i) => {
                const item = document.createElement('div');
                item.className = 'result-item';

                                  const titleText = ['Present/Cause', 'Process/Advice', 'Result/Future'][i];
                const card = tarotData[id];

                                  item.innerHTML = `
                                              <h3>${titleText}: ${card.name}</h3>
                                                          <div class="result-card-img"></div>
                                                                      <p><strong>Keywords:</strong> ${card.keywords.join(', ')}</p>
                                                                                  <p>${card.description}</p>
                                                                                          `;

                                  const imgContainer = item.querySelector('.result-card-img');
                setCardImg(imgContainer, id);

                                  cardsInfo.appendChild(item);
    });

    conclusion.innerText = "The cards you selected represent your current situation and future possibilities. Trust your intuition and move forward.";
        resultArea.classList.remove('hidden');

    window.scrollTo({
                top: resultArea.offsetTop - 20,
                behavior: 'smooth'
    });
}
function setCardImg(container, cardId) {
        const img = document.createElement('img');
        img.src = `images/${cardId}.png`;
        img.onerror = () => {
                    if (img.src.includes('.png')) {
                                    img.src = `images/${cardId}.jpg`;
                    } else {
                                    container.innerText = tarotData[cardId].name;
                    }
        };
        container.appendChild(img);
}

function restartGame() {
        selectedCards = [];
        document.getElementById('result-area').classList.add('hidden');

    const cards = document.querySelectorAll('.tarot-card');
        cards.forEach(card => card.classList.remove('flipped'));

    setTimeout(() => {
                shuffleArray(deck);
                renderCards();
    }, 400);
}
