import Link from "next/link";
const images = [
  {src:"/images/פיצה S.png",title:"פיצה אישית"},
  {src:"/images/פיצה עם תוספות.png",title:"פיצה עם תוספות"},
  {src:"/images/פיצה אלפרדו.png",title:"פיצה אלפרדו"},
  {src:"/images/זיווה.png",title:"זיווה"},
  {src:"/images/זיווה עם ג'חנון.png",title:"זיווה עם ג'חנון"},
  {src:"/images/סלט יווני עם בייגל הבית.png",title:"סלט יווני"},
  {src:"/images/סלט טונה עם בייגל הבית.png",title:"סלט טונה"},
  {src:"/images/סלט עם בייגל הבית.png",title:"סלט ירקות"},
  {src:"/images/מלאווח מגולגל.png",title:"מלאווח מגולגל"},
  {src:"/images/מלאווח פתוח.png",title:"מלאווח פתוח"},
  {src:"/images/בלינצ'ס.png",title:"בלינצ'ס"},
  {src:"/images/בלינצ'סים.png",title:"בלינצ'סים"},
  {src:"/images/מוקרם.png",title:"מוקרם"},
  {src:"/images/טוסט הבית.png",title:"טוסט הבית"},
  {src:"/images/טוסט מגולגל.png",title:"טוסט מגולגל"},
];
export default function GalleryPage() {
  return (
    <div style={{minHeight:"100vh",background:"#0a0a0a",paddingBottom:80}}>
      <header style={{padding:"16px",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
        <h1 style={{fontSize:20,fontWeight:900,margin:0,textAlign:"center"}}>📸 הגלריה שלנו</h1>
        <p style={{textAlign:"center",color:"rgba(255,255,255,0.4)",fontSize:13,margin:"4px 0 0"}}>טעים בעיניים, טעים בפה</p>
      </header>
      <main style={{maxWidth:600,margin:"0 auto",padding:"16px"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {images.map((img,i)=>(
            <div key={i} style={{borderRadius:16,overflow:"hidden",background:"#111",border:"1px solid rgba(255,255,255,0.06)",aspectRatio:"1"}}>
              <img src={img.src} alt={img.title} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
            </div>
          ))}
        </div>
      </main>
      <nav style={{position:"fixed",bottom:0,right:0,left:0,background:"rgba(15,15,15,0.98)",borderTop:"1px solid rgba(255,255,255,0.08)",display:"flex",zIndex:40}}>
        {[{href:"/",icon:"🏠",label:"בית"},{href:"/menu",icon:"🍕",label:"תפריט"},{href:"/gallery",icon:"📸",label:"גלריה",active:true},{href:"/contact",icon:"📞",label:"צור קשר"}].map(item=>(
          <a key={item.href} href={item.href} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"10px 0",textDecoration:"none",color:item.active?"#ef4444":"rgba(255,255,255,0.4)",fontSize:11,fontWeight:600,gap:3}}>
            <span style={{fontSize:20}}>{item.icon}</span>
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}
