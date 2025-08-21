export const TAG_KEYWORDS = {
  armor: [
    'armor',
    'pauldron',
    'gauntlet',
    'greaves',
    'shoulder',
    'chest',
    'bracer',
    'plate',
  ],
  foam: ['foam', 'template', 'pattern'],
  skull: ['skull', 'bone'],
  leather: ['leather', 'hide'],
  cape: ['cape', 'cloak'],
  dress: ['dress', 'gown'],
  bodysuit: ['bodysuit', 'catsuit', 'suit'],
  helmet: ['helmet', 'headpiece', 'mask'],
  wings: ['wings', 'feathers', 'angel'],
  prop: ['prop', 'weapon', 'sword', 'gun', 'staff'],
  sewing: ['sewing', 'stitching', 'fabric'],
  historical: ['historical', 'period', 'vintage'],
  fantasy: ['fantasy', 'mythical', 'magical'],
} as const;

// Get the keys as a union of string literals
export type Tag = keyof typeof TAG_KEYWORDS;
export const TAGS = Object.keys(TAG_KEYWORDS) as Tag[];
