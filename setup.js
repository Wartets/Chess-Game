const fischerRandomButton = document.getElementById('fischer-random-button');
const defaultSetupButton = document.getElementById('default-setup-button');
const capablancaRandomButton = document.getElementById('capablanca-random-button');
const transcendentalButton = document.getElementById('transcendental-button');
const randomSetupButton = document.getElementById('random-setup-button');
const finishSetupButton = document.getElementById('finish-setup');

const moveHistoryElement = document.getElementById('move-history');

const setupButton = document.getElementById('setup-board');

defaultSetupButton.addEventListener('click', () => {
    setupDefault();
});

capablancaRandomButton.addEventListener('click', () => {
    setupCapablancaRandom();
});

transcendentalButton.addEventListener('click', () => {
    setupTranscendental();
});

randomSetupButton.addEventListener('click', () => {
    setupRandomBoard();
});

setupButton.addEventListener('click', () => {
    const newRowN = parseInt(rowsInput.value, 10);
    const newColN = parseInt(columnsInput.value, 10);

    if (newRowN === RowN && newColN === ColN) {
        isSetupMode = true;
        setupButton.style.display = 'none';
        finishSetupButton.style.display = 'inline-block';
        defaultSetupButton.style.display = 'inline-block';
		fischerRandomButton.style.display = 'inline-block';
		capablancaRandomButton.style.display = 'inline-block';
		transcendentalButton.style.display = 'inline-block';
		randomSetupButton.style.display = 'inline-block';
		moveHistoryElement.style.display = 'none';
        restartButton.style.display = 'none';
        statusText.textContent = 'Setup mode: Click on cells to place pieces. Click "Finish Setup" to start.';
        return;
    }
	else {
		moveHistory = [];
		moveHistoryElement.innerHTML = '';
	}

    RowN = newRowN;
    ColN = newColN;

    document.documentElement.style.setProperty('--a', ColN);
    document.documentElement.style.setProperty('--b', RowN);

    board = Array.from({ length: RowN }, () => Array(ColN).fill(''));
    isSetupMode = true;
    createBoard();

    setupButton.style.display = 'none';
    finishSetupButton.style.display = 'inline-block';
	defaultSetupButton.style.display = 'inline-block';
	fischerRandomButton.style.display = 'inline-block';
	capablancaRandomButton.style.display = 'inline-block';
	transcendentalButton.style.display = 'inline-block';
	randomSetupButton.style.display = 'inline-block';
	moveHistoryElement.style.display = 'none';
    restartButton.style.display = 'none';
    statusText.textContent = 'Setup mode: Click on cells to place pieces. Click "Finish Setup" to start.';
});

finishSetupButton.addEventListener('click', () => {
    isSetupMode = false;
	
    lastSetupBoard = JSON.parse(JSON.stringify(board));

    setupButton.style.display = 'inline-block';
    finishSetupButton.style.display = 'none';
	defaultSetupButton.style.display = 'none';
	fischerRandomButton.style.display = 'none';
	capablancaRandomButton.style.display = 'none';
	transcendentalButton.style.display = 'none';
	randomSetupButton.style.display = 'none';
	moveHistoryElement.style.display = 'inline-block';
    restartButton.style.display = 'inline-block';
	
    currentPlayer = 'white';

    statusText.textContent = 'Game setup complete! Click on pieces to start playing.';
    createBoard();
	checkMoveHistory();
});

fischerRandomButton.addEventListener('click', () => {
    setupFischerRandom();
});

function setupRandomBoard() {
    const allPieces = [
        'K', 'Q', 'R', 'B', 'N', 'P', 'k', 'q', 'r', 'b', 'n', 'p', '', ''
    ];

    let randomBoard = Array.from({ length: RowN }, () => Array(ColN).fill(''));

    let pieces = [];
    let numWhiteKings = 0;
    let numBlackKings = 0;

    while (pieces.length < RowN * ColN) {
        let piece = allPieces[Math.floor(Math.random() * allPieces.length)];
        
        if (piece === 'K' && numWhiteKings < 1) {
            pieces.push('K');
            numWhiteKings++;
        } else if (piece === 'k' && numBlackKings < 1) {
            pieces.push('k');
            numBlackKings++;
        } else if (piece !== 'K' && piece !== 'k') {
            pieces.push(piece);
        }
    }

    pieces = pieces.sort(() => Math.random() - 0.5);

    let pieceIndex = 0;
    for (let row = 0; row < RowN; row++) {
        for (let col = 0; col < ColN; col++) {
            randomBoard[row][col] = pieces[pieceIndex];
            pieceIndex++;
        }
    }

    board = randomBoard;
    createBoard();
    statusText.textContent = 'Random setup complete. White to play!';
	
	moveHistory = [];
	moveHistoryElement.innerHTML = '';
}

function setupDefault() {
    board = JSON.parse(JSON.stringify(initialBoard));
    RowN = 8;
    ColN = 8;
    document.documentElement.style.setProperty('--a', ColN);
    document.documentElement.style.setProperty('--b', RowN);

    currentPlayer = 'white';
    selectedCell = null;
    statusText.textContent = 'Default setup complete. White to play!';
    createBoard();
	
	moveHistory = [];
	moveHistoryElement.innerHTML = '';
}

function setupFischerRandom() {
    const pieces = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];

    let shuffledPieces;
    do {
        shuffledPieces = [...pieces].sort(() => Math.random() - 0.5);
    } while (!isValidFischerSetup(shuffledPieces));

    board = Array.from({ length: 8 }, () => Array(8).fill(''));
    board[0] = shuffledPieces.map(piece => piece.toLowerCase());
    board[1] = Array(8).fill('p');
    board[6] = Array(8).fill('P');
    board[7] = shuffledPieces.map(piece => piece.toUpperCase());

    RowN = 8;
    ColN = 8;
    document.documentElement.style.setProperty('--a', ColN);
    document.documentElement.style.setProperty('--b', RowN);

    currentPlayer = 'white';
    selectedCell = null;
    statusText.textContent = 'Fischer Random setup complete. White to play!';
    createBoard();
	
	moveHistory = [];
	moveHistoryElement.innerHTML = '';
}

function isValidFischerSetup(pieces) {
    const kingIndex = pieces.indexOf('K');
    const rookIndices = [pieces.indexOf('R'), pieces.lastIndexOf('R')];
    const bishopIndices = pieces
        .map((piece, index) => (piece === 'B' ? index : -1))
        .filter(index => index !== -1);

    if (!(rookIndices[0] < kingIndex && kingIndex < rookIndices[1])) return false;

    if ((bishopIndices[0] % 2) === (bishopIndices[1] % 2)) return false;

    return true;
}

function setupCapablancaRandom() {
    const pieces = ['R', 'N', 'B', 'Q', 'K', 'C', 'E', 'B', 'N', 'R'];
    let shuffledPieces;

    do {
        shuffledPieces = [...pieces].sort(() => Math.random() - 0.5);
    } while (!isValidCapablancaSetup(shuffledPieces));

    board = Array.from({ length: 8 }, () => Array(10).fill(''));
    board[0] = shuffledPieces.map(piece => piece.toLowerCase());
    board[1] = Array(10).fill('p');
    board[6] = Array(10).fill('P');
    board[7] = shuffledPieces.map(piece => piece.toUpperCase());

    RowN = 8;
    ColN = 10;
    document.documentElement.style.setProperty('--a', ColN);
    document.documentElement.style.setProperty('--b', RowN);

    currentPlayer = 'white';
    selectedCell = null;
    statusText.textContent = 'Capablanca Random setup complete. White to play!';
    createBoard();
	
	moveHistory = [];
	moveHistoryElement.innerHTML = '';
}

function isValidCapablancaSetup(pieces) {
    const kingIndex = pieces.indexOf('K');
    const rookIndices = [pieces.indexOf('R'), pieces.lastIndexOf('R')];
    const bishopIndices = pieces
        .map((piece, index) => (piece === 'B' ? index : -1))
        .filter(index => index !== -1);

    const centaurIndex = pieces.indexOf('C');
    const queenIndex = pieces.indexOf('Q');

    if (!(rookIndices[0] < kingIndex && kingIndex < rookIndices[1])) return false;
    if ((bishopIndices[0] % 2) === (bishopIndices[1] % 2)) return false;
    if ((queenIndex % 2) === (centaurIndex % 2)) return false;

    return true;
}

function setupTranscendental() {
    const pieces = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'];
    const generateRow = () => {
        let shuffledPieces;
        do {
            shuffledPieces = [...pieces].sort(() => Math.random() - 0.5);
        } while ((shuffledPieces.indexOf('B') % 2) === (shuffledPieces.lastIndexOf('B') % 2));
        return shuffledPieces;
    };

    board = Array.from({ length: 8 }, () => Array(8).fill(''));
    board[0] = generateRow().map(piece => piece.toLowerCase());
    board[1] = Array(8).fill('p');
    board[6] = Array(8).fill('P');
    board[7] = generateRow().map(piece => piece.toUpperCase());

    RowN = 8;
    ColN = 8;
    document.documentElement.style.setProperty('--a', ColN);
    document.documentElement.style.setProperty('--b', RowN);

    currentPlayer = 'white';
    selectedCell = null;
    statusText.textContent = 'Transcendental setup complete. White to play!';
    createBoard();
	
	moveHistory = [];
	moveHistoryElement.innerHTML = '';
}

function checkMoveHistory() {
	const moveHistory = document.getElementById('move-history');
	
	if (moveHistory && moveHistory.innerHTML.trim() === '') {
		moveHistory.style.display = 'none';
	} else {
		moveHistory.style.display = 'block';
	}
}