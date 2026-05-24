"use client";
import { useState } from "react";
const menu: Record<string,{icon:string;items:{name:string;desc:string;price:number;extra?:string}[]}> = {
"פיצות":{icon:"🍕",items:[{name:"מגש אישי S",desc:"מושלם לאחד",price:25,extra:"תוספת למנגש +4₪"},{name:"מגש זוגי M",desc:"לשניים",price:35,extra:"תוספת למנגש +8₪"},{name:"מגש משפחתי L",desc:"לכל המשפחה",price:45,extra:"תוספת למנגש +10₪"},{name:"מגש ענק XL",desc:"לרעבים האמיתיים",price:55,extra:"תוספת למנגש +12₪"}]},
"זיווה":{icon:"🥙",items:[{name:"זיווה רגילה",desc:"במילוי גבינת מוצרלה",price:42},{name:"זיווה זיתים",desc:"מוצרלה וזיתים",price:42},{name:"זיווה פטריות",desc:"מוצרלה ופטריות",price:42},{name:"זיווה מעורבת",desc:"מוצרלה ובולגרית",price:42},{name:"זיווה יוונית",desc:"בולגרית, זיתים שחורים ובצל",price:42}]},
"האיטלקיה":{icon:"🫓",items:[{name:"רביולי תרד",desc:"ריקוטה ותרד",price:45},{name:"רביולי ארטישוק",desc:"ארטישוק וגבינה",price:45},{name:"רביולי ריקוטה",desc:"גבינת ריקוטה",price:45},{name:"רביולי פרמזן",desc:"גבינת פרמזן",price:45},{name:"רביולי גבינות",desc:"4 גבינות ברוטב אלפרדו",price:45},{name:"רביולי בטטה",desc:"גבינה ובטטה ברוטב אלפרדו",price:45},{name:"רביולי פטריות",desc:"פטריות וגבינה ברוטב אלפרדו",price:45}]},
"פסטות":{icon:"🍝",items:[{name:"פטוצ'יני / ספגטי / פנה",desc:"ברוטב עגבניות",price:30},{name:"רוטב שמנת פטריות / רוזה מיקס",desc:"מומלץ!",price:40},{name:"תפוח אדמה",desc:"ברוטב אלפרדו",price:35},{name:"ניוקי תפוח אדמה",desc:"ברוטב אלפרדו",price:35},{name:"ניוקי מעורב",desc:"תפוח אדמה, תרד ובטטה ברוטב רוזה",price:35}]},
"מלאווח":{icon:"🥞",items:[{name:"מלאווח רגיל",desc:"עגבניות מגורדות וביצה",price:25},{name:"מלאווח תחינה",desc:"טחינה, עגבניות וביצה",price:25},{name:"מלאווח סוניסאי",desc:"ביצה, זיתים, טונה ועגבניות",price:30},{name:"מלאווח יווני",desc:"ביצה, בולגרית, זיתים שחורים וזעתר",price:30},{name:"מלאווח הבית",desc:"ביצה, בולגרית, טונה, פטריות ובצל",price:30},{name:"⭐ מלאווח פיצה",desc:"תוספת אחת חינם מתוספות הפיצה",price:35},{name:"מלאווח ביצה עין",desc:"2 ביצים וגבינת מוצרלה",price:35},{name:"מלאווח הביתה",desc:"אפוי עם ביצה",price:35},{name:"מלאווח פתוח",desc:"רסק, ביצה ואריסה",price:30},{name:"ג'חנון",desc:"עגבניות מגורדות, ביצה וחריף",price:25}]},
"סלטים":{icon:"🥗",items:[{name:"סלט יווני קטן",desc:"חסה, מלפפון, עגבניה, זיתים שחורים, תירס, בולגרית וזעתר",price:40},{name:"סלט יווני גדול",desc:"חסה, מלפפון, עגבניה, זיתים שחורים, תירס, בולגרית וזעתר",price:50},{name:"סלט טונה קטן",desc:"חסה, מלפפון, עגבניה, זיתים ירוקים, תירס וטונה",price:40},{name:"סלט טונה גדול",desc:"חסה, מלפפון, עגבניה, זיתים ירוקים, תירס וטונה",price:50},{name:"סלט ירקות קטן",desc:"חסה, מלפפון, עגבניה ובצל",price:40},{name:"סלט ירקות גדול",desc:"חסה, מלפפון, עגבניה ובצל",price:50}]},
"קינוחים":{icon:"🍰",items:[{name:"מאפה זיווה",desc:"נוטלה / שוקולד השחר",price:35},{name:"בלינצ'ס",desc:"2 יח׳, גבינה / שוקולד / נוטלה",price:20},{name:"סופלה שוקולד חם",desc:"טרי מהתנור",price:25},{name:"מלבי",desc:"קינוח חלבי קלאסי",price:12},{name:"עוגת גבינה פרורים",desc:"",price:12},{name:"עוגת גבינה אוקמנית",desc:"",price:12},{name:"פנקוטה",desc:"",price:12},{name:"סברינה",desc:"",price:15},{name:"בואריה",desc:"",price:12},{name:"מוס ריבת חלב",desc:"",price:12},{name:"הקאצ'ה",desc:"",price:12},{name:"מוס שוקולד",desc:"",price:12}]},
"לחם ומסבוסה":{icon:"🍞",items:[{name:"לחם שום S",desc:"עם מיקס גבינות",price:25},{name:"לחם שום M",desc:"עם מיקס גבינות",price:35},{name:"מסבוסה",desc:"תפו״א ביצה וגבינה / רוטב פיצה / ארבע גבינות / אלפרדו",price:32}]}
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
    <div dir="rtl" className="min-h-screen bg-neutral-950 text-white" style={{fontFamily:"'Heebo',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;700;900&display=swap" rel="stylesheet"/>
      <header className="sticky top-0 z-40 bg-neutral-950/95 backdrop-blur border-b border-neutral-800 px-4 py-3">
        <div className="flex justify-between items-center mb-3">
          <div><h1 className="text-xl font-black text-white">קייטרינג פיצה 🍕</h1><p className="text-xs text-red-400">אילת • משלוחים ואיסוף עצמי</p></div>
          <button onClick={()=>setCartOpen(true)} className="relative bg-red-600 hover:bg-red-500 rounded-xl px-4 py-2 font-bold text-sm flex items-center gap-1">
            🛒 עגלה {totalQ>0&&<span className="absolute -top-2 -left-2 bg-white text-red-600 text-xs font-black rounded-full w-5 h-5 flex items-center justify-center">{totalQ}</span>}
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {Object.entries(menu).map(([k,v])=>(
            <button key={k} onClick={()=>setCat(k)} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${cat===k?"bg-red-600 text-white":"bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white"}`}>
              <span>{v.icon}</span><span>{k}</span>
            </button>
          ))}
        </div>
      </header>
      <main className="max-w-xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-black mb-4">{current.icon} {cat}</h2>
        <div className="flex flex-col gap-3">
          {current.items.map(item=>{
            const ic=cart.find(i=>i.name===item.name);
            return (
              <div key={item.name} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex justify-between items-center gap-3">
                <div className="flex-1">
                  <p className="font-bold text-sm">{item.name}</p>
                  {item.desc&&<p className="text-neutral-500 text-xs mt-0.5">{item.desc}</p>}
                  {item.extra&&<p className="text-neutral-600 text-xs mt-0.5">{item.extra}</p>}
                  <p className="text-red-400 font-black text-base mt-1">{item.price}₪</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {ic?(<><button onClick={()=>rem(item.name)} className="w-8 h-8 bg-neutral-700 hover:bg-neutral-600 rounded-full font-bold flex items-center justify-center">−</button><span className="w-5 text-center font-bold">{ic.qty}</span><button onClick={()=>add(item.name,item.price)} className="w-8 h-8 bg-red-600 hover:bg-red-500 rounded-full font-bold flex items-center justify-center">+</button></>):(<button onClick={()=>add(item.name,item.price)} className="bg-red-600 hover:bg-red-500 rounded-xl px-4 py-2 text-sm font-bold transition-colors">הוסף</button>)}
                </div>
              </div>
            );
          })}
        </div>
      </main>
      {cartOpen&&(
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/60" onClick={()=>setCartOpen(false)}/>
          <div dir="rtl" className="w-80 bg-neutral-950 border-r border-neutral-800 flex flex-col h-full">
            <div className="p-4 border-b border-neutral-800 flex justify-between items-center">
              <h2 className="text-lg font-black">העגלה שלי</h2>
              <button onClick={()=>setCartOpen(false)} className="text-neutral-400 hover:text-white text-2xl">×</button>
            </div>
            {cart.length===0?(<div className="flex-1 flex items-center justify-center text-neutral-500 text-sm">העגלה ריקה</div>):(
              <>
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                  {cart.map(item=>(
                    <div key={item.name} className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{item.name}</p><p className="text-xs text-neutral-500">{item.price}₪ × {item.qty}</p></div>
                      <div className="flex items-center gap-1"><button onClick={()=>rem(item.name)} className="w-7 h-7 bg-neutral-800 rounded-full flex items-center justify-center font-bold">−</button><span className="w-4 text-center text-sm font-bold">{item.qty}</span><button onClick={()=>add(item.name,item.price)} className="w-7 h-7 bg-neutral-800 rounded-full flex items-center justify-center font-bold">+</button></div>
                      <span className="text-red-400 font-bold text-sm w-12 text-left">{item.price*item.qty}₪</span>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-neutral-800">
                  <div className="flex justify-between mb-3"><span className="text-neutral-400">סה"כ</span><span className="text-2xl font-black">{total}₪</span></div>
                  <button className="w-full bg-red-600 hover:bg-red-500 rounded-2xl py-4 font-black text-lg transition-colors">המשך לתשלום →</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
