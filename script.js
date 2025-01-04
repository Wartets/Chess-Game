const chessBoard = document.getElementById('chess-board');
const statusText = document.getElementById('status');
const restartButton = document.getElementById('restart-game');
const rowsInput = document.getElementById('rows');
const columnsInput = document.getElementById('columns');

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
let moveHistory = [];
let selectedCell = null;
let currentPlayer = 'white';
let isSetupMode = false;

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
    updateMoveHistory();
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
				const piece = board[row][col];
				if (piece.toLowerCase() === 'k' && isThreatened(toRow, toCol, currentPlayer)) {
					continue;
				}
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
				const capturedPiece = board[row][col] || null;
				const movingPiece = board[fromRow][fromCol];
				recordMove(fromRow, fromCol, row, col, movingPiece, capturedPiece);
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
	
    const pawnAttackOffsets = (player === 'white') ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]];
	
    for (let [dr, dc] of pawnAttackOffsets) {
        const attackerRow = row + dr;
        const attackerCol = col + dc;
        if (attackerRow >= 0 && attackerRow < RowN && attackerCol >= 0 && attackerCol < ColN) {
            const piece = board[attackerRow][attackerCol];
            if (piece && (player === 'white' ? piece === 'p' : piece === 'P')) {
                return true;
            }
        }
    }
	
    return false;
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
				return true;
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
	
    const piece = board[toRow][toCol];
    if ((piece === 'P' && toRow === 0) || (piece === 'p' && toRow === RowN - 1)) {
        const promotionPiece = prompt('Promote your pawn to (q for Queen, r for Rook, b for Bishop, n for Knight):').toUpperCase();
        if (['Q', 'R', 'B', 'N', 'E', 'C'].includes(promotionPiece)) {
            board[toRow][toCol] = currentPlayer === 'white' ? promotionPiece : promotionPiece.toLowerCase();
        } else {
            alert('Invalid promotion piece');
        }
    }
}

function isOpponentPiece(player, piece) {
	return (player === 'white' && piece === piece.toLowerCase()) ||
		   (player === 'black' && piece === piece.toUpperCase());
}

function isCurrentPlayerPiece(piece) {
	return (currentPlayer === 'white' && piece === piece.toUpperCase()) ||
		   (currentPlayer === 'black' && piece === piece.toLowerCase());
}

function switchPlayer() {
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

function recordMove(fromRow, fromCol, toRow, toCol, movingPiece, capturedPiece) {
    const move = {
        piece: `${movingPiece}`,
        from: `${RowN - fromRow}${'abcdefgh'[fromCol]}`,
        to: `${RowN - toRow}${'abcdefgh'[toCol]}`,
        captured: capturedPiece || null
    };
    moveHistory.push(move);
}

function updateMoveHistory() {
    moveHistoryElement.innerHTML = '';
    moveHistory.slice().reverse().forEach((move, index) => {
        const moveText = document.createElement('div');
        moveText.textContent = `${moveHistory.length - index}. ${pieceSymbols[move.piece]}: ${move.from} to ${move.to}` +
            (move.captured ? ` (${pieceSymbols[move.captured]})` : '');
        moveHistoryElement.appendChild(moveText);
    });
}

restartButton.addEventListener('click', () => {
	moveHistory = [];
    moveHistoryElement.innerHTML = '';
    isSetupMode = false;
    restartGame();
});

createBoard();
