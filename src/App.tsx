import React, { useState, type FormEvent } from 'react';
import { 
  ShoppingBag, Search, X, Star, Plus, Minus, Trash2, Eye, 
  Sparkles, Check, ArrowRight, ShieldCheck, Truck,
  Heart, SlidersHorizontal, CreditCard, Tag, Globe, CheckCircle2,
  User, Lock, Mail, LayoutGrid, List, Headphones, Send, Flame
} from 'lucide-react';

// --- TYPES & INTERFACES ---
export type Category = 'All' | 'Audio' | 'Wearables' | 'Accessories';
export type Currency = 'USD' | 'EUR' | 'GBP';
export type SortOption = 'featured' | 'price-low' | 'price-high' | 'rating';
export type ViewMode = 'grid' | 'list';
export type AuthMode = 'signin' | 'signup';

export interface Product {
  id: number;
  name: string;
  category: Category;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  tag?: string;
  colors: string[];
  stock: number;
  image: string;
  description: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface UserProfile {
  name: string;
  email: string;
}

// --- SAMPLE DATA ---
const PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Minimalist Wireless Headphones',
    category: 'Audio',
    price: 129.99,
    originalPrice: 159.99,
    rating: 4.8,
    reviews: 124,
    tag: 'Bestseller',
    colors: ['#000000', '#2563EB', '#E2E8F0'],
    stock: 5,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    description: 'High-fidelity wireless audio featuring active noise cancellation, custom-tuned drivers, and 30-hour battery life.',
  },
  {
    id: 2,
    name: 'Smart Mechanical Watch',
    category: 'Wearables',
    price: 199.50,
    originalPrice: 249.99,
    rating: 4.9,
    reviews: 89,
    tag: 'New',
    colors: ['#1E293B', '#0284C7'],
    stock: 12,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
    description: 'A seamless blend of classic mechanical craft and modern biometric fitness tracking tech encased in Grade 5 titanium.',
  },
  {
    id: 3,
    name: 'Ergonomic Desk Speaker Set',
    category: 'Audio',
    price: 89.00,
    originalPrice: 109.00,
    rating: 4.6,
    reviews: 56,
    tag: 'Sale',
    colors: ['#000000', '#64748B'],
    stock: 3,
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80',
    description: 'Compact desktop monitor speakers delivering ultra-crisp studio highs and rich bass for your workspace.',
  },
  {
    id: 4,
    name: 'Ultra-Thin Mechanical Keyboard',
    category: 'Accessories',
    price: 149.99,
    originalPrice: 179.99,
    rating: 4.7,
    reviews: 210,
    tag: 'Featured',
    colors: ['#0F172A', '#38BDF8'],
    stock: 8,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80',
    description: 'Low-profile tactile mechanical switches with customizable per-key RGB backlighting and multi-device bluetooth switching.',
  }
];

export default function App(): React.JSX.Element {
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [currency, setCurrency] = useState<Currency>('USD');

  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [couponCode, setCouponCode] = useState<string>('');
  const [discount, setDiscount] = useState<number>(0);

  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState<string>('');

  const currencySymbols: Record<Currency, string> = { USD: '$', EUR: '€', GBP: '£' };

  const showToast = (msg: string): void => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const filteredProducts = PRODUCTS.filter((product) => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return a.id - b.id;
  });

  const addToCart = (product: Product): void => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    showToast(`Added "${product.name}" to cart`);
  };

  const toggleWishlist = (id: number): void => {
    setWishlist((prev) => {
      const exists = prev.includes(id);
      showToast(exists ? 'Removed from Wishlist' : 'Saved to Wishlist');
      return exists ? prev.filter((item) => item !== id) : [...prev, id];
    });
  };

  const updateQuantity = (id: number, delta: number): void => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const removeFromCart = (id: number): void => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    showToast('Item removed from cart');
  };

  const applyCoupon = (): void => {
    if (couponCode.toUpperCase() === 'TECH15') {
      setDiscount(0.15);
      showToast('🎉 15% Discount Applied!');
    } else {
      showToast('Invalid Coupon (Try TECH15)');
    }
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartRawSubtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartSubtotal = cartRawSubtotal * (1 - discount);
  const freeShippingThreshold = 250;
  const shippingProgress = Math.min((cartSubtotal / freeShippingThreshold) * 100, 100);

  return (
    <div className="min-h-screen bg-[#070D18] text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white relative">
      
      {/* --- TOAST NOTIFICATION --- */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 border border-blue-500/40 text-white px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-emerald-500/20 text-emerald-400 p-1.5 rounded-xl">
            <Check className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* --- ANNOUNCEMENT BAR --- */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 border-b border-slate-800 text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="hidden sm:flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1.5"><Headphones className="w-3.5 h-3.5 text-sky-400" /> 24/7 Global Support</span>
            <span className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5 text-sky-400" /> Free Global Express Shipping Over $250</span>
          </div>
          <div className="flex items-center justify-center sm:justify-end gap-3 w-full sm:w-auto text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Use code <strong className="text-sky-300 font-bold">TECH15</strong> for 15% OFF</span>
          </div>
        </div>
      </div>

      {/* --- HEADER --- */}
      <header className="sticky top-0 z-30 bg-[#070D18]/85 backdrop-blur-2xl border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-blue-600 via-sky-500 to-cyan-400 text-white p-2.5 rounded-2xl shadow-lg shadow-blue-500/20">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="font-black text-2xl tracking-wider bg-gradient-to-r from-white via-slate-200 to-sky-300 bg-clip-text text-transparent">
              TECH.LK
            </span>
          </div>

          <div className="relative flex-1 max-w-md hidden md:block">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search premium tech, categories, accessories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition duration-200"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
              <Globe className="w-3.5 h-3.5 text-sky-400" />
              <select 
                value={currency} 
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="USD" className="bg-slate-900">USD ($)</option>
                <option value="EUR" className="bg-slate-900">EUR (€)</option>
                <option value="GBP" className="bg-slate-900">GBP (£)</option>
              </select>
            </div>

            <button 
              onClick={() => showToast(`Wishlist contains ${wishlist.length} saved items`)}
              className="relative bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-slate-300 hover:text-white transition cursor-pointer"
              title="Wishlist"
            >
              <Heart className="w-4 h-4" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-sky-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 active:scale-95 text-white px-4 py-2 rounded-2xl transition duration-200 font-semibold text-sm shadow-xl shadow-blue-600/25 border border-blue-400/20"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="bg-white text-blue-800 text-xs font-black rounded-full h-5 min-w-5 px-1.5 flex items-center justify-center shadow-md">
                  {cartCount}
                </span>
              )}
            </button>

            {user ? (
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-2xl">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                  {user.name.charAt(0)}
                </div>
                <span className="text-xs font-semibold text-slate-200 hidden xl:inline">{user.name}</span>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 px-3.5 py-2 rounded-2xl text-xs font-semibold transition"
              >
                <User className="w-4 h-4 text-sky-400" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-950/40 via-[#070D18] to-[#070D18] border-b border-slate-800/80 pt-12 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2.5 bg-slate-900/90 border border-slate-800 text-slate-200 text-xs px-3.5 py-1.5 rounded-full shadow-inner">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-400"></span>
              </span>
              <span className="font-semibold text-sky-300">Summer Tech Drop 2026:</span>
              <span className="text-slate-400 hidden sm:inline">Active Noise Cancelling Series</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.1]">
              Acoustic Precision. <br />
              <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-cyan-400 bg-clip-text text-transparent">
                Unmatched Clarity.
              </span>
            </h1>

            <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Engineered with 40mm titanium drivers, custom ANC algorithms, and 30-hour playback. Experience lossless high-res audio designed for absolute immersion.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={() => addToCart(PRODUCTS[0])}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-600 hover:opacity-95 text-white px-8 py-4 rounded-2xl font-bold text-sm transition-all duration-200 shadow-xl shadow-blue-600/30 flex items-center justify-center gap-3 group"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Shop Lumina-X — $129.99</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </button>

              <button
                onClick={() => setSelectedProduct(PRODUCTS[0])}
                className="w-full sm:w-auto bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-200 px-6 py-4 rounded-2xl font-semibold text-sm transition flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4 text-sky-400" />
                <span>Quick View Specs</span>
              </button>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 border-t border-slate-800/80 text-xs">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2.5 overflow-hidden">
                  <img className="inline-block h-8 w-8 rounded-full ring-2 ring-slate-900 object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Customer" />
                  <img className="inline-block h-8 w-8 rounded-full ring-2 ring-slate-900 object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" alt="Customer" />
                  <img className="inline-block h-8 w-8 rounded-full ring-2 ring-slate-900 object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" alt="Customer" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span className="font-bold text-white text-xs">4.9 / 5.0</span>
                  </div>
                  <span className="text-slate-500">Over 12,000+ happy listeners</span>
                </div>
              </div>

              <div className="h-4 w-px bg-slate-800 hidden sm:block" />

              <div className="flex items-center gap-2 text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>2-Year Warranty & Free Returns</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl group overflow-hidden">
              <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-blue-600 to-sky-500 text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-xl shadow-lg flex items-center gap-1">
                <Flame className="w-3.5 h-3.5" /> Save $30 Today
              </div>

              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-950">
                <img
                  src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80"
                  alt="Lumina-X Headphones"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500 ease-out"
                />
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">Flagship Audio</span>
                  <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    In Stock (Express Delivery)
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">Minimalist Wireless Headphones</h3>
                    <p className="text-xs text-slate-400">Matte Sapphire — Noise-Cancelling</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-white">$129.99</span>
                    <span className="text-xs text-slate-500 line-through block">$159.99</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => addToCart(PRODUCTS[0])}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 shadow-md shadow-blue-600/20"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" /> Direct Purchase
                  </button>
                  <button
                    onClick={() => toggleWishlist(1)}
                    className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
                  >
                    <Heart className={`w-4 h-4 ${wishlist.includes(1) ? 'fill-sky-400 text-sky-400' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- STORE CATALOG --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-10 border-b border-slate-800/80 pb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {(['All', 'Audio', 'Wearables', 'Accessories'] as Category[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition duration-200 ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-blue-600 to-sky-600 text-white shadow-lg shadow-blue-600/30 border border-blue-400/30'
                    : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
              >
                <option value="featured" className="bg-slate-900">Featured</option>
                <option value="price-low" className="bg-slate-900">Price: Low to High</option>
                <option value="price-high" className="bg-slate-900">Price: High to Low</option>
                <option value="rating" className="bg-slate-900">Highest Rated</option>
              </select>
            </div>

            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7" : "space-y-4"}>
          {filteredProducts.map((product) => {
            const isWishlisted = wishlist.includes(product.id);
            return (
              <div
                key={product.id}
                className="group bg-slate-900/50 border border-slate-800/90 rounded-3xl overflow-hidden hover:border-blue-500/40 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1.5 transition duration-300 flex flex-col relative"
              >
                <div className="relative aspect-square overflow-hidden bg-slate-950">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-108 transition duration-700 ease-out"
                  />
                  
                  {product.tag && (
                    <span className="absolute top-3 left-3 bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-blue-400/30 shadow-md">
                      {product.tag}
                    </span>
                  )}

                  <div className="absolute top-3 right-3 flex flex-col gap-2">
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className={`p-2.5 rounded-xl transition backdrop-blur-md shadow-md ${
                        isWishlisted 
                          ? 'bg-sky-500 text-white' 
                          : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white' : ''}`} />
                    </button>
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="p-2.5 bg-slate-900/80 text-slate-300 rounded-xl hover:bg-blue-600 hover:text-white transition backdrop-blur-md shadow-md"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold tracking-wider text-sky-400 uppercase">
                        {product.category}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        {product.stock} left
                      </span>
                    </div>

                    <h3 className="font-semibold text-slate-100 group-hover:text-sky-300 transition line-clamp-1 text-base">
                      {product.name}
                    </h3>

                    <div className="flex items-center gap-1.5 pt-1">
                      {product.colors.map((c, i) => (
                        <span 
                          key={i} 
                          className="w-3 h-3 rounded-full border border-white/20" 
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5 text-amber-400 text-sm pt-1">
                      <Star className="w-4 h-4 fill-amber-400" />
                      <span className="font-bold text-slate-200">{product.rating}</span>
                      <span className="text-slate-500 text-xs">({product.reviews})</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-black text-white">
                        {currencySymbols[currency]}{(product.price).toFixed(2)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs text-slate-500 line-through">
                          {currencySymbols[currency]}{product.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => addToCart(product)}
                      className="px-4 py-2 bg-blue-600/15 hover:bg-blue-600 text-sky-300 hover:text-white border border-blue-500/30 rounded-xl text-xs font-bold transition duration-200"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* --- QUICK VIEW MODAL --- */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 relative shadow-2xl overflow-hidden grid grid-cols-1 sm:grid-cols-2 gap-6">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 z-10 text-slate-400 hover:text-white p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="aspect-square w-full rounded-2xl overflow-hidden bg-slate-950">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-col justify-between">
              <div>
                <span className="text-xs text-sky-400 font-bold uppercase tracking-wider">
                  {selectedProduct.category}
                </span>
                <h2 className="text-2xl font-bold text-white mt-1 leading-tight">{selectedProduct.name}</h2>
                <div className="flex items-center gap-1.5 text-amber-400 text-sm mt-2">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span className="font-bold text-slate-200">{selectedProduct.rating}</span>
                  <span className="text-slate-500 text-xs">({selectedProduct.reviews} customer reviews)</span>
                </div>
                <p className="text-slate-400 text-sm mt-4 leading-relaxed">{selectedProduct.description}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 block">Total Price</span>
                  <span className="text-2xl font-black text-white">{currencySymbols[currency]}{selectedProduct.price.toFixed(2)}</span>
                </div>
                <button
                  onClick={() => {
                    addToCart(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  className="bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-600 hover:opacity-90 text-white px-6 py-3 rounded-2xl font-bold text-sm transition shadow-lg shadow-blue-600/30"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- AUTH MODAL --- */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 relative shadow-2xl space-y-6">
            <button
              onClick={() => setIsAuthOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full bg-slate-800 hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black text-white">
                {authMode === 'signin' ? 'Welcome Back' : 'Create Account'}
              </h3>
              <p className="text-xs text-slate-400">
                {authMode === 'signin' ? 'Enter your credentials to access your account' : 'Join Tech.lk for exclusive offers and order tracking'}
              </p>
            </div>

            <form 
              onSubmit={(e: FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                setUser({ name: authMode === 'signin' ? 'Alex Rivera' : 'New Member', email: 'user@lumen.com' });
                setIsAuthOpen(false);
                showToast(authMode === 'signin' ? 'Signed in successfully!' : 'Account created successfully!');
              }}
              className="space-y-4"
            >
              {authMode === 'signup' && (
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input required type="text" placeholder="Alex Rivera" className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input required type="email" placeholder="alex@company.com" className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input required type="password" placeholder="••••••••" className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-600 hover:opacity-90 text-white font-bold py-3.5 rounded-2xl transition shadow-lg shadow-blue-600/25"
              >
                {authMode === 'signin' ? 'Sign In' : 'Register Account'}
              </button>
            </form>

            <div className="text-center pt-2 text-xs text-slate-400">
              {authMode === 'signin' ? (
                <span>Don't have an account? <button onClick={() => setAuthMode('signup')} className="text-sky-400 font-bold hover:underline">Sign Up</button></span>
              ) : (
                <span>Already have an account? <button onClick={() => setAuthMode('signin')} className="text-sky-400 font-bold hover:underline">Sign In</button></span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- CART DRAWER --- */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsCartOpen(false)}
          />

          <div className="relative w-full max-w-md bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-800 z-10 animate-in slide-in-from-right duration-300">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-sky-400" />
                Shopping Cart ({cartCount})
              </h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-950/60 border-b border-slate-800 text-xs space-y-2">
              <div className="flex justify-between font-medium">
                <span>Free Express Shipping</span>
                <span className="text-sky-400">
                  {shippingProgress >= 100 ? 'Unlocked!' : `${currencySymbols[currency]}${(freeShippingThreshold - cartSubtotal).toFixed(2)} away`}
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full transition-all duration-300" 
                  style={{ width: `${shippingProgress}%` }}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-20 text-slate-500 space-y-3">
                  <ShoppingBag className="w-12 h-12 mx-auto stroke-1 opacity-40" />
                  <p className="text-sm font-medium">Your cart is empty.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-xl bg-slate-900"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-slate-100 truncate">
                        {item.name}
                      </h4>
                      <p className="text-xs text-sky-400 font-bold mt-0.5">
                        {currencySymbols[currency]}{(item.price).toFixed(2)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold px-2">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-slate-500 hover:text-rose-400 p-2 rounded-lg hover:bg-slate-800 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t border-slate-800 bg-slate-950/80 space-y-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Promo Code (TECH15)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 uppercase focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <button
                    onClick={applyCoupon}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2 rounded-xl transition"
                  >
                    Apply
                  </button>
                </div>

                <div className="flex items-center justify-between text-base font-bold text-white">
                  <span>Subtotal</span>
                  <span className="text-sky-400 text-xl font-black">
                    {currencySymbols[currency]}{cartSubtotal.toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 via-sky-600 to-cyan-600 hover:opacity-90 text-white font-bold py-3.5 rounded-2xl transition shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2"
                >
                  <span>Checkout Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- CHECKOUT MODAL --- */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 relative shadow-2xl space-y-6">
            <button
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full bg-slate-800 hover:bg-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="bg-blue-600/20 text-sky-400 p-2.5 rounded-2xl">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Express Checkout</h3>
                <p className="text-xs text-slate-400">Encrypted 256-Bit SSL Payment</p>
              </div>
            </div>

            <form 
              onSubmit={(e: FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                setIsCheckoutOpen(false);
                setCart([]);
                showToast('🎉 Order Placed Successfully!');
              }} 
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Email</label>
                <input required type="email" placeholder="customer@tech.lk" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Card Number</label>
                <input required type="text" placeholder="4242 •••• •••• 4242" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Expiry Date</label>
                  <input required type="text" placeholder="MM/YY" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">CVC</label>
                  <input required type="text" placeholder="123" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 rounded-2xl transition shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Pay {currencySymbols[currency]}{cartSubtotal.toFixed(2)}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- FOOTER --- */}
      <footer className="bg-slate-950 border-t border-slate-800/80 pt-16 pb-12 mt-20 text-slate-400 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="bg-gradient-to-r from-blue-950/40 via-slate-900 to-blue-950/40 border border-slate-800 p-8 rounded-3xl flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center lg:text-left">
              <h3 className="text-xl font-bold text-white">Join the Tech.lk Global Club</h3>
              <p className="text-xs text-slate-400">Subscribe for early access to releases, sales, and weekly minimalist tech picks.</p>
            </div>
            <form 
              onSubmit={(e: FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                showToast('Thank you for subscribing!');
                setNewsletterEmail('');
              }}
              className="flex w-full sm:w-auto gap-2"
            >
              <input 
                type="email" 
                required
                placeholder="Enter your email" 
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 min-w-[240px]"
              />
              <button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-1.5"
              >
                <span>Subscribe</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-xs">
            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase tracking-wider">Shop Catalog</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-sky-400 transition">Audio & Headphones</a></li>
                <li><a href="#" className="hover:text-sky-400 transition">Wearable Tech</a></li>
                <li><a href="#" className="hover:text-sky-400 transition">Minimalist Keyboards</a></li>
                <li><a href="#" className="hover:text-sky-400 transition">Desk Setup Accessories</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase tracking-wider">Customer Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-sky-400 transition">Help Center & FAQ</a></li>
                <li><a href="#" className="hover:text-sky-400 transition">Track Your Shipment</a></li>
                <li><a href="#" className="hover:text-sky-400 transition">Returns & Exchange Policy</a></li>
                <li><a href="#" className="hover:text-sky-400 transition">Warranty Registration</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase tracking-wider">About Tech.lk</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-sky-400 transition">Our Craft & Design Story</a></li>
                <li><a href="#" className="hover:text-sky-400 transition">Global Stores & Distributors</a></li>
                <li><a href="#" className="hover:text-sky-400 transition">Sustainability Initiatives</a></li>
                <li><a href="#" className="hover:text-sky-400 transition">Careers & Press</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase tracking-wider">Legal & Trust</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-sky-400 transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-sky-400 transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-sky-400 transition">Cookies Settings</a></li>
                <li><a href="#" className="hover:text-sky-400 transition">Security Certifications</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© 2026 Tech.lk Technologies Inc. All international rights reserved.</p>

            <div className="flex items-center gap-3">
              <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded text-[10px] font-bold text-slate-300">VISA</span>
              <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded text-[10px] font-bold text-slate-300">MASTERCARD</span>
              <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded text-[10px] font-bold text-slate-300">APPLE PAY</span>
              <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded text-[10px] font-bold text-slate-300">PAYPAL</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}