let player, ball, violetBricks, yellowBricks, redBricks, cursors;
let gameStarted= false;//tracks if game started or not
let OpeningText, gameOverText, playerWonText;

const config={
    type: Phaser.AUTO,//calling Phaser.auto makes the game reender in webgl first and if webgl doesnt render it renders in canvas
    parent: 'game',//calls the html with id-game
    width: 800,//width of game screen
    height: 640,//height of game screen
    scale: {
        mode: Phaser.Scale.RESIZE,//tells phaser how to use space of parent, makes sure that game fits in parent div 
        autoCenter: Phaser.Scale.CENTER_BOTH//tells phaser how to center game in parent div, we centered the game vertically and horizontally within parent div
    },
    scene:{//scene object that uploads the scenes
        preload,
        create,
        update,
    },
    physics: {
        default: 'arcade',//this tells phaser what engine to use, they have three engines,
        //Arcade, Impact and Matter, we used aarcade cause its easiest
        arcade: {//the arcade engine includes gravity but we dont need that so we turn it off
            gravity: false 
        },
    }
};

const game =new Phaser.Game(config);//calls the game
function preload(){ //renders the images before the game starts
    this.load.image('ball', 'assets/images/ball_32_32.png')//this.load pre loads the images
    this.load.image('paddle','assets/images/paddle_128_32.png')//'paddle' is the key to call the image
    this.load.image('brick1', 'assets/images/brick1_64_32.png')
    this.load.image('brick2', 'assets/images/brick2_64_32.png')
    this.load.image('brick3', 'assets/images/brick3_64_32.png')
}
function create() {
    player=this.physics.add.sprite(// we are setting the values of the variables we created
        400,//x coordinate
        600,//y coordinate
      'paddle',
    );
    ball=this.physics.add.sprite(
        400,
        565,
       'ball',
    );
    violetBricks=this.physics.add.group({//creates a group of sprites
        key: 'brick1',//the key of the sprite were creating from the preload function
        repeat: 9,//how many times after the initial creation of the sprite are we going to create the sprite
        //so a total of 10 sprites are made
        immovable: true,//The arcade physics engine will make the ball stops when it slows down so we have to access this property so the ball doesnt lose velocity
        setXY:{
            x: 80,//sets the x value of the first sprite
            y: 140,//sets the y value of the second sprite
            stepX: 70//sets the x distance in between each sprite(theres also a stepY but we dont need that)
        }
    });
    yellowBricks=this.physics.add.group({
        key: 'brick2',
        repeat: 9,
        immovable: true,
        setXY: {
            x: 80,
            y: 90,
            stepX: 70
        }
    });

    redBricks=this.physics.add.group({
        key: 'brick3',
        repeat: 9,
        immovable: true,
        setXY: {
            x: 80,
            y: 40,
            stepX: 70
        }
    });
    cursors=this.input.keyboard.createCursorKeys();//cursor keys in phaser tracks the usage pf
    //6 keyboard keys: up, down, right, down, left, shift and space
    player.setCollideWorldBounds(true);//a phaser method that enables collision with the paddle and the screen bounds so it doesnt go through the screen
    ball.setCollideWorldBounds(true);//same thing but for the ball
    ball.setBounce(1,1);//phaser method which gives ball bounce at a consistent (x,y) rate
    this.physics.world.checkCollision.down=false;//this method diables the ball collision with the bottom of the world
    //Ball and Brick Collision
    this.physics.add.collider(ball, violetBricks, hitBrick,null,this);// TLDR: execute the hit brick function when the ball collides with different sprite groups |these methods takes two objects then the next argument is what the object will do (collide). 
    this.physics.add.collider(ball, yellowBricks, hitBrick,null,this);
    this.physics.add.collider(ball, redBricks, hitBrick,null,this);
    //Player Collision
    player.setImmovable(true);//this makes sure that the paddle is immovable
    this.physics.add.collider(ball, player, hitPlayer, null, this);//executes the hitPlayer function when the ball collides with the paddle
    //the first two arguments are X and Y coordinates, we use the game scenes iwdth and height to center the text
    //the third argument is the text to display 
    //the fourth argument is the js object that has font related data
    //START SCREEN TEXT
    OpeningText=this.add.text(
        this.physics.world.bounds.width/2,
        this.physics.world.bounds.height/2,
        'Press SPACE to Start',
        {
            fontFamily: 'Monaco, Courier, monospace',
            fontSize: '50px',
            fill: '#fff'  
        },
    );
    OpeningText.setOrigin(0.5);
    //game over text
    gameOverText=this.add.text(
        this.physics.world.bounds.width/2,
        this.physics.world.bounds.height/2,
        'Game Over',
        {
            fontFamily: 'Monaco, Courier, monospace',
            fontSize: '50px',
            fill: '#fff'
        },
    );
    gameOverText.setOrigin(0.5);
    //make it invisible until the player loses
    gameOverText.setVisible(false);
    //Create the game won text
    playerWonText = this.add.text(
        this.physics.world.bounds.width / 2,
        this.physics.world.bounds.height / 2,
        'You won!',
        {
          fontFamily: 'Monaco, Courier, monospace',
          fontSize: '50px',
          fill: '#fff'
        },
      );
      
      playerWonText.setOrigin(0.5);
      
      // Make it invisible until the player wins
      playerWonText.setVisible(false);
}
function update() {    
    if(isGameOver(this.physics.world)){
        gameOverText.setVisible(true);
        ball.disableBody(true, true);//the ball becomes inactive and invisible
    }else if(isWon()){
        playerWonText.setVisible(true);
        ball.disableBody(true, true);
    }else{
        player.body.setVelocityX(0);// player stays still if no key is pressed
        if(cursors.left.isDown){
            player.body.setVelocityX(-350);//if left key is pushed down the paddle moves 350 pixels to the left
        }else if(cursors.right.isDown){
            player.body.setVelocityX(350);//if right key is pushed, paddle goes right by 350 pixels
        }
        if(!gameStarted){
            ball.setX(player.x);//if the game isnt started the balls x coordinate follows the paddels 
        }
        if(cursors.space.isDown){//if the user hits the spacebar the game starts and the ball shoots up 
            gameStarted=true;
            ball.setVelocity(-200);
            OpeningText.setVisible(false);//makes the opening text disappear when the method is called
        }
    }
}
/*the game is over when the ball falls to the bottom of the screen
this means that the y coordinate of the ball has to be greater than 
the height of the game world. so if the game world height is
640, the ball height has to be atleast 641(because 0,0 in phaser starts 
    at the top left) to count as out
*/
function isGameOver(world){
    return ball.body.y > world.bounds.height; //if ball height is greater than world height
}

/*to win all the bricks have to go. Sprites have an active property
so if all sprites arent active(ie. equal to 0) then the player won the game
countActive is the method that counts all the active sprites in the object
*/
function isWon(){
    return violetBricks.countActive() + redBricks.countActive() + yellowBricks.countActive() ==0;
}
//this method erases the bricks when the ball collides and determines the direction of the ball randomly when the ball stops moving
function hitBrick(ball, brick){
    brick.disableBody(true, true);//when function is called by a collsion, the brick becomes inactive AND it hides it form the screen (hence the (true,true) argument)
    if(ball.body.velocity.x == 0){//if the ball has 0 velocity then we set the velocity based off a random number
        randNum=Math.random();
        if(randNum >= 0.5){//if the random number given is bigger than 0.5, the ball goes to the right by 150 px
            ball.body.setVelocityx(150);
        }else{
            ball.body.setVelocityX(-150);//if the random number given is smaller than 0.5, the ball goes to the left by 150 px
        }
    }
}
function hitPlayer(ball, player){
    //increase ball velocity after it bounces
    ball.setVelocityY(ball.body.velocity.y-5);

    let newXVelocty=Math.abs(ball.body.velocity.x)+5;
    // If the ball is to the left of the player, ensure the X Velocity is negative
    if(ball.x <player.x){
        ball.setVelocityX(-newXVelocty);
    }else{
        ball.setVelocityX(newXVelocty);
    }
}
     