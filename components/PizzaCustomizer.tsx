"use client";
import { useState, useEffect } from "react";
import type { Product } from "@/types/menu";
import { fetchToppings } from "@/lib/pizza-modifiers";
import type { ToppingOption } from "@/lib/pizza-modifiers";
import {
  toppingPrice,
  pizzaUnitPrice,
  extractSizeLabel,
  type SizeLabel,
  type ToppingTier,
  type ToppingCoverage,
} from "@/lib/pricing";
import { useCart } from "@/lib/cart-context";
import type { CartModifier } from "@/lib/cart-context";

const SIZES: SizeLabel[] = ["S", "M", "L", "XL"];

// Used in cart modifier option_name — never shown on screen
const COVERAGE_LABEL: Record<Exclude<ToppingCoverage, "none">, string> = {
  whole: "שלם",
  right: "½ ימין",
  left:  "½ שמאל",
};

// ── Pizza Hut–style circle icon ───────────────────────────────────────────────
// side: "whole" = full circle, "left" = left half filled, "right" = right half filled
// Uses a clipPath rect to clip a filled circle to the relevant half.
// Each SVG embeds its own <defs> so clipPath IDs never collide across toppings.
type CircleSide = "whole" | "left" | "right";

function ToppingCircleIcon({
  side,
  active,
  clipId,
}: {
  side:   CircleSide;
  active: boolean;
  clipId: string;       // unique per (topping × side)
}) {
  const RED       = "#dc2626";
  const fillColor = active ? RED : "#ffffff";
  const stroke    = active ? RED : "rgba(255,255,255,0.6)";
  const divider   = "rgba(0,0,0,0.35)";   // dark line so it reads on both white and red fill

  return (
    <svg width="30" height="30" viewBox="0 0 24 24" style={{ display: "block" }}>
      {/* Clip rect — only needed for half-circle fills */}
      {side !== "whole" && (
        <defs>
          <clipPath id={clipId}>
            <rect
              x={side === "left" ? 0 : 12}
              y="0"
              width="12"
              height="24"
            />
          </clipPath>
        </defs>
      )}

      {/* Fill — always rendered; white when unselected, red when selected */}
      {side === "whole" && (
        <circle cx="12" cy="12" r="10.5" fill={fillColor} />
      )}
      {side !== "whole" && (
        <circle cx="12" cy="12" r="10.5" fill={fillColor} clipPath={`url(#${clipId})`} />
      )}

      {/* Outline ring — always visible */}
      <circle cx="12" cy="12" r="10.5" fill="none" stroke={stroke} strokeWidth="1.5" />

      {/* Centre divider for half icons */}
      {side !== "whole" && (
        <line x1="12" y1="1.5" x2="12" y2="22.5" stroke={divider} strokeWidth="1.5" />
      )}
    </svg>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  product:   Product;
  allPizzas: Product[];
  onClose:   () => void;
}

export default function PizzaCustomizer({ product, allPizzas, onClose }: Props) {
  const cart = useCart();

  const [size,     setSize]     = useState<SizeLabel>(extractSizeLabel(product.name_he));
  const [coverages, setCoverages] = useState<Record<string, ToppingCoverage>>({});
  const [qty,      setQty]      = useState(1);
  const [toppings, setToppings] = useState<ToppingOption[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [mounted,  setMounted]  = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchToppings()
      .then(setToppings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const selectedProduct = allPizzas.find((p) => extractSizeLabel(p.name_he) === size) ?? product;
  const basePrice = selectedProduct.base_price;

  type Sel = { id: string; tier: ToppingTier; coverage: ToppingCoverage };
  const activeSelections: Sel[] = toppings
    .map((t) => ({
      id:       t.id,
      tier:     (t.is_special ? "special" : "regular") as ToppingTier,
      coverage: (coverages[t.id] ?? "none") as ToppingCoverage,
    }))
    .filter((s) => s.coverage !== "none");

  const unitPrice = pizzaUnitPrice(
    basePrice,
    size,
    activeSelections,
  );
  const total = unitPrice * qty;

  function handleAdd() {
    const modifiers: CartModifier[] = activeSelections.map((s) => {
      const t = toppings.find((t) => t.id === s.id)!;
      return {
        option_id:   t.id,
        option_name: `${t.name_he} – ${COVERAGE_LABEL[s.coverage as Exclude<ToppingCoverage, "none">]}`,
        price_delta: toppingPrice(s.tier, size, s.coverage),
      };
    });

    for (let i = 0; i < qty; i++) {
      cart.add({
        product_id: selectedProduct.id,
        name_he:    selectedProduct.name_he,
        unit_price: basePrice,
        modifiers,
      });
    }
    onClose();
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60 }}>
      {/* Backdrop */}
      <div
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.78)" }}
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <div
        dir="rtl"
        style={{
          position:      "absolute",
          bottom:        0,
          left:          0,
          right:         0,
          background:    "#111",
          borderRadius:  "20px 20px 0 0",
          maxHeight:     "90vh",
          display:       "flex",
          flexDirection: "column",
          overflow:      "hidden",
          transform:     mounted ? "translateY(0)" : "translateY(100%)",
          transition:    "transform 0.3s cubic-bezier(0.32,0.72,0,1)",
        }}
      >
        {/* Drag handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 4px" }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.15)" }} />
        </div>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 16px 12px" }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 900 }}>🍕 התאמה אישית</h2>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.08)", border: "none", color: "white",
              width: 32, height: 32, borderRadius: 10, cursor: "pointer", fontSize: 18,
              fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >×</button>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 8px" }}>

          {/* Image */}
          {selectedProduct.image_url && (
            <img
              src={selectedProduct.image_url}
              alt=""
              style={{ width: "100%", height: 130, objectFit: "cover", borderRadius: 14, marginBottom: 10 }}
            />
          )}

          {/* Name + description */}
          <p style={{ margin: "0 0 2px", fontWeight: 800, fontSize: 15 }}>
            {selectedProduct.name_he}
          </p>
          {selectedProduct.description && (
            <p style={{ margin: "0 0 16px", color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
              {selectedProduct.description}
            </p>
          )}

          {/* ── Size selector ── */}
          <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: 1 }}>
            גודל
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6, marginBottom: 22 }}>
            {SIZES.map((s) => {
              const p = allPizzas.find((p) => extractSizeLabel(p.name_he) === s);
              if (!p) return null;
              const active = size === s;
              return (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  style={{
                    background:   active ? "#dc2626" : "rgba(255,255,255,0.06)",
                    border:       `2px solid ${active ? "#dc2626" : "transparent"}`,
                    borderRadius: 12,
                    padding:      "10px 4px",
                    cursor:       "pointer",
                    color:        "white",
                    fontFamily:   "inherit",
                    textAlign:    "center",
                  }}
                >
                  <div style={{ fontWeight: 900, fontSize: 15 }}>{s}</div>
                  <div style={{ fontSize: 11, marginTop: 2, color: active ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.4)" }}>
                    {p.base_price}₪
                  </div>
                </button>
              );
            })}
          </div>

          {/* ── Toppings ── */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: 1 }}>
              תוספות
            </p>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>★ = מיוחד</span>
          </div>

          {loading ? (
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, textAlign: "center", padding: "20px 0" }}>
              טוען...
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", marginBottom: 8 }}>
              {toppings.map((topping) => {
                const cv   = (coverages[topping.id] ?? "none") as ToppingCoverage;
                const tier = (topping.is_special ? "special" : "regular") as ToppingTier;
                const isActive = cv !== "none";

                return (
                  <div
                    key={topping.id}
                    style={{
                      display:        "flex",
                      alignItems:     "center",
                      justifyContent: "space-between",
                      padding:        "7px 0",
                      borderBottom:   "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    {/* Topping name */}
                    <div style={{ flex: 1, minWidth: 0, paddingLeft: 8 }}>
                      <span style={{
                        fontSize:   13,
                        fontWeight: isActive ? 700 : 400,
                        color:      isActive ? "white" : "rgba(255,255,255,0.6)",
                      }}>
                        {topping.is_special ? "★ " : ""}{topping.name_he}
                      </span>
                      {isActive && (
                        <span style={{ marginRight: 6, fontSize: 11, color: "#fca5a5", fontWeight: 800 }}>
                          +{toppingPrice(tier, size, cv)}₪
                        </span>
                      )}
                    </div>

                    {/* Pizza Hut–style circle controls (whole / left-half / right-half) */}
                    {/* RTL order: whole (rightmost) → left-half → right-half (leftmost) */}
                    <div style={{ display: "flex", gap: 2, flexShrink: 0, alignItems: "center" }}>
                      {(["whole", "left", "right"] as CircleSide[]).map((opt) => (
                        <button
                          key={opt}
                          onClick={() =>
                            setCoverages((prev) => ({
                              ...prev,
                              [topping.id]: prev[topping.id] === opt ? "none" : opt,
                            }))
                          }
                          aria-label={COVERAGE_LABEL[opt]}
                          style={{
                            background: "none",
                            border:     "none",
                            padding:    "5px",
                            cursor:     "pointer",
                            display:    "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <ToppingCircleIcon
                            side={opt}
                            active={cv === opt}
                            clipId={`tc-${topping.id.slice(0, 8)}-${opt}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Sticky footer ── */}
        <div style={{
          padding:    "12px 16px 24px",
          borderTop:  "1px solid rgba(255,255,255,0.08)",
          background: "#111",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>

            {/* Quantity control */}
            <div style={{
              display:      "flex",
              alignItems:   "center",
              gap:          12,
              background:   "rgba(255,255,255,0.07)",
              borderRadius: 12,
              padding:      "6px 14px",
            }}>
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                style={{ background: "none", border: "none", color: "white", fontSize: 22, cursor: "pointer", fontFamily: "inherit", padding: 0, lineHeight: 1 }}
              >−</button>
              <span style={{ fontWeight: 900, fontSize: 16, minWidth: 20, textAlign: "center" }}>{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                style={{ background: "none", border: "none", color: "white", fontSize: 22, cursor: "pointer", fontFamily: "inherit", padding: 0, lineHeight: 1 }}
              >+</button>
            </div>

            {/* Live price */}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 900, fontSize: 22 }}>{total}₪</div>
              {qty > 1 && (
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                  {unitPrice}₪ × {qty}
                </div>
              )}
            </div>
          </div>

          {/* Add to cart */}
          <button
            onClick={handleAdd}
            style={{
              width:        "100%",
              background:   "#dc2626",
              border:       "none",
              borderRadius: 14,
              padding:      "14px",
              color:        "white",
              fontWeight:   900,
              fontSize:     16,
              cursor:       "pointer",
              fontFamily:   "inherit",
            }}
          >
            הוסף לעגלה — {total}₪
          </button>
        </div>
      </div>
    </div>
  );
}
