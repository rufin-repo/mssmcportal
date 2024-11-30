interface SRQData {
  [key:string]:string|FileList
};

//=============================================================
//
//  SRQ: Server ReQuest: http request and queue processing
//
//=============================================================
class SRQ
{
  static kTIME_TO_BRING_UP_SPINNER = 200; // >0.2 sec -> bring up the progress spinner.
  static kTIMEOUT_THRESHOLD = 15000;      // 15 sec -> request is taking too long.

  private mReq:string;
  private mUsr:string;
  private mPwd:string;
  private mData:SRQData;
  private mResolve:(result:string)=>void;
  private mReject:(error:string)=>void;

  constructor(
    req:string, usr:string, pwdhash:string,
    dataDict:SRQData,
    resolve:(r:string)=>void,
    reject:(r:string)=>void
  )
  {
    this.mReq=req;
    this.mUsr=usr;
    this.mPwd=pwdhash;
    this.mData=dataDict;
    this.mResolve=resolve;
    this.mReject=reject;
  } // constructor()

  //----------------------------------------------- static data and functions
  private static SrvReqQueue:SRQ[]=[];
  private static ProgressShownQ=false;
  private static OnFreeCallBack:(()=>void)[] = [];

  public static WhenNotBusyDo(fcn:()=>void) {
    if (fcn) {
      if (SRQ.BusyQ())  SRQ.OnFreeCallBack.push(fcn);
      else fcn();
    } // if (fcn)
  } // WhenNotBusyDo()

  public static MakeHttpRequest()
  {
    if (SRQ.SrvReqQueue.length>0) {
      const r=SRQ.SrvReqQueue[0];
      const req = r.mReq;
      const usr = r.mUsr;
      const pwdhash  = r.mPwd;
      const dataDict = r.mData;

      const _reqDone = (r:SRQ, successfulQ:boolean, result:string)=>
      {
        const ridx = SRQ.SrvReqQueue.indexOf(r);
        SRQ.SrvReqQueue.splice(ridx,1);    // remove the finished request from the queue.
        if (successfulQ)  r.mResolve(result);
        else              r.mReject(result);

        if (SRQ.SrvReqQueue.length>0) { // Are there still pending request in the queue?
          SRQ.MakeHttpRequest();        // make the next HttpRequest
        }
        else {  // queue cleared. Put away the progress spinner if it has been shown.
          if (SRQ.ProgressShownQ) {
            SRQ.ProgressShownQ=false;
            CWA.ShowHidePopupDiv(CWA.ProgressSpinnerDiv, A.Hide);
          } // if (progressShownQ)
          while (SRQ.OnFreeCallBack.length) {
            const fcn = SRQ.OnFreeCallBack.splice(0,1);
            if (fcn[0]) fcn[0]();
          }
          CWA.UpdateUIState();
        }
      } // _reqDone()

      if (navigator.onLine) {
        let usrhash = CWA.UserHash(usr);
        // let okQ=false;
        let reqTime = performance.now();
        try {
          let request = new XMLHttpRequest();
          request.open('POST', A.kAskServerURL, true);
          // --> Must NOT use this --> request.setRequestHeader("Content-Type", "multipart\/form-data");
          request.responseType = 'text';
          request.timeout = SRQ.kTIMEOUT_THRESHOLD;

          request.onprogress = ()=>{
            //console.log(request.readyState + request.responseText);
            if (performance.now()-reqTime>SRQ.kTIME_TO_BRING_UP_SPINNER
            && !SRQ.ProgressShownQ
            && CWA.PopupDivHiddenQ(CWA.ProgressSpinnerDiv))
            {
              CWA.log('~');
              SRQ.ProgressShownQ=true;
              CWA.ShowHidePopupDiv(CWA.ProgressSpinnerDiv, A.Show);
            }
            // CWA.UpdateProgress();
          }; // onprogress

          request.onreadystatechange = ()=>
          {
            // Note: no need to deal with hiding the progress spinner here.
            //       that is handled when the SrvReqQueue is completely cleared.

            // /*DBG*/console.log(request.readyState + request.responseText);
            if (request.readyState===4 && //--------- people say this is the same as "onload" but better backward compatibility.
                request.status===200)
            {
              // Server has responded.
              let res = request.responseText;
              if (res===null || res.length<2) {
                CWA.log('+'+req+'?]');
                _reqDone(r, false, "Unrecognized server response.");
              }
              else if (res.substring(0,2)!=="0:") {
                CWA.log('+'+req+'!'+res.substring(0,2)+']');
                _reqDone(r, false,
                  (req==="AUTHUSR" || req==="REGUSR")
                  ? res
                  : ("Error: " + res.substring(2)));
              }
              else {
                CWA.log('+'+req+':0]'); // success.
                _reqDone(r, true, res.substring(2));
              }
            } // if (readyState===4 && status===200)
          }; // onreadystatechange

          request.ontimeout = ()=>{ //--- Time out might happen if a large file is involved.
            CWA.log('+'+req+'!T/O]');
            _reqDone(r, false, "Error: Server access timeout");
            // reject("Error: MMA Server access timeout");
          }; // ontimeout

          request.onerror = ()=>{   //------------ This happens if not online.
            CWA.log('+'+req+'!HTTP Req Err]');
            // _reqDone will deal with progress spinner.
            _reqDone(r, false, req+": HTTP request error");
            // reject(req+": HTTP Request Error");
          }; // onerror

          let data = new FormData();
          data.append("RQ", req);
          data.append("H1", usrhash);
          if (pwdhash) data.append("H2", pwdhash);

          if (dataDict) {
            for (let key in dataDict) {
              if (dataDict.hasOwnProperty(key) && dataDict[key]) {
                if (key==='FILEDATA') {
                  if (dataDict.hasOwnProperty('FN') && typeof(dataDict[key])==='string')
                    data.append('fileToUpload', new Blob([dataDict[key] as string],{type:"text/plain"}), dataDict['FN'] as string);
                  else throw "FILEDATA must be accompanied with FN.";
                }
                else {
                  if (typeof(dataDict[key])==='string')
                    data.append(key, dataDict[key] as string);
                  else if (key.substring(key.length-2)==='[]' && dataDict[key] instanceof FileList) {
                    const flist = dataDict[key] as FileList;
                    for (let i=0; i<flist.length; i++)
                      data.append(key, flist[i]);
                  }
                  else throw "Internal Logic Error: Bad server request data.";
                }
              }
            } // for (key)
          } // if (dataDict)

          // if (req==="RECBUG") {
          //   if (scorename!==null && scoredata!==null && extra && extra.length===3) {
          //     data.append("BTYPE",  extra[0]);
          //     data.append("BSTATE", extra[1]);
          //     if (extra[2]) data.append("BUGID",extra[2]);
          //     data.append("BTITLE", scorename); // scorename arg used for passing bug-title
          //     data.append("BDESC",  scoredata); // scoredata arg used for passing bug-body-text
          //   }
          // }
          // else if (req==="GETBUG") {
          //   if (scorename!==null) {
          //     data.append("BUGID", scorename);
          //   }
          // }
          // else if (req!=="SYSLIST") {
          //   if (pwd) data.append("H2", hash2.toString(36));
          //   if ((req==="UPLOAD" || req==="DOWNLOAD" || req==="DELFILE") && scorename) data.append("FN", scorename);
          //   if (req==="UPLOAD" && scorename && scorename.length && scoredata && scoredata.length>20) {
          //     data.append("fileToUpload", new Blob([scoredata],{type:"text/plain"}), scorename);
          //   }
          // } // if (req!==SYSLIST)
          let now = new Date();
          data.append("TM", now.getTime().toString());
          /*DBG*/console.log('XHR:'+data.toString());
          request.send(data);
        } catch (e) {
          CWA.log('+'+req+'!Exception:'+e+']');
          // No need to deal with progress spinner here. _reqDone will take care of that.
          _reqDone(r, false, "Exception: "+e);
          // reject("Exception: "+e);

        }
      } // if (onLine)
      else {
        CWA.log('!Offln]');
        // No need to deal with progress spinner here. _reqDone will take care of that.
        _reqDone(r, false, "Offline");
        // reject("Offline");
      }
    } // if (SrvReqQueue.length)
  } //SRQ.MakeHttpRequest() //

  static AddRequest(req:SRQ)
  {
    CWA.log('[Ask:'+req);
    SRQ.SrvReqQueue.push(req);

    if (SRQ.SrvReqQueue.length===1) { // no unfinished request pending. Can start a new one immediately.
        SRQ.MakeHttpRequest();
    }
  } // SRQ.AddRequest()

  static BusyQ() {return SRQ.SrvReqQueue.length>0;}
} // class SRQ //
