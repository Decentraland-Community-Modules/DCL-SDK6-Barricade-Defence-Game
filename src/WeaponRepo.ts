/*      WEAPON REPO
    all weapon defs are created in-line during object construction.
*/

import { Dictionary, List } from "./dict";
@Component("WeaponRepo")
export class WeaponRepo
{
    public static INSTANCE:WeaponRepo;

    //collections of all defs
    public WeaponList:List<Weapon> = new List<Weapon>();
    public WeaponDict:Dictionary<Weapon> = new Dictionary<Weapon>();

    //initializes manager upon object creation
    constructor()
    {
        WeaponRepo.INSTANCE = this;

        //build all weapons
        var weapon:Weapon;
        //  semi pistol (starting weapon)
        weapon = new Weapon();
        weapon.Index = "0";
        weapon.Name = "Semi-Auto Pistol";
        weapon.Desc = "Rapid fire low calibre rounds";
        weapon.Cost = 0;
        weapon.ShotType = 0;
        weapon.ShotDamage = 33;
        weapon.ShotROF = 0.15;
        weapon.ShotClip = 12;
        weapon.ReloadTime = 0.9;
        this.WeaponList.add(weapon);
        this.WeaponDict.add(weapon.Index, weapon);
        //heavy pistol
        weapon = new Weapon();
        weapon.Index = "1";
        weapon.Name = "Heavy Pistol";
        weapon.Desc = "Slow rate of fire, but massive damage";
        weapon.Cost = 225;
        weapon.ShotType = 0;
        weapon.ShotDamage = 45;
        weapon.ShotROF = 0.25;
        weapon.ShotClip = 8;
        weapon.ReloadTime = 1.25;
        this.WeaponList.add(weapon);
        this.WeaponDict.add(weapon.Index, weapon);
        //  smg
        weapon = new Weapon();
        weapon.Index = "2";
        weapon.Name = "SMG";
        weapon.Desc = "Large clip size and quick rate of fire";
        weapon.Cost = 275;
        weapon.ShotType = 1;
        weapon.ShotDamage = 22;
        weapon.ShotROF = 0.095;
        weapon.ShotClip = 27;
        weapon.ReloadTime = 1.65;
        this.WeaponList.add(weapon);
        this.WeaponDict.add(weapon.Index, weapon);
        //  shotgun
        weapon = new Weapon();
        weapon.Index = "3";
        weapon.Name = "Shotgun";
        weapon.Desc = "Good per hit damage";
        weapon.Cost = 285;
        weapon.ShotType = 0;
        weapon.ShotDamage = 95;
        weapon.ShotROF = 0.45;
        weapon.ShotClip = 7;
        weapon.ReloadTime = 2.15;
        this.WeaponList.add(weapon);
        this.WeaponDict.add(weapon.Index, weapon);
        //  assualt rifle
        weapon = new Weapon();
        weapon.Index = "4";
        weapon.Name = "Assault Rifle";
        weapon.Desc = "Decent damage and rate of fire";
        weapon.Cost = 385;
        weapon.ShotType = 1;
        weapon.ShotDamage = 27;
        weapon.ShotROF = 0.115;
        weapon.ShotClip = 32;
        weapon.ReloadTime = 1.75;
        this.WeaponList.add(weapon);
        this.WeaponDict.add(weapon.Index, weapon);
        //  sniper
        weapon = new Weapon();
        weapon.Index = "5";
        weapon.Name = "Sniper";
        weapon.Desc = "Devistating damage";
        weapon.Cost = 415;
        weapon.ShotType = 0;
        weapon.ShotDamage = 115;
        weapon.ShotROF = 0.65;
        weapon.ShotClip = 8;
        weapon.ReloadTime = 2.65;
        this.WeaponList.add(weapon);
        this.WeaponDict.add(weapon.Index, weapon);

        this.Reset();
    }

    //resets all purchases made
    public Reset()
    {
        for (let i = 0; i < this.WeaponList.size(); i++) 
        { 
            this.WeaponList.get(i).Reset;
        }
        //player gets pistol by default
        this.WeaponList.get(0).Owned = true;
    }
}

//represents a single weapon
export class Weapon
{
    public Owned:boolean = false;

    //standard data
    public Index:string = "";
    public Name:string = "";
    public Desc:string = "";

    //shop data
    public Cost:number = 0;

    //weapon data
    public ShotType:number = 0; //0:semi, 1:auto
    public ShotDamage:number = 0;
    public ShotROF:number = 0;
    public ShotClip:number = 0;
    public ReloadTime:number = 0;

    public AmmoRemaining:number = 0;

    public Reset()
    {
        this.Owned = false;
        this.AmmoRemaining = this.ShotClip;
    }

    public Reload()
    {
        this.AmmoRemaining = this.ShotClip;
    }
}