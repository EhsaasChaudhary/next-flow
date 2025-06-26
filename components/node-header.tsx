// components/node-header.tsx
import { forwardRef, useCallback, HTMLAttributes, ReactNode } from "react";
import { useNodeId, useReactFlow } from "@xyflow/react";
import { EllipsisVertical, Trash } from "lucide-react";

import { cn } from "@/lib/utils";
// NodeHeaderTitle, NodeHeaderIcon components are likely not used directly in the new structure
// import { Slot } from "@radix-ui/react-slot";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";

/* NODE TITLE CORNER -------------------------------------------------------- */

export type NodeTitleCornerProps = HTMLAttributes<HTMLDivElement> & {
    icon?: ReactNode; // Optional icon slot
};

/**
 * A component that creates the styled corner area for the node title.
 * Positioned absolutely at the top-left of the node by the parent.
 */
export const NodeTitleCorner = forwardRef<
  HTMLDivElement,
  NodeTitleCornerProps
>(({ className, icon, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      {...props}
      className={cn(
        "flex items-center gap-1 bg-primary text-primary-foreground pl-3 pr-2 py-1.5 text-sm", // Padding, text size
        "rounded-md", // Apply rounding to all corners
        "absolute top-0 left-0 z-20 user-select-none", // Position absolutely, high z-index
        // Offset slightly to align with border edge and make it pop
        "transform -translate-x-[1px] -translate-y-[1px]",
        "shadow-sm border border-primary-foreground/20", // Example border/shadow for definition
        className
      )}
    >
      {icon} {/* Optional icon */}
      <span className="font-semibold leading-none">{children}</span> {/* Title text, added leading-none */}
    </div>
  );
});

NodeTitleCorner.displayName = "NodeTitleCorner";


/* NODE HEADER (REMOVED) ---------------------------------------------------- */
// The old NodeHeader component is no longer used.

/* NODE HEADER ACTIONS ------------------------------------------------------ */
// Keep as a container for actions, its position is managed by the parent (QuestionNode)
export type NodeHeaderActionsProps = HTMLAttributes<HTMLDivElement>;

/**
 * A container for right-aligned action buttons. Positioned by the parent.
 */
export const NodeHeaderActions = forwardRef<
  HTMLDivElement,
  NodeHeaderActionsProps
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      {...props}
      // Removed z-index here, apply in parent if needed based on exact layout
      className={cn("flex items-center gap-1", className)}
    />
  );
});
NodeHeaderActions.displayName = "NodeHeaderActions";

/* NODE HEADER ACTION ------------------------------------------------------- */

export type NodeHeaderActionProps = React.ComponentProps<typeof Button> & {
  label: string;
};

export const NodeHeaderAction = forwardRef<
  HTMLButtonElement,
  NodeHeaderActionProps
>(({ className, label, title, ...props }, ref) => {
  return (
    <Button
      ref={ref}
      variant="ghost"
      aria-label={label}
      title={title ?? label}
      className={cn(className, "nodrag size-6 p-1")}
      {...props}
    />
  );
});
NodeHeaderAction.displayName = "NodeHeaderAction";

/* NODE HEADER MENU ACTION --------------------------------------- */

export type NodeHeaderMenuActionProps = Omit<
  NodeHeaderActionProps,
  "onClick"
> & {
  trigger?: ReactNode;
};

export const NodeHeaderMenuAction = forwardRef<
  HTMLButtonElement,
  NodeHeaderMenuActionProps
>(({ trigger, children, ...props }, ref) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <NodeHeaderAction ref={ref} {...props}>
          {trigger ?? <EllipsisVertical />}
        </NodeHeaderAction>
      </DropdownMenuTrigger>
      <DropdownMenuContent>{children}</DropdownMenuContent>
    </DropdownMenu>
  );
});

NodeHeaderMenuAction.displayName = "NodeHeaderMenuAction";

/* NODE HEADER DELETE ACTION --------------------------------------- */

export const NodeHeaderDeleteAction = () => {
  const id = useNodeId();
  const { setNodes } = useReactFlow();

  const handleClick = useCallback(() => {
    setNodes((prevNodes) => prevNodes.filter((node) => node.id !== id));
  }, [id, setNodes]);

  return (
    <NodeHeaderAction onClick={handleClick} variant="ghost" label="Delete node">
      <Trash />
    </NodeHeaderAction>
  );
};

NodeHeaderDeleteAction.displayName = "NodeHeaderDeleteAction";