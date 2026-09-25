"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"

/** Delete button with a confirmation dialog, wired to a server action. */
export function DeleteAction({
  id,
  name,
  action,
  label = "Delete",
}: {
  id: string
  name: string
  action: (id: string) => Promise<void>
  label?: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`${label} ${name}`}
        onClick={() => setOpen(true)}
        className="text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="size-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete “{name}”?</DialogTitle>
            <DialogDescription>
              This cannot be undone. Any bookings that reference it will keep
              their record but lose the link.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose
              nativeButton={false}
              render={
                <Button variant="outline" className="h-10">
                  Cancel
                </Button>
              }
            />
            <Button
              disabled={pending}
              className="h-10 bg-destructive text-white hover:bg-destructive/90"
              onClick={() =>
                startTransition(async () => {
                  try {
                    await action(id)
                    toast.success(`“${name}” deleted`)
                    setOpen(false)
                    router.refresh()
                  } catch (error) {
                    toast.error(
                      error instanceof Error ? error.message : "Delete failed"
                    )
                  }
                })
              }
            >
              {pending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function EditLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      aria-label="Edit"
      className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-lapis"
    >
      <Pencil className="size-4" />
    </Link>
  )
}

/** Optimistic switch bound to a server action, e.g. published / featured. */
export function ToggleAction({
  id,
  checked,
  action,
  label,
}: {
  id: string
  checked: boolean
  action: (id: string, value: boolean) => Promise<void>
  label: string
}) {
  const router = useRouter()
  const [value, setValue] = useState(checked)
  const [pending, startTransition] = useTransition()

  return (
    <Switch
      checked={value}
      disabled={pending}
      aria-label={label}
      onCheckedChange={(next) => {
        setValue(next)
        startTransition(async () => {
          try {
            await action(id, next)
            router.refresh()
          } catch {
            setValue(!next)
            toast.error("Could not update")
          }
        })
      }}
    />
  )
}
