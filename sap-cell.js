class Cell{
  constructor(x,y,mine,neighbors) {
    this.xpos = x;
    this.ypos = y;
    this.isMine = mine;
    this.neighboringMines = neighbors;
    this.revealed = false;
    this.checked = false;
    this.flagged = false;
  }

  countNeighbors() {
    let neighboringMinesCounter = 0;
    for (let k = -1; k < 2; k++){
      for (let l = -1; l < 2; l++){
        let i = this.xpos + k;
        let j = this.ypos + l;
        if (i > -1 && i < currentGame.rowsNo && j > -1 && j < currentGame.columnsNo) {
          if (currentGame.grid[i][j].isMine){
            neighboringMinesCounter++;
          }
        }
      }
    }
    this.neighboringMines = neighboringMinesCounter;
  }

}
