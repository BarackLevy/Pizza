"use client";
import { useState, useEffect } from "react";
import { fetchMenu } from "@/lib/menu";
import type { CategoryWithProducts } from "@/lib/menu";
import type { Product } from "@/types/menu";
import { useCart, lineUnitPrice } from "@/lib/cart-context";
import PizzaCustomizer from "@/components/PizzaCustomizer";
import AddonCustomizer from "@/components/AddonCustomizer";
import ItalianBuilder from "@/components/ItalianBuilder";
import { fetchProductsWithModifiers } from "@/lib/addon-modifiers";

const PIZZA_CATEGORY   = "פיצות";
const ITALIAN_CATEGORY = "האיטלקיה";

const CATEGORY_ICONS: Record<string, string> = {
  "פיצות":       "🍕",
  "זיווה":        "🥙",
  "האיטלקיה":    "🫓",
  "פסטות":       "🍝",
  "מלאווח":      "🥞",
  "סלטים":       "🥗",
  "קינוחים":     "🍰",
  "לחם ומסבוסה": "🍞",
};

export default function MenuPage() {
  const [categories,            setCategories]            = useState<CategoryWithProducts[]>([]);
  const [productsWithModifiers, setProductsWithModifiers] = useState<Set<string>>(new Set());
  const [loading,               setLoading]               = useState(true);
  const [error,                 setError]                 = useState(false);
  const [cat,                   setCat]                   = useState("");
  const [cartOpen,   setCartOpen]   = useState(false);

  // null = sheet closed; a Product = sheet open for that product
  const [customizerProduct, setCustomizerProduct] = useState<Product | null>(null);
  const [addonProduct,      setAddonProduct]      = useState<Product | null>(null);

  const cart = useCart();

  function load() {
    setLoading(true);
    setError(false);
    Promise.all([fetchMenu(), fetchProductsWithModifiers()])
      .then(([data, withMods]) => {
        setCategories(data);
        setProductsWithModifiers(withMods);
        if (data.length > 0) setCat(data[0].name_he);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  const current        = categories.find((c) => c.name_he === cat);
  const pizzaProducts  = categories.find((c) => c.name_he === PIZZA_CATEGORY)?.products ?? [];
  const isPizzaCat     = cat === PIZZA_CATEGORY;
  const isItalianCat   = cat === ITALIAN_CATEGORY;

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>טוען תפריט...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div dir="rtl" style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 40, marginBottom: 16 }}>📡</p>
          <p style={{ color: "white", fontWeight: 800, fontSize: 17, margin: "0 0 8px" }}>
            לא הצלחנו לטעון את התפריט
          </p>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, margin: "0 0 28px" }}>
            בדוק את החיבור לאינטרנט ונסה שוב
          </p>
          <button
            onClick={load}
            style={{
              background: "#dc2626", border: "none", borderRadius: 14,
              padding: "13px 36px", color: "white", fontWeight: 900,
              fontSize: 15, cursor: "pointer", fontFamily: "inherit",
            }}
          >
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", paddingBottom: 80 }}>

      {/* ── Sticky header ── */}
      <header style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(10,10,10,0.97)", borderBottom: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(20px)" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "12px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <h1 style={{ fontSize: 18, fontWeight: 900, margin: 0 }}>🍕 התפריט שלנו</h1>
            <button
              onClick={() => setCartOpen(true)}
              style={{
                position: "relative", background: cart.itemCount > 0 ? "#dc2626" : "rgba(255,255,255,0.08)",
                border: "none", borderRadius: 12, padding: "8px 16px", color: "white",
                fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              🛒 {cart.itemCount > 0 ? `${cart.itemCount} פריטים • ${cart.total}₪` : "עגלה"}
              {cart.itemCount > 0 && (
                <span style={{ position: "absolute", top: -6, left: -6, background: "white", color: "#dc2626", fontSize: 10, fontWeight: 900, borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {cart.itemCount}
                </span>
              )}
            </button>
          </div>

          {/* Category tabs */}
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setCat(category.name_he)}
                style={{
                  display: "flex", alignItems: "center", gap: 4,
                  padding: "7px 12px", borderRadius: 10, fontSize: 12, fontWeight: 700,
                  whiteSpace: "nowrap", cursor: "pointer", fontFamily: "inherit", border: "none",
                  background: cat === category.name_he ? "#dc2626" : "rgba(255,255,255,0.06)",
                  color:      cat === category.name_he ? "white"   : "rgba(255,255,255,0.5)",
                }}
              >
                <span>{CATEGORY_ICONS[category.name_he] ?? "🍽️"}</span>
                <span>{category.name_he}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Product list / inline builder ── */}
      <main style={{ maxWidth: 600, margin: "0 auto", padding: "20px 16px" }}>
        {isItalianCat && current?.products[0] ? (
          // האיטלקיה: render the builder inline — no card, no sheet
          <ItalianBuilder product={current.products[0]} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(current?.products ?? []).map((item) => {
              const ic        = cart.items.find((i) => i.product_id === item.id);
              const isSpecial = item.is_featured;

              return (
                <div
                  key={item.id}
                  style={{
                    background:   isSpecial ? "rgba(220,38,38,0.08)" : "rgba(255,255,255,0.03)",
                    border:       isSpecial ? "1px solid rgba(220,38,38,0.3)" : "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 16,
                    overflow:     "hidden",
                    display:      "flex",
                    alignItems:   "stretch",
                  }}
                >
                  {item.image_url && (
                    <div style={{ width: 90, flexShrink: 0, background: "#111", overflow: "hidden" }}>
                      <img src={item.image_url} alt={item.name_he} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  )}
                  <div style={{ flex: 1, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 800, fontSize: 14, margin: 0, color: isSpecial ? "#fca5a5" : "white" }}>
                        {item.name_he}
                      </p>
                      {item.description && (
                        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, margin: "3px 0 0" }}>
                          {item.description}
                        </p>
                      )}
                      <p style={{ color: "#ef4444", fontWeight: 900, fontSize: 17, margin: "6px 0 0" }}>
                        {item.base_price}₪
                      </p>
                    </div>

                    {/* Action button — 3-way routing */}
                    <div>
                      {isPizzaCat ? (
                        // Pizza → open PizzaCustomizer
                        <button
                          onClick={() => setCustomizerProduct(item)}
                          style={{
                            background:   ic ? "#dc2626" : "rgba(220,38,38,0.15)",
                            border:       ic ? "1px solid #dc2626" : "1px solid rgba(220,38,38,0.4)",
                            borderRadius: 10,
                            padding:      "8px 14px",
                            color:        ic ? "white" : "#fca5a5",
                            fontWeight:   700,
                            fontSize:     12,
                            cursor:       "pointer",
                            fontFamily:   "inherit",
                            whiteSpace:   "nowrap",
                          }}
                        >
                          {ic ? `🍕 ${ic.quantity}` : "+ הוסף"}
                        </button>
                      ) : productsWithModifiers.has(item.id) ? (
                        // Non-pizza with modifier groups → open AddonCustomizer
                        <button
                          onClick={() => setAddonProduct(item)}
                          style={{
                            background:   ic ? "#dc2626" : "rgba(220,38,38,0.15)",
                            border:       ic ? "1px solid #dc2626" : "1px solid rgba(220,38,38,0.4)",
                            borderRadius: 10,
                            padding:      "8px 14px",
                            color:        ic ? "white" : "#fca5a5",
                            fontWeight:   700,
                            fontSize:     12,
                            cursor:       "pointer",
                            fontFamily:   "inherit",
                            whiteSpace:   "nowrap",
                          }}
                        >
                          {ic ? `✓ ${ic.quantity}` : "+ הוסף"}
                        </button>
                      ) : (
                        // Plain item → inline +/- or one-tap add
                        ic ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <button
                              onClick={() => cart.remove(item.id)}
                              style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "none", color: "white", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}
                            >−</button>
                            <span style={{ fontWeight: 900, minWidth: 18, textAlign: "center" }}>{ic.quantity}</span>
                            <button
                              onClick={() => cart.add({ product_id: item.id, name_he: item.name_he, unit_price: item.base_price })}
                              style={{ width: 30, height: 30, borderRadius: "50%", background: "#dc2626", border: "none", color: "white", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}
                            >+</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => cart.add({ product_id: item.id, name_he: item.name_he, unit_price: item.base_price })}
                            style={{ background: "rgba(220,38,38,0.15)", border: "1px solid rgba(220,38,38,0.4)", borderRadius: 10, padding: "8px 14px", color: "#fca5a5", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}
                          >+ הוסף</button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ── Cart drawer ── */}
      {cartOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex" }}>
          <div style={{ flex: 1, background: "rgba(0,0,0,0.7)" }} onClick={() => setCartOpen(false)} />
          <div dir="rtl" style={{ width: 320, background: "#0f0f0f", borderLeft: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", height: "100%" }}>
            <div style={{ padding: "16px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 900 }}>🛒 העגלה שלי</h2>
              <button
                onClick={() => setCartOpen(false)}
                style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "white", width: 30, height: 30, borderRadius: 8, cursor: "pointer", fontSize: 18, fontFamily: "inherit" }}
              >×</button>
            </div>

            {cart.items.length === 0 ? (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.3)", fontSize: 14 }}>
                העגלה ריקה 🛒
              </div>
            ) : (
              <>
                <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                  {cart.items.map((item) => {
                    const unitTotal = lineUnitPrice(item);
                    return (
                      <div key={item.product_id} style={{ display: "flex", alignItems: "center", gap: 10, padding: 12, background: "rgba(255,255,255,0.03)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {item.name_he}
                          </p>
                          {item.modifiers.length > 0 && (
                            <p style={{ margin: "2px 0 0", fontSize: 10, color: "rgba(255,255,255,0.3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {item.modifiers.map((m) => m.option_name).join(", ")}
                            </p>
                          )}
                          <p style={{ margin: "2px 0 0", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                            {unitTotal}₪ × {item.quantity}
                          </p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <button
                            onClick={() => cart.remove(item.product_id)}
                            style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(255,255,255,0.08)", border: "none", color: "white", cursor: "pointer", fontSize: 14, fontFamily: "inherit" }}
                          >−</button>
                          <span style={{ fontWeight: 800, fontSize: 13, minWidth: 14, textAlign: "center" }}>{item.quantity}</span>
                          <button
                            onClick={() => cart.updateQty(item.product_id, item.quantity + 1)}
                            style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(220,38,38,0.3)", border: "none", color: "white", cursor: "pointer", fontSize: 14, fontFamily: "inherit" }}
                          >+</button>
                        </div>
                        <span style={{ color: "#ef4444", fontWeight: 800, fontSize: 13, minWidth: 40, textAlign: "left" }}>
                          {unitTotal * item.quantity}₪
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div style={{ padding: 16, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <span style={{ color: "rgba(255,255,255,0.5)" }}>סה&quot;כ</span>
                    <span style={{ fontSize: 24, fontWeight: 900 }}>{cart.total}₪</span>
                  </div>
                  <button style={{ width: "100%", background: "#dc2626", border: "none", borderRadius: 14, padding: 14, color: "white", fontWeight: 900, fontSize: 16, cursor: "pointer", fontFamily: "inherit" }}>
                    המשך לתשלום ←
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Pizza customizer sheet ── */}
      {customizerProduct && (
        <PizzaCustomizer
          product={customizerProduct}
          allPizzas={pizzaProducts}
          onClose={() => setCustomizerProduct(null)}
        />
      )}

      {/* ── Add-on customizer sheet ── */}
      {addonProduct && (
        <AddonCustomizer
          product={addonProduct}
          onClose={() => setAddonProduct(null)}
        />
      )}

      {/* ── Bottom nav ── */}
      <nav style={{ position: "fixed", bottom: 0, right: 0, left: 0, background: "rgba(15,15,15,0.98)", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", zIndex: 40 }}>
        {[
          { href: "/",       icon: "🏠", label: "בית"      },
          { href: "/menu",   icon: "🍕", label: "תפריט", active: true },
          { href: "/gallery",icon: "📸", label: "גלריה"    },
          { href: "/contact",icon: "📞", label: "צור קשר"  },
        ].map((item) => (
          <a
            key={item.href}
            href={item.href}
            style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", padding: "10px 0", textDecoration: "none",
              color: item.active ? "#ef4444" : "rgba(255,255,255,0.4)",
              fontSize: 11, fontWeight: 600, gap: 3,
            }}
          >
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}
