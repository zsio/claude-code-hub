"use client";
import { ProviderList } from "./provider-list";
import type { ProviderDisplay } from "@/types/provider";
import type { User } from "@/types/user";

interface ProviderManagerProps {
  providers: ProviderDisplay[];
  currentUser?: User;
}

export function ProviderManager({ providers, currentUser }: ProviderManagerProps) {
  return (
    <div className="space-y-4">
      <ProviderList providers={providers} currentUser={currentUser} />
    </div>
  );
}

export type { ProviderDisplay } from "@/types/provider";