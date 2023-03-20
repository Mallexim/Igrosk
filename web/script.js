const switches = document.querySelectorAll('.switch');
let activeSwitch = document.querySelector('.switch.active');
const squares = document.querySelectorAll('.square');
const outputTextarea = document.querySelector('.output');
let x;
let y;

// Add click event listener to switches
switches.forEach((switchElement) => {
  switchElement.addEventListener('click', () => {
    if (activeSwitch) {
      activeSwitch.classList.remove('active');
    }
    activeSwitch = switchElement;
    activeSwitch.classList.add('active');
  });
});

// Remove all child elements from squares
function removeAllSquares() {
  squares.forEach((square) => {
    square.innerHTML = '';
  });
}
const removeAllButton = document.getElementById('remove-all');
removeAllButton.addEventListener('click', removeAllSquares);

// Add click event listener to squares
squares.forEach((square, index) => {
  square.addEventListener('click', () => {
    x = Math.floor(index / 6);
    y = index % 6;
    let text = '';
    squares.forEach((squareElement) => {
      for (let i = 0; i < squareElement.children.length; i++) {
        const child = squareElement.children[i];
        if (child.classList.contains('dark')) {
          text += '1';
        } else if (child.classList.contains('light')) {
          text += '0';
        }
      }
      text += '/';
    });
    outputTextarea.value = text;
  });
});

// Add input event listener to outputTextarea
outputTextarea.addEventListener('input', () => {
  const values = outputTextarea.value.trim().split('/');
  squares.forEach((squareElement, index) => {
    squareElement.innerHTML = '';
    for (let i = 0; i < values[index].length; i++) {
      const child = document.createElement('div');
      if (values[index][i] === '1') {
        child.classList.add('child', 'oval', 'dark');
      } else if (values[index][i] === '0') {
        child.classList.add('child', 'oval', 'light');
      }
      squareElement.appendChild(child);
    }
  });
});

// Add click event listener to squares
squares.forEach((square) => {
  square.addEventListener('click', (event) => {
    event.preventDefault();
    if (square.children.length < 4) {
      const newDiv = document.createElement('div');
      newDiv.classList.add('child', 'oval', activeSwitch.classList[2]);
      square.appendChild(newDiv);
    }
  });
});

// Add click event listener to test button
const testButton = document.querySelector('.test');
testButton.addEventListener('click', () => {
  console.log([x, y]);
});
