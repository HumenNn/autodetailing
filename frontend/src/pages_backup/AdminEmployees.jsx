import React, { useEffect, useState } from 'react'
import { employeesAPI } from '../utils/api'
import { getImageUrl } from '../utils/imageUtils'

const seedEmployees = [
  { name: 'Алексей Петров', role: 'detailer', qualification: 'Полировка', work_hours: '09:00-18:00', image: 'master1.jpg' },
  { name: 'Дмитрий Иванов', role: 'coating', qualification: 'Керамика', work_hours: '10:00-19:00', image: 'master2.jpg' },
  { name: 'Илья Смирнов', role: 'interior', qualification: 'Химчистка', work_hours: '08:00-17:00', image: 'master3.jpg' },
]

export default function AdminEmployees() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', role: '', qualification: '', work_hours: '09:00-18:00' })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await employeesAPI.getAll()
      if (data.length === 0) {
        const created = []
        for (const emp of seedEmployees) {
          const { data: createdEmp } = await employeesAPI.create(emp)
          created.push({ ...createdEmp, image: emp.image })
        }
        setItems(created)
      } else {
        // Добавляем изображения по индексу, чтобы показать фото даже если БД их не хранит
        const withImages = data.map((emp, idx) => ({
          ...emp,
          image: seedEmployees[idx % seedEmployees.length].image,
        }))
        setItems(withImages)
      }
    } catch (e) {
      console.error('Не удалось загрузить сотрудников', e)
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
      const { data } = await employeesAPI.create(form)
      const image = seedEmployees[items.length % seedEmployees.length].image
      setItems((prev) => [...prev, { ...data, image }])
      setForm({ name: '', role: '', qualification: '', work_hours: '09:00-18:00' })
    } catch (err) {
      console.error('Ошибка создания сотрудника', err)
      alert('Не удалось создать сотрудника')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="container" style={{ padding: '2rem' }}>Загрузка сотрудников...</div>
  }

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>Сотрудники</h1>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Добавить сотрудника</h3>
        <form onSubmit={handleCreate} style={{ display: 'grid', gap: '0.75rem' }}>
          <input required placeholder="Имя" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input required placeholder="Роль" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
          <input required placeholder="Квалификация" value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} />
          <input required placeholder="График (например 09:00-18:00)" value={form.work_hours} onChange={(e) => setForm({ ...form, work_hours: e.target.value })} />
          <button className="btn" type="submit" disabled={saving}>Сохранить</button>
        </form>
      </div>

      <div className="grid grid-cols-3">
        {items.map((emp) => (
          <div key={emp.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <img src={getImageUrl(emp.image || 'master1.jpg')} alt={emp.name} style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 8 }} />
            <div style={{ fontWeight: '600' }}>{emp.name}</div>
            <div style={{ color: 'var(--text-muted)' }}>{emp.role}</div>
            <div style={{ color: 'var(--text-muted)' }}>{emp.qualification}</div>
            <div style={{ color: 'var(--text-muted)' }}>График: {emp.work_hours}</div>
          </div>
        ))}
      </div>
    </div>
  )
}


