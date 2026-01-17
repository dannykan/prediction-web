"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { GCoinIcon } from "@/components/GCoinIcon";

interface TopupSuccessBannerProps {
  isVisible: boolean;
  gcoins: number;
  price: number;
  onClose: () => void;
}

export function TopupSuccessBanner({ isVisible, gcoins, price, onClose }: TopupSuccessBannerProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onClose, 300); // Wait for animation to finish
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible && !show) return null;

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ${
      show ? "translate-y-0" : "translate-y-full"
    }`}>
      <div className="max-w-2xl mx-auto px-4 pb-4 md:pb-6">
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl shadow-2xl p-4 md:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              {/* Success Icon */}
              <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="text-white font-bold text-base md:text-lg mb-1">
                  儲值成功！
                </div>
                <div className="flex items-center gap-2 text-white/90 text-sm md:text-base">
                  <span>餘額增加</span>
                  <GCoinIcon size={20} priority={false} />
                  <span className="font-bold text-lg">+{gcoins.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => {
                setShow(false);
                setTimeout(onClose, 300);
              }}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
