import { useEffect, useState } from 'react';
import { getGallery } from '../api/website';
import { getServiceCategories } from '../api/services';
import Reveal from '../components/Reveal';

export default function Gallery() {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getServiceCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    getGallery(activeCategory || undefined)
      .then(setItems)
      .catch(() => setError('Could not load the gallery right now.'))
      .finally(() => setLoading(false));
  }, [activeCategory]);

  return (
    <>
      <section className="py-14 border-b border-ink/[0.14]">
        <div className="container">
          <span className="eyebrow">Gallery</span>
          <h1>Inside the Studio</h1>
          <p className="text-ink-soft text-[1.05rem]">A look at the space, the work, and the people behind it.</p>
        </div>
      </section>

      <div className="container py-14">
        <div className="flex flex-wrap gap-3 mb-9">
          <button
            onClick={() => setActiveCategory('')}
            className={`font-mono text-[0.75rem] uppercase tracking-wider px-4 py-2 border rounded-brand cursor-pointer transition-colors ${
              activeCategory === '' ? 'bg-ink text-paper border-ink' : 'border-ink/[0.14] text-ink-soft hover:border-rose-deep'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(String(cat.id))}
              className={`font-mono text-[0.75rem] uppercase tracking-wider px-4 py-2 border rounded-brand cursor-pointer transition-colors ${
                activeCategory === String(cat.id) ? 'bg-ink text-paper border-ink' : 'border-ink/[0.14] text-ink-soft hover:border-rose-deep'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {loading && <p className="text-ink-soft">Loading…</p>}
        {error && <p className="text-rose-deep">{error}</p>}
        {!loading && !error && items.length === 0 && (
          <p className="text-ink-soft">No photos in this category yet.</p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {items.map((item, i) => (
            <Reveal key={item.id} delay={(i % 6) * 60} className="card-hover overflow-hidden bg-paper-dim">
              <img src={item.image} alt={item.caption} className="aspect-square w-full object-cover" />
            </Reveal>
          ))}
        </div>
      </div>
    </>
  );
}
