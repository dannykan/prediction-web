"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <h1 className="text-4xl font-bold">發生錯誤</h1>
      <p className="text-xl text-muted-foreground">很抱歉，發生了未預期的錯誤</p>
      <Button onClick={reset}>重試</Button>
    </div>
  );
}


