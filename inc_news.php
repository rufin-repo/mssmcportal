<?php

const newsDir="docs/news";
const NewsFNPatt="#^news_[0-9-]+\.txt$#";

function _encodeArticleFile($pathnm, bool $checkExpirationQ) : string
{
  $data='';
  if (file_exists($pathnm)) {
    $fin = fopen($pathnm, "r");
    if ($fin) {
      $today = date("Y-m-d");
      flock($fin, LOCK_SH);
      $line = trim(fgets($fin));      // expiration-date,type,usr
      $parts=array();
      if (preg_match("#^Till:(\d\d\d\d-\d\d-\d\d),([^|, ]+),(\w+)$#", $line, $parts) && count($parts)===4) {
        if (!$checkExpirationQ || $today<$parts[1]) {       // check article expiration date.
          $data=substr($line,5).'|';  // remove the "Till:" part
          $line = trim(fgets($fin));  // headline
          if (strlen($line)>0) {
            $data.=encodeURIComponent($line).'|';
            $body='';
            while (!feof($fin)) {     // body
              $line = fgets($fin);
              $body.=$line;
            }// while (!feof(
            $data.=encodeURIComponent($body);
          }
          else {
            $data="";
          }
        } // if ($today<...
      }
      flock($fin, LOCK_UN);
      fclose($fin);
    } // if ($fin)
  }
  return $data;
} //_encodeArticleFile()

function HandleNewsRequest(string $req, string $user, int $userLvl) : bool
{
  global $ValidUsrQ;
  global $ValidUsrLvl;
  global $UsrHash;
  global $LogData;

  $handledQ=true;

  if ($req==="GETNEWS") { // returns the list of not-yet-expired news
    if (is_dir(newsDir)) {
      $dir = opendir(newsDir);
      if ($dir) {
        $allnews='';
        $nnews=0;
        while (false!==($fn=readdir($dir))) {
          if (preg_match(NewsFNPatt, $fn)) {
            $filedata = _encodeArticleFile(newsDir.'/'.$fn, true);
            if (strlen($filedata)>5) {
              if ($nnews>0) $allnews.="|";
              $allnews.=encodeURIComponent($fn)."=".encodeURIComponent($filedata);
              $nnews++;
            }
          }
        } // while ()
        closedir($dir);
        if ($nnews>0) {
          echo "0:".$nnews.",".$allnews;
          // header("Content-type: text/plain");
          // header('Content-Encoding: gzip');
          // echo gzencode("0:".$nnews.",".$allnews);
        }
        else
          echo "0:0";
      } // if ($dir)
    } // if (is_dir(newsDir)
  } // if ($req==="GETNEWS")
  else if ($req==="RDNEWSDOC") {
    if (isset($_POST["DocInfo"])) {
      $docinfo=$_POST["DocInfo"];
      $parts=array();
      if (preg_match("#^".DocsDir."\/news\|(news_\d+\.txt)$#",$docinfo, $parts) && file_exists(newsDir."/".$parts[1])) {
        $fn=$parts[1];
        $filedata = _encodeArticleFile(newsDir.'/'.$fn, false);
        echo "0:".encodeURIComponent($fn)."=".encodeURIComponent($filedata);
      }
      else
        echo "1:Invalid docinfo:'$docinfo'";
    }
    else echo "1:Incomplete request.";
  }
  else if ($req==="RECNEWS") {
    if (isset($_POST["DocInfo"])
    &&  isset($_POST["Title"])
    &&  isset($_POST["ExpDate"])
    &&  isset($_POST["Type"])
    &&  $ValidUsrQ) {
      $docinfo = trim($_POST["DocInfo"]);
      $expdate=trim($_POST["ExpDate"]);
      $hdline=trim($_POST["Title"]);
      $body=trim($_POST["Body"]);
      $type=trim($_POST["Type"]);

      $LogData["DocInfo"]=$docinfo;
      $LogData["Title"]=$hdline;
      $LogData["ExpDate"]=$expdate;
      $LogData["Type"]=$type;
      LogReq();

      if (!preg_match("#^\d\d\d\d-\d\d-\d\d$#", $expdate)) $expdate="9999-99-99";

      $newsfn='';
      $parts=array();
      if (preg_match("#^".DocsDir."\/news\|(news_\d+\.txt)$#",$docinfo, $parts)) {
        $newsfn=DocsDir."/news/".$parts[1];
      } // if preg_match .. docinfo
      else if ($docinfo==="!NEW!") {
        $pfx=DocsDir."/news/news_".date("ymd");
        $newsfn=$pfx.".txt";
        for ($i=1; file_exists($newsfn) && $i<100; $i++) {
          $newsfn=$pfx.$i.".txt";
        }
        if (file_exists($newsfn)) {
          echo "3:Too many new news articles for one day.";
        }
      }
      else $docinfo='';

      if ($newsfn!=='') {
        $fout = fopen($newsfn, "w");
        if ($fout) {
          flock($fout,LOCK_EX);
          fwrite($fout, "Till:".$expdate.",".$type.",".$ValidUsrLvl.$UsrHash."\n");
          fwrite($fout, $hdline."\n");
          fwrite($fout, $body."\n");
          fflush($fout);
          flock($fout,LOCK_UN);
          fclose($fout);
          echo "0:Article recorded into '".$newsfn."'";
        }
        else {
          dbg("Unable to create news file '$newsfn' for writing.");
          echo "2:Unable to create news file '$newsfn' for writing.";
        }
      }
      else
        echo "2:Invalid new article destination.";
    }
    else {
      dbg("$req incomplete:");
      if (!isset($_POST["DocInfo"])) dbg("DocInfo not set");
      if (!isset($_POST["Title"])) dbg("Title not set");
      if (!isset($_POST["ExpDate"])) dbg("ExpDate not set");
      if (!isset($_POST["Type"])) dbg("Type not set");
      if ($ValidUsrQ) dbg("Not a valid user.($UsrHash/$ValidUsrLvl)");

      echo "1:Incomplete request.";
    }
  }
  else
    $handledQ=false;

  return $handledQ;
} // HandleNewsRequest()

?>