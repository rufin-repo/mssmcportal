<?php
//=================================================================
//  Create a <script src=...></script> line for each
//  valid MCQ file.
//  Simple verification will be performed on those files with
//  qualified filenames and a console.log error message will
//  be outputted for any obviously broken files.
//=================================================================

const MCQDir=".";
const MCQFnPatt='/^MCQ_[a-zA-Z0-9_()\-]+\.(js|txt)$/';

function dbg($s) {
  $fdbg = fopen("mcq.log", "a");
  fprintf($fdbg, "%s\n", $s);
  fclose($fdbg);
} // dbg() //

class MCQSrc
{
  const kInLineComment=1;
  const kInBlkComment=2;
  var $mSrcFn='';     // pathname
  var $mSrc='';       // comments striped source
  var $err='';
  var $errpos=-1;
  var $Output='';

  function init(string $fn)
  {
    $this->mSrcFn = $fn;
    if (file_exists($fn))
      $this->mSrc = file_get_contents($fn);
    else
      $this->mSrc = "";
  }

  function scanSrc(string $fn)
  {
    $this->init($fn);
    $out="";
    $l=strlen($this->mSrc);
    $parts=Array();
    $i=0;
    while ($i<$l && $this->err==='')
    {
      $c=$this->mSrc[$i];
      if ($c==='/' && $i+1<$l) {
        $c2=$this->mSrc[$i+1];
        if ($c2==='*') { // block comment. skip until after '*/'
          $i+=2;
          if (!preg_match('#.*\*\/#s', $this->mSrc, $parts, 0, $i)) {
            $this->errpos=$i;
            $this->err="Unclosed block comments.";
            echo $this->err."\n";
            $i=$l; // eof
          }
          else {
            $i+=(2+strlen($parts[0]));
            echo "blk comments skipped. restarting from ".substr($this->mSrc, $i, 10)."\n";
          }
        }
        else if ($c2==='/') { // line comment. skip until eol or eof.
          $i+=2;
          if (!preg_match('#[^\n\r]*(\n|\n\r|\r\n)#s', $this->mSrc, $parts, 0, $i)) {
            $i=$l; // eof
          }
          else {
            $i+=(2+strlen($parts[0]));
            echo "line comments skipped. restarting from ".substr($this->mSrc, $i, 10)."\n";
          }
        }
        else {
          $i++;
          $out.=$c;
        }
      } // if ($c==='/')
      else if ($c==="'" || $c==='"')
      {
        // echo "string start ".substr($this->mSrc,$i,10)."\n";
        // echo "patt=".   '#(\\\\.|[^'.$c.'\\\\\n\r])*(\n|\n\r|\r\n|'.$c.')#s';
        if (!preg_match('#(\\\\.|[^'.$c.'\\\\\n\r])*(\n|\n\r|\r\n|'.$c.')#s', $this->mSrc, $parts, 0, $i+1)
            || $parts[2]==='\n' || strlen($parts[2])==2)
        {
          $this->errpos=$i;
          $this->err="Unterminate string.";
          echo $this->err." from ".substr($this->mSrc,$i,10)."\n";
        }
        else {
          $strl=strlen($parts[0]);
          // echo $parts[0]."i=$i strlen=".$strl."\n";
          $out.=$c.$parts[0];
          $i+=($strl+1);
          echo "string:$c$parts[0] restarting from ".substr($this->mSrc,$i,10)."\n";
        }
      }
      else if ($c==='`')
      {
        if (!preg_match('#(\\\\.|[^'.$c.'\\\\])*('.$c.')#s', $this->mSrc, $parts, 0, $i+1))
        {
          $this->errpos=$i;
          $this->err="Unterminate string.";
          echo $this->err." from ".substr($this->mSrc,$i,10)."\n";
        }
        else {
          // echo "string:$c$parts[0]\n";
          $strl=strlen($parts[0]);
          // echo $parts[0]."i=$i strlen=".$strl."\n";
          $out.=$c.$parts[0];
          $i+=$strl+1;
          echo "string:$c$parts[0] restarting from ".substr($this->mSrc,$i,10)."\n";
        }
      }
      else {
        $i++;
        $out.=$c;
      }
    } // while ($i<$l)

    if (!$this->err)
      $this->Output=$out;
  } // scanSrc()
} // class MCQSrc

function ValidateMCQFile(string $fn, string &$scriptFn) : string
{
  $err='';
  $src = new MCQSrc;
  echo "scanning $fn\n";
  $src->scanSrc($fn);
  // $fin = fopen($fn, "r");
  // if ($fin) {
  //   flock($fin,LOCK_SH);

  //   flock($fin,LOCK_UN);
  //   fclose($fin);
  // }
  return $err;
} // ValidateMCQFile()

$dir = opendir(MCQDir);
if ($dir) {
  while (false!==($fn=readdir($dir))) {
    if (preg_match(MCQFnPatt, $fn, $fnpt)) {
      if (strtolower($fnpt[1])==='js') {
        echo "<script type='text/javascript' src='$fn'></script>\n";
      }
      else {
        // $scriptFn='';
        // $err=ValidateMCQFile($fn,$scriptFn);
        // if (!$err) {
        //   echo "<script type='text/javascript' src='$scriptFn'></script>\n";
        // }
        // else {
        //   echo "<script>console.log('MCQ file $fn not used: $err');</script>\n";
        // }
      }
    }
  }
}

?>
