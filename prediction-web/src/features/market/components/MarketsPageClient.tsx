"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import type { Market } from "../types/market";
import type { Category } from "../api/getCategories";
import { CompactMarketCard } from "./CompactMarketCard";

interface MarketsPageClientProps {
  initialMarkets: Market[];
  categories: Category[];
}

type FilterType = "Hot" | "New" | "ClosingSoon" | "Your bets" | "Followed";

export function MarketsPageClient({
  initialMarkets,
  categories,
}: MarketsPageClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedFilter, setSelectedFilter] = useState<FilterType>("Hot");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter markets based on category, filter, and search
  const filteredMarkets = useMemo(() => {
    let filtered = [...initialMarkets];

    // Category filter
    if (selectedCategory !== "All") {
      filtered = filtered.filter(
        (market) => market.category?.id === selectedCategory
      );
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (market) =>
          market.title.toLowerCase().includes(query) ||
          market.description.toLowerCase().includes(query) ||
          market.category?.name.toLowerCase().includes(query)
      );
    }

    // Sort filter
    switch (selectedFilter) {
      case "Hot":
        // Sort by volume descending
        filtered.sort((a, b) => b.totalVolume - a.totalVolume);
        break;
      case "New":
        // Sort by updatedAt descending
        filtered.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        break;
      case "ClosingSoon":
        // Sort by closeTime ascending
        filtered.sort((a, b) => {
          const aTime = a.closeTime ? new Date(a.closeTime).getTime() : 0;
          const bTime = b.closeTime ? new Date(b.closeTime).getTime() : 0;
          return aTime - bTime;
        });
        break;
      case "Your bets":
      case "Followed":
        // These filters require user authentication
        // For now, show all markets
        break;
    }

    return filtered;
  }, [initialMarkets, selectedCategory, selectedFilter, searchQuery]);

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden pb-20" style={{ background: "#0B0E1E" }}>
      {/* Subtle Gradient Background */}
      <div
        className="fixed inset-0 opacity-30 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, rgba(0, 255, 255, 0.15) 0%, transparent 60%)",
        }}
      />

      {/* Top Bar with Glassmorphism */}
      <div
        className="sticky top-0 w-full backdrop-blur-2xl border-b z-40"
        style={{
          background: "rgba(11, 14, 30, 0.9)",
          borderColor: "rgba(0, 255, 255, 0.15)",
        }}
      >
        {/* Guest Mode - Welcome Message & Login CTA */}
        <div className="flex items-center justify-between px-3 pt-3 pb-2">
          {/* LEFT - Welcome Message */}
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-xl border"
              style={{
                background:
                  "linear-gradient(135deg, rgba(0, 255, 255, 0.2), rgba(182, 32, 224, 0.2))",
                borderColor: "rgba(0, 255, 255, 0.4)",
                fontSize: "18px",
              }}
            >
              👋
            </div>
            <div>
              <h3
                className="text-white font-black leading-tight"
                style={{
                  fontFamily: "Orbitron, sans-serif",
                  fontSize: "14px",
                }}
              >
                歡迎來到 神預測 Prediction God
              </h3>
              <p
                className="text-[#B0B8D4] text-[10px]"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                訪客模式 · 瀏覽市場
              </p>
            </div>
          </div>

          {/* RIGHT - Login Button */}
          <a
            href="/login"
            className="px-3 py-1.5 rounded-lg backdrop-blur-xl border hover:scale-105 transition-transform"
            style={{
              background:
                "linear-gradient(135deg, rgba(0, 255, 255, 0.25), rgba(182, 32, 224, 0.2))",
              borderColor: "rgba(0, 255, 255, 0.5)",
              boxShadow: "0 0 15px rgba(0, 255, 255, 0.35)",
            }}
          >
            <span
              className="text-[#00FFFF] text-xs font-bold"
              style={{
                fontFamily: "Orbitron, sans-serif",
                textShadow: "0 0 8px rgba(0, 255, 255, 0.8)",
              }}
            >
              登入
            </span>
          </a>
        </div>

        {/* Category Tabs - Horizontal Scroll */}
        <div className="overflow-x-auto scrollbar-hide px-3 pb-2">
          <div className="flex gap-2 min-w-max">
            {[
              { key: "All", label: "全部" },
              ...categories.map((cat) => ({
                key: cat.id,
                label: cat.name,
              })),
            ].map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className="px-3 py-1.5 rounded-lg backdrop-blur-xl border whitespace-nowrap transition-all hover:scale-105"
                style={{
                  background:
                    selectedCategory === cat.key
                      ? "rgba(0, 255, 255, 0.15)"
                      : "rgba(107, 116, 148, 0.1)",
                  borderColor:
                    selectedCategory === cat.key
                      ? "rgba(0, 255, 255, 0.4)"
                      : "rgba(107, 116, 148, 0.2)",
                  boxShadow:
                    selectedCategory === cat.key
                      ? "0 0 15px rgba(0, 255, 255, 0.3)"
                      : "none",
                }}
              >
                <span
                  className="text-xs font-bold"
                  style={{
                    color: selectedCategory === cat.key ? "#00FFFF" : "#B0B8D4",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-3 pb-2">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜尋關鍵字"
              className="w-full px-4 py-2.5 pl-10 rounded-lg backdrop-blur-xl border text-white placeholder-[#6B7494] outline-none transition-all"
              style={{
                background: "rgba(11, 14, 30, 0.6)",
                borderColor: "rgba(107, 116, 148, 0.3)",
                fontFamily: "Inter, sans-serif",
                fontSize: "14px",
              }}
            />
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7494]"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="overflow-x-auto scrollbar-hide px-3 pb-3">
          <div className="flex gap-2 min-w-max">
            {[
              { key: "Hot", label: "🔥最熱門" },
              { key: "New", label: "最新" },
              { key: "ClosingSoon", label: "倒數中" },
              { key: "Your bets", label: "已下注" },
              { key: "Followed", label: "已關注" },
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setSelectedFilter(filter.key as FilterType)}
                className="px-4 py-2 rounded-lg backdrop-blur-xl border whitespace-nowrap transition-all hover:scale-105"
                style={{
                  background:
                    selectedFilter === filter.key
                      ? "rgba(182, 32, 224, 0.2)"
                      : "rgba(107, 116, 148, 0.1)",
                  borderColor:
                    selectedFilter === filter.key
                      ? "rgba(182, 32, 224, 0.5)"
                      : "rgba(107, 116, 148, 0.2)",
                  boxShadow:
                    selectedFilter === filter.key
                      ? "0 0 15px rgba(182, 32, 224, 0.4)"
                      : "none",
                }}
              >
                <span
                  className="text-xs font-bold"
                  style={{
                    color:
                      selectedFilter === filter.key ? "#B620E0" : "#B0B8D4",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {filter.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Market List - Compact */}
      <div className="relative px-3 py-2 space-y-2">
        {filteredMarkets.length === 0 ? (
          <div className="text-center py-12">
            <p
              className="text-[#6B7494] text-sm"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              沒有找到市場
            </p>
          </div>
        ) : (
          filteredMarkets.map((market, index) => (
            <CompactMarketCard key={market.shortcode} market={market} index={index} />
          ))
        )}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}



