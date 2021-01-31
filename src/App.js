import React from 'react';
import Phaser from 'phaser';
import io from 'socket.io';

import './App.css';

function App() {
  return (
    <div className='App'>
      <Game />
    </div>
  );
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.game = null;

    this.gameInit = this.gameInit.bind(this);
    this.preload = this.preload.bind(this);
    this.update = this.update.bind(this);
    this.create = this.create.bind(this);

    this.map = null;
    this.cursors = null;
    this.debugGraphics = null;
    this.helpText = null;
    this.player = null;
    this.showDebug = false;
    this.currentTileset = 1;
  }

  gameInit() {
    var config = {
      type: Phaser.WEBGL,
      width: '100%',
      height: '100%',
      backgroundColor: '#2d2d2d',
      parent: 'phaser',
      pixelArt: true,
      physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 } },
      },
      scene: {
        // Gets called by Phaser after init(). It is used to load assets
        preload: this.preload(),
        // Gets called by Phaser after init() and preload(). It is used to create your game objects
        create: this.create(),
        // Gets called by Phaser on each step or frame in the game
        update: this.update(),
      },
    };

    this.game = new Phaser.Game(config);
  }

  preload() {
    // We store the Component's this to access it in the scene
    const self = this;
    return function () {
      this.load.image('tiles', 'assets/catastrophi_tiles_16.png');
      this.load.image('tiles_red', 'assets/catastrophi_tiles_16_red.png');
      this.load.image('tiles_blue', 'assets/catastrophi_tiles_16_blue.png');
      this.load.tilemapCSV('map', 'assets/catastrophi_level2.csv');
      this.load.spritesheet('player', 'assets/spaceman.png', {
        frameWidth: 16,
        frameHeight: 16,
      });
    };
  }

  create() {
    this.socket = io();
    const self = this;
    return function (data) {
      function updateHelpText() {
        self.helpText.setText(
          'Arrow keys to move.' +
            '\nPress 1/2/3 to change the tileset texture.' +
            '\nCurrent texture: ' +
            self.currentTileset
        );
      }

      function drawDebug() {
        self.debugGraphics.clear();

        if (self.showDebug) {
          // Pass in null for any of the style options to disable drawing that component
          self.map.renderDebug(self.debugGraphics, {
            tileColor: null, // Non-colliding tiles
            collidingTileColor: new Phaser.Display.Color(243, 134, 48, 200), // Colliding tiles
            faceColor: new Phaser.Display.Color(40, 39, 37, 255), // Colliding face edges
          });
        }

        updateHelpText();
      }

      // When loading a CSV map, make sure to specify the tileWidth and tileHeight
      self.map = this.make.tilemap({
        key: 'map',
        tileWidth: 16,
        tileHeight: 16,
      });
      var tileset = self.map.addTilesetImage('tiles_red');
      var layer = self.map.createLayer(0, tileset, 0, 0);
      layer.setScale(2);

      //  This isn't totally accurate, but it'll do for now
      self.map.setCollisionBetween(54, 83);

      this.input.keyboard.on(
        'keydown-ONE',
        function (event) {
          var texture = this.sys.textures.get('tiles_red');
          self.currentTileset = 1;
          tileset.setImage(texture);
          updateHelpText();
        },
        this
      );

      this.input.keyboard.on(
        'keydown-TWO',
        function (event) {
          var texture = this.sys.textures.get('tiles_blue');
          self.currentTileset = 2;
          tileset.setImage(texture);
          updateHelpText();
        },
        this
      );

      this.input.keyboard.on(
        'keydown-THREE',
        function (event) {
          var texture = this.sys.textures.get('tiles');
          self.currentTileset = 3;
          tileset.setImage(texture);
          updateHelpText();
        },
        this
      );

      this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('player', { start: 8, end: 9 }),
        frameRate: 10,
        repeat: -1,
      });
      this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('player', { start: 1, end: 2 }),
        frameRate: 10,
        repeat: -1,
      });
      this.anims.create({
        key: 'up',
        frames: this.anims.generateFrameNumbers('player', {
          start: 11,
          end: 13,
        }),
        frameRate: 10,
        repeat: -1,
      });
      this.anims.create({
        key: 'down',
        frames: this.anims.generateFrameNumbers('player', { start: 4, end: 6 }),
        frameRate: 10,
        repeat: -1,
      });

      self.player = this.physics.add.sprite(100, 100, 'player', 1).setScale(2);
      self.player.setSize(10, 10, false);

      // Set up the player to collide with the tilemap layer. Alternatively, you can manually run
      // collisions in update via: this.physics.world.collide(player, layer).
      this.physics.add.collider(self.player, layer);

      this.cameras.main.setBounds(
        0,
        0,
        self.map.widthInPixels,
        self.map.heightInPixels
      );
      this.cameras.main.startFollow(self.player);

      self.debugGraphics = this.add.graphics();

      this.input.keyboard.on('down_67', function (event) {
        self.showDebug = !self.showDebug;
        drawDebug();
      });

      self.cursors = this.input.keyboard.createCursorKeys();

      self.helpText = this.add.text(16, 16, '', {
        fontSize: '20px',
        fill: '#ffffff',
      });
      self.helpText.setScrollFactor(0);
      updateHelpText();
    };
  }

  update() {
    const self = this;
    return function (time, delta) {
      self.player.body.setVelocity(0);
      // Horizontal movement
      if (self.cursors.left.isDown) {
        self.player.body.setVelocityX(-200);
      } else if (self.cursors.right.isDown) {
        self.player.body.setVelocityX(200);
      }
      // Vertical movement
      if (self.cursors.up.isDown) {
        self.player.body.setVelocityY(-200);
      } else if (self.cursors.down.isDown) {
        self.player.body.setVelocityY(200);
      }
      // Update the animation last and give left/right animations precedence over up/down animations
      if (self.cursors.left.isDown) {
        self.player.anims.play('left', true);
      } else if (self.cursors.right.isDown) {
        self.player.anims.play('right', true);
      } else if (self.cursors.up.isDown) {
        self.player.anims.play('up', true);
      } else if (self.cursors.down.isDown) {
        self.player.anims.play('down', true);
      } else {
        self.player.anims.stop();
      }
    };
  }

  componentDidMount() {
    this.gameInit();
  }

  componentDidUpdate(prevState, prevProps) {}

  render() {
    // Phaser target element
    return <div id='phaser'></div>;
  }
}

export default App;
