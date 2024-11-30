<!DOCTYPE html>
<html>
<head>
<title>Quiz Time!</title>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, height=device-height, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<style>
.noselect {
  -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Safari */
     -khtml-user-select: none; /* Konqueror HTML */
       -moz-user-select: none; /* Firefox */
        -ms-user-select: none; /* Internet Explorer/Edge */
            user-select: none; /* Non-prefixed version, currently
                                  supported by Chrome and Opera */
}

@font-face {
  font-family: 'TopicFont';
  font-style: normal;
  font-weight: normal;
  src: local('TopicFont'), url("rsrc/SairaSemiCondensed-Regular.ttf");
}
@font-face {
  font-family: 'TopicFont';
  font-style: normal;
  font-weight: light;
  src: local('TopicFont'), url("rsrc/SairaSemiCondensed-ExtraLight.ttf");
}
@font-face {
  font-family: 'TopicFont';
  font-style: normal;
  font-weight: bold;
  src: local('TopicFont'), url("rsrc/SairaSemiCondensed-SemiBold.ttf");
}
@font-face {
  font-family: 'ButtonFont';
  font-style: normal;
  font-weight: bold;
  src: local('ButtonFont'), url("rsrc/SairaCondensed-Regular.ttf");
}
@font-face {
  font-family: 'LCDFont';
  font-style: normal;
  font-weight: normal;
  src: local('LCDFont'), url("rsrc/LCD14.otf");
}
@font-face {
  font-family: 'IconFont';
  font-style: normal;
  font-weight: normal;
  src: local('IconFont'), url("rsrc/469Icons.ttf");
}
table {font-family: "Courier", Monospace; font-size: 40px;}
input {font-family: "Courier", Monospace; font-size: 40px;}
td.border_bot { border-bottom:1pt solid black;}
.verybold { font-weight: 900;}
h1 {
  font-family:'Courier New', Courier, monospace;
  font-weight: 900;
}
#Score {
  font-family:'Arial-Narrow', Helvetica, sans-serif;
  font-weight: 900;
  color:olivedrab;
}
#QHead {
  /* font-family:'Courier New', Courier, monospace; */
  font-family: TopicFont;
  font-weight:bold;
}
.qClock {
  vertical-align: top;
  font-family: LCDFont;
  font-weight:normal;
  font-size:22px;
  padding-top:4px;
  color: #fff;
}
.clockPaused {
  color: rgba(255,255,255,0.5);
  animation: blinker 1s linear infinite;
}
@keyframes blinker {
  50% {
    opacity: 0;
  }
}

span.qStat {
  font-family:monospace;
  font-weight:normal;
}
span.mathInput {
  font-family:'Courier New', Courier, monospace;
  font-weight:normal;
  font-size:14px;
}

p#gameMsg {
  /* font-family: "ButtonFont"; */
  font-family:"Arial", "Helvetica", sans-serif;
  font-size:18px;
}

select
{
  font-size:12px;
  height:34px;
  padding:0px;
}
.MCPara
{
  font-size:20px;
  padding:10px
}
p#question {
  font-size:24px;
  margin-bottom:8px;
}
img {
  max-height:100%;
  max-width:100%;
}
.figdiv {
  height:150px;
  width:150px;
}
.figdiv img {
  object-fit:cover;
}
.MCPara:hover{background-color: #ccc;}
.MChoice{
  font-size: 20px;
}
/* .MChoice:hover{
  background-color: #ddd;
} */
table.MCtable {
  width:99%;
  border-collapse:collapse;
}
table.MCtable td, table.MCtable tr {
  padding-top:10px;
  padding-left:0px;
  padding-right:0px;
  font-size: 24px;
}
.choiceTr td {
  vertical-align: top;
}
table.MCtable tr:hover td {
  background-color: #ddd;
}
table.MCtable tr.wrongPick td {
  background-color:rgb(243, 189, 183);
}
table.MCtable tr.correctPick td {
  background-color:yellowgreen;
}
div.choiceTd {
  display:block;
  width:100%;
  font-size:20px;
  font-family:Arial, Helvetica, sans-serif;
  /*font-weight: 900;*/
}
/* div.choiceTd:hover{
  background-color: #ddd;
} */
div.choiceTd span {
  font-family:'Times New Roman', Times, serif;
  font-weight:300;
}
label {
  display:block;
  width:80%;
}
button.endOfQBtn {
  font-size:24px;
  margin:8px;
}

table.ChinCharTable {
  width:100%;
}
table.ChinCharTable tr td {
  text-align:center;
}
span#chinCharSpan {
  width:100%;
  font-size:80px;
  text-align:center;
}

/* A blocker container div for blocking out UIs behind it */
div.pageBlocker {
  position:fixed;
  top:0;
  left:0;
  width:100%;
  height:100%;
  padding:0px;
  margin:0px;
  border-collapse:collapse;
  border:0px;
  background-color: #fff9;
  z-index:1;
}/*pageBlocker */

/* Category Picker div */
div.catPicker {
  max-width: 95%;
  min-width: 300px;
  position: fixed; /*absolute;*/
  background-color: darkseagreen;
  min-height: 10%;
  max-height: 90%;
  top: 4px; /*50%;*/
  left: 50%;
  overflow:hidden;
  /*white-space:nowrap;
  text-overflow: ellipsis; */
  padding:10px;
  /* -ms-transform: translate(-50%, -50%);
  -webkit-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%); */
  -ms-transform: translate(-50%, 0);
  -webkit-transform: translate(-50%, 0);
  transform: translate(-50%, 0);
  z-index: 2;
  border-radius:10px;
  box-shadow: 3px 8px 16px 0px rgba(73, 44, 44, 0.3);/* T R B L */
  font-family: 'Courier New', Courier, monospace;
  font-size:20px;
} /* div.catPicker */
div#catList {
  width:100%;
  /* height:calc(90vh - 90px); */
  /* display:inline; */
  background:#fff;
  border: #fff solid 1px;
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
}
div#lvlList {
  width:100%;
  height: 40px;
  overflow:hidden;
  display:block;
}
div#lvlList label {
  width:24px;
  height:30px;
  line-height:30px;
}
div.catPicker button {
  font-family: 'Courier New', Courier, monospace;
  font-size:18px;
  margin:3px;
}

div.catPicker label {
  font-family: TopicFont;
}

label.expandCollapseIcon {
  /* font-family:"Arial", "Helvetica", sans-serif; */
  font-family: IconFont;
  font-size:14px;
  line-height:14px;
  height: 18px;
  width: 20px;
  display:inline-block;
  margin-right:4px;
  padding: 0 0 0 0px;
  text-align:center;
  vertical-align: middle;
}
input[type=checkbox] + label.expandCollapseIcon {
  line-height:16px;
  height: 18px;
  width:18px;
  /* font-family: IconFont;
  display: inline-block;
  vertical-align: middle;
  text-align:center; */
}
input[type=checkbox] + label.expandCollapseIcon::before {
  /* content:"\0023f5"; */
  content:"R";
  line-height:23px;
  height: 18px;
  width:18px;
  font-family: IconFont;
  display: inline-block;
  vertical-align: middle;
  text-align:center;
  transform-origin:50% 39%;
  transform: rotate(-90deg);
  color: #464;
}
input[type=checkbox]:checked + label.expandCollapseIcon::before {
  /* content:"\0023f7"; */
  content:"R";
  line-height:23px;
  height: 18px;
  width:18px;
  font-family: IconFont;
  display: inline-block;
  vertical-align: middle;
  text-align:center;
  transform-origin:50% 39%;
  transform: rotate(0deg);
  color: #464;
}
input[type=checkbox]:checked + label.expandCollapseIcon {
  line-height:14px;
}
label.emptyTopic {
  color:#ccc;
}
span.topicLvl0 label {
  font-weight:bold;
}
span.topicLvl1 label {
  font-weight:normal;
}
div#catPicker button {
  font-family: TopicFont;
  font-weight: bold;
}

/* button#pickCatBtn {
  font-size:16px;
  height:100%;
} */

/* Game Target Dialog UI */
div.setGameTargetDiv {
  max-width: 95%;
  min-width: 300px;
  position: fixed; /*absolute;*/
  background-color: darkseagreen;
  top: 50%;
  left: 50%;
  overflow:hidden;
  /*white-space:nowrap;
  text-overflow: ellipsis; */
  padding:10px;
  -ms-transform: translate(-50%, -50%);
  -webkit-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
  z-index: 2;
  border-radius:10px;
  box-shadow: 3px 8px 16px 0px rgba(73, 44, 44, 0.3);/* T R B L */
  font-family: 'Courier New', Courier, monospace;
  font-size:20px;
} /* div.setGameTargetDiv */
div.setGameTargetUIs {
  width:100%;
  background:#fff;
  border: #fff solid 2px;
}
div.dlgTitle {
  margin-top:-10px;
  font-size:20px;
  font-family:"ButtonFont"; /*Arial, Helvetica, sans-serif;*/
  font-weight:bold;
  /* margin-bottom:4px; */
}
.setGameTargetUIs select {
  width:100%;
  font-size:18px;
  padding:0px;
}
.setGameTargetUIs input {
  width:100%;
  height:40px;
  font-size:18px;
  -moz-box-sizing:    border-box;
  -webkit-box-sizing: border-box;
  box-sizing:        border-box;
  text-align: right;
}
.setGameTargetUIs button {
  margin-top:10px;
  font-size:20px;
}


div.uiBar {
  width:calc(100% - 10px);
  /* height:40px; */
  /* line-height:40px; */
  top:0;
  left:0;
  color:#fff;
  padding-left:10px;
  font: normal normal bold 28px 'Courier New',Courier,monospace;
  background-color:darkseagreen;
  display:inline-block;
}
div.uiBar span {
  display:inline-block;
  top:30px;
}
div.uiBar button {
  font-size:20px;
  font-family:'Courier New', Courier, monospace;
  font-weight:900;
  height:100%;
}
button.txtBoxBtn {
  background-color: transparent;
  border: none;
}
table.tighttable {
  border-collapse: collapse;
  margin:0;
  border:0;
  padding:0;
  font-size:20px;
  vertical-align: top;
}



input.MCAnsBox {
  font-size:20px;
  font-family: 'Courier New', Courier, monospace;
  height:30px;
  width:100%;
}

.tutorialContentDiv, .gameEndMsg {
  position:absolute;
  width: calc(100% - 64px);
  min-height:30%;
  z-index:2;
  border-top: 1px;
  border-color: black;
  background-color:rgb(230, 245, 250);
  border-radius: 8px;
  font-size:20px;
  margin:8px;
  padding:24px;
    box-shadow: 3px 8px 16px 0px rgba(0,0,0, 0.5);/* T R B L */
}
.tutorialContentDiv em {
  color:firebrick;
}
.gameEndMsg {
  width:78%;
  height:100%;
  background-image:url("imgs/scroll2.png");
  background-size: 100%;
  background-repeat:no-repeat;
  background-position:left top;
  background-color: transparent;
  font-family: 'Courier New', Courier, monospace;
  font-size:24px;
  margin:0px;
  padding-top:10%;
  padding-left:10%;
  padding-right:12%;
}

.pageBlocker#tutorial {
  background-color:rgba(0,0,0,0.3);
}
.endOfQBtnBar {
  display:block;
  width:100%;
}

/*===================================================*\
|| Math Pad
\*===================================================*/
div.mathPadDiv {
  width:70%;
  background-color:#bbb;
  position:absolute;
  border-radius: 8px;
  font-size:20px;
  left: 26%;
  margin:4px;
  padding:4px;
  box-shadow: 3px 8px 16px 0px rgba(0,0,0, 0.5);/* T R B L */
  /* -ms-transform: translate(-50%, -50%);
  -webkit-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%); */
}
div.mathPadOutput {
  width:100%;
  height:200px;
  background-color:#ddd;
  border-style:inset;
  border-width:1px;
  overflow:auto;
}
.mathPadUIs input {
  width:100%;
  font-size:15px;
  font-family: 'Courier New', Courier, monospace;
  -moz-box-sizing:    border-box;
  -webkit-box-sizing: border-box;
  box-sizing:        border-box;
  border-style:inset;
  border-width:1px;
}

/*===================================================*\
|| Progress Bar (Hotness)
\*===================================================*/
		.meter {
			height: 16px;  /* Can be anything */
			position: relative;
			/*margin: 60px 0 20px 0;*/ /* Just for demo spacing */
			background: transparent; /* #555;*/
			-moz-border-radius: 10px;
			-webkit-border-radius: 10px;
			border-radius: 10px;
			padding: 2px;
			/* -webkit-box-shadow: inset 0 -1px 1px rgba(255,255,255,0.3);
			-moz-box-shadow   : inset 0 -1px 1px rgba(255,255,255,0.3);
			box-shadow        : inset 0 -1px 1px rgba(255,255,255,0.3); */
		}
		.meter > span {
			display: block;
			height: 100%;
			   -webkit-border-top-right-radius: 8px;
			-webkit-border-bottom-right-radius: 8px;
			       -moz-border-radius-topright: 8px;
			    -moz-border-radius-bottomright: 8px;
			           border-top-right-radius: 8px;
			        border-bottom-right-radius: 8px;
			    -webkit-border-top-left-radius: 20px;
			 -webkit-border-bottom-left-radius: 20px;
			        -moz-border-radius-topleft: 20px;
			     -moz-border-radius-bottomleft: 20px;
			            border-top-left-radius: 20px;
			         border-bottom-left-radius: 20px;
			background-color: rgb(43,194,83);
			background-image: -webkit-gradient(
			  linear,
			  left bottom,
			  left top,
			  color-stop(0, rgb(43,194,83)),
			  color-stop(1, rgb(84,240,84))
			 );
			background-image: -moz-linear-gradient(
			  center bottom,
			  rgb(43,194,83) 37%,
			  rgb(84,240,84) 69%
			 );
			-webkit-box-shadow:
			  inset 0 2px 9px  rgba(255,255,255,0.3),
			  inset 0 -2px 6px rgba(0,0,0,0.4);
			-moz-box-shadow:
			  inset 0 2px 9px  rgba(255,255,255,0.3),
			  inset 0 -2px 6px rgba(0,0,0,0.4);
			box-shadow:
			  inset 0 2px 9px  rgba(255,255,255,0.3),
			  inset 0 -2px 6px rgba(0,0,0,0.4);
			position: relative;
			overflow: hidden;
		}
		.meter > span:after, .animate > span > span {
			content: "";
			position: absolute;
			top: 0; left: 0; bottom: 0; right: 0;
			background-image:
			   -webkit-gradient(linear, 0 0, 100% 100%,
			      color-stop(.25, rgba(255, 255, 255, .2)),
			      color-stop(.25, transparent), color-stop(.5, transparent),
			      color-stop(.5, rgba(255, 255, 255, .2)),
			      color-stop(.75, rgba(255, 255, 255, .2)),
			      color-stop(.75, transparent), to(transparent)
			   );
			background-image:
				-moz-linear-gradient(
				  -45deg,
			      rgba(255, 255, 255, .2) 25%,
			      transparent 25%,
			      transparent 50%,
			      rgba(255, 255, 255, .2) 50%,
			      rgba(255, 255, 255, .2) 75%,
			      transparent 75%,
			      transparent
			   );
			z-index: 1;
			-webkit-background-size: 50px 50px;
			-moz-background-size: 50px 50px;
			background-size: 50px 50px;
			animation: move 2s linear infinite;
			-webkit-animation: move 2s linear infinite;
			-moz-animation: move 2s linear infinite;
			   -webkit-border-top-right-radius: 8px;
			-webkit-border-bottom-right-radius: 8px;
			       -moz-border-radius-topright: 8px;
			    -moz-border-radius-bottomright: 8px;
			           border-top-right-radius: 8px;
			        border-bottom-right-radius: 8px;
			    -webkit-border-top-left-radius: 20px;
			 -webkit-border-bottom-left-radius: 20px;
			        -moz-border-radius-topleft: 20px;
			     -moz-border-radius-bottomleft: 20px;
			            border-top-left-radius: 20px;
			         border-bottom-left-radius: 20px;
			overflow: hidden;
		}

		.animate > span:after {
			display: none;
		}

		@keyframes move {
		    0% {
		       background-position: 0 0;
		    }
		    100% {
		       background-position: 50px 50px;
		    }
		}
		@-webkit-keyframes move {
		    0% {
		       background-position: 0 0;
		    }
		    100% {
		       background-position: 50px 50px;
		    }
		}

		@-moz-keyframes move {
		    0% {
		       background-position: 0 0;
		    }
		    100% {
		       background-position: 50px 50px;
		    }
		}

		.orange > span {
			background-color: #f1a165;
			background-image: -moz-linear-gradient(top, #f1a165, #f36d0a);
			background-image: -webkit-gradient(linear,left top,left bottom,color-stop(0, #f1a165),color-stop(1, #f36d0a));
			background-image: -webkit-linear-gradient(#f1a165, #f36d0a);
		}

		.red > span {
			background-color: #f0a3a3;
			background-image: -moz-linear-gradient(top, #f0a3a3, #f42323);
			background-image: -webkit-gradient(linear,left top,left bottom,color-stop(0, #f0a3a3),color-stop(1, #f42323));
			background-image: -webkit-linear-gradient(#f0a3a3, #f42323);
		}

		.yellow > span {
			background-color:gold;
			background-image: -moz-linear-gradient(top, gold, yellow);
			background-image: -webkit-gradient(linear,left top,left bottom,color-stop(0, gold),color-stop(1, yellow));
			background-image: -webkit-linear-gradient(gold, yellow);
		}

		.nostripes > span > span, .nostripes > span:after {
			animation: none;
			-webkit-animation: none;
			-moz-animation: none;
			background-image: none;
		}
</style>
<script src="quizutils.js"></script>
<script src="quiz.js"></script>
<script src="MCQ2_Backups.js"></script>
<?php
  include "injectMCQ.php";
?>
<!-- <script src="math.min.js"></script> -->
<!-- <script src="MathJax.js"></script> -->
<script type="text/javascript" async
  src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js?config=AM_HTMLorMML">
</script>
<!-- <script src="algebrite.bundle-for-browser.js"></script> -->
</head>

<body onload="initPage()">
<div class="uiBar noselect">
  <table class="tighttable">
  <tr>
    <td width="100%">
    <div style="float:left; align-items:center;">Quiz Time!<button type="button" class="txtBoxBtn" disabled></button></div>
    </td>
    <td style="height:100%; vertical-align:top;">
      <div class="qClock" id="clockDisp" style="float:right; height:100%"></div>
    </td>
    <!-- <td style="height:100%; vertical-align:top;">
      <div style="float:right; height:100%"><button type="button" id="mathPadBtn">Pad</button></div>
    </td> -->
    <td style="height:100%; vertical-align:top;">
      <div style="float:right;">
      <button type="button" id="pickCatBtn">Topics</button></div>
    </td>
  </tr>
  </table>
</div>

<!-- <div class="uiBar noselect">
  <div style="float:left; display:flex; align-items:center;">Revision Time!<button type="button" class="txtBoxBtn" disabled></button></div>
  <div style="float:right;"><button type="button" id="pickCatBtn">Categories</button></div>
</div> -->

<div id="Score" class="noselect"></div>
<div class="meter" style="width:100%;" id="heatBg">
  <span style="width:0%;" id="heatBar"></span>
</div>

<h2 id="QHead" class="noselect"></h2>

<div id="ArithQDiv" class="UIDiv"hidden="hidden">
  <table style="border:0; padding:0; margin:0; border-collapse: collapse;">
  <tr>
  <td style="width:1cm;"></td><td></td><td align="right" id="upp" class="verybold">1234</td>
  </tr>
  <tr>
  <td style="width:1cm;"></td><td id="opr" class="border_bot">-</td><td  class="border_bot verybold" align="right" id="lwr">22</td>
  </tr>
  <tr style="height:80px;">
  <td style="width:1cm;"></td><td></td><td>
  <input size="7" id="ans" type="text" spellcheck="false" style="text-align: right;">
  </td></tr>
  </table>
</div>

<div id="MultChoiceDiv" class="UIDiv noselect" hidden="hidden">
  <p id="question">Loading question...</p>
  <table class="MCtable" id="MCTab">
    <tr class="choiceTr" id="ChoiceABox"><td style="width:50px;">(A)</td><td><div class="choiceTd" id="ChoiceATd"><span id="ChoiceATxt"></span></div></td></tr>
    <tr class="choiceTr" id="ChoiceBBox"><td>(B)</td><td><div class="choiceTd" id="ChoiceBTd"><span id="ChoiceBTxt"></span></div></td></tr>
    <tr class="choiceTr" id="ChoiceCBox"><td>(C)</td><td><div class="choiceTd" id="ChoiceCTd"><span id="ChoiceCTxt"></span></div></td></tr>
    <tr class="choiceTr" id="ChoiceDBox"><td>(D)</td><td><div class="choiceTd" id="ChoiceDTd"><span id="ChoiceDTxt"></span></div></td></tr>
    <tr class="choiceTr" id="ChoiceEBox"><td>(E)</td><td><div class="choiceTd" id="ChoiceETd"><span id="ChoiceETxt"></span></div></td></tr>
  </table>
  <input class="MCAnsBox" size="40" id="MCAnsBox" type="text" spellcheck="false" hidden/>
</div>

<p id="gameMsg"></p>
  <!----------------------------------------------------
    End-of-Question Next+Notes Buttons
  ------------------------------------------------------>
  <div class="endOfQBtnBar" id="endOfQBtnBar" hidden>
    <button type="button" class="endOfQBtn" id="tutorBtn" onclick="TheGame.ShowHideQuestionNotes(true)">
    Notes
    </button>
    <button type="button" class="endOfQBtn" id="nxtQBtn" onclick="TheGame.NextQuestion()">
    Next Question
    </button>
  </div>
</p>

<p id="wrongrec" style="color:#888;"></p>

<!----------------------------------------------------
  Category/Topic Picker Dialog
------------------------------------------------------>
<div class="pageBlocker" id="catPicker" hidden>
  <div class="catPicker noselect">
  <div class="dlgTitle">Please Pick Some Topics...</div>
  <div class="setGameTargetUIs">
    <select title="Game Target Type" class="gameTargetTypeSelect" id="targetTypeSel">
      <option selected="true" value="Combo">Target Combo:</option>
      <option value="NumQuest">Total No. of Questions:</option>
    </select><br>
    <select title="Target Number" name="gameTargetVal" id="targetValSel">
      <option value="3">3</option>
      <option selected="true" value="4">4</option>
      <option value="5">5</option>
      <option value="6">6</option>
      <option value="7">7</option>
      <option value="8">8</option>
      <option value="9">9</option>
      <option value="10">10</option>
      <option value="15">15</option>
      <option value="20">20</option>
    </select><br>
  </div>
  <div id="catList"></div>
  <div id="lvlList"></div>
  <button type="button" id="catPickerCancelBtn">Cancel</button>
  <button style="float:right;" type="button" id="catPickerOKBtn">Restart</button>
  <button style="float:right;" type="button" id="catPickerAllOffBtn">Collapse All</button>
  </div>
</div>

<!----------------------------------------------------
  Tutorial/Question Notes Display
------------------------------------------------------>
<div class="pageBlocker" id="tutorial" hidden>
  <div class="tutorialContentDiv noselect" id="tutorialContentDiv"
       onclick="clickOnScrollDiv()">
  </div>
</div>

<!----------------------------------------------------
  Algebra Pad
------------------------------------------------------>
  <div class="mathPadDiv noselect" id="mathPadDiv" hidden>
    <div class="dlgTitle">Algebra Pad</div>
    <div class="mathPadUIs">
      <div class="mathPadOutput" id="mathPadOut"></div>
      <input id="mathPadInp" name="terminal" spellcheck="false">
    </div>
  </div>

<!----------------------------------------------------
  Start-up Game Target Settings Dialog
------------------------------------------------------>
<div class="pageBlocker" id="setGameTarget" hidden>
  <div class="setGameTargetDiv noselect" id="setGameTargetDiv">
    <div class="dlgTitle">Please Set Game Target...</div>
    <div class="setGameTargetUIs">
    <select title="Game Target Type" class="gameTargetTypeSelect" id="gameTargetTypeSelect">
      <option selected="true" value="Combo">Target Combo:</option>
      <option value="NumQuest">Total No. of Questions:</option>
    </select><br>
    <input type="number" min="3" max="100" name="gameTargetVal" id="gameTargetVal"><br>
    <button style="float:right;" type="button" id="setGameTargetOKBtn">Begin</button>
    </div>
  </div>
</div>

</body>
</html>
