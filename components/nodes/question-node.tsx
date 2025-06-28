import React, { useCallback } from 'react';
import { type Node, type NodeProps, Position, Handle } from '@xyflow/react';
import { ChevronDown, ChevronRight, Puzzle } from 'lucide-react';

import { BaseNode } from '@/components/base-node';
import { Badge } from '@/components/ui/badge'; // <-- 1. Import the Badge component
import {
  NodeTitleCorner,
  NodeHeaderAction,
  NodeHeaderDeleteAction
} from '@/components/node-header';
import {
    TooltipNode,
    TooltipContent,
} from '@/components/tooltip-node';
import { cn } from '@/lib/utils';

// Data shape is the same, no changes needed here
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
    difficulty,
    topic,
    description,
    skills_tested,
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

  const hasTooltipContent = !!(description || difficulty || topic || (skills_tested && skills_tested.length > 0));

  return (
    <TooltipNode selected={selected}>
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="w-3 h-3 rounded-full border z-40"
        style={{ backgroundColor: 'var(--color-muted-foreground)', borderColor: 'var(--color-background)' }}
      />

      <BaseNode className={cn("w-64 min-h-24")}>
        <NodeTitleCorner icon={<Puzzle className="size-4" />}>
            {shortTitle}
        </NodeTitleCorner>

        <div className="absolute top-0 right-0 flex items-center gap-1 p-1 z-30">
           {showCollapseButton && (
             <NodeHeaderAction
               label={collapsed ? "Expand children" : "Collapse children"}
               onClick={handleToggleCollapse}
               title={collapsed ? "Expand children" : "Collapse children"}
             >
               {collapsed ? <ChevronRight className="size-5"/> : <ChevronDown className="size-5"/>}
             </NodeHeaderAction>
           )}
           <NodeHeaderDeleteAction />
        </div>
        
        <div className="flex h-full items-center justify-center p-4 pt-10 text-left">
            <p className="text-sm">{text}</p>
        </div>
      </BaseNode>

       {showSourceHandle && (
           <Handle
              type="source"
              position={Position.Bottom}
              id="bottom"
              className="w-3 h-3 rounded-full border z-40"
              style={{ backgroundColor: 'var(--color-muted-foreground)', borderColor: 'var(--color-background)' }}
            />
       )}

       {/* Tooltip Content - Updated to use Badges */}
        {hasTooltipContent && (
            <TooltipContent position={Position.Right}>
                <div className="space-y-3 p-2 text-sm max-w-xs"> {/* Increased space-y for clarity */}
                    {description && <p className="text-muted-foreground italic">{description}</p>}
                    <div className="space-y-1">
                        {topic && <p><strong>Topic:</strong> {topic}</p>}
                        {difficulty && <p><strong>Difficulty:</strong> {difficulty}</p>}
                    </div>
                    {/* --- 2. This is the updated skills section --- */}
                    {skills_tested && skills_tested.length > 0 && (
                        <div>
                            <strong className="font-semibold block mb-2">Skills Tested:</strong>
                            <div className="flex flex-wrap gap-1">
                                {skills_tested.map((skill, i) => (
                                    <Badge key={i} variant="secondary">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </TooltipContent>
        )}
    </TooltipNode>
  );
}