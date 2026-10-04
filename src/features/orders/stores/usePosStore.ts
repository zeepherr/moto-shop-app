import { create } from "zustand";
import type { PosCartItem, SelectedMember } from "../types";

interface PosState {
  cartItems: PosCartItem[];
  selectedMember: SelectedMember | null;
  selectedMotorId: number | null;
  pendingOrderId: number | null;

  setCartItems: (items: PosCartItem[]) => void;
  addItem: (item: PosCartItem) => boolean;
  increaseQuantity: (itemType: string, id: number) => boolean;
  decreaseQuantity: (itemType: string, id: number) => void;
  removeItem: (itemType: string, id: number) => void;
  clearCart: () => void;

  setSelectedMember: (member: SelectedMember | null) => void;
  setSelectedMotorId: (motorId: number | null) => void;
  setPendingOrderId: (orderId: number | null) => void;
  resetOrder: () => void;
}

export const usePosStore = create<PosState>((set, get) => ({
  cartItems: [],
  selectedMember: null,
  selectedMotorId: null,
  pendingOrderId: null,

  setCartItems: (items) => set({ cartItems: items }),

  addItem: (item) => {
    const { cartItems } = get();
    const existing = cartItems.find((i) => i.itemType === item.itemType && i.id === item.id);

    if (existing) {
      if (existing.maxQuantity != null && existing.quantity >= existing.maxQuantity) {
        return false;
      }
      set({
        cartItems: cartItems.map((i) =>
          i.itemType === item.itemType && i.id === item.id
            ? { ...i, quantity: i.quantity + 1 }
            : i,
        ),
      });
      return true;
    }

    const quantity = item.quantity ?? 1;
    if (item.maxQuantity != null && quantity > item.maxQuantity) {
      return false;
    }

    set({ cartItems: [...cartItems, { ...item, quantity }] });
    return true;
  },

  increaseQuantity: (itemType, id) => {
    const { cartItems } = get();
    const item = cartItems.find((i) => i.itemType === itemType && i.id === id);
    if (!item) return false;

    if (item.maxQuantity != null && item.quantity >= item.maxQuantity) {
      return false;
    }

    set({
      cartItems: cartItems.map((i) =>
        i.itemType === itemType && i.id === id ? { ...i, quantity: i.quantity + 1 } : i,
      ),
    });
    return true;
  },

  decreaseQuantity: (itemType, id) => {
    const { cartItems } = get();
    set({
      cartItems: cartItems
        .map((i) =>
          i.itemType === itemType && i.id === id ? { ...i, quantity: i.quantity - 1 } : i,
        )
        .filter((i) => i.quantity > 0),
    });
  },

  removeItem: (itemType, id) => {
    const { cartItems } = get();
    set({
      cartItems: cartItems.filter((i) => !(i.itemType === itemType && i.id === id)),
    });
  },

  clearCart: () => set({ cartItems: [] }),

  setSelectedMember: (member) => set({ selectedMember: member, selectedMotorId: null }),

  setSelectedMotorId: (motorId) => set({ selectedMotorId: motorId }),

  setPendingOrderId: (orderId) => set({ pendingOrderId: orderId }),

  resetOrder: () =>
    set({
      cartItems: [],
      selectedMember: null,
      selectedMotorId: null,
      pendingOrderId: null,
    }),
}));
