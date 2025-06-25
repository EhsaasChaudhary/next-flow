// app/page.tsx
'use client';

import '@xyflow/react/dist/style.css';
import React, { useCallback, useEffect, useMemo } from 'react';

import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MiniMap,
  Edge,
  Node,
} from '@xyflow/react';

// Import your data (assuming data.json is structured as provided previously)
import initialJsonData from '@/lib/data.json'; // Adjust path if your data.json is elsewhere

// Import your custom node component
import { QuestionNode, QuestionNodeData } from '@/components/nodes/question-node';

// Define your custom node types
const nodeTypes = {
  question: QuestionNode,
};

// --- Helper functions ---

// Helper function to build child-to-multiple-parents map
const buildChildToParentsMap = (nodes: Node<QuestionNodeData>[]): Map<string, string[]> => {
  const childToParentsMap = new Map<string, string[]>();
  nodes.forEach(node => {
    if (node.data?.children) {
      node.data.children.forEach(childId => {
        if (!childToParentsMap.has(childId)) {
          childToParentsMap.set(childId, []);
        }
        childToParentsMap.get(childId)!.push(node.id);
      });
    }
  });
  return childToParentsMap;
};

// Helper function to check if a node should be hidden because an ancestor is collapsed
// REVISED: Using a more standard BFS traversal with visited set
const isNodeHiddenByAncestor = (
  nodeId: string,
  nodes: Node<QuestionNodeData>[],
  childToParentsMap: Map<string, string[]>
): boolean => {
  const nodesToCheck: string[] = []; // Queue for BFS
  const visited = new Set<string>(); // Set to track visited nodes

  // Start the BFS from the immediate parents of the given nodeId
  const initialParents = childToParentsMap.get(nodeId);
  if (initialParents) {
    for (const parentId of initialParents) {
      if (!visited.has(parentId)) { // Only add to queue and visited if not already visited
        visited.add(parentId);
        nodesToCheck.push(parentId);
      }
    }
  }

  while (nodesToCheck.length > 0) {
    const currentParentId = nodesToCheck.shift()!; // Get the next node to check (BFS)

    // Find the node object for the current parent ID
    const parentNode = nodes.find(n => n.id === currentParentId);

    // Check if this ancestor node is collapsed
    if (parentNode?.data?.collapsed) {
      return true; // Found a collapsed ancestor anywhere up the chain
    }

    // If not collapsed, add its parents (grandparents of the original node) to the queue
    if (childToParentsMap.has(currentParentId)) {
      const grandparents = childToParentsMap.get(currentParentId)!;
      for (const grandparentId of grandparents) {
        if (!visited.has(grandparentId)) { // Only add to queue and visited if not already visited
          visited.add(grandparentId);
          nodesToCheck.push(grandparentId);
        }
      }
    }
  }

  // If the loop finishes, no collapsed ancestor was found among the loaded nodes
  return false;
};

// Helper function to calculate the 'hidden' property for all nodes and edges
// This function remains the same, applying the hiding logic from isNodeHiddenByAncestor
const calculateVisibility = (
  currentNodes: Node<QuestionNodeData>[],
  currentEdges: Edge[],
  childToParentsMap: Map<string, string[]>
) => {
  const hiddenNodeIds = new Set<string>();

  currentNodes.forEach(node => {
    if (isNodeHiddenByAncestor(node.id, currentNodes, childToParentsMap)) {
      hiddenNodeIds.add(node.id);
    }
  });

  const nextNodes = currentNodes.map(node => ({
    ...node,
    hidden: hiddenNodeIds.has(node.id),
  }));

  const nextEdges = currentEdges.map(edge => ({
    ...edge,
    hidden: hiddenNodeIds.has(edge.source) || hiddenNodeIds.has(edge.target),
  }));

  return { nextNodes, nextEdges };
};
// --- End Helper functions ---

// REMOVED: const QUESTIONS_PER_PAGE = 10; // Define how many questions per page

function App() {
  // Ensure generic types match Node/Edge types from @xyflow/react
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<QuestionNodeData>>([]);
  const [edges, setEdges, onEdgesState] = useEdgesState<Edge>([]); // Renamed variable from onEdgesChange to onEdgesState for clarity

  // REMOVED: State to manage pagination
  // REMOVED: const [loadedQuestionsCount, setLoadedQuestionsCount] = useState(QUESTIONS_PER_PAGE);

  // Using all data from the start to fully test hiding logic
  const currentDataSlice = useMemo(() => {
    return initialJsonData; // Load all initial data
  }, []); // Empty dependency array ensures this runs only once on mount

  // Effect to generate nodes and edges whenever the data slice changes (initially with all data)
  useEffect(() => {
    const currentNodes: Node<QuestionNodeData>[] = currentDataSlice.map(item => ({
      id: item.id,
      type: 'question',
      data: {
        ...item,
        collapsed: false, // Nodes are initially not collapsed
      },
      position: item.position, // Assuming initial position is in your data
      hidden: false, // Nodes are initially visible
    }));

    const currentEdges: Edge[] = [];
    currentDataSlice.forEach(item => {
      if (item.children) {
        item.children.forEach(childId => {
          // Only add edge if both source and target nodes are in the current slice (full data in this case)
          const sourceNodeExists = currentNodes.find(node => node.id === item.id);
          const targetNodeExists = currentNodes.find(node => node.id === childId);

          if (sourceNodeExists && targetNodeExists) {
            currentEdges.push({
              id: `${item.id}-${childId}`,
              source: item.id,
              target: childId,
              type: 'smoothstep', // Or 'default', 'straight', etc.
              sourceHandle: 'bottom', // Adjust if using handles
              targetHandle: 'top',   // Adjust if using handles
              hidden: false, // Edges are initially visible
            });
          }
        });
      }
    });

    // Calculate initial visibility based on collapsed state (all are initially not collapsed)
    const childToParentsMap = buildChildToParentsMap(currentNodes);
    const { nextNodes, nextEdges } = calculateVisibility(currentNodes, currentEdges, childToParentsMap);

    setNodes(nextNodes);
    setEdges(nextEdges);

  }, [currentDataSlice]); // Depend on the data slice

  // --- Custom handlers for node actions ---

  const handleToggleCollapse = useCallback((nodeId: string, isCollapsed: boolean) => {
    setNodes(currentNodes => {
      // Update the collapsed state for the clicked node
      const nodesWithUpdatedCollapse = currentNodes.map(node =>
        node.id === nodeId
          ? { ...node, data: { ...node.data!, collapsed: isCollapsed } as QuestionNodeData }
          : node
      );

      // Recalculate visibility for ALL loaded nodes and edges based on the new collapse state
      // This is where the transitive hiding happens, using the revised isNodeHiddenByAncestor
      const childToParentsMap = buildChildToParentsMap(nodesWithUpdatedCollapse);
      const { nextNodes, nextEdges } = calculateVisibility(nodesWithUpdatedCollapse, edges, childToParentsMap);

      // Update edges state directly here
      setEdges(nextEdges);
      return nextNodes; // Return the updated nodes state for setNodes
    });
  }, [edges, setEdges]); // Include edges and setEdges as dependencies

  // Inject handlers into node data before passing to ReactFlow
  const nodesWithHandlers: Node<QuestionNodeData>[] = useMemo(() => {
    return nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        onToggleCollapse: handleToggleCollapse,
      }
    }));
  }, [nodes, handleToggleCollapse]); // Depend on nodes and the handler

  return (
    <div className="w-full h-full p-8 overflow-hidden">
      <ReactFlow
        nodes={nodesWithHandlers}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesState} // Use onEdgesState here
        // onConnect={onConnect} // Add if you need edge creation
        nodeTypes={nodeTypes}
        fitView // Fit initial view
        proOptions={{ hideAttribution: true }}
        // ReactFlow will automatically fill its w-full h-full absolute parent
      >
        {/* IMPORTANT: Background, MiniMap, Controls go inside ReactFlow */}
        <Background />
        {/* Add style prop with high zIndex to ensure they are above the footer */}
        <MiniMap style={{ zIndex: 20 }} />
        {/* Add style prop with high zIndex to ensure they are above the footer */}
        <Controls style={{ zIndex: 20 }} />
      </ReactFlow>

    </div>
  );
}

export default App;