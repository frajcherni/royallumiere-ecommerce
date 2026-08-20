import{d as N,h as E,r as m,j as e,C as b,l as j,g as F,i as M,k as O,q as R,s as I,t as B,v as D}from"./index-Bwj02ZjV.js";/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const L=N("CircleAlert",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]]);/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const V=N("CircleCheckBig",[["path",{d:"M21.801 10A10 10 0 1 1 17 3.335",key:"yps3ct"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]]),U=({onNavigate:c})=>{const{items:d,totalAmount:n,totalItems:x,clearCart:y,updateQty:f,removeFromCart:C}=E(),[t,w]=m.useState({nomPrenom:"",telephone:"",adresse:"",email:"",ville:"",code_postal:""}),[s,h]=m.useState({}),[p,u]=m.useState("idle"),[z,T]=m.useState(""),[q,S]=m.useState(""),P=()=>{const r={};return t.nomPrenom.trim()||(r.nomPrenom="Nom requis"),t.telephone.trim()||(r.telephone="Téléphone requis"),t.adresse.trim()||(r.adresse="Adresse requise"),h(r),Object.keys(r).length===0},i=r=>o=>{w(l=>({...l,[r]:o.target.value})),s[r]&&h(l=>({...l,[r]:void 0}))},_=async r=>{if(r.preventDefault(),!!P()){u("loading");try{const o=await B(),l=new Date().toISOString(),g=d.reduce((a,k)=>a+k.prix_ht*k.quantite,0),A=n-g;await D({numeroCommande:o,dateCommande:l,taxMode:"TTC",totalTTC:n,totalHT:g,totalTVA:A,totalTTCAfterRemise:n,clientWebsiteInfo:{nomPrenom:t.nomPrenom.trim(),telephone:t.telephone.trim(),adresse:t.adresse.trim(),email:t.email.trim()||void 0,ville:t.ville.trim()||void 0,code_postal:t.code_postal.trim()||void 0},articles:d.map(a=>({article_id:a.article_id,designation:a.designation,quantite:a.quantite,quantiteLivree:0,prix_unitaire:a.prix_ttc,prix_ttc:a.prix_ttc,tva:a.tva}))}),T(o),u("success"),y()}catch(o){S(o.message||"Une erreur est survenue"),u("error")}}};return p==="success"?e.jsxs("div",{className:"page on",children:[e.jsx("style",{children:v}),e.jsx("div",{className:"ck-page-max",children:e.jsxs("div",{className:"ck-success-card",children:[e.jsx("div",{className:"ck-success-icon",children:e.jsx(V,{size:64,color:"#22c55e",strokeWidth:1.5})}),e.jsx("h2",{children:"Commande confirmée !"}),e.jsx("p",{children:"Merci pour votre achat. Notre équipe vous contactera bientôt."}),e.jsx("div",{className:"ck-order-badge",children:z}),e.jsxs("div",{className:"ck-actions",children:[e.jsx("button",{className:"btn btn-pr",onClick:()=>c("shop"),children:"Continuer les achats"}),e.jsx("button",{className:"btn btn-ol",onClick:()=>c("home"),children:"Accueil"})]})]})})]}):e.jsxs("div",{className:"page on",children:[e.jsx("style",{children:v}),e.jsxs("div",{className:"ck-page-max",children:[e.jsxs("div",{className:"ck-breadcrumb",children:[e.jsx("a",{onClick:()=>c("home"),children:"Accueil"}),e.jsx(b,{size:13}),e.jsx("a",{onClick:()=>c("shop"),children:"Boutique"}),e.jsx(b,{size:13}),e.jsx("span",{children:"Commander"})]}),e.jsx("h1",{className:"ck-title",children:"Finaliser votre commande"}),d.length===0?e.jsxs("div",{className:"ck-empty-state",children:[e.jsx(j,{size:48,strokeWidth:1}),e.jsx("p",{children:"Votre panier est vide"}),e.jsx("button",{className:"btn btn-pr",onClick:()=>c("shop"),children:"Retour à la boutique"})]}):e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"ck-cart-section",children:[e.jsxs("h2",{className:"ck-section-title",children:[e.jsx(j,{size:16})," Panier (",x," article",x>1?"s":"",")"]}),e.jsxs("div",{className:"ck-cart-items",children:[e.jsxs("div",{className:"ck-cart-header",children:[e.jsx("span",{children:"Produit"}),e.jsx("span",{children:"Qty"}),e.jsx("span",{children:"Sous-total"}),e.jsx("span",{})]}),d.map(r=>e.jsxs("div",{className:"ck-cart-item",children:[e.jsxs("div",{className:"ck-item-product-col",children:[e.jsx("img",{src:F(r.image),alt:r.designation}),e.jsx("span",{className:"ck-item-title",children:r.designation})]}),e.jsxs("div",{className:"ck-item-qty-ctrl",children:[e.jsx("button",{onClick:()=>f(r.article_id,r.quantite-1),children:e.jsx(M,{size:12})}),e.jsx("span",{children:r.quantite}),e.jsx("button",{onClick:()=>f(r.article_id,r.quantite+1),children:e.jsx(O,{size:12})})]}),e.jsxs("span",{className:"ck-item-subtotal",children:[(r.prix_ttc*r.quantite).toFixed(3)," DT"]}),e.jsx("button",{className:"ck-remove-icon",onClick:()=>C(r.article_id),children:e.jsx(R,{size:14})})]},r.article_id))]}),e.jsxs("div",{className:"ck-cart-total",children:[e.jsx("span",{children:"Total"}),e.jsxs("span",{className:"ck-total-amount",children:[n.toFixed(3)," DT"]})]})]}),e.jsxs("div",{className:"ck-form-section",children:[e.jsx("h2",{className:"ck-section-title",children:"Vos informations"}),p==="error"&&e.jsxs("div",{className:"ck-error-alert",children:[e.jsx(L,{size:16}),e.jsx("span",{children:q})]}),e.jsxs("form",{onSubmit:_,children:[e.jsxs("div",{className:"ck-form-row",children:[e.jsxs("div",{className:"ck-form-col",children:[e.jsxs("label",{className:"ck-label",children:["Nom & Prénom ",e.jsx("span",{children:"*"})]}),e.jsx("input",{className:`ck-input ${s.nomPrenom?"has-error":""}`,placeholder:"Ahmed Ben Ali",value:t.nomPrenom,onChange:i("nomPrenom")}),s.nomPrenom&&e.jsx("span",{className:"ck-error",children:s.nomPrenom})]}),e.jsxs("div",{className:"ck-form-col",children:[e.jsxs("label",{className:"ck-label",children:["Téléphone ",e.jsx("span",{children:"*"})]}),e.jsx("input",{className:`ck-input ${s.telephone?"has-error":""}`,placeholder:"20 123 456",value:t.telephone,onChange:i("telephone"),type:"tel"}),s.telephone&&e.jsx("span",{className:"ck-error",children:s.telephone})]})]}),e.jsx("div",{className:"ck-form-row",children:e.jsxs("div",{className:"ck-form-col",children:[e.jsxs("label",{className:"ck-label",children:["Adresse ",e.jsx("span",{children:"*"})]}),e.jsx("input",{className:`ck-input ${s.adresse?"has-error":""}`,placeholder:"12 Rue de la Paix, Tunis",value:t.adresse,onChange:i("adresse")}),s.adresse&&e.jsx("span",{className:"ck-error",children:s.adresse})]})}),e.jsxs("div",{className:"ck-form-row",children:[e.jsxs("div",{className:"ck-form-col",children:[e.jsx("label",{className:"ck-label",children:"Ville"}),e.jsx("input",{className:"ck-input",placeholder:"Tunis",value:t.ville,onChange:i("ville")})]}),e.jsxs("div",{className:"ck-form-col",children:[e.jsx("label",{className:"ck-label",children:"Code Postal"}),e.jsx("input",{className:"ck-input",placeholder:"1000",value:t.code_postal,onChange:i("code_postal")})]})]}),e.jsx("div",{className:"ck-form-row",children:e.jsxs("div",{className:"ck-form-col",children:[e.jsx("label",{className:"ck-label",children:"E-mail"}),e.jsx("input",{className:"ck-input",placeholder:"exemple@email.com",value:t.email,onChange:i("email"),type:"email"})]})}),e.jsxs("div",{className:"ck-form-actions",children:[e.jsxs("div",{className:"ck-total-summary",children:[e.jsxs("span",{children:[x," article(s)"]}),e.jsxs("span",{className:"ck-total-amount",children:[n.toFixed(3)," DT"]})]}),e.jsxs("div",{className:"ck-buttons",children:[e.jsx("button",{type:"submit",className:"ck-submit",disabled:p==="loading",children:p==="loading"?e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"ck-spinner"}),"Traitement..."]}):"Confirmer la commande"}),e.jsxs("button",{type:"button",className:"ck-back",onClick:()=>c("shop"),children:[e.jsx(I,{size:14})," Retour"]})]})]})]})]})]})]})]})},v=`
  .ck-page-max {
    max-width: 1100px;
    margin: 0 auto;
    padding: calc(var(--nav, 72px) + 2rem) clamp(1rem, 3vw, 2.5rem) 4rem;
  }

  .ck-breadcrumb {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.75rem;
    color: #a0a098;
    margin-bottom: 2rem;
  }
  .ck-breadcrumb a { cursor: pointer; color: var(--pr, #00adee); }
  .ck-breadcrumb a:hover { text-decoration: underline; }

  .ck-title {
    font-size: clamp(1.75rem, 4vw, 2.25rem);
    font-weight: 700;
    color: #03111f;
    margin-bottom: 2.5rem;
    font-family: var(--font, 'Montserrat'), sans-serif;
  }

  .ck-section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #03111f;
    margin-bottom: 1.5rem;
  }

  /* CART SECTION */
  .ck-cart-section {
    background: #fafaf8;
    border-radius: 14px;
    padding: 1.5rem;
    margin-bottom: 2.5rem;
  }

  .ck-cart-items {
    margin-bottom: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .ck-cart-header {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 0.5fr;
    gap: 1rem;
    align-items: center;
    padding-bottom: 0.75rem;
    margin-bottom: 0.5rem;
    border-bottom: 2px solid #e6e6e0;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    color: #a0a098;
    letter-spacing: 0.05em;
  }

  .ck-cart-item {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 0.5fr;
    gap: 1rem;
    align-items: center;
    padding: 0;
    border-bottom: 1px solid #e6e6e0;
  }
  .ck-cart-item:last-child { border-bottom: none; }

  .ck-item-product-col {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    min-width: 0;
  }
  .ck-item-product-col img {
    width: 120px;
    height: 120px;
    border-radius: 8px;
    object-fit: cover;
    flex-shrink: 0;
  }
  .ck-item-title {
    font-size: 0.8rem;
    font-weight: 600;
    color: #03111f;
    line-height: 1.3;
    max-width: 120px;
  }

  .ck-item-qty-ctrl {
    display: flex;
    align-items: center;
    gap: 4px;
    justify-content: center;
  }
  .ck-item-qty-ctrl button {
    background: #fff;
    border: 1px solid #e6e6e0;
    width: 24px;
    height: 24px;
    border-radius: 5px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #03111f;
    transition: all 0.15s;
  }
  .ck-item-qty-ctrl button:hover { background: #f0f0ec; }
  .ck-item-qty-ctrl span {
    min-width: 24px;
    text-align: center;
    font-size: 0.8rem;
    font-weight: 600;
  }

  .ck-item-subtotal {
    font-size: 0.8rem;
    font-weight: 700;
    color: #03111f;
    text-align: right;
  }

  .ck-remove-icon {
    background: none;
    border: none;
    cursor: pointer;
    color: #a0a098;
    padding: 0;
    transition: color 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .ck-remove-icon:hover { color: #f43f5e; }

  .ck-cart-total {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 1rem;
    padding-top: 0.75rem;
    border-top: 2px solid #e6e6e0;
    font-size: 0.9rem;
    font-weight: 700;
    color: #03111f;
  }
  .ck-total-amount {
    font-size: 1.2rem;
    color: var(--pr, #00adee);
  }

  @media (max-width: 768px) {
    .ck-cart-header,
    .ck-cart-item {
      grid-template-columns: 1.5fr 1fr 1fr 0.5fr;
      gap: 0.75rem;
      font-size: 0.7rem;
    }
    .ck-item-product-col { gap: 0.5rem; }
    .ck-item-product-col img { width: 90px; height: 90px; }
    .ck-item-title { max-width: 90px; }
  }

  /* FORM SECTION */
  .ck-form-section {
    background: #fff;
    border: 1px solid #f0f0ec;
    border-radius: 14px;
    padding: 2rem;
  }

  .ck-form-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .ck-form-col { display: flex; flex-direction: column; }

  .ck-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: #03111f;
    margin-bottom: 0.6rem;
    letter-spacing: 0.05em;
  }
  .ck-label span { color: #f43f5e; }

  .ck-input {
    padding: 0.8rem 1rem;
    border: 1.5px solid #e6e6e0;
    border-radius: 8px;
    font-size: 0.875rem;
    color: #03111f;
    background: #fff;
    outline: none;
    transition: border-color 0.2s;
    font-family: inherit;
  }
  .ck-input:focus { border-color: var(--pr, #00adee); }
  .ck-input.has-error { border-color: #f43f5e; }
  .ck-error { font-size: 0.7rem; color: #f43f5e; margin-top: 0.35rem; }

  .ck-error-alert {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    padding: 0.875rem 1rem;
    font-size: 0.8rem;
    color: #dc2626;
    margin-bottom: 1.5rem;
  }

  .ck-form-actions {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid #f0f0ec;
  }

  .ck-total-summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.85rem;
    color: #606058;
    margin-bottom: 1.5rem;
  }
  .ck-total-summary .ck-total-amount {
    font-size: 1rem;
    font-weight: 700;
    color: var(--pr, #00adee);
  }

  .ck-buttons {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 1rem;
  }

  .ck-submit {
    padding: 1rem;
    background: var(--pr, #00adee);
    color: #fff;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: background 0.2s;
  }
  .ck-submit:hover:not(:disabled) { background: #008fca; }
  .ck-submit:disabled { background: #a0a098; cursor: not-allowed; }

  .ck-back {
    padding: 1rem 1.5rem;
    background: #f4f4f0;
    color: #03111f;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: background 0.2s;
    white-space: nowrap;
  }
  .ck-back:hover { background: #e6e6e0; }

  .ck-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: ckSpin 0.7s linear infinite;
  }
  @keyframes ckSpin { to { transform: rotate(360deg); } }

  /* EMPTY STATE */
  .ck-empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
    padding: 4rem 2rem;
    text-align: center;
    color: #a0a098;
  }

  /* SUCCESS */
  .ck-success-card {
    background: #fff;
    border: 1px solid #f0f0ec;
    border-radius: 16px;
    padding: 3rem 2rem;
    text-align: center;
    max-width: 500px;
    margin: 3rem auto;
  }
  .ck-success-icon { margin-bottom: 1rem; }
  .ck-success-card h2 { font-size: 1.5rem; font-weight: 700; color: #03111f; margin-bottom: 0.75rem; }
  .ck-success-card p { font-size: 0.9rem; color: #606058; line-height: 1.6; margin-bottom: 1.5rem; }
  .ck-order-badge {
    background: #f0f9ff;
    border: 1.5px solid #bae6fd;
    border-radius: 8px;
    padding: 0.75rem 1.5rem;
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--pr, #00adee);
    letter-spacing: 0.05em;
    margin-bottom: 2rem;
  }
  .ck-actions {
    display: flex;
    gap: 0.75rem;
    flex-direction: column;
  }

  @media (max-width: 768px) {
    .ck-buttons { grid-template-columns: 1fr; }
    .ck-form-row { grid-template-columns: 1fr; }
  }
`;export{U as default};
