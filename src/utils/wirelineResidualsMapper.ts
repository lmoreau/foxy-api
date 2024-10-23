interface MapItem {
  value: string;
  label: string;
}

const wirelineResidualsMap: MapItem[] = [
  { value: '755280000', label: 'Status Unknown' },
  { value: '755280001', label: 'Not Eligible' },
  { value: '755280002', label: 'Pending Start' },
  { value: '755280003', label: 'Active' },
  { value: '755280004', label: 'Issue - None Paying' },
  { value: '755280005', label: 'Issue - Some Paying' },
  { value: '755280006', label: 'Issue - Ready to Submit' },
  { value: '755280007', label: 'Issue - Clarification Needed' },
  { value: '755280008', label: 'Issue - Disputed to Comp' },
  { value: '947760001', label: 'Legacy Issue' },
];

export const getWirelineResidualsLabel = (value: string | number): string => {
  const stringValue = value.toString();
  const found = wirelineResidualsMap.find(item => item.value === stringValue);
  return found ? found.label : stringValue;
};

export default wirelineResidualsMap;
