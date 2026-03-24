import { useState, useEffect } from "react";
import { inventoryAPI } from "../services/api";
import "./Inventory.css";

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editStock, setEditStock] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await inventoryAPI.getProducts();
      setProducts(response.data);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setEditStock(product.current_stock.toString());
  };

  const handleSave = async (productId) => {
    try {
      const quantity =
        parseFloat(editStock) -
        products.find((p) => p.id === productId).current_stock;
      await inventoryAPI.updateStock(productId, {
        quantity: quantity,
        notes: "Ручное изменение остатка",
      });
      setMessage("Остаток обновлён");
      setEditingId(null);
      loadProducts();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Ошибка при обновлении");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditStock("");
  };

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <div className="inventory-page">
      <div className="page-header">
        <h1>Склад и материалы</h1>
        <p>Учёт расходников</p>
      </div>

      {message && (
        <div
          className={`message ${message.includes("Ошибка") ? "error" : "success"}`}
        >
          {message}
        </div>
      )}

      <div className="inventory-stats">
        <div className="stat-card">
          <span className="stat-value">{products.length}</span>
          <span className="stat-label">Всего товаров</span>
        </div>
        <div className="stat-card warning">
          <span className="stat-value">
            {products.filter((p) => p.needs_reorder).length}
          </span>
          <span className="stat-label">Требуют заказа</span>
        </div>
      </div>

      <div className="products-table">
        <table>
          <thead>
            <tr>
              <th>Название</th>
              <th>Категория</th>
              <th>Остаток</th>
              <th>Минимум</th>
              <th>Цена</th>
              <th>Статус</th>
              <th>Действие</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className={product.needs_reorder ? "low-stock" : ""}
              >
                <td>{product.name}</td>
                <td>{product.category_name}</td>
                <td>
                  {editingId === product.id ? (
                    <input
                      type="number"
                      step="0.1"
                      value={editStock}
                      onChange={(e) => setEditStock(e.target.value)}
                      className="stock-input"
                    />
                  ) : (
                    `${product.current_stock} ${product.unit}`
                  )}
                </td>
                <td>
                  {product.min_stock} {product.unit}
                </td>
                <td>{Number(product.price_per_unit).toLocaleString()} BYN</td>
                <td>
                  {product.needs_reorder ? (
                    <span className="status-badge low">Заказать</span>
                  ) : (
                    <span className="status-badge ok">В наличии</span>
                  )}
                </td>
                <td className="actions">
                  {editingId === product.id ? (
                    <>
                      <button
                        onClick={() => handleSave(product.id)}
                        className="btn btn-small btn-success"
                      >
                        ✓
                      </button>
                      <button
                        onClick={handleCancel}
                        className="btn btn-small btn-danger"
                      >
                        ✗
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleEdit(product)}
                      className="btn btn-small"
                    >
                      Изменить
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
