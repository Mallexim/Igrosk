const switches = document.querySelectorAll(".switch");
let activeSwitch = document.querySelector(".switch.active");
const squares = document.querySelectorAll(".square");
const outputTextarea = document.querySelector(".output");
const outputTextarea2 = document.querySelector(".output2");
let x = 0;
let y = 0;
let color = 0;

function coordToIndex(x,y) {
  return 6*x+y;
}

function indexToCoord(i) {
  return [floor(i/6), i%6]; 
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
    let x = Math.floor(index / 6);
    let y = index % 6;
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

function placePiece(row, col, color) {
  const square = squares[coordToIndex(row,col)];

  // Check if the square already has 4 child elements
  if (square.children.length < 4) {
    // Create a new oval element and add classes for styling
    let oval = document.createElement("div");
    oval.classList.add("child", "oval", color ? "dark" : "light");
    // Add the piece to the the square
    square.appendChild(oval);
  }
}

function removePiece(row, col) {
  const index = row * 6 + col;
  const square = squares[index];

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
  placePiece(x, y, color);
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

class Game {
  constructor() {
    // create a 6x6x4 3D board and initialize game state
    this.board = new Array(6).fill(null).map(() => new Array(6).fill(null).map(() => new Array(4).fill(null)));
    this.state = "drop";
    this.activePlayer = 0;
    this.activeSquare = null;
  }

  /**
   * Draws the pieces on the board based on the current game state.
   *
   * @param {number[][][]} board The current state of the game board.
   */
  drawBoard(board) {
    // remove all existing pieces from the board
    removeAllPieces();

    // loop through each position on the board
    for (let x = 0; x < 6; x++) {
      for (let y = 0; y < 6; y++) {
        for (let z = 0; z < 4; z++) {
          // get the value of the current position
          const piece = board[x][y][z];

          // if the position is not empty, add a new piece to the board
          if (piece !== null) {
            placePiece(x, y, piece);
          }
        }
      }
    }
  }


  /**
 * Adds a piece to the specified square and updates the game state accordingly.
 * @param {number} x - The x-coordinate of the square.
 * @param {number} y - The y-coordinate of the square.
 * @returns {boolean} - True if the piece was successfully added, false otherwise.
 */

  addDrop(x, y) {

    // Check if the tower already has 4 elements
    if (this.getTowerHeight(x, y) < 4) {

      // Add the piece to the first empty slot in the tower
      for (let z = 0; z < 4; z++) {
        if (this.board[x][y][z] === null) {
          this.board[x][y][z] = this.activePlayer;
          break;
        }
      }

      // Update interface, the active square and game state
      // placePiece(x, y, this.activePlayer)
      this.drawBoard(this.board)

      this.activeSquare = (x, y);
      this.state = "move";
      return true;
    }

    // If the tower is full return false
    return false;

  }

  /**
 * Returns the height of the tower at the given position on the board.
 *
 * @param {number} x The x-coordinate of the position.
 * @param {number} y The y-coordinate of the position.
 * @returns {number} The height of the tower.
 */
  getTowerHeight(x, y) {
    // The height is defined as the number of non-null elements in the tower
    // Filter out null elements and return the length of the resulting array
    return this.board[x][y].filter((el) => el !== null).length;
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
    const towerHeight = this.getTowerHeight(x, y);

    // Return false if the tower is empty
    if (towerHeight === 0) {
      return false;
    }

    // Determine the number of pieces to remove
    const numToRemove = Math.min(n, towerHeight);

    // Remove the pieces from the top of the tower
    for (let i = towerHeight - 1; i >= towerHeight - numToRemove; i--) {
      this.board[x][y][i] = null;
    }

    return true;
  }

/**
   * Returns an array of the coordinates of all squares on the board where a player can legally drop a piece.
   *
   * @returns {Array} An array of the form [[x1, y1], [x2, y2], ...].
   */
getLegalDrops() {
  const legalDrops = [];

  for (let x = 0; x < 6; x++) {
    for (let y = 0; y < 6; y++) {
      // check if the tower at this position is not full
      if (this.getTowerHeight(x, y) < 4) {
        // check if the top piece of the tower is the player's color
        if (this.board[x][y][this.getTowerHeight(x, y) - 1] === this.activePlayer) {
          legalDrops.push([x, y]);
        }
      }
    }
  }

  return legalDrops;
}



  /**
   * Adds a click event listener to each square on the board where a player can legally drop a piece.
   * When a square is clicked, it calls the `addDrop` method with the `x` and `y` coordinates of the clicked square.
   *
   * @param {Array} legalDrops An array of arrays in the form [[x1, y1], [x2, y2], ...].
   */
  addDropEventListeners(legalDrops) {
    // loop through each square and add a click event listener if its coordinates are in the list of legal drops
    squares.forEach((squareElement, index) => {
      let x = Math.floor(index / 6);
      let y = index % 6;

      if (legalDrops.some((d) => d[0] === x && d[1] === y)) {
        squareElement.addEventListener('click', (event) => {
          this.addDrop(x, y);
        });
      }
    });
  }


  /**
   * Removes any click event listeners from elements with class `square`.
   */
  removeDropEventListeners() {
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
  removeDropEventListeners2() {
    squares.forEach((squareElement) => {
      squareElement.removeEventListener('click', this.handleSquareClick);
    });
  }



}
