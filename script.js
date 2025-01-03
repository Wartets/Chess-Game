const chessBoard = document.getElementById('chess-board');
const statusText = document.getElementById('status');
const restartButton = document.getElementById('restart-game');

const pieceSymbols = {
	'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
	'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
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
let selectedCell = null;
let currentPlayer = 'white';

function createBoard() {
    chessBoard.innerHTML = '';

    const minRow = Math.min(...Object.keys(board).map(Number));
    const maxRow = Math.max(...Object.keys(board).map(Number));

    const minCol = Math.min(...[].concat(...Object.values(board).map(row => Object.keys(row).map(Number))));
    const maxCol = Math.max(...[].concat(...Object.values(board).map(row => Object.keys(row).map(Number))));

    for (let row = minRow; row <= maxRow; row++) {
        for (let col = minCol; col <= maxCol; col++) {
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

function isValidMove(fromRow, fromCol, toRow, toCol) {
	const piece = board[fromRow][fromCol];
	const target = board[toRow][toCol];

	if (target && isCurrentPlayerPiece(target)) return false;

	const rowDiff = toRow - fromRow;
	const colDiff = toCol - fromCol;

	switch (piece.toLowerCase()) {
		case 'p': {
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
		case 'r': {
			if (rowDiff === 0 || colDiff === 0) {
				return isPathClear(fromRow, fromCol, toRow, toCol);
			}
			break;
		}
		case 'n': {
			if ((Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 1) ||
				(Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 2)) {
				return true;
			}
			break;
		}
		case 'b': {
			if (Math.abs(rowDiff) === Math.abs(colDiff)) {
				return isPathClear(fromRow, fromCol, toRow, toCol);
			}
			break;
		}
		case 'q': {
			if (rowDiff === 0 || colDiff === 0 || Math.abs(rowDiff) === Math.abs(colDiff)) {
				return isPathClear(fromRow, fromCol, toRow, toCol);
			}
			break;
		}
		case 'k': {
			if (Math.abs(rowDiff) <= 1 && Math.abs(colDiff) <= 1) {
				if (!isInCheckAfterMove(fromRow, fromCol, toRow, toCol)) {
					return true;
				}
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

	while (currentRow !== toRow || currentCol !== toCol) {
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
    // board = {};
    for (let row = 0; row < RowN; row++) {
        board[row] = {};
        for (let col = 0; col < ColN; col++) {
            if (initialBoard[row][col]) {
                board[row][col] = initialBoard[row][col];
            }
        }
    }
	selectedCell = null;
	currentPlayer = 'white';
	statusText.textContent = 'Welcome to Chess!';
	createBoard();
}

restartButton.addEventListener('click', restartGame);
createBoard();
