import React, { useEffect, useState } from 'react'
import { servicesAPI } from '../api'
import { getImageUrl } from '../utils/imageUtils'

const seedServices = [
  { name: 'Полировка кузова', description: 'Восстановление блеска ЛКП', price: 250, duration_minutes: 120, image: 'work1.jpg' },
  { name: 'Керамическое покрытие', description: 'Долговременная защита', price: 750, duration_minutes: 180, image: 'work2.jpg' },
  { name: 'Химчистка салона', description: 'Глубокая очистка салона', price: 350, duration_minutes: 90, image: 'work3.jpg' },
]

const availableImages = ['work1.jpg','work2.jpg','work3.jpg','work4.jpg','work5.jpg','work6.jpg','polishing.jpg','ceramic.jpg','cleaning.jpg','hero.jpg']

export default function AdminServices() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', description: '', price: '', duration_minutes: '', image: availableImages[0] })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await servicesAPI.getAll()
      if (data.length === 0) {
        // авто-сидирование
        const created = []
        for (const s of seedServices) {
          const { data: createdItem } = await servicesAPI.create(s)
          created.push(createdItem)
        }
        setItems(created)
      } else {
        setItems(data)
      }
    } catch (e) {
      console.error('Не удалось загрузить услуги', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        price: Number(form.price || 0),
        duration_minutes: Number(form.duration_minutes || 0),
      }
      const { data } = await servicesAPI.create(payload)
      setItems((prev) => [...prev, data])
      setForm({ name: '', description: '', price: '', duration_minutes: '', image: availableImages[0] })
    } catch (err) {
      console.error('Ошибка создания услуги', err)
      alert('Не удалось создать услугу')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (id, field, value) => {
    try {
      const payload = { [field]: field.includes('price') || field.includes('duration') ? Number(value) : value }
      const { data } = await servicesAPI.update(id, payload)
      setItems((prev) => prev.map((i) => (i.id === id ? data : i)))
    } catch (err) {
      console.error('Ошибка обновления', err)
      alert('Не удалось обновить услугу')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить услугу?')) return
    try {
      await servicesAPI.delete(id)
      setItems((prev) => prev.filter((i) => i.id !== id))
    } catch (err) {
      console.error('Ошибка удаления', err)
      alert('Не удалось удалить услугу')
    }
  }

  if (loading) {
    return <div className="container" style={{ padding: '2rem' }}>Загрузка услуг...</div>
  }

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>Услуги</h1>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Добавить услугу</h3>
        <form onSubmit={handleCreate} style={{ display: 'grid', gap: '0.75rem' }}>
          <input required placeholder="Название" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <textarea required placeholder="Описание" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <input required type="number" step="1" min="0" placeholder="Цена BYN" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            <input required type="number" step="1" min="0" placeholder="Длительность, мин" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })} />
          </div>
          <select value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })}>
            {availableImages.map((img) => <option key={img} value={img}>{img}</option>)}
          </select>
          <button className="btn" type="submit" disabled={saving}>Сохранить</button>
        </form>
      </div>

      <div className="grid grid-cols-3">
        {items.map((s) => {
          const imgName = availableImages.includes(s.image) ? s.image : availableImages[0]
          return (
            <div key={s.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <img src={getImageUrl(imgName)} alt={s.name} style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 8 }} />
              <input value={s.name} onChange={(e) => handleUpdate(s.id, 'name', e.target.value)} />
              <textarea value={s.description || ''} onChange={(e) => handleUpdate(s.id, 'description', e.target.value)} />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input type="number" step="1" min="0" value={s.price} onChange={(e) => handleUpdate(s.id, 'price', e.target.value)} />
                <input type="number" step="1" min="0" value={s.duration_minutes ?? ''} onChange={(e) => handleUpdate(s.id, 'duration_minutes', e.target.value)} />
              </div>
              <select value={imgName} onChange={(e) => handleUpdate(s.id, 'image', e.target.value)}>
                {availableImages.map((img) => <option key={img} value={img}>{img}</option>)}
              </select>
              <button className="btn btn-secondary" onClick={() => handleDelete(s.id)} style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>
                Удалить
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}


