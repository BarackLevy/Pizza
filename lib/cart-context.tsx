"use client";

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
  type ReactNode,
} from "react";

// ── Types ────────────────────────────────────────────────────────────────────

export interface CartModifier {
  option_id:   string;
  option_name: string;
  price_delta: number;
}

export interface CartItem {
  /** Stable key: product_id + sorted modifier fingerprint.
   *  Two orders of the same product with different choices get different line_ids
   *  and appear as separate cart lines. Identical orders merge to ×N. */
  line_id:    string;
  product_id: string;
  name_he:    string;
  unit_price: number;   // base price before modifier deltas
  quantity:   number;
  modifiers:  CartModifier[];
}

interface AddPayload {
  product_id: string;
  name_he:    string;
  unit_price: number;
  modifiers?: CartModifier[];
}

interface CartContextValue {
  items:      CartItem[];
  add:        (payload: AddPayload) => void;
  remove:     (line_id: string) => void;
  updateQty:  (line_id: string, quantity: number) => void;
  clear:      () => void;
  /** Sum of (unit_price + modifier deltas) × quantity for every line */
  total:      number;
  /** Sum of quantities across all lines */
  itemCount:  number;
}

// ── Line-identity helper ──────────────────────────────────────────────────────

/** Deterministic fingerprint for a product + modifier combination.
 *  Sorts by option_id so insertion order doesn't affect identity. */
export function makeLineId(product_id: string, modifiers: CartModifier[]): string {
  const fingerprint = modifiers
    .slice()
    .sort((a, b) => a.option_id.localeCompare(b.option_id))
    .map((m) => `${m.option_id}:${m.option_name}:${m.price_delta}`)
    .join("|");
  return `${product_id}::${fingerprint}`;
}

// ── Reducer ──────────────────────────────────────────────────────────────────

type CartAction =
  | { type: "ADD";        payload: Omit<CartItem, "quantity"> }
  | { type: "REMOVE";     payload: string }                              // line_id
  | { type: "UPDATE_QTY"; payload: { line_id: string; quantity: number } }
  | { type: "CLEAR" }
  | { type: "HYDRATE";    payload: CartItem[] };

function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case "ADD": {
      const existing = state.find((i) => i.line_id === action.payload.line_id);
      if (existing) {
        return state.map((i) =>
          i.line_id === action.payload.line_id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...state, { ...action.payload, quantity: 1 }];
    }
    case "REMOVE": {
      const existing = state.find((i) => i.line_id === action.payload);
      if (!existing) return state;
      if (existing.quantity > 1) {
        return state.map((i) =>
          i.line_id === action.payload ? { ...i, quantity: i.quantity - 1 } : i
        );
      }
      return state.filter((i) => i.line_id !== action.payload);
    }
    case "UPDATE_QTY": {
      const { line_id, quantity } = action.payload;
      if (quantity <= 0) return state.filter((i) => i.line_id !== line_id);
      return state.map((i) =>
        i.line_id === line_id ? { ...i, quantity } : i
      );
    }
    case "CLEAR":
      return [];
    case "HYDRATE":
      // Back-fill line_id for any cart items persisted before this field was added.
      return action.payload.map((item) => ({
        ...item,
        line_id: item.line_id ?? makeLineId(item.product_id, item.modifiers ?? []),
      }));
    default:
      return state;
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = "pizza_cart";

function lineUnitPrice(item: CartItem): number {
  return item.unit_price + item.modifiers.reduce((s, m) => s + m.price_delta, 0);
}

// ── Context ──────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(cartReducer, []);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage once on client mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) dispatch({ type: "HYDRATE", payload: JSON.parse(raw) as CartItem[] });
    } catch {
      // corrupt storage — ignore
    }
    setHydrated(true);
  }, []);

  // Persist to localStorage after every change, but only after hydration
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const total     = items.reduce((s, i) => s + lineUnitPrice(i) * i.quantity, 0);
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  const add = (payload: AddPayload) => {
    const modifiers = payload.modifiers ?? [];
    dispatch({
      type: "ADD",
      payload: {
        ...payload,
        modifiers,
        line_id: makeLineId(payload.product_id, modifiers),
      },
    });
  };

  const remove = (line_id: string) =>
    dispatch({ type: "REMOVE", payload: line_id });

  const updateQty = (line_id: string, quantity: number) =>
    dispatch({ type: "UPDATE_QTY", payload: { line_id, quantity } });

  const clear = () => dispatch({ type: "CLEAR" });

  return (
    <CartContext.Provider
      value={{ items, add, remove, updateQty, clear, total, itemCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}

/** Exposed for use outside the provider (e.g. drawer, nav badge) */
export { lineUnitPrice };
