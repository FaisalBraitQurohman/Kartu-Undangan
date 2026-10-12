"use client";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { Button } from "./button";
export function Confirm({
  children,
  title,
  description,
  onConfirm,
}: {
  children: React.ReactNode;
  title: string;
  description: string;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>{children}</AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-background p-8 shadow-xl">
          <AlertDialog.Title className="text-xl font-semibold">
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description className="my-4 text-sm text-muted-foreground">
            {description}
          </AlertDialog.Description>
          <div className="flex justify-end gap-3">
            <AlertDialog.Cancel asChild>
              <Button variant="outline">Batal</Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button variant="destructive" onClick={onConfirm}>
                Lanjutkan
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
