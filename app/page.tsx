"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
const T = {
  he:{nav:["בית","תפריט","גלריה","צור קשר"],order:"הזמן עכשיו",pickup:"איסוף עצמי",delivery:"משלוח",waze:"נווט אלינו",phone:"התקשר",hours:"שעות פעילות",h1:"א׳–ה׳  15:00 – 23:45",h2:"שישי–שבת  12:00 – 00:00",slogan:"קייטרינג פיצה",sub:"אילת • מטבח ביתי עם אהבה"},
  en:{nav:["Home","Menu","Gallery","Contact"],order:"Order Now",pickup:"Pickup",delivery:"Delivery",waze:"Navigate",phone:"Call",hours:"Hours",h1:"Sun–Thu  15:00 – 23:45",h2:"Fri–Sat  12:00 – 00:00",slogan:"Pizza Catering",sub:"Eilat • Homemade with Love"},
  ru:{nav:["Главная","Меню","Галерея","Контакты"],order:"Заказать",pickup:"Самовывоз",delivery:"Доставка",waze:"Маршрут",phone:"Позвонить",hours:"Часы",h1:"Вс–Чт  15:00 – 23:45",h2:"Пт–Сб  12:00 – 00:00",slogan:"Пицца Кейтеринг",sub:"Эйлат • Готовим с любовью"}
};
const links = ["/","/menu","/gallery","/contact"];
export default function Home() {
  const [lang,setLang]=useState<"he"|"en"|"ru">("he");
  const [scrolled,setScrolled]=useState(false);
  const txt=T[lang];
  const rtl=lang==="he";
  useEffect(()=>{
    const fn=()=>setScrolled(window.scrollY>40);
    window.addEventListener("scroll",fn);
    return ()=>window.removeEventListener("scroll",fn);
  },[]);
  return (
    <div dir={rtl?"rtl":"ltr"} style={{minHeight:"100vh",background:"#111",color:"#fff",fontFamily:"'Heebo',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;700;900&display=swap" rel="stylesheet"/>
      <style>{`*{margin:0;padding:0;box-sizing:border-box} a{text-decoration:none;color:inherit} button{cursor:pointer;font-family:inherit} .nav-link{position:relative;font-size:13px;font-weight:500;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,0.7);transition:color 0.2s} .nav-link:hover{color:#fff} .nav-link::after{content:'';position:absolute;bottom:-4px;left:0;right:0;height:1px;background:#c8102e;transform:scaleX(0);transition:transform 0.2s} .nav-link:hover::after{transform:scaleX(1)} .btn-primary{background:#c8102e;color:#fff;border:none;padding:14px 32px;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;border-radius:2px;transition:background 0.2s} .btn-primary:hover{background:#a00d25} .btn-secondary{background:transparent;color:#fff;border:1px solid rgba(255,255,255,0.3);padding:13px 28px;font-size:13px;font-weight:500;letter-spacing:1.5px;text-transform:uppercase;border-radius:2px;transition:all 0.2s} .btn-secondary:hover{border-color:#fff;background:rgba(255,255,255,0.05)}`}</style>
      <header style={{position:"fixed",top:0,right:0,left:0,zIndex:100,transition:"all 0.3s",background:scrolled?"rgba(17,17,17,0.97)":"transparent",borderBottom:scrolled?"1px solid rgba(255,255,255,0.08)":"none",backdropFilter:scrolled?"blur(12px)":"none"}}>
        <div style={{maxWidth:1100,margin:"0 auto",padding:"0 32px",height:64,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",flexDirection:"column",lineHeight:1}}>
            <span style={{fontSize:18,fontWeight:900,letterSpacing:-0.5,color:"#fff"}}>קייטרינג פיצה</span>
            <span style={{fontSize:9,fontWeight:400,letterSpacing:3,color:"#c8102e",textTransform:"uppercase",marginTop:2}}>EILAT</span>
          </div>
          <nav style={{display:"flex",gap:32,alignItems:"center"}}>
            {txt.nav.map((label,i)=>(
              <a key={i} href={links[i]} className="nav-link">{label}</a>
            ))}
          </nav>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {(["he","en","ru"] as const).map(l=>(
              <button key={l} onClick={()=>setLang(l)} style={{background:"transparent",border:"none",color:lang===l?"#fff":"rgba(255,255,255,0.35)",fontSize:11,fontWeight:lang===l?700:400,letterSpacing:1,padding:"4px 6px",transition:"color 0.2s",textTransform:"uppercase"}}>
                {l==="he"?"עב":l==="en"?"EN":"RU"}
              </button>
            ))}
          </div>
        </div>
      </header>
      <div style={{position:"relative",height:"100vh",overflow:"hidden"}}>
        <img src="/images/פיצה עם תוספות.png" alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,rgba(17,17,17,0.85) 0%,rgba(17,17,17,0.5) 50%,rgba(17,17,17,0.3) 100%)"}}/>
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:rtl?"flex-end":"flex-start",padding:"0 80px"}}>
          <div style={{maxWidth:520}}>
            <p style={{fontSize:10,fontWeight:500,letterSpacing:5,color:"#c8102e",textTransform:"uppercase",marginBottom:16}}>אילת • EILAT</p>
            <h1 style={{fontSize:58,fontWeight:900,lineHeight:1.0,letterSpacing:-2,marginBottom:16}}>{txt.slogan}</h1>
            <p style={{fontSize:15,fontWeight:300,color:"rgba(255,255,255,0.65)",letterSpacing:0.5,marginBottom:40,lineHeight:1.7}}>{txt.sub}</p>
            <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
              <Link href="/menu" className="btn-primary">{txt.order}</Link>
              <a href="https://waze.com/ul?q=קייטרינג+פיצה+אילת" target="_blank" className="btn-secondary">{txt.waze}</a>
              <a href="tel:0866338384" className="btn-secondary">{txt.phone}</a>
            </div>
          </div>
        </div>
        <div style={{position:"absolute",bottom:40,left:"50%",transform:"translateX(-50%)",display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
          <span style={{fontSize:10,letterSpacing:3,color:"rgba(255,255,255,0.4)",textTransform:"uppercase"}}>scroll</span>
          <div style={{width:1,height:40,background:"linear-gradient(to bottom,rgba(255,255,255,0.4),transparent)"}}/>
        </div>
      </div>
      <div style={{background:"#111",padding:"80px 32px"}}>
        <div style={{maxWidth:900,margin:"0 auto",display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:1,background:"rgba(255,255,255,0.06)"}}>
          {[{icon:"📍",title:"אילת",sub:"טיילת העיר"},{icon:"⏰",title:txt.hours,sub:`${txt.h1}\n${txt.h2}`},{icon:"📞",title:"08-633-83-84",sub:"הזמנות וקייטרינג"}].map((item,i)=>(
            <div key={i} style={{background:"#111",padding:"40px 32px",textAlign:"center"}}>
              <p style={{fontSize:22,marginBottom:12}}>{item.icon}</p>
              <p style={{fontSize:13,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>{item.title}</p>
              <p style={{fontSize:12,color:"rgba(255,255,255,0.45)",lineHeight:1.8,whiteSpace:"pre-line"}}>{item.sub}</p>
            </div>
          ))}
        </div>
      </div>
      <div style={{background:"#0d0d0d",padding:"80px 32px"}}>
        <div style={{maxWidth:900,margin:"0 auto"}}>
          <p style={{fontSize:10,letterSpacing:4,color:"#c8102e",textTransform:"uppercase",marginBottom:16,textAlign:"center"}}>מהתפריט שלנו</p>
          <h2 style={{fontSize:36,fontWeight:900,letterSpacing:-1,textAlign:"center",marginBottom:48}}>המנות המובילות</h2>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:2}}>
            {[{img:"/images/פיצה עם תוספות.png",title:"פיצות"},{img:"/images/זיווה.png",title:"זיווה"},{img:"/images/מלאווח מגולגל.png",title:"מלאווח"},{img:"/images/סלט יווני עם בייגל הבית.png",title:"סלטים"},{img:"/images/בלינצ'ס.png",title:"קינוחים"},{img:"/images/מוקרם.png",title:"האיטלקיה"}].map((item,i)=>(
              <Link key={i} href="/menu" style={{position:"relative",aspectRatio:"1",overflow:"hidden",display:"block"}}>
                <img src={item.img} alt={item.title} style={{width:"100%",height:"100%",objectFit:"cover",transition:"transform 0.4s"}} onMouseOver={e=>(e.currentTarget.style.transform="scale(1.05)")} onMouseOut={e=>(e.currentTarget.style.transform="scale(1)")}/>
                <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.7),transparent)",display:"flex",alignItems:"flex-end",padding:16}}>
                  <span style={{fontSize:14,fontWeight:700,letterSpacing:1,textTransform:"uppercase"}}>{item.title}</span>
                </div>
              </Link>
            ))}
          </div>
          <div style={{textAlign:"center",marginTop:40}}>
            <Link href="/menu" className="btn-primary">{txt.order}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
