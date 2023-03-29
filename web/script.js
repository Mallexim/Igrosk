const switches = document.querySelectorAll(".switch");
let activeSwitch = document.querySelector(".switch.active");
const squares = document.querySelectorAll(".square");
const outputTextarea = document.querySelector(".output");
const outputTextarea2 = document.querySelector(".output2");
let x = 0;
let y = 0;

//Constants
const Player = Object.freeze({White: false, Black: true});
const Direction = Object.freeze({Up: [-1,0], Down: [1,0], Left: [-1,0], Right: [1,0]});
const State = Object.freeze({Drop: "drop", Shift: "shift", Stop: "stop"});
let color = 0;

function coordToIndex(x, y) {
  return 6 * x + y;
}

function indexToCoord(i) {
  return [Math.floor(i / 6), i % 6];
}

// Add click event listener to switches
switches.forEach((switchElement) => {
  switchElement.addEventListener("click", () => {
    if (activeSwitch) {
      activeSwitch.classList.remove("active");
    }
    activeSwitch = switchElement;
    activeSwitch.classList.add("active");
    if (activeSwitch.classList.contains("light")) {
      color = 0;
    } else if (activeSwitch.classList.contains("dark")) {
      color = 1;
    }
    console.log(color);
  });
});

// Remove all child elements from squares
function removeAllPieces() {
  squares.forEach((square) => {
    square.innerHTML = "";
  });
}

const removeAllButton = document.getElementById("remove-all");
removeAllButton.addEventListener("click", removeAllPieces);

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

function addPieceOnClick(square) {
  // Check if the square has less than 4 child elements
  if (square.children.length < 4) {
    // Create a new div element with the classes .child, .oval, and .light or .dark depending on the value of the color variable
    const newDiv = document.createElement("div");
    newDiv.classList.add("child", "oval", color ? "dark" : "light");
    // Append the new div element to the clicked square
    square.appendChild(newDiv);
  }
}

// Loop through each square element and add a click event listener
// squares.forEach((square) => {
//   square.addEventListener("click", () => {
//     // Call the addPieceOnClick function with the clicked square element as the argument
//     addPieceOnClick(square);
//     // Update the value of the outputTextarea element with the current state of the board
//     outputTextarea.value = getBoardState(squares);
//   });
// });

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

function removePiece(row, col) {
  const square = squares[coordToIndex(row, col)];

  // Check if the square has any child elements
  if (square.children.length > 0) {
    // Remove the last child element from the square
    square.removeChild(square.lastChild);
  }
}

// Add click event listener to test button
const testButton = document.querySelector(".test");
testButton.addEventListener("click", () => {
  // console.log([x, y]);
  outputTextarea2.value = [x, y, color];
  drawPiece(x, y, color);
});

const deletePieceButton = document.querySelector(".deletePiece");
const deletePieceText = document.querySelector(".deletePieceText");
deletePieceButton.addEventListener("click", () => {
  const coordinates = deletePieceText.value.trim().split(",");
  if (coordinates.length === 2) {
    let row = parseInt(coordinates[0]);
    let col = parseInt(coordinates[1]);
    console.log(`x: ${row}, y: ${col}`);
    removePiece(row, col);
  }
});

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


  function drawPiece(x, y, color) {
    // find the corresponding square element and create a new oval element
    const square = squares[coordToIndex(x, y)];
    const oval = document.createElement("div");

    // add classes to the oval element for styling
    oval.classList.add("child", "oval", color ? "dark" : "light");

    // add the oval element to the square element
    square.appendChild(oval);
  }



class Game {
  constructor() {
    // create a 6x6(x4) 3D board and initialize game state
    this.activeBoard = new Array(6).fill(null).map(() => new Array(6).fill(null).map(() => new Array(0)))
    this.activeBoards = [JSON.stringify(this.activeBoard)];
    this.activePlayer = Player.White;
    this.log = [];
    this.resetTurn();
  }

  resetTurn() {
    this.state = State.Drop;
    this.activeTurn = [];
    this.activeSquare = null;
    this.activeBoards = [this.activeBoards[0]];
    this.activeTurnEnd = false;
  }

  /**
   * Checks if a player can legally drop a piece on the specified square.
   *
   * @param {number} x The x-coordinate of the square.
   * @param {number} y The y-coordinate of the square.
   * @returns {boolean} `true` if the drop is legal, `false` otherwise.
   */
  isLegalDrop(x, y) {
    tower = this.activeBoard[x][y];
    return (tower.length === 0 || (tower.length < 4 && tower.slice(-1) === this.activePlayer));
  }

  /**
 * Adds a piece to the specified square and updates the game state accordingly.
 * @param {number} x - The x-coordinate of the square.
 * @param {number} y - The y-coordinate of the square.
 * @returns {boolean} - True if the piece was successfully added, false otherwise.
 */

  addDrop(x, y) {

    if (this.isLegalDrop(x,y)) {

      // Update the board, the interface
      this.activeBoard[x][y].push(this.activePlayer);
      this.activeSquare = (x, y);
      this.state = State.Shift;
      this.activeTurn.push([x,y]);
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
    if (pile.length < n || pile.includes(!this.activePlayer)){
      return false;
    }
    [nx, ny] = [x+d[0], y+d[1]];
    //Fail case: moving off the board
    if (nx<0 || nx>5 || ny<0 || ny>5) {
      return false;
    }
    //Fail case: new tower is taller than old
    if (this.activeBoard[nx][ny].length+n > this.activeBoard[x][y].length) {
      return false;
    }
    //Fail case: new position has already happened this turn
    this.activeBoard[x][y] = this.activeBoard[x][y].slice(0,-n);
    this.activeBoard[nx][ny] = this.activeBoard.concat(pile);
    var s = JSON.stringify(this.activeBoard);
    this.activeBoard[nx][ny] = this.activeBoard[x][y].slice(0,-n);
    this.activeBoard[x][y] = this.activeBoard.concat(pile);
    if (this.activeBoards.includes(s)) {
      return false;
    }
    return true;
  }

  /**
   * Moves n pieces in direction d
   * 
   * @param {number} n - The number of pieces to be moved
   * @param {Direction} d - The direction
   * @returns {boolean} - true if the shift is legal, false otherwise
   */
  addShift(n, d) {
    [x, y] =
  }

  /**
   * Removes a specified number of pieces from the top of a tower at
   * the given position on the board.
   *
   * @param {number} x The x-coordinate of the position.
   * @param {number} y The y-coordinate of the position.
   * @param {number} n The number of pieces to remove.
   * @returns {boolean} `true` if the pieces were removed, `false` otherwise.
   */
  removePiecesFromTop(x, y, n) {
    // Get the height of the tower at the position
    const towerHeight = this.activeBoard[x][y].length;

    // Return false if the tower is empty
    if (towerHeight === 0) {
      return false;
    }

    // Determine the number of pieces to remove
    const numToRemove = Math.min(n, towerHeight);

    // Remove the pieces from the top of the tower
    for (let i = towerHeight - 1; i >= towerHeight - numToRemove; i--) {
      this.activeBoard[x][y][i] = null;
    }

    return true;
  }

  /**
 * Moves a specified number of pieces from one tower to another.
 *
 * @param {number} fromX The x-coordinate of the source tower.
 * @param {number} fromY The y-coordinate of the source tower.
 * @param {number} toX The x-coordinate of the target tower.
 * @param {number} toY The y-coordinate of the target tower.
 * @param {number} n The number of pieces to move.
 * @returns {boolean} `true` if the pieces were moved, `false` otherwise.
 */
  movePieces(fromX, fromY, toX, toY, n) {
    const towerHeight = this.activeBoard[fromX][fromY].length;

    // check if the source tower is empty
    if (towerHeight === 0) {
      return false;
    }

    // move the pieces
    for (let i = towerHeight - 1; i >= towerHeight - n; i--) {
      this.activeBoard[toX][toY][i] = this.activeBoard[fromX][fromY][i];
      // this.activeBoard[fromX][fromY][i] = null;
    }

    // remove the pieces from the source tower
    this.removePiecesFromTop(fromX, fromY, n);

    this.drawBoard();
    this.removeShiftEventListeners(fromX, fromY);
    return true;
  }

  /**
   * Adds a click event listener to each square on the board where it is legal to drop a piece.
   */
  addDropEventListeners() {
    const squares = document.querySelectorAll(".square");
    squares.forEach((squareElement, index) => {
      let [x, y] = indexToCoord(index);

      if (this.isLegalDrop(x, y)) {
        squareElement.addEventListener('click', (event) => {
          this.addDrop(x, y);
        });
      }
    });
  }


  /**
   * Removes any event listeners from elements with class `square`.
   */
  removeSquareEventListeners() {
    const squares = document.querySelectorAll(".square");
    // clone each square and replace the original with the clone
    squares.forEach((squareElement) => {
      const clonedSquare = squareElement.cloneNode(true);
      squareElement.parentNode.replaceChild(clonedSquare, squareElement);
    });
  }

  /**
   * Removes the click event listener from each square element in the `squares` array using the `removeEventListener` method.
   * This method is an alternative to cloning the square elements to remove the event listeners, and is typically faster for large or complex elements.
   */
  // removeDropEventListeners2() {
  //   const squares = document.querySelectorAll(".square");
  //   squares.forEach((squareElement, index) => {
  //     let [x, y] = indexToCoord(index);
  //       squareElement.removeEventListener(
  //         "click",
  //         this.handleSquareClick.bind(this, event, x, y)
  //       );
  //   });
  // }

  // ! This does not work

  /**
   * Adds click event listeners to each relevant piece in the tower at the specified position,
   * for shifting it to an adjacent square.
   *
   * @param {number} x The x-coordinate of the position.
   * @param {number} y The y-coordinate of the position.
   */
  addShiftEventtListeners() {
    var [x,y] = activeSquare;
    const squares = document.querySelectorAll(".square");
    const pieceElements = squares[coordToIndex(x, y)].querySelectorAll(
      ".child"
    );
    tower = this.activeBoard[x][y];
    for (let i = 1; i <= tower.length; i++) {
      if (tower[tower.length-i] === this.activePlayer) {
        pieceElements[tower.length-i].addEventListener("click", (event) => {
          console.log(`Clicked piece at ${x},${y},${i}`);
          this.addOrthogonalEventListeners(i);
        });
      } else {
        break;
      }
    }
  }

  /**
 * Removes any click event listeners from the pieces in the tower at the given position.
 *
 * @param {number} x The x-coordinate of the position.
 * @param {number} y The y-coordinate of the position.
 */
  removeShiftEventListeners(x, y) {
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
   * Returns true if it is legal to shift a specified number of pieces from the given square up, down, left, or right, and the target square would not have more pieces than the original square.
   *
   * @param {number} fromX The x-coordinate of the initial square.
   * @param {number} fromY The y-coordinate of the initial square.
   * @param {number} toX The x-coordinate of the target square.
   * @param {number} toY The y-coordinate of the target square.
   * @param {number} n The number of pieces to move.
   * @returns {boolean} `true` if it is legal to shift a specified number of pieces from the given square, `false` otherwise.
   */
  isShiftLegal(fromX, fromY, toX, toY, n) {
    // check if the target square is on the board
    if (toX < 0 || toX >= 6 || toY < 0 || toY >= 6) {
      return false;
    }

    // check if the target square has fewer pieces than the initial square
    const initialHeight = this.activeBoard[fromX][fromY].length;
    const targetHeight = this.activeBoard[toX][toY].length;
    if (targetHeight + n > initialHeight) {
      return false;
    }

    console.log(`Moving ${n} pieces from ${fromX},${fromY} to ${toX},${toY} is legal`);
    return true;
  }

/**
 * Adds click event listeners to all squares adjacent to the specified square
 * in orthogonal directions (up, down, left, right) that are legal moves for
 * the specified number of pieces.
 *
 * @param {number} n The number of pieces to move.
 */
addOrthogonalEventListeners(n) {
  var [x, y] = this.activeSquare;
  const squares = document.querySelectorAll(".square");
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for (const [dx, dy] of directions) {
    if (this.isLegalShift(n, [dx,dy])) {
      const square = squares[coordToIndex(x + dx, y + dy)];
      square.addEventListener('click', (event) => {
        this.addShift(n, [dx,dy]);
        console.log(`Moving ${n} pieces from ${x},${y} to ${x + dx},${y + dy}`);
      });
    }
  }
}


}
