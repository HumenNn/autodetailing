import "./Portfolio.css";

const portfolioItems = [
  {
    id: 1,
    title: "Полировка кузова",
    category: "Полировка",
    image:
      "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=600&h=400&fit=crop",
  },
  {
    id: 2,
    title: "Химчистка салона",
    category: "Химчистка",
    image:
      "https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&h=400&fit=crop",
  },
  {
    id: 3,
    title: "Керамическое покрытие",
    category: "Защита",
    image:
      "https://images.unsplash.com/photo-1552930294-6b595f4c2974?w=600&h=400&fit=crop",
  },
  {
    id: 4,
    title: "Детейлинг двигателя",
    category: "Двигатель",
    image:
      "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&h=400&fit=crop",
  },
  {
    id: 5,
    title: "Полировка фар",
    category: "Полировка",
    image:
      "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&h=400&fit=crop",
  },
  {
    id: 6,
    title: "Антигравийная пленка",
    category: "Защита",
    image:
      "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&h=400&fit=crop",
  },
  {
    id: 7,
    title: "Химчистка кожи",
    category: "Химчистка",
    image:
      "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&h=400&fit=crop",
  },
  {
    id: 8,
    title: "Восстановление ЛКП",
    category: "Полировка",
    image:
      "https://images.unsplash.com/photo-1507136566006-cfc505b114fc?w=600&h=400&fit=crop",
  },
];

export default function Portfolio() {
  return (
    <div className="portfolio-page">
      <div className="page-header">
        <div className="container">
          <h1>Наши работы</h1>
          <p>Примеры выполненных проектов</p>
        </div>
      </div>

      <div className="container">
        <div className="portfolio-grid">
          {portfolioItems.map((item) => (
            <div key={item.id} className="portfolio-item">
              <img
                src={item.image}
                alt={item.title}
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/600x400?text=AutoDetailing";
                }}
              />
              <div className="portfolio-overlay">
                <span className="portfolio-category">{item.category}</span>
                <h3>{item.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
