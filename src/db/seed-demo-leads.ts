import 'dotenv/config';
import { db } from './index';
import { leads, leadAnalyses } from './schema';
import { eq } from 'drizzle-orm';

async function seedDemoLeads() {
  console.log('Seeding 3 default demo leads (Hot, Warm, Cold)...');

  // Check if demo leads already exist
  const existingLeads = await db.select().from(leads);
  const demoNames = ['Vikram Malhotra', 'Priya Sundaram', 'Rohan Verma'];
  const hasDemo = existingLeads.some(l => demoNames.includes(l.name));

  if (hasDemo) {
    console.log('Demo leads already present, updating/refreshing analyses...');
  }

  const demoData = [
    {
      lead: {
        name: 'Vikram Malhotra',
        email: 'vikram.m@zenithholdings.in',
        phone: '+91 98110 54321',
        location: 'Gurugram',
        propertyType: 'apartment',
        bhkConfig: '4 BHK',
        sqftMin: 3200,
        sqftMax: 4500,
        preferredFloor: '15th floor or higher',
        facingDirection: 'north-east',
        budgetMin: 350,
        budgetMax: 450,
        loanReady: 'no', // Self-funded / cash
        maxLoanAmount: 0,
        creditScoreRange: '750+',
        downPaymentAvailable: 450,
        buyingTimeline: 'immediate',
        occupancyType: 'self-use',
        possessionPreference: 'ready-to-move',
        preferredAmenities: ['Clubhouse', 'Golf Course', '24/7 Security', 'Covered Parking', 'Swimming Pool'],
        mustHaveFeatures: 'Private elevator lobby, panoramic Aravali views, minimum 3 reserved car parkings.',
        dealBreakers: 'Construction delay, low ceilings under 11ft, non-gated complex.',
        customerMessage: 'Relocating from Singapore next month. Need a premium 4 BHK ready-to-move apartment on Golf Course Road or DLF Phase 5. Budget up to 4.5 Cr all inclusive. Full self-funded payment ready. Want site visits scheduled this Saturday.',
        source: 'referral',
      },
      analysis: {
        summary: 'High-net-worth NRI relocating from Singapore seeking luxury 4 BHK on Golf Course Road, Gurugram. Fully self-funded with ₹4.5 Cr budget and immediate buying intent.',
        intent: 'Acquire high-end 4 BHK ready-to-move luxury residence in prime Gurugram immediately.',
        keyRequirements: [
          '4 BHK luxury apartment (3200–4500 sq.ft)',
          'Golf Course Road or DLF Phase 5, Gurugram',
          'Ready-to-move possession',
          'High floor (15+) with Aravali views',
          'Budget ₹3.5 Cr – ₹4.5 Cr'
        ],
        objectionsAndConcerns: [
          'High sensitivity to build quality and ceiling height',
          'Strict requirement for 3 dedicated car parkings',
          'Zero tolerance for possession delays'
        ],
        recommendedNextAction: 'Call immediately to lock Saturday VIP walkthrough for DLF Camellias / M3M Golfestate. Prepare builder floor plan comparisons.',
        suggestedResponse: 'Dear Vikram, welcome back to India. We have shortlisted two exceptional ready-to-move 4 BHK residences on Golf Course Extension (including M3M Golfestate) matching your 4.5 Cr budget, 11ft+ ceilings, and triple parking. I have reserved slots for you this Saturday. Would 11:00 AM work best for you?',
        score: 94,
        tag: 'hot' as const,
        reasoning: 'Maximum budget clarity, 100% self-funded liquid capital, immediate timeline (<30 days), specific luxury project criteria.',
        callPrepQuestions: [
          'Will you be visiting alone or with family on Saturday?',
          'Do you prefer furnished or bare-shell ready units for custom interiors?',
          'Is your payment structure outright single-tranche or milestone-based?'
        ]
      }
    },
    {
      lead: {
        name: 'Priya Sundaram',
        email: 'priya.sundaram@techcorp.com',
        phone: '+91 97401 22890',
        location: 'Bangalore',
        propertyType: 'apartment',
        bhkConfig: '3 BHK',
        sqftMin: 1600,
        sqftMax: 2100,
        preferredFloor: 'Mid floor (5th - 10th)',
        facingDirection: 'east',
        budgetMin: 110,
        budgetMax: 135,
        loanReady: 'yes',
        maxLoanAmount: 90,
        creditScoreRange: '750+',
        downPaymentAvailable: 35,
        buyingTimeline: '1-3 months',
        occupancyType: 'self-use',
        possessionPreference: 'either',
        preferredAmenities: ['Gym / Fitness Center', 'Children Playground', 'Power Backup', 'Gated Community'],
        mustHaveFeatures: 'East facing Vastu compliant, balcony overlooking green area, close to international schools.',
        dealBreakers: 'Traffic choke points near railway crossings, unapproved builder plans.',
        customerMessage: 'Senior Engineering Manager at ITPL Whitefield. Upgrading from 2 BHK rented to own 3 BHK. HDFC loan pre-approved for 90L with 35L savings ready. Confused between Prestige and Brigade projects in Whitefield / Sarjapur. Need guidance.',
        source: 'website',
      },
      analysis: {
        summary: 'IT professional in Whitefield upgrading to 3 BHK with ₹1.1–1.35 Cr budget. Pre-approved loan of ₹90L with 1-3 month closing horizon.',
        intent: 'Purchase 3 BHK family apartment near Whitefield IT corridor with good school connectivity.',
        keyRequirements: [
          '3 BHK apartment (1600–2100 sq.ft)',
          'Whitefield or Sarjapur Road, Bangalore',
          'Vastu compliant east-facing',
          'Budget ₹1.1 Cr – ₹1.35 Cr',
          'Reputed Tier-1 builder (Prestige / Brigade)'
        ],
        objectionsAndConcerns: [
          'Indecision between ready vs under-construction (tax benefit vs immediate rent saving)',
          'Concerned about peak hour commute on Sarjapur road'
        ],
        recommendedNextAction: 'Send side-by-side ROI and amenity comparison between Prestige Somerville and Brigade Cosmopolis. Schedule callback Tuesday 7 PM.',
        suggestedResponse: 'Hi Priya, congratulations on your loan pre-approval! We specialize in Whitefield IT corridor residences and have prepared a clear comparison between Prestige and Brigade options within your 1.35 Cr bracket. Would you like to review the commute times and layout sheets over a brief call tomorrow evening?',
        score: 66,
        tag: 'warm' as const,
        reasoning: 'Strong financial backing with pre-approved loan, realistic budget for location, 1-3 month timeline. Needs advisor assistance on project selection.',
        callPrepQuestions: [
          'Is your loan pre-approval with HDFC on a specific property or general sanction?',
          'Which school are your children enrolled in to map optimal radius?',
          'Would you prefer ready possession to save rent immediately or 6-month launch pricing?'
        ]
      }
    },
    {
      lead: {
        name: 'Rohan Verma',
        email: 'rohan.verma99@gmail.com',
        phone: '+91 99580 11234',
        location: 'Noida',
        propertyType: 'villa',
        bhkConfig: '5 BHK',
        sqftMin: 4000,
        sqftMax: 6000,
        preferredFloor: 'Independent',
        facingDirection: 'no-preference',
        budgetMin: 70,
        budgetMax: 85,
        loanReady: 'maybe',
        maxLoanAmount: 0,
        creditScoreRange: '650-749',
        downPaymentAvailable: 10,
        buyingTimeline: 'just exploring',
        occupancyType: 'investment',
        possessionPreference: 'under-construction',
        preferredAmenities: ['Swimming Pool', 'Garden / Landscaping', 'EV Charging'],
        mustHaveFeatures: 'Private swimming pool, duplex layout, large garden.',
        dealBreakers: 'None specified.',
        customerMessage: 'Looking for luxury 5 BHK independent villa in Sector 150 Noida with private lawn and pool. Budget around 75 to 85 lakhs. Just exploring market rates and brochures for now. Might buy next year if price is right.',
        source: 'social-media',
      },
      analysis: {
        summary: 'Casual inquirer seeking 5 BHK luxury villa in Noida Sector 150 with unrealistic budget (₹80L vs market ₹3.5Cr+). Decision timeline over 12 months with no financing in place.',
        intent: 'Gather brochures and benchmark market pricing with no near-term purchase readiness.',
        keyRequirements: [
          '5 BHK Villa with pool',
          'Sector 150 Noida',
          'Budget ₹75L – ₹85L (Severe market mismatch)'
        ],
        objectionsAndConcerns: [
          'Severe price expectation mismatch: Sector 150 villas trade at ₹3.5 Cr to ₹6 Cr, not ₹85L',
          'Vague financing plan with only ₹10L down payment mentioned',
          'No urgency: timeline is "just exploring / next year"'
        ],
        recommendedNextAction: 'Add to automated email drip campaign with Noida market price index report. Do not allocate high-touch agent hours until budget is recalibrated.',
        suggestedResponse: 'Hi Rohan, thanks for reaching out. Sector 150 is one of NCR’s premier green sectors, where villas typically range from ₹3.5 Cr upwards. For an 80 Lakh budget, high-quality 2 BHK and 3 BHK apartments are readily available in Greater Noida West. Would you like our Q3 Noida Pricing Guide to explore options within your target bracket?',
        score: 24,
        tag: 'cold' as const,
        reasoning: 'Critical budget-to-requirement mismatch (5 BHK villa at 80L), casual exploration stage, long timeline, low financial readiness.',
        callPrepQuestions: [
          'Are you open to considering 2BHK/3BHK premium apartments in Greater Noida within your 80L range?',
          'What is your target purchase year — is there any tax-saving event driving this timeline?'
        ]
      }
    }
  ];

  for (const item of demoData) {
    // Check if lead exists
    const [existing] = await db.select().from(leads).where(eq(leads.name, item.lead.name));
    let leadId = existing?.id;

    if (!leadId) {
      const [newLead] = await db.insert(leads).values(item.lead).returning();
      leadId = newLead.id;
      console.log(`Created lead: ${item.lead.name} (ID: ${leadId})`);
    } else {
      console.log(`Lead already exists: ${item.lead.name} (ID: ${leadId})`);
    }

    // Upsert analysis
    await db.delete(leadAnalyses).where(eq(leadAnalyses.leadId, leadId));
    await db.insert(leadAnalyses).values({
      leadId,
      ...item.analysis,
    });
    console.log(`Attached ${item.analysis.tag.toUpperCase()} analysis to ${item.lead.name}`);
  }

  console.log('Demo leads seeding completed successfully!');
}

seedDemoLeads()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error seeding demo leads:', err);
    process.exit(1);
  });
