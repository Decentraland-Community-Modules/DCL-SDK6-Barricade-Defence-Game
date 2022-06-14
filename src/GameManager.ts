/*     GAME MANAGER
    this module is used to manage the initialization and processing
    of the barricade defender game. the majority of the game's functionality
    exsists in external modules that are controlled through this manager.

    Author: Alex Pazder, thecryptotrader69@gmail.com
*/
import { WaveManager } from "./WaveManager";
import { ScoringManager } from "./ScoringManager";
import { WeaponRepo } from "./WeaponRepo";
import { PerkRepo } from "./PerkRepo";
import { StoreManager } from "./StoreManager";
import { FiringManager } from "./FiringManager";

@Component("GameManager")
export class GameManager extends Entity
{
  /* DEBUGGING */
  IsDebugging:boolean = true;

  /* MANAGERS */
  public static INSTANCE:GameManager;
  public waveManager:WaveManager;
  public scoringManager:ScoringManager;
  public weaponRepo:WeaponRepo;
  public perkRepo:PerkRepo;
  public storeManager:StoreManager;
  public firingManager:FiringManager;

  /* GAME SETTINGS */
  game_state:number = 0;
  //game states
  state_text:string[] =
  [
    "Uninitialized...", "Game Ready", "IP: Wave", "IP: Shopping", "Game Won", "Game Lost"
  ];
  state_colour:Color4[] = 
  [
    Color4.Black(), Color4.Yellow(), Color4.Green(), Color4.Green(), Color4.Purple(), Color4.Red()
  ];
  //difficulty setting
  //  ranges from (0:very easy) to (4: very hard)
  difficulty:number = 2;
  //  difficulty display text
  difficulty_text:string[] =
  [
    "Very Easy", "Easy", "Standard", "Hard", "Very Hard" 
  ];
  //  different health per difficulty
  difficulty_mod_health:number[] = 
  [
    0.65, 0.8, 1.0, 1.1, 1.2
  ];
  //  different point worth per difficulty
  difficulty_mod_points:number[] = 
  [
    1.35, 1.15, 1.0, 0.90, 0.75
  ];

  /* 2D DISPLAY: GAME STATE */
  public ui_canvas:UICanvas = new UICanvas();
  rect:UIContainerRect = new UIContainerRect(this.ui_canvas);
  ui_text_title:UIText = new UIText(this.rect);
  ui_text_state:UIText = new UIText(this.rect);
  //create 2d game state ui display
  prepareGameStateUI()
  {
    //ui
    //  rect container
    this.rect.width = 240;
    this.rect.height = 45;
    this.rect.positionX = 165;
    this.rect.positionY = 58;
    this.rect.hAlign = "left";
    this.rect.vAlign = "top";
    this.rect.color = Color4.Gray();
    this.rect.opacity = 0.8;
    //  texts -- title
    this.ui_text_title.value = "Barricade Defender";
    this.ui_text_title.fontSize = 20;
    this.ui_text_title.width = "70%";
    this.ui_text_title.height = 20;
    this.ui_text_title.positionY = -5;
    this.ui_text_title.hAlign = "center";
    this.ui_text_title.vAlign = "top";
    //  texts -- game state
    this.ui_text_state.value = "Game Status";
    this.ui_text_state.fontSize = 15;
    this.ui_text_state.width = "85%";
    this.ui_text_state.height = 20;
    this.ui_text_state.positionY = -20;
    this.ui_text_state.hAlign = "center";
    this.ui_text_state.vAlign = "top";
  }
  public MoveUiObject(x:number, y:number) { this.rect.positionX = x; this.rect.positionY = y; }

  /* 3D DISPLAY: SETTINGS MANAGER */
  material_menu:Material = new Material();
  menu_object:Entity = new Entity();
  menu_object_parent:Entity = new Entity();
  menu_object_tile_text:Entity = new Entity();
  menu_object_desc_text:Entity = new Entity();
  menu_object_state_text:Entity = new Entity();
  menu_object_difficulty:Entity = new Entity();
  menu_object_difficulty_text:Entity = new Entity();
  menu_object_difficulty_inc:Entity = new Entity();
  menu_object_difficulty_inc_text:Entity = new Entity();
  menu_object_difficulty_dec:Entity = new Entity();
  menu_object_difficulty_dec_text:Entity = new Entity();
  menu_object_reset:Entity = new Entity();
  menu_object_reset_text:Entity = new Entity();
  menu_object_start:Entity = new Entity();
  menu_object_start_text:Entity = new Entity();
  
  prepareMenuDisplay()
  {
    //  prepare parent object
    this.menu_object_parent.setParent(this);
    this.menu_object_parent.addComponent(new Transform
    ({
        position: new Vector3(0,3,0),
        scale: new Vector3(2,1,2),
        rotation: new Quaternion().setEuler(270,0,0)
    }));
    //  prepare title display
    //    object: main
    this.menu_object.addComponent(this.material_menu);
    this.menu_object.setParent(this.menu_object_parent);
    this.menu_object.addComponent(new GLTFShape("models/DisplayScreenMedium_0.glb"));
    this.menu_object.addComponent(new Transform
    ({
        position: new Vector3(0,0,0),
        scale: new Vector3(1,1,1),
        rotation: new Quaternion().setEuler(90,0,0)
    }));
    //    text: title
    this.menu_object_tile_text.setParent(this.menu_object_parent);
    this.menu_object_tile_text.addComponent(new TextShape("Welcome To Barricade Defender!"));
    this.menu_object_tile_text.getComponent(TextShape).fontSize = 2;
    this.menu_object_tile_text.getComponent(TextShape).color = Color3.Black();
    this.menu_object_tile_text.addComponent(new Transform
    ({
        position: new Vector3(0,0.05,0.88),
        scale: new Vector3(0.8,0.9,0.8),
        rotation: new Quaternion().setEuler(90,0,0)
    }));
    //    text: desc
    this.menu_object_desc_text.setParent(this.menu_object_parent);
    this.menu_object_desc_text.addComponent(new TextShape("Grab your weapons, don your armour, and\nget ready to kill some zombies! Earn credits\nby killing enemies, spend credits on perks\nand equipment to kill more enemies!"));
    this.menu_object_desc_text.getComponent(TextShape).fontSize = 1;
    this.menu_object_desc_text.getComponent(TextShape).color = Color3.Black();
    this.menu_object_desc_text.addComponent(new Transform
    ({
        position: new Vector3(0,0.15,0.45),
        scale: new Vector3(1,1,1),
        rotation: new Quaternion().setEuler(90,0,0)
    }));
    //    text: game state
    this.menu_object_state_text.setParent(this.menu_object_parent);
    this.menu_object_state_text.addComponent(new TextShape(this.state_text[0]));
    this.menu_object_state_text.getComponent(TextShape).fontSize = 2;
    this.menu_object_state_text.getComponent(TextShape).color = Color3.Black();
    this.menu_object_state_text.addComponent(new Transform
    ({
        position: new Vector3(0,0.15,0.0),
        scale: new Vector3(1,1,1),
        rotation: new Quaternion().setEuler(90,0,0)
    }));
    //    text: difficulty
    this.menu_object_difficulty_text.setParent(this.menu_object_parent);
    this.menu_object_difficulty_text.addComponent(new TextShape(this.difficulty_text[this.difficulty]));
    this.menu_object_difficulty_text.getComponent(TextShape).fontSize = 1;
    this.menu_object_difficulty_text.getComponent(TextShape).color = Color3.Black();
    this.menu_object_difficulty_text.addComponent(new Transform
    ({
        position: new Vector3(0,0.15,-0.35),
        scale: new Vector3(1.25,1.25,1.25),
        rotation: new Quaternion().setEuler(90,0,0)
    }));
    //  difficulty increase
    //    object
    this.menu_object_difficulty_inc.addComponent(this.material_menu);
    this.menu_object_difficulty_inc.setParent(this.menu_object_parent);
    this.menu_object_difficulty_inc.addComponent(new GLTFShape("models/Button_Square.glb"));
    this.menu_object_difficulty_inc.addComponent( new Transform
    ({
        position: new Vector3(0.57,0.15,-0.35),
        scale: new Vector3(0.35,0.55,0.35),
        rotation: new Quaternion().setEuler(0,0,0)
    }));
    this.menu_object_difficulty_inc.addComponent
    (
      new OnPointerDown 
      ( 
        (e) => 
        { 
          this.difficulty++; 
          if(this.difficulty >= this.difficulty_text.length) { this.difficulty = this.difficulty_text.length-1; }
          this.menu_object_difficulty_text.getComponent(TextShape).value = this.difficulty_text[this.difficulty];
        }, 
        { button: ActionButton.PRIMARY } 
      )
    );
    //    text
    this.menu_object_difficulty_inc_text.setParent(this.menu_object_difficulty_inc);
    this.menu_object_difficulty_inc_text.addComponent(new TextShape("V"));
    this.menu_object_difficulty_inc_text.getComponent(TextShape).fontSize = 4;
    this.menu_object_difficulty_inc_text.addComponent(new Transform
    ({
        position: new Vector3(0,0.15,0),
        scale: new Vector3(1.5,1,1),
        rotation: new Quaternion().setEuler(90,0,90)
    }));
    //  difficulty decrease
    //    object
    this.menu_object_difficulty_dec.addComponent(this.material_menu);
    this.menu_object_difficulty_dec.setParent(this.menu_object_parent);
    this.menu_object_difficulty_dec.addComponent(new GLTFShape("models/Button_Square.glb"));
    this.menu_object_difficulty_dec.addComponent( new Transform
    ({
        position: new Vector3(-0.57,0.15,-0.35),
        scale: new Vector3(0.35,0.55,0.35),
        rotation: new Quaternion().setEuler(0,0,0)
    }));
    this.menu_object_difficulty_dec.addComponent
    (
      new OnPointerDown 
      ( 
        (e) => 
        { 
          this.difficulty--; 
          if(this.difficulty < 0) { this.difficulty = 0; } 
          this.menu_object_difficulty_text.getComponent(TextShape).value = this.difficulty_text[this.difficulty];
        }, 
        { button: ActionButton.PRIMARY } 
      )
    );
    //    text
    this.menu_object_difficulty_dec_text.setParent(this.menu_object_difficulty_dec);
    this.menu_object_difficulty_dec_text.addComponent(new TextShape("V"));
    this.menu_object_difficulty_dec_text.getComponent(TextShape).fontSize = 4;
    this.menu_object_difficulty_dec_text.addComponent(new Transform
    ({
      position: new Vector3(0,0.15,0),
      scale: new Vector3(1.5,1,1),
      rotation: new Quaternion().setEuler(90,0,-90)
    }));
    //  create reset button
    //    object
    this.menu_object_reset.addComponent(this.material_menu);
    this.menu_object_reset.setParent(this.menu_object_parent);
    this.menu_object_reset.addComponent(new GLTFShape("models/Button_Long.glb"));
    this.menu_object_reset.addComponent( new Transform
    ({
        position: new Vector3(-0.40,0.15,-0.75),
        scale: new Vector3(0.35,0.55,0.35),
        rotation: new Quaternion().setEuler(0,0,0)
    }));
    this.menu_object_reset.addComponent
    (
      new OnPointerDown 
      ( 
        (e) => 
        { 
          this.SetGameState(1); 
        }, 
        { button: ActionButton.PRIMARY } 
      )
    );
    //    text
    this.menu_object_reset_text.setParent(this.menu_object_reset);
    this.menu_object_reset_text.addComponent(new TextShape("Reset"));
    this.menu_object_reset_text.getComponent(TextShape).fontSize = 4;
    this.menu_object_reset_text.addComponent(new Transform
    ({
      position: new Vector3(0,0.15,0),
      scale: new Vector3(1,1,1),
      rotation: new Quaternion().setEuler(90,0,0)
    }));
    //  create start button
    //    object
    this.menu_object_start.addComponent(this.material_menu);
    this.menu_object_start.setParent(this.menu_object_parent);
    this.menu_object_start.addComponent(new GLTFShape("models/Button_Long.glb"));
    this.menu_object_start.addComponent( new Transform
    ({
        position: new Vector3(0.40,0.15,-0.75),
        scale: new Vector3(0.35,0.55,0.35),
        rotation: new Quaternion().setEuler(0,0,0)
    }));
    this.menu_object_start.addComponent
    (
      new OnPointerDown
      (
        (e) => 
        { 
          if(this.game_state == 0 || this.game_state == 4 || this.game_state == 5) this.SetGameState(1); 
          else if(this.game_state == 1) this.SetGameState(3); 
        },
        { button: ActionButton.PRIMARY }
      )
    );
    //    text
    this.menu_object_start_text.setParent(this.menu_object_start);
    this.menu_object_start_text.addComponent(new TextShape("Start"));
    this.menu_object_start_text.getComponent(TextShape).fontSize = 4;
    this.menu_object_start_text.addComponent(new Transform
    ({
      position: new Vector3(0,0.15,0),
      scale: new Vector3(1,1,1),
      rotation: new Quaternion().setEuler(90,0,0)
    }));
  }
  public MoveMenuDisplay(x:number, y:number, z:number) { this.menu_object_parent.getComponent(Transform).position = new Vector3(x,y,z); }
  public RotateMenuDisplay(x:number, y:number, z:number) { this.menu_object_parent.getComponent(Transform).rotation = new Quaternion(x,y,z); }
  
  /* LOBBY DESK BLOCKER */
  material_blocker:Material = new Material();
  blocker_parent:Entity = new Entity();
  blocker_object:Entity = new Entity();
  blocker_button_object:Entity = new Entity();
  blocker_button_text:Entity = new Entity();
  blocker_wave_text:Entity = new Entity();

  prepareBlocker() 
  { 
    //  prepare parent
    this.blocker_parent.setParent(this);
    this.blocker_parent.addComponent(new Transform
    ({
        position: new Vector3(24,3,16),
        scale: new Vector3(1,1,1),
        rotation: new Quaternion().setEuler(270,0,0)
    }));
    //  prepare blocker obj
    this.blocker_object.setParent(this.blocker_parent);
    this.blocker_object.addComponent(new BoxShape());
    this.blocker_object.addComponent(new Transform
    ({
        position: new Vector3(0,0,0),
        scale: new Vector3(20,4,0.1),
        rotation: new Quaternion().setEuler(270,0,0)
    }));
    //  prepare blocker button obj
    //    object
    this.blocker_button_object.setParent(this.blocker_parent);
    this.blocker_button_object.addComponent(new CylinderShape());
    this.blocker_button_object.addComponent(new Transform
    ({
        position: new Vector3(0,0,0),
        scale: new Vector3(3,0.45,3),
        rotation: new Quaternion().setEuler(0,0,0)
    }));
    this.blocker_button_object.addComponent
    (
      new OnPointerDown 
      ( 
        (e) => 
        {
          //start next wave
          if(this.game_state == 3)
          {
            this.SetGameState(2);
          }
        }, 
        { button: ActionButton.PRIMARY } 
      )
    );
    //    text: title
    this.blocker_button_text.setParent(this.blocker_parent);
    this.blocker_button_text.addComponent(new TextShape("LAUNCH"));
    this.blocker_button_text.getComponent(TextShape).fontSize = 8;
    this.blocker_button_text.getComponent(TextShape).color = Color3.Black();
    this.blocker_button_text.addComponent(new Transform
    ({
        position: new Vector3(0,0.5,0),
        scale: new Vector3(1,1,1),
        rotation: new Quaternion().setEuler(90,0,0)
    }));
    //    text: wave
    this.blocker_wave_text.setParent(this.blocker_parent);
    this.blocker_wave_text.addComponent(new TextShape("WAVE: ###"));
    this.blocker_wave_text.getComponent(TextShape).fontSize = 5;
    this.blocker_wave_text.getComponent(TextShape).color = Color3.Black();
    this.blocker_wave_text.addComponent(new Transform
    ({
        position: new Vector3(0,0.5,1),
        scale: new Vector3(1,1,1),
        rotation: new Quaternion().setEuler(90,0,0)
    }));
  }

  //initializes manager upon object creation
  constructor()
  {
    //initialize object
    super();
    GameManager.INSTANCE = this;
    if(this.IsDebugging){ log("initializing game manager (barricade defender)..."); }
    this.addComponent(new GLTFShape("models/Building.glb"));
    this.addComponent(new Transform
    ({
      position: new Vector3(0,0,0),
      scale: new Vector3(1,1,1),
      rotation: new Quaternion().setEuler(0,0,0)
    }));
    
    //ready 2D UI (game state display)
    this.prepareGameStateUI();

    //ready 3D menu object (game settings)
    this.prepareMenuDisplay();
    this.MoveMenuDisplay(8, 2.75, 13.9);
    this.RotateMenuDisplay(-1, 0, 0);

    //ready blocker object
    this.prepareBlocker(); 

    //create other managers
    this.waveManager = new WaveManager(this);
    engine.addSystem(this.waveManager);
    this.scoringManager = new ScoringManager(this);
    this.weaponRepo = new WeaponRepo();
    this.perkRepo = new PerkRepo();
    this.storeManager = new StoreManager();
    engine.addEntity(this.storeManager);
    this.firingManager = new FiringManager(this);
    engine.addSystem(this.firingManager);

    //push game state to lobby
    this.SetGameState(1);

    if(this.IsDebugging){ log("initialization complete!"); }
  }
  
  //changes the game state and determines next action
  public SetGameState(state:number)
  {
    if(this.IsDebugging){ log("changing game state: "+state.toString()+"..."); }

    switch(state)
    {
      //lobby state
      case 1:
        //show blocker
        this.blocker_parent.setParent(this);
        this.blocker_wave_text.getComponent(TextShape).value = "";
        this.blocker_button_text.getComponent(TextShape).value = "";
        //reset all relevant managers
        this.scoringManager.Reset();
        this.waveManager.Reset();
      break
      //in progress: wave
      case 2:
        //hide blocker
        this.blocker_parent.setParent(null);
        engine.removeEntity(this.blocker_parent);
        //begin wave
        this.waveManager.WaveStart();
      break
      //in progress: shopping
      case 3:
        //show blocker
        this.blocker_parent.setParent(this);
        this.blocker_wave_text.getComponent(TextShape).value = "WAVE: "+(this.waveManager.wave_current+1).toString();
        this.blocker_button_text.getComponent(TextShape).value = "LAUNCH";
        //activate shopping

      break
      //game ends: victory
      case 4:
        //show blocker
        this.blocker_parent.setParent(this);
        this.blocker_wave_text.getComponent(TextShape).value = "";
        this.blocker_button_text.getComponent(TextShape).value = "VICTORY";
        //reset all relevant managers
        this.scoringManager.Reset();
        this.waveManager.Reset();
      break
      //game ends: defeat
      case 5:
        //show blocker
        this.blocker_parent.setParent(this);
        this.blocker_wave_text.getComponent(TextShape).value = "";
        this.blocker_button_text.getComponent(TextShape).value = "DEFEAT";
        //reset all relevant managers
        this.scoringManager.Reset();
        this.waveManager.Reset();
      break
    }

    //set new state
    this.game_state = state;
    //  ui update
    this.ui_text_state.value = "Game Status: "+this.state_text[this.game_state];
    this.ui_text_state.color = this.state_colour[this.game_state];
    //  3d menu update
    this.menu_object_state_text.getComponent(TextShape).value = this.state_text[this.game_state];

    if(this.IsDebugging){ log("game state has changed to: "+state.toString()+"!"); }
  }

  //begins the game, resetting all player stats and funds
  public StartGame()
  {
    //start game waves
    this.SetGameState(2);
  }

  //ends the game, creation of final report depends on victory status
  public EndGame(victory:boolean)
  {
    //clean up running game pieces
    //  managers
    this.scoringManager.Reset();
    this.waveManager.Reset();

    //determine end state
    if(victory)
    {
      this.SetGameState(4);
    }
    else
    {
      this.SetGameState(5);
    }
  }

  //
  public BarricadeDamaged(dam:number)
  {
    //remove health from barricade
    this.scoringManager.player_health -= dam;
    this.scoringManager.updateUiObject();

    //check if it is destroyed
    if(this.scoringManager.player_health <= 0)
    {
      this.EndGame(false);
    }
  }
}