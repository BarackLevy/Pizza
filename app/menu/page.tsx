"use client";
import { useState } from "react";
import Link from "next/link";
const menu: Record<string,{icon:string;items:{name:string;desc:string;price:number;img?:string;extra?:string}[]}> = {
"פיצות":{icon:"🍕",items:[{name:"מגש אישי S",desc:"מושלם לאחד",price:25,img:"/images/פיצה S.png",extra:"תוספת למנגש +4₪"},{name:"מגש זוגי M",desc:"לשניים",price:35,img:"/images/פיצה.png",extra:"תוספת למנגש +8₪"},{name:"מגש משפחתי L",desc:"לכל המשפחה",price:45,img:"/images/פיצה עם תוספות.png",extra:"תוספת למנגש +10₪"},{name:"מגש ענק XL",desc:"לרעבים האמיתיים",price:55,img:"/images/פיצה אלפרדו.png",extra:"תוספת למנגש +12₪"}]},
"זיווה":{icon:"🥙",items:[{name:"זיווה רגילה",desc:"גבינת מוצרלה",price:42,img:"/images/זיווה.png"},{name:"זיווה זיתים",desc:"מוצרלה וזיתים",price:42,img:"/images/זיווה.png"},{name:"זיווה פטריות",desc:"מוצרלה ופטריות",price:42,img:"/images/זיווה.png"},{name:"זיווה מעורבת",desc:"מוצרלה ובולגרית",price:42,img:"/images/זיווה.png"},{name:"זיווה יוונית",desc:"בולגרית, זיתים שחורים ובצל",price:42,img:"/images/זיווה עם ג'חנון.png"}]},
"האיטלקיה":{icon:"🫓",items:[{name:"רביולי תרד",desc:"ריקוטה ותרד",price:45,img:"/images/מוקרם.png"},{name:"רביולי ארטישוק",desc:"ארטישוק וגבינה",price:45,img:"/images/מוקרם.png"},{name:"רביולי ריקוטה",desc:"גבינת ריקוטה",price:45,img:"/images/מוקרם.png"},{name:"רביולי גבינות",desc:"4 גבינות ברוטב אלפרדו",price:45,img:"/images/מוקרם.png"},{name:"רביולי בטטה",desc:"גבינה ובטטה ברוטב אלפרדו",price:45,img:"/images/מוקרם.png"},{name:"רביולי פטריות",desc:"פטריות וגבינה ברוטב אלפרדו",price:45,img:"/images/מוקרם.png"}]},
"פסטות":{icon:"🍝",items:[{name:"פטוצ'יני / ספגטי / פנה",desc:"ברוטב עגבניות",price:30,img:"/images/מוקרם.png"},{name:"רוטב שמנת פטריות / רוזה מיקס",desc:"מומלץ!",price:40,img:"/images/מוקרם.png"},{name:"ניוקי מעורב",desc:"תפוח אדמה, תרד ובטטה",price:35,img:"/images/מוקרם.png"}]},
"מלאווח":{icon:"🥞",items:[{name:"מלאווח רגיל",desc:"עגבניות מגורדות וביצה",price:25,img:"/images/מלאווח מגולגל.png"},{name:"מלאווח תחינה",desc:"טחינה, עגבניות וביצה",price:25,img:"/images/מלאווח מגולגל.png"},{name:"מלאווח סוניסאי",desc:"ביצה, זיתים, טונה ועגבניות",price:30,img:"/images/מלאווח מגולגל.png"},{name:"מלאווח יווני",desc:"ביצה, בולגרית, זיתים שחורים",price:30,img:"/images/מלאווח מגולגל.png"},{name:"מלאווח הבית",desc:"ביצה, בולגרית, טונה, פטריות",price:30,img:"/images/מלאווח מגולגל.png"},{name:"⭐ מלאווח פיצה",desc:"תוספת אחת חינם",price:35,img:"/images/מלאווח פתוח.png"},{name:"מלאווח פתוח",desc:"רסק, ביצה ואריסה",price:30,img:"/images/מלאווח פתוח.png"},{name:"ג'חנון",desc:"עגבניות מגורדות, ביצה וחריף",price:25,img:"/images/זיווה עם ג'חנון.png"}]},
"סלטים":{icon:"🥗",items:[{name:"סלט יווני קטן",desc:"חסה, מלפפון, עגבניה, זיתים, תירס, בולגרית",price:40,img:"/images/סלט יווני עם בייגל הבית.png"},{name:"סלט יווני גדול",desc:"חסה, מלפפון, עגבניה, זיתים, תירס, בולגרית",price:50,img:"/images/סלט יווני עם בייגל הבית.png"},{name:"סלט טונה קטן",desc:"חסה, מלפפון, עגבניה, זיתים ירוקים, תירס וטונה",price:40,img:"/images/סלט טונה עם בייגל הבית.png"},{name:"סלט טונה גדול",desc:"חסה, מלפפון, עגבניה, זיתים ירוקים, תירס וטונה",price:50,img:"/images/סלט טונה עם בייגל הבית.png"},{name:"סלט ירקות קטן",desc:"חסה, מלפפון, עגבניה ובצל",price:40,img:"/images/סלט עם בייגל הבית.png"},{name:"סלט ירקות גדול",desc:"חסה, מלפפון, עגבניה ובצל",price:50,img:"/images/סלט עם בייגל הבית.png"}]},
"קינוחים":{icon:"🍰",items:[{name:"מאפה זיווה",desc:"נוטלה / שוקולד השחר",price:35,img:"/images/זיווה.png"},{name:"בלינצ'ס",desc:"2 יח׳, גבינה / שוקולד / נוטלה",price:20,img:"/images/בלינצ'ס.png"},{name:"סופלה שוקולד חם",desc:"טרי מהתנור",price:25,img:"/images/בלינצ'ס.png"},{name:"מלבי",desc:"קינוח חלבי קלאסי",price:12},{name:"עוגת גבינה פרורים",desc:"",price:12},{name:"פנקוטה",desc:"",price:12},{name:"סברינה",desc:"",price:15},{name:"מוס שוקולד",desc:"",price:12}]},
"לחם ומסבוסה":{icon:"🍞",items:[{name:"לחם שום S",desc:"עם מיקס גבינות",price:25,img:"/images/טוסט הבית.png"},{name:"לחם שום M",desc:"עם מיקס גבינות",price:35,img:"/images/טוסט הבית.png"},{name:"מסבוסה",desc:"תפו״א ביצה וגבינה / רוטב פיצה / ארבע גבינות / אלפרדו",price:32,img:"/images/טוסט מגולגל.png"}]}
};
export default function MenuPage() {
  const [cat, setCat] = useState("פיצות");
  const [cart, setCart] = useState<{name:string;price:number;qty:number}[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const add = (n:string,p:number) => setCart(prev=>{const e=prev.find(i=>i.name===n);return e?prev.map(i=>i.name===n?{...i,qty:i.qty+1}:i):[...prev,{name:n,price:p,qty:1}]});
  const rem = (n:string) => setCart(prev=>{const e=prev.find(i=>i.name===n);return e&&e.qty>1?prev.map(i=>i.name===n?{...i,qty:i.qty-1}:i):prev.filter(i=>i.name!==n)});
  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
  const totalQ = cart.reduce((s,i)=>s+i.qty,0);
  const current = menu[cat];
  return (
    <div style={{minHeight:"100vh",background:"#0a0a0a",paddingBottom:80}}>
      <header style={{position:"sticky",top:0,zIndex:40,background:"rgba(10,10,10,0.97)",borderBottom:"1px solid rgba(255,255,255,0.06)",backdropFilter:"blur(20px)"}}>
        <div style={{maxWidth:600,margin:"0 auto",padding:"12px 16px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <h1 style={{fontSize:18,fontWeight:900,margin:0}}>🍕 התפריט שלנו</h1>
            <button onClick={()=>setCartOpen(true)} style={{position:"relative",background:totalQ>0?"#dc2626":"rgba(255,255,255,0.08)",border:"none",borderRadius:12,padding:"8px 16px",color:"white",fontWeight:800,fontSize:13,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:6}}>
              🛒 {totalQ>0?`${totalQ} פריטים • ${total}₪`:"עגלה"}
              {totalQ>0&&<span style={{position:"absolute",top:-6,left:-6,background:"white",color:"#dc2626",fontSize:10,fontWeight:900,borderRadius:"50%",width:18,height:18,display:"flex",alignItems:"center",justifyContent:"center"}}>{totalQ}</span>}
            </button>
          </div>
          <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:2}}>
            {Object.entries(menu).map(([k,v])=>(
              <button key={k} onClick={()=>setCat(k)} style={{display:"flex",alignItems:"center",gap:4,padding:"7px 12px",borderRadius:10,fontSize:12,fontWeight:700,whiteSpace:"nowrap",cursor:"pointer",fontFamily:"inherit",border:"none",background:cat===k?"#dc2626":"rgba(255,255,255,0.06)",color:cat===k?"white":"rgba(255,255,255,0.5)"}}>
                <span>{v.icon}</span><span>{k}</span>
              </button>
            ))}
          </div>
        </div>
      </header>
      <main style={{maxWidth:600,margin:"0 auto",padding:"20px 16px"}}>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {current.items.map(item=>{
            const ic=cart.find(i=>i.name===item.name);
            const isSpecial=item.name.startsWith("⭐");
            return (
              <div key={item.name} style={{background:isSpecial?"rgba(220,38,38,0.08)":"rgba(255,255,255,0.03)",border:isSpecial?"1px solid rgba(220,38,38,0.3)":"1px solid rgba(255,255,255,0.06)",borderRadius:16,overflow:"hidden",display:"flex",alignItems:"stretch"}}>
                {item.img&&<div style={{width:90,flexShrink:0,background:"#111",overflow:"hidden"}}>
                  <img src={item.img} alt={item.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                </div>}
                <div style={{flex:1,padding:"12px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}>
                  <div style={{flex:1}}>
                    <p style={{fontWeight:800,fontSize:14,margin:0,color:isSpecial?"#fca5a5":"white"}}>{item.name}</p>
                    {item.desc&&<p style={{color:"rgba(255,255,255,0.4)",fontSize:11,margin:"3px 0 0"}}>{item.desc}</p>}
                    {item.extra&&<p style={{color:"rgba(255,255,255,0.25)",fontSize:10,margin:"2px 0 0"}}>{item.extra}</p>}
                    <p style={{color:"#ef4444",fontWeight:900,fontSize:17,margin:"6px 0 0"}}>{item.price}₪</p>
                  </div>
                  <div>
                    {ic?(
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <button onClick={()=>rem(item.name)} style={{width:30,height:30,borderRadius:"50%",background:"rgba(255,255,255,0.1)",border:"none",color:"white",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"inherit"}}>−</button>
                        <span style={{fontWeight:900,minWidth:18,textAlign:"center"}}>{ic.qty}</span>
                        <button onClick={()=>add(item.name,item.price)} style={{width:30,height:30,borderRadius:"50%",background:"#dc2626",border:"none",color:"white",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"inherit"}}>+</button>
                      </div>
                    ):(
                      <button onClick={()=>add(item.name,item.price)} style={{background:"rgba(220,38,38,0.15)",border:"1px solid rgba(220,38,38,0.4)",borderRadius:10,padding:"8px 14px",color:"#fca5a5",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>+ הוסף</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
      {cartOpen&&(
        <div style={{position:"fixed",inset:0,zIndex:50,display:"flex"}}>
          <div style={{flex:1,background:"rgba(0,0,0,0.7)"}} onClick={()=>setCartOpen(false)}/>
          <div dir="rtl" style={{width:320,background:"#0f0f0f",borderLeft:"1px solid rgba(255,255,255,0.08)",display:"flex",flexDirection:"column",height:"100%"}}>
            <div style={{padding:"16px",borderBottom:"1px solid rgba(255,255,255,0.06)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <h2 style={{margin:0,fontSize:17,fontWeight:900}}>🛒 העגלה שלי</h2>
              <button onClick={()=>setCartOpen(false)} style={{background:"rgba(255,255,255,0.06)",border:"none",color:"white",width:30,height:30,borderRadius:8,cursor:"pointer",fontSize:18,fontFamily:"inherit"}}>×</button>
            </div>
            {cart.length===0?(<div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",color:"rgba(255,255,255,0.3)",fontSize:14}}>העגלה ריקה 🛒</div>):(
              <>
                <div style={{flex:1,overflowY:"auto",padding:16,display:"flex",flexDirection:"column",gap:10}}>
                  {cart.map(item=>(
                    <div key={item.name} style={{display:"flex",alignItems:"center",gap:10,padding:12,background:"rgba(255,255,255,0.03)",borderRadius:12,border:"1px solid rgba(255,255,255,0.06)"}}>
                      <div style={{flex:1,minWidth:0}}>
                        <p style={{margin:0,fontSize:13,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.name}</p>
                        <p style={{margin:"2px 0 0",fontSize:11,color:"rgba(255,255,255,0.4)"}}>{item.price}₪ × {item.qty}</p>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <button onClick={()=>rem(item.name)} style={{width:24,height:24,borderRadius:"50%",background:"rgba(255,255,255,0.08)",border:"none",color:"white",cursor:"pointer",fontSize:14,fontFamily:"inherit"}}>−</button>
                        <span style={{fontWeight:800,fontSize:13,minWidth:14,textAlign:"center"}}>{item.qty}</span>
                        <button onClick={()=>add(item.name,item.price)} style={{width:24,height:24,borderRadius:"50%",background:"rgba(220,38,38,0.3)",border:"none",color:"white",cursor:"pointer",fontSize:14,fontFamily:"inherit"}}>+</button>
                      </div>
                      <span style={{color:"#ef4444",fontWeight:800,fontSize:13,minWidth:40,textAlign:"left"}}>{item.price*item.qty}₪</span>
                    </div>
                  ))}
                </div>
                <div style={{padding:16,borderTop:"1px solid rgba(255,255,255,0.06)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
                    <span style={{color:"rgba(255,255,255,0.5)"}}>סה"כ</span>
                    <span style={{fontSize:24,fontWeight:900}}>{total}₪</span>
                  </div>
                  <button style={{width:"100%",background:"#dc2626",border:"none",borderRadius:14,padding:14,color:"white",fontWeight:900,fontSize:16,cursor:"pointer",fontFamily:"inherit"}}>המשך לתשלום ←</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      <nav style={{position:"fixed",bottom:0,right:0,left:0,background:"rgba(15,15,15,0.98)",borderTop:"1px solid rgba(255,255,255,0.08)",display:"flex",zIndex:40}}>
        {[{href:"/",icon:"🏠",label:"בית"},{href:"/menu",icon:"🍕",label:"תפריט",active:true},{href:"/gallery",icon:"📸",label:"גלריה"},{href:"/contact",icon:"📞",label:"צור קשר"}].map(item=>(
          <a key={item.href} href={item.href} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"10px 0",textDecoration:"none",color:item.active?"#ef4444":"rgba(255,255,255,0.4)",fontSize:11,fontWeight:600,gap:3}}>
            <span style={{fontSize:20}}>{item.icon}</span>
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}
