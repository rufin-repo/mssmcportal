///<reference path="CWA.ts"/>
///<reference path="spath.ts"/>
///<reference path="mmadata.ts"/>

const K={
  URL_DiscordInvite: 'https://discord.com/invite/tYeQc7YUGG',
  kLogoAnimNSteps:    30,
  kLogoAnimNZoomSteps:15,
  kMaxTotalUploadSize:20000000, // 20M per upload batch limit.
  kEventDescMaxSize:  5000, // 5K chars max

  MS_PickingCalEvent: 1,
  MS_EditingCalEvent: 2,
  MS_PickingFile:     3,
  MS_PickingItem:     4,
  MS_FileOps:         5,
  MS_TextEdit:        6,

  // Bits for use in MenuBtnPanelOptionsTable's [menuIdx].items[nth_choices].flags
  MEF_Disabled:       1,
  MEF_Hidden:         2,

  MNX_NotSignedInCmds:    0,
  MNX_AdminCmds:          1,
  MNX_UserCmds:           2,

  // ItemPickerTabEnums
  kNewsTab:        0,
  kEventsTab:      1,
  kDocsTab:        2,
  kNTabs:          3,  //<------- must be the last tab index +1

  kPickerLoadAction:        1,
  kPickerDelAction:         2,
  kPickerNewDirAction:      3,
  kPickerRenameAction:      4,
  kPickerUploadAction:      5,

  kMathClubEventStart:  2,    // 0: no event, 1: holidays/pa-days

  // Event types
  ET_Holiday:     0,  // holidays
  ET_Talks:       1,  // talks/presentations
  ET_Meeting:     2,  // special club gathering
  ET_Contest:     3,  // contest related
  ET_Reminder:    4,  // general reminders
  ET_MaxEvType:   4,

  CK_LogoShft: "LogoShft",  // cookie key storing the logo destination coords (fractional)
  CK_VotedPfx: "vcfp_",      //<- Meaning: vote-casted-for-poll:...

  VotedRecPatt: /^(\d+)(A|U)(\w+)$/,
  VotedRecsSep: ':',

  DocInfoPatt: /^([^|]*)\|(.+)\.(\w+)$/,
  DocInfoPart_Dir:  1,
  DocInfoPart_FN:   2,
  DocInfoPart_Ext:  3,

  TAB_Docs:   0,
  TAB_News:   1,
  TAB_Polls:  2,
  TAB_Trash:  3,

  FO_Cancel:  0,
  FO_Delete:  1,
  FO_Rename:  2,  // accept any name changes and close the dialog.
  FO_EditFN:  3,

  EDV_TitleEtc: 0,  // editor dialog view types (corresponds to the idx of tab Btns and TRs)
  EDV_Body:     1,
  EDV_Preview:  2,
  EDV_NViews:   3,  //<-- max of the EDV_??? +1

  ED_Cancel:    0,
  ED_Accept:    1,
  ED_PickDate:  2,
  ED_EditTitle: 3,
  ED_EditBody:  4,

} // const K



class UI
{
  static TopButtons:HTMLButtonElement[]=[];
  static CalendarBtn:HTMLButtonElement=null;
  static NewsBtn:HTMLButtonElement=null;
  static ReplayLogoBtn:HTMLButtonElement=null;
  static PollsBtn:HTMLButtonElement=null;
  static DocsBtn:HTMLButtonElement=null;;

  static ItemPickerDiv:HTMLDivElement=null;
  static ItemPickerItemListDiv: HTMLDivElement=null;
  static ItemPickerTitleTab: HTMLTableElement=null;
  static ItemPickerTabType: string[]=["docs","news","polls","trash"];
  static ItemPickerTabBtns: HTMLButtonElement[]=[null, null, null, null];
  static UploadItemsBtn:HTMLButtonElement=null;
  static NewItemBtn:HTMLButtonElement=null;

  static EditorDlgDiv:HTMLDivElement=null;
  // static EdTitleTR: HTMLTableRowElement=null;
  // static EdBodyTR: HTMLTableRowElement=null;
  // static EdTitleBtn: HTMLButtonElement=null;
  // static EdBodyBtn: HTMLButtonElement=null;
  static EdViewTRs:HTMLElement[]=[null, null, null];
  static EdViewBtns: HTMLButtonElement[]=[null, null, null];
  static EdCancelBtn: HTMLButtonElement=null;
  static EdCommitBtn: HTMLButtonElement=null;
  static EdTitleEdit: HTMLInputElement=null;
  static EdBodyEdit: HTMLTextAreaElement=null;
  static EdDateBtn: HTMLButtonElement=null;
  static EdDateEdit: HTMLInputElement=null;
  static EdDateInfTxt: HTMLElement=null;
  static EdPreviewDiv: HTMLDivElement=null;
  static EdIconBtns: HTMLButtonElement[]=[];

  static FileOpsDlgDiv:HTMLDivElement=null;
  static FileOpsDelBtn:HTMLButtonElement=null;
  static FileOpsRenBtn:HTMLButtonElement=null;
  static FileOpsDoRenBtn:HTMLButtonElement=null;
  static FileOpsCancelBtn:HTMLButtonElement=null;
  // static FileOpsRenBtn:HTMLButtonElement
  static FileOpsFNInp: HTMLInputElement=null;
  static FileOpsDocInfo:string='';

  static CalDialogDiv: HTMLDivElement=null;
  static CalEventViewDiv: HTMLDivElement=null;
  static CalGridDiv: HTMLDivElement=null;
  static CalShowingYear: number =-1;  // e.g. 2022 2023
  static CalShowingMonth: number =-1; // 0-11
  static CalSelDay: number = -1;
  static CalMonthHasNEvents:number=0; // excluding holidays
  static CalEditDayBtn: HTMLButtonElement=null;
  static CalEvPickerDlgDiv: HTMLDivElement=null;
  static CalEvPickerDateTxt: HTMLElement=null;
  static CalEvEvSel: HTMLSelectElement=null;
  static CalEvIconSel: HTMLSelectElement=null;
  static CalEvCommitChgsBtn: HTMLButtonElement=null;
  static CalEvRmEvBtn: HTMLButtonElement=null;
  // static CalEvEditEvBtn: HTMLButtonElement=null;
  static CalEvDescBox: HTMLTextAreaElement=null;
  static CalSelDayEvs:CalEvent[]=[]; // these are the actual CalEvent objects in CalEvent.List[]
  static CalSelDayEvCopy:CalEvent[] = [];

  static NewsDialogDiv: HTMLDivElement=null;

  static FileInputDlg: HTMLDivElement=null;
  static FileInput: HTMLInputElement=null;
  static FileDestSel:HTMLSelectElement=null;

  static PollList:Poll[]=[];  // all known polls, past or present.
  static PollPickerDlgDiv: HTMLDivElement=null;
  static PollListDiv: HTMLDivElement=null;

  static PollViewDlgDiv: HTMLDivElement=null;
  static PollChoicesDiv: HTMLDivElement=null;
  static PollViewTitle: HTMLElement=null;
  static PollViewDesc: HTMLElement=null;
  static ViewingPoll: Poll=null;

  static MenuBtnPanel: ButtonPanel=null;

  //.............................................................
  //  The following variable stores the ?go=... URL parameter
  //  or any of the key words listed in the regex pattern.
  //  The keyword is scanned asap, but it will only be handled
  //  at the end of the first Redraw(). The animation will be
  //  cut to the end immediately if there is an action to be
  //  performed. The actual action will be performed until
  //  all the initial SRQ requests are completed. (See the
  //  calls to SRQ.WhenNotBusyDo().)
  //.............................................................
  private static URLDirActnKeysPatt=/go|news|quiz|poll|events|cal/;
  private static URLDirectAction: string='';

  static LogoSvg:     HTMLImageElement|null=null;
  static LogoSvgText: HTMLImageElement|null=null;
  static LogoLoaded=0;

  // Fancy logo animation state variables.
  static animStepMult=1;
  static animStep=K.kLogoAnimNSteps;
  static targetFx=0.5;
  static targetFy=0.5;  // target logo center in percentage of screen width and height.
  private static onloadAnimQ=true;

  private static SetupUIElements()
  {
    //..................................................................
    //  Top Level Buttons
    //..................................................................
    UI.TopButtons.push(CWA.SetupButton('btnDemos', ()=>{
      UI.GotoURL('demos/index.html');
    }));
    UI.TopButtons.push(UI.NewsBtn=CWA.SetupButton('btnNews', UI.DisplayNews));
    UI.TopButtons.push(UI.ReplayLogoBtn=CWA.SetupButton('btnLogo', UI.ReplayLogoAnim));
    UI.TopButtons.push(UI.DocsBtn=CWA.SetupButton('btnDocs', ()=>UI.DisplayDocPicker(K.TAB_Docs, true)));
    UI.TopButtons.push(UI.CalendarBtn=CWA.SetupButton('btnEvents', UI.DisplayEvents));
    UI.TopButtons.push(UI.PollsBtn=CWA.SetupButton('btnPolls', UI.ShowPollPicker));
    UI.TopButtons.push(CWA.SetupButton('btnQuiz', ()=>{
      UI.GotoURL('docs/quiz/quiz.php');
    }));

    UI.TopButtons.push(CWA.SetupButton('btnMenu', (e:MouseEvent)=>{
      const id='btnMenu';
      !CWA.UserValidatedQ ? UI.__MenuBtnClickHandler(e, K.MNX_NotSignedInCmds, id) :
      CWA.UserLevel>1 ? UI.__MenuBtnClickHandler(e, K.MNX_AdminCmds, id) :
      UI.__MenuBtnClickHandler(e, K.MNX_UserCmds, id);
    }));

    // Change the display of the top button grid container to "grid" from "none" to make the top buttons visible.
    const topBtns = byId('topBtns');
    if (topBtns)
      topBtns.style.display="grid";

    //........................................................................
    //  Editor Dialog
    //........................................................................
    if (null!==(UI.EditorDlgDiv = CWA.SetupModalUIDiv("editorDlg",
        K.MS_TextEdit, A.MSX_Cancel, A.MSX_DontExit,
        ()=>{UI.EditorDlgAction(K.ED_Cancel);}
        )))
    {
      const trs=UI.EdViewTRs;
      trs[K.EDV_TitleEtc]=byId('edTitleTr') as HTMLElement;
      trs[K.EDV_Body]=byId('edBodyTr') as HTMLElement;
      trs[K.EDV_Preview]=byId('edPreviewTr') as HTMLElement;

      const tabs=UI.EdViewBtns;
      tabs[K.EDV_TitleEtc]=CWA.SetupButton('edTitleBtn',  ()=>UI.EdSwitchView(K.EDV_TitleEtc));
      tabs[K.EDV_Body]    =CWA.SetupButton('edBodyBtn',   ()=>UI.EdSwitchView(K.EDV_Body));
      tabs[K.EDV_Preview] =CWA.SetupButton('edPreviewBtn',()=>UI.EdSwitchView(K.EDV_Preview));

      UI.EdDateBtn=CWA.SetupButton('edDateBtn', ()=>UI.CalendarDialog(UI.PickedNewsExpirationDate));
      // UI.EdTitleBtn=CWA.SetupButton('edTitleBtn',()=>UI.EditorDlgAction(K.ED_EditTitle));
      // UI.EdBodyBtn=CWA.SetupButton('edBodyBtn',()=>UI.EditorDlgAction(K.ED_EditBody));
      UI.EdCancelBtn=CWA.SetupButton('edCancelBtn',()=>UI.EditorDlgAction(K.ED_Cancel));
      UI.EdCommitBtn=CWA.SetupButton('edCommitBtn',()=>UI.EditorDlgAction(K.ED_Accept));
      UI.EdBodyEdit=byId('edBodyEdit') as HTMLTextAreaElement;
      UI.EdTitleEdit=byId('edTitleEdit') as HTMLInputElement;
      UI.EdDateEdit=byId('edDateBox') as HTMLInputElement;
      UI.EdDateInfTxt=byId('expDateInf') as HTMLElement;
      UI.EdBodyEdit.oninput=UI.UpdateEditorUIs;
      UI.EdTitleEdit.oninput=UI.UpdateEditorUIs;
      UI.EdPreviewDiv=byId('edPreviewDiv') as HTMLDivElement;

      const iconsdiv = byId('edIcnPickDiv') as HTMLElement;
      if (iconsdiv) {
        const newsicons = UI.EdIconBtns;
        const nmicns=Article.namedIcons;
        for (let i=1; i<nmicns.length; i+=2) {
          const btn = document.createElement('button') as HTMLButtonElement;
          btn.className="icnPickBtn";
          btn.innerHTML=Article.NamedIcon(i>>1);
          newsicons.push(btn);
          iconsdiv.appendChild(btn);
          btn.onclick=()=>{UI.EdSetArticleIcon(i>>1)};
        } // for (i)
      } // if (iconsdiv)

      // if (!CWA.IsMobileDevQ) UI.EditorDlgDiv.style.height="calc(100vh - 50px)";
      UI.EditorDlgDiv.__UIAdjSizeFcn = (div:HTMLDivElement)=>
      {
        if (div===UI.EditorDlgDiv) {
          const cr = UI.CalcNewsEditorRect();
          div.style.left   = cr.l.toString()+"px";
          div.style.top    = cr.t.toString()+"px";
          div.style.height = cr.h.toString()+"px";
          div.style.width  = cr.w.toString()+"px";
          // const tr=trs[K.EDV_Preview];
          // if (tr && tr.style.display!=='none') {
          const prv = UI.EdPreviewDiv;
          // prv.style.left = cr.l.toString()+"px";
          // prv.style.top = (cr.t + ).toString()+"px";
          const vh=window.innerHeight;
          prv.style.height = (vh - 84).toString()+"px";
          prv.style.width  = cr.w.toString()+"px";
          // }
        }
      } // __UIAdjSizeFcn(div)
    }

    //........................................................................
    //  File Ops Dialog
    //........................................................................
    UI.FileOpsDlgDiv=CWA.SetupModalUIDiv("fileOpsDlg",
      K.MS_FileOps, A.MSX_Cancel, A.MSX_Accept,
      ()=>{UI.FileOpsDlgAction(K.FO_Cancel);},
      ()=>{UI.FileOpsDlgAction(K.FO_Rename);});
    if (UI.FileOpsDlgDiv) {
      UI.FileOpsFNInp = byId("fileNmInp") as HTMLInputElement;
      if (UI.FileOpsFNInp) UI.FileOpsFNInp.oninput=UI.FileOpsOnFNameInput;
      UI.FileOpsDelBtn=CWA.SetupButton("fileOpDelBtn", ()=>{UI.FileOpsDlgAction(K.FO_Delete);});
      UI.FileOpsRenBtn=CWA.SetupButton("fileOpRenBtn",()=>{UI.FileOpsDlgAction(K.FO_EditFN);});
      UI.FileOpsDoRenBtn=CWA.SetupButton("fileOpDoRenBtn",()=>{UI.FileOpsDlgAction(K.FO_Rename);});
      UI.FileOpsCancelBtn=CWA.SetupButton("fileOpCancelBtn",()=>{UI.FileOpsDlgAction(K.FO_Cancel);});
    }

    //........................................................................
    //  Item Picker Dialog
    //........................................................................
    if (null!==(UI.ItemPickerItemListDiv = byId("itemListDiv") as HTMLDivElement))
    {
      UI.ItemPickerTitleTab=byId("pickListTitleTab") as HTMLTableElement;

      const tabbtns=UI.ItemPickerTabBtns;
      for (let i=0; i<tabbtns.length; i++) {
        const btn=byId(['docsTab','newsTab','pollTab','trashTab'][i]) as HTMLButtonElement;
        UI.ItemPickerTabBtns[i]=btn;
        if (btn) btn.onclick=()=>{
          if (CWA.InModalState===K.MS_PickingItem && !SRQ.BusyQ()) UI.ChangeDocTab(i);
        };
      } // for (i)

      UI.ItemPickerDiv=CWA.SetupModalUIDiv("itemPickerDlg",
        K.MS_PickingItem, A.MSX_Cancel, A.MSX_DontExit,
        ()=>{UI.DismissItemPicker(A.MSX_Cancel);},null, true);
      UI.ItemPickerDiv.__UIAdjSizeFcn=(div:HTMLDivElement)=>
      {
        if (div===UI.ItemPickerDiv) {
          const cr = UI.CalcItemPickerDlgRect();
          div.style.left   = cr.l.toString()+"px";
          div.style.top    = cr.t.toString()+"px";
          div.style.height = cr.h.toString()+"px";
          div.style.width  = cr.w.toString()+"px";
        }
      } // __UIAdjSizeFcn(div)
      CWA.SetupButton("btnCloseItemPicker",()=>UI.DismissItemPicker(A.MSX_Cancel));
      UI.UploadItemsBtn=CWA.SetupButton("uploadItemsBtn",()=>UI.PerformMiscCmd("Upload"));
      UI.NewItemBtn=CWA.SetupButton("newItemBtn",()=>UI.OpenNewsEditor(null));
    }

    //........................................................................
    // Calendar Dialog UIs setup
    //........................................................................
    if (null!==(UI.CalGridDiv = byId("calendarDiv") as HTMLDivElement)) {
      UI.CalDialogDiv = CWA.SetupModalUIDiv("calDlgDiv",
        A.MS_ShowingCal, A.MSX_Cancel, A.MSX_None,
        ()=>{UI.DismissCalendarDialog(0);},
        null);
      UI.CalDialogDiv.__UIAdjSizeFcn=(div:HTMLDivElement)=>
      {
        if (div===UI.CalDialogDiv) {
          const cr = UI.CalcCalendarDlgRect();
          div.style.left   = cr.l.toString()+"px";
          div.style.top    = cr.t.toString()+"px";
          div.style.height = cr.h.toString()+"px";
          div.style.width  = cr.w.toString()+"px";
        }
      } // __UIAdjSizeFcn(div)
      // UI.CalDialogDiv.addEventListener('click', UI.ClickOnCalBkgd);

      CWA.SetupButton("btnCloseCal", ()=>{UI.DismissCalendarDialog(0);});
      CWA.SetupButton("btnPrvMon", ()=>{UI.CalChangeMonth(-1);});
      CWA.SetupButton("btnNxtMon", ()=>{UI.CalChangeMonth(1);});

      UI.CalEditDayBtn=CWA.SetupButton("btnEditCal", UI.EditCalSelDay);

      UI.CalEventViewDiv=CWA.SetupModalUIDiv("calEventView",
        A.MS_ViewingEvent, A.MSX_Cancel, A.MSX_Accept,
        ()=>{UI.CloseCalEventView(A.MSX_Cancel);},
        ()=>{UI.CloseCalEventView(A.MSX_Accept);}, true/* allow touch pan-x pan-y */);
      if (UI.CalEventViewDiv) {
        UI.CalEventViewDiv.addEventListener("click",
          ()=>{UI.CloseCalEventView(A.MSX_Cancel);}, false);
        UI.CalEventViewDiv.__UIAdjSizeFcn=(div:HTMLDivElement)=>{
          if (div===UI.CalEventViewDiv) {
            const r=UI.CalcEventViewDivRect();
            div.style.left  = r.l.toFixed(2)+"px";
            div.style.top   = r.t.toFixed(2)+"px";
            div.style.width = r.w.toFixed(2)+"px";
            div.style.height= r.h.toFixed(2)+"px";
          } // if (div===UI.CalEventViewDiv
        };
      } /// if (div!==UI.CalEventViewDiv)

      //. . . . . . . . . . . . . . . . . . . . . . . . . .
      //  CalEvent in CalSelDay editor/management UI
      //. . . . . . . . . . . . . . . . . . . . . . . . . .
      UI.CalEvPickerDlgDiv=CWA.SetupModalUIDiv("evPickerDlg",
        K.MS_PickingCalEvent, A.MSX_Cancel, A.MSX_DontExit,
        ()=>{UI.CloseEvPicker(A.MSX_Cancel);}
      );
      UI.CalEvPickerDlgDiv.__UIAdjSizeFcn=(div:HTMLDivElement)=>{
        if (div===UI.CalEvPickerDlgDiv) {
          const vh = window.innerHeight;
          div.style.height = (vh/2-10)+"px";
        }
      } // __UIAdjSizeFcn(div)
      UI.CalEvPickerDateTxt=byId("evPickerDateTxt") as HTMLElement;
      CWA.SetupButton("cancelEvChgsBtn", ()=>{UI.CloseEvPicker(A.MSX_None);});
      UI.CalEvCommitChgsBtn=CWA.SetupButton("acceptEvChgsBtn", ()=>{UI.CalDayEventOp(1)});
      UI.CalEvRmEvBtn=CWA.SetupButton("delEvBtn", ()=>{UI.CalDayEventOp(-1)});
      UI.CalEvEvSel=CWA.SetupSelect("dayEvSel", (e:Event)=>{
          if (e && e.target instanceof HTMLSelectElement)
            UI.OnCalEvEvSelChange((e.target as HTMLSelectElement).selectedIndex);
        }, null);
      UI.CalEvIconSel=CWA.SetupSelect("dayEvIcnSel", UI.OnCalEvIconSelChange, null);
      const descEdit = UI.CalEvDescBox=byId("evDescEdit") as HTMLTextAreaElement;
      if (descEdit) {
        descEdit.oninput = ()=>{UI.CalEvUpdate(descEdit);}
      }
    } // if (null!==CalGridDiv

    //........................................................................
    //  News List Dialog UIs setup
    //........................................................................
    UI.NewsDialogDiv=CWA.SetupModalUIDiv("newsDlgDiv",
      A.MS_ShowingNews, A.MSX_Cancel, A.MSX_Cancel,
      ()=>{UI.DismissNewsDialog(0)}, null, true);
    if (UI.NewsDialogDiv) {
      // set the following in CSS in the html file!
      // UI.NewsDialogDiv.style.touchAction="pan-x pan-y"; // don't allow pinch-zoom!! Seriously messed up in IOS safari
      UI.NewsDialogDiv.__UIAdjSizeFcn=(div:HTMLDivElement)=>{
        if (div===UI.NewsDialogDiv) {
          const cr = UI.CalcNewsDlgRect();
          div.style.left   = cr.l.toString()+"px";
          div.style.top    = cr.t.toString()+"px";
          div.style.height = cr.h.toString()+"px";
          div.style.width  = cr.w.toString()+"px";
        } // if (div)
      };
    } // if (UI.NewsDialogDiv)

    //....................................................................
    //  Poll Picker Dialog setup
    //....................................................................
    UI.PollPickerDlgDiv=CWA.SetupModalUIDiv("pollsDlgDiv",
      A.MS_PickingPoll, A.MSX_Cancel, A.MSX_None,
      ()=>{UI.DismissPollPicker(null);});
    if (UI.PollPickerDlgDiv) {
      UI.PollListDiv=byId('pollListDiv') as HTMLDivElement;
      CWA.SetupButton('btnClosePolls', ()=>{UI.DismissPollPicker(null);});
    } // if (UI.PollPickerDlgDiv)

    //....................................................................
    //  Poll View Dialog setup
    //....................................................................
    UI.PollViewDlgDiv=CWA.SetupModalUIDiv("pollViewDlgDiv",
      A.MS_ViewingPoll, A.MSX_Cancel, A.MSX_None,
      ()=>{UI.DismissPollView(-1);}, null); //, true);
    if (UI.PollViewDlgDiv) {
      UI.PollChoicesDiv=byId('pollChoicesDiv') as HTMLDivElement;
      CWA.SetupButton('btnClosePollView', ()=>{UI.DismissPollView(null);});
    } // if (UI.PollViewDlgDiv)
    UI.PollViewTitle =byId('pollTitle') as HTMLElement;
    UI.PollViewDesc  =byId('pollDesc') as HTMLElement;

    //....................................................................
    //  File Input Dialog setup
    //....................................................................
    UI.FileInputDlg=CWA.SetupModalUIDiv("fileInputDlg",
      K.MS_PickingFile, A.MSX_Cancel, A.MSX_Cancel,
      ()=>{}, null);
    const fileInput = byId("fileInp") as HTMLInputElement;
    if (fileInput && fileInput instanceof HTMLInputElement) {
      fileInput.addEventListener("change", UI.ProcessPickedFiles, false);
      fileInput.addEventListener("click", ()=>{fileInput.blur();}, false);
      UI.FileInput=fileInput;
    }
    CWA.SetupButton("btnCloseFilePicker", ()=>{if (CWA.InModalState===K.MS_PickingFile) CWA.ExitModalState(CWA.InModalState, A.MSX_None);});
    UI.FileDestSel = byId("fileInpType") as HTMLSelectElement;
    if (UI.FileDestSel) UI.FileDestSel.onchange=UI.OnUploadDestSelChange;

    CWA.Typeset();
  } // SetupUIElements()

  static MD2Html:(input:string)=>string=(s:string)=>s;

  constructor()
  {
    if (null!==(window["converter"]=window["showdown"] ? new window["showdown"]["Converter"]() : null))
      UI.MD2Html = window["converter"]["makeHtml"].bind(window["converter"]);

    UI.InitCWA();

    UI.SetupUIElements();
    CalEvent.GetEventListFromServer((ok:boolean)=>{
      if (ok && CWA.InModalState===A.MS_ShowingCal)
        UI.FillCalendarGrid(UI.CalShowingYear, UI.CalShowingMonth);
    });
    UI.GetPollList();
  } // constructor()

  //--------------------------------------------------------------------
  //
  //  InitCWA() CWA one time initialization
  //
  //--------------------------------------------------------------------
  static InitCWA()
  {
    CWA.AppName="Math Club Home";
    CWA.MinCanvasH = 240;
    CWA.MinCanvasW = 300;
    // CWA.ColorBg1 = 'lightyellow';
    // CWA.ColorBg1 = 'navajowhite';
    CWA.ColorBg1 = 'white'; //'#fff'; //'lightsteelblue'; //'dimgray'; //'lightgray'; //'ghostwhite'; //'#eee';

    CWA.ClickHoldDuration=200;
    CWA.AppRenderIconFcn = UI.RenderIconCanvas;
    CWA.Init("MSS Math Club Portal",
      {
        AdjCanv: UI.AdjCanvas,
        GetStatusText: UI.GetStatusText,
        UpdateUI:UI.UpdateUI,
        RedrawCanv: UI.Redraw,
      }, false); // false: don't display splash screen.
    CWA.MainCanvasTracker.onClick = UI.OnClick;
    CWA.MainCanvasTracker.onDrag = UI.OnDrag;

    UI.MenuBtnPanel = new ButtonPanel(1, 1, // these will be updated in App.SetupMenuBtnPanel()
        150, 36,
        null, // no button descriptions yet. The buttons are dynamically built.
        UI.SetupMenuBtnPanel,
        UI.OnMenuBtnPanelChange);

    UI.URLDirectAction = UI.FindGETParam(UI.URLDirActnKeysPatt);
    if (UI.URLDirectAction) {
      UI.animStep=0; // jump to the end state immediately.
      UI.ShiftDestx=UI.targetFx;
      UI.ShiftDesty=UI.targetFy;
    }

    UI.LogoSvg = new Image();
    UI.LogoSvg.onload=()=>{
      UI.LogoLoaded++;
      if (UI.LogoLoaded>=2)
        UI.Redraw();
    };
    UI.LogoSvg.src = "MM-IsoCubeBall.svg";

    UI.LogoSvgText = new Image();
    UI.LogoSvgText.onload = ()=>{
      UI.LogoLoaded++;
      if (UI.LogoLoaded>=2)
        UI.Redraw();
    };
    UI.LogoSvgText.src = "MM-IsoCubeText.svg";

    const r3_2=Math.sqrt(3)/2;
    const f0 = new Path2D();
    f0.moveTo(0,0); f0.lineTo(r3_2,-.5); f0.lineTo(r3_2,.5); f0.lineTo(0,1); f0.closePath();
    const f1 = new Path2D();
    f1.moveTo(0,0); f1.lineTo(-r3_2,-.5); f1.lineTo(0,-1); f1.lineTo(r3_2,-.5); f1.closePath();
    const f2 = new Path2D();
    f2.moveTo(0,0); f2.lineTo(0,1); f2.lineTo(-r3_2,.5); f2.lineTo(-r3_2,-.5); f2.closePath();
    UI.isoFacePath=[f0,f1,f2];

    if (CWA.UserId && CWA.PassHash)
      CWA.SignIn(A.SI_Normal, CWA.UserId,CWA.PassHash,'', null,null);

  } // InitCWA()

  private static FindGETParam(key:RegExp) :string {
    let tmp:string[] = [];
    let items = window.location.search.substring(1).split("&");
    for (let index = 0; index < items.length; index++) {
      tmp = items[index].split("=");
      if (tmp[0].match(key)) {
        return tmp.length>1 ? decodeURIComponent(tmp[1]) : tmp[0];
      }
    }
    return null;
  } // FindGETParam() //

  static AboutBox()
  {
    // CWA.ChkVerAndUpdate();
    UI.GotoURL("about.html");
    // const html=
    // `<h1 class="splash">
    //     MSS Math Club Portal
    //   </h1>
    //   <p class="splash">
    //     Copyright © 2023 Rufin Hsu<br>
    //     All Rights Reserved
    //   </p>
    //   <p class="splash">Build: ${A.BuildDate} (${CWA.AppInfoString()})</p>
    // `;
    // CWA.MessageBox(html, false, ()=>CWA.ChkVerAndUpdate());
    // CWA.TextInfoArea.style.backgroundColor="khaki";
  } // AboutBox() //


  //****************************************************************
  //
  //  Fancy Iso Cube + Logo rendering/animation related functions
  //
  //****************************************************************
  private static isoFacePath: Path2D[]=null; // prepared 100,010,001 small iso-cube face paths

  private static ShiftLogoTimer=-1;
  private static ShiftDestx=0.5;
  private static ShiftDesty=0.5;
  private static ShiftLogoDest() {
    if (UI.ShiftLogoTimer<0) {
      UI.ShiftLogoTimer=window.setTimeout(UI.__shiftTarget,15);
    }
  }


  static drawIsoCubes(ctx:CanvasRenderingContext2D, vw:number, vh:number, cx:number, cy:number, cubesz:number, zonesz:number)
  {
    const r1_2 = Math.SQRT1_2;
    const facenm=
      [[r1_2, -.5, .5],    // iso-view rotated (1,0,0)
       [0, r1_2, r1_2],    // iso-view rotated (0,1,0)
       [-r1_2, -.5,  .5]]; // iso-view rotated (0,0,1)
    function shading(face:number, x:number, y:number)
    {
      /*
        original cube diagonal: (0,0,0) to (1,1,1)
        y
        ^_____ (1,1,1)
        |     |
        |     |
       (.)----->x
        z(out)

        transformed to the iso view using the transformation matrix S:
        ( 1/r2  0     -1/r2)
        (-1/2  1/r2   -1/2 )
        ( 1/2  1/r2    1/2 )
        to become (0,0,1) (i.e. the vector towards the viewer)

        Therefore if we have a light vector from (0,0,0) (u,v,w) in the viewing coord sys
        it can be transformed back into the 1,1,1 cube coord-sys using inv(S)===transpose(S):
        ( 1/r2 -1/2   1/2 ) (u)
        (  0    1/r2  1/r2) (v) = [(w-v)/2 + u/r2, (w+v)/2, (w-v)/2 - u/r2]^T
        (-1/r2 -1/2   1/2 ) (w)

        More efficiently, we could pre-calc the rotated 100,010 and 001 normals by transforming them with S.
        the normals are simply the 3 columns of S.
      */
      const n=facenm[face];
      let nx=n[0],ny=n[1],nz=n[2];
      // Note that the canvas coord's y is downward +ve. Therefore ly is negated below.
      let lx=cx-x, ly=y-cy, lz=500;   // light vector (from the cube's 0,0,0 to the light center cx,cy) in the rotated coord system.
      const nm=Math.sqrt(lx*lx + ly*ly + lz*lz);
      lx/=nm; ly/=nm; lz/=nm; // normalize
      const cos = (nx*lx + ny*ly + nz*lz); // dot product
      const lum = Math.min(255, Math.floor(180+cos*80+0.5));
      return "rgb("+lum+","+lum+","+lum+")";
    } // shading()

    const cos30 = Math.sqrt(3)/2;

    const zone=zonesz*1.1;
    // const w2=vw/2, h2=vh/2,
    // const fadelen=Math.sqrt(w2*w2+h2*h2)-zone;

    for (let side=0; side<3; side++) {
      const s = UI.isoFacePath[side];
      let evenrow=true;
      for (let y=0; y<vh+cubesz; y+=1.5*cubesz) {
        let x = evenrow ? 0 : cubesz*cos30;
        evenrow=!evenrow;
        for (; x<vw+cubesz; x+=cubesz*2*cos30) {
          const coff = Math.sqrt((x-cx)*(x-cx)+(y-cy)*(y-cy));
          if (coff<zone) continue;
          ctx.save();
          ctx.transform(cubesz,0,0,cubesz, x,y);
          ctx.fillStyle = shading(side, x,y);
          ctx.fill(s);
          ctx.restore();
        } // for (x)
      } // for (y)
    } // for (side)
  } // drawIsoCubes()

  static Redraw()
  {
    if (!UI.LogoLoaded) return;

    const totSteps = K.kLogoAnimNSteps*UI.animStepMult;
    const totZoomSteps = K.kLogoAnimNZoomSteps*UI.animStepMult;

    const canv=CWA.MainCanvas;
    const ctx=CWA.MainCanvasCtx;
    const cvW = canv.width;
    const cvH = canv.height;
    const vcx=cvW*UI.targetFx, vcy=cvH*UI.targetFy;

    ctx.clearRect(0,0,cvW,cvH);
    ctx.strokeStyle="olive";
    ctx.strokeRect(0,0,cvW,cvH);
    let sz = UI.animStep<=0 ?
      Math.max(Math.min(Math.min(vcx,cvW-vcx), Math.min(vcy,cvH-vcy))*1.6, Math.min(cvW,cvH)*0.2)
      : Math.min(cvW,cvH)*.8; // target logo size


    const targetR=sz/2;
    const cubesz = Math.max(cvW, cvH)/50;
    const spiralrad = cvW/2; //cvW>cvH ? cvW/2 : cvH/2;
    const trailfrac = (totSteps-UI.animStep)/totSteps;
    const zoomfrac = UI.animStep>totZoomSteps ? 0 : (totZoomSteps-UI.animStep)/totZoomSteps;
    const ang = trailfrac*2*Math.PI;
    const cx = vcx + Math.cos(ang)*(1-trailfrac)*spiralrad,
          cy = vcy + Math.sin(ang)*(1-trailfrac)*spiralrad;
    // const cx=cvW/2+UI.animStep*10, cy=cvH/2+UI.animStep*10;
    const logoR = targetR*zoomfrac;
    UI.drawIsoCubes(ctx, cvW, cvH, cx, cy, cubesz, Math.max(2*cubesz, logoR+cubesz));

    if (logoR>0) {
      ctx.drawImage(UI.LogoSvg, cx-logoR, cy-logoR, 2*logoR, 2*logoR);
      if (zoomfrac>0.5 && zoomfrac<.99) {
        ctx.save();
        ctx.globalAlpha = zoomfrac;
      }
      ctx.drawImage(UI.LogoSvgText, vcx-targetR/zoomfrac, vcy-targetR/zoomfrac, sz/zoomfrac, sz/zoomfrac);
      if (zoomfrac>0.5 && zoomfrac<.99) {
        ctx.restore();
      }
    }
    if (UI.animStep>0) {  // Logo animation not finished yet.
      UI.animStep--;
      window.setTimeout(UI.Redraw, 15); // set a timer to do another frame.
    }
    else {
      // Logo animation done.
      if (UI.ShiftDestx!==UI.targetFx || UI.ShiftDesty!==UI.targetFy) {
        // Shifted Logo center (targetFx, targetFy) still not aligned with the
        // intended destination (ShiftDestx, ShiftDesty) yet.
        // Set a timer to call the __shiftTarget function to move it gradually
        // to the destination (and draw the animated steps).
        window.setTimeout(UI.__shiftTarget, 15);
      }
      else { // I.e. the Logo is at its intended destination location. Done...(almost)

        if (UI.URLDirectAction) {
          const action=UI.URLDirectAction;
          UI.URLDirectAction='';
          switch (action) {
          case 'news': SRQ.WhenNotBusyDo(UI.DisplayNews); break;
          case 'cal':
          case 'events': SRQ.WhenNotBusyDo(UI.DisplayEvents); break;
          case 'poll': SRQ.WhenNotBusyDo(UI.ShowPollPicker); break;
          }
        } // UI.URLDirectAction

        // if (UI.ReplayLogoBtn) UI.ReplayLogoBtn.disabled=false;
        if (UI.onloadAnimQ) {
          // This means we have just finished the onload animation.
          UI.onloadAnimQ=false;

          // See if there is an additional user set logo shift from localstorage.
          const sftsave = CWA.GetCookie(K.CK_LogoShft);
          let splitat=-1;
          if (sftsave && (splitat=sftsave.indexOf(":"))>=0) {
            // Shift the goal posts !
            UI.ShiftDestx = +sftsave.substring(0, splitat);
            UI.ShiftDesty = +sftsave.substring(splitat+1);
            UI.ShiftLogoDest();
          }
        }
        UI.UpdateUI();
        if (!CWA.AutoChkVerDoneQ)
        {
          CWA.AutoChkVerDoneQ=true;
          CWA.ChkVerAndUpdate();  // Check for app updates.
        }
      }
    }
  } // Redraw()

  static ReplayLogoAnim() {
    if (UI.animStep<=0) {
      if (UI.ShiftLogoTimer>=0) {
        window.clearTimeout(UI.ShiftLogoTimer);
        UI.ShiftLogoTimer=-1;
      }
      UI.targetFx=0.5;
      UI.targetFy=0.5;
      UI.ShiftDestx=0.5;
      UI.ShiftDesty=0.5;
      CWA.SetCookie(K.CK_LogoShft, null);

      UI.animStepMult=10;
      UI.animStep = K.kLogoAnimNSteps*UI.animStepMult;

      if (UI.ReplayLogoBtn)
        UI.ReplayLogoBtn.disabled=true;

      CWA.SetStatusText("Iso-cubes shaded with a diffuse lighting model.", 5000);

      CWA.ChkVerAndUpdate();

      UI.Redraw()
    }
  } // ReplayLogoAnim()

  private static OnClick(cx:number, cy:number)
  {
    if (UI.animStep===0) {
      if (CWA.InModalState===A.MS_ButtonPanelDialog) {
        CWA.ExitModalState(CWA.InModalState, A.MSX_None);
      }
      else if (!CWA.InModalState) {
        const canv = CWA.MainCanvas;
        UI.ShiftDestx = cx/canv.width;
        UI.ShiftDesty = cy/canv.height;
        CWA.SetCookie(K.CK_LogoShft, UI.ShiftDestx.toString()+":"+UI.ShiftDesty.toString());

        UI.ShiftLogoDest();
      }
    }
  } // OnClick()
  private static OnDrag(cx:number, cy:number)
  {
    UI.OnClick(cx,cy);
  } // OnDrag()

  private static __shiftTarget() // must only be called by a timer
  {
    UI.ShiftLogoTimer=-1;
   let step=8/CWA.MainCanvas.width;
    if (Math.abs(UI.targetFx-UI.ShiftDestx)<step)
      UI.targetFx=UI.ShiftDestx;
    else {
      if (UI.ShiftDestx>UI.targetFx)
        step=Math.max((UI.ShiftDestx-UI.targetFx)/25, step);
      else
        step=-Math.max((UI.targetFx-UI.ShiftDestx)/25, step);
      UI.targetFx +=step;
    }

    step=8/CWA.MainCanvas.height;
    if (Math.abs(UI.targetFy-UI.ShiftDesty)<step)
      UI.targetFy=UI.ShiftDesty;
    else {
      if (UI.ShiftDesty>UI.targetFy)
        step=Math.max((UI.ShiftDesty-UI.targetFy)/25, step);
      else
        step=-Math.max((UI.targetFy-UI.ShiftDesty)/25, step);
      UI.targetFy +=step;
    }
    UI.Redraw();
  } // __shiftTarget()


  private static RenderIconCanvas(iconCanvas:HTMLCanvasElement, w:number, h:number, iconId:number):HTMLCanvasElement
  {
    let outCanv:HTMLCanvasElement=null;
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
    // ctx.transform(0.9*w/100,0,0,0.9*h/100, 0.05*w, 0.05*h);
    ctx.lineWidth=3;
    CWA.log(iconId.toString());
    switch (iconId) {
    case A.kIcon_FavIcon:
      {
        ctx.transform(1.2*w/100,0,0,1.2*h/100, -.1*w, -.1*h);
        const r3=20*Math.sqrt(3);
        const r=40;
        new SPath([0,50,50, 0xac,50,50,60,-90,30, 0xe]).RenderPath(ctx, ["f#232"]);
        new SPath([0,50,50, 0xaa,50,50,60,-90,150, 0xe]).RenderPath(ctx, ["f#bcb"]);
        new SPath([0,50,50, 0xaa,50,50,60,150,30, 1,50,50,
                   0,50,50, 1,50-r3,50-r/2, 1,50,50-r, 1,50+r3,50-r/2, 0xe]).RenderPath(ctx,["f#f3fff3"]);
        new SPath([0,50,50, 1,50-r3,50-r/2, 1,50-r3,50+r/2, 1,50,50+r, 0xe]).RenderPath(ctx, ["f#232"]);
        new SPath([0,50,50, 1,50,50+r, 1,50+r3,50+r/2, 1,50+r3,50-r/2, 0xe]).RenderPath(ctx, ["f#bcb"]);
        new SPath([0,50,50+r/3, 1,50-r3*0.667,50, 1,50-r3*.667,50+r*2/3,
                   1,50-r3/3,50+r*5/6, 1,50-r3/3,50+r/2, 1,50,50+r*2/3,
                   1,50+r3/3,50+r/2, 1,50+r3/3,50+r*5/6, 1,50+r3*.667,50+r*2/3, 1,50+r3*.667,50,
                   0xe]).RenderPath(ctx, ["f#fff"]);
        outCanv=iconCanvas;
      }
      break;
    } // switch (iconId)
    ctx.restore();
    return outCanv;
  } // RenderIconCanvas()



  //*********************************************************************
  //
  // ButtonPanel base Menus
  //
  //*********************************************************************

  //=====================================================================
  //  Unified ButtonPanel implementation of various Menus without
  //  relying on HTML select elements (which are inconsistently and
  //  weirdly implemented in mobile browsers)
  //  The 'flags' field could have any (or none) of the A.MEF_XXX bits.
  //=====================================================================
  private static sNoUserCmdsOptions = [
    //!!! REMEMBER to modify the call to UI.EnableSelectOptions in
    //!!! setUIState() if the following list is changed !!!
    {label:"Member Sign In",                value:"SignIn",        flags:0},
    {label:"Sign Out",                      value:"SignOut",       flags:0},
    {label:"Discord Invite",                value:"Discord",       flags:0},
    {label:"About",                         value:"AboutBox",      flags:0},
  ];

  private static sUserCmdsOptions = [ // signed-in but not an admin
    //!!! REMEMBER to modify the call to UI.EnableSelectOptions in
    //!!! setUIState() if the following list is changed !!!
    {label:"Change Passwd",                 value:"SignIn",        flags:0},
    {label:"Sign Out",                      value:"SignOut",       flags:0},
    {label:"Discord Invite",                value:"Discord",       flags:0},
    {label:"About",                         value:"AboutBox",      flags:0},
  ];

  private static sAdminCmdsOptions = [
    //!!! REMEMBER to modify the call to UI.EnableSelectOptions in
    //!!! setUIState() if the following list is changed !!!
    {label:"User Management",               value:"SignIn",        flags:0},
    {label:"Sign Out",                      value:"SignOut",       flags:0},
    {label:"Discord Invite",                value:"Discord",       flags:0},
    {label:"Admin Info",                    value:"ShowSecret",    flags:0},
    {label:"Upload File",                   value:"Upload",        flags:0},
    {label:"About",                         value:"AboutBox",      flags:0},
  ];

  // Handler for ButtonPanel based menu selection or HTMLSelectElement selection.
  private static PerformMiscCmd(cmd:string)
  {
    switch (cmd) {
    case "SignIn": CWA.SigninDialog(
      CWA.UserValidatedQ
      ? (CWA.UserLevel===1 ? "Change Your Password"
                           : "Member A/C Management")
      : "Math Club Member Sign In");
      break;
    case "SignOut": CWA.SignOut();
      break;
    case "Discord":
      if (!CWA.UserValidatedQ) {
        CWA.SigninDialog('Sign in to reveal the Discord invite', ()=>{
          if (CWA.UserValidatedQ) UI.ShowDiscordInviteLink();
        });
      }
      else {
        UI.ShowDiscordInviteLink();
      }
      break;
    // case "DbgLog":
    //   CWA.InModalState || CWA.MessageBox(CWA.GetCookie(A.kCK_DbgLog), true);
    //   break;
    case "ShowSecret":
      if (CWA.UserValidatedQ && CWA.UserLevel>1 && !CWA.PassHashTempQ) { // Admin level
        // show some admin secrets
        CWA.Pwd2Dialog((pwd2:string)=>{

          if (pwd2) {
            let dict:{[key:string]:string} = {};
            dict["P1P"]=md5(pwd2);

            CWA.AskAppServer('ADMININF', CWA.UserId, CWA.PassHash, dict).
            then((info:string)=>{
              CWA.GenericQuery(A.kIcon_Info, "MMA Admin Info DO NOT SHARE",
                info,null,
                A.GQ_OK);
            }).
            catch((err:string)=>{
              CWA.AlertBox(A.kIcon_Warning, err);
            });
          }
        });
      }
      break;
    case "Upload":
      if (UI.FileInput && UI.FileInputDlg)  {
        UI.FileInput.disabled=true;
        UI.FileDestSel.selectedIndex=0;
        CWA.EnterModalState(K.MS_PickingFile);
        UI.FileInput.value = "";
      }
      break;
    case "AboutBox":
      UI.AboutBox();
      // CWA.DisplaySplash(false); // false means don't auto disappear.
      break;
    }
    UI.UpdateUI();
    // CWA.AlertBox(A.kIcon_3HorzBars, cmd);
  } // UI.PerformMiscCmd() //

  // Each UI.MenuBtnPanel based menus must have an entry in the following table.
  private static MenuBtnPanelOptionsTable:
    {items:{label:string, value:string,  flags:number}[],
     selIdx:number,
     onSel:(selVal:string)=>void
    }[]=
  [
    {items:UI.sNoUserCmdsOptions,selIdx:-1, onSel:UI.PerformMiscCmd},
    {items:UI.sAdminCmdsOptions, selIdx:-1, onSel:UI.PerformMiscCmd},
    {items:UI.sUserCmdsOptions,  selIdx:-1, onSel:UI.PerformMiscCmd},
  ];

  public static SetMenuItemsFlags(menuIdx:number, flags:(number|boolean)[]) {
    let badQ=false;
    if (menuIdx>=0 && menuIdx<UI.MenuBtnPanelOptionsTable.length && flags) {
      let menuinfo = UI.MenuBtnPanelOptionsTable[menuIdx];
      if (flags.length===menuinfo.items.length) {
        for (let i=flags.length-1; i>=0; i--) {
          const bits = typeof(flags[i])==='number' ?
            +flags[i] :                       // number: treat it as bit-pattern
            (flags[i] ? 0 : K.MEF_Disabled);  // boolean: true means enabled.
          menuinfo.items[i].flags = bits;
        } // for (i)
      }
      else badQ=true;
    }
    else badQ=true;
    if (badQ) throw "SetMenuItemFlags(): bad flags[]";
  } // UI.SetMenuItemsFlags()

  private static SetupMenuBtnPanel(panel:ButtonPanel) {
    const menuIdx = panel.Data('menuIdx');
    if (menuIdx>=0 && menuIdx<UI.MenuBtnPanelOptionsTable.length) {
      const tableEntry = UI.MenuBtnPanelOptionsTable[menuIdx];
      const menuitems = tableEntry.items;
      let menuBtnsDesc = '';
      let nShownItems = 0;
      let firstEntryQ=true;
      for (let i=0; i<menuitems.length; i++) {
        const shownQ = !(menuitems[i].flags&K.MEF_Hidden);
        const enabledQ = !(menuitems[i].flags&K.MEF_Disabled);
        if (shownQ) {
          if (!firstEntryQ) menuBtnsDesc+='\n';
          nShownItems++;
          if (enabledQ) {
            const selQ = tableEntry.selIdx===i;
            menuBtnsDesc+=(/*selQ ? 'C' :*/ 'P')+menuitems[i].label+'_'+i;
            if (selQ) menuBtnsDesc+=',1';
          }
          else
            menuBtnsDesc+='N'+(shownQ ? menuitems[i].label : '')+'_'+i;
          firstEntryQ=false;
        }
      } // for (i)

      // if (radiosQ) {
      //   panel.BtnWidth = 60;
      //   panel.BtnHeight = 38;
      //   panel.NCols = menuitems.length;
      //   panel.NRows = 1;
      // }
      // else
      {
        panel.NCols = 1;
        panel.NRows = nShownItems; //menuitems.length;
        // panel.BtnWidth = 150;
        // panel.BtnHeight = 38;
      }

      panel.SetButtons(menuBtnsDesc);
      // for (let i=0; i<panel.Btns.length; i++) {
      //   panel.Btns[i].state=0;
      // }
    } // if (menuIdx...
  } // UI.SetupMenuBtnPanel()

  public static MenuBtnPanelActiveQ() : boolean {
    return CWA.InModalState===A.MS_ButtonPanelDialog && ButtonPanel.ShowingButtonPanel===UI.MenuBtnPanel;
  }


  private static __MenuBtnClickHandler(e:MouseEvent, menuIdx:number, menuBtnId:string)
  {
    if (e.type!=='click') return;
    e.stopPropagation();
    let callShowPanelDialogQ = false;
    let callExitModalStateQ = UI.MenuBtnPanelActiveQ();

    if (!CWA.InModalState && !SRQ.BusyQ())  // not in a modal state
      callShowPanelDialogQ=true;  // => can safely display the menu.
    else if (callExitModalStateQ &&
             ButtonPanel.ShowingButtonPanel.Data('menuIdx')!==menuIdx)  // clicked on another menu btn.
      callShowPanelDialogQ=true;

    if (callExitModalStateQ) {
      CWA.ExitModalState(CWA.InModalState, A.MSX_None);
    }
    if (callShowPanelDialogQ) {
      const menuBtn = byId(menuBtnId);
      let x = e.pageX;
      let y = e.pageY;
      if (menuBtn && menuBtn instanceof HTMLButtonElement) {
        let r = menuBtn.getBoundingClientRect();
        x = r.left+r.width/2;
        y = r.top+r.height/2;
      }
      const menuHalfWidth = UI.MenuBtnPanel.DivWidth/2;
      const gmCanvTL = CWA.GetCanvasTopLeftPos(CWA.MainCanvas);
      let gmCanvX=x-gmCanvTL.left-menuHalfWidth, gmCanvY=y-gmCanvTL.top;
      UI.MenuBtnPanel
        .SetData('menuIdx', menuIdx)
        .ShowPanelDialog(gmCanvX*CWA.CanvasResScale, Math.max(0, gmCanvY)*CWA.CanvasResScale);  // ShowPanelDialog takes x,y coordinates in canvas pixels.
    }
  } // UI.__MenuBtnClickHandler()

  // The following function is for creating a onclick callback for the button
  // for popping up a menu identified by the given menuIdx (index into the
  // UI.MenuBtnPanelOptionsTable).
  public static MkMenuBtnClickHandlerFcn(menuIdx:number, menuBtnId:string) {
    return (e:MouseEvent)=>UI.__MenuBtnClickHandler(e, menuIdx, menuBtnId);
    //   if (e.type!=='click') return;
    //   e.stopPropagation();
    //   let callShowPanelDialogQ = false;
    //   let callExitModalStateQ = UI.MenuBtnPanelActiveQ();

    //   if (!CWA.InModalState)        // not in a modal state
    //     callShowPanelDialogQ=true;  // => can safely display the menu.
    //   else if (callExitModalStateQ &&
    //            ButtonPanel.ShowingButtonPanel.Data('menuIdx')!==menuIdx)  // clicked on another menu btn.
    //     callShowPanelDialogQ=true;

    //   if (callExitModalStateQ) {
    //     CWA.ExitModalState(CWA.InModalState, A.MSX_None);
    //   }
    //   if (callShowPanelDialogQ) {
    //     const menuBtn = byId(menuBtnId);
    //     let x = e.pageX;
    //     let y = e.pageY;
    //     if (menuBtn && menuBtn instanceof HTMLButtonElement) {
    //       let r = menuBtn.getBoundingClientRect();
    //       x = r.left+r.width/2;
    //       y = r.top+r.height/2;
    //     }
    //     const menuHalfWidth = UI.MenuBtnPanel.DivWidth/2;
    //     const gmCanvTL = CWA.GetCanvasTopLeftPos(CWA.MainCanvas);
    //     let gmCanvX=x-gmCanvTL.left-menuHalfWidth, gmCanvY=y-gmCanvTL.top;
    //     UI.MenuBtnPanel
    //       .SetData('menuIdx', menuIdx)
    //       .ShowPanelDialog(gmCanvX*CWA.CanvasResScale, Math.max(0, gmCanvY)*CWA.CanvasResScale);  // ShowPanelDialog takes x,y coordinates in canvas pixels.
    //   }
    // };
  } // UI._MkMenuBtnClickHandlerFcn() //

  private static OnMenuBtnPanelChange(panel:ButtonPanel, _chgType:number, btnIdx:number) {
    const menuIdx = panel.Data('menuIdx');
    if (menuIdx>=0 && menuIdx<UI.MenuBtnPanelOptionsTable.length) {
      const items = UI.MenuBtnPanelOptionsTable[menuIdx].items;
      if (btnIdx>=0 && items && btnIdx<items.length) {
        let itemIdx=-1; // find the actual item index by skipping all the hidden ones.
        let nShown=0;
        for (let i=0; i<=items.length; i++) {
          if ((items[i].flags&K.MEF_Hidden)===0) {
            if (nShown===btnIdx) {
              itemIdx=i;
              break;
            }
            nShown++;
          }
        }
        if (itemIdx>=0) {
          if (CWA.InModalState===A.MS_ButtonPanelDialog)
            CWA.ExitModalState(CWA.InModalState, A.MSX_None);
          const onSelCallBack = UI.MenuBtnPanelOptionsTable[menuIdx].onSel;
          if (onSelCallBack)
            onSelCallBack(items[itemIdx].value);
          //UI.PerformMiscCmd(items[itemIdx].value);
        }
      } // if (btnIdx...
    } // if (menuIdx...
  } // UI.OnMenuBtnPanelChange() //


  //==============================================================
  //
  //  ZoomOutDiv() : perform a generic zoom out of any give div
  //
  //==============================================================
  static ZoomOutDiv(
      div:HTMLDivElement,
      startR:CRect=null,    // If null, zoom out from top left corner from size 0
      endR:CRect=null,      // If null, zoom out into fill the entire viewport size.
      onZoomedOut:()=>void=null)
  {
    if (!div) return;
    let zoomTimer=-1;
    const nTotZoomSteps=12;
    let zoomStep=nTotZoomSteps;
    if (!startR) startR = new CRect(0,0,0,0);
    if (!endR) endR = new CRect(0,0,window.innerWidth, window.innerHeight);

    // Local helper functions
    function setDivRect(r:CRect)
    {
      div.style.left  = r.l.toString()+"px";
      div.style.top   = r.t.toString()+"px";
      div.style.height= r.h.toString()+"px";
      div.style.width = r.w.toString()+"px";
    } // setDivRect()
    function interp(s:number, e:number) {
      const t=zoomStep/nTotZoomSteps;
      return s*t + e*(1-t);
    } // interp()
    function zooming()
    {
      setDivRect(new CRect(
        interp(startR.l, endR.l), interp(startR.t, endR.t),
        interp(startR.w, endR.w), interp(startR.h, endR.h)));
      zoomStep--;
      if (zoomStep>=0) window.setTimeout(zooming, 10);
      else {  // done zooming
        CWA.ExitModalState(A.MS_ZoomingDiv, A.MSX_None);
        if (onZoomedOut)
          onZoomedOut();
      } // if (zoomStep>=0) .. else ..
    } // zooming()


    setDivRect(startR);
    CWA.ShowHidePopupDiv(div, A.Show);
    CWA.EnterModalState(A.MS_ZoomingDiv);
    zooming();
  } // UI.ZoomOutDiv()


  //==============================================================
  //
  //  Polls Related UI Functions
  //
  //==============================================================
  static GetPollList()
  {
    CWA.AskAppServer("LISTPOLLS").
    then((polllist:string)=>{
      UI.PollList=[];
      let parts:string[]=null;
      let err="";
      if (polllist && (parts=polllist.match(/^(\d+),/))!==null) {
        if (+parts[1]>0) {
          const commapos=polllist.indexOf(',');
          const polls = polllist.substring(commapos+1).trim().split('\n');
          if (+polllist.substring(0,commapos)===polls.length) {
            for (let i=0; i<polls.length; i++) {
              const poll=new Poll(polls[i]);
              if (poll.ValidQ())
                UI.PollList.push(poll);
            } // for (i) //
            const timenow = new Date().getTime();
            UI.PollList.sort((p1,p2)=>{
              if (p1.ActiveQ()!==p2.ActiveQ())
                return p1.ActiveQ() ? -1 : 1;
              else
                return Math.abs(p1.activeUntil.getTime()-timenow)-Math.abs(p2.activeUntil.getTime()-timenow);
              // return p1.activeUntil>p2.activeUntil ? 1 : -1;
            });
          }
          else
            err="Inconsistent poll list from server ignored.";
        } // if (# of polls>0)...
        else {
          // no poll files available.
          CWA.SetStatusText("No polls are available.", 5000);
        }
      }
      else
        err="Unrecognized poll list format.";
      if (err) CWA.AlertBox(A.kIcon_Help, err);
    }). // then()
    catch((err:string)=>{
      CWA.SetStatusText(err);
    });
  } // GetPollList()

  static RescanPollListVotedStatus() {
    for (let i=0; i<UI.PollList.length; i++) {
      UI.PollList[i].ScanVotedStatus();
    } // for (i)
  } // RescanPollListVotedStatus()

  static ShowPollPicker()
  {
    let npolls = UI.PollList.length;
    if (npolls>0) {
      const div = UI.PollListDiv; // the grid container div for the poll buttons.
      if (div) {
        // remove all old poll-list buttons
        while (div.firstChild) div.removeChild(div.lastChild);
        // const r = UI.PollsBtn ? UI.PollsBtn.getBoundingClientRect(): null;
        // const startR = r ? new CRect(r) : null;
        // UI.ZoomOutDiv(UI.PollPickerDlgDiv, new CRect(r),

        CWA.EnterModalState(A.MS_PickingPoll);
        div.style.display="grid";
        for (let i=0; i<npolls; i++) {
          const btn=document.createElement("button") as HTMLButtonElement;
          btn.innerHTML = UI.PollList[i].title + (UI.PollList[i].ActiveQ() ? "" : " (ended)");
          btn.className="pickListItemBtn";
          btn.id="poll_"+UI.PollList[i].id;
          btn.addEventListener('click', (e:MouseEvent)=>{
            if (CWA.InModalState===A.MS_PickingPoll) {
              if (e && e.currentTarget instanceof HTMLButtonElement) {
                const btn=e.currentTarget as HTMLButtonElement;
                UI.DismissPollPicker(btn.id);
              }
              else // ??? what is e then? close the dialog anyway.
                CWA.ExitModalState(CWA.InModalState, A.MSX_None);
            }
          }); // ()=>{...}
          div.appendChild(btn);
        }
      } // if (div)
    } // if (npolls)
  } // ShowPollPicker() //

  static DismissPollPicker(pollid:string)
  {
    if (CWA.InModalState===A.MS_PickingPoll) {
      CWA.ExitModalState(CWA.InModalState, A.MSX_None);
      if (pollid && UI.PollList && UI.PollViewDlgDiv && UI.PollChoicesDiv) {
        for (let i=0; i<UI.PollList.length; i++) {
          if ("poll_"+UI.PollList[i].id===pollid) {
            UI.PollList[i].OpenPollViewDialog();
            break;
          }
        }
        // CWA.AlertBox(A.kIcon_3HorzDots, "Should open poll "+pollid);
      } // if (pollid)
    }
  } // DismissPollPicker()

  static DismissPollView(_choice: number) {
    if (CWA.InModalState===A.MS_ViewingPoll) {
      // CWA.ExitModalState(CWA.InModalState);
      UI.ViewingPoll.CastVote(_choice);
    }
  } // DismissPollView() //


  //********************************************************************
  //
  //  Calendar Dialog
  //
  //********************************************************************
  static CalcCalendarDlgRect(): CRect
  {
    const vh=window.innerHeight;
    const vw=window.innerWidth;
    let h = Math.min(600, vh - 30 - 4);
    let w = Math.min(600, vw - 8);
    return new CRect((vw-w)/2, 4, w, h);
  } // CalcCalendarDlgRect()

  static CalendarDialog(pickDateCallback:(y:number, m11:number, d:number)=>void=null)
  {
    if (UI.CalDialogDiv && UI.CalGridDiv && !SRQ.BusyQ()) {
      const r = UI.CalendarBtn ? UI.CalendarBtn.getBoundingClientRect() : null;
      // const startR = r ? new CRect(r.left, r.top, r.width, r.height) : null;

      const div = UI.CalGridDiv;
      while (div.lastChild) div.removeChild(div.lastChild);  // remove everything first.

      let __showcaldiv=()=>{
        const today=new Date();
        UI.CalShowingYear =today.getFullYear();
        UI.CalShowingMonth=today.getMonth();
        UI.CalSelDay=-1;
        UI.FillCalendarGrid(today.getFullYear(), UI.CalShowingMonth);
        CWA.EnterModalState(A.MS_ShowingCal);
      };

      UI.CalSelectDayAltAction = pickDateCallback;
      if (pickDateCallback)
        __showcaldiv();
      else {
        UI.ZoomOutDiv(UI.CalDialogDiv, new CRect(r), // CRect constructor will take care of r===null case.
                      UI.CalcCalendarDlgRect(), __showcaldiv);
      }
    }
  } // CalendarDialog()

  static DismissCalendarDialog(_action:number)
  {
    if (CWA.InModalState===A.MS_ShowingCal) {
      CWA.ExitModalState(CWA.InModalState, A.MSX_Cancel);
    }
  } // DismissCalendarDialog()

  static NDaysInMonth(year:number, month0_11:number)
  {
    return new Date(year, month0_11+1, 0).getDate();
  } // NDaysInMonth() //

  static MonthText:string[]=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  static CalChangeMonth(prevornext:number) {
    let changed=false;
    if (UI.CalShowingMonth===0 && prevornext<0) {
      // if (UI.CalShowingYear>=2022) {
        UI.CalShowingYear--;
        UI.CalShowingMonth=11;
        changed=true;
      // }
    }
    else if (UI.CalShowingMonth===11 && prevornext>0) {
      // if (UI.CalShowingYear<=2022) {
        UI.CalShowingYear++;
        UI.CalShowingMonth=0;
        changed=true;
      // }
    }
    else {
      UI.CalShowingMonth+= (prevornext>0 ? 1 : -1);
      changed=true;
    }
    if (changed) {
      UI.CalSelDay=-1;
      if (UI.CalEditDayBtn) UI.CalEditDayBtn.disabled=true;
      UI.FillCalendarGrid(UI.CalShowingYear, UI.CalShowingMonth);
      CWA.UpdateStatusBar();
    }
  } //UI.CalChangeMonth()

  static UpdateSelDay() {
    const div = UI.CalGridDiv;
    if (!UI.CalDialogDiv ||!div) return;

    if (UI.CalEditDayBtn) {
      UI.CalEditDayBtn.disabled=
        !CWA.UserValidatedQ ||  // user has not been validated yet => cannot edit.
        UI.CalSelDay<=0;        // no day has been selected.
    }

    const year = UI.CalShowingYear;
    const month0_11 = UI.CalShowingMonth;
    const day1 = new Date(year, month0_11, 1);
    const wkday = day1.getDay(); // 0 to 6
    const daydivs = div.childNodes;
    let idx = wkday;
    const ndaysInMonth = UI.NDaysInMonth(year, month0_11);
    for (let d=0; d<ndaysInMonth && idx<daydivs.length; d++,idx++) {
      if (d===UI.CalSelDay-1)
        CWA.AddClass(daydivs.item(idx) as HTMLElement, "calDaySel");
      else
        CWA.RemoveClass(daydivs.item(idx) as HTMLElement, "calDaySel");
    }
  } // UI.UpdateSelDay()

  static CalcEventViewDivRect()
  {
    if (UI.CalEventViewDiv) {
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      let minw=240,maxw=350,minh=240,maxh=Math.min(vh-38,350);
      if (vw>vh) // landscape mode
      {
        minw=300,maxw=400;
        minh=200,maxh=Math.min(vh-38, 350);
      }

      const w = Math.max(minw,Math.min(maxw,vw*0.7));
      const h = Math.max(minh,Math.min(maxh,vh*0.7));
      return new CRect((vw-w)/2, (vh-38-h)/4, w, h);
    }
    return null;
  } // UI.CalcEventViewDivRect()

  static CalSelectDayAltAction:(y:number, m11:number, d:number)=>void=null;
  static CalSelectDay(e:Event, day:number, evtTypeBits:number) {
    const seldaysave = UI.CalSelDay;
    if (day>0 && day<=UI.NDaysInMonth(UI.CalShowingYear, UI.CalShowingMonth))
      UI.CalSelDay=day;
    else
      UI.CalSelDay=-1;

    const clickedOnSelDayQ = (seldaysave===UI.CalSelDay);
    if (!clickedOnSelDayQ) UI.UpdateSelDay();

    if (CWA.InModalState===A.MS_ShowingCal) {
      if (UI.CalSelectDayAltAction) {
        UI.CalSelectDayAltAction(UI.CalShowingYear, UI.CalShowingMonth, day);
      }
      else {
        const evt=CalEvent.GetEvent(UI.CalShowingYear, UI.CalShowingMonth, UI.CalSelDay);
        // See we should bring up the EventView now
        if (evt.length              // (1) There must be 1 or more events in this day.
        && (clickedOnSelDayQ ||    // (2) either the day has already been selected before
            !CWA.UserValidatedQ))  //  or user is not signed in so there is no need to give a chance for the edit-event button.
        {
          let startR = null;
          let daybox:HTMLDivElement=null;
          if (e.currentTarget && e.currentTarget instanceof HTMLDivElement) {
            daybox=e.currentTarget as HTMLDivElement;
            const r = daybox.getBoundingClientRect();
            startR = new CRect(r.left, r.top, r.width, r.height);
          }
          if (!startR) startR=new CRect(0,0,0,0);

          const endR = UI.CalcEventViewDivRect();
          const div=UI.CalEventViewDiv;
          while (div.firstChild) div.removeChild(div.lastChild); // clear its contents to the zooming cleaner.
          div.className="calEventView";
          for (let t=0; t<K.ET_MaxEvType; t++) {
            if ((1<<t)&evtTypeBits) CWA.AddClass(div, "calEvType"+t);  // set the colors
          } // for (t)

          let allDesc='';
          for (let i=0; i<evt.length; i++) {
            const html = '<hr>' + UI.MD2Html('<span class="evViewIcn">'+evt[i].Icon+'</span>&nbsp;\n'+evt[i].Desc+'\n\n');
            // allDesc+='<p><span class="evViewIcn">'+evt[i].Icon+'</span>&nbsp;'+html+'</p>\n';
            allDesc+=html;
          }

          UI.ZoomOutDiv(div, startR, endR, ()=>{
              div.__UIAdjSizeFcn(UI.CalEventViewDiv);
              const txt="<evdate>"+UI.CalShowingYear+" "+UI.MonthText[UI.CalShowingMonth]+" "+UI.CalSelDay+":</evdate>"+allDesc;
              div.innerHTML = txt;
              CWA.Typeset(div);
              CWA.EnterModalState(A.MS_ViewingEvent);
              // CWA.ShowHidePopupDiv(div, A.Show);
            }
          );
        } // if (evt.length...
      } // if (CalSelectDayAltAction) .. else .. //
    } // if (MS_ShowingCal
  } // UI.CalSelectDay()

  static CloseCalEventView(msx_action:number)
  {
    if (CWA.InModalState===A.MS_ViewingEvent) {
      CWA.ExitModalState(CWA.InModalState, msx_action);
      // CWA.ShowHidePopupDiv(UI.CalEventViewDiv, A.Hide);
    }
  } // UI.CloseCalEventView()

  static FillCalendarGrid(year:number, month0_11:number)
  {
    UI.CalMonthHasNEvents=0;
    const div = UI.CalGridDiv;
    if (!UI.CalDialogDiv ||!div) return;

    while (div.lastChild) div.removeChild(div.lastChild);  // remove everything first.

    const today = new Date();
    const isThisMonthQ = today.getFullYear()===year && today.getMonth()===month0_11;
    const todayDay=today.getDate();
    const pastMonthQ = !isThisMonthQ &&
    (today.getFullYear()>year ||
     (today.getFullYear()===year && today.getMonth()>month0_11)
    );

    const day1 = new Date(year, month0_11, 1);
    const day1wkday = day1.getDay(); // 0 to 6

    let nrows =1;

    let wkday=0;
    // pad some empty divs for the weekdays before 1st of the month.
    for (; wkday<day1wkday; wkday++) {
      const daydiv = document.createElement("div") as HTMLDivElement;
      daydiv.onclick=UI.ClickOnCalBkgd;
      div.appendChild(daydiv);
    } // for (wkday)

    let nevents=0;
    const ndaysInMonth = UI.NDaysInMonth(year, month0_11);
    for (let d=1; d<=ndaysInMonth; d++) {
      const pastDayQ = pastMonthQ || (isThisMonthQ && d<todayDay);
      const daydiv = document.createElement("div") as HTMLDivElement;
      // const daydiv = document.createElement("button") as HTMLButtonElement;
      CWA.AddClass(daydiv, "calDayDiv");

      if (isThisMonthQ && todayDay===d) CWA.AddClass(daydiv, "calToday");
      else if (pastDayQ) CWA.AddClass(daydiv, "calPastDay");

      if (wkday===0 || wkday===6) CWA.AddClass(daydiv, "calWeekend");

      if (year===UI.CalShowingYear
      &&  month0_11===UI.CalShowingMonth
      &&  d===UI.CalSelDay) CWA.AddClass(daydiv, "calDaySel");

      daydiv.innerHTML = d.toString();
      let allTypeBits=0;
      const event = CalEvent.GetEvent(year,month0_11, d);
      if (event) {
        let shownIcons=0;
        let allIcons:string='';
        for (let i=0; i<event.length; i++) {
          const typeBit=(1<<event[i].Type);
          allTypeBits|=typeBit;
          if (!(shownIcons&typeBit)) {
            allIcons+='<div class="calEventIcn">'+event[i].Icon+'</div>';
            shownIcons|=typeBit;
            CWA.AddClass(daydiv, "calEvType"+event[i].Type);
          }
        }
        const icn = document.createElement("span") as HTMLElement;
        // CWA.AddClass(icn, "calEventIcn");
        icn.innerHTML = allIcons;
        daydiv.appendChild(icn);
        // if (event.type!==3) nevents++;
        if (allTypeBits>1) nevents++;
      }
      daydiv.addEventListener("click", (e:Event)=>{
        if (CWA.InModalState===A.MS_ShowingCal)
          UI.CalSelectDay(e,d,allTypeBits);
      });
      div.appendChild(daydiv);

      if (d>1 && wkday===0) nrows++;  // Must exclude d===1 and wkday===0 case o.w. an extra row will be counted.

      wkday = (wkday+1)%7;
    } // for (d)

    if (wkday>0) {  // The bottom week row is not fully filled?
      // Pad/fill-up the bottom row with extra blank boxes.
      for (;wkday!==7; wkday++) {
        const daydiv = document.createElement("div") as HTMLDivElement;
        daydiv.onclick=UI.ClickOnCalBkgd;
        div.appendChild(daydiv);
      }
    }

    // Hacky hacky: set the "gridTemplateRows" style to equal sized % based on nrows.
    const gridContainer = byId('calendarDiv') as HTMLElement;
    if (gridContainer) {
      let tmpl="";
      for (let i=0; i<nrows; i++) {
        tmpl+=(100/nrows).toFixed(2)+'% ';
      }
      gridContainer.style.gridTemplateRows=tmpl.trim();
    } // if (gridContainer)

    // Set up the Year-Month text at the top of the dialog.
    const monthTxt = byId('calShowMonTxt') as HTMLElement;
    if (monthTxt) {
      monthTxt.onclick=UI.ClickOnCalBkgd;
      if (isThisMonthQ) CWA.AddClass(monthTxt, 'calThisMonth');
      else CWA.RemoveClass(monthTxt, 'calThisMonth');
      if (pastMonthQ) CWA.AddClass(monthTxt, 'calPastMonth');
      else CWA.RemoveClass(monthTxt, 'calPastMonth');
      monthTxt.innerHTML = year.toString() + ' ' + UI.MonthText[month0_11];
    }

    UI.CalMonthHasNEvents=nevents;
    if (UI.CalEditDayBtn)
      UI.CalEditDayBtn.disabled=UI.CalSelDay<=0;
  } // UI.FillCalendarGrid()

  static ClickOnCalBkgd(_e:MouseEvent) // deselect any selected day boxes.
  {
    if (CWA.InModalState===A.MS_ShowingCal) {
      UI.CalSelDay=-1;
      UI.UpdateSelDay();
    }
  } // UI.ClickOnCalBkgd()

  static EditCalSelDay()
  {
    if (UI.CalEvPickerDlgDiv && UI.CalEvPickerDateTxt && UI.CalSelDay>0 && UI.CalShowingYear>0 && UI.CalShowingMonth>=0 &&
        UI.CalEvRmEvBtn!==null && UI.CalEvCommitChgsBtn!==null &&
        UI.CalEvEvSel!==null && UI.CalEvIconSel!==null && UI.CalEvDescBox!==null
      )
    {
      CWA.EnterModalState(K.MS_PickingCalEvent);
      if (UI.CalEvPickerDateTxt) UI.CalEvPickerDateTxt.innerHTML=UI.CalShowingYear.toString()+'-'+UI.MonthText[UI.CalShowingMonth]+'-'+UI.CalSelDay;
      UI.CalEvRmEvBtn.disabled=true;
      UI.CalEvCommitChgsBtn.disabled=true;
      // populate the list
      const dayEvs = CalEvent.GetEvent(UI.CalShowingYear, UI.CalShowingMonth, UI.CalSelDay);
      let optlist:{label:string, value:string}[]=[];
      const evs:CalEvent[]=(UI.CalSelDayEvs=[]);
      const evsCopy:CalEvent[]=(UI.CalSelDayEvCopy=[]);
      for (let i=0; i<dayEvs.length; i++) {
        if (dayEvs[i].UserCanEditQ)
        {
          optlist.push({label:dayEvs[i].MkShortTitle(36), value:i.toString()});
          evsCopy.push(dayEvs[i].Duplicate());
          evs.push(dayEvs[i]);
        }
      }
      optlist.push({label:"- Add a New Event -", value:"new"});
      evsCopy.push(new CalEvent(CalEvent.MkDateStr(UI.CalShowingYear, UI.CalShowingMonth, UI.CalSelDay), '',
        -1, CWA.UserHash(CWA.UserId), CWA.UserLevel, K.ET_Reminder, ''));
      CWA.SetupSelectOptions(UI.CalEvEvSel,optlist, 0);
      UI.OnCalEvEvSelChange(0);
      // if (dayEvs.length) {
      //   UI.CalEvIconSel.selectedIndex=K.ET_MaxEvType-dayEvs[0].Type;
      //   UI.CalEvDescBox.value=dayEvs[0].Desc;
      // }
    } // if (UI.CalEvPickerDlgDiv)
  } // UI.EditCalSelDay()

  static OnCalEvEvSelChange(selidx:number)
  {
    const evs:CalEvent[]=UI.CalSelDayEvCopy;
    if (selidx<evs.length) {
      const canEditQ=evs[selidx].UserCanEditQ;
      UI.CalEvDescBox.value = evs[selidx].Desc;
      UI.CalEvIconSel.selectedIndex=K.ET_MaxEvType-evs[selidx].Type;
      UI.CalEvIconSel.disabled=!canEditQ;
      UI.CalEvRmEvBtn.disabled= evs[selidx].Id<=0 || !canEditQ;     // Id<=0 means the new-event record
      UI.CalEvDescBox.disabled=!canEditQ;
    }
  } // UI.OnCalEvEvSelChange()

  static CloseEvPicker(_msxaction: number)
  {
    if (CWA.InModalState===K.MS_PickingCalEvent) {
      if (UI.CalEvsModifiedQ()) {
        CWA.GenericQuery(A.kIcon_Help, "Abandon All Changes?",
          "You have made some changes to the event records for "+
          CalEvent.MkDateStr(UI.CalShowingYear, UI.CalShowingMonth, UI.CalSelDay)+".<br>"+
          "Are you sure you would like to abandon all your changes?",
          (ans:number)=>{if (ans===A.AnsYes) CWA.ExitModalState(CWA.InModalState, A.MSX_None);},
          A.GQ_YesNo);
      }
      else {
        CWA.ExitModalState(CWA.InModalState, A.MSX_None);
      }
    }
  } // UI.CloseEvPicker()

  static CalEvsModifiedQ(diffs:number[]=null):boolean
  {
    let modQ=false;
    const evs = UI.CalSelDayEvs;
    const evsCopy = UI.CalSelDayEvCopy;
    if (diffs) diffs.length=0;
    if (evsCopy.length) { // there should be at least one (new event) object in the evsCopy array.
      for (let i=0; i<evs.length && (diffs!==null || !modQ); i++) {
        if (evs[i].DiffQ(evsCopy[i])) {
          modQ=true;
          if (diffs) diffs.push(i);
        }
      }
      // Now check whether the "new event" CalEvent has been modified.
      if (diffs!==null || !modQ) {
        const newev = evsCopy[evsCopy.length-1];
        if (newev.Desc.trim()!=='') {
          modQ=true;
          if (diffs) diffs.push(evs.length);
        }
      }
    }
    return modQ;
  } // UI.CalEvsModifiedQ()

  static RefreshCalEvents()
  {
    while (CWA.InModalState===K.MS_PickingCalEvent || CWA.InModalState===A.MS_ViewingEvent)
      CWA.ExitModalState(CWA.InModalState, A.MSX_None);

    CalEvent.GetEventListFromServer((ok:boolean)=>{
      if (ok && CWA.InModalState===A.MS_ShowingCal) {
        UI.FillCalendarGrid(UI.CalShowingYear, UI.CalShowingMonth);

      }
    });
  } // UI.RefreshCalEvents()

  static EvtChgRecursiveAskAppServer(modidx:number[])
  {
    if (modidx && modidx.length) {
      let idx=modidx.pop();
      const evsCopy=UI.CalSelDayEvCopy;
      const evs=UI.CalSelDayEvs;
      let data:{[key:string]:string} = {};
      const reqtype = idx<evs.length ? 'CHGEVT' : 'ADDEVT';
      data['EvId']=reqtype==='CHGEVT' ? evs[idx].Id.toString() : '-1'; // use -1 if we are creating a new event.
      data['EvType']=evsCopy[idx].Type.toString();
      data['EvDate']=CalEvent.MkDateStr(UI.CalShowingYear, UI.CalShowingMonth, UI.CalSelDay);
      if (idx<evs.length) data['EvTime']=evs[idx].Time;
      data['EvDesc']=encodeURIComponent(evsCopy[idx].Desc.trim());

      CWA.ShowHideProgressSpinner(A.Show);
      CWA.AskAppServer(reqtype, CWA.UserId, CWA.PassHash, data).
      then((_result:string)=>{
        if (modidx && modidx.length) { // there are more changes to commit.
          // Set a 0-ms timer to call ourselve on next event cycle.
          window.setTimeout(()=>UI.EvtChgRecursiveAskAppServer(modidx), 0);
        }
        else { // done
          UI.RefreshCalEvents();
        }
        CWA.ShowHideProgressSpinner(A.Hide);
      }).
      catch((err:string)=>{
        CWA.AlertBox(A.kIcon_Error, err);
        CWA.ShowHideProgressSpinner(A.Hide);
      });
    } // if (modidx && modidx.length)
  } // UI.EvtChgRecursiveAskAppServer()

  static CalDayEventOp(op:number)
  {
    if (op===1) // commit changes
    {
      const evsCopy=UI.CalSelDayEvCopy;
      // const evs=UI.CalSelDayEvs;
      if (evsCopy.length) {
        let diffs:number[]=[];
        if (UI.CalEvsModifiedQ(diffs)) {
          UI.EvtChgRecursiveAskAppServer(diffs);
        }
      }
      // CWA.AlertBox(A.kIcon_Help,
      //   UI.CalEvsModifiedQ() ?
      //       "Commiting changes."
      //     : "Nothing to commit!");
    }
    else if (op===-1)
    {
      if (UI.CalEvEvSel.selectedIndex<UI.CalSelDayEvCopy.length) {
        const currEv = UI.CalSelDayEvCopy[UI.CalEvEvSel.selectedIndex];
        if (currEv.UserCanEditQ)
        {
          if (currEv.Id>0) {
            CWA.GenericQuery(A.kIcon_Warning, "Confirm Delete",
              "Do you want to permanently delete the event?",
              (ans:number)=>{
                if (ans===A.AnsOK) {
                  let req:{[key:string]:string} = {};
                  req['EvId']=currEv.Id.toString();
                  CWA.AskAppServer('RMEVT', CWA.UserId, CWA.PassHash, req).
                  then((_data:string)=>{
                    UI.RefreshCalEvents();
                  }).
                  catch((err:string)=>{
                    CWA.AlertBox(A.kIcon_Error, err);
                  });
                }
              }, A.GQ_OKCancel
            );
          }
          else
            UI.CloseEvPicker(A.MSX_Cancel);
        }
      }
    }
  } // UI.CalDayEventOp() //

  static CalEvUpdate(ele: HTMLSelectElement|HTMLTextAreaElement)
  {
    if (UI.CalEvEvSel.selectedIndex<UI.CalSelDayEvCopy.length) {
      const currEv = UI.CalSelDayEvCopy[UI.CalEvEvSel.selectedIndex];
      if (ele===UI.CalEvIconSel) {
        currEv.SetType(K.ET_MaxEvType - UI.CalEvIconSel.selectedIndex);
      }
      else if (ele===UI.CalEvDescBox) {
        if (UI.CalEvDescBox.value.length > K.kEventDescMaxSize) {
          UI.CalEvDescBox.value=UI.CalEvDescBox.value.substring(0, K.kEventDescMaxSize-1);
          CWA.AlertBox(A.kIcon_Warning, "Event description too long. Truncated.");
        }
        currEv.SetDesc(UI.CalEvDescBox.value);
      }
      UI.CalEvCommitChgsBtn.disabled=!UI.CalEvsModifiedQ();
    }
  } // UI.CalEvUpdate()

  static OnCalEvIconSelChange(e:Event)
  {
    if (e && e.target instanceof HTMLSelectElement) {
      UI.CalEvUpdate(e.target);
    }
  } // UI.OnCalEvIconSelChange()


  //********************************************************************
  //
  //  News Dialog
  //
  //********************************************************************
  static CalcNewsDlgRect(): CRect
  {
    const vh=window.innerHeight;
    const vw=window.innerWidth;
    let h = vh-38;
    let w = vw;
    return new CRect(0, 0, w, h);
  } // CalcNewsDlgRect()

  private static _NewsDialog_ZoomedAndDataReadyFlags=0;  // 1:data-ready  2:zoomed  4:data-error
  private static _NewsDialog_RawData='';

  static NewsDialog()
  {
    // Helper function for finally populating the news div after
    // - the server returns the list of available articles;
    // - the dialog is zoomed out completely.

    function __updateMaxHeight()
    {
      let inps = document.getElementsByName("expandBox");
      for (let i=0; i<inps.length; i++) {
        if (inps[i] && inps[i] instanceof HTMLInputElement) {
          const chkbox = inps[i] as HTMLInputElement;
          const content = inps[i].nextElementSibling.nextElementSibling as HTMLDivElement;
          if (content && content instanceof HTMLElement && content.className==="content") {
            content.style.maxHeight = chkbox.checked ? content.scrollHeight+"px" : "0px";
          }
        }
      }
    } // __updateMaxHeight()

    function __buildNewsAndShow() {
      UI.BuildNewsList(UI._NewsDialog_RawData);
      CWA.Typeset(UI.NewsDialogDiv, __updateMaxHeight);
      if (CWA.InModalState!==A.MS_ShowingNews) CWA.EnterModalState(A.MS_ShowingNews);
    } // __buildNewsAndShow()

    if (UI.NewsDialogDiv && !CWA.InModalState && !SRQ.BusyQ()) {
      const r = UI.NewsBtn ? UI.NewsBtn.getBoundingClientRect() : null;
      const startR = r ? new CRect(r.left, r.top, r.width, r.height) : new CRect(0,0,0,0);

      UI._NewsDialog_ZoomedAndDataReadyFlags=0;

      // Kick start 2 separate async actions:

      // (1) Request the latest list of news articles from the server
      CWA.AskAppServer('GETNEWS', CWA.UserId, CWA.PassHash).
      then((data:string)=>{
        UI._NewsDialog_RawData=data;
        UI._NewsDialog_ZoomedAndDataReadyFlags|=1;
        if (UI._NewsDialog_ZoomedAndDataReadyFlags===3) { // both zoom and data ready.
          __buildNewsAndShow();
        }
      }).
      catch((err:string)=>{
        UI._NewsDialog_ZoomedAndDataReadyFlags|=4;
        UI._NewsDialog_RawData=err;
      });

      // (2) Zoomout the news dialog div from the button position.
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      UI.NewsDialogDiv.innerHTML="";
      UI.ZoomOutDiv(UI.NewsDialogDiv, startR, new CRect(0,0,vw,vh-35),
        ()=>{
          const nr = UI.CalcNewsDlgRect();
          UI.NewsDialogDiv.style.width=nr.w.toString()+"px"; //"calc(100vw - 1px)";
          UI.NewsDialogDiv.style.height=nr.h.toString()+"px"; //"calc(100vh - 38px)";

          // const viewport = document.querySelector("meta[name=viewport]");
          // viewport.setAttribute('content',
          //   "width=device-width, height=device-height, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes"
          // // 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes'
          // );
          UI._NewsDialog_ZoomedAndDataReadyFlags|=2;
          if (UI._NewsDialog_ZoomedAndDataReadyFlags>2) {
            if (UI._NewsDialog_ZoomedAndDataReadyFlags&4) {  // data error
              CWA.ShowHidePopupDiv(UI.NewsDialogDiv, A.Hide);
              CWA.AlertBox(A.kIcon_Error, UI._NewsDialog_RawData);
            }
            else
              __buildNewsAndShow();
          }
        }
      );
      // CWA.ShowHidePopupDiv(UI.NewsDialogDiv, A.Show);
      // UI.BuildNewsList();
      // CWA.Typeset();
      // CWA.EnterModalState(A.MS_ShowingNews);
    }
  } // NewsDialog() //

  static DismissNewsDialog(_action:number) {
    if (CWA.InModalState===A.MS_ShowingNews) {
      // const viewport = document.querySelector("meta[name=viewport]");
      // viewport.setAttribute('content',
      //   "width=device-width, height=device-height, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
      //   // 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes'
      // );
      // const viewport = document.querySelector("meta[name=viewport]");
      // viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');

      CWA.ExitModalState(A.MS_ShowingNews, A.MSX_None);
      // CWA.ShowHidePopupDiv(UI.NewsDialogDiv, A.Hide);
    }
  } // DismissNewsDialog()

  static ArtData2Article(artdata:string) : Article
  {
    let art:Article=null;
    const fndata=artdata.match(/^([^=]+)\=(.+)$/);
    if (fndata && fndata.length===3) {
      const fnparts = decodeURIComponent(fndata[1]).trim().match(/^news_(\d+)\.\w+$/);
      const newsdata = decodeURIComponent(fndata[2]);
      const newsparts=newsdata.split("|");
      if (newsparts.length===3 && fnparts.length===2) {
        const hdr=newsparts[0].split(',');
        art =new Article(
          decodeURIComponent(newsparts[1]), // headline
          decodeURIComponent(newsparts[2]), // body
          +fnparts[1],  // sort code is the number following news_ in the filename
          hdr[0],       // expiration date.
          hdr[1],       // article type (for setting the icon etc)
          hdr[2]);      // author info (level user hash etc)
      }
    }
    return art;
  } // UI.ArtData2Article()

  static GetNewsArticles(rawdata:string): Article[]
  {
    let arts:Article[]=[
      new Article(
        "Math Club Portal Up And Running",
        "Please check out our new MSS Math Club web site!"+
        "<p>If you can read this news article, you already knew the URL.</p>"+
        "<p>The web site will allow members to access shared Math articles and documents, "+
        "club news and other interactive demos and anonymous polls without complicated "+
        'Gapps sign-in procedures.</p><p>All `obrace("Members")^("past or present")` are welcome!</p>'
      )
    ];
    let p=rawdata.match(/^(\d+),(.+)$/);
    if (p!==null && p.length===3) {
      const narts = +p[1];
      const artdata = p[2].split('|');
      if (artdata.length!==narts) {
        CWA.AlertBox(A.kIcon_Error,
          "Internal error. Inconsistent news data received from server. ("+
          narts+"/"+artdata.length+")"
        );
      }
      else {

        for (let i=0; i<narts; i++) {
          const art = UI.ArtData2Article(artdata[i]);
          if (art) arts.push(art);
        } // for (i)
      }
    }
    arts.sort((a,b)=>b.sortId-a.sortId);
    return arts;
  } // UI.GetNewsArticles()

  static BuildNewsList(rawdata:string)
  {
    const div = UI.NewsDialogDiv;
    if (!div) return;
    div.innerHTML =
    '<button id="btnCloseNews" title="Close Club News" class="appBtn">'+
    '<div class="appBtnIcn">&#xe5cd;</div></button>'+
    '<h1>News & Announcements</h1>';
    const arts = UI.GetNewsArticles(rawdata);

    for (let i=0; i<arts.length; i++) {
      div.appendChild(arts[i].MkCollapsableDiv(i===0));   // expand the first article.
    }

    CWA.SetupButton("btnCloseNews",()=>{UI.DismissNewsDialog(0);});
    // updateMaxHeight();
  } // UI.BuildNewsList()



  static OnNewsArtExpandBoxClick(e:Event) {
    function updateMaxHeight()
    {
      let inps = document.getElementsByName("expandBox");
      for (let i=0; i<inps.length; i++) {
        if (inps[i] && inps[i] instanceof HTMLInputElement) {
          const chkbox = inps[i] as HTMLInputElement;
          const content = inps[i].nextElementSibling.nextElementSibling as HTMLDivElement;
          if (content && content instanceof HTMLElement && content.className==="content") {
            content.style.maxHeight = chkbox.checked ? content.scrollHeight+"px" : "0px";
          }
        }
      }
    }
    if (e && e.target instanceof HTMLInputElement) {
      let tgt = e.target;
      if (tgt.checked) {
        let inps = document.getElementsByName("expandBox");
        for (let i=0; i<inps.length; i++) {
          const inputi = inps[i] as HTMLInputElement;
          if (inputi!==tgt && inputi instanceof HTMLInputElement && inputi.type==="checkbox") {
            inputi.checked=false;
          }
        }
      }
      updateMaxHeight();
    }
  } // UI.OnNewsArtExpandBoxClick


  static ProcessLocalFileData(fn:string, data: string)
  {
    // if (fn.match(/\.csv$/i)) {
    //   const lines=data.split(/\r?\n\r?/);
    //   let users:{id:string, pwd:string}[]=[];
    //   let s='';
    //   let lastu=null;
    //   for (let l=1; l<lines.length; l++) {
    //     const fields = lines[l].split(',');
    //     if (fields[1] && fields[3] && fields[fields.length-1]) {
    //       const at = fields[fields.length-1].indexOf('@');
    //       const u={id:(fields[1].trim()+fields[3].trim()[0]).toLowerCase(),
    //         pwd:fields[fields.length-1].substring(0,at).trim()};
    //       const sl=u.id.indexOf('/');
    //       if (sl>0) u.id=u.id.substring(sl+1);
    //       if (!lastu) {
    //         lastu=u;
    //         users.push(u);
    //         s+='('+u.id+'|'+u.pwd+')\n';
    //       }
    //       else if (u.pwd!==lastu.pwd) {
    //         if (u.id===lastu.id) {
    //           u.id+='22';
    //         }
    //         lastu=u;
    //         users.push(u);
    //         s+='('+u.id+'|'+u.pwd+')\n';
    //       }
    //     }
    //   } // for (l)
    //   CWA.MessageBox(s);
    //   for (let i=0; i<users.length; i++) {
    //     let dict:{[key:string]:string} = {};
    //     let usr2='';
    //     let pwd2='';
    //     dict["U2"]=CWA.UserHash(usr2=users[i].id);
    //     dict["P2"]=CWA.PwdHash(pwd2=users[i].pwd);
    //     dict["P1P"]="eb94b52f006465526f14397c73fdeed3";
    //     CWA.AskAppServer('NEWUSR', CWA.UserId, CWA.PassHash, dict).
    //     then((_r:string)=>{
    //       CWA.AlertBox(A.kIcon_Info, _r);
    //     }).
    //     catch((err:string)=>{
    //       CWA.AlertBox(A.kIcon_Info, err);
    //       CWA.SetStatusText(err);
    //     });
    //   }
    // }
    // else
      CWA.MessageBox(fn+'<br>'+data);
  } // ProcessLocalFileData()

  static _UploadDest:string='';
  static ProcessPickedFiles(_e:Event)
  {
    if (UI.FileInput && UI.FileInput.files && CWA.UserValidatedQ && CWA.UserLevel>1) {
      const nfiles = UI.FileInput.files.length;

      if (nfiles > 0 ) {
        let data:SRQData={};
        data['docFiles[]']=UI.FileInput.files;  // Note this really weird FormData key with []... JS is such a hacky language.
        data['DestDir']=UI._UploadDest;

        // let formData = new FormData();
        let totalSz = 0;
        // Read selected files
        for (let i=0; i<nfiles; i++) {
          totalSz+=UI.FileInput.files[i].size;
          // formData.append("files[]", UI.FileInput.files[i]);
        } // for (i)
        if (totalSz>K.kMaxTotalUploadSize) {
          CWA.AlertBox(A.kIcon_Info,
            "Total size:"+Math.floor(totalSz/1000000+0.5)+"M exceeded "+
            Math.floor(K.kMaxTotalUploadSize/1000000+0.5)+"M limit per upload request.");
        }
        else {
          CWA.AskAppServer('UPLOAD', CWA.UserId, CWA.PassHash, data).
          then((result:string)=>{
            CWA.GenericQuery(A.kIcon_Info, "Upload Successful", result, ()=>{
              if (CWA.InModalState===K.MS_PickingItem) {  // if there is an unlying item picker dialog showing...
                UI.DisplayDocPicker(-1, false); // refresh the document list.
              }
            },A.GQ_OK);
          }).
          catch((err:string)=>{
            CWA.AlertBox(A.kIcon_Error, err);
          });
        }
      }
    }
    // Process the file content on the client side directly.
    // if (UI.FileInput && UI.FileInput.value) {
    //   const filename = UI.FileInput.value.replace(/.*[\/\\]/, "");
    //   const file=UI.FileInput.files[0];
    //   if (file) {
    //     let reader = new FileReader();
    //     reader.onload=(ee)=>{
    //       let reader: FileReader = ee.target as FileReader;
    //       UI.ProcessLocalFileData(filename, reader.result as string);
    //     };
    //     reader.readAsText(file);
    //   }
    // }
    if (CWA.InModalState===K.MS_PickingFile)
      CWA.ExitModalState(CWA.InModalState, A.MSX_None);
  } // UI.ProcessPickedFiles()


  // Each server destination accepts different file types.
  static DestFileTypes:{[k:string]:string}={
    'solve':'.pdf,.txt,.xhtml,.html',
    'talks':'.pdf',
    'figs' :'.jpg,.jpeg,.png,.svg',
    'misc' :'.pdf,.txt,.xhtml,.html,.jpg,.jpeg,.png,.svg',
  };
  static OnUploadDestSelChange(e:Event)
  {
    if (e && e.target===UI.FileDestSel) {
      UI._UploadDest=UI.FileDestSel.value;
      if (UI._UploadDest && UI.FileInput) {
        const exts= UI.DestFileTypes.hasOwnProperty(UI._UploadDest)
                    ? UI.DestFileTypes[UI._UploadDest]
                    : '.txt';
        (UI.FileInput as {accept:string})['accept']=exts;
        UI.FileInput.disabled=false;
      }
    }
  } // UI.OnFileTypeSelChange()


  //=================================================================
  //
  //  Item Picker Dialog for generic list type choices
  //
  //=================================================================
  static ItemPickerNItems=0;

  static CalcItemPickerDlgRect() : CRect
  {
    const r:CRect = null;
    const vh=window.innerHeight;
    const vw=window.innerWidth;
    let h = Math.max(Math.min(vh-50, UI.ItemPickerNItems*38 + 48), 100);
    let w = Math.floor(Math.min(Math.max(Math.min(vw*0.75, 800), 420), vw)-20);
    return new CRect((vw-w)/2-4, 4, w, h);
  } // UI.CalcItemPickerDlgRect() //

  static SetupItemPicker(items:HTMLElement[], elePerRow:number, tabIdx:number, _zoomFrom:HTMLElement)
  {
    const startR:CRect|null = _zoomFrom ? new CRect(_zoomFrom.getBoundingClientRect()) : null;
    const listdiv=UI.ItemPickerItemListDiv;
    while (listdiv.lastChild) listdiv.removeChild(listdiv.lastChild);

    function __insertItems()
    {
      if (UI.ItemPickerTitleTab && UI.ItemPickerTitleTab.style.display==='none')
        UI.ItemPickerTitleTab.style.display="block";

      for (let i=0; i<UI.ItemPickerTabBtns.length; i++) {
        if (UI.ItemPickerTabBtns[i]) {
          UI.ItemPickerTabBtns[i].className= i===tabIdx ? 'selected' : '';
        }
      } // for (i)

      if (items.length===0) {
        listdiv.innerHTML="(empty)";
      }
      else {
        for (let i=0; i<items.length; i+=elePerRow) {
          const row=document.createElement('div') as HTMLDivElement;
          row.style.display="block";
          row.style.verticalAlign="middle";
          row.style.paddingTop="4px";
          row.appendChild(items[i]);
          for (let j=0; j<elePerRow; j++) {
            items[i+j].style.display="inline-block";
            row.appendChild(items[i+j]);
          } // for (j)
          listdiv.appendChild(row); //items[i]);
        } // for (i)
      }
      if (CWA.InModalState!==K.MS_PickingItem) CWA.EnterModalState(K.MS_PickingItem);
    } // function __insertItems()

    if (_zoomFrom) {
      if (UI.ItemPickerTitleTab) UI.ItemPickerTitleTab.style.display="none";
      UI.ZoomOutDiv(UI.ItemPickerDiv,startR, UI.CalcItemPickerDlgRect(), ()=>__insertItems());
    }
    else {
      __insertItems();
      UI.ItemPickerDiv.__UIAdjSizeFcn(UI.ItemPickerDiv);
    } // if (_zoomFrom) .. else ..
  } // UI.SetupItemPicker()

  static DismissItemPicker(_action:number, _itemidx:number=-1)
  {
    CWA.ExitModalState(K.MS_PickingItem, A.MSX_None);
  } // UI.DismissItemPicker()


  //================================================================
  //
  //  RmServerDoc(): handler for the delete document buttons
  //
  //================================================================
  static RmServerDoc(_docinfo:string)
  {
    if (!SRQ.BusyQ() && CWA.UserValidatedQ && CWA.UserLevel>1) {
      CWA.GenericQuery(A.kIcon_TrashCan, "Confirm Removal",
      "Move "+decodeURIComponent(_docinfo)+" into the <em>.recycle</em> folder?",
      (ans:number)=>
      {
        if (ans===A.AnsYes) {
          const data:SRQData={};
          data['DocInfo']=_docinfo;
          CWA.AskAppServer('DELDOC', CWA.UserId, CWA.PassHash, data).
          then((_result:string)=>{
            // CWA.GenericQuery(A.kIcon_Info, "Successful", _result,
            // ()=>{
              if (CWA.InModalState===K.MS_PickingItem) UI.DisplayDocPicker(UI.SelectedDocTabIdx(), false);
            // }, A.GQ_OK);
          }).
          catch((err:string)=>{
            CWA.AlertBox(A.kIcon_Error, err);
          });
        }
      }, A.GQ_OKCancel);
    }
  } // UI.RmServerDoc() //

  static UndeleteServerDoc(_docinfo:string)
  {
    if (CWA.UserValidatedQ && CWA.UserLevel>1) {
      const data:SRQData={};
      data['DocInfo']=_docinfo;
      CWA.AskAppServer('UNDELDOC', CWA.UserId, CWA.PassHash, data).
      then((result:string)=>{
        let parts:string[]=result.match(/^([^,]+),(.+)$/);
        let gotoTab=K.TAB_Docs;
        let restoredTo='its original dir.'; // a generic fall back message.
        let restoredFn=result;
        if (null!==parts) {
          restoredTo = decodeURIComponent(parts[1]);
          if (restoredTo==='news') gotoTab=K.TAB_News;
          else if (restoredTo==='polls') gotoTab=K.TAB_Polls;
          restoredFn = parts[2];
        }
        CWA.GenericQuery(A.kIcon_Info, "Undelete Successful", restoredFn+" restored into "+restoredTo,
        ()=>{
          if (CWA.InModalState===K.MS_PickingItem) {
            // CWA.ExitModalState(K.MS_PickingItem, A.MSX_None);
            UI.DisplayDocPicker(gotoTab, false);
          }
        }, A.GQ_OK);
      }).
      catch((err:string)=>{
        CWA.AlertBox(A.kIcon_Error, err);
      });
    }
  } // UI.UndeleteServerDoc() //

  static ChangeDocTab(tabIdx:number)
  {
    const btns=UI.ItemPickerTabBtns;
    if (tabIdx>=0 && tabIdx<btns.length) {
      if (btns[tabIdx] && btns[tabIdx].className!=='selected') {
        for (let i=0; i<btns.length; i++) {
          if (btns[i]) btns[i].className=i===tabIdx ? 'selected' : '';
        } // for (i)
        UI.DisplayDocPicker(tabIdx, false);
      }
    }
  } // UI.ChangeDocTab()

  static SelectedDocTabIdx() : number
  {
    const btns=UI.ItemPickerTabBtns;
    for (let i=0; i<btns.length; i++) {
      if (btns[i] && btns[i].className==='selected') return i;
    }
    // None of them is selected!!! Reset it to the first one.
    if (btns[0]) btns[0].className='selected';
    for (let i=0; i<btns.length; i++) if (btns[i]) btns[i].className='';
    return 0;
  } // UI.SelectedDocTabIdx()


  //=================================================================
  //
  //  DisplayDocPicker()
  //
  //=================================================================
  static DisplayDocPicker(tabIdx:number, zoomOutQ=true)
  {
    if ((!CWA.InModalState && !SRQ.BusyQ())
    ||   (!zoomOutQ && CWA.InModalState===K.MS_PickingItem))
    // &&  !SRQ.BusyQ())
    {
      const adminQ=CWA.UserValidatedQ && CWA.UserLevel>1;
      if (!adminQ) tabIdx=K.TAB_Docs;

      let btn;
      if (null!==(btn=UI.UploadItemsBtn)) {
        btn.style.display= (tabIdx===K.TAB_Trash || tabIdx===K.TAB_News) ? "none" : "";
        btn.disabled=!adminQ || tabIdx===K.TAB_Polls;
      }
      if (null!==(btn=UI.NewItemBtn)) {
        btn.style.display= (tabIdx===K.TAB_News) ? "" : "none";
      }
    // if (UI.UploadItemsBtn) {
    //     UI.UploadItemsBtn.style.display="";
    //     UI.UploadItemsBtn.disabled=!adminQ;
    //   }
    //   if (UI.NewItemBtn) {
    //     UI.NewItemBtn.style.display="none";
    //   }

      if (tabIdx<0 || tabIdx>=UI.ItemPickerTabBtns.length) {
        tabIdx = UI.SelectedDocTabIdx();
      }
      else if (zoomOutQ) {
        const btns=UI.ItemPickerTabBtns;
        if (btns[K.TAB_Docs]) btns[K.TAB_Docs].disabled=false;
        if (btns[K.TAB_News]) btns[K.TAB_News].disabled=!adminQ;
        if (btns[K.TAB_Polls]) btns[K.TAB_Polls].disabled=!adminQ;
        if (btns[K.TAB_Trash]) btns[K.TAB_Trash].disabled=!adminQ;
      }

      const req = ['DOCLIST', 'NEWSFILES', 'POLLFILES', 'TRASHLIST'][tabIdx];

      CWA.AskAppServer(req, '', '').
      then((reply:string)=>{
        //  The reply from the server should be in the format:
        //  9,EncodedFile0Info|EncodedFile1Info|encodedFile2Info|...|encodedFile8Info
        let parts = reply.match(/^(\d+),(.*)$/);
        if (parts && +parts[1]>=0) {
          let ndocs=0;
          const docs:string[] = parts[1]==='0' ? [] : parts[2].split('|');
          // CWA.SetStatusText(parts[1]+" docs on server");
          if (docs.length===+parts[1]) {
            for (let i=0; i<docs.length; i++)
              docs[i]=decodeURIComponent(docs[i]);
            const cmpDoc = tabIdx===K.TAB_Docs ?
            (a:string, b:string)=>{
              const ap=a.match(K.DocInfoPatt);
              const bp=b.match(K.DocInfoPatt);
              if (ap[K.DocInfoPart_Dir]===bp[K.DocInfoPart_Dir]) {
                // if (ap[K.DocInfoPart_Ext]!==bp[K.DocInfoPart_Ext])
                //   return ap[K.DocInfoPart_Ext]>bp[K.DocInfoPart_Ext] ? 1 : -1;
                // else
                return ap[K.DocInfoPart_FN].toLowerCase()>bp[K.DocInfoPart_FN].toLowerCase() ? 1 : -1;
              }
              else
                return ap[K.DocInfoPart_Dir]>bp[K.DocInfoPart_Dir] ? -1 : 1;
            } :
            (a:string, b:string)=>a>b ? 1 : -1; // other types of docs simply compare the docinfo string.

            docs.sort(cmpDoc);
            const list:HTMLElement[]=[];
            for (let i=0; i<docs.length; i++) {
              // Create one button for the URL to the document
              // If signed-in is an admin level user, create another "del" button.
              const btn = document.createElement('button') as HTMLButtonElement;
              const actn = adminQ ? document.createElement('button') as HTMLButtonElement : null;
              const docinfo=docs[i];
              // The decoded docinfo should be in the format:
              // serverDirsWithSlashes|filename.ext
              const docparts=docinfo.match(K.DocInfoPatt);
              if (docparts && docparts[K.DocInfoPart_Dir] && docparts[K.DocInfoPart_FN] && docparts[K.DocInfoPart_Ext]) {
                const folder=docparts[K.DocInfoPart_Dir];
                const ext=docparts[K.DocInfoPart_Ext];
                btn.innerHTML = decodeURIComponent(docparts[K.DocInfoPart_FN]); // server filenames are URI encoded. decode it to get the readable name.
                const lastSlash=folder.lastIndexOf('/');  // we only want the name of the deepest dir.
                btn.className="pickListItemBtn docType_"+ext;
                if (lastSlash>0 && lastSlash<folder.length-2)
                  btn.className+=" docSrc_"+folder.substring(lastSlash+1);
                if (tabIdx===K.TAB_News) {
                  btn.title="Edit News Article";
                  btn.onclick=()=>{
                    // UI.EditNewsFile(docparts[K.DocInfoPart_FN]);
                    UI.OpenNewsEditor(docinfo);
                  }
                }
                else if (tabIdx!==K.TAB_Polls) {
                  btn.onclick=()=>{
                    // No need to close the ItemList dialog immediately.
                    // It might be more useful to leave it there
                    // for the user to pick another doc if they
                    // navigate back to our portal, after viewing the doc.
                    // UI.DismissItemPicker(A.MSX_None); <-- no need.
                    UI.GotoURL(encodeURI(folder+'/'+docparts[2]+'.'+ext));
                  };
                }
                btn.style.width= adminQ ? "calc(100% - 42px)" : "100%"; // accurately calculate the button size.
                list.push(btn);
                if (adminQ) {
                  actn.className="pickListActnBtn";
                  actn.onclick=()=>
                    tabIdx===K.TAB_Trash ? UI.UndeleteServerDoc(docinfo) :
                    tabIdx===K.TAB_Docs  ? UI.OpenFileOpsDialog(docinfo) :
                    UI.RmServerDoc(docinfo);
                  actn.innerHTML=
                    tabIdx===K.TAB_Trash ? "&#xe938;" :
                    (tabIdx===K.TAB_News || tabIdx===K.TAB_Polls) ? "&#xe92b;" :
                    "&#xe5d3";
                  actn.title =
                    tabIdx===K.TAB_Trash ? "Restore deleted file" :
                    tabIdx===K.TAB_Docs ? "File Operations" :
                    "Delete file";

                  // Temporarily disable the delete file button on polls for the time being..
                  actn.disabled = tabIdx===K.TAB_Polls;
                  list.push(actn);
                }
                ndocs++;
              }
            } // for (i)
            UI.ItemPickerNItems=ndocs;
            // The second argument is the number of html element created per doc.
            UI.SetupItemPicker(list, adminQ ? 2 : 1, tabIdx, zoomOutQ ? UI.DocsBtn : null);
          }
          else {
            CWA.AlertBox(A.kIcon_Error, "Inconsistent doc list received from server.");
          }
        }
        else {
          CWA.AlertBox(A.kIcon_Info, "No documents are available at this moment.");
        }
      }).
      catch((_err:string)=>{});
    }
    // else
    //   CWA.SetStatusText("Busy ("+CWA.InModalState+":"+(SRQ.BusyQ()?'t':'f')+")", 1000);
  } // DisplayDocPicker()

  static OpenFileOpsDialog(docinfo:string)
  {
    let parts:string[]=null;
    if (null!==(parts=docinfo.match(K.DocInfoPatt))) {
      if (CWA.UserValidatedQ && CWA.UserLevel>1) {
        UI.FileOpsDocInfo=docinfo;
        UI.FileOpsFNInp.value=decodeURIComponent(parts[K.DocInfoPart_FN]);
        UI.FileOpsFNInp.disabled=true;
        UI.FileOpsDelBtn.disabled=false;
        UI.FileOpsRenBtn.disabled=false;
        UI.FileOpsDoRenBtn.disabled=true;
        CWA.EnterModalState(K.MS_FileOps);
        UI.FileOpsCancelBtn.focus();
      }
    }
  } // OpenFileOpsDialog()

  static FileOpsOnFNameInput(e:Event)
  {
    if (e && e.target===UI.FileOpsFNInp) {
      const docinfo = UI.FileOpsDocInfo;
      let parts:string[]=null;
      if (null!==(parts=docinfo.match(K.DocInfoPatt))) {
        const fn=UI.FileOpsFNInp.value.trim();
        const unchangedQ = decodeURIComponent(parts[K.DocInfoPart_FN])===fn;
        UI.FileOpsDoRenBtn.disabled = unchangedQ;
        UI.FileOpsDelBtn.disabled = !unchangedQ;
      }
    }
  }

  static FileOpsDlgAction(action:number)
  {
    const docinfo = UI.FileOpsDocInfo;
    if (docinfo) {
      switch (action) {
      case K.FO_EditFN:
        if (UI.FileOpsFNInp) {
          UI.FileOpsFNInp.disabled=false;
          UI.FileOpsFNInp.focus();
          UI.FileOpsDoRenBtn.disabled=true; // disabled until the name has actually been modified.
        } // if (UI.FileOpsFNInp)
        break;

      case K.FO_Delete:
        CWA.ExitModalState(K.MS_FileOps, A.MSX_None);
        UI.FileOpsDocInfo='';
        UI.RmServerDoc(docinfo);
        break;

      case K.FO_Rename:
        // Check if the filename has been changed.
        if (UI.FileOpsFNInp && !UI.FileOpsFNInp.disabled) {
          let parts:string[]=null;
          if (null!==(parts=docinfo.match(K.DocInfoPatt))) {
            const fn=UI.FileOpsFNInp.value.trim();
            function __validFNQ(fn:string) : boolean
            {
              return (fn && fn.length>0);
            } // __validFNQ()
            if (__validFNQ(fn) && decodeURIComponent(parts[K.DocInfoPart_FN])!==fn) {
              const data:SRQData={};
              data['DocInfo']=docinfo;
              data['NewFName']=fn;
              CWA.AskAppServer('RENDOC', CWA.UserId, CWA.PassHash, data).
              then((_result:string)=>{
                CWA.SetStatusText("Doc renamed to "+fn, 1000);
                UI.DisplayDocPicker(-1, false);
              }).
              catch((err)=>{
                CWA.AlertBox(A.kIcon_Error, err);
              });
            }
          }
        }
        // drop through to default:
      default:
        UI.FileOpsDocInfo='';
        CWA.ExitModalState(K.MS_FileOps, A.MSX_None);
        break;
      } // switch(action)
    } // if (docinfo)
  } // UI.FileOpsDlgAction()


  //**********************************************************
  //
  // Editor Dialog
  //
  //**********************************************************
  static EdNewsDocInfo:string='';
  static EdNewsArticle:Article=null;
  static EdTempArticle:Article=null;
  static EdSwitchView(view:number)
  {
    const trs=UI.EdViewTRs;
    const tabs=UI.EdViewBtns;
    if (trs && tabs && trs.length===tabs.length && trs.length===K.EDV_NViews) {
      for (let i=0; i<trs.length; i++) {
        if (trs[i])
          trs[i].style.display= (view===i) ? "" : "none";
        const selclass=(view===i) ? "selected" : "";
        if (tabs[i] && tabs[i].className!==selclass) {
          tabs[i].className=selclass;
          if (view===K.EDV_Preview) { // update the preview area.
            const art=(UI.EdTempArticle=new Article(UI.EdNewsArticle));
            art.headline=UI.EdTitleEdit.value;
            art.body=UI.EdBodyEdit.value;
            art.SetIcon(UI.EdSelectedIconIdx());
            UI.UpdatePreviewDiv(art);
          }
        }
      } // for (i)
    } // if (trs...)
  } // UI.EdSwitchView()

  static EdSetArticleIcon(idx:number, updateUI=true)
  {
    // const art=UI.EdNewsArticle;
    const btns=UI.EdIconBtns;
    // if (art) {
      if (idx<0 || idx>=btns.length) idx=-1;

      for (let i=0; i<btns.length; i++) {
        if (i===idx)
          CWA.AddClass(btns[i],"selected");
        else
          CWA.RemoveClass(btns[i],"selected");
      }
    // }
    if (updateUI) UI.UpdateEditorUIs();
  } // UI.EdSetArticleIcon()

  static UpdatePreviewDiv(art:Article)
  {
    if (art && UI.EdPreviewDiv) {
      const div=UI.EdPreviewDiv;
      while (div.firstChild) div.removeChild(div.lastChild);
      const collapsable=art.MkCollapsableDiv(true, art.iconSpecifiedQ ? '' : '\ueb81')
      div.appendChild(collapsable);
      CWA.Typeset(collapsable);
      // , ()=>{
      //   CWA.AlertBox(A.kIcon_Info, "Mathjax called back.");
      // });
    }
  } // UI.UpdatePreviewDiv()

  static EdSelectedIconIdx() :number  // -1 means none selected.
  {
    const btns=UI.EdIconBtns;
    let selidx=-1;
    for (let i=0; i<btns.length; i++) {
      if (btns[i].className.indexOf("selected")>=0) {
        if (selidx>=0 && i!==selidx)
          CWA.RemoveClass(btns[i], "selected");
        else
          selidx=i;
      }
    } // for (i)
    return selidx;
  } // UI.EdSelectedIconIdx()

  static EdNewsModifiedQ() : boolean
  {
    const art=UI.EdNewsArticle;
    if (art) {
      let modQ = UI.EdBodyEdit.value!==art.body
      || UI.EdTitleEdit.value!==art.headline
      || (UI.EdDateEdit && UI.EdDateEdit.value!==UI.EdNewsArticle.expiration);

      const selidx=UI.EdSelectedIconIdx();
      if (art.iconSpecifiedQ) {
        if (selidx!==art.specifiedIconIdx) modQ=true;
      }
      else if (selidx>=0) modQ=true;
      // if ((!art.iconSpecifiedQ && selidx>=0)
      // || (art.specifiedIconIdx!==selidx)) modQ=true;

      return modQ;
    }
    else return false;
  } // UI.EdNewsModifiedQ()

  static UpdateEditorUIs()
  {
    UI.EdCommitBtn.disabled = !UI.EdNewsModifiedQ();
    const expiredQ = (new Date())>(new Date(UI.EdDateEdit.value));
    UI.EdDateInfTxt.innerHTML = expiredQ ? "Expired on: " : "Exp.Date: ";
    UI.EdDateInfTxt.style.color = expiredQ ? "#800" : "#000";
  } // UI.UpdateEditorUIs()

  static PickedNewsExpirationDate(year:number, month0_11:number, day:number)
  {
    CWA.ExitModalState(A.MS_ShowingCal, A.MSX_None);
    if (UI.EdDateEdit) UI.EdDateEdit.value=CalEvent.MkDateStr(year, month0_11, day);
    UI.UpdateEditorUIs();
  }

  static OpenNewsEditor(docinfo:string)
  {
    function __startEditing(art:Article)
    {
      UI.EdNewsArticle=art;
      UI.EdSwitchView(K.EDV_TitleEtc);
      // UI.EdCommitBtn.disabled=true;
      UI.EdBodyEdit.value=art.body;
      UI.EdTitleEdit.value=art.headline;
      if (UI.EdDateEdit) UI.EdDateEdit.value=art.expiration;
      let icnidx=-1;
      if (art.iconSpecifiedQ) {
        const btns=UI.EdIconBtns;
        for (let i=0; i<btns.length && icnidx<0; i++) {
          if (art.icon===Article.NamedIcon(i))
            icnidx=i;
        }
      }
      UI.EdSetArticleIcon(icnidx, false);
      UI.UpdateEditorUIs();
      CWA.EnterModalState(K.MS_TextEdit);
    } // __startEditing()

    if (!docinfo) {     // i.e. create a new article.
      UI.EdNewsDocInfo='';
      __startEditing(new Article("Headline", "Body"));
    }
    else if (!SRQ.BusyQ()) {  // does it matter whether SRQ is busy or not?
      UI.EdNewsDocInfo=docinfo;
      UI.EdNewsArticle=null;

      const data:SRQData={};
      data['DocInfo']=docinfo;
      CWA.AskAppServer("RDNEWSDOC",'','',data).
      then((artdata:string)=>{
        const art = UI.ArtData2Article(artdata);
        if (art) {
          __startEditing(art);
        }
        else {
          UI.EdNewsArticle=null;
          CWA.AlertBox(A.kIcon_Error, "News file format error.");
        }
      }).
      catch((err:string)=>{
        UI.EdNewsDocInfo='';
        UI.EdNewsArticle=null;
        CWA.AlertBox(A.kIcon_Error, err);
      });
    }
  } // UI.OpenNewsEditor()

  static CalcNewsEditorRect() : CRect
  {
    const r:CRect = null;
    const vh=window.innerHeight;
    const vw=window.innerWidth;
    let h = Math.max(CWA.IsMobileDevQ ? Math.floor(vh/2) - 30 : Math.floor(vh-40), 100);
    let w = Math.floor(Math.min(Math.max(Math.min(vw*0.98, 1020), 420), vw)-10);
    return new CRect((vw-w)/2, 4, w, h);
  } // UI.CalcNewsEditorRect() //

  static EditorDlgAction(op:number)
  {
    switch (op)
    {
    case K.ED_Accept:
      let closeQ=true;
      if (UI.EdNewsModifiedQ() && CWA.UserValidatedQ) {
        if (UI.EdNewsArticle.ValidQ()) {
          CWA.GenericQuery(A.kIcon_Reminder, "Confirm Save", "Save news article to server?",
          (ans:number)=>{
            if (ans===A.AnsYes) {
              let dict:{[key:string]:string} = {};
              dict["DocInfo"]=UI.EdNewsDocInfo ? UI.EdNewsDocInfo : "!NEW!";
              const art=UI.EdNewsArticle;
              art.headline=UI.EdTitleEdit.value;
              art.body=UI.EdBodyEdit.value;
              art.expiration=UI.EdDateEdit.value;
              art.SetIcon(UI.EdSelectedIconIdx());
              art.SetDict(dict);
              CWA.AskAppServer("RECNEWS", CWA.UserId, CWA.PassHash, dict)
              .then((_result:string)=>{
                CWA.ExitModalState(K.MS_TextEdit, A.MSX_None);
                if (CWA.InModalState===K.MS_PickingItem) UI.DisplayDocPicker(K.TAB_News, false);
                CWA.SetStatusText(_result, 1000);
              })
              .catch((err:string)=>{
                CWA.AlertBox(A.kIcon_Error, err);
              });
            }
          }, A.GQ_YesNo);
          closeQ=false;
        }
      } // EdNewsModifiedQ()
      if (closeQ) CWA.ExitModalState(K.MS_TextEdit, A.MSX_None);
      break;

    case K.ED_Cancel:
      if (UI.EdNewsModifiedQ()) {
        // confirm with user first.
        CWA.GenericQuery(A.kIcon_Reminder, "Article Modified",
        "OK to discard all changes?", (ans)=>{
          if (ans===A.AnsOK) CWA.ExitModalState(K.MS_TextEdit, A.MSX_None);
        }, A.GQ_OKCancel);
      }
      else
        CWA.ExitModalState(K.MS_TextEdit, A.MSX_None);
      break;
    } // switch (op)
  } // UI.EditorDlgAction()



  //*****************************************************************
  //
  // Portal functions
  //
  //*****************************************************************
  static GetStatusText()
  {
    if (CWA.InModalState===A.MS_ShowingCal)
    {
      const today = new Date();
      const pastMonthQ = today.getFullYear()>UI.CalShowingYear ||
        (today.getFullYear()===UI.CalShowingYear && today.getMonth()>UI.CalShowingMonth);
      const nev =
        (UI.CalMonthHasNEvents<=0 ?
          " is uneventful" /*+ (pastMonthQ ? "" : " ...yet")*/ :
          " has "+UI.CalMonthHasNEvents.toString()+(UI.CalMonthHasNEvents>1 ? " events" : " event"));
      return UI.CalShowingYear.toString()+" "+UI.MonthText[UI.CalShowingMonth] + nev;
    }
    else
      return CWA.UserValidatedQ ?
        ("Signed in as <em>"+CWA.UserId+(CWA.UserLevel>1? "</em> (&#x05d0;&lrm;&#x208"+(CWA.UserLevel-2)+";)" : "</em>"))
      : "Markville Math Club Portal";
  } // UI.GetStatusText()

  private static GotoURL(url:string) {
    window.location.href = url;
  }

  static ShowDiscordInviteLink() {
    CWA.GenericQuery(A.kIcon_Forum,
      "Discord MMA Server Invite",
      "Please join our Discord group to chat with fellow club members! "+
      "<p>Here's the invite link: </p>"+
      "<p style='font-family:\"Courier New\", Courier, serif; font-size:larger;'>"+
      K.URL_DiscordInvite+"<\p>"+
      "Press [OK] to copy to the clipboard.",
      (answer:number)=>{
        if (answer===A.AnsOK) {
          navigator.clipboard.writeText(K.URL_DiscordInvite)
          .then(()=>{
            CWA.SetStatusText('Text copied to clipboard', 5000);
          })
          .catch((err:string)=>{
            CWA.SetStatusText('Error in copying invite link: '+err);
          });
        }
      }, A.GQ_OKCancel);
  } // ShowDiscordInviteLink() //

  static DisplayNews()
  {
    UI.NewsDialog();
  } // DisplayNews()

  static DisplayEvents()
  {
    UI.CalendarDialog();
  } // DisplayEvents()

  static AdjCanvas(_cvW:number, _cvH:number)
  {
    function visibleUIDivAdjSize(div:HTMLDivElement)
    {
      if (div && div.style.display!=='none'
      &&  !div.hidden && div.__UIAdjSizeFcn) div.__UIAdjSizeFcn(div);
    } // visibleUIDivAdjSize()

    // These should be moved into CWA and be automatically handled based on
    // the presence of the __UIAdjSizeFcn property.
    visibleUIDivAdjSize(UI.CalDialogDiv);
    visibleUIDivAdjSize(UI.CalEventViewDiv);
    visibleUIDivAdjSize(UI.NewsDialogDiv);
    visibleUIDivAdjSize(UI.CalEvPickerDlgDiv);
    visibleUIDivAdjSize(UI.ItemPickerDiv);
    visibleUIDivAdjSize(UI.EditorDlgDiv);
  } // AdjCanvas() //

  static UpdateUI()
  {
    const modalQ=CWA.InModalState!==0 || SRQ.BusyQ();
    for (let i=0; i<UI.TopButtons.length; i++) {
      if (UI.TopButtons[i])
        UI.TopButtons[i].disabled=modalQ;
    }

    UI.ReplayLogoBtn.disabled = modalQ || UI.animStep>0;
    UI.PollsBtn.disabled =
      !UI.PollList || UI.PollList.length<=0 || modalQ;

    if (CWA.StatusTextEle) {
      // Set the color of the status bar based on the sign-in status
      // and the user level of the signed-in user.
      CWA.StatusTextEle.style.backgroundColor=
        !CWA.UserValidatedQ ? "#000" : CWA.UserLevel>1 ? "gold" : '#353';
      CWA.StatusTextEle.style.color= (CWA.UserValidatedQ && CWA.UserLevel>1 ? "#000" : "#fff");
    }

    const aleph0Q = CWA.UserValidatedQ && CWA.UserLevel>1 && !CWA.PassHashTempQ;

    UI.SetMenuItemsFlags(K.MNX_NotSignedInCmds, // not-signed-in menu commands.
      [//!!! The following list must match the order and length of sNoUserCmdsOptions[] !!!
        navigator.onLine,               // Sign-In
        CWA.UserId
          && CWA.PassHash
          && CWA.UserValidatedQ,        // Sign-Out
        navigator.onLine,               // Discord Invite
        true                            // About Box.
      ]);
    UI.SetMenuItemsFlags(K.MNX_UserCmds, // menu cmds for ordinary users after signed in.
      [//!!! The following list must match the order and length of sUserCmdsOptions[] !!!
        navigator.onLine,               // Change Pwd
        CWA.UserId
         && CWA.PassHash
         && CWA.UserValidatedQ,         // Sign-Out
        navigator.onLine,               // Discord Invite
        true                            // About Box.
      ]);
    UI.SetMenuItemsFlags(K.MNX_AdminCmds, // admin cmds menu
      [//!!! The following list must match the order and length of sAdminCmdsOptions[] !!!
        navigator.onLine,               // Sign-In/Create User
        CWA.UserId
          && CWA.PassHash
          && CWA.UserValidatedQ,        // Sign-Out
        navigator.onLine,               // Discord Invite
        navigator.onLine && aleph0Q,    // ExecInfo
        navigator.onLine && aleph0Q,    // Upload
        true                            // About Box.
      ]);
    CWA.UpdateStatusBar();
  }

} // class UI


/*================================================================
   ____     __           ___       _      __
  / __/__  / /_______ __/ _ \___  (_)__  / /_
 / _// _ \/ __/ __/ // / ___/ _ \/ / _ \/ __/
/___/_//_/\__/_/  \_, /_/   \___/_/_//_/\__/
                 /___/
==================================================================*/
let ui:UI=null;
function _initPage()
{
  // Remove the "JavaScript Disabled" error message div ASAP (before it fades in)
  const noscriptDiv = byId('noScriptMsg');
  if (noscriptDiv)
    document.body.removeChild(noscriptDiv);

  ui=new UI();
  CWA.UpdateStatusBar();
} // initPage() //


window["initPage"]=_initPage;
window["OnExpandBoxClick"]=(e:Event)=>UI.OnNewsArtExpandBoxClick(e);
