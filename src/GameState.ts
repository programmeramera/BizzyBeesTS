class GameState extends Phaser.State {
    backgroundTexture: Phaser.Sprite;
    foregroundTexture: Phaser.Sprite;
    hudTexture: Phaser.Sprite;
    flowerMapTexture: Phaser.Sprite;
    score: number;
    level: number;
    scoreText: Phaser.Text;
    levelText: Phaser.Text;
    gameOverText: Phaser.Text;
    columns : Array<Column>;
    gameOver : boolean;
    beePicker : BeePicker;

    create() {
        this.score = 0;
        this.level = 1;
        this.gameOver = false;

        this.backgroundTexture = this.add.sprite( 0, 0, TEXTURE_BACKGROUND );
        this.foregroundTexture = this.add.sprite( 0, 0, TEXTURE_FOREGROUND );
        this.hudTexture = this.add.sprite( 7,7, TEXTURE_HUD );

        this.add.text(100, 28, "Marathon", FONT_MEDIUM).anchor.set(0.5,0.5);
        //Print out instructions
        this.add.text(340, 28, "Match flowers and bees", FONT_SMALL).anchor.set(0.5,0.5);
        this.add.text(340, 55, "Rainbow flowers match", FONT_SMALL).anchor.set(0.5,0.5);
        this.add.text(340, 80, "with all bees", FONT_SMALL).anchor.set(0.5,0.5);
        //Print out goal message
        this.add.text(240, 130, "Collect Rainbow Flowers", FONT_LARGE).anchor.set(0.5,0.5);

        this.scoreText = this.add.text(140, 65, "0", { font: "34px Arial" });
        this.scoreText.visible = true;
        this.scoreText.anchor.set(0.5,0.5);

        this.levelText = this.add.text(55, 65, "1", { font: "34px Arial" });
        this.levelText.visible = true;
        this.levelText.anchor.set(0.5,0.5);

        this.columns = new Array<Column>();
        for (let i = 0; i < 5; i++) {
            this.columns.push(new Column(this.game, i));
        }
        this.beePicker = new BeePicker(this.game);

        this.gameOverText = this.add.text(240, 400,"GAME OVER", FONT_HUGE);
        this.gameOverText.anchor.set(0.5,0.5);
        this.gameOverText.visible = false;
    }

    update() {
        if (!this.gameOver) {
            if(this.input.activePointer.justPressed()) {
                var position = this.game.input.activePointer.position;
                let selectedBee = this.beePicker.getSelectedBee();
                if (selectedBee != undefined) {
                    //verify that we are tapping inside a column
                    if (position.x > 10 && position.x < 470 && position.y > 100 && position.y < 700) {
                        let rainbowColor = 6;
                        let selectedColumnIndex = Math.floor((position.x - 10) / FLOWER_COLUMN_WIDTH);
                        let selectedColumn = this.columns[selectedColumnIndex];
                        let selectedFlower = selectedColumn.getBottomFlower();

                        //check if we have a match or if it was a rainbow flower
                        if(selectedFlower != null && (selectedFlower.color == selectedBee.color || selectedFlower.color == rainbowColor)) {
                            //remove the bottom flower
                            selectedColumn.removeBottomFlower();

                            //replace the bee - making sure that there is always a match by passing in a list of all the bottom flower colors
                            let flowerColors = new Array<number>();
                            this.columns.forEach(element => {
                                let f = element.getBottomFlower();
                                if (f != null)
                                    flowerColors.push(f.color);

                            });
                            this.beePicker.removeAndReplaceSelectedBee(flowerColors);

                            //deselect the bee
                            this.beePicker.deselectAll();

                            //if it was a rainbow flower - add points
                            if (selectedFlower.color == rainbowColor) {
                                this.score += 1;
                                this.scoreText.text = "" + this.score;
                                //if we reached 10, 20, 30... points, increase the velocity to make the game harder as we go along
                                if ((this.score % 10) == 0) {
                                    this.level += 1;
                                    this.levelText.text = "" + this.level;

                                    this.columns.forEach(element => {
                                        element.velocity += 0.1;
                                    });
                                }
                            }
                        }
                    }
                }
            }

            var hasAnyFlowerReachedBottom = false;
            this.columns.forEach(element => {
                if (element.reachedBottom) {
                    hasAnyFlowerReachedBottom = true;
                }
            });

            if(hasAnyFlowerReachedBottom){
                // this.gameOver = true;
                // this.beePicker.alive = false;
                // this.gameOverText.visible = true;
                // this.columns.forEach(element => {
                //     element.alive = false;
                // });
                
                this.game.state.start(STATE_GAME_OVER,true,false,true,this.score);
            }
        }
    }
}