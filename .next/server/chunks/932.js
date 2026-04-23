"use strict";exports.id=932,exports.ids=[932],exports.modules={21932:(a,b,c)=>{c.d(b,{FO:()=>p,FU:()=>C,Gy:()=>z,M3:()=>y,Qj:()=>r,Qs:()=>o,Tr:()=>A,po:()=>B,v0:()=>q,y6:()=>E,z0:()=>D});var d=c(95349),e=c(42650),f=c(24059),g=c(40965),h=c(89337);let i="11111111-1111-1111-1111-111111111111",j=process.env.SMTP_HOST,k=Number(process.env.SMTP_PORT||465),l=process.env.SMTP_USER,m=process.env.SMTP_PASS,n=j&&l&&m?g.oO({host:j,port:k,secure:!0,auth:{user:l,pass:m}}):null;async function o(a){try{if(!a.nome||!a.cognome)return{ok:!1,error:"Campi obbligatori mancanti."};let b=await (0,f.n)(),{data:c,error:d}=await b.from("soci").insert({organizzazione_id:i,nome:a.nome,cognome:a.cognome,data_nascita:a.data_nascita||null,luogo_nascita:a.luogo_nascita||null,provincia_nascita:a.provincia_nascita||null,codice_fiscale:a.codice_fiscale||null,indirizzo:a.indirizzo||null,cap:a.cap||null,comune:a.comune||null,provincia:a.provincia||null,telefono:a.telefono||null,email:a.email||null,stato:"sospeso",data_iscrizione:a.data_iscrizione||new Date().toISOString().slice(0,10),e_anche_volontario:a.e_anche_volontario,e_minorenne:a.e_minorenne,origine_inserimento:"operatore"}).select().single();if(d)return{ok:!1,error:d.message};return(0,e.revalidatePath)("/soci"),(0,e.revalidatePath)("/"),{ok:!0,data:c}}catch(a){return{ok:!1,error:a instanceof Error?a.message:"Errore durante la creazione del socio."}}}async function p(a){try{let b=await (0,f.n)(),{data:c,error:d}=await b.from("soci").select(`
        id,
        modifica_bloccata,
        stato,
        e_anche_volontario,
        telefono,
        email,
        indirizzo,
        cap,
        comune,
        provincia
      `).eq("id",a.socioId).single();if(d)return{ok:!1,error:d.message};if(c?.modifica_bloccata)return{ok:!1,error:"Questo socio \xe8 bloccato e non pu\xf2 essere modificato."};let g=a.telefono||null,h=a.email||null,i=a.indirizzo||null,j=a.cap||null,k=a.comune||null,l=a.provincia||null,m=(c.telefono||null)!==g||(c.email||null)!==h||(c.indirizzo||null)!==i||(c.cap||null)!==j||(c.comune||null)!==k||(c.provincia||null)!==l,n=!!c.e_anche_volontario&&m,{data:o,error:p}=await b.from("soci").update({nome:a.nome,cognome:a.cognome,data_nascita:a.data_nascita||null,luogo_nascita:a.luogo_nascita||null,provincia_nascita:a.provincia_nascita||null,codice_fiscale:a.codice_fiscale||null,indirizzo:i,cap:j,comune:k,provincia:l,telefono:g,email:h,e_anche_volontario:a.e_anche_volontario,e_minorenne:a.e_minorenne,stato:c.stato,richiede_verifica_volontario:!!n||void 0}).eq("id",a.socioId).select().single();if(p)return{ok:!1,error:p.message};return(0,e.revalidatePath)("/soci"),(0,e.revalidatePath)(`/soci/${a.socioId}`),{ok:!0,data:o}}catch(a){return{ok:!1,error:a instanceof Error?a.message:"Errore durante l’aggiornamento del socio."}}}async function q(a){try{let b,c=await (0,f.n)(),{data:d}=await c.from("consensi_soci").select("id").eq("socio_id",a.socioId).maybeSingle();if((b=d?.id?await c.from("consensi_soci").update({consenso_prestato_da:a.consenso_prestato_da||null,consenso_at:a.consenso_at||null,privacy_accettata:a.privacy_accettata,statuto_accettato:a.statuto_accettato,trattamento_dati_associazione:a.trattamento_dati_associazione,consenso_minore_finalita_associazione:a.consenso_minore_finalita_associazione}).eq("socio_id",a.socioId).select().single():await c.from("consensi_soci").insert({socio_id:a.socioId,consenso_prestato_da:a.consenso_prestato_da||null,consenso_at:a.consenso_at||null,privacy_accettata:a.privacy_accettata,statuto_accettato:a.statuto_accettato,trattamento_dati_associazione:a.trattamento_dati_associazione,consenso_minore_finalita_associazione:a.consenso_minore_finalita_associazione}).select().single()).error)return{ok:!1,error:b.error.message};return(0,e.revalidatePath)(`/soci/${a.socioId}`),{ok:!0,data:b.data}}catch(a){return{ok:!1,error:a instanceof Error?a.message:"Errore salvataggio consensi."}}}async function r(a){try{let b;if(!a.nome||!a.cognome||!a.data_nascita||!a.luogo_nascita||!a.provincia_nascita||!a.codice_fiscale)return{ok:!1,error:"Compila tutti i campi obbligatori del tutore."};let c=await (0,f.n)(),{data:d}=await c.from("tutori_soci").select("id").eq("socio_id",a.socioId).maybeSingle();if((b=d?.id?await c.from("tutori_soci").update({nome:a.nome,cognome:a.cognome,data_nascita:a.data_nascita||null,luogo_nascita:a.luogo_nascita||null,provincia_nascita:a.provincia_nascita||null,codice_fiscale:a.codice_fiscale||null,indirizzo:a.indirizzo||null,cap:a.cap||null,comune:a.comune||null,provincia:a.provincia||null,telefono:a.telefono||null,email:a.email||null}).eq("socio_id",a.socioId).select().single():await c.from("tutori_soci").insert({socio_id:a.socioId,nome:a.nome,cognome:a.cognome,data_nascita:a.data_nascita||null,luogo_nascita:a.luogo_nascita||null,provincia_nascita:a.provincia_nascita||null,codice_fiscale:a.codice_fiscale||null,indirizzo:a.indirizzo||null,cap:a.cap||null,comune:a.comune||null,provincia:a.provincia||null,telefono:a.telefono||null,email:a.email||null}).select().single()).error)return{ok:!1,error:b.error.message};return(0,e.revalidatePath)(`/soci/${a.socioId}`),{ok:!0,data:b.data}}catch(a){return{ok:!1,error:a instanceof Error?a.message:"Errore salvataggio tutore."}}}async function s(a){if(!n||!l)throw Error("Configurazione SMTP mancante.");await n.sendMail({from:l,to:a.to,subject:a.subject,text:a.body,html:a.html})}let t=process.env.APP_BASE_URL?.replace(/\/$/,"")||"http://localhost:3000",u=process.env.WHATSAPP_CHAT_URL||"https://www.angelideinavigli.org/associati/",v=process.env.PRIVACY_URL||"https://www.angelideinavigli.org/associati/",w=process.env.STATUTO_URL||"https://www.angelideinavigli.org/associati/",x=process.env.TRATTAMENTO_DATI_URL||"https://www.angelideinavigli.org/associati/";async function y(a){try{let c=await (0,f.n)(),d={stato:a.stato};"attivo"===a.stato&&(d.scheda_completata=!0);let{data:g,error:h}=await c.from("soci").update(d).eq("id",a.socioId).select("id, codice_univoco, nome, cognome, stato, email, email_benvenuto_inviata_at, origine_inserimento").single();if(h)return{ok:!1,error:h.message};let i=null;if("attivo"===a.stato){let{data:b,error:d}=await c.from("tessere_digitali").select("id, public_token").eq("socio_id",a.socioId).maybeSingle();if(d)return{ok:!1,error:d.message};if(b)i=b.public_token??null;else{let b=new Date().getFullYear();i="u">typeof crypto&&"randomUUID"in crypto?crypto.randomUUID().replace(/-/g,""):`${Date.now()}${Math.random().toString(36).slice(2)}`;let{error:d}=await c.from("tessere_digitali").insert({socio_id:a.socioId,codice_tessera:g.codice_univoco,public_token:i,wallet_inviato:!1,email_inviata:!1,stato:"attiva",anno_validita:b,scadenza_al:`${b}-12-31`});if(d)return{ok:!1,error:d.message}}}if("attivo"===a.stato&&g.email&&!g.email_benvenuto_inviata_at){var b;let d,e,f,h,j,{data:k,error:l}=await c.from("pagamenti_soci").select("id").eq("socio_id",a.socioId).order("data_pagamento",{ascending:!1}).order("created_at",{ascending:!1}).limit(1).maybeSingle();if(l)return{ok:!1,error:l.message};let m=k?.id?`${t}/soci/ricevuta/${k.id}`:`${t}/soci/${a.socioId}`,n=i?`${t}/api/apple-wallet/${i}`:`${t}/tessere`,o=(b={nome:g.nome,origineInserimento:g.origine_inserimento??null,ricevutaUrl:m,walletUrl:n,whatsappUrl:u,privacyUrl:v,statutoUrl:w,trattamentoDatiUrl:x},d=b.nome?.trim()||"socio",e=`Ciao ${d},

la tua registrazione come socio \xe8 stata confermata con successo.

Puoi consultare la ricevuta del pagamento qui:
${b.ricevutaUrl}

Puoi scaricare la tua tessera digitale nel wallet qui:
${b.walletUrl}

Puoi accedere alla chat cittadina WhatsApp qui:
${b.whatsappUrl}

A presto,
Angeli dei Navigli ODV ETS`,f="operatore"===b.origineInserimento?`

Conferma consensi letti e accettati:
✔ Ha letto e accettato l’informativa privacy:
${b.privacyUrl}

✔ Ha letto e accettato lo statuto:
${b.statutoUrl}

✔ Consente al trattamento dati per finalit\xe0 associative:
${b.trattamentoDatiUrl}`:"",h=`
    <p>Ciao ${d},</p>

    <p>la tua registrazione come socio \xe8 stata confermata con successo.</p>

    <p>
      Puoi consultare la ricevuta del pagamento
      <a href="${b.ricevutaUrl}">qui</a>.
    </p>

    <p>
      Puoi scaricare la tua tessera digitale nel wallet
      <a href="${b.walletUrl}">qui</a>.
    </p>

    <p>
      Puoi accedere alla chat cittadina WhatsApp
      <a href="${b.whatsappUrl}">qui</a>.
    </p>

    <p>A presto,<br />Angeli dei Navigli ODV ETS</p>
  `,j="operatore"===b.origineInserimento?`
        <p>Conferma consensi letti e accettati:</p>
        <p>✔ <a href="${b.privacyUrl}">Ha letto e accettato l’informativa privacy</a></p>
        <p>✔ <a href="${b.statutoUrl}">Ha letto e accettato lo statuto</a></p>
        <p>✔ <a href="${b.trattamentoDatiUrl}">Consente al trattamento dati per finalit\xe0 associative</a></p>
      `:"",{subject:"Conferma registrazione socio",body:`${e}${f}`,html:`${h}${j}`});try{await s({to:g.email,subject:o.subject,body:o.body,html:o.html}),await c.from("soci").update({email_benvenuto_inviata_at:new Date().toISOString()}).eq("id",a.socioId)}catch(a){return{ok:!1,error:a instanceof Error?`Errore invio mail: ${a.message}`:"Errore invio mail."}}}return(0,e.revalidatePath)("/soci"),(0,e.revalidatePath)(`/soci/${a.socioId}`),(0,e.revalidatePath)("/tessere"),(0,e.revalidatePath)("/"),{ok:!0,data:g}}catch(a){return{ok:!1,error:a instanceof Error?a.message:"Errore durante l’aggiornamento dello stato del socio."}}}async function z(a){try{let b=await (0,f.n)(),{data:c,error:d}=await b.from("soci").select(`
        id,
        codice_univoco,
        nome,
        cognome,
        data_nascita,
        luogo_nascita,
        provincia_nascita,
        codice_fiscale,
        indirizzo,
        cap,
        comune,
        provincia,
        telefono,
        email,
        e_minorenne,
        e_anche_volontario
      `).eq("id",a.socioId).single();if(d)return{ok:!1,error:d.message};if(!c)return{ok:!1,error:"Socio non trovato."};if(c.e_anche_volontario)return{ok:!1,error:"Questo socio \xe8 gi\xe0 attivo anche come volontario."};let{data:g,error:h}=await b.from("volontari").select("id").eq("socio_id",a.socioId).maybeSingle();if(h)return{ok:!1,error:h.message};if(g){let{data:c,error:d}=await b.from("soci").update({e_anche_volontario:!0,modifica_bloccata:!0}).eq("id",a.socioId).select().single();if(d)return{ok:!1,error:d.message};return(0,e.revalidatePath)("/soci"),(0,e.revalidatePath)(`/soci/${a.socioId}`),(0,e.revalidatePath)("/volontari"),(0,e.revalidatePath)("/"),{ok:!0,data:c}}let{error:j}=await b.from("volontari").insert({organizzazione_id:i,socio_id:c.id,codice_univoco:c.codice_univoco,nome:c.nome,cognome:c.cognome,stato:"attivo",tipologia:"occasionale",data_inizio:new Date().toISOString().slice(0,10),data_nascita:c.data_nascita||null,luogo_nascita:c.luogo_nascita||null,provincia_nascita:c.provincia_nascita||null,codice_fiscale:c.codice_fiscale||null,indirizzo:c.indirizzo||null,cap:c.cap||null,comune:c.comune||null,provincia:c.provincia||null,telefono:c.telefono||null,email:c.email||null,minorenne:c.e_minorenne??!1,modifica_bloccata:!0});if(j)return{ok:!1,error:j.message};let{data:k,error:l}=await b.from("soci").update({e_anche_volontario:!0,modifica_bloccata:!0}).eq("id",a.socioId).select().single();if(l)return{ok:!1,error:l.message};return(0,e.revalidatePath)("/soci"),(0,e.revalidatePath)(`/soci/${a.socioId}`),(0,e.revalidatePath)("/volontari"),(0,e.revalidatePath)("/"),{ok:!0,data:k}}catch(a){return{ok:!1,error:a instanceof Error?a.message:"Errore durante l’attivazione del socio come volontario."}}}async function A(a){try{let b=await (0,f.n)(),{data:c,error:d}=await b.from("soci").select("id, stato, archiviato").eq("id",a.socioId).single();if(d)return{ok:!1,error:d.message};if(c?.archiviato)return{ok:!1,error:"Il socio \xe8 gi\xe0 archiviato."};if(c?.stato!=="sospeso")return{ok:!1,error:"Puoi archiviare solo un socio sospeso."};let{data:g,error:h}=await b.from("soci").update({archiviato:!0,stato:"sospeso"}).eq("id",a.socioId).select().single();if(h)return{ok:!1,error:h.message};return(0,e.revalidatePath)("/soci"),(0,e.revalidatePath)(`/soci/${a.socioId}`),(0,e.revalidatePath)("/"),{ok:!0,data:g}}catch(a){return{ok:!1,error:a instanceof Error?a.message:"Errore durante l’archiviazione del socio."}}}async function B(a){try{let b=await (0,f.n)(),{data:c,error:d}=await b.from("soci").select("id, archiviato").eq("id",a.socioId).single();if(d)return{ok:!1,error:d.message};if(!c?.archiviato)return{ok:!1,error:"Il socio non \xe8 archiviato."};let{data:g,error:h}=await b.from("soci").update({archiviato:!1,stato:"sospeso"}).eq("id",a.socioId).select().single();if(h)return{ok:!1,error:h.message};return(0,e.revalidatePath)("/soci"),(0,e.revalidatePath)(`/soci/${a.socioId}`),(0,e.revalidatePath)("/"),{ok:!0,data:g}}catch(a){return{ok:!1,error:a instanceof Error?a.message:"Errore durante il ripristino del socio."}}}async function C(){try{let a=await (0,f.n)(),b=new Date().getFullYear(),{data:c,error:d}=await a.from("soci").select("id, stato, archiviato").eq("stato","attivo").eq("archiviato",!1);if(d)return{ok:!1,error:d.message};let g=(c??[]).map(a=>a.id);if(0===g.length)return{ok:!0,data:{aggiornati:0}};let{data:h,error:i}=await a.from("pagamenti_soci").select("socio_id, anno_quota").in("socio_id",g).eq("anno_quota",b);if(i)return{ok:!1,error:i.message};let j=new Set((h??[]).map(a=>a.socio_id)),k=g.filter(a=>!j.has(a));if(0===k.length)return{ok:!0,data:{aggiornati:0}};let{error:l}=await a.from("soci").update({stato:"sospeso"}).in("id",k);if(l)return{ok:!1,error:l.message};return(0,e.revalidatePath)("/soci"),(0,e.revalidatePath)("/"),{ok:!0,data:{aggiornati:k.length}}}catch(a){return{ok:!1,error:a instanceof Error?a.message:"Errore durante la sospensione automatica dei soci non rinnovati."}}}async function D(){try{let a=await (0,f.n)(),b=new Date().getFullYear()+1,{data:c,error:d}=await a.from("soci").select("id, nome, cognome, email, codice_univoco, stato, archiviato").eq("stato","attivo").eq("archiviato",!1).not("email","is",null);if(d)return{ok:!1,error:d.message};let e=(c??[]).filter(a=>"string"==typeof a.email&&""!==a.email.trim()).map(a=>{let c=`Rinnovo quota associativa ${b}`,d=`Ciao ${a.nome},

\xe8 arrivato il momento di rinnovare la tua quota associativa.

Il rinnovo non \xe8 obbligatorio, ma se desideri continuare a sostenere le nostre iniziative, puoi accedere all’area Rinnovi tramite questo link:
https://www.angelideinavigli.org/associati/

Per procedere al rinnovo, inserisci il tuo codice socio: ${a.codice_univoco}

Potrai completare la procedura in pochi passaggi.

Se hai gi\xe0 provveduto, puoi ignorare questo promemoria.

Per qualsiasi dubbio o informazione, siamo qui.

A presto,
Angeli dei Navigli ODV ETS`;return{socioId:a.id,nome:a.nome,cognome:a.cognome,email:a.email,codice_univoco:a.codice_univoco,subject:c,body:d}});return{ok:!0,data:{totale:e.length,reminders:e}}}catch(a){return{ok:!1,error:a instanceof Error?a.message:"Errore durante la preparazione dei reminder rinnovi."}}}async function E(a){try{let b=await (0,f.n)(),c=a.data_pagamento||new Date().toISOString().slice(0,10);if("paypal"===a.metodo&&!a.numero_transazione?.trim())return{ok:!1,error:"Per un pagamento PayPal serve il numero transazione."};let d=a.anno_quota??Number(c.slice(0,4)),g=a.tipo_quota??"prima_iscrizione",{data:h,error:i}=await b.from("pagamenti_soci").insert({socio_id:a.socioId,causale:a.causale,importo:a.importo,metodo:a.metodo,data_pagamento:c,numero_transazione:a.numero_transazione||null,intestatario_transazione:a.intestatario_transazione||null,indirizzo:a.indirizzo||null,codice_fiscale_pagatore:a.codice_fiscale_pagatore||null,tipo_pagatore:a.tipo_pagatore||null,nota:a.nota||null,anno_quota:d,tipo_quota:g}).select().single();if(i)return{ok:!1,error:i.message};if("rinnovo"===g){let{error:c}=await b.from("tessere_digitali").update({anno_validita:d,scadenza_al:`${d}-12-31`,stato:"attiva",wallet_inviato:!1,email_inviata:!1}).eq("socio_id",a.socioId);if(c)return{ok:!1,error:c.message}}return(0,e.revalidatePath)(`/soci/${a.socioId}`),(0,e.revalidatePath)("/soci"),(0,e.revalidatePath)("/tessere"),{ok:!0,data:h}}catch(a){return{ok:!1,error:a instanceof Error?a.message:"Errore creazione pagamento."}}}(0,h.D)([o,p,q,r,y,z,A,B,C,D,E]),(0,d.A)(o,"404d7085521108d6b6399b0a6728cec7fbbd539b6d",null),(0,d.A)(p,"40458c762ab620705cc436ffbfb9f1b204f7dbc9c8",null),(0,d.A)(q,"406f0d00f1899ae8f717d55eff50f9dabe22e8cb67",null),(0,d.A)(r,"40b10fc2387de2e6fe829095a413a6815ed8602809",null),(0,d.A)(y,"401ca4aa118bd6c4d7c39fec047d902127c2035b55",null),(0,d.A)(z,"40bbdbc7ab297d9757816d22ef931c7add57ebba3f",null),(0,d.A)(A,"40f49b0318054192928fa8471c88a5af3489e60f29",null),(0,d.A)(B,"404b8563af0be1867033620c5500dfb475678e790d",null),(0,d.A)(C,"001f131ba0b0a7bd38025255a133feba769524a3b5",null),(0,d.A)(D,"004f178e56874da8800f6cd2814ed62b59148ee801",null),(0,d.A)(E,"405c8f220db60c57d02a30af8b3645604c011b0c94",null)},24059:(a,b,c)=>{c.d(b,{n:()=>e});var d=c(99735);function e(){let a="https://wmfvirvgvpniqmcdvyly.supabase.co",b="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtZnZpcnZndnBuaXFtY2R2eWx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwNzQyODEsImV4cCI6MjA4OTY1MDI4MX0.cenY9VG3usTvDY6xQpzBKLCiNguYt6AW-INO7nJyok0";if(!a)throw Error("NEXT_PUBLIC_SUPABASE_URL mancante in .env.local");if(!b)throw Error("NEXT_PUBLIC_SUPABASE_ANON_KEY mancante in .env.local");return(0,d.UU)(a,b,{auth:{persistSession:!1,autoRefreshToken:!1}})}}};