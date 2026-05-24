"use client";
import { useState } from "react";
const menu: Record<string,{icon:string;color:string;items:{name:string;desc:string;price:number;extra?:string}[]}> = {
"פיצות":{icon:"🍕",color:"from-red-900/40 to-orange-900/20",items:[{name:"מגש אישי S",desc:"מושלם לאחד",price:25,extra:"תוספת למנגש +4₪"},{name:"מגש זוגי M",desc:"לשניים",price:35,extra:"תוספת למנגש +8₪"},{name:"מגש משפחתי L",desc:"לכל המשפחה",price:45,extra:"תוספת למנגש +10₪"},{name:"מגש ענק XL",desc:"לרעבים האמיתיים",price:55,extra:"תוספת למנגש +12₪"}]},
"זיווה":{icon:"🥙",color:"from-amber-900/40 to-yellow-900/20",items:[{name:"זיווה רגילה",desc:"גבינת מוצרלה",price:42},{name:"זיווה זיתים",desc:"מוצרלה וזיתים",price:42},{name:"זיווה פטריות",desc:"מוצרלה ופטריות",price:42},{name:"זיווה מעורבת",desc:"מוצרלה ובולגרית",price:42},{name:"זיווה יוונית",desc:"בולגרית, זיתים שחורים ובצל",price:42}]},
"האיטלקיה":{icon:"🫓",color:"from-green-900/40 to-emerald-900/20",items:[{name:"רביולי תרד",desc:"ריקוטה ותרד",price:45},{name:"רביולי ארטישוק",desc:"ארטישוק וגבינה",price:45},{name:"רביולי ריקוטה",desc:"גבינת ריקוטה",price:45},{name:"רביולי פרמזן",desc:"גבינת פרמזן",price:45},{name:"רביולי גבינות",desc:"4 גבינות ברוטב אלפרדו",price:45},{name:"רביולי בטטה",desc:"גבינה ובטטה ברוטב אלפרדו",price:45},{name:"רביולי פטריות",desc:"פטריות וגבינה ברוטב אלפרדו",price:45}]},
"פסטות":{icon:"🍝",color:"from-yellow-900/40 to-amber-900/20",items:[{name:"פטוצ'יני / ספגטי / פנה",desc:"ברוטב עגבניות",price:30},{name:"רוטב שמנת פטריות / רוזה מיקס",desc:"מומלץ!",price:40},{name:"תפוח אדמה",desc:"ברוטב אלפרדו",price:35},{name:"ניוקי תפוח אדמה",desc:"ברוטב אלפרדו",price:35},{name:"ניוקי מעורב",desc:"תפוח אדמה, תרד ובטטה",price:35}]},
"מלאווח":{icon:"🥞",color:"from-orange-900/40 to-red-900/20",items:[{name:"מלאווח רגיל",desc:"עגבניות מגורדות וביצה",price:25},{name:"מלאווח תחינה",desc:"טחינה, עגבניות וביצה",price:25},{name:"מלאווח סוניסאי",desc:"ביצה, זיתים, טונה ועגבניות",price:30},{name:"מלאווח יווני",desc:"ביצה, בולגרית, זיתים שחורים וזעתר",price:30},{name:"מלאווח הבית",desc:"ביצה, בולגרית, טונה, פטריות ובצל",price:30},{name:"⭐ מלאווח פיצה",desc:"תוספת אחת חינם מתוספות הפיצה",price:35},{name:"מלאווח ביצה עין",desc:"2 ביצים וגבינת מוצרלה",price:35},{name:"מלאווח הביתה",desc:"אפוי עם ביצה",price:35},{name:"מלאווח פתוח",desc:"רסק, ביצה ואריסה",price:30},{name:"ג'חנון",desc:"עגבניות מגורדות, ביצה וחריף",price:25}]},
"סלטים":{icon:"🥗",color:"from-lime-900/40 to-green-900/20",items:[{name:"סלט יווני קטן",desc:"חסה, מלפפון, עגבניה, זיתים שחורים, תירס, בולגרית וזעתר",price:40},{name:"סלט יווני גדול",desc:"חסה, מלפפון, עגבניה, זיתים שחורים, תירס, בולגרית וזעתר",price:50},{name:"סלט טונה קטן",desc:"חסה, מלפפון, עגבניה, זיתים ירוקים, תירס וטונה",price:40},{name:"סלט טונה גדול",desc:"חסה, מלפפון, עגבניה, זיתים ירוקים, תירס וטונה",price:50},{name:"סלט ירקות קטן",desc:"חסה, מלפפון, עגבניה ובצל",price:40},{name:"סלט ירקות גדול",desc:"חסה, מלפפון, עגבניה ובצל",price:50}]},
"קינוחים":{icon:"🍰",color:"from-pink-900/40 to-rose-900/20",items:[{name:"מאפה זיווה",desc:"נוטלה / שוקולד השחר",price:35},{name:"בלינצ'ס",desc:"2 יח׳, גבינה / שוקולד / נוטלה",price:20},{name:"סופלה שוקולד חם",desc:"טרי מהתנור",price:25},{name:"מלבי",desc:"קינוח חלבי קלאסי",price:12},{name:"עוגת גבינה פרורים",desc:"",price:12},{name:"עוגת גבינה אוקמנית",desc:"",price:12},{name:"פנקוטה",desc:"",price:12},{name:"סברינה",desc:"",price:15},{name:"בואריה",desc:"",price:12},{name:"מוס ריבת חלב",desc:"",price:12},{name:"הקאצ'ה",desc:"",price:12},{name:"מוס שוקולד",desc:"",price:12}]},
"לחם ומסבוסה":{icon:"🍞",color:"from-stone-900/40 to-neutral-900/20",items:[{name:"לחם שום S",desc:"עם מיקס גבינות",price:25},{name:"לחם שום M",desc:"עם מיקס גבינות",price:35},{name:"מסבוסה",desc:"תפו״א ביצה וגבינה / רוטב פיצה / ארבע גבינות / אלפרדו",price:32}]}
};
export default function Home() {
  const [cat, setCat] = useState("פיצות");
  const [cart, setCart] = useState<{name:string;price:number;qty:number}[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const add = (n:string,p:number) => setCart(prev=>{const e=prev.find(i=>i.name===n);return e?prev.map(i=>i.name===n?{...i,qty:i.qty+1}:i):[...prev,{name:n,price:p,qty:1}]});
  const rem = (n:string) => setCart(prev=>{const e=prev.find(i=>i.name===n);return e&&e.qty>1?prev.map(i=>i.name===n?{...i,qty:i.qty-1}:i):prev.filter(i=>i.name!==n)});
  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
  const totalQ = cart.reduce((s,i)=>s+i.qty,0);
  const current = menu[cat];
  return (
    <div dir="rtl" className="min-h-screen text-white" style={{background:"#0a0a0a",fontFamily:"'Heebo',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;700;800;900&display=swap" rel="stylesheet"/>
      <div style={{background:"linear-gradient(180deg,#1a0000 0%,#0a0a0a 100%)",position:"fixed",inset:0,zIndex:0,pointerEvents:"none"}}/>
      <header style={{position:"sticky",top:0,zIndex:40,background:"rgba(10,10,10,0.97)",borderBottom:"1px solid rgba(255,255,255,0.06)",backdropFilter:"blur(20px)"}}>
        <div style={{maxWidth:600,margin:"0 auto",padding:"14px 16px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:28}}>🍕</span>
                <div>
                  <h1 style={{fontSize:20,fontWeight:900,margin:0,letterSpacing:-0.5}}>קייטרינג פיצה</h1>
                  <p style={{fontSize:11,color:"#ef4444",margin:0,fontWeight:600,letterSpacing:1}}>אילת • משלוחים ואיסוף עצמי</p>
                </div>
              </div>
            </div>
            <button onClick={()=>setCartOpen(true)} style={{position:"relative",background:totalQ>0?"#dc2626":"#1f1f1f",border:totalQ>0?"none":"1px solid rgba(255,255,255,0.1)",borderRadius:14,padding:"10px 18px",fontWeight:800,fontSize:14,color:"white",cursor:"pointer",display:"flex",alignItems:"center",gap:6,transition:"all 0.2s",fontFamily:"inherit"}}>
              <span>🛒</span><span>עגלה</span>
              {totalQ>0&&<span style={{position:"absolute",top:-8,left:-8,background:"white",color:"#dc2626",fontSize:11,fontWeight:900,borderRadius:"50%",width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center"}}>{totalQ}</span>}
            </button>
          </div>
          <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4}}>
            {Object.entries(menu).map(([k,v])=>(
              <button key={k} onClick={()=>setCat(k)} style={{display:"flex",alignItems:"center",gap:5,padding:"8px 14px",borderRadius:12,fontSize:13,fontWeight:700,whiteSpace:"nowrap",cursor:"pointer",fontFamily:"inherit",transition:"all 0.2s",background:cat===k?"#dc2626":"rgba(255,255,255,0.05)",color:cat===k?"white":"rgba(255,255,255,0.5)",border:cat===k?"none":"1px solid rgba(255,255,255,0.06)"}}>
                <span>{v.icon}</span><span>{k}</span>
              </button>
            ))}
          </div>
        </div>
      </header>
      <main style={{maxWidth:600,margin:"0 auto",padding:"24px 16px",position:"relative",zIndex:1}}>
        <div style={{marginBottom:20}}>
          <h2 style={{fontSize:26,fontWeight:900,margin:0,letterSpacing:-0.5}}>{current.icon} {cat}</h2>
          <div style={{width:40,height:3,background:"#dc2626",borderRadius:2,marginTop:6}}/>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {current.items.map((item,idx)=>{
            const ic=cart.find(i=>i.name===item.name);
            const isSpecial=item.name.startsWith("⭐");
            return (
              <div key={item.name} style={{background:isSpecial?"rgba(220,38,38,0.08)":"rgba(255,255,255,0.03)",border:isSpecial?"1px solid rgba(220,38,38,0.3)":"1px solid rgba(255,255,255,0.06)",borderRadius:16,padding:"16px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,transition:"all 0.2s"}}>
                <div style={{flex:1}}>
                  <p style={{fontWeight:800,fontSize:15,margin:0,color:isSpecial?"#fca5a5":"white"}}>{item.name}</p>
                  {item.desc&&<p style={{color:"rgba(255,255,255,0.4)",fontSize:12,marginTop:3,marginBottom:0}}>{item.desc}</p>}
                  {item.extra&&<p style={{color:"rgba(255,255,255,0.25)",fontSize:11,marginTop:2,marginBottom:0}}>{item.extra}</p>}
                  <p style={{color:"#ef4444",fontWeight:900,fontSize:18,marginTop:6,marginBottom:0}}>{item.price}<span style={{fontSize:12,marginRight:1}}>₪</span></p>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                  {ic?(
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <button onClick={()=>rem(item.name)} style={{width:32,height:32,borderRadius:"50%",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.1)",color:"white",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"inherit"}}>−</button>
                      <span style={{fontWeight:900,fontSize:16,minWidth:20,textAlign:"center"}}>{ic.qty}</span>
                      <button onClick={()=>add(item.name,item.price)} style={{width:32,height:32,borderRadius:"50%",background:"#dc2626",border:"none",color:"white",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"inherit"}}>+</button>
                    </div>
                  ):(
                    <button onClick={()=>add(item.name,item.price)} style={{background:"rgba(220,38,38,0.15)",border:"1px solid rgba(220,38,38,0.4)",borderRadius:12,padding:"8px 18px",color:"#fca5a5",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit",transition:"all 0.2s"}}>הוסף +</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
      {cartOpen&&(
        <div style={{position:"fixed",inset:0,zIndex:50,display:"flex"}}>
          <div style={{flex:1,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(4px)"}} onClick={()=>setCartOpen(false)}/>
          <div dir="rtl" style={{width:340,background:"#0f0f0f",borderLeft:"1px solid rgba(255,255,255,0.08)",display:"flex",flexDirection:"column",height:"100%",fontFamily:"inherit"}}>
            <div style={{padding:"20px 16px",borderBottom:"1px solid rgba(255,255,255,0.06)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <h2 style={{margin:0,fontSize:18,fontWeight:900}}>🛒 העגלה שלי</h2>
              <button onClick={()=>setCartOpen(false)} style={{background:"rgba(255,255,255,0.06)",border:"none",color:"rgba(255,255,255,0.6)",fontSize:20,width:32,height:32,borderRadius:8,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"inherit"}}>×</button>
            </div>
            {cart.length===0?(
              <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12,color:"rgba(255,255,255,0.3)"}}>
                <span style={{fontSize:48}}>🛒</span>
                <p style={{margin:0,fontSize:14}}>העגלה ריקה</p>
              </div>
            ):(
              <>
                <div style={{flex:1,overflowY:"auto",padding:16,display:"flex",flexDirection:"column",gap:12}}>
                  {cart.map(item=>(
                    <div key={item.name} style={{display:"flex",alignItems:"center",gap:10,padding:"12px",background:"rgba(255,255,255,0.03)",borderRadius:12,border:"1px solid rgba(255,255,255,0.06)"}}>
                      <div style={{flex:1,minWidth:0}}>
                        <p style={{margin:0,fontSize:13,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.name}</p>
                        <p style={{margin:0,fontSize:11,color:"rgba(255,255,255,0.4)",marginTop:2}}>{item.price}₪ × {item.qty}</p>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <button onClick={()=>rem(item.name)} style={{width:26,height:26,borderRadius:"50%",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.1)",color:"white",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"inherit"}}>−</button>
                        <span style={{fontWeight:800,fontSize:14,minWidth:16,textAlign:"center"}}>{item.qty}</span>
                        <button onClick={()=>add(item.name,item.price)} style={{width:26,height:26,borderRadius:"50%",background:"rgba(220,38,38,0.3)",border:"1px solid rgba(220,38,38,0.4)",color:"white",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"inherit"}}>+</button>
                      </div>
                      <span style={{color:"#ef4444",fontWeight:800,fontSize:14,minWidth:45,textAlign:"left"}}>{item.price*item.qty}₪</span>
                    </div>
                  ))}
                </div>
                <div style={{padding:16,borderTop:"1px solid rgba(255,255,255,0.06)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                    <span style={{color:"rgba(255,255,255,0.5)",fontSize:14}}>סה"כ לתשלום</span>
                    <span style={{fontSize:28,fontWeight:900,color:"white"}}>{total}<span style={{fontSize:16,marginRight:2}}>₪</span></span>
                  </div>
                  <button style={{width:"100%",background:"linear-gradient(135deg,#dc2626,#b91c1c)",border:"none",borderRadius:16,padding:"16px",color:"white",fontWeight:900,fontSize:17,cursor:"pointer",fontFamily:"inherit",letterSpacing:0.5}}>המשך לתשלום ←</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
