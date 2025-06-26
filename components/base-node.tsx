// components/base-node.tsx
import { forwardRef, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface BaseNodeProps extends HTMLAttributes<HTMLDivElement> {
  selected?: boolean;
  // Removed header/content slots - layout is done in the child component
}

export const BaseNode = forwardRef<
  HTMLDivElement,
  BaseNodeProps
>(({ className, selected, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // Simple base styling: border, background, rounded corners, overflow hidden for corner
      "relative rounded-md border bg-card text-card-foreground overflow-hidden",
      className,
      // Selected state styling
      selected ? "border-muted-foreground shadow-lg" : "",
      // Hover effect
      "hover:ring-1 hover:ring-primary", // Example hover ring
    )}
    tabIndex={0} // Make it focusable for tooltip trigger
    {...props} // Pass other props like dimensions, etc.
  >
    {/* Content goes directly inside here in QuestionNode */}
  </div>
));

BaseNode.displayName = "BaseNode";