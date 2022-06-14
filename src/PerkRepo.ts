/*      PERK MANAGER
    manages perk defs and player's perk ownership. most mechanics for perks are
    in-line and test this manager. all perks are defined in-line during object
    construction.

    --WIP--
*/

import { Dictionary, List } from "./dict";
@Component("PerkRepo")
export class PerkRepo
{
    public static INSTANCE:PerkRepo;

    //perk access collections
    public PerkList:List<Perk> = new List<Perk>();
    public PerkDict:Dictionary<Perk> = new Dictionary<Perk>();

    //initializes manager upon object creation
    constructor()
    {
        PerkRepo.INSTANCE = this;

        //build perks
        var perk:Perk;
        //  more damage
        perk = new Perk();
        perk.Index = "0";
        perk.Name = "Bigger Bullets";
        perk.Desc = "Increases base damage of all weapons";
        perk.Cost = [150, 225, 375];
        perk.Effect = [0.10, 0.20, 0.30];
        this.PerkList.add(perk);
        this.PerkDict.add(perk.Index, perk);
        //  more headshot
        perk = new Perk();
        perk.Index = "1";
        perk.Name = "Aim For The Head";
        perk.Desc = "Increases damage of headshots";
        perk.Cost = [150, 225, 375, 500];
        perk.Effect = [0.25, 0.5, 0.75, 1.0];
        this.PerkList.add(perk);
        this.PerkDict.add(perk.Index, perk);
        //  faster reload
        perk = new Perk();
        perk.Index = "2";
        perk.Name = "Quick Hands";
        perk.Desc = "Reload weapons faster";
        perk.Cost = [150, 225, 375];
        perk.Effect = [0.15, 0.30, 0.50];
        this.PerkList.add(perk);
        this.PerkDict.add(perk.Index, perk);
        //  bigger clip size
        perk = new Perk();
        perk.Index = "3";
        perk.Name = "Extended Mags";
        perk.Desc = "Increases number of bullets per clip";
        perk.Cost = [175, 275, 400];
        perk.Effect = [0.15, 0.30, 0.50];
        this.PerkList.add(perk);
        this.PerkDict.add(perk.Index, perk);
    }

    //resets all purchases made
    public Reset()
    {
        //clear all weapon ownership
        for (let i = 0; i < this.PerkList.size(); i++) 
        {
            this.PerkList.get(i).Owned = 0;
        }
        //provide initial pistol ownership
        this.PerkDict.getItem("0").Owned = 1;
    }
}


//constructor
export class Perk
{
    //standard data
    public Index:string = "";
    public Owned:number = 0;
    public Name:string = "";
    public Desc:string = "";
    
    //effect
    public Level:number = 0;
    public Cost:number[] = [0];
    public Effect:number[] = [0];

    //constructor
    constructor()
    {

    }
}