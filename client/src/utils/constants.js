export const CATEGORIES = [
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

export const CAMPUS_ZONES = [
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

export const COLORS = [
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

export const ITEM_STATUS_LABELS = {
  open: { label: 'Active', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  pending: { label: 'Claim Pending', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  resolved: { label: 'Resolved & Returned', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  archived: { label: 'Archived', color: 'bg-slate-100 text-slate-600 border-slate-200' }
};

export const CLAIM_STATUS_LABELS = {
  pending: { label: 'Awaiting Admin Review', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  approved: { label: 'Approved & Verified', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  rejected: { label: 'Claim Rejected', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  'more-info-needed': { label: 'More Proof Needed', color: 'bg-blue-50 text-blue-700 border-blue-200' }
};
