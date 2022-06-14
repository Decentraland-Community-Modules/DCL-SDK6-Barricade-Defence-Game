/*      WAVE MANAGER
    handles the start/end of waves, spawning of enemies, and
    pushing enemy death details up to the game manager.
*/


import { Dictionary, List } from "./dict";
import type { GameManager } from "./GameManager";
import { WaypointManager } from "./WaypointManager";
import { UnitAI } from "./UnitAI";
import { ScoringManager } from "./ScoringManager";
@Component("WaveManager")
export class WaveManager implements ISystem  
{
    /* DEBUGGING */
    IsDebugging:boolean = false;
    public static INSTANCE:WaveManager;

    gameManager:GameManager;
    public waypointManager:WaypointManager;

    //collection of all ai units
    //  creation/deletion of units is expensive at run-time so we'll retain
    //  any created units for use later
    nextIndex:number = 0;
    unitList:List<UnitAI> = new List<UnitAI>();   //all units (alive and dead)
    unitList_DEAD:List<UnitAI> = new List<UnitAI>();  //dead units
    unitDict:Dictionary<UnitAI> = new Dictionary<UnitAI>();
    //we mark all active enemies based on entity id for hit reg (sometimes ran into issues when just component checking)
    unitDictID:Dictionary<UnitAI> = new Dictionary<UnitAI>();

    /* GAME SETTINGS */
    wave_active:boolean = false;
    wave_current:number = 0;
    wave_max:number = 10;
    wave_enemy_base:number = 1;
    wave_enemy_growth:number = 4;
    enemy_count:number = 0; //number of enemies to create in this wave
    enemy_current:number = 0; //number of enemies alive
    enemy_spawn_delay:number = 1.25;
    enemy_spawn_delay_reduction:number = 0.15;
    enemy_spawn_stamp:number = 0;

    /* UI WAVE DISPLAY */
    rect:UIContainerRect;
    ui_text_wave:UIText;
    ui_text_enemies:UIText;
    //create 2d game state ui display
    prepareWaveUI()
    {
        //ui
        //  rect container
        this.rect.width = 240;
        this.rect.height = 45;
        this.rect.positionX = 165;
        this.rect.positionY = -55;
        this.rect.hAlign = "left";
        this.rect.vAlign = "top";
        this.rect.color = Color4.Gray();
        this.rect.opacity = 0.8;
        //  texts -- wave
        this.ui_text_wave.value = "Wave: ##";
        this.ui_text_wave.fontSize = 15;
        this.ui_text_wave.width = "85%";
        this.ui_text_wave.height = 20;
        this.ui_text_wave.positionY = -2;
        this.ui_text_wave.hAlign = "center";
        this.ui_text_wave.vAlign = "top";
        //  texts -- enemies
        this.ui_text_enemies.value = "Enemies: ##";
        this.ui_text_enemies.fontSize = 15;
        this.ui_text_enemies.width = "85%";
        this.ui_text_enemies.height = 20;
        this.ui_text_enemies.positionY = -20;
        this.ui_text_enemies.hAlign = "center";
        this.ui_text_enemies.vAlign = "top";
        //  update newly created view
        this.updateUiObject();
    }
    public MoveUiObject(x:number, y:number) { this.rect.positionX = x; this.rect.positionY = y; }
    updateUiObject() 
    { 
        this.ui_text_wave.value = "Wave: "+this.wave_current.toString(); 
        this.ui_text_enemies.value = "Enemies: "+this.enemy_current.toString(); 
    }

    //initializes manager upon object creation
    constructor(manager:GameManager)
    {
        //set global access
        WaveManager.INSTANCE = this;

        //set manager reference
        this.gameManager = manager;
        this.waypointManager = new WaypointManager();

        //setup ui
        this.rect = new UIContainerRect(this.gameManager.ui_canvas);
        this.ui_text_wave = new UIText(this.rect);
        this.ui_text_enemies = new UIText(this.rect);
        this.prepareWaveUI();
    }

    //processing over time
    update(dt: number) 
    {
        //if wave is on-going
        if(this.wave_active)
        {
            //if there are units that need to be spawned
            if(this.enemy_count)
            {
                //push stamp down
                this.enemy_spawn_stamp -= dt;
                //if(this.IsDebugging){ log("wave "+this.wave_current.toString()+" has started..."); }

                //if time to spawn a enemy
                if(this.enemy_spawn_stamp <= 0)
                {
                    //create enemy
                    this.enemy_count--;
                    this.EnemySpawn();

                    //reset time stamp
                    this.enemy_spawn_stamp = this.enemy_spawn_delay - (this.enemy_spawn_delay_reduction * (this.wave_current-1));
                }
            }
        }
    }

    //resets the manager to its starting state
    public Reset()
    {
        //end any on-going wave
        if(this.wave_active) { this.WaveEnd(); }

        //reset core values
        this.wave_current = 0;
        this.enemy_count = 0;
        this.enemy_current = 0;

        //update ui
        this.updateUiObject();
    }

    //begins the next wave
    public WaveStart()
    {
        //calculate number of enemies
        this.nextIndex = 0;
        this.wave_current++;
        this.enemy_count = this.wave_enemy_base + (this.wave_enemy_growth * (this.wave_current-1));
        if(this.IsDebugging){ log("wave "+this.wave_current.toString()+" has started..."); }

        this.wave_active = true;

        //update ui
        this.updateUiObject();
    }

    //ends the current wave
    public WaveEnd()
    {
        if(this.IsDebugging){ log("wave "+this.wave_current.toString()+" has ended!"); }
        this.wave_active = false;

        //cull any existing enemies from the board (game is restarting or player lost)
        for (let i = 0; i < this.unitList.size(); i++) 
        { 
            //grab unit from list
            let unit = this.unitList.get(i);

            //remove unit from engine
            engine.removeSystem(unit);
            engine.removeEntity(unit.avatarEntity);

            //add unit to list of dead units
            this.unitList_DEAD.add(unit);
        }

        //make call to game manager for processing
        //  end game with victory
        if(this.wave_current >= this.wave_max)
        {
            this.gameManager.SetGameState(4);
        }
        //  enter shopping phase
        else
        {
            this.gameManager.SetGameState(3);
        }

        //update ui
        this.updateUiObject();
    }

    //spawns a single enemy
    public EnemySpawn()
    {
        let unit:UnitAI;
        this.enemy_current++;
        //a dead unit exsists, use it
        if(this.unitList_DEAD.size() > 0)
        {
            unit = this.unitList_DEAD.get(0);
            this.unitList_DEAD.remove(unit);
        }
        //create new unit to use
        else
        {
            //create unit
            unit = new UnitAI(this.nextIndex++);
            //add to collections
            this.unitList.add(unit);
            this.unitDict.add(unit.index, unit);
        }
        unit.healthCurrent = this.gameManager.difficulty_mod_health[this.gameManager.difficulty] * 100;

        //add unit to engine
        engine.addSystem(unit);
        engine.addEntity(unit.avatarEntity);
        this.unitDictID.add(unit.avatarEntity.uuid, unit);

        //start unit on 
        unit.avatarEntity.getComponent(Animator).getClip('Attacking').stop();
        unit.avatarEntity.getComponent(Animator).getClip('Walking').play();
        unit.SetTarget(this.waypointManager.GetNextSpawnPoint(), true);

        //update ui
        this.updateUiObject();
    }

    //kills the unit at the given index
    public EnemyDeath(index:string)
    {
        if(this.IsDebugging){ log("unit "+index+" has been killed!"); }

        //get unit
        let unit:UnitAI = this.unitDict.getItem(index);
        this.unitDictID.removeItem(unit.avatarEntity.uuid);
        this.enemy_current--;

        //add unit to engine
        engine.removeSystem(unit);
        engine.removeEntity(unit.avatarEntity);

        //if this was the last enemy, end the wave
        if(this.enemy_current <= 0 && this.enemy_count == 0)
        {
            this.WaveEnd();
        }

        //provide points
        ScoringManager.INSTANCE.player_kills++;
        ScoringManager.INSTANCE.player_money += this.gameManager.difficulty_mod_points[this.gameManager.difficulty] * 5;
        ScoringManager.INSTANCE.updateUiObject();

        //update ui
        this.updateUiObject();
    }
}