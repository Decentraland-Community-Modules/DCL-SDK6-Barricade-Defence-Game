/*      WAYPOINT MANAGER
    handles placement of waypoint markers used by enemies to approach the 
    barricades nodes. each spawn point is linked directly to a single waypoint
    to set the enemy on its way when it first spawns. when an enemy reaches its
    targeted waypoint it will query this manager to recieve the next waypoint 
    towards the barricade.

    waypoint pathing works its way down towards zero (arrival point):
        (start) node_3 -> node_2 -> node_1 -> node_0 (end)

    waypoint paths are constructed backwards: the '0' indexed nodes are placed
    at the end of the path (at the barricade). the path itself is built like a 
    web: there are 5 end points where enemies can stop to attack barricade nodes,
    this makes up the first layer (all nodes indexed at 0); there are more nodes
    placed away from the barricade with increasing indexes to represent distance.
    varying nodes are given to enemies as they travel the system to create a sense
    of randomness/divergent paths (not all enemies that spawn on the same point will
    travel the same path).
        ex: (layer index)_(variance)
        3_0 -> 2_0 -> 1_0 -> 0_0
            -> 2_1 -> 1_1 -> 0_1
                   -> 1_2 -> 0_1
        currently, variance is only a diviation of 1

    currently, you have to link any spawn points directly to waypoints by hand.
*/

import { Dictionary, List } from "./dict";
@Component("WaypointManager")
export class WaypointManager extends Entity 
{
    IsDebugging:boolean = false;
    public static INSTANCE:WaypointManager;

    //access collections
    //  all waypoints
    WaypointList:List<Waypoint> = new List<Waypoint>();
    WaypointDict:Dictionary<Waypoint> = new Dictionary<Waypoint>();
    //  waypoint layers
    WaypointLayers:Dictionary<List<Waypoint>> = new Dictionary<List<Waypoint>>();
    //list of all spawnpoints, you have to manually add these in the constructor
    SpawnpointList:List<Waypoint> = new List<Waypoint>();

    //initializes manager upon object creation
    constructor()
    {
        super();
        this.addComponent(new Transform
        ({
            position: new Vector3(0,0,0),
            scale: new Vector3(1,1,1),
            rotation: new Quaternion().setEuler(0,0,0)
        }));

        //set global access
        WaypointManager.INSTANCE = this;

        //create and place each waypoint along the path
        //we start from the end-point (barricade) and path to spawn points
        //  layer 0: barricade nodes
        this.createWaypoint("0_0", 19, 16.25);
        this.createWaypoint("0_1", 21.5, 16.25);
        this.createWaypoint("0_2", 24, 16.25);
        this.createWaypoint("0_3", 26.5, 16.25);
        this.createWaypoint("0_4", 29, 16.25);
        //  layer 1: variance
        this.createWaypoint("1_0", 16, 26);
        this.createWaypoint("1_1", 19, 22);
        this.createWaypoint("1_2", 21.5, 24);
        this.createWaypoint("1_3", 24, 26);
        this.createWaypoint("1_4", 26.5, 24);
        this.createWaypoint("1_5", 29, 20);
        this.createWaypoint("1_6", 32, 26);
        //  layer 2: variance
        this.createWaypoint("2_0", 17, 35.5);
        this.createWaypoint("2_1", 20.5, 40);
        this.createWaypoint("2_5", 27.5, 40);
        this.createWaypoint("2_6", 31, 35.5);
        //  layer 3: spawn points
        this.createWaypoint("3_0", 13, 41, true);
        this.createWaypoint("3_1", 16.5, 54, true);
        this.createWaypoint("3_5", 31.5, 54, true);
        this.createWaypoint("3_6", 35, 41, true);
        
    }

    //creates a waypoint of a given index at the target location
    createWaypoint(index:string, x:number, z:number, spawn:boolean = false)
    {
        //create way point
        var wp:Waypoint = new Waypoint(index, x, z);
        engine.addEntity(wp);

        //add to collections
        this.WaypointDict.add(index, wp);
        this.WaypointList.add(wp);

        //add to layer collections
        var str:string[] = index.split('_');
        //  create layer list if needed
        if(!this.WaypointLayers.containsKey(str[0]))
        {
            this.WaypointLayers.add(str[0], new List<Waypoint>());
        }
        //  add to layer collection's list
        this.WaypointLayers.getItem(str[0]).add(wp);

        //check if this is a spawn point
        if(spawn)
        {
            this.SpawnpointList.add(wp);
        }
    }

    //takes in an index and returns 
    GetNextWaypoint(index:string):Waypoint|undefined
    {
        //break apart current index and reduce primary
        var num:number;
        var str:string[] = index.split('_');
        str[0] = (+str[0]-1).toString();

        //roll for variance
        var roll_0:number = Math.floor(Math.random() * 100);
        var roll_1:number = Math.floor(Math.random() * 100);

        //check if variance exsists
        if(roll_0 > 55)
        {
            //attempt higher variance
            if(roll_1 > 50)
            {
                if(this.WaypointDict.containsKey(str[0]+"_"+(+str[1]-1)))
                {
                    str[1] = (+str[1]-1).toString();
                }
                else if(this.WaypointDict.containsKey(str[0]+"_"+(+str[1]+1)))
                {
                    str[1] = (+str[1]+1).toString();
                }
            }
            //attempt lower variance
            else
            {
                if(this.WaypointDict.containsKey(str[0]+"_"+(+str[1]+1)))
                {
                    str[1] = (+str[1]+1).toString();
                }
                else if(this.WaypointDict.containsKey(str[0]+"_"+(+str[1]-1)))
                {
                    str[1] = (+str[1]-1).toString();
                }
            }
        }

        //if calculated waypoint exists, send waypoint
        if(this.WaypointDict.containsKey((str[0])+"_"+str[1]))
        {
            if(this.IsDebugging){ log("given waypoint "+index+", next waypoint: "+str[0]+"_"+str[1]); }
            return this.WaypointDict.getItem(str[0]+"_"+str[1]);
        }
        //if calculated waypoint does not exsist, attempt to pull from layer
        else if(this.WaypointLayers.containsKey(str[0]))
        {
            num = Math.floor(Math.random() * this.WaypointLayers.getItem(str[0]).size());

            if(this.IsDebugging){ log("given waypoint "+index+", next waypoint coming from layer: "+str[0]); }
            return this.WaypointLayers.getItem(str[0]).get(num);
        }

        if(this.IsDebugging){ log("given waypoint "+index+", next waypoint: "+str[0]+"_"+str[1]+" *end of chain*"); }
        return undefined;
    }

    //returns a random spawn waypoint
    public GetRandomSpawnWaypoint():Waypoint
    {
        return this.SpawnpointList.get(Math.floor(Math.random() * this.SpawnpointList.size()));
    }

    //returns the next spawn point
    spawnIndex = 0;
    public GetNextSpawnPoint():Waypoint
    {
        this.spawnIndex++;
        if(this.spawnIndex >= this.SpawnpointList.size()) this.spawnIndex = 0;

        return this.SpawnpointList.get(this.spawnIndex);
    }
}

//definition for a single waypoint
@Component("Waypoint")
export class Waypoint extends Entity
{
    //waypoint's access index
    Index:string;
    
    //constructor
    constructor(ind:string, x:number, z:number)
    {
        //setup object
        super();
        this.Index = ind;
        //this.addComponent(new BoxShape());
        this.addComponent(new Transform
        ({
            position: new Vector3(+x,0.933,+z),
            scale: new Vector3(0.1,0.1,0.1),
            rotation: new Quaternion().setEuler(0,0,0)
        }));
    }
}