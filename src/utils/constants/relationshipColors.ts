// Define a set of visually distinct colors that work well for tags
export const RELATIONSHIP_COLORS = [
  '#1890ff', // Blue
  '#52c41a', // Green
  '#722ed1', // Purple
  '#fa8c16', // Orange
  '#eb2f96', // Pink
  '#13c2c2', // Cyan
  '#faad14', // Gold
  '#a0d911', // Lime
  '#f5222d', // Red
  '#2f54eb', // Geekblue
];

// Map to store service ID to color relationships
const colorMap = new Map<string, string>();
let colorIndex = 0;

export const getColorForService = (serviceId: string): string => {
  // Remove any curly braces from the serviceId for consistent mapping
  const cleanServiceId = serviceId.replace(/[{}]/g, '');
  
  if (!colorMap.has(cleanServiceId)) {
    // Assign next color and cycle through colors if we run out
    colorMap.set(cleanServiceId, RELATIONSHIP_COLORS[colorIndex % RELATIONSHIP_COLORS.length]);
    colorIndex++;
  }
  return colorMap.get(cleanServiceId) || RELATIONSHIP_COLORS[0];
};

// Only reset when explicitly needed (e.g., new data load)
export const resetColorMap = () => {
  colorMap.clear();
  colorIndex = 0;
};