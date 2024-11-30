<?php

const EventList = "mma_events.list.txt";
const MAXNEVENTS=1000;
//=====================================================================
//
//  Event List file stores one event per line in the following format
//
//  yyyy-mm-dd-hhmm,evId,userHash,type,uriEncodedEesc
//  Note: evId must be unique. not necessarily in any order.
//
const EventRecPatt='/^(\d\d\d\d-\d\d-\d\d)(-\d\d\d\d),(\d+),(\w+),(\d+),(\S+)$/';
const EvDatePart=1;
const EvTimePart=2;
const EvIdPart  =3;
const EvUserPart=4;
const EvTypePart=5;
const EvDescPart=6;

function getAllEvents() : array
{
  $evIds=array();
  $evtList = array();
  $evts = '';
  $nevents=0;
  if (file_exists(EventList)) {
    $fin = fopen(EventList, 'r');
    if ($fin) {
      flock($fin, LOCK_SH);

      while (!feof($fin) && $nevents<MAXNEVENTS) {
        $line = trim(fgets($fin));
        $parts=array();
        // dbg("event line:".$line);
        if (preg_match(EventRecPatt,$line,$parts)) {
          $eid = (int)$parts[EvIdPart];
          // dbg(" valid: id=".$eid." usr=".$parts[EvUserPart]);
          if (!in_array($eid,$evIds,true)) {  // ignore ones with duplicated ids.
            $usrFlags='';
            $usrData='';
            $usrLvl = abs(LookupUser($parts[EvUserPart],'',$usrFlags, $usrData));
            array_push($evIds, $eid);
            array_push($evtList, $usrLvl."!".$line);
            // if ($evts) $evts.='|';
            // $evts.=$line;
            $nevents++;
          }
        } // if (preg_match(..$line)
      } // while(!feof)

      flock($fin, LOCK_UN);
      fclose($fin);
    } // if ($fin)
  } // if (file_exists(EventList))
  return $evtList;
} // getAllEvents()

function rmEvent(int $rmEvId, string $user, int $usrLvl) : bool
{
  $foundAndRemoved=false;
  $evtList = array();
  $nevents=0;
  $fin = fopen(EventList, 'r+');
  if ($fin) {
    flock($fin, LOCK_EX);

    while (!feof($fin) && $nevents<MAXNEVENTS) {
      $line = trim(fgets($fin));
      $parts=array();
      if (preg_match(EventRecPatt,$line,$parts)) {
        $eid = (int)$parts[EvIdPart];
        $rmQ=false;
        if ($eid===$rmEvId) {
          if ($parts[EvUserPart]===$user) {  // removing events added by oneself is okay.
            $rmQ=true;
          }
          else { // can only remove other's events if the user's level >= the creator's level.
            $creatorFlags='';
            $creatorData='';
            $creatorlvl = abs(LookUpUser($parts[EvUserPart],'',$creatorFlags,$creatorData));
            // dbg("usrLvl:$usrLvl creatorlvl:$creatorlvl");
            if ($usrLvl>=$creatorlvl) // || ($usrLvl>1 && $usrLvl===$creatorlvl))
              $rmQ=true;
          }
        }

        if ($rmQ) {
          $foundAndRemoved=true;
        }
        else {
          array_push($evtList,$line);
        }
      } // if (preg_match(..$line)
    } // while(!feof)

    if ($foundAndRemoved) {
      rewind($fin);
      ftruncate($fin, 0);

      for ($i=0; $i<count($evtList); $i++) {
        fwrite($fin, $evtList[$i]."\n");
      } // for ($i)
      fflush($fin);
    } // if ($foundAndRemoved)

    flock($fin, LOCK_UN);
    fclose($fin);
  } // if ($fin)

  return $foundAndRemoved;
} // rmEvent()

function addEvent(
  string $user, string $evDate, string $evTime,
  string $type, string $desc, int $evId) : bool
{
  $successfulQ=false;
  if (preg_match('/^\d\d\d\d-\d\d-\d\d$/', $evDate) &&
      ($evTime==='' || preg_match('/^\d\d\d\d$/',$evTime)))
  {
    if ($evTime==='') $evTime='0000';

    $evtList = array();
    $maxId=0;
    $evIds=array();
    $evts = '';
    $nevents=0;
    $insertAfter=-1;
    $fin = fopen(EventList, 'r+');
    if ($fin) {
      flock($fin, LOCK_EX);
      $lineno=0;
      while (!feof($fin) && $nevents<MAXNEVENTS) {
        $line = trim(fgets($fin));
        if ($line!=='') {
          $lineno++;
          $parts=array();
          if (preg_match(EventRecPatt,$line,$parts)) {
            $eid = (int)$parts[EvIdPart];
            $skipQ = in_array($eid, $evIds, true);
            //  || ($user===$parts[EvUserPart] && $evDate===$parts[EvDatePart]);

            if (!$skipQ) {
              if ($evDate>=$parts[EvDatePart]) $insertAfter=$nevents;
              array_push($evtList, $line);
              array_push($evIds, $eid);
              if ($evts) $evts.='|';
              $evts.=$line;
              $nevents++;
              if ($eid>$maxId) $maxId=$eid;
            }
          } // if (preg_match(..$line)
          else
            dbg("bad event rec at line $lineno skipped.");
        }
      } // while(!feof)

      if ($nevents<MAXNEVENTS) {

        // See if the supplied evId is usable
        if ($evId<=0 ||
            in_array($evId, $evIds, true)) $evId=($maxId+1); // if not, create a never used one.

        $newevent=$evDate.'-'.$evTime.','.$evId.','.$user.','.$type.','.$desc;

        rewind($fin);
        ftruncate($fin, 0);
        dbg("evtList has ".count($evtList)." recs.");
        for ($i=0; $i<count($evtList) && $i<MAXNEVENTS; $i++) {
          fwrite($fin, $evtList[$i]."\n");
          if ($i===$insertAfter)
            fwrite($fin, $newevent."\n");
        } // for ($i)
        if ($insertAfter<0)
          fwrite($fin, $newevent."\n");
        fflush($fin);
        $successfulQ=true;
      }
      flock($fin, LOCK_UN);
      fclose($fin);
    } // if ($fin)
  } // if (preg_match(..., $evTime...
  return $successfulQ;
} // addEvent()

function HandleEventRequest(string $req, string $user, int $userLvl) : bool
{
  global $LogData;

  $handledQ=true;
  if ($req==='EVLIST') {
    $evtList = getAllEvents();
    if ($evtList && count($evtList)>0) {
      echo "0:".implode("|", $evtList);
      // header("Content-type: text/plain");
      // header('Content-Encoding: gzip');
      // echo gzencode("0:".implode("|", $evtList));
    }
    else
      echo "0:";  // empty event list
  }
  else if ($req==='RMEVT') {
    if (isset($_POST['EvId'])) {
      $evid=(int)$_POST['EvId'];

      $LogData["EvId"]=$evid; LogReq();

      if (rmEvent($evid, $user, $userLvl))
        echo "0:Event ($evid) successfully deleted.";
      else
        echo "1:Unable to delete calendar event $evid.";
    }
    else
      echo "1:Invalid RMEVT request.";
  }
  else if ($req==='CHGEVT' || $req==='ADDEVT') {
    $evId   = !isset($_POST['EvId'])   ? -1 : (int)$_POST['EvId'];
    $evDesc = !isset($_POST['EvDesc']) ? '' : trim($_POST['EvDesc']);
    $evType = !isset($_POST['EvType']) ? -1 : (int)$_POST['EvType'];
    $evDate = !isset($_POST['EvDate']) ? '' : trim($_POST['EvDate']);
    $evTime = !isset($_POST['EvTime']) ? '' : trim($_POST['EvTime']);
    dbg("$evDate-$evTime id:$evId type:$evType desc:$evDesc");

    $LogData["EvId"]=$evId;
    $LogData["EvDesc"]=$evDesc;
    $LogData["EvType"]=$evType;
    $LogData["EvDate"]=$evDate;
    $LogData["EvTime"]=$evTime;
    LogReq();

    if (($req!=='CHGEVT' || $evId>0) && $evDesc!=='' &&
        $evType>=0 && preg_match("/^\d\d\d\d-\d\d-\d\d$/", $evDate) &&
        ($evTime==='' || preg_match("/^\d\d\d\d$/", $evTime)))
    {
      // CHGEVT is just a rmEvent() immediately followed by an addEvent() but with a supplied evId.
      if ($req==='ADDEVT' || rmEvent($evId, $user, $userLvl))
      {
        if ($req==='ADDEVT') $evId=-1;
        if (addEvent($user, $evDate, $evTime, $evType, $evDesc, $evId))
          echo "0:";
        else
          echo "1:Failed to add back modified event record.";
      }
      else
        echo "1:Unable to find existing event $evId.";
    }
    else {
      echo "1:Invalid request.";
    }
  }
  else  // not a recognized request.
    $handledQ=false;

  return $handledQ;
} // HandleEventRequest()

?>
