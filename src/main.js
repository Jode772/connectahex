class Node{
    constructor(idx, idy, x, y, value){
        this.idx = idx
        this.idy = idy
        this.x = x
        this.y = y
        this.value = value
    }
}
class Board{
    constructor(edgeWidth, boardX, boardY, distance){
        this.board = []
        this.edgeWidth = edgeWidth;
        this.distance = distance;
        this.pieceSize = distance * 0.8;
        this.verticalDistance = distance * Math.sin(Math.PI/3);

        let rowLength = edgeWidth
        let startX = boardX - 0.5 * (this.edgeWidth - 1) * distance;
        let startY = boardY - (this.edgeWidth - 1) * this.verticalDistance;

        for (let i = 0; i < 2 * edgeWidth - 1; i++){
            // initialise a row with zeros
            var row = []
            for (let j = 0; j < rowLength; j++){
                row.push(new Node(j, i, startX + this.distance * j, startY + this.verticalDistance*i, -1))
            }
            this.board.push(row)
            if (i < this.edgeWidth - 1){
                startX -= this.distance/2;
                rowLength++;
            }else{
                startX += this.distance/2;
                rowLength--;

            }
            
        }
    }

    placePiece(x, y, player){
        this.board[x][y].value = player;
    }

    isValidPoint(y, x){
        // check if the neighbour is valid
        // neight is valid if it is on the hexagonal board where each row is one longer than the previous until the middle row 
        // then each row is one shorter than the previous
        if (x < 0 || y < 0){
            return false;
        }else if (y >= 2*this.edgeWidth-1){
            return false;
        }
        else if(y >=0){
            if(y < this.edgeWidth){
                if (x > this.edgeWidth -1 + y){
                    return false;
                }
            }else{
                if (x > 2*this.edgeWidth -1- (y-this.edgeWidth + 1)){
                    return false;
                }

            }
        } 
        return true
    }
    getNeighbours(y, x){
        // get the neighbours of a given vertex
        // return an array of the neighbours
        let firstHalf = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1,-1],[1,1]]; 
        let secondHalf = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1,1],[1,-1]];
        let midPoint = [[-1, 0], [1, 0], [0, -1], [0, 1],[0,0],[0,0]];
        if (y < this.edgeWidth - 1){
            var neighbourCoord = firstHalf;
        }else if (y == this.edgeWidth - 1){
            var neighbourCoord = midPoint;
        }else{
            var neighbourCoord = secondHalf;
        }

        let neighbours = [];
        for (let i = 0; i < 6; i++){
            if (this.isValidPoint(y + neighbourCoord[i][1], x + neighbourCoord[i][0])){
                neighbours.push(this.board[y + neighbourCoord[i][1]][x + neighbourCoord[i][0]]);
            }
        }
        

        return neighbours
    }


    drawBoard(){
        // draw the board with p5
        // draw the vertices
        // clear p5 canvas

        noFill()
        for (let i = 0; i < this.edgeWidth *2 -1; i++){
            // loop over the columns
            for (let j = 0; j < this.board[i].length; j++){
               var node = this.board[i][j]
               var neighbours = this.getNeighbours(i, j);
               for (let k = 0; k < neighbours.length; k++){
                   strokeWeight(2);
                   stroke(0);
                   if(typeof neighbours[k]!== "undefined"){
                       line(node.x, node.y, neighbours[k].x, neighbours[k].y);
                   }
               }

                // draw the edges
            }    
            // decrement the offset if we're in the first half of the Board
        }
        for (let i = 0; i < this.edgeWidth *2 -1; i++){
        
            for (let j = 0; j < this.board[i].length; j++){
               var node = this.board[i][j]
                // loop over the rows
                if (node.value == -1){
                    fill(0);
                    circle(node.x, node.y, 10);
                }else if (node.value == 0){
                    fill(0, 0, 0);
                    circle(node.x, node.y, this.pieceSize);
                }else{
                    fill(255, 255, 255);
                    circle(node.x, node.y, this.pieceSize);
                }

            }    
        }
    }

    getClosestNode(x, y){
        // get the closest node to a given point
        let closestNode = this.board[0][0];
        let closestDistance = 999999;

        for (let i = 0; i < this.edgeWidth *2 -1; i++){
            for (let j = 0; j < this.board[i].length; j++){
                let node = this.board[i][j];
                let distance = Math.sqrt(Math.pow(node.x - x, 2) + Math.pow(node.y - y, 2));
                if (distance < closestDistance){
                    closestNode = node;
                    closestDistance = distance;
                }
            }
        }
        return closestNode;
    }

    drawPieceGhost(mouseX, mouseY, player){
        // draw the ghost of the piece that will be placed
        // get the closest node to the mouse
        let closestNode = this.getClosestNode(mouseX, mouseY);
        if (closestNode.value == -1 && player == 0){
            fill(0, 0, 0, 100);
            circle(closestNode.x, closestNode.y, this.pieceSize);
        }else if (closestNode.value == -1 && player == 1){
            fill(255, 255, 255, 100);
            circle(closestNode.x, closestNode.y, this.pieceSize);
        }
    }
}

var canvasWidth=window.innerWidth;
var canvasHeight=window.innerHeight;
var boardResolution = 9;
var stepSize = 50;
var currentTurn = 0;
var board;

function drawDescription(){
    fill(0);
    textSize(32);
    text("Rules of the game:", 20, 40);
    textSize(24);
    text("- Players alternate placing stones on intersection, one per turn.", 20, 80);
    text("- The game ends when all intersections are occupied.", 20, 120);
    text("- The player with the fewest disconnected groups of stones wins.", 20, 160);
}
function setup(){
    createCanvas(canvasWidth, canvasHeight);    
    console.log("Setup complete");

    board = new Board(boardResolution, canvasWidth/2, canvasHeight/2, stepSize);

    
}

function draw(){
    clear();
    background(161,102,47);
    drawDescription();
    noFill();
    circle(canvasWidth/2, canvasHeight/2, stepSize*2*(boardResolution-1))
    board.drawBoard();
    board.drawPieceGhost(mouseX, mouseY, currentTurn);
}
window.onresize = function() {
  // assigns new values for width and height variables
  w = window.innerWidth;
  h = window.innerHeight;  
  canvas.size(w,h);
}

function mouseClicked() {
    // get the closest node to the mouse
    console.log(currentTurn)
    let closestNode = board.getClosestNode(mouseX, mouseY);
    if (closestNode.value == -1){
        board.placePiece(closestNode.idy, closestNode.idx, currentTurn);
        currentTurn = (currentTurn + 1) % 2;
    }
    
}
