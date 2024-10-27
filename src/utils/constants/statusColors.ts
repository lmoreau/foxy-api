export const getStatusColor = (status: number): string => {
  const colorMap: { [key: number]: string } = {
    755280000: 'default',    // Status Unknown
    755280001: 'red',        // Not Eligible
    755280002: 'orange',     // Pending Start
    755280003: 'green',      // Active
    755280004: 'red',        // Issue - None Paying
    755280005: 'orange',     // Issue - Some Paying
    755280006: 'cyan',       // Issue - Ready to Submit
    755280007: 'purple',     // Issue - Clarification Needed
    755280008: 'magenta',    // Issue - Disputed to Comp
    947760001: 'gold',       // Legacy Issue
  };
  return colorMap[status] || 'default';
};

export const getStateCodeLabel = (code: number): { label: string; color: string } => {
  switch (code) {
    case 0:
      return { label: 'Open', color: 'processing' };
    case 1:
      return { label: 'Won', color: 'success' };
    case 2:
      return { label: 'Lost', color: 'error' };
    default:
      return { label: 'Unknown', color: 'default' };
  }
};
