"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="h-full w-full flex items-center justify-center p-10">
      <div className="flex flex-col items-center gap-6 p-10 bg-white rounded-[3rem] shadow-2xl border max-w-md text-center">
        <div className="w-16 h-16 rounded-3xl bg-destructive/10 flex items-center justify-center text-destructive">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-primary font-headline mb-2">
            Something went wrong
          </h3>
          <p className="text-sm text-muted-foreground">
            {error.message?.includes("permission")
              ? "There was a permissions issue loading your data. This usually resolves on retry."
              : "An unexpected error occurred while loading the dashboard."}
          </p>
        </div>
        <Button
          onClick={reset}
          className="bg-primary text-white hover:bg-primary/90 rounded-2xl px-8 h-12"
        >
          <RefreshCw className="w-4 h-4 mr-2" /> Try Again
        </Button>
      </div>
    </div>
  );
}
