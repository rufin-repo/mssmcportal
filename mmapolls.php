<?php
  const PollsDir = "docs/polls";

  //====================================
  // mkline(): a helper function
  //====================================
  function mkline(string $data) : string { // add a line break at the end if there isn't one.
    if (empty($data)) return "\n";
    else if ($data[strlen($data)-1]!=="\n")
      return $data."\n";
    else
      return $data;
  }

  //=================================================================
  //
  //  Poll Files Related Functions
  //
  //=================================================================

  //*****************************************************************
  // Poll File format:
  //
  // line 0: flags(alnum)|active-until-time(yyyy-mm-dd-hhmmss)
  // line 1: Encoded string for the entire descriptive text (or paragraphs)
  //         about the poll, or <filename> of a file (content with html formatting)
  //         for displaying what the poll is about.
  // line 2: Encoded choice descs separated by "|"
  // line 3+ Each line is a vote in 999:(userid) format

  const PollExpireTimePatt='#^\d{4}-\d{2}-\d{2}-\d{6}$#'; // yyyy-mm-dd-hhmmss
  const MaxNPollChoices = 300;
  const PollFlagsPatt='#^\d\w*$#'; // 'level''type'
  const PollDescFNPatt='#\<([^<>.]+\.txt)\>#';
  const PollFNPatt='#^poll_([^.]+)\.txt$#';

  // Construct a poll data file name from a poll Id.
  function PollFilename($pollId) :string
  {
    return PollsDir."/poll_".$pollId.".txt";
  } // PollFilename()

  function ReadPollFileHeader(string $pollId, int $lockType,
    string &$outPollFlags, string &$outActiveUntil,
    string &$outPollDesc, int &$outNChoices, array &$outChoiceDesc,
    &$outStream) : string
  {
    $pollfile = PollFilename($pollId);
    $err="";
    $outPollFlags="";
    $outActiveUntil="";
    $outNChoices=0;
    $outChoiceDesc=array();
    $outTallies=array();
    $fin=null;

    if (!file_exists($pollfile)) {
      $err="Non-existent poll file or invalid poll ID (".$pollId.").";
      dbg("Poll file:".$pollfile." does not exist.");
    }
    else if (!($fin=fopen($pollfile, $lockType===LOCK_EX ? "r+" : "r"))) {
      $err="Unable to open poll file for reading.";
      dbg("Can't open poll file:".$pollfile);
    }
    else {
      flock($fin, $lockType);
      if (!feof($fin)) {
        $line = trim(fgets($fin));
        $flagAndTime= explode("|", $line, 3);
        if (count($flagAndTime)!==2) {
          dbg("Bad poll flags/expiration line:".$line);
          $err="Bad poll flags and expiration time.";
        }
        else if (!preg_match(PollFlagsPatt, $flagAndTime[0])) {
          dbg("Bad poll flags:".$line."->".$flagAndTime[0].",".$flagAndTime[1]);
          $err="Bad poll flags.";
        }
        else if (!preg_match(PollExpireTimePatt,$flagAndTime[1]))
        {
          dbg("Bad poll expiration time:".$line."->".$flagAndTime[0].",".$flagAndTime[1]);
          $err="Bad poll expiration time.";
        }
        else {
          $outPollFlags = $flagAndTime[0];
          $outActiveUntil = $flagAndTime[1];
          $outPollDesc=trim(fgets($fin));
          if (empty($outPollDesc)) {
            $err="Bad poll description.";
            dbg("bad poll desc line:".$line);
          }
          else if (!feof($fin)) {
            $outChoiceDesc = explode("|", trim(fgets($fin)), MaxNPollChoices);
            $nchoices = count($outChoiceDesc);
            if ($nchoices===0 || $nchoices>=MaxNPollChoices) {
              $err="Bad choice descriptions. (".$nchoices.")";
            }
            else {
              for ($i=0; $i<$nchoices; $i++)
                array_push($outTallies, 0);
              $outNChoices=$nchoices;
            }
          } // if (!feof
          else
            $err="No poll choices.";
        }
      }
    }

    if (empty($err)) {
      $outStream = $fin;
    }
    else if ($fin) {
      $outStream=null;
      fclose($fin);
    }

    return $err;
  } // ReadPollFileHeader()

  //-------------------------------------------------------------------
  // ReadPollFile(): returns an array of tallies for each choice
  //-------------------------------------------------------------------
  function ReadPollFile(string $pollId, int $lock, string &$outPollFlags, string &$outActiveUntil,
    string &$outPollDesc, array &$outChoiceDesc, array &$outVotes, array &$outTallies,
    &$fin) : string
  {
    $outPollDesc="";
    $outChoiceDesc=array();
    $outTallies=array();
    $outVotes=array();
    $nchoices=0;

    $err="";
    $fin=null;

    if (empty($err=ReadPollFileHeader(
      $pollId, $lock, $outPollFlags, $outActiveUntil,
      $outPollDesc, $nchoices, $outChoiceDesc, $fin)))
    {
      for ($i=0; $i<count($outChoiceDesc); $i++) array_push($outTallies, 0);

      $n=0;
      while (empty($err) && !feof($fin)) {
        $line = fgets($fin);
        if (preg_match("#^([0-9]+):([^\n]+)#", $line, $parts)) {
          $choice = (int) $parts[1];
          if ($choice>=0 && $choice<$nchoices) {
            $outTallies[$choice]++;
            array_push($outVotes, trim($line));
          }
          else
            $err="Internal error: Bad vote record #".($n+1).":".trim($line);
        } // if (preg_match(
        $n++;
      } // while (!err && !feof
    }
    // else $err="Internal error: Ill-formed poll file.";

    // if ($fin) fclose($fin);

    return $err;
  } // ReadPollFile() //

  function VotedChoice(string $userid, array $voteRecs) : int
  {
    // dbg($voteRecs);
    $nvotes=count($voteRecs);
    for ($i=0; $i<$nvotes; $i++) {
      $pos = strpos($voteRecs[$i], ":");  // find the pos of the separator.
      if (strcmp(substr($voteRecs[$i],$pos+1),$userid)===0) {
        dbg('voteRec['.$i.']='.$voteRecs[$i]);
        return (int)substr($voteRecs[$i],0,$pos);
      }
    }
    return -1;
  } // VotedChoice()

  //====================================================================
  //  ChkVoteValidity(): Check the validity of a vote
  //      returns an error message or "" if valid.
  //====================================================================
  function ChkVoteValidity(string $pollId,
    // string $pollDesc, string $optsDesc,
    string $voteFor,
    string &$outActiveUntil,
    array &$outChoices) : string
  {
    dbg("ChkVoteValidity(".$pollId.",".$voteFor.")");
    $outChoices=null;
    $outActiveUntil="";
    $err="";
    if (!preg_match('#^[0-9A-Fa-f]+$#', $pollId))
      $err="Invalid Poll ID.";
    // else if (!$pollDesc || strlen($pollDesc)<2)
    //   $err="Invalid Poll Description.";
    else {
      $_nChoices=0;
      $_pollDesc="";
      $_pollFlags="";
      $outChoices=array();
      $_fpoll=null;
      $err=ReadPollFileHeader($pollId, LOCK_SH,
        $_pollFlags, $outActiveUntil,
        $_pollDesc, $_nChoices, $outChoices, $_fpoll);
      if ($_fpoll) {
        flock($_fpoll,LOCK_UN);
        fclose($_fpoll);
      }
      // $outChoices=explode($optsDesc,"|");
      if (!$outChoices || count($outChoices)<=1)
        $err="Bad choice descriptions.";
      else if (!is_numeric($voteFor) || (int)$voteFor<0 || (int)$voteFor>=count($outChoices))
        $err="Bad vote choice:".$voteFor;
    }
    // else
    //   $err="Poll #".$pollId." not available.";
    dbg($err);
    return $err;
  } // ChkVoteValidity()

  //=========================================================================
  //  VoteForPoll(): add a vote to an existing poll file
  //      returns an error message or '' if successful.
  //=========================================================================
  function VoteForPoll(
    string $pollId, //string $pollDesc, array $choices,
    int $voteFor, string $userId, int $userlvl, array &$outTallies) : string
  {
    $pollfile = PollFilename($pollId);
    $err = "";

    $fpoll = null;

    if (file_exists($pollfile)) { // Poll file already there. Read it in.
      $pollFlags="";
      $activeUntil="";
      $oldPollDesc="";
      $oldChoices=array();
      $outVotes=array();
      $err=ReadPollFile($pollId, LOCK_EX, $pollFlags, $activeUntil,
                        $oldPollDesc, $oldChoices,
                        $outVotes, $outTallies, $fpoll);
      if (!$err) {
        if (date("Y-m-d-His")>$activeUntil)
          $err="Poll closed for voting.";
        else if ($userlvl<(int)$pollFlags[0])
          $err=$userlvl===0 ? "User not signed in." : "User does not have voting rights for this poll. (".$userlvl." vs ".$pollFlags[0].")";
        else if ($voteFor<0 || $voteFor>=count($oldChoices))
          $err="Invalid choice.";
        else if (!$outTallies) //  || ($choices && count($oldChoices)!==count($choices)))
          $err="Inconsistent poll structure.";
        else if (VotedChoice($userId, $outVotes)>=0) {
          // $fpoll = fopen($pollfile, "r+"); // need to update the poll file.
          // flock($fpoll, LOCK_EX); // lock it exclusively first.
          // create a new temp poll file.
          rewind($fpoll);
          $ftmp = tmpfile();
          if (!$ftmp) $err="Server error: Unable to create temp poll file.";
          else {
            dbg("copying from poll file...");
            $line=fgets($fpoll);
            $flagAndTime= explode("|", trim($line), 3);
            if (count($flagAndTime)!==2
             || !preg_match(PollExpireTimePatt, trim($flagAndTime[1])))
            {
              $err="failed to parse active-until time.";
              dbg("bad active-until time (".trim($line).")");
            }
            else {
              fwrite($ftmp, $line);
              $line=fgets($fpoll);
              if (!preg_match(PollDescFNPatt, trim($line))) {
                $err="failed to parse desc file line.";
                dbg("bad poll desc file line (".trim($line).")");
              }
              else {
                fwrite($ftmp, $line);
                $line=fgets($fpoll);
                if (count(explode("|",trim($line)))===count($oldChoices))
                  fwrite($ftmp, mkline($line));
                else {
                  $err="choice desc line mismatch.";
                  dbg("bad choice descs ($line)");
                }
              }
            }
            if (empty($err)) {
              while (!feof($fpoll)) {
                $line=fgets($fpoll);
                $voteRec = trim($line);
                $sep = strpos($voteRec, ":");
                // copy over any old votes that is not voted by $userId
                if ($sep>=1 && strcmp($userId,substr($voteRec,$sep+1))!==0) {
                  fwrite($ftmp, mkline($voteRec));
                }
              } // while (!feof($fpoll)

              // Now copy back everything in the new tmp file back to the poll file.
              rewind($fpoll); //fseek($fpoll,0,SEEK_SET);
              ftruncate($fpoll,0);    // remove everything in the old poll file.
              rewind($ftmp); //fseek($ftmp,0,SEEK_SET);
              while (!feof($ftmp)) {  // copy all lines.
                $line = fgets($ftmp);
                if (trim($line)) {
                  // dbg("ftmp:".$line);
                  fwrite($fpoll, mkline($line));
                }
              }
              fclose($ftmp);
              fflush($fpoll);
            }
          }
        }
        else {
          // Better not update the poll/choices descriptions
          // if (!$pollDesc) $pollDesc=$oldPollDesc;
          // if (!$choices) $choices=$oldChoices;
          // $fpoll = fopen($pollfile, "r+"); // for reading and writing.
          // flock($fpoll, LOCK_EX);
          fseek($fpoll, -1, SEEK_END);  // move file pointer to the end for appending.
          $c = fgetc($fpoll);
          if ($c!=="\n" && $c!=="\r") {
            dbg("adding a line break to updated poll file.");
            fwrite($fpoll, "\n");
          }
        }
      } // if (!$err)
    }
    // else if ($choices && $pollDesc && $voteFor>=0 && $voteFor<count($choices)) { // creata a new poll file
    //   $fpoll = fopen($pollfile, "w");
    //   if ($fpoll) {
    //     flock($fpoll, LOCK_EX);
    //     fwrite($fpoll, (string)$pollDesc);
    //     fwrite($fpoll, implode('|', $choices));

    //     $outTallies = array();
    //     for ($i=0; $i<count($choices); $i)
    //       array_push($tallies, 0);
    //   }
    // }
    else $err="Poll file not found.";

    if (empty($err) && $fpoll) {
      fwrite($fpoll, $voteFor.":".$userId."\n"); // add a vote record.
      fflush($fpoll); // flush changes before releasing the lock.

      $outTallies[$voteFor]++;
    }

    if ($fpoll) {
      flock($fpoll, LOCK_UN);
      fclose($fpoll);
    }
    return $err;
  } // VoteForPoll()

  function ExpandPollDesc(string $polldesc) : string
  {
    if (preg_match(PollDescFNPatt, $polldesc, $parts)) {
      // dbg("Expanding ".PollsDir."/".$parts[1]);
      $fin = fopen(PollsDir."/".$parts[1], "r");
      if ($fin) {
        flock($fin, LOCK_SH);
        $fulldesc="";
        while (!feof($fin)) $fulldesc.=fgets($fin);
        flock($fin, LOCK_UN);
        fclose($fin);
        // dbg("expanded into:".$fulldesc);
        return $fulldesc;
      }
    }
    return $polldesc;
  }

  function ListPolls(string &$listing) : int
  {
    $listing="";
    $npolls=0;
    $dir = opendir(PollsDir);
    if ($dir) {
      while (false!==($fn=readdir($dir))) {
        if (preg_match(PollFNPatt, $fn, $parts)) {
          $pollId = $parts[1];
          $pollDesc="";
          $NOpts=0;
          $OptDesc=array();
          $pollFlags="";
          $pollActiveUntil="";
          $fin=null;
          if (empty($err=ReadPollFileHeader(
              $pollId, LOCK_SH,
              $pollFlags, $pollActiveUntil,
              $pollDesc, $NOpts, $OptDesc, $fin)))
          {
            $listing .= (
              encodeURI($pollId)."|".
              $pollFlags."|".$pollActiveUntil."|".
              encodeURI(ExpandPollDesc($pollDesc))."|".
              $NOpts."|".
              encodeURI(implode("|",$OptDesc)).
              "\n");
            $npolls++;
            dbg("poll".$npolls.": ".$pollId."|".$pollFlags."|".$pollActiveUntil."|".$pollDesc."|".$NOpts);
          }
          else dbg("poll file:".$fn.":".$err);
        }
      } // while ()
      closedir($dir);
    }
    return $npolls;
  } // ListPolls()

?>
