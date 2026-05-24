"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function OrderTypePage() {
  const router = useRouter();
  const [type, setType] = useState<"delivery"|"pickup"|null>(null);
  const [address, setAddress] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const proceed = () => {
    if (!type) return;
    const params = new URLSearchParams({ type, name, phone, ...(type==="delivery"?{address}:{}) });
    router.push(`/menu?${params.toString()}`);
  };
  return (
    <div dir="rtl" style={{minHeight:"100vh",background:"#111",color:"#fff",fontFamily:"'Heebo',sans-serif",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px 16px"}}>
      <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;700;900&display=swap" rel="stylesheet"/>
      <style>{`input{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:4px;padding:14px 16px;color:#fff;font-family:'Heebo',sans-serif;font-size:15px;width:100%;outline:none;transition:border 0.2s} input:focus{border-color:rgba(255,255,255,0.4)} input::placeholder{color:rgba(255,255,255,0.3)}`}</style>
      <div style={{maxWidth:440,width:"100%"}}>
        <p style={{fontSize:10,letterSpacing:4,color:"#c8102e",textTransform:"uppercase",marginBottom:12,textAlign:"center"}}>קייטרינג פיצה • אילת</p>
        <h1 style={{fontSize:32,fontWeight:900,letterSpacing:-1,textAlign:"center",marginBottom:8}}>איך תרצו לקבל?</h1>
        <p style={{fontSize:14,color:"rgba(255,255,255,0.4)",textAlign:"center",marginBottom:36}}>בחרו משלוח או איסוף עצמי</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:28}}>
          {[{id:"delivery",icon:"🛵",title:"משלוח",sub:"עד הבית"},{id:"pickup",icon:"🏪",title:"איסוף עצמי",sub:"מהמסעדה"}].map(opt=>(
            <button key={opt.id} onClick={()=>setType(opt.id as "delivery"|"pickup")} style={{background:type===opt.id?"rgba(200,16,46,0.15)":"rgba(255,255,255,0.04)",border:type===opt.id?"1px solid #c8102e":"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"24px 16px",cursor:"pointer",color:"#fff",transition:"all 0.2s",fontFamily:"inherit"}}>
              <p style={{fontSize:28,marginBottom:8}}>{opt.icon}</p>
              <p style={{fontSize:16,fontWeight:800,margin:0}}>{opt.title}</p>
              <p style={{fontSize:12,color:"rgba(255,255,255,0.4)",margin:"4px 0 0"}}>{opt.sub}</p>
            </button>
          ))}
        </div>
        {type&&(
          <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:24}}>
            <input placeholder="שם מלא" value={name} onChange={e=>setName(e.target.value)}/>
            <input placeholder="מספר טלפון" value={phone} onChange={e=>setPhone(e.target.value)} type="tel"/>
            {type==="delivery"&&<input placeholder="כתובת למשלוח" value={address} onChange={e=>setAddress(e.target.value)}/>}
          </div>
        )}
        <button onClick={proceed} disabled={!type||!name||!phone||(type==="delivery"&&!address)} style={{width:"100%",background:(!type||!name||!phone||(type==="delivery"&&!address))?"rgba(255,255,255,0.08)":"#c8102e",border:"none",borderRadius:4,padding:"16px",color:"#fff",fontSize:15,fontWeight:700,letterSpacing:1,cursor:(!type||!name||!phone||(type==="delivery"&&!address))?"not-allowed":"pointer",fontFamily:"inherit",transition:"all 0.2s"}}>
          המשך לתפריט ←
        </button>
      </div>
    </div>
  );
}
