"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { getMe } from "@/features/user/api/getMe";
import type { User } from "@/features/user/types/user";
import { useEffect } from "react";

type FilterType = "all" | "latest" | "closingSoon" | "followed";

interface MarketFilterProps {
  className?: string;
}

export function MarketFilter({ className }: MarketFilterProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [currentFilter, setCurrentFilter] = useState<FilterType>(
    (searchParams.get("filter") as FilterType) || "all"
  );
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Load user to check if "followed" filter should be available
    getMe()
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  const handleFilterChange = (filter: FilterType) => {
    // If filter is "followed" and user is not logged in, show message
    if (filter === "followed" && !user) {
      alert("請先登入以查看已關注的市場");
      return;
    }

    setCurrentFilter(filter);
    const params = new URLSearchParams(searchParams.toString());
    
    if (filter === "all") {
      params.delete("filter");
    } else {
      params.set("filter", filter);
    }

    // Keep other query parameters (search, categoryId)
    router.push(`/home?${params.toString()}`);
  };

  const filters = [
    { id: "all" as FilterType, label: "全部" },
    { id: "latest" as FilterType, label: "最新" },
    { id: "closingSoon" as FilterType, label: "倒數中" },
    ...(user ? [{ id: "followed" as FilterType, label: "已關注" }] : []),
  ];

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => handleFilterChange(filter.id)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${
                currentFilter === filter.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }
            `}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
}

