class Game {
  constructor(r, c, m) {
    this.rowsNo = r;
    this.columnsNo = c;
    this.minesNo = m;
    this.minesFactor = m / (c * r);
    this.grid;
    this.revealedCounter = 0;
    this.flaggedCounter = 0;
    this.playing = true;
  }

  // creates 2-dimensional array and fills it with empty cell objects
  createArray() {
    this.grid = new Array(this.rowsNo);
    for (let a = 0; a < this.rowsNo; a++){
      this.grid[a] = new Array(this.columnsNo);
    }
    for (let i = 0; i < this.rowsNo; i++){
      for (let j = 0; j < this.columnsNo; j++){
        this.grid[i][j] = new Cell(i,j,false,0);
      }
    }
  }

  // populates random cells with mines based on a mine-nonmine ratio
  // results vary, so it tries until mines limit is reached
  populateWithMines() {
    let mineCounter = 0;
    while (mineCounter < this.minesNo) {
    this.grid.forEach(row => {
      row.forEach(cell => {
        if (Math.random(1) < this.minesFactor && mineCounter < this.minesNo){
          cell.isMine = true;
          mineCounter++;
          console.log('mina utworzona');
        }
      });
    });
    }
  }

  // each cell checks its neighbors and gets a number of neighboring mines
  populateWithNumbers() {
    this.grid.forEach(row => row.forEach(cell => cell.countNeighbors()));
  }

  // reveals the (clicked) cell
  reveal(cell) {
    // reveal 8 dookola jezeli nie miny
    // jezeli neighboringMines == 0 to reveal jeszcze raz jezeli nie miny
    // cell -> sprawdzana komorka - centrum kolka
    cell.flagged = false;
    cell.revealed = true;
    cell.checked = true;
    // if the cell is a mine - game over
    if (cell.isMine) {
      currentGame.revealAll();
      currentGame.playing = false;
    }
    // if the cell neighbors with any mines - check surrounding cells
    // if any surrounding cell is blank (non-mine and non-numbered) - flood reveal
    else if (cell.neighboringMines > 0) {
      for (let k = -1; k < 2; k++){
        for (let l = -1; l < 2; l++){
          let i = cell.xpos + k;
          let j = cell.ypos + l;
          if (i > -1 && i < currentGame.rowsNo && j > -1 && j < currentGame.columnsNo) {
            if (currentGame.grid[i][j].neighboringMines == 0 && !currentGame.grid[i][j].checked){
              currentGame.grid[i][j].checked = true;
              currentGame.reveal(currentGame.grid[i][j]);
              currentGame.revealSurrounding(currentGame.grid[i][j]);
            }
          }
        }
      }
    }
    // if the cell is blank - reveal neighboring cells (as there are surely
    // no mines there) and flood starting from any blank neighbor
    else if (cell.neighboringMines == 0){
      currentGame.revealSurrounding(cell);
      for (let k = -1; k < 2; k++){
        for (let l = -1; l < 2; l++){
          let i = cell.xpos + k;
          let j = cell.ypos + l;
          if (i > -1 && i < currentGame.rowsNo && j > -1 && j < currentGame.columnsNo) {
            if (currentGame.grid[i][j].neighboringMines == 0 && !currentGame.grid[i][j].checked){
              currentGame.grid[i][j].checked = true;
              currentGame.reveal(currentGame.grid[i][j]);
              currentGame.revealSurrounding(currentGame.grid[i][j]);
            }
          }
        }
      }
    }
  }

  // reveal 9 neighbors
  revealSurrounding(cell) {
    for (let k = -1; k < 2; k++){
      for (let l = -1; l < 2; l++){
        let i = cell.xpos + k;
        let j = cell.ypos + l;
        if (i > -1 && i < currentGame.rowsNo && j > -1 && j < currentGame.columnsNo) {
          if (!currentGame.grid[i][j].revealed) {
            currentGame.grid[i][j].revealed = true;
            currentGame.grid[i][j].flagged = false;
            }
        }
      }
    }
  }

  revealAll() {
    this.grid.forEach(row => row.forEach(cell => cell.revealed = true));
  }

  countFlagged() {
    let flaggedCounter = 0;
    this.grid.forEach(row => row.forEach(cell => {
      if (cell.flagged){flaggedCounter++}
    }));
    this.flaggedCounter = flaggedCounter;
    return flaggedCounter;
  }

  // not used in sap-script
  countRevealed() {
    let revealedCounter = 0;
    this.grid.forEach(row => row.forEach(cell => {
      if (cell.revealed){revealedCounter++}
    }));
    this.revealedCounter = revealedCounter;
    return revealedCounter;
  }

}
