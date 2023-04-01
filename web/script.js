const switches = document.querySelectorAll(".switch");
let activeSwitch = document.querySelector(".switch.active");
const squares = document.querySelectorAll(".square");
const outputTextarea = document.querySelector(".output");
const outputTextarea2 = document.querySelector(".output2");
let x = 0;
let y = 0;
let color = 0;

//Constants
const Player = Object.freeze({ White: false, Black: true });
const Direction = Object.freeze({ Up: [-1, 0], Down: [1, 0], Left: [-1, 0], Right: [1, 0] });
const State = Object.freeze({ Drop: "drop", Shift: "shift", Stop: "stop" });

/**
 * Converts 2D coordinates to 1D index.
 * @param {number} x - The x-coordinate.
 * @param {number} y - The y-coordinate.
 * @returns {number} - The 1D index.
 */
function coordToIndex(x, y) {
  return 6 * x + y;
}

/**
 * Converts 1D index to 2D coordinates.
 * @param {number} i - The index.
 * @returns {number[]} - The 2D coordinates as an array.
 */
function indexToCoord(i) {
  return [Math.floor(i / 6), i % 6];
}

// // Add click event listener to switches
// switches.forEach((switchElement) => {
//   switchElement.addEventListener("click", () => {
//     if (activeSwitch) {
//       activeSwitch.classList.remove("active");
//     }
//     activeSwitch = switchElement;
//     activeSwitch.classList.add("active");
//     if (activeSwitch.classList.contains("light")) {
//       color = 0;
//     } else if (activeSwitch.classList.contains("dark")) {
//       color = 1;
//     }
//     console.log(color);
//   });
// });

// Remove all child elements from squares
/**
 * Removes all pieces from the game board.
 */
function removeAllPieces() {
  document.querySelectorAll(".square").forEach((square) => {
    square.innerHTML = "";
  });
}

const removeAllButton = document.getElementById("remove-all");
removeAllButton.addEventListener("click", removeAllPieces);

/**
 * Returns the current state of the game board as a string.
 *
 * @param {NodeList} squares - The squares of the game board.
 * @returns {string} - The current state of the board as a string.
 */
function getBoardState(squares) {
  let text = "";
  squares.forEach((squareElement, index) => {
    let [x, y] = indexToCoord(index);
    for (let i = 0; i < squareElement.children.length; i++) {
      const child = squareElement.children[i];
      if (child.classList.contains("dark")) {
        text += "1";
      } else if (child.classList.contains("light")) {
        text += "0";
      }
    }
    text += "/";
  });
  return text;
}

// /**
//  * Adds a piece to the specified square when clicked, as long as the square is not already full.
//  *
//  * @param {Node} square - The square onto which a piece should be added.
//  */
// function addPieceOnClick(square) {
//   // Check if the square has less than 4 child elements
//   if (square.children.length < 4) {
//     // Create a new div element with the classes .child, .oval, and .light or .dark depending on the value of the color variable
//     const newDiv = document.createElement("div");
//     newDiv.classList.add("child", "oval", color ? "dark" : "light");
//     // Append the new div element to the clicked square
//     square.appendChild(newDiv);
//   }
// }

// Loop through each square element and add a click event listener
// squares.forEach((square) => {
//   square.addEventListener("click", () => {
//     // Call the addPieceOnClick function with the clicked square element as the argument
//     addPieceOnClick(square);
//     // Update the value of the outputTextarea element with the current state of the board
//     outputTextarea.value = getBoardState(squares);
//   });
// });

/**
 * Sets the board state based on the input text in outputTextarea.
 */
function setBoardState() {
  // split the input value at each "/" character
  const values = outputTextarea.value.trim().split("/");
  // clear the contents of all the squares
  removeAllPieces();
  squares.forEach((squareElement, index) => {
    // loop through each character in the corresponding values array
    for (let i = 0; i < values[index].length; i++) {
      // create a new div element with the appropriate class based on the character value
      const child = document.createElement("div");
      if (values[index][i] === "1") {
        child.classList.add("child", "oval", "dark");
      } else if (values[index][i] === "0") {
        child.classList.add("child", "oval", "light");
      }
      // append the new div element to the square element
      squareElement.appendChild(child);
    }
  });
}

outputTextarea.addEventListener("input", setBoardState);

// /**
//  * Removes a piece from the specified square.
//  *
//  * @param {number} row - The row containing the piece to be removed.
//  * @param {number} col - The column containing the piece to be removed.
//  */
// function removePiece(row, col) {
//   const square = squares[coordToIndex(row, col)];

//   // Check if the square has any child elements
//   if (square.children.length > 0) {
//     // Remove the last child element from the square
//     square.removeChild(square.lastChild);
//   }
// }

// Add click event listener to test button
// const testButton = document.querySelector(".test");
// testButton.addEventListener("click", () => {
//   // console.log([x, y]);
//   outputTextarea2.value = [x, y, color];
//   drawPiece(x, y, color);
// });

// const deletePieceButton = document.querySelector(".deletePiece");
// const deletePieceText = document.querySelector(".deletePieceText");
// deletePieceButton.addEventListener("click", () => {
//   const coordinates = deletePieceText.value.trim().split(",");
//   if (coordinates.length === 2) {
//     let row = parseInt(coordinates[0]);
//     let col = parseInt(coordinates[1]);
//     console.log(`x: ${row}, y: ${col}`);
//     removePiece(row, col);
//   }
// });


/**
 * Draws the pieces on the board based on the input game state.
 *
 * @param {number[][][]}
 The state of the game board.
  */
function drawBoard(board) {
  // remove all existing pieces from the board
  removeAllPieces();

  // loop through each position on the board
  for (let x = 0; x < 6; x++) {
    for (let y = 0; y < 6; y++) {
      for (let z = 0; z < board[x][y].length; z++) {
        drawPiece(x, y, board[x][y][z]);
      }
    }
  }
}

/**
 * Draws a piece on the board at the specified position with the specified color.
 *
 * @param {number} x - The x-coordinate of the piece.
 * @param {number} y - The y-coordinate of the piece.
 * @param {number} color - The color of the piece.
 */
function drawPiece(x, y, color) {
  // find the corresponding square element and create a new oval element
  const square = document.querySelectorAll(".square")[coordToIndex(x, y)];
  const piece = document.createElement("div");

  // add classes to the piece element for styling
  piece.classList.add("child", "oval", color ? "dark" : "light");

  // add the piece element to the square element
  square.appendChild(piece);
}

/**
 * Removes any event listeners from elements with class `square`.
 */
function removeSquareEventListeners() {
  const squares = document.querySelectorAll(".square");
  // clone each square and replace the original with the clone
  squares.forEach((squareElement) => {
    const clonedSquare = squareElement.cloneNode(true);
    squareElement.parentNode.replaceChild(clonedSquare, squareElement);
  });
}

/**
 * Removes any click event listeners from the pieces in the tower at the given position.
 *
 * @param {Game} game - The game object
 */
function removeShiftEventListeners(x, y) {
  // select all the pieces in the tower at position (x, y)
  const squares = document.querySelectorAll(".square");
  const pieceElements = squares[coordToIndex(x, y)].querySelectorAll(".child");

  // clone each piece and replace the original with the clone
  pieceElements.forEach((pieceElement) => {
    const clonedPiece = pieceElement.cloneNode(true);
    pieceElement.parentNode.replaceChild(clonedPiece, pieceElement);
  });
}

/**
 * Adds a click event listener to each square on the board where it is legal to drop a piece.
 * 
 * @param {Game} game - The game object
 */
function addDropEventListeners(game) {
  const squares = document.querySelectorAll(".square");
  squares.forEach((squareElement, index) => {
    let [x, y] = indexToCoord(index);

    if (game.isLegalDrop(x, y)) {
      squareElement.addEventListener('click', (event) => {
        game.addDrop(x, y);
        drawBoard(game.activeBoard);
        resetEventListeners(game);
        activateEndTurnButton(game);
      });
    }
  });
}

/**
   * Adds click event listeners to each relevant piece in the tower at the specified position,
   * for shifting it to an adjacent square.
   *
   * @param {Game} game - The game object
   */
function addShiftEventtListeners(game) {
  var [x, y] = game.activeSquare;
  const squares = document.querySelectorAll(".square");
  const pieceElements = squares[coordToIndex(x, y)].querySelectorAll(
    ".child"
  );
  var tower = game.activeBoard[x][y];
  for (let i = 1; i <= tower.length; i++) {
    if (tower[tower.length - i] === game.activePlayer) {
      pieceElements[tower.length - i].addEventListener("click", (event) => {
        console.log(`Clicked piece at ${x},${y},${i}`);
        removeSquareEventListeners();
        addOrthogonalEventListeners(game, i);
        addShiftEventtListeners(game);
      });
    } else {
      break;
    }
  }
}

/**
 * Adds click event listeners to all squares adjacent to the specified square
 * in orthogonal directions (up, down, left, right) that are legal moves for
 * the specified number of pieces.
 *
 * @param {Game} game - The game object
 * @param {number} n - The number of pieces to move.
 */
function addOrthogonalEventListeners(game, n) {
  var [x, y] = game.activeSquare;
  const squares = document.querySelectorAll(".square");
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for (const [dx, dy] of directions) {
    if (game.isLegalShift(n, [dx, dy])) {
      const square = squares[coordToIndex(x + dx, y + dy)];
      square.addEventListener('click', (event) => {
        removeShiftEventListeners(x, y);
        game.addShift(n, [dx, dy]);
        drawBoard(game.activeBoard);
        console.log(`Moving ${n} pieces from ${x},${y} to ${x + dx},${y + dy}`);
        resetEventListeners(game);
      });
    }
  }
}

/**
 * Adds click event listeners based on the game state
 * 
 * @param {Game} game - The game object
 */
function resetEventListeners(game) {
  removeSquareEventListeners();
  switch (game.state) {
    case State.Drop:
      addDropEventListeners(game);
      break;
    case State.Shift:
      addShiftEventtListeners(game);
      break;
    case State.Stop:
      break;
  }
}


/**
 * Deactivates the end turn button.
 * Replaces the current end turn button with a copy of itself to remove event listeners on it.
 *
 */
function deactivateEndTurnButton() {
  endTurnButton = document.getElementById('endturn');
  buttonCopy = endTurnButton.cloneNode(true);
  endTurnButton.parentNode.replaceChild(buttonCopy, endTurnButton)
}

/**
 * Activates the end turn button.
 * Calls game.endTurn() when the button is clicked.
 * Removes all shift and square event listeners and adds click event listeners.
 * Deactivates the end turn button after it has been clicked.
 *
 * @param {Game} game - The game object.
 */
function activateEndTurnButton(game) {
  endTurnButton = document.getElementById('endTurn');
  endTurnButton.addEventListener('click', () => {
    game.endTurn();
    removeShiftEventListeners();
    removeSquareEventListeners();
    addClickEventListeners();
    deactivateEndTurnButton();
  })
}


/**
 * The Game class keeps track of the game state and handles game logic
 */
class Game {

  /**
   * Creates a new Game object with an empty board and sets the active player to white
   */
  constructor() {
    this.activeBoard = new Array(6).fill(null).map(() => new Array(6).fill(null).map(() => new Array(0)));
    this.activeBoards = [JSON.stringify(this.activeBoard)];
    this.activePlayer = Player.White;
    this.log = [];
    this.resetTurn();
  }

  /**
   * Resets the turn and updates all relevant variables
   */
  resetTurn() {
    this.state = State.Drop;
    this.activeTurn = [];
    this.activeSquare = null;
    this.activeBoards = [this.activeBoards[0]];
    this.activeTurnEnd = false;
    this.activeBoard = JSON.parse(this.activeBoards[0]);
  }

  /**
   * Checks if a player can legally drop a piece on the specified square.
   *
   * @param {number} x The x-coordinate of the square.
   * @param {number} y The y-coordinate of the square.
   * @returns {boolean} `true` if the drop is legal, `false` otherwise.
   */
  isLegalDrop(x, y) {
    var tower = this.activeBoard[x][y];
    return (tower.length === 0 || (tower.length < 4 && tower.slice(-1)[0] === this.activePlayer));
  }

  /**
   * Adds a piece to the specified square and updates the game state accordingly.
   *
   * @param {number} x - The x-coordinate of the square.
   * @param {number} y - The y-coordinate of the square.
   * @returns {boolean} - True if the piece was successfully added, false otherwise.
   */
  addDrop(x, y) {
    // Check if the drop is legal
    if (this.isLegalDrop(x, y)) {
      // Update the board
      this.activeBoard[x][y].push(this.activePlayer);
      // Update the active square
      this.activeSquare = [x, y];
      // Update the game state to shift
      this.state = State.Shift;
      // Add the current turn to the list of active turns
      this.activeTurn.push([x, y]);
      // Add the current board state to the list of active board states
      this.activeBoards.push(JSON.stringify(this.activeBoard));
      return true;
    }
    return false;
  }

  /**
 * Checks if a player can move n pieces in a given direction
 *
 * @param {number} n - The number of pieces to be moved
 * @param {Direction} d - The direction
 * @returns {boolean} - true if the shift is legal, false otherwise
 */
  isLegalShift(n, d) {
    var [x, y] = this.activeSquare;
    var pile = this.activeBoard[x][y].slice(-n);
    //Fail case: not enough pieces of the same colour
    if (pile.length < n || pile.includes(!this.activePlayer)) {
      return false;
    }
    var [nx, ny] = [x + d[0], y + d[1]];
    //Fail case: moving off the board
    if (nx < 0 || nx > 5 || ny < 0 || ny > 5) {
      return false;
    }
    //Fail case: new tower is taller than old
    if (this.activeBoard[nx][ny].length + n > this.activeBoard[x][y].length) {
      return false;
    }
    //Fail case: new position has already happened this turn
    // this.activeBoard[x][y] = this.activeBoard[x][y].slice(0, -n);
    // this.activeBoard[nx][ny] = this.activeBoard.concat(pile);
    // var s = JSON.stringify(this.activeBoard);
    // this.activeBoard[nx][ny] = this.activeBoard[x][y].slice(0, -n);
    // this.activeBoard[x][y] = this.activeBoard.concat(pile);
    // if (this.activeBoards.includes(s)) {
    //   return false;
    // }
    return true;
  }


  /**
   * Moves n pieces in direction d and updates the game accordingly
   * 
   * @param {number} n - The number of pieces to be moved
   * @param {Direction} d - The direction
   * @returns {boolean} - true if the shift is legal, false otherwise
   */
  addShift(n, d) {
    if (this.isLegalShift(n, d)) {
      var [x, y] = this.activeSquare;
      this.activeBoard[x][y] = this.activeBoard[x][y].slice(0, -n);
      //If there was no piece left at the previous square,
      //the turn will be forced to end after this shift
      var tower = this.activeBoard[x][y];
      if (tower.length === 0 || tower[tower.length - 1] === !this.activePlayer) {
        this.state = State.Stop;
      }
      [x, y] = [x + d[0], y + d[1]];
      this.activeBoard[x][y] = this.activeBoard[x][y].concat(new Array(n).fill(this.activePlayer));
      this.activeSquare = [x, y];
      this.activeTurn.push([x, y]);
      this.activeBoards.push(JSON.stringify(this.activeBoard));
      return true;
    }
    return false;
  }

  /**
   * Undoes a move (drop or shift)
   */
  undoMove() {
    if (this.activeTurn.length === 1) {
      //If there was only one move (drop), just reset the turn
      this.resetTurn();
    } else {
      //Else, undo the last shift
      var [x, y] = this.activeSquare;
      var [n, d] = this.activeTurn.pop();
      this.activeBoard[x][y] = this.activeBoard[x][y].slice(-n);
      this.state = State.Shift;
      [x, y] = [x - d[0], x - d[1]];
      this.activeBoard[x][y].concat(new Array(n).fill(this.activePlayer));
      this.activeSquare = [x, y];
      this.activeBoards.pop();
    }
  }

  /**
   * Ends the turn
   */
  endTurn() {
    this.activeBoards = this.activeBoards.slice(-1);
    this.activePlayer = !this.activePlayer;
    this.log.push(this.activeTurn);
    this.resetTurn();
  }

  /**
   * Checks for the winner
   *
   * @returns {Player} - the colour of the winner, or nothing if there is no winner
   */
  winner() {
    const corners = [[0, 0], [0, 5], [5, 0], [5, 5]]
    var endGame = true;
    var tops;
    for (const [x, y] of corners) {
      if (this.activeBoard[x][y].length === 0) {
        endGame = false;
        break;
      } else if (this.activeBoard[x][y].length === 4) {
        continue;
      } else {
        let p = this.activeBoard[x][y].slice(-1)[0];
        if (tops.contains(!p)) {
          endGame = false;
          break;
        }
        tops.push(p);
      }
    }
    if (endGame) {
      return tops[0];
    }
  }
}

g = new Game();
resetEventListeners(g);
