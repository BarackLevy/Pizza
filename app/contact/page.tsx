export default function ContactPage() {
  return (
    <div style={{minHeight:"100vh",background:"#0a0a0a",paddingBottom:80}}>
      <header style={{padding:"16px",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
        <h1 style={{fontSize:20,fontWeight:900,margin:0,textAlign:"center"}}>📞 צור קשר</h1>
      </header>
      <main style={{maxWidth:500,margin:"0 auto",padding:"24px 16px",display:"flex",flexDirection:"column",gap:12}}>
        <a href="tel:0866338384" style={{display:"flex",alignItems:"center",gap:16,padding:"20px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:20,textDecoration:"none",color:"white"}}>
          <span style={{fontSize:36}}>📞</span>
          <div><p style={{margin:0,fontWeight:800,fontSize:16}}>התקשרו אלינו</p><p style={{margin:"2px 0 0",color:"#ef4444",fontWeight:700,fontSize:15}}>08-633-83-84</p></div>
        </a>
        <a href="https://wa.me/97286338384" target="_blank" style={{display:"flex",alignItems:"center",gap:16,padding:"20px",background:"rgba(37,211,102,0.06)",border:"1px solid rgba(37,211,102,0.2)",borderRadius:20,textDecoration:"none",color:"white"}}>
          <span style={{fontSize:36}}>💬</span>
          <div><p style={{margin:0,fontWeight:800,fontSize:16}}>WhatsApp</p><p style={{margin:"2px 0 0",color:"#25d366",fontWeight:600,fontSize:13}}>שלחו הודעה עכשיו</p></div>
        </a>
        <a href="https://waze.com/ul?q=קייטרינג+פיצה+אילת" target="_blank" style={{display:"flex",alignItems:"center",gap:16,padding:"20px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:20,textDecoration:"none",color:"white"}}>
          <span style={{fontSize:36}}>🗺️</span>
          <div><p style={{margin:0,fontWeight:800,fontSize:16}}>נווט אלינו ב-Waze</p><p style={{margin:"2px 0 0",color:"rgba(255,255,255,0.4)",fontSize:13}}>אילת</p></div>
        </a>
        <a href="https://instagram.com/pizza_catering_eilat" target="_blank" style={{display:"flex",alignItems:"center",gap:16,padding:"20px",background:"rgba(225,48,108,0.06)",border:"1px solid rgba(225,48,108,0.2)",borderRadius:20,textDecoration:"none",color:"white"}}>
          <span style={{fontSize:36}}>📸</span>
          <div><p style={{margin:0,fontWeight:800,fontSize:16}}>אינסטגרם</p><p style={{margin:"2px 0 0",color:"#e1306c",fontWeight:600,fontSize:13}}>@pizza_catering_eilat</p></div>
        </a>
        <div style={{padding:"20px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:20}}>
          <p style={{margin:0,fontWeight:800,fontSize:16}}>⏰ שעות פעילות</p>
          <p style={{margin:"8px 0 0",color:"rgba(255,255,255,0.6)",fontSize:14}}>ראשון–חמישי: 12:00–23:00</p>
          <p style={{margin:"4px 0 0",color:"rgba(255,255,255,0.6)",fontSize:14}}>שישי–שבת: 12:00–00:00</p>
        </div>
      </main>
      <nav style={{position:"fixed",bottom:0,right:0,left:0,background:"rgba(15,15,15,0.98)",borderTop:"1px solid rgba(255,255,255,0.08)",display:"flex",zIndex:40}}>
        {[{href:"/",icon:"🏠",label:"בית"},{href:"/menu",icon:"🍕",label:"תפריט"},{href:"/gallery",icon:"📸",label:"גלריה"},{href:"/contact",icon:"📞",label:"צור קשר",active:true}].map(item=>(
          <a key={item.href} href={item.href} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"10px 0",textDecoration:"none",color:item.active?"#ef4444":"rgba(255,255,255,0.4)",fontSize:11,fontWeight:600,gap:3}}>
            <span style={{fontSize:20}}>{item.icon}</span>
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}
