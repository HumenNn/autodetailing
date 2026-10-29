import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminAPI } from '../api'

export default function Admin({ initialTab = 'bookings' }) {
  const [activeTab, setActiveTab] = useState(initialTab)
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [ordersError, setOrdersError] = useState('')
  const [filters, setFilters] = useState({
    date_from: '',
    date_to: '',
    status: 'all',
  })

  const navigate = useNavigate()

  useEffect(() => {
    if (!localStorage.getItem('isAdmin')) {
      navigate('/admin/login')
    }
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('isAdmin')
    navigate('/admin/login')
  }

  const loadOrders = async () => {
    setOrdersLoading(true)
    setOrdersError('')
    try {
      const params = {
        status: filters.status,
      }
      if (filters.date_from) params.date_from = filters.date_from
      if (filters.date_to) params.date_to = filters.date_to

      const { data } = await adminAPI.getOrderHistory(params)
      setOrders(data)
    } catch (e) {
      console.error('Не удалось загрузить историю заказов', e)
      setOrdersError('Не удалось загрузить историю заказов')
    } finally {
      setOrdersLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'reports') {
      loadOrders()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  const downloadBlob = (response, defaultFileName) => {
    const disposition = response.headers['content-disposition']
    let fileName = defaultFileName
    if (disposition) {
      const match = disposition.match(/filename="(.+?)"/)
      if (match) fileName = match[1]
    }

    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  }

  const handleDownloadReport = async (format) => {
    try {
      const params = {
        status: filters.status,
      }
      if (filters.date_from) params.date_from = filters.date_from
      if (filters.date_to) params.date_to = filters.date_to

      const response = await adminAPI.downloadOrdersReport(format, params)
      const defaultName =
        format === 'word'
          ? 'orders_report.docx'
          : format === 'excel'
          ? 'orders_report.xlsx'
          : 'orders_report.pdf'
      downloadBlob(response, defaultName)
    } catch (e) {
      console.error('Ошибка формирования отчета', e)
      alert('Ошибка формирования отчета')
    }
  }

  const handleExportClients = async () => {
    try {
      const response = await adminAPI.exportClientsCsv()
      downloadBlob(response, 'clients_export.csv')
    } catch (e) {
      console.error('Ошибка экспорта клиентов', e)
      alert('Ошибка экспорта клиентов')
    }
  }

  const handleImportClients = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      await adminAPI.importClientsCsv(file)
      alert('Импорт клиентов выполнен успешно')
    } catch (e) {
      console.error('Ошибка импорта клиентов', e)
      alert('Ошибка импорта клиентов')
    } finally {
      event.target.value = ''
    }
  }

  return (
    <div style={{ padding: '40px 0' }}>
      <div className="container">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
          }}
        >
          <h1 style={{ fontSize: '2.5rem' }}>Админ-панель</h1>
          <button onClick={handleLogout} className="btn btn-secondary">
            Выйти
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '2rem',
            flexWrap: 'wrap',
          }}
        >
          {[
            { key: 'bookings', label: 'Записи' },
            { key: 'services', label: 'Услуги' },
            { key: 'employees', label: 'Сотрудники' },
            { key: 'reports', label: 'Отчеты / История заказов' },
            { key: 'settings', label: 'Настройки' },
            { key: 'inventory', label: 'Инвентарь' },
          ].map((tab) => (
            <button
              key={tab.key}
              className={`btn ${activeTab === tab.key ? '' : 'btn-secondary'}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="card">
          {activeTab === 'bookings' && (
            <div>
              <h3>Последние записи</h3>
              <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>
                Здесь будут отображаться записи клиентов
              </p>
            </div>
          )}

          {activeTab === 'services' && (
            <div>
              <h3>Управление услугами</h3>
              <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>
                Здесь можно управлять списком услуг
              </p>
            </div>
          )}

          {activeTab === 'employees' && (
            <div>
              <h3>Сотрудники</h3>
              <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>
                Управление персоналом и ролями
              </p>
            </div>
          )}

          {activeTab === 'reports' && (
            <div>
              <h3>История заказов и отчеты</h3>

              {/* Фильтры */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  marginTop: '1rem',
                  marginBottom: '1rem',
                }}
              >
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem' }}>
                    Дата с
                  </label>
                  <input
                    type="date"
                    value={filters.date_from}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        date_from: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem' }}>
                    Дата по
                  </label>
                  <input
                    type="date"
                    value={filters.date_to}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        date_to: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem' }}>
                    Статус заказа
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, status: e.target.value }))
                    }
                  >
                    <option value="all">Все</option>
                    <option value="created">Создан</option>
                    <option value="in_progress">В работе</option>
                    <option value="completed">Завершен</option>
                    <option value="cancelled">Отменен</option>
                    <option value="paid">Оплачен</option>
                  </select>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                  }}
                >
                  <button className="btn" type="button" onClick={loadOrders}>
                    Обновить
                  </button>
                </div>
              </div>

              {/* Кнопки отчетов */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  marginBottom: '1.5rem',
                }}
              >
                <button
                  type="button"
                  className="btn"
                  onClick={() => handleDownloadReport('excel')}
                >
                  Отчет по заказам (Excel)
                </button>
              </div>

              {/* Импорт/экспорт клиентов в CSV */}
              <div
                style={{
                  marginBottom: '1.5rem',
                  padding: '1rem',
                  borderRadius: '8px',
                  background: '#f9fafb',
                }}
              >
                <h4 style={{ marginBottom: '0.75rem' }}>
                  Импорт / экспорт клиентов (CSV)
                </h4>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    marginBottom: '0.75rem',
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleExportClients}
                  >
                    Экспорт клиентов (CSV)
                  </button>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    alignItems: 'center',
                  }}
                >
                  <label style={{ fontSize: '0.9rem' }}>
                    Импорт клиентов (CSV):
                    <input
                      type="file"
                      accept=".csv,text/csv"
                      onChange={handleImportClients}
                    />
                  </label>
                </div>
              </div>

              {/* Таблица истории заказов */}
              {ordersError && (
                <div
                  style={{
                    background: '#fee2e2',
                    color: '#b91c1c',
                    padding: '0.75rem',
                    borderRadius: '4px',
                    marginBottom: '1rem',
                  }}
                >
                  {ordersError}
                </div>
              )}

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <th style={{ textAlign: 'left', padding: '0.5rem' }}>№</th>
                      <th style={{ textAlign: 'left', padding: '0.5rem' }}>
                        Дата
                      </th>
                      <th style={{ textAlign: 'left', padding: '0.5rem' }}>
                        Клиент
                      </th>
                      <th style={{ textAlign: 'left', padding: '0.5rem' }}>
                        Услуга
                      </th>
                      <th style={{ textAlign: 'left', padding: '0.5rem' }}>
                        Статус
                      </th>
                      <th style={{ textAlign: 'left', padding: '0.5rem' }}>
                        Оплата
                      </th>
                      <th style={{ textAlign: 'right', padding: '0.5rem' }}>
                        Сумма, BYN
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordersLoading ? (
                      <tr>
                        <td
                          colSpan={7}
                          style={{
                            padding: '1rem',
                            textAlign: 'center',
                            color: 'var(--text-muted)',
                          }}
                        >
                          Загрузка истории заказов...
                        </td>
                      </tr>
                    ) : orders.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          style={{
                            padding: '1rem',
                            textAlign: 'center',
                            color: 'var(--text-muted)',
                          }}
                        >
                          Заказов по выбранным фильтрам не найдено
                        </td>
                      </tr>
                    ) : (
                      orders.map((order) => (
                        <tr
                          key={order.id}
                          style={{ borderBottom: '1px solid var(--border)' }}
                        >
                          <td style={{ padding: '0.5rem' }}>
                            {order.order_number || order.id}
                          </td>
                          <td style={{ padding: '0.5rem' }}>
                            {order.order_date}
                          </td>
                          <td style={{ padding: '0.5rem' }}>
                            <div>
                              <strong>{order.client_name || '—'}</strong>
                              {order.client_email && (
                                <div
                                  style={{
                                    fontSize: '0.85rem',
                                    color: 'var(--text-muted)',
                                  }}
                                >
                                  {order.client_email}
                                </div>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: '0.5rem' }}>
                            {order.service_name || '—'}
                          </td>
                          <td style={{ padding: '0.5rem' }}>
                            {order.order_status}
                          </td>
                          <td style={{ padding: '0.5rem' }}>
                            {order.payment_status}
                          </td>
                          <td
                            style={{
                              padding: '0.5rem',
                              textAlign: 'right',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {order.total_amount}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h3>Настройки</h3>
              <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>
                Общие настройки системы и доступов
              </p>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div>
              <h3>Управление инвентарем</h3>
              <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>
                Здесь можно управлять запасами материалов
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}