export interface ContentVersion {
  id: string;
  pieceId: string;
  version: number;
  mdxContent: string;
  jsxComponents: Record<string, string>;
  isActive: boolean;
  generationReason: "initial" | "regeneration";
}

export interface FlowDiagramData {
  nodes: Array<{ id: string; label: string; description?: string }>;
  edges: Array<{ from: string; to: string; label?: string }>;
  direction?: "TB" | "LR";
}

export interface TreeDiagramData {
  root: TreeNode;
}

export interface TreeNode {
  label: string;
  description?: string;
  children?: TreeNode[];
}

export interface DataVisualizationData {
  type: "bar" | "line" | "pie" | "radar";
  data: Array<{ label: string; value: number; category?: string }>;
  title?: string;
  xLabel?: string;
  yLabel?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface InteractiveQuizData {
  questions: QuizQuestion[];
}
