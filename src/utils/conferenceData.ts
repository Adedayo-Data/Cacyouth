export const CONFERENCE_FEE = 3100;

export type SelectedState = 'FCT' | 'NIGER' | 'KADUNA' | 'OTHER';

export const ZONES_BY_STATE: Record<Exclude<SelectedState, 'OTHER'>, string[]> = {
  FCT: [
    'FCC DCC', 'ADCC DCC', 'NYANYA DCC', 'GWAGWALADA DCC', 'KUJE DCC',
    'L/WATER DCC', 'KUBWA DCC', 'BWARI ZONE', 'LUGBE DCC', 'PRINCE OF PEACE ZONE',
    'KWALI ZONE', 'MERCY ZONE', 'MARARABA ZONE', 'MAPAPE ZONE', 'OKEIYIN ZONE',
    'CHRIST THE KING DCC', 'KARU DCC', 'MIRACLE DCC', 'DUTSE DCC', 'GLORY ZONE',
    'ALL SAINT DCC', 'PRAISE DCC DCC', 'DAGIRI ZONE', 'TRUTH AND POWER ZONE',
    'ADO ZONE', 'FULFILMENT ZONE', 'LIFE ZONE', 'PASALI ZONE',
    'POSSIBILITY ZONE', 'SALVATION ZONE', 'ZUBA ZONE',
  ],
  NIGER: [
    'SULEJA DCC', 'TUNGA DCC', 'GAURAKA DCC', 'BIDA DCC',
    'NIGER DCC', 'KWAMBA DCC', 'KONTAGORA ZONE', 'MANDALA ZONE',
  ],
  KADUNA: [
    'KAWO DCC', 'KAKURI DCC', 'SAMARU ZONE', 'KOSEUNTI ZONE',
    'ZION ZONE', 'KAFANCHAN ZONE', 'KADUNA DCC', 'TUNDUNWADA DCC', 'ZARIA DCC',
  ],
};

export const OTHER_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe', 'Imo', 'Jigawa',
  'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Ogun', 'Ondo',
  'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
];
