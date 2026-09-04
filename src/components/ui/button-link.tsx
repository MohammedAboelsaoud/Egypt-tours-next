import Link from "next/link"

import { Button } from "@/components/ui/button"

type ButtonProps = React.ComponentProps<typeof Button>

/**
 * A Button rendered as an anchor. Base UI needs `nativeButton={false}` when the
 * rendered element is not a real <button>, or it warns and drops semantics.
 */
export function ButtonLink({
  href,
  external = false,
  children,
  ...props
}: Omit<ButtonProps, "render"> & { href: string; external?: boolean }) {
  return (
    <Button
      nativeButton={false}
      // Base UI stamps role="button" on whatever it renders; these navigate, so
      // they must stay links for assistive tech.
      role="link"
      render={
        external ? (
          <a href={href} target="_blank" rel="noreferrer" />
        ) : (
          <Link href={href} />
        )
      }
      {...props}
    >
      {children}
    </Button>
  )
}
