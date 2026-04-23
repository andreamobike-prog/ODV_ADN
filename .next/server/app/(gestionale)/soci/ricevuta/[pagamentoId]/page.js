(()=>{var a={};a.id=558,a.ids=[558],a.modules={261:a=>{"use strict";a.exports=require("next/dist/shared/lib/router/utils/app-paths")},3295:a=>{"use strict";a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},16483:(a,b,c)=>{"use strict";c.r(b),c.d(b,{default:()=>l,dynamic:()=>j,revalidate:()=>k});var d=c(5735),e=c(91970),f=c(83794),g=c(39075),h=c(97178),i=c.n(h);let j="force-dynamic",k=0;async function l({params:a}){let{pagamentoId:b}=await a,[c,h]=await Promise.all([(0,f._s)(b),(0,f.QX)()]);if(!c)return(0,e.notFound)();let{pagamento:j,socio:k,tutore:m}=c,n=j.data_pagamento?new Date(j.data_pagamento).getFullYear():new Date().getFullYear(),o=j.data_pagamento??"",p=o?new Date(o).toLocaleDateString("it-IT"):"—",q="contanti"===j.metodo?"Pagamento in contanti":j.numero_transazione||"—",r=`${n}/0001`,s=k.e_minorenne&&"tutore"===j.tipo_pagatore?`Versamento effettuato dal tutore legale ${m?.nome??""} ${m?.cognome??""} per il socio ${k.nome} ${k.cognome}.`:"",t="altro"===j.tipo_pagatore?`Versamento effettuato da ${j.intestatario_transazione??""} per il socio ${k.nome} ${k.cognome}.`:"",u=h?.nome_associazione?.trim()||"Angeli dei Navigli ODV",v=h?.logo_gestionale_url?.trim()||"/logo-ricevuta.png",w=h?.presidente_nome?.trim()||"Il Presidente",x=h?.ricevuta_testo_intro?.trim()||`L’associazione ${u} dichiara di aver ricevuto un versamento a titolo di quota associativa annuale.`,y=h?.ricevuta_testo_attestazione?.trim()||`Il presente documento attesta l’incasso della quota associativa annuale relativa all’anno ${n}.`,z=h?.ricevuta_testo_non_corrispettivo?.trim()||"L’importo versato \xe8 riferito al rapporto associativo interno e non costituisce corrispettivo per cessione di beni o prestazione di servizi.",A=h?.ricevuta_testo_nota_finale?.trim()||"Regime fiscale e imposta di bollo applicati secondo la normativa vigente.",B=[];if(h?.indirizzo?.trim()){let a=[h.indirizzo?.trim(),[h.cap?.trim(),h.comune?.trim()].filter(Boolean).join(" "),h.provincia?.trim()?`(${h.provincia.trim()})`:""].filter(Boolean).join(", ");a&&B.push(a)}h?.codice_fiscale?.trim()&&B.push(`CF ${h.codice_fiscale.trim()}`),h?.partita_iva?.trim()&&B.push(`P.IVA ${h.partita_iva.trim()}`);let C=[h?.runts_numero?.trim()?`RUNTS ${h.runts_numero.trim()}`:"",h?.runts_sezione?.trim()?`Sezione ${h.runts_sezione.trim()}`:"",h?.runts_data_iscrizione?.trim()?`Iscrizione ${new Date(h.runts_data_iscrizione).toLocaleDateString("it-IT")}`:""].filter(Boolean);return C.length>0&&B.push(C.join(" • ")),h?.email?.trim()&&B.push(h.email.trim()),h?.pec?.trim()&&B.push(h.pec.trim()),h?.telefono?.trim()&&B.push(h.telefono.trim()),h?.sito_web?.trim()&&B.push(h.sito_web.trim()),(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)("style",{children:`
        body {
          font-family: Arial, sans-serif;
          color: #111827;
          margin: 0;
          background: #ffffff;
        }

        .shell {
          display: block !important;
        }

        aside {
          display: none !important;
        }

        .main {
          width: 100% !important;
          max-width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        .page {
          max-width: 980px;
          margin: 0 auto;
          padding: 40px 5px;
        }

        .top {
  display: grid;
  grid-template-columns: 420px 420px;
  column-gap: 140px;
  align-items: start;
  margin-bottom: 44px;
}

        .org {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .brandLogo {
  display: block;
  width: 120px;
  height: 120px;
  object-fit: contain;
  margin-top: 18px;
  margin-bottom: 20px;
}

        .org h1 {
          margin: 0 0 8px;
          font-size: 20px;
          line-height: 1.1;
          font-weight: 700;
        }

        .org p {
          margin: 0;
          font-size: 20px;
          line-height: 1.35;
        }

        .rightcol {
          display: grid;
          gap: 18px;
        }

        .title {
  height: 120px;
  display: flex;
  align-items: flex-end;
  font-size: 86px;
  font-weight: 400;
  text-align: left;
  line-height: 0.9;
  letter-spacing: 1px;
  margin-bottom: 12px;
}

        .recipient {
  display: grid;
  gap: 6px;
  margin: 0;
}

.recipient p {
  margin: 0;
  font-size: 20px;
  line-height: 1.35;
}

.recipient strong {
  font-size: 20px;
  line-height: 1.35;
}

        .docmeta {
          display: grid;
          gap: 6px;
          margin: 0;
        }

        .docmeta p {
          margin: 0;
          font-size: 20px;
        }

        .paymentDetails {
          display: grid;
          gap: 8px;
        }

        .paymentDetails p {
          margin: 0;
          font-size: 20px;
          line-height: 1.45;
        }

        .intro {
          margin: 0 0 34px;
          font-size: 20px;
          line-height: 1.45;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 18px;
          margin-bottom: 24px;
        }

        th, td {
          border-top: 1px solid #111827;
          border-bottom: 1px solid #111827;
          border-left: none;
          border-right: none;
          padding: 14px 0;
          text-align: left;
          font-size: 20px;
        }

        th {
          background: transparent;
          color: #111827;
        }

        thead th {
          border-top: none;
        }

        .right {
          text-align: right;
          color: #111827;
        }

        .section-title {
  font-size: 22px;
  font-weight: 700;
  margin: 22px 0 9px;
}
        }

        .footer {
          margin-top: 36px;
          font-size: 20px;
          line-height: 1.6;
        }

        .signature {
          margin-top: 50px;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .signatureImage {
          display: block;
          margin-left: auto;
          margin-top: 12px;
          width: 380px;
          max-width: 100%;
          height: auto;
          object-fit: contain;
        }

        .signature p {
          margin: 0 0 8px;
          font-size: 20px;
          font-weight: 700;
          width: 340px;
          text-align: center;
        }

        .printbar {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px 40px 0;
          display: flex;
          justify-content: flex-end;
        }

        .printbutton {
          border: none;
          background: #eee8f6;
          color: #9082a9;
          padding: 12px 18px;
          font-size: 20px;
          cursor: pointer;
        }

        @media print {
          .printbar {
            display: none;
          }

          .page {
            padding-top: 10px;
          }
        }
      `}),(0,d.jsx)("div",{className:"printbar",children:(0,d.jsx)(g.ReceiptPrintButton,{})}),(0,d.jsxs)("div",{className:"page",children:[(0,d.jsxs)("div",{className:"top",children:[(0,d.jsxs)("div",{className:"org",children:[(0,d.jsx)("img",{src:v,alt:u,className:"brandLogo"}),(0,d.jsx)("h1",{children:u}),B.map((a,b)=>(0,d.jsx)("p",{children:a},b))]}),(0,d.jsxs)("div",{className:"rightcol",children:[(0,d.jsx)("div",{className:`title ${i().className}`,children:"RICEVUTA"}),(0,d.jsxs)("div",{className:"recipient",children:[(0,d.jsx)("p",{children:(0,d.jsx)("strong",{children:j.intestatario_transazione||"—"})}),(0,d.jsx)("p",{children:j.indirizzo||"—"}),(0,d.jsxs)("p",{children:["CF ",j.codice_fiscale_pagatore||"—"]}),(0,d.jsx)("p",{children:k.email||"—"})]}),(0,d.jsxs)("div",{className:"docmeta",children:[(0,d.jsxs)("p",{children:[(0,d.jsx)("strong",{children:"Documento n."})," ",r]}),(0,d.jsxs)("p",{children:[(0,d.jsx)("strong",{children:"Data documento"})," ",p]})]})]})]}),(0,d.jsx)("p",{className:"intro",children:x}),(0,d.jsxs)("table",{children:[(0,d.jsx)("thead",{children:(0,d.jsxs)("tr",{children:[(0,d.jsx)("th",{children:"Descrizione"}),(0,d.jsx)("th",{className:"right",children:"Importo"})]})}),(0,d.jsxs)("tbody",{children:[(0,d.jsxs)("tr",{children:[(0,d.jsx)("td",{children:"Quota associativa annuale"}),(0,d.jsxs)("td",{className:"right",children:["Euro ",Number(j.importo).toFixed(2).replace(".",",")]})]}),(0,d.jsxs)("tr",{children:[(0,d.jsx)("td",{children:"Imposta di bollo, ove dovuta"}),(0,d.jsx)("td",{className:"right",children:"Euro -"})]}),(0,d.jsxs)("tr",{children:[(0,d.jsx)("td",{children:(0,d.jsx)("strong",{children:"Totale versato"})}),(0,d.jsx)("td",{className:"right",children:(0,d.jsxs)("strong",{children:["Euro ",Number(j.importo).toFixed(2).replace(".",",")]})})]})]})]}),(0,d.jsx)("div",{className:"section-title",children:"Dettagli pagamento"}),(0,d.jsxs)("div",{className:"paymentDetails",children:[(0,d.jsxs)("p",{children:[(0,d.jsx)("strong",{children:"Metodo pagamento:"})," ",j.metodo]}),(0,d.jsxs)("p",{children:[(0,d.jsx)("strong",{children:"Identificativo:"})," ",q]}),(0,d.jsxs)("p",{children:[(0,d.jsx)("strong",{children:"Data pagamento:"})," ",p]}),(0,d.jsxs)("p",{children:[(0,d.jsx)("strong",{children:"Anno associativo:"})," ",n]}),(0,d.jsxs)("p",{children:[(0,d.jsx)("strong",{children:"Nome socio:"})," ",k.nome," ",k.cognome]})]}),s&&(0,d.jsx)("p",{style:{marginTop:20},children:s}),t&&(0,d.jsx)("p",{style:{marginTop:12},children:t}),(0,d.jsxs)("div",{className:"footer",children:[y&&(0,d.jsx)("p",{children:y}),z&&(0,d.jsx)("p",{children:z}),A&&(0,d.jsx)("p",{children:A})]}),(0,d.jsxs)("div",{className:"signature",children:[(0,d.jsx)("p",{children:(0,d.jsx)("strong",{children:w})}),(0,d.jsx)("img",{src:"/firma-presidente.png",alt:"Firma del Presidente",className:"signatureImage"})]})]})]})}},17891:a=>{"use strict";a.exports=require("next/dist/shared/lib/router/utils/get-segment-param")},19121:a=>{"use strict";a.exports=require("next/dist/server/app-render/action-async-storage.external.js")},26713:a=>{"use strict";a.exports=require("next/dist/shared/lib/router/utils/is-bot")},28354:a=>{"use strict";a.exports=require("util")},29294:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-async-storage.external.js")},33873:a=>{"use strict";a.exports=require("path")},34244:(a,b,c)=>{Promise.resolve().then(c.bind(c,90829))},39075:(a,b,c)=>{"use strict";c.d(b,{ReceiptPrintButton:()=>d});let d=(0,c(77943).registerClientReference)(function(){throw Error("Attempted to call ReceiptPrintButton() from the server but ReceiptPrintButton is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"/Users/andrealoiudice/Downloads/odv-nextjs-complete/components/soci/ReceiptPrintButton.tsx","ReceiptPrintButton")},41025:a=>{"use strict";a.exports=require("next/dist/server/app-render/dynamic-access-async-storage.external.js")},43954:a=>{"use strict";a.exports=require("next/dist/shared/lib/router/utils/interception-routes")},47270:(a,b,c)=>{"use strict";c.r(b),c.d(b,{__next_app__:()=>M,handler:()=>O,routeModule:()=>N});var d=c(7553),e=c(84006),f=c(67798),g=c(34775),h=c(99373),i=c(73461),j=c(1020),k=c(26349),l=c(54365),m=c(16023),n=c(63747),o=c(24235),p=c(23938),q=c(261),r=c(66758),s=c(77243),t=c(26713),u=c(37527),v=c(22820),w=c(88216),x=c(47929),y=c(79551),z=c(71797),A=c(89125),B=c(86439),C=c(77068),D=c(27269),E=c(61287),F=c(81494),G=c(70722),H=c(70753),I=c(43954),J=c(17891),K={};for(let a in E)0>["default","__next_app__","routeModule","handler"].indexOf(a)&&(K[a]=()=>E[a]);c.d(b,K);let L={children:["",{children:["(gestionale)",{children:["soci",{children:["ricevuta",{children:["[pagamentoId]",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(c.bind(c,16483)),"/Users/andrealoiudice/Downloads/odv-nextjs-complete/app/(gestionale)/soci/ricevuta/[pagamentoId]/page.tsx"]}]},{"global-error":[()=>Promise.resolve().then(c.t.bind(c,95547,23)),"next/dist/client/components/builtin/global-error.js"]},[]]},{layout:[()=>Promise.resolve().then(c.bind(c,80086)),"/Users/andrealoiudice/Downloads/odv-nextjs-complete/app/(gestionale)/soci/ricevuta/layout.tsx"],"global-error":[()=>Promise.resolve().then(c.t.bind(c,95547,23)),"next/dist/client/components/builtin/global-error.js"]},[]]},{"global-error":[()=>Promise.resolve().then(c.t.bind(c,95547,23)),"next/dist/client/components/builtin/global-error.js"]},[]]},{layout:[()=>Promise.resolve().then(c.bind(c,63797)),"/Users/andrealoiudice/Downloads/odv-nextjs-complete/app/(gestionale)/layout.tsx"],"global-error":[()=>Promise.resolve().then(c.t.bind(c,95547,23)),"next/dist/client/components/builtin/global-error.js"],"not-found":[()=>Promise.resolve().then(c.t.bind(c,55091,23)),"next/dist/client/components/builtin/not-found.js"],forbidden:[()=>Promise.resolve().then(c.t.bind(c,45270,23)),"next/dist/client/components/builtin/forbidden.js"],unauthorized:[()=>Promise.resolve().then(c.t.bind(c,28193,23)),"next/dist/client/components/builtin/unauthorized.js"]},[]]},{layout:[()=>Promise.resolve().then(c.bind(c,32056)),"/Users/andrealoiudice/Downloads/odv-nextjs-complete/app/layout.tsx"],"global-error":[()=>Promise.resolve().then(c.t.bind(c,95547,23)),"next/dist/client/components/builtin/global-error.js"],"not-found":[()=>Promise.resolve().then(c.t.bind(c,55091,23)),"next/dist/client/components/builtin/not-found.js"],forbidden:[()=>Promise.resolve().then(c.t.bind(c,45270,23)),"next/dist/client/components/builtin/forbidden.js"],unauthorized:[()=>Promise.resolve().then(c.t.bind(c,28193,23)),"next/dist/client/components/builtin/unauthorized.js"]},[]]}.children,M={require:c,loadChunk:()=>Promise.resolve()},N=new d.AppPageRouteModule({definition:{kind:e.RouteKind.APP_PAGE,page:"/(gestionale)/soci/ricevuta/[pagamentoId]/page",pathname:"/soci/ricevuta/[pagamentoId]",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:L},distDir:".next",relativeProjectDir:""});async function O(a,b,d){var K,P,Q,R,S;d.requestMeta&&(0,h.setRequestMeta)(a,d.requestMeta),N.isDev&&(0,h.addRequestMeta)(a,"devRequestTimingInternalsEnd",process.hrtime.bigint());let T=!!(0,h.getRequestMeta)(a,"minimalMode"),U="/(gestionale)/soci/ricevuta/[pagamentoId]/page";"/index"===U&&(U="/");let V=await N.prepare(a,b,{srcPage:U,multiZoneDraftMode:!1});if(!V)return b.statusCode=400,b.end("Bad Request"),null==d.waitUntil||d.waitUntil.call(d,Promise.resolve()),null;let{buildId:W,query:X,params:Y,pageIsDynamic:Z,buildManifest:$,nextFontManifest:_,reactLoadableManifest:aa,serverActionsManifest:ab,clientReferenceManifest:ac,subresourceIntegrityManifest:ad,prerenderManifest:ae,isDraftMode:af,resolvedPathname:ag,revalidateOnlyGenerated:ah,routerServerContext:ai,nextConfig:aj,parsedUrl:ak,interceptionRoutePatterns:al,deploymentId:am,clientAssetToken:an}=V,ao=(0,q.normalizeAppPath)(U),{isOnDemandRevalidate:ap}=V,aq=aj.experimental.ppr&&!aj.cacheComponents&&(0,I.isInterceptionRouteAppPath)(ag)?null:N.match(ag,ae),ar=(null==aq?void 0:aq.route)??null,as=!!ae.routes[ag],at=a.headers["user-agent"]||"",au=(0,t.getBotType)(at),av=(0,p.isHtmlBotRequest)(a),aw=(0,h.getRequestMeta)(a,"isPrefetchRSCRequest")??"1"===a.headers[s.NEXT_ROUTER_PREFETCH_HEADER],ax=(0,h.getRequestMeta)(a,"isRSCRequest")??!!a.headers[s.RSC_HEADER],ay=(0,r.getIsPossibleServerAction)(a),az=(0,m.checkIsAppPPREnabled)(aj.experimental.ppr),aA=a.headers[x.NEXT_RESUME_STATE_LENGTH_HEADER];if(!(0,h.getRequestMeta)(a,"postponed")&&T&&az&&ay&&aA&&"string"==typeof aA){let e=parseInt(aA,10),{maxPostponedStateSize:f,maxPostponedStateSizeBytes:g}=(0,D.getMaxPostponedStateSize)(aj.experimental.maxPostponedStateSize);if(!isNaN(e)&&e>0){if(e>g)return b.statusCode=413,b.end((0,D.getPostponedStateExceededErrorMessage)(f)),null==d.waitUntil||d.waitUntil.call(d,Promise.resolve()),null;let i="1 MB",j=(null==(S=aj.experimental.serverActions)?void 0:S.bodySizeLimit)??i,k=e+(j!==i?c(95726).parse(j):1048576),l=await (0,D.readBodyWithSizeLimit)(a,k);if(null===l)return b.statusCode=413,b.end("Request body exceeded limit. To configure the body size limit for Server Actions, see: https://nextjs.org/docs/app/api-reference/next-config-js/serverActions#bodysizelimit"),null==d.waitUntil||d.waitUntil.call(d,Promise.resolve()),null;if(l.length>=e){let b=l.subarray(0,e).toString("utf8");(0,h.addRequestMeta)(a,"postponed",b);let c=l.subarray(e);(0,h.addRequestMeta)(a,"actionBody",c)}else throw Object.defineProperty(Error(`invariant: expected ${e} bytes of postponed state but only received ${l.length} bytes`),"__NEXT_ERROR_CODE",{value:"E979",enumerable:!1,configurable:!0})}}if(!(0,h.getRequestMeta)(a,"postponed")&&az&&"1"===a.headers[x.NEXT_RESUME_HEADER]&&"POST"===a.method){let{maxPostponedStateSize:c,maxPostponedStateSizeBytes:e}=(0,D.getMaxPostponedStateSize)(aj.experimental.maxPostponedStateSize),f=await (0,D.readBodyWithSizeLimit)(a,e);if(null===f)return b.statusCode=413,b.end((0,D.getPostponedStateExceededErrorMessage)(c)),null==d.waitUntil||d.waitUntil.call(d,Promise.resolve()),null;let g=f.toString("utf8");(0,h.addRequestMeta)(a,"postponed",g)}let aB=!0===N.isDev||!0===aj.experimental.exposeTestingApiInProductionBuild,aC=aB&&("1"===a.headers[s.NEXT_INSTANT_PREFETCH_HEADER]||void 0===a.headers[s.RSC_HEADER]&&"string"==typeof a.headers.cookie&&a.headers.cookie.includes(s.NEXT_INSTANT_TEST_COOKIE+"=")),aD=(az||aC)&&((null==(K=ae.routes[ao]??ae.dynamicRoutes[ao])?void 0:K.renderingMode)==="PARTIALLY_STATIC"||aC&&(aB||(null==ai?void 0:ai.experimentalTestProxy)===!0)),aE=aC&&aD,aF=aE&&!0===N.isDev,aG=!1,aH=aD?(0,h.getRequestMeta)(a,"postponed"):void 0,aI=null==(P=ae.routes[ag])?void 0:P.prefetchDataRoute,aJ=aD&&ax&&!aw&&!aI;T&&(aJ=aJ&&!!aH);let aK=(0,h.getRequestMeta)(a,"segmentPrefetchRSCRequest"),aL=(!au||!aD)&&(!at||(0,p.shouldServeStreamingMetadata)(at,aj.htmlLimitedBots)),aM=!!((ar||as||ae.routes[ao])&&!(au&&aD)),aN=aD&&!0===aj.cacheComponents,aO=!0===N.isDev||!aM||"string"==typeof aH||(aN&&(0,h.getRequestMeta)(a,"onCacheEntryV2")?aJ&&!T:aJ),aP=!!au&&aD,aQ=(null==ar?void 0:ar.remainingPrerenderableParams)??[],aR=(null==ar?void 0:ar.fallback)===null&&((null==(Q=ar.fallbackRootParams)?void 0:Q.length)??0)>0,aS=null;if(!af&&aM&&!aO&&!ay&&!aH&&!aJ){let a=aq?"string"==typeof(null==ar?void 0:ar.fallback)?ar.fallback:aq.source:null;if(!0===aj.experimental.partialFallbacks&&a&&(null==ar?void 0:ar.fallbackRouteParams)&&!aR){if(aQ.length>0){let b,c=(b=new Map(aQ.map(a=>[a.paramName,a])),a.split("/").map(a=>{let c=(0,J.getSegmentParam)(a);if(!c)return a;let d=b.get(c.paramName);if(!d)return a;let e=null==Y?void 0:Y[d.paramName];if(!e)return a;let f=Array.isArray(e)?e.map(a=>encodeURIComponent(a)).join("/"):encodeURIComponent(e);return a.replace(function(a){let{repeat:b,optional:c}=(0,J.getParamProperties)(a.paramType);return c?`[[...${a.paramName}]]`:b?`[...${a.paramName}]`:`[${a.paramName}]`}(d),f)}).join("/")||"/");aS=c!==a?c:null}}else aS=ag}let aT=aS;!aT&&(N.isDev||aM&&Z&&(null==ar?void 0:ar.fallbackRouteParams)&&!ay)&&(aT=ag),N.isDev||af||!aM||!ax||aJ||(0,k.d)(a.headers);let aU={...E,tree:L,handler:O,routeModule:N,__next_app__:M};ab&&ac&&(0,o.setManifestsSingleton)({page:U,clientReferenceManifest:ac,serverActionsManifest:ab});let aV=a.method||"GET",aW=(0,g.getTracer)(),aX=aW.getActiveScopeSpan(),aY=!!(null==ai?void 0:ai.isWrappedByNextServer),aZ=!0===aj.experimental.partialFallbacks&&aQ.length>0?(null==ar||null==(R=ar.fallbackRouteParams)?void 0:R.filter(a=>!aQ.some(b=>b.paramName===a.paramName)))??[]:[],a$=async()=>((null==ai?void 0:ai.render404)?await ai.render404(a,b,ak,!1):b.end("This page could not be found"),null);try{let k,m=N.getVaryHeader(ag,al);b.setHeader("Vary",m);let o=async(c,d)=>{let e=new l.NodeNextRequest(a),f=new l.NodeNextResponse(b);return N.render(e,f,d).finally(()=>{if(!c)return;c.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let a=aW.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==i.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let d=a.get("next.route");if(d){let a=`${aV} ${d}`;c.setAttributes({"next.route":d,"http.route":d,"next.span_name":a}),c.updateName(a),k&&k!==c&&(k.setAttribute("http.route",d),k.updateName(a))}else c.updateName(`${aV} ${U}`)})},p=(0,h.getRequestMeta)(a,"incrementalCache")||await N.getIncrementalCache(a,aj,ae,T);null==p||p.resetRequestCache(),globalThis.__incrementalCache=p;let q=async({span:e,postponed:f,fallbackRouteParams:g,forceStaticRender:i})=>{let k={query:X,params:Y,page:ao,sharedContext:{buildId:W,deploymentId:am,clientAssetToken:an},serverComponentsHmrCache:(0,h.getRequestMeta)(a,"serverComponentsHmrCache"),fallbackRouteParams:g,renderOpts:{App:()=>null,Document:()=>null,pageConfig:{},ComponentMod:aU,Component:(0,j.T)(aU),params:Y,routeModule:N,page:U,postponed:f,shouldWaitOnAllReady:aP,serveStreamingMetadata:aL,supportsDynamicResponse:"string"==typeof f||aO,buildManifest:$,nextFontManifest:_,reactLoadableManifest:aa,subresourceIntegrityManifest:ad,setCacheStatus:null==ai?void 0:ai.setCacheStatus,setIsrStatus:null==ai?void 0:ai.setIsrStatus,setReactDebugChannel:null==ai?void 0:ai.setReactDebugChannel,sendErrorsToBrowser:null==ai?void 0:ai.sendErrorsToBrowser,dir:c(33873).join(process.cwd(),N.relativeProjectDir),isDraftMode:af,botType:au,isOnDemandRevalidate:ap,isPossibleServerAction:ay,assetPrefix:aj.assetPrefix,nextConfigOutput:aj.output,crossOrigin:aj.crossOrigin,trailingSlash:aj.trailingSlash,images:aj.images,previewProps:ae.preview,enableTainting:aj.experimental.taint,htmlLimitedBots:aj.htmlLimitedBots,reactMaxHeadersLength:aj.reactMaxHeadersLength,multiZoneDraftMode:!1,incrementalCache:p,cacheLifeProfiles:aj.cacheLife,basePath:aj.basePath,serverActions:aj.experimental.serverActions,logServerFunctions:"object"==typeof aj.logging&&!!aj.logging.serverFunctions,...aE||aF||aG?{isBuildTimePrerendering:!0,supportsDynamicResponse:!1,isStaticGeneration:!0,isDebugDynamicAccesses:aF}:{},cacheComponents:!!aj.cacheComponents,experimental:{isRoutePPREnabled:aD,expireTime:aj.expireTime,staleTimes:aj.experimental.staleTimes,dynamicOnHover:!!aj.experimental.dynamicOnHover,optimisticRouting:!!aj.experimental.optimisticRouting,inlineCss:!!aj.experimental.inlineCss,prefetchInlining:aj.experimental.prefetchInlining??!1,authInterrupts:!!aj.experimental.authInterrupts,cachedNavigations:!!aj.experimental.cachedNavigations,clientTraceMetadata:aj.experimental.clientTraceMetadata||[],clientParamParsingOrigins:aj.experimental.clientParamParsingOrigins,maxPostponedStateSizeBytes:(0,C.parseMaxPostponedStateSize)(aj.experimental.maxPostponedStateSize)},waitUntil:d.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:()=>{},onInstrumentationRequestError:(b,c,d,e)=>N.onRequestError(a,b,d,e,ai),err:(0,h.getRequestMeta)(a,"invokeError")}};i&&(k.renderOpts.supportsDynamicResponse=!1);let l=await o(e,k),{metadata:m}=l,{cacheControl:n,headers:q={},fetchTags:r,fetchMetrics:s}=m;if(r&&(q[x.NEXT_CACHE_TAGS_HEADER]=r),a.fetchMetrics=s,aM&&(null==n?void 0:n.revalidate)===0&&!N.isDev&&!aD){let a=m.staticBailoutInfo,b=Object.defineProperty(Error(`Page changed from static to dynamic at runtime ${ag}${(null==a?void 0:a.description)?`, reason: ${a.description}`:""}
see more here https://nextjs.org/docs/messages/app-static-to-dynamic-error`),"__NEXT_ERROR_CODE",{value:"E132",enumerable:!1,configurable:!0});if(null==a?void 0:a.stack){let c=a.stack;b.stack=b.message+c.substring(c.indexOf("\n"))}throw b}return{value:{kind:u.CachedRouteKind.APP_PAGE,html:l,headers:q,rscData:m.flightData,postponed:m.postponed,status:m.statusCode,segmentData:m.segmentData},cacheControl:n}},r=async({hasResolved:c,previousCacheEntry:g,isRevalidating:i,span:j,forceStaticRender:k=!1})=>{let l=!1===N.isDev,m=c||b.writableEnded;try{let f;if(ap&&ah&&!g&&!T)return(null==ai?void 0:ai.render404)?await ai.render404(a,b):(b.statusCode=404,b.end("This page could not be found")),null;if(ar&&(f=(0,v.parseFallbackField)(ar.fallback)),!0===aj.experimental.partialFallbacks&&(null==ar?void 0:ar.fallback)===null&&!aR&&aQ.length>0&&(f=v.FallbackMode.PRERENDER),f===v.FallbackMode.PRERENDER&&(0,t.isBot)(at)&&(!aD||av)&&(f=v.FallbackMode.BLOCKING_STATIC_RENDER),(null==g?void 0:g.isStale)===-1&&(ap=!0),ap&&(f!==v.FallbackMode.NOT_FOUND||g)&&(f=v.FallbackMode.BLOCKING_STATIC_RENDER),!T&&f!==v.FallbackMode.BLOCKING_STATIC_RENDER&&aT&&!m&&!af&&Z&&(l||!as)){if((l||ar)&&f===v.FallbackMode.NOT_FOUND){if(aj.adapterPath)return await a$();throw new B.NoFallbackError}if(aD&&(aj.cacheComponents?!aJ:!ax)){let b=l&&"string"==typeof(null==ar?void 0:ar.fallback)?ar.fallback:ao,f=(l||aE)&&(null==ar?void 0:ar.fallbackRouteParams)?(0,n.createOpaqueFallbackRouteParams)(ar.fallbackRouteParams):aG?(0,n.getFallbackRouteParams)(ao,N):null;aE&&f&&(0,h.addRequestMeta)(a,"fallbackParams",f);let g=await N.handleResponse({cacheKey:b,req:a,nextConfig:aj,routeKind:e.RouteKind.APP_PAGE,isFallback:!0,prerenderManifest:ae,isRoutePPREnabled:aD,responseGenerator:async()=>q({span:j,postponed:void 0,fallbackRouteParams:f,forceStaticRender:!0}),waitUntil:d.waitUntil,isMinimalMode:T});if(null===g)return null;if(g)return T||!aD||!(aQ.length>0)||!0!==aj.experimental.partialFallbacks||!aS||!p||ap||aG||aB||aC||aw||(0,H.scheduleOnNextTick)(async()=>{let b=N.getResponseCache(a);try{await b.revalidate(aS,p,aD,!1,a=>q({span:a.span,postponed:void 0,fallbackRouteParams:aZ.length>0?(0,n.createOpaqueFallbackRouteParams)(aZ):null,forceStaticRender:!0}),null,c,d.waitUntil)}catch(a){console.error("Error revalidating the page in the background",a)}}),delete g.cacheControl,g}}let o=ap||i||!aH?void 0:aH;if(aN&&!T&&p&&(aJ||ay)&&!k){let b=await p.get(ag,{kind:u.IncrementalCacheKind.APP_PAGE,isRoutePPREnabled:!0,isFallback:!1});b&&b.value&&b.value.kind===u.CachedRouteKind.APP_PAGE&&(o=b.value.postponed,b&&(-1===b.isStale||!0===b.isStale)&&(0,H.scheduleOnNextTick)(async()=>{let b=N.getResponseCache(a);try{await b.revalidate(ag,p,aD,!1,a=>r({...a,forceStaticRender:!0}),null,c,d.waitUntil)}catch(a){console.error("Error revalidating the page in the background",a)}}))}if((aE||aF)&&void 0!==o)return{cacheControl:{revalidate:1,expire:void 0},value:{kind:u.CachedRouteKind.PAGES,html:w.default.EMPTY,pageData:{},headers:void 0,status:void 0}};let s=(l&&(0,h.getRequestMeta)(a,"renderFallbackShell")||aE&&!as)&&(null==ar?void 0:ar.fallbackRouteParams)?(0,n.createOpaqueFallbackRouteParams)(ar.fallbackRouteParams):aG?(0,n.getFallbackRouteParams)(ao,N):null;if((l||aE)&&aj.cacheComponents&&!as&&(null==ar?void 0:ar.fallbackRouteParams)){let b=(0,n.createOpaqueFallbackRouteParams)(ar.fallbackRouteParams);b&&(0,h.addRequestMeta)(a,"fallbackParams",b)}return q({span:j,postponed:o,fallbackRouteParams:s,forceStaticRender:k})}catch(b){throw(null==g?void 0:g.isStale)&&await N.onRequestError(a,b,{routerKind:"App Router",routePath:U,routeType:"render",revalidateReason:(0,f.c)({isStaticGeneration:aM,isOnDemandRevalidate:ap})},!1,ai),b}},D=async c=>{var f,g,i,j,k;let l,m=await N.handleResponse({cacheKey:aS,responseGenerator:a=>r({span:c,...a}),routeKind:e.RouteKind.APP_PAGE,isOnDemandRevalidate:ap,isRoutePPREnabled:aD,req:a,nextConfig:aj,prerenderManifest:ae,waitUntil:d.waitUntil,isMinimalMode:T});if(af&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate"),N.isDev&&b.setHeader("Cache-Control","no-cache, must-revalidate"),!m){if(aS)throw Object.defineProperty(Error("invariant: cache entry required but not generated"),"__NEXT_ERROR_CODE",{value:"E62",enumerable:!1,configurable:!0});return null}if((null==(f=m.value)?void 0:f.kind)!==u.CachedRouteKind.APP_PAGE)throw Object.defineProperty(Error(`Invariant app-page handler received invalid cache entry ${null==(i=m.value)?void 0:i.kind}`),"__NEXT_ERROR_CODE",{value:"E707",enumerable:!1,configurable:!0});let n="string"==typeof m.value.postponed;ax&&!ay&&am&&b.setHeader(x.NEXT_NAV_DEPLOYMENT_ID_HEADER,am),aM&&!aJ&&(!n||aw)&&(T||b.setHeader("x-nextjs-cache",ap?"REVALIDATED":m.isMiss?"MISS":m.isStale?"STALE":"HIT"),b.setHeader(s.NEXT_IS_PRERENDER_HEADER,"1"));let{value:o}=m;if(aH)l={revalidate:0,expire:void 0};else if(aJ)l={revalidate:0,expire:void 0};else if(!N.isDev)if(af)l={revalidate:0,expire:void 0};else if(aM){if(m.cacheControl)if("number"==typeof m.cacheControl.revalidate){if(m.cacheControl.revalidate<1)throw Object.defineProperty(Error(`Invalid revalidate configuration provided: ${m.cacheControl.revalidate} < 1`),"__NEXT_ERROR_CODE",{value:"E22",enumerable:!1,configurable:!0});l={revalidate:m.cacheControl.revalidate,expire:(null==(j=m.cacheControl)?void 0:j.expire)??aj.expireTime}}else l={revalidate:x.CACHE_ONE_YEAR_SECONDS,expire:void 0}}else b.getHeader("Cache-Control")||(l={revalidate:0,expire:void 0});if(m.cacheControl=l,"string"==typeof aK&&(null==o?void 0:o.kind)===u.CachedRouteKind.APP_PAGE&&o.segmentData){b.setHeader(s.NEXT_DID_POSTPONE_HEADER,"2");let c=null==(k=o.headers)?void 0:k[x.NEXT_CACHE_TAGS_HEADER];T&&aM&&c&&"string"==typeof c&&b.setHeader(x.NEXT_CACHE_TAGS_HEADER,c);let d=o.segmentData.get(aK);return void 0!==d?(0,A.sendRenderResult)({req:a,res:b,generateEtags:aj.generateEtags,poweredByHeader:aj.poweredByHeader,result:w.default.fromStatic(d,s.RSC_CONTENT_TYPE_HEADER),cacheControl:m.cacheControl}):(b.statusCode=204,(0,A.sendRenderResult)({req:a,res:b,generateEtags:aj.generateEtags,poweredByHeader:aj.poweredByHeader,result:w.default.EMPTY,cacheControl:m.cacheControl}))}let p=aN?(0,h.getRequestMeta)(a,"onCacheEntryV2")??(0,h.getRequestMeta)(a,"onCacheEntry"):(0,h.getRequestMeta)(a,"onCacheEntry");if(p&&await p(m,{url:(0,h.getRequestMeta)(a,"initURL")??a.url}))return null;if(o.headers){let a={...o.headers};for(let[c,d]of(T&&aM||delete a[x.NEXT_CACHE_TAGS_HEADER],Object.entries(a)))if(void 0!==d)if(Array.isArray(d))for(let a of d)b.appendHeader(c,a);else"number"==typeof d&&(d=d.toString()),b.appendHeader(c,d)}let t=null==(g=o.headers)?void 0:g[x.NEXT_CACHE_TAGS_HEADER];if(T&&aM&&t&&"string"==typeof t&&b.setHeader(x.NEXT_CACHE_TAGS_HEADER,t),!o.status||ax&&aD||(b.statusCode=o.status),!T&&o.status&&F.RedirectStatusCode[o.status]&&ax&&(b.statusCode=200),n&&!aJ&&b.setHeader(s.NEXT_DID_POSTPONE_HEADER,"1"),ax&&!af){if(void 0===o.rscData){if(o.html.contentType!==s.RSC_CONTENT_TYPE_HEADER)if(aj.cacheComponents)return b.statusCode=404,(0,A.sendRenderResult)({req:a,res:b,generateEtags:aj.generateEtags,poweredByHeader:aj.poweredByHeader,result:w.default.EMPTY,cacheControl:m.cacheControl});else throw Object.defineProperty(new G.InvariantError(`Expected RSC response, got ${o.html.contentType}`),"__NEXT_ERROR_CODE",{value:"E789",enumerable:!1,configurable:!0});return(0,A.sendRenderResult)({req:a,res:b,generateEtags:aj.generateEtags,poweredByHeader:aj.poweredByHeader,result:o.html,cacheControl:m.cacheControl})}return(0,A.sendRenderResult)({req:a,res:b,generateEtags:aj.generateEtags,poweredByHeader:aj.poweredByHeader,result:w.default.fromStatic(o.rscData,s.RSC_CONTENT_TYPE_HEADER),cacheControl:m.cacheControl})}let v=o.html;if(aC&&aE){let c=!0===N.isDev?crypto.randomUUID():null;return v.pipeThrough((0,z.createInstantTestScriptInsertionTransformStream)(c)),(0,A.sendRenderResult)({req:a,res:b,generateEtags:aj.generateEtags,poweredByHeader:aj.poweredByHeader,result:v,cacheControl:{revalidate:0,expire:void 0}})}if(!n||T||ax)return(0,A.sendRenderResult)({req:a,res:b,generateEtags:aj.generateEtags,poweredByHeader:aj.poweredByHeader,result:v,cacheControl:m.cacheControl});if(aE||aF)return v.push(new ReadableStream({start(a){a.enqueue(y.ENCODED_TAGS.CLOSED.BODY_AND_HTML),a.close()}})),(0,A.sendRenderResult)({req:a,res:b,generateEtags:aj.generateEtags,poweredByHeader:aj.poweredByHeader,result:v,cacheControl:{revalidate:0,expire:void 0}});let B=new TransformStream;return v.push(B.readable),q({span:c,postponed:o.postponed,fallbackRouteParams:null,forceStaticRender:!1}).then(async a=>{var b,c;if(!a)throw Object.defineProperty(Error("Invariant: expected a result to be returned"),"__NEXT_ERROR_CODE",{value:"E463",enumerable:!1,configurable:!0});if((null==(b=a.value)?void 0:b.kind)!==u.CachedRouteKind.APP_PAGE)throw Object.defineProperty(Error(`Invariant: expected a page response, got ${null==(c=a.value)?void 0:c.kind}`),"__NEXT_ERROR_CODE",{value:"E305",enumerable:!1,configurable:!0});await a.value.html.pipeTo(B.writable)}).catch(a=>{B.writable.abort(a).catch(a=>{console.error("couldn't abort transformer",a)})}),(0,A.sendRenderResult)({req:a,res:b,generateEtags:aj.generateEtags,poweredByHeader:aj.poweredByHeader,result:v,cacheControl:{revalidate:0,expire:void 0}})};if(!aY||!aX)return k=aW.getActiveScopeSpan(),await aW.withPropagatedContext(a.headers,()=>aW.trace(i.BaseServerSpan.handleRequest,{spanName:`${aV} ${U}`,kind:g.SpanKind.SERVER,attributes:{"http.method":aV,"http.target":a.url}},D),void 0,!aY);await D(aX)}catch(b){throw b instanceof B.NoFallbackError||await N.onRequestError(a,b,{routerKind:"App Router",routePath:U,routeType:"render",revalidateReason:(0,f.c)({isStaticGeneration:aM,isOnDemandRevalidate:ap})},!1,ai),b}}},52804:(a,b,c)=>{Promise.resolve().then(c.bind(c,39075))},63033:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},70722:a=>{"use strict";a.exports=require("next/dist/shared/lib/invariant-error")},77068:a=>{"use strict";a.exports=require("next/dist/shared/lib/size-limit")},80086:(a,b,c)=>{"use strict";c.r(b),c.d(b,{default:()=>e});var d=c(5735);function e({children:a}){return(0,d.jsx)(d.Fragment,{children:a})}},86439:a=>{"use strict";a.exports=require("next/dist/shared/lib/no-fallback-error.external")},90829:(a,b,c)=>{"use strict";c.d(b,{ReceiptPrintButton:()=>e});var d=c(48249);function e(){return(0,d.jsx)("button",{className:"printbutton",type:"button",onClick:()=>window.print(),children:"Stampa / Salva PDF"})}},97178:a=>{a.exports={style:{fontFamily:"'Bebas Neue', 'Bebas Neue Fallback'",fontWeight:400,fontStyle:"normal"},className:"__className_d758cf"}}};var b=require("../../../../../webpack-runtime.js");b.C(a);var c=b.X(0,[741,63,572,343,626,127,768,504],()=>b(b.s=47270));module.exports=c})();