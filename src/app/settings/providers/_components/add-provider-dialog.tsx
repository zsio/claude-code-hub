"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ServerCog } from "lucide-react";
import { ProviderForm } from "./forms/provider-form";
import { FormErrorBoundary } from "@/components/form-error-boundary";

export function AddProviderDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <ServerCog className="h-4 w-4" /> 新增服务商
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <FormErrorBoundary>
          <ProviderForm mode="create" onSuccess={() => setOpen(false)} />
        </FormErrorBoundary>
      </DialogContent>
    </Dialog>
  );
}
