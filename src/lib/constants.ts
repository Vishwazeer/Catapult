export const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'villa', label: 'Villa / Independent House' },
  { value: 'plot', label: 'Plot / Land' },
  { value: 'commercial', label: 'Commercial Space' },
  { value: 'penthouse', label: 'Penthouse' },
] as const;

export const BHK_OPTIONS = [
  { value: '1 BHK', label: '1 BHK' },
  { value: '2 BHK', label: '2 BHK' },
  { value: '3 BHK', label: '3 BHK' },
  { value: '4 BHK', label: '4 BHK' },
  { value: '4+ BHK', label: '4+ BHK' },
  { value: 'studio', label: 'Studio' },
] as const;

export const TIMELINE_OPTIONS = [
  { value: 'immediate', label: 'Immediately (within 1 month)' },
  { value: '1-3 months', label: '1–3 Months' },
  { value: '3-6 months', label: '3–6 Months' },
  { value: '6-12 months', label: '6–12 Months' },
  { value: 'just exploring', label: 'Just Exploring' },
] as const;

export const SOURCE_OPTIONS = [
  { value: 'walk-in', label: 'Walk-in' },
  { value: 'phone-call', label: 'Phone Call' },
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'social-media', label: 'Social Media' },
  { value: 'property-portal', label: 'Property Portal (99acres, MagicBricks)' },
] as const;

export const OCCUPANCY_OPTIONS = [
  { value: 'self-use', label: 'Self Use / Personal' },
  { value: 'investment', label: 'Investment' },
  { value: 'rental', label: 'Rental Income' },
] as const;

export const POSSESSION_OPTIONS = [
  { value: 'ready-to-move', label: 'Ready to Move In' },
  { value: 'under-construction', label: 'Under Construction' },
  { value: 'either', label: 'No Preference' },
] as const;

export const LOAN_OPTIONS = [
  { value: 'yes', label: 'Yes, planning to take a loan' },
  { value: 'no', label: 'No, full payment' },
  { value: 'maybe', label: 'Not sure yet' },
] as const;

export const CREDIT_SCORE_OPTIONS = [
  { value: '750+', label: 'Excellent (750+)' },
  { value: '700-749', label: 'Good (700–749)' },
  { value: '650-699', label: 'Fair (650–699)' },
  { value: 'below-650', label: 'Below 650' },
  { value: 'not-sure', label: 'Not Sure' },
] as const;

export const AMENITIES = [
  'Swimming Pool', 'Gym / Fitness Center', 'Covered Parking', 'Garden / Landscaping',
  'Clubhouse', '24/7 Security', 'Children Playground', 'Power Backup',
  'Jogging Track', 'Indoor Games', 'Community Hall', 'EV Charging',
  'Vastu Compliant', 'Gated Community', 'Lift', 'Rooftop Access',
] as const;

export const FACING_OPTIONS = [
  { value: 'north', label: 'North' },
  { value: 'south', label: 'South' },
  { value: 'east', label: 'East' },
  { value: 'west', label: 'West' },
  { value: 'north-east', label: 'North-East' },
  { value: 'north-west', label: 'North-West' },
  { value: 'south-east', label: 'South-East' },
  { value: 'south-west', label: 'South-West' },
  { value: 'no-preference', label: 'No Preference' },
] as const;

export const CITIES = [
  'Gurugram', 'Noida', 'Greater Noida', 'Mumbai', 'Thane', 'Navi Mumbai',
  'Bangalore', 'Hyderabad', 'Pune', 'Chennai', 'Delhi', 'Faridabad',
  'Ghaziabad', 'Lucknow', 'Ahmedabad', 'Kolkata', 'Jaipur',
] as const;

export const QUICK_CHAT_PROMPTS = [
  'What should I emphasize on the call?',
  'Make my reply more assertive',
  'Draft a follow-up email',
  'What objections might they raise?',
  'Suggest a closing strategy',
  'How to handle price negotiation?',
] as const;

export const LEAD_PHASES = [
  { value: 'Incoming', label: 'Incoming', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'Engaged', label: 'Engaged', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'Meeting', label: 'Meeting', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { value: 'Proposal', label: 'Proposal', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { value: 'Converted', label: 'Converted', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'Closed', label: 'Closed', color: 'bg-rose-50 text-rose-700 border-rose-200' },
] as const;
