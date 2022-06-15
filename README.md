# Decentraland_BarricadeDefender

Barricade Defenders is a game where players defend their barricade (duh) from hordes of monsters. As you defeat enemies you will earn credits that can be used to buy perks and weapons. I'm only a software developer, not a graphical designer, so the scene's display is pretty rudimentary. With that being said, the scene has been set up to be easily retrofitted (better environmental/model design) with very little interation with actual code.

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

Feel free to play around with the scene and make you own survival game!

--live play scene coming soon--

NOTES:
  -perks are currently disabled, they need more work

GAME JAM NOTES:
  Some assets/code were rooted from scene examples: zombie (avatar/animations)
  Some assets/code were aquirred through open source/commercial free sites: wall and flooring textures
