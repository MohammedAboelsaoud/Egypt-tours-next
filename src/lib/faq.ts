export type FaqItem = { q: string; a: string }
export type FaqGroup = { title: string; items: FaqItem[] }

/**
 * The questions travellers ask most. Rendered on /faq and used by the chat
 * assistant, so both always give the same answer.
 */
export const FAQ_GROUPS: FaqGroup[] = [
  {
    title: "Before you book",
    items: [
      {
        q: "How does booking with you work?",
        a: "Send us an enquiry with your dates and interests. A planner replies within one business day with a draft itinerary and a real price. We revise it until it's right — usually two or three rounds — then you book online and pay securely by card through Stripe. Nothing is charged until you're happy with the plan.",
      },
      {
        q: "Do I need to pay in full to confirm?",
        a: "Tours, hotels and vehicles booked through the site are paid in full at the time of booking, which locks in the price and the guide. For long custom trips we can arrange a 25% deposit with the balance due 30 days before arrival — just ask your planner.",
      },
      {
        q: "What is your cancellation policy?",
        a: "Free cancellation up to 14 days before the start date, 50% refundable up to 7 days before, and non-refundable inside 7 days. Nile cruises and internal flights follow the operator's own terms, which we always show you before you book.",
      },
      {
        q: "Can you build something that isn't listed on the site?",
        a: "That's most of what we do. The listed tours are starting points — lengthen them, combine regions, add Abu Simbel or the Western Desert, or start from a blank page. Tell us what you want and we'll price it.",
      },
    ],
  },
  {
    title: "Travelling in Egypt",
    items: [
      {
        q: "Do I need a visa?",
        a: "Most nationalities — including the UK, US, EU, Canada and Australia — can get a 30-day tourist visa on arrival for USD 25, or apply online in advance through the official e-visa portal. We'll confirm the requirement for your passport when you book. Your passport must be valid for at least six months from arrival.",
      },
      {
        q: "Is Egypt safe for tourists?",
        a: "The tourist areas — Cairo, Giza, Luxor, Aswan, the Red Sea and the North Coast — are heavily policed and see millions of visitors a year without incident. We follow government advisories, avoid the areas they flag, and every vehicle we use is licensed and tracked. Solo female travellers are very welcome; we can pair you with a female guide on request.",
      },
      {
        q: "When is the best time to visit?",
        a: "October to April for Cairo, Luxor and Aswan — comfortable days and cool evenings. The Red Sea works year-round, with the best diving from March to May and September to November. The North Coast is a summer destination, June to September. July and August are very hot in the south, but prices drop and the sites are quiet.",
      },
      {
        q: "What should I wear?",
        a: "Light, loose, breathable clothing, and comfortable shoes you can walk on sand in. Shoulders and knees covered at mosques and churches, and a scarf for women to cover their hair at mosques. Resort areas and Red Sea hotels are relaxed — swimwear is fine at the pool and beach.",
      },
      {
        q: "How much should I tip?",
        a: "Tipping (baksheesh) is customary. As a guide: USD 10–15 per day for your guide, USD 5–8 per day for your driver, and 10% in restaurants where service isn't included. It is always optional and never expected up front.",
      },
    ],
  },
  {
    title: "On the trip",
    items: [
      {
        q: "Is the drinking water safe?",
        a: "Stick to bottled water, which we supply in the vehicle every day at no charge. Ice in hotels and established restaurants is made from filtered water and is fine.",
      },
      {
        q: "Are meals included?",
        a: "Breakfast is included wherever you're staying. Nile cruises are full board. Day tours include water and sometimes lunch — the inclusions list on each tour tells you exactly. We deliberately leave dinners free so you can eat where you like, and your guide will make suggestions.",
      },
      {
        q: "Can you cater for dietary requirements or accessibility needs?",
        a: "Yes — tell us at the booking stage. Vegetarian, vegan, halal and gluten-free are all straightforward. Several sites have step-free routes and we can arrange a wheelchair-accessible vehicle; talk to your planner and we'll build the itinerary around it.",
      },
      {
        q: "What if my flight is delayed or something goes wrong?",
        a: "Your planner's WhatsApp number is on your confirmation and is answered seven days a week while you're in the country. Transfers are tracked against your flight number, so a delayed arrival simply moves the pickup.",
      },
    ],
  },
]
