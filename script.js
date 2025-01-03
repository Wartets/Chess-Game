const chessBoard = document.getElementById('chess-board');
const statusText = document.getElementById('status');
const restartButton = document.getElementById('restart-game');
const setupButton = document.getElementById('setup-board');
const rowsInput = document.getElementById('rows');
const columnsInput = document.getElementById('columns');
const finishSetupButton = document.getElementById('finish-setup');
const fischerRandomButton = document.getElementById('fischer-random-button');
const defaultSetupButton = document.getElementById('default-setup-button');
const capablancaRandomButton = document.getElementById('capablanca-random-button');
const transcendentalButton = document.getElementById('transcendental-button');
const randomSetupButton = document.getElementById('random-setup-button');

const pieceSymbols = {
	'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙', 'C': 'ℂ', 'E': '𝔼',
	'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟', 'c': '𝐂', 'e': '𝐄'
};

const initialBoard = [
	['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
	['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
	['', '', '', '', '', '', '', ''],
	['', '', '', '', '', '', '', ''],
	['', '', '', '', '', '', '', ''],
	['', '', '', '', '', '', '', ''],
	['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
	['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
];

let RowN = initialBoard.length;
let ColN = initialBoard[0].length;

document.documentElement.style.setProperty('--a', ColN);
document.documentElement.style.setProperty('--b', RowN);

let board = JSON.parse(JSON.stringify(initialBoard));
let lastSetupBoard = null;

let selectedCell = null;
let currentPlayer = 'white';
let isSetupMode = false;

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
        restartButton.style.display = 'none';
        statusText.textContent = 'Setup mode: Click on cells to place pieces. Click "Finish Setup" to start.';
        return;
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
    restartButton.style.display = 'inline-block';
	
    currentPlayer = 'white';

    statusText.textContent = 'Game setup complete! Click on pieces to start playing.';
    createBoard();
});

fischerRandomButton.addEventListener('click', () => {
    setupFischerRandom();
});

function createBoard() {
    chessBoard.innerHTML = '';

    const minRow = Math.min(...Object.keys(board).map(Number));
    const maxRow = Math.max(...Object.keys(board).map(Number));

    const minCol = Math.min(...[].concat(...Object.values(board).map(row => Object.keys(row).map(Number))));
    const maxCol = Math.max(...[].concat(...Object.values(board).map(row => Object.keys(row).map(Number))));

    for (let row = 0; row < RowN; row++) {
        for (let col = 0; col < ColN; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');
            cell.dataset.row = row;
            cell.dataset.col = col;

            const piece = (board[row] && board[row][col]) || '';
            if (piece) {
                cell.textContent = pieceSymbols[piece];
            }

            cell.addEventListener('click', () => handleCellClick(row, col));
            chessBoard.appendChild(cell);
        }
    }
}

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
}

function isThreatened(row, col, player) {
	const opponent = player === 'white' ? 'black' : 'white';

	for (let r = 0; r < RowN; r++) {
		for (let c = 0; c < ColN; c++) {
			const piece = board[r][c];
			if (piece && isOpponentPiece(player, piece)) {
				if (isValidMove(r, c, row, col)) {
					return true;
				}
			}
		}
	}

	return false;
}

function highlightValidMoves(row, col) {
	const piece = board[row][col];

	document.querySelectorAll('.cell').forEach(cell => {
		cell.classList.remove('selected', 'valid-move');
	});

	const selectedCellElement = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
	if (selectedCellElement) {
		selectedCellElement.classList.add('selected');
	}

	for (let toRow = 0; toRow < RowN; toRow++) {
		for (let toCol = 0; toCol < ColN; toCol++) {
			if (isValidMove(row, col, toRow, toCol)) {
				const validCellElement = document.querySelector(`.cell[data-row="${toRow}"][data-col="${toCol}"]`);
				if (validCellElement) {
					validCellElement.classList.add('valid-move');
				}
			}
		}
	}
}

function handleCellClick(row, col) {
    if (isSetupMode) {
        if (row < 0 || row >= RowN || col < 0 || col >= ColN) return;

        const currentPiece = board[row][col];
        const nextPiece = prompt(`Enter piece symbol:\nP for pawn, R for rook, N for knight, B for bishop, Q for queen, K for king, C for Cardinal, E for Elephant or leave empty to clear.\nLowercase for black and uppercase for white`);

        if (nextPiece === null) return;
        board[row][col] = nextPiece.trim() || '';
        createBoard();
    } else {
        const piece = (board[row] && board[row][col]) || '';

        if (selectedCell) {
            const [fromRow, fromCol] = selectedCell;

            if (isValidMove(fromRow, fromCol, row, col)) {
                movePiece(fromRow, fromCol, row, col);
                switchPlayer();
            } else {
                statusText.textContent = `Invalid move for ${currentPlayer}`;
            }

            selectedCell = null;
            createBoard();
        } else if (piece && isCurrentPlayerPiece(piece)) {
            selectedCell = [row, col];
            highlightValidMoves(row, col);
            statusText.textContent = `Selected ${pieceSymbols[piece]} at ${RowN - row}${'abcdefgh'[col % ColN]}`;
        } else {
            statusText.textContent = 'Select a valid piece to move';
        }
    }
}

function isValidMove(fromRow, fromCol, toRow, toCol) {
    if (toRow < 0 || toRow >= RowN || toCol < 0 || toCol >= ColN) return false;

    const piece = board[fromRow][fromCol];
    const target = board[toRow][toCol];

    if (target && isCurrentPlayerPiece(target)) return false;

    const rowDiff = toRow - fromRow;
    const colDiff = toCol - fromCol;

    switch (piece.toLowerCase()) {
        case 'p': { // Pion
            const direction = piece === 'P' ? -1 : 1;
            const startRow = piece === 'P' ? RowN - 2 : 1;

            if (toCol === fromCol && !target) {
                if (toRow === fromRow + direction) return true;
                if (fromRow === startRow && toRow === fromRow + 2 * direction && !board[fromRow + direction][toCol]) return true;
            }

            if (Math.abs(toCol - fromCol) === 1 && toRow === fromRow + direction && target) {
                return true;
            }
            break;
        }
        case 'r': { // Tour
            if (rowDiff === 0 || colDiff === 0) {
                return isPathClear(fromRow, fromCol, toRow, toCol);
            }
            break;
        }
        case 'n': { // Cavalier
            if ((Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 1) ||
                (Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 2)) {
                return true;
            }
            break;
        }
        case 'b': { // Fou
            if (Math.abs(rowDiff) === Math.abs(colDiff)) {
                return isPathClear(fromRow, fromCol, toRow, toCol);
            }
            break;
        }
        case 'q': { // Reine
            if (rowDiff === 0 || colDiff === 0 || Math.abs(rowDiff) === Math.abs(colDiff)) {
                return isPathClear(fromRow, fromCol, toRow, toCol);
            }
            break;
        }
        case 'k': { // Roi
            if (Math.abs(rowDiff) <= 1 && Math.abs(colDiff) <= 1) {
                if (!isInCheckAfterMove(fromRow, fromCol, toRow, toCol)) {
                    return true;
                }
            }
            break;
        }
		case 'c': { // Princess/Archbishop/Cardinal/Dragon
			if (
				(Math.abs(rowDiff) === Math.abs(colDiff) && isPathClear(fromRow, fromCol, toRow, toCol)) || // Mouvement du Fou
				((Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 1) || (Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 2)) // Mouvement du Cavalier
			) {
				return true;
			}
			break;
		}
		case 'e': { // Elephant/Empress/Chancellor
			if (
				(rowDiff === 0 || colDiff === 0 && isPathClear(fromRow, fromCol, toRow, toCol)) || // Mouvement de la tour
				((Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 1) || (Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 2)) // Mouvement du cavalier
			) {
				return true;
			}
			break;
		}
    }

    return false;
}


function isPathClear(fromRow, fromCol, toRow, toCol) {
    const rowStep = Math.sign(toRow - fromRow);
    const colStep = Math.sign(toCol - fromCol);
    let currentRow = fromRow + rowStep;
    let currentCol = fromCol + colStep;

    while ((currentRow !== toRow || currentCol !== toCol) &&
           currentRow >= 0 && currentRow < RowN &&
           currentCol >= 0 && currentCol < ColN) {
        if (board[currentRow][currentCol]) return false;
        currentRow += rowStep;
        currentCol += colStep;
    }

    return true;
}


function movePiece(fromRow, fromCol, toRow, toCol) {
    if (!board[toRow]) board[toRow] = {};
    board[toRow][toCol] = board[fromRow][fromCol];
    delete board[fromRow][fromCol];
    if (Object.keys(board[fromRow]).length === 0) delete board[fromRow];
}

function isInCheck(player) {
	const kingPosition = findKing(player);
	if (!kingPosition) return false;

	for (let row = 0; row < RowN; row++) {
		for (let col = 0; col < ColN; col++) {
			const piece = board[row][col];
			if (piece && isOpponentPiece(player, piece)) {
				if (isValidMove(row, col, kingPosition[0], kingPosition[1])) {
					return true;
				}
			}
		}
	}

	return false;
}

function isInCheckAfterMove(fromRow, fromCol, toRow, toCol) {
	const originalFrom = board[fromRow][fromCol];
	const originalTo = board[toRow][toCol];

	movePiece(fromRow, fromCol, toRow, toCol);
	const inCheck = isInCheck(currentPlayer);
	board[fromRow][fromCol] = originalFrom;
	board[toRow][toCol] = originalTo;

	return inCheck;
}

function findKing(player) {
	const king = player === 'white' ? 'K' : 'k';
	for (let row = 0; row < RowN; row++) {
		for (let col = 0; col < ColN; col++) {
			if (board[row][col] === king) return [row, col];
		}
	}
	return null;
}

function isOpponentPiece(player, piece) {
	return (player === 'white' && piece === piece.toLowerCase()) ||
		   (player === 'black' && piece === piece.toUpperCase());
}

function checkCheckmate() {
	for (let fromRow = 0; fromRow < RowN; fromRow++) {
		for (let fromCol = 0; fromCol < ColN; fromCol++) {
			const piece = board[fromRow][fromCol];
			if (piece && isCurrentPlayerPiece(piece)) {
				for (let toRow = 0; toRow < RowN; toRow++) {
					for (let toCol = 0; toCol < ColN; toCol++) {
						if (isValidMove(fromRow, fromCol, toRow, toCol)) {
							const originalFrom = board[fromRow][fromCol];
							const originalTo = board[toRow][toCol];

							movePiece(fromRow, fromCol, toRow, toCol);
							const inCheck = isInCheck(currentPlayer);
							board[fromRow][fromCol] = originalFrom;
							board[toRow][toCol] = originalTo;

							if (!inCheck) {
								return false;
							}
						}
					}
				}
			}
		}
	}
	return true;
}

function isCurrentPlayerPiece(piece) {
	return (currentPlayer === 'white' && piece === piece.toUpperCase()) ||
		   (currentPlayer === 'black' && piece === piece.toLowerCase());
}

function switchPlayer() {
	if (isInCheck(currentPlayer)) {
		if (checkCheckmate()) {
			statusText.textContent = `${currentPlayer} is in checkmate! Game over.`;
			return;
		}
		statusText.textContent = `${currentPlayer} is in check!`;
	} else {
		if (checkCheckmate()) {
			statusText.textContent = `${currentPlayer} is in stalemate! Game over.`;
			return;
		}
	}

	currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
	statusText.textContent = `${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}'s turn`;
}


function restartGame() {
    if (lastSetupBoard) {
        board = JSON.parse(JSON.stringify(lastSetupBoard));
    } else {
        board = JSON.parse(JSON.stringify(initialBoard));
    }
    selectedCell = null;
    currentPlayer = 'white';
    statusText.textContent = 'Game restarted! White to play.';
    createBoard();
}

restartButton.addEventListener('click', () => {
    isSetupMode = false;
    restartGame();
});

createBoard();
