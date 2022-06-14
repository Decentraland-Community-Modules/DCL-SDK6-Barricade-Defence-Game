/*      Barricade Defender DEMO
    barricade defender is a game where the player defends their barricade from increasingly
    difficult waves of enemies. as the player kills enemies they will earn points that
    can be used on upgrading their barricade, empowering perks, or new weapons.

    the functionality of barricade defender is split across several different files and is not
    tied directly to a physical layout, so you can easily create your own scenes, set up
    enemy waypoints, and start playing!
    here's a general over-view of all files:
        -GameManager: overhead manager that handles control of all other systems
        -PlayerStats: container for player's current details and ratios
    
        -WaveManager: handles spawning and setting up enemies
        -UnitAI: controls a single enemy in the game scene that follows waypoints to the barricade
        -WayPointManager: holds waypoint chains used by ai to transition to barricade
        -FiringManager: handles equipping/firing weapons, and hit reg on targets

        -ScoringManager: holds details of player score/wealth balance
        -StoreManager: NPC setup and handles transactions (buying weapons/perks)
        -PerkRepo: holds details for all perks
        -WeaponRepo: holds details for all weapons

        -dict.ts: collection extension
    many of these systems are connected directly to entities to allow enable toggling
    during run-time.

    NOTE: 
    -there is no multiplayer syncing at this time, each player can play independant from
    one another. might need to look into hiding other player avatars if their models can
    cause shot-blocking.

    TODO:
      -2D/3D displays really need a class that can be constructed modularly
      -environmental design needs more work
      -target-hit effects (blood when creature is shot)
      -perks
      -weapon models (used to have debugging test models but couldnt get the smoothing right)
      -weapon damage numbers pop up
      -weapon firing modes (semi/full/burst)
      -weapon add reload button

    Author: Alex Pazder, thecryptotrader69@gmail.com
*/

//import manager from file
import { GameManager } from "./GameManager";

//create and intialize instance of manager
var managerObj:GameManager = new GameManager();
engine.addEntity(managerObj);