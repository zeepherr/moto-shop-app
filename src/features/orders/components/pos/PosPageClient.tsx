"use client";

import React, { useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { PosWorkspace } from "./PosWorkspace";
import { PosCart } from "./PosCart";
import { usePosStore } from "../../stores/usePosStore";
import type { PosProduct } from "./PosProductCard";
import type { PosService } from "./PosServiceCard";

interface PosPageClientProps {
  categories: Array<{ id: number; name: string }>;
  products: PosProduct[];
  services: PosService[];
  productDiscountRate: number;
}

interface CartFlight {
  id: number;
  imageUrl: string;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  endX: number;
  endY: number;
  arcY: number;
  endScale: number;
}

export const PosPageClient: React.FC<PosPageClientProps> = ({
  categories,
  products,
  services,
  productDiscountRate,
}) => {
  const [activeView, setActiveView] = useState<"catalog" | "order">("catalog");
  const [cartPulse, setCartPulse] = useState(0);
  const [flight, setFlight] = useState<CartFlight | null>(null);
  const cartTargetRef = useRef<HTMLSpanElement>(null);
  const flightActiveRef = useRef(false);
  const flightIdRef = useRef(0);
  const reduceMotion = useReducedMotion();
  const cartItemCount = usePosStore((store) =>
    store.cartItems.reduce((count, item) => count + item.quantity, 0),
  );

  const pulseCart = useCallback(() => {
    if (reduceMotion || !cartTargetRef.current?.getClientRects().length) return;
    setCartPulse((current) => current + 1);
  }, [reduceMotion]);

  const handleProductAdded = useCallback((imageElement: HTMLImageElement | null) => {
    pulseCart();

    const target = cartTargetRef.current;
    if (reduceMotion || !imageElement || !target || flightActiveRef.current || !target.getClientRects().length) return;

    const sourceRect = imageElement.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const imageUrl = imageElement.currentSrc || imageElement.src;
    if (!imageUrl || sourceRect.width < 1 || sourceRect.height < 1 || targetRect.width < 1) return;

    const endScale = Math.min(1, 18 / Math.max(sourceRect.width, sourceRect.height));
    const startX = sourceRect.left;
    const startY = sourceRect.top;
    const endX = targetRect.left + targetRect.width / 2 - sourceRect.width / 2;
    const endY = targetRect.top + targetRect.height / 2 - sourceRect.height / 2;

    flightActiveRef.current = true;
    setFlight({
      id: ++flightIdRef.current,
      imageUrl,
      startX,
      startY,
      startWidth: sourceRect.width,
      startHeight: sourceRect.height,
      endX,
      endY,
      arcY: (startY + endY) / 2 - 44,
      endScale,
    });
  }, [pulseCart, reduceMotion]);

  const handleFlightComplete = () => {
    flightActiveRef.current = false;
    setFlight(null);
  };

  return (
    <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-3 sm:px-2.5 lg:h-[calc(100dvh-1.5rem)] lg:min-h-0 lg:flex-col lg:p-4">
      <h1 className="sr-only">Point of sale</h1>
      <div className="sticky top-2 z-30 -mx-2 flex justify-end px-2 sm:-mx-3 sm:px-3 2xl:hidden">
        <div className="flex min-h-11 items-center justify-end gap-2">
          {activeView === "catalog" ? (
            <button
              type="button"
              onClick={() => setActiveView("order")}
              aria-label={`Open cart with ${cartItemCount} ${cartItemCount === 1 ? "item" : "items"}`}
              className="relative inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-white/55 bg-white/75 px-4 text-sm font-semibold text-foreground shadow-[0_10px_28px_rgba(15,23,42,0.14),inset_0_1px_0_rgba(255,255,255,0.88)] backdrop-blur-2xl backdrop-saturate-150 transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:border-white/15 dark:bg-card/75 dark:hover:bg-card/90"
            >
              <motion.span
                key={cartPulse}
                ref={cartTargetRef}
                initial={cartPulse === 0 ? false : { scale: 0.72, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 520, damping: 18, mass: 0.45 }}
                className="inline-flex size-5 items-center justify-center"
              >
                <ShoppingCart className="size-4 text-primary" aria-hidden="true" />
              </motion.span>
              <span>Cart</span>
              <motion.span
                key={`count-${cartPulse}`}
                initial={cartPulse === 0 ? false : { scale: 0.65, y: 2 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 460, damping: 20 }}
                className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary/10 px-1.5 py-0.5 text-xs font-semibold tabular-nums text-primary"
              >
                {cartItemCount}
              </motion.span>
              <span className="sr-only" aria-live="polite" aria-atomic="true">
                {cartItemCount} {cartItemCount === 1 ? "item" : "items"} in cart
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setActiveView("catalog")}
              className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-white/55 bg-white/75 px-4 text-sm font-semibold text-primary shadow-[0_10px_28px_rgba(15,23,42,0.14),inset_0_1px_0_rgba(255,255,255,0.88)] backdrop-blur-2xl backdrop-saturate-150 transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:border-white/15 dark:bg-card/75 dark:hover:bg-card/90"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              <span>Catalog</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-3 lg:min-h-0 lg:flex-1 lg:grid-cols-1 lg:gap-4 2xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className={`min-w-0 ${activeView === "catalog" ? "block" : "hidden"} lg:h-full lg:min-h-0 2xl:block`}>
          <PosWorkspace
            categories={categories}
            products={products}
            services={services}
            onProductAdded={handleProductAdded}
            onServiceAdded={pulseCart}
          />
        </div>
        <div className={`min-w-0 ${activeView === "order" ? "block" : "hidden"} lg:h-full lg:min-h-0 2xl:block`}>
          <PosCart productDiscountRate={productDiscountRate} />
        </div>
      </div>
      {flight && typeof document !== "undefined" && createPortal(
        <motion.img
          key={flight.id}
          src={flight.imageUrl}
          alt=""
          aria-hidden="true"
          initial={{ x: flight.startX, y: flight.startY, scale: 1, opacity: 0.96, borderRadius: 12 }}
          animate={{
            x: [flight.startX, (flight.startX + flight.endX) / 2, flight.endX],
            y: [flight.startY, flight.arcY, flight.endY],
            scale: [1, 0.72, flight.endScale],
            opacity: [0.96, 0.92, 0.3],
            borderRadius: [12, 18, 999],
          }}
          transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
          onAnimationComplete={handleFlightComplete}
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            width: flight.startWidth,
            height: flight.startHeight,
            objectFit: "contain",
            background: "white",
            boxShadow: "0 8px 24px rgba(15, 23, 42, 0.2)",
            pointerEvents: "none",
            transformOrigin: "center center",
            zIndex: 100,
          }}
        />,
        document.body,
      )}
    </div>
  );
};
