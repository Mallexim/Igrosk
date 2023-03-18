const switches = document.querySelectorAll(".switch");
let activeSwitch = document.querySelector(".switch.active");
switches.forEach((switchEl) => {
  switchEl.addEventListener("click", () => {
    if (activeSwitch) {
      activeSwitch.classList.remove("active");
    }
    activeSwitch = switchEl;
    activeSwitch.classList.add("active");
  });
});

function removeAll() {
  const squares = document.querySelectorAll(".square");
  squares.forEach((square) => {
    while (square.firstChild) {
      square.removeChild(square.firstChild);
    }
  });
}
const removeAllButton = document.getElementById("remove-all");
removeAllButton.addEventListener("click", removeAll);

const squares = document.querySelectorAll(".square");

const parents = document.querySelectorAll(".square");

parents.forEach((parent) => {
  parent.addEventListener("click", (event) => {
    event.preventDefault();
    if (parent.children.length < 4) {
      const newDiv = document.createElement("div");
      newDiv.classList.add("child", "oval", activeSwitch.classList[2]);
      parent.appendChild(newDiv);
    }
  });
});

squares.forEach((square) => {
  square.addEventListener("click", () => {
    let text = "";
    squares.forEach((square) => {
      for (let i = 0; i < square.children.length; i++) {
        const child = square.children[i];
        if (child.classList.contains("dark")) {
          text += "1";
        } else if (child.classList.contains("light")) {
          text += "0";
        }
      }
      text += "/";
    });

    console.log(text);
    const outputTextarea = document.querySelector(".output");
    outputTextarea.value = text;
  });
});

const output = document.querySelector(".output");

output.addEventListener("input", () => {
  const values = output.value.trim().split("/");
  squares.forEach((square, index) => {
    square.innerHTML = "";
    for (let i = 0; i < values[index].length; i++) {
      const child = document.createElement("div");
      if (values[index][i] === "1") {
        child.classList.add("child", "oval", "dark");
      } else if (values[index][i] === "0") {
        child.classList.add("child", "oval", "light");
      }
      square.appendChild(child);
    }
  });
});

//Testing reading coordinates
var x;
var y;
squares.forEach((square, index) => {
  square.addEventListener("click", () => {
    x = Math.floor(index / 6);
    y = index % 6;
  });
});
const test = document.querySelector(".test");
test.addEventListener("click", () => {
  console.log([x, y]);
});
