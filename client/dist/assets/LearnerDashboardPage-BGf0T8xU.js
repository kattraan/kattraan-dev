import{v as E,j as t,r as p,u as Y,d as R,T as Z,S as K,V as Q,m as U,B as X,W as ee}from"./index--rKOJ741.js";import{B as F}from"./Button-BYdNpf5Q.js";import{D as T}from"./DashboardLayout-lnJVk01u.js";import{S as te}from"./sparkles-DC0ybbQL.js";import{g as re}from"./learnerCoursesService-C2CX4szi.js";import{a as ae}from"./learnerAssignmentsService-CeRqlRAS.js";import{C as se}from"./circle-check-big-BKi2IUVM.js";import{C as z}from"./clock-B4OP0gQs.js";import{W as ie}from"./wallet-ubQF0C_r.js";import{S as oe}from"./star-CYZzxBmh.js";import{C as ne}from"./circle-play-DO4ruZSp.js";import"./clsx-B-dksMZM.js";import"./bundle-mjs-BxlSfXgK.js";const le=[["path",{d:"M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4",key:"1slcih"}]],de=E("flame",le);const ce=[["path",{d:"M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978",key:"1n3hpd"}],["path",{d:"M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978",key:"rfe1zi"}],["path",{d:"M18 9h1.5a1 1 0 0 0 0-5H18",key:"7xy6bh"}],["path",{d:"M4 22h16",key:"57wxv0"}],["path",{d:"M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z",key:"1mhfuq"}],["path",{d:"M6 9H4.5a1 1 0 0 1 0-5H6",key:"tex48p"}]],I=E("trophy",ce);const pe=[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["line",{x1:"19",x2:"19",y1:"8",y2:"14",key:"1bvyxn"}],["line",{x1:"22",x2:"16",y1:"11",y2:"11",key:"1shjgl"}]],me=E("user-plus",pe),ue=({courses:e})=>t.jsx("div",{className:"overflow-hidden rounded-[32px] border border-gray-200 bg-white/95 shadow-sm backdrop-blur-sm transition-colors duration-300 dark:border-white/[0.12] dark:bg-white/[0.06] dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)] dark:backdrop-blur-xl",children:t.jsxs("table",{className:"w-full text-left",children:[t.jsx("thead",{children:t.jsxs("tr",{className:"border-b border-gray-200 bg-gray-50 transition-colors duration-300 dark:border-white/[0.08] dark:bg-white/[0.05]",children:[t.jsx("th",{className:"px-6 py-4 text-gray-400 dark:text-white/40 text-sm font-medium transition-colors duration-300",children:"Course Name"}),t.jsx("th",{className:"px-6 py-4 text-gray-400 dark:text-white/40 text-sm font-medium text-center transition-colors duration-300",children:"Progress"}),t.jsx("th",{className:"px-6 py-4 text-gray-400 dark:text-white/40 text-sm font-medium text-right transition-colors duration-300",children:"Action"})]})}),t.jsx("tbody",{className:"divide-y divide-gray-200 transition-colors duration-300 dark:divide-white/[0.06]",children:e.map((r,a)=>t.jsxs("tr",{className:"group transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.04]",children:[t.jsx("td",{className:"px-6 py-4",children:t.jsxs("div",{className:"flex flex-col",children:[t.jsx("span",{className:"text-gray-900 dark:text-white font-medium group-hover:text-primary-pink dark:group-hover:text-primary-pink transition-colors duration-300",children:r.title}),t.jsxs("span",{className:"text-gray-400 dark:text-white/40 text-xs transition-colors duration-300",children:["by ",r.instructor]})]})}),t.jsx("td",{className:"px-6 py-4 text-center align-middle",children:t.jsxs("div",{className:"w-full max-w-[140px] mx-auto space-y-2",children:[t.jsx("div",{className:"flex justify-between text-[10px] font-bold uppercase text-gray-400 dark:text-white/40 transition-colors duration-300",children:t.jsxs("span",{children:[r.progress,"%"]})}),t.jsx("div",{className:"w-full h-1 bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden transition-colors duration-300",children:t.jsx("div",{className:"h-full bg-primary-pink",style:{width:`${r.progress}%`}})})]})}),t.jsx("td",{className:"px-6 py-4 text-right",children:t.jsx(F,{variant:"secondary",size:"sm",className:"text-xs px-4 py-2",children:"Resume"})})]},a))})]})});let xe={data:""},he=e=>{if(typeof window=="object"){let r=(e?e.querySelector("#_goober"):window._goober)||Object.assign(document.createElement("style"),{innerHTML:" ",id:"_goober"});return r.nonce=window.__nonce__,r.parentNode||(e||document.head).appendChild(r),r.firstChild}return e||xe},ge=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,be=/\/\*[^]*?\*\/|  +/g,P=/\n+/g,v=(e,r)=>{let a="",i="",l="";for(let n in e){let o=e[n];n[0]=="@"?n[1]=="i"?a=n+" "+o+";":i+=n[1]=="f"?v(o,n):n+"{"+v(o,n[1]=="k"?"":r)+"}":typeof o=="object"?i+=v(o,r?r.replace(/([^,])+/g,d=>n.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,c=>/&/.test(c)?c.replace(/&/g,d):d?d+" "+c:c)):n):o!=null&&(n=/^--/.test(n)?n:n.replace(/[A-Z]/g,"-$&").toLowerCase(),l+=v.p?v.p(n,o):n+":"+o+";")}return a+(r&&l?r+"{"+l+"}":l)+i},y={},B=e=>{if(typeof e=="object"){let r="";for(let a in e)r+=a+B(e[a]);return r}return e},fe=(e,r,a,i,l)=>{let n=B(e),o=y[n]||(y[n]=(c=>{let h=0,g=11;for(;h<c.length;)g=101*g+c.charCodeAt(h++)>>>0;return"go"+g})(n));if(!y[o]){let c=n!==e?e:(h=>{let g,k,f=[{}];for(;g=ge.exec(h.replace(be,""));)g[4]?f.shift():g[3]?(k=g[3].replace(P," ").trim(),f.unshift(f[0][k]=f[0][k]||{})):f[0][g[1]]=g[2].replace(P," ").trim();return f[0]})(e);y[o]=v(l?{["@keyframes "+o]:c}:c,a?"":"."+o)}let d=a&&y.g?y.g:null;return a&&(y.g=y[o]),((c,h,g,k)=>{k?h.data=h.data.replace(k,c):h.data.indexOf(c)===-1&&(h.data=g?c+h.data:h.data+c)})(y[o],r,i,d),o},ye=(e,r,a)=>e.reduce((i,l,n)=>{let o=r[n];if(o&&o.call){let d=o(a),c=d&&d.props&&d.props.className||/^go/.test(d)&&d;o=c?"."+c:d&&typeof d=="object"?d.props?"":v(d,""):d===!1?"":d}return i+l+(o??"")},"");function C(e){let r=this||{},a=e.call?e(r.p):e;return fe(a.unshift?a.raw?ye(a,[].slice.call(arguments,1),r.p):a.reduce((i,l)=>Object.assign(i,l&&l.call?l(r.p):l),{}):a,he(r.target),r.g,r.o,r.k)}let O,A,L;C.bind({g:1});let w=C.bind({k:1});function we(e,r,a,i){v.p=r,O=e,A=a,L=i}function j(e,r){let a=this||{};return function(){let i=arguments;function l(n,o){let d=Object.assign({},n),c=d.className||l.className;a.p=Object.assign({theme:A&&A()},d),a.o=/ *go\d+/.test(c),d.className=C.apply(a,i)+(c?" "+c:"");let h=e;return e[0]&&(h=d.as||e,delete d.as),L&&h[0]&&L(d),O(h,d)}return l}}var ke=e=>typeof e=="function",S=(e,r)=>ke(e)?e(r):e,ve=(()=>{let e=0;return()=>(++e).toString()})(),je=(()=>{let e;return()=>{if(e===void 0&&typeof window<"u"){let r=matchMedia("(prefers-reduced-motion: reduce)");e=!r||r.matches}return e}})(),Ne=20,H="default",W=(e,r)=>{let{toastLimit:a}=e.settings;switch(r.type){case 0:return{...e,toasts:[r.toast,...e.toasts].slice(0,a)};case 1:return{...e,toasts:e.toasts.map(o=>o.id===r.toast.id?{...o,...r.toast}:o)};case 2:let{toast:i}=r;return W(e,{type:e.toasts.find(o=>o.id===i.id)?1:0,toast:i});case 3:let{toastId:l}=r;return{...e,toasts:e.toasts.map(o=>o.id===l||l===void 0?{...o,dismissed:!0,visible:!1}:o)};case 4:return r.toastId===void 0?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(o=>o.id!==r.toastId)};case 5:return{...e,pausedAt:r.time};case 6:let n=r.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(o=>({...o,pauseDuration:o.pauseDuration+n}))}}},_e=[],$e={toasts:[],pausedAt:void 0,settings:{toastLimit:Ne}},N={},q=(e,r=H)=>{N[r]=W(N[r]||$e,e),_e.forEach(([a,i])=>{a===r&&i(N[r])})},G=e=>Object.keys(N).forEach(r=>q(e,r)),Ce=e=>Object.keys(N).find(r=>N[r].toasts.some(a=>a.id===e)),M=(e=H)=>r=>{q(r,e)},De=(e,r="blank",a)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:r,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...a,id:a?.id||ve()}),$=e=>(r,a)=>{let i=De(r,e,a);return M(i.toasterId||Ce(i.id))({type:2,toast:i}),i.id},x=(e,r)=>$("blank")(e,r);x.error=$("error");x.success=$("success");x.loading=$("loading");x.custom=$("custom");x.dismiss=(e,r)=>{let a={type:3,toastId:e};r?M(r)(a):G(a)};x.dismissAll=e=>x.dismiss(void 0,e);x.remove=(e,r)=>{let a={type:4,toastId:e};r?M(r)(a):G(a)};x.removeAll=e=>x.remove(void 0,e);x.promise=(e,r,a)=>{let i=x.loading(r.loading,{...a,...a?.loading});return typeof e=="function"&&(e=e()),e.then(l=>{let n=r.success?S(r.success,l):void 0;return n?x.success(n,{id:i,...a,...a?.success}):x.dismiss(i),l}).catch(l=>{let n=r.error?S(r.error,l):void 0;n?x.error(n,{id:i,...a,...a?.error}):x.dismiss(i)}),e};var Ae=w`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,Le=w`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,Se=w`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,Ee=j("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${Ae} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${Le} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${e=>e.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${Se} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,Fe=w`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,Me=j("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${Fe} 1s linear infinite;
`,ze=w`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,Ie=w`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,Pe=j("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${ze} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${Ie} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${e=>e.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,Re=j("div")`
  position: absolute;
`,Te=j("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,Be=w`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,Oe=j("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${Be} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,He=({toast:e})=>{let{icon:r,type:a,iconTheme:i}=e;return r!==void 0?typeof r=="string"?p.createElement(Oe,null,r):r:a==="blank"?null:p.createElement(Te,null,p.createElement(Me,{...i}),a!=="loading"&&p.createElement(Re,null,a==="error"?p.createElement(Ee,{...i}):p.createElement(Pe,{...i})))},We=e=>`
0% {transform: translate3d(0,${e*-200}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,qe=e=>`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${e*-150}%,-1px) scale(.6); opacity:0;}
`,Ge="0%{opacity:0;} 100%{opacity:1;}",Je="0%{opacity:1;} 100%{opacity:0;}",Ve=j("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,Ye=j("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,Ze=(e,r)=>{let a=e.includes("top")?1:-1,[i,l]=je()?[Ge,Je]:[We(a),qe(a)];return{animation:r?`${w(i)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${w(l)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}};p.memo(({toast:e,position:r,style:a,children:i})=>{let l=e.height?Ze(e.position||r||"top-center",e.visible):{opacity:0},n=p.createElement(He,{toast:e}),o=p.createElement(Ye,{...e.ariaProps},S(e.message,e));return p.createElement(Ve,{className:e.className,style:{...l,...a,...e.style}},typeof i=="function"?i({icon:n,message:o}):p.createElement(p.Fragment,null,n,o))});we(p.createElement);C`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`;const Ke=()=>{const e=Y(),{loading:r}=R(i=>i.auth),a=async()=>{try{(await e(Q()).unwrap()).success&&x.success("Welcome to the Learner Panel!")}catch(i){x.error(i||"Failed to join as learner")}};return t.jsx(T,{title:"Dashboard",subtitle:"Explore as a learner to see courses, track progress, and earn certificates.",children:t.jsx("div",{className:"min-h-[60vh] flex items-center justify-center p-4",children:t.jsxs("div",{className:"max-w-[600px] w-full bg-white/[0.03] border border-white/10 rounded-[40px] p-8 md:p-12 backdrop-blur-3xl relative overflow-hidden text-center group",children:[t.jsx("div",{className:"absolute top-0 right-0 w-32 h-32 bg-primary-pink/10 blur-[60px] rounded-full -mr-16 -mt-16"}),t.jsx("div",{className:"absolute bottom-0 left-0 w-32 h-32 bg-primary-purple/10 blur-[60px] rounded-full -ml-16 -mb-16"}),t.jsxs("div",{className:"relative z-10 space-y-8",children:[t.jsxs("div",{className:"relative w-24 h-24 mx-auto",children:[t.jsx("div",{className:"absolute inset-0 bg-gradient-to-tr from-primary-pink to-primary-purple rounded-3xl rotate-6 opacity-20 blur-xl group-hover:rotate-12 transition-transform duration-500"}),t.jsx("div",{className:"relative w-full h-full bg-white/5 border border-white/10 rounded-[24px] flex items-center justify-center text-primary-pink shadow-2xl",children:t.jsx(Z,{size:44,className:"group-hover:scale-110 transition-transform duration-500"})}),t.jsx("div",{className:"absolute -top-2 -right-2 w-8 h-8 bg-[#FF8C42] rounded-full flex items-center justify-center text-white border-4 border-[#0c091a]",children:t.jsx(te,{size:14})})]}),t.jsxs("div",{className:"space-y-4",children:[t.jsxs("h1",{className:"text-3xl md:text-4xl font-black text-white tracking-tight",children:["Explore as a ",t.jsx("span",{className:"bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] bg-clip-text text-transparent",children:"Learner"})]}),t.jsx("p",{className:"text-white/60 text-base md:text-lg leading-relaxed font-medium",children:"You're currently viewing Kattraan as an Instructor. Join as a learner to explore courses, track your progress, and earn certificates."})]}),t.jsxs("div",{className:"grid grid-cols-2 gap-4 text-left",children:[t.jsxs("div",{className:"flex items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-2xl",children:[t.jsx("div",{className:"w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500",children:t.jsx(K,{size:18})}),t.jsx("span",{className:"text-[13px] font-bold text-white/80",children:"Full Access"})]}),t.jsxs("div",{className:"flex items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-2xl",children:[t.jsx("div",{className:"w-8 h-8 rounded-lg bg-primary-pink/10 flex items-center justify-center text-primary-pink",children:t.jsx(me,{size:18})}),t.jsx("span",{className:"text-[13px] font-bold text-white/80",children:"Track Learning"})]})]}),t.jsxs("div",{className:"pt-4",children:[t.jsx(F,{onClick:a,isLoading:r,className:"w-full h-[64px] text-lg font-black rounded-2xl bg-gradient-to-r from-[#FF8C42] to-[#FF3FB4] hover:opacity-90 shadow-[0_20px_40px_rgba(255,63,180,0.3)] transition-all active:scale-95",children:"Become a Learner"}),t.jsx("p",{className:"text-[11px] font-bold uppercase tracking-[0.2em] text-white/20 mt-6",children:"No separate account needed • switch anytime"})]})]})]})})})},Qe=()=>{const{user:e}=R(s=>s.auth);if(!U(e,"learner"))return t.jsx(Ke,{});const[a,i]=p.useState([]),[l,n]=p.useState([]),[o,d]=p.useState(!0);p.useEffect(()=>{let s=!1;async function m(){d(!0);try{const[u,b]=await Promise.all([re(),ae()]);if(s)return;i(Array.isArray(u)?u:[]),n(Array.isArray(b)?b:[])}catch{if(s)return;i([]),n([])}finally{s||d(!1)}}return m(),()=>{s=!0}},[]);const c=p.useMemo(()=>(a||[]).filter(s=>s.progress===100||(s.status||"").toLowerCase()==="completed"),[a]),h=p.useMemo(()=>(a||[]).slice(0,3).map(s=>({title:s.title,progress:s.progress??0,instructor:s.instructor||"Instructor",thumbnail:s.thumbnail||s.image||null})),[a]),g=p.useMemo(()=>(l||[]).filter(s=>s.status!=="Submitted"&&s.status!=="Graded"),[l]),k=s=>{if(!s)return null;const m=new Date(s);if(Number.isNaN(m.getTime()))return null;const u=new Date,b=m.getTime()-u.getTime(),_=Math.ceil(b/(1e3*60*60*24));return _<0?`Overdue (${m.toLocaleDateString()})`:_<=7?`due in ${_===0?1:_} day${_===1?"":"s"}`:`on ${m.toLocaleDateString(void 0,{month:"short",day:"numeric",year:"numeric"})}`},f=p.useMemo(()=>{const s=[...g].filter(u=>u.dueDate).sort((u,b)=>new Date(u.dueDate)-new Date(b.dueDate))[0];if(!s)return[];const m=k(s.dueDate);return m?[{id:s.contentId||s._id||"deadline-1",text:`Assignment ${m}: '${s.title||"Assignment"}'`,urgent:s.dueDate?new Date(s.dueDate)-new Date<=2880*60*1e3:!1}]:[]},[g]),J=p.useMemo(()=>{const s=[],m=c.slice(0,1)[0];m&&s.push({id:`completed-${m.courseId||m.id||m.title}`,text:`Completed: ${m.title}`,time:"Recently",icon:I,color:"text-amber-400"});const u=(l||[]).filter(b=>b.status==="Submitted"||b.status==="Graded").slice(0,1)[0];return u&&s.push({id:`assignment-${u.contentId||u._id||u.title}`,text:`Assignment ${u.title||"submitted"} updated`,time:"Recently",icon:se,color:"text-green-400"}),s},[l,c]),D=p.useMemo(()=>{const s=(l||[]).find(m=>m.submission?.instructorFeedback);return s?[{id:`feedback-${s.contentId||s._id||1}`,course:s.courseTitle||s.course,text:s.submission.instructorFeedback}]:[]},[l]),V=p.useMemo(()=>{const s=(a||[]).reduce((m,u)=>{const b=Number(u.hoursLearned??u.hours??u.timeSpentHours??u.timeSpent??0)||0;return m+b},0)||0;return[{label:"Courses Enrolled",value:String(a.length),icon:X,color:"text-primary-pink"},{label:"Hours Learned",value:String(s),icon:z,color:"text-primary-purple"},{label:"Certificates",value:String(c.length),icon:I,color:"text-amber-400"},{label:"Wallet Balance",value:"₹450",icon:ie,color:"text-green-400"}]},[c.length,a]);return t.jsx(T,{title:"Dashboard",subtitle:"Pick up right where you left off and keep building your future.",headerRight:t.jsxs(t.Fragment,{children:[t.jsxs("div",{className:"hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 transition-colors duration-300",children:[t.jsx(de,{className:"w-3.5 h-3.5 text-orange-500 fill-orange-500"}),t.jsx("span",{className:"text-orange-500 dark:text-orange-400 text-xs font-bold uppercase tracking-wider transition-colors duration-300",children:"5 Day Streak"})]}),t.jsxs(F,{className:"flex items-center gap-2",children:[t.jsx(ne,{className:"w-5 h-5"}),"Resume Learning"]})]}),children:t.jsxs("div",{className:"pb-20 space-y-10",children:[o&&t.jsx("div",{className:"py-8 text-center text-gray-500 dark:text-white/50",children:"Loading your dashboard..."}),f.length>0&&t.jsxs("div",{className:"flex items-center gap-3 p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/[0.08] dark:backdrop-blur-xl border border-amber-500/10 dark:border-amber-400/20 text-amber-200 mb-8 shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]",children:[t.jsx(z,{className:"w-5 h-5 text-amber-500"}),t.jsx("span",{className:"text-sm font-medium",children:f[0].text})]}),t.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12",children:V.map((s,m)=>t.jsxs("div",{className:"group rounded-[24px] border border-gray-200 bg-white/95 p-6 shadow-sm backdrop-blur-sm transition-all hover:border-gray-300 dark:border-white/[0.14] dark:bg-white/[0.07] dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)] dark:backdrop-blur-xl dark:hover:border-white/[0.22] dark:hover:bg-white/[0.09]",children:[t.jsx("div",{className:`mb-4 w-fit rounded-xl bg-gray-50 p-3 ring-1 ring-gray-100 transition-transform group-hover:scale-110 dark:bg-white/[0.1] dark:ring-white/[0.08] ${s.color}`,children:t.jsx(s.icon,{className:"w-6 h-6"})}),t.jsx("p",{className:"text-gray-400 dark:text-white/40 text-sm font-medium uppercase tracking-tight transition-colors duration-300",children:s.label}),t.jsx("p",{className:"text-3xl font-bold text-gray-900 dark:text-white mt-1 transition-colors duration-300",children:s.value})]},m))}),t.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-3 gap-8",children:[t.jsxs("div",{className:"lg:col-span-2 space-y-6",children:[D.length>0&&t.jsxs("div",{className:"flex items-center justify-between rounded-2xl border border-purple-100 bg-purple-50 p-4 transition-colors duration-300 dark:border-primary-purple/20 dark:bg-primary-purple/[0.08] dark:backdrop-blur-xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]",children:[t.jsxs("div",{className:"flex items-center gap-3",children:[t.jsx("span",{className:"p-2 rounded-full bg-purple-100 dark:bg-primary-purple/10 text-primary-purple transition-colors duration-300",children:t.jsx(ee,{className:"w-4 h-4"})}),t.jsxs("div",{children:[t.jsx("p",{className:"text-gray-900 dark:text-white text-sm font-bold transition-colors duration-300",children:D[0].course}),t.jsx("p",{className:"text-gray-500 dark:text-white/50 text-xs transition-colors duration-300",children:D[0].text})]})]}),t.jsxs("button",{type:"button",className:"text-gray-400 hover:text-gray-900 dark:text-white/30 dark:hover:text-white transition-colors",children:[t.jsx("span",{className:"sr-only",children:"Dismiss"}),t.jsx("span",{className:"text-xs uppercase tracking-widest font-bold",children:"Dismiss"})]})]}),t.jsx("h2",{className:"text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300",children:"In Progress"}),t.jsx(ue,{courses:h})]}),t.jsxs("div",{className:"space-y-8",children:[t.jsxs("div",{className:"space-y-4",children:[t.jsx("h2",{className:"text-xl font-bold text-gray-900 dark:text-white transition-colors duration-300",children:"Recent Activity"}),t.jsx("div",{className:"space-y-6 rounded-[32px] border border-gray-200 bg-white/95 p-6 shadow-sm backdrop-blur-sm transition-colors duration-300 dark:border-white/[0.12] dark:bg-white/[0.06] dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)] dark:backdrop-blur-xl",children:J.map(s=>t.jsxs("div",{className:"flex gap-4 items-start relative",children:[t.jsx("div",{className:"absolute top-8 left-[11px] bottom-[-24px] w-px bg-gray-200 last:hidden dark:bg-white/15"}),t.jsx("div",{className:`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-50 dark:bg-white/[0.1] ${s.color} ring-1 ring-gray-100 dark:ring-white/[0.08]`,children:t.jsx(s.icon,{className:"w-3.5 h-3.5"})}),t.jsxs("div",{children:[t.jsx("p",{className:"text-gray-900 dark:text-white/80 text-xs font-medium leading-relaxed transition-colors duration-300",children:s.text}),t.jsx("p",{className:"text-gray-400 dark:text-white/30 text-[10px] mt-1 transition-colors duration-300",children:s.time})]})]},s.id))})]}),t.jsxs("div",{className:"space-y-6",children:[t.jsx("h2",{className:"text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300",children:"Recommended"}),t.jsx("div",{className:"space-y-6 rounded-[32px] border border-gray-200 bg-white/95 p-6 shadow-sm backdrop-blur-sm transition-colors duration-300 dark:border-white/[0.12] dark:bg-white/[0.06] dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)] dark:backdrop-blur-xl",children:[1,2].map(s=>t.jsxs("div",{className:"flex gap-4 group cursor-pointer items-center",children:[t.jsx("div",{className:"flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-50 ring-1 ring-gray-100 transition-transform group-hover:scale-105 dark:bg-white/[0.1] dark:ring-white/[0.08]",children:t.jsx(oe,{className:"w-5 h-5 text-gray-300 dark:text-white/20 group-hover:text-primary-pink transition-colors duration-300"})}),t.jsxs("div",{children:[t.jsx("p",{className:"text-gray-900 dark:text-white text-sm font-bold group-hover:text-primary-pink dark:group-hover:text-primary-pink transition-colors duration-300",children:"Microservices Architecture"}),t.jsx("p",{className:"text-gray-400 dark:text-white/40 text-[11px] mt-1 transition-colors duration-300",children:"4.9 ⭐⭐⭐⭐⭐"})]})]},s))})]})]})]})]})})},pt=()=>t.jsx(Qe,{});export{pt as default};
