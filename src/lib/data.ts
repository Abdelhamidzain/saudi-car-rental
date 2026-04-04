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
