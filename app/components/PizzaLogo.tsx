export default function PizzaLogo({size=40}:{size?:number}) {
  return (
    <svg width={size*3} height={size} viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="18" fill="#f97316"/>
      <circle cx="20" cy="20" r="15" fill="#dc2626"/>
      <circle cx="14" cy="14" r="2" fill="#fbbf24"/>
      <circle cx="24" cy="12" r="1.5" fill="#22c55e"/>
      <circle cx="18" cy="22" r="1.5" fill="#22c55e"/>
      <circle cx="26" cy="22" r="2" fill="#4ade80"/>
      <polygon points="20,20 38,14 38,26" fill="#f97316"/>
      <circle cx="13" cy="13" r="3" fill="white"/>
      <circle cx="13" cy="13" r="1.5" fill="#1e293b"/>
      <circle cx="12.5" cy="12.5" r="0.6" fill="white"/>
      <line x1="5" y1="20" x2="0" y2="18" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="5" y1="20" x2="0" y2="20" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="5" y1="20" x2="0" y2="22" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round"/>
      <text x="44" y="18" fontFamily="'Heebo',sans-serif" fontWeight="900" fontSize="11" fill="#dc2626">פיצה</text>
      <text x="44" y="30" fontFamily="'Heebo',sans-serif" fontWeight="900" fontSize="11" fill="#16a34a">קייטרינג</text>
      <text x="44" y="38" fontFamily="'Heebo',sans-serif" fontWeight="500" fontSize="6" fill="rgba(255,255,255,0.5)">גם בריייטילג אין על קייטרינג</text>
    </svg>
  );
}
