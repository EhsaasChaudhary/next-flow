// components/nodes/question-node.tsx
import React, { useCallback } from 'react';
import { type Node, type NodeProps, Position, Handle } from '@xyflow/react';
import { ChevronDown, ChevronRight } from 'lucide-react'; // Removed CircleCheck, Circle

import { BaseNode } from '@/components/base-node';
import {
  NodeHeader,
  NodeHeaderTitle,
  NodeHeaderActions,
  NodeHeaderAction,
} from '@/components/node-header';
import { cn } from '@/lib/utils';

// Define the shape of the data for our question node (Removed 'completed', 'onToggleComplete')
export type QuestionNodeData = {
  text: string;
  children?: string[]; // Store child IDs for collapse logic
  collapsed?: boolean; // State for collapse (controlled by parent)
  // This handler is passed down from the parent App component
  onToggleCollapse?: (nodeId: string, isCollapsed: boolean) => void;
  // Removed: onToggleComplete?: (nodeId: string, isCompleted: boolean) => void;
};

export type QuestionNode = Node<QuestionNodeData>;

export function QuestionNode({ id, data }: NodeProps<QuestionNode>) {
  // Destructure data, providing default values for optional properties (Removed 'completed', 'onToggleComplete')
  const {
    text,
    collapsed = false, // Default to false if not provided
    children,
    onToggleCollapse,
  } = data;

  // Handler for the collapse button click
  // This function is correct and calls the parent handler
  const handleToggleCollapse = useCallback(() => {
    // Call the parent's handler if it exists, passing the current node's ID and the new collapsed state
    if (onToggleCollapse) {
      onToggleCollapse(id, !collapsed);
    }
  }, [id, collapsed, onToggleCollapse]); // Dependencies: id, collapsed state, and the parent handler

   // Removed: handleToggleComplete function


  // Determine if the collapse button should be shown (only if node has children defined in data)
  const showCollapseButton = children && children.length > 0;

  return (
    // Removed conditional border styling - use default border
    <BaseNode className={cn("w-64")}>
      {/* Target handle at the top for incoming connections */}
      {/* Use custom variables for handle styling - Adjusted to a neutral color */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="w-3 h-3 rounded-full border"
        style={{ backgroundColor: 'var(--color-muted-foreground)', borderColor: 'var(--color-background)' }} // Use inline style with CSS variables
      />

      <NodeHeader >
        <NodeHeaderTitle>{text}</NodeHeaderTitle>
        <NodeHeaderActions>

          {/* Collapse Toggle Button - Only show if node has children defined in data */}
          {showCollapseButton && (
            <NodeHeaderAction
              label={collapsed ? "Expand children" : "Collapse children"} // Accessibility label
              onClick={handleToggleCollapse} // Click handler
              title={collapsed ? "Expand children" : "Collapse children"} // Tooltip title
            >
              {collapsed ? <ChevronRight className="size-5"/> : <ChevronDown className="size-5"/>}
            </NodeHeaderAction>
          )}
        </NodeHeaderActions>
      </NodeHeader>

      {/* No extra content area needed for this simple node */}

      {/* Source handle at the bottom for outgoing connections */}
       {/* Render the handle if the node can be a source (has children defined in data) */}
       {showCollapseButton && (
           // Use custom variables for handle styling - Adjusted to a neutral color
           <Handle
              type="source"
              position={Position.Bottom}
              id="bottom"
              className="w-3 h-3 rounded-full border"
              style={{ backgroundColor: 'var(--color-muted-foreground)', borderColor: 'var(--color-background)' }} // Use inline style with CSS variables
            />
       )}
    </BaseNode>
  );
}