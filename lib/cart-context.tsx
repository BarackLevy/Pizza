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
  option_id: string;
  option_name: string;
  price_delta: number;
}

export interface CartItem {
  product_id: string;
  name_he: string;
  unit_price: number;   // base price, before modifiers
  quantity: number;
  modifiers: CartModifier[];
}

interface AddPayload {
  product_id: string;
  name_he: string;
  unit_price: number;
  modifiers?: CartModifier[];
}

interface CartContextValue {
  items: CartItem[];
  add: (payload: AddPayload) => void;
  remove: (product_id: string) => void;
  updateQty: (product_id: string, quantity: number) => void;
  clear: () => void;
  /** Sum of (unit_price + modifier deltas) × quantity for every line */
  total: number;
  /** Sum of quantities across all lines */
  itemCount: number;
}

// ── Reducer ──────────────────────────────────────────────────────────────────

type CartAction =
  | { type: "ADD";      payload: Omit<CartItem, "quantity"> }
  | { type: "REMOVE";   payload: string }                          // product_id
  | { type: "UPDATE_QTY"; payload: { product_id: string; quantity: number } }
  | { type: "CLEAR" }
  | { type: "HYDRATE";  payload: CartItem[] };

function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case "ADD": {
      const existing = state.find((i) => i.product_id === action.payload.product_id);
      if (existing) {
        return state.map((i) =>
          i.product_id === action.payload.product_id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...state, { ...action.payload, quantity: 1 }];
    }
    case "REMOVE": {
      const existing = state.find((i) => i.product_id === action.payload);
      if (!existing) return state;
      if (existing.quantity > 1) {
        return state.map((i) =>
          i.product_id === action.payload ? { ...i, quantity: i.quantity - 1 } : i
        );
      }
      return state.filter((i) => i.product_id !== action.payload);
    }
    case "UPDATE_QTY": {
      const { product_id, quantity } = action.payload;
      if (quantity <= 0) return state.filter((i) => i.product_id !== product_id);
      return state.map((i) =>
        i.product_id === product_id ? { ...i, quantity } : i
      );
    }
    case "CLEAR":
      return [];
    case "HYDRATE":
      return action.payload;
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

  const total = items.reduce((s, i) => s + lineUnitPrice(i) * i.quantity, 0);
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  const add = (payload: AddPayload) =>
    dispatch({
      type: "ADD",
      payload: { ...payload, modifiers: payload.modifiers ?? [] },
    });

  const remove = (product_id: string) =>
    dispatch({ type: "REMOVE", payload: product_id });

  const updateQty = (product_id: string, quantity: number) =>
    dispatch({ type: "UPDATE_QTY", payload: { product_id, quantity } });

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
