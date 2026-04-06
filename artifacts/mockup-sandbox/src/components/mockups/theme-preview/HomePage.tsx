import { useState } from "react";

const red = "#E63946";
const dark = "#111111";
const gray = "#666666";
const lightGray = "#F8F8F8";
const border = "#E5E5E5";
const star = "#FFB800";

/* ── Mini helpers ── */
function Stars({ n = 5 }: { n?: number }) {
  return (
    <span className="flex gap-0.5" style={{ color: star }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 24 24" width="14" height="14" fill={i < n ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2" />
        </svg>
      ))}
    </span>
  );
}

function Badge({ children, color = red }: { children: React.ReactNode; color?: string }) {
  return (
    <span style={{ background: color, color: "#fff", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4, letterSpacing: "0.05em", textTransform: "uppercase" as const }}>
      {children}
    </span>
  );
}

/* ── Product card ── */
const products = [
  { id: 1, title: "Premium Leather Wallet", price: "$89", compare: "$129", img: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&q=80", sale: true },
  { id: 2, title: "Minimalist Watch", price: "$249", compare: "", img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80", sale: false },
  { id: 3, title: "Canvas Tote Bag", price: "$45", compare: "$65", img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80", sale: true },
  { id: 4, title: "Wool Beanie", price: "$38", compare: "", img: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=600&q=80", sale: false },
];

function ProductCard({ p }: { p: typeof products[0] }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ display: "flex", flexDirection: "column", gap: 12, cursor: "pointer" }}>
      <div style={{ position: "relative", borderRadius: 10, overflow: "hidden", aspectRatio: "1/1", background: lightGray }}>
        <img src={p.img} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s", transform: hovered ? "scale(1.05)" : "scale(1)" }} />
        {p.sale && (
          <div style={{ position: "absolute", top: 10, left: 10 }}>
            <Badge>Sale</Badge>
          </div>
        )}
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.05)", opacity: hovered ? 1 : 0, transition: "opacity 0.2s" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 12, transform: hovered ? "translateY(0)" : "translateY(100%)", transition: "transform 0.25s", background: "linear-gradient(transparent, rgba(0,0,0,0.08))", display: "flex", justifyContent: "center" }}>
          <button style={{ background: red, color: "#fff", border: "none", borderRadius: 6, padding: "8px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
            Add to Cart
          </button>
        </div>
      </div>
      <div>
        <div style={{ fontWeight: 600, fontSize: 15, color: dark, marginBottom: 5, lineHeight: 1.3 }}>{p.title}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: p.compare ? red : dark }}>{p.price}</span>
          {p.compare && <s style={{ fontSize: 13, color: gray }}>{p.compare}</s>}
        </div>
      </div>
    </div>
  );
}

/* ── FAQ Item ── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: `1px solid ${border}` }}>
      <button onClick={() => setOpen(!open)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, padding: "18px 0", fontWeight: 600, fontSize: 15, color: dark, background: "none", border: "none", textAlign: "left", cursor: "pointer", fontFamily: "inherit" }}>
        {q}
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, transition: "transform 0.25s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div style={{ paddingBottom: 18, fontSize: 14, lineHeight: 1.7, color: gray }}>{a}</div>
      )}
    </div>
  );
}

/* ── Main Page Preview ── */
export function HomePage() {
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"home" | "product" | "collection">("home");

  const navStyle: React.CSSProperties = {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: dark,
    background: "#fff",
    minHeight: "100vh",
  };

  return (
    <div style={navStyle}>
      {/* Announcement Bar */}
      <div style={{ background: dark, color: "#fff", textAlign: "center", padding: "10px 24px", fontSize: 13, fontWeight: 500 }}>
        🚀 Free Shipping on Orders Over $75 · Use Code <strong>FREESHIP</strong> at Checkout
      </div>

      {/* Header */}
      <header style={{ background: "#fff", borderBottom: `1px solid ${border}`, position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", height: 68, gap: 32 }}>
          {/* Logo */}
          <div style={{ fontWeight: 900, fontSize: 20, color: dark, letterSpacing: "-0.03em", flexShrink: 0 }}>
            <span style={{ color: red }}>Omni</span>web
          </div>

          {/* Nav */}
          <nav style={{ display: "flex", gap: 4, flex: 1 }}>
            {["Home", "Shop", "Collections", "About", "Contact"].map((item) => (
              <button key={item} onClick={() => item === "Shop" ? setActiveTab("collection") : item === "Home" ? setActiveTab("home") : null}
                style={{ padding: "8px 14px", fontSize: 14, fontWeight: 600, color: dark, background: "none", border: "none", cursor: "pointer", borderRadius: 6, fontFamily: "inherit", transition: "background 0.15s, color 0.15s" }}
                onMouseEnter={e => { (e.target as HTMLElement).style.background = lightGray; }}
                onMouseLeave={e => { (e.target as HTMLElement).style.background = "none"; }}>
                {item}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <button style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, color: dark, background: "none", border: "none", cursor: "pointer" }}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </button>
            <button style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, color: dark, background: "none", border: "none", cursor: "pointer" }}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </button>
            <button onClick={() => setCartOpen(true)} style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, color: dark, background: "none", border: "none", cursor: "pointer", position: "relative" }}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              <span style={{ position: "absolute", top: 4, right: 4, background: red, color: "#fff", fontSize: 10, fontWeight: 700, width: 16, height: 16, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>2</span>
            </button>
          </div>
        </div>

        {/* Tab navigation for preview pages */}
        <div style={{ borderTop: `1px solid ${border}`, display: "flex", justifyContent: "center", gap: 0, background: lightGray }}>
          {(["home", "product", "collection"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ padding: "8px 20px", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: activeTab === tab ? red : gray, background: activeTab === tab ? "#fff" : "none", border: "none", borderBottom: activeTab === tab ? `2px solid ${red}` : "2px solid transparent", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
              {tab === "home" ? "Homepage" : tab === "product" ? "Product Page" : "Collection"}
            </button>
          ))}
        </div>
      </header>

      {/* ======= HOME PAGE ======= */}
      {activeTab === "home" && (
        <>
          {/* Hero */}
          <section style={{ position: "relative", minHeight: 600, display: "flex", alignItems: "center", overflow: "hidden" }}>
            <img src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600&q=85" alt="Hero" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }} />
            <div style={{ position: "relative", zIndex: 2, maxWidth: 1280, margin: "0 auto", padding: "80px 24px", width: "100%" }}>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.8)", marginBottom: 16 }}>
                New Collection — Spring 2025
              </p>
              <h1 style={{ fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 900, color: "#fff", lineHeight: 1.1, marginBottom: 20, letterSpacing: "-0.02em", maxWidth: 600 }}>
                Elevate Your Everyday
              </h1>
              <p style={{ fontSize: 18, color: "rgba(255,255,255,0.85)", marginBottom: 36, maxWidth: 480, lineHeight: 1.5 }}>
                Premium products crafted for those who demand the best. Shop the new collection.
              </p>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <button onClick={() => setActiveTab("collection")} style={{ padding: "16px 36px", background: red, color: "#fff", borderRadius: 6, fontWeight: 700, fontSize: 16, border: "none", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 16px rgba(230,57,70,0.4)", transition: "transform 0.15s" }}>
                  Shop New Arrivals
                </button>
                <button style={{ padding: "16px 36px", background: "transparent", color: "#fff", borderRadius: 6, fontWeight: 700, fontSize: 16, border: "2px solid rgba(255,255,255,0.6)", cursor: "pointer", fontFamily: "inherit" }}>
                  Explore Lookbook
                </button>
              </div>
            </div>
          </section>

          {/* Trust Badges */}
          <section style={{ background: lightGray, padding: "32px 24px", borderBottom: `1px solid ${border}` }}>
            <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 32 }}>
              {[
                { icon: "🚚", title: "Free Shipping", sub: "On orders over $75" },
                { icon: "🛡️", title: "30-Day Guarantee", sub: "Love it or full refund" },
                { icon: "↩️", title: "Easy Returns", sub: "Hassle-free, no questions" },
                { icon: "🔒", title: "Secure Checkout", sub: "256-bit SSL encryption" },
              ].map((b) => (
                <div key={b.title} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{ fontSize: 28, flexShrink: 0 }}>{b.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: dark }}>{b.title}</div>
                    <div style={{ fontSize: 13, color: gray }}>{b.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Best Sellers */}
          <section style={{ padding: "60px 24px", maxWidth: 1280, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40, flexWrap: "wrap", gap: 16 }}>
              <div>
                <h2 style={{ fontSize: 34, fontWeight: 900, color: dark, letterSpacing: "-0.02em", marginBottom: 8 }}>Best Sellers</h2>
                <p style={{ color: gray, fontSize: 16 }}>Our most-loved products — curated for you.</p>
              </div>
              <button onClick={() => setActiveTab("collection")} style={{ padding: "12px 24px", border: `2px solid ${dark}`, borderRadius: 6, fontWeight: 600, fontSize: 14, background: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}>
                View all <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
              {products.map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
          </section>

          {/* Category Grid */}
          <section style={{ padding: "0 24px 60px", maxWidth: 1280, margin: "0 auto" }}>
            <h2 style={{ fontSize: 34, fontWeight: 900, color: dark, letterSpacing: "-0.02em", marginBottom: 32, textAlign: "center" }}>Shop by Category</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
              {[
                { label: "New Arrivals", sub: "Fresh drops every week", img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80" },
                { label: "Best Sellers", sub: "Customer favorites", img: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&q=80" },
                { label: "Sale", sub: "Up to 50% off", img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80" },
              ].map((c) => (
                <div key={c.label} style={{ position: "relative", borderRadius: 12, overflow: "hidden", aspectRatio: "3/4", cursor: "pointer" }}>
                  <img src={c.img} alt={c.label} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)" }} />
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 24, color: "#fff" }}>
                    <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{c.label}</div>
                    <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 16 }}>{c.sub}</div>
                    <span style={{ border: "2px solid rgba(255,255,255,0.7)", color: "#fff", padding: "7px 18px", borderRadius: 6, fontSize: 13, fontWeight: 700 }}>Shop Now</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Image + Text */}
          <section style={{ background: lightGray, padding: "60px 24px" }}>
            <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
              <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&q=80" alt="Story" style={{ width: "100%", borderRadius: 12, objectFit: "cover", aspectRatio: "4/5" }} />
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: red, marginBottom: 12 }}>Our Story</p>
                <h2 style={{ fontSize: 38, fontWeight: 900, color: dark, letterSpacing: "-0.02em", marginBottom: 20, lineHeight: 1.15 }}>Built to Last.<br/>Designed to Impress.</h2>
                <p style={{ color: gray, lineHeight: 1.75, marginBottom: 24, fontSize: 15 }}>We believe the products you use every day should bring joy and stand the test of time. Every item is carefully sourced and quality-checked to meet our exacting standards.</p>
                {["Sustainably sourced materials", "Lifetime craftsmanship warranty", "Certified carbon neutral shipping"].map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, fontSize: 14, fontWeight: 500 }}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={red} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    {f}
                  </div>
                ))}
                <button style={{ marginTop: 24, padding: "14px 28px", background: red, color: "#fff", borderRadius: 6, fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer", fontFamily: "inherit" }}>Learn About Us</button>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section style={{ background: "#fff", padding: "60px 24px" }}>
            <div style={{ maxWidth: 1280, margin: "0 auto" }}>
              <div style={{ textAlign: "center", marginBottom: 48 }}>
                <h2 style={{ fontSize: 34, fontWeight: 900, color: dark, letterSpacing: "-0.02em", marginBottom: 10 }}>Loved by Thousands</h2>
                <p style={{ color: gray }}>Don't just take our word for it.</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 12 }}>
                  <Stars n={5} />
                  <span style={{ fontSize: 14, fontWeight: 500, color: gray }}>4.9 out of 5 — based on 2,400+ verified reviews</span>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
                {[
                  { name: "James T.", loc: "Austin, TX", quote: "This is hands-down the best purchase I've made all year. Quality exceeded expectations and it arrived in 2 days. Will be ordering more!" },
                  { name: "Maria L.", loc: "Los Angeles, CA", quote: "Beautiful, fast shipping, and excellent customer service. I've already recommended this to everyone I know. 10/10." },
                  { name: "David K.", loc: "Chicago, IL", quote: "My whole family loves it. We've already bought three more as gifts. Unbeatable value for money. Highly recommend!" },
                ].map((t) => (
                  <div key={t.name} style={{ background: lightGray, borderRadius: 12, padding: 28 }}>
                    <Stars n={5} />
                    <blockquote style={{ fontSize: 15, lineHeight: 1.65, color: dark, fontStyle: "italic", margin: "14px 0 20px" }}>
                      "{t.quote}"
                    </blockquote>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: "50%", background: red, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, flexShrink: 0 }}>{t.name[0]}</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{t.name}</div>
                        <div style={{ fontSize: 12, color: gray }}>{t.loc}</div>
                        <div style={{ fontSize: 11, color: "#22a862", fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}>
                          <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                          Verified buyer
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Newsletter */}
          <section style={{ background: dark, padding: "60px 24px", textAlign: "center" }}>
            <div style={{ maxWidth: 560, margin: "0 auto" }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>📬</div>
              <h2 style={{ fontSize: 34, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", marginBottom: 12 }}>Get 10% Off Your First Order</h2>
              <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: 28, fontSize: 16 }}>Join 20,000+ subscribers for exclusive deals, new drops, and style inspiration.</p>
              <div style={{ display: "flex", gap: 8, maxWidth: 480, margin: "0 auto" }}>
                <input placeholder="Your email address" style={{ flex: 1, padding: "14px 18px", background: "rgba(255,255,255,0.1)", border: "2px solid rgba(255,255,255,0.15)", borderRadius: 6, color: "#fff", fontSize: 15, fontFamily: "inherit", outline: "none" }} />
                <button style={{ padding: "14px 24px", background: red, color: "#fff", borderRadius: 6, fontWeight: 700, fontSize: 15, border: "none", cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>Claim 10% Off</button>
              </div>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 12 }}>No spam, ever. Unsubscribe at any time.</p>
            </div>
          </section>

          {/* FAQ */}
          <section style={{ background: lightGray, padding: "60px 24px" }}>
            <div style={{ maxWidth: 740, margin: "0 auto" }}>
              <div style={{ textAlign: "center", marginBottom: 40 }}>
                <h2 style={{ fontSize: 34, fontWeight: 900, color: dark, letterSpacing: "-0.02em", marginBottom: 10 }}>Frequently Asked Questions</h2>
                <p style={{ color: gray }}>Everything you need to know.</p>
              </div>
              <div style={{ borderTop: `1px solid ${border}` }}>
                <FaqItem q="What is your return policy?" a="We offer a 30-day hassle-free return policy. Contact us within 30 days of delivery for a full refund or exchange." />
                <FaqItem q="How long does shipping take?" a="Standard shipping takes 3-7 business days. Express (1-2 days) is available at checkout. Free standard shipping on orders over $75." />
                <FaqItem q="Is my payment information secure?" a="100%. All transactions use 256-bit SSL encryption via Shopify's trusted payment gateway. We never store your card details." />
                <FaqItem q="Do you ship internationally?" a="Yes! We ship to 50+ countries worldwide. International rates and delivery times are calculated at checkout." />
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer style={{ background: dark, color: "rgba(255,255,255,0.7)", padding: "60px 24px 24px" }}>
            <div style={{ maxWidth: 1280, margin: "0 auto" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", gap: 48, marginBottom: 48 }}>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 22, color: "#fff", marginBottom: 14 }}><span style={{ color: red }}>Omni</span>web</div>
                  <p style={{ fontSize: 14, lineHeight: 1.6, maxWidth: 240, color: "rgba(255,255,255,0.5)" }}>Quality products, exceptional service. Crafted for everyday excellence.</p>
                  <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                    {["IG", "FB", "TT"].map((s) => (
                      <div key={s} style={{ width: 36, height: 36, background: "rgba(255,255,255,0.08)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>{s}</div>
                    ))}
                  </div>
                </div>
                {[
                  { title: "Shop", links: ["New Arrivals", "Best Sellers", "Sale", "Collections", "Gift Cards"] },
                  { title: "Support", links: ["FAQ", "Contact Us", "Shipping Info", "Returns", "Size Guide"] },
                  { title: "Company", links: ["About Us", "Blog", "Press", "Sustainability", "Careers"] },
                ].map((col) => (
                  <div key={col.title}>
                    <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#fff", marginBottom: 20 }}>{col.title}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {col.links.map((l) => (
                        <a key={l} href="#" style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", textDecoration: "none" }}>{l}</a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>© 2025 Omniweb. All rights reserved.</p>
                <div style={{ display: "flex", gap: 6, fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                  {["VISA", "Mastercard", "PayPal", "Shop Pay", "Amex"].map((p) => (
                    <span key={p} style={{ background: "rgba(255,255,255,0.08)", padding: "3px 8px", borderRadius: 4 }}>{p}</span>
                  ))}
                </div>
              </div>
            </div>
          </footer>
        </>
      )}

      {/* ======= PRODUCT PAGE ======= */}
      {activeTab === "product" && (
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 24px" }}>
          {/* Breadcrumb */}
          <div style={{ fontSize: 13, color: gray, marginBottom: 32, display: "flex", gap: 6, alignItems: "center" }}>
            <a href="#" style={{ color: gray, textDecoration: "none" }}>Home</a> <span style={{ opacity: 0.4 }}>›</span>
            <a href="#" style={{ color: gray, textDecoration: "none" }} onClick={() => setActiveTab("collection")}>Shop</a> <span style={{ opacity: 0.4 }}>›</span>
            <span style={{ color: dark }}>Premium Leather Wallet</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "start" }}>
            {/* Gallery */}
            <div>
              <div style={{ borderRadius: 12, overflow: "hidden", aspectRatio: "1/1", background: lightGray, marginBottom: 12 }}>
                <img src="https://images.unsplash.com/photo-1627123424574-724758594e93?w=900&q=80" alt="Product" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  "https://images.unsplash.com/photo-1627123424574-724758594e93?w=200&q=80",
                  "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200&q=80",
                  "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=200&q=80",
                  "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=200&q=80",
                ].map((src, i) => (
                  <div key={i} style={{ width: 72, height: 72, borderRadius: 8, overflow: "hidden", border: `2px solid ${i === 0 ? dark : border}`, cursor: "pointer", flexShrink: 0 }}>
                    <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Info */}
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: gray }}>By Omniweb Goods</p>
              <h1 style={{ fontSize: 32, fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1.2, color: dark }}>Premium Leather Wallet</h1>

              {/* Price */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 26, fontWeight: 900, color: red }}>$89.00</span>
                <s style={{ fontSize: 16, color: gray }}>$129.00</s>
                <Badge>Save $40.00</Badge>
              </div>

              {/* Stars */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Stars n={5} />
                <span style={{ fontSize: 13, color: gray, textDecoration: "underline", cursor: "pointer" }}>124 reviews</span>
              </div>

              {/* Variant Picker */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: dark, display: "block", marginBottom: 10 }}>
                  Color: <span style={{ fontWeight: 400, color: gray }}>Tan</span>
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  {["Tan", "Black", "Navy"].map((v, i) => (
                    <button key={v} style={{ padding: "8px 18px", border: `2px solid ${i === 0 ? dark : border}`, borderRadius: 6, fontSize: 14, fontWeight: 500, background: i === 0 ? dark : "#fff", color: i === 0 ? "#fff" : dark, cursor: "pointer", fontFamily: "inherit" }}>{v}</button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: dark, display: "block", marginBottom: 10 }}>Quantity</label>
                <div style={{ display: "flex", alignItems: "center", border: `1.5px solid ${border}`, borderRadius: 6, width: "fit-content" }}>
                  <button style={{ width: 44, height: 44, fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer", color: dark, fontFamily: "inherit" }}>−</button>
                  <span style={{ width: 56, textAlign: "center", fontSize: 16, fontWeight: 600, borderLeft: `1.5px solid ${border}`, borderRight: `1.5px solid ${border}`, height: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>1</span>
                  <button style={{ width: 44, height: 44, fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: "pointer", color: dark, fontFamily: "inherit" }}>+</button>
                </div>
              </div>

              {/* ATC */}
              <button onClick={() => setCartOpen(true)} style={{ padding: "18px", background: red, color: "#fff", borderRadius: 6, fontWeight: 700, fontSize: 16, border: "none", cursor: "pointer", width: "100%", fontFamily: "inherit", boxShadow: "0 4px 16px rgba(230,57,70,0.3)" }}>
                Add to Cart
              </button>
              <button style={{ padding: "16px", background: "#5a31f4", color: "#fff", borderRadius: 6, fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", width: "100%", fontFamily: "inherit" }}>
                Buy it now — Shop Pay
              </button>

              {/* Trust */}
              <div style={{ background: lightGray, borderRadius: 8, padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { icon: "🛡️", text: "30-Day Money Back Guarantee" },
                  { icon: "🚚", text: "Free Shipping Over $75" },
                  { icon: "🔒", text: "Secure Checkout — 256-bit SSL" },
                ].map((b) => (
                  <div key={b.text} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, fontWeight: 500 }}>
                    <span>{b.icon}</span> {b.text}
                  </div>
                ))}
              </div>

              {/* Description */}
              <div>
                <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, color: dark }}>Product Details</p>
                <p style={{ fontSize: 14, lineHeight: 1.75, color: gray }}>
                  Handcrafted from full-grain vegetable-tanned leather, this slim bifold wallet is designed to develop a rich patina over time. Features 6 card slots, 2 cash compartments, and an RFID-blocking layer. Fits comfortably in any pocket.
                </p>
              </div>

              {/* FAQ on product page */}
              <div>
                <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, color: dark }}>Product Questions</p>
                <div style={{ borderTop: `1px solid ${border}` }}>
                  <FaqItem q="How do I care for this wallet?" a="Condition with a leather balm every few months to maintain suppleness. Avoid prolonged exposure to water." />
                  <FaqItem q="Is this RFID-blocking?" a="Yes! The wallet features a built-in RFID-blocking layer to protect your cards from electronic pickpocketing." />
                  <FaqItem q="What's the return policy?" a="30-day hassle-free returns. Contact us for a full refund or exchange." />
                </div>
              </div>
            </div>
          </div>

          {/* Related Products */}
          <div style={{ marginTop: 80 }}>
            <h2 style={{ fontSize: 30, fontWeight: 900, color: dark, letterSpacing: "-0.02em", marginBottom: 8 }}>You May Also Like</h2>
            <p style={{ color: gray, marginBottom: 32 }}>Customers who viewed this also bought these.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
              {products.map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
          </div>
        </div>
      )}

      {/* ======= COLLECTION PAGE ======= */}
      {activeTab === "collection" && (
        <div>
          {/* Header */}
          <div style={{ background: lightGray, borderBottom: `1px solid ${border}`, padding: "32px 24px" }}>
            <div style={{ maxWidth: 1280, margin: "0 auto" }}>
              <div style={{ fontSize: 13, color: gray, marginBottom: 12, display: "flex", gap: 6 }}>
                <a href="#" style={{ color: gray, textDecoration: "none" }}>Home</a> <span style={{ opacity: 0.4 }}>›</span> <span>All Products</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h1 style={{ fontSize: 38, fontWeight: 900, color: dark, letterSpacing: "-0.02em" }}>All Products</h1>
                <span style={{ fontSize: 14, color: gray }}>24 products</span>
              </div>
            </div>
          </div>

          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px" }}>
            {/* Toolbar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
              <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", border: `1.5px solid ${border}`, borderRadius: 6, background: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="16" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="12" y2="18"/></svg>
                Filter
              </button>
              <select style={{ padding: "10px 14px", border: `1.5px solid ${border}`, borderRadius: 6, fontSize: 14, background: "#fff", cursor: "pointer", fontFamily: "inherit" }}>
                <option>Best selling</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest first</option>
              </select>
            </div>

            {/* Grid + Filters */}
            <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 40 }}>
              {/* Sidebar */}
              <aside>
                {[
                  { label: "Category", options: ["Accessories", "Bags", "Hats", "Wallets", "Watches"] },
                  { label: "Price", options: ["Under $25", "$25–$75", "$75–$150", "Over $150"] },
                  { label: "Color", options: ["Black", "Brown", "Navy", "Tan", "White"] },
                ].map((group) => (
                  <div key={group.label} style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: dark, marginBottom: 12 }}>{group.label}</div>
                    {group.options.map((opt) => (
                      <label key={opt} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, cursor: "pointer" }}>
                        <input type="checkbox" style={{ accentColor: dark, width: 15, height: 15 }} />
                        <span style={{ fontSize: 14, color: dark }}>{opt}</span>
                      </label>
                    ))}
                  </div>
                ))}
              </aside>

              {/* Products */}
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
                  {[...products, ...products, ...products].slice(0, 9).map((p, i) => (
                    <div key={i} onClick={() => setActiveTab("product")} style={{ cursor: "pointer" }}>
                      <ProductCard p={p} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======= CART DRAWER ======= */}
      {cartOpen && (
        <>
          <div onClick={() => setCartOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200 }} />
          <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 400, background: "#fff", zIndex: 300, boxShadow: "-8px 0 40px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "20px 24px", borderBottom: `1px solid ${border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: dark }}>Your Cart (2)</h2>
              <button onClick={() => setCartOpen(false)} style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6, background: "none", border: "none", cursor: "pointer", color: dark }}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
              {[
                { img: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=160&q=80", title: "Premium Leather Wallet", variant: "Tan", price: "$89.00", qty: 1 },
                { img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=160&q=80", title: "Minimalist Watch", variant: "Silver", price: "$249.00", qty: 1 },
              ].map((item) => (
                <div key={item.title} style={{ display: "grid", gridTemplateColumns: "72px 1fr", gap: 14, padding: "16px 0", borderBottom: `1px solid ${border}` }}>
                  <img src={item.img} alt={item.title} style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 8 }} />
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: dark, lineHeight: 1.3 }}>{item.title}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, flexShrink: 0 }}>{item.price}</span>
                    </div>
                    <div style={{ fontSize: 12, color: gray, marginTop: 3 }}>{item.variant}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", border: `1.5px solid ${border}`, borderRadius: 6 }}>
                        <button style={{ width: 30, height: 30, background: "none", border: "none", cursor: "pointer", fontSize: 16, color: dark, fontFamily: "inherit" }}>−</button>
                        <span style={{ width: 32, textAlign: "center", fontSize: 14, fontWeight: 600 }}>{item.qty}</span>
                        <button style={{ width: 30, height: 30, background: "none", border: "none", cursor: "pointer", fontSize: 16, color: dark, fontFamily: "inherit" }}>+</button>
                      </div>
                      <button style={{ color: gray, background: "none", border: "none", cursor: "pointer", fontSize: 12 }}>Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: "16px 24px 24px", borderTop: `1px solid ${border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
                <span>Subtotal</span><span>$338.00</span>
              </div>
              <p style={{ fontSize: 12, color: gray, marginBottom: 16, display: "flex", alignItems: "center", gap: 5 }}>
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 4v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                Taxes and shipping calculated at checkout
              </p>
              <button style={{ width: "100%", padding: 16, background: red, color: "#fff", borderRadius: 6, fontWeight: 700, fontSize: 16, border: "none", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 16px rgba(230,57,70,0.3)" }}>
                Checkout · $338.00
              </button>
              <button onClick={() => setCartOpen(false)} style={{ display: "block", textAlign: "center", marginTop: 12, color: gray, fontSize: 13, background: "none", border: "none", textDecoration: "underline", cursor: "pointer", width: "100%", fontFamily: "inherit" }}>
                Continue shopping
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
