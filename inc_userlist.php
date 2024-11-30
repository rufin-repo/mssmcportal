<?php

  const UsrPwdList      = 'mma-2022-u-s-e-r-s.list.txt';
  const kChgOwnPwd      =1;
  const kAdminSetUsrPwd =-1;  // usr level will be -ve


  function VerifyPwd(string $pwd, string $saltedhash) : bool {
    return password_verify($pwd, $saltedhash);
  }

  function MkSaltedHash(string $pwd) : string {
    return password_hash($pwd, PASSWORD_DEFAULT);
  }

  //**********************************************************************
  //
  //  User List management functions
  //
  //**********************************************************************
  //
  //  UsrPwdList file stores one single-line record per member:
  //
  //  usrhash,pwd_salted_hash,9,Flags|pwdChgedBy
  //
  const MemberRecPatt='#^([^,]+),([^,]+),(\d+),(\w+)\|(.*)$#';

  //======================================================================
  // LookupUser(): returns user level if it is a reg. user
  //                     0: means user not found.
  //                     -ve: means pwd mismatch. (-ve of user level)
  //                     R_usrData for passing back additional user data.
  //======================================================================
  function LookupUser(string $usrHash, string $pwdHash, string &$outFlags, string &$outUsrData) : int
  {
    $usrlvl=0;
    if ($usrHash==='' || $usrHash===Anon || $usrHash==='sys') {
      $outFlags='';
      $outUsrData='';
      return $usrHash==='sys' ? 2 : 0;
    }
    else if (file_exists(UsrPwdList)) {
      $fpwd = fopen(UsrPwdList, "r");
      if ($fpwd) {
        flock($fpwd, LOCK_SH);
        while (!feof($fpwd)) {
          $line = fgets($fpwd);
          if (preg_match(MemberRecPatt, $line, $pwdparts) &&
              $usrHash===$pwdparts[1])
          {
            // dbg("found rec in ".UsrPwdList." for ".$usrHash.":".$line);
            $outFlags = $pwdparts[4] ? $pwdparts[4] : "";
            $outUsrData = $pwdparts[5] ? $pwdparts[5] : "";
            if (VerifyPwd($pwdHash,$pwdparts[2])) {
              $usrlvl= (int)$pwdparts[3];
            }
            else {
              $usrlvl= -(int)$pwdparts[3];
            }
            break;
          }
            // dbg("'".$pwdparts[1]."' '".$pwdparts[2]."\n");
        } // while !feof
        flock($fpwd, LOCK_UN);
        fclose($fpwd);
        dbg("LookupUser(".$usrHash.",".$pwdHash.")->".$usrlvl);
        return $usrlvl;
      }
    } // if (file_exists(UsrPwdList)
    dbg(UsrPwdList." file not found.");
    return -0xdead;
  } // LookupUser()

  function UpdateUser(
    string $operatorHash, string $operatorPwd,
    string $targetUsrHash, string $pwd, int $level,
    string &$outFlagAndData) : bool
  {
    $outFlagAndData='';
    $successful=false;
    $tmstamp = date("Ymd-his");
    if (file_exists(UsrPwdList)) {
      dbg("UpdateUser($operatorHash,$operatorPwd,$targetUsrHash,$pwd,$level");
      if ($level>0 && $level<=9 &&
          !empty($operatorHash) &&
          !empty($targetUsrHash) &&
          !empty($pwd))
      {
        $ftmp = tmpfile();
        if ($ftmp) {
          flock($ftmp,LOCK_EX);
          dbg("UpdateUser created ftmp");
          $fpwd = fopen(UsrPwdList, "r+");
          if ($fpwd) {
            flock($fpwd,LOCK_EX);
            $updatedQ=false;
            $operatorIsAdminQ=false;
            $nrecCopied=0;
            while (!feof($fpwd)) {
              $line = fgets($fpwd);
              if (preg_match(MemberRecPatt, $line, $pwdparts)) {
                if ($targetUsrHash===$pwdparts[1]) {
                  $updatedQ=true;
                  $outFlagAndData=($targetUsrHash===$operatorHash ? "P|Chg|" : ("T|Chg_by_".$operatorHash."|")).$tmstamp;
                  fwrite($ftmp, $targetUsrHash.",".MkSaltedHash($pwd).",".$level.",".
                    $outFlagAndData."\n");
                  if ($operatorHash===$targetUsrHash && ((int)$pwdparts[3])>1) {
                    $operatorIsAdminQ=true;
                  }
                  dbg("user rec for $targetUsrHash updated.");
                }
                else // not the user we are looking for. Just copy.
                {
                  if ($operatorHash===$pwdparts[1] &&
                      VerifyPwd($operatorPwd,$pwdparts[2]) &&
                      ((int)$pwdparts[3])>1) {$operatorIsAdminQ=true;}
                  fwrite($ftmp, trim($line)."\n");
                }
                $nrecCopied++;
              }
              else if (!empty($line)) {
                dbg("bad user rec:".$line);
              }
            } // while !feof
            dbg($nrecCopied." recs copied");

            if (!$updatedQ && $operatorHash!==$targetUsrHash && $operatorIsAdminQ) {
              // create a new one if targetUsrHash is not found. and
              // only if $operatorHash has admin rights (level>1)
              $outFlagAndData="T|Added_by_".$operatorHash."|".$tmstamp;
              fwrite($ftmp, $targetUsrHash.",".MkSaltedHash($pwd).",".$level.",".$outFlagAndData."\n");
              $updatedQ=true;
              dbg("new user rec created for ".$targetUsrHash);
            }
            fflush($ftmp);
            // new set of member records written to $ftmp.
            // rewind both files and copy $ftmp content over.
            rewind($ftmp);
            rewind($fpwd);
            if ($updatedQ) {
              if (ftruncate($fpwd, 0)) {
                while (!feof($ftmp)) {
                  $line = fgets($ftmp);
                  fwrite($fpwd,$line);
                }
                $successful=true;
              }
              else
                dbg("Unable to truncate fpwd");
            }
            fflush($fpwd);
            flock($fpwd, LOCK_UN);
            fclose($fpwd);
          } // if ($fpwd)

          flock($ftmp,LOCK_UN);
          fclose($ftmp);
        } // if ($ftmp)
      } // if the parameters is ok for updating or adding a user
      else {
        if ($level<=0) dbg("bad level:".$level);
        else if (empty($operatorHash)) dbg("empty operatorHash:".$operatorHash);
        else if (empty($targetUsrHash)) dbg("empty targetUsrHash:".$targetUsrHash);
        else if (empty($pwd)) dbg("empty pwd:".$pwd);
      }
    }
    else if ($targetUsrHash && $pwd) {  // UsrPwdList file does not exist at all.
      $fpwd=fopen(UsrPwdList, 'w');
      if ($fpwd) {
        flock($fpwd,LOCK_EX);
        $outFlagAndData="P|Administrator|".$tmstamp;
        fwrite($fpwd, $targetUsrHash.','.MkSaltedHash($pwd).",9,".$outFlagAndData."\n");
        fflush($fpwd);
        flock($fpwd,LOCK_UN);
        fclose($fpwd);
        $successful=true;
      }
    }
    return $successful;
  } // UpdateUser()
?>
