const CATEGORIES = [
  'Electronics',
  'Documents & IDs',
  'Keys',
  'Bags & Wallets',
  'Clothing',
  'Books & Stationery',
  'Accessories',
  'Bottles & Containers',
  'Other'
];

const CAMPUS_ZONES = [
  'Central Library',
  'Main Academic Complex',
  'Science Quad',
  'Engineering Labs',
  'Cafeteria & Food Court',
  'Sports Complex & Gym',
  'Student Center & Activity Hall',
  'Hostel Block',
  'Auditorium & Admin'
];

// Zone proximity scores (0 to 1)
// Items lost and found in the exact same zone get 1.0, adjacent zones get 0.7, others get 0.3
const ZONE_ADJACENCY = {
  'Central Library': ['Main Academic Complex', 'Auditorium & Admin', 'Student Center & Activity Hall'],
  'Main Academic Complex': ['Central Library', 'Science Quad', 'Engineering Labs', 'Cafeteria & Food Court'],
  'Science Quad': ['Main Academic Complex', 'Engineering Labs'],
  'Engineering Labs': ['Science Quad', 'Main Academic Complex'],
  'Cafeteria & Food Court': ['Main Academic Complex', 'Student Center & Activity Hall', 'Hostel Block'],
  'Sports Complex & Gym': ['Hostel Block', 'Student Center & Activity Hall'],
  'Student Center & Activity Hall': ['Central Library', 'Cafeteria & Food Court', 'Sports Complex & Gym'],
  'Hostel Block': ['Cafeteria & Food Court', 'Sports Complex & Gym'],
  'Auditorium & Admin': ['Central Library', 'Main Academic Complex']
};

const COLORS = [
  'Black',
  'Blue',
  'Navy',
  'Silver',
  'Grey',
  'Gray',
  'White',
  'Red',
  'Green',
  'Yellow',
  'Brown',
  'Gold',
  'Purple',
  'Orange',
  'Pink',
  'Other'
];

const COLOR_SYNONYMS = {
  black: ['dark', 'charcoal', 'midnight', 'matte black'],
  dark: ['black', 'charcoal', 'navy'],
  blue: ['navy', 'cyan', 'sky blue', 'azure', 'indigo'],
  navy: ['blue', 'dark blue'],
  grey: ['gray', 'silver', 'ash', 'slate'],
  gray: ['grey', 'silver', 'ash', 'slate'],
  silver: ['grey', 'gray', 'metallic', 'chrome'],
  white: ['cream', 'ivory', 'off-white'],
  red: ['maroon', 'crimson', 'burgundy'],
  gold: ['yellow', 'bronze', 'champagne', 'golden'],
  brown: ['tan', 'beige', 'khaki', 'chocolate']
};

const ITEM_TYPES = ['lost', 'found'];

const ITEM_STATUSES = ['open', 'pending', 'resolved', 'archived'];

const CLAIM_STATUSES = ['pending', 'approved', 'rejected', 'more-info-needed'];

const USER_ROLES = ['user', 'admin'];

module.exports = {
  CATEGORIES,
  CAMPUS_ZONES,
  ZONE_ADJACENCY,
  COLORS,
  COLOR_SYNONYMS,
  ITEM_TYPES,
  ITEM_STATUSES,
  CLAIM_STATUSES,
  USER_ROLES
};
