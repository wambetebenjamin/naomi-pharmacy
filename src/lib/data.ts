export type Product = {
  slug: string;
  name: string;
  category: string;
  packSize: string;
  price: number;
  image: string;
  description: string;
  dosage: string;
  storage: string;
  sideEffects: string;
  manufacturer: string;
  rx: boolean;
  options: string[];
};

const pexels = (id: number, width = 720) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${width}`;

export const categories = [
  "Pain Relief",
  "Vitamins and Supplements",
  "Antibiotics",
  "Skincare",
  "Baby and Child",
  "Chronic Condition Management",
  "First Aid",
  "Sexual Health",
];

export const products: Product[] = [
  { slug: "paracetamol-500mg", name: "Paracetamol 500mg", category: "Pain Relief", packSize: "20 tablets", price: 120, image: pexels(4492093), description: "Trusted everyday relief for mild pain and fever. Ask a pharmacist if symptoms persist or you are taking other medicines.", dosage: "Adults: follow the pack directions. Do not exceed the stated daily dose. Ask a pharmacist for advice for children.", storage: "Store below 25°C in a dry place, away from children.", sideEffects: "Side effects are uncommon at the recommended dose. Taking too much can seriously harm your liver.", manufacturer: "HealthCare Consumer Products", rx: false, options: ["20 tablets", "100 tablets"] },
  { slug: "vitamin-c-1000", name: "Vitamin C 1000mg", category: "Vitamins and Supplements", packSize: "30 tablets", price: 780, image: pexels(12955610), description: "A convenient daily vitamin C supplement to support your nutrition routine.", dosage: "Adults: one tablet daily with water, or as directed by a healthcare professional.", storage: "Keep tightly closed in a cool, dry place.", sideEffects: "Some people may experience mild stomach upset. Stop use and seek advice if you feel unwell.", manufacturer: "Nature's Way", rx: false, options: ["30 tablets", "60 tablets"] },
  { slug: "gentle-sunscreen-spf50", name: "Daily Sunscreen SPF 50", category: "Skincare", packSize: "50ml", price: 1250, image: pexels(4046945), description: "Broad-spectrum daily sun protection with a light, comfortable finish.", dosage: "Apply generously before sun exposure and reapply every two hours, especially after swimming or sweating.", storage: "Store below 30°C. Do not leave in direct sunlight.", sideEffects: "Discontinue use if irritation occurs. Avoid contact with eyes.", manufacturer: "DermaCare", rx: false, options: ["50ml", "100ml"] },
  { slug: "digital-thermometer", name: "Digital Thermometer", category: "Baby and Child", packSize: "1 device", price: 650, image: pexels(12332074), description: "Easy-to-read digital thermometer for the whole family.", dosage: "Use according to the enclosed instructions. Clean the probe before and after each use.", storage: "Store in its protective case in a cool, dry place.", sideEffects: "No known side effects when used as directed.", manufacturer: "CarePoint", rx: false, options: ["1 device"] },
  { slug: "amoxicillin-500mg", name: "Amoxicillin 500mg", category: "Antibiotics", packSize: "21 capsules", price: 480, image: pexels(4047011), description: "Prescription medicine. A pharmacist must review and verify your valid prescription before dispensing.", dosage: "Use only as prescribed by your clinician. Complete the course exactly as directed.", storage: "Follow the storage directions on the supplied pack.", sideEffects: "May cause nausea, diarrhoea or rash. Seek urgent help for breathing difficulty or facial swelling.", manufacturer: "Licensed supplier", rx: true, options: ["21 capsules"] },
  { slug: "amlodipine-5mg", name: "Amlodipine 5mg", category: "Chronic Condition Management", packSize: "28 tablets", price: 390, image: pexels(4046996), description: "Prescription-only medicine for blood pressure management. Pharmacist review is required.", dosage: "Take only as prescribed. Do not stop a long-term medicine without speaking to your clinician.", storage: "Store in the original pack below 25°C.", sideEffects: "Swollen ankles, flushing or dizziness may occur. Contact your clinician if symptoms worry you.", manufacturer: "Licensed supplier", rx: true, options: ["28 tablets", "56 tablets"] },
  { slug: "first-aid-kit", name: "Everyday First Aid Kit", category: "First Aid", packSize: "25 pieces", price: 950, image: pexels(15831829), description: "A practical home first aid kit with everyday essentials for minor cuts and scrapes.", dosage: "Use each item only for its intended purpose. Follow the included instructions.", storage: "Keep sealed in a cool, dry place, out of reach of children.", sideEffects: "Seek medical care for deep wounds, severe burns or signs of infection.", manufacturer: "CarePoint", rx: false, options: ["25 pieces"] },
  { slug: "oral-rehydration-salts", name: "Oral Rehydration Salts", category: "Baby and Child", packSize: "10 sachets", price: 280, image: pexels(7195041), description: "Convenient rehydration sachets for fluid replacement. Ask a pharmacist about use for young children.", dosage: "Mix each sachet with the exact amount of clean water stated on its pack.", storage: "Store sealed sachets in a dry place.", sideEffects: "Get medical advice if dehydration is severe or symptoms do not improve.", manufacturer: "AfyaCare", rx: false, options: ["10 sachets"] },
  { slug: "contraceptive-counselling", name: "Emergency Contraception", category: "Sexual Health", packSize: "1 tablet", price: 420, image: pexels(4492070), description: "Speak confidentially with a pharmacist about timing, suitability and other options.", dosage: "Use only after speaking with a qualified healthcare professional and follow the supplied directions.", storage: "Store according to pack instructions.", sideEffects: "Nausea or temporary cycle changes can occur. This does not protect against sexually transmitted infections.", manufacturer: "Licensed supplier", rx: true, options: ["1 tablet"] },
];

export const testimonials = [
  { quote: "Ordered my prescription in the morning and had everything at my door before lunch. Such a thoughtful service.", name: "Wanjiku M.", location: "Kilimani" },
  { quote: "The pharmacist answered my questions on WhatsApp and helped me choose the right option for my family.", name: "Brian K.", location: "Westlands" },
  { quote: "Fast, discreet, and the M-Pesa checkout was refreshingly simple. I will definitely order again.", name: "Amina N.", location: "Lavington" },
];

export const tips = [
  { title: "Make a medicine routine that sticks", category: "Everyday wellness", date: "18 June 2026", summary: "Linking medicines to a regular daily habit can make it easier to remember. Always follow the label or your clinician's advice." },
  { title: "A simple guide to staying hydrated", category: "Healthy habits", date: "11 June 2026", summary: "Water needs vary with weather, activity and health. Keep water nearby and ask a clinician for personalised advice." },
  { title: "When should you speak to a pharmacist?", category: "Pharmacist advice", date: "04 June 2026", summary: "If you are unsure about a dose, side effect or medicine combination, a pharmacist can help you decide on the next step." },
];
