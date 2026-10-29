import React, { useState, useEffect } from 'react'
import { clientsAPI, loyaltyAPI } from '../api'

export default function AdminClients() {
  const [clients, setClients] = useState([])
  const [selectedClient, setSelectedClient] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    preferences: {}
  })
  const [loyaltyTransactions, setLoyaltyTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    try {
      const response = await clientsAPI.getAll()
      setClients(response.data)
    } catch (error) {
      console.error('Error loading clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (selectedClient) {
        await clientsAPI.update(selectedClient.id, formData)
      } else {
        await clientsAPI.create(formData)
      }
      setShowForm(false)
      setSelectedClient(null)
      setFormData({ name: '', phone: '', email: '', preferences: {} })
      loadClients()
    } catch (error) {
      console.error('Error saving client:', error)
    }
  }

  const handleEdit = (client) => {
    setSelectedClient(client)
    setFormData({
      name: client.name,
      phone: client.phone,
      email: client.email || '',
      preferences: client.preferences || {}
    })
    setShowForm(true)
  }

  const handleDelete = async (clientId) => {
    if (window.confirm('Вы уверены, что хотите удалить клиента?')) {
      try {
        await clientsAPI.delete(clientId)
        loadClients()
      } catch (error) {
        console.error('Error deleting client:', error)
      }
    }
  }

  const loadClientDetails = async (client) => {
    try {
      const [transactionsRes, balanceRes] = await Promise.all([
        loyaltyAPI.getTransactions(client.id),
        loyaltyAPI.getBalance(client.id)
      ])
      setLoyaltyTransactions(transactionsRes.data)
      setSelectedClient({ ...client, ...balanceRes.data })
    } catch (error) {
      console.error('Error loading client details:', error)
    }
  }

  if (loading) {
    return <div className="container"><p>Загрузка...</p></div>
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Управление клиентами</h1>
        <button className="btn" onClick={() => setShowForm(true)}>Добавить клиента</button>
      </div>

      <div className="grid grid-cols-1 grid-cols-2" style={{ gap: '2rem' }}>
        <div>
          <h2>Список клиентов</h2>
          {clients.map(client => (
            <div key={client.id} className="card" style={{ marginBottom: '1rem', cursor: 'pointer' }}
                 onClick={() => loadClientDetails(client)}>
              <h3>{client.name}</h3>
              <p>Телефон: {client.phone}</p>
              <p>Email: {client.email}</p>
              <p>Бонусные баллы: {client.loyalty_points}</p>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button className="btn btn-secondary" onClick={(e) => { e.stopPropagation(); handleEdit(client) }}>
                  Редактировать
                </button>
                <button className="btn" style={{ background: '#dc2626' }} onClick={(e) => { e.stopPropagation(); handleDelete(client.id) }}>
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>

        {selectedClient && (
          <div>
            <h2>Детали клиента</h2>
            <div className="card">
              <h3>{selectedClient.name}</h3>
              <p><strong>Телефон:</strong> {selectedClient.phone}</p>
              <p><strong>Email:</strong> {selectedClient.email}</p>
              <p><strong>Бонусные баллы:</strong> {selectedClient.loyalty_points}</p>
              <p><strong>Всего посещений:</strong> {selectedClient.total_visits}</p>
              <p><strong>Общая сумма:</strong> {selectedClient.total_spent} BYN</p>

              <h4>История лояльности</h4>
              {loyaltyTransactions.map(transaction => (
                <div key={transaction.id} style={{ borderBottom: '1px solid #e5e7eb', padding: '0.5rem 0' }}>
                  <p><strong>{transaction.transaction_type === 'earn' ? 'Начислено' : 'Списано'}:</strong> {transaction.points} баллов</p>
                  <p><strong>Причина:</strong> {transaction.reason}</p>
                  <p><small>{new Date(transaction.created_at).toLocaleDateString()}</small></p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ width: '500px', maxWidth: '90vw' }}>
            <h2>{selectedClient ? 'Редактировать клиента' : 'Добавить клиента'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label>Имя:</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Телефон:</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                  style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Email:</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setSelectedClient(null) }}>
                  Отмена
                </button>
                <button type="submit" className="btn">
                  {selectedClient ? 'Сохранить' : 'Добавить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}