<?php
//=======================================================
//
//  docinfo string format (an idealized way to identify
//  an accessible doc on the client side):
//    docs/subdir|URIencodedfname.ext
//
//  subdir must not have '|' in it and fname should
//  be URIComponent encoded.
//  .ext must be in ascii plain text and is restricted to
//  only the few acceptable/recognized types of exts.
//
//  The docs are stored in its URI-encoded name on the server.
//  The client is responsible to decode the fname back
//  to its readable unicode original.
//
//  docinfo strings are normally passed back unchanged from the client.
//  client should not compose/encode docinfo strings.
const UploadHist      = "upload.hist";
const DocsDir         = "docs";
const RecycleBin      = DocsDir.'/.recycle';
const DailyUploadLimit= 50*1000000; // 50M
const ValidUploadDests= array("talks", "solve", "misc", "news");
const RecycleTimeStart= 1668561367; // some arbitrary starting time (2022-11-15)

// function FixExt($pathname) {
//   dbg("fixing $pathname");
//   if (!preg_match("#^.+\.txt$#", $pathname)) {
//     $pathname.=".txt";
//   }
//   dbg("fixed $pathname");
//   return $pathname;
// } // FixExt() //

function AppendUploadHist(string $usr,string $size)
{
  $fhist = fopen(UploadHist, "a");
  if ($fhist) {
    flock($fhist,LOCK_EX);
    fprintf($fhist, "%s,%s,%u,%u\n",$usr,date("y-m-d+H:i:s"),time(),$size);
    fflush($fhist);
    flock($fhist,LOCK_UN);
    fclose($fhist);
  }
} // AppendUploadHist()

const OneDay=3600*24;
function TotUploadInPast24Hrs(string $usr) : int
{
  $now=time();
  $tot=0;
  if (file_exists(UploadHist)) {
    $fhist = fopen(UploadHist, "r");
    if ($fhist) {
      flock($fhist,LOCK_SH);
      while (!feof($fhist)) {
        $line=fgets($fhist, 2000);
        $parts=array();
        if (preg_match("/^(\w+),[0-9\-:\+]+,(\d+),(\d+)+$/", $line, $parts)) {
          if ($usr===$parts[1] && ($now-(int)$parts[2])<OneDay)
            $tot+=(int)$parts[3];
        }
      } // while (!feof
      flock($fhist,LOCK_UN);
      fclose($fhist);
    }
  } // if (file_exists(UploadHist
  return $tot;
} // TotUploadInPast24Hrs()

function Sz(int $n) :string
{
  return
     $n<1000    ? $n."B" :
    ($n<1000000 ? sprintf("%.1fK",$n/1000)
                : sprintf("%.1fM",$n/1000000));
}

//=========================================================
//
//  Docs upload and listing functions
//
//=========================================================

function encodedFilename(string $fullfn) : string
{
  $p=array();
  if (preg_match("#^(.+)(\.\w+)$#", trim($fullfn), $p)) {
    return encodeURIComponent($p[1]).$p[2];      // keep the '.' in the ext part.
  }
  else  // no extension???
    return encodeURIComponent($fullfn).".txt";   // add an arbitrary extension.
} // encodedFilename()



//---------------------------------------------------------
//  HandleDocsUpload()  : check and put multiple uploaded
//      files into their appropriate destination dirs.
//---------------------------------------------------------
function HandleDocsUpload(string $usr, string $key, string $dest)
{
  $targetDir=DocsDir.'/'.$dest;

  if (isset($_FILES[$key]) && in_array($dest, ValidUploadDests)) {
    if (!is_dir($targetDir)) {
      if (file_exists($targetDir)) {  // there is an existing file with the same name as the dest directory.
        rename($targetDir, $targetDir.".txt");  // rename it by appending an .txt extension.
      }
      mkdir($targetDir);  // create the non-existent destination directory.
    }

    if (is_dir($targetDir)) { // check again (mkdir could fail.)
      $files=$_FILES[$key];
      $ndone=0;
      $nfiles=count($files['name']);
      $totalSz=0;
      $totalMoved=0;

      for ($i=0; $i<$nfiles; $i++) $totalSz+=$files['size'][$i];

      $usrTotal=TotUploadInPast24Hrs($usr);

      if ($totalSz+$usrTotal < DailyUploadLimit) {
        for ($i=0; $i<$nfiles; $i++) {
          $fname=encodedFilename(basename($files['name'][$i]));
          $fsize=$files['size'][$i];
          $target_file = $targetDir.'/'.$fname;

          dbg("uploaded:$target_file(".$fsize.").");

          // $ext = strtolower(pathinfo($target_file,PATHINFO_EXTENSION));

          // Check if file already exists, back it up as (old) (old1) (old2)
          if (file_exists($target_file)) {

            for ($bak=1; $bak>=0; $bak--) {
              // $bakfile     = $target_dir . "/" . FixExt($fname . ($bak===0 ? "(old)" : ("(old".$bak.")")));
              // $prevbakfile = $bak===0 ? $target_file :
              //                $target_dir . "/" . FixExt($fname . "(old".($bak-1).")");

              // foobar.txt(old), foobar.txt(old1) foobar.txt(old2) etc.
              $bakfile     = $targetDir."/".$fname.($bak===0 ? "(old)" : ("(old".$bak.")"));
              $prevbakfile = $bak===0 ? $target_file :
                            $targetDir."/".$fname."(old" . ($bak-1). ")";

              if (file_exists($prevbakfile)) {
                rename($prevbakfile, $bakfile);
              }
            } // for ($bak)
          } // if (file_exists($target_file))
          if ($files['size']>0) {
            if (move_uploaded_file($files["tmp_name"][$i], $target_file)) {
              // dbg($target_file." successfully uploaded.");
              $LogData["f".$i."/".$nfiles."(".$fsize.")"]=$target_file;
              $ndone++;
              $totalMoved+=$fsize;
            }
          }
        } // for ($i)
        // dbg("uploaded $ndone/$nfiles files.");
        if ($ndone===$nfiles) {
          echo "0:$nfiles files uploaded.";
        }
        else {
          echo "1:$ndone/$nfiles files uploaded.";
        }
        AppendUploadHist($usr, $totalMoved);
      } // if ($totalSz
      else {
        $LogData["err"]=Sz($totalSz)."+".Sz($usrTotal).
          " exceeded daily max ".Sz(DailyUploadLimit);
        echo "1:Total upload size ".Sz($totalSz)."+".Sz($usrTotal).
             " exceeded the daily limit of ".Sz(DailyUploadLimit);
      }
    } // if (is_dir($targetDir
    else
      $LogData["err"]="Unabled to access '".$targetDir."'";
  } // if (isset($_FILES[$key]...
  else {
    dbg("bad upload request.");
    if (!isset($_FILES[$key])) dbg('$_FILES['.$key.'] not set.');
    if (!is_dir($targetDir)) dbg("dir: $targetDir does not exist.");
    echo "2:Bad upload request.";
  }
  LogReq();
} // HandleDocsUpload() //

//---------------------------------------------------------
//  GetDocList(): Gather all user downloadable files and
//      implode('|') them into a single reply.
//---------------------------------------------------------
const DocsFNPatt="#^(.+)\.(pdf|xhtml|txt|html|jpeg|jpg|png|svg)$#";
// const NewsFNPatt="#news_(.+)\.(txt)$#";  defined in inc_news.php
const PollfilesFNPatt="#^(poll_|polldesc)(\d+)\.(txt)$#";
const TrashFNPatt="#^([^,]+),(.+)(_[A-F0-9]+)$#";

// function __fixFilename(string $dir, string $fn) :string
// {
//   $p=array();
//   $newfn=$fn;
//   if ($dir==="/.recycle") {
//     if (!preg_match("/^[-a-zA-Z0-9%()_.!~*]+\.\w+$/", $fn)) {
//       if (preg_match(TrashFNPatt, $fn, $p)) {
//         $newfn=$p[1].','.encodeURIComponent($p[2]).$p[3];
//       }
//     }
//   }
//   else if ($dir==="/news" || $dir==="/polls") {
//   }
//   else if (in_array(substr($dir,1), ValidUploadDests, true)) {
//     if (!preg_match("/^[-a-zA-Z0-9%()_.!~*]+\.\w+$/", $fn)) {
//       if (preg_match(DocsFNPatt,$fn,$p)) {
//         $newfn=encodeURIComponent($p[1]).'.'.$p[2];
//       }
//     }
//   }

//   if ($newfn!==$fn) {
//     if (rename(DocsDir.$dir.'/'.$fn, DocsDir.$dir.'/'.$newfn))
//       $fn=$newfn;
//   }
//   return $fn;
// }

function GetDocList(string $req, string &$listing) : int
{
  $doclist=array();
  $ndocs=0;
  $fnpatt=DocsFNPatt;
  if ($req==="TRASHLIST") {
    $subdirs=array("/.recycle");
    $fnpatt=TrashFNPatt;
  }
  else if ($req==="NEWSFILES") {
    $subdirs=array("/news");
    $fnpatt=NewsFNPatt;
  }
  else if ($req==="POLLFILES") {
    $subdirs=array("/polls");
    $fnpatt=PollfilesFNPatt;
  }
  else //if ($req==="DOCLIST")
    $subdirs=array("/talks", "/solve", "/misc");

  foreach($subdirs as $subdir)
  {
    $dirname=DocsDir.$subdir;
    dbg("scanning $dirname");
    if (is_dir($dirname)) {
      $dir = opendir($dirname);
      if ($dir) {
        while (false!==($fn=readdir($dir))) {
          if (preg_match($fnpatt, $fn)) {
            // $fn=__fixFilename($subdir, $fn);
            array_push($doclist, encodeURIComponent($dirname."|".$fn));
            $ndocs++;
            dbg("$fn added to list");
          }
        } // while ()
        closedir($dir);
      } // if ($dir)
    }
  } // foreach
  $listing=implode("|",$doclist);
  dbg($listing);
  return $ndocs;
} // GetDocList()

function RemoveDoc(string $usr, string $docinfo)
{
  $successfulQ=false;
  $parts=array();
  if (preg_match("#^(".DocsDir."\/([^|]+))\|(.+)(\.\w+)$#",$docinfo, $parts) && is_dir($parts[1])) {
    $fulldir=$parts[1];
    $subdir=$parts[2];
    $fn=$parts[3];
    $ext=$parts[4];
    $pathname = $fulldir.'/'.$fn.$ext;
    if (in_array($subdir, ValidUploadDests) && file_exists($pathname)) {
      if (!is_dir(RecycleBin)) {
        mkdir(RecycleBin);
      }
      if (is_dir(RecycleBin)) {
        LogReq();
        $mvTo = RecycleBin.'/'.$subdir.",".$fn.$ext."_".sprintf("%X",time()-RecycleTimeStart);
        dbg("RemoveDoc() ".$pathname."->".$mvTo);
        if (rename($pathname, $mvTo)) {
          echo "0:".$parts[2].'/'.$parts[3].$parts[4]." successfully moved into the recycle bin.";
          $successfulQ=true;
        }
      }
      else
        echo "9:recycle bin directory not accessible.";
    }
  }
  if (!$successfulQ) {
    echo "1:Unable to remove the document.";
  }
} // RemoveDoc()

function UndeleteFile(string $usr, string $docinfo)
{
  $successfulQ=false;
  $parts=array();
  if (preg_match("#^(".DocsDir."\/\.recycle)\|(([^,]+),(.+)(\.\w+)_([A-F0-9]+))$#",$docinfo, $parts) && is_dir($parts[1])) {
    $fn=$parts[4];
    $subdir=$parts[3];
    $ext=$parts[5];
    $timestamp=$parts[6];
    $trashed=$parts[1].'/'.$subdir.','.$fn.$ext.'_'.$timestamp;
    if (file_exists($trashed)) {
      LogReq();
      $restoredAs=$fn.$ext;
      $oname=DocsDir.'/'.$subdir.'/'.$restoredAs;
      if (file_exists($oname)) {
        $restoredAs="(".$timestamp.")".$fn.$ext;
        $oname=DocsDir.'/'.$subdir.'/'.$restoredAs;
      }
      if (rename($trashed, $oname)) {
        echo "0:".$subdir.','.$restoredAs;
        $successfulQ=true;
      }
    }
    else
      echo "9:Trashed file not accessible.";
  }
  if (!$successfulQ) {
    echo "1:Unable to restore the document.";
  }
} // UndeleteFile()

function RenameDoc(string $usr, string $docinfo, string $newname)
{
  $successfulQ=false;
  $parts=array();
  if (preg_match("#^(".DocsDir."\/([^|]+))\|(.+)(\.\w+)$#",$docinfo, $parts) && is_dir($parts[1])) {
    $subdir=$parts[2];
    $fn=$parts[3];
    $ext=$parts[4];
    $oname=DocsDir.'/'.$subdir.'/'.$fn.$ext;
    if (file_exists($oname)) {
      LogReq();
      $newname=DocsDir.'/'.$subdir.'/'.encodeURIComponent($newname).$ext;
      if ($oname!==$newname && rename($oname, $newname)) {
        echo "0:Renamed to '$newname'";
      }
    }
  }
  if (!$successfulQ) {
    echo "1:Unable to rename the document.";
  }
} // RenameFile()

?>
