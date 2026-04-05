// ===== SITE CONFIG =====
export const SITE_NAME = 'تأجير سيارات'
export const SITE_NAME_EN = 'Cars Renting'
export const SITE_URL = 'https://cars-renting.com'

// ===== CITIES =====
export interface City {
  slug: string
  nameAr: string
  nameEn: string
  minPrice: number
  partnerCount: number
  description: string
  image: string
}

export const cities: City[] = [
  {
    slug: 'riyadh',
    nameAr: 'الرياض',
    nameEn: 'Riyadh',
    minPrice: 89,
    partnerCount: 18,
    description: 'عاصمة المملكة وأكبر مدينة — أسطول ضخم من المركبات الاقتصادية والفاخرة مع خدمة توصيل لمطار الملك خالد الدولي.',
    image: '/images/riyadh.webp',
  },
  {
    slug: 'jeddah',
    nameAr: 'جدة',
    nameEn: 'Jeddah',
    minPrice: 99,
    partnerCount: 15,
    description: 'بوابة الحرمين الشريفين — خيارات واسعة للإيجار اليومي والشهري بالقرب من مطار الملك عبدالعزيز والكورنيش.',
    image: '/images/jeddah.webp',
  },
  {
    slug: 'dammam',
    nameAr: 'الدمام',
    nameEn: 'Dammam',
    minPrice: 79,
    partnerCount: 12,
    description: 'عاصمة المنطقة الشرقية — أسعار تنافسية مع تغطية لمطار الملك فهد الدولي وربط مباشر بالخبر والظهران.',
    image: '/images/dammam.webp',
  },
  {
    slug: 'makkah',
    nameAr: 'مكة المكرمة',
    nameEn: 'Makkah',
    minPrice: 95,
    partnerCount: 6,
    description: 'قبلة المسلمين — إيجار مركبات للمعتمرين والحجاج مع خدمة استقبال من مطار جدة وتوصيل للحرم مباشرة.',
    image: '/images/makkah.webp',
  },
  {
    slug: 'madinah',
    nameAr: 'المدينة المنورة',
    nameEn: 'Madinah',
    minPrice: 92,
    partnerCount: 5,
    description: 'مدينة الرسول — حلول تنقل مرنة للزوار مع استلام وتسليم من مطار الأمير محمد بن عبدالعزيز.',
    image: '/images/madinah.webp',
  },
  {
    slug: 'khobar',
    nameAr: 'الخبر',
    nameEn: 'Khobar',
    minPrice: 42,
    partnerCount: 4,
    description: 'لؤلؤة الشرقية — أرخص عروض تأجير سيارات بالمملكة مع تغطية لجسر الملك فهد والمنطقة الصناعية.',
    image: '/images/khobar.webp',
  },
]

// ===== VEHICLE CATEGORIES =====
export interface Category {
  slug: string
  nameAr: string
  nameEn: string
  icon: string
  minPrice: number
}

export const categories: Category[] = [
  { slug: 'economy', nameAr: 'اقتصادية', nameEn: 'Economy', icon: '🚗', minPrice: 79 },
  { slug: 'sedan', nameAr: 'سيدان', nameEn: 'Sedan', icon: '🚙', minPrice: 99 },
  { slug: 'suv', nameAr: 'دفع رباعي', nameEn: 'SUV', icon: '🏎️', minPrice: 149 },
  { slug: 'luxury', nameAr: 'فاخرة', nameEn: 'Luxury', icon: '✨', minPrice: 299 },
  { slug: '7-seater', nameAr: '7 مقاعد', nameEn: '7-Seater', icon: '🚐', minPrice: 169 },
  { slug: 'pickup', nameAr: 'بيك أب', nameEn: 'Pickup', icon: '🛻', minPrice: 139 },
  { slug: 'van', nameAr: 'فان', nameEn: 'Van', icon: '🚌', minPrice: 199 },
]

// ===== AIRPORTS =====
export interface Airport {
  slug: string
  nameAr: string
  code: string
  citySlug: string
}

export const airports: Airport[] = [
  { slug: 'king-khalid', nameAr: 'مطار الملك خالد الدولي', code: 'RUH', citySlug: 'riyadh' },
  { slug: 'king-abdulaziz', nameAr: 'مطار الملك عبدالعزيز الدولي', code: 'JED', citySlug: 'jeddah' },
  { slug: 'king-fahd', nameAr: 'مطار الملك فهد الدولي', code: 'DMM', citySlug: 'dammam' },
  { slug: 'prince-mohammed', nameAr: 'مطار الأمير محمد بن عبدالعزيز', code: 'MED', citySlug: 'madinah' },
  { slug: 'taif', nameAr: 'مطار الطائف الدولي', code: 'TIF', citySlug: 'makkah' },
]

// ===== PARTNERS =====
export interface Partner {
  name: string
  rating: string
  phone: string
  cities: string[]
}

export const partners: Partner[] = [
  { name: 'ثيب', rating: '4.7', phone: '966500000001', cities: ['riyadh', 'dammam', 'madinah', 'tabuk'] },
  { name: 'يلو', rating: '4.5', phone: '966500000002', cities: ['riyadh', 'jeddah', 'abha'] },
  { name: 'لومي', rating: '4.6', phone: '966500000003', cities: ['riyadh', 'makkah'] },
  { name: 'بادجت', rating: '4.4', phone: '966500000004', cities: ['jeddah', 'khobar'] },
  { name: 'هانكو', rating: '4.3', phone: '966500000005', cities: ['jeddah'] },
  { name: 'سترونج', rating: '4.2', phone: '966500000008', cities: ['dammam'] },
]

// ===== CAR MODELS =====
export interface CarModel {
  slug: string
  nameAr: string
  nameEn: string
  brand: string
  brandAr: string
  category: string
  seats: number
  transmission: string
  transmissionAr: string
  fuel: string
  fuelAr: string
  year: number
  dailyPrice: number
  monthlyPrice: number
  features: string[]
  description: string
}

export const carModels: CarModel[] = [
  // === ECONOMY ===
  { slug: 'hyundai-accent', nameAr: 'هيونداي اكسنت', nameEn: 'Hyundai Accent', brand: 'Hyundai', brandAr: 'هيونداي', category: 'economy', seats: 5, transmission: 'Automatic', transmissionAr: 'أوتوماتيك', fuel: 'Petrol', fuelAr: 'بنزين', year: 2025, dailyPrice: 79, monthlyPrice: 1899, features: ['بلوتوث','شاشة لمس','كاميرا خلفية','تكييف'], description: 'خيار اقتصادي مثالي للتنقلات اليومية. محرك 1.4 لتر موفر للوقود مع مساحة داخلية مريحة لأربعة ركاب.' },
  { slug: 'toyota-yaris', nameAr: 'تويوتا يارس', nameEn: 'Toyota Yaris', brand: 'Toyota', brandAr: 'تويوتا', category: 'economy', seats: 5, transmission: 'Automatic', transmissionAr: 'أوتوماتيك', fuel: 'Petrol', fuelAr: 'بنزين', year: 2025, dailyPrice: 85, monthlyPrice: 1999, features: ['شاشة 7 بوصة','مثبت سرعة','6 وسائد هوائية','Apple CarPlay'], description: 'سيارة عملية واقتصادية من تويوتا. محرك 1.5 لتر مع استهلاك وقود ممتاز ونظام أمان متقدم.' },
  { slug: 'kia-pegas', nameAr: 'كيا بيجاس', nameEn: 'Kia Pegas', brand: 'Kia', brandAr: 'كيا', category: 'economy', seats: 5, transmission: 'Automatic', transmissionAr: 'أوتوماتيك', fuel: 'Petrol', fuelAr: 'بنزين', year: 2025, dailyPrice: 75, monthlyPrice: 1799, features: ['شاشة لمس','بلوتوث','مفتاح ذكي','USB'], description: 'سيارة صغيرة بسعر منافس. محرك 1.4 لتر مناسب للمشاوير القصيرة والمتوسطة داخل المدينة.' },
  { slug: 'nissan-sunny', nameAr: 'نيسان صني', nameEn: 'Nissan Sunny', brand: 'Nissan', brandAr: 'نيسان', category: 'economy', seats: 5, transmission: 'Automatic', transmissionAr: 'أوتوماتيك', fuel: 'Petrol', fuelAr: 'بنزين', year: 2025, dailyPrice: 82, monthlyPrice: 1950, features: ['شاشة لمس','كاميرا خلفية','مثبت سرعة','حساسات ركن'], description: 'سيدان اقتصادية موثوقة. محرك 1.5 لتر مع صندوق أمتعة واسع وراحة قيادة ممتازة.' },
  { slug: 'suzuki-ciaz', nameAr: 'سوزوكي سياز', nameEn: 'Suzuki Ciaz', brand: 'Suzuki', brandAr: 'سوزوكي', category: 'economy', seats: 5, transmission: 'Automatic', transmissionAr: 'أوتوماتيك', fuel: 'Petrol', fuelAr: 'بنزين', year: 2025, dailyPrice: 78, monthlyPrice: 1850, features: ['شاشة ملاحة','كاميرا خلفية','بلوتوث','مقاعد جلدية'], description: 'سيدان اقتصادية بمساحة داخلية واسعة. محرك 1.5 لتر هادئ مع استهلاك وقود ممتاز.' },

  // === SEDAN ===
  { slug: 'toyota-camry', nameAr: 'تويوتا كامري', nameEn: 'Toyota Camry', brand: 'Toyota', brandAr: 'تويوتا', category: 'sedan', seats: 5, transmission: 'Automatic', transmissionAr: 'أوتوماتيك', fuel: 'Petrol', fuelAr: 'بنزين', year: 2025, dailyPrice: 149, monthlyPrice: 3499, features: ['شاشة 9 بوصة','فتحة سقف','مقاعد جلدية','تحكم أمامي مزدوج'], description: 'السيدان الأكثر شعبية في السعودية. محرك V6 بقوة 301 حصان مع تجربة قيادة فاخرة ومريحة.' },
  { slug: 'hyundai-sonata', nameAr: 'هيونداي سوناتا', nameEn: 'Hyundai Sonata', brand: 'Hyundai', brandAr: 'هيونداي', category: 'sedan', seats: 5, transmission: 'Automatic', transmissionAr: 'أوتوماتيك', fuel: 'Petrol', fuelAr: 'بنزين', year: 2025, dailyPrice: 139, monthlyPrice: 3299, features: ['شاشة بانورامية','مقاعد مُدفأة','شحن لاسلكي','رادار أمامي'], description: 'تصميم جريء بتقنيات متقدمة. محرك 2.5 لتر مع ناقل حركة ثماني السرعات وأنظمة أمان شاملة.' },
  { slug: 'kia-k5', nameAr: 'كيا K5', nameEn: 'Kia K5', brand: 'Kia', brandAr: 'كيا', category: 'sedan', seats: 5, transmission: 'Automatic', transmissionAr: 'أوتوماتيك', fuel: 'Petrol', fuelAr: 'بنزين', year: 2025, dailyPrice: 135, monthlyPrice: 3199, features: ['شاشة 10.25 بوصة','فتحة سقف','مثبت سرعة ذكي','مقاعد جلدية'], description: 'سيدان رياضية بتصميم عصري. محرك توربو 1.6 لتر بقوة 180 حصان مع تجربة قيادة ديناميكية.' },
  { slug: 'honda-accord', nameAr: 'هوندا اكورد', nameEn: 'Honda Accord', brand: 'Honda', brandAr: 'هوندا', category: 'sedan', seats: 5, transmission: 'Automatic', transmissionAr: 'أوتوماتيك', fuel: 'Petrol', fuelAr: 'بنزين', year: 2025, dailyPrice: 145, monthlyPrice: 3399, features: ['نظام Honda Sensing','شاشة لمس','Apple CarPlay','وسائد هوائية 10'], description: 'سيدان يابانية بموثوقية عالية. محرك توربو 1.5 لتر مع نظام أمان Honda Sensing الشامل.' },
  { slug: 'nissan-altima', nameAr: 'نيسان التيما', nameEn: 'Nissan Altima', brand: 'Nissan', brandAr: 'نيسان', category: 'sedan', seats: 5, transmission: 'Automatic', transmissionAr: 'أوتوماتيك', fuel: 'Petrol', fuelAr: 'بنزين', year: 2025, dailyPrice: 140, monthlyPrice: 3350, features: ['ProPilot Assist','شاشة 8 بوصة','كاميرا 360°','تنبيه نقطة عمياء'], description: 'سيدان بتقنيات قيادة شبه ذاتية. محرك 2.5 لتر بقوة 188 حصان مع نظام الدفع الأمامي المتقدم.' },

  // === SUV ===
  { slug: 'toyota-fortuner', nameAr: 'تويوتا فورتشنر', nameEn: 'Toyota Fortuner', brand: 'Toyota', brandAr: 'تويوتا', category: 'suv', seats: 7, transmission: 'Automatic', transmissionAr: 'أوتوماتيك', fuel: 'Diesel', fuelAr: 'ديزل', year: 2025, dailyPrice: 199, monthlyPrice: 4799, features: ['دفع رباعي','7 مقاعد','شاشة 8 بوصة','مثبت سرعة'], description: 'سيارة دفع رباعي قوية مناسبة للطرق الوعرة والرحلات البرية. محرك ديزل 2.8 لتر بعزم قوي.' },
  { slug: 'nissan-patrol', nameAr: 'نيسان باترول', nameEn: 'Nissan Patrol', brand: 'Nissan', brandAr: 'نيسان', category: 'suv', seats: 8, transmission: 'Automatic', transmissionAr: 'أوتوماتيك', fuel: 'Petrol', fuelAr: 'بنزين', year: 2025, dailyPrice: 299, monthlyPrice: 6999, features: ['دفع رباعي','8 مقاعد','شاشة مزدوجة','مقاعد جلدية'], description: 'أيقونة الصحراء السعودية. محرك V8 بقوة 400 حصان مع فخامة لا تضاهى ومساحة داخلية ضخمة.' },
  { slug: 'hyundai-tucson', nameAr: 'هيونداي توسان', nameEn: 'Hyundai Tucson', brand: 'Hyundai', brandAr: 'هيونداي', category: 'suv', seats: 5, transmission: 'Automatic', transmissionAr: 'أوتوماتيك', fuel: 'Petrol', fuelAr: 'بنزين', year: 2025, dailyPrice: 169, monthlyPrice: 3999, features: ['تصميم بارامتري','شاشة 10.25 بوصة','شحن لاسلكي','فتحة سقف'], description: 'كروس أوفر بتصميم مستقبلي. محرك 2.0 لتر مع ناقل حركة 6 سرعات وأنظمة مساعدة شاملة.' },
  { slug: 'kia-sportage', nameAr: 'كيا سبورتاج', nameEn: 'Kia Sportage', brand: 'Kia', brandAr: 'كيا', category: 'suv', seats: 5, transmission: 'Automatic', transmissionAr: 'أوتوماتيك', fuel: 'Petrol', fuelAr: 'بنزين', year: 2025, dailyPrice: 159, monthlyPrice: 3799, features: ['شاشة بانورامية منحنية','فتحة سقف','مقاعد مُبردة','كاميرا 360°'], description: 'كروس أوفر عائلي بتقنيات متطورة. محرك توربو 1.6 لتر مع تصميم داخلي فاخر.' },
  { slug: 'mg-hs', nameAr: 'ام جي HS', nameEn: 'MG HS', brand: 'MG', brandAr: 'ام جي', category: 'suv', seats: 5, transmission: 'Automatic', transmissionAr: 'أوتوماتيك', fuel: 'Petrol', fuelAr: 'بنزين', year: 2025, dailyPrice: 149, monthlyPrice: 3499, features: ['فتحة سقف بانورامية','شاشة 10.1 بوصة','مقاعد جلدية','6 وسائد هوائية'], description: 'كروس أوفر بسعر منافس ومواصفات عالية. محرك توربو 1.5 لتر بقوة 162 حصان.' },

  // === LUXURY ===
  { slug: 'mercedes-e-class', nameAr: 'مرسيدس E-Class', nameEn: 'Mercedes E-Class', brand: 'Mercedes', brandAr: 'مرسيدس', category: 'luxury', seats: 5, transmission: 'Automatic', transmissionAr: 'أوتوماتيك', fuel: 'Petrol', fuelAr: 'بنزين', year: 2025, dailyPrice: 399, monthlyPrice: 9499, features: ['نظام MBUX','مقاعد مساج','إضاءة محيطية 64 لون','قيادة شبه ذاتية'], description: 'سيدان فاخرة بأحدث تقنيات مرسيدس. محرك توربو 2.0 لتر بقوة 255 حصان مع رفاهية لا محدودة.' },
  { slug: 'bmw-5-series', nameAr: 'بي ام دبليو الفئة 5', nameEn: 'BMW 5 Series', brand: 'BMW', brandAr: 'بي ام دبليو', category: 'luxury', seats: 5, transmission: 'Automatic', transmissionAr: 'أوتوماتيك', fuel: 'Petrol', fuelAr: 'بنزين', year: 2025, dailyPrice: 449, monthlyPrice: 10499, features: ['iDrive 8','Head-Up Display','مقاعد مُدفأة ومُبردة','Harman Kardon'], description: 'أداء رياضي مع فخامة ألمانية. محرك توربو 2.0 لتر بقوة 245 حصان مع نظام xDrive الذكي.' },
  { slug: 'lexus-es', nameAr: 'لكزس ES', nameEn: 'Lexus ES', brand: 'Lexus', brandAr: 'لكزس', category: 'luxury', seats: 5, transmission: 'Automatic', transmissionAr: 'أوتوماتيك', fuel: 'Hybrid', fuelAr: 'هايبرد', year: 2025, dailyPrice: 379, monthlyPrice: 8999, features: ['Mark Levinson','شاشة 14 بوصة','مقاعد شبه جلدية','Lexus Safety System'], description: 'فخامة يابانية بموثوقية استثنائية. محرك هايبرد 2.5 لتر بقوة 215 حصان مع هدوء تشغيل مميز.' },
  { slug: 'audi-a6', nameAr: 'أودي A6', nameEn: 'Audi A6', brand: 'Audi', brandAr: 'أودي', category: 'luxury', seats: 5, transmission: 'Automatic', transmissionAr: 'أوتوماتيك', fuel: 'Petrol', fuelAr: 'بنزين', year: 2025, dailyPrice: 429, monthlyPrice: 9999, features: ['MMI Touch Response','Virtual Cockpit','Matrix LED','مقاعد مساج'], description: 'تقنية ألمانية متقدمة مع أناقة حديثة. محرك توربو 2.0 لتر بقوة 245 حصان ونظام Quattro.' },
  { slug: 'genesis-g80', nameAr: 'جينيسيس G80', nameEn: 'Genesis G80', brand: 'Genesis', brandAr: 'جينيسيس', category: 'luxury', seats: 5, transmission: 'Automatic', transmissionAr: 'أوتوماتيك', fuel: 'Petrol', fuelAr: 'بنزين', year: 2025, dailyPrice: 359, monthlyPrice: 8499, features: ['شاشة 14.5 بوصة','مقاعد مُبردة ومُدفأة','Lexicon Audio','فتحة سقف'], description: 'فخامة كورية بتصميم مميز. محرك توربو 2.5 لتر بقوة 300 حصان مع ضمان شامل.' },

  // === 7-SEATER ===
  { slug: 'toyota-innova', nameAr: 'تويوتا إنوفا', nameEn: 'Toyota Innova', brand: 'Toyota', brandAr: 'تويوتا', category: '7-seater', seats: 7, transmission: 'Automatic', transmissionAr: 'أوتوماتيك', fuel: 'Petrol', fuelAr: 'بنزين', year: 2025, dailyPrice: 179, monthlyPrice: 4299, features: ['7 مقاعد','شاشة لمس','تكييف خلفي','USB خلفي'], description: 'سيارة عائلية عملية بسبعة مقاعد. محرك 2.0 لتر مع مساحة أمتعة واسعة وراحة لجميع الركاب.' },
  { slug: 'hyundai-staria', nameAr: 'هيونداي ستاريا', nameEn: 'Hyundai Staria', brand: 'Hyundai', brandAr: 'هيونداي', category: '7-seater', seats: 9, transmission: 'Automatic', transmissionAr: 'أوتوماتيك', fuel: 'Diesel', fuelAr: 'ديزل', year: 2025, dailyPrice: 219, monthlyPrice: 5199, features: ['9 مقاعد','تصميم مستقبلي','باب كهربائي منزلق','تكييف ثلاثي المناطق'], description: 'ميني فان بتصميم فضائي مستقبلي. محرك ديزل 2.2 لتر مع 9 مقاعد واسعة ومريحة.' },
  { slug: 'kia-carnival', nameAr: 'كيا كارنيفال', nameEn: 'Kia Carnival', brand: 'Kia', brandAr: 'كيا', category: '7-seater', seats: 8, transmission: 'Automatic', transmissionAr: 'أوتوماتيك', fuel: 'Petrol', fuelAr: 'بنزين', year: 2025, dailyPrice: 199, monthlyPrice: 4799, features: ['8 مقاعد','شاشة 12.3 بوصة','مقاعد VIP','باب كهربائي'], description: 'ميني فان فاخر للعائلات الكبيرة. محرك V6 بقوة 290 حصان مع مقاعد قابلة للطي والتحريك.' },

  // === PICKUP ===
  { slug: 'toyota-hilux', nameAr: 'تويوتا هايلكس', nameEn: 'Toyota Hilux', brand: 'Toyota', brandAr: 'تويوتا', category: 'pickup', seats: 5, transmission: 'Automatic', transmissionAr: 'أوتوماتيك', fuel: 'Diesel', fuelAr: 'ديزل', year: 2025, dailyPrice: 169, monthlyPrice: 3999, features: ['دفع رباعي','صندوق حمولة','كاميرا خلفية','مثبت سرعة'], description: 'بيك أب أسطوري بمتانة لا تنتهي. محرك ديزل 2.8 لتر مع دفع رباعي وقدرة سحب عالية.' },
  { slug: 'nissan-navara', nameAr: 'نيسان نافارا', nameEn: 'Nissan Navara', brand: 'Nissan', brandAr: 'نيسان', category: 'pickup', seats: 5, transmission: 'Automatic', transmissionAr: 'أوتوماتيك', fuel: 'Diesel', fuelAr: 'ديزل', year: 2025, dailyPrice: 159, monthlyPrice: 3799, features: ['دفع رباعي','شاشة لمس','كاميرا 360°','أقفال تفاضلية'], description: 'بيك أب قوي بمواصفات عالية. محرك ديزل 2.5 لتر مع نظام تعليق مريح للطرق الممهدة والوعرة.' },
  { slug: 'mitsubishi-l200', nameAr: 'ميتسوبيشي L200', nameEn: 'Mitsubishi L200', brand: 'Mitsubishi', brandAr: 'ميتسوبيشي', category: 'pickup', seats: 5, transmission: 'Automatic', transmissionAr: 'أوتوماتيك', fuel: 'Diesel', fuelAr: 'ديزل', year: 2025, dailyPrice: 149, monthlyPrice: 3599, features: ['Super Select 4WD','شاشة لمس','6 وسائد هوائية','مقاعد جلدية'], description: 'بيك أب ياباني بنظام دفع رباعي متقدم Super Select. محرك ديزل 2.4 لتر مع عزم 430 نيوتن.' },

  // === VAN ===
  { slug: 'toyota-hiace', nameAr: 'تويوتا هاي إيس', nameEn: 'Toyota HiAce', brand: 'Toyota', brandAr: 'تويوتا', category: 'van', seats: 13, transmission: 'Automatic', transmissionAr: 'أوتوماتيك', fuel: 'Diesel', fuelAr: 'ديزل', year: 2025, dailyPrice: 249, monthlyPrice: 5999, features: ['13 راكب','تكييف قوي','باب منزلق','مساحة أمتعة'], description: 'فان كبير مثالي للمجموعات السياحية ورحلات العمرة. محرك ديزل 2.8 لتر مع سعة حتى 13 راكب.' },
  { slug: 'hyundai-h1', nameAr: 'هيونداي H1', nameEn: 'Hyundai H1', brand: 'Hyundai', brandAr: 'هيونداي', category: 'van', seats: 12, transmission: 'Automatic', transmissionAr: 'أوتوماتيك', fuel: 'Diesel', fuelAr: 'ديزل', year: 2025, dailyPrice: 229, monthlyPrice: 5499, features: ['12 راكب','تكييف خلفي','شاشة لمس','حساسات ركن'], description: 'فان عملي للنقل الجماعي. محرك ديزل 2.5 لتر مع مقاعد قابلة للتعديل ومساحة حمولة مرنة.' },
  { slug: 'mercedes-vito', nameAr: 'مرسيدس فيتو', nameEn: 'Mercedes Vito', brand: 'Mercedes', brandAr: 'مرسيدس', category: 'van', seats: 9, transmission: 'Automatic', transmissionAr: 'أوتوماتيك', fuel: 'Diesel', fuelAr: 'ديزل', year: 2025, dailyPrice: 299, monthlyPrice: 6999, features: ['9 مقاعد VIP','تكييف ثلاثي','مقاعد جلدية','MBUX'], description: 'فان فاخر لكبار الشخصيات والضيوف. محرك ديزل 2.0 لتر مع تجهيز VIP ومقاعد جلدية مريحة.' },
]

export function getCarsByCategory(categorySlug: string): CarModel[] {
  return carModels.filter(c => c.category === categorySlug)
}

export function getCarBySlug(slug: string): CarModel | undefined {
  return carModels.find(c => c.slug === slug)
}

// ===== CATEGORY CARD GRADIENTS =====
export const categoryGradients: Record<string, { from: string; to: string }> = {
  economy: { from: '#1B3A5C', to: '#0D1B2A' },
  sedan: { from: '#2C4A6E', to: '#0D1B2A' },
  suv: { from: '#1A4D3E', to: '#0D1B2A' },
  luxury: { from: '#5C4A1B', to: '#0D1B2A' },
  '7-seater': { from: '#3D2E5C', to: '#0D1B2A' },
  pickup: { from: '#4A3328', to: '#0D1B2A' },
  van: { from: '#1B4D5C', to: '#0D1B2A' },
}

// ===== UNIQUE SEO CONTENT GENERATORS =====
const cityContexts: Record<string, { terrain: string; climate: string; landmarks: string; traffic: string; rentalTip: string }> = {
  riyadh: { terrain: 'طرق سريعة واسعة ومسافات طويلة بين الأحياء', climate: 'صيف حار جداً يستلزم تكييف قوي وشتاء معتدل مثالي للقيادة', landmarks: 'بوليفارد الرياض وقصر المصمك والدرعية التاريخية', traffic: 'ازدحام مروري في ساعات الذروة خصوصاً طريق الملك فهد والدائري الشرقي', rentalTip: 'ننصح بالاستلام من مطار الملك خالد الدولي مباشرة لتوفير وقت التنقل' },
  jeddah: { terrain: 'كورنيش طويل ومناطق ساحلية بطرق ممهدة', climate: 'رطوبة عالية صيفاً مع اعتدال في الشتاء — التكييف ضروري طوال العام', landmarks: 'نافورة الملك فهد وحي البلد التاريخي وشاطئ أبحر', traffic: 'ازدحام في منطقة الحمدانية وشارع التحلية خلال المواسم', rentalTip: 'لو رحلتك تشمل مكة ننصح بسيارة مريحة للمسافة بين المدينتين' },
  dammam: { terrain: 'طرق مستقيمة تربط الدمام بالخبر والظهران', climate: 'صيف رطب وشتاء بارد نسبياً مع أمطار متقطعة', landmarks: 'واجهة الدمام البحرية وجسر الملك فهد وجزيرة المرجان', traffic: 'حركة مرور سلسة نسبياً مقارنة بالرياض وجدة', rentalTip: 'السيارات الاقتصادية مثالية للتنقل بين مدن المنطقة الشرقية الثلاث' },
  makkah: { terrain: 'طرق جبلية ومنحدرات حول المشاعر المقدسة', climate: 'حرارة مرتفعة معظم السنة مع جفاف — احرص على تكييف قوي', landmarks: 'المسجد الحرام وجبل النور ومنى وعرفات', traffic: 'ازدحام شديد في مواسم الحج والعمرة خصوصاً حول الحرم', rentalTip: 'خدمة التوصيل من مطار جدة متاحة مع معظم شركائنا — احجز مسبقاً في المواسم' },
  madinah: { terrain: 'طرق منظمة حول المنطقة المركزية والمسجد النبوي', climate: 'صيف حار وشتاء بارد مع أمطار موسمية', landmarks: 'المسجد النبوي وجبل أحد ومسجد قباء ومجمع الملك فهد', traffic: 'حركة مرور معتدلة مع ازدحام حول المنطقة المركزية أثناء الصلوات', rentalTip: 'ننصح بالاستلام من مطار الأمير محمد بن عبدالعزيز مباشرة عند الوصول' },
  khobar: { terrain: 'طرق ساحلية جميلة وقرب من جسر الملك فهد للبحرين', climate: 'مناخ ساحلي رطب صيفاً ومعتدل شتاءً', landmarks: 'كورنيش الخبر وجسر الملك فهد والراشد مول', traffic: 'حركة مرور هادئة باستثناء أوقات الذروة على جسر الملك فهد', rentalTip: 'أرخص أسعار التأجير في المملكة — مثالية للرحلات القصيرة والمتوسطة' },
}

const catRentalBenefits: Record<string, string[]> = {
  economy: ['استهلاك وقود اقتصادي يوفر لك تكاليف التنقل اليومي', 'سهولة المناورة والركن في الشوارع الضيقة والمواقف المزدحمة', 'أقل سعر إيجار يومي مع تأمين أساسي شامل', 'مناسبة للأفراد والأزواج ورحلات العمل القصيرة'],
  sedan: ['مساحة داخلية واسعة ومريحة للرحلات الطويلة', 'أداء متوازن بين القوة واستهلاك الوقود', 'صندوق أمتعة كبير يستوعب حقائب السفر بسهولة', 'تقنيات أمان حديثة ونظام ترفيه متكامل'],
  suv: ['قدرة على التعامل مع مختلف أنواع الطرق والتضاريس', 'ارتفاع أرضي مناسب للطرق الوعرة والرملية', 'مساحة داخلية واسعة للعائلات والمجموعات', 'أنظمة دفع رباعي متقدمة للثبات في جميع الظروف'],
  luxury: ['تجربة قيادة فاخرة بأحدث التقنيات والمواد الممتازة', 'أنظمة ترفيه وراحة من الطراز الأول', 'مثالية لرجال الأعمال والمناسبات الرسمية', 'خدمة VIP مع استلام وتسليم حسب الطلب'],
  '7-seater': ['مساحة كافية لجميع أفراد العائلة والأمتعة', 'مقاعد قابلة للطي لزيادة مساحة التحميل', 'تكييف متعدد المناطق لراحة جميع الركاب', 'مثالية لرحلات العمرة العائلية ونقل المجموعات'],
  pickup: ['صندوق حمولة مفتوح لنقل المعدات والبضائع', 'دفع رباعي قوي مناسب للطرق الوعرة والصحراوية', 'متانة عالية وقدرة سحب ممتازة', 'مثالية لمواقع العمل والرحلات البرية والكشتات'],
  van: ['سعة ركاب كبيرة تصل حتى 13 شخص', 'مثالية للمجموعات السياحية ورحلات العمرة والحج', 'مساحة أمتعة واسعة لحقائب جميع الركاب', 'اقتصادية مقارنة باستئجار عدة سيارات صغيرة'],
}

export function generateCarSEOContent(car: CarModel, city: City, cat: Category) {
  const ctx = cityContexts[city.slug] || cityContexts.riyadh
  const benefits = catRentalBenefits[cat.slug] || catRentalBenefits.economy
  const ap = airports.find(a => a.citySlug === city.slug)
  const weeklyPrice = Math.round(car.dailyPrice * 7 * 0.85)

  const uniqueIntro = `تبحث عن تأجير ${car.nameAr} ${car.year} في ${city.nameAr}؟ منصتنا تجمع لك أفضل عروض إيجار ${car.nameAr} من مكاتب التأجير المرخصة في ${city.nameAr}. تبدأ الأسعار من ${car.dailyPrice} ريال سعودي لليوم الواحد ومن ${car.monthlyPrice} ريال للإيجار الشهري. ${car.nameAr} من ${car.brandAr} تتميز بـ${car.description.split('.')[0]}.`

  const cityTips = `عند استئجار ${car.nameAr} في ${city.nameAr} تذكر أن المدينة تتميز بـ${ctx.terrain}. المناخ في ${city.nameAr}: ${ctx.climate}. من أبرز الوجهات التي يمكنك زيارتها: ${ctx.landmarks}. ${ctx.rentalTip}.`

  const whyThisCar = `لماذا تختار ${car.nameAr} للتأجير في ${city.nameAr}؟ ${benefits[0]}. بالإضافة إلى ${benefits[1]}. كما أن ${car.nameAr} توفر ${benefits[2]}. ${benefits[3]}.`

  const pricingDetails = `تفاصيل أسعار تأجير ${car.nameAr} في ${city.nameAr}: الإيجار اليومي يبدأ من ${car.dailyPrice} ريال، والأسبوعي من ${weeklyPrice} ريال تقريباً بخصم 15%، والشهري من ${car.monthlyPrice} ريال بخصم يصل 40%. جميع الأسعار تشمل التأمين الأساسي ضد الغير. يمكنك ترقية التأمين لشامل أو إضافة خدمات مثل مقعد أطفال أو GPS عند التواصل مع الشركة المؤجرة.`

  const rentalProcess = `خطوات تأجير ${car.nameAr} من ${city.nameAr}: أولاً، قدّم طلبك عبر النموذج أعلاه مع تحديد تواريخ الاستلام والتسليم. ثانياً، سيتواصل معك أحد شركائنا المرخصين خلال دقائق بأفضل عرض سعر. ثالثاً، قم بمراجعة العرض واستلم ${car.nameAr} من الموقع المتفق عليه${ap ? ` أو من ${ap.nameAr}` : ''}. المستندات المطلوبة: رخصة قيادة سارية وهوية وطنية أو جواز سفر.`

  return { uniqueIntro, cityTips, whyThisCar, pricingDetails, rentalProcess, weeklyPrice }
}

// ===== SEO HELPERS =====
export function getCityBySlug(slug: string): City | undefined {
  return cities.find(c => c.slug === slug)
}

export function getPartnersForCity(citySlug: string): Partner[] {
  return partners.filter(p => p.cities.includes(citySlug))
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find(c => c.slug === slug)
}

export function getAirportBySlug(slug: string): Airport | undefined {
  return airports.find(a => a.slug === slug)
}

export function getAirportsForCity(citySlug: string): Airport[] {
  return airports.filter(a => a.citySlug === citySlug)
}

// ===== FAQ DATA =====
export const homeFAQs = [
  {
    q: 'كم يكلف إيجار سيارة في المملكة؟',
    a: 'تتراوح التكلفة بين 79 ريال للموديلات الاقتصادية و299 ريال للفئات الفاخرة يومياً. يتفاوت السعر حسب الموقع والمدة والفئة المطلوبة.',
  },
  {
    q: 'هل الحجز يحتاج ضمان مالي مقدّم؟',
    a: 'لا، تقديم الطلب مجاني تماماً ولا يستلزم دفعة مقدمة أو بطاقة بنكية. آلية السداد تحددها الشركة المؤجرة بعد التواصل المباشر.',
  },
  {
    q: 'هل يوجد توصيل واستلام من المطار؟',
    a: 'بالتأكيد، غالبية مكاتب الإيجار المعتمدة لدينا تقدّم خدمة الاستقبال والتسليم في المطارات الدولية والمحلية بالمملكة.',
  },
  {
    q: 'ما الفئات والموديلات المتوفرة؟',
    a: 'تشمل الخيارات: صغيرة اقتصادية، سيدان متوسطة، دفع رباعي، عائلية سبعة ركاب، وسيارات فاخرة من علامات تجارية عالمية.',
  },
]

// ===== SCHEMA GENERATORS =====
export function generateFAQSchema(faqs: { q: string; a: string }[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  }
}
