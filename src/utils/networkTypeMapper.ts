export const foxy_rogersfibre: Record<number, string> = {
  612100001: 'ON NET',
  755280001: 'ON NET ABA',
  612100003: 'PRE ON NET',
  612100002: 'NEAR NET',
  612100004: 'OFF NET',
};

export const foxy_rogerscable: Record<number, string> = {
  612100001: 'ON PLANT',
  612100002: 'OFF PLANT',
  947760001: 'ON PLANT - MID SPLIT',
  612100003: 'OFF PLANT NIKA',
  755280001: 'PRE ON PLANT',
};

export const foxy_gpon: Record<number, string> = {
  612100001: 'GPON Ready',
  612100002: 'GPON Target',
  612100003: 'Not Available',
  947760001: 'Not Checked',
};

export const getFoxyRogersFibreLabel = (value: number): string => {
  return foxy_rogersfibre[value] || 'Unknown';
};

export const getFoxyRogersCableLabel = (value: number): string => {
  return foxy_rogerscable[value] || 'Unknown';
};

export const getFoxyGponLabel = (value: number): string => {
  return foxy_gpon[value] || 'Unknown';
};
