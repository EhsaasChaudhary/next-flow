// components/nodes/question-node.tsx
import React, { useCallback } from 'react';
import { type Node, type NodeProps, Position, Handle } from '@xyflow/react';
import { ChevronDown, ChevronRight, Puzzle } from 'lucide-react';

import { BaseNode } from '@/components/base-node';
import {
  NodeTitleCorner, // Import the updated component
  NodeHeaderAction, // Import action button
  NodeHeaderDeleteAction // Keep or remove if you want a delete button
} from '@/components/node-header';
import {
    TooltipNode,
    TooltipContent,
    // TooltipTrigger, // Not needed as BaseNode triggers
} from '@/components/tooltip-node';
import { cn } from '@/lib/utils';

// Define the shape of the data for our question node (same as before)
export type QuestionNodeData = {
  text: string;
  shortTitle: string;
  children?: string[];
  collapsed?: boolean;
  onToggleCollapse?: (nodeId: string, isCollapsed: boolean) => void;
  difficulty?: string;
  topic?: string;
  description?: string;
  skills_tested?: string[];
};

export type QuestionNode = Node<QuestionNodeData>;

export function QuestionNode({ id, data, selected }: NodeProps<QuestionNode>) {
  const {
    text,
    shortTitle,
    collapsed = false,
    children,
    onToggleCollapse,
  } = data;

  const handleToggleCollapse = useCallback(() => {
    if (onToggleCollapse) {
      onToggleCollapse(id, !collapsed);
    }
  }, [id, collapsed, onToggleCollapse]);

  const canHaveChildren = children && children.length > 0;
  const showCollapseButton = canHaveChildren;
  const showSourceHandle = canHaveChildren && !collapsed;

  return (
    <TooltipNode selected={selected}>
      {/* Target handle at the top */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="w-3 h-3 rounded-full border z-40" // Higher z-index than corner/actions
        style={{ backgroundColor: 'var(--color-muted-foreground)', borderColor: 'var(--color-background)' }}
      />

      {/* BaseNode as the main card container */}
      <BaseNode className={cn("w-64 h-24")}> {/* Set node dimensions */}

        {/* Absolutely positioned corner title */}
        {/* It positions itself using absolute top/left */}
        <NodeTitleCorner icon={<Puzzle className="size-4" />}>
            {shortTitle}
        </NodeTitleCorner>

        {/* Absolutely positioned container for actions at top-right */}
        <div className="absolute top-0 right-0 flex items-center gap-1 p-1 z-30"> {/* Adjust padding/gap/z-index */}
           {/* Collapse Toggle Button */}
           {showCollapseButton && (
             <NodeHeaderAction
               label={collapsed ? "Expand children" : "Collapse children"}
               onClick={handleToggleCollapse}
               title={collapsed ? "Expand children" : "Collapse children"}
             >
               {collapsed ? <ChevronRight className="size-5"/> : <ChevronDown className="size-5"/>}
             </NodeHeaderAction>
           )}
           {/* Optional: Delete action */}
           <NodeHeaderDeleteAction />
        </div>

      </BaseNode>

      {/* Source handle at the bottom */}
       {showSourceHandle && (
           <Handle
              type="source"
              position={Position.Bottom}
              id="bottom"
              className="w-3 h-3 rounded-full border z-40" // Higher z-index
              style={{ backgroundColor: 'var(--color-muted-foreground)', borderColor: 'var(--color-background)' }}
            />
       )}

       {/* Tooltip Content - Only show text */}
        <TooltipContent position={Position.Right}>
             <div className="text-sm p-1 max-w-xs">
                 <p>{text}</p> 
             </div>
        </TooltipContent>

    </TooltipNode>
  );
}