import React from "react";
import Phaser from "phaser";
import io from "socket.io-client";

export class Game extends React.Component {
  constructor(props) {
    super(props);
    // currently all parts of phaser are declared here and attached to the class
    // it can't be in state since we don't want the component to render on each change
    this.game = null;
    this.spaceId = props.spaceId;

    this.gameInit = this.gameInit.bind(this);
    this.preload = this.preload.bind(this);
    this.update = this.update.bind(this);
    this.create = this.create.bind(this);
    this.addPlayer = this.addPlayer.bind(this);
    this.addOtherPlayers = this.addOtherPlayers.bind(this);
    this.onNearbyPlayers = this.onNearbyPlayers.bind(this);

    this.map = null;
    this.cursors = null;
    this.debugGraphics = null;
    this.helpText = null;
    this.player = null;
    this.showDebug = false;
    this.currentTileset = 1;
    this.videoDistanceThreshold = 70;
  }

  gameInit() {
    // game properties that will be attached to the game instance
    var config = {
      type: Phaser.WEBGL,
      // 100% means the game will take all the page's space
      width: "100%",
      height: "100%",
      backgroundColor: "#2d2d2d",
      parent: "phaser",
      pixelArt: true,
      physics: {
        default: "arcade",
        arcade: { gravity: { y: 0 } },
      },
      scene: {
        // gets called by Phaser after init(). it is used to load assets
        preload: this.preload(),
        // gets called by Phaser after init() and preload(). it is used to create your game objects
        create: this.create(),
        // gets called by Phaser on each step or frame in the game
        update: this.update(),
      },
    };
    // game instance
    this.game = new Phaser.Game(config);
  }

  preload() {
    // we store the Component's this in self to preserve it (other this will refer to other scopes)
    const self = this;
    return function () {
      // images ment to be used for the game are loaded here
      this.load.image("tiles", "/assets/catastrophi_tiles_16.png");
      this.load.image("tiles_red", "/assets/catastrophi_tiles_16_red.png");
      this.load.image("tiles_blue", "/assets/catastrophi_tiles_16_blue.png");
      this.load.tilemapCSV("map", "/assets/catastrophi_level2.csv");
      // this can be customized to be our user emoji
      this.load.spritesheet("player", "/assets/spaceman.png", {
        frameWidth: 16,
        frameHeight: 16,
      });
    };
  }

  addPlayer(scene, player, layer) {
    // function responsable of creating the multiplayer feature
    this.player = scene.physics.add
      .sprite(player.x, player.y, "player", 1)
      .setScale(2);
    this.player.setSize(10, 10, false);
    scene.cameras.main.startFollow(this.player);
    scene.physics.add.collider(this.player, layer);
  }

  addOtherPlayers(scene, player, layer) {
    // function responsable of creating the multiplayer feature
    const newPlayer = scene.physics.add
      .sprite(player.x, player.y, "player", 1)
      .setScale(2);
    newPlayer.setSize(10, 10, false);
    scene.physics.add.collider(newPlayer, layer);
    newPlayer.playerId = player.playerId;
    scene.otherPlayers.add(newPlayer);
  }

  onNearbyPlayers(player, others) {
    // https://www.varsitytutors.com/hotmath/hotmath_help/topics/distance-formula#:~:text=The%20distance%20formula%20is%20really,AB%20as%20its%20hypotenuse.&text=Since%20AC%20is%20a,2%E2%88%92x1)%7C%20.
    function pytagoras(x1, y1, x2, y2) {
      return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    others.getChildren().forEach((otherPlayer) => {
      const distance = pytagoras(
        player.x,
        player.y,
        otherPlayer.x,
        otherPlayer.y
      );
      if (distance <= this.videoDistanceThreshold) {
        this.helpText.setText(
          `Player ${otherPlayer.playerId} is ${Math.floor(
            distance
          )} pixels away!`
        );
        // TODO: Trigger chatroom between players here
      } else {
        // TODO: Remove chatroom between players here
        this.helpText.setText("");
      }
    });
  }

  create() {
    const self = this;

    function updateHelpText() {
      self.helpText.setText(
        "WASD keys to move." +
          "\nPress 1/2/3 to change the tileset texture." +
          "\nCurrent texture: " +
          self.currentTileset
      );
    }

    return function (data) {
      function drawDebug() {
        self.debugGraphics.clear();

        if (self.showDebug) {
          // pass in null for any of the style options to disable drawing that component
          self.map.renderDebug(self.debugGraphics, {
            tileColor: null, // Non-colliding tiles
            collidingTileColor: new Phaser.Display.Color(243, 134, 48, 200), // Colliding tiles
            faceColor: new Phaser.Display.Color(40, 39, 37, 255), // Colliding face edges
          });
        }

        updateHelpText();
      }

      // loading a CSV map to give the tileset depth and work with collision
      self.map = this.make.tilemap({
        key: "map",
        tileWidth: 16,
        tileHeight: 16,
      });
      var tileset = self.map.addTilesetImage("tiles_red");
      var layer = self.map.createLayer(0, tileset, 0, 0);
      layer.setScale(2);

      // add more players to the same group
      this.otherPlayers = this.physics.add.group();

      this.socket = io({
        // query === /space/:whatIsWrittenInHere
        query: {
          spaceId: self.spaceId,
        },
      });
      this.socket.on("currentPlayers", (players) => {
        Object.keys(players).forEach((id) => {
          if (players[id].playerId === this.socket.id) {
            self.addPlayer(this, players[id], layer);
          } else {
            self.addOtherPlayers(this, players[id], layer);
          }
        });
      });
      // see line 45 on server.js and addOtherPlayers class method
      this.socket.on("newPlayer", (playerInfo) => {
        self.addOtherPlayers(this, playerInfo, layer);
      });
      // see line 50 on server.js
      this.socket.on("userDisconnected", (playerId) => {
        this.otherPlayers.getChildren().forEach((otherPlayer) => {
          if (playerId === otherPlayer.playerId) {
            otherPlayer.destroy();
          }
        });
      });
      // see line 60 in server.js
      this.socket.on("playerMoved", (playerInfo) => {
        this.otherPlayers.getChildren().forEach((otherPlayer) => {
          if (playerInfo.playerId === otherPlayer.playerId) {
            otherPlayer.setPosition(playerInfo.x, playerInfo.y);
          }
        });
        self.onNearbyPlayers(self.player, this.otherPlayers);
      });

      self.map.setCollisionBetween(54, 83);

      // with keys 1 2 and 3 titlesets change image
      this.input.keyboard.on(
        "keydown-ONE",
        function (event) {
          var texture = this.sys.textures.get("tiles_red");
          self.currentTileset = 1;
          tileset.setImage(texture);
          updateHelpText();
        },
        this
      );

      this.input.keyboard.on(
        "keydown-TWO",
        function (event) {
          var texture = this.sys.textures.get("tiles_blue");
          self.currentTileset = 2;
          tileset.setImage(texture);
          updateHelpText();
        },
        this
      );

      this.input.keyboard.on(
        "keydown-THREE",
        function (event) {
          var texture = this.sys.textures.get("tiles");
          self.currentTileset = 3;
          tileset.setImage(texture);
          updateHelpText();
        },
        this
      );

      // set the camera bounds to be the size of the image
      this.cameras.main.setBounds(
        0,
        0,
        self.map.widthInPixels,
        self.map.heightInPixels
      );

      self.debugGraphics = this.add.graphics();

      this.input.keyboard.on("down_67", function (event) {
        self.showDebug = !self.showDebug;
        drawDebug();
      });

      // user will move with WASD keys
      self.cursors = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D,
      });

      self.helpText = this.add.text(16, 16, "", {
        fontSize: "20px",
        fill: "#ffffff",
      });
      self.helpText.setScrollFactor(0);
      updateHelpText();
    };
  }

  update() {
    const self = this;
    return function (time, delta) {
      const updatePlayer = () => {
        self.player.body.setVelocity(0);

        // for triggering horizontal movement
        if (self.cursors.left.isDown) {
          self.player.body.setVelocityX(-200);
        } else if (self.cursors.right.isDown) {
          self.player.body.setVelocityX(200);
        }
        // for triggering vertical movement
        if (self.cursors.up.isDown) {
          self.player.body.setVelocityY(-200);
        } else if (self.cursors.down.isDown) {
          self.player.body.setVelocityY(200);
        }

        // emit our position to the socket.io server
        const { x, y } = self.player;
        if (self.player.oldPosition) {
          if (
            x !== self.player.oldPosition.x ||
            y !== self.player.oldPosition.y
          ) {
            this.socket.emit("playerMovement", {
              x,
              y,
            });

            self.onNearbyPlayers(self.player, this.otherPlayers);
          }
        }
        self.player.oldPosition = {
          x,
          y,
        };
      };

      self.player && updatePlayer();
    };
  }

  componentDidMount() {
    // initiating the game once
    this.gameInit();
  }

  render() {
    // phaser target element
    return <div id="phaser"></div>;
  }
}
