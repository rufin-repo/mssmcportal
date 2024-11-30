//-----------------------------------------------------
// CWA: Compact Web App utility classes and functions
// (c) Copyright 2023 Rufin Hsu. All rights reserved
// Free license granted for use and modification in 
// MSS Math Club web site only.
//-----------------------------------------------------
///<reference path="spath.ts"/>
///<reference path="blueimp_md5.ts"/>
///<reference path="askserver.ts"/>

//#define TOPLEFT_USE_getBoundingClientRect

// closure compile got confused when we extend the ButtonPanel class
//#define NOEXTEND
//#define BOTTOMLESS
// Add missing index definitions
interface Document { [key:string]: any; }
interface Navigator{ [key:string]: any; }
interface Window { [key: string]: any; }
interface CSSStyleDeclaration {
  zoom: string;
}

interface HTMLCanvasElement { // 4 extra properties
  __xSize:number;    __ySize:number;
  __xScl :number;    __yScl :number;
}

interface HTMLDivElement { // extra properties for auto resizing and display on returning from none.
  __UIAdjSizeFcn:(thisdiv:HTMLDivElement)=>void;
  __UIAdjSizeData:number[];
  __displaySave:string;  // saved style.display value before setting to "none" in ShowHidePopupDiv()
}

/** @type {Object} */
const A={
  Hash: -314159265, // Don't modify this value! The Hash value in the closure-compiled script will be automatically fixed with AskScoreServer('RSVP'...)

  BuildDate: "0000-00-00-000000",
  // Score Server URL
  kAskServerURL:     'mmaserver.php',
  // Service Worker script
  kSWScript:         'mmahome-sw.js',

  // icon ids
  kIcon_FavIcon:            0,
  kIcon_Forum:              1,
  kIcon_Warning:            2,
  kIcon_Confirm:            3,
  kIcon_Error:              4,
  kIcon_3HorzBars:          5,
  kIcon_3VertDots:          6,
  kIcon_3HorzDots:          7,
  kIcon_Reminder:           8,
  kIcon_Info:               9,
  kIcon_Add:               10,
  kIcon_TrashCan:          11,
  kIcon_Help:              12,
  kIcon_MAX:               13, //<== must be the last+1.

  PI2 : Math.PI*2,             // 2 Pi
  HalfPI: Math.PI/2,
  R2 : 1.0/Math.sqrt(2.0),     // 1/root2

  Hide:           0,
  Show:           1,
  ToggleShowHide: 2,

  ProgressSz:                 80,   // px
  kDefaultClickHoldDuration: 300,   // how long a click has to be held to trigger a click-hold event.
  kClickHoldRadius:           12,
  kIconSz:                    40,   // size of CreateIcon icons.

  // Cookie Keys
  kCK_DbgLog:        'DbgLog',
  kCK_UserId:        'CloudUsr',
  kCK_PassWd:        'CloudHash',
  kCK_SigninAtStart: 'SignInAtStartQ',
  kCK_ClickHoldTime: 'ClickHoldDuration',
  kCK_LastHelpFile:  'HelpFile',

  // App Modal States (-ve enums for App modal states, editor modal states are +ve)
  // MS_PickingItem:      -1,
  MS_DisplayingText:   -2,
  MS_ChangingSettings: -3,
  MS_ChangingBPM:      -4,
  MS_ServerRequest:    -5,
  MS_SigningIn:        -6,
  MS_GenericQuery:     -7,
  MS_AboutBox:         -8,
  MS_AlertBox:         -9,
  MS_ShowingWebPage:   -10,
  MS_BugEntryDialog:   -11,
  MS_ButtonPanelDialog:-12,
  MS_ShowingCal:       -13,
  MS_ShowingNews:      -14,
  MS_ZoomingDiv:       -15,
  MS_ViewingEvent:     -16,
  MS_PickingPoll:      -17,
  MS_ViewingPoll:      -18,
  MS_EnteringOldPwd:   -19,

  MSX_None:             0,
  MSX_Accept:           1,  // finished.
  MSX_Cancel:           2,
  MSX_DontExit:         3,

  // Generic Query response
  AnsOK:     1,  // OK means Yes
  AnsYes:    1,
  AnsNo:    -1,
  AnsCancel: 0,
  // Generic Query Dismiss Buttons
  GQ_OK:            1,
  GQ_Cancel:        2,
  GQ_OKCancel:      3,
  GQ_YesNo:       0xC,
  GQ_YesNoCancel: 0xE,

  // 3 state button states
  S3_Off:           0,
  S3_On:            1,
  S3_Disabled:     -1,

  // Signin ops
  SI_Normal:        0,  // normal sign in
  SI_NewUsr:        1,  // add a new user
  SI_ChgPwd:        2,  // chg passwd of existing user
  SI_Pwd2OK:        3,
  SI_DefaultAction: 9,  // (caused by hitting the enter key)
  SI_Pwd2Cancel:   -3,
  SI_Cancel:       -1,

  kPickerLoadAction:    1,
  kPickerDelAction:     2,
  kPickerRenameAction:  3,

  // Button Panel button type enum
  // LS 4 bits: type, upper bits: additional flags
  PB_ButtonTypeMask:   0xf,
  PB_NoButton:           0,
  PB_ToggleButton:       1,
  PB_PushButton:         2,
  PB_RadioButton:        4,
  PB_RadioButton1st:  0x14,
  //PB_RadioButtonLast: 0x24,
  PB_OKButton:        0x42,
  PB_CancelButton:    0x82,

  PBA_NoAction:       0,
  PBA_Default:        1,
  PBA_ToggleOn:       2,
  PBA_ToggleOff:      3,
  PBA_PushOn:         4,
  PBA_PushOff:        5,
  PBA_SetRadio:       6,
  PBA_SlipOn:         7,  // sliding back onto a slipped pushed button
  PBA_SlipOff:        8,  // sliding off from a pushed button
  PBA_Drag:           9,  // mouse dragged after clicked on a button.

  // OnChange chgtype enums
  PBC_StateChange:    0,
  PBC_OKDone:         1,  // proper releasing of an OK button.
  PBC_Cancelled:     -1,  // proper releasing of a Cancel button.
  PBC_PushedDown:     2,  // initial push down of a push button (might not be followed by a proper release.)
  PBC_PushSlipped:    3,  // pointer slipped on or off a push button
  PBC_PushDone:       4,  // proper releasing of an ordinary push button.
  PBC_Drag:           5,  // mouse dragged. nothing to do with state changes.

  // CButton Button basic styles
  CBS_Rect:           1,
  CBS_Round:          2,
  CBS_3D:             0x80,

//#ENDMACRO
  AboutBoxHTML:
`<p style='text-align:center;'><span class='aboutboxlogo'>
CWA</span><br>Compact Web App<br>
Copyright (c) 2023 Rufin Hsu <br>
All rights reserved<br><br>
%MO%<br>
Build: %BN%</p>`,
} // const A

function byId(id:string) {
  return document.getElementById(id);
}

interface ModalStateInfo {
  state:number,
  div:HTMLDivElement,
  escAction:number,
  enterAction:number,
  onCancel:()=>void,
  onAccept:()=>void,
}

class CanvasTracker
{
  private mCanvId:string;
  private mTargetCanvas:HTMLCanvasElement;
  private mTrackingTouchIds: number[];
  public  trackPtId:number=-9999;
  private mTrackPtStartX: number=-9999;  // in canvas pixel coordinates (i.e. scaled by CWA.CanvasResScale)
  private mTrackPtStartY: number=-9999;
  private mStartDragScrollPos: number = 0;
  private mMomentumTimer = -1;
  private mLastDragSpeed: number = 0;
  private mLastDragTime: number=0;
  private mLButtonDownQ=false;
  private mClickHoldTimer:number=-1;
  private mClickHoldClickId:number=-1;
  private mClickHoldStartX:number=0;  // in game canvas pixel coordinates (scaled by CWA.CanvasResScale)
  private mClickHoldStartY:number=0;

  onClick: (canvX:number, canvY:number)=>void;
  onClickHold: (canvX:number, canvY:number)=>void;
  onDrag: (canvX:number, canvY:number)=>void;
  onMouseUp: ()=>void;


  constructor(canvId:string, targCanv:HTMLCanvasElement=null) {
    this.mCanvId=canvId;
    this.mTargetCanvas = targCanv || byId(canvId) as HTMLCanvasElement;
    this.onClick=function(_canvX:number,_canvY:number){};
    this.onClickHold=function(_canvX:number,_canvY:number){};
    this.onDrag=function(_canvX:number,_canvY:number){};
    this.onMouseUp=function(){};
    this.mTrackingTouchIds=[];
    this.trackPtId=-9999;
    this.mMomentumTimer=-1;
  }

  get LButtonDownQ() {return this.mLButtonDownQ;}
  get canv() {return this.mTargetCanvas;}
  get momentumTimer() {return this.mMomentumTimer;}
  StopMomentumTimer() {
    if (this.mMomentumTimer!==-1) {
      window.clearInterval(this.mMomentumTimer);
      this.mMomentumTimer=-1;
    }
  }
  StartTracking(x:number, y:number, ptId:number) {
    this.mTrackPtStartX = x;
    this.mTrackPtStartY = y;
    this.trackPtId = ptId;
    if (ptId===-9999) this.mLButtonDownQ=true;
  }
  get trackingTouchIds() {return this.mTrackingTouchIds;}

  private ClickHoldChecker() {
    /*DBG*/console.log("clkHoldChk: "+this.mClickHoldClickId+":"+CWA.ClickIdCounter);
    if (this.mClickHoldClickId===CWA.ClickIdCounter) { // no new clicks happened and not dragged far enough yet.
      if (this.onClickHold) this.onClickHold(this.mClickHoldStartX, this.mClickHoldStartY);
    }
    this.mClickHoldTimer=-1;
    //CWA.ClickHoldClickId=-1;
  } // CWA::ClickHoldChecker() //

  StartClickHoldTimer(clickX:number, clickY:number, clickId:number) {
    if (this.mClickHoldTimer!==-1)
      window.clearTimeout(this.mClickHoldTimer);
    this.mClickHoldTimer=-1;

    if (!CWA.InModalState && this.mMomentumTimer===-1) {
      this.mClickHoldTimer = window.setTimeout(()=>{this.ClickHoldChecker()}, CWA.ClickHoldDuration);
      this.mClickHoldStartX=clickX;
      this.mClickHoldStartY=clickY;
      this.mClickHoldClickId = clickId;
    }
  } //CanvasTracker::StartClickHoldTimer()

  UpdateClickHold(newPosX:number, newPosY:number, clickId:number) {
    if (this.mClickHoldClickId===clickId) {
      if (Math.abs(newPosX-this.mClickHoldStartX)>A.kClickHoldRadius ||
          Math.abs(newPosY-this.mClickHoldStartY)>A.kClickHoldRadius) { // moved too much
        if (this.mClickHoldTimer!==-1) {
          window.clearTimeout(this.mClickHoldTimer);
          this.mClickHoldTimer=-1;
        }
        this.mClickHoldClickId=-1;
      }
    }
  }

  ClearClickHold() {
    this.mClickHoldClickId=-1;
    if (this.mClickHoldTimer!==-1) {
      window.clearTimeout(this.mClickHoldTimer);
      this.mClickHoldTimer=-1;
    }
  }

  public CallOnClick(cvX:number, cvY:number, _event:Event) {
    if (this.onClick)
      this.onClick(cvX, cvY);
  }

  public CallOnRelevantDrag(cvX:number, cvY:number, event:Event) {
    if (this.onDrag) this.onDrag(cvX, cvY);
    this.mLastDragTime = event.timeStamp;
  }

  public ClearLButtonDown() {this.mLButtonDownQ=false;}

  public CallOnMouseUp(_event:Event) {
    if (this.onMouseUp) this.onMouseUp();
  }
} //class CanvasTracker

/*===================================================================*\
   ____ ____ ____
  ||C |||W |||A ||
  ||__|||__|||__||
  |/__\|/__\|/__\|
  Compact Web App base class
\*===================================================================*/
class CWA {
  // UI Colors
  public  static ColorBg1: string = "";
  public  static ColorBg2: string = "";
  public  static ColorBg3: string = "";
  public  static ColorUI1: string = "";
  public  static ColorUI2: string = "";
  public  static ColorUI3: string = "";

  public  static MinCanvasH=240; // in px
  public  static MinCanvasW=240; // in px

  // Modal state handling
  public static InModalState:number=0;
  public static ModalStateUITable:ModalStateInfo[] = []; // one for each registered modal state.
  public static ModalStateStack:number[]           = [];
  public static ModalUICtrlStateStack:boolean[][]  = []; // for restoring the enabled/disabled state of ctrls in pushed modal state UIs.

  //var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
  public  static IsSafariQ = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
  public  static IsMSEdgeQ = window.navigator.userAgent.indexOf("Edge") > -1;
  public  static IsiOSQ = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
  public  static IsMobileDevQ = false;
  public  static ServiceWorkerReadyQ = false;
  public  static SWRegistration: ServiceWorkerRegistration = null;
  private static SW_UpdateAvailableQ:number = -1; // -1:don't know yet, 1:yes, 0:no.
  public  static WebAppModeQ  = false;
  public  static IgnoreResizeQ = false;

  //------------------ Server Access and User management ---
  public  static UserId:string="";
  public  static PassHash:string="";           // md5 hashed twice for saving in a cookie
  public  static PassHashTempQ:boolean=true;
  public  static UserValidatedQ:boolean=false;
  public  static UserLevel:number=0;
  private static SigninUserInput: HTMLInputElement=null;
  private static SigninPwdInput: HTMLInputElement=null;
  private static SigninDialogDiv: HTMLDivElement=null;
  private static SigninAddUserBtn: HTMLButtonElement=null;
  private static SigninChgPwdBtn: HTMLButtonElement=null;
  private static SigninOKBtn: HTMLButtonElement=null;
  private static Pwd2DialogDiv: HTMLDivElement=null;
  private static Pwd2Title:HTMLElement=null;
  private static Pwd2InputDesc: HTMLElement=null;
  private static Pwd2Desc:  HTMLElement=null;
  private static Pwd2Input: HTMLInputElement=null;
  private static Pwd2Objective:number = 0;
  private static _PostPwd2Callback:(pwd2:string)=>void=null;

  //------------------ Main Canvas --------------------------
  public  static MainCanvas:HTMLCanvasElement = null;
  public  static MainCanvasW:number = 0;  // in actual canvas pixels, not px
  public  static MainCanvasH:number = 0;  // in actual canvas pixels, not px
  private static MainCanvasTD :HTMLTableCellElement = null;
  private static UITable      :HTMLTableElement = null;
  public  static MainCanvasCtx:CanvasRenderingContext2D =null;
  public  static StatusTextEle:HTMLElement = null;
  public  static MainCanvasTracker: CanvasTracker = null;

  //------------------- Settings Div and Canvas --------------
  public static SettingsDiv:HTMLDivElement =null;
  public static SettingsCanvas:HTMLCanvasElement=null;

  //------------------- Progress Spinner ---------------------
  public static ProgressSpinnerDiv:HTMLDivElement=null;

  //-------------------- ButtonPanel -----------------------------
  private static ButtonList:ButtonPanel = null;
  public  static ButtonListCanvas: HTMLCanvasElement = null;

  //------------- MessageBox and Splash Screen ---------------
  public  static TextInfoArea: HTMLDivElement = null;
  public  static TextInfoCloseCallback: ()=>void = null;
  //--------------------- Alert Box --------------------------
  private static AlertBoxDiv: HTMLDivElement = null;
  private static AlertBoxIconDiv: HTMLDivElement = null;
  private static AlertBoxMsgSpan: HTMLSpanElement = null;

  private static MJ:any=null; // the MathJax object if available.

  //----------------------------------------------------------
  // Esoteric hacks/patches to deal with browser oddities
  //----------------------------------------------------------
  public  static ListenerHasPassiveQ = false;
  private static BlurThisOnCanvasClick: HTMLElement = null;
  public  static LastProcessedClickTime:number=0;
  public  static ResizeIgnoredQ = false;

  // Device Pixel Ratio Corrected Canvas related functions
  public  static CanvasResScale:number = window.devicePixelRatio || 1;
  public  static NewCanvas(xsize:number=0, ysize:number=0, autoScaleQ:boolean=false) : HTMLCanvasElement {
    let canv = document.createElement("canvas");
    if (xsize>0 && ysize>0) {
      CWA.SetCanvasSize(canv, xsize, ysize, autoScaleQ);
    }
    else {
      canv.__xSize=0; canv.__xScl=1;
      canv.__ySize=0; canv.__yScl=1;
    }
    return canv;
  } // CWA.NewCanvas()

  public static SetCanvasSize(canv:HTMLCanvasElement, xsize:number, ysize:number, autoScaleQ:boolean=false) {
    if (xsize>0 || ysize>0) {
      let scl:number = CWA.CanvasResScale;
      if (autoScaleQ && 1!==scl) {
        if (xsize>=1) {
          canv.__xSize = xsize; // this could be non-integral
          canv.__xScl = (canv.width = Math.round(xsize*scl))/xsize;
        }
        if (ysize>=1) {
          canv.__ySize = ysize;
          canv.__yScl = (canv.height = Math.round(ysize*scl))/ysize;
        }
        let ctx = canv.getContext("2d");
        ctx.setTransform(canv.__xScl,0,0,canv.__yScl,0,0);

        canv.style.width = xsize+"px";
        canv.style.height= ysize+"px";
      }
      else {
        if (xsize>0) canv.__xSize = canv.width = xsize;
        if (ysize>0) canv.__ySize = canv.height = ysize;
        canv.__xScl=canv.__yScl=1;
        if (autoScaleQ) { // still need to set this.
          canv.style.width = xsize+"px";
          canv.style.height= ysize+"px";
        }
      }
    }
  } // CWA.SetCanvasSize() //

  public static HasClassQ(ele:HTMLElement, cls:string) : boolean {
    return ele.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'))!==null;
  }
  public static AddClass(ele:HTMLElement, cls:string) {
    if (!CWA.HasClassQ(ele,cls)) {
      ele.className = (ele.className+" "+cls).trim();
    }
  }
  public static RemoveClass(ele:HTMLElement, cls:string) {
    if (CWA.HasClassQ(ele,cls))
      ele.className=ele.className.replace(
        new RegExp('(\\s|^)'+cls+'(\\s|$)'),' ').trim();
  }

  public static Typeset(id:string|HTMLElement|null=null, callback:()=>void=null) // MathJax
  {
    CWA.MJ && CWA.MJ["Hub"]["Queue"](id ? ["Typeset", CWA.MJ["Hub"], id, callback] : ["Typeset", CWA.MJ["Hub"]]);
  } // CWA.Typeset()

  public static _DbgDrw(canv:HTMLCanvasElement, x:number=0, y:number=0) {
    if (CWA.MainCanvasCtx) {
      let ctx = CWA.MainCanvasCtx;
      ctx.save();
      ctx.setTransform(1,0,0,1,0,0);
      ctx.drawImage(canv, x, y); //,  canv.width, canv.height);
      ctx.strokeStyle="#0f0";
      ctx.strokeRect(x,y, canv.width, canv.height);
      ctx.restore();
    }
  } // CWA._DbgDrw()

  private static CreatedIcons:string[] = [];
  public static GetIcon(iconShape:number) : string {
    if (iconShape<0 || iconShape>=A.kIcon_MAX) iconShape=0;
    if (CWA.CreatedIcons[iconShape]===null) {
      return CWA.CreateIcon(A.kIconSz, A.kIconSz, iconShape);
    }
    else
      return CWA.CreatedIcons[iconShape];
  } // CWA.GetIcon() //

  public static CreateIcon(w:number, h:number, iconShape:number) : string {
    if (iconShape<0 || iconShape>=A.kIcon_MAX) iconShape=0;
    let iconcanvas = CWA.CreateIconCanvas(w,h,iconShape);
    if (iconcanvas) {
      if (CWA.CreatedIcons.length===0) {
        CWA.CreatedIcons.length = A.kIcon_MAX;
        CWA.CreatedIcons.fill(null);
      }
      return CWA.CreatedIcons[iconShape]="url("+iconcanvas.toDataURL()+")";
    }
    else
      return null;
  } // CWA.CreateIcon()

  public static CreateIconCanvas(w:number, h:number, iconShape:number) :HTMLCanvasElement {
    w = Math.ceil(w);
    h = Math.ceil(h);
    let iconCanvas = CWA.NewCanvas(w,h,/*autoScale->*/true);
    return CWA.RenderIconCanvas(iconCanvas, iconCanvas.__xSize, iconCanvas.__ySize, iconShape);
  } // CWA.CreateIconCanvs()

  public static SetupSelectOptions(select:HTMLSelectElement, optlist:{label:string, value:string}[], initialSelectIdx:number=0) {
    let optcollection=select.options;
    while (optcollection.length>0) { optcollection[optcollection.length-1].remove(); }
    for (let i=0; i<optlist.length; i++) {
      let opt = document.createElement("option");
      opt.text = optlist[i].label;
      opt.value= optlist[i].value;
      select.add(opt);
      if (opt.value==="NA") opt.disabled=true;
    } // for (i) .. //
    select.selectedIndex = initialSelectIdx>=0 && initialSelectIdx<optlist.length ? initialSelectIdx : -1;
  } // SetupSelectOptions() //

  public static SetupSelect(selectId:string, fcn:EventListener,
    optlist:{label:string, value:string}[], initialSelectIdx:number=0) : HTMLSelectElement {
    let select:HTMLSelectElement = byId(selectId) as HTMLSelectElement
    if (select && select instanceof HTMLSelectElement) {
      select.addEventListener("mousedown", ()=>{
        CWA.BlurThisOnCanvasClick=select;
      }, false);
      if (optlist) CWA.SetupSelectOptions(select, optlist, initialSelectIdx);
      if (fcn) {
        select.addEventListener("change", (e:Event)=>{
          fcn(e);
          CWA.UpdateUIState();
          CWA.BlurThisOnCanvasClick=select;
        });
        //select.addEventListener("click", ()=>{CWA.BlurThisOnCanvasClick=select;});
      } // if (fcn)
    }
    else
      select=null;
    return select;
  } // SetupSelect() //

  public static SetupButton(btnid:string, fcn:EventListener, bgIconId:number=-1): HTMLButtonElement
  {
    //
    // ! ! !  Make sure that the button element is not style.display="none"
    // ! ! !  O.w. setting background image would have no effect.
    //
    let btn = byId(btnid) as HTMLButtonElement;
    if (btn) {
      //btn.addEventListener("touchDown", (e:Event)=>{btn.blur(); fcn(e);});
      btn.addEventListener("click",
        (e:Event)=>{
          e.preventDefault();
          btn.blur();
          CWA.LastProcessedClickTime=performance.now();
          fcn(e);
        } // (e:Event)=>
      ); // btn.addEventListener(..
      btn.addEventListener("touchDown",
        (e:Event)=>{
          e.preventDefault();
          btn.blur();
          CWA.LastProcessedClickTime=performance.now();
          fcn(e);
        } // (e:Event)=>
      ); // btn.addEventListener(..

      CWA.SetBgIcon(btn, bgIconId);
    } // if (btn) .. //
    return btn;
  } // SetupButton() //

  public static SetupButtonClassWithin
    (parent:HTMLElement,
     classname:string, fcn:EventListener) : HTMLCollectionOf<Element> //NodeListOf<Element>
  {
    let btns: HTMLCollectionOf<Element>=null; //NodeListOf<Element> = null;
    if (parent) {
      btns = parent.getElementsByClassName(classname);
      for (let i=0; i<btns.length; i++) {
        btns[i].addEventListener("touchDown", (e:Event)=>{e.preventDefault(); fcn(e)});
        btns[i].addEventListener("click", (e:Event)=>{e.preventDefault(); fcn(e)});
      }
    }
    return btns;
  } // SetupButtonClassWithin() //

  public static EnableButton(e: HTMLButtonElement, enableQ:boolean) {
    if (e) e.disabled=!enableQ;
  } // EnableButton()
  public static EnableSelect(s: HTMLSelectElement, enableQ:boolean) {
    if (s) s.disabled=!enableQ;
  } // EnableSelect()
  public static EnableSelectOptions(s: HTMLSelectElement, onoff:boolean[]) {
    if (s && s.options && onoff.length===s.options.length) {
      for (let i=0; i<s.options.length; i++) {
        let opt = s.options[i];
        opt.disabled = !onoff[i];

        // The following mess is to get around a Mobile Chrome bug that does not dim disabled options.
        if (opt.value!=="NA") {
          opt.label = onoff[i] ? opt.innerText //<-- without this OSX Safari will display a blank.
                               : "  ("+opt.innerText.toLowerCase()+")";
        }
      } // for (i) //
    }
  } // CWA.EnableSelectionOptions() //

  public static SetBgIcon(ele:HTMLElement, iconId:number, forceSz:number=-1) {
    if (ele && iconId>=0) {
      ele.style.backgroundImage =
        CWA.CreateIcon(ele.clientWidth, ele.clientHeight, iconId);
      ele.style.backgroundRepeat="no-repeat";
      ele.style.backgroundPosition="center";
      let sz = forceSz>0 ? forceSz : Math.min(ele.clientWidth, ele.clientHeight);
      if (sz<=0) {
        sz=40;
      }
      ele.style.backgroundSize = sz+"px "+sz+"px";
    } // if (div)
  } // CWA.SetBgIcon() //


  public static MessageBox(msg:string, forDbgLogQ=false, onClose:()=>void=null) {
    if (CWA.TextInfoArea && !CWA.InModalState) {
      let txtinf = CWA.TextInfoArea;
      txtinf.style.touchAction=forDbgLogQ ? "pan-x pan-y" : "none";
      txtinf.innerHTML = /*usePreQ ? ('<pre>' + msg + '</pre>') : */msg;
      CWA.TextInfoCloseCallback = onClose;
      CWA.EnterModalState(A.MS_DisplayingText);
      CWA.Typeset(txtinf);
      let sty = txtinf.style;
      sty.opacity = "1.0";
      sty.backgroundColor = "#efefef";
      sty.fontFamily = '"Courier New", Courier, monospace';

      sty.width = forDbgLogQ ? '95vw' : '';
      sty.zIndex = forDbgLogQ ? '3' : '2';
      sty.overflow = forDbgLogQ ? 'auto' : 'hidden';
      if (forDbgLogQ)
        CWA.RemoveClass(txtinf, "noselect");
      else
        CWA.AddClass(txtinf, "noselect");

      // sty.overflow = usePreQ ? 'visible' : 'hidden';
      // sty.whiteSpace = usePreQ ? 'pre-wrap' : 'no-wrap';
      // sty.wordWrap = usePreQ ? 'break-word' : 'normal';
      // sty.wordBreak = usePreQ ? 'break-all' : 'inherit';
    }
  } // MessageBox() //

  private static ModalStatePendingAlertMsg = '';
  private static ModalStatePendingAlertIcon = 0;

  public static AlertBox(icon:number, msg:string) {
    if (CWA.InModalState!==A.MS_AlertBox) {
      // Do not bring up an alert if we are in a modal state that would exit automatically without user interaction.
      if (CWA.InModalState===A.MS_ServerRequest/* || CWA.InModalState===A.MS_MorphingChanges*/) {
        if (CWA.ModalStatePendingAlertMsg) CWA.ModalStatePendingAlertMsg+='<br><br>';
        CWA.ModalStatePendingAlertMsg +=msg;
        CWA.ModalStatePendingAlertIcon = icon;
      }
      else {
        CWA.ModalStatePendingAlertMsg='';
        CWA.ModalStatePendingAlertIcon=0;
        CWA.EnterModalState(A.MS_AlertBox);
        CWA.AlertBoxIconDiv.style.backgroundImage = CWA.GetIcon(icon);
        CWA.AlertBoxIconDiv.style.backgroundSize = A.kIconSz+"px "+A.kIconSz+"px";
        CWA.AlertBoxMsgSpan.innerHTML = msg;
      }
    }
    else { // A previous alert is still there. Just append the new message.
      CWA.AlertBoxMsgSpan.innerHTML += "<br><br>" + msg;
    }
    CWA.Typeset(CWA.AlertBoxMsgSpan);
  } // CWA.AlertBox() //

  //-------------------------------------------------------------
  //  Modal State Management Functions
  //-------------------------------------------------------------
  private static LookupModalStateInfo(state:number) : ModalStateInfo {
    let tab = CWA.ModalStateUITable;
    //CWA.CatStatusText("looking up "+state+" in "+tab.length+" entries");
    let entry:ModalStateInfo = null;
    for (let i=tab.length-1; i>=0; i--) {
      if (tab[i].state===state) {
        entry=tab[i];
        break;
      }
      // else {
      //   CWA.CatStatusText("not "+i+" ("+tab[i].state);
      // }
    } // for (i)
    return entry;
  } // CWA.LookupModalStateInfo()

  static LookupModalStateUIDiv(state:number) : HTMLDivElement {
    let tab = CWA.ModalStateUITable;
    let div:HTMLDivElement = null;
    for (let i=tab.length-1; i>=0; i--) {
      if (tab[i].state===state) {
        div=tab[i].div;
        break;
      }
    } // for (i)
    return div;
  } // CWA.LookupModalStateUIDiv() //

  private static ModalCtrlTagNames = [ "BUTTON", "INPUT", "SELECT", "TEXTAREA" ];
  public static EnterModalState(state:number) :HTMLDivElement
  {
    let modalUIDiv:HTMLDivElement = null;
    if (state!==0) {
      if (CWA.InModalState) {
        let currdiv = CWA.LookupModalStateUIDiv(CWA.InModalState);
        let ctrlstates:boolean[] = [];
        if (currdiv && !CWA.PopupDivHiddenQ(currdiv)) {
          // go through all the elements within the curr modal UI div
          for (let t=0; t<CWA.ModalCtrlTagNames.length; t++) {
            let eles = currdiv.getElementsByTagName(CWA.ModalCtrlTagNames[t]);
            for (let i=0; i<eles.length; i++) {
              let e = eles[i];
              if (e instanceof HTMLButtonElement ||
                  e instanceof HTMLInputElement  ||
                  e instanceof HTMLSelectElement ||
                  e instanceof HTMLTextAreaElement) {
                // save their "disabled" states.
                ctrlstates.push(e.disabled);
                e.disabled=true;
              }
            } // for (i) //
          } // for (t)
        } // if (currdiv) .. //
        CWA.ModalUICtrlStateStack.push(ctrlstates);
        CWA.ModalStateStack.push(CWA.InModalState);
      } // if (CWA.InModalState)
      modalUIDiv = CWA.LookupModalStateUIDiv(state);
      if (modalUIDiv) {
        CWA.ShowHidePopupDiv(modalUIDiv, A.Show);
        if (modalUIDiv.__UIAdjSizeFcn) modalUIDiv.__UIAdjSizeFcn(modalUIDiv);
      }
      CWA.InModalState=state;
      CWA.UpdateUIState();
    } // if (state!==0) //
    return modalUIDiv;
  } // CWA.EnterModalState() //

  public static ExitModalState(exitingState:number, action:number/*=A.MSX_Cancel*/, allowOutOfOrderExitQ=false) {
    function restoreModalDivCtrls(prevdiv:HTMLDivElement, prevCtrlStates:boolean[]) {
      if (prevdiv && prevCtrlStates) {
        let savedN = 0;
        // go through all the elements that we are interested in.
        for (let t=0; t<CWA.ModalCtrlTagNames.length; t++) {
          let eles = prevdiv.getElementsByTagName(CWA.ModalCtrlTagNames[t]);
          for (let i=0; i<eles.length; i++) {
            let e = eles[i];
            if (e instanceof HTMLButtonElement ||
                e instanceof HTMLInputElement  ||
                e instanceof HTMLSelectElement ||
                e instanceof HTMLTextAreaElement) {
              if (savedN<prevCtrlStates.length) {
                // restores the "disabled" attributes to their saved states
                e.disabled =  prevCtrlStates[savedN];
                savedN++;
              }
            }
          } // for (i) //
        } // for (t)
      }
    } // restoreModalDivCtrls()

    if (CWA.InModalState) {
      let modStateInf: ModalStateInfo = null;
      if (exitingState!==CWA.InModalState) {
        if (!allowOutOfOrderExitQ) {
          CWA.SetStatusText("*** Error: Inconsistent Modal State On Exit. ("+exitingState+")");
          exitingState=0;
        }
        else { // search backward
          let popStackIdx=-1;
          for (let i=CWA.ModalStateStack.length-1; i>=0; i--) {
            if (CWA.ModalStateStack[i]===exitingState) {
              popStackIdx=i;
              break;
            }
          }
          if (popStackIdx>=0)
          {
            let prevstate =CWA.ModalStateStack[popStackIdx];
            let prevdiv = CWA.LookupModalStateUIDiv(prevstate);
            let prevCtrlStates = CWA.ModalUICtrlStateStack[popStackIdx];
            CWA.ModalStateStack.splice(popStackIdx,1);
            CWA.ModalUICtrlStateStack.splice(popStackIdx,1);
            restoreModalDivCtrls(prevdiv, prevCtrlStates);
            modStateInf = CWA.LookupModalStateInfo(exitingState);
          }
        }
      }
      else {
        let prevstate:number = 0;
        modStateInf = CWA.LookupModalStateInfo(exitingState);
        // CWA.CatStatusText("inf:"+(modStateInf!==null ? "non-null" : "null"));
        if (modStateInf!==null) {
          // CWA.CatStatusText("stack:"+CWA.ModalStateStack.length);
          if (CWA.ModalStateStack.length>0) { // pop the prev state.

            prevstate = CWA.ModalStateStack.pop();
            let prevdiv = CWA.LookupModalStateUIDiv(prevstate);
            let prevCtrlStates = CWA.ModalUICtrlStateStack.pop();
            restoreModalDivCtrls(prevdiv, prevCtrlStates);
          } // if (CWA.ModalStateStack.length>0)
        } // if (modStateInf)

        // Change state first before calling the callback in case the
        // callbacks call ExitModalState() again.
        // CWA.CatStatusText(modStateInf.div.id);
        CWA.InModalState = prevstate;
        // CWA.CatStatusText("a:"+action+" X->"+CWA.InModalState+" inf:"+(modStateInf.onCancel!==null).toString() +","+(modStateInf.onAccept!==null).toString());
      }

      if (modStateInf!==null && modStateInf.div!==null) {
        // CWA.CatStatusText("hiding");
        CWA.ShowHidePopupDiv(modStateInf.div, A.Hide);
        // CWA.CatStatusText("modStartInf!=null");
        if (action===A.MSX_Cancel && modStateInf.onCancel!==null) {
          // CWA.CatStatusText("calling onCancel");
          modStateInf.onCancel();
        }
        else if (action===A.MSX_Accept && modStateInf.onAccept!==null) {
          // CWA.CatStatusText("calling onAccept");
          modStateInf.onAccept();
        }
      } // modStateInf!==null && modStateInfo.div!==null)
      if (CWA.ResizeIgnoredQ) CWA.AdjCanvas();
      CWA.UpdateUIState();
    } // if (CWA.InModalState) .. //
    else
      CWA.log('xMS?'+exitingState+'?');
  } // CWA.ExitModalState() //

  public static ModalEscAndEnterAction(keycode:string) : boolean {
    // CWA.CatStatusText(`M:${CWA.InModalState} K:${keycode}`);
    if (CWA.InModalState) {
      let modalInf = CWA.LookupModalStateInfo(CWA.InModalState);
      // if (modalInf===null) CWA.CatStatusText("modalInf==null");
      // CWA.CatStatusText("entAct:"+modalInf.enterAction);
      if ((keycode==="Escape" || keycode==="Esc") && (modalInf===null || modalInf.escAction!==A.MSX_DontExit)) {
        CWA.ExitModalState(CWA.InModalState, modalInf.escAction);
        return true;
      }
      if (keycode==="Enter" && (modalInf===null || modalInf.enterAction!==A.MSX_DontExit)) {
        CWA.ExitModalState(CWA.InModalState, modalInf.enterAction);
        return true;
      }
    }
    return false;
  } // CWA.ModalEscAndEnterAction() //

  //===================================================================
  //
  //  Modal State related functions: Setup/Enter/Exit
  //
  //===================================================================
  public static SetupModalUIDiv(divId:string, state:number,
    escKeyAction:number, enterKeyAction:number,
    oncancel:()=>void=null, onaccept:()=>void=null, allowTouchPanQ:boolean=false) : HTMLDivElement {
    let div:HTMLDivElement = (divId===null ? null : byId(divId)) as HTMLDivElement;
    if (divId!==null && div===null) {
      throw "div not found";
    }
    if (div) {
      if (!allowTouchPanQ)
        div.style.touchAction="none";
      else
        div.style.touchAction="pan-x pan-y";
         // pinch-zoom"; //none";
      // if (!CWA.IsSafariQ)
      //   div.style.touchAction="pan-x pan-y pinch-zoom"; //none";
      // else {
      //   div.addEventListener('touchstart', CWA.preventZoom,
      //     CWA.ListenerHasPassiveQ ? {passive: true} : false);
      //   let tables = div.getElementsByTagName("table");
      //   for (let i=0; i<tables.length; i++) {
      //     tables[i].addEventListener('touchstart',  CWA.preventZoom,
      //       CWA.ListenerHasPassiveQ ? {passive: true} : false);
      //   }
      //   // // --- prevent touch-panning of the page
      //   // div.addEventListener('touchmove', (e:Event)=>{e.preventDefault()}, //CWA.preventZoom,
      //   //   CWA.ListenerHasPassiveQ ? {passive: true} : false);
      //   // for (let i=0; i<tables.length; i++) {
      //   //   tables[i].addEventListener('touchmove',  (e:Event)=>{e.preventDefault()}, //CWA.preventZoom,
      //   //     CWA.ListenerHasPassiveQ ? {passive: true} : false);
      //   // }
      // }
    }
    let tab = CWA.ModalStateUITable;
    for (let i=tab.length-1; i>=0; i--) {
      if (tab[i].state===state)
        throw "Modal state already registered";
    } // for (i)
    tab.push({
      state:state, div:div,
      escAction:escKeyAction,
      enterAction:enterKeyAction,
      onCancel:oncancel,
      onAccept:onaccept
    });
    return div;
  } // CWA.SetupModalUIDiv() //


  //=====================================================================
  // CWA::GenericQuery() : generic modal dialog
  //=====================================================================
  //private static GenQueryDiv: HTMLDivElement = null;
  private static GenQueryTitle: HTMLElement = null;
  private static GenQueryIconDiv: HTMLDivElement = null;
  private static GenQueryMsgSpan: HTMLSpanElement = null;
  private static GQ_OKBtn: HTMLButtonElement = null;
  private static GQ_YesBtn: HTMLButtonElement = null;
  private static GQ_NoBtn: HTMLButtonElement = null;
  private static GQ_CancelBtn: HTMLButtonElement = null;
  private static GenQueryCallback:(okstate:number)=>void;

  public static GenericQuery(icon:number, dlgtitle:string, htmlmsg:string, fcn:(answer:number)=>void, dismissBtns:number=A.GQ_YesNoCancel) {
    CWA.EnterModalState(A.MS_GenericQuery);
    CWA.GenQueryTitle.innerHTML=dlgtitle;
    CWA.GenQueryIconDiv.style.backgroundImage = CWA.GetIcon(icon);
    CWA.GenQueryIconDiv.style.backgroundSize = A.kIconSz+"px "+A.kIconSz+"px";
    CWA.GQ_OKBtn.style.display = (dismissBtns&A.GQ_OK)===0 ? "none" : "inline-block";
    CWA.GQ_CancelBtn.style.display = (dismissBtns&A.GQ_Cancel)===0 ? "none" : "inline-block";
    CWA.GQ_YesBtn.style.display = (dismissBtns&A.GQ_YesNo)===0 ? "none" : "inline-block";
    CWA.GQ_NoBtn.style.display = (dismissBtns&A.GQ_YesNo)===0 ? "none" : "inline-block";
    CWA.GenQueryMsgSpan.innerHTML = htmlmsg;
    CWA.GenQueryCallback = fcn;
  } // CWA.GenericQuery() //

  private static OnGenQueryDismiss(answer:number) {
    if (CWA.InModalState===A.MS_GenericQuery) CWA.ExitModalState(CWA.InModalState, A.MSX_None);
    if (CWA.GenQueryCallback!==null) {
      // Handle the AnsCancel dismiss call from a generic escape key press.
      if (answer===A.AnsCancel && CWA.GQ_CancelBtn.style.display==='none' && CWA.GQ_NoBtn.style.display!=='none')
        answer=A.AnsNo;
      CWA.GenQueryCallback(answer);
    }
    CWA.GenQueryCallback=null;
  } // CWA.OnGenQueryDismiss() //

  public static SetCookie(cname:string, cvalue:string)
  {
    try {
      if (cvalue===null)
        window.localStorage.removeItem(cname);
      else
        window.localStorage.setItem(cname, cvalue);
    }
    catch (err) { }
  } // SetCookie() //

  public static GetCookie(cname:string)
  {
    let cvalue='';
    try {
      cvalue = window.localStorage.getItem(cname);
      if (cvalue === null) cvalue='';
    }
    catch (err) { }
    return cvalue;
  } // GetCookie() //


  //------------------------------------------------------
  // Persistent debug log for tracing program flow.
  private static _prevLogs:string='';  // A copy of the log from previous sessions.
  private static _logstr:string='';    // Log string from the current session only.
  public static log(_s:string, toConsoleAlso:boolean=false) {
    if (toConsoleAlso)
      window.console.log(_s);
    CWA._logstr+=_s;
    CWA.SetCookie(A.kCK_DbgLog, CWA._prevLogs+CWA._logstr);  // immediately save back the log to the cookie.
    // /*DBG*/byId("txtmsg").innerHTML = CWA._logstr;
  } // CWA.log() //

  private static InitAndTrimOldLog()
  {
    let oldlogs = CWA.GetCookie(A.kCK_DbgLog);
    let revs= oldlogs.split('').reverse().join('');  // reverse the string for searching backingward.
    let sepPatt = /\>rb\<\>b\/\<[0-9-]{17}\:dliuB\>b\</g;  // reverse regex for "<b>Build:9999-99-99-999999<\b><br>"
    let chopAt = 0; // discard everything if the sepPatt is not matched.
    // Keep at most 4 previous sessions of logs.
    for (let i=0; i<4 && sepPatt.exec(revs)!==null; i++)
      chopAt = sepPatt.lastIndex;
    CWA._prevLogs = oldlogs.substring(oldlogs.length-chopAt) + '<br>\n';

    // **** Remember to update the above 'sepPatt' if the first part of the following separator line is changed!
    CWA._logstr = '<b>Build:'+A.BuildDate+'</b><br>\n'+(new Date()).toString()+'<br>\n';
  } // CWA.InitAndTrimOldLog()

  public static Clearlog() {
    CWA._prevLogs='';
    CWA.SetCookie(A.kCK_DbgLog, CWA._logstr);
  } // CWA.Clearlog() //

  public static logTail(n:number=10) : string {
    return CWA._logstr.substring(-n);
  } // CWA.logTail()

  public static ShowHideTableRow(rowid:string, showQ: Boolean) {
    let tablerow = byId(rowid);
    if (tablerow) {
      tablerow.style.display = showQ ? "table-row" : "none";
    }
  } // ShowHideTableRow() //

  public static ShowHidePopupDiv(div:HTMLDivElement, showhide:number) {
    let showQ:boolean;
    if (showhide===A.ToggleShowHide) {
      showQ = div.hidden; //div.style.display==="none" ? true : false;
    }
    else {
      showQ = showhide!==A.Hide;
    }
    div.hidden = !showQ;
    if (showQ) {
      if (div.style.display==='none')
        div.style.display=(!div.__displaySave ? '' : div.__displaySave);
    }
    else {
      if (div.style.display && div.style.display!=='none')  // back up the display value first.
        div.__displaySave=div.style.display;
      div.style.display='none';
    }
  } // CWA.ShowHidePopupDiv() //

  public static PopupDivHiddenQ(div:HTMLDivElement) : boolean {
    return div.hidden;
  } // CWA.PopupDivHiddenQ() //

  public static SetPopupDivPos(
    box:HTMLDivElement, left:number, top:number,
    shiftIntoViewQ:boolean=true)
  {
    // /*DBG*/if (box.style.position!=="fixed")
    // /*DBG*/  CWA.SetStatusText("div "+box.id+" position='"+box.style.position+"' instead of 'fixed'");
    let canvTL = CWA.GetCanvasTopLeftPos(CWA.MainCanvas);
    left += canvTL.left;
    top += canvTL.top;
    if (shiftIntoViewQ) {
      if (left<0) left=0;
      else if (left+box.clientWidth>window.innerWidth) {
        left = window.innerWidth - box.clientWidth;
      }
      if (top<0) top=0;
      else if (top + box.clientHeight>window.innerHeight) {
        top = window.innerHeight - box.clientHeight;
      }
    } // if (shiftIntoViewQ)
    box.style.left = left.toString() + "px";
    box.style.top  = top.toString()  + "px";
  } // CWA.SetPopupDivPos() //

  public static GetCanvasTopLeftPos(canvas: HTMLCanvasElement)
  {
//#ifdef TOPLEFT_USE_getBoundingClientRect
    let bdr = canvas.getBoundingClientRect();
    return {left:bdr.left, top:bdr.top+document.body.scrollTop};
//#else
//#     let x=canvas.offsetLeft, y=canvas.offsetTop;
//#     let parent : HTMLElement = canvas.offsetParent as HTMLElement;
//#     while (parent) {
//#         x += parent.offsetLeft - parent.scrollLeft;
//#         y += parent.offsetTop - parent.scrollTop;
//#         parent = parent.offsetParent as HTMLElement;
//#     }
//#     // Adding document.body.scrollTop is necessary if the document is scrolled.
//#     // E.g. in Mobile Safari after flicking up the browser bar.
//#     return {left : x, top : y+document.body.scrollTop};
//#endif TOPLEFT_USE_getBoundingClientRect
  } // CWA.GetCanvasTopLeftPos() //

  // Ugly hack to prevent double-tap zoom on buttons or text area
  private static preventZoom(e: TouchEvent)
  {
    let t2 = +e.timeStamp;
    let ele = e.currentTarget as HTMLElement;

    let t1 = ele.dataset.lastTouch !== undefined ? +ele.dataset.lastTouch : t2;
    let dt = t2 - t1;
    let nfingers = e.touches.length;
    ele.dataset.lastTouch = t2.toString();

    let tx:number=0, ty:number=0;
    let touches = e.changedTouches;
    if (touches.length>0) {
      tx = touches[0].pageX;
      ty = touches[0].pageY;
    }
    let dx = ele.dataset.lastTouchPageX!==undefined ? Math.abs(+ele.dataset.lastTouchPageX - tx) : 0;
    let dy = ele.dataset.lastTouchPageY!==undefined ? Math.abs(+ele.dataset.lastTouchPageY - ty) : 0;
    ele.dataset.lastTouchPageX = tx.toString();
    ele.dataset.lastTouchPageY = ty.toString();

    if (nfingers===1 && (!dt || dt > 400 /*|| nfingers > 1*/ || dx>30 || dy>30))
      return; // not double-tap

    e.preventDefault();
    ele.click();
  } // preventZoom() //

  private static _DebounceTimer: number = -1;
  private static _DelayedAdjCanvas() {
    CWA._DebounceTimer=-1;
    CWA.AdjCanvas();
    // CWA.SetStatusText('calling AdjCanvas()');
    CWA.UpdateStatusBar();
  } // _DelayedAdjCanvas() //

  private static onResize(_e : Event)
  {
    CWA.SetStatusText("resizing...");
    if (!CWA.IgnoreResizeQ) {
      if (CWA._DebounceTimer!==-1) {
        // There was a pending onResize, cancel it and restart the timer.
        window.clearTimeout(CWA._DebounceTimer);
      }
      CWA._DebounceTimer = window.setTimeout(CWA._DelayedAdjCanvas, 200);
      // CWA.adjCanvas();
    } // if (!CWA.IgnoreResizeQ) ..
  } // onResize(event) //

  public static FindGETParam(key:string) :string {
    let tmp:string[] = [];
    let items = window.location.search.substr(1).split("&");
    for (let index = 0; index < items.length; index++) {
      tmp = items[index].split("=");
      if (tmp[0] === key) {
        return decodeURIComponent(tmp[1]);
      }
    }
    return null;
  } // CWA.FindGETParam() //

  public static UpdateUIState() {
    if (CWA.AppUpdateUIStateFcn) CWA.AppUpdateUIStateFcn();
  } // CWA.UpdateUIState()

  private static PrevWindowHeight = -1;
  private static PrevWindowWidth  = -1;
  private static AdjCanvas() {
    if (CWA.PrevWindowHeight<0) CWA.PrevWindowHeight=window.innerHeight;
    if (CWA.PrevWindowWidth<0) CWA.PrevWindowWidth=window.innerWidth;

    if (CWA.IsMobileDevQ && CWA.InModalState
     && window.innerWidth===CWA.PrevWindowWidth && window.innerHeight<=CWA.PrevWindowHeight) {
       CWA.ResizeIgnoredQ = true;
       return; // ignore the collapsing of the mobile window in a modal state.
    }
    CWA.ResizeIgnoredQ=false;
    CWA.PrevWindowHeight = window.innerHeight;
    CWA.PrevWindowWidth  = window.innerWidth;

    // The following line is added to accommodate a Mobile Safari resize problem:
    // the window's innerHeight changed but the table's 100% height does not follow.
    if (CWA.UITable && CWA.MainCanvasTD && CWA.MainCanvas) {
      CWA.UITable.style.height = window.innerHeight.toString() + "px";

      let td = CWA.MainCanvasTD;
      td.style.minWidth=CWA.MinCanvasW+'px';
      let w=td.clientWidth;
      // let w=window.innerWidth;

      let tr = <HTMLTableRowElement>td.parentNode;
      tr.style.minHeight=CWA.MinCanvasH+'px';
      let h=window.innerHeight; //tr.clientHeight;
      if (CWA.StatusTextEle) {
        h-=CWA.StatusTextEle.offsetHeight;
      }
      // let h=Math.max(300, tr.clientHeight);
      h = Math.max(CWA.MinCanvasH, h);
      w = Math.max(CWA.MinCanvasW, w);

      let xres = Math.round(w*CWA.CanvasResScale);
      let yres = Math.round(h*CWA.CanvasResScale);

      const oldxres = CWA.MainCanvasW;
      const oldyres = CWA.MainCanvasH;
      if (xres!==oldxres || yres!==oldyres) {
        CWA.SetCanvasSize(CWA.MainCanvas, xres, yres); //w, h, true);
        CWA.MainCanvas.style.width="100%";
        CWA.MainCanvas.style.height=h.toString()+'px'; //"100%";
        CWA.MainCanvasW = CWA.MainCanvas.width;
        CWA.MainCanvasH = CWA.MainCanvas.height;
        CWA.MainCanvasCtx = CWA.MainCanvas.getContext("2d");

        if (CWA.AppAdjCanvasFcn) CWA.AppAdjCanvasFcn(w, h);
//#ifdef CBUTTON
//#         CWA.ButtonList.AdjCanvas(true);
//#endif CBUTTON
        CWA.RedrawCanvas(); // refresh everything.
      } // if (w!==oldw || h!==oldh)
    } // if (CWA.UITable)
  } // CWA.AdjCanvas()

  public static UpdateStatusBar() {
    if (CWA.AppGetStatusTextFcn)
      CWA.StatusTextEle.innerHTML=CWA.AppGetStatusTextFcn();
    else if (CWA.StatusTextEle) {  // Default version just displays a 'XXX ready' line.
      CWA.StatusTextEle.innerHTML=CWA.AppName+' ready';
    }
  } // UpdateStatusBar() //

  private static updateStatusBarTimer:number = -1;
  private static updateStatusBarTimerCallback() {
    CWA.updateStatusBarTimer=-1;
    CWA.UpdateStatusBar();
  }
  public static SetStatusText(innerhtml:string, forHowLong:number=-1) {
    CWA.StatusTextEle.innerHTML =innerhtml;
    CWA.Typeset(CWA.StatusTextEle);
    if (forHowLong>0 && forHowLong<60000) {
      if (CWA.updateStatusBarTimer!==-1) window.clearTimeout(CWA.updateStatusBarTimer);
      CWA.updateStatusBarTimer = window.setTimeout(CWA.updateStatusBarTimerCallback, Math.max(100,forHowLong));
    }
  } // CWA.SetStatusText()

  private static RenderIconCanvas(iconCanvas:HTMLCanvasElement, w:number, h:number, iconId:number):HTMLCanvasElement
  {
    let outCanv:HTMLCanvasElement=null;
    if (CWA.AppRenderIconFcn!==null)
      outCanv=CWA.AppRenderIconFcn(iconCanvas, w, h, iconId);

    if (outCanv===null)
    {
      let strkcolor = CWA.ColorUI1; //"midnightblue"; //"steelblue"; //"darkolivegreen";
      let fillcolor = CWA.ColorUI2;
      CWA.log(iconCanvas ? "<" : "~");
      let ctx = iconCanvas.getContext("2d");
      // Do not assume the ctx transform is correct. Set it up explicitly
      ctx.setTransform(iconCanvas.__xScl,0,0,iconCanvas.__yScl,0,0);
      ctx.save();

      CWA.log(ctx ? "." : "!");
      // what is this? --> ctx.beginPath();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.fillStyle = fillcolor;
      ctx.strokeStyle = strkcolor;
      // scale it down a little for some margins.
      ctx.transform(0.95*w/100,0,0,0.95*h/100, 0.025*w, 0.025*h);
      ctx.lineWidth=3;
      CWA.log(iconId.toString());
      switch (iconId) {
      case A.kIcon_FavIcon:
        {
          new SPath([0xfb,5,5,90,90,10]).RenderPath(ctx, ["f#fff","s"]);
          new SPath([0,50,15, 0x71,85]).RenderPath(ctx,['s']);
        }
        break;

      case A.kIcon_Warning:
        ctx.font="110px 'Icons'";
        ctx.fillStyle="#f80";
        ctx.fillText("\ue002", -5,105);
        break;

      case A.kIcon_Error:
        ctx.font="110px 'Icons'";
        ctx.fillStyle="#800";
        ctx.fillText("\ue000", -5,105);
        break;

      case A.kIcon_Info:
        ctx.font="110px 'Icons'";
        ctx.fillStyle="royalblue";
        ctx.fillText("\ueb81", -5,105);
        break;

      case A.kIcon_Forum:
        ctx.font="110px 'Icons'";
        ctx.fillStyle="cornflowerblue";
        ctx.fillText("\ue0bf", -5,105);
        break;

      case A.kIcon_Reminder:
        ctx.font="110px 'Icons'";
        ctx.fillStyle="orange";
        ctx.fillText("\ue031", -5,105);
        break;

      case A.kIcon_Confirm:
        ctx.font="110px 'Icons'";
        ctx.fillStyle="royalblue";
        // ctx.fillText("\uf1fe", -5,105);
        ctx.fillText("\ue834", -5,105);
        break;

      case A.kIcon_TrashCan:
        ctx.font="110px 'Icons'";
        ctx.fillStyle="royalblue";
        // ctx.fillText("\uf1fe", -5,105);
        ctx.fillText("\ue872", -5,105);
        break;

      case A.kIcon_3HorzBars: {
          new SPath([0,33,33, 0x72,67,
                    0,33,50, 0x72,67,
                    0,33,67, 0x72,67]).RenderPath(ctx, ["s"]);
        }
        break;

      case A.kIcon_3VertDots: {
          ctx.fillStyle=strkcolor;
          let r = 5;
          new SPath([0,50+r,33, 0xcc,50,33,r,
                    0,50+r,50, 0xcc,50,50,r,
                    0,50+r,67, 0xcc,50,67,r]).RenderPath(ctx, ["f"]);
        }
        break;

      case A.kIcon_3HorzDots: {
          ctx.fillStyle=strkcolor;
          let r = 5;
          new SPath([0,33+r,50, 0xcc,33,50,r,
                    0,50+r,50, 0xcc,50,50,r,
                    0,67+r,50, 0xcc,67,50,r]).RenderPath(ctx, ["f"]);
        }
        break;

      case A.kIcon_Add:
        ctx.lineCap="butt";
        new SPath([0,20,50,0x72,80, 0,50,20,0x71,80]).RenderPath(ctx,["s7"]);
        break;
      case A.kIcon_Help:
        {
          ctx.lineCap="butt";
          const lowy=50, cr=13;
          const hlfw=3.3;
          new SPath([
            0,50,lowy, 0xaa,50,lowy-cr,cr,90,180, // the top arc
            0,90,50, 0xcc,50,50,40
          ]).RenderPath(ctx, ["s"+hlfw*2]);
          ctx.fillStyle = strkcolor;
          new SPath([
            0xb,50-hlfw,lowy-hlfw,hlfw*2,14,          // the vertical bit below the top arc
            0xb,50-hlfw,lowy+14+hlfw*2,hlfw*2,hlfw*2  // the dot
          ]).RenderPath(ctx, ["f"]);
        }
        break;
      } // switch (iconId)
      ctx.restore();
      // /*DBG*/CWA._DbgDrw(iconCanvas);
      CWA.log(">");
      outCanv=iconCanvas;
    }
    return outCanv;
  } // CWA.RenderIconCanvas()

  public static  RedrawCanvas(redrawR:{l:number,t:number,w:number,h:number}=null) {
    let ctx = CWA.MainCanvasCtx;
    let Rl=0, Rt=0, Rw=CWA.MainCanvas.width, Rh=CWA.MainCanvas.height;
    if (redrawR) {
      Rl = Math.max(0, redrawR.l);
      Rt = Math.max(0, redrawR.t);
      let rgt = Math.max(Rl, Math.min(Rw, redrawR.l+redrawR.w));
      let bot = Math.max(Rt, Math.min(Rh, redrawR.t+redrawR.h));
      Rw = rgt-Rl;
      Rh = bot-Rt;
    }
    ctx.clearRect(Rl,Rt,Rw,Rh);
    if (CWA.AppRedrawCanvFcn) CWA.AppRedrawCanvFcn(redrawR);
  } // CWA.RedrawCanvas() //

  /*----------------------------------------------------------------------*\
     _____                 _     _   _                 _ _
    | ____|_   _____ _ __ | |_  | | | | __ _ _ __   __| | | ___ _ __ ___
    |  _| \ \ / / _ \ '_ \| __| | |_| |/ _` | '_ \ / _` | |/ _ \ '__/ __|
    | |___ \ V /  __/ | | | |_  |  _  | (_| | | | | (_| | |  __/ |  \__ \
    |_____| \_/ \___|_| |_|\__| |_| |_|\__,_|_| |_|\__,_|_|\___|_|  |___/

  \*----------------------------------------------------------------------*/
  // private static trackingTouchIds : number[]=[];
  // private static trackPtId: number = -9999;
  // private static trackPtStartX: number;  // in game canvas pixel coordinates (i.e. scaled by CanvasResScale)
  // private static trackPtStartY: number;
  // private static startDragScrollPos: number = 0;
  // private static lastDragSpeed: number = 0;
  // private static lastDragTime: number;
  private static draggingScoreQ = false;
  // private static momentumTimer = -1;
  private static momentumTimerInterval = 40;
  // private static LButtonDownQ=false;
  public  static ClickHoldDuration=600;
  public  static ClickIdCounter:number=0; // an ever increasing counter to identify the click/touches
  // private static ClickHoldTimer:number=-1;
  // private static ClickHoldClickId:number=-1;
  // private static ClickHoldStartX:number=0;  // in game canvas pixel coordinates (scaled by CanvasResScale)
  // private static ClickHoldStartY:number=0;
  private static CanvasTrackers:CanvasTracker[]=[];

  private static MainCanvasClick(tracker:CanvasTracker, event:Event) {
    CWA.ClickIdCounter++;

    event.preventDefault();
    // if (CWA.drumKitAnimTimer!==0) { return false; }  // game is still starting.

    if (CWA.BlurThisOnCanvasClick) {
      CWA.BlurThisOnCanvasClick.blur();
      CWA.BlurThisOnCanvasClick=null;
    }
    if (CWA.PrevWindowWidth!==window.innerWidth && CWA.IsMobileDevQ) {
      CWA.AdjCanvas();
    }

    let posX, posY; // these are in css px units from event.
    let cvX, cvY;   // scaled by CanvasResScale;
    let canvasPos = CWA.GetCanvasTopLeftPos(tracker.canv/*CWA.MainCanvas*/);
    let cTop = canvasPos.top;
    let cLeft= canvasPos.left;
    let stoppingMomentumQ = tracker.momentumTimer!==-1;
    const pxScl = CWA.CanvasResScale;
    // let rect= CWA.GameCanvas.getBoundingClientRect();
    // let cTop = rect.top;
    // let cLeft = rect.left;
    let firstPtQ = false;
    if (event.type === "touchstart") {
      //event.preventDefault();
      let touches = (<TouchEvent>event).changedTouches;
      let allTouches = (<TouchEvent>event).targetTouches;
      let tracking = tracker.trackingTouchIds;
      if (allTouches.length===1) {  // check this to allow reset all lost touches (e.g. iOS's missing touchend/touchcancel)
        tracking.length=1;
        // tracker.trackPtId = tracking[0] = allTouches[0].identifier;
        posX = allTouches[0].pageX-cLeft,  // convert into canvas offsets.
        posY = allTouches[0].pageY-cTop;
        cvX = posX*pxScl;
        cvY = posY*pxScl;
        // keep track of the position of a new touch.
        tracker.StopMomentumTimer();
        // if (tracker.momentumTimer!==-1) {
        //   window.clearInterval(CWA.momentumTimer);
        //   CWA.momentumTimer=-1;
        // }
        // CWA.trackPtStartX = cvX;
        // CWA.trackPtStartY = cvY;
        tracker.StartTracking(cvX, cvY, tracking[0]=allTouches[0].identifier);
        firstPtQ=true;
      }
      else {
        for (let i=touches.length-1; i>=0; i--) {
          if (tracking.indexOf(touches[i].identifier)<0) {  // new touch not being tracked yet.
            tracking.push(touches[i].identifier);
            posX = touches[i].pageX-cLeft,  // convert into canvas offsets.
            posY = touches[i].pageY-cTop;
            cvX = posX*pxScl;
            cvY = posY*pxScl;
            if (tracking.length===1 || tracker.trackPtId===-9999) {  // keep track of the position of a new touch.
              tracker.StopMomentumTimer();
              // if (CWA.momentumTimer!==-1) {
              //   window.clearInterval(CWA.momentumTimer);
              //   CWA.momentumTimer=-1;
              // }
              tracker.StartTracking(cvX, cvY, tracking[0]);
              // tracker.trackPtId = tracking[0];
              // CWA.trackPtStartX = cvX;
              // CWA.trackPtStartY = cvY;
              firstPtQ=true;
            }
          }
        } // for (i) //
      }
    } else { // a mouse event
      if (event instanceof MouseEvent && event.button!==0)
        return false;

      posX = (<MouseEvent>event).pageX-cLeft,  // convert into canvas offsets.
      posY = (<MouseEvent>event).pageY-cTop;
      tracker.StartTracking(cvX = posX*pxScl, cvY = posY*pxScl, -9999);
      // CWA.trackPtStartX = cvX = posX*pxScl;
      // CWA.trackPtStartY = cvY = posY*pxScl;
      // CWA.trackPtId = -9999;
      tracker.StopMomentumTimer();
      // if (CWA.momentumTimer!==-1) {
      //   window.clearInterval(CWA.momentumTimer);
      //   CWA.momentumTimer=-1;
      // }
      firstPtQ=true;
      // CWA.LButtonDownQ=true;
    }
    // /*DBG*/console.log(cvX+','+cvY);

    // set up a timer to wait and check if the user is holding a click for longer enough.
    tracker.StartClickHoldTimer(cvX, cvY, CWA.ClickIdCounter);
    // if (CWA.ClickHoldTimer!==-1) window.clearTimeout(CWA.ClickHoldTimer);
    // if (!CWA.InModalState && !stoppingMomentumQ) { // not a click-hold if the user is just stopping a momentum scroll.
    //   CWA.ClickHoldTimer = window.setTimeout(CWA.ClickHoldChecker, CWA.ClickHoldDuration);
    //   CWA.ClickHoldStartX = cvX;
    //   CWA.ClickHoldStartY = cvY;
    //   CWA.ClickHoldClickId = CWA.ClickIdCounter;
    // }

    if (CWA.InModalState===A.MS_ShowingWebPage
    ||  CWA.InModalState===A.MS_ButtonPanelDialog
    ||  CWA.InModalState===K.MS_PickingItem
    ||  CWA.InModalState===K.MS_PickingFile
    ||  CWA.InModalState===A.MS_PickingPoll
    ||  CWA.InModalState===A.MS_ShowingCal)
    {
      CWA.ExitModalState(CWA.InModalState, A.MSX_None);
    } // if (CWA.InModalState===A.MS_ShowingWebPage || MS_ButtonPanelDialog
    else
    if (!CWA.InModalState) {
      if (!CWA.HandleButtonListClick(event)) {
        tracker.CallOnClick(cvX, cvY, event);
        // if (CWA.AppOnClick)
        //   CWA.AppOnClick(cvX, cvY);
      }
    } // if (!CWA.InModalState)
    return true;
  } // CWA.MainCanvasClick() //

  // public static ClickHoldChecker() {
  //   /*DBG*/console.log("clkHoldChk: "+CWA.ClickHoldClickId+":"+CWA.ClickIdCounter);
  //   if (CWA.ClickHoldClickId===CWA.ClickIdCounter) { // no new clicks happened and not dragged far enough yet.
  //     if (CWA.AppOnClickHold) CWA.AppOnClickHold(CWA.ClickHoldStartX, CWA.ClickHoldStartY);
  //   }
  //   CWA.ClickHoldTimer=-1;
  //   //CWA.ClickHoldClickId=-1;
  // } // CWA::ClickHoldChecker() //

  private static MainCanvasDrag(tracker:CanvasTracker, event: Event) {
    let posX, posY; // in css px unit
    let cvX, cvY;   // in actual canvas pixel unit (i.e. scaled by CanvasResScale)
    let canvasPos = CWA.GetCanvasTopLeftPos(CWA.MainCanvas);
    let cTop = canvasPos.top;
    let cLeft= canvasPos.left;
    const pxScl = CWA.CanvasResScale;

    let relevantQ=false;
    if (event.type === "touchmove" || event.type==="touchend" || event.type==="touchcancel") {
      event.preventDefault();
      let touchEvent = event as TouchEvent;
      let tracking = tracker.trackingTouchIds;
      if (tracking.length>0) {  // if we have been tracking one or more touches
        let touches = touchEvent.changedTouches;
        for (let i=0; i<touches.length; i++) { // go through the changed touches to see if the one we are tracking is affected.
          let tidx = tracking.indexOf(touches[i].identifier);
          if (tidx>=0 && tracking[tidx]===tracker.trackPtId) {
            posX = touches[i].pageX-cLeft;  // convert into canvas offsets.
            posY = touches[i].pageY-cTop;
            cvX = posX*pxScl;
            cvY = posY*pxScl;
            relevantQ=true;
          }
        } // for (i) .. //
      }
    } else { // mouse move events
      let mouseEvent = event as MouseEvent;
      posX = mouseEvent.pageX-cLeft;  // convert into canvas offsets.
      posY = mouseEvent.pageY-cTop;
      cvX = posX*pxScl;
      cvY = posY*pxScl;
      relevantQ = tracker.LButtonDownQ;
    }

    // Let tracker check if the click-hold is broken.
    tracker.UpdateClickHold(cvX, cvY, CWA.ClickIdCounter);
    // if (CWA.ClickHoldClickId===CWA.ClickIdCounter) {
    //   if (Math.abs(cvX-CWA.ClickHoldStartX)>A.kClickHoldRadius ||
    //       Math.abs(cvY-CWA.ClickHoldStartY)>A.kClickHoldRadius) { // moved too much
    //     if (CWA.ClickHoldTimer!==-1) {
    //       window.clearTimeout(CWA.ClickHoldTimer);
    //       CWA.ClickHoldTimer=-1;
    //     }
    //     CWA.ClickHoldClickId=-1;
    //   }
    // }

    if (CWA.InModalState===A.MS_ButtonPanelDialog) {
      if (window.TouchEvent && event instanceof TouchEvent)
        ButtonPanel.OnTouchMove(event);
      else if (event instanceof MouseEvent)
        ButtonPanel.OnMouseMove(event);
    }
    else {
      CWA.HandleButtonListMove(event);
      if (relevantQ) {
        tracker.CallOnRelevantDrag(cvX, cvY, event);
        // if (CWA.AppOnDrag) CWA.AppOnDrag(cvX, cvY);
        // CWA.lastDragTime =event.timeStamp;
      } // if (relevantQ && CWA.draggingScoreQ) .. //
    }
  } // CWA.MainCanvasDrag() //

  private static MainCanvasMouseUp(tracker:CanvasTracker, event:Event) {
    //event.preventDefault();
    tracker.ClearClickHold();
    // CWA.ClickHoldClickId=-1;
    // if (CWA.ClickHoldTimer!==-1) {
    //   window.clearTimeout(CWA.ClickHoldTimer);
    //   CWA.ClickHoldTimer=-1;
    // }

    let relevantQ=false;
    let cvX=0;
    let cvY=0;
    if (event.type==="touchend" || event.type==="touchcancel") {
      let touchEvent = event as TouchEvent;
      let touches = touchEvent.changedTouches;
      let tracking = tracker.trackingTouchIds;
      for (var i=0; i<touches.length; i++)  // go through the changed touches to see if the one we are tracking is affected.
      {
        let tidx = tracking.indexOf(touches[i].identifier);
        if (tidx>=0) {
          if (tracking[tidx]===tracker.trackPtId) {
            tracker.trackPtId = -9999;
            relevantQ=true;
          }
          tracking.splice(tidx, 1);
        }
      } // for (i) .. //
    }
    else {
      let canvasPos = CWA.GetCanvasTopLeftPos(CWA.MainCanvas);
      let cTop = canvasPos.top;
      let cLeft= canvasPos.left;
      let mouseEvent = event as MouseEvent;
      cvX = (mouseEvent.pageX-cLeft)*CWA.CanvasResScale;  // convert into canvas pixel offsets.
      cvY = (mouseEvent.pageY-cTop)*CWA.CanvasResScale;   // ..  ..  ..
      // if (cvX<0 || cvX>=CWA.MainCanvasW ||
      //     cvY<0 || cvY>=CWA.MainCanvasH) {
      //   CWA.lastDragSpeed = 0;
      // }
      relevantQ = tracker.LButtonDownQ;
      // CWA.LButtonDownQ=false;
      tracker.ClearLButtonDown();
    }

    if (CWA.InModalState===A.MS_ButtonPanelDialog) {
      if (event instanceof MouseEvent)
        ButtonPanel.OnMouseUp(event);
      else if (window.TouchEvent && event instanceof TouchEvent)
        ButtonPanel.OnTouchEnd(event);
    }

    if (relevantQ) {
      if (!CWA.HandleButtonListMouseUp(event)) {
        tracker.CallOnMouseUp(event);
        // if (CWA.AppOnMouseUp) CWA.AppOnMouseUp();
      }
    } // if (relevantQ) .. //
  } // CWA.MainCanvasMouseUp() //

  public static keyDownHandler(event: KeyboardEvent) {
    if (event.repeat || !event.key) return false;
    //CWA.SetStatusText(`m:${App.InModalState} k:${event.key}`);
    // !!! IMPORTANT !!! Mobile browser's code is usually "" from on-screen keyboard.
    // and code is not even supported in Edge. Therefore always use 'key'
    // Either key or code would give the "Enter" and "Escape" strings for those keys.
    // Not true for other keys.
    let key = event.key.length===1 ? event.key.toUpperCase() : event.key;

    if (CWA.InModalState) {
      if (key==="Escape" || key==="Esc" || key==="Enter") { // Edge gives "Esc" instead of "Escape"
        // if (CWA.MenuBtnPanelActiveQ()) {
        //   CWA.ExitModalState(CWA.InModalState);
        // }
        // else
        if (!CWA.ModalEscAndEnterAction(key)) {
          // not handled. give BarEditor a chance to process it.
        } // if (!AppModalEscAndEnterAction
      } // Escape or Enter
    }
    else {
      if (key==='L' && event.shiftKey && event.ctrlKey) {
        CWA.MessageBox(CWA.GetCookie(A.kCK_DbgLog), true);
      }
    } // if (InModalState) .. else .. //
    return false;
  } // keyDownHandler() //



  private static FocusedButtonIdx:number=-1;
  private static HandleButtonListClick(event:Event) : boolean {
    CWA.ButtonList.Activate(CWA.ButtonListCanvas);
    if (window.TouchEvent && event instanceof TouchEvent)
      ButtonPanel.OnTouchDown(event);
    else if (event instanceof MouseEvent)
      ButtonPanel.OnMouseDown(event);
    CWA.ButtonList.Deactivate();
    return false;
  }
  private static HandleButtonListMove(event:Event) :boolean {
    CWA.ButtonList.Activate(CWA.ButtonListCanvas);
    if (window.TouchEvent && event instanceof TouchEvent)
      ButtonPanel.OnTouchMove(event);
    else if (event instanceof MouseEvent)
      ButtonPanel.OnMouseMove(event);
    CWA.ButtonList.Deactivate();
    return false;
  } // HandlePointerDrag() //

  private static HandleButtonListMouseUp(event:Event):boolean {
    CWA.ButtonList.Activate(CWA.ButtonListCanvas);
    if (event instanceof MouseEvent)
      ButtonPanel.OnMouseUp(event);
    else if (window.TouchEvent && event instanceof TouchEvent)
      ButtonPanel.OnTouchEnd(event);
    CWA.ButtonList.Deactivate();
    return false;
  }

  public static RedrawAllButtons() {
//#ifdef BOTTOMLESS
//    CWA.ButtonList.InvalidateLastRenderPanelBtnsSnapshot();
//#endif BOTTOMLESS
    CWA.ButtonList.RenderPanel(false);
  } // CWA.RedrawButton() //

  // Helper functions
  public static MkEle(tagName:string, id:string, cls:string, children:HTMLElement[]|string=null) {
    let ele = document.createElement(tagName);
    if (id) ele.id=id;
    if (cls) ele.className=cls;
    if (children) {
      if (typeof(children)==='object') {
        for (let i=0; i<children.length; i++)
          if (children[i]) ele.appendChild(children[i]);
      }
      else if (typeof(children)==='string')
        ele.innerHTML=children;
    }
    return ele;
  } //MkEle()

  private static DrawFavicon(xres:number, yres:number, rel:string=null) {
    let link = document.createElement("link");
    link.type = 'image/x-icon';
    link.rel = rel || "shortcut icon";
    link.href = CWA.CreateIconCanvas(xres, yres, A.kIcon_FavIcon).toDataURL("image/x-icon"); //canvas.toDataURL("image/x-icon");
    document.getElementsByTagName("head")[0].appendChild(link);
  } // DrawFavicon() //

  private static SplashTimer = -1;
  private static SplashFadeStep:number=0;
  private static SplashAutoCloseQ=false;
  private static SplashFader() {
    if (CWA.SplashFadeStep<50 && CWA.InModalState===A.MS_DisplayingText) {
      CWA.TextInfoArea.style.opacity = CWA.SplashFadeStep>20 ? "1.0" : (CWA.SplashFadeStep/20).toString();
      CWA.SplashFadeStep++;
    }
    else {
      if (CWA.InModalState===A.MS_DisplayingText && CWA.SplashAutoCloseQ)
        CWA.ExitModalState(A.MS_DisplayingText, A.MSX_None, /*allowOutOfOrderExit=*/true);
      window.clearInterval(CWA.SplashTimer);
      CWA.SplashTimer=-1;
      CWA.TextInfoArea.style.opacity = "1.0";
      if (!CWA.AutoChkVerDoneQ)
      {
        CWA.AutoChkVerDoneQ=true;
        CWA.ChkVerAndUpdate();
      }
    }
  } // CWA.SplashFader

  public static DisplaySplash(autocloseQ:boolean=false) {
    CWA.SplashAutoCloseQ=autocloseQ;
    CWA.SplashFadeStep=0;
    CWA.TextInfoArea.style.opacity = "0";
    CWA.EnterModalState(A.MS_DisplayingText);
    CWA.SplashTimer = window.setInterval(CWA.SplashFader, 50);
  } // DisplaySplash()

  static AppInfoString() : string
  {
    let pxval = CWA.CanvasResScale;
    return (navigator.onLine ? "W" : "o") +
      (CWA.IsMobileDevQ ? "M" : "D") +
      (CWA.ListenerHasPassiveQ ? "P" : "-") +
      (CWA.ServiceWorkerReadyQ ? "S" : "/") +
      "px="+((pxval%1)===0 ? pxval.toString() : pxval.toFixed(2))+" "+
      (CWA.IsiOSQ ? "iOS " : "") +
      (CWA.IsSafariQ ? "Safari " : "") +
      (window["chrome"] ? "Chrome " : "") +
      (CWA.WebAppModeQ ? "App Mode" : "")
  } // CWA.AppInfoString() //


  private static updateSigninDlgBtns(_e:Event=null)
  {
    const usrIdInp = CWA.SigninUserInput ?
      CWA.SigninUserInput.value.trim().toLowerCase() : '';
    const pwdInp = CWA.SigninPwdInput ?
      CWA.SigninPwdInput.value.trim() : '';

    if (CWA.SigninUserInput && CWA.SigninPwdInput) {
      if (CWA.SigninChgPwdBtn) {
        CWA.SigninChgPwdBtn.disabled =
          !usrIdInp || !pwdInp ||
          (CWA.UserId!==usrIdInp && !(CWA.UserValidatedQ && CWA.UserLevel>1));
          // CWA.PwdHash(pwdInp)===CWA.PassHash;
      }
      if (CWA.SigninAddUserBtn) {
        CWA.SigninAddUserBtn.disabled =
          !usrIdInp || !pwdInp ||
          CWA.UserId===usrIdInp ||
          !(CWA.UserValidatedQ && CWA.UserLevel>1); // only a signed in admin level user can add user.
      }
      if (CWA.SigninOKBtn) {
        CWA.SigninOKBtn.disabled =
          !usrIdInp || !pwdInp ||
          CWA.UserId===usrIdInp ||
          CWA.UserValidatedQ; // Do not allow direct user switch. Must sign out explicitly first.
        CWA.SigninOKBtn.hidden = CWA.UserValidatedQ;
      }
    }
  }

  private static _PostSignInCallback:()=>void=null;
  public static SigninDialog(signintitle:string=null, postSignInCallback:()=>void=null)
  {
    if (CWA.SigninDialogDiv) {
      const title = byId('signinDialogTitle');
      if (title) title.innerHTML = signintitle ? signintitle : "Math Club Portal Sign-in";

      if (CWA.SigninAddUserBtn) {
        CWA.SigninAddUserBtn.style.display = CWA.UserValidatedQ && CWA.UserLevel>1 ? "inline-block" : "none";
      }
      if (CWA.SigninUserInput) {
        CWA.SigninUserInput.disabled=CWA.UserValidatedQ && CWA.UserLevel===1;
      }
      const pwdLabel = byId("pwdInpLabel") as HTMLSpanElement;
      if (pwdLabel) {
        pwdLabel.innerHTML=CWA.UserValidatedQ ? "New Password" : "Password";
      }
      if (CWA.SigninChgPwdBtn) {
        CWA.SigninChgPwdBtn.style.display = CWA.UserValidatedQ ? "inline-block" : "none";
        CWA.updateSigninDlgBtns();
      }

      CWA._PostSignInCallback=postSignInCallback;
      CWA.EnterModalState(A.MS_SigningIn);
      // if (CWA.SigninAtStartChkbox) CWA.SigninAtStartChkbox.checked=CWA.ShowSigninDialogAtStart;
      CWA.SigninDialogDiv.style.width = "320px";
      if (CWA.SigninUserInput) {
        CWA.SigninUserInput.value= CWA.UserId ? CWA.UserId : '';
        if (!CWA.UserId) CWA.SigninUserInput.focus();
      }
      if (CWA.SigninPwdInput) {
        CWA.SigninPwdInput.value='';
        if (CWA.UserId) CWA.SigninPwdInput.focus();
      }
    }
  } // CWA.SigninDialog() //

  public static UserHash(usr:string) : string {
    return usr ? CWA.shuffleBits(CWA.hashCode(usr.trim().toLowerCase(), 30624700)).toString(36) : '';
    // return usr ? K.md5(usr.trim().toLowerCase()) : '';
  }

  public static PwdHash(pwd:string, doubleQ:boolean=true) : string {
    return pwd ? (doubleQ ? md5(md5(pwd.trim())) : md5(pwd.trim())) : "";
    // return pwd ? CWA.shuffleBits(CWA.hashCode(pwd.trim(), 2034243)) : 0;
  }

  public static SignOut() {
    CWA.UserId='';
    CWA.PassHash='';
    CWA.UserLevel=0;
    CWA.UserValidatedQ=false;
    CWA.PassHashTempQ=true;
    CWA.SetCookie(A.kCK_UserId, null);
    CWA.SetCookie(A.kCK_PassWd, null);
    UI.RescanPollListVotedStatus();
  }

  public static SignIn(op:number, usr:string, pwdhash:string, plainpwdhash:string, success:(t:number)=>void, failure:(e:string)=>void) {
    if (!usr || !pwdhash ||
        (op!==A.SI_Normal && op!==A.SI_NewUsr && op!==A.SI_ChgPwd))
    {
      CWA.log("<!SignIn:op="+op+(!usr?"!usr":"")+(!pwdhash?"!pwd":"")+"!>");
      return;
    }
    CWA.log("[si:"+op+"]");

    usr=usr.trim().toLowerCase();
    // let pwdhash=CWA.PwdHashCode(pwd.trim());
    let dict:{[key:string]:string} = null;
    let usr2='';
    let pwd2='';

    if ((op===A.SI_NewUsr || op===A.SI_ChgPwd) &&
      CWA.UserId && CWA.PassHash && CWA.UserValidatedQ &&
      (CWA.UserLevel>1 || CWA.UserId===usr))
    {
      dict={};
      dict["U2"]=CWA.UserHash(usr2=usr);
      dict["P2"]=(pwd2=pwdhash);
      if (plainpwdhash)
        dict["P1P"]=plainpwdhash;
      usr = CWA.UserId;
      pwdhash = CWA.PassHash;
    }


    CWA.AskAppServer(
      op===A.SI_Normal ? "AUTHUSR" : op===A.SI_NewUsr ? "NEWUSR" : "CHGPWD",
      usr, pwdhash, dict).
    then((level_data:string)=>{
      let chkCallsuccess=true;
      if (op===A.SI_Normal)
          // !CWA.UserValidatedQ || CWA.UserLevel<=1) //<- this is special case of just the A.SI_Normal case right?
      {
        CWA.UserValidatedQ=true;
        CWA.UserId=usr;
        CWA.PassHash=pwdhash;
        let fieldPos = level_data.indexOf(",");
        if (fieldPos>=0) CWA.UserLevel= +(level_data.substring(0,fieldPos));
        else CWA.UserLevel=1;
        CWA.SetCookie(A.kCK_UserId, usr);
        CWA.SetCookie(A.kCK_PassWd, pwdhash);
        CWA.PassHashTempQ = level_data.charAt(fieldPos+1)==='T';
        if (op===A.SI_Normal && CWA.PassHashTempQ) // meaning current password is temporary.
        {
          CWA.GenericQuery(A.kIcon_Reminder,
            "Password Change Reminder",
            "Please change your assigned temporary password ASAP for security reasons.<br> "+
            (CWA.UserLevel>1 ? "Certain admin functions are disabled until you've set your own password." : ""),
          ()=>{if (success) success(op);}, A.GQ_OK);
          chkCallsuccess=false;
        }
        UI.RescanPollListVotedStatus();
      }
      else if ((op===A.SI_NewUsr || op===A.SI_ChgPwd) &&
               CWA.UserValidatedQ && usr2===CWA.UserId &&
               pwd2!==CWA.PassHash)
      {
        // changing one's own password.
        CWA.PassHash=pwd2;
        let fieldPos = level_data.indexOf(",");
        if (fieldPos>=0) CWA.UserLevel= +(level_data.substring(0,fieldPos));
        else CWA.UserLevel=1;
        CWA.SetCookie(A.kCK_PassWd, CWA.PassHash);
        if (level_data.charAt(fieldPos+1)==='T') {
          CWA.AlertBox(A.kIcon_Warning, "Server logic error: password still temporary after change.");
        }
        CWA.PassHashTempQ=false;
      }
      CWA.UpdateUIState();
      if (chkCallsuccess && success) {
        success(op);
        // CWA.SetStatusText(usr+" signed in successfully", 3000);
      // CWA.ExitModalState(A.MS_SigningIn, A.MSX_None);
      }
    }).
    catch((err:string)=>{
      // CWA.ExitModalState(A.MS_SigningIn, A.MSX_None);
      if (failure) failure(err);
      // CWA.AlertBox(A.kIcon_BouncingBall, "Sign in Error "+err);
    });
  } // CWA.SignIn()

  private static OnSigninButtonClick(e:any)
  {
    let op = A.SI_Cancel; // default: cancel
    let postPwd2Callback:(pwd2:string)=>void=null;
    if (typeof(e)==="number") {
      op = e as number;
      if (op===A.SI_DefaultAction) {
        if (!CWA.SigninOKBtn.disabled) op=A.SI_Normal;
        else if (!CWA.SigninAddUserBtn.disabled) op=A.SI_NewUsr;  // add a new usr is less harmful.
        else if (!CWA.SigninChgPwdBtn.disabled) op=A.SI_ChgPwd;   // mistakenly changing another user's password would be bad.
        else op=A.SI_Cancel;
      }
    }
    else if (e!==null && typeof(e)==='object' && e instanceof Event) {
      let ele = e.target as HTMLElement;
      if (ele.id ==="signinOKBtn")      op=A.SI_Normal;     // normal sign in
      else if (ele.id==="siNewUserBtn") op=A.SI_NewUsr;     // add a new user
      else if (ele.id==="siChgPwdBtn")  op=A.SI_ChgPwd;     // change password of existing user (oneself or another)
      else if (ele.id==="pwd2OKBtn")    op=A.SI_Pwd2OK;     // retyped password done.
      else if (ele.id==="pwd2CancelBtn")op=A.SI_Pwd2Cancel; // retype password box cancel
      else                              op=A.SI_Cancel;     // signin dialog cancel
    }

    if (op===A.SI_Pwd2OK || op===A.SI_Pwd2Cancel) {
      postPwd2Callback = CWA._PostPwd2Callback;
      CWA._PostPwd2Callback=null;
    }

    CWA.log('[siBtn:'+op+']');
    try {
      if (op===A.SI_NewUsr || op===A.SI_ChgPwd) // these would require a reentry of the current signed-in password.
      {
        let usr = CWA.SigninUserInput.value.trim().toLowerCase();
        let pwd = CWA.SigninPwdInput.value.trim();
        if (!usr || !pwd) // treat it as cancel.
          op=A.SI_Cancel;
        else {
          let badinput="";
          if (usr.length<4) {  // too short
            badinput = usr==="" ? "Username cannot be empty."
                                : "Username must have 4 or more characters.";
          }
          if (pwd.length<8   // too short
    //       || pwd.match(/^([a-z0-9]+|[A-Z0-9]+|[a-zA-Z]+)$/)
            )
          { // too weak
            badinput = "Password must be 8 characters or longer.";
    //        + "with small+capital letters and digits and/or other characters.";
          }

          if (badinput!=="") {
            CWA.AlertBox(A.kIcon_Help, badinput);
          }
          else if (op===A.SI_ChgPwd && usr===CWA.UserId && CWA.PwdHash(pwd)===CWA.PassHash) {
            if (CWA.InModalState===A.MS_SigningIn)
              CWA.ExitModalState(CWA.InModalState, A.MSX_None);
            CWA.AlertBox(A.kIcon_Warning, "Password same as the current one. Nothing to change.");
          }
          else {
            //....................................................
            //  Bring up the Retype Password dialog
            //....................................................
            CWA._PostPwd2Callback=null;
            CWA.Pwd2Input.value='';
            if (usr!==CWA.UserId && CWA.UserLevel>1) {
              CWA.Pwd2Title && (CWA.Pwd2Title.innerHTML="Retype Your Admin Password");
              CWA.Pwd2Desc.innerHTML="Please retype your Admin password to proceed.";
              CWA.Pwd2InputDesc && (CWA.Pwd2InputDesc.innerHTML="Admin Password");
            }
            else {
              CWA.Pwd2Title && (CWA.Pwd2Title.innerHTML="Retype Your Current Password");
              CWA.Pwd2Desc.innerHTML="Please retype your old password to confirm the change.";
              CWA.Pwd2InputDesc && (CWA.Pwd2InputDesc.innerHTML="Current Password");
            }
            CWA.Pwd2Objective = op;
            CWA.EnterModalState(A.MS_EnteringOldPwd);
            if (CWA.Pwd2Input) CWA.Pwd2Input.focus();
          }
        }
      }
      else if (op===A.SI_Pwd2OK || op===A.SI_Normal) {
        let usr = CWA.SigninUserInput && CWA.SigninUserInput.value ? CWA.SigninUserInput.value.trim().toLowerCase() : '';
        let pwd = CWA.SigninPwdInput && CWA.SigninPwdInput.value ? CWA.SigninPwdInput.value.trim() : '';
        let pwd2 = op===A.SI_Pwd2OK && CWA.Pwd2Input && CWA.Pwd2Input.value ? CWA.Pwd2Input.value.trim() : '';
        if (op===A.SI_Normal && (!usr ||  !pwd))  // treat it as cancel.
          op=A.SI_Cancel;
        // else if (op===A.SI_Pwd2OK && (!CWA.UserId || !CWA.PassHash || !pwd2))
        //   op=A.SI_Cancel;
        else if (op===A.SI_Pwd2OK && CWA.PwdHash(pwd2)!==CWA.PassHash) { // retyped pwd does not match PassHash
          if (CWA.InModalState===A.MS_EnteringOldPwd)     // close only the 2nd password box?
            CWA.ExitModalState(CWA.InModalState, A.MSX_None);
          CWA.AlertBox(A.kIcon_Warning, CWA.UserLevel>1 ? "Admin password mismatch" : "Member password mismatch.");
        }
        else if (op===A.SI_Normal || op===A.SI_Pwd2OK)
        {
          if (op===A.SI_Pwd2OK && postPwd2Callback) {
            postPwd2Callback(pwd2);
          }
          else {
            const pwdhash = CWA.PwdHash(pwd);
            const pwd2hash = CWA.PwdHash(pwd2, false);

            CWA.SignIn((op===A.SI_Pwd2OK ? CWA.Pwd2Objective : op),
              usr, pwdhash, pwd2hash,
              (op:number)=>{
                  if (CWA.InModalState===A.MS_EnteringOldPwd)
                    CWA.ExitModalState(CWA.InModalState, A.MSX_None);
                  CWA.ExitModalState(A.MS_SigningIn, A.MSX_None);
                  if (CWA._PostSignInCallback===null && (op===A.SI_NewUsr || op===A.SI_ChgPwd)) {
                    CWA.AlertBox(A.kIcon_Info, usr+(
                      op===A.SI_NewUsr ? " account created.":
                      op===A.SI_ChgPwd ? " password changed." : "??op="+op));
                  }
                  else {
                    CWA.SetStatusText(usr+
                        (op===A.SI_Normal ? " signed in successfully"
                        :(op===A.SI_Pwd2OK ?
                            (CWA.Pwd2Objective===A.SI_NewUsr?" account created.":" password changed.")
                          :(op===A.SI_NewUsr ? " account created.":op===A.SI_ChgPwd ? " password changed." : "??op="+op)
                          )
                        ), 3000);
                    if (CWA._PostSignInCallback) CWA._PostSignInCallback();
                  }
                },
              (e:string)=>{
                if (CWA.InModalState===A.MS_EnteringOldPwd)
                  CWA.ExitModalState(CWA.InModalState, A.MSX_None);
                CWA.ExitModalState(A.MS_SigningIn, A.MSX_None);
                CWA.AlertBox(A.kIcon_Error, "Error: "+e);
                  if (CWA._PostSignInCallback) CWA._PostSignInCallback();
              }
            ); // CWA.Signin()
          } // if (..postPwd2Callback) .. else .. //
        }
      } // if (SI_ChgNew) .. else .. //
      else {
        CWA._PostSignInCallback=null;
        if (CWA.InModalState===A.MS_EnteringOldPwd)
          CWA.ExitModalState(CWA.InModalState, A.MSX_None);
        if (postPwd2Callback)
          postPwd2Callback('');
        else if (CWA.InModalState===A.MS_SigningIn) {
          CWA.ExitModalState(A.MS_SigningIn, A.MSX_None);
          CWA.SetStatusText(CWA.UserValidatedQ && CWA.UserId ?
            "Still signed in as '"+CWA.UserId+"'" : "Not signed in. Certain access restricted.",
            5000);
        }
      }
    }
    catch (e) {
      CWA.log("[!siBtn thrown "+e+"!]");
    }
  } // CWA.OnSigninButtonClick() //

  static Pwd2Dialog(callback:(pwd2:string)=>void) {
    CWA._PostPwd2Callback = callback ? (pwd2:string)=>{
      if (CWA.InModalState===A.MS_EnteringOldPwd) CWA.ExitModalState(A.MS_EnteringOldPwd, A.MSX_None);
      callback(pwd2);
    } : null;

    CWA.EnterModalState(A.MS_EnteringOldPwd);
    if (CWA.Pwd2Input) {
      CWA.Pwd2Input.focus();
      CWA.Pwd2Input.value="";
    }
  }

  // Not sure if these hash functions are any better
  // private static tinySimpleHash(s:string)
  // {
  //   let h=9;
  //   for(let i=0;i<s.length;)
  //     h=Math.imul(h^s.charCodeAt(i++),9**9);
  //   return h^h>>>9
  // } // CWA.tinySimpleHash()

  // private static cyrb53Hash(str:string, seed = 0)
  // {
  //   let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  //   for (let i = 0, ch; i < str.length; i++) {
  //       const ch = str.charCodeAt(i);
  //       h1 = Math.imul(h1 ^ ch, 2654435761);
  //       h2 = Math.imul(h2 ^ ch, 1597334677);
  //   }
  //   h1 = Math.imul(h1 ^ (h1>>>16), 2246822507) ^ Math.imul(h2 ^ (h2>>>13), 3266489909);
  //   h2 = Math.imul(h2 ^ (h2>>>16), 2246822507) ^ Math.imul(h1 ^ (h1>>>13), 3266489909);
  //   return 4294967296 * (2097151 & h2) + (h1>>>0);
  // } // CWA.cyrb53Hash()

  private static hashCode(s:string, hash:number=0) : number
  {
    if (s.length>0)
      for (let i=0; i<s.length; i++) {
        let code = s.charCodeAt(i);
        if (code>256)
          hash = (((hash<<5) - hash) + (code>>8))|0;
        hash = (((hash<<5) - hash) + (code&255))|0;
      } // for (i)
    return hash>>>0;
  } // CWA.hashCode() //

  private static shuffleBits(n:number) {
    const u16=[(n*0.5)&0x55555555, n&0x55555555]; // even bits, odd bits
    for (let p=1; p>=0; p--) {
      let packed16=0;
      let u = u16[p];
      for (let bit=1<<15; bit; bit>>=1) {
        if (u%2) packed16+=bit;
        u>>=2;
      } // for (i)
      u16[p] = packed16;
    } // for (p) //
    return u16[0]*(1<<16)+u16[1];
  } // CWA.shuffleBits() //

  public static AskAppServer( req:string, usr:string=null, pwdhash:string='',
                              dataDict:SRQData=null)
  {
    return new Promise((resolve:(result:string)=>void, reject:(err:string)=>void) =>
    {
      CWA.log('[Ask:'+req);
      if (navigator.onLine) {
        SRQ.AddRequest(new SRQ(req,usr,pwdhash,dataDict,resolve,reject));
      } // if (onLine)
    }) // return new Promise(()=>
  } //CWA.AskAppServer() //

  private static HttpReload() {
    try {
      CWA.log("[Force reload page]\n");
      let request = new XMLHttpRequest();
      // let svrPathname = location.href;
      request.open("POST", location.href, true);
      request.setRequestHeader("Pragma", "no-cache");
      request.setRequestHeader("Expires", "0");
      request.setRequestHeader("Cache-Control", "no-cache");
      request.responseType = "text";
      request.onreadystatechange = ()=>{
        if (request.readyState===4 && request.status===200) {
          location.reload();
        }
      };
      request.send();
    } catch (e) {}
  } // App.HttpReload() //

  private static ForceReloadPage() {
    // A heavy handed approach to reload the page, bypassing caches, using a POST request.
    // 2019 Nov 10: Added the App.SWRegistration.unregister() call to remove any
    //              previous service worker before
    try {
      if (CWA.SWRegistration) {
        CWA.SWRegistration.unregister()
        .then((_done:boolean)=>{
          CWA.log("[SW unregistered]\n");
          CWA.HttpReload();
        })
        .catch((reason:any)=>{
          CWA.log("[SW unregister() failed:"+(reason && typeof(reason)==='string' ? reason : '?')+"]\n");
          CWA.HttpReload();
        });
      }
      else
        CWA.HttpReload();
    } catch (e) {}
  } // CWA.ForceReloadPage()

  static AutoChkVerDoneQ=false;
  private static _ServerLatestBuild='';
  private static AskForReloadTimer=-1;

  private static DelayedAskForReloadApp()
  {
    if (CWA.InModalState)
    { // Do not ask for a reload if we are in a modal state or if we have entered edit mode.
      CWA.log('(!AskReload MS:'+CWA.InModalState+'!)');
      CWA.AskForReloadTimer = window.setTimeout(CWA.DelayedAskForReloadApp, 5000); // Wait another 5 secs.
    }
    else if (CWA._ServerLatestBuild>A.BuildDate)
    {
      CWA.AskForReloadTimer=-1;

      CWA.log('(AskReload)');

      let verinfo = (CWA._ServerLatestBuild>A.BuildDate) ? (CWA._ServerLatestBuild+" vs "+A.BuildDate)
                                                          : CWA._ServerLatestBuild;
      CWA.GenericQuery(A.kIcon_Help,
        "Software Update",
        "An updated MSS Math Club Portal ("+verinfo+") is available.<br>Update to the new version?" +
        (CWA.SW_UpdateAvailableQ===1 ? " (sw update)" : ""),
        (answer:number)=>{if (answer===A.AnsYes)
          if (CWA.SW_UpdateAvailableQ===1 /*&& !App.IsiOSQ*/) // on iOS even reload(true) could not refresh outdated version.
            location.reload(); // 2019 Apr 17: reload() doesn't seems to be able to force a reload of the app on iOS;
          else
            CWA.ForceReloadPage()
        },
        A.GQ_YesNo);
    }
    else
      CWA.log('(!AskReload svr:'+CWA._ServerLatestBuild+' curr:'+A.BuildDate+'!)');
  } // CWA.DelayedAskForReloadApp() //

  public static ChkVerAndUpdate() {
    if (!CWA.InModalState) {
      /*DBG*/if (window.location.href.match(/\/\/(localhost|192\.168\.[0-9.]+)\//) && A.BuildDate.match(/^0+-0+-0+-0+$/))
      /*DBG*/  return;
      CWA.log('(AskAppServer:CHKVER)');
      CWA.AskAppServer("CHKVER").
      then((latestBuild:string)=>{
          CWA.log('(SvrVer:'+latestBuild+')');
          CWA.SetStatusText("Server build:"+latestBuild+(latestBuild>A.BuildDate ? '(new)' : ''), 8000);
          CWA._ServerLatestBuild = latestBuild;

          if (latestBuild>A.BuildDate && CWA.AskForReloadTimer<0) //CWA.WaitForAChanceToAskForReloadStartTime<0)
          { // do not start another timer if one is already in place.
            // 2020 Feb modification:
            // Yes, A new version is available. However, we shall wait (up to 10 secs)
            // to allow the service worker to pick it up before we ask the
            // user to reload the page, so that hopefully we would not be
            // reloading the old cached page and then another 'sw update'
            // reload is asked.
            CWA.AskForReloadTimer = window.setTimeout(CWA.DelayedAskForReloadApp, 10000);
            CWA.log('(reloadQ timer:'+CWA.AskForReloadTimer+')');
          }
        }).
      catch((_err:string)=>{CWA.log('<ChkVerAndUpdate err:'+_err+'>');});
    } // if (!InModalState)
  } // CWA.ChkVerAndUpdate()

  private static ProgressBarShowState:number=0;
  public static ShowHideProgressSpinner(showhide:number) {
    if (showhide===A.Show) {
      //App._AddPErrMsg("+");
      CWA.ProgressBarShowState++;
      if (CWA.ProgressBarShowState===1)
        CWA.ShowHidePopupDiv(CWA.ProgressSpinnerDiv, A.Show);
    } else if (showhide===A.Hide) {
      CWA.ProgressBarShowState--;
      if (CWA.ProgressBarShowState===0)
        CWA.ShowHidePopupDiv(CWA.ProgressSpinnerDiv, A.Hide);
    }
  } // CWA.ShowHideProgressSpinner()

  /*===============================================================*\
     _____          __       _____       _ _
    / ___ \        / /\     |_   _|     (_) |
   | |   \ \  /\  / /  \      | |  _ __  _| |_
   | |    \ \/  \/ / /\ \     | | | '_ \| | __|
   | |____ \  /\  / ____ \ _ _| |_| | | | | |_
    \_____| \/  \/_/    \_(_)_____|_| |_|_|\__|

    CWA Module Initialization

  \*===============================================================*/
  // User supplied specialized callback functions
  // public  static AppOnClick: (canvX:number, canvY:number)=>void = null;
  // public  static AppOnClickHold: (canvX:number, canvY:number)=>void = null;
  // public  static AppOnDrag: (canvX:number, canvY:number)=>void = null;
  // public  static AppOnMouseUp: ()=>void = null;
  private static AppUpdateUIStateFcn: ()=>void = null;
  private static AppAdjCanvasFcn: (canvW:number, canvH:number)=>void = null;
  private static AppGetStatusTextFcn:()=>string = null;
  public  static AppRenderIconFcn:(iconcanv:HTMLCanvasElement, w:number, h:number, iconId:number)=>HTMLCanvasElement = null;
  private static AppRedrawCanvFcn: (redrawR:{l:number, t:number, w:number, h:number})=>void =null;
  public  static AppName:string="CWA App";

  static GetTracker(targetCanv: HTMLCanvasElement) : CanvasTracker
  {
    return CWA.CanvasTrackers.find((t)=>t.canv===targetCanv);
  }

  static Init(appName:string, fcnSet:AppFcnSet, displaySplashQ=true)
  {
    if (appName) CWA.AppName=appName;
    function ChkSetDef(s: string, def:string) : string {
      return (s && s!=='') ? s.trim() : def;  // Mobile Safari's CSS variables has spaces!
    } // local function ChkSetDef() for setting CSS variables

    CWA.AppUpdateUIStateFcn = fcnSet.UpdateUI;
    CWA.AppAdjCanvasFcn=fcnSet.AdjCanv;
    CWA.AppGetStatusTextFcn=fcnSet.GetStatusText;
    //CWA.AppRenderIconCanvFcn=fcnSet.RenderIconCanv;
    CWA.AppRedrawCanvFcn=fcnSet.RedrawCanv;

    CWA.InitAndTrimOldLog();

    //=================== Register our service worker =====================
    if ('serviceWorker' in navigator) { // && null===window.location.href.match(/^http:\/\/192\.168\.|^file:\/\//)) {
      new Promise(function(resolve, _reject) {
        // lazy way of disabling service workers while developing
        //if ('serviceWorker' in navigator && null===window.location.href.match(/^http:\/\/192\.168\.|^file:\/\//)) {
          // register service worker file
          navigator.serviceWorker.register(A.kSWScript, {scope: './'})
            .then(reg => {
              CWA.log("[SWreg]");
              CWA.SWRegistration = reg;
              reg.onupdatefound = ()=>{
                const installingWorker = reg.installing;
                installingWorker.onstatechange = ()=>{
                  CWA.log('[SW.st:'+installingWorker.state+']');
                  switch (installingWorker.state) {
                    //case 'installed':
                    case 'activated':
                      if (navigator.serviceWorker.controller) {
                        // new update available
                        resolve(true);
                      } else {
                        // no update available
                        resolve(false);
                      }
                      break;
                  }
                };
              };
            })
            .catch(err => {console.error("[SW ERROR]", err); CWA.log("[SEerr]");});
          navigator.serviceWorker.ready.then(()=>{CWA.ServiceWorkerReadyQ=true});
        //} // if ('serviceWorker' in
      })
      // CWA.SW_UpdateAvailable_Promise
      .then((availQ:boolean)=>{
        CWA.log(availQ ? '[SW upd avail]' : '[SW no upd]');
        CWA.SW_UpdateAvailableQ=availQ ? 1 : 0;
        if (availQ) {
          CWA.ChkVerAndUpdate();
          CWA.AutoChkVerDoneQ=true;
        }
      });
    } // if ('serviceWorker' in navigator)
    else CWA.log("no serviceWorker support.");


    if (CWA.IsiOSQ) {
      // tslint:disable-next-line:no-unsafe-any
      CWA.WebAppModeQ = window.navigator["standalone"];
    }
    else {
      let webapp=CWA.FindGETParam("webapp");
      CWA.WebAppModeQ = webapp!==null;
    }

    let mobileAndTabletcheck = function():boolean {
      var check = false;
      // tslint:disable-next-line:no-unsafe-any
      (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
      return check;
    };
    CWA.IsMobileDevQ = mobileAndTabletcheck();

    if (window.getComputedStyle) {
      const bodyStyles = window.getComputedStyle(document.body);
      if (bodyStyles) {
        CWA.log("body");
        if (!CWA.ColorBg1) CWA.ColorBg1=ChkSetDef(bodyStyles.getPropertyValue('--swatchBg1'), "lightgray");
        if (!CWA.ColorBg2) CWA.ColorBg2=ChkSetDef(bodyStyles.getPropertyValue('--swatchBg2'), "silver");
        if (!CWA.ColorBg3) CWA.ColorBg3=ChkSetDef(bodyStyles.getPropertyValue('--swatchBg3'), "#fff");
        if (!CWA.ColorUI1) CWA.ColorUI1=ChkSetDef(bodyStyles.getPropertyValue('--swatchUI1'), "#755e55");
        if (!CWA.ColorUI2) CWA.ColorUI2=ChkSetDef(bodyStyles.getPropertyValue('--swatchUI2'), "#fff");
        if (!CWA.ColorUI3) CWA.ColorUI3=ChkSetDef(bodyStyles.getPropertyValue('--swatchUI3'), "gray");
        CWA.log("Styles");
      }
    } // if (window.getComputedStyle)

    // Allocate and empty the CreatedIcons array.
    if (CWA.CreatedIcons.length===0) {
      CWA.CreatedIcons.length = A.kIcon_MAX;
      CWA.CreatedIcons.fill(null);
    }
    CWA.log("[Fav");
    CWA.DrawFavicon(32, 32, null);
    CWA.DrawFavicon(192,192, null); // for Android
    if (CWA.IsiOSQ) CWA.DrawFavicon(180,180,"apple-touch-icon");
    CWA.log("]");

    CWA.ButtonList = new ButtonPanel(1,1,1,1,null,null,null);

    CWA.UserId = CWA.GetCookie(A.kCK_UserId);
    CWA.PassHash = CWA.GetCookie(A.kCK_PassWd);

    //-----------------------------------------------------------------
    //  Create UITable, MainCanvas, ButtonListCanvas and StatusTextEle
    //-----------------------------------------------------------------
    // let statusTr:HTMLTableRowElement=null;
    CWA.UITable=CWA.MkEle('table', 'CWAUITable', 'CWAUITable', [
      CWA.MkEle('tr', 'CWAMainCanvasTr', null, [
        CWA.MainCanvasTD=CWA.MkEle('td', 'CWAMainCanvasTd', null, [
          CWA.MainCanvas=CWA.NewCanvas(0,0),
       // CWA.ButtonListCanvas=CWA.NewCanvas(0,0)
        ]) as HTMLTableCellElement]),
      CWA.MkEle('tr', 'CWAStatusTxtTr', null, [
        CWA.StatusTextEle = CWA.MkEle('td', 'CWAStatusTxt', 'CWAStatusTxt noselect', 'Ready')])as HTMLTableRowElement]) as HTMLTableElement;

    CWA.StatusTextEle.onclick = ()=>{
      // on mobile devices, treat a click on the status bar as an escape key press.
      if (/*CWA.IsMobileDevQ &&*/ CWA.InModalState)
        CWA.ModalEscAndEnterAction("Escape");
    }

    // CWA.ButtonListCanvas.style.position='absolute';
    // CWA.ButtonListCanvas.style.backgroundColor ='rgba(0,0,0,0)';

    CWA.MainCanvas.id='CWAMainCanvas';
    if (!CWA.MainCanvasTracker)
      CWA.MainCanvasTracker = new CanvasTracker('CWAMainCanvas', CWA.MainCanvas);
    CWA.CanvasTrackers.push(CWA.MainCanvasTracker);

    let canvastd = CWA.MainCanvasTD;
    if (canvastd && CWA.UITable && canvastd.parentNode.parentNode===CWA.UITable) {
      document.body.appendChild(CWA.UITable);

        // CWA.MainCanvas.style.position='absolute';
        // CWA.MainCanvas.style.left='0px';
        // CWA.MainCanvas.style.top='0px';
        // CWA.MainCanvasTD.width="100%";

      CWA.MainCanvas.style.backgroundColor = CWA.ColorBg1;
      //while (canvastd.lastChild) canvastd.removeChild(canvastd.lastChild);  // remove everything first.
      //canvastd.appendChild(CWA.MainCanvas);
      canvastd.addEventListener('mousedown',
        (e)=>{CWA.MainCanvasClick(CWA.MainCanvasTracker, e)},   false);
      // capturing mousemove events in document allows the tracking of movements beyond the page boundaries.
      document.addEventListener('mousemove',
        (e)=>{CWA.MainCanvasDrag(CWA.MainCanvasTracker, e)},    CWA.ListenerHasPassiveQ ? {passive: true} : false);
      // => putting the listener at canvastd would lose the up-click => canvastd.addEventListener('mouseup',     CWA.MainCanvasMouseUp, false);
      document.addEventListener('mouseup',
        (e)=>{CWA.MainCanvasMouseUp(CWA.MainCanvasTracker, e)}, CWA.ListenerHasPassiveQ ? {passive: true} : false);
      canvastd.addEventListener('touchstart',
        (e)=>{CWA.MainCanvasClick(CWA.MainCanvasTracker, e)},   CWA.ListenerHasPassiveQ ? {passive: true} : false);
      canvastd.addEventListener('touchmove',
        (e)=>{CWA.MainCanvasDrag(CWA.MainCanvasTracker,e)} ,    CWA.ListenerHasPassiveQ ? {passive: true} : false);
      canvastd.addEventListener('touchend',
        (e)=>{CWA.MainCanvasMouseUp(CWA.MainCanvasTracker, e)}, false);
      canvastd.addEventListener('touchcancel',
        (e)=>{CWA.MainCanvasMouseUp(CWA.MainCanvasTracker, e)}, false);
      CWA.MainCanvasTD = canvastd;
      CWA.MainCanvasCtx = CWA.MainCanvas.getContext("2d");
    }
    else {
      CWA.log('MainCanvas setup failed.');
    }

    //===================GenQuery dialog =====================================
    // don't accept keyboard dismiss at all.
    try {
      let gqDiv = CWA.MkEle('div', 'genericQueryDiv', 'genericQueryDiv noselect',[
        CWA.MkEle('table', null, 'alertBoxTable', [
          CWA.MkEle('tr', null, null, [
            CWA.MkEle('td', 'genericQueryTitleTd', null, 'Confirmation')]),
          CWA.MkEle('tr', null, null, [
            CWA.MkEle('td', null, null, [
              CWA.MkEle('div', 'genericQueryMsgDiv', 'genericQueryMsgDiv',
                `<div class="alertBoxIconDiv" id="genericQueryIconDiv"></div>
                 <span id="genericQueryMsgSpan"></span>`)])]),
          CWA.MkEle('tr', null,null, [
            CWA.MkEle('td', null, null, [
              CWA.MkEle('div', null, 'dialogDismissButtonsDiv',
                `<button type="button" class="dialogButton" id="genQueryCancelBtn">Cancel</button>
                 <button type="button" class="dialogButton" id="genQueryOKBtn">OK</button>
                 <button type="button" class="dialogButton" id="genQueryNoBtn">No</button>
                 <button type="button" class="dialogButton" id="genQueryYesBtn">Yes</button>`)])])])]);
      gqDiv.hidden=true;
      gqDiv.style.zIndex='3';
      document.body.appendChild(gqDiv);
      CWA.SetupModalUIDiv("genericQueryDiv", A.MS_GenericQuery,
        A.MSX_Cancel, A.MSX_Accept,
        ()=>CWA.OnGenQueryDismiss(A.AnsCancel),
        ()=>CWA.OnGenQueryDismiss(A.AnsOK)
      );
      CWA.GenQueryIconDiv = byId("genericQueryIconDiv") as HTMLDivElement;
      CWA.GenQueryMsgSpan = byId("genericQueryMsgSpan") as HTMLSpanElement;
      CWA.GenQueryTitle=byId("genericQueryTitleTd") as HTMLElement;
      CWA.GQ_OKBtn    = CWA.SetupButton("genQueryOKBtn",     ()=>{CWA.OnGenQueryDismiss(A.AnsOK);});
      CWA.GQ_YesBtn   = CWA.SetupButton("genQueryYesBtn",    ()=>{CWA.OnGenQueryDismiss(A.AnsYes);});
      CWA.GQ_NoBtn    = CWA.SetupButton("genQueryNoBtn",     ()=>{CWA.OnGenQueryDismiss(A.AnsNo);});
      CWA.GQ_CancelBtn= CWA.SetupButton("genQueryCancelBtn", ()=>{CWA.OnGenQueryDismiss(A.AnsCancel);});
    }
    catch (err) {CWA.log('['+err+': GenQ setup failed.]');}

    //====================AlertBox dialog ====================================
    try {
      let altbx=CWA.MkEle('div', 'alertBoxDiv', 'alertBoxDiv noselect', [
        CWA.MkEle('table', null, 'alertBoxTable', [
          CWA.MkEle('tr',null,null, [
            CWA.MkEle('td','alertTitleTd', null, CWA.AppName+" Message")]),
          CWA.MkEle('tr',null,null, [
            CWA.MkEle('td',null,null, [
              CWA.MkEle('div', 'alertBoxMsgDiv', 'alertBoxMsgDiv',
                `<div class="alertBoxIconDiv" id="alertBoxIconDiv"></div>
                 <span id="alertBoxMsgSpan"></span>`)])]),
          CWA.MkEle('tr',null,null, [
            CWA.MkEle('td',null,null, [
              CWA.MkEle('div', null, 'dialogDismissButtonsDiv', [
                CWA.MkEle('button', 'alertBoxOKBtn', 'dialogButton', 'OK')])])])])]);
      altbx.hidden=true;
      altbx.style.zIndex='4';
      document.body.appendChild(altbx);
      CWA.SetupModalUIDiv("alertBoxDiv", A.MS_AlertBox, A.MSX_Cancel, A.MSX_Cancel,
        ()=>{if (CWA.InModalState===A.MS_AlertBox) CWA.ExitModalState(CWA.InModalState, A.MSX_None);}
      );
      CWA.AlertBoxIconDiv = byId("alertBoxIconDiv") as HTMLDivElement;
      CWA.AlertBoxMsgSpan = byId("alertBoxMsgSpan") as HTMLSpanElement;
      CWA.AlertBoxMsgSpan.innerHTML = "";
      CWA.SetupButton("alertBoxOKBtn", ()=>{if (CWA.InModalState===A.MS_AlertBox) CWA.ExitModalState(CWA.InModalState, A.MSX_None);});
    }
    catch (err) {CWA.log('[AlertBox setup failed:'+err+']');}

    try {
      let msgbx=CWA.MkEle('div','TextInfo','textinfoarea',
        `<h1 class="splash" style="padding:0 20px 0 20px">
        ${CWA.AppName}<br>
        </h1>
        Copyright (c) 2022, 2023 Rufin Hsu<br>License to the MSS Math Club<br>
        `);
      msgbx.style.zIndex='2';
      document.body.appendChild(msgbx);
      msgbx.hidden=true;
      CWA.TextInfoArea = CWA.SetupModalUIDiv("TextInfo", A.MS_DisplayingText,
        A.MSX_None, A.MSX_None);
      CWA.TextInfoArea.style.touchAction = "pan-x pan-y";
      CWA.TextInfoArea.addEventListener("click", ()=>{
        CWA.ExitModalState(A.MS_DisplayingText, A.MSX_None);
        if (CWA.TextInfoCloseCallback)
          CWA.TextInfoCloseCallback();
      });
    }
    catch (err) {CWA.log('[MessageBox setup failed:'+err+']');}


    function __setupRevealBtn(pwdInp:HTMLInputElement, revealBtnId:string) {
      const revealBtn=byId(revealBtnId) as HTMLElement;
      if (pwdInp && revealBtn) {
        revealBtn.addEventListener("pointerdown", (e:PointerEvent)=>{
          pwdInp.type="text";     revealBtn.setPointerCapture(e.pointerId);
        }, false);
        revealBtn.addEventListener("pointerup", (e:PointerEvent)=>{
          pwdInp.type="password"; revealBtn.releasePointerCapture(e.pointerId);
        }, false);
        revealBtn.addEventListener("pointercancel", (e:PointerEvent)=>{
          pwdInp.type="password"; revealBtn.releasePointerCapture(e.pointerId);
        }, false);
      }
    } // helper function: __setupRevealBtn()

    //
    //  Set up using app supplied User Sign-in Dialog elements
    //  Must have ids:
    //   'signinDialog' <- dialog div
    //   'signinDialogTitle' <- title text container.
    //   'userNameInput', 'passwordInput', 'revealPwdBtn' (optional)
    //   'signinCancelBtn', 'signinRegBtn', 'signinOKBtn'
    //
    try {
      //============================== Sign In/Create User dialog ==========
      CWA.SigninDialogDiv = CWA.SetupModalUIDiv("signinDialog", A.MS_SigningIn,
        A.MSX_Cancel, A.MSX_Accept,
        ()=>{CWA.OnSigninButtonClick(A.SI_Cancel);}, ()=>{CWA.OnSigninButtonClick(A.SI_DefaultAction);});
      CWA.SigninUserInput = byId("userNameInput") as HTMLInputElement;
      CWA.SigninPwdInput  = byId("passwordInput") as HTMLInputElement;
      CWA.SetupButtonClassWithin(CWA.SigninDialogDiv, "dialogButton",
        CWA.OnSigninButtonClick);
      CWA.SigninAddUserBtn=byId("siNewUserBtn") as HTMLButtonElement;
      CWA.SigninChgPwdBtn=byId("siChgPwdBtn") as HTMLButtonElement;
      CWA.SigninOKBtn=byId("signinOKBtn") as HTMLButtonElement;
      __setupRevealBtn(CWA.SigninPwdInput, "revealPwdBtn");
      CWA.SigninUserInput.oninput=CWA.updateSigninDlgBtns;
      CWA.SigninPwdInput.oninput=CWA.updateSigninDlgBtns;

      CWA.Pwd2DialogDiv = CWA.SetupModalUIDiv("retypePwdDialog", A.MS_EnteringOldPwd,
        A.MSX_Cancel, A.MSX_Accept,
        ()=>{CWA.OnSigninButtonClick(A.SI_Pwd2Cancel);},
        ()=>{CWA.OnSigninButtonClick(A.SI_Pwd2OK);});
      CWA.Pwd2Desc=byId("pwd2Desc") as HTMLElement;
      CWA.SetupButtonClassWithin(CWA.Pwd2DialogDiv, "dialogButton",
        CWA.OnSigninButtonClick);
      CWA.Pwd2Input = byId("pwd2Input") as HTMLInputElement;
      CWA.Pwd2InputDesc = byId("pwd2InputDesc") as HTMLInputElement;
      CWA.Pwd2Title = byId("pwd2DlgTitle") as HTMLElement;
      __setupRevealBtn(CWA.Pwd2Input, "revealPwd2Btn");
    }
    catch (err) {CWA.log('[SigninDialog setup failed:'+err+']');}


    let bpdiv = CWA.MkEle('div', 'buttonPanelDiv', 'buttonPanelDiv', null);
    bpdiv.hidden=true;
    document.body.appendChild(bpdiv);

    ButtonPanel.PanelDiv =
      CWA.SetupModalUIDiv("buttonPanelDiv", A.MS_ButtonPanelDialog,
                          A.MSX_Cancel, A.MSX_Accept,
                          ()=>{ButtonPanel.DismissButtonPanel(A.GQ_Cancel)},
                          ()=>{ButtonPanel.DismissButtonPanel(A.GQ_OK)});
    if (null!==ButtonPanel.PanelDiv)
    {
      ButtonPanel.SetupPanelDiv(ButtonPanel.PanelDiv);
    }

    let setdiv= CWA.MkEle('div', 'settingsDiv', 'noselect', [
      CWA.SettingsCanvas=CWA.NewCanvas(0,0),
    ]) as HTMLDivElement;
    setdiv.style.position='fixed';
    setdiv.style.backgroundPosition='center';
    setdiv.style.backgroundRepeat='repeat';
    setdiv.style.overflow='hidden';
    setdiv.style.zIndex='2';
    setdiv.hidden=true;
    document.body.appendChild(setdiv);
    CWA.SettingsDiv=setdiv;

    const spinnerDiv=CWA.ProgressSpinnerDiv=
    CWA.MkEle('div', 'progressSpinner', 'spinner', null) as HTMLDivElement;
    spinnerDiv.hidden=true;
    document.body.appendChild(spinnerDiv);

    CWA.SetupModalUIDiv('progressSpinner', A.MS_ServerRequest, A.MSX_DontExit, A.MSX_DontExit);

    window.addEventListener("keydown",CWA.keyDownHandler, false);
    window.addEventListener("resize", CWA.onResize, false);
    window.addEventListener("orientationchange", CWA.onResize, false);
    // ScreenOrientation.onchange = ()=>{
    //   CWA.SetStatusText("body focusing", 1000);
    //   CWA.AdjCanvas();};

    CWA.AdjCanvas();

    if (displaySplashQ) {
      CWA.DisplaySplash();
    }

    CWA.MJ = window["MathJax"];
    CWA.MJ && CWA.MJ["Hub"]["Config"]({
      "styles": {
        "#MathJax_Message": {
          "display":"none"
        }
      }
    });

    CWA.AskAppServer('PHPVER').then((ver:string)=>CWA.log(ver)).catch((err:string)=>CWA.log(err));
  } // CWA.Init()

} // class CWA

interface AppFcnSet {
  AdjCanv: (newCanvW:number, newCanvH:number)=>void,
  UpdateUI: ()=>void,
  GetStatusText: ()=>string,
  RedrawCanv: (redrawR:{l:number, t:number, w:number, h:number})=>void,
  // RenderIconCanv: (icnCanv:HTMLCanvasElement, xsz:number, ysz:number, iconId:number)=>HTMLCanvasElement,
} // interface AppFcnSet

interface CPos {x:number, y:number}

/*==================================================================*\
   ____ ____ ____ ____ ____ ____ ____ ____ ____ ____ ____
  ||B |||u |||t |||t |||o |||n |||P |||a |||n |||e |||l ||
  ||__|||__|||__|||__|||__|||__|||__|||__|||__|||__|||__||
  |/__\|/__\|/__\|/__\|/__\|/__\|/__\|/__\|/__\|/__\|/__\|

  Generic Button Panel class
\*==================================================================*/
interface PanelButtonInfo {
  type:number;
  label:string;
  state:number;       // low byte: 0 or 1, >>8 => radio button group choice.
  val:number;
  showstate:number;   // 0..1 for animation.
} // interface PanelButtonInfo

class ButtonPanel {
  NRows:number;
  NCols:number;
  BtnWidth:number;
  BtnHeight:number;
  Btns:PanelButtonInfo[];     // There could be null elements. Must check.
  private mData:{key:string, val:number}[]; // any additional data about this ButtonPanel
  private mDivPadding:number;
  protected mBgColor:string;
  protected mHoveringOn:number; // index into Btns
  protected mSetupFcn:(panel:ButtonPanel)=>void;
  protected mOnChange:(
    panel:ButtonPanel,
    chgType:number,                      // chgType: PBC_Cancelled, PBC_OKDone or PBC_StateChange
    triggerBtnIdx:number,
    pos:{x:number, y:number})=>void;
  private mToggleBtnPath: SPath;         // i.e. check box
  private mRadioBtnPath: SPath;
  private mRadioSlotPathArray: number[]; // the slot length has to be dynamically changed.
  private mPushBtnPath: SPath;
  private mDismissBtnPath: SPath;
  protected  mMorphingQ: boolean;
  protected  mTrackingTouchId:number; // we shall only track one touch-drag.
  protected  mTrackingTouchDragQ:boolean;  // separate this from mouseDownQ
  protected  mTrackingButton:number;       // idx of a push btn or a radio1st
  protected  mTrackingButtonClickStartPos:CPos;
  protected  mDragAction:number;
  protected  mMouseDownQ:boolean;

//#ifdef BOTTOMLESS
  private  mBottomlessQ:boolean;
//#endif BOTTOMLESS
  private _PanelCanvSave:HTMLCanvasElement;
  private _PanelDivSave:HTMLDivElement;
  private _ShowingPanelSave:ButtonPanel;

  // class-wide common objects and data
  public static PanelCanvas: HTMLCanvasElement = null;
  public static PanelDiv: HTMLDivElement = null;
  public static ShowingButtonPanel:ButtonPanel = null;

  public static SetupPanelDiv(div: HTMLDivElement) {  // one time setup for the entire app.
    ButtonPanel.PanelDiv = div;
    let canv = CWA.NewCanvas(); //document.createElement("canvas");
    div.appendChild(canv);
    canv.addEventListener("mousedown",  ButtonPanel.OnMouseDown, false);
    canv.addEventListener("touchstart", ButtonPanel.OnTouchDown, false);
    canv.addEventListener("touchmove", ButtonPanel.OnTouchMove, false);
    canv.addEventListener("touchend", ButtonPanel.OnTouchEnd, false);
    canv.addEventListener("touchcancel", ButtonPanel.OnTouchEnd, false);
    ButtonPanel.PanelCanvas = canv;
  } // ButtonPanel.SetupPanelDiv() //

  public static ParseBtnsDesc(desc:string, appendTo:PanelButtonInfo[]=null) : PanelButtonInfo[]{
    if (desc===null) return null;
    let btns:PanelButtonInfo[] = appendTo;

    let parts = desc.split(/\n/);
    if (parts.length) {
      let addto=0;
      if (appendTo===null)
        btns=new Array(parts.length);
      else {
        addto=btns.length;
        btns.length+=parts.length;
      }

      for (let i=0; i<parts.length; i++) {
        let btninf = parts[i].match(/([TPOCRrN])(.+)_([-0-9]+)(,?[0-9]?)/);
        if (btninf && btninf.length===5) {
          let label = btninf[2];
          let type:number;
          switch (btninf[1]) {
          case 'T': type=A.PB_ToggleButton; break;
          case 'P': type=A.PB_PushButton; break;
          case 'R': type=A.PB_RadioButton1st; break;
          case 'r': type=A.PB_RadioButton; break;
          case 'N': type=A.PB_NoButton; break; // I.e. just a static label.
          // Two types of dismiss buttons...
          case 'O': type=A.PB_OKButton; break;
          case 'C': type=A.PB_CancelButton; break;
          }
          let state = btninf[4].charAt(0)===',' ? +btninf[4].substr(1) : 0;
          btns[addto+i]={type:type, label:label, val:+btninf[3], state:state, showstate:state};
        }
        else
          btns[addto+i]=null;
      } // for (i)
    } // if (parts.length)
    return btns;
  } // ButtonPanel.ParseBtnsDesc() //

  constructor(row:number, col:number, btnw:number, btnh:number, btnsDesc:string, //btns:PanelButtonInfo[],
              setupfcn:(panel:ButtonPanel)=>void,
              onchange:(panel:ButtonPanel, chgType:number, trigBtnIdx:number,
                        pos:{x:number, y:number})=>void)
  {
    this.NRows = row;
    this.NCols = col;
    this.BtnWidth = btnw;
    this.BtnHeight = btnh;
    this.Btns = btnsDesc && btnsDesc.length>0 ? ButtonPanel.ParseBtnsDesc(btnsDesc) : [];
    this.mDivPadding = 2;
    this.mHoveringOn = -1;
    this.mBgColor = "#bbb";
    this.mSetupFcn = setupfcn;
    this.mOnChange = onchange;
    this.mData=null;
    this.mMorphingQ=false;
    this.mTrackingTouchId = -9999; // we shall only track one touch-drag.
    this.mTrackingTouchDragQ = false;  // separate this from mouseDownQ
    this.mTrackingButton=-1;       // idx of a push btn or a radio1st
    this.mTrackingButtonClickStartPos=null;
    this.mDragAction=A.PBA_NoAction;
    this.mMouseDownQ=false;
//#ifdef BOTTOMLESS
    this.mBottomlessQ=false;
//#endif BOTTOMLESS

    if (btnw>1 && btnh>1) {
      // the button shape paths are defined centered at the origin.
      let w2 = btnw/2-3;
      let h2 = btnh/2-3;
      let s2 = Math.min(w2,h2); // half of the shorter side
      let r  = s2;
      this.mToggleBtnPath = new SPath(
        this.mRadioSlotPathArray =
        [ 0,-w2,   h2-r, 0xa2,-w2, h2,-w2+r, h2,  r,
          1, w2-r, h2,   0xa2, w2, h2, w2,   h2-r,r,
          1, w2,  -h2+r, 0xa2, w2,-h2, w2-r,-h2,  r,
          1,-w2+r,-h2,   0xa2,-w2,-h2,-w2,  -h2+r,r, 0xe
        ]);
      r = s2*0.25;
      this.mPushBtnPath = new SPath(
        [ 0,-w2,   h2-r, 0xa2,-w2, h2,-w2+r, h2,  r,
          1, w2-r, h2,   0xa2, w2, h2, w2,   h2-r,r,
          1, w2,  -h2+r, 0xa2, w2,-h2, w2-r,-h2,  r,
          1,-w2+r,-h2,   0xa2,-w2,-h2,-w2,  -h2+r,r, 0xe
        ]);
      w2 = btnw/2-6;
      h2 = btnh/2-6;
      r = s2 = Math.min(w2,h2);
      this.mRadioBtnPath = new SPath( // a smaller bead
        [ 0,-w2,   h2-r, 0xa2,-w2, h2,-w2+r, h2,  r,
          1, w2-r, h2,   0xa2, w2, h2, w2,   h2-r,r,
          1, w2,  -h2+r, 0xa2, w2,-h2, w2-r,-h2,  r,
          1,-w2+r,-h2,   0xa2,-w2,-h2,-w2,  -h2+r,r, 0xe
        ]);
      // w2 = w/2-1; h2 = h/2-1;
      // s2 = Math.min(w2,h2); r = s2/3;
      // this.mHoverPath = new SPath(
      //   [ 0,-w2,h2-r, 0x71,h2, 0x72,-w2+r,   // bl
      //     0, w2,h2-r, 0x71,h2, 0x72, w2-r,   // br
      //     0, w2-r,-h2, 0x72, w2, 0x71,-h2+r, // tr
      //     0,-w2+r,-h2, 0x72,-w2, 0x71,-h2+r  // tl
      //   ]);
    }
    else {
//#ifdef BOTTOMLESS
      this.mBottomlessQ=true;
//#endif BOTTOMLESS
      this.mPushBtnPath = null;
      this.mRadioBtnPath = null;
      this.mRadioSlotPathArray = null;
      this.mToggleBtnPath = null;
    }
    this._PanelCanvSave   =null;
    this._PanelDivSave    =null;
    this._ShowingPanelSave=null;
  } // ButtonPanel::constructor() //

//#ifdef BOTTOMLESS
  get BottomlessQ():boolean {return this.mBottomlessQ;}
  get CanvasWidth():number  {return this.mBottomlessQ ? CWA.MainCanvasW : this.NCols*this.BtnWidth;}
  get CanvasHeight():number {return this.mBottomlessQ ? CWA.MainCanvasH : this.NRows*this.BtnHeight;}
//#else
//#   get CanvasWidth():number  {return this.NCols*this.BtnWidth;}
//#   get CanvasHeight():number {return this.NRows*this.BtnHeight;}
//#endif BOTTOMLESS
  get DivWidth() :number {return this.CanvasWidth/*+this.mDivPadding*2*/;}
  get DivHeight():number {return this.CanvasHeight/*+this.mDivPadding*2*/;}

  public GetPanelCanvas() :HTMLCanvasElement {
//#ifdef BOTTOMLESS
    return this.mBottomlessQ ? CWA.MainCanvas :  ButtonPanel.PanelCanvas;
//#else
//#     return ButtonPanel.PanelCanvas;
//#endif BOTTOMLESS
  }

  // Specialize InOperationalModalStateQ() to prevent the buttons from functioning in a modal state.
  protected InOperationalModalStateQ() :boolean{
//#ifdef BOTTOMLESS
    return CWA.InModalState=== (this.mBottomlessQ ? 0 : A.MS_ButtonPanelDialog);
//#else
//#     return CWA.InModalState=== A.MS_ButtonPanelDialog;
//#endif BOTTOMLESS
  } // InOperationalModalStateQ() //

//#ifdef BOTTOMLESS
  // public InvalidateLastRenderPanelBtnsSnapshot() {
    // this.mLastRenderPanelBtnsSnapshot=null;
  // }
//#endif BOTTOMLESS
  public Activate(_canv:HTMLCanvasElement) {
    if (this._PanelCanvSave===null) {
      this._PanelCanvSave = ButtonPanel.PanelCanvas;
      ButtonPanel.PanelCanvas = _canv;
      this._PanelDivSave  = ButtonPanel.PanelDiv;
      ButtonPanel.PanelDiv = null;
      this._ShowingPanelSave = ButtonPanel.ShowingButtonPanel;
      ButtonPanel.ShowingButtonPanel=this;
    }
  } // BottomlessButtonPanel::Activate()

  public Deactivate() {
    if (ButtonPanel.ShowingButtonPanel===this) {
      ButtonPanel.ShowingButtonPanel=this._ShowingPanelSave;
      this._ShowingPanelSave=null;
      ButtonPanel.PanelDiv = this._PanelDivSave;
      this._PanelDivSave = null;
      ButtonPanel.PanelCanvas=this._PanelCanvSave;
      this._PanelCanvSave = null;
    }
  } // BottomlessButtonPanel::Deactivate()


  public SetButtons(desc:string, appendQ:boolean=false) { // completely recreates the Btns array from desc string.
    this.Btns = ButtonPanel.ParseBtnsDesc(desc, appendQ ? this.Btns : null);
  } // ButtonPanel::SetButtons() //

  public BtnType(idx:number, preciseTypeQ:boolean=false):number {
    if (idx>=0 && idx<this.Btns.length) {
      let b = this.Btns[idx];
      if (b) return preciseTypeQ ? b.type : b.type&A.PB_ButtonTypeMask;
    }
    return A.PB_NoButton;
  } // BtnType()

  public SetBgColor(c:string) {this.mBgColor=c;}
  protected SetHover(idx:number) { // no further validation of idx needed. Caller's responsibility.
    if (idx!==this.mHoveringOn) {
        this.mHoveringOn = (idx>=0 && idx<this.Btns.length && this.Btns[idx].type!==A.PB_NoButton) ? idx : -1;
      return true;
    }
    else
      return false;
  } // ButtonPanel::SetHover() //

  public SetData(key:string, val:number) : ButtonPanel {
    if (this.mData===null) this.mData=[];
    let i;
    for (i=0; i<this.mData.length && this.mData[i].key!==key; i++) {}
    if (i===this.mData.length)
      this.mData.push({key:key, val:val});
    else
      this.mData[i].val=val;
    return this;
  } // ButtonPanel::SetData()

  public Data(key:string):number {
    return this.mData.find(entry=>entry.key===key).val;
  } // ButtonPanel::Data()

  private Setup() {
    if (this.mSetupFcn) this.mSetupFcn(this);
    this.mMorphingQ=false;
    // go through the radio button groups to make sure
    // that the states and showstate fields are consistent.
    let nbtns = this.Btns.length;
    for (let i=0; i<nbtns; i++) {
      if (this.Btns[i]) {
        if (this.BtnType(i,true)===A.PB_RadioButton1st) {
          let radgrp = this.RadioGroupOf(i);
          let selidx = -1;
          let grpend = radgrp.start+radgrp.size;
          for (let j=radgrp.start; j<grpend; j++) {
            if (selidx<0 && (this.Btns[j].state&0xff)!==0) {
              this.Btns[j].state = 1;
              selidx=j;
            }
            else
              this.Btns[j].state=0;
          } // for (j)
          if (selidx<0) // none of them is selected? select the 1st one.
          {
            this.Btns[i].state=1;
            selidx=i;
          }
          this.Btns[i].showstate = selidx-i;
          this.Btns[i].state |= ((selidx-i)<<8);
          // this.Btns[i].showstate = selidx;
          // this.Btns[i].state |= (selidx<<8);
        } // PB_RadioButton1st //
        else {
          this.Btns[i].showstate = this.Btns[i].state;
        }
      } // if (this.Btns[i])
    } // for (i)
  } // ButtonPanel::Setup() //

  //------------------------------------------
  // ButtonPanel::RenderPanel()
  //------------------------------------------
  public RenderPanel(fromTimerQ:boolean=false) {
    let canv=ButtonPanel.PanelCanvas;
    if (canv===null) return;
    // ButtonPanel canvas is auto-scaled. All dimensions are in css px.
    let w = canv.__xSize; //canv.width;
    let h = canv.__ySize; //canv.height;
    let ctx = canv.getContext("2d");
    ctx.fillStyle = this.mBgColor;
    ctx.fillRect(0,0,w,h);
    ctx.font = "12px sans-serif";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    // let grad = ctx.createRadialGradient(0,0,0.5, 0,0, 1);
    // grad.addColorStop(0, "rgba(255,240,0, 0)");
    // grad.addColorStop(0.5, "rgba(255,240,0, 0.3)");
    // grad.addColorStop(1, "rgba(255,255,0, 0)");

    let stillMorphingQ=false;
    let nBtns = this.Btns.length;
    for (let r=0; r<this.NRows; r++) {
      for (let c=0; c<this.NCols; c++) {
        let btnidx=r*this.NCols + c;
        if (btnidx<nBtns) {
          let btninf = this.Btns[btnidx];
          if (btninf===null) continue;

          let t=r*this.BtnHeight;
          let l=c*this.BtnWidth;
          let cx = l+this.BtnWidth/2;
          let cy = t+this.BtnHeight/2;
          let hoverQ = this.mHoveringOn===btnidx;
          if (hoverQ) {
            ctx.save();
            ctx.font = "bold 12px sans-serif";
          } // if (hoverQ)

          let btnclass = btninf.type&A.PB_ButtonTypeMask;
          switch (btnclass) {
          case A.PB_RadioButton:
            if (btninf.type===A.PB_RadioButton1st) {
              // rendering of the entire radio buttons group happens at the 1st button.
              let radgrp = this.RadioGroupOf(btnidx);
              // Draw the slot for the entire group.
              let slotwidthadd = (radgrp.size-1)*this.BtnWidth;
              let slotarray = this.mRadioSlotPathArray.map(function(v:number, idx:number):number
                {return v>0 && ((idx%9)===1 || (idx%9)===4 || (idx%9)===6) ? v+slotwidthadd : v;});
              let h2 = this.BtnHeight/2-4;
              let slotgrad = ctx.createLinearGradient(cx,cy-h2,cx,cy+h2);
              slotgrad.addColorStop(0,  "rgba(0,0,0,0.2)");
              slotgrad.addColorStop(0.3,"rgba(0,0,0,0.13)");
              slotgrad.addColorStop(1,  "rgba(0,0,0,0.1)");
              ctx.fillStyle=slotgrad;
              new SPath(slotarray).SetPathTranslate(cx,cy).RenderPath(ctx,["f"]);

              // Draw the glossy aqua button at the showstate position.
              let pos = Math.min(Math.max(0,btninf.showstate), radgrp.size-1);
              let bx = cx+pos*this.BtnWidth;
              h2-=2;
              let btngrad = ctx.createLinearGradient(bx,cy-h2,bx,cy+h2);
              btngrad.addColorStop(0.0, "#e8c100");
              btngrad.addColorStop(0.6, "#fcbd37");
              btngrad.addColorStop(1.0, "#fff4bf");
              ctx.fillStyle=btngrad;
              this.mRadioBtnPath.SetPathTranslate(bx, cy).RenderPath(ctx, ["f","s2#b29400"]); //, "frgba(255,255,255,0.9)"]);

              // Finally the hi-lite for the glossy bead.
              btngrad = ctx.createLinearGradient(bx,cy-h2+3,bx,cy);
              btngrad.addColorStop(0.0, "#fff");
              btngrad.addColorStop(0.2, "rgba(255,255,255,0.75)");
              btngrad.addColorStop(1.0,  "rgba(255,255,255,0.1)");
              ctx.fillStyle=btngrad;
              this.mRadioBtnPath.SetPathTrans([0.8,0,0,0.4,bx,cy-h2/2]).RenderPath(ctx,["f"]);
            } // if (type===PB_RadioButton1st
            break;
          case A.PB_PushButton:
            if (btninf.type!==A.PB_PushButton) {
              ctx.fillStyle = "rgba(255,255,"+255*btninf.showstate+",0.65)"; //btninf.state===1 ? "#f00" : "#0f0";
              this.mPushBtnPath.SetPathTrans([1,0,0,1,cx,cy]);
              this.mPushBtnPath.RenderPath(ctx, ["f"]);
              if (hoverQ)
                this.mPushBtnPath.RenderPath(ctx, ["s3#fff"]);
            }
            else { // use the toggle path for normal push buttons
              ctx.fillStyle = "rgba(255,255,255,"+(0.65+btninf.showstate*0.35).toFixed(2)+")";
              this.mToggleBtnPath.SetPathTrans([1,0,0,1,cx,cy]);
              this.mToggleBtnPath.RenderPath(ctx, ["f"]);
              if (hoverQ)
                this.mToggleBtnPath.RenderPath(ctx, ["s3#fff"]);
            }
            break;

          case A.PB_ToggleButton:
            ctx.fillStyle = "rgba(255,255,255,0.65)";
            this.mToggleBtnPath.SetPathTrans([1,0,0,btninf.showstate,cx,cy]);
            this.mToggleBtnPath.RenderPath(ctx, ["f"]);

            // ctx.fillStyle = "#000";
            if (hoverQ) {
              ctx.lineCap="round";
              this.mToggleBtnPath.SetPathTranslate(cx,cy);
              this.mToggleBtnPath.RenderPath(ctx,["d0.1 8","s4#fff"]);
            }
            break;
          } // switch (btninf)

          ctx.fillStyle="#000";
          ctx.fillText(btninf.label, cx, cy);

          if (hoverQ) ctx.restore();

          let btnstate = btninf.state;
          if ((btninf.type&A.PB_ButtonTypeMask)===A.PB_RadioButton) {
            btnstate =  (btninf.type===A.PB_RadioButton1st) ? (btninf.state>>8) : 0;
          }
          if (btninf.showstate!==btnstate) {
            if (btninf.showstate<btnstate) {
              btninf.showstate = Math.min(btnstate, btninf.showstate+0.1);
            } else {
              btninf.showstate = Math.max(btnstate, btninf.showstate-0.1);
            }
            stillMorphingQ=true;
          }
        } // if (btnidx<nBtns)
      } // for (c)
    } // for (r)
    if (stillMorphingQ) {
      if (fromTimerQ || !this.mMorphingQ) {
        this.mMorphingQ=true;
        requestAnimationFrame(()=>{this.RenderPanel(true);});
      }
    }
    else if (fromTimerQ)
      this.mMorphingQ=false;
  } // ButtonPanel::RenderPanel() //

  public ShowPanelDialog(left:number, top:number, pointerY:number=-1) {
//#ifdef BOTTOMLESS
    if (this.mBottomlessQ) {
      throw 'BottomlessButtonPanel::ShowPanelDialog() should not be called.';
    }
//#endif BOTTOMLESS
    this.Setup();
    // left, top are in device pixels NOT px.
    let canv = ButtonPanel.PanelCanvas;
    // note that the PanelCanvas is auto-scaled. i.e. all dimensions within the canvas are in css px.
    CWA.SetCanvasSize(canv, this.CanvasWidth, this.CanvasHeight, /*autoScaleQ-->*/true);
    ButtonPanel.ShowingButtonPanel = this;
    this.mTrackingTouchId = -9999;
    this.mTrackingTouchDragQ = false;
    this.mTrackingButton = -1;
    this.mDragAction=A.PBA_NoAction;
    this.mMouseDownQ=false;
    this.mHoveringOn = -1;
    let div = ButtonPanel.PanelDiv;
    div.className = "buttonPanelDiv" + (pointerY>=0 ? " leftPointer" :"");
    div.style.width = this.DivWidth+"px";
    div.style.height = this.DivHeight+"px";
    if (pointerY>=0)
      div.style.setProperty("--panelPointerY", Math.round(pointerY/CWA.CanvasResScale).toString()+"px");
    this.RenderPanel();
    if (CWA.InModalState!==A.MS_ButtonPanelDialog)
      CWA.EnterModalState(A.MS_ButtonPanelDialog);
    CWA.SetPopupDivPos(div, Math.round(left/CWA.CanvasResScale), Math.round(top/CWA.CanvasResScale));
  } // ButtonPanel::ShowPanelDialog()

  public CreatePanelIllustration(figure: HTMLCanvasElement, btndesc:string=null) {
    let canv = ButtonPanel.PanelCanvas;
    // note that the PanelCanvas is auto-scaled. i.e. all dimensions within the canvas are in css px.
    CWA.SetCanvasSize(canv, this.CanvasWidth, this.CanvasHeight, /*autoScaleQ-->*/true);
    let setupFcnSave = this.mSetupFcn;
    this.mSetupFcn=null;
    if (btndesc) this.SetButtons(btndesc);
    this.Setup();
    for (let i=0; i<this.Btns.length; i++) {
      let b = this.Btns[i];
      if (b && b.type===A.PB_ToggleButton)
        b.showstate=b.state=Math.random()>0.7? 1 : 0;
    }
    this.RenderPanel();
    this.mSetupFcn=setupFcnSave;
    let ctx=figure.getContext("2d");
    let scl=Math.min(figure.width/canv.width, figure.height/canv.height);
    ctx.drawImage(canv,0,0,canv.width,canv.height,0,0,canv.width*scl,canv.height*scl);
  } //ButtonPanel::CreatePanelIllustration() //

  public ButtonAt(p:{x:number, y:number}) :number{
    let btnidx=-1;
    if (p.x>=0 && p.y>=0 && p.x<this.CanvasWidth && p.y<this.CanvasHeight) {
      let c = Math.floor(p.x/this.BtnWidth);
      let r = Math.floor(p.y/this.BtnHeight);
      btnidx = r*this.NCols + c;
      if (btnidx<0 || btnidx>=this.Btns.length || this.Btns[btnidx]===null)
        btnidx=-1;
    }
    return btnidx;
  } //ButtonPanel::ButtonAt() //

  private RadioGroupOf(idx:number): {start:number, size:number} {
    let nBtns = this.Btns.length;
    if (idx>=0 && idx<=nBtns && this.BtnType(idx)===A.PB_RadioButton) {
      let frm=idx;
      while (frm>0 &&
        this.BtnType(frm,true)!==A.PB_RadioButton1st &&
        this.BtnType(frm-1)===A.PB_RadioButton) { frm--; }
      let to=idx;
      while (to<nBtns-1 &&
        //this.BtnType(to,true)!==A.PB_RadioButtonLast &&
        this.BtnType(to+1,true)===A.PB_RadioButton) { to++; }
      return {start:frm, size:to-frm+1};
    }
    else return {start:-1, size:0};
  } //ButtonPanel::RadioGroupOf() //

  private SetRadioGroupState(btnidx:number, radgrp:{start:number, size:number}) {
    if (radgrp.start>=0 && radgrp.size>0 && btnidx>=radgrp.start && btnidx-radgrp.start<radgrp.size) {
      for (let i=0; i<radgrp.size; i++) {
        this.Btns[radgrp.start+i].state=0;
      }
      this.Btns[btnidx].state=1;
      this.Btns[radgrp.start].state |= ((btnidx-radgrp.start)<<8);
    }
  } //ButtonPanel::SetRadioGroupState() //

  public SetButtonLabel(idx:number, lab:string) {
    if (idx>=0 && idx<this.Btns.length && this.Btns[idx]!==null) {
      this.Btns[idx].label = lab;
    }
  } //ButtonPanel::SetButtonLabel()

  public SetButtonState(idx:number, state:number) {
    if (idx>=0 && idx<this.Btns.length && this.Btns[idx]!==null) {
      let btninf = this.Btns[idx];
      let btnclass = this.BtnType(idx);
      switch (btnclass) {
      case A.PB_RadioButton:
        if (state!==0)
          this.SetRadioGroupState(idx, this.RadioGroupOf(idx));
        else
          this.Btns[idx].state &= 0x7fffff00;
        break;
      case A.PB_ToggleButton:
        this.Btns[idx].state = state;
        break;
      } // switch (btnclass) //
    }
  } //ButtonPanel::SetButtonState()

  private TriggerButton(idx:number, action:number, pos:CPos) :number{
    let actionDone=A.PBA_NoAction;
    let nbtns = this.Btns.length;
    if (idx>=0 && idx<nbtns && this.Btns[idx]!==null) {
      let btninf = this.Btns[idx];
      // let radFrom =-1;
      // let radTo   =-1;
      let btnclass = btninf.type&A.PB_ButtonTypeMask;
      switch (btnclass) {
      case A.PB_RadioButton:
        if (action===A.PBA_Default || action===A.PBA_SetRadio) {
          this.SetRadioGroupState(idx, this.RadioGroupOf(idx));
          actionDone = A.PBA_SetRadio;
        }
        break;
      case A.PB_ToggleButton:
        if (action!==A.PBA_Drag) { // ignore Drag actions.
          btninf.state= action===A.PBA_Default ? (btninf.state ? 0 : 1) :
                        action===A.PBA_ToggleOn ? 1 : 0;
          actionDone = btninf.state===1 ? A.PBA_ToggleOn : A.PBA_ToggleOff;
        }
        break;
      case A.PB_PushButton:
        if (action===A.PBA_Default || action===A.PBA_PushOff || action===A.PBA_SlipOn || action===A.PBA_SlipOff) {
          let changed=false;
          // release all other push buttons
          for (let i=0; i<nbtns; i++) {
            if (this.BtnType(i)===A.PB_PushButton && i!==idx) {
              if (this.Btns[i].state!==0) changed=true;
              this.Btns[i].state=0;
            }
          }
          let st = (action===A.PBA_PushOff || action===A.PBA_SlipOff) ? 0 : 1;
          if (st!==btninf.state) changed=true;
          btninf.state = st;
          if (!changed) actionDone = A.PBA_NoAction;
          else {
            actionDone = (btninf.state===1 && action===A.PBA_Default) ?
                          A.PBA_PushOn : action;
          }
        }
        else if (this.mOnChange) this.mOnChange(this, A.PBC_Drag, idx, pos);
        break;
      } // switch (btnclass) //
      if (actionDone!==A.PBA_NoAction && this.mOnChange) {
        if (btnclass===A.PB_PushButton && btnclass===btninf.type) {
          // Push buttons other than the OK/Cancel types.
          // OK or Cancel would have a btninfo.type!==btnclass.
          this.mOnChange(this,
            actionDone===A.PBA_PushOn  ? A.PBC_PushedDown :
            actionDone===A.PBA_PushOff ? A.PBC_PushDone :
                         A.PBC_PushSlipped, idx, pos);
        }
        else if (btnclass!==A.PB_PushButton) // other non-Push buttons
        {
          this.mOnChange(this, A.PBC_StateChange, idx, pos);
        }
      }
    } // if (idx>=0 ...
    return actionDone;
  } // TriggerButton() //

  //-----------------------------------------------
  //  class static common event handlers
  //-----------------------------------------------
  public static OnTouchDown(e:TouchEvent) {
    e.preventDefault();
    let panel = ButtonPanel.ShowingButtonPanel;
    if (panel) {
      let newtouches = e.changedTouches;
      if (panel.mTrackingTouchId===-9999 && newtouches.length>0) {
        let canvasPos = CWA.GetCanvasTopLeftPos(panel.GetPanelCanvas());
        panel.mTrackingTouchId=newtouches[0].identifier;
        panel.mTrackingTouchDragQ=true;
        panel.OnClickOrTouchDown({x:newtouches[0].pageX-canvasPos.left, y:newtouches[0].pageY-canvasPos.top});
      }
    }
    return false;
  } // OnTouchDown()
  public static OnMouseDown(e:MouseEvent) {
    e.preventDefault();
    let panel = ButtonPanel.ShowingButtonPanel;
    if (panel) {
      panel.mMouseDownQ=true;
      let canvasPos = CWA.GetCanvasTopLeftPos(panel.GetPanelCanvas());
      panel.OnClickOrTouchDown({x:e.pageX-canvasPos.left, y:e.pageY-canvasPos.top});
    }
    return false;
  } /// OnMouseDown()

  //=================================================================
  //
  // ButtonPanel::OnClickOrTouchDown()
  //
  //=================================================================
  private OnClickOrTouchDown(pos:CPos) {
    if (!this.InOperationalModalStateQ()) return;
    let btnidx = this.ButtonAt(pos);
    let clickAction = this.TriggerButton(btnidx, A.PBA_Default, pos);
    if (clickAction!==A.PBA_NoAction) {
      this.mTrackingButton = btnidx;
      this.mTrackingButtonClickStartPos=pos;
      this.mDragAction = clickAction;
      this.RenderPanel();
    }
    else {
      this.mTrackingButton = -1;
      this.mTrackingButtonClickStartPos=null;
      this.mDragAction = A.PBA_NoAction;
    }
    this.mHoveringOn=-1;
  } // ButtonPanel::OnClickOrTouchDown() //

  public static OnMouseMove(e:MouseEvent) {
    e.preventDefault();
    let panel = ButtonPanel.ShowingButtonPanel;
    if (panel) {
      let canvasPos = CWA.GetCanvasTopLeftPos(panel.GetPanelCanvas());
      panel.OnDragOrMove({x:e.pageX-canvasPos.left, y:e.pageY-canvasPos.top}, panel.mMouseDownQ);
    }
    return false;
  } // ButtonPanel.OnMouseMove()

  public static OnTouchMove(e:TouchEvent) {
    e.preventDefault();
    let panel = ButtonPanel.ShowingButtonPanel;
    if (panel) {
      let canvasOrigin = CWA.GetCanvasTopLeftPos(panel.GetPanelCanvas());
      if (panel.mTrackingTouchDragQ) {
        let newmoves = e.changedTouches;
        for (let i=0; i<newmoves.length; i++) {
          if (newmoves[i].identifier===panel.mTrackingTouchId) {
            panel.OnDragOrMove({x:newmoves[i].pageX-canvasOrigin.left, y:newmoves[i].pageY-canvasOrigin.top}, true);
            break;
          }
        } // for (i)
      }
    }
    return false;
  } // ButtonPanel.OnTouchMove()

  //=================================================================
  //
  // ButtonPanel::OnDragOrMove()
  //
  //=================================================================
  private OnDragOrMove(pos:CPos, relevantDragQ:boolean) {
    let performed=A.PBA_NoAction;
    let btnidx = this.ButtonAt(pos);
    if (relevantDragQ) {
      let trkbtn = this.mTrackingButton;
      if (trkbtn>=0) {
        let trkclass = this.BtnType(trkbtn);
        if (trkclass===A.PB_PushButton) {
          let expectedstate = btnidx===trkbtn ? 1 : 0;
          if (expectedstate!==this.Btns[trkbtn].state) {
            performed = this.TriggerButton(trkbtn,
              (btnidx!==trkbtn) ? A.PBA_SlipOff
                                : A.PBA_SlipOn, pos);
          }
          else {
            this.TriggerButton(
              trkbtn, A.PBA_Drag,
              {x:pos.x-this.mTrackingButtonClickStartPos.x, y:pos.y-this.mTrackingButtonClickStartPos.y}
            );
          }

        }
        else if (trkclass===A.PB_RadioButton) {
          let radgrp = this.RadioGroupOf(trkbtn);
          if (btnidx>=radgrp.start && btnidx<radgrp.start+radgrp.size) {
            performed = this.TriggerButton(btnidx, A.PBA_SetRadio, pos);
          }
        }
        else if (trkclass===this.BtnType(btnidx))
          performed = this.TriggerButton(btnidx, this.mDragAction, pos);
      } // if (trkbtn>=0)
      if (performed!==A.PBA_NoAction) this.RenderPanel();
    } // if (relevantDragQ)
    else if (this.InOperationalModalStateQ()) {
      let oldHoverIdx = this.mHoveringOn;
      if (this.SetHover(btnidx) && this.mHoveringOn!==oldHoverIdx)
        this.RenderPanel();
    } // if (relevantDragQ) .. else if (SetHover(btnidx)
    return false;
  } // ButtonPanel::OnDragOrMove()

  public static OnMouseUp(e:MouseEvent) {
    e.preventDefault();
    let panel = ButtonPanel.ShowingButtonPanel;
    if (panel) {
      panel.mMouseDownQ=false;
      let canvasPos = CWA.GetCanvasTopLeftPos(panel.GetPanelCanvas());
      panel.OnMouseUpOrTouchEnd({x:e.pageX-canvasPos.left, y:e.pageY-canvasPos.top}, /*setHoverQ:*/true);
    }
  } // ButtonPanel.OnMouseUp()

  public static OnTouchEnd(e:TouchEvent) {
    e.preventDefault();
    let panel = ButtonPanel.ShowingButtonPanel;
    if (panel) {
      let changes = e.changedTouches;
      for (let i=0; i<changes.length; i++) {
        if (changes[i].identifier===panel.mTrackingTouchId) {
          panel.mTrackingTouchId=-9999;
          panel.mTrackingTouchDragQ=false;
          let canvasPos = CWA.GetCanvasTopLeftPos(panel.GetPanelCanvas());
          panel.OnMouseUpOrTouchEnd({x:changes[i].pageX-canvasPos.left, y:changes[i].pageY-canvasPos.top}, /*setHoverQ:*/false);
          break;
        }
      } // for (i)
    } // if (panel)
    return false;
  } // ButtonPanel.OnTouchEnd()

  //=================================================================
  //
  // ButtonPanel::OnMouseUpOrTouchEnd()
  //
  //=================================================================
  private OnMouseUpOrTouchEnd(pos:{x:number, y:number}, setHoverQ:boolean) {
    let btnidx = this.ButtonAt(pos);
    if (setHoverQ && this.InOperationalModalStateQ()) this.mHoveringOn=btnidx;
    if (btnidx>=0 && this.mDragAction===A.PBA_PushOn) {
      if (btnidx===this.mTrackingButton)
        this.TriggerButton(btnidx,A.PBA_PushOff, pos);
      let btntype = this.Btns[btnidx].type;
      if (btnidx===this.mTrackingButton &&
          (btntype&A.PB_ButtonTypeMask)===A.PB_PushButton)
          // (btntype===A.PB_OKButton || btntype===A.PB_CancelButton))
      {
        if ((btntype&A.PB_ButtonTypeMask)!==btntype)
          CWA.ExitModalState(A.MS_ButtonPanelDialog, btntype===A.PB_OKButton ? A.MSX_Accept : A.MSX_Cancel);
        // if (this.mOnChange)
        //   this.mOnChange(this, btntype===A.PB_PushButton ? A.PBC_PushDone:
        //                        btntype===A.PB_OKButton   ? A.PBC_OKDone  : A.PBC_Cancelled,
        //                        btnidx, pos);
      }
    } // if (dragAction===PBA_PushOn)
    this.RenderPanel();
  } // ButtonPanel::OnMouseUpOrTouchEnd()

  public static DismissButtonPanel(response:number) {
    switch (response) {
    case A.AnsOK:
    case A.AnsCancel:
    } // switch (dismissBtn) //
    if (ButtonPanel.PanelCanvas) { // free up canvas memory.
      ButtonPanel.PanelCanvas.width=0;
      ButtonPanel.PanelCanvas.height=0;
    }
    ButtonPanel.ShowingButtonPanel = null;
  } // ButtonPanel.DismissButtonPanel() //

} // class ButtonPanel //


class CRect
{
  l:number;
  t:number;
  r:number;
  b:number;

  constructor(left:number|CRect|DOMRect=0, top:number=0, width:number=0, height:number=0) {
    this.l=0; this.r=0; this.t=0; this.b=0;
    if (typeof(left)==='number')
      this.Set(left,top,width,height);
    else if (typeof(left)==='object' && left instanceof CRect)
      this.CopyFrom(left);
    else if (typeof(left)==='object' && left instanceof DOMRect)
      this.Set(left.left, left.top, left.width, left.height);
  } // constructor() //

  Set(left:number, top:number, width:number, height:number) {
    this.l=left;
    this.t=top;
    this.r=left+width;
    this.b=top+height;
    if (this.l>this.r) {
      let tmp=this.r; this.r=this.l; this.l=tmp;
    }
    if (this.t>this.b) {
      let tmp=this.t; this.t=this.b; this.b=tmp;
    }
  } // constructor

  CopyFrom(r: CRect) {
    this.l=r.l;
    this.t=r.t;
    this.r=r.r;
    this.b=r.b;
  } // CopyFrom() //

  Dupl(): CRect {
    return new CRect(this);
  }

  get w() {return this.r-this.l;}
  get h() {return this.b-this.t;}

  Merge(r:CRect) {
    this.l=Math.min(this.l, r.l);
    this.t=Math.min(this.t, r.t);
    this.r=Math.max(this.r, r.r);
    this.b=Math.max(this.b, r.b);
  } // MergeS() //

  SetLft(lft:number) {
    this.l=lft;
    if (this.r<lft) this.r=lft;
  }
  SetRgt(rgt:number) {
    this.r=rgt;
    if (this.l>rgt) this.l=rgt;
  }
  SetTop(top:number) {
    this.t=top;
    if (this.b<top) this.b=top;
  }
  SetBot(bot:number) {
    this.b=bot;
    if (this.t>bot) this.t=bot;
  }
  Scale(sx:number, sy:number, toIntQ:boolean=false) {
    this.l*=sx; this.t*=sy;
    this.r*=sx; this.b*=sy;
    if (toIntQ) {
      this.l=Math.floor(this.l);
      this.t=Math.floor(this.t);
      this.r=Math.ceil(this.r);
      this.b=Math.ceil(this.b);
    }
  }
  GrowShrink(dx:number, dy:number) {
    if (dx<0 && -dx>this.w/2) dx=-this.w/2;
    this.l-=dx; this.r+=dx;
    if (dy<0 && -dy>this.h/2) dy=-this.h/2;
    this.t-=dy; this.b+=dy;
  }
  Shift(dx:number, dy:number) {
    this.l+=dx; this.r+=dx;
    this.t+=dy; this.b+=dy;
  }
  Overlaps(r:CRect) {
    return Math.max(r.l,this.l)<Math.min(r.r,this.r) &&
           Math.max(r.t,this.t)<Math.min(r.b,this.b);
  }
  Contains(x:number, y:number) {
    return x>=this.l && x<this.r && y>=this.t && y<this.b;
  }
} // class CRect
