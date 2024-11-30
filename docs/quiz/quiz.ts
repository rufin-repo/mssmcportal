declare var MathJax:any;
/// <reference path="quizutils.ts"/>
/// !<reference types="@types/mathjs"/>

// interface Algebrite {
//   run:()=>string,
// }

//#define DONT_SHOW_EMPTY_TOPICS
//#define DEBUG
//#define GEN_ARITHMQ

function ASSERT(cond:boolean) {
  if (!cond) throw "Assertion failed.";
}

const R={
  // ele ids
  ID_CatPickCollapseAllBtn: "catPickerAllOffBtn",
  ID_CatPickCancelBtn: "catPickerCancelBtn",
  ID_CatPickOKBtn: "catPickerOKBtn",
  ID_LvlListDiv: "lvlList",
  ID_MathPadDiv: "mathPadDiv",
  ID_MathPadBtn: "mathPadBtn",
  ID_MathPadInp: "mathPadInp",
  ID_MathPadOut: "mathPadOut",
  ID_ClockDisp:  "clockDisp",

  // CSS class
  CC_ClockPaused: "clockPaused",

  // cookie keys
  CK_TopicState: "CatStates",
  CK_OffLevels:  "OffLevels",
  CK_GameTarget: "GameTarget",
  CK_MC_QStat:   "MC_QStat",

  QuestionStatMaxNRecs: 10,
} //const R{}

//=======================================================================
// QuestionStat: statistics of past performance on a particular question
//=======================================================================
class QuestionStat
{
  static kAvgTimeFilterFade=0.7;
  static sBitMask: number=0;
  QHash:    number;
  NStat:    number; // Number of latest statistics collected. min(QuestionStatMaxNRecs,31) (bits).
  Corrects: number; // one bit per stat. (MSB oldest, LSB newest.)
  AvgTime:  number; // in sec. time taken in getting a correct answer.

  constructor(questionTxt:string)
  {
    this.QHash = yHash(questionTxt);
    this.NStat = 0;
    this.Corrects = 0;
    this.AvgTime = -1;  // -ve means no past statistics on avg time
  }

  static get BitMask() {
    if (QuestionStat.sBitMask===0)
      QuestionStat.sBitMask= (1<<(R.QuestionStatMaxNRecs+1))-1;
    return QuestionStat.sBitMask;
  } //BitMask

  public AddStat(correctQ:boolean, nsec:number)
  {
    if (this.NStat<R.QuestionStatMaxNRecs) this.NStat++;

    this.Corrects= ((this.Corrects<<1) & QuestionStat.BitMask);
    if (correctQ) {
      this.Corrects++; // add a 1 for the latest correct answer.
      if (nsec>0) {
        this.AvgTime = this.AvgTime<0 ?
          nsec :
          this.AvgTime*(1-QuestionStat.kAvgTimeFilterFade) + nsec*QuestionStat.kAvgTimeFilterFade;
      }
    }
  } //AddStat()

  public Score() : number
  {
    let score=0;
    if (this.NStat>0)  {
      let bit = 1;
      for (let i=0; i<this.NStat; i++, bit<<=1) {
        if (this.Corrects&bit) {
          score += 4;
        }
        else {
          score --;
        }
      } // for (i)
      // raw score max:4*NStat, min:-NStat;
      score = Math.round(score/this.NStat * 25); // a max score of 100. min:-25
    }
    return score;
  } //Score()

  public ToCookieTxt() : string
  {
    let txt="";
    if (this.QHash && this.NStat>0 && this.NStat<=R.QuestionStatMaxNRecs) {
      txt = this.QHash.toString(36)+'|'+this.NStat.toString(36)+this.Corrects.toString(16);
      if (this.AvgTime>0) {
        txt += '|'+this.AvgTime.toFixed(2);
      }
    }
    return txt;
  } //ToCookieTxt()

  public FromCookieTxt(stat:string)
  {
    if (this.QHash) {
      this.NStat=0;
      this.Corrects=0;
      if (stat) {
        let parts = stat.split('|');
        this.NStat = Math.min(R.QuestionStatMaxNRecs, parseInt(parts[0][0],36));
        this.Corrects = parseInt(parts[0].substr(1), 16) & QuestionStat.BitMask;
        if (parts.length>=2) {
          this.AvgTime = +parts[1];
        }
        else
          this.AvgTime = -1;
      }
    }
  }//FromCookieTxt()

  public QStatDispTxt() : string
  {
    if (this.NStat<=0) // no statistics
      return "&#x25cc;"; // dotted circ
    else {
      const score = this.Score();
      let txt =
        score<=0 ? "&#x26a0; " : // warning sign
        score>=95 ? "&#x2600; " :  // sunny
        score>=75 ? "&#x263a; " :  // smily
        score<=50 ? "&#x2601; " :  // cloudy
                    "&#x2691; ";   // flag (not so good)
        //"&#x"+(score+0x2460).toString(16)+";";
      if (this.AvgTime>0) {
        txt += '('+Math.round(this.AvgTime)+"s)";
      }
      return txt;
    }
  }//QStatDispTxt()
} //class QuestionStat

//==============================================================
//class QuestionBank: Quiz question abstract base class
//==============================================================
abstract class QuestionBank {
  OnAnswerTrigger : ()=>void;
  constructor(onAnswer:()=>void) {
    this.OnAnswerTrigger = onAnswer;
    // this.BuildQuestion();
  } // constructor() //
  SetOptions(_option:string) {};
  abstract ShowQuestion(clearAnsQ:boolean) : void;
  abstract CheckAnswer(_timeTaken:number): number;  // 0 means invalid answer, ignore. >=1:correct, -1:incorrect.
  abstract BuildQuestion() : void;
  abstract UIDivName(): string;
  AnswerText() : string { return null; }
  SummaryText() : string { return null; }
  abstract QuestionText(): string;
  abstract Category(): string;
  abstract RunOutQ() : boolean;
  OnKeyPress(_e:KeyboardEvent) {};
  abstract OnUserAnsInput(_ans:string) : void;
  CurrQuestionStatIndicator(): string {return "";}
  RestartQuestionList() {};
  QuestionNotes(): string {return null}
} //class QuestionBank //


//--------------------------------------------------------------
//AritmeticQuestions: simple + - x / questions on integers
//--------------------------------------------------------------
class ArithmeticQuestions extends QuestionBank {
  private mOperand1:number;
  private mOperand2:number;
  private mOperator:string;
  private mResult:number;
  private mAddSubQ:boolean;
  private mAnsBox: HTMLInputElement;
  private mUserAnsText: string;

  UIDivName() {return "ArithQDiv";}
  Category() {return "Arithmetics";}
  RunOutQ() {return false;} // never runs out.

  SetOptions(opts:string) {
    if (opts==="+-") {
      this.mAddSubQ=true;
    }
  } //SetOptions() //

  constructor(onAnswer:()=>void) {
    super(onAnswer);
    this.mAddSubQ=false;
    this.mOperand1 = 0;
    this.mOperand2 = 0;
    this.mOperator = "+";
    this.mResult = 0;
    this.mAnsBox = byId("ans") as HTMLInputElement;
    this.mUserAnsText = null;
  } //ArithmeticsQuestion::constructor() //

  AnswerText() :string {return this.mResult.toString();};

  BuildQuestion() {
    let num1 = Math.floor(Math.random()*100);
    let num2 = Math.floor(Math.random()*100);

    let rnd = Math.random();

    if (this.mAddSubQ)
      rnd*=0.5;   // allows additions and subtractions

    let opr = "";
    if (rnd>0.75) {
      opr='+';
      this.mResult = num1+num2;
    }
    else if (rnd>0.5)
    {
      opr='-';
      if (num1<num2)
      {
        let n = Math.floor(Math.random()*3)+2;
        num1 += (Math.floor(Math.random()*10)+1)*Math.pow(10,n);
      }
      this.mResult = num1-num2;
    }
    else if (rnd>0.25)
    {
      if (num1<=1) num1=Math.floor(Math.random()*99)+1;
      if (num2<=1) num2=Math.floor(Math.random()*99)+1;
      if (num1>=10 && num2>=10)
      {
        num2 = Math.floor(Math.random()*9)+2;
      }
      opr='&times;';
      this.mResult = num1*num2;
    }
    else
    {
  //    num1 = Math.floor(Math.random()*12)+1;
      num1 = Math.floor(Math.random()*99)+1;
      this.mResult = num1;  // this is the quotient, we generate the answer first in a division question.
      num2 = Math.floor(Math.random()*11)+2;
      num1 *=num2;
      opr='&divide;';
    }
    this.mOperand1 = num1;
    this.mOperand2 = num2;
    this.mOperator = opr;
  } //ArithmeticsQuestion::BuildQuestion() //

  CheckAnswer(_timeTaken:number) : number {
    let ans = this.mUserAnsText; //this.mAnsBox.value;
    if (ans==="" || isNaN(+ans)) return 0;
    else return (+ans === this.mResult) ? 1 : -1;
  } //ArithmeticsQuestion::CheckAnswer() //

  ShowQuestion(clearAnsQ:boolean) {
    let upp = byId("upp");
    if (upp) upp.innerHTML = this.mOperand1.toString();
    let lwr = byId("lwr");
    if (lwr) lwr.innerHTML = this.mOperand2.toString();
    let opr = byId("opr");
    if (opr) opr.innerHTML = this.mOperator;
    if (this.mAnsBox) {
      this.mAnsBox.focus();
      if (clearAnsQ) {
        this.mAnsBox.value="";
      }
    }
  } //ArithmeticsQuestion::ShowQuestion() //

  OnUserAnsInput(anstxt:string) {
    this.mUserAnsText=anstxt.trim();
    this.OnAnswerTrigger();
  } //ArithmeticsQuestion::OnUserAnsInput() //

  QuestionText() {return this.mOperand1.toString() + this.mOperator + this.mOperand2.toString();}
} //class ArithmeticQuestion //

interface MultChoiceQuestion {
  DyQ:boolean,
  Cat:string,
  Inf:string,     // summary of the question (could be null)
  Lvl:string,     // 'E':Elementary, 'O':O-Level, 'A':A-Level, 'U':Undergrad
  Q  : string[],
  A: string[],
  Bad: string[],
  More:string
} //interface MultChoiceQuestion//

// interface CatInfo {
//   cat:string,
//   useQ:boolean
// } //interface CatInfo//

interface EnableExpandState
{
  topic:   Topic;
  enableQ: boolean;
  expandQ: boolean;
}

interface TopicDict { [key:string]: TopicDict;}

class Topic {
  static StdTopics : TopicDict = {
    "Math":
    {
      "Sets/Relations":null,
      "Set Theory":null,
      "Algebra": {
        "Remainder Theorem":null,
        "Factorization":null,
        "Quadratics":null,
        "Applied":null,
      },
      "Arithmetic":null,
      "Calculus":{
        "Differentiation":null,
        "Integration":null,
      },
      "Numbers":{
        "Complex Number":null,
      },
      "Geometry":{
        "Similar Shapes":null,
      },
      "Trigonometry":null,
      "Stats/Prob.":null,
      "Mechanics":null
    },

    "Physics":
    {
      "Matter":null,
      "Mechanics":null,
      "Electromagnetism":null,
      "Optics":null,
      "Wave":null,
    },

    "Chemistry":
    {
      "Phys Chem":{
        "Atomic Model":null,
        "Redox":null,
        "Reactions":null,
      },
      "Organic Chem":null,
      "Inorganic Chem":null,
    },

    "Biology":
    {
      "Organisms":{
        "Animals":{
          "Digestion":null,
          "Circulation":null,
          "Respiration":null,
          "Reproduction":null,
          "Locomotion":null,
        },
        "Plants":null,
      }
    },

    "Language": {
      "English":null,
      "French":null,
    },

    "Geography":null,

    "Art":{
      "Music":null,
    },

    "Misc": {
      "Philosophy":null,
      "Logic":null,
      "Fun":null,
    },
  }; // StdTopics

  Name: string; // "Top|SubTopic|...|LeafName"
  EnableQ: boolean;  // false if topic and all sub-topics are disabled.
  ExpandQ: boolean;  // true if sub items should be expanded.
  SubTopics: Topic[];
  ParentTopic: Topic;
  QtnCount: number;  // number of questions in or under this topic.

  CSSId(pfx:string) :string {
    return pfx + this.Name.replace('|', "_-_");
  }
  static NameFromCSSId(cssId:string) {
    if (cssId.startsWith("cat_") || cssId.startsWith("exp_"))
      return cssId.substring(4).replace("_-_", "|");
    else
      return "";
  }


  static Topics : Topic[] = null;
  static Levels : string[] = [];
  static LevelsOnOff: boolean[] = [];

  private static SetupStdTopics()
  {
    function bldTopics(parent:Topic, dict: TopicDict) : Topic[] {
      let outTopics:Topic[] = [];
      const keys = Object.keys(dict);
      for (let i=0; i<keys.length; i++) {
        let topic = new Topic(keys[i], parent);
        let subdict = dict[keys[i]];
        topic.SubTopics = subdict ? bldTopics(topic, subdict) : null;
        outTopics.push(topic);
      }
      return outTopics;
    } // bldTopics()

    Topic.Topics = bldTopics(null, Topic.StdTopics);

//#ifdef DEBUG
    this.FindMatchedSubTopic(Topic.Topics, "Algebra|Applied");
//#endif DEBUG
  }//Topic.SetupStdTopics()

  constructor(name:string, upperTopic:Topic)
  {
    this.Name=(upperTopic && upperTopic.Name) ? (upperTopic.Name + '|' + name) :  name;
    this.EnableQ=true;
    this.ExpandQ=false;
    this.SubTopics = [];
    this.ParentTopic = upperTopic;
    this.QtnCount = 0;
  }//Topic::constructor()

  AddSubTopic(subTopic: Topic)
  {
    if (subTopic) {
      if (!this.SubTopics) this.SubTopics=[];
      this.SubTopics.push(subTopic);
      subTopic.ParentTopic = this;
    }
  } //Topic::AddSubTopic()


  static FindMatchedSubTopic(topics:Topic[], subTopicName:string) : Topic
  {
    let matched:Topic = null;
    if (subTopicName && topics) {
      for (let i=0; i<topics.length && matched===null; i++) {
        if (topics[i].SubTopics && topics[i].SubTopics.length>0)
          matched = Topic.FindMatchedSubTopic(topics[i].SubTopics, subTopicName);
        if (matched===null && topics[i].Name.endsWith(subTopicName)) {
          return topics[i];
        }
      }
    }
    return matched;
  } // FindMatchedSubTopic() //

  static InTreeQ(topics:Topic[], findthis:Topic, parents:Topic[]) : boolean
  {
    let matched:Topic = null;
    if (topics && findthis) {
      for (let i=0; i<topics.length && matched===null; i++) {
        if (topics[i]===findthis) return true;
        else if (topics[i].SubTopics && topics[i].SubTopics.length>0) {
          const sublist=topics[i].SubTopics;
          for (let j=0; j<sublist.length; j++) {
            if (Topic.InTreeQ(sublist, findthis, parents)) {
              parents.push(topics[i]);
              return true;
            }
          } // for (j)
        }
      } // for (i)
    }
    return false;
  } // InTreeQ() //

  static CheckAddTopic(topicName: string, lvl:string) : Topic
  {
    if (!Topic.Topics) Topic.SetupStdTopics();

    if (lvl && Topic.Levels.indexOf(lvl)<0) { // an unencountered level type.
      Topic.Levels.push(lvl);                 // add it to our list.
      Topic.LevelsOnOff.push(true);           // default On.
    }

    let tpc = Topic.FindMatchedSubTopic(Topic.Topics, topicName);
    if (tpc===null) {
      // Could not find an exact match for topicName in existing topics.
      // Find a best existing topic/subtopic to create a new topic under
      let parts = topicName.split('|');
      // Try the prefix topics, shortening one at a time.
      // E.g. If topicName="Algebra|Applied|Peanuts" does not exist yet,
      //      we shall try to see if "Algebra|Applied" exists or not first,
      //      if not, we shall try "Algebra".
      //      If none of the prefix topics exist, we shall create a new top-level
      //      topic tree Algebra->Applied->Peanuts.
      for (let i=parts.length-2; i>=0; i--) {  // starts with the longest prefix first.
        let prefix="";
        for (let j=0; j<=i; j++) // concatenate all prefices from 0 to i (inclusive)
        {
          if (j>0) prefix+="|";
          prefix+=parts[j];
        }

        let pfxTpc = Topic.FindMatchedSubTopic(Topic.Topics, prefix);
        if (pfxTpc) { // prefix matched an existing topic pfxTpc. We shall put topicName under it.
          // parts[0] to part[i] have all been accounted for (in an existing topic)
          // Therefore we shall start creating new sub topics starting from parts[i+1] onwards.
          for (let k=i+1; k<parts.length; k++) {
            tpc = new Topic(parts[k], pfxTpc);
            pfxTpc.SubTopics.push(tpc);
            pfxTpc = tpc; // tpc is now the new parent topic for subsequent parts.
          } //for (k)
          break;
        }
      } //for (i)

      if (tpc===null) {
        // A topic could not be created under any matching existing sub-topics.
        // We shall create a top-level new topic.
        let upptpc:Topic = null;
        for (let i=0; i<parts.length; i++) {
          tpc = new Topic(parts[i], upptpc);
          if (upptpc===null)
            Topic.Topics.push(tpc);
          else {
            if (upptpc.SubTopics===null) upptpc.SubTopics=[];
            upptpc.SubTopics.push(tpc);
          }
          upptpc = tpc;
        } //for (i)
      } // if (tpc===null)
    } // if (tpc===null)
    return tpc;
  } // CheckAddTopic() //

  static TopicSelectedQ (cat:string) : boolean  // check if the given question q should be used in the current session.
  {
    let selQ=true;
    if (cat) {
      let tpc = Topic.FindMatchedSubTopic(Topic.Topics, cat);
      if (tpc) {
        selQ=tpc.EnableQ;
        while (selQ && tpc.ParentTopic) {
          selQ = tpc.ParentTopic.EnableQ;
          tpc = tpc.ParentTopic;
        }
      }
    } // if (q)
    return selQ;
  } // TopicSelectedQ()

  static WriteTopicEnableExpandStatesToCookie(savedStates:EnableExpandState[]) {
    if (savedStates) {
      let dat="";
      for (let i=0; i<savedStates.length; i++) {
        const st=savedStates[i];
        if (st.topic && (!st.enableQ || st.expandQ)) {
          if (dat) dat+="\n";
          dat+=st.topic.Name +'$$'+ (st.enableQ ? 'Y':'N') + (st.expandQ ? '+':'-');
        }
      } // for (i)
      SetCookie(R.CK_TopicState, dat ? dat : null);
    } //if (savedStates)
  } //Topic.WriteTopicEnableExpandStatesToCookie()

  static LoadTopicEnableExpandStatesFromCookie() : EnableExpandState[]
  {
    let states:EnableExpandState[]=[];
    let dat = GetCookie(R.CK_TopicState);
    if (dat) {
      let items = dat.split("\n");
      if (items && items.length>0) {
        for (let i=0; i<items.length; i++) {
          let parts = items[i].match(/(.*)\$\$([YN])([+-])/);
          if (parts && parts.length>3) {
            let tpc = this.FindMatchedSubTopic(Topic.Topics, parts[1]);
            if (tpc)
              states.push({topic:tpc, enableQ:parts[2]==='Y', expandQ:parts[3]==='+'});
          } // if (parts
        } // for (i)
      } // if (items)
    } // if (dat)
    Topic.RestoreEnableExpandStates(states);
    return states;
  } //Topic.LoadTopicEnableExpandStatesFromCookie()

  static WriteLevelOnOffStatesToCookie() {
    let dat = "";
    for (let i=0; i<Topic.Levels.length; i++) {
      if (i<Topic.LevelsOnOff.length && !Topic.LevelsOnOff[i]) {
        if (!dat) dat+="|";
        dat+=Topic.Levels[i];
      }
    }
    SetCookie(R.CK_OffLevels, dat ? dat : null);
  }
  static LoadLevelOnOffStatesFromCookie() {
    Topic.LevelsOnOff.fill(true);
    const dat = GetCookie(R.CK_OffLevels);
    if (dat) {
      let offs=dat.split('|');
      for (let i=0; i<offs.length; i++) {
        const lvlIdx = Topic.Levels.indexOf(offs[i]);
        if (lvlIdx>=0 && lvlIdx<Topic.LevelsOnOff.length) {
          Topic.LevelsOnOff[lvlIdx]=false;
        }
      }
    }
  }

  static RestoreEnableExpandStates(savedStates:EnableExpandState[]) : number
  {
    let changes=0;
    if (savedStates) {
      for (let i=0; i<savedStates.length; i++) {
        const tpc = savedStates[i].topic;
        if (tpc &&
            (tpc.EnableQ!==savedStates[i].enableQ ||
             tpc.ExpandQ!==savedStates[i].expandQ))
        {
          tpc.EnableQ = savedStates[i].enableQ;
          tpc.ExpandQ = savedStates[i].expandQ;
          changes++;
        }
      } // for (i)
    } // if (savedStates)
    return changes;
  } //Topic.RestoreEnableExpandStates()

  static SaveEnableExpandStates(savedStates:EnableExpandState[]=[], topics:Topic[]=null) : EnableExpandState[] {
    if (topics===null) topics=Topic.Topics;
    for (let i=0; i<topics.length; i++) {
      const tpc = topics[i];
      if (tpc && tpc.Name) {
        savedStates.push({topic:tpc, enableQ:tpc.EnableQ, expandQ:tpc.SubTopics ? tpc.ExpandQ : false});
        if (tpc.SubTopics!==null && tpc.SubTopics.length>0)
          Topic.SaveEnableExpandStates(savedStates, tpc.SubTopics);
      }
    } // for (i)
    return savedStates;
  } //Topic.SaveEnableExpandStates()

  static BuildLevelCheckBoxes()
  {
    const lvlListDiv = document.getElementById(R.ID_LvlListDiv) as HTMLDivElement;
    if (lvlListDiv) {
      while (lvlListDiv.firstChild) lvlListDiv.removeChild(lvlListDiv.firstChild);
      for (let i=0; i<Topic.Levels.length; i++) {
        let chkbox = document.createElement("input");
        chkbox.type="checkbox";
        chkbox.style.display="inline-block";
        chkbox.id = "lvl_" + Topic.Levels[i];
        chkbox.checked = Topic.LevelsOnOff[i];
        chkbox.onchange= Topic.EnableDisableLevel;
        lvlListDiv.appendChild(chkbox);

        let label = document.createElement("label");
        label.innerHTML = Topic.Levels[i];
        label.style.display="inline-block";
        label.htmlFor = "lvl_"+Topic.Levels[i];
        lvlListDiv.appendChild(label);
      }
    } // if (lvlListDiv)
  }

  //==========================================================================
  //  BuildTopicTreeList(): rebuild the catList div content by recursively
  //    walking the Topic.Topics tree.
  //==========================================================================
  static BuildTopicTreeList(depth:number=0, topics:Topic[]=null)
  {
    const catListDiv = RevGame.CatListDiv;
    if (catListDiv) {
      if (topics===null || depth===0) {
        topics=Topic.Topics;
        while (catListDiv.firstChild) catListDiv.removeChild(catListDiv.firstChild);
        let someTopLvlExpandedQ=false;
        for (let i=0; i<topics.length; i++) {
          if (topics[i].ExpandQ) {
            someTopLvlExpandedQ=true;
            break;
          }
        }
        const collapseAllBtn = byId(R.ID_CatPickCollapseAllBtn) as HTMLButtonElement;
        if (collapseAllBtn)
          collapseAllBtn.disabled = !someTopLvlExpandedQ;
      } // if (topics===null || depth===0)

      for (let i=0; i<topics.length; i++) {
        let tpc = topics[i];

        if (tpc && tpc.Name) {

//#ifdef DONT_SHOW_EMPTY_TOPICS
          if (tpc.QtnCount<=0)
            continue;
//#endif DONT_SHOW_EMPTY_TOPICS

          // if (stateSave!==null)
          //   stateSave.push({topic:tpc, enableQ:tpc.EnableQ, expandQ:tpc.ExpandQ});

          const barPos = tpc.Name.lastIndexOf('|');
          const tpcNm = tpc.Name.substring(barPos+1);
          let rowSpan = document.createElement("span");
          AddClass(rowSpan, "topicLvl"+depth);

          if (depth) { // indent sub-topics lines.
            let txt="";
            for (let j=0; j<depth; j++) txt+="&emsp;";
            let spacer = document.createElement("span");
            spacer.innerHTML = txt;
            rowSpan.appendChild(spacer);
          }

          // Add a collapse/expand check box (if there are non-empty sub-topics)

          let hasNonEmptySubLvlQ=false;
          if (tpc.SubTopics && tpc.SubTopics.length>0) {
            for (let j=0; j<tpc.SubTopics.length; j++) {
              if (tpc.SubTopics[j].Name && tpc.SubTopics[j].QtnCount>0) {
                hasNonEmptySubLvlQ=true;
                break;
              }
            } // for (j)
          }

          if (hasNonEmptySubLvlQ) {
            let expBox = document.createElement("input");
            expBox.type="checkbox";
            expBox.style.display="none";  // the check box itself is hidden.
            expBox.id="exp_"+tpc.Name;
            expBox.checked = tpc.ExpandQ;
            expBox.onchange= Topic.ExpandCollapseTopic;
            rowSpan.appendChild(expBox);
            let expLabel = document.createElement("label");
            expLabel.htmlFor = "exp_"+tpc.Name;
            AddClass(expLabel, "expandCollapseIcon");
            rowSpan.appendChild(expLabel);
          }
          else { // put an empty label there to fill the space
            let expLabel = document.createElement("label");
            AddClass(expLabel, "expandCollapseIcon");
            rowSpan.appendChild(expLabel);
          }

          // If the whole topic/subtopic is empty, there is no need to add the enable/disable checkbox.
          if (tpc.QtnCount>0) {
            let chkbox = document.createElement("input");
            chkbox.type="checkbox";
            chkbox.style.display="inline";
            chkbox.id = tpc.CSSId("cat_");
            let enableQ = tpc.EnableQ;
            for (let parent=tpc.ParentTopic; parent!==null && enableQ; parent=parent.ParentTopic) {
              enableQ=parent.EnableQ;
            }
            chkbox.checked = enableQ;
            chkbox.onchange= Topic.EnableDisableTopic;
            rowSpan.appendChild(chkbox);
          }
          else { // no question under this topic/subtopic yet (probably a placeholder)
            // put an empty label there to fill the space
            let expLabel = document.createElement("label");
            AddClass(expLabel, "expandCollapseIcon");
            rowSpan.appendChild(expLabel);
          }

          let label = document.createElement("label");
          label.innerHTML = tpcNm;
          label.style.display="inline";
          label.htmlFor = tpc.CSSId("cat_");
          // Use a different style for empty topics (this would not be needed if DONT_SHOW_EMPTY_TOPICS is #defined.
          if (tpc.QtnCount<=0)
            AddClass(label, "emptyTopic");
          rowSpan.appendChild(label);
          rowSpan.style.display="inline-block";
          catListDiv.appendChild(rowSpan);
          catListDiv.appendChild(document.createElement("br"));

          if (tpc.SubTopics && tpc.SubTopics.length && tpc.ExpandQ) {
            Topic.BuildTopicTreeList(depth+1, tpc.SubTopics);
          }
        } // if (tpc)
      } // for (i)
    } // if (catListDiv)
  } // BuildTopicTreeList() //

  // Message responder for the Enable/Disable checkbox of each topic/subtopic.
  static EnableDisableTopic(e:Event) {
    if (e && e.target instanceof HTMLInputElement) {
      const id = e.target.id;
      if (id && id.startsWith("cat_")) {
        const topicNm = Topic.NameFromCSSId(id);
        let topic = Topic.FindMatchedSubTopic(Topic.Topics, topicNm);
        if (topic) {
          topic.EnableQ = e.target.checked;
          if (topic.EnableQ) {
            const parents:Topic[]=[];
            if (Topic.InTreeQ(Topic.Topics, topic, parents) && parents.length>0) {
              for (let j=0; j<parents.length; j++)
                parents[j].EnableQ = true;
            }
          }
        }
        Topic.BuildTopicTreeList();
      }
    }
  } //EnableDisableTopic()

  // Message responder for the Expand/Collapse checkbox of each collapsable topic/subtopic
  static ExpandCollapseTopic(e:Event) {
    if (e && e.target instanceof HTMLInputElement) {
      const id = e.target.id;
      if (id && id.startsWith("exp_")) {
        const topicNm = Topic.NameFromCSSId(id);
        let topic = Topic.FindMatchedSubTopic(Topic.Topics, topicNm);
        if (topic) topic.ExpandQ = e.target.checked;
        Topic.BuildTopicTreeList();
      }
    }
  } //ExpandCollapseTopic()

  static CollapseAll() { // collapse the top level topics
    for (let i=0; i<Topic.Topics.length; i++)
      Topic.Topics[i].ExpandQ=false;
    Topic.BuildTopicTreeList();
  } //CollapseAll

  static EnableDisableLevel(e:Event) {
    if (e && e.target && e.target instanceof HTMLInputElement) {
      const id = e.target.id;
      if (id.startsWith("lvl_")) {
        const lvl = id.substring(4);
        let idx = Topic.Levels.indexOf(lvl);
        if (idx>=0 && idx<Topic.LevelsOnOff.length) {
          Topic.LevelsOnOff[idx] = !Topic.LevelsOnOff[idx];
          Topic.BuildLevelCheckBoxes();
        }
      }
    }
  } //EnableDisableLevel()
} //class Topic



class MC extends QuestionBank
{
  // static Cats: CatInfo[] = null;

  // The following is a bunch of fallback question in case no MCQ_XXX.js files are loaded.
  static MCQs: MultChoiceQuestion[] = //{question:string, correctAnswers:string[], incorrectAnswers:string[]}[]=[
  [
    // {DyQ:false, Cat:"", Q:["`3x^2 - 2x^2 = ?`"], Inf:"test",
    //  A:["`x^2`", "b", "c","d", "e", "f"],
    //  Bad:[]
    // },
    {
      DyQ:false, Cat:"Fun", Inf:"Joke",
      Lvl:"E",
      Q:["Which kind of dinosaur is particularly good with words?"],
      A:["Thesaurus"],
      Bad:["Velociraptor", "Triceratops", "Verbosaur", "T.Rex"],
      More:"Thesaurus is a kind of dictionary. `sum_1^n` <br>FIG[broccoli.jpg]"
    },
    {
      DyQ:false, Cat:"Fun", Inf:"Joke", Lvl:"E",
      Q:["What kind of dinosaur never gives up?<br>"],
      A:["Try-try-triceratops", "Try-try-tryceratops",
         "Trytrytriceratops", "Trytrytryceratops",
         "Try-triceratops", "Try-tryceratops",
         "Trytriceratops", "Trytryceratops", ],
      Bad:[""],
      More:"As the proverb goes,<br>'Tis a lesson you should heed,<br>"+
      "Try, try, try again.<br>When at first you don't succeed,<br>Try, try, try again.'"
    },
    { DyQ:false, Cat:"Fun", Lvl:'E', Inf:"IQ",
    Q:["\"The father of this person,\" said the man as he pointed to a photograph in his hand, \"is my father's son, yet I have no brothers and no sons.\"<br>"+
      "Who could be the person in the picture?"],
    A:["His daughter"],
    Bad:["His uncle","His deceased son","An alien","A stranger","His cousin", "Himself"],
    More:"Let say P is the one in the photo.<p>"+
      `The man's father's son could only be the man himself, because the man has no brother.<p>
       Since P's father is the man himself, P is either his son or daughter. Since the man does not have a son, P must be his daughter.`
    },
    { DyQ:false, Cat:"Fun", Lvl:'E', Inf:"Bellos",
    Q:["What is \"Never odd or even\" ?"],
    A:["A palindrome"],
    Bad:["A real number","Any rational number","A function","A mad man","A probability", "A manifold"],
    More: "What more can I say..."
    },
  ];
  static AddBadAns=["All of the above.", "None of the above.", "---", "---"];
  static AllOfTheAbove="All of the above.";
  static NoneOfTheAbove="None of the above.";


  // static QStat:{H:number, F:number}[] = null;  // H:hash F:correct-freq -> -1 means never been asked (i.e. a new question)
  static QStat:QuestionStat[] = [];
  private static _QText(q:MultChoiceQuestion/*, qidx:number*/) {
    let txt="";
    if (q.DyQ) { // dynamically generated questions are identified by its Cat and Inf (and idx?)
      txt+="DYN:"+q.Cat+q.Inf; //+qidx.toString();
    }
    else {
      for (let i=0; i<q.Q.length; i++) txt+=q.Q[i];
      // for (let i=0; i<q.A.length; i++) txt+=q.A[i];
      // for (let i=0; i<q.Bad.length; i++) txt+=q.Bad[i];
    }
    return txt;
  } // _QText() //

  LoadQStat() { // This function should be called once only.
    // this.mQStat = [];
    for (let i=0; i<this.mAllMCQs.length; i++) {
      this.mQStat.push(new QuestionStat(MC._QText(this.mAllMCQs[i])));
    } // for (i)
    let hashClash="";
    for (let i=0; i<this.mQStat.length; i++) {
      for (let j=0; j<i; j++) {
        if (this.mQStat[i].QHash===this.mQStat[j].QHash) {
          if (hashClash) hashClash+=", ";
          hashClash+="Q"+i+":Q"+j;
        }
      }
    }
    if (hashClash!=="") {
      TheGame.ShowHideQuestionNotes(true, "The following questions' hash codes clashed:<br>"+hashClash);
    }

    let qstxt = GetCookie(R.CK_MC_QStat);
    if (qstxt) {
      //console.log(qstxt);
      let qsarr = qstxt.split('\n');
      for (let i=0; i<qsarr.length; i++) {
        let foundQ=false;
        const bar = qsarr[i].indexOf('|');
        ASSERT(bar>=0);
        if (bar>=0) {
          let hash = parseInt(qsarr[i].substr(0,bar), 36);
          for (let j=0; j<this.mQStat.length; j++) {
            if (this.mQStat[j].QHash===hash) {
              this.mQStat[j].FromCookieTxt(qsarr[i].substr(bar+1));
              foundQ=true;
              break;
            }
          } //for(j)
        } // if (bar)
        else
          console.log("Bad QStat:"+qsarr[i])
        if (!foundQ)
          console.log("Unmatched QStat.");
      } //for(i)
    } //if(qstxt)
  } //MC::LoadQStat() //

  private static sWriteQStatCookieTimer=-1;
  private WriteQStatCookie() {
    if (MC.sWriteQStatCookieTimer!==-1) {  // Stop the timer first.
      window.clearTimeout(MC.sWriteQStatCookieTimer);
      MC.sWriteQStatCookieTimer=-1;
    }
    let qstxt="";
    let nout = 0;
    for (let i=0; i<this.mQStat.length; i++) {
      if (this.mQStat[i].NStat>0) {
        const statTxt = this.mQStat[i].ToCookieTxt();
        if (statTxt) {
          if (nout>0) qstxt+="\n";
          qstxt+= statTxt;
          nout++;
        }
        else throw "Bad QuestionStat";
      }
    }
    if (qstxt)
      SetCookie(R.CK_MC_QStat, qstxt);
  } //MC::WriteQStatCookie()

  UpdateQStat(qStat:QuestionStat, /*qidx:number,*/ correctQ:boolean, timeTaken:number) {
    if (MC.sWriteQStatCookieTimer!==-1) {  // If a timer is active, stop the timer first.
      window.clearTimeout(MC.sWriteQStatCookieTimer);
      MC.sWriteQStatCookieTimer=-1;
    }

   if (qStat) //&& qidx<MC.QStat.length && MC.QStat.length===MC.MCQs.length) {
   {
      qStat.AddStat(correctQ, timeTaken);
      // Delay it for 5 sec so that we don't do this too frequently.
      MC.sWriteQStatCookieTimer = window.setTimeout(()=>{
        this.WriteQStatCookie(), 5000;});
    }
  } //MC::UpdateQStat() //

  static BuildTopicList() {
    for (let i=0; i<MC.MCQs.length; i++) {
      if (MC.MCQs[i].Cat!=="backupQ") {
        let topic = Topic.CheckAddTopic(MC.MCQs[i].Cat, MC.MCQs[i].Lvl);
        while (topic) {
          topic.QtnCount++;
          topic = topic.ParentTopic;
        }
      }
    }
  } //MC.BuildTopicList()

  GenQuestionOrder() : number[]
  {
    let qsequence:number[]=null;
    function useCatQ(cat:string) {
      return cat==='backupQ' || Topic.TopicSelectedQ(cat);
    } // useCatQ() //

    let backup:number[]=[];
    if (this.mQStat && this.mQStat.length===this.mAllMCQs.length) {
      let priority:number[]=[];
      let failed:number[]=[];
      let normal:number[]=[];
      for (let i=0; i<this.mQStat.length; i++) {
        if (this.mAllMCQs[i].Cat==='backupQ') {
          backup.push(i);
        }
        else if (useCatQ(this.mAllMCQs[i].Cat)) {
          // if (MC.QStat[i].F<0) priority.push(i);
          // else if (MC.QStat[i].F===0) failed.push(i);
          // else normal.push(i);
//#ifdef DEBUG
          useCatQ(this.mAllMCQs[i].Cat);
//#endif DEBUG

          const stat = this.mQStat[i].Score();
          if (stat===0) priority.push(i);   // never asked questions.
          else if (stat<75) failed.push(i); // poorly answered questions.
          else normal.push(i);
        }
      }
      priority = shuffle(priority);
      failed = shuffle(failed);
      normal = shuffle(normal);
      backup = shuffle(backup);
      qsequence = priority.concat(failed, normal, backup);
    }
    else {
      let qtnList:number[]=[];
      for (let i=0; i<this.mAllMCQs.length; i++) {
        if (this.mAllMCQs[i].Cat==="backupQ") {
          backup.push(i);
        }
        else if (useCatQ(this.mAllMCQs[i].Cat)) qtnList.push(i);
      }
      qsequence = shuffle(qtnList).concat(shuffle(backup));
    }

    if (qsequence===null || qsequence.length<=0) {
      // nothing is selected? use all questions.
      let qtnList:number[]=[];
      for (let i=0; i<this.mAllMCQs.length; i++) {
        qtnList.push(i);
      }
      qsequence = shuffle(qtnList);
    }
    return qsequence;
  } //MC::GenQuestionOrder()//

  mAllMCQs:MultChoiceQuestion[];
  mQStat:QuestionStat[];
  mCurrMCQ:MultChoiceQuestion=null; // macros expanded copy of one of the MC.MCQs[] obj.
  mCurrMCQStat:QuestionStat=null;
  mCorrectAnsStr:string;            // from mCurrMCQ
  mQuestionStr:string;              // from mCurrMCQ
  mChoices:string[];                // text answer choices
  mUserChoiceIdx: number;           // non-negative if an MC choice has been made.
  mUserAnsTxt:string;               // valid only if the text input box is used.
  mQuestionOrder: number[];         // shuffled sequence of indices of Q's in non-excluded categories.
  mCurrQuestionIdx:number;          // index into mQuestionOrder[] which in turn points into MC.MCQs[]
  mAnswerLockedQ:boolean;

  constructor(onAnswer:()=>void)
  {
    super(onAnswer);
    this.mAllMCQs = MC.MCQs;
    this.mQStat = MC.QStat;
    this.mCorrectAnsStr="";
    this.mQuestionStr="";
    this.mChoices=[];

    // if (MC.Cats===null) { // one time initialization
    //   MC.CollectCats();
    //   MC.LoadCatPicks();
    // }
    if (this.mQStat.length===0) { // one time initialization
      this.LoadQStat();
    }

    this.mQuestionOrder = this.GenQuestionOrder();

    this.mCurrQuestionIdx = 0;
    this.mAnswerLockedQ=false;
    this.mUserAnsTxt = null;
  } //MC::constructor()

  UIDivName() {return "MultChoiceDiv";}
  AnswerText():string{return this.mCorrectAnsStr;}
  QuestionText():string{return this.mQuestionStr;}
  CurrQuestionStatIndicator():string {
    return "<span class='qStat'>"+this.mCurrMCQStat.QStatDispTxt()+"&nbsp;</span>";
  }
  Category() : string { return this.mCurrMCQ ? this.mCurrMCQ.Cat : null;}

  static LastAddedMCQCat:string = "sys.Test";
  static LastAddedMCQLvl:string = "O";
  static AddMCQ(qobj:any, genNQs:number=-1, Qbank:MultChoiceQuestion[]=null) {
    if (Qbank===null) Qbank=MC.MCQs;
    try {
      if (typeof qobj === "function") { // a generator function
        genNQs = Math.max(0, genNQs);
        let qGenFcn = qobj as ()=>MultChoiceQuestion;
        for (let i=0; i<genNQs; i++) {
          let dynQ = qGenFcn();
          if (dynQ) {
            dynQ.Inf += "(DYN_"+i+")";
            Qbank.push(dynQ);
          }
        } // for (i)
      }
      else if (Array.isArray(qobj)) {
        let qarr:any[] = qobj as any[];
        for (let i=0; i<qarr.length; i++) {
          let q = qarr[i];
          let cat = q["Cat"];
          if (cat) MC.LastAddedMCQCat = cat;
          let inf = q["Inf"] ? q["Inf"] : null;
          let more = q["More"] ? q["More"] : null;
          let level = q["Lvl"];
          if (typeof level==='string' && level)
            MC.LastAddedMCQLvl=level;
          Qbank.push({DyQ:false, Cat:MC.LastAddedMCQCat, A:q["A"], Q:q["Q"], Bad:q["Bad"], Inf:inf, Lvl:level, More:more});
        } //for (i)
      }
    }
    catch (err) {
      console.log(err);
    }
  } //MC.AddMCQ() //

  RunOutQ() {return this.mCurrQuestionIdx>=this.mQuestionOrder.length;}
  RestartQuestionList() {
    this.mQuestionOrder=this.GenQuestionOrder();
    this.mCurrQuestionIdx=0;
  } // MC::RestartQuestionList()

  /*****************************************************************************
     MacroExpand() process all JS strings in a MultChoiceQuestion obj.
     Sync-choice macros are bracketed with « »

     «opt1|opt2|opt3|...»      Expands into one of the options picked randomly.
     «$A_opt1|opt2|opt3|...»   Labelled expansion: Expands into one of the
                                 options and sync the index of the picked choice with
                                 all other identically labelled macros ('A' here)
                                 E.g. say if the picked choice is "opt2", then another
                                 macro «$A_abc|def|ghi|...» would be expanded
                                 into "def". If the saved index is larger than the
                                 available number of options in a subsequence macro,
                                 the index modulo available options is used.
     «$A7opt1|opt2|opt3|...»   Recorded labelled expansion: Same as above, but
                                 the actual choice string picked (say "opt2") is
                                 saved in one of the 10 [0..9] storage spaces under
                                 the 'A' label.
     «<A7»                     Recall picked choice 7 under 'A', if any. O.w. a
                                 "(???)" will be generated.
   *****************************************************************************/
  static MacroExpand(q:MultChoiceQuestion) : MultChoiceQuestion {
    let macrotab:{lbl:string, optidx:number, mem:string[], nopts:number}[] = [];
    function nameSearch(label:string) : number {
      for (let i=0; i<macrotab.length; i++) {
        if (macrotab[i].lbl===label)
          return i;
      } //for (i)
      return -1;
    } // nameSearch() //
    function macroExpandString(txt:string, pass:number) : string{
      let out:string="";
      let a;
      let altTxtPatt=/«([^»]*)»/g;
      let copyfrom = 0;
      while (null!==(a=altTxtPatt.exec(txt))) {
        // output the non-macro portion before the macro, if any.
        if (a.index>copyfrom) out += txt.substring(copyfrom, a.index);
        if (a[1]==="") {  // "«»" would give a single "«" character.
          out+=(pass===0 ? "«»" : "«");
        }
        else {
          let c;
          let choices = null;
          let idx=-1;
          let macname = null;
          let macidx = -1;
          let memloc = -1;
          let usingQ = false;
          if (null!==(c=a[1].match(/^(\$|<)([a-zA-Z])([0-9_])(.*)$/))) {
            if (pass!==0 && c[1]==="<" && c[3]==="_") {
              out+="(< macro string recall must specify mem number.)";
            }
            else if (!(pass===0 && c[1]==='<')) {
              usingQ = c[1]==="<";
              macname = c[2];
              if (c[3]!=="_")
                memloc=c[3].charCodeAt(0)-0x30;
              macidx = nameSearch(macname);
              choices = c[4];
            }
          }
          else // one-off choices. not recorded.
            choices = a[1];

          if (choices===null) { // ignore or do not process this macro in this pass.
            out+=txt.substring(a.index, altTxtPatt.lastIndex);
          }
          else { // pick from choices
            const splitter= choices.indexOf('¿')>0 ? '¿' : '|';
            let opts:string[]=choices.split(splitter);
            if (!usingQ && opts.length>1) {
              if (idx<0) idx=randInt(0, opts.length-1);
              if (macname) {
                if (macidx<0) { // 1st time encountering this macro
                  let memarr:string[]=[null,null,null,null,null,null,null,null,null,null];
                  if (memloc>=0) memarr[memloc]=opts[idx];
                  macrotab.push({lbl:macname, optidx:idx, mem:memarr, nopts:opts.length});
                  out+=opts[idx];
                }
                else {
                  if (macrotab[macidx].nopts!==opts.length) {
                    out+="(inconsistent number of choices)";
                  }
                  let useidx = macrotab[macidx].optidx % opts.length;
                  out+=opts[useidx];
                  if (memloc>=0) // record the chosen string. (could overwrite previous string recorded.)
                    macrotab[macidx].mem[memloc]=opts[useidx];
                }
              }
              else {
                out+=opts[idx];
              }
            }
            else if (usingQ && macname && macidx>=0 && memloc>=0) { // e.g. \<A0\
              let recall = macrotab[macidx].mem[memloc];
              out+= recall===null ? "(???)" : recall;
            }
          }
        } // if (a[1]==="") .. else .. //
        copyfrom = altTxtPatt.lastIndex;
      } // while () //
      if (copyfrom<txt.length)
        out+=txt.substring(copyfrom);
      return out;
    } // macroExpandString() //

    if (q===null) return null;
    let exq :MultChoiceQuestion = {Cat:q.Cat, Inf:q.Inf, DyQ:q.DyQ, Lvl:q.Lvl,
                                   Q:[], A:[], Bad:[], More:null};
    //pass 0: process the non-recall macros.
    for (let i=0; i<q.Q.length; i++)
      exq.Q.push(macroExpandString(q.Q[i], 0));
    for (let i=0; i<q.A.length; i++)
      exq.A.push(macroExpandString(q.A[i], 0));
    for (let i=0; i<q.Bad.length; i++)
      exq.Bad.push(macroExpandString(q.Bad[i], 0));
    if (q.More) exq.More=macroExpandString(q.More, 0);

    //pass 1: process the recall macros.
    for (let i=0; i<q.Q.length; i++)
      exq.Q[i]=macroExpandString(exq.Q[i], 1);
    for (let i=0; i<q.A.length; i++)
      exq.A[i]=macroExpandString(exq.A[i], 1);
    for (let i=0; i<q.Bad.length; i++)
      exq.Bad[i]=macroExpandString(exq.Bad[i], 1);
    if (exq.More) exq.More=macroExpandString(exq.More, 1);
    return exq;
  } //MC.MacroExpand() //


  //MC::BuildQuestion()
  BuildQuestion()
  {
    if (this.RunOutQ()) {
      this.RestartQuestionList();
    }
    this.mCurrMCQ = MC.MacroExpand(this.mAllMCQs[this.mQuestionOrder[this.mCurrQuestionIdx]]);
    this.mCurrMCQStat = this.mQStat[this.mQuestionOrder[this.mCurrQuestionIdx]];
    this.mCurrQuestionIdx++;
    this.mCorrectAnsStr=this.mCurrMCQ.A[randInt(0, this.mCurrMCQ.A.length-1)];//so we can find it again after the mix-up.
    this.mQuestionStr=this.mCurrMCQ.Q[randInt(0, this.mCurrMCQ.Q.length-1)];// get a random question
    this.mChoices=[];

    if (this.mCurrMCQ.Bad.length>1) { // o.w. cannot generate 5 choices.
      if (this.mCurrMCQ.A.length>=3 && (this.mCurrMCQ.Bad.length<3 || Math.random()>0.8)) { // enough correct answer to create "All of the above" case.
        this.mChoices=[];
        let badans = randPermNPM(this.mCurrMCQ.A.length, Math.min(this.mCurrMCQ.A.length, 4));
        for (let i=0;i<badans.length; i++)
          this.mChoices.push(this.mCurrMCQ.A[badans[i]]);
        this.mChoices = shuffle(this.mChoices);
        this.mChoices.push(MC.AllOfTheAbove);
        this.mCorrectAnsStr = MC.AllOfTheAbove;
        if (badans.length===3)
          this.mChoices.push(MC.NoneOfTheAbove);
        this.mCorrectAnsStr = MC.AllOfTheAbove;
      }
      else {
        let badans=randPermNPM(this.mCurrMCQ.Bad.length, 4);// get 4 random wrong answers (if there are enough of that).
        for (let i=0;i<badans.length; i++) {
          this.mChoices.push(this.mCurrMCQ.Bad[badans[i]]);
        }
        this.mChoices.push(this.mCorrectAnsStr); // add one correct answer
        this.mChoices=shuffle(this.mChoices);   // shuffle them first.

        if(this.mChoices.length<5) { // not enough wrong answers
          let nneeded=5-this.mChoices.length;
          if (nneeded===1) {
            this.mChoices.push(Math.random()>0.5 ? MC.AllOfTheAbove : MC.NoneOfTheAbove);
          }
          else {
            for (let i=0; i<nneeded; i++)
              this.mChoices.push(MC.AddBadAns[i]);
          }
        }// if (<5)
      }
    }
    else {  // in this case, we shall use text input for answers.
      // use the first one as the nominal correct answer, although all A[]s will be compared.
      this.mCorrectAnsStr = this.mCurrMCQ.A[0];
    }
    this.mUserChoiceIdx = -1;
    this.mUserAnsTxt = null;
  } //MC::BuildQuestion()

  OnKeyPress(e:KeyboardEvent) {
    function chkkeyrange(self:MC, code:number, range1st:number) {
      if (code>=range1st && code<range1st+5) {
        self.mUserChoiceIdx=code-range1st;
        self.OnAnswerTrigger();
        return true;
      }
      else return false;
    }; //chkkeyrange()//
    if (this.mChoices.length>0 &&   // ===0 means we are using text input.
        !this.mAnswerLockedQ &&
        e && e instanceof KeyboardEvent) {
      let keycode = e.key && e.key.length===1 ? e.key.charCodeAt(0) : -1;
      chkkeyrange(this, keycode, 0x41) || chkkeyrange(this, keycode, 0x31) || chkkeyrange(this, keycode,0x61);
    }
  } //MC::OnKeyPress()

  OnUserAnsInput(anstxt:string) {
    this.mUserAnsTxt=anstxt.trim();
    this.OnAnswerTrigger();
  } //MC::OnUserAnsInput()//

  ShowQuestion(_clearAnsQ:boolean)
  {
    // let mcdiv=byId("MultChoiceDiv");
    let thisQuestion=byId("question");
    thisQuestion.innerHTML=addFigures(this.mQuestionStr);
    let mctab = byId("MCTab");
    let mcansbox = byId("MCAnsBox") as HTMLInputElement;
    if (this.mChoices===null || this.mChoices.length===0) {
      mctab && (mctab.hidden=true);
      if (mcansbox) {
        mcansbox.hidden=false;
        mcansbox.value = "";
        mcansbox.focus();
      }
    }
    else {
      mctab && (mctab.hidden=false);
      mcansbox && (mcansbox.hidden=true);
      for (let i=0; i<5; i++) {
        let tr = byId("Choice"+String.fromCharCode(65+i)+"Box") as HTMLTableRowElement;
        if (tr) {
          RemoveClass(tr, "wrongPick");
          RemoveClass(tr, "correctPick");
          tr.onclick = ()=>{
            if (!this.mAnswerLockedQ) {
              this.mUserChoiceIdx=i; this.OnAnswerTrigger();
            }
          };
        }
        let txt = byId("Choice"+String.fromCharCode(65+i)+"Txt") as HTMLSpanElement;
        txt.innerHTML = i<this.mChoices.length ? this.mChoices[i] : "";
      } // for (i)
    }
    this.mAnswerLockedQ=false;
    this.mUserChoiceIdx = -1;
  } //MC::ShowQuestion()

  // static MathParser = math.parser();
  CheckAnswer(timeTaken:number) // check if answer selected is in the array of correct answers.
  {
    let correctQ = false;
    if (this.mChoices.length===0) {
      let ansBox = byId("MCAnsBox");
      if (ansBox) ansBox.focus();
      if (this.mUserAnsTxt!==null && this.mUserAnsTxt!=="") {
        for (let i=0; i<this.mCurrMCQ.A.length; i++) {
          let ans = this.mCurrMCQ.A[i];
          // let matharr = ans.match(/^`([^`]*)`$/);
          // if (matharr) { // if the answer is bracketed by ` `, assume that it is a math expression.
          //   let compare = matharr[1] + "- ("+this.mUserAnsTxt+")";
          //   try {
          //     if (math.simplify(compare).toString()==="0") {
          //       correctQ=true; break;
          //     }
          //   }
          //   catch(err) {
          //   }
          // }
          // else
          if (this.mUserAnsTxt.toLowerCase().replace(/\s/g,'')===ans.toLowerCase().replace(/\s/g,'')) {
            correctQ=true; break;
          }
        } // for (i)
      }
      else return 0; // incomplete answer. don't judge yet.
    }
    else if (this.mUserChoiceIdx>=0) {
      correctQ = this.mChoices[+this.mUserChoiceIdx]===this.mCorrectAnsStr;
      let tr = byId("Choice"+String.fromCharCode(65+this.mUserChoiceIdx)+"Box") as HTMLTableRowElement;
      if (tr) AddClass(tr, correctQ ? "correctPick" : "wrongPick");
    }
    else return 0; // incomplete answer. don't judge yet.

    // Judged. Update question stats.
    if (this.mQStat && this.mQStat.length===this.mAllMCQs.length) {
      ASSERT(this.mCurrMCQStat.QHash===yHash(MC._QText(this.mAllMCQs[this.mQuestionOrder[this.mCurrQuestionIdx-1]])));
      this.UpdateQStat(this.mCurrMCQStat /*this.mQuestionOrder[this.mCurrQuestionIdx-1]*/, correctQ, timeTaken);
    }
    this.mAnswerLockedQ=true;
    return correctQ ? 1 : -1;
  } //MC::CheckAnswer()

  QuestionNotes() {return this.mCurrMCQ ? this.mCurrMCQ.More : null;}
} //class MC

// class MC2 extends MC
// {
//   static sMCQBank:MultChoiceQuestion[]=[];
//   static sQStat:QuestionStat[]=[];
//   // static GenQuestionOrder()
//   // {
//   //   let qtnList:number[]=[];
//   //   for (let i=0; i<MC2.MCQs.length; i++) {
//   //     qtnList.push(i);
//   //   }
//   //   return shuffle(qtnList);
//   // } //MC.GenQuestionOrder()//

//   static AddMCQ(qobj:any, genNQs:number=-1)
//   {
//     MC.AddMCQ(qobj, genNQs, MC2.sMCQBank);
//   }

//   constructor(onAnswer:()=>void)
//   {
//     MC.MCQs = MC2.sMCQBank;
//     MC.QStat = MC2.sQStat;
//     super(onAnswer);
//     // MC.MCQs = MC2.sMCQBank;
//     // this.mQuestionOrder = MC2.GenQuestionOrder();
//   } //MC2::constructor()
// }

//#ifdef GEN_ARITHQ
//# MC.AddMCQ(()=>{ // dynamically generate some decimal arithmetic questions.
//#   function randVal(range:number=12) :deciFloat {
//#     let v = randInt(1,range);
//#     let dec = randInt(-2,0);
//#     return new deciFloat(v, dec);
//#   }
//#   function genterm(prevop:number) : {txt:string, val:deciFloat, op:number} {
//#     let op = randInt(0,prevop>1 ? 1 : 3);
//#     if (op>1) {
//#       let val = randVal(19);
//#       return {txt:val.toString(), val:val, op:3};
//#     }
//#     else {
//#       let v1=randVal();
//#       let v2=randVal();
//#       let prd = v1.mult(v2);
//#       if (op===0)  // multiply
//#       {
//#         return {txt:v1.toString()+" xx "+v2.toString(), val:prd, op:op};
//#       }
//#       else {
//#         return {txt:prd.toString() + "-:" + v1.toString(), val:v2, op:op};
//#       }
//#     }
//#   } // genterm()
//#
//#   let q={DyQ:true, Cat:"Arithmetic", Inf:"Decimal Arithmetic", Q:[""], A:[""],Bad:[""]};
//#
//#   let term1=genterm(-1);
//#   let term2=genterm(term1.op);
//#   let op = randInt(0,1);
//#   q.Q[0]="`"+term1.txt + (op===0 ? " + " : " - ") + term2.txt + " = ?`";
//#   q.A[0]=(term1.val.add(term2.val, op!==0)).toString();
//#   return q;
//# }, 4); //<-- how many of these boring questions should we generate.
//#endif GEN_ARITHQ

class GameTarget {
  mType:string;
  mNCombo:number;
  mNQuestions:number;
  mWinPercent:number;

  // SetTarget() would return false if the input values are not valid.
  SetTarget(type:string, target:number, winPercent:number=70) : boolean {
    let validQ=true;
    if (type==="Combo") {
      this.mType=type;
      this.mNCombo = target;
      this.mNQuestions = Math.min(100, target*3);
      this.mWinPercent = winPercent;
    }
    else if (type==="NumQuest" || type==="ChinWords") {
      this.mType=type;
      this.mNCombo = this.mNQuestions = target;
      this.mWinPercent = winPercent;
    }
    else
      validQ=false;
    return validQ;
  } //GameTarget::SetTarget()

  SetFromString(tgt:string) {
    if (tgt) {
      let parts = tgt.split(",");
      if (parts.length===4) {
        this.mType=parts[0];
        this.mNCombo=+parts[1];
        this.mNQuestions=+parts[2];
        this.mWinPercent=+parts[3];
      }
    } //if (tgt)
  } //GameTarget::SetFromString()

  OutputToString() :string {
    let txt="";

    return this.mType + "," +
       this.NCombo() + "," +
       this.NQuestion() + "," +
       this.WinPercent();
  } //GameTarget:OutputToString()

  constructor(type:string="Combo", target:number=3, winPercent:number=70) {
    this.mType="Combo";
    this.mNCombo=3;
    this.mNQuestions=50;
    this.mWinPercent=60;
    if (type==="Combo" || type==="NumQuest" || type==="ChinWords")
      this.SetTarget(type, target, winPercent);
  } //GameTarget::constructor()

  Type() {return this.mType;}
  NCombo() {return this.mType==="Combo" ? Math.min(50,Math.max(3,this.mNCombo)): 999;}
  NQuestion() {return Math.max(3, Math.min(this.mNQuestions, 100));}
  WinPercent() {return Math.max(0,Math.min(100, this.mWinPercent))};
  TargetVal() {return this.mType==="Combo" ? this.NCombo() : this.NQuestion();}
} //class GameTarget




//==================================================================================================
//==================================================================================================
//
//
//The RevGame class
//
//
//===================================================================================================
//==================================================================================================
class RevGame {
  mNQuestion:number;
  mNCorrect:number;
  mMaxCombo:number;
  mCurrCombo:number;
  mNewQuestionQ:boolean;
  mWasCorrectQ:boolean;
  mWrongAnswers:string;
  mQuestionStartTime:      number;    // in msec
  mQuestionClockSuspendTime: number;  // >0: time when the user stopped the clock. -ve means clock not suspended.

  mQuestionBank: QuestionBank;

  mMsgBox: HTMLElement;
  mPickCatBtn : HTMLButtonElement;
  mHeatBar: HTMLSpanElement;
  mHeatBg: HTMLDivElement;
  mGameTargetTypeSel: HTMLSelectElement;
  mGameTargetValSel:  HTMLSelectElement;
  mCatPickCancelBtn: HTMLButtonElement;
  mCatPickOKBtn: HTMLButtonElement;

  static Target: GameTarget = null;
  mGameEndedQ:boolean;

  static ShowHideEndOfQBar(showQ:boolean, hasNoteQ:boolean) {
    if (RevGame.EndOfQBtnBar) {
      if (TheGame===null || TheGame.mGameEndedQ) showQ=false;
      RevGame.EndOfQBtnBar.hidden = !showQ;
      RevGame.EndOfQBtnBar.style.display = showQ ? "block" : "none";
      if (RevGame.ShowNotesButton) {
        RevGame.ShowNotesButton.hidden = !hasNoteQ;
        RevGame.ShowNotesButton.disabled = !hasNoteQ;
      }
    }
  } //RevGame.ShowHideEndOfQBar()//

  Reset() {
    this.mGameEndedQ = false;
    this.mNQuestion = 0;
    this.mNCorrect  = 0;
    this.mMaxCombo  = 0;
    this.mCurrCombo = 0;
    this.mNewQuestionQ = true;
    this.mWasCorrectQ = false;
    this.mWrongAnswers = "Mistake(s): <br>\n";
    this.mQuestionBank = null;
    this.mQuestionStartTime=-1;
    this.mQuestionClockSuspendTime=-1;

    RevGame.ShowHideEndOfQBar(false,false);
    // if (this.mNextButton) {
    //   this.mNextButton.hidden = true;
    //   this.mNextButton.disabled = true;
    // }
    if (this.mMsgBox) {
      this.mMsgBox.innerHTML = "Let's do a fun quiz!";
    }
    let wronglist = byId("wrongrec");
    if (wronglist) wronglist.innerHTML="";
    this.UpdateHeatBar();
  } //RevGame::Reset() //

  // private static origWindowOnKeyPress:(e:KeyboardEvent)=>void = null;
  constructor() {
    this.mGameTargetTypeSel = byId("targetTypeSel") as HTMLSelectElement;
    this.mGameTargetValSel  = byId("targetValSel") as HTMLSelectElement;

    this.mPickCatBtn = byId("pickCatBtn") as HTMLButtonElement;
    if (this.mPickCatBtn)
      this.mPickCatBtn.onclick = ()=>{
        this.PickCatDialog(false);
      }

    let okbtn = byId(R.ID_CatPickOKBtn) as HTMLButtonElement;
    if (okbtn) {
      // OK/Update button do this:
      okbtn.onclick = ()=>{
        if (this.mGameTargetTypeSel.value!==RevGame.Target.Type() ||
            +this.mGameTargetValSel.value!==RevGame.Target.TargetVal())
        {
          RevGame.Target.SetTarget(this.mGameTargetTypeSel.value,
            +this.mGameTargetValSel.value);
          SetCookie(R.CK_GameTarget, RevGame.Target.OutputToString());
        }

        let pickerDiv = byId("catPicker") as HTMLDivElement;
        if (!pickerDiv.hidden) {
          // Rebuild the enable/expand state list from the current tree, then save it to the cookie.
          Topic.WriteTopicEnableExpandStatesToCookie(Topic.SaveEnableExpandStates());
          Topic.WriteLevelOnOffStatesToCookie();
          pickerDiv.hidden=true;
          this.StartQuestionRound();
        }
      };
    } // if (okbtn)
    this.mCatPickOKBtn = okbtn;

    // Cancel -> restore the topic enable/expand states and hide the dialog:
    const cancelbtn= byId(R.ID_CatPickCancelBtn) as HTMLButtonElement;
    cancelbtn.onclick= ()=>{
      // console.log("cancel clicked");
      let pickerDiv = byId("catPicker") as HTMLDivElement;
      if (!pickerDiv.hidden) {  // for some reason this function got called twice on a single click on the Cancel button.
        pickerDiv.hidden=true;
        Topic.RestoreEnableExpandStates(RevGame.SavedTopicStates);
        Topic.LevelsOnOff = RevGame.SavedLevelStates;
        if (!RevGame._clockWasSuspendedBeforeCatPickerQ) {
          RevGame.SuspendResumeClockDisplay(); // resume the clock after cancelling.
        }
      }
    };
    this.mCatPickCancelBtn =cancelbtn;

    let collapseBtn = byId("catPickerAllOffBtn") as HTMLButtonElement;
    collapseBtn.onclick= Topic.CollapseAll;

    this.mMsgBox = byId("gameMsg");

    // if (RevGame.origWindowOnKeyPress===null) RevGame.origWindowOnKeyPress=window.onkeypress;
    window.addEventListener("keypress", (e:KeyboardEvent)=>{
      if (this.mQuestionBank && !(RevGame.MathPadDiv && !RevGame.MathPadDiv.hidden))
        this.mQuestionBank.OnKeyPress(e);
    });
    let mcAnsBox = byId("MCAnsBox") as HTMLInputElement;
    if (mcAnsBox) mcAnsBox.addEventListener("keypress", (e:KeyboardEvent)=>{
      if (e && e.key==="Enter" && e.target===mcAnsBox && this.mQuestionBank) {
          this.mQuestionBank.OnUserAnsInput(mcAnsBox.value);
        // this.mCurrQuestion.SetUserAnsText(mcAnsBox.value);
        // this.mCurrQuestion.OnAnswerTrigger();
      }
    });
    let ansBox = byId("ans") as HTMLInputElement;
    if (ansBox) {
      ansBox.addEventListener("keypress", (e:KeyboardEvent)=>{
        if (e && e.key==="Enter" && this.mQuestionBank) {
          this.mQuestionBank.OnUserAnsInput(ansBox.value);
          // this.mCurrQuestion.SetUserAnsText(ansBox.value);
          // this.mCurrQuestion.OnAnswerTrigger();
        }
      });
    }

    this.LoadGameTarget();

    this.mHeatBar = byId("heatBar") as HTMLSpanElement;
    this.mHeatBg = byId("heatBg") as HTMLDivElement;

    MC.BuildTopicList();
    Topic.LoadTopicEnableExpandStatesFromCookie();
    Topic.LoadLevelOnOffStatesFromCookie();

    this.Reset();
  } //RevGame::constructor() //

  private LoadGameTarget() {
    let tgt = GetCookie(R.CK_GameTarget);
    if (tgt) {
      RevGame.Target.SetFromString(tgt);
    }
  } //RevGame::LoadGameTarget()

  static SavedTopicStates: EnableExpandState[]=null;
  static SavedLevelStates: boolean[]=null;
  static _clockWasSuspendedBeforeCatPickerQ=false;
  private PickCatDialog(noCancelQ=false) {
    const catListDiv = RevGame.CatListDiv;
    if (catListDiv && catListDiv instanceof HTMLDivElement) {

      if (this.mCatPickCancelBtn) {
        this.mCatPickCancelBtn.hidden = noCancelQ;
      }
      this.mGameTargetTypeSel.selectedIndex =
        RevGame.Target.Type()==="Combo" ? 0 : 1;

      if (this.mGameTargetValSel) {
        const val = RevGame.Target.TargetVal();
        const opts = this.mGameTargetValSel.options;
        let mindiff=9e99;
        let bestidx=-1;
        if (opts) {
          const nopts = opts.length;
          for (let i=0; i<nopts && mindiff>0; i++) {
            const o = opts.item(i) as HTMLOptionElement;
            if (Math.abs(+o.value - val)<mindiff) {
              mindiff=Math.abs(+o.value-val);
              bestidx=i;
            }
          }
          this.mGameTargetValSel.selectedIndex=bestidx;
        }
      } // if (this.mGameTargetValSel)

      if (this.mCatPickOKBtn) {
        this.mCatPickOKBtn.innerHTML = noCancelQ ? "Start Quiz!" : "Restart";
      }

      RevGame.SavedTopicStates = Topic.SaveEnableExpandStates();
      RevGame.SavedLevelStates = Topic.LevelsOnOff.slice(0);
      Topic.BuildTopicTreeList();
      Topic.BuildLevelCheckBoxes();

      let pickerDiv = byId("catPicker") as HTMLDivElement;
      if (pickerDiv) {
        pickerDiv.hidden=false;

        RevGame._clockWasSuspendedBeforeCatPickerQ=TheGame.mQuestionClockSuspendTime>0;
        if (!RevGame._clockWasSuspendedBeforeCatPickerQ)
          RevGame.SuspendResumeClockDisplay(); // suspend the clock before showing the dialog.

      } // if (pickerDiv)
    } // if (catlistdiv)
  } //RevGame::PickCatDialog() //

  public StartQuestionRound()
  {
    // this.mQuestionBank.RestartQuestionList();
    this.Reset();
    this.NextQuestion();
  } //RevGame::StartQuestionRound()

  static scrollingDiv:HTMLDivElement=null;
  static scrollUpQ:boolean=true;  // up means showing, down means hiding.
  static scrollTimer:number=-1;
  static scroller() { // Timer callback for scrolling up/down the question notes div.
    const step = 80;
    let div = RevGame.scrollingDiv;
    let doneQ = false;
    if (div) {
      let parent : HTMLElement = div.offsetParent as HTMLElement;
      if (parent) {
        if (RevGame.scrollUpQ) {
          doneQ = div.offsetTop -10<=0;
          div.style.top = Math.max(div.offsetTop -step, 0).toString() + "px";
        }
        else {
          doneQ = div.offsetTop+10>=parent.clientHeight;
          div.style.top = Math.min(div.offsetTop +step, parent.clientHeight).toString() + "px";
          if (doneQ) {
            let tutdiv = byId("tutorial") as HTMLDivElement;
            if (tutdiv) {
              tutdiv.style.display="none";
              if (RevGame.NextButton) {
                RevGame.NextButton.focus();
              }
            }
          }
        }
      } // if (parent)
    } // if (div)
    if (doneQ && RevGame.scrollTimer!==-1) {
      window.clearInterval(RevGame.scrollTimer);
      RevGame.scrollTimer=-1;
    }
  } //RevGame.scroller() //

  public ShowHideQuestionNotes(showQ:boolean, msg:string=null, cssClass:string=null) {
    let tutdiv = byId("tutorial") as HTMLDivElement;
    if (tutdiv) {
      if (showQ) { tutdiv.style.display = "block"; }
      let contdiv = byId("tutorialContentDiv") as HTMLDivElement;
      RevGame.scrollingDiv =contdiv;
      if (RevGame.scrollingDiv) {
        RevGame.scrollUpQ = showQ;
        if (showQ) {
          contdiv.className = (cssClass ? cssClass : "tutorialContentDiv") + " noselect";
          RevGame.scrollingDiv.style.top = (tutdiv.clientHeight-20).toString()+"px";
        }
        if (RevGame.scrollTimer===-1)
          RevGame.scrollTimer = window.setInterval(RevGame.scroller, 20);

        // If msg is given, it is displayed instead of any question notes.
        contdiv.innerHTML = addFigures(msg ? msg : this.mQuestionBank.QuestionNotes());
        MathJax.Hub.Queue(["Typeset", MathJax.Hub, contdiv]); // call MathJax to asynchronously typeset any math expressions created in ShowQuestion().
      }
    }
  } //RevGame::ShowHideQuestionNotes() //

  static QuestionClockTimer=-1;
  static ClearQuestionClockTimer()
  {
    if (RevGame.QuestionClockTimer!==-1) {
      window.clearInterval(RevGame.QuestionClockTimer);
      RevGame.QuestionClockTimer=-1;
      // RemoveClass(RevGame.ClockDisp, "clockPaused");
    }
  } //RevGame.ClearQuestionClockTimer()
  static StartQuestionClockTimer()
  {
    if (RevGame.QuestionClockTimer===-1)
      RevGame.QuestionClockTimer =
        window.setInterval(RevGame.UpdateQuestionClockDisplay, 100);
  }

  static _prevClockTxt:string="";
  static UpdateQuestionClockDisplay()
  {
    if (TheGame && TheGame.mQuestionClockSuspendTime<0) {
      RemoveClass(RevGame.ClockDisp, R.CC_ClockPaused);
      let qTime = Math.round((performance.now() - TheGame.mQuestionStartTime)/1000);
      if (qTime>=0) {
        const clockEle = byId(R.ID_ClockDisp) as HTMLElement;
        if (clockEle) {
          const min= Math.floor(qTime/60);
          const txt = (min===0 ? "" : min.toString()) +
            ((qTime%60)<10 ? ":0" : ":") +
            (qTime%60).toString();
          if (txt!==RevGame._prevClockTxt) {
            RevGame._prevClockTxt=txt;
            clockEle.innerHTML = txt;
          }
        }
      }
    }
  } //RevGame.UpdateQuestionClockDisplay()

  static SuspendResumeClockDisplay()
  {
    if (TheGame && !TheGame.mGameEndedQ) {
      const tnow = performance.now();
      if (TheGame.mQuestionClockSuspendTime<0) {
        TheGame.mQuestionClockSuspendTime=tnow;
        AddClass(RevGame.ClockDisp, R.CC_ClockPaused);
        RevGame.ClearQuestionClockTimer();
      }
      else {
        RemoveClass(RevGame.ClockDisp, R.CC_ClockPaused);
        const suspendedDuration = tnow-TheGame.mQuestionClockSuspendTime;
        if (suspendedDuration>0 && TheGame.mQuestionStartTime>0) {
          TheGame.mQuestionStartTime+=suspendedDuration;
        }
        TheGame.mQuestionClockSuspendTime=-1;
        RevGame.StartQuestionClockTimer();
      }
    }
  } //RevGame.SuspendResumeClockDisplay()

  //====================================================
  //NextQuestion: Generate and display a new question
  //====================================================
  public NextQuestion() {
    if (TheGame && TheGame.mGameEndedQ) {
      RevGame.ClearQuestionClockTimer();

      if (RevGame.Target.Type()==="Combo") {
        RevGame.ShowHideEndOfQBar(false, false);
        this.ShowHideQuestionNotes(true,
          (this.mCurrCombo>=RevGame.Target.NCombo()
          ? "Well done!<p>You've reached the target of "+RevGame.Target.NCombo()+" combos!<p>"
          : "Sorry... You've failed to reach the target...<p>") +
          "You have correctly answered "+this.mNCorrect+"/"+this.mNQuestion+
          " questions ("+Math.round(this.mNCorrect/this.mNQuestion*100)+"%)",
          "gameEndMsg"); //<-- use this CSS class for styling the div
      }
      else {
        if (this.mGameEndedQ) {
          RevGame.ShowHideEndOfQBar(false, false);
          this.ShowHideQuestionNotes(true,
            "Game Ended.<p>You have correctly answered "+this.mNCorrect+"/"+this.mNQuestion+
            " questions ("+Math.round(this.mNCorrect/this.mNQuestion*100)+"%)",
            "gameEndMsg"); //<-- use this CSS class for styling the div
        }
      }
      // RevGame.ShowHideEndOfQBar(false, false);
    }
    else {
      this.UpdateScoreDisplay();
      if (this.mQuestionBank===null) {
        this.mQuestionBank = new MC(this.SubmitAnswer.bind(this));
        // this.mQuestionBank = RevGame.Target.Type()!=="ChinWords" ? new MC(this.SubmitAnswer.bind(this))
        //   : new ChinCharQuestions(this.SubmitAnswer.bind(this));
      }
      else if (this.mQuestionBank.RunOutQ()) { // Exhausted all questions?
        // Move onto dynamically generated Arithmetic questions.
        this.mQuestionBank = new ArithmeticQuestions(this.SubmitAnswer.bind(this));
        // this.mQuestionBank = new MC2(this.SubmitAnswer.bind(this));
      }

      let uidiv = this.ShowUIDiv(this.mQuestionBank.UIDivName());
      this.mQuestionBank.BuildQuestion();
      this.mQuestionBank.ShowQuestion(true);
      this.mNQuestion++;
      this.mQuestionStartTime = performance.now();
      this.mQuestionClockSuspendTime =-1; // -ve means not suspended.
      RevGame.StartQuestionClockTimer();

      let questionHeader = byId("QHead");
      if (questionHeader)
        questionHeader.innerHTML =
          this.mQuestionBank.CurrQuestionStatIndicator() +
          "Question "+ this.mNQuestion.toString() + (this.mQuestionBank.Category() ? " : ("+this.mQuestionBank.Category()+")" : ": (sys.test)");

      MathJax.Hub.Queue(["Typeset", MathJax.Hub, uidiv]); // call MathJax to asynchronously typeset any math expressions created in ShowQuestion().
      // if (this.mNextButton) {
      //   this.mNextButton.hidden=true;
      // } // if (nxtQBtn)
      RevGame.ShowHideEndOfQBar(false, this.mQuestionBank.QuestionNotes() ? true : false);
      if (this.mMsgBox) {
        this.mMsgBox.innerHTML = "";
      }
    }
  } //RevGame::NextQuestion() //

  private ShowUIDiv(divname:string) : HTMLDivElement{
    let matcheddiv:HTMLDivElement = null;
    let eles = document.getElementsByClassName("UIDiv");
    for (let i=0; i<eles.length; i++) {
      let div = eles.item(i) as HTMLDivElement;
      let showQ = (div.id===divname);
      div.hidden = !showQ;
      div.style.display = showQ ? "block" : "none";
      if (showQ && matcheddiv===null) matcheddiv=div;
    } // for (i) //
    return matcheddiv;
  } //RevGame::ShowUIDiv() //

  private NSecTakenForThisQuestion() : number {
    return this.mQuestionClockSuspendTime>0 ? -1 : (performance.now()-this.mQuestionStartTime)/1000;
  } //RevGame.NSecTakenForThisQuestion()

  //SubmitAnswer() is called after an answer is given by the user.
  private SubmitAnswer() {
    let msg="";
    RevGame.ClearQuestionClockTimer();
    let correct = this.mQuestionBank.CheckAnswer(this.NSecTakenForThisQuestion());
    if (correct===0) { // ===0 means the answer is incomplete or is ignored.
      this.mQuestionBank.ShowQuestion(true); // redisplay the question.
      let uidiv = this.ShowUIDiv(this.mQuestionBank.UIDivName());
      MathJax.Hub.Queue(["Typeset", MathJax.Hub, uidiv]); // call MathJax to asynchronously typeset any math expressions created in ShowQuestion().
    }
    else {
      if (correct>=1) {
        msg=correct===1 ? "Correct!" : "(doesn't count)";
        if (this.mNewQuestionQ) {
          this.mNCorrect++;
          this.mCurrCombo++;
          if (this.mCurrCombo>this.mMaxCombo) this.mMaxCombo=this.mCurrCombo;
        }
        this.mWasCorrectQ=true;
      }
      else {
        msg="Sorry...";
        let anstxt = this.mQuestionBank.AnswerText();
        if (anstxt) msg+="It should be: " + anstxt;

        // Append to the wrong answers list. (For self-evaluation and debugging)
        this.mWrongAnswers += " Q" + this.mNQuestion;
        if (this.mQuestionBank.SummaryText())
          this.mWrongAnswers += " "+this.mQuestionBank.SummaryText();
        else
          this.mWrongAnswers += " "+TheGame.TruncateQuestion(this.mQuestionBank.QuestionText());
        this.mWrongAnswers += "<br>\n";
        this.mCurrCombo = 0;
        this.mWasCorrectQ = false;
        let wronglist = byId("wrongrec");
        if (wronglist) wronglist.innerHTML=this.mWrongAnswers;
      }
      this.UpdateScoreDisplay();
      RevGame.ShowHideEndOfQBar(true, this.mQuestionBank.QuestionNotes() ? true : false);
      if (RevGame.NextButton) {
        RevGame.NextButton.disabled=false;
        RevGame.NextButton.focus();
      }
    }

    if (this.mMsgBox) {
      this.mMsgBox.innerHTML = msg;
      MathJax.Hub.Queue(["Typeset", MathJax.Hub, this.mMsgBox]);
    }
    this.UpdateHeatBar();
  } //RevGame::Check()

  private TruncateQuestion(txt:string) :string {
    let nohtml = txt.replace(/<[a-zA-Z][^>]+>|FIG\[[^\]]+\]/g, "");
    if (nohtml.length>40) return nohtml.substr(0, 38) + "...";
    else return nohtml;
  } //RevGame::TruncateQuestion() //

  private UpdateScoreDisplay() {
    let score = byId("Score");
    if (score) {
      score.innerHTML = "";
      if (this.mNQuestion>0)
        score.innerHTML = "Correct: " + this.mNCorrect + "/" + this.mNQuestion + "   Combo: " + this.mCurrCombo+" (Max: "+this.mMaxCombo+")";
      else
        score.innerHTML = RevGame.Target.Type()==="Combo" ?
          "Get "+RevGame.Target.NCombo()+" combos to win!" :
          "Prepare for "+RevGame.Target.NQuestion()+" questions...";
    }
  } //RevGame::UpdateScoreDisplay()//

  private UpdateHeatBar() {
    if (RevGame.Target.Type()==="Combo") {
      const TARGETCOMBO = RevGame.Target.NCombo();
      if (this.mHeatBar && this.mHeatBg) {
        let percent = this.mNCorrect/this.mNQuestion;

        let pchotness = Math.max(0,percent-(100-RevGame.Target.WinPercent())/100)/RevGame.Target.WinPercent()*100;  // min. 0.4
        let cbhotness = Math.min(TARGETCOMBO,this.mMaxCombo)/TARGETCOMBO*pchotness*100;
        this.mHeatBg.className = "meter " +
          ((pchotness > 0.66 && this.mNCorrect>5) ? "yellow" :
          (pchotness > 0.33) ? "" :
          "red");
        this.mHeatBg.style.backgroundColor = cbhotness>80 ? "lightyellow" : "white";
        // this.mGameEndedQ = cbhotness>=100 || this.mNQuestion>=RevGame.Target.NQuestion();
        this.mGameEndedQ = (Math.max(this.mMaxCombo, this.mCurrCombo)>=TARGETCOMBO) || this.mNQuestion>=RevGame.Target.NQuestion();
        this.mHeatBar.style.width = Math.min(100, Math.round(this.mCurrCombo/RevGame.Target.NCombo()*100))+"%";

        // if (this.mGameEndedQ) {
        //   RevGame.ShowHideEndOfQBar(false, false);
        //   this.ShowHideQuestionNotes(true,
        //     (this.mCurrCombo>=RevGame.Target.NCombo() ? "Well done!<p>You've reached the target of "+RevGame.Target.NCombo()+" combos!<p>" : "You've failed to reach the target...<p>") +
        //     "You have correctly answered "+this.mNCorrect+"/"+this.mNQuestion+
        //     " questions ("+Math.round(this.mNCorrect/this.mNQuestion*100)+"%)",
        //     "gameEndMsg"); //<-- use this CSS class for styling the div
        // }
      } //if (mHeatBar && mHeatBg)
    }
    else { // a fixed number of questions
      let percent = this.mNCorrect/this.mNQuestion*100;
      this.mHeatBg.className = "meter " +
        (percent>=RevGame.Target.WinPercent() ? "yellow":
          percent<RevGame.Target.WinPercent()/2 ? "red" : "");
      this.mHeatBg.style.backgroundColor =
        percent>=RevGame.Target.WinPercent() && this.mNQuestion>RevGame.Target.NQuestion()*0.5? "lightyellow" : "white";
      this.mHeatBar.style.width = Math.min(100, Math.round(this.mNQuestion/RevGame.Target.NQuestion()*100))+"%";
      this.mGameEndedQ = this.mNQuestion >= RevGame.Target.NQuestion();
      // if (this.mGameEndedQ) {
      //   RevGame.ShowHideEndOfQBar(false, false);
      //   this.ShowHideQuestionNotes(true,
      //     "Game Ended.<p>You have correctly answered "+this.mNCorrect+"/"+this.mNQuestion+
      //     " questions ("+Math.round(this.mNCorrect/this.mNQuestion*100)+"%)",
      //     "gameEndMsg"); //<-- use this CSS class for styling the div
      // }
    }
  } // RevGame::UpdateHeadBar() //

  // private static MathPadHist:string[]=[];
  // private static MathPadHistIdx:number=-1;
  // private static MathPadScope={};
  // static OnMathPadInputChange()
  // {
  //   if (RevGame.MathPadInp && RevGame.MathPadOut) {
  //     if (!(RevGame.MathPadHist.length>0 &&
  //           RevGame.MathPadHist[RevGame.MathPadHist.length-1].trim()===
  //           RevGame.MathPadInp.value.trim()))
  //     {
  //       RevGame.MathPadHist.push(RevGame.MathPadInp.value.trim());
  //       RevGame.MathPadHistIdx=-1;
  //     }

  //     let out="";
  //     try {
  //       let mathsimp = math.simplify(RevGame.MathPadInp.value); //   window["Algebrite"].run(RevGame.MathPadInp.value);
  //       if (mathsimp) {
  //         out+= "`= "+mathsimp.toString()+"`<br>";
  //       }
  //     }
  //     catch (err) {
  //     }

  //     try {
  //       let mathratn = math.rationalize(RevGame.MathPadInp.value, RevGame.MathPadScope); //   window["Algebrite"].run(RevGame.MathPadInp.value);
  //       if (mathratn) {
  //         out+= "`= "+mathratn.toString()+"`<br>";
  //       }
  //     }
  //     catch (err) {
  //     }

  //     try {
  //       let mathout = math.evaluate(RevGame.MathPadInp.value, RevGame.MathPadScope); //   window["Algebrite"].run(RevGame.MathPadInp.value);
  //       if (typeof mathout === 'function')
  //         out+="[Function]";
  //       else //if (typeof mathout === 'string' || typeof mathout==='number')
  //         out+="`= "+mathout+"`";
  //       RevGame.MathPadOut.innerHTML =
  //         "<span class='mathInput'>" + RevGame.MathPadInp.value + "</span><br>" +
  //         out;
  //     }
  //     catch (err) {
  //       RevGame.MathPadOut.innerHTML = out + "<br>** Cannot evaluate";
  //     }
  //     MathJax.Hub.Queue(["Typeset", MathJax.Hub, RevGame.MathPadOut]);
  //     RevGame.MathPadInp.value="";
  //   }
  // } //RevGame.OnMathPadInputChange()

  // static MathPadCurrInpSave:string;
  // static GetMathPadHistory(dir:number)
  // {
  //   let hist = null;
  //   if (RevGame.MathPadHist.length>0) {
  //     let idx = dir<0 ?
  //       (RevGame.MathPadHistIdx<0 ? RevGame.MathPadHist.length-1 : Math.max(0, RevGame.MathPadHistIdx-1)) :
  //       ((RevGame.MathPadHistIdx<0 || RevGame.MathPadHistIdx>=RevGame.MathPadHist.length-1) ?
  //           -1 : Math.min(RevGame.MathPadHist.length-1, RevGame.MathPadHistIdx+1));
  //     if (idx>=0 && idx<RevGame.MathPadHist.length) {
  //       if (RevGame.MathPadHistIdx<0)
  //         RevGame.MathPadCurrInpSave=RevGame.MathPadInp.value;
  //       RevGame.MathPadHistIdx=idx;
  //       hist= RevGame.MathPadHist[idx];
  //     }
  //     else if (idx<0) {
  //       RevGame.MathPadHistIdx=idx;
  //       hist= RevGame.MathPadCurrInpSave;
  //     }
  //   }
  //   else
  //     RevGame.MathPadHistIdx=-1;
  //   if (hist!==null && RevGame.MathPadInp) {
  //     RevGame.MathPadInp.value = hist;
  //     RevGame.MathPadInp.select();
  //   }
  // } //RevGame.GetMathPadHistory()

  static EndOfQBtnBar:    HTMLDivElement=null;
  static NextButton:      HTMLButtonElement=null;
  static ShowNotesButton: HTMLButtonElement=null;
  static CatListDiv:      HTMLDivElement = null;
  static AllOffBtn:       HTMLButtonElement = null;
  static MathPadBtn:      HTMLButtonElement=null;
  static MathPadInp:      HTMLInputElement=null;
  static MathPadOut:      HTMLDivElement=null;
  static MathPadDiv:      HTMLDivElement=null;
  static ClockDisp:       HTMLElement = null;

  static InitPage()
  {
    RevGame.CatListDiv = document.getElementById("catList") as HTMLDivElement;
    RevGame.AllOffBtn  = document.getElementById("catPickerAllOffBtn") as HTMLButtonElement;
    RevGame.NextButton      = document.getElementById("nxtQBtn") as HTMLButtonElement;
    RevGame.ShowNotesButton = document.getElementById("tutorBtn") as HTMLButtonElement;
    RevGame.EndOfQBtnBar    = document.getElementById("endOfQBtnBar") as HTMLDivElement;
    RevGame.ShowHideEndOfQBar(false, false);

    // RevGame.MathPadBtn = byId(R.ID_MathPadBtn) as HTMLButtonElement;
    // RevGame.MathPadInp = byId(R.ID_MathPadInp) as HTMLInputElement;
    // RevGame.MathPadOut = byId(R.ID_MathPadOut) as HTMLDivElement;
    // RevGame.MathPadDiv = byId(R.ID_MathPadDiv) as HTMLDivElement;
    // if (RevGame.MathPadBtn)
    //   RevGame.MathPadBtn.onclick = ()=>{
    //     if (RevGame.MathPadDiv) {
    //       const showQ = RevGame.MathPadDiv.hidden; // show it if it is currently hidden.
    //       RevGame.MathPadDiv.hidden=!showQ;
    //       if (showQ) {
    //         if (RevGame.MathPadInp) RevGame.MathPadInp.value=""; // clear it first.
    //       }
    //     }
    //   };
    // if (RevGame.MathPadInp) {
    //   RevGame.MathPadInp.addEventListener("keydown", (e:KeyboardEvent)=>{
    //     if (e.key==='Enter') {
    //       e.preventDefault();
    //       RevGame.OnMathPadInputChange();
    //     }
    //     else if ((e.key==='ArrowUp' || e.key==='ArrowDown')) {
    //       e.preventDefault();
    //       RevGame.GetMathPadHistory(e.key==='ArrowUp' ? -1 : 1);
    //       e.stopImmediatePropagation();
    //     }
    //     else if ((e.key==='Esc' || e.key==='Escape') && RevGame.MathPadDiv) {
    //       e.preventDefault();
    //       if (RevGame.MathPadInp.value)
    //         RevGame.MathPadInp.value="";
    //       else
    //         RevGame.MathPadDiv.hidden=true;
    //       e.stopImmediatePropagation();
    //     }
    //   });
    // }

    RevGame.ClockDisp = byId(R.ID_ClockDisp) as HTMLElement;
    if (RevGame.ClockDisp) {
      RevGame.ClockDisp.onclick = RevGame.SuspendResumeClockDisplay;
    }

    RevGame.Target = new GameTarget();
    TheGame = new RevGame();  // create the game object now.
    TheGame.PickCatDialog(true);

    // // Set the game target before anything.
    // const gameTargetDiv = document.getElementById("setGameTarget") as HTMLDivElement;
    // const gameBeginBtn = document.getElementById("setGameTargetOKBtn") as HTMLButtonElement;
    // const gameTargetType = document.getElementById("gameTargetTypeSelect") as HTMLSelectElement;
    // const gameTargetVal = document.getElementById("gameTargetVal") as HTMLInputElement;
    // if (gameTargetDiv && gameBeginBtn && gameTargetType && gameTargetVal) {
    //   RevGame.Target = new GameTarget();
    //   RevGame.Target.SetFromString(GetCookie(R.CK_GameTarget));
    //   gameTargetType.selectedIndex =
    //     RevGame.Target.Type()==="Combo" ? 0 : 1;
    //   gameTargetVal.value = RevGame.Target.TargetVal().toString();
    //   gameTargetDiv.hidden=false;

    //   gameBeginBtn.onclick = ()=>
    //   {
    //     gameTargetDiv.hidden=true;
    //     if (gameTargetType.value!==RevGame.Target.Type() ||
    //         +gameTargetVal.value!==RevGame.Target.TargetVal())
    //     {
    //       RevGame.Target.SetTarget(gameTargetType.value,
    //         +gameTargetVal.value);
    //       SetCookie(R.CK_GameTarget, RevGame.Target.OutputToString());
    //     }
    //     TheGame = new RevGame();  // create the game object now.
    //     TheGame.NextQuestion();
    //   } // onclick
    // }
  } //RevGame.InitPage() //

  static ClickOnScrollDiv()
  {
//    if (!TheGame.mGameEndedQ)
    TheGame.ShowHideQuestionNotes(false);
  } //RevGame.ClickOnScrollDiv()
} //class RevGame //

var TheGame: RevGame = null;
interface Window {[key:string]:any};
window["initPage"]=RevGame.InitPage;
window["clickOnScrollDiv"]=RevGame.ClickOnScrollDiv;
