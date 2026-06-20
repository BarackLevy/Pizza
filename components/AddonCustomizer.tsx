"use client";
import { useState, useEffect } from "react";
import type { Product } from "@/types/menu";
import { fetchAddonGroups } from "@/lib/addon-modifiers";
import type { AddonGroup } from "@/lib/addon-modifiers";
import { useCart } from "@/lib/cart-context";
import type { CartModifier } from "@/lib/cart-context";

interface Props {
  product: Product;
  onClose: () => void;
}

export default function AddonCustomizer({ product, onClose }: Props) {
  const cart = useCart();

  const [mounted,    setMounted]    = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [groups,     setGroups]     = useState<AddonGroup[]>([]);
  // single-select state: group_id → selected option_id
  const [selections, setSelections] = useState<Record<string, string>>({});
  // quantity state: option_id → quantity (for allow_quantity groups)
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [qty,        setQty]        = useState(1);

  useEffect(() => {
    setMounted(true);
    fetchAddonGroups(product.id)
      .then((gs) => {
        setGroups(gs);
        // Default: select the first option of every single-select group
        const defaults: Record<string, string> = {};
        for (const g of gs) {
          if (g.selection_type === "single" && g.options.length > 0) {
            defaults[g.id] = g.options[0].id;
          }
        }
        setSelections(defaults);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [product.id]);

  // Price from single-select choices (usually 0; included for future groups with non-zero deltas)
  const singleTotal = groups
    .filter((g) => g.selection_type === "single")
    .reduce((sum, g) => {
      const sel = g.options.find((o) => o.id === selections[g.id]);
      return sum + (sel?.price_delta ?? 0);
    }, 0);

  // Price from quantity add-ons
  const addonTotal = groups
    .filter((g) => g.allow_quantity)
    .flatMap((g) => g.options)
    .reduce((sum, opt) => sum + opt.price_delta * (quantities[opt.id] ?? 0), 0);

  const unitPrice = product.base_price + singleTotal + addonTotal;
  const total     = unitPrice * qty;

  function adjustQty(optionId: string, delta: number) {
    setQuantities((prev) => ({
      ...prev,
      [optionId]: Math.max(0, (prev[optionId] ?? 0) + delta),
    }));
  }

  function handleAdd() {
    const modifiers: CartModifier[] = [
      // Single-select selections recorded as modifiers (price_delta often 0 — just for the label)
      ...groups
        .filter((g) => g.selection_type === "single" && selections[g.id])
        .map((g) => {
          const opt = g.options.find((o) => o.id === selections[g.id])!;
          return {
            option_id:   opt.id,
            option_name: opt.name_he,
            price_delta: opt.price_delta,
          };
        }),
      // Quantity add-ons
      ...groups
        .filter((g) => g.allow_quantity)
        .flatMap((g) => g.options)
        .filter((opt) => (quantities[opt.id] ?? 0) > 0)
        .map((opt) => {
          const q = quantities[opt.id];
          return {
            option_id:   opt.id,
            option_name: q > 1 ? `${opt.name_he} ×${q}` : opt.name_he,
            price_delta: opt.price_delta * q,
          };
        }),
    ];

    for (let i = 0; i < qty; i++) {
      cart.add({
        product_id: product.id,
        name_he:    product.name_he,
        unit_price: product.base_price,
        modifiers,
      });
    }
    onClose();
  }

  const sectionLabel: React.CSSProperties = {
    margin:        "0 0 8px",
    fontSize:      11,
    fontWeight:    700,
    color:         "rgba(255,255,255,0.4)",
    letterSpacing: 1,
  };

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
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 900 }}>✨ התאמה אישית</h2>
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

          {/* Product image */}
          {product.image_url && (
            <img
              src={product.image_url}
              alt=""
              style={{ width: "100%", height: 130, objectFit: "cover", borderRadius: 14, marginBottom: 10 }}
            />
          )}

          {/* Name + description + base price */}
          <p style={{ margin: "0 0 2px", fontWeight: 800, fontSize: 15 }}>
            {product.name_he}
          </p>
          {product.description && (
            <p style={{ margin: "0 0 6px", color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
              {product.description}
            </p>
          )}
          <p style={{ margin: "0 0 20px", color: "#ef4444", fontWeight: 900, fontSize: 17 }}>
            {product.base_price}₪
          </p>

          {/* Groups */}
          {loading ? (
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, textAlign: "center", padding: "20px 0" }}>
              טוען...
            </p>
          ) : (
            groups.map((group) =>
              group.selection_type === "single" ? (
                // ── Single-select group: card/button selector ──────────
                <div key={group.id} style={{ marginBottom: 22 }}>
                  <p style={sectionLabel}>
                    {group.name_he}
                  </p>
                  <div style={{
                    display:             "grid",
                    gridTemplateColumns: "repeat(2,1fr)",
                    gap:                 8,
                  }}>
                    {group.options.map((opt) => {
                      const active = selections[group.id] === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() =>
                            setSelections((prev) => ({ ...prev, [group.id]: opt.id }))
                          }
                          style={{
                            background:   active ? "#dc2626" : "rgba(255,255,255,0.06)",
                            border:       `2px solid ${active ? "#dc2626" : "rgba(255,255,255,0.08)"}`,
                            borderRadius: 12,
                            padding:      "12px 8px",
                            cursor:       "pointer",
                            color:        "white",
                            fontFamily:   "inherit",
                            textAlign:    "center",
                            fontWeight:   active ? 900 : 500,
                            fontSize:     13,
                            lineHeight:   1.4,
                            transition:   "background 0.15s, border-color 0.15s",
                          }}
                        >
                          {opt.name_he}
                          {opt.price_delta > 0 && (
                            <span style={{ display: "block", fontSize: 11, marginTop: 2, opacity: 0.8 }}>
                              +{opt.price_delta}₪
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                // ── Quantity add-on group: +/- steppers ───────────────
                <div key={group.id} style={{ marginBottom: 24 }}>
                  <p style={sectionLabel}>{group.name_he}</p>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {group.options.map((opt) => {
                      const q = quantities[opt.id] ?? 0;
                      return (
                        <div
                          key={opt.id}
                          style={{
                            display:        "flex",
                            alignItems:     "center",
                            justifyContent: "space-between",
                            padding:        "8px 0",
                            borderBottom:   "1px solid rgba(255,255,255,0.04)",
                          }}
                        >
                          {/* Option name + unit price + running total */}
                          <div style={{ flex: 1, minWidth: 0, paddingLeft: 8 }}>
                            <span style={{
                              fontSize:   13,
                              fontWeight: q > 0 ? 700 : 400,
                              color:      q > 0 ? "white" : "rgba(255,255,255,0.6)",
                            }}>
                              {opt.name_he}
                            </span>
                            <span style={{ marginRight: 6, fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                              +{opt.price_delta}₪
                            </span>
                            {q > 0 && (
                              <span style={{ marginRight: 6, fontSize: 11, color: "#fca5a5", fontWeight: 800 }}>
                                = +{opt.price_delta * q}₪
                              </span>
                            )}
                          </div>

                          {/* Per-option quantity stepper */}
                          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                            <button
                              onClick={() => adjustQty(opt.id, -1)}
                              style={{
                                width:          28,
                                height:         28,
                                borderRadius:   "50%",
                                background:     q > 0 ? "rgba(220,38,38,0.2)" : "rgba(255,255,255,0.07)",
                                border:         q > 0 ? "1px solid rgba(220,38,38,0.5)" : "1px solid transparent",
                                color:          "white",
                                fontSize:       16,
                                cursor:         "pointer",
                                display:        "flex",
                                alignItems:     "center",
                                justifyContent: "center",
                                fontFamily:     "inherit",
                                lineHeight:     1,
                              }}
                            >−</button>
                            <span style={{
                              fontWeight: 900,
                              fontSize:   14,
                              minWidth:   16,
                              textAlign:  "center",
                              color:      q > 0 ? "white" : "rgba(255,255,255,0.25)",
                            }}>
                              {q}
                            </span>
                            <button
                              onClick={() => adjustQty(opt.id, 1)}
                              style={{
                                width:          28,
                                height:         28,
                                borderRadius:   "50%",
                                background:     "#dc2626",
                                border:         "none",
                                color:          "white",
                                fontSize:       16,
                                cursor:         "pointer",
                                display:        "flex",
                                alignItems:     "center",
                                justifyContent: "center",
                                fontFamily:     "inherit",
                                lineHeight:     1,
                              }}
                            >+</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )
            )
          )}
        </div>

        {/* Sticky footer */}
        <div style={{
          padding:    "12px 16px 24px",
          borderTop:  "1px solid rgba(255,255,255,0.08)",
          background: "#111",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>

            {/* Item quantity control */}
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

            {/* Live total */}
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
