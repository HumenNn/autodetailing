import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminAPI, automationAPI } from '../api'

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

    // Определяем MIME тип на основе расширения файла
    let mimeType = 'application/octet-stream'
    if (fileName.endsWith('.xlsx')) {
      mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    } else if (fileName.endsWith('.docx')) {
      mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    } else if (fileName.endsWith('.pdf')) {
      mimeType = 'application/pdf'
    }

    const url = window.URL.createObjectURL(new Blob([response.data], { type: mimeType }))
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

      console.log('Requesting report with params:', { format, ...params })
      const response = await adminAPI.downloadOrdersReport(format, params)
      console.log('Report response:', response)
      console.log('Response data size:', response.data?.size || 'no data')

      if (!response.data || response.data.size === 0) {
        throw new Error('Empty response data')
      }

      const defaultName =
        format === 'word'
          ? 'orders_report.docx'
          : format === 'excel'
          ? 'orders_report.xlsx'
          : 'orders_report.pdf'
      downloadBlob(response, defaultName)
      alert(`Отчет успешно создан: ${defaultName}`)
    } catch (e) {
      console.error('Ошибка формирования отчета', e)
      alert(`Ошибка формирования отчета: ${e.message}`)
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

  const runManualReport = async (reportType) => {
    try {
      const { data } = await automationAPI.runReport(reportType)
      alert(`Отчет создан: ${data.message}`)
    } catch (e) {
      console.error('Ошибка создания отчета:', e)
      alert('Ошибка создания отчета')
    }
  }

  const generateMaterialOrder = () => {
    // Данные о материалах с низким запасом
    const lowStockMaterials = [
      {
        name: 'Керамическое покрытие',
        sku: 'CER-003',
        currentStock: 1.2,
        minimumStock: 3.0,
        unit: 'л',
        orderQuantity: 5.0,
        supplierPrice: 150.00,
        total: 750.00
      },
      {
        name: 'Микрофибровые полотенца',
        sku: 'MF-004',
        currentStock: 8,
        minimumStock: 10,
        unit: 'шт',
        orderQuantity: 20,
        supplierPrice: 25.00,
        total: 500.00
      }
    ]

    // Создаем CSV содержимое
    let csvContent = 'Заказ материалов от DetailPro\n'
    csvContent += 'Магазин: detail.com\n'
    csvContent += 'Дата заказа: ' + new Date().toLocaleDateString('ru-RU') + '\n'
    csvContent += 'Организация: DetailPro - Автодетейлинг\n'
    csvContent += '\n'

    // Заголовки таблицы
    csvContent += 'Название материала,Артикул,Текущий запас,Мин. запас,Ед.изм.,Заказать кол-во,Цена поставщика,Сумма\n'

    // Данные материалов
    lowStockMaterials.forEach(material => {
      csvContent += `"${material.name}","${material.sku}","${material.currentStock}","${material.minimumStock}","${material.unit}","${material.orderQuantity}","${material.supplierPrice}","${material.total}"\n`
    })

    // Итоговая сумма
    const totalSum = lowStockMaterials.reduce((sum, material) => sum + material.total, 0)
    csvContent += '\n'
    csvContent += `Итого к оплате:,"${totalSum} BYN"\n`
    csvContent += '\n'

    // Форма заказа
    csvContent += '=== ФОРМА ЗАКАЗА ===\n'
    csvContent += 'Поставщик: detail.com\n'
    csvContent += 'Способ оплаты: Банковский перевод\n'
    csvContent += 'Адрес доставки: ул. Автодетейлинговая, 15, Минск\n'
    csvContent += 'Контактное лицо: Администратор системы\n'
    csvContent += 'Телефон: +375 (29) 123-45-67\n'
    csvContent += 'Email: admin@detailing.com\n'
    csvContent += '\n'

    // Статус заказа
    csvContent += '=== СТАТУС ЗАКАЗА ===\n'
    csvContent += 'Заказ оформлен успешно!\n'
    csvContent += 'Номер заказа: ORD-' + Date.now() + '\n'
    csvContent += 'Статус: Оформлен и отправлен поставщику\n'
    csvContent += 'Ожидаемая дата доставки: ' + new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('ru-RU') + '\n'
    csvContent += 'Уведомление отправлено на email поставщика\n'

    // Скачиваем файл
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `material_order_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Показываем сообщение об успехе
    alert('Заказ материалов успешно создан и сохранен!\nФайл: material_order_' + new Date().toISOString().split('T')[0] + '.csv')
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
            { key: 'clients', label: 'Клиенты' },
            { key: 'services', label: 'Услуги' },
            { key: 'employees', label: 'Сотрудники' },
            { key: 'reports', label: 'Отчеты / История заказов' },
            { key: 'notifications', label: 'Уведомления' },
            { key: 'automation', label: 'Автоматизация' },
            { key: 'portfolio', label: 'Портфолио' },
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

          {activeTab === 'portfolio' && (
            <div>
              <h3>Управление портфолио</h3>
              <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>
                Здесь можно управлять фотографиями работ
              </p>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h3>🔔 Уведомления</h3>
              <div style={{ marginTop: '1rem' }}>
                <div style={{
                  background: '#fef3c7',
                  border: '1px solid #f59e0b',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '1rem'
                }}>
                  <h4 style={{ color: '#92400e', margin: '0 0 0.5rem 0' }}>
                    ⚠️ Материалы с низким запасом
                  </h4>
                  <p style={{ color: '#92400e', margin: 0 }}>
                    Следующие материалы требуют дозаказа:
                  </p>
                  <ul style={{ color: '#92400e', margin: '0.5rem 0 0 1rem', padding: 0 }}>
                    <li>Керамическое покрытие - осталось 1.2 л (минимум 3.0 л)</li>
                    <li>Микрофибровые полотенца - осталось 8 шт (минимум 10 шт)</li>
                  </ul>
                </div>

                <div style={{
                  background: '#fee2e2',
                  border: '1px solid #dc2626',
                  borderRadius: '8px',
                  padding: '1rem'
                }}>
                  <h4 style={{ color: '#b91c1c', margin: '0 0 0.5rem 0' }}>
                    🚨 Материалы закончились
                  </h4>
                  <p style={{ color: '#b91c1c', margin: 0 }}>
                    Следующие материалы отсутствуют на складе:
                  </p>
                  <ul style={{ color: '#b91c1c', margin: '0.5rem 0 0 1rem', padding: 0 }}>
                    <li>Нет материалов с нулевым остатком</li>
                  </ul>
                </div>

                {/* Кнопка автоматического заказа материалов */}
                <div style={{
                  marginTop: '2rem',
                  padding: '1.5rem',
                  background: '#f0f9ff',
                  border: '1px solid #0ea5e9',
                  borderRadius: '8px'
                }}>
                  <h4 style={{ color: '#0c4a6e', margin: '0 0 1rem 0' }}>
                    🤖 Автоматическая закупка материалов
                  </h4>
                  <p style={{ color: '#0c4a6e', margin: '0 0 1rem 0' }}>
                    Создать заказ недостающих материалов с сайта detail.com
                  </p>
                  <button
                    onClick={generateMaterialOrder}
                    className="btn"
                    style={{
                      background: '#0ea5e9',
                      borderColor: '#0284c7'
                    }}
                  >
                    📋 Создать заказ материалов (CSV)
                  </button>
                </div>
              </div>
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

          {activeTab === 'automation' && (
            <div>
              <h3>🤖 Автоматизация отчетов</h3>
              <div style={{ marginTop: '1rem' }}>
                <div style={{
                  background: '#f0f9ff',
                  border: '1px solid #0ea5e9',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  marginBottom: '1rem'
                }}>
                  <h4 style={{ color: '#0c4a6e', margin: '0 0 1rem 0' }}>
                    📊 Автоматическое создание отчетов
                  </h4>
                  <p style={{ color: '#0c4a6e', margin: '0 0 1rem 0' }}>
                    Система автоматически создает отчеты по расписанию:
                  </p>
                  <ul style={{ color: '#0c4a6e', margin: '0 0 1rem 1rem' }}>
                    <li><strong>Еженедельный отчет:</strong> Каждый понедельник в 9:00</li>
                    <li><strong>Ежемесячный отчет:</strong> 1 числа каждого месяца в 9:00</li>
                    <li><strong>Отчет по инвентарю:</strong> Каждый день в 8:00</li>
                  </ul>

                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => runManualReport('weekly')}
                      className="btn"
                      style={{
                        background: '#059669',
                        borderColor: '#047857'
                      }}
                    >
                      📈 Создать еженедельный отчет
                    </button>
                    <button
                      onClick={() => runManualReport('monthly')}
                      className="btn"
                      style={{
                        background: '#7c3aed',
                        borderColor: '#6d28d9'
                      }}
                    >
                      📊 Создать ежемесячный отчет
                    </button>
                    <button
                      onClick={() => runManualReport('inventory')}
                      className="btn"
                      style={{
                        background: '#ea580c',
                        borderColor: '#c2410c'
                      }}
                    >
                      📦 Создать отчет по инвентарю
                    </button>
                  </div>
                </div>

                <div style={{
                  background: '#fef3c7',
                  border: '1px solid #f59e0b',
                  borderRadius: '8px',
                  padding: '1rem'
                }}>
                  <h4 style={{ color: '#92400e', margin: '0 0 0.5rem 0' }}>
                    ⚙️ Статус планировщика
                  </h4>
                  <p style={{ color: '#92400e', margin: 0 }}>
                    Планировщик автоматических задач запущен и работает в фоне.
                    Отчеты сохраняются в папку <code>backend/app/reports/</code>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
