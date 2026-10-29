import React, { useState, useEffect } from 'react'
import { inventoryAPI } from '../api'

export default function AdminInventory() {
  const [inventory, setInventory] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    sku: '',
    quantity: 0,
    minimum_threshold: 0,
    unit: 'шт',
    location: '',
  })

  const loadInventory = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await inventoryAPI.getAll()
      setInventory(data || [])
    } catch (e) {
      console.error('Не удалось загрузить инвентарь', e)
      setError('Не удалось загрузить инвентарь')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInventory()
  }, [])

  const getStockStatus = (quantity, threshold) => {
    if (quantity <= 0) return { status: 'out-of-stock', label: 'Нет в наличии', color: '#dc2626' }
    if (quantity <= threshold) return { status: 'low-stock', label: 'Мало', color: '#ea580c' }
    if (quantity <= threshold * 2) return { status: 'medium-stock', label: 'Средне', color: '#d97706' }
    return { status: 'in-stock', label: 'Много', color: '#16a34a' }
  }

  const handleAddItem = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        name: newItem.name,
        description: newItem.description || null,
        sku: newItem.sku,
        quantity: Number(newItem.quantity || 0),
        unit: newItem.unit,
        minimum_threshold: Number(newItem.minimum_threshold || 0),
        location: newItem.location || null,
        cost: 0,
      }
      const { data } = await inventoryAPI.create(payload)
      setInventory((prev) => [...prev, data])
      setNewItem({
        name: '',
        description: '',
        sku: '',
        quantity: 0,
        minimum_threshold: 0,
        unit: 'шт',
        location: '',
      })
      setShowAddForm(false)
    } catch (e) {
      console.error('Ошибка создания материала', e)
      setError('Не удалось создать материал')
    }
  }

  const updateQuantity = async (id, newQuantity) => {
    try {
      const payload = { quantity: Number(newQuantity) }
      const { data } = await inventoryAPI.update(id, payload)
      setInventory((prev) =>
        prev.map((item) => (item.id === id ? data : item)),
      )
    } catch (e) {
      console.error('Ошибка обновления количества', e)
      setError('Не удалось обновить остаток материала')
    }
  }

  const updateMinimumThreshold = async (id, newThreshold) => {
    try {
      const payload = { minimum_threshold: Number(newThreshold) }
      const { data } = await inventoryAPI.update(id, payload)
      setInventory((prev) =>
        prev.map((item) => (item.id === id ? data : item)),
      )
    } catch (e) {
      console.error('Ошибка обновления минимального запаса', e)
      setError('Не удалось обновить минимальный запас')
    }
  }

  const handleEditItem = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        name: editingItem.name,
        description: editingItem.description || null,
        sku: editingItem.sku,
        quantity: Number(editingItem.quantity || 0),
        unit: editingItem.unit,
        minimum_threshold: Number(editingItem.minimum_threshold || 0),
        location: editingItem.location || null,
        cost: Number(editingItem.cost || 0),
      }
      const { data } = await inventoryAPI.update(editingItem.id, payload)
      setInventory((prev) =>
        prev.map((item) => (item.id === editingItem.id ? data : item)),
      )
      setShowEditForm(false)
      setEditingItem(null)
    } catch (e) {
      console.error('Ошибка обновления материала', e)
      setError('Не удалось обновить материал')
    }
  }

  const startEditing = (item) => {
    setEditingItem({ ...item })
    setShowEditForm(true)
  }

  const lowStockItems = inventory.filter(
    (item) => item.quantity <= item.minimum_threshold,
  )

  const orderAllLowStock = async () => {
    if (lowStockItems.length === 0) return
    if (
      !window.confirm(
        'Дозаказать все позиции с низким остатком? Количество будет увеличено примерно на один минимальный запас для каждого материала.',
      )
    ) {
      return
    }
    for (const item of lowStockItems) {
      const delta = item.minimum_threshold || 10
      const newQty = Number(item.quantity) + Number(delta)
      await updateQuantity(item.id, newQty)
    }
  }

  return (
    <div style={{ padding: '40px 0' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', margin: 0 }}>Управление инвентарем</h1>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={() => setShowAddForm(true)}
              className="btn"
            >
              + Добавить материал
            </button>
          </div>
        </div>

        {/* Уведомления о низком запасе */}
        {lowStockItems.length > 0 && (
          <div
            className="card"
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              marginBottom: '2rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
              }}
            >
              <h3 style={{ color: '#dc2626', margin: 0 }}>
                ⚠️ Низкий запас материалов
              </h3>
              <button
                type="button"
                className="btn"
                style={{
                  background: '#ef4444',
                  borderColor: '#b91c1c',
                  color: 'white',
                  fontSize: '0.9rem',
                }}
                onClick={orderAllLowStock}
              >
                Дозаказать все
              </button>
            </div>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {lowStockItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span>
                    <strong>{item.name}</strong> - осталось {item.quantity} {item.unit}
                  </span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 10)}
                    className="btn"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                  >
                    Заказать
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Форма добавления нового материала */}
        {showAddForm && (
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Добавить новый материал</h3>
            <form onSubmit={handleAddItem}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Название *
                  </label>
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) =>
                      setNewItem({ ...newItem, name: e.target.value })
                    }
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Описание
                  </label>
                  <input
                    type="text"
                    value={newItem.description}
                    onChange={(e) =>
                      setNewItem({ ...newItem, description: e.target.value })
                    }
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Артикул *
                  </label>
                  <input
                    type="text"
                    value={newItem.sku}
                    onChange={(e) =>
                      setNewItem({ ...newItem, sku: e.target.value })
                    }
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Количество *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newItem.quantity}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        quantity: parseFloat(e.target.value),
                      })
                    }
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Минимальный запас *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newItem.minimum_threshold}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        minimum_threshold: parseFloat(e.target.value),
                      })
                    }
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Единица измерения
                  </label>
                  <select
                    value={newItem.unit}
                    onChange={(e) =>
                      setNewItem({ ...newItem, unit: e.target.value })
                    }
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  >
                    <option value="шт">Штуки</option>
                    <option value="л">Литры</option>
                    <option value="кг">Килограммы</option>
                    <option value="м">Метры</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Место хранения
                  </label>
                  <input
                    type="text"
                    value={newItem.location}
                    onChange={(e) =>
                      setNewItem({ ...newItem, location: e.target.value })
                    }
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn">
                  Добавить
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowAddForm(false)}
                  className="btn btn-secondary"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Форма редактирования материала */}
        {showEditForm && editingItem && (
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Редактировать материал</h3>
            <form onSubmit={handleEditItem}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Название *
                  </label>
                  <input
                    type="text"
                    value={editingItem.name}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, name: e.target.value })
                    }
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Описание
                  </label>
                  <input
                    type="text"
                    value={editingItem.description || ''}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, description: e.target.value })
                    }
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Артикул *
                  </label>
                  <input
                    type="text"
                    value={editingItem.sku}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, sku: e.target.value })
                    }
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Количество *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingItem.quantity}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        quantity: parseFloat(e.target.value),
                      })
                    }
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Минимальный запас *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingItem.minimum_threshold}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        minimum_threshold: parseFloat(e.target.value),
                      })
                    }
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Единица измерения
                  </label>
                  <select
                    value={editingItem.unit}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, unit: e.target.value })
                    }
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  >
                    <option value="шт">Штуки</option>
                    <option value="л">Литры</option>
                    <option value="кг">Килограммы</option>
                    <option value="м">Метры</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Место хранения
                  </label>
                  <input
                    type="text"
                    value={editingItem.location || ''}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, location: e.target.value })
                    }
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn">
                  Сохранить
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditForm(false)
                    setEditingItem(null)
                  }}
                  className="btn btn-secondary"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Таблица инвентаря */}
        <div className="card">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '0.75rem' }}>Материал</th>
                <th style={{ textAlign: 'left', padding: '0.75rem' }}>Артикул</th>
                <th style={{ textAlign: 'left', padding: '0.75rem' }}>Количество</th>
                <th style={{ textAlign: 'left', padding: '0.75rem' }}>Мин. запас</th>
                <th style={{ textAlign: 'left', padding: '0.75rem' }}>Статус</th>
                <th style={{ textAlign: 'left', padding: '0.75rem' }}>Место</th>
                <th style={{ textAlign: 'left', padding: '0.75rem' }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => {
                const stockStatus = getStockStatus(item.quantity, item.minimum_threshold)
                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.75rem' }}>
                      <strong>{item.name}</strong>
                    </td>
                    <td style={{ padding: '0.75rem' }}>{item.sku}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          type="number"
                          step="0.1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateQuantity(
                              item.id,
                              parseFloat(e.target.value),
                            )
                          }
                          style={{
                            width: '80px',
                            padding: '0.25rem',
                            border: '1px solid #ddd',
                            borderRadius: '4px'
                          }}
                        />
                        <span>{item.unit}</span>
                      </div>
                    </td>
                     <td style={{ padding: '0.75rem' }}>
                       <input
                         type="number"
                         step="0.1"
                         value={item.minimum_threshold}
                         onChange={(e) =>
                           updateMinimumThreshold(
                             item.id,
                             parseFloat(e.target.value),
                           )
                         }
                         style={{
                           width: '60px',
                           padding: '0.25rem',
                           border: '1px solid #ddd',
                           borderRadius: '4px'
                         }}
                       />
                       <span style={{ marginLeft: '0.25rem' }}>{item.unit}</span>
                     </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{
                        background: stockStatus.color,
                        color: 'white',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}>
                        {stockStatus.label}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>{item.location}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <button
                        onClick={() => startEditing(item)}
                        style={{
                          background: '#e5e7eb',
                          color: '#374151',
                          border: 'none',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                          marginRight: '0.5rem'
                        }}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        style={{
                          background: '#dbeafe',
                          color: '#1e40af',
                          border: 'none',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                          marginRight: '0.5rem'
                        }}
                      >
                        +1
                      </button>
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.id,
                            Math.max(0, item.quantity - 1),
                          )
                        }
                        style={{
                          background: '#fef3c7',
                          color: '#92400e',
                          border: 'none',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.875rem',
                          cursor: 'pointer'
                        }}
                      >
                        -1
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
