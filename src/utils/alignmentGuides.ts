import Konva from 'konva';

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Guide {
  x?: number;
  y?: number;
}

// 获取节点的矩形信息
const getNodeRect = (node: Konva.Node): Rect => ({
  x: node.x(),
  y: node.y(),
  width: node.width() * (node as Konva.Shape).scaleX(),
  height: node.height() * (node as Konva.Shape).scaleY(),
});

// 检查并添加对齐辅助线
const addGuideIfClose = (
  value1: number,
  value2: number,
  threshold: number,
  position: number,
  guides: Guide[],
  axis: 'x' | 'y'
): boolean => {
  if (Math.abs(value1 - value2) < threshold) {
    guides.push({ [axis]: position });
    return true;
  }
  return false;
};

// 处理节点之间的对齐
const handleNodeAlignment = (
  nodeRect: Rect,
  otherRect: Rect,
  threshold: number,
  guides: Guide[],
  node: Konva.Node
): void => {
  // 左边缘对齐
  if (addGuideIfClose(nodeRect.x, otherRect.x, threshold, otherRect.x, guides, 'x')) {
    node.x(otherRect.x);
  }

  // 右边缘对齐
  const rightEdge = otherRect.x + otherRect.width;
  if (addGuideIfClose(
    nodeRect.x + nodeRect.width,
    rightEdge,
    threshold,
    rightEdge,
    guides,
    'x'
  )) {
    node.x(rightEdge - nodeRect.width);
  }

  // 水平中心对齐
  const nodeCenterX = nodeRect.x + nodeRect.width / 2;
  const otherCenterX = otherRect.x + otherRect.width / 2;
  if (addGuideIfClose(nodeCenterX, otherCenterX, threshold, otherCenterX, guides, 'x')) {
    node.x(otherCenterX - nodeRect.width / 2);
  }

  // 顶部对齐
  if (addGuideIfClose(nodeRect.y, otherRect.y, threshold, otherRect.y, guides, 'y')) {
    node.y(otherRect.y);
  }

  // 底部对齐
  const bottomEdge = otherRect.y + otherRect.height;
  if (addGuideIfClose(
    nodeRect.y + nodeRect.height,
    bottomEdge,
    threshold,
    bottomEdge,
    guides,
    'y'
  )) {
    node.y(bottomEdge - nodeRect.height);
  }

  // 垂直中心对齐
  const nodeCenterY = nodeRect.y + nodeRect.height / 2;
  const otherCenterY = otherRect.y + otherRect.height / 2;
  if (addGuideIfClose(nodeCenterY, otherCenterY, threshold, otherCenterY, guides, 'y')) {
    node.y(otherCenterY - nodeRect.height / 2);
  }
};

// 处理与舞台的对齐
const handleStageAlignment = (
  nodeRect: Rect,
  stage: Konva.Stage,
  threshold: number,
  guides: Guide[],
  node: Konva.Node
): void => {
  const centerX = stage.width() / 2;
  const centerY = stage.height() / 2;

  // 与舞台中心对齐
  if (addGuideIfClose(
    nodeRect.x + nodeRect.width / 2,
    centerX,
    threshold,
    centerX,
    guides,
    'x'
  )) {
    node.x(centerX - nodeRect.width / 2);
  }

  if (addGuideIfClose(
    nodeRect.y + nodeRect.height / 2,
    centerY,
    threshold,
    centerY,
    guides,
    'y'
  )) {
    node.y(centerY - nodeRect.height / 2);
  }

  // 与舞台边缘对齐
  if (addGuideIfClose(nodeRect.x, 0, threshold, 0, guides, 'x')) {
    node.x(0);
  }

  if (addGuideIfClose(
    nodeRect.x + nodeRect.width,
    stage.width(),
    threshold,
    stage.width(),
    guides,
    'x'
  )) {
    node.x(stage.width() - nodeRect.width);
  }

  if (addGuideIfClose(nodeRect.y, 0, threshold, 0, guides, 'y')) {
    node.y(0);
  }

  if (addGuideIfClose(
    nodeRect.y + nodeRect.height,
    stage.height(),
    threshold,
    stage.height(),
    guides,
    'y'
  )) {
    node.y(stage.height() - nodeRect.height);
  }
};

export const calculateGuides = (
  node: Konva.Node,
  threshold: number = 10
): Guide[] => {
  const stage = node.getStage();
  if (!stage) return [];

  const guides: Guide[] = [];
  const nodeRect = getNodeRect(node);

  // 获取其他节点并处理对齐
  const otherNodes = stage
    .find('Image')
    .filter((item) => item !== node);

  otherNodes.forEach((otherNode) => {
    handleNodeAlignment(nodeRect, getNodeRect(otherNode), threshold, guides, node);
  });

  // 处理与舞台的对齐
  handleStageAlignment(nodeRect, stage, threshold, guides, node);

  return guides;
}; 