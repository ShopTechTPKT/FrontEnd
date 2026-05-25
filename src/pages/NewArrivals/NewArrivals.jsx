import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const NewArrivals = () => {
  const { t } = useTranslation();

  const [hoveredProduct, setHoveredProduct] = useState(null);

  const newProducts = [
    {
      id: 1,
      name: 'MSI Titan 18 HX Gaming Laptop',
      category: 'Laptops',
      price: 4299,
      image: '/src/assets/images/products/laptop-new1.jpg',
      badge: 'Just Landed',
      rating: 5.0,
      reviews: 12,
      specs: ['RTX 4090', 'i9-14900HX', '64GB RAM']
    },
    {
      id: 2,
      name: 'ROG Azoth Wireless Keyboard',
      category: 'Gaming Gear',
      price: 249,
      image: '/src/assets/images/products/keyboard-new1.jpg',
      badge: t('common.new'),
      rating: 4.9,
      reviews: 45,
      specs: ['Wireless', 'RGB', 'Hot-swappable']
    },
    {
      id: 3,
      name: 'Logitech G Pro X Superlight 2',
      category: 'Gaming Gear',
      price: 159,
      image: '/src/assets/images/products/mouse-new1.jpg',
      badge: 'Trending',
      rating: 4.8,
      reviews: 89,
      specs: ['60g', '32K DPI', 'Wireless']
    },
    {
      id: 4,
      name: 'ASUS ROG Swift OLED PG27AQDM',
      category: 'Monitors',
      price: 899,
      image: '/src/assets/images/products/monitor-new1.jpg',
      badge: t('common.hot'),
      rating: 5.0,
      reviews: 67,
      specs: ['27" OLED', '240Hz', '0.03ms']
    },
    {
      id: 5,
      name: 'Samsung Galaxy S24 Ultra',
      category: 'Phones',
      price: 1299,
      image: '/src/assets/images/products/phone-new1.jpg',
      badge: t('common.new'),
      rating: 4.9,
      reviews: 234,
      specs: ['Snapdragon 8 Gen 3', '200MP', 'S Pen']
    },
    {
      id: 6,
      name: 'SteelSeries Arctis Nova Pro',
      category: 'Gaming Gear',
      price: 349,
      image: '/src/assets/images/products/headset-new1.jpg',
      badge: t('common.premium'),
      rating: 4.7,
      reviews: 156,
      specs: ['Hi-Res', 'Active ANC', 'Wireless']
    },
    {
      id: 7,
      name: 'AMD Ryzen 9 9950X',
      category: 'PC Parts',
      price: 699,
      image: '/src/assets/images/products/cpu-new1.jpg',
      badge: t('common.latest'),
      rating: 5.0,
      reviews: 89,
      specs: ['16 Cores', '5.7GHz', 'AM5']
    },
    {
      id: 8,
      name: 'NVIDIA RTX 5090',
      category: 'PC Parts',
      price: 1999,
      image: '/src/assets/images/products/gpu-new1.jpg',
      badge: t('common.hot'),
      rating: 5.0,
      reviews: 345,
      specs: ['24GB GDDR7', 'AI Enhanced', 'Ray Tracing']
    },
    {
      id: 9,
      name: 'Razer Blade 18 2025',
      category: 'Laptops',
      price: 3799,
      image: '/src/assets/images/products/laptop-new2.jpg',
      badge: t('common.new'),
      rating: 4.8,
      reviews: 78,
      specs: ['RTX 5080', 'QHD+ 240Hz', 'Per-Key RGB']
    }
  ];

  const categories = [t('common.all'), 'Laptops', 'Gaming Gear', 'Monitors', 'Phones', 'PC Parts'];
  const [selectedCategory, setSelectedCategory] = useState(t('common.all'));

  const filteredProducts = selectedCategory === t('common.all') 
    ? newProducts 
    : newProducts.filter(p => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-slate-950 via-slate-900 to-slate-900 text-white py-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary-)]/10 via-transparent to-[var(--color-primary-)]/10 animate-pulse"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="inline-block mb-4 px-6 py-2 bg-gradient-to-r from-[var(--color-primary-)] to-[var(--color-primary-)] rounded-full font-semibold animate-bounce">
              ðŸŽ‰ Fresh Stock Just Arrived!
            </div>
            <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-white to-[var(--color-primary-)] bg-clip-text text-transparent">
              New Arrivals
            </h1>
            <p className="text-xl text-[var(--color-primary-)] mb-8">
              Discover the latest tech innovations - Be the first to own them!
            </p>
            <div className="flex items-center justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <IcShippingFast className="w-6 h-6 text-green-400" />
                <span>{t('common.free_shipping')}</span>
              </div>
              <div className="flex items-center gap-2">
                <IcFire className="w-6 h-6 text-orange-500" />
                <span>{t('common.limited_stock')}</span>
              </div>
              <div className="flex items-center gap-2">
                <IcStar className="w-6 h-6 text-yellow-400" />
                <span>{t('common.premium_quality')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-[var(--color-primary-)] to-[var(--color-primary-)] text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-[var(--color-primary-)] hover:text-[var(--color-primary-)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map(product => (
            <div 
              key={product.id}
              className="group relative bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:shadow-2xl hover:border-[var(--color-primary-)] transition-all duration-500"
              onMouseEnter={() => setHoveredProduct(product.id)}
              onMouseLeave={() => setHoveredProduct(null)}
            >
              {/* Badge */}
              <div className="absolute top-4 left-4 z-10 px-4 py-2 bg-gradient-to-r from-[var(--color-primary-)] to-[var(--color-primary-)] text-white rounded-lg font-bold shadow-lg">
                {product.badge}
              </div>

              {/* Wishlist */}
              <button className="absolute top-4 right-4 z-10 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all duration-300 group/wish">
                <IcHeart className="w-5 h-5 text-gray-400 group-hover/wish:text-white group-hover/wish:scale-125 transition-all" />
              </button>

              {/* Image */}
              <div className="relative overflow-hidden bg-gray-100">
                <img 
                  src={product.image}
                  alt={product.name}
                  className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-700"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x300?text=New+Product';
                  }}
                />
                {/* Hover Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6 transition-opacity duration-300 ${
                  hoveredProduct === product.id ? 'opacity-100' : 'opacity-0'
                }`}>
                  <div className="text-white">
                    <p className="font-semibold mb-2">{t('common.key_features')}</p>
                    {product.specs.map((spec, i) => (
                      <span key={i} className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm mr-2 mb-2">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="text-sm text-[var(--color-primary-)] font-semibold mb-2">
                  {product.category}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-[var(--color-primary-)] transition-colors">
                  {product.name}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex text-yellow-400 gap-1">
                    {[...Array(5)].map((_, i) => (
                      <IcStar key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="text-gray-600 font-medium">{product.rating}</span>
                  <span className="text-gray-400 text-sm">({product.reviews} reviews)</span>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-bold bg-gradient-to-r from-[var(--color-primary-)] to-[var(--color-primary-)] bg-clip-text text-transparent">
                    ${product.price}
                  </span>
                  <span className="text-sm text-green-600 font-semibold bg-green-50 px-3 py-1 rounded-full">
                    In Stock
                  </span>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button className="flex-1 py-3 bg-gradient-to-r from-[var(--color-primary-)] to-[var(--color-primary-)] text-white rounded-xl font-bold hover:scale-105 transition-transform duration-300 shadow-lg">{t('common.add_to_cart')}</button>
                  <button className="px-6 py-3 border-2 border-[var(--color-primary-)] text-[var(--color-primary-)] rounded-xl font-bold hover:bg-[var(--color-primary-)] transition-colors">{t('common.details')}</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-900 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">{t('common.stay_updated')}</h2>
          <p className="text-xl text-[var(--color-primary-)] mb-8">
            Get notified when new products arrive
          </p>
          <button className="px-12 py-4 bg-gradient-to-r from-[var(--color-primary-)] to-[var(--color-primary-)] rounded-xl font-bold text-lg hover:scale-105 transition-transform shadow-lg">{t('common.notify_me')}</button>
        </div>
      </div>
    </div>
  );
};
// SVG Icons
const IcShippingFast = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
  </svg>
);

const IcFire = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 7.104 9.5a1 1 0 001.5.836c.214-.144.396-.326.544-.536A4.982 4.982 0 0115 11c0 1.5-.7 2.87-1.87 3.73a1 1 0 00-.31.87c.1.58.55 1 1.13 1h.06c.58 0 1.05-.42 1.15-1 .09-.54-.04-1.07-.34-1.5.76-.85 1.18-1.95 1.18-3.1 0-2.2-1.32-4.1-3.2-5.02-1-.48-2.13-.74-3.3-.74A9 9 0 004 13c0 4.97 4.03 9 9 9 2.12 0 4.07-.74 5.66-2.34l-.01-.01z" />
  </svg>
);

const IcStar = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const IcHeart = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

export default NewArrivals;
