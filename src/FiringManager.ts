/*      FIRING MANAGER
    manages player's exsisting weapon inventory and weapon shot logics.
*/
import { getDecentralandTime } from '@decentraland/EnvironmentAPI';
import * as utils from '../node_modules/@dcl/ecs-scene-utils/dist/index.js'
//import * as utils from '../node_modules/decentraland-ecs/dist/index' //alternative legacy
import type { GameManager } from "./GameManager";
import { UnitAI, UnitObject } from './UnitAI.js';
import { WaveManager } from './WaveManager.js';
import { Weapon, WeaponRepo } from './WeaponRepo.js';
@Component("FiringManager")
export class FiringManager implements ISystem
{
    /* DEBUGGING */
    IsDebugging:boolean = false;
    public static INSTANCE:FiringManager;

    /* FIRING */
    weapon_def:Weapon;
    weapon_current:number = 0;
    weapon_firing_timestamp:number = 0;
    weapon_reload_timestamp:number = 0;

    /* FIREZONE */
    //firing zone (only allow player to fire their weapons when within this zone)
    isPlayerInFirezone:boolean = true;
    firezone_material:Material = new Material();
    firezone_object:Entity = new Entity();
    // Create trigger for shooting area
    //firezone_trigger = new utils.TriggerBoxShape(new Vector3(16, 16, 4), Vector3.Zero());

    /* SOUNDS */
    sound_gunshot = new Entity();
    sound_gunfail = new Entity();

    /* CONTROLLERS */
    input_controller = Input.instance;

    /* HUD */
    rect:UIContainerRect;
    ui_text_weapon_current:UIText;
    ui_text_weapon_current_ammo:UIText;
    ui_text_weapon_next:UIText;
    //create 2d game state ui display
    prepareWaveUI()
    {
        //ui
        //  rect container
        this.rect.width = 180;
        this.rect.height = 55;
        this.rect.positionX = 0;
        this.rect.positionY = -10;
        this.rect.hAlign = "center";
        this.rect.vAlign = "bottom";
        this.rect.color = Color4.Gray();
        this.rect.opacity = 0.8;
        //  texts -- weapon name
        this.ui_text_weapon_current.value = "WEAPON_NAME";
        this.ui_text_weapon_current.fontSize = 18;
        this.ui_text_weapon_current.width = "100%";
        this.ui_text_weapon_current.height = 0;
        this.ui_text_weapon_current.positionY = -22;
        this.ui_text_weapon_current.hAlign = "center";
        this.ui_text_weapon_current.hTextAlign = "center";
        this.ui_text_weapon_current.vAlign = "top";
        //  texts -- weapon ammo
        this.ui_text_weapon_current_ammo.value = "-RELOADING-";
        this.ui_text_weapon_current_ammo.fontSize = 15;
        this.ui_text_weapon_current_ammo.width = "100%";
        this.ui_text_weapon_current_ammo.height = 0;
        this.ui_text_weapon_current_ammo.positionY = -38;
        this.ui_text_weapon_current_ammo.hAlign = "center";
        this.ui_text_weapon_current_ammo.hTextAlign = "center";
        this.ui_text_weapon_current_ammo.vAlign = "top";
        //  texts -- next weapon
        this.ui_text_weapon_next.value = "'2' WEAPON_NEXT";
        this.ui_text_weapon_next.fontSize = 15;
        this.ui_text_weapon_next.width = "100%";
        this.ui_text_weapon_next.height = 0;
        this.ui_text_weapon_next.positionY = -55;
        this.ui_text_weapon_next.hAlign = "center";
        this.ui_text_weapon_next.hTextAlign = "center";
        this.ui_text_weapon_next.vAlign = "top";
        //  update newly created view
        this.updateUiObject();
    }
    public MoveUiObject(x:number, y:number) { this.rect.positionX = x; this.rect.positionY = y; }
    updateUiObject() 
    { 
        this.ui_text_weapon_current.value = this.weapon_def.Name;
        if(this.weapon_reload_timestamp != 0)
        {
            this.ui_text_weapon_current_ammo.value = "Reloading";
        }
        else
        {
            this.ui_text_weapon_current_ammo.value = this.weapon_def.AmmoRemaining.toString() + " / " + this.weapon_def.ShotClip.toString();
        }
    }

    //equip the next owned weapon
    public EquipNextWeapon()
    {
        //find next owned weapon
        this.weapon_current++;
        if(this.weapon_current >= WeaponRepo.INSTANCE.WeaponList.size()) { this.weapon_current = 0; }
        while(!WeaponRepo.INSTANCE.WeaponList.get(this.weapon_current).Owned)
        {
            this.weapon_current++;
            if(this.weapon_current >= WeaponRepo.INSTANCE.WeaponList.size()) { this.weapon_current = 0; }
        }
        this.weapon_def = WeaponRepo.INSTANCE.WeaponDict.getItem(this.weapon_current.toString());

        //if weapon is out of ammo, begin reload
        if(this.weapon_def.Name)
        {
            this.ReloadStart();
        }

        //update object
        this.updateUiObject();
    }

    //begins the reload process
    public ReloadStart()
    {
        this.weapon_reload_timestamp = this.weapon_def.ReloadTime;
    }

    //constructor
    constructor(manager:GameManager)
    {
        //constructor
        FiringManager.INSTANCE = this;
        this.weapon_def = WeaponRepo.INSTANCE.WeaponDict.getItem("0");

        //prepare firing zone
        //  create material
/*        this.firezone_material.albedoColor = Color3.Red();
        //  create object
        this.firezone_object.setParent(this);
        this.firezone_object.addComponent(new BoxShape());
        this.firezone_object.addComponent(
        new Transform({
            position: new Vector3(24, 0.075, 8),
            scale: new Vector3(24, 0.05, 8)
        }));
        this.firezone_object.addComponent(this.firezone_material);
        this.firezone_object.addComponent(
            new utils.TriggerComponent(this.firezone_trigger, {
                onCameraEnter: () => {
                    this.isPlayerInFirezone = true
                    this.firezone_object.getComponent(Material).emissiveColor = Color3.Yellow()
                },
                onCameraExit: () => {
                    this.isPlayerInFirezone = false
                    this.firezone_object.getComponent(Material).emissiveColor = Color3.Black()
                }
            })
        );
*/
        //prepare gunshot sounds
        //  standard
        this.sound_gunshot.addComponent(new AudioSource(new AudioClip('sounds/shot.mp3')));
        this.sound_gunshot.addComponent(new Transform());
        engine.addEntity(this.sound_gunshot);
        this.sound_gunshot.setParent(Attachable.AVATAR);
        //  reloading/error
        this.sound_gunfail.addComponent(new AudioSource(new AudioClip('sounds/shotFail.mp3')));
        this.sound_gunfail.addComponent(new Transform());
        engine.addEntity(this.sound_gunfail);
        this.sound_gunfail.setParent(Attachable.AVATAR);

        //input controller: left click -> fire
        this.input_controller.subscribe('BUTTON_DOWN', ActionButton.POINTER, true, (e) => 
        {
            //ensure weapon is not reloading or over rate of fire and weapon has bullets
            if (this.weapon_firing_timestamp <= 0 && this.weapon_reload_timestamp <= 0) 
            {
                if(this.weapon_def.AmmoRemaining > 0)
                {
                    //play gunshot sound
                    this.sound_gunshot.getComponent(AudioSource).playOnce();
                    this.weapon_def.AmmoRemaining--;
                    this.weapon_firing_timestamp = this.weapon_def.ShotROF;

                    //if an entity was hit
                    if(e.hit != undefined)
                    {
                        if (engine.entities[e.hit.entityId] != undefined) 
                        {
                            //if hit entity is an enemy
                            if(WaveManager.INSTANCE.unitDictID.containsKey(e.hit.entityId))
                            {
                                //deal damage
                                WaveManager.INSTANCE.unitDictID.getItem(e.hit.entityId).TakeDamage(this.weapon_def.ShotDamage);

                                //grab position and create blood marker
                                //const targetPosition = engine.entities[e.hit.entityId].getComponent(Transform).position
                                //const relativePosition = e.hit.hitPoint.subtract(targetPosition)
                            }
                        }
                    }
                }
                else
                {
                    this.ReloadStart();
                }
                
                //update object
                this.updateUiObject();
            } 
            else 
            {
                this.sound_gunfail.getComponent(AudioSource).playOnce()
            }
        });

        //input controller: -> reload weapon
        this.input_controller.subscribe('BUTTON_DOWN', ActionButton.ACTION_3, true, (e) => 
        {
            this.ReloadStart();
        });

        //input controller: -> swap weapon
        this.input_controller.subscribe('BUTTON_DOWN', ActionButton.ACTION_4, true, (e) => 
        {
            this.EquipNextWeapon();
        });

        //setup ui
        this.rect = new UIContainerRect(manager.ui_canvas);
        this.ui_text_weapon_current = new UIText(this.rect);
        this.ui_text_weapon_current_ammo = new UIText(this.rect);
        this.ui_text_weapon_next = new UIText(this.rect);
        this.prepareWaveUI();

        //equip next weapon
        this.EquipNextWeapon();
    }

    update(dt: number)
    {
        //process weapon fire rate cool down
        if(this.weapon_firing_timestamp != 0)
        {
            this.weapon_firing_timestamp -= dt;
            //end of fire cool down 
            if(this.weapon_firing_timestamp <= 0)
            {
                this.weapon_firing_timestamp = 0;
            }
        }
        //process reload
        if(this.weapon_reload_timestamp != 0)
        {
            this.weapon_reload_timestamp -= dt;
            //end of reload
            if(this.weapon_reload_timestamp <= 0)
            {
                this.weapon_reload_timestamp = 0;
                this.weapon_def.Reload();
                this.prepareWaveUI();
            }
        }
    }
}