import { useState, useEffect } from "react";
import { employeesAPI } from "../services/api";
import "./Employees.css";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const response = await employeesAPI.getAll();
      setEmployees(response.data);
    } catch (error) {
      console.error("Failed to load employees:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <div className="employees-page">
      <div className="page-header">
        <h1>Сотрудники</h1>
        <p>Управление персоналом</p>
      </div>

      <div className="employees-list">
        {employees.map((employee) => (
          <div key={employee.id} className="employee-card">
            <div className="employee-avatar">
              {employee.avatar ? (
                <img src={employee.avatar} alt={employee.first_name} />
              ) : (
                <div className="avatar-placeholder">
                  {employee.first_name[0]}
                  {employee.last_name[0]}
                </div>
              )}
            </div>
            <div className="employee-info">
              <h3>
                {employee.first_name} {employee.last_name}
              </h3>
              <p className="employee-role">{employee.role_display}</p>
              <p className="employee-phone">{employee.phone}</p>
              <p className="employee-email">{employee.email}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
