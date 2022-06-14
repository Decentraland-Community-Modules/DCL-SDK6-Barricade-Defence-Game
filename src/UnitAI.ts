/*      UNIT AI
    represents a single unit in the game world that attempts to walk
    down a chain of waypoints and attack the barricade. units manage
    their own movement and health, pushing death triggers up through
    the wave manager (just simpler than call/listenering the whole thing)

    this is split into 2 classes:
      unit object: in-game object visible to the player and takes in weapon hits
      unit ai: move object around on map, animations, 

    currently, movement speed is hardcoded (doesnt change with difficulty)
*/
import { WaveManager } from "./WaveManager";
import { GameManager } from "./GameManager";
import { Waypoint, WaypointManager } from "./WaypointManager";
@Component("UnitAI")
export class UnitAI implements ISystem  
{
    IsDebugging:boolean = false;

    //access index
    index:string; public Index():string { return this.index; }
    //unit avatar
    avatarEntity:Entity;
    avatarTransform:Transform;

    /* MOVEMENT */
    avatarMoveSpeed:number = 1.5;
    avatarRotSpeed:number = 10;
    //  unit is at final waypoint/barricade
    arrived:boolean;
    //  current waypoint 
    waypoint:Waypoint|undefined;
    waypointTransform:Transform|undefined;

    /* HEALTH */
    healthCurrent:number = 0;

    /* ATTACK */
    attackLength:number = 0.85;
    attackTimer:number = 0;
    attackDamage:number = 1;

    //initializes unit upon object creation
    //  takes in index for this unit and starting waypoint
    constructor(ind:number)
    {
        //setup data
        this.arrived = false;
        this.index = ind.toString();

        //create ai avatar
        this.avatarEntity = new UnitObject();
        this.avatarTransform = this.avatarEntity.getComponent(Transform);
    }

    //processing over time
    update(dt: number) 
    {
        //avatar is moving towards waypoint
        if(!this.arrived && this.waypoint != undefined && this.waypointTransform != undefined)
        {
            //change rotation of avatar towards target spawnpoint
            //  target direction = waypoint pos - avatar pos
            const direction = this.waypointTransform.position.subtract(this.avatarTransform.position);
            this.avatarTransform.rotation = Quaternion.Slerp(this.avatarTransform.rotation, Quaternion.LookRotation(direction), dt * this.avatarRotSpeed);

            //move avatar towards current waypoint
            const distance = Vector3.DistanceSquared(this.avatarTransform.position, this.waypointTransform.position);
            if(distance >= 0.5)
            {
                const forwardVector = Vector3.Forward().rotate(this.avatarTransform.rotation);
                const increment = forwardVector.scale(dt * this.avatarMoveSpeed);
                this.avatarTransform.translate(increment);
            }
            //avatar has reached target waypoint
            else
            {
                //attempt to get next waypoint
                let nextWP:Waypoint|undefined = WaypointManager.INSTANCE.GetNextWaypoint(this.waypoint.Index);
                //get next waypoint
                if(nextWP != undefined)
                {
                    this.SetTarget(nextWP);
                }
                //arrived at barricade
                else
                {
                    if(this.IsDebugging){ log("unit arrived at final waypoint"); }
                    this.arrived = true;

                    //debugging: kill unit
                    //WaveManager.INSTANCE.EnemyDeath(this.index);

                    //change animations to attack
                    this.avatarEntity.getComponent(Animator).getClip('Walking').stop();
                    this.avatarEntity.getComponent(Animator).getClip('Attacking').play();

                    //reset timer
                    this.attackTimer = this.attackLength;
                }
            }
        }
        //avatar has arrived at barricade: process attack and barricade damage
        else
        {
            //if timer has run out
            if(this.attackTimer <= 0)
            {
                //deal damage to barricade
                GameManager.INSTANCE.BarricadeDamaged(this.attackDamage);

                //reset timer
                this.attackTimer = this.attackLength;
            }
            else
            {
                //tick down timer
                this.attackTimer -= dt;
            }
        }
    }
    
    //sets the provided waypoint as the target and begins traversal
    public SetTarget(wp:Waypoint, spawn:boolean = false)
    {
        if(this.IsDebugging){ log("unit "+this.index+" is now targeting waypoint "+wp.Index); }

        //set up next waypoint
        this.waypoint = wp;
        this.waypointTransform = wp.getComponent(Transform);

        //randomize position by a little
        //this.waypointTransform.position.x = (Math.random() * 0.5) - 0.25;
        //this.waypointTransform.position.z = (Math.random() * 0.5) - 0.25;

        //place object at given waypoint
        if(spawn)
        {
            this.avatarTransform.position = new Vector3(this.waypointTransform.position.x, this.waypointTransform.position.y, this.waypointTransform.position.z);
        }

        //start traversal
        this.arrived = false;
    }

    //take damage
    public TakeDamage(num:number)
    {
        this.healthCurrent -= num;
        if(this.healthCurrent <= 0)
        {
            WaveManager.INSTANCE.EnemyDeath(this.index);
        }
    }
}

//meat puppet
@Component("UnitObject")
export class UnitObject extends Entity  
{
    //constructor
    constructor()
    {
        //setup object
        super();
        //this.addComponent(new GLTFShape('models/Enemy.glb'));
        this.addComponent(new GLTFShape('models/zombie.glb'));
        this.addComponent(new Transform
        ({
            position: new Vector3(0,0,0),
            scale: new Vector3(1,1,1),
            rotation: new Quaternion().setEuler(0,0,0)
        }));
        
        //animator and animations
        this.addComponent(new Animator());
        this.getComponent(Animator).addClip(new AnimationState('Walking', { looping: true }));
        this.getComponent(Animator).addClip(new AnimationState('Attacking', { looping: true }));
        this.getComponent(Animator).getClip('Walking').play();
    }
}