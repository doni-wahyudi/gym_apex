import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  Banknote, 
  QrCode, 
  User, 
  Receipt, 
  DollarSign, 
  CheckCircle, 
  Package, 
  History, 
  X, 
  AlertCircle 
} from 'lucide-react';
import { gymStore } from '../../services/gymStore';
import type { Product, Member, Sale, SaleItem, PaymentMethod } from '../../types/gym';
import { ReceiptModal } from './ReceiptModal';
import { CashShiftModal } from './CashShiftModal';
import { useLanguage } from '../../services/i18n';

interface PosRegisterProps {
  initialMember?: Member | null;
}

export const PosRegister: React.FC<PosRegisterProps> = ({ initialMember }) => {
  const [products, setProducts] = useState(gymStore.getProducts());
  const [members, setMembers] = useState(gymStore.getMembers());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Cart State
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(initialMember || null);
  const [customerName, setCustomerName] = useState(initialMember ? initialMember.fullName : 'Walk-in Guest');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [mobileTab, setMobileTab] = useState<'catalog' | 'cart'>('catalog');
  const { language, t } = useLanguage();

  // Modals
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);

  // Payment State
  const [activePaymentMethod, setActivePaymentMethod] = useState<PaymentMethod>('card');
  const [cashTendered, setCashTendered] = useState<string>('');

  useEffect(() => {
    const unsub = gymStore.subscribe(() => {
      setProducts(gymStore.getProducts());
      setMembers(gymStore.getMembers());
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (initialMember) {
      setSelectedMember(initialMember);
      setCustomerName(initialMember.fullName);
    }
  }, [initialMember]);

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Cart actions
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as { product: Product; quantity: number }[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedMember(null);
    setCustomerName('Walk-in Guest');
    setDiscountPercent(0);
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountAmount = +(subtotal * (discountPercent / 100)).toFixed(2);
  const taxableSubtotal = cart.reduce(
    (sum, item) => (item.product.isTaxable ? sum + item.product.price * item.quantity : sum),
    0
  );
  const tax = +(taxableSubtotal * 0.08).toFixed(2);
  const total = +(subtotal - discountAmount + tax).toFixed(2);

  // Cash change
  const cashNum = parseFloat(cashTendered) || 0;
  const changeDue = Math.max(0, +(cashNum - total).toFixed(2));

  const handleOpenPayment = () => {
    if (cart.length === 0) return;
    setCashTendered(total.toString());
    setShowPaymentModal(true);
  };

  const handleCompleteSale = () => {
    const saleItems: SaleItem[] = cart.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      category: item.product.category,
      unitPrice: item.product.price,
      quantity: item.quantity,
      total: +(item.product.price * item.quantity).toFixed(2),
    }));

    const sale = gymStore.processSale({
      customerName: selectedMember ? selectedMember.fullName : customerName,
      memberId: selectedMember ? selectedMember.id : undefined,
      items: saleItems,
      subtotal,
      tax,
      discount: discountAmount,
      total,
      paymentMethod: activePaymentMethod,
      cashReceived: activePaymentMethod === 'cash' ? cashNum : undefined,
      changeGiven: activePaymentMethod === 'cash' ? changeDue : undefined,
      cashierName: 'Front Desk Admin',
    });

    setShowPaymentModal(false);
    clearCart();
    setCompletedSale(sale);
  };

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: language === 'id' ? 'Semua Produk' : 'All Catalog' },
    { id: 'membership', label: language === 'id' ? 'Paket Member' : 'Memberships' },
    { id: 'supplement', label: language === 'id' ? 'Suplemen' : 'Supplements' },
    { id: 'beverage', label: language === 'id' ? 'Minuman & Energi' : 'Drinks & Energy' },
    { id: 'snack', label: language === 'id' ? 'Camilan Sehat' : 'Bars & Snacks' },
    { id: 'merchandise', label: language === 'id' ? 'Pakaian & Alat' : 'Gear & Apparel' },
    { id: 'pt_package', label: language === 'id' ? 'Paket PT' : 'PT Packages' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* POS Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
            <span className="badge badge-cyan">
              <ShoppingCart size={13} />
              {language === 'id' ? 'Kasir Kas & POS' : 'Point of Sale'}
            </span>
            <span className="badge badge-emerald">{language === 'id' ? 'Kasir Aktif' : 'Register Active'}</span>
          </div>
          <h1>{t('pos.title')}</h1>
          <p>{t('pos.subtitle')}</p>
        </div>

        {/* Action Buttons: Cash Shift & History */}
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button type="button" className="btn btn-secondary" onClick={() => setShowShiftModal(true)}>
            <DollarSign size={16} color="var(--color-emerald)" />
            {t('pos.cash_drawer')}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => setShowHistoryModal(true)}>
            <History size={16} />
            {t('pos.invoices')}
          </button>
        </div>
      </div>

      {/* Mobile-Only Segment Control */}
      <div className="mobile-only-tab" style={{ marginBottom: 'var(--space-3)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-2)', background: 'var(--bg-card)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
          <button
            type="button"
            className={`btn btn-sm ${mobileTab === 'catalog' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ flex: 1 }}
            onClick={() => setMobileTab('catalog')}
          >
            Catalog ({filteredProducts.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${mobileTab === 'cart' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ flex: 1 }}
            onClick={() => setMobileTab('cart')}
          >
            Ticket ({cart.reduce((s, i) => s + i.quantity, 0)}) • ${total.toFixed(2)}
          </button>
        </div>
      </div>

      {/* Main Split: Catalog on Left (65%), Cart Drawer on Right (35%) */}
      <div className="pos-layout-container" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: 'var(--space-6)', alignItems: 'start' }}>
        {/* Left: Products Catalog */}
        <div 
          className={`pos-catalog-panel ${mobileTab === 'cart' ? 'pos-hide-mobile' : ''}`} 
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
        >
          {/* Search & Category Tabs */}
          <div className="surface-card" style={{ padding: 'var(--space-4)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                <input 
                  type="text"
                  className="form-input"
                  placeholder={t('pos.search_placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '38px' }}
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div style={{ display: 'flex', gap: 'var(--space-2)', overflowX: 'auto', paddingBottom: '4px' }}>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`btn btn-sm ${selectedCategory === cat.id ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid */}
          <div 
            className="pos-products-grid"
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
              gap: 'var(--space-4)',
              maxHeight: 'calc(100vh - 280px)',
              overflowY: 'auto',
              paddingRight: 'var(--space-1)'
            }}
          >
            {filteredProducts.map((product) => {
              const inCart = cart.find((i) => i.product.id === product.id);
              return (
                <div
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="surface-card"
                  style={{ 
                    cursor: 'pointer', 
                    display: 'flex', 
                    flexDirection: 'column',
                    padding: 'var(--space-3)',
                    transition: 'all 0.18s ease',
                    border: inCart ? '1px solid var(--color-cyan)' : '1px solid var(--border-subtle)',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.borderColor = 'var(--color-cyan)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = inCart ? 'var(--color-cyan)' : 'var(--border-subtle)';
                  }}
                >
                  {inCart && (
                    <span 
                      style={{ 
                        position: 'absolute', 
                        top: '10px', 
                        right: '10px', 
                        background: 'var(--color-cyan)', 
                        color: '#000', 
                        fontSize: '0.75rem', 
                        fontWeight: 800, 
                        width: '22px', 
                        height: '22px', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        zIndex: 2 
                      }}
                    >
                      {inCart.quantity}
                    </span>
                  )}

                  {product.imageUrl && (
                    <div style={{ width: '100%', height: '120px', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: 'var(--space-2)', background: 'var(--bg-base)' }}>
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                    <div>
                      <span className="badge badge-cyan" style={{ fontSize: '0.65rem', marginBottom: '4px' }}>
                        {product.category}
                      </span>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: 1.3, marginBottom: '6px' }}>
                        {product.name}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid var(--border-subtle)', paddingTop: '6px' }}>
                      <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                        ${product.price.toFixed(2)}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: product.stock < 10 ? 'var(--color-rose)' : 'var(--text-muted)' }}>
                        {product.stock > 100 ? 'In Stock' : `${product.stock} left`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Cart Panel */}
        <div 
          className={`pos-cart-container surface-card ${mobileTab === 'catalog' ? 'pos-hide-mobile' : ''}`}
          style={{ 
            padding: 'var(--space-5)', 
            display: 'flex', 
            flexDirection: 'column', 
            height: 'calc(100vh - 180px)',
            position: 'sticky',
            top: '80px',
            marginBottom: 'calc(var(--mobile-nav-height) + var(--space-6))'
          }}
        >
          {/* Cart Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <ShoppingCart size={20} color="var(--color-cyan)" />
              <h3>{t('pos.ticket_title')}</h3>
              <span className="badge badge-cyan">{cart.reduce((s, i) => s + i.quantity, 0)}</span>
            </div>
            {cart.length > 0 && (
              <button type="button" onClick={clearCart} className="btn-ghost" style={{ color: 'var(--color-rose)', fontSize: '0.8rem' }}>
                {t('pos.clear')}
              </button>
            )}
          </div>

          {/* Customer / Member Selector */}
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label className="form-label" style={{ marginBottom: '4px' }}>Customer / Member:</label>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <select 
                className="form-input"
                style={{ fontSize: '0.85rem' }}
                value={selectedMember ? selectedMember.id : 'guest'}
                onChange={(e) => {
                  if (e.target.value === 'guest') {
                    setSelectedMember(null);
                    setCustomerName('Walk-in Guest');
                  } else {
                    const m = members.find((x) => x.id === e.target.value);
                    if (m) {
                      setSelectedMember(m);
                      setCustomerName(m.fullName);
                    }
                  }
                }}
              >
                <option value="guest">Walk-in Guest</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName} ({m.memberCode} - {m.tierName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cart Items List */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', paddingRight: '4px' }}>
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-8) var(--space-4)', color: 'var(--text-muted)' }}>
                <Package size={40} style={{ margin: '0 auto var(--space-3)', opacity: 0.3 }} />
                <p>Ticket is empty.</p>
                <p style={{ fontSize: '0.8rem' }}>Tap any item on the left to add to cart.</p>
              </div>
            ) : (
              cart.map(({ product, quantity }) => (
                <div 
                  key={product.id}
                  className="surface-elevated"
                  style={{ 
                    padding: 'var(--space-3)', 
                    borderRadius: 'var(--radius-md)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    gap: 'var(--space-2)'
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {product.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-cyan)', fontWeight: 600 }}>
                      ${product.price.toFixed(2)}
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button 
                      type="button" 
                      onClick={() => updateQuantity(product.id, -1)}
                      className="btn-secondary" 
                      style={{ width: '26px', height: '26px', padding: 0, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Minus size={12} />
                    </button>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, minWidth: '18px', textAlign: 'center' }}>
                      {quantity}
                    </span>
                    <button 
                      type="button" 
                      onClick={() => updateQuantity(product.id, 1)}
                      className="btn-secondary" 
                      style={{ width: '26px', height: '26px', padding: 0, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Plus size={12} />
                    </button>
                    <button 
                      type="button" 
                      onClick={() => removeFromCart(product.id)}
                      className="btn-ghost" 
                      style={{ color: 'var(--color-rose)', padding: '4px' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Totals & Discount Controls */}
          <div style={{ borderTop: '1px solid var(--border-medium)', paddingTop: 'var(--space-4)', marginTop: 'var(--space-3)' }}>
            {/* Quick Discount Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>DISCOUNT:</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[0, 5, 10, 20].map((pct) => (
                  <button 
                    key={pct}
                    type="button"
                    onClick={() => setDiscountPercent(pct)}
                    className={`btn btn-sm ${discountPercent === pct ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ minHeight: '26px', padding: '0 8px', fontSize: '0.75rem' }}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-emerald)' }}>
                  <span>Discount ({discountPercent}%):</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Tax (8%):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  fontSize: '1.35rem', 
                  fontWeight: 800, 
                  color: 'var(--text-primary)', 
                  borderTop: '1px solid var(--border-medium)', 
                  paddingTop: 'var(--space-2)',
                  marginTop: 'var(--space-2)',
                  fontFamily: 'var(--font-display)'
                }}
              >
                <span>Total Due:</span>
                <span style={{ color: 'var(--color-cyan)' }}>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout CTA */}
            <button 
              type="button" 
              className="btn btn-emerald btn-lg" 
              disabled={cart.length === 0}
              onClick={handleOpenPayment}
              style={{ width: '100%', marginTop: 'var(--space-4)' }}
            >
              <CreditCard size={18} />
              {t('pos.charge')} ${total.toFixed(2)}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Floating Cart Indicator */}
      {mobileTab === 'catalog' && cart.length > 0 && (
        <div 
          className="mobile-only-tab"
          style={{
            position: 'fixed',
            bottom: 'calc(var(--mobile-nav-height) + var(--safe-bottom) + 12px)',
            left: 'var(--space-4)',
            right: 'var(--space-4)',
            zIndex: 90
          }}
        >
          <button
            type="button"
            onClick={() => setMobileTab('cart')}
            className="btn btn-emerald btn-lg"
            style={{ width: '100%', boxShadow: '0 8px 24px rgba(0,0,0,0.65)', justifyContent: 'space-between' }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <ShoppingCart size={18} />
              <span>{cart.reduce((s, i) => s + i.quantity, 0)} {cart.reduce((s, i) => s + i.quantity, 0) === 1 ? 'item' : 'items'}</span>
            </span>
            <span style={{ fontWeight: 800 }}>View Ticket • ${total.toFixed(2)} →</span>
          </button>
        </div>
      )}

      {/* Payment Tender Modal */}
      {showPaymentModal && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()} 
            style={{ maxWidth: '500px', padding: 'var(--space-6)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h3>Select Payment Method</h3>
              <button type="button" onClick={() => setShowPaymentModal(false)} className="btn-ghost">
                <X size={18} />
              </button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: 'var(--space-5)', padding: 'var(--space-4)', background: 'var(--bg-base)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Amount Payable</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-cyan)', fontFamily: 'var(--font-display)' }}>
                ${total.toFixed(2)}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Customer: <strong>{customerName}</strong>
              </div>
            </div>

            {/* Method Tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-2)', marginBottom: 'var(--space-5)' }}>
              <button
                type="button"
                onClick={() => setActivePaymentMethod('card')}
                className={`btn ${activePaymentMethod === 'card' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flexDirection: 'column', height: '64px', gap: '4px' }}
              >
                <CreditCard size={18} />
                <span style={{ fontSize: '0.75rem' }}>{language === 'id' ? 'Kartu' : 'Card'}</span>
              </button>
              <button
                type="button"
                onClick={() => setActivePaymentMethod('cash')}
                className={`btn ${activePaymentMethod === 'cash' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flexDirection: 'column', height: '64px', gap: '4px' }}
              >
                <Banknote size={18} />
                <span style={{ fontSize: '0.75rem' }}>{language === 'id' ? 'Tunai' : 'Cash'}</span>
              </button>
              <button
                type="button"
                onClick={() => setActivePaymentMethod('qris')}
                className={`btn ${activePaymentMethod === 'qris' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flexDirection: 'column', height: '64px', gap: '4px' }}
              >
                <QrCode size={18} />
                <span style={{ fontSize: '0.75rem' }}>QRIS</span>
              </button>
              <button
                type="button"
                onClick={() => setActivePaymentMethod('member_wallet')}
                className={`btn ${activePaymentMethod === 'member_wallet' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flexDirection: 'column', height: '64px', gap: '4px' }}
              >
                <User size={18} />
                <span style={{ fontSize: '0.75rem' }}>{language === 'id' ? 'Akun Member' : 'Member Tab'}</span>
              </button>
            </div>

            {/* Specific Method UI */}
            {activePaymentMethod === 'cash' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                <label className="form-label">Cash Tendered ($):</label>
                <input 
                  type="number"
                  step="0.01"
                  className="form-input"
                  value={cashTendered}
                  onChange={(e) => setCashTendered(e.target.value)}
                  style={{ fontSize: '1.2rem', fontFamily: 'var(--font-mono)' }}
                  autoFocus
                />
                
                {/* Quick Cash Buttons */}
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  {[total, 20, 50, 100].map((amt, idx) => (
                    <button 
                      key={idx} 
                      type="button" 
                      className="btn btn-secondary btn-sm"
                      onClick={() => setCashTendered(amt.toFixed(2))}
                      style={{ flex: 1 }}
                    >
                      {idx === 0 ? 'Exact' : `$${amt}`}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-3)', background: 'var(--bg-base)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Change Due:</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-emerald)' }}>
                    ${changeDue.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {activePaymentMethod === 'card' && (
              <div style={{ textAlign: 'center', padding: 'var(--space-4)', background: 'var(--bg-base)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)' }}>
                <CreditCard size={36} color="var(--color-cyan)" style={{ margin: '0 auto var(--space-2)' }} />
                <div style={{ fontWeight: 600 }}>Tap or Insert Card on POS Terminal</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Terminal Ready • Visa / Mastercard / Amex</div>
              </div>
            )}

            {activePaymentMethod === 'qris' && (
              <div style={{ textAlign: 'center', padding: 'var(--space-4)', background: 'var(--bg-base)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)' }}>
                <div style={{ background: '#fff', padding: '12px', display: 'inline-block', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-2)' }}>
                  <QrCode size={120} color="#000" />
                </div>
                <div style={{ fontWeight: 600 }}>Scan QRIS with Banking / E-Wallet App</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Auto-confirmed upon payment callback</div>
              </div>
            )}

            {activePaymentMethod === 'member_wallet' && (
              <div style={{ padding: 'var(--space-4)', background: 'var(--bg-base)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)' }}>
                {selectedMember ? (
                  <div>
                    <div style={{ fontWeight: 600 }}>Charge to {selectedMember.fullName}'s Account</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Member ID: {selectedMember.memberCode} • Billing Cycle: Monthly on 1st
                    </div>
                  </div>
                ) : (
                  <div style={{ color: 'var(--color-amber)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <AlertCircle size={18} />
                    <span>Please select a registered member first to use Member Account Tab.</span>
                  </div>
                )}
              </div>
            )}

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowPaymentModal(false)} style={{ flex: 1 }}>
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-emerald" 
                onClick={handleCompleteSale} 
                disabled={activePaymentMethod === 'member_wallet' && !selectedMember}
                style={{ flex: 1 }}
              >
                <CheckCircle size={18} />
                Complete Transaction
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction History / Invoices Modal */}
      {showHistoryModal && (
        <div className="modal-overlay" onClick={() => setShowHistoryModal(false)}>
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()} 
            style={{ maxWidth: '680px', padding: 'var(--space-6)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h3>Recent Invoices & Transactions</h3>
              <button type="button" onClick={() => setShowHistoryModal(false)} className="btn-ghost">
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', maxHeight: '420px', overflowY: 'auto' }}>
              {gymStore.getSales().map((sale) => (
                <div 
                  key={sale.id}
                  className="surface-elevated"
                  style={{ 
                    padding: 'var(--space-4)', 
                    borderRadius: 'var(--radius-md)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between' 
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <strong style={{ color: 'var(--text-primary)' }}>{sale.invoiceNo}</strong>
                      <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>{sale.paymentMethod}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {sale.customerName} • {sale.items.length} items
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(sale.timestamp).toLocaleString()}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-cyan)', fontFamily: 'var(--font-mono)' }}>
                      ${sale.total.toFixed(2)}
                    </span>
                    <button 
                      type="button" 
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setCompletedSale(sale);
                        setShowHistoryModal(false);
                      }}
                    >
                      <Receipt size={14} />
                      Receipt
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Cash Shift Modal */}
      {showShiftModal && <CashShiftModal onClose={() => setShowShiftModal(false)} />}

      {/* Receipt Modal */}
      {completedSale && <ReceiptModal sale={completedSale} onClose={() => setCompletedSale(null)} />}
    </div>
  );
};
