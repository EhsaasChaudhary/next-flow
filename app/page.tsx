// app/page.tsx
'use client';

import '@xyflow/react/dist/style.css';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MiniMap,
  Edge,
  Node,
  XYPosition,
  Panel,
} from '@xyflow/react';

// Import your common questions data
// Assuming lib/questions.json is the updated one with shortTitle and no children
import commonQuestionsData from '@/lib/questions.json';

// Import your custom node and edge components
import { QuestionNode, QuestionNodeData } from '@/components/nodes/question-node';
import { DataEdge, DataEdgeData } from '@/components/data-edge'; // Corrected path

// Import the user context hook
import { useUserContext } from '@/app/provider/user-provider';

// Define your custom node and edge types
const nodeTypes = {
  question: QuestionNode,
};

const edgeTypes = {
  'data-edge': DataEdge,
};


const demoUserRelationships: { [userId: string]: { [parentId: string]: string[] } } = {
  user1: {
    Q1: ['Q2'],
    Q2: ['Q3', 'Q4'], // Branching
    Q3: ['Q5'],
    Q4: ['Q5'],
    Q5: ['Q6'],
    Q6: ['Q7'],
    Q7: ['Q8'],
    Q8: ['Q9', 'Q10'], // Branching
    Q9: ['Q11'],
    Q10: ['Q11'],
    Q11: ['Q12'],
    Q12: ['Q13'],
    Q13: ['Q14'],
    Q14: ['Q15', 'Q16'], // Branching
    Q15: ['Q17'],
    Q16: ['Q17'],
    Q17: ['Q18'],
    Q18: ['Q19'],
    Q19: ['Q20'],
    Q20: [], // Terminal node for this path
  },
  user2: {
    // Bob follows a specific path, skipping some nodes and terminating early on one branch
    Q1: ['Q2'],
    Q2: ['Q3'], // Only follows Q3 from Q2
    Q3: ['Q5'],
    Q5: ['Q6'],
    Q6: ['Q8'], // Skips Q7
    Q8: ['Q10'], // Only follows Q10 from Q8
    Q10: ['Q11'],
    Q11: ['Q13'], // Skips Q12
    Q13: ['Q14'],
    Q14: ['Q16'], // Skips Q15
    Q16: ['Q19'], // Skips Q17, Q18
    Q19: [], // Bob's path ends here
  },
   user3: {
    // Charlie explores a different path with some branches ending
    Q1: ['Q4'], // Starts with Q4 from Q1
    Q4: ['Q5'],
    Q5: ['Q7', 'Q10'], // Branches to Q7 and Q10
    Q7: ['Q9'], // Q7's path continues to Q9
    Q9: [], // Q9 is a terminal node for this branch
    Q10: ['Q11'], // Q10's path continues
    Q11: ['Q15'], // Skips Q12, Q13, Q14
    Q15: ['Q18'],
    Q18: ['Q20'],
    Q20: [], // Terminal node
  }
};

// Add this interface before the commonQuestionsMap
interface CommonQuestionData {
  id: string;
  position: XYPosition;
  text: string;
  shortTitle: string;
  [key: string]: unknown; // For other properties
}

// Map common question data for easy lookup
const commonQuestionsMap = new Map(
    (commonQuestionsData as CommonQuestionData[])
    .map(q => [q.id, q])
);

// --- Helper functions ---

// Helper function to build child-to-multiple-parents map based on user relationships
const buildChildToParentsMap = (relationships: { [parentId: string]: string[] }): Map<string, string[]> => {
  const childToParentsMap = new Map<string, string[]>();
  for (const parentId in relationships) {
    if (relationships.hasOwnProperty(parentId)) {
      const childIds = relationships[parentId];
      childIds.forEach(childId => {
        if (!childToParentsMap.has(childId)) {
          childToParentsMap.set(childId, []);
        }
        childToParentsMap.get(childId)!.push(parentId);
      });
    }
  }
  return childToParentsMap;
};


// Helper function to check if a node should be hidden because an ancestor is collapsed
// Operates on the subset of nodes relevant to the user
const isNodeHiddenByAncestor = (
  nodeId: string,
  userNodes: Node<QuestionNodeData>[], // Now works on the user's specific nodes
  childToParentsMap: Map<string, string[]>
): boolean => {
  const nodesToCheck: string[] = [];
  const visited = new Set<string>();

  // Start from immediate parents in the user's graph
  const initialParents = childToParentsMap.get(nodeId);

  if (!initialParents || initialParents.length === 0) {
      return false; // Node has no parents in this user's graph, cannot be hidden by ancestor
  }

  for (const parentId of initialParents) {
    if (!visited.has(parentId)) {
      visited.add(parentId);
      nodesToCheck.push(parentId);
    }
  }

  // BFS traversal up the graph
  while (nodesToCheck.length > 0) {
    const currentParentId = nodesToCheck.shift()!;

    // Find the parent node within the *user's subset of nodes*
    const parentNode = userNodes.find(n => n.id === currentParentId);

    // If the parent node is not found in the userNodes (shouldn't happen if
    // buildUserGraph includes all relevant nodes), or if it's collapsed, return true.
    if (!parentNode || parentNode.data?.collapsed) {
      // If parentNode is undefined, it means a parent in the relationships wasn't
      // added to the userNodes subset, which would be an error in buildUserGraph.
      // For this logic, encountering a collapsed node is the main check.
      if (parentNode?.data?.collapsed) {
         return true; // Found a collapsed ancestor
      }
    } else {
        // If not collapsed, add its parents (grandparents) to the queue
        if (childToParentsMap.has(currentParentId)) {
            const grandparents = childToParentsMap.get(currentParentId)!;
            for (const grandparentId of grandparents) {
                if (!visited.has(grandparentId)) {
                    visited.add(grandparentId);
                    nodesToCheck.push(grandparentId);
                }
            }
        }
    }
  }

  // If the loop finishes, no collapsed ancestor was found in the user's graph
  return false;
};

// Helper function to calculate the 'hidden' property for user's nodes and edges
// Operates on the subset of nodes and edges relevant to the user
const calculateVisibility = (
  userNodes: Node<QuestionNodeData>[], // User's specific nodes
  userEdges: Edge<DataEdgeData>[], // User's specific edges
  relationships: { [parentId: string]: string[] }
): { nextNodes: Node<QuestionNodeData>[], nextEdges: Edge<DataEdgeData>[] } => {

  const childToParentsMap = buildChildToParentsMap(relationships);
  const hiddenNodeIds = new Set<string>();

  // Determine which of the user's nodes should be hidden
  userNodes.forEach(node => {
    if (isNodeHiddenByAncestor(node.id, userNodes, childToParentsMap)) {
       hiddenNodeIds.add(node.id);
    }
  });

  // Update the hidden property for nodes based on calculated hidden IDs
  const nextNodes = userNodes.map(node => ({
    ...node,
    hidden: hiddenNodeIds.has(node.id),
    // Ensure collapsed state and children are preserved (they were populated in buildUserGraph)
    data: {
      ...node.data!,
      collapsed: node.data?.collapsed ?? false,
      children: node.data?.children || [],
    },
  }));

  // Update hidden property for edges
  const nextEdges = userEdges.map(edge => ({
    ...edge,
    // An edge is hidden if either its source or target node is hidden
    hidden: hiddenNodeIds.has(edge.source) || hiddenNodeIds.has(edge.target),
  }));


  return { nextNodes, nextEdges };
};

// Local Storage Key
const getLocalStorageKey = (userId: string) => `userGraphData_${userId}`;

// Type for the data stored in local storage
interface UserGraphData {
  nodes: Node<QuestionNodeData>[]; // Only the nodes relevant to the user
  edges: Edge<DataEdgeData>[]; // Only the edges relevant to the user
}


// --- New function to build the graph for a specific user ---
const buildUserGraph = (userId: string): { nodes: Node<QuestionNodeData>[], edges: Edge<DataEdgeData>[] } => {
    const userRelationships = demoUserRelationships[userId];

    if (!userRelationships) {
        console.error(`Relationships not defined for user: ${userId}`);
        return { nodes: [], edges: [] };
    }

    // 1. Determine the set of nodes relevant to this user's graph
    const relevantNodeIds = new Set<string>();
    for (const parentId in userRelationships) {
        if (userRelationships.hasOwnProperty(parentId)) {
            relevantNodeIds.add(parentId);
            userRelationships[parentId].forEach(childId => relevantNodeIds.add(childId));
        }
    }

    // 2. Load existing user data from local storage
    let loadedNodes: Node<QuestionNodeData>[] = [];
    let loadedCollapsedStates = new Map<string, boolean>();

    try {
        const storedData = localStorage.getItem(getLocalStorageKey(userId));
        if (storedData) {
            const graphData: UserGraphData = JSON.parse(storedData);
            loadedNodes = graphData.nodes || [];
            loadedNodes.forEach(node => {
                if (node.data?.collapsed !== undefined) {
                    loadedCollapsedStates.set(node.id, node.data.collapsed);
                }
            });
            console.log(`Loaded graph data for user ${userId} from local storage.`);
        }
    } catch (error) {
        console.error("Failed to load or parse graph data from local storage for user", userId, error);
        // If loading fails, proceed with fresh initialization
    }


    // 3. Build the user's nodes based on relevant IDs and common data, applying loaded state
    const userNodes: Node<QuestionNodeData>[] = [];
    relevantNodeIds.forEach(nodeId => {
        const commonData = commonQuestionsMap.get(nodeId);
        if (!commonData) {
            console.warn(`Common data not found for node ID: ${nodeId}. Skipping.`);
            return; // Skip if common data is missing
        }

        const loadedNode = loadedNodes.find(n => n.id === nodeId); // Find corresponding loaded node state

        userNodes.push({
            id: nodeId,
            type: 'question',
            data: {
                ...commonData, // Spread common data (text, shortTitle, position, etc.)
                ...loadedNode?.data, // Overlay any loaded data (e.g., completed status if added back)
                children: userRelationships[nodeId] || [], // Add user-specific children from relationships
                collapsed: loadedCollapsedStates.get(nodeId) ?? false, // Use loaded state or default false
            } as QuestionNodeData, // Type assertion
            position: commonData.position || {x:0, y:0} as XYPosition, // Use position from common data
            hidden: false, // Initial state before calculating visibility
        });
    });


    // 4. Build the user's edges based on relationships and the correct type
    const userEdges: Edge<DataEdgeData>[] = [];
     for (const sourceId in userRelationships) {
        if (userRelationships.hasOwnProperty(sourceId)) {
            const targetIds = userRelationships[sourceId];
            targetIds.forEach(targetId => {
                 // Only add edge if both source and target nodes are relevant and exist in common data
                 if (relevantNodeIds.has(sourceId) && relevantNodeIds.has(targetId) && commonQuestionsMap.has(sourceId) && commonQuestionsMap.has(targetId)) {
                    userEdges.push({
                        id: `${sourceId}-${targetId}`,
                        source: sourceId,
                        target: targetId,
                        type: 'data-edge', // Use the custom edge type
                        sourceHandle: 'bottom', // Assuming handles are used
                        targetHandle: 'top',   // Assuming handles are used
                        hidden: false, // Initial state before calculating visibility
                        data: {
                            path: 'bezier', // Default to bezier
                        } as DataEdgeData, // Type assertion
                    });
                 } else {
                     // This might indicate an issue in demoUserRelationships or missing common data
                     if (!commonQuestionsMap.has(sourceId) || !commonQuestionsMap.has(targetId)) {
                         console.warn(`Common data missing for nodes in relationship ${sourceId} -> ${targetId} for user ${userId}. Edge not created.`);
                     } else {
                          // Relationship points outside the defined relevantNodeIds? (Shouldn't happen if relevantNodeIds logic is correct)
                          console.warn(`Nodes in relationship ${sourceId} -> ${targetId} not marked as relevant for user ${userId}. Edge not created.`);
                     }
                 }
            });
        }
    }

    const { nextNodes, nextEdges } = calculateVisibility(userNodes, userEdges, userRelationships);

    console.log(`Built graph for user ${userId}: ${nextNodes.length} nodes, ${nextEdges.length} edges.`);

    return { nodes: nextNodes, edges: nextEdges };
};


function App() {
  // Use the currentUser from the context
  const { currentUser } = useUserContext();

  // Use custom edge data type in state
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<QuestionNodeData>>([]);
  const [edges, setEdges, onEdgesState] = useEdgesState<Edge<DataEdgeData>>([]);
  const [loading, setLoading] = useState(true); // Loading state


  // Effect to load/build graph data for the current user when user changes
  useEffect(() => {
    setLoading(true);
    const { nodes: initialNodes, edges: initialEdges } = buildUserGraph(currentUser);
    setNodes(initialNodes);
    setEdges(initialEdges);
    setLoading(false); // Set loading to false after graph is built/loaded
  }, [currentUser, setNodes, setEdges]); // Re-run effect when currentUser changes


  useEffect(() => {
    // Only save if not currently loading and if nodes/edges are populated
    if (!loading && nodes.length > 0) {
       try {
           // Save the current state of the user's subset of nodes and edges
           localStorage.setItem(getLocalStorageKey(currentUser), JSON.stringify({ nodes, edges }));
           // console.log(`Saved current graph state for user ${currentUser} to local storage.`);
       } catch (error) {
           console.error("Failed to save graph data to local storage", currentUser, error);
       }
    }
  }, [nodes, edges, currentUser, loading]); // Depend on nodes, edges, currentUser, and loading state


  // --- Custom handler for node collapse action ---
  const handleToggleCollapse = useCallback((nodeId: string, isCollapsed: boolean) => {
    setNodes(currentNodes => {
      // Get the relationships for the current user
      const userRelationships = demoUserRelationships[currentUser];
      if (!userRelationships) {
          console.error("Relationships not found for user", currentUser);
          return currentNodes; // Return current state if relationships are missing
      }

      // Update the collapsed state for the clicked node immutably
      const nodesWithUpdatedCollapse = currentNodes.map(node =>
        node.id === nodeId
          ? { ...node, data: { ...node.data!, collapsed: isCollapsed } as QuestionNodeData }
          : node
      );

      const { nextNodes, nextEdges } = calculateVisibility(nodesWithUpdatedCollapse, edges, userRelationships);

      // Update edges state directly here
      setEdges(nextEdges);
      return nextNodes; // Return the updated nodes state for setNodes
    });
  }, [currentUser, edges, setEdges]); // Include edges, setEdges, and currentUser as dependencies

  // Inject handler into node data before passing to ReactFlow
  const nodesWithHandlers: Node<QuestionNodeData>[] = useMemo(() => {
    if (!nodes || nodes.length === 0) return [];

    return nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        onToggleCollapse: handleToggleCollapse,
      }
    }));
  }, [nodes, handleToggleCollapse]); // Depend on nodes and the handler


  // Handler to reset current user's data
  const handleResetUserData = useCallback(() => {
      try {
         localStorage.removeItem(getLocalStorageKey(currentUser));
         console.log(`Cleared data for user ${currentUser} from local storage.`);
         // Re-initialize the graph for the current user by calling the builder
         const { nodes: initialNodes, edges: initialEdges } = buildUserGraph(currentUser);
         setNodes(initialNodes);
         setEdges(initialEdges);
      } catch (error) {
         console.error("Failed to clear data from local storage for user", currentUser, error);
      }
  }, [currentUser, setNodes, setEdges]); // Depend on currentUser, setNodes, setEdges


  // Render UI
  if (loading) {
    return <div className="flex justify-center items-center w-full h-full">Loading graph data...</div>;
  }

  // Check if the user has any nodes to display based on relationships
   if (nodes.length === 0) {
       return (
            <div className="flex flex-col justify-center items-center w-full h-full text-muted-foreground">
                <p>No graph data found or defined for user {currentUser}.</p>
                <button
                    onClick={handleResetUserData} // Offer to reset in case of corrupted data
                    className="mt-4 px-3 py-1 rounded text-sm bg-blue-500 text-white hover:bg-blue-600"
                >
                    Try Initializing Graph
                </button>
            </div>
       );
   }


  return (
    // The main div takes up the full space provided by the layout's flex-1 main element
    <div className="w-full h-full overflow-hidden">
      <ReactFlow
        nodes={nodesWithHandlers}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesState}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView // Fit initial view
        proOptions={{ hideAttribution: true }}
      >
      
        <Background />
        <MiniMap style={{ zIndex: 1 }} />
        <Controls style={{ zIndex: 1 }} />

        {/* Add the Reset button inside a Panel for better positioning */}
         <Panel position="bottom-left">
            <button
                onClick={handleResetUserData}
                className="px-3 py-1 ml-10 rounded text-sm bg-red-500 text-white hover:bg-red-600"
            >
                Reset Layout
            </button>
         </Panel>

      </ReactFlow>

    </div>
  );
}

export default App;