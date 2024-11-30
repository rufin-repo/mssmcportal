class SPath {
  private pathData:number[];
  private pathTrans:number[]=null;
  constructor (desc:number[]) {
    this.pathData = desc;
  }
  public SetPathTrans(t:number[]=null) : SPath{
    if (t && t.length===6) this.pathTrans=t;
    else this.pathTrans=null;
    return this;
  }
  public SetPathTranslate(x:number, y:number) : SPath{
    this.pathTrans = [1,0,0,1,x,y];
    return this;
  }
  public MakePath(ctx: CanvasRenderingContext2D) {
    let i:number=0;
    let lastX=0.0, lastY=0.0;
    let subPathStart:number=0;
    if (this.pathTrans) {
      ctx.save();
      ctx.transform(
        this.pathTrans[0], this.pathTrans[1], this.pathTrans[2],
        this.pathTrans[3],this.pathTrans[4],this.pathTrans[5]);
    }
    ctx.beginPath();
    while (i<this.pathData.length) {
      let ndata=0;
      let opCode :number = ((this.pathData[i])&255);
      let relCoordQ = (this.pathData[i]&0xf00)===0xd00;
      i++;
      switch (opCode) {
      case 0xb: // box
      {
        ndata=4;
        let l = this.pathData[i], t=this.pathData[i+1];
        let w = this.pathData[i+2], h=this.pathData[i+3];
        ctx.moveTo(l,t);ctx.lineTo(l+w, t);
        ctx.lineTo(l+w,t+h); ctx.lineTo(l,t+h); ctx.lineTo(l,t);
        lastX=l; lastY=t;
        break;
      }
      case 0xfb:// fancy box (rounded rect)
      {
        ndata=5; // l,t,w,h and r
        let l = this.pathData[i], t=this.pathData[i+1];
        let w = this.pathData[i+2], h=this.pathData[i+3];
        let r = Math.min(this.pathData[i+4], 0.5*Math.min(w,h));
        ctx.moveTo(l, t+r);    ctx.arcTo(l,t,     l+r,t,    r);
        ctx.lineTo(l+w-r,t);   ctx.arcTo(l+w,t,   l+w,t+r,  r);
        ctx.lineTo(l+w,t+h-r); ctx.arcTo(l+w,t+h, l+w-r,t+h,r);
        ctx.lineTo(l+r,t+h);   ctx.arcTo(l,t+h,   l,t+h-r,  r);
        ctx.lineTo(l, t+r);
        break;
      }
      case 0xe: // close path (with a line)
        ctx.lineTo(lastX=this.pathData[subPathStart], lastY=this.pathData[subPathStart+1]);
        break;
      case 0:   // start of path. (move to)
        subPathStart=i;
        ndata=2;
        ctx.moveTo(lastX=this.pathData[i], lastY=this.pathData[i+1]);
        break;
      case 1:   // line to
        ndata=2;
        if (relCoordQ) {
          ctx.lineTo(lastX=lastX+this.pathData[i],
                     lastY=lastY+this.pathData[i+1]);
        } else {
          ctx.lineTo(lastX=this.pathData[i], lastY=this.pathData[i+1]);
        }
        break;
      case 0x72: // Horizontal line
        ndata=1;
        if (relCoordQ) {
          ctx.lineTo(lastX=lastX+this.pathData[i], lastY);
        } else {
          ctx.lineTo(lastX=this.pathData[i], lastY);
        }
        break;
      case 0x71: // Vertical Line
        ndata=1;
        if (relCoordQ) {
          ctx.lineTo(lastX, lastY=lastY+this.pathData[i]);
        } else {
          ctx.lineTo(lastX, lastY=this.pathData[i]);
        }
        break;
      case 0xbc: // bezier to
        ndata=6;
        if (relCoordQ) {
          ctx.bezierCurveTo(
            lastX+this.pathData[i],   lastY+this.pathData[i+1],
            lastX+this.pathData[i+2], lastY+this.pathData[i+3],
            lastX+this.pathData[i+4], lastY+this.pathData[i+5]);
          lastX+=this.pathData[i+4];
          lastY+=this.pathData[i+5];
        }
        else {
          ctx.bezierCurveTo(this.pathData[i],   this.pathData[i+1],
                            this.pathData[i+2], this.pathData[i+3],
                            lastX=this.pathData[i+4], lastY=this.pathData[i+5]);
        }
        break;
      case 0xb2:  // quadratic curve to
        ndata=4;
        if (relCoordQ) {
          ctx.quadraticCurveTo(
            lastX+this.pathData[i],   lastY+this.pathData[i+1],
            lastX+this.pathData[i+2], lastY+this.pathData[i+3]);
          lastX+=this.pathData[i+2];
          lastY+=this.pathData[i+3];
        }
        else {
          ctx.quadraticCurveTo(this.pathData[i],         this.pathData[i+1],
                               lastX=this.pathData[i+2], lastY=this.pathData[i+3]);
        }
        break;
      case 0xca: // circle (anti-clockwise)
      case 0xcc: // circle (clockwise)
        ndata=3;
        ctx.arc(lastX=this.pathData[i], lastY=this.pathData[i+1], this.pathData[i+2],
          0, 2*Math.PI, opCode!==0xcc);
        break;
      case 0xaa: // arc (anti-clockwise)
      case 0xac: // arc (clockwise)
        ndata=5;
        ctx.arc(lastX=this.pathData[i], lastY=this.pathData[i+1], this.pathData[i+2],
                this.pathData[i+3]*Math.PI/180.0, this.pathData[i+4]*Math.PI/180.0, opCode!==0xac);
        break;
      case 0xa2: // arc to
        ndata=5;
        if (relCoordQ) {
          ctx.arcTo(
            lastX+this.pathData[i],   lastY+this.pathData[i+1],
            lastX+this.pathData[i+2], lastY+this.pathData[i+3], this.pathData[i+4]);
          lastX+=this.pathData[i+2];
          lastY+=this.pathData[i+3];
        }
        else {
          ctx.arcTo(
            this.pathData[i],         this.pathData[i+1],
            lastX=this.pathData[i+2], lastY=this.pathData[i+3], this.pathData[i+4]);
        }
        break;
      case 0xf0:  // transform: rotate about a centre
        ndata=3;
        ctx.save();
        ctx.translate(this.pathData[i], -this.pathData[i+1]);
        ctx.rotate(this.pathData[i+2]*Math.PI/180.0);
        ctx.translate(-this.pathData[i], -this.pathData[i+1]);
        break;
      case 0xf2:  // transform: scale then rotate about a centre
        ndata=5;
        ctx.save();
        ctx.translate(this.pathData[i], this.pathData[i+1]);
        ctx.rotate(this.pathData[i+4]*Math.PI/180.0);
        ctx.scale(this.pathData[i+2], this.pathData[i+3]);
        ctx.translate(-this.pathData[i], -this.pathData[i+1]);
        break;
      case 0xfe:  // end of transformed group
        ctx.restore();
        break;
      default:  // bad
        throw "bad Path";
      } // switch(type) //
      i+=ndata;
    } // while (i) //
    if (this.pathTrans) {
      ctx.restore();
    }
  } // MakePath() //
  public RenderPath(ctx: CanvasRenderingContext2D, renderops:string[]) {
    this.MakePath(ctx);
    for (let i=0; i<renderops.length; i++) {
      if (renderops[i]) {
        switch (renderops[i].charAt(0)) {
        // case 'T':
        // {
        //   let sec:string[] = renderops[i].match(/\d+\.*\d*/g);
        //   if (sec && sec.length===6) {
        //     ctx.save();
        //     ctx.transform(Number(sec[0]),Number(sec[1]),Number(sec[2]),
        //                   Number(sec[3]),Number(sec[4]),Number(sec[5]));
        //     this.MakePath(ctx);
        //     ctx.restore();
        //     pathMadeQ=true;
        //   } // if (sec.length===6) .. //
        //   break;
        // }
        case 'f':  // fill
          if (renderops[i].length>1) {
            ctx.fillStyle = renderops[i].slice(1);
          }
          ctx.fill();
          break;
        case 's':  // stroke
        {
          let parts = renderops[i].match(/^s([0-9\.]*)(.*)$/);
          if (parts) {
            if (parts[1].length>0) {
              ctx.lineWidth = Number(parts[1]);
            }
            if (parts[2].length>0) {
              ctx.strokeStyle = parts[2];
            }
          }
          ctx.stroke();
          break;
        }
        case 'd': // set dash
        {
          let dashPatt:number[]=[];
          let sec:string[] = renderops[i].match(/\d+\.*\d*/g);
          if (sec && sec.length>0) {
            for (let j=0; j<sec.length; j++) {
              dashPatt.push(Number(sec[j]));
            }
          } // if (sec.length>0) .. //
          ctx.setLineDash(dashPatt);
        }
        break;
        } // switch (renderops[i]) .. //
      } // if (renderops[i])
    } // while (i) .. //
  } // RenderPath() //
} // class SPath //
