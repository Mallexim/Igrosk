const switches = document.querySelectorAll(".switch");
let activeSwitch = document.querySelector(".switch.active");
const squares = document.querySelectorAll(".square");
const outputTextarea = document.querySelector(".output");
const outputTextarea2 = document.querySelector(".output2");
let x = 0;
let y = 0;
let color = 0;

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
function removeAllSquares() {
  squares.forEach((square) => {
    square.innerHTML = "";
  });
}

const removeAllButton = document.getElementById("remove-all");
removeAllButton.addEventListener("click", removeAllSquares);

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
squares.forEach((square) => {
  square.addEventListener("click", () => {
    // Call the addPieceOnClick function with the clicked square element as the argument
    addPieceOnClick(square);
    // Update the value of the outputTextarea element with the current state of the board
    outputTextarea.value = getBoardState(squares);
  });
});

function setBoardState() {
  // split the input value at each "/" character
  const values = outputTextarea.value.trim().split("/");
  // clear the contents of all the squares
  removeAllSquares();
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
  const index = row * 6 + col;
  const square = squares[index];

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
