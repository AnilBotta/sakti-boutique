// Category and subcategory imagery for landings/rails. Until CMS lands.

export const categoryImagery: Record<string, string> = {
  'women/kurthis':
    'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=900&q=80',
  'women/salwar-suit':
    'https://images.unsplash.com/photo-1610030469668-8e4a0e5c7f5e?auto=format&fit=crop&w=900&q=80',
  'women/sarees':
    'https://images.unsplash.com/photo-1594387310467-bb8b1ba73e2e?auto=format&fit=crop&w=900&q=80',
  'women/lehenga':
    'https://images.unsplash.com/photo-1610189019926-f8a4ec1cc7e3?auto=format&fit=crop&w=900&q=80',
  'women/readymade-blouse':
    'https://images.unsplash.com/photo-1617922001439-4a2e6562f328?auto=format&fit=crop&w=900&q=80',
  'men/kurtha':
    'https://images.unsplash.com/photo-1622519407650-3df9883f76a5?auto=format&fit=crop&w=900&q=80',
  'men/kurtha-pyjama':
    'https://images.unsplash.com/photo-1622519407650-3df9883f76a5?auto=format&fit=crop&w=900&q=80',
  'men/shirts':
    'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=900&q=80',
  'men/dhoti':
    'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=900&q=80',
  'kids/kurthis':
    'https://images.unsplash.com/photo-1503944168849-8bf86875b08e?auto=format&fit=crop&w=900&q=80',
  'kids/salwar-suit':
    'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=900&q=80',
};

export function categoryImage(audience: string, category: string): string {
  return (
    categoryImagery[`${audience}/${category}`] ??
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80'
  );
}
