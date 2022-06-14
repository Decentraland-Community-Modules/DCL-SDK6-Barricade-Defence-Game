/*      STORE MANAGER
    manages the display and sale of weapons/perks to the player. this class
*/

import { Perk, PerkRepo } from "./PerkRepo";
import { ScoringManager } from "./ScoringManager";
import { Weapon, WeaponRepo } from "./WeaponRepo";
@Component("StoreManager")
export class StoreManager extends Entity
{
    //shop modes (0:weapons, 1:perks)
    shopMode:number = 0;
    //display indexes
    shopIndexWeapons:number = 0;
    shopIndexPerks:number = 0;
    //shop objects
    material_shop:Material = new Material();
    shop_object_parent:Entity = new Entity();
    //shop texts
    shop_object_title_text:Entity = new Entity();
    shop_object_name_text:Entity = new Entity();
    shop_object_desc_text:Entity = new Entity();
    shop_object_detail_text_0:Entity = new Entity();
    shop_object_detail_text_2:Entity = new Entity();
    shop_object_detail_text_3:Entity = new Entity();
    //  interaction buttons
    shop_object_next_button:Entity = new Entity();
    shop_object_next_text:Entity = new Entity();
    shop_object_prev_button:Entity = new Entity();
    shop_object_prev_text:Entity = new Entity();
    shop_object_toggle_button:Entity = new Entity();
    shop_object_toggle_text:Entity = new Entity();
    shop_object_purchase_button:Entity = new Entity();
    shop_object_purchase_text:Entity = new Entity();
    
    //  prepares weapon shop objects
    private PrepareShop()
    {
        //set up main object
        this.shop_object_parent.setParent(this);
        this.shop_object_parent.addComponent(new GLTFShape("models/DisplayScreenWide_0.glb"));
        this.shop_object_parent.addComponent(new Transform
        ({
            position: new Vector3(40,3,13.9),
            scale: new Vector3(2,2,2),
            rotation: new Quaternion().setEuler(0,0,0)
        }));

        //add title text
        this.shop_object_title_text.setParent(this.shop_object_parent);
        this.shop_object_title_text.addComponent(new Transform
        ({
            position: new Vector3(0,1,0),
            scale: new Vector3(1,1,1),
            rotation: new Quaternion().setEuler(0,0,0)
        }));
        this.shop_object_title_text.addComponent(new TextShape("TITLE"));
        this.shop_object_title_text.getComponent(TextShape).hTextAlign = "center";
        this.shop_object_title_text.getComponent(TextShape).vTextAlign = "top";
        this.shop_object_title_text.getComponent(TextShape).fontSize = 3;
        this.shop_object_title_text.getComponent(TextShape).color = Color3.Black();

        //add name text
        this.shop_object_name_text.setParent(this.shop_object_parent);
        this.shop_object_name_text.addComponent(new Transform
        ({
            position: new Vector3(0,0.55,0),
            scale: new Vector3(1,1,1),
            rotation: new Quaternion().setEuler(0,0,0)
        }));
        this.shop_object_name_text.addComponent(new TextShape("NAME"));
        this.shop_object_name_text.getComponent(TextShape).hTextAlign = "center";
        this.shop_object_name_text.getComponent(TextShape).vTextAlign = "center";
        this.shop_object_name_text.getComponent(TextShape).fontSize = 2;
        this.shop_object_name_text.getComponent(TextShape).color = Color3.Black();

        //add desc text
        this.shop_object_desc_text.setParent(this.shop_object_parent);
        this.shop_object_desc_text.addComponent(new Transform
        ({
            position: new Vector3(0,0.35,0),
            scale: new Vector3(1,1,1),
            rotation: new Quaternion().setEuler(0,0,0)
        }));
        this.shop_object_desc_text.addComponent(new TextShape("DESC"));
        this.shop_object_desc_text.getComponent(TextShape).hTextAlign = "center";
        this.shop_object_desc_text.getComponent(TextShape).vTextAlign = "center";
        this.shop_object_desc_text.getComponent(TextShape).fontSize = 2;
        this.shop_object_desc_text.getComponent(TextShape).color = Color3.Black();

        //add damage text
        this.shop_object_detail_text_0.setParent(this.shop_object_parent);
        this.shop_object_detail_text_0.addComponent(new Transform
        ({
            position: new Vector3(-0.3,-0.4,0),
            scale: new Vector3(1,1,1),
            rotation: new Quaternion().setEuler(0,0,0)
        }));
        this.shop_object_detail_text_0.addComponent(new TextShape("Damage: ###"));
        this.shop_object_detail_text_0.getComponent(TextShape).hTextAlign = "right";
        this.shop_object_detail_text_0.getComponent(TextShape).vTextAlign = "center";
        this.shop_object_detail_text_0.getComponent(TextShape).fontSize = 2;
        this.shop_object_detail_text_0.getComponent(TextShape).color = Color3.Black();

        //add clip size text
        this.shop_object_detail_text_2.setParent(this.shop_object_parent);
        this.shop_object_detail_text_2.addComponent(new Transform
        ({
            position: new Vector3(0.3,-0.4,0),
            scale: new Vector3(1,1,1),
            rotation: new Quaternion().setEuler(0,0,0)
        }));
        this.shop_object_detail_text_2.addComponent(new TextShape("Ammo: ###"));
        this.shop_object_detail_text_2.getComponent(TextShape).hTextAlign = "left";
        this.shop_object_detail_text_2.getComponent(TextShape).vTextAlign = "center";
        this.shop_object_detail_text_2.getComponent(TextShape).fontSize = 2;
        this.shop_object_detail_text_2.getComponent(TextShape).color = Color3.Black();
        
        //  next item
        //    object
        this.shop_object_next_button.addComponent(this.material_shop);
        this.shop_object_next_button.setParent(this.shop_object_parent);
        this.shop_object_next_button.addComponent(new GLTFShape("models/Button_Square.glb"));
        this.shop_object_next_button.addComponent( new Transform
        ({
            position: new Vector3(0.6,-0.8,0),
            scale: new Vector3(0.35,0.55,0.35),
            rotation: new Quaternion().setEuler(-90,0,0)
        }));
        this.shop_object_next_button.addComponent
        (
        new OnPointerDown 
        ( 
            (e) => 
            { 
                this.DisplayItemNext();
            }, 
            { button: ActionButton.PRIMARY } 
        )
        );
        //    text
        this.shop_object_next_text.setParent(this.shop_object_next_button);
        this.shop_object_next_text.addComponent(new TextShape("V"));
        this.shop_object_next_text.getComponent(TextShape).fontSize = 4;
        this.shop_object_next_text.addComponent(new Transform
        ({
            position: new Vector3(0,0.15,0),
            scale: new Vector3(1.5,1,1),
            rotation: new Quaternion().setEuler(90,0,90)
        }));
        
        //  previous item
        //    object
        this.shop_object_prev_button.addComponent(this.material_shop);
        this.shop_object_prev_button.setParent(this.shop_object_parent);
        this.shop_object_prev_button.addComponent(new GLTFShape("models/Button_Square.glb"));
        this.shop_object_prev_button.addComponent( new Transform
        ({
            position: new Vector3(-0.6,-0.8,0),
            scale: new Vector3(0.35,0.55,0.35),
            rotation: new Quaternion().setEuler(-90,0,0)
        }));
        this.shop_object_prev_button.addComponent
        (
        new OnPointerDown 
        ( 
            (e) => 
            { 
                this.DisplayItemPrev();
            }, 
            { button: ActionButton.PRIMARY } 
        )
        );
        //    text
        this.shop_object_prev_text.setParent(this.shop_object_prev_button);
        this.shop_object_prev_text.addComponent(new TextShape("V"));
        this.shop_object_prev_text.getComponent(TextShape).fontSize = 4;
        this.shop_object_prev_text.addComponent(new Transform
        ({
            position: new Vector3(0,0.15,0),
            scale: new Vector3(1.5,-1,1),
            rotation: new Quaternion().setEuler(90,0,90)
        }));
        //  create toggle button
        //    object
        this.shop_object_toggle_button.addComponent(this.material_shop);
        this.shop_object_toggle_button.setParent(this.shop_object_parent);
        this.shop_object_toggle_button.addComponent(new GLTFShape("models/Button_Long.glb"));
        this.shop_object_toggle_button.addComponent( new Transform
        ({
            position: new Vector3(0,-0.8,-0.0),
            scale: new Vector3(0.35,0.55,0.35),
            rotation: new Quaternion().setEuler(-90,0,0)
        }));
        this.shop_object_toggle_button.addComponent
        (
          new OnPointerDown 
          ( 
            (e) => 
            { 
                this.DisplayModeToggle();
            }, 
            { button: ActionButton.PRIMARY } 
          )
        );
        //    text
        this.shop_object_toggle_text.setParent(this.shop_object_toggle_button);
        this.shop_object_toggle_text.addComponent(new TextShape("TOGGLE"));
        this.shop_object_toggle_text.getComponent(TextShape).fontSize = 4;
        this.shop_object_toggle_text.addComponent(new Transform
        ({
          position: new Vector3(0,0.15,0),
          scale: new Vector3(0.75,1,1),
          rotation: new Quaternion().setEuler(90,0,0)
        }));
        //  create purchase button
        //    object
        this.shop_object_purchase_button.addComponent(this.material_shop);
        this.shop_object_purchase_button.setParent(this.shop_object_parent);
        this.shop_object_purchase_button.addComponent(new GLTFShape("models/Button_Long.glb"));
        this.shop_object_purchase_button.addComponent( new Transform
        ({
            position: new Vector3(1.68,-0.8,0),
            scale: new Vector3(0.5,0.55,0.35),
            rotation: new Quaternion().setEuler(-90,0,0)
        }));
        this.shop_object_purchase_button.addComponent
        (
          new OnPointerDown 
          ( 
            (e) => 
            { 
                this.AttemptPurchase();
            }, 
            { button: ActionButton.PRIMARY } 
          )
        );
        //    text
        this.shop_object_purchase_text.setParent(this.shop_object_purchase_button);
        this.shop_object_purchase_text.addComponent(new TextShape("PURCHASE:\n####"));
        this.shop_object_purchase_text.getComponent(TextShape).fontSize = 4;
        this.shop_object_purchase_text.addComponent(new Transform
        ({
          position: new Vector3(0,0.15,0),
          scale: new Vector3(0.5,0.9,0.9),
          rotation: new Quaternion().setEuler(90,0,0)
        }));
    }

    //displays next tower
    public DisplayItemNext()
    {
        if(this.shopMode == 0)
        {
            this.shopIndexWeapons++;
            if(this.shopIndexWeapons >= WeaponRepo.INSTANCE.WeaponList.size()) { this.shopIndexWeapons = 0; }
            this.DisplayWeapon(WeaponRepo.INSTANCE.WeaponList.get(this.shopIndexWeapons));
        }
        else
        {
            this.DisplayPerk(PerkRepo.INSTANCE.PerkList.get(this.shopIndexPerks));
        }
    }

    //displays previous tower
    public DisplayItemPrev()
    {
        if(this.shopMode == 0)
        {
            this.shopIndexWeapons--;
            if(this.shopIndexWeapons < 0) { this.shopIndexWeapons = WeaponRepo.INSTANCE.WeaponList.size()-1; }
            this.DisplayWeapon(WeaponRepo.INSTANCE.WeaponList.get(this.shopIndexWeapons));
        }
        else
        {
            this.DisplayPerk(PerkRepo.INSTANCE.PerkList.get(this.shopIndexPerks));
        }
    }
    
    //change display mode, toggle between perk and weapon mode
    public DisplayModeToggle()
    {
        if(this.shopMode == 0)
        {
            this.shopMode = 1;
            this.DisplayPerk(PerkRepo.INSTANCE.PerkList.get(this.shopIndexPerks));
            this.shop_object_toggle_text.getComponent(TextShape).value = "PERKS";
        }
        else
        {
            this.shopMode = 0;
            this.DisplayWeapon(WeaponRepo.INSTANCE.WeaponList.get(this.shopIndexWeapons));
            this.shop_object_toggle_text.getComponent(TextShape).value = "WEAPONS";
        }
    }

    //displays the weapon at the given index
    public DisplayWeapon(def:Weapon)
    {
        //set values
        this.shop_object_title_text.getComponent(TextShape).value = "Weapons";
        this.shop_object_name_text.getComponent(TextShape).value = def.Name;
        this.shop_object_desc_text.getComponent(TextShape).value = def.Desc;
        this.shop_object_detail_text_0.getComponent(TextShape).value = "Damage: " + def.ShotDamage.toString();
        this.shop_object_detail_text_2.getComponent(TextShape).value = "Clip Size: " + def.ShotClip.toString();

        //purchase values
        if(def.Owned)
        {
            this.shop_object_purchase_text.getComponent(TextShape).value = "ALREADY\nOWNED";
        }
        else
        {
            this.shop_object_purchase_text.getComponent(TextShape).value = "PURCHASE:\n"+def.Cost.toString();
        }
    }

    public DisplayPerk(def:Perk)
    {
        //set values
        this.shop_object_title_text.getComponent(TextShape).value = "Perks";
        this.shop_object_name_text.getComponent(TextShape).value = "";
        this.shop_object_desc_text.getComponent(TextShape).value = "UNDER CONSTRUCTION\nthis content will be implemented at a later date.";
        this.shop_object_detail_text_0.getComponent(TextShape).value = "";
        this.shop_object_detail_text_2.getComponent(TextShape).value = "";
    }

    //attempts to purchase the current selection
    public AttemptPurchase()
    {
        //weapon purchase
        if(this.shopMode == 0)
        {
            //check current ownership and funding
            if(!WeaponRepo.INSTANCE.WeaponList.get(this.shopIndexWeapons).Owned && WeaponRepo.INSTANCE.WeaponList.get(this.shopIndexWeapons).Cost <= ScoringManager.INSTANCE.player_money)
            {
                //add weapon
                WeaponRepo.INSTANCE.WeaponList.get(this.shopIndexWeapons).Owned = true;
                //remove money
                ScoringManager.INSTANCE.player_money -= WeaponRepo.INSTANCE.WeaponList.get(this.shopIndexWeapons).Cost;
                //update view
                this.DisplayWeapon(WeaponRepo.INSTANCE.WeaponList.get(this.shopIndexWeapons));
                ScoringManager.INSTANCE.updateUiObject();
            }
        }
    }

    //constructor
    constructor()
    {
        super();

        //initialize purchase menues
        this.PrepareShop();

        //set default state of shop
        this.Reset();
    }

    //resets state of weapon/perk managers 
    public Reset()
    {
        //reset item repos
        PerkRepo.INSTANCE.Reset();
        WeaponRepo.INSTANCE.Reset();

        //reset indexing
        this.shopMode = 0;
        this.shopIndexPerks = 0;
        this.shopIndexWeapons = 0;
        this.shop_object_toggle_text.getComponent(TextShape).value = "WEAPONS";

        //display the first weapon
        this.DisplayWeapon(WeaponRepo.INSTANCE.WeaponList.get(0));
    }
}