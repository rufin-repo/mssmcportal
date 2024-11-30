// Copyright (c) 2023 Rufin Hsu. See LICENSE.txt.

//===================================================================
//
//  Various Data Types used in MMA Portal App
//
//===================================================================

//=====================================================
//     ___       __  _     __
//    / _ | ____/ /_(_)___/ /__
//   / __ |/ __/ __/ / __/ / -_)
//  /_/ |_/_/  \__/_/\__/_/\__/
//
//=====================================================
class Article
{
  //---- class static data ----

  static Icons:string[]=[
    '\ueae7', // knot/cmd-key
    '\ueb81', // newspaper
    '\ue838', // star
    '\ue87d', // heart
    '\uea0b', // bolt
    '\ue1a0', // 3 dots (therefore)
    '\ue65f', // 3 stars
    '\uf03d', // moon
    '\ue602', // 2 shapes
  ];
  static sUID=0;
  static sIconIdx=0;
  static sBgColorIdx=0;
  static NCSSBgColorClasses=4;

  // Order in the following list is unimportant.
  // Avoid modifying the names - might affects existing articles.
  // New names can be added freely.
  // Icons can be changed replaced to change appearances.
  static namedIcons:string[]=[
    'timely', '\ue574',
    'star',   '\ue838',
    'moon',   '\uf03d',
    'heart',  '\ue87d',
    'bolt',   '\uea0b',
    'knot',   '\ueae7',
    'recycle','\ue760',
    '3dots',  '\ue1a0', // in a "therefore" arrangement.
    'geom',   '\ue574', // 3 geom shapes
    'wrench', '\ue869',
    '3stars', '\ue65f',
    'book',   '\uea19',
    'book2',  '\ue666',
    'calc',   '\uea5f',
    'people', '\uea1d',
    'group',  '\uf8d8',
    'fight',  '\ueae9', // figure kicked up
    'chat',   '\ue0bf', // 2 speech balloons
    'write',  '\ue745',
  ];

  static IconName(idx:number) :string
  {
    const icns=Article.namedIcons;
    return (idx>=0 && idx*2+1<icns.length) ?
      "&#x"+icns[idx*2+1].charCodeAt(0).toString(16)+";": '';
  }
  static NamedIcon(idx:number) : string
  {
    const icns=Article.namedIcons;
    return (idx>=0 && idx*2+1<icns.length) ?
      icns[idx*2+1] : '';
  }

  //==============================================

  body: string;
  headline: string;
  expiration: string;
  authorInfo: string;
  mIcon: string;
  mIconSpecifiedQ:boolean;
  sortId:number;
  uniqueId:number;
  bgColor: string|number;

  get icon() { return this.mIcon; }
  get iconSpecifiedQ() {return this.mIcon && this.mIconSpecifiedQ;}
  get specifiedIconIdx() : number {
    if (this.iconSpecifiedQ) {
      const idx=Article.namedIcons.indexOf(this.mIcon);
      return idx>0 ? (idx>>>1) : -1;
    }
    else
      return -1;
  }
  SetIcon(iconIdx:number) {
    if (iconIdx>=0 && (iconIdx*2+1)<Article.namedIcons.length) {
      this.mIcon = Article.namedIcons[iconIdx*2+1];
      this.mIconSpecifiedQ=true;
    }
    else {
      this.mIconSpecifiedQ=false;
    }
  } // Article::SetIcon()



  constructor(hdline:string|Article, bdy:string='', seqId:number=-1,
    expire:string='',
    icon:string='', authInf:string='9sys', bgc:string='')
  {
    if (hdline instanceof Article) {
      const a=hdline as Article;
      this.headline   =a.headline;
      this.body       =a.body;
      this.authorInfo =a.authorInfo;
      this.sortId     =a.sortId;
      this.uniqueId   =a.uniqueId;
      this.bgColor    =a.bgColor;
      this.expiration =a.expiration;
      this.mIcon      =a.mIcon;
      this.mIconSpecifiedQ=a.mIconSpecifiedQ;
    }
    else {
      this.body=(bdy ? bdy : "(empty)").trim().replace(/\r/g,'');
      this.headline=(hdline ? hdline : this.body.substring(0,20)).trim().replace(/\n|\r/g,'');
      this.authorInfo = authInf;

      // if (this.body.indexOf('\r')>=0) CWA.AlertBox(A.kIcon_Error, "has return");

      const icnidx=Article.namedIcons.indexOf(icon);
      if (icon==="news" || icnidx<0)
        icon='';

      if (!icon) {
        this.mIcon = Article.Icons[(Article.sIconIdx++) % Article.Icons.length];
        this.mIconSpecifiedQ=false;
      }
      else {
        this.mIcon = Article.namedIcons[icnidx+1];
        this.mIconSpecifiedQ=true;
      }

      this.bgColor = bgc ? bgc : ((Article.sBgColorIdx++)%Article.NCSSBgColorClasses);
      this.expiration=expire ? expire : "9999-99-99"; // default: never expires
      this.sortId = seqId>=0 ? seqId : Article.sUID;
      this.uniqueId=Article.sUID++;
    }
  } // constructor()

  MkCollapsableDiv(expandQ:boolean=false, forceIcon:string='') : HTMLDivElement
  {
    const div = document.createElement('div') as HTMLDivElement;
    div.className=typeof(this.bgColor)==='string' ? "collapsable" : "collapsable newsartclr"+this.bgColor;
    if (typeof(this.bgColor)==='string')
      div.style.backgroundColor = this.bgColor;
    const input=document.createElement('input') as HTMLInputElement;
    input.id='art'+this.uniqueId;
    input.type='checkbox';
    input.name='expandBox';
    if (expandQ) input.checked=true;
    input.addEventListener('click', UI.OnNewsArtExpandBoxClick);
    const label=document.createElement('label');
    label.setAttribute("name",forceIcon ? forceIcon : this.icon);
    label.htmlFor='art'+this.uniqueId;
    label.innerHTML=this.headline;
    const bodydiv = document.createElement('div') as HTMLDivElement;
    bodydiv.className="content";
    bodydiv.innerHTML=this.body;
    div.appendChild(input);
    div.appendChild(label);
    div.appendChild(bodydiv);
    return div;
  } // Article::MkCollapsableDiv

  GetIconName():string
  {
    if (this.mIconSpecifiedQ) {
      const idx = Article.namedIcons.indexOf(this.icon);
      return idx>0 ? Article.namedIcons[idx-1] : "news";
    }
    else
      return "news";
  } // Article::GetIconName() //

  SetDict(dict:{[key:string]:string})
  {
    let t=this.body.trim(); if (!t) t="Empty Article";
    dict["Body"]=t;
    dict["Title"]=this.headline.trim() ? this.headline.trim() : t.substring(0, 20);
    dict["ExpDate"]=this.expiration.match(/^\d\d\d\d-\d\d-\d\d$/) ? this.expiration : "9999-99-99";
    dict["Type"]=this.GetIconName();
  } // Article::SetDict() //

  ValidQ() : boolean
  {
    return this.headline.trim()!=='' && this.body.trim()!=='';
  } // Article::ValidQ()

  // ExpiredQ(): boolean
  // {
  //   const exp = new Date(this.expiration);
  //   const today = new Date();
  //   return today>exp;
  // } // Article::ExpiredQ()

} // Article




//=============================================================
//   ________  ________  ___       ___
//  |\   __  \|\   __  \|\  \     |\  \
//  \ \  \|\  \ \  \|\  \ \  \    \ \  \
//   \ \   ____\ \  \\\  \ \  \    \ \  \
//    \ \  \___|\ \  \\\  \ \  \____\ \  \____
//     \ \__\    \ \_______\ \_______\ \_______\
//      \|__|     \|_______|\|_______|\|_______|
//
//=============================================================
class Poll
{
  mPollId:string;
  mUserLevel:number;  // above of equal to this to view or vote.
  mFlags:string;      // reserved
  mActiveUntil:Date;  // a Date object
  mTitle:string;      // short poll title.
  mDesc:string;       // html formated text ready for placing within a div.
  mChoices:string[];
  mTallies:number[];
  mVotedFor:number;   // which choice has this user previously voted for.
  mVotedAsUser:string;// UserId used when the vote was casted. (not necessarily===CWA.UserId)

  get title() {return this.mTitle;}
  get id() {return this.mPollId;}
  get desc() {return this.mDesc;}
  get activeUntil() {return this.mActiveUntil;}
  get votedFor() {return this.mVotedFor;}

  private setTitleAndDesc(encodeddesc:string)
  {
    const desc = decodeURIComponent(encodeddesc);
    const nl = desc.indexOf('\n');
    if (nl>0) {
      this.mTitle = desc.substring(0,nl);
      this.mDesc = desc.substring(nl+1);
    }
    else {
      if (desc.length>40)
        this.mTitle = desc.substring(0,37)+"...";
      else
        this.mTitle = desc;
      this.mDesc = desc;
    }
  } // setTitleAndDesc()

  private setFlags(flags: string)
  {
    if (flags && flags.match(/^\d\w*$/)) {
      this.mUserLevel = +flags[0];
      this.mFlags = flags.substring(1);
    }
    else {
      this.mUserLevel=999;
      this.mFlags="";
    }
  } // setFlags()

  private setActiveUntil(tm:string)
  {
    let parts:string[];
    if (tm.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/))
      this.mActiveUntil=new Date(tm);
    else if (null!==(parts=tm.match(/^(\d{4})-(\d{2})-(\d{2})-(\d{2})(\d{2})(\d{2})$/)))
      this.mActiveUntil=new Date(+parts[1], +parts[2]-1, +parts[3], +parts[4], +parts[5], +parts[6]);
    else
      this.mActiveUntil=new Date();
  } // setActiveUntil()

  constructor(pollinfo:string)
  {
    this.mUserLevel=999;
    this.mFlags="";
    this.mActiveUntil=new Date();
    this.mTitle="";
    this.mDesc="";
    this.mChoices=[];
    this.mTallies=[];
    this.mVotedFor=-1; // not voted
    this.mVotedAsUser="";

    if (pollinfo) {
      const pinfo = pollinfo.split("|");
      if (pinfo.length>=6) {
        this.mPollId = decodeURIComponent(pinfo[0]);
        this.setFlags(pinfo[1]);
        this.setActiveUntil(pinfo[2]);
        this.setTitleAndDesc(pinfo[3]);
        const nChoices = +pinfo[4];
        const encodedChoices = decodeURIComponent(pinfo[5]).split("|");
        if (nChoices===encodedChoices.length) {
          for (let i=0; i<nChoices; i++) {
            this.mChoices.push(decodeURIComponent(encodedChoices[i]));
          }
        }
      }
      // const q:{[key:string]:string}={};
      // q["PollId"]=pollid;
      // CWA.AskAppServer("POLLINFO", null, 0, q).
      // then((_pollinfo:string)=>{
      // }).
      // catch((err:string)=>{
      //   CWA.SetStatusText(err);
      // });
      if (this.ValidQ()) {
        this.ScanVotedStatus();
      }
    } // if (pollinfo)
  } // constructor

  ValidQ() {return this.mChoices.length>1 && this.mTitle && this.mDesc;}
  ActiveQ() {
    const now=new Date();
    return (this.activeUntil>now);
  }
  CanVoteQ() {return CWA.UserLevel>=this.mUserLevel;}

  //================================================================
  //
  // ScanVotedStatus(): call this everytime Sign-in user changes
  //
  //================================================================
  public ScanVotedStatus()
  {
    this.mVotedFor=-1;
    this.mVotedAsUser='';
    let votedRecFoundQ=false;
    const key=K.CK_VotedPfx+this.mPollId;
    const votedcookie = CWA.GetCookie(key);
    if (votedcookie) {
      const votedRecs = votedcookie.split(K.VotedRecsSep);
      for (let i=0; i<votedRecs.length && !votedRecFoundQ; i++) {
        const f = votedRecs[i].match(K.VotedRecPatt);
        if (f && +f[1]>=0 && +f[1]<this.mChoices.length) {
          if ((!CWA.UserValidatedQ && f[2]==='A') // found an anonymous vote rec.
          ||  (CWA.UserValidatedQ && f[2]==='U' && f[3]===CWA.UserId)) // or a matching user vote rec.
          {
            this.mVotedFor    = +f[1];
            this.mVotedAsUser = f[3];
            votedRecFoundQ=true;
          }
        }
        else votedRecs.splice(i--, 1);
      } // for (i)
    }
  } // ScanVotedStatus()

  private AddVotedCookieRecord(user:string, votedFor:number, anonQ:boolean) {
    if (votedFor<0 || votedFor>=this.mChoices.length || !user) return;
    const newrec = votedFor.toString()+(anonQ ? 'A':'U')+user.trim();
    const key=K.CK_VotedPfx+this.mPollId;
    const votedcookie = CWA.GetCookie(key);
    if (votedcookie) {
      let oldRecUpdatedQ=false;
      const votedRecs = votedcookie.split(K.VotedRecsSep);
      for (let i=0; i<votedRecs.length && !oldRecUpdatedQ; i++) {
        const f = votedRecs[i].match(K.VotedRecPatt);
        if (f && +f[1]>=0 && +f[1]<this.mChoices.length) {
          if (f[2]===(anonQ ? 'A' : 'U') &&
              f[3]===user)
          {
            votedRecs[i]=newrec;
            oldRecUpdatedQ=true;
          }
        }
        else
          votedRecs.splice(i--, 1);
      } // for (i)
      if (!oldRecUpdatedQ) votedRecs.push(newrec);
      CWA.SetCookie(key, votedRecs.join(K.VotedRecsSep));
    }
    else
      CWA.SetCookie(key, newrec);
  } // AddVotedCookieRecord()

  private ClearVotedCookieRecord(user:string)
  {
    const key=K.CK_VotedPfx+this.mPollId;
    const votedcookie = CWA.GetCookie(key);
    if (votedcookie) {
      let changedQ=false;
      const votedRecs = votedcookie.split(K.VotedRecsSep);
      for (let i=0; i<votedRecs.length; i++) {
        const f = votedRecs[i].match(K.VotedRecPatt);
        let delQ=false;
        if (f && f.length===4) {
          if (+f[1]<0 || +f[1]>=this.mChoices.length  // the rec is invalid anyway
            || f[3]===user)  // removing this user's records
            delQ=true;
        }
        else delQ=true;
        if (delQ) {
          votedRecs.splice(i--,1);  // i-- to allow the index to stay after i++
          changedQ=true;
        }
      } // for (i)
      if (votedRecs.length===0) CWA.SetCookie(key, null);
      else if (changedQ) {
        CWA.SetCookie(key, votedRecs.join(K.VotedRecsSep));
      }
    } // if (votedcookie)
  } // ClearVotedCookieRecord()

  //......................................................
  //  helper function that actually brings up the dialog
  //......................................................
  private _SetupAndShowPollViewDlg()
  {
    UI.ViewingPoll = this;
    const expiredQ = !this.ActiveQ();
    if (UI.PollViewTitle) UI.PollViewTitle.innerHTML =
      this.title + (expiredQ ? " (Ended)" : "");
    if (UI.PollViewDesc) UI.PollViewDesc.innerHTML = this.desc;
    const div = UI.PollChoicesDiv;
    while (div.firstChild) div.removeChild(div.lastChild);
    let totTally =0;
    if (this.mTallies && this.mTallies.length===this.mChoices.length) {
      for (let i=0; i<this.mTallies.length; i++) {
        totTally+=this.mTallies[i];
      } // for (i)
    }
    for (let i=0; i<this.mChoices.length; i++) {
      const btn = document.createElement('button');
      btn.className="voteChoiceBtn";
      if (expiredQ || (this.mVotedFor>=0 && this.mVotedAsUser)) {
        btn.disabled=true;
        btn.className += " voteChoiceBtnBold";
      }
      let label = ((this.votedFor===i) ? "<span style='font-size:smaller; font-style:normal; font-weight:100;'>Your pick &#x2611;</span> " : "") +
        this.mChoices[i];
      if (totTally>0) label+=(" ("+Math.floor(this.mTallies[i]*100/totTally+0.5)+"%)");
      btn.innerHTML=label;
      btn.onclick=()=>{
        UI.DismissPollView(expiredQ ? -1 : i);
      };
      div.appendChild(btn);
    } // for (i)

    // Add an active-until-time message at the end.
    const expdiv = document.createElement('div');
    expdiv.className="pollExpTimeBox";
    const et=this.activeUntil;
    let msg=(expiredQ ? "Polling Closed: " : "Polls Open Until: ")+
      et.getFullYear()+"-"+(et.getMonth()+1)+"-"+et.getDate();
    const now=new Date();
    if (Math.abs(et.getTime()-now.getTime())<3600*24*2) {
      msg+= " "+et.getHours()+":"+et.getMinutes()+":"+et.getSeconds();
    }
    expdiv.innerHTML=msg;
    div.appendChild(expdiv);

    // Enter modal dialog state if we are not already in it.
    if (CWA.InModalState!==A.MS_ViewingPoll)
      CWA.EnterModalState(A.MS_ViewingPoll);
  } // _SetupAndShowPollViewDlg()

  private _getTalliesAndThen(
    userId:string, passHash:string,
    callThis:(self:Poll)=>void)
  {
    const req:{[key:string]:string}={};
    req["PollId"]=this.mPollId;
    CWA.AskAppServer('POLLDATA',userId, passHash,
                     req).
    then((polldata:string)=>{
      const tallies = polldata.trim().split(',');
      if (tallies.length===this.mChoices.length) // sanity check
      {
        this.mTallies=[];
        for (let i=0; i<tallies.length; i++) {
          this.mTallies.push(+tallies[i]);
        }
        if (callThis) callThis(this);
      }
      else {
        CWA.AlertBox(A.kIcon_Help, "Internal Error: Poll data from server inconsistent.");
      }
    }).
    catch((err:string)=>{
      CWA.AlertBox(A.kIcon_Help, "Unable to retreive poll data from server. ("+err+")");
    });
  } // _getTalliesAndThen

  OpenPollViewDialog()
  {
    // The following test checks for a few conditions
    // under which we need additional info/data about
    // the Poll in question before we could display the
    // poll-view dialog:
    // 1: Has the client user voted before? If so, we need
    //    the latest poll tallies to for displaying on the
    //    choice buttons;
    // 2: The user has signed-in. In this case, we could
    //    ask the server to check definitively whether
    //    a valid vote has actually been casted;
    // 3: Is the poll closed already (i.e. activeUntil<now)
    //    If so, we should still display the final poll
    //    results whether or not the user has voted or not.
    if ((this.mVotedFor>=0 && // this could be based on a cookie
         this.mVotedFor<this.mChoices.length &&
         this.mVotedAsUser)
       || (CWA.UserValidatedQ && CWA.UserId && CWA.PassHash)
       )
    {
      const req:{[key:string]:string}={};
      req["PollId"]=this.mPollId;
      // No need to pass vote choice because we are not casting a vote.
      // req["PollVote"]=this.mVotedFor.toString();
      this.mTallies=[];

      const chkUsr =
        this.mVotedAsUser && this.mVotedFor>=0 && this.mVotedFor<this.mChoices.length ?
        this.mVotedAsUser : CWA.UserId;

      CWA.AskAppServer('CHKVOTE', chkUsr,
        chkUsr===CWA.UserId ? CWA.PassHash : '', req).
      then((reply:string)=>{
        if (reply.substring(0,5)==='Voted') {
          let pos=-1;
          if (/*this.mVotedFor<0 &&*/(pos=reply.indexOf(':'))>=0) {
            this.mVotedFor= +reply.substring(pos+1);
            this.mVotedAsUser=chkUsr;
          }
          this.AddVotedCookieRecord(chkUsr, this.mVotedFor, chkUsr!==CWA.UserId);
          // CWA.SetCookie(K.CK_VotedPfx+this.mPollId, this.mVotedFor.toString()+":"+chkUsr);
          this._getTalliesAndThen(
            chkUsr, chkUsr===CWA.UserId ? CWA.PassHash : '',
            (self:Poll)=>{self._SetupAndShowPollViewDlg();});
        } // if (reply==='Voted')
        else {
          // No indication that the current user has voted before.
          this.ClearVotedCookieRecord(chkUsr);
          this.mVotedFor=-1;
          this.mVotedAsUser='';
          // CWA.SetCookie(K.CK_VotedPfx+this.mPollId, null); // remove cookie if any.
          if (!this.ActiveQ()) { // poll already ended/expired?
            // Get the final tallies and open the dialog.
            this._getTalliesAndThen('','',(self:Poll)=>{self._SetupAndShowPollViewDlg();});
          }
          else
            this._SetupAndShowPollViewDlg(); // still need to bring up the dialog.
        }
      }).
      catch((err:string)=>{
        CWA.AlertBox(A.kIcon_Help, "CHKVOTE error:"+err);
      });
    }
    else if (!this.ActiveQ()) { // poll already ended/expired?
      // Get the final tallies and open the dialog.
      this._getTalliesAndThen('','',(self:Poll)=>{self._SetupAndShowPollViewDlg();});
    }
    else
      this._SetupAndShowPollViewDlg();
  } // OpenPollViewDialog()

  CastVote(choice:number)
  {
    if (typeof(choice)==='number' &&
      this.ValidQ() && this.ActiveQ() &&
      choice>=0 && choice<this.mChoices.length)
    {
      const req:{[key:string]:string}={};
      req["PollId"]=this.mPollId;
      req["PollVote"]=choice.toString();
      let voteUsr = this.mVotedAsUser;
      let pwdHash='';
      if (!voteUsr) {
        if (CWA.UserValidatedQ) {
          voteUsr=CWA.UserId;
          pwdHash=CWA.PassHash;
        }
        else {
          function cyrb53Hash(str:string, seed = 0)
          {
            let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
            for (let i = 0; i < str.length; i++) {
                const ch = str.charCodeAt(i);
                h1 = Math.imul(h1 ^ ch, 2654435761);
                h2 = Math.imul(h2 ^ ch, 1597334677);
            }
            h1 = Math.imul(h1 ^ (h1>>>16), 2246822507) ^ Math.imul(h2 ^ (h2>>>13), 3266489909);
            h2 = Math.imul(h2 ^ (h2>>>16), 2246822507) ^ Math.imul(h1 ^ (h1>>>13), 3266489909);
            return 4294967296 * (2097151 & h2) + (h1>>>0);
          } // cyrb53Hash()
          const sftsave = CWA.GetCookie(K.CK_LogoShft);
          voteUsr = Date()+window.innerWidth+window.innerHeight;
          if (sftsave) voteUsr+=sftsave;
          voteUsr = cyrb53Hash(voteUsr).toString(36); // use a hopefully unique random user hash.
        }
      }
      else {
        if (voteUsr===CWA.UserId)
          pwdHash = CWA.PassHash;
      }

      CWA.GenericQuery(A.kIcon_Confirm,
        "Choice Confirmation",
        "Please confirm your choice:<br><h3 style='text-align:center;'>"+this.mChoices[choice]+"</h3>",
        (answer:number)=>{
          if (answer===A.AnsYes) {
            CWA.AskAppServer('CASTVOTE', voteUsr, pwdHash, req).
            then((result:string)=>{
              const talliesParts = result.trim().split(',');
              if (talliesParts.length===this.mChoices.length) {
                this.mVotedAsUser = voteUsr;
                this.mVotedFor = choice;
                this.AddVotedCookieRecord(voteUsr, choice, voteUsr!==CWA.UserId);
                // CWA.SetCookie(K.CK_VotedPfx+this.mPollId, choice.toString()+":"+voteUsr);
                this.mTallies=[];
                for (let i=0; i<this.mChoices.length; i++)
                  this.mTallies.push(+talliesParts[i]);
                this._SetupAndShowPollViewDlg();
              }
              else
                CWA.AlertBox(A.kIcon_Help,"Internal Error: Inconsistent tally data.");
            }).
            catch((err:string)=>{
              CWA.AlertBox(A.kIcon_Help, err);
            });
          } // if (answer===A.AnsOk)
        }, A.GQ_YesNo);
    }
    else if (CWA.InModalState===A.MS_ViewingPoll) {
      CWA.ExitModalState(CWA.InModalState, A.MSX_None);
    }

  } // CastVote()
} // class Poll



//================================================================
//
//  _____       _ _____                _
// /  __ \     | |  ___|              | |
// | /  \/ __ _| | |____   _____ _ __ | |_
// | |    / _` | |  __\ \ / / _ \ '_ \| __|
// | \__/\ (_| | | |___\ V /  __/ | | | |_
//  \____/\__,_|_\____/ \_/ \___|_| |_|\__|
//
//
//================================================================
class CalEvent
{
  mDate:string;       // in yyyy-mm-dd format  ('' if entire record is invalid)
  mYear:number;
  mMonth0_11:number;
  mDay:number;
  mTime:string;       // in hhmm format
  mEvId:number;       // unique serial number (+ve for editable events)
  mOwnerHash:string;
  mOwnerLvl:number;
  mType:number;       // an icon?
  mDesc:string;

  private static sIcons:string[]=[
    "&#xe88a;",  // 0 home (holiday/no school)
    "&#xea19;",  // 1 book
    "&#xf8d9;",  // 2 people
    // "&#xef40;",  // 3 pen and dots
    "&#xeae7;",  // 3 apple cmd key knot.
    // "&#xe7f4;",  // 4 bell (general reminder)
    "&#xe153;",  // 4 flag (general reminder)
  ];

  get ValidQ() :boolean {return this.mYear>=0;}
  get Year():number {return this.mYear;}
  get Month0_11():number {return this.mMonth0_11;}
  get Date():string {return this.mDate;}
  get Time():string {return this.mTime;}
  get Id(): number {return this.mEvId;}
  get Day():number {return this.mDay;}
  get Desc():string {return this.mDesc;}
  SetDesc(desc:string) {this.mDesc=desc;}
  get Type():number {return this.mType;}
  SetType(type:number) {this.mType=Math.max(0,Math.min(K.ET_MaxEvType, type));}
  get Icon():string {
    return this.mType>=0 && this.mType<CalEvent.sIcons.length ?
      CalEvent.sIcons[this.mType] : "&#xe868;";  // bug
  }
  //   let iconidx=1;
  //   for (let bit=1; bit<=K.ET_MaxEvType; bit<<=1, iconidx++) {
  //     if ((this.Type&bit)!==0)
  //       return CalEvent.sIcons[iconidx];
  //   }
  //   return CalEvent.sIcons[0];
  // } // CalEvent::Icon
  get BuiltInQ():boolean {return this.mOwnerHash==='builtin';}

  constructor(date_or_data:string, time:string='', id:number=0, owner:string='', ownerlvl:number=-1, type:number=-1, desc:string='')
  {
    let pt:string[] = null;
    if (null!==(pt=date_or_data.match(
        /^(\d+)!(\d\d\d\d-\d\d-\d\d)-(\d\d\d\d),(\d+),(\w+),(\d+),(\S+)$/)))
    {  // match pattern => Treat date_or_data as an encoded complete event record from the server.
      ownerlvl=+pt[1];
      this.mDate=pt[2];
      time=pt[3];
      id=+pt[4];
      owner=pt[5];
      type=+pt[6];
      desc=decodeURIComponent(pt[7]);
    }
    else if (
      date_or_data.match(/^\d\d\d\d-\d\d-\d\d$/) &&
      (time==='' || time.match(/^\d\d\d\d$/)) &&
      // ((id>0 && owner) || (id===-1 && owner==='')) && ownerlvl>0 &&
      type>=0 && desc
      )
    {
      this.mDate=date_or_data;
      if (time==='') time='0000';
    }
    else {
      this.mDate='';  // means an invalid event record
    }
    this.mTime=time;
    this.mEvId=id;
    this.mOwnerHash=owner;
    this.mOwnerLvl=ownerlvl;
    this.mType=type;
    this.mDesc=desc;
    this.mYear=-1;
    this.mMonth0_11=-1;
    this.mDay=-1;
    let parts:string[];
    if (null!==(parts=this.mDate.match(/^(\d\d\d\d)-(\d\d)-(\d\d)$/))) {
      this.mYear= +parts[1];
      this.mMonth0_11= +parts[2]-1;
      this.mDay= +parts[3];
    }
  } // constructor()

  Duplicate() : CalEvent
  {
    return new CalEvent(this.mDate, this.mTime, this.mEvId,
      this.mOwnerHash, this.mOwnerLvl, this.mType, this.mDesc);
  } // CalEvent::Duplicate()

  DiffQ(ev: CalEvent) : boolean
  {
    if (!ev) return true;
    return (ev.mDate!==this.mDate ||
            ev.mTime!==this.mTime ||
            ev.mDesc.trim()!==this.mDesc.trim() ||
            ev.mType!==this.mType);
  } // CalEvent::DiffQ

  get UserCanEditQ() : boolean
  {
    return (!this.BuiltInQ &&
      CWA.UserValidatedQ &&
      (this.mEvId<=0   // <=0 means a temporarily generated event (e.g. for editing)
      ||CWA.UserLevel>=this.mOwnerLvl
      // ||(CWA.UserLevel===this.mOwnerLvl
      //   && (CWA.UserLevel>1 || CWA.UserHash(CWA.UserId)===this.mOwnerHash)
      //   )
      ));
  } // CalEvent:UserCanEditQ

  MkShortTitle(len:number) :string
  {
    let d=this.mDesc.trim();
    d=d.replace(/\<\/?[a-zA-Z]+[^>]*\>/g,'');
    d=d.replace(/\s+/g,' ');
    if (d.length>len-1) d=(d.substring(0, len-1)+'…');
    return d;
  } // CalEvent::MkShortTitle()

  static MkDateStr(year:number, mon0_11:number, day:number) : string{
    return ('000'+year).slice(-4)+'-'+('0'+(mon0_11+1)).slice(-2)+'-'+('0'+day).slice(-2);
  }

  private static EventDescs:{[key:string]:string[]}={
  'holidays':[
    "School Holiday",   //0
    "Labour Day",       //1
    "Thanksgiving Day", //2
    "Mid-Term Break",   //3
    "Winter Break",     //4
    "Family Day",       //5
    "Mid-Winter Break", //6
    "Good Friday",      //7
    "Easter Monday",    //8
    "Victoria Day",     //9
    "PA Day",           //10
  ],
  'contests':[
    "<em>COMC</em><br>(Canadian Open Math Challenges)", //0
    "<em>CIMC/CSMC</em><br>(Canadian Intermediate/Senior Math Contests)<br>"+
    "Don't miss the Oct 23 registration deadline!", //1
    "<em>Pascal/Cayley/Fermat</em> Math Contests", //2
    "<em>Euclid</em> Math Contest",                //3
    "<em>Fryer/Galois/Hypatia</em> Math Contests", //4
    "<em>AMC10/AMC12 Level-A</em> Contests",       //5
    "<em>AMC10/AMC12 Level-B</em> Contests",       //6
  ],
  'talks':[
    "Math club meeting today!"
  ],
  'special': [
    "Christmas party!",
    "Pre-exam party!"
  ],
  'reminders':[
    "CIMC/CSMC Registration Deadline<br>(SchoolCash Online)", //0
  ]};

  private static builtIns:{year:number, type:string, evs:number[]}[]=
  [
    {year:2022, type:'holidays',
     evs:[
      8,1,   0,
      9,5,   1,
        9,6,10,
        9,23,10,
      10,10, 2,
        10,21,10,
      10,24, 3,
      10,25, 3,
      10,26, 3,
      10,27, 3,
      10,28, 3,
        11,18,10,
      12,26, 4,
      12,27, 4,
      12,28, 4,
      12,29, 4,
      12,30, 4,
     ]},
    {year:2023, type:'holidays',
     evs:[
       1, 2, 4,
       1, 3, 4,
       1, 4, 4,
       1, 5, 4,
       1, 6, 4,
          2, 3,10,
       2,20, 5,
       3,13, 6,
       3,14, 6,
       3,15, 6,
       3,16, 6,
       3,17, 6,
       4, 7, 7,
       4,10, 8,
          5, 5,10,
       5,22, 9,
          6,30,10,
     ]},
    {year:2022, type:'contests',
     evs:[
      10, 27,  0,   //COMC (open)
      11, 16,  1,   //CIMC/CSMC (intermediate/senior)
      11, 10,  5,   //AMC10/AMC12 (Lvl A)
      11, 16,  6,   //AMC10/AMC12 (Lvl B)
     ]},
    {year:2023, type:'contests',
     evs:[
      2, 22,   2,   // pascal/cayley/fermat
      4,  4,   3,   // euclid
      4,  5,   4,   // fgh
     ]},
    {year:2022, type:'reminders',
     evs:[ // 2022
      10, 23,  0,   //CIMC/CSMC Registration Deadline
     ]},
    {year:2024, type:'holidays',
    evs:[
      9,2,    1,
      9,27,  10,
      10,14,2,
      10,21,10,
      10,28,3,
      10,29,3,
      10,30,3,
      10,31,3,
      11,1,3,
      11,15,10,
      12,23,4,
      12,24,4,
      12,25,4,
      12,26,4,
      12,27,4,
      12,30,4,
      12,31,4,
    ]},
    {year:2025, type:'holidays',
    evs:[
      1,1,4,
      1,2,4,
      1,3,4,
      1,31,10,
      2,17,5,
      3,10,6,
      3,11,6,
      3,12,6,
      3,13,6,
      3,14,6,
      4,18,7,
      4,21,8,
      5,5,10,
      5,19,9,
      6,26,10,
      6,27,10
    ]},
    {year:2024, type:'contests',
    evs:[
      10, 30,  0,   //COMC (open)
      11, 13,  1,   //CIMC/CSMC (intermediate/senior)
      11, 6,  5,   //AMC10/AMC12 (Lvl A)
      11, 12,  6,   //AMC10/AMC12 (Lvl B)
    ]},
    {year:2025, type:'contests',
    evs:[
      2, 26,   2,   // pascal/cayley/fermat
      4,  2,   3,   // euclid
      4,  3,   4,   // fgh
    ]},
    {year:2024, type:'talks',
    evs:[
      10,9,0,
      10,16,0,
      10,23,0,
      11,6,0,
      11,13,0,
      11,20,0,
      11,27,0,
      12,4,0,
      12,11,0,
    ]},
    {year:2025, type:'talks',
    evs:[
      1,8,0,
      2,5,0,
      2,12,0,
      2,19,0,
      2,26,0,
      3,5,0,
      3,19,0,
      3,26,0,
      4,2,0,
      4,9,0,
      4,16,0,
      4,23,0,
      4,30,0,
      5,7,0,
      5,14,0,
      5,21,0,
      5,28,0,
      6,4,0,
    ]},
    {year:2024, type:'special',
    evs:[
      12,18,0,
    ]},
    {year:2025, type:'special',
    evs:[
      1,15,1,
      6,11,0
    ]},
  ];

  static List: CalEvent[]=null; // sorted by data+time
  private static ResetToBuiltInEvents()
  {
    CalEvent.List=[];
    const evlist = CalEvent.List;
    const bin=CalEvent.builtIns;
    for (let n=0; n<bin.length; n++) {
      const bintype=bin[n].type;
      const descTab=CalEvent.EventDescs[bintype];
      const evs=bin[n].evs;
      for (let i=0; i+2<evs.length; i+=3) {
        const date=bin[n].year.toString()+'-'+('0'+evs[i]).slice(-2)+'-'+('0'+evs[i+1]).slice(-2);
        const ev = new CalEvent(date, '', -1, 'builtin', 999,
          bintype==='holidays' ? K.ET_Holiday :
          bintype==='contests' ? K.ET_Contest :
          bintype==='talks'    ? K.ET_Talks   :
          bintype==='special'  ? K.ET_Meeting :
          K.ET_Reminder,
          (descTab && evs[i+2]<descTab.length)? descTab[evs[i+2]] : "Unknown Event");
        if (ev.ValidQ) evlist.push(ev);
      } // for (i)
    } // for (n)
  } // ResetToBuiltInEvents()

  static GetEventListFromServer(callback:(successfulQ:boolean)=>void=null)
  {
    CalEvent.ResetToBuiltInEvents();
    CWA.AskAppServer("EVLIST", '', '').
    then((data:string)=>
    {
      if (data) {
        const evlist = data.split('|');
        for (let i=0; i<evlist.length; i++) {
          const ev= new CalEvent(evlist[i]);
          if (ev.ValidQ)
            CalEvent.List.push(ev);
        } // for (i)
        if (callback) callback(true);
      } // if (data)
      else if (callback)
        callback(false);
    }).
    catch((err:string)=>
    {
      CWA.AlertBox(A.kIcon_Error, err);
      if (callback) callback(false);
    });
  } // CalEvent.GetEventListFromServer()

  static GetEvent(year:number, month0_11:number, day:number) : CalEvent[]
  {
    const evs:CalEvent[]=[];
    let type=0;
    let desc="";
    const evlist=CalEvent.List;
    for (let i=0; i<evlist.length; i++) {
      if (evlist[i].Year===year && evlist[i].Month0_11===month0_11 && evlist[i].Day===day) {
        evs.push(evlist[i]);
      }
    } // for (i)
    return evs;
  } // CalEvent.GetEvent()

} // class CalEvent
