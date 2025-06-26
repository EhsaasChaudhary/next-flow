// components/edges/data-edge.tsx
import {
  BaseEdge,
  Edge,
  EdgeProps,
  getBezierPath,
  getSmoothStepPath,
  getStraightPath,
  Node,
  Position,
} from "@xyflow/react";

export type DataEdgeData<T extends Node = Node> = {
  key?: keyof T["data"];

  path?: "bezier" | "smoothstep" | "step" | "straight";
};

export type DataEdgeType = Edge<DataEdgeData>;

export function DataEdge({
  data = { path: "bezier" },
  id,
  markerEnd,
  sourcePosition,
  sourceX,
  sourceY,
  style,
  targetPosition,
  targetX,
  targetY,
}: EdgeProps<DataEdgeType>) {
  const [edgePath] = getPath({
    type: data.path ?? "bezier",
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={style} />
    </>
  );
}

function getPath({
  type,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
}: {
  type: "bezier" | "smoothstep" | "step" | "straight";
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: Position;
  targetPosition: Position;
}) {
  switch (type) {
    case "smoothstep":
      return getSmoothStepPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
      });
    case "step":
      return getSmoothStepPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
        borderRadius: 0,
      });
    case "straight":
      const [straightPath] = getStraightPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
      });
      return [straightPath, 0, 0] as [string, number, number];
    case "bezier":
    default:
      return getBezierPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
      });
  }
}
