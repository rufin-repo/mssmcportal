const U={
  kShow:  1,
  kHide:  0,
  kToggle:-1,
  // function mulberry32(a)
  RandSeed: performance.now(),
  Random: ()=>{
      let t = U.RandSeed += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

//==============================================================
//General utility functions
//==============================================================
function byId(id:string) : HTMLElement {
  return document.getElementById(id) as HTMLElement;
} // byId() //

function HasClassQ(ele:HTMLElement, cls:string) : boolean {
  return ele.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'))!==null;
}
function AddClass(ele:HTMLElement, cls:string) {
  if (!HasClassQ(ele,cls)) ele.className += " "+cls;
}
function RemoveClass(ele:HTMLElement, cls:string) {
  if (HasClassQ(ele,cls))
    ele.className=ele.className.replace(
      new RegExp('(\\s|^)'+cls+'(\\s|$)'),' ');
}

function ShowHideBlockDiv(div: string|HTMLDivElement, showHide:number)
{
  if (typeof(div)==="string") div=byId(div) as HTMLDivElement;
  if (div) {
    const hideQ = showHide===U.kHide ? true : showHide===U.kShow ? false : !div.hidden;
    div.hidden=hideQ;
    div.style.display = hideQ ? "none": "block";
  } // if (div)
} // ShowHideBlockDiv()



//=================================================================================
//  shuffle():
//    Initialize the input array (a) with a random permutation from 0..a.length-1
//    (Durstenfeld's optimal in-place algorithm)
//=================================================================================
function shuffle(src:any[]) : any[] {
  let out:any[]=[]; out.length=src.length;
  for (let i=0; i<src.length; i++) {
    let j = Math.floor(Math.random()*i);
    if (i!==j) out[i]=out[j];
    out[j]=src[i];
  } // for (i) //
  return out;
} //shuffle()

/**
  Initialize the input array (a) with a random permutation from 0..a.length-1
  (Durstenfeld's optimal in-place algorithm)
*/
function randPermNPM(n:number, m:number=0) : number[] {
  if (m<=0 || m>n) m=n;            // m===0 means shuffle the entire n cards.
  let a:number[]=[]; a.length=n;
  for (let i=0; i<n; i++) a[i]=i;  // source deck of size n
  for (let i=0; i<m; i++) {        // deal out m cards from the source deck.
    let j = Math.floor(Math.random()*(n-i)); // swap with ith place card.
    if (j!==0) {
      let t=a[i];  a[i]=a[i+j];  a[i+j]=t;
    }
  } // for (i)
  a.length=m; // discard the unused cards (which are not properly shuffled).
  return a;
} //randPermNPM()

/**
 * Returns a random number from bottom to top, inclusive.
 */
function randInt(min:number, max:number):number {
  return Math.floor(Math.random()*(max-min+1))+min;
}

/**
 * generates an array of random numbers from bottom to top, inclusive.
 * @param bottom lowest possible number.
 * @param top highest possible number.
 * @param Ntogenerate NUmber of numbers to generate.
 */
function randNFromTo(bottom:number, top:number, Ntogenerate:number):number[] {
  let numbers:number[]=[];
  if(Ntogenerate>top-bottom+1)
  {
    throw "Error: unable to generate array"
  }
  else
  {

    numbers.length=Ntogenerate;
    for(let i=0; i<Ntogenerate; i++)
    {
      numbers[i]=randInt(bottom, top);
      for(let n=0; n<numbers.length; n++)
      {
          while(numbers[n]===numbers[i])
          {
            if(i===n){break;}
            numbers[i]=randInt(bottom, top);
          }
      }
    }
  }
  return numbers;
} //randNFromTo()

function StuffinArray(numbers:number[], array:string[])
{
  let res:string[]=[];

  if(numbers.length<=array.length)
  {
    res.length=numbers.length;
    for(let i=0; i<numbers.length; i++)
    {
      res[i]=array[numbers[i]];
    }
  }
  return res;
}

function GCD(x:number, y:number):number
{
  function gcd(a:number, b:number):number {
    while (b!==0) {
      let rem = a%b;
      a=b; b=rem;
    }
    return a;
  }
  if (Math.abs(x)<Math.abs(y))
    return gcd(Math.abs(y),Math.abs(x));
  else
    return gcd(Math.abs(x),Math.abs(y));
} //GCD()


// Synchronously read a text file from the web server with Ajax
//
// The filePath is relative to the web page folder.
// Example:   myStuff = LoadFile("Chuuk_data.txt");
//
// You can also pass a full URL, like http://sealevel.info/Chuuk1_data.json, but there
// might be Access-Control-Allow-Origin issues. I found it works okay in Firefox, Edge,
// or Opera, and works in IE 11 if the server is configured properly, but in Chrome it only
// works if the domains exactly match (and note that "xyz.com" & "www.xyz.com" don't match).
// Otherwise Chrome reports an error:
//
//   No 'Access-Control-Allow-Origin' header is present on the requested resource. Origin 'http://sealevel.info' is therefore not allowed access.
//
// That happens even when "Access-Control-Allow-Origin *" is configured in .htaccess,
// and even though I verified the headers returned (you can use a header-checker site like
// http://www.webconfs.com/http-header-check.php to check it). I think it's a Chrome bug.
function LoadFile(filePath:string) {
  var result = null;
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", filePath, false);
  xmlhttp.send();
  if (xmlhttp.status==200) {
    result = xmlhttp.responseText;
  }
  return result;
} // LoadFile()


function CalcFrac(a:number,b:number,c:number,d:number,op:number) {
  let ans="`";
  let num=0;
  let dem=0;
  switch (op) {
    default:
    case 0: num = a*d + c*b; dem=b*d; break; // a/b + c/d
    case 1: num = a*d - c*b; dem=b*d; break; // a/b - c/d
    case 2: num = a*c; dem=b*d; break;       // a/b * c/d
    case 3: num = a*d; dem=b*c; break;       // a/b * d/c
  }
  let gcd = GCD(num, dem);
  num = num/gcd;
  dem = dem/gcd;
  if (dem===1) ans+=num;
  else ans+=num.toString()+"/"+dem.toString();
  ans+="`";
  return ans;
} //CalcFrac()

function CalcFracSteps(a:number,b:number,c:number,d:number,op:number) : string {
  let steps="";
  let stepNum=1;
  let num=0;
  let dem=0;

  if (op===0 || op===1) {
    let opstr = op===0 ? ' + ' : ' - ';
    let gcd1 = GCD(a,b);
    let gcd2 = GCD(c,d);
    if (gcd1!==1 || gcd2!==1) {
      a/=gcd1; b/=gcd1;
      c/=gcd2; d/=gcd2;
      steps += "Step "+(stepNum++)+", simplify into:<br>&emsp;`"+a+"/"+b+opstr+c+'/'+d+"`<p>";
    }

    let mul1=1, mul2=1;
    if (b!==d) {
      dem = b*d/GCD(b,d);
      mul1 = dem/b;
      mul2 = dem/d;
      steps += "Step "+(stepNum++)+", convert both fractions to a common denominator. The lowest common multiple of `"+b+"` and `"+d+"` is `"+dem+"`, so we could use `"+dem+"` as the common denominator:<p>&emsp;"+
      "`("+a+" xx "+mul1+")/("+b+" xx "+mul1+") "+opstr+
       "("+c+" xx "+mul2+")/("+d+" xx "+mul2+") = "+a*mul1+"/"+dem+opstr+c*mul2+"/"+dem+"`<p>";
    }
    else dem=b;

    num=op===0 ? (a*mul1 +c*mul2) : (a*mul1 - c*mul2);
    steps += "Step "+(stepNum++)+(op===0 ? ", add" : ", subtract")+" the numerators:<br>&emsp;`("+num+')/'+dem+"`<p>";

    let gcd3 = GCD(num,dem);
    num/=gcd3;
    dem/=gcd3;
    if (gcd3!==1 || dem===1) {
      steps += "Step "+(stepNum++)+", simplify into:<br>&emsp;";
      if (dem===1) steps+= "`"+num+"`<p>";
      else steps+= "`"+num+'/'+dem+"`<p>";
    }
    else
      steps+= "Can't be further simplified... ";
  }
  else { // mult or div
    if (op===3) //div
    {
      steps += "Step "+(stepNum++)+", `-:` is just `xx` the reciprocal:<br>&emsp;`"+a+"/"+b+'xx'+d+'/'+c+"`<p>";
      let t=c; c=d; d=t;
    }
    let gcd1 = GCD(a,b);
    let gcd2 = GCD(c,d);
    a/=gcd1; b/=gcd1;
    c/=gcd2; d/=gcd2;
    let gcd3 = GCD(a,d);
    let gcd4 = GCD(c,b);
    a/=gcd3; d/=gcd3;
    c/=gcd4; b/=gcd4;
    if (gcd1!==1 || gcd2!==1 || gcd3!==1 || gcd4!==1) {
      steps += "Step "+(stepNum++)+", simplify into:<br>&emsp;`"+a+"/"+b+'xx'+c+'/'+d+"`<p>";
    }
    steps += "Step "+(stepNum++)+", multiply numerators and denominators respectively:<br>&emsp;`"+a*c+"/"+b*d+"`<p>";
  }
  steps+="Done.";
  return steps;
} //CalcFracSteps()


function SetCookie(cname:string, cvalue:string)
{
  try {
    if (cvalue===null) {
      window.localStorage.removeItem(cname);
    }
    else {
      window.localStorage.setItem(cname, cvalue);
    }
  }
  catch (err) {
  }
} // SetCookie() //

function GetCookie(cname:string)
{
  let cvalue="";
  try {
    cvalue = window.localStorage.getItem(cname);
    if (cvalue === null) cvalue="";
  }
  catch (err) {
  }
  return cvalue;
} // GetCookie() //



function yHash(s:string, h:number=0x811c9dc5) {
  //var h = ini||0x811c9dc5;
  for (var i=0; i<s.length; i++) {
    //var c = s.charCodeAt(i)|0;
    var c = s.charCodeAt(i)&0x7f;
    h = Math.imul((h^c)>>>0,16777619)>>>0;
//      /*DBG*/if (i%10===0) console.log(i+":"+c+","+h);
  }
  return h;
} //yHash() //

function hashCode(s:string, hash:number=0) : number {
  if (s.length>0)
    for (let i=0; i<s.length; i++) {
      let code = s.charCodeAt(i);
      if (code>256)
        hash = (((hash<<5) - hash) + (code>>8))|0;
      hash = (((hash<<5) - hash) + (code&255))|0;
    } // for (i)
  return hash>>>0;
} //hashCode() //

function shuffleBits(n:number) {
  let u16=[(n*0.5)&0x55555555, n&0x55555555]; // even bits, odd bits
  for (let p=1; p>=0; p--) {
    let packed16=0;
    let u = u16[p];
    for (let bit=1<<15; bit; bit>>=1) {
      if (u%2) packed16+=bit;
      u>>=2;
    } // for (i)
    u16[p] = packed16;
  } // for (p) //
  return u16[0]*(1<<16)+u16[1];
} //shuffleBits() //

class deciFloat {
  mNegQ: boolean;
  mDigits: string;
  mPow10: number;  // +ve or -ve
  // value is mDigit * 10^mPow10
  constructor(digits:number, pow10:number) {
    this.mNegQ  = digits<0;
    this.mDigits = (Math.round(Math.abs(digits))).toString();
    this.mPow10 = pow10;
    this.normalize();
  } //constructor() //

  normalize() { // remove tailing zeros in mDigits
    if (+this.mDigits === 0) {
      this.mNegQ = false;
      this.mDigits="0";
      this.mPow10=0;
    }
    else {
      let ndigits = this.mDigits.length;
      let nzeros=0;
      for (let i=ndigits-1; i>=0; i--) {
        if (this.mDigits.charCodeAt(i)===0x30) nzeros++;
        else break;
      } // for (i)
      if (nzeros>0) {
        this.mPow10 += nzeros;
        this.mDigits = this.mDigits.slice(0,-nzeros);
      }
    }
  } //normalize()

  toString() {
    if (this.mPow10>=0) return (this.mNegQ ? "-" : "")+((+this.mDigits)*Math.pow(10,this.mPow10)).toString();
    else {
      let out:string= this.mNegQ ? "-" : "";
      let ndigits = this.mDigits.length;
      let shift = -this.mPow10;
      if (shift>=ndigits) { // need 0.
        out+="0.";
        for (let i=0; i<shift-ndigits; i++) out+="0";
        out+=this.mDigits;
      }
      else if (shift===0) {
        out+=this.mDigits;
      }
      else {
        out+=this.mDigits.substr(0,ndigits-shift) + "." + this.mDigits.substring(ndigits-shift);
      }
      return out;
    }
  } //toString()//

  add(f:deciFloat, negatedQ:boolean = false) {
    let thisSign = this.mNegQ ? -1 : 1;
    let fSign = f.mNegQ ? -1 : 1;
    if (negatedQ) fSign*=-1;

    let sum=new deciFloat(0,0);
    if (f.mPow10>this.mPow10) {
      let shift = f.mPow10-this.mPow10;
      let v = (thisSign*+this.mDigits + fSign*+f.mDigits*Math.pow(10, shift));
      sum.mNegQ = v<0;
      sum.mDigits = Math.abs(v).toString();
      sum.mPow10 = this.mPow10;
    }
    else {
      sum.mPow10 = f.mPow10;
      let v = thisSign*+this.mDigits*Math.pow(10, this.mPow10-f.mPow10) + fSign*+f.mDigits;
      sum.mNegQ = v<0;
      sum.mDigits = Math.abs(v).toString();
    }
    sum.normalize();
    return sum;
  } //add() //

  mult(f:deciFloat) {
    let prd = new deciFloat(0,0);
    prd.mNegQ = this.mNegQ !== f.mNegQ;
    prd.mDigits = (+this.mDigits * +f.mDigits).toString();
    prd.mPow10  = this.mPow10 + f.mPow10;
    prd.normalize();
    return prd;
  } // mult() //
} // class deciFloat //

function addFigures(txt:string):string{
  function replacer(_matched:string,sz:string,szval:string,hpart:string,hval:string, p1:string,_offset:number, _whole:string) {
    return '<div class="figdiv"' +
            (sz && szval ? ' style="width:'+szval+'px; height:'+
              (hpart && hval ? hval : szval)+'px;"' : '')+
            '><img src="figs/'+p1+'"/></div>';
  };
  //return txt.replace(/FIG\[(|\(([0-9]+)\))([^\(\]][^\]]*)\]/gi, replacer);
  return txt ? txt.replace(/FIG\[(|\(([0-9]+)(| *, *([0-9]+))\))([^\(\]][^\]]*)\]/gi, replacer)
             : "";
};
