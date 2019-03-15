// Hardcoded constants for max values of custom game parameters
const maxRows = 30;
const maxCols = 30;
const minRows = 5
const minCols = 5
const minMines = 5

// currentGame serves as a bridge between DOM rendered grid with inputs
// and the game object defined in sap-game.js and sap-cell.js
let currentGame;
let gameRunning = false;

// custom input values
let userRows;
let userCols;
let userMines;

// for flagging by holding lmb functionality
let timer;
let holdCounter = 0;

// game related DOM element
const DOMgameField = document.getElementById('game-field');

// ui related DOM elements
const DOMnew = document.getElementById("new-game");
const DOMreset = document.getElementById("reset");
const DOMcontrols = document.getElementById("sub-menu");
const DOMwin = document.getElementById('win');
const DOMlose = document.getElementById('lose');
const DOMrowsInput = document.getElementById('control-rows');
const DOMcolsInput = document.getElementById('control-cols');
const DOMminesInput = document.getElementById('control-mines');
const DOMerrorPop = document.getElementById('custom-start-error');
const DOMerrorTxt = document.getElementById('error-messages');
const DOMflags = document.getElementById('flags-counter');
const DOMmines = document.getElementById('mines-counter');


// UI FUNCTIONS

// show/hide new game submenu
DOMnew.addEventListener("click",()=>DOMcontrols.classList.toggle("hidden"));

// adding events
DOMreset.addEventListener("click",reset);
DOMwin.addEventListener("click",reset);
DOMlose.addEventListener("click",reset);
DOMrowsInput.addEventListener("input",prevalidate);
DOMcolsInput.addEventListener("input",prevalidate);
DOMminesInput.addEventListener("input",prevalidate);

// dynamically highlights invalid inputs
function prevalidate() {
  let validRows = Number(document.getElementById('control-rows').value, 10);
  let validCols = Number(document.getElementById('control-cols').value, 10);
  let validMines = Number(document.getElementById('control-mines').value, 10);
  if (!Number(validRows) || validRows > maxRows || validRows < minRows) {
    DOMrowsInput.classList.add('bg-orange');
  }
  else {
    DOMrowsInput.classList.remove('bg-orange');
  }
  if (!Number(validCols) || validCols > maxCols || validCols < minCols) {
    DOMcolsInput.classList.add('bg-orange');
  }
  else {
    DOMcolsInput.classList.remove('bg-orange');
  }
  if (!Number(validMines)) {
    DOMminesInput.classList.add('bg-orange');
  }
  else {
    DOMminesInput.classList.remove('bg-orange');
  }
}

// validates custom inputs, throws errors as an object
function validate(rows, cols, mines){
  let isThereAnError = false;
  let errorMessages = [];
  let maxMines = rows * cols;
  if (!Number.isInteger(rows)){
    isThereAnError = true;
    errorMessages.push('Rows value is not an integer number')
  }
  if (!Number.isInteger(cols)){
    isThereAnError = true;
    errorMessages.push('Colums value is not an integer number')
  }
  if (!Number.isInteger(mines)){
    isThereAnError = true;
    errorMessages.push('Mines value is not an integer number')
  }
  if (rows > maxRows || rows < minRows){
    isThereAnError = true;
    errorMessages.push('Invalid rows value (5-30)')
  }
  if (cols > maxCols || cols < minCols){
    isThereAnError = true;
    errorMessages.push('Invalid rows value (5-30)')
  }
  if (mines > maxMines || mines < minMines){
    isThereAnError = true;
    errorMessages.push('Invalid mines value (5-'+maxMines+')')
  }
  return {isThereAnError: isThereAnError, errorMessages: errorMessages}
}

function generateError(error) {
  showError();
  DOMerrorTxt.innerText = error[0];
}

// fancy title animation
function animateTitle() {
  let blinkTime = 40;
  let cycleTime = 0;
  let addTime = 0;
  for (t=1; t<=3; t++) {
    for (i=1; i<=6; i++) {
      let letter = document.getElementById(i);
      setTimeout( ()=>{letter.classList.add('txt-animate')} , (blinkTime*i-blinkTime) + addTime )
      setTimeout( ()=>{letter.classList.remove('txt-animate')} , (2*blinkTime*i) + addTime )
      cycleTime += blinkTime;
    }
    addTime = cycleTime * 2;
  }
}

function hideEndMessages() {
  DOMwin.classList.add("hidden");
  DOMlose.classList.add("hidden");
}

function hideControls() {
  DOMerrorPop.classList.add('hidden')
  DOMcontrols.classList.add("hidden");
}

function showError() {
  DOMerrorPop.classList.remove('hidden');
}



// INPUT FUNCTIONS

// handles hold-to-flag functionality
function userHold(holdX, holdY){
  let DOMCell = document.getElementById('cell-'+holdX+'-'+holdY);
  if (!currentGame.grid[holdX][holdY].flagged) {
    timer = setInterval(function(){
      holdCounter++;
      if (holdCounter > 50) {
        DOMCell.classList.add('flagged');
      }
    },10)
  }
}

// handles clicks, behavior depends on lmb hold time
function userClick(clickedX, clickedY) {
  let DOMCell = document.getElementById('cell-'+clickedX+'-'+clickedY);
  clearInterval(timer);
  if (!currentGame.grid[clickedX][clickedY].flagged) {
    if (holdCounter < 49) {
      holdCounter = 0;
      currentGame.reveal(currentGame.grid[clickedX][clickedY]);
      refreshView();
    }
    else {
      currentGame.grid[clickedX][clickedY].flagged = true;
      holdCounter = 0
    }
  }
  else {
    DOMCell.classList.remove('flagged');
    currentGame.grid[clickedX][clickedY].flagged = false;
    holdCounter = 0;
  }
  DOMflags.innerText = currentGame.countFlagged();
  currentGame.countRevealed();
  checkWinCondition();
}


// GAME FUNCTIONS

// starts the game, initialized onload with easy parameters
function play(r,c,m,custom) {
  if (custom) {
    userRows = Number(document.getElementById('control-rows').value, 10);
    userCols = Number(document.getElementById('control-cols').value, 10);
    userMines = Number(document.getElementById('control-mines').value, 10);
    r = userRows;
    c = userCols;
    m = userMines;
    console.log('custom ',r,c,m);
  }
  validationResult = validate(r, c, m);
  console.log(validationResult);
  if (validationResult.isThereAnError) {
    generateError(validationResult.errorMessages)
  }
  else if (!gameRunning) {
    init(r, c, m);
    gameRunning = true;
    hideControls();
    hideEndMessages()
  }
  else if (gameRunning) {
    clear();
    init(r, c, m);
    gameRunning = true;
    hideControls();
    hideEndMessages()
  };
}

// removes game field
function clear() {
  for (i = 0; i < currentGame.rowsNo; i++) {
    rowToRemove = document.getElementById('row-'+i);
    DOMgameField.removeChild(rowToRemove);
  }
  currentGame = null;
  gameRunning = false;
  console.log('clear');
}

// removes and instantly adds new game field
function reset() {
  let r = currentGame.rowsNo;
  let c = currentGame.columnsNo;
  let m = currentGame.minesNo;
  clear();
  init(r,c,m);
  gameRunning = true;
  DOMflags.innerText = '0';
  hideControls();
  hideEndMessages();
}

// initializes game object
function init(r, c, m) {
  currentGame = new Game(r, c, m);
  currentGame.createArray();
  currentGame.populateWithMines();
  currentGame.populateWithNumbers();
  render(currentGame);
}

// renders DOM game field based on a game object
// uses classList because
function render(game){
  let w = currentGame.columnsNo * 30;
  console.log(w);
  DOMgameField.setAttribute('style','width:'+w+'px');
  game.grid.forEach(row => {
    let DOMrow = document.createElement('div');
    DOMrow.id = 'row-'+row[0].xpos;
    DOMrow.className = 'row';
    DOMgameField.appendChild(DOMrow);
    row.forEach(cell => {
      let DOMcell = document.createElement('div');
      DOMcell.id = 'cell-'+cell.xpos+'-'+cell.ypos;
      DOMcell.classList.add('cell');
      DOMcell.classList.add('unrevealed');
      DOMcell.setAttribute('x',cell.xpos);
      DOMcell.setAttribute('y',cell.ypos);
      // i cant grasp how to use addEventListener in this case
      DOMcell.setAttribute('onmousedown','userHold(' +cell.xpos+','+cell.ypos+    ')');
      DOMcell.setAttribute('onmouseup','userClick(' +cell.xpos+','+cell.ypos+    ')');
      let DOMnumberSpan = document.createElement('span');
      DOMnumberSpan.className = 'hidden';
      DOMrow.appendChild(DOMcell);
      DOMcell.appendChild(DOMnumberSpan);
      if (cell.isMine) {
        DOMcell.classList.add('mine');
        DOMnumberSpan.innerText = '•';
      }
      else if (cell.neighboringMines > 0){
        DOMcell.classList.add('number');
        DOMnumberSpan.innerText = cell.neighboringMines;
      }
    });
  });
  DOMmines.innerText = currentGame.minesNo;

}

// rerenders cell classes, called every time user interacts with game field
function refreshView() {
  let DOMcellCollection = document.getElementsByClassName('cell');
  for (let i = 0; i < DOMcellCollection.length; i++) {
    let DOMcell = DOMcellCollection[i];
    let DOMcellX = DOMcell.getAttribute('x');
    let DOMcellY = DOMcell.getAttribute('y');
    if (currentGame.grid[DOMcellX][DOMcellY].revealed) {
      DOMcell.classList.add('revealed');
      DOMcell.classList.remove('unrevealed');
      DOMcell.firstChild.classList.remove('hidden')
    }
    if (!currentGame.playing && currentGame.grid[DOMcellX][DOMcellY].isMine) {
      DOMcell.classList.add('exploded');
      DOMcell.classList.remove('unrevealed');
      DOMcell.firstChild.classList.remove('hidden')
    }
  }
}

function checkWinCondition() {
  if (currentGame.playing && currentGame.revealedCounter == currentGame.rowsNo * currentGame.columnsNo - currentGame.minesNo){
    win();
  }
  else if (!currentGame.playing) {
    lose();
  }
}

function win() {
  DOMwin.classList.remove("hidden");
  animateTitle();
}

function lose() {
  DOMlose.classList.remove("hidden");
}
