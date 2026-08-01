(function(){
var imgs=[],aidx=-1,zoom=4,drag=null,fullPad=true;
var $=function(s){return document.querySelector(s);};
var il=$('#il'),mc=$('#mc'),pc=$('#pc'),vp=$('#vp'),es=$('#es');
var ct=$('#ct'),to=$('#to'),dz=$('#dz'),po=$('#po'),ptx=$('#ptx'),pfl=$('#pfl');
var fi=$('#fi'),fif=$('#fif'),pw=$('#pw'),ph=$('#ph'),cbFull=$('#cbFull');
var slLen=$('#slLen'),slVal=$('#slVal');
var mctx=mc.getContext('2d'),pctx=pc.getContext('2d');
var tt;function toast(m){clearTimeout(tt);to.textContent=m;to.classList.add('sh');tt=setTimeout(function(){to.classList.remove('sh');},2000);}
var idc=0;function gid(){return'x'+(++idc);}
function defEdges(w,h,len){len=len||5;var st=new Uint8Array(w),sl=new Uint8Array(h),pb=new Uint8Array(w),pr=new Uint8Array(h);var ts=Math.max(0,Math.floor((w-len)/2));for(var i=0;i<len&&ts+i<w;i++)st[ts+i]=1;var ls=Math.max(0,Math.floor((h-len)/2));for(var i=0;i<len&&ls+i<h;i++)sl[ls+i]=1;for(var i=0;i<w;i++)pb[i]=1;for(var i=0;i<h;i++)pr[i]=1;return{st:st,sl:sl,pb:pb,pr:pr};}
function applySegLenTo(im){var w=im.w,h=im.h,len=im.segLen;im.st.fill(0);im.sl.fill(0);var ts=Math.max(0,Math.floor((w-len)/2));for(var j=0;j<len&&ts+j<w;j++)im.st[ts+j]=1;var ls=Math.max(0,Math.floor((h-len)/2));for(var j=0;j<len&&ls+j<h;j++)im.sl[ls+j]=1;}
function loadImg(f){return new Promise(function(rs,rj){var r=new FileReader();r.onload=function(e){var img=new Image();img.onload=function(){rs({img:img,name:f.name});};img.onerror=function(){rj(Error(f.name));};img.src=e.target.result;};r.onerror=function(){rj(Error(f.name));};r.readAsDataURL(f);});}
function addImgs(fl){var arr=Array.from(fl),added=0;function nx(i){if(i>=arr.length){if(added>0){if(aidx===-1)sel(0);render();}return;}loadImg(arr[i]).then(function(r){var w=r.img.naturalWidth,h=r.img.naturalHeight;imgs.push({id:gid(),name:r.name,img:r.img,w:w,h:h,segLen:5,...defEdges(w,h,5)});added++;nx(i+1);}).catch(function(e){toast(e.message);nx(i+1);});}nx(0);}
function render(){il.innerHTML=imgs.map(function(im,i){return'<div class="iitem'+(i===aidx?' ac':'')+'" data-i="'+i+'"><img class="thumb" src="'+im.img.src+'"><div class="info"><div class="name" title="'+im.name+'">'+im.name+'</div><div class="dim">'+im.w+' x '+im.h+'</div></div><button class="rm" data-i="'+i+'">x</button></div>';}).join('');ct.textContent='共 '+imgs.length+' 张';upEs();}
function upEs(){es.style.display=imgs.length===0?'flex':'none';if(imgs.length===0){mc.style.display='none';pc.style.display='none';}}
function sel(i){aidx=i;render();var im=imgs[aidx],vw=vp.clientWidth-20,vh=vp.clientHeight-20;zoom=Math.max(1,Math.floor(Math.min(vw/(im.w+2),vh/(im.h+2))));pw.value=Math.min(Math.max(im.w*2,80),500);ph.value=Math.min(Math.max(im.h*2,80),500);slLen.value=im.segLen;slVal.textContent=im.segLen;draw();drawPv();}
function rmImg(i){imgs.splice(i,1);if(imgs.length===0){aidx=-1;mc.style.display='none';pc.style.display='none';}else if(aidx>=imgs.length)aidx=imgs.length-1;else if(i<aidx)aidx--;render();if(aidx>=0){draw();drawPv();}}
function chk(ctx,w,h,sz){var a='#2a2a2a',b='#222';for(var y=0;y<h;y+=sz)for(var x=0;x<w;x+=sz){ctx.fillStyle=((x/sz+y/sz)%2===0)?a:b;ctx.fillRect(x,y,sz,sz);}}
function segBounds(arr){var s=-1,e=-1;for(var i=0;i<arr.length;i++){if(arr[i]){if(s===-1)s=i;e=i;}}return{s:s,e:e};}
function draw(){
if(aidx<0){mc.style.display='none';return;}
var im=imgs[aidx],w=im.w,h=im.h,cw=(w+2)*zoom,ch=(h+2)*zoom;
mc.width=cw;mc.height=ch;mc.style.display='block';mc.style.width=cw+'px';mc.style.height=ch+'px';
var ctx=mctx;ctx.clearRect(0,0,cw,ch);chk(ctx,cw,ch,zoom);
ctx.drawImage(im.img,zoom,zoom,w*zoom,h*zoom);
var topSeg=segBounds(im.st),leftSeg=segBounds(im.sl);
ctx.fillStyle='#ff4444';
if(topSeg.s>=0)ctx.fillRect((topSeg.s+1)*zoom,0,(topSeg.e-topSeg.s+1)*zoom,zoom);
if(leftSeg.s>=0)ctx.fillRect(0,(leftSeg.s+1)*zoom,zoom,(leftSeg.e-leftSeg.s+1)*zoom);
ctx.fillStyle='#4ecdc4';
ctx.fillRect(zoom,(h+1)*zoom,w*zoom,zoom);ctx.fillRect((w+1)*zoom,zoom,zoom,h*zoom);
if(fullPad){ctx.fillRect((w+1)*zoom,0,zoom,zoom);ctx.fillRect(0,(h+1)*zoom,zoom,zoom);ctx.fillRect((w+1)*zoom,(h+1)*zoom,zoom,zoom);}
ctx.strokeStyle='rgba(255,255,255,0.6)';ctx.lineWidth=1;
if(topSeg.s>=0)ctx.strokeRect((topSeg.s+1)*zoom,0,(topSeg.e-topSeg.s+1)*zoom,zoom);
if(leftSeg.s>=0)ctx.strokeRect(0,(leftSeg.s+1)*zoom,zoom,(leftSeg.e-leftSeg.s+1)*zoom);
ctx.strokeStyle='rgba(255,255,255,0.15)';ctx.lineWidth=1;
ctx.beginPath();ctx.moveTo(0,zoom);ctx.lineTo(cw,zoom);ctx.moveTo(0,(h+1)*zoom);ctx.lineTo(cw,(h+1)*zoom);ctx.stroke();
ctx.beginPath();ctx.moveTo(zoom,0);ctx.lineTo(zoom,ch);ctx.moveTo((w+1)*zoom,0);ctx.lineTo((w+1)*zoom,ch);ctx.stroke();
ctx.fillStyle='rgba(255,255,255,0.15)';
for(var x=0;x<w;x++)if(x<topSeg.s||x>topSeg.e)ctx.fillRect((x+1)*zoom,0,zoom,zoom);
for(var y=0;y<h;y++)if(y<leftSeg.s||y>leftSeg.e)ctx.fillRect(0,(y+1)*zoom,zoom,zoom);}
function bseg(sz,on){var seg=[],st=0;for(var i=0;i<=sz;i++){if(i===sz||on[i]!==(i>0?on[i-1]:0)){if(i>st)seg.push({s:st,e:i,stretch:on[st]===1});st=i;}}if(seg.length===0)seg.push({s:0,e:sz,stretch:false});return seg;}
function drawPv(){if(aidx<0){pc.style.display='none';return;}var im=imgs[aidx],tw=parseInt(pw.value)||im.w,th=parseInt(ph.value)||im.h;pc.width=tw;pc.height=th;pc.style.display='block';pc.style.maxWidth='100%';pc.style.maxHeight='100%';var ctx=pctx;ctx.clearRect(0,0,tw,th);chk(ctx,tw,th,4);npv(ctx,im,tw,th);}
function npv(ctx,im,tw,th){var w=im.w,h=im.h,cols=bseg(w,im.st),rows=bseg(h,im.sl);var tx=0,ty=0;for(var i=0;i<cols.length;i++){cols[i].sw=cols[i].e-cols[i].s;if(cols[i].stretch)tx+=cols[i].sw;}for(var i=0;i<rows.length;i++){rows[i].sh=rows[i].e-rows[i].s;if(rows[i].stretch)ty+=rows[i].sh;}var ex=Math.max(0,tw-w),ey=Math.max(0,th-h),px=tx>0?ex/tx:0,py=ty>0?ey/ty:0;for(var i=0;i<cols.length;i++)cols[i].dw=cols[i].stretch?cols[i].sw+cols[i].sw*px:cols[i].sw;for(var i=0;i<rows.length;i++)rows[i].dh=rows[i].stretch?rows[i].sh+rows[i].sh*py:rows[i].sh;var dy=0;for(var ri=0;ri<rows.length;ri++){var r=rows[ri],dx=0;for(var ci=0;ci<cols.length;ci++){var c=cols[ci];ctx.drawImage(im.img,c.s,r.s,c.sw,r.sh,dx,dy,c.dw,r.dh);dx+=c.dw;}dy+=r.dh;}var pxc=bseg(w,im.pb),pxr=bseg(h,im.pr),c1=null,c2=null,c3=null,c4=null;for(var i=0;i<pxc.length;i++)if(pxc[i].stretch){if(c1===null)c1=pxc[i].s;c3=pxc[i].e;}for(var i=0;i<pxr.length;i++)if(pxr[i].stretch){if(c2===null)c2=pxr[i].s;c4=pxr[i].e;}if(c1!==null&&c2!==null){function mp(pos,arr,ak,dk){var d=0;for(var i=0;i<arr.length;i++){var a=arr[i];if(pos>=a.e){d+=a[dk];}else if(pos>=a.s){d+=(pos-a.s)/a[ak]*a[dk];return d;}else return d;}return d;}var dx1=mp(c1,cols,'sw','dw'),dy1=mp(c2,rows,'sh','dh'),dx2=mp(c3,cols,'sw','dw'),dy2=mp(c4,rows,'sh','dh');ctx.fillStyle='rgba(255,255,255,0.08)';ctx.fillRect(dx1,dy1,dx2-dx1,dy2-dy1);ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.lineWidth=1;ctx.setLineDash([4,4]);ctx.strokeRect(dx1,dy1,dx2-dx1,dy2-dy1);ctx.setLineDash([]);}}
function hitTopEdge(bx,by,w){return by>=-3&&by<=3&&bx>=1&&bx<=w;}
function hitLeftEdge(bx,by,h){return bx>=-3&&bx<=3&&by>=1&&by<=h;}
mc.addEventListener('mousedown',function(e){if(aidx<0)return;var r=mc.getBoundingClientRect(),cx=e.clientX-r.left,cy=e.clientY-r.top;var bx=Math.floor(cx/zoom),by=Math.floor(cy/zoom);var im=imgs[aidx],w=im.w,h=im.h;if(hitTopEdge(bx,by,w)){drag={axis:'st',im:im,w:w,h:h};return;}if(hitLeftEdge(bx,by,h)){drag={axis:'sl',im:im,w:w,h:h};return;}});
function moveSegment(im,axis,cx,cy,w,h){var len=im.segLen||5;if(axis==='st'){var bx=Math.floor(cx/zoom)-1,mid=bx-Math.floor(len/2),ns=Math.max(0,Math.min(w-len,mid));im.st.fill(0);for(var i=0;i<len;i++)if(ns+i<w)im.st[ns+i]=1;}else{var by=Math.floor(cy/zoom)-1,mid=by-Math.floor(len/2),ns=Math.max(0,Math.min(h-len,mid));im.sl.fill(0);for(var i=0;i<len;i++)if(ns+i<h)im.sl[ns+i]=1;}}
mc.addEventListener('mousemove',function(e){if(!drag)return;var r=mc.getBoundingClientRect(),cx=e.clientX-r.left,cy=e.clientY-r.top;moveSegment(drag.im,drag.axis,cx,cy,drag.w,drag.h);draw();drawPv();});
window.addEventListener('mouseup',function(){if(drag){drag=null;draw();}});
function resetDefault(im){var d=defEdges(im.w,im.h,im.segLen);im.st=d.st;im.sl=d.sl;im.pb=d.pb;im.pr=d.pr;}
function genPNG(im){var w=im.w,h=im.h,tw=w+2,th=h+2,c=document.createElement('canvas');c.width=tw;c.height=th;var ctx=c.getContext('2d');ctx.clearRect(0,0,tw,th);ctx.drawImage(im.img,1,1);ctx.fillStyle='#000';for(var x=0;x<w;x++)if(im.st[x])ctx.fillRect(x+1,0,1,1);for(var y=0;y<h;y++)if(im.sl[y])ctx.fillRect(0,y+1,1,1);for(var x=0;x<w;x++)if(im.pb[x])ctx.fillRect(x+1,h+1,1,1);for(var y=0;y<h;y++)if(im.pr[y])ctx.fillRect(w+1,y+1,1,1);if(fullPad){ctx.fillRect(w+1,0,1,1);ctx.fillRect(0,h+1,1,1);ctx.fillRect(w+1,h+1,1,1);}return c;}
function dl(cv,fn){return new Promise(function(rs){cv.toBlob(function(b){var u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=fn;document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(u);setTimeout(rs,100);},'image/png');});}
function en(n){var d=n.lastIndexOf('.');return(d>0?n.substring(0,d):n)+'.9.png';}
function expCur(){if(aidx<0){toast('请先选择图片');return;}var im=imgs[aidx];dl(genPNG(im),en(im.name)).then(function(){toast('已导出: '+en(im.name));});}
function expAll(){
if(imgs.length===0){toast('没有图片可导出');return;}
po.classList.add('ac');pfl.style.width='0%';ptx.textContent='准备中...';
var doZip=function(){
var zip=new JSZip(),total=imgs.length,done=0;
for(var i=0;i<total;i++){(function(idx){
var im=imgs[idx],c=genPNG(im);
c.toBlob(function(b){zip.file(en(im.name),b);done++;pfl.style.width=((done/total)*100)+'%';ptx.textContent='打包 '+done+'/'+total;
if(done===total){zip.generateAsync({type:'blob'}).then(function(zb){var u=URL.createObjectURL(zb),a=document.createElement('a');a.href=u;a.download='点九图导出.zip';document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(u);po.classList.remove('ac');toast('成功导出 '+total+' 张点九图');});}}, 'image/png');
})(i);}
};
if(window.JSZip){doZip();}else{var s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';s.onload=doZip;document.head.appendChild(s);}
}
$('#bi').addEventListener('click',function(){fi.click();});$('#bif').addEventListener('click',function(){fif.click();});
fi.addEventListener('change',function(e){addImgs(e.target.files);fi.value='';});fif.addEventListener('change',function(e){addImgs(e.target.files);fif.value='';});
$('#bcl').addEventListener('click',function(){imgs=[];aidx=-1;render();mc.style.display='none';pc.style.display='none';upEs();});
$('#bea').addEventListener('click',expAll);$('#bec').addEventListener('click',expCur);
$('#bce').addEventListener('click',function(){if(aidx<0)return;resetDefault(imgs[aidx]);draw();drawPv();toast('已重置为默认');});
il.addEventListener('click',function(e){var it=e.target.closest('.iitem');if(!it)return;var i=parseInt(it.dataset.i);if(e.target.closest('.rm'))rmImg(i);else sel(i);});
$('#bzi').addEventListener('click',function(){zoom=Math.min(zoom*2,32);draw();});$('#bzo').addEventListener('click',function(){zoom=Math.max(Math.floor(zoom/2),1);draw();});
$('#bzf').addEventListener('click',function(){if(aidx<0)return;var im=imgs[aidx],vw=vp.clientWidth-20,vh=vp.clientHeight-20;zoom=Math.max(1,Math.floor(Math.min(vw/(im.w+2),vh/(im.h+2))));draw();});
pw.addEventListener('input',drawPv);ph.addEventListener('input',drawPv);
$('#bpr').addEventListener('click',function(){if(aidx<0)return;var im=imgs[aidx];pw.value=im.w;ph.value=im.h;drawPv();});
document.addEventListener('dragover',function(e){e.preventDefault();dz.classList.add('ac');});
dz.addEventListener('dragleave',function(e){if(e.target===dz)dz.classList.remove('ac');});
document.addEventListener('drop',function(e){e.preventDefault();dz.classList.remove('ac');if(e.dataTransfer.files.length>0)addImgs(e.dataTransfer.files);});
cbFull.addEventListener('change',function(){fullPad=cbFull.checked;draw();drawPv();});
slLen.addEventListener('input',function(){if(aidx<0)return;var im=imgs[aidx];im.segLen=parseInt(slLen.value);slVal.textContent=im.segLen;applySegLenTo(im);draw();drawPv();});
document.addEventListener('keydown',function(e){if(e.ctrlKey&&e.key==='e'){e.preventDefault();expAll();}else if(e.ctrlKey&&e.key==='s'){e.preventDefault();expCur();}else if(e.ctrlKey&&e.key==='o'){e.preventDefault();fi.click();}else if((e.key==='+'||e.key==='=')&&e.ctrlKey){e.preventDefault();zoom=Math.min(zoom*2,32);draw();}else if(e.key==='-'&&e.ctrlKey){e.preventDefault();zoom=Math.max(Math.floor(zoom/2),1);draw();}});
upEs();$('#bea').textContent='导出全部 (.zip)';})();
