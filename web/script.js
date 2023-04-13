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

/**
 * Changes the active switch and its corresponding color.
 */
function changeSwitch() {
  const activeSwitch = document.querySelector(".switch.active");
  const inactiveSwitch = document.querySelector(`.switch.circle.${activeSwitch.classList.contains("light") ? "dark" : "light"}`);

  // Remove the "active" class from the currently active switch and add it to the inactive switch
  activeSwitch.classList.remove("active");
  inactiveSwitch.classList.add("active");
}

/**
 * Removes all pieces from the game board.
 */
function removeAllPieces() {
  document.querySelectorAll(".square").forEach((square) => {
    square.innerHTML = "";
  });
}


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
  piece.classList.add("child", "oval", `${color ? "dark" : "light"}`);

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
    squareElement.classList.remove("legal");
    squareElement.classList.remove("active");
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
      squareElement.classList.add("legal");
      squareElement.addEventListener('click', (event) => {
        game.addDrop(x, y);
        drawBoard(game.activeBoard);
        resetEventListeners(game);
        activateButton(game, "endTurn", endTurnButtonEventListener);
        activateButton(game, "undoMove", undoMoveButtonEventListener);
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
  const square = document.querySelectorAll(".square")[coordToIndex(x, y)];
  square.classList.add("active");
  const pieceElements = square.querySelectorAll(
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
      square.classList.add("legal");
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
      deactivateButton("undoMove");
      deactivateButton("endTurn");
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
 * Activates the specified button and adds an event listener to it.
 *
 * @param {Object} game - The game object.
 * @param {string} buttonId - The ID of the button to activate.
 * @param {Function} eventListener - The event listener to add to the button.
 */
function activateButton(game, buttonId, eventListener) {
  const button = document.getElementById(buttonId);
  button.classList.add("active");
  button.addEventListener('click', () => {
    console.log(`${buttonId} button clicked`);
    eventListener(game);
    resetEventListeners(game);
  })
}

/**
 * Event listener for the End Turn button.
 * Ends the current player's turn and switches to the other player.
 *
 * @param {Object} game - The game object.
 */
function endTurnButtonEventListener(game) {
    game.endTurn();
    removeSquareEventListeners();
    changeSwitch();
}

/**
 * Event listener for the Undo Move button.
 * Undoes the previous move and redraws the board.
 *
 * @param {Object} game - The game object.
 */
function undoMoveButtonEventListener(game) {
    game.undoMove();
    drawBoard(game.activeBoard);
}

/**
 * Removes the active class from a specified button.
 * @param {string} buttonId - The id of the button to deactivate.
 */
function deactivateButton(buttonId) {
  const button = document.getElementById(buttonId);
  button.classList.remove("active");
  const buttonCopy = button.cloneNode(true);
  button.parentNode.replaceChild(buttonCopy, button)
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
    return (tower.length === 0 || (tower.length < 4 && tower[tower.length - 1] === this.activePlayer));
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
    // Fail case: new position has already happened this turn
    this.activeBoard[x][y] = this.activeBoard[x][y].slice(0, -n);
    this.activeBoard[nx][ny] = this.activeBoard[nx][ny].concat(Array(n).fill(this.activePlayer));
    let s = JSON.stringify(this.activeBoard);
    this.activeBoard[nx][ny] = this.activeBoard[nx][ny].slice(0, -n);
    this.activeBoard[x][y] = this.activeBoard[x][y].concat(Array(n).fill(this.activePlayer));
    if (this.activeBoards.includes(s)) {
      return false;
    }
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
      this.activeTurn.push([n, d]);
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
      let [x, y] = this.activeSquare;
      // Get the number of pieces and direction of the last shift
      const [n, d] = this.activeTurn.pop();
      const removedPieces = this.activeBoard[x][y].splice(-n);
      this.state = State.Shift;
      // Get the coordinates of the previous square
      [x, y] = [x - d[0], y - d[1]];
      // Add the removed pieces back to the previous square
      this.activeBoard[x][y] = this.activeBoard[x][y].concat(removedPieces);
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
   * Determines the winner of the game by checking if a player controls all active corners.
   *
   * @returns {boolean} The color of the winning player, or null if there is no winner.
   */
  winner() {
    const corners = [[0, 0], [0, 5], [5, 0], [5, 5]];
    const tops = [];
    for (const corner of corners) {
      const [x, y] = corner;
      if (board[x][y].length === 0) {
        // If one of the corners is empty, return null
        return null;
      } else if (board[x][y].length === 4) {
        // If the corner has four pieces, continue to the next corner
        continue;
      } else {
        // If the corner is active, add the color of the owner to the tops array
        const p = board[x][y][board[x][y].length - 1];
        tops.push(p);
      }
    }
    // If all elements in the tops array are the same, return the winner
    if (tops.every((x) => x === tops[0])) {
      return tops[0];
    } else {
      // If the top pieces are of different colors, return null
      return null;
    }
  }
}

/**
 * Debug class for debugging the game.
 *
 * @param {Game} game An instance of the Game class.
 */
class Debug {
  constructor(game) {
    this.game = game;

    // Show the debug card
    const debugDiv = document.getElementById("debug");
    debugDiv.style.display = "block";

    this.BoardStateOutput = document.querySelector("#BoardStateOutput");
    this.stateOutput = document.querySelector("#stateOutput");
    this.playerOutput = document.querySelector("#playerOutput");
    this.activeTurnOutput = document.querySelector("#activeTurnOutput");
  }

  /**
   * Get the state of the board.
   *
   * @param {Game} game An instance of the Game class.
   * @returns {string} A string representing the state of the board.
   */
  getBoardState(game) {
    let text = "";
    for (let x = 0; x < 6; x++) {
      for (let y = 0; y < 6; y++) {
        for (let z = 0; z < game.activeBoard[x][y].length; z++) {
          let piece = game.activeBoard[x][y][z];
          text += Number(piece);
        }
        text += "/"
      }
    }
    return text;
  }

  /**
   * Sets the state of the board based on the input string.
   *
   * @param {string} text - The input string containing the state of the board.
   * @param {Game} game An instance of the Game class.
   */
  setBoardState(text, game) {
    game = new Game();
    game.resetTurn();
    const values = text.trim().split("/");
    for (let i = 0; i < values.length; i++) {
      const [x, y] = indexToCoord(i);
      for (let j = 0; j < values[i].length; j++) {
        const piece = values[i][j] == 1 ? true : false;
        game.activeBoard[x][y].push(piece);
      }
    }
    drawBoard(game.activeBoard)
    resetEventListeners(game);
  }

  /**
   * Log the state of the board to the console at regular intervals.
   *
   * @param {number} time The interval in milliseconds.
   * @param {Game} game An instance of the Game class.
   */
  logBoardState(time, game) {
    setInterval(() => {
      const boardState = this.getBoardState(game);
      this.BoardStateOutput.value = boardState;
      console.log(boardState);

      stateOutput.textContent = `State: ${game.state}`;
      playerOutput.textContent = `Active Player: ${game.activePlayer}`;
      activeTurnOutput.textContent = `Active Turn: ${game.activeTurn}`;
    }, time);
  }

  /**
   * Adds an event listener to the Load Board button.
   *
   * When the button is clicked, the board state is set to the value of the outputTextarea element.
   * @param {Game} game An instance of the Game class.
   */
  addLoadBoardListener(game) {
    const loadBoardButton = document.querySelector("#loadBoard");
    loadBoardButton.addEventListener("click", () => {
      const BoardStateInput = document.querySelector("#BoardStateInput");
      this.setBoardState(BoardStateInput.value, game);
    });
  }

}

/**
 * Sends a POST request to the FastAPI endpoint at serverAddress/create_room to create a new room.
 *
 * @param {string} serverAddress - The address of the server.
 * @returns {Promise<string>} - A Promise that resolves to the ID of the newly created room.
 */
async function createRoom(serverAddress) {
  const response = await fetch(`${serverAddress}/create_room`, {method: 'POST'});
  const data = await response.json();
  const roomId = data.room_id;
  return roomId;
}

// To get the roomID run:
// createRoom('http://localhost:8000')
// .then(roomID => console.log(roomID));
// or the await command

/**
 * Joins a room on the FastAPI server using a WebSocket connection.
 *
 * @param {string} serverAddress - The address of the server.
 * @param {string} roomId - The ID of the room to join.
 * @param {function} onMessage - A function to handle incoming messages from the server.
 * @param {function} onClose - A function to handle the WebSocket connection closing.
 * @returns {WebSocket} - The WebSocket connection object.
 */
function joinRoom(serverAddress, roomId, onOpen, onMessage, onClose) {
  const socket = new WebSocket(`${serverAddress}/room/${roomId}`);
  socket.onopen = onOpen;
  socket.onmessage = onMessage;
  socket.onclose = onClose;
  return socket;
}

function handleOpen(event) {
  console.log('WebSocket connection opened', event);
}

function handleMessage(event) {
  const message = JSON.parse(event.data);
  console.log(`Received message: ${message}`);
}

function handleClose(event) {
  console.log(`WebSocket connection closed: ${event.code}`);
}

/**
 * Send a turn object through a WebSocket connection.
 *
 * @param {WebSocket} socket - The WebSocket connection to use.
 * @param {Object} turn - The turn object to send.
 */
function sendTurn(socket, turn) {
  const message = JSON.stringify(turn);
  socket.send(message);
}

// This is how you can create a websocket connection 
// const socket = joinRoom(serverAddress, roomId, handleOpen, handleMessage, handleClose);
// eg. const socket = joinRoom('ws://localhost:8000', "0a8899a8", handleOpen, handleMessage, handleClose);

/**
 * Initializes a new game object and sets up event listeners.
 */
function startGame() {
  g = new Game(); // Create a new game object
  debug = new Debug(g); // Create a new debug object
  resetEventListeners(g); // Set up event listeners for the game
  debug.logBoardState(1000, g); // Log the current board state
  debug.addLoadBoardListener(); // Set up event listener for loading a saved board
  deactivateButton("startGame"); // Disable the start game button
}

const startGameButton = document.getElementById("startGame");
startGameButton.addEventListener("click", startGame);