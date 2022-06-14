/*      SCORING MANAGER
    overhead class that stores information regarding the player's
    general stats, such as currency and enemies defeated. 

*/

import type { GameManager } from "./GameManager";
@Component("ScoringManager")
export class ScoringManager
{
    public static INSTANCE:ScoringManager;

    public player_health:number = 0;
    public player_money:number = 0;
    public player_kills:number = 0;

    /* UI WAVE DISPLAY */
    rect:UIContainerRect;
    ui_text_health:UIText;
    ui_text_money:UIText;
    ui_text_kills:UIText;
    //create 2d game state ui display
    prepareWaveUI()
    {
        //ui
        //  rect container
        this.rect.width = 240;
        this.rect.height = 62;
        this.rect.positionX = 165;
        this.rect.positionY = 10;
        this.rect.hAlign = "left";
        this.rect.vAlign = "top";
        this.rect.color = Color4.Gray();
        this.rect.opacity = 0.8;
        //  texts -- health
        this.ui_text_health.value = "Health: ##";
        this.ui_text_health.fontSize = 15;
        this.ui_text_health.width = "85%";
        this.ui_text_health.height = 20;
        this.ui_text_health.positionY = -2;
        this.ui_text_health.hAlign = "center";
        this.ui_text_health.vAlign = "top";
        //  texts -- money
        this.ui_text_money.value = "Money: ##";
        this.ui_text_money.fontSize = 15;
        this.ui_text_money.width = "85%";
        this.ui_text_money.height = 20;
        this.ui_text_money.positionY = -20;
        this.ui_text_money.hAlign = "center";
        this.ui_text_money.vAlign = "top";
        //  texts -- kills
        this.ui_text_kills.value = "Kills: ##";
        this.ui_text_kills.fontSize = 15;
        this.ui_text_kills.width = "85%";
        this.ui_text_kills.height = 20;
        this.ui_text_kills.positionY = -38;
        this.ui_text_kills.hAlign = "center";
        this.ui_text_kills.vAlign = "top";
        //  update newly created view
        this.updateUiObject();
    }
    public MoveUiObject(x:number, y:number) { this.rect.positionX = x; this.rect.positionY = y; }
    updateUiObject() 
    { 
        this.ui_text_health.value = "Health: "+this.player_health.toString(); 
        this.ui_text_money.value = "Money: "+this.player_money.toString(); 
        this.ui_text_kills.value = "Kills: "+this.player_kills.toString(); 
    }

    //initializes manager upon object creation
    constructor(manager:GameManager)
    {
        //set global access
        ScoringManager.INSTANCE = this;

        //setup ui
        this.rect = new UIContainerRect(manager.ui_canvas);
        this.ui_text_health = new UIText(this.rect);
        this.ui_text_money = new UIText(this.rect);
        this.ui_text_kills = new UIText(this.rect);
        this.prepareWaveUI();

        this.Reset();
    }

    //resets player's score
    public Reset()
    {
        this.player_health = 100;
        this.player_money = 0;
        this.player_kills = 0;

        this.updateUiObject();
    }
}