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

// Add click event listener to squares
squares.forEach((square, index) => {
  square.addEventListener("click", () => {
    x = Math.floor(index / 6);
    y = index % 6;
    let text = "";
    squares.forEach((squareElement) => {
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
    outputTextarea.value = text;
  });
});

// Add input event listener to outputTextarea
outputTextarea.addEventListener("input", () => {
  const values = outputTextarea.value.trim().split("/");
  squares.forEach((squareElement, index) => {
    squareElement.innerHTML = "";
    for (let i = 0; i < values[index].length; i++) {
      const child = document.createElement("div");
      if (values[index][i] === "1") {
        child.classList.add("child", "oval", "dark");
      } else if (values[index][i] === "0") {
        child.classList.add("child", "oval", "light");
      }
      squareElement.appendChild(child);
    }
  });
});

// Add click event listener to squares
squares.forEach((square) => {
  square.addEventListener("click", (event) => {
    event.preventDefault();
    if (square.children.length < 4) {
      const newDiv = document.createElement("div");
      newDiv.classList.add("child", "oval", activeSwitch.classList[2]);
      square.appendChild(newDiv);
    }
  });
});

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
