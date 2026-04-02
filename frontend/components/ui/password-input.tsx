"use client"

import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { Input } from "./input"
import { cn } from "@/lib/utils"

interface PasswordInputProps extends React.ComponentProps<"input"> {}

function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = React.useState(false)

  return (
    <div className="relative w-full">
      <Input
        type={showPassword ? "text" : "password"}
        className={cn("pr-10", className)}
        {...props}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShowPassword((prev) => !prev)}
        className="absolute right-0 top-0 flex h-full w-10 items-center justify-center text-muted-foreground/60 hover:text-foreground focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Eye className="h-4 w-4" aria-hidden="true" />
        )}
        <span className="sr-only">
          {showPassword ? "Hide password" : "Show password"}
        </span>
      </button>
    </div>
  )
}

export { PasswordInput }
