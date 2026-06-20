"use client";
import { useState, useEffect, useCallback } from "react";
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
}

const GROUP_TYPE    = "סוג";
const GROUP_SAUCE   = "רוטב";
const GROUP_FILLING = "מילוי רביולי";
const GROUP_ADDONS  = "תוספות פסטה";
const TYPE_RAVIOLI  = "רביולי";

// ── Shared card grid ─────────────────────────────────────────────────────────
function CardGrid({
  options,
  selectedId,
  onSelect,
}: {
  options:    AddonOption[];
  selectedId: string;
  onSelect:   (id: string) => void;
}) {
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

// ── Main inline builder ──────────────────────────────────────────────────────
export default function ItalianBuilder({ product }: Props) {
  const cart = useCart();

  const [loading,           setLoading]           = useState(true);
  const [groups,            setGroups]            = useState<AddonGroup[]>([]);
  const [pricingRows,       setPricingRows]       = useState<ItalianPricingRow[]>([]);
  const [selectedTypeId,    setSelectedTypeId]    = useState("");
  const [selectedSauceId,   setSelectedSauceId]   = useState("");
  const [selectedFillingId, setSelectedFillingId] = useState("");
  const [selectedAddonIds,  setSelectedAddonIds]  = useState<Set<string>>(new Set());
  const [qty,               setQty]               = useState(1);
  const [confirmed,         setConfirmed]         = useState(false);

  // Resets all selections to defaults — called on mount and after each add-to-cart.
  const applyDefaults = useCallback(
    (gs: AddonGroup[], rows: ItalianPricingRow[]) => {
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
      setSelectedAddonIds(new Set());
      setQty(1);
    },
    []
  );

  useEffect(() => {
    Promise.all([fetchAddonGroups(product.id), fetchItalianPricing()])
      .then(([gs, rows]) => {
        setGroups(gs);
        setPricingRows(rows);
        applyDefaults(gs, rows);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [product.id, applyDefaults]);

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

    const typeOpt = typeGroup?.options.find((o) => o.id === selectedTypeId);
    if (typeOpt)
      modifiers.push({ option_id: typeOpt.id, option_name: typeOpt.name_he, price_delta: 0 });

    const sauceOpt = sauceGroup?.options.find((o) => o.id === selectedSauceId);
    if (sauceOpt)
      modifiers.push({ option_id: sauceOpt.id, option_name: sauceOpt.name_he, price_delta: 0 });

    if (showFilling && selectedFillingId) {
      const fillingOpt = fillingGroup?.options.find((o) => o.id === selectedFillingId);
      if (fillingOpt)
        modifiers.push({ option_id: fillingOpt.id, option_name: fillingOpt.name_he, price_delta: 0 });
    }

    for (const opt of addonsGroup?.options ?? []) {
      if (selectedAddonIds.has(opt.id))
        modifiers.push({ option_id: opt.id, option_name: opt.name_he, price_delta: opt.price_delta });
    }

    for (let i = 0; i < qty; i++) {
      cart.add({
        product_id: product.id,
        name_he:    product.name_he,
        unit_price: basePrice,   // add-on deltas live in modifiers
        modifiers,
      });
    }

    applyDefaults(groups, pricingRows);
    setConfirmed(true);
    setTimeout(() => setConfirmed(false), 1600);
  }

  const sectionLabel = {
    margin:        "0 0 8px",
    fontSize:      11,
    fontWeight:    700,
    color:         "rgba(255,255,255,0.4)",
    letterSpacing: 1,
  } as const;

  if (loading) {
    return (
      <div style={{ padding: "40px 0", textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 14 }}>
        טוען...
      </div>
    );
  }

  return (
    <div dir="rtl">

      {/* Image / hero slot — placeholder until image_url is set on the product */}
      {product.image_url ? (
        <img
          src={product.image_url}
          alt=""
          style={{ width: "100%", height: 180, objectFit: "cover", borderRadius: 16, marginBottom: 24 }}
        />
      ) : (
        <div style={{
          height:         164,
          background:     "linear-gradient(135deg, rgba(220,38,38,0.14) 0%, rgba(255,255,255,0.03) 100%)",
          borderRadius:   16,
          marginBottom:   24,
          display:        "flex",
          flexDirection:  "column",
          alignItems:     "center",
          justifyContent: "center",
          gap:            6,
          border:         "1px solid rgba(220,38,38,0.18)",
        }}>
          <span style={{ fontSize: 48, lineHeight: 1 }}>🍝</span>
          <span style={{ fontSize: 19, fontWeight: 900, color: "white", marginTop: 4 }}>האיטלקיה</span>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
            {selectedTypeName && selectedSauceName
              ? `${selectedTypeName} · ${selectedSauceName}`
              : "בחר סוג ורוטב"}
          </span>
        </div>
      )}

      {/* ── TYPE selector ─────────────────────────────────────────── */}
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

      {/* ── SAUCE selector (filtered by chosen type) ──────────────── */}
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

      {/* ── RAVIOLI FILLING (visible only when type = רביולי) ─────── */}
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

      {/* ── ADD-ONS (multi-select toggles, not quantity steppers) ──── */}
      {addonsGroup && (
        <div style={{ marginBottom: 120 }}>
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

      {/* ── Sticky CTA — sits above the fixed bottom nav ────────────── */}
      <div style={{
        position:        "sticky",
        bottom:          76,
        marginLeft:      -16,
        marginRight:     -16,
        background:      "rgba(10,10,10,0.97)",
        backdropFilter:  "blur(18px)",
        borderTop:       "1px solid rgba(255,255,255,0.08)",
        borderRadius:    "16px 16px 0 0",
        padding:         "12px 16px 14px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
          {/* Quantity stepper */}
          <div style={{
            display:      "flex",
            alignItems:   "center",
            gap:          12,
            background:   "rgba(255,255,255,0.07)",
            borderRadius: 12,
            padding:      "6px 14px",
            flexShrink:   0,
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
          style={{
            width:        "100%",
            background:   confirmed ? "#16a34a" : "#dc2626",
            border:       "none",
            borderRadius: 14,
            padding:      "14px",
            color:        "white",
            fontWeight:   900,
            fontSize:     16,
            cursor:       "pointer",
            fontFamily:   "inherit",
            transition:   "background 0.2s",
          }}
        >
          {confirmed ? "✓ נוסף לעגלה!" : `הוסף לעגלה — ${total}₪`}
        </button>
      </div>
    </div>
  );
}
