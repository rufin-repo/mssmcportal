<?php
  $PhpTime = microtime(TRUE);

  error_reporting(E_ERROR | E_WARNING | E_PARSE | E_NOTICE);

  // const InfoDir     = 'clubinfo';
  // const FilesDir    = 'docs';     // club doc root
  // const IPHistory       = InfoDir."/ipreghist.txt";
  const BuildNumFile    = "mma-build.txt";
  const LogFile         = "docs/mmasrq.log";
  const Anon            = '???';

  ini_set('display_errors',1);
  //error_reporting(E_ALL);

  function HexClientIP() {
    if (preg_match('#([0-9]+)\.([0-9]+)\.([0-9]+)\.([0-9]+)#',
                   str_replace(":", "", $_SERVER['REMOTE_ADDR']),
                   $ipparts)) {
      return sprintf('%02X.%02X.%02X.%02X',
              intval($ipparts[1]), intval($ipparts[2]),
              intval($ipparts[3]), intval($ipparts[4]));
    }
    else return '00.00.00.00';
  } // HexClientIP() //

  $ClientIP = HexClientIP();

  function dbg($s) {
    global $ClientIP;
    // if ($ClientIP==='00.00.00.00')
    {
      $fdbg = fopen("dbg.log", "a");
      flock($fdbg, LOCK_EX);
      fprintf($fdbg, "%s\n", $s);
      fflush($fdbg);
      fclose($fdbg);
    }
  } // dbg() //

  dbg("\nip is [$ClientIP]");
  dbg(sprintf('time() = %08X', time())."  ".date("Y-m-d", time()));

  // local machine: simulate a significant network delay of 1 sec.
  if ($ClientIP==="00.00.00.00") { sleep(1); }


  // http://php.net/manual/en/function.rawurlencode.php
  // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/encodeURI
  const URIunescape_set = array(
    '%2D'=>'-','%5F'=>'_','%2E'=>'.','%21'=>'!', '%7E'=>'~',
    '%2A'=>'*','%27'=>"'",'%28'=>'(','%29'=>')',
    '%3B'=>';','%2C'=>',','%2F'=>'/','%3F'=>'?','%3A'=>':',
    '%40'=>'@','%26'=>'&','%3D'=>'=','%2B'=>'+','%24'=>'$',
    '%23'=>'#'
  );

  function encodeURI($url) {
      return strtr(rawurlencode($url), URIunescape_set);
  }

  const URIComponentUnescape_set = array(
    '%21'=>'!', '%2A'=>'*', '%27'=>"'", '%28'=>'(', '%29'=>')'
  );
  function encodeURIComponent($str) {
    return strtr(rawurlencode($str), URIComponentUnescape_set);
  }

  require('inc_polls.php');  // implements the following functions:
  // _listPolls(string &$listing) : int
  // _voteForPoll(string $pollId, int $voteFor, string $userId, int $userlvl, array &$outTallies) : string
  // _chkVoteValidity(string $pollId, string $voteFor, string &$outActiveUntil, array &$outChoices) : string
  // _votedChoice(string $userid, array $voteRecs) : int
  // _readPollFile(string $pollId, int $lock, string &$outPollFlags, string &$outActiveUntil,
  //               string &$outPollDesc, array &$outChoiceDesc, array &$outVotes, array &$outTallies,
  //               &$fin) : string
  // HandlePollRequest(string $Request, $usrHsh, $usrLvl) :string

  require('inc_userlist.php'); // implements the following function(s):
  // LookupUser(string $usrHash, string $pwdHash, string &$outFlags, string &$outUsrData) : int
  // UpdateUser(string $operatorHash, string $operatorPwd, string $targetUsrHash, string $pwd, int $level, string &$outFlagAndData) : bool

  require('inc_events.php'); // implements the following function(s):
  // HandleEventRequest(string $req, string $user, int $userLvl) : bool

  require('inc_news.php'); // implements the following functions(s):
  // HandleNewsRequest()

  require('inc_docs.php'); // implements the following functions(s):
  // HandleDocsUpload()
  // GetDocList()


  //====================================================================
  //
  // Request Origin Logging
  //
  //====================================================================

  //====================================================================
  // NAccessInPeriod() : Count the # of access attemps from an IP addr
  //====================================================================
  // function NAccessInPeriod($histFn, $ip, $period) {
  //   $nRegsInPeriod = 0;
  //   $now = time();
  //   if (file_exists($histFn)) {
  //     $fhist = fopen($histFn, "r");
  //     if ($fhist) {
  //       while (!feof($fhist)) {
  //         $line = fgets($fhist);
  //         if (preg_match('#^([0-9A-F.]+),([0-9A-F]+),[A-Z ]*#', $line, $histparts)
  //           && $ip===$histparts[1]) {
  //           if ($now - intval($histparts[2]) < $period) {
  //             $nRegsInPeriod++;
  //           }
  //         }
  //       } // while
  //       fclose($fhist);
  //     } // if ($fhist)
  //   } // if (file_exists($histFn, "r"))
  //   return $nRegsInPeriod;
  // } // NAccessInPeriod() //

  $LogData=array();   // Put every request parameters that needs logging into this before calling LogReq().
  function LogReq()
  {
    global $ClientIP;
    global $LogData;
    global $Request;
    global $UsrHash;

    $time = date("y-m-d.H:i:s");
    $flog = fopen(LogFile, "a");
    if ($flog) {
      flock($flog,LOCK_EX);
      $line = sprintf("%s|%s|%s|%s", $Request,$UsrHash,$time,$ClientIP);
      if ($LogData!==null && count($LogData)>0) {
        foreach($LogData as $key=>$value) {
          $line.="|".$key."=".encodeURIComponent($value);
        }
      }
      fwrite($flog, $line."\n");
      fflush($flog);
      flock($flog,LOCK_UN);
      fclose($flog);
    } // if ($flog)
  } // LogReq()

  // function AddAccessEntryToHistory($histFn, $ip, $req) {
  //   $now = time();
  //   $fhist = fopen($histFn, "a");
  //   $line = sprintf("%s,%08X,%8s\n", $ip, $now, $req); // always 12+9+8+\n = 30 chars per entry
  //   fputs($fhist, $line);
  // } // AddAccessEntryToHistory()


  //=================================================================================
  //
  //  Global Code
  //
  //=================================================================================


  if (!isset($_POST['RQ']) || !isset($_POST['H1'])) {
    echo "9:Incomplete Request";
    exit(1);
  }

  $Request = $_POST['RQ'];
  $UsrHash = !isset($_POST['H1']) ? Anon : trim($_POST['H1']);
  if ($UsrHash==="") $UsrHash=Anon;
  $PwdHash = !isset($_POST['H2']) ? '' : trim($_POST['H2']);
  $UsrTime = isset($_POST['TM']) ? (float) $_POST['TM'] : 0.0;

  dbg("req=$Request");

  $TotalNUsers = 0;
  $_tmp="";
  $ValidUsrLvl=0;
  $ValidUsrFlags='';
  $ValidUsrQ = ($UsrHash!==Anon && ($ValidUsrLvl=LookupUser($UsrHash, $PwdHash, $ValidUsrFlags, $_tmp))>0);
  if ($ValidUsrLvl===-0xdead) $ValidUsrLvl=0;

  if ($UsrHash!==Anon) {
    dbg("lvl$ValidUsrLvl:$UsrHash/$PwdHash ".($ValidUsrQ ? "valid" : "invalid")." (".$_tmp.")\n");
  }
  if ($ValidUsrQ) $LogData["Lvl"]=$ValidUsrLvl;
  //======================================================================
  //  Process the request
  //======================================================================
  if ($Request==="CHKVER") {  // returns the version number and release notes up to the current build.
    $clientBuild = !isset($_POST['BN']) ? "" : $_POST['BN'];
    $fbuildnum = fopen(BuildNumFile, "r");
    $n = fscanf($fbuildnum, "%s %d", $bn, $btm);
    if ($n>=1) {
      if ($n===2)
        $bn = trim($bn, '"').' '.$btm;
      echo '0:'.$bn;
    }
    else {
      echo "1:Lastest build number unknown";
    }
  }
  else if ($Request==='PHPVER') {
    $ver = phpversion();
    dbg("PHP version:$ver");
    echo "0:Server PHP=$ver";
  }
  else if ($Request==="SYNCTIME") {
    echo "0:" . number_format(round($PhpTime*1000) - $UsrTime, 0,',','');
  }
  else if ($Request==="AUTHUSR" && $UsrHash && $PwdHash && $PwdHash!=='$$$') {
    //
    //  Authenticate a user (hash) with the given double-md5 pwdHash.
    //
    $usrdata='';
    $usrflags='';
    $usrlvl = LookupUser($UsrHash, $PwdHash, $usrflags, $usrdata);
    if ($usrlvl===-0xdead) {
      $flagAndData='';
      if (UpdateUser($UsrHash, $PwdHash, $UsrHash, $PwdHash, 9, $flagAndData))
        echo '0:9,'.$flagAndData;
      else
        echo '9:Unable to create Administrator acount';
    }
    else if ($usrlvl>0) {
      echo '0:'.$usrlvl.','.$usrflags.'|'.$usrdata;
    }
    else
      echo '1:Authentication failed.';
  }
  else if ($Request==="NEWUSR" || $Request==="CHGPWD") {
    //
    //  Create a new user or change the password of an existing user.
    //
    $usrPlainerPwd = isset($_POST['P1P']) ? $_POST['P1P'] : '';
    if (isset($_POST['U2']) && isset($_POST['P2']) && $ValidUsrQ)
    {
      $err='';
      $Usr2Hash = $_POST['U2'];
      $Pwd2Hash = $_POST['P2'];
      $case=0;

      $LogData["U2"]=$Usr2Hash;
      $LogData["P2"]=$Pwd2Hash;
      $LogData["P1P"]=$usrPlainerPwd;
      LogReq();

      if ($UsrHash===$Usr2Hash && $Request==="CHGPWD") {// case 1: update one's own password.
        if (md5($usrPlainerPwd)===$PwdHash)
          $case=kChgOwnPwd;
        else
          $err="2:Old password mismatch.";
      }
      else if ($ValidUsrLvl>1) {// case 2: admin user adding/updating another user.
        if (md5($usrPlainerPwd)===$PwdHash)
          $case=kAdminSetUsrPwd;
        else
          $err="2:Admin authentication failed.";
      }

      if ($case===kChgOwnPwd || $case===kAdminSetUsrPwd)
      {
        dbg("chg/add ".$Usr2Hash."/".$Pwd2Hash);
        $Usr2Data="";
        $Usr2Flags="";
        $Usr2Lvl=LookupUser($Usr2Hash, $Pwd2Hash, $Usr2Flags, $Usr2Data);
        if ($Usr2Lvl>0) {
          // $Usr2Lvl>0 means user with matched password found.
          // i.e. Usr2Hash/Pwd2Hash is already in the user list file.
          // nothing to do. Just report the situation.
          echo $case===kChgOwnPwd ?
            "2:New password identical to the old one." :
            "2:User already registered with the same password.";
        }
        else
        {
          $_lvl=1;
          $flagAndData='?|?';

          if ($case===kChgOwnPwd) { // update one's own password (i.e. UsrHash===Usr2Hash case)
            if ($Usr2Lvl<0) {// this has to be the case because the new password in Pwd2Hash should not match.
              $_lvl=-$Usr2Lvl;
              if (!UpdateUser($UsrHash, $PwdHash, $Usr2Hash, $Pwd2Hash, $_lvl, $flagAndData))
                $err="2:Password change failed.";
            }
            else $err="3:Server internal logic error.";

          }
          else if ($case===kAdminSetUsrPwd)
          {
            if ($Usr2Lvl===0) {  // Usr2Hash not found. Are we creating a new user?
              if ($Request==="NEWUSR") {
                $_lvl=1;
                if (!UpdateUser($UsrHash, $PwdHash, $Usr2Hash, $Pwd2Hash, $_lvl, $flagAndData))
                  $err="2:Unable to create the new user.";
              }
              else {
                $err="2:User not found.";
              }
            }
            else if ($Usr2Lvl<0)      // -ve means Pwd2Hash does not match $Usr2Hash's pwd. (see LookupUser())
            {
              if ($Request==="NEWUSR")
                $err="2:Cannot create new user. The same id has already been registered.";
              else {
                $_lvl=-$Usr2Lvl;
                if ($ValidUsrLvl> $_lvl) { // validated usr must be at a high level than usr2
                  // changing $Usr2Hash's password.
                  // maintaining $Usr2Hash's previous level.
                  if (!UpdateUser($UsrHash, $PwdHash, $Usr2Hash, $Pwd2Hash, $_lvl, $flagAndData))
                    $err="2:Failed to set a new password for the user.";
                  // Usr2Hash's flags will be changed to 'T' meaning it's temporary password.
                }
                else
                  $err="2:Admin level not high enough.";
              }
            }
            else
              $err="3:Server internal logic error (Usr2Lvl=$Usr2Lvl)";
          }
          else
            $err="3:Server internal logic error (case:$case).";

          if ($err==='') {
            echo '0:'.$_lvl.','.$flagAndData;
          }
          else
            echo $err;
        } // if (Usr2Lvl>0) .. else .. //
      }
      else if ($err)
        echo $err;
      else
        echo '3:User does not admin rights.';
    }
    else {
      dbg("$UsrHash, $PwdHash, $ValidUsrLvl => $Request Unauthorized.");
      echo "3:$Request request rejected.";
    }
  } // else if ($Request==="NEWUSR" or "CHGPWD") //
  // else if ($Request==="LISTBUG") {
  //   $lastBugId=0;
  //   $buglist = ReadBugList($BUGDBFILE, $lastBugId, -1);
  //   if ($buglist!==null) { echo "0:".$buglist; }
  //   else {echo "9:Unable to access bug list file";}
  // }
  // else if ($Request==="GETBUG") {
  //   if (empty($_POST['BUGID']) || (int)$_POST['BUGID']<=0)
  //     echo "2:Invalid Bug ID";
  //   else {
  //     $bugId = (int)$_POST['BUGID'];
  //     $foundBugId=-1;
  //     $bugEntry = ReadBugList($BUGDBFILE, $foundBugId, $bugId);
  //     if (empty($bugEntry) || $foundBugId!==$bugId) echo "3:Bug ".$bugId." not available";
  //     else echo "0:".$bugEntry;
  //   }
  // }
  // else if ($Request==="RECBUG") {
  //   $BugType = empty($_POST['BTYPE']) ? "?" : (int)$_POST['BTYPE'];
  //   $BugTitle = empty($_POST['BTITLE']) ? "" : $_POST['BTITLE'];
  //   $BugState = empty($_POST['BSTATE']) ? "N" : $_POST['BSTATE'];
  //   $BugDesc = empty($_POST['BDESC']) ? "" : $_POST['BDESC'];
  //   if ($BugTitle!=="" && $BugDesc!=="" && $BugType>=0 && $BugType<=5) {
  //     if (!empty($_POST['BUGID'])) {
  //       $UpdateBugId = (int)$_POST['BUGID'];
  //       if ($UpdateBugId>0) {
  //         echo UpdateBugEntry($ClientIP, $BUGDBFILE, $UpdateBugId, $UsrHash==="SYS" ? "Anon" : $UsrHash, $BugType, $BugState, $BugTitle, $BugDesc);
  //       }
  //       else
  //         echo "1:Invalid Bug Id:".$UpdateBugId;
  //     }
  //     else {
  //       $id = AddBugEntry($BUGDBFILE, $UsrHash===Anon ? "Anon" : $UsrHash, $BugType, $BugState, $BugTitle, $BugDesc);
  //       if ($id>0) echo "0:".$id;
  //       else echo "2:Unable to write into ".$BUGDBFILE;
  //     }
  //   }
  //   else
  //     echo "1:Invalid Bug Entry";
  // }
  else if (preg_match('/(LISTPOLLS|POLLDATA|CASTVOTE|CHKVOTE)/', $Request)) {
    $err = HandlePollRequest($Request, $UsrHash, $ValidUsrLvl);
    if ($err)
      echo "1:".$err;
  }
  else if (HandleEventRequest($Request, $UsrHash, $ValidUsrLvl)) {
    // Done. Nothing else to do.
  }
  else if (HandleNewsRequest($Request, $UsrHash, $ValidUsrLvl)) {
    // Done. Nothing else to do.
  }
  else if ($Request==='ADMININF') {
    $usrPlainerPwd = isset($_POST['P1P']) ? $_POST['P1P'] : '';

    $LogData["P1P"]=$usrPlainerPwd;
    LogReq();

    if ($ValidUsrLvl>1 && $ValidUsrQ && $ValidUsrFlags!=='T' && md5($usrPlainerPwd)===$PwdHash) {
      echo "0:Please use the following sftp login info to securely access the mssmathclub.com/ca ".
      "web space.<p>".
      "<pre>sftp (port 22):<pre>\n".
      "server: access936752397.webspace-data.io\n".
      "userid: u1526407235\n".
      "passwd: e%3cUp10@dF$</pre></p>";
    }
    else
      echo "1:Unauthorized.";
  }
  else if (preg_match("#^(DOCLIST|NEWSFILES|POLLFILES|TRASHLIST)$#", $Request))  // Scan and return a list of available accessible documents.
  {
    $listing="";
    $ndocs = GetDocList($Request, $listing);
    $reply="0:".$ndocs.",".$listing;

    if ($ndocs>10) {
      header("Content-type: text/plain");
      header('Content-Encoding: gzip');
      echo gzencode($reply);
    }
    else {
      echo $reply;
    }
  }
  else if ($Request==="UPLOAD") {
    if ($ValidUsrQ && $ValidUsrLvl>1 && isset($_POST["DestDir"])) {
      HandleDocsUpload($UsrHash, "docFiles", $_POST["DestDir"]);
    } // if ($ValidUsrQ && $ValidUsrLvl>1)
    else
      echo "3:Unauthenticated uploads rejected.";
  }
  else if ($Request==="RENDOC") {
    if ($ValidUsrQ && $ValidUsrLvl>1
    && isset($_POST["DocInfo"])
    && isset($_POST["NewFName"]))
    {
      $LogData["DocInfo"]=$_POST["DocInfo"];
      $LogData["NewFName"]=$_POST["NewFName"];
      RenameDoc($UsrHash, $_POST["DocInfo"], $_POST["NewFName"]);
    }
    else
      echo "3:Unauthenticated rename ignored.";
  }
  else if ($Request==="DELDOC") {
    if ($ValidUsrQ && $ValidUsrLvl>1 && isset($_POST["DocInfo"])) {
      $LogData["DocInfo"]=$_POST["DocInfo"];
      RemoveDoc($UsrHash, $_POST["DocInfo"]);
    }
    else
      echo "3:Unauthenticated delete ignored.";
  }
  else if ($Request==="UNDELDOC") {
    if ($ValidUsrQ && $ValidUsrLvl>1 && isset($_POST["DocInfo"])) {
      $LogData["DocInfo"]=$_POST["DocInfo"];
      UndeleteFile($UsrHash, $_POST["DocInfo"]);
    }
    else
      echo "3:Unauthenticated undelete ignored.";
  }
  else {
    echo "6:Unrecognized Request";
  }
?>
