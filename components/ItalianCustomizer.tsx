"use client";
import { useState, useEffect } from "react";
import type { Product } from "@/types/menu";
import { fetchAddonGroups } from "@/lib/addon-modifiers";
import type { AddonGroup, AddonOption } from "@/lib/addon-modifiers";
import {
  fetchItalianPricing,
  getAvailableSauces,
  getItalianPrice,
} from "@/lib/italian-pricing";
import type { ItalianPricingRow } from "@/lib/italian-pricing";
import { useCart } from "@/lib/cart-context";
import type { CartModifier } from "@/lib/cart-context";

interface Props {
  product: Product;
  onClose: () => void;
}

const GROUP_TYPE    = "סוג";
const GROUP_SAUCE   = "רוטב";
const GROUP_FILLING = "מילוי רביולי";
const GROUP_ADDONS  = "תוספות פסטה";
const TYPE_RAVIOLI  = "רביולי";

// ── Shared card grid — renders single-select option buttons ─────────────────
interface CardGridProps {
  options:    AddonOption[];
  selectedId: string;
  onSelect:   (id: string) => void;
}

function CardGrid({ options, selectedId, onSelect }: CardGridProps) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
      {options.map((opt) => {
        const active = selectedId === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
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
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function ItalianCustomizer({ product, onClose }: Props) {
  const cart = useCart();

  const [mounted,           setMounted]           = useState(false);
  const [loading,           setLoading]           = useState(true);
  const [groups,            setGroups]            = useState<AddonGroup[]>([]);
  const [pricingRows,       setPricingRows]       = useState<ItalianPricingRow[]>([]);
  const [selectedTypeId,    setSelectedTypeId]    = useState("");
  const [selectedSauceId,   setSelectedSauceId]   = useState("");
  const [selectedFillingId, setSelectedFillingId] = useState("");
  const [selectedAddonIds,  setSelectedAddonIds]  = useState<Set<string>>(new Set());
  const [qty,               setQty]               = useState(1);

  useEffect(() => {
    setMounted(true);
    Promise.all([fetchAddonGroups(product.id), fetchItalianPricing()])
      .then(([gs, rows]) => {
        setGroups(gs);
        setPricingRows(rows);

        const typeGroup    = gs.find((g) => g.name_he === GROUP_TYPE);
        const sauceGroup   = gs.find((g) => g.name_he === GROUP_SAUCE);
        const fillingGroup = gs.find((g) => g.name_he === GROUP_FILLING);

        const firstType = typeGroup?.options[0];
        if (firstType) {
          setSelectedTypeId(firstType.id);
          const availSauces = getAvailableSauces(firstType.name_he, rows);
          const firstSauce  = sauceGroup?.options.find((o) => availSauces.includes(o.name_he));
          if (firstSauce) setSelectedSauceId(firstSauce.id);
        }

        const firstFilling = fillingGroup?.options[0];
        if (firstFilling) setSelectedFillingId(firstFilling.id);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [product.id]);

  // ── Derived references ───────────────────────────────────────────────────
  const typeGroup    = groups.find((g) => g.name_he === GROUP_TYPE);
  const sauceGroup   = groups.find((g) => g.name_he === GROUP_SAUCE);
  const fillingGroup = groups.find((g) => g.name_he === GROUP_FILLING);
  const addonsGroup  = groups.find((g) => g.name_he === GROUP_ADDONS);

  const selectedTypeName  = typeGroup?.options.find((o) => o.id === selectedTypeId)?.name_he  ?? "";
  const selectedSauceName = sauceGroup?.options.find((o) => o.id === selectedSauceId)?.name_he ?? "";

  const availableSauceNames = getAvailableSauces(selectedTypeName, pricingRows);
  const filteredSauces      = (sauceGroup?.options ?? []).filter((o) =>
    availableSauceNames.includes(o.name_he)
  );
  const showFilling = selectedTypeName === TYPE_RAVIOLI;

  // ── Live pricing ─────────────────────────────────────────────────────────
  const basePrice   = getItalianPrice(selectedTypeName, selectedSauceName, pricingRows);
  const addonsTotal = (addonsGroup?.options ?? [])
    .filter((o) => selectedAddonIds.has(o.id))
    .reduce((s, o) => s + o.price_delta, 0);
  const unitPrice = basePrice + addonsTotal;
  const total     = unitPrice * qty;

  // ── Handlers ─────────────────────────────────────────────────────────────
  function handleTypeChange(optionId: string) {
    const typeName    = typeGroup?.options.find((o) => o.id === optionId)?.name_he ?? "";
    const availSauces = getAvailableSauces(typeName, pricingRows);
    setSelectedTypeId(optionId);
    // Auto-reset sauce if it's not valid for the new type
    if (!availSauces.includes(selectedSauceName)) {
      const firstAvail = sauceGroup?.options.find((o) => availSauces.includes(o.name_he));
      if (firstAvail) setSelectedSauceId(firstAvail.id);
    }
  }

  function toggleAddon(id: string) {
    setSelectedAddonIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleAdd() {
    const modifiers: CartModifier[] = [];

    // Type label (price captured in basePrice, delta=0)
    const typeOpt = typeGroup?.options.find((o) => o.id === selectedTypeId);
    if (typeOpt) modifiers.push({ option_id: typeOpt.id, option_name: typeOpt.name_he, price_delta: 0 });

    // Sauce label (price captured in basePrice, delta=0)
    const sauceOpt = sauceGroup?.options.find((o) => o.id === selectedSauceId);
    if (sauceOpt) modifiers.push({ option_id: sauceOpt.id, option_name: sauceOpt.name_he, price_delta: 0 });

    // Ravioli filling (only when visible; no price impact)
    if (showFilling && selectedFillingId) {
      const fillingOpt = fillingGroup?.options.find((o) => o.id === selectedFillingId);
      if (fillingOpt)
        modifiers.push({ option_id: fillingOpt.id, option_name: fillingOpt.name_he, price_delta: 0 });
    }

    // Add-ons with their actual price_delta
    for (const opt of addonsGroup?.options ?? []) {
      if (selectedAddonIds.has(opt.id))
        modifiers.push({ option_id: opt.id, option_name: opt.name_he, price_delta: opt.price_delta });
    }

    for (let i = 0; i < qty; i++) {
      cart.add({
        product_id: product.id,
        name_he:    product.name_he,
        unit_price: basePrice,   // add-on deltas live in modifiers; lineUnitPrice sums them
        modifiers,
      });
    }
    onClose();
  }

  // ── Styles ───────────────────────────────────────────────────────────────
  const sectionLabel = {
    margin:        "0 0 8px",
    fontSize:      11,
    fontWeight:    700,
    color:         "rgba(255,255,255,0.4)",
    letterSpacing: 1,
  } as const;

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
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 900 }}>🍝 התאמה אישית</h2>
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

          {/* Product image — hidden when null; slot ready for per-type images */}
          {product.image_url && (
            <img
              src={product.image_url}
              alt=""
              style={{ width: "100%", height: 130, objectFit: "cover", borderRadius: 14, marginBottom: 10 }}
            />
          )}

          {/* Name + description + live price */}
          <p style={{ margin: "0 0 2px", fontWeight: 800, fontSize: 15 }}>
            {product.name_he}
          </p>
          {product.description && (
            <p style={{ margin: "0 0 6px", color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
              {product.description}
            </p>
          )}
          <p style={{ margin: "0 0 20px", color: "#ef4444", fontWeight: 900, fontSize: 17 }}>
            {loading ? "..." : `${unitPrice}₪`}
          </p>

          {loading ? (
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, textAlign: "center", padding: "20px 0" }}>
              טוען...
            </p>
          ) : (
            <>
              {/* ── TYPE selector ─────────────────────────────────── */}
              {typeGroup && (
                <div style={{ marginBottom: 22 }}>
                  <p style={sectionLabel}>{typeGroup.name_he}</p>
                  <CardGrid
                    options={typeGroup.options}
                    selectedId={selectedTypeId}
                    onSelect={handleTypeChange}
                  />
                </div>
              )}

              {/* ── SAUCE selector (filtered by type) ─────────────── */}
              {sauceGroup && filteredSauces.length > 0 && (
                <div style={{ marginBottom: 22 }}>
                  <p style={sectionLabel}>{sauceGroup.name_he}</p>
                  <CardGrid
                    options={filteredSauces}
                    selectedId={selectedSauceId}
                    onSelect={setSelectedSauceId}
                  />
                </div>
              )}

              {/* ── RAVIOLI FILLING (shown only when type = רביולי) ── */}
              {showFilling && fillingGroup && (
                <div style={{ marginBottom: 22 }}>
                  <p style={sectionLabel}>{fillingGroup.name_he}</p>
                  <CardGrid
                    options={fillingGroup.options}
                    selectedId={selectedFillingId}
                    onSelect={setSelectedFillingId}
                  />
                </div>
              )}

              {/* ── ADD-ONS (checkbox toggles, not quantity steppers) ─ */}
              {addonsGroup && (
                <div style={{ marginBottom: 24 }}>
                  <p style={sectionLabel}>{addonsGroup.name_he}</p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
                    {addonsGroup.options.map((opt) => {
                      const active = selectedAddonIds.has(opt.id);
                      return (
                        <button
                          key={opt.id}
                          onClick={() => toggleAddon(opt.id)}
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
                          <span style={{ display: "block", fontSize: 11, marginTop: 2, opacity: 0.8 }}>
                            +{opt.price_delta}₪
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sticky footer */}
        <div style={{
          padding:    "12px 16px 24px",
          borderTop:  "1px solid rgba(255,255,255,0.08)",
          background: "#111",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
            {/* Item quantity */}
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

          <button
            onClick={handleAdd}
            disabled={loading}
            style={{
              width:        "100%",
              background:   loading ? "rgba(220,38,38,0.4)" : "#dc2626",
              border:       "none",
              borderRadius: 14,
              padding:      "14px",
              color:        "white",
              fontWeight:   900,
              fontSize:     16,
              cursor:       loading ? "default" : "pointer",
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
