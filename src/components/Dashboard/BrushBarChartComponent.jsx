import React, { PureComponent,useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  Brush,
  ReferenceLine,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import axios from 'axios';
import AuthService from '../../services/authService';

const API_URL = import.meta.env.VITE_API_URL;

const CustomTooltip2 = ({ active, payload }) => {
  
  if (active && payload && payload.length) {
    const day = payload[0].payload.name; // Día
    const ordenes = payload[0].value; // Órdenes
    const paquetes = payload[1] ? payload[1].value : 0;    

    return (
      <div className="custom-tooltip2">
        <p>{`Día: ${day}`}</p>
        <p>{`Órdenes: ${ordenes}`}</p>
        <p>{`Paquetes: ${paquetes}`}</p>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }) => {
  return (
    <div className="custom-legend">
      {payload.map((entry, index) => (
        <div key={`item-${index}`} className="legend-item">
          <span className="legend-color" style={{ backgroundColor: entry.color }} />
          {entry.value}
        </div>
      ))}
    </div>
  );
};

const ExampleBarChart = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const token = AuthService.getCurrentUser();

        const response = await axios.get(`${API_URL}/dashboard/orders_by_day`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const formattedData = response.data.orders.map((order) => {
          const fecha = new Date(order.fecha);
          const day = fecha.getUTCDate();
          const month = fecha.getUTCMonth() + 1;

          return {
            name: `${day}`,
            fecha: order.fecha,
            month: month,
            year: fecha.getUTCFullYear(),
            ordenes: order.ordenes,
            paquetes: order.paquetes,
          };
        });

        setData(formattedData);
        generateDataForMonth(formattedData, selectedMonth, selectedYear);
      } catch (error) {
        console.error("Error al obtener los datos:", error);
      }
    };

    fetchDatos();
  }, [selectedMonth, selectedYear]);

  const getDaysInMonth = (month, year) => {
    return new Date(year, month, 0).getUTCDate();
  };


  const generateDataForMonth = (data, month, year) => {
    const daysInMonth = getDaysInMonth(month, year);
    const completeData = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dayData = data.find(item => {
        const itemDate = new Date(item.fecha);
        return (
          itemDate.getUTCDate() === day && 
          itemDate.getUTCMonth() + 1 === month && 
          itemDate.getUTCFullYear() === year
        );
      });

      completeData.push({
        name: `${day}`,
        ordenes: dayData ? dayData.ordenes : 0,
        paquetes: dayData ? dayData.paquetes : 0,
      });
    }

    setFilteredData(completeData);
  };

  const handleMonthChange = (event) => {
    const month = parseInt(event.target.value);
    setSelectedMonth(month);
    generateDataForMonth(data, month, selectedYear);
  };

  const handleYearChange = (event) => {
    const year = parseInt(event.target.value);
    setSelectedYear(year);
    generateDataForMonth(data, selectedMonth, year);
  };

  return (
    <div>
      <h2 style={{ textAlign: 'center', fontSize: '20px', fontWeight: 'bold' }}>Órdenes y Paquetes</h2>

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <label htmlFor="month-select" style={{ marginRight: '10px' }}>Seleccionar Mes: </label>
        <select id="month-select" value={selectedMonth} onChange={handleMonthChange}>
          <option value="1">Enero</option>
          <option value="2">Febrero</option>
          <option value="3">Marzo</option>
          <option value="4">Abril</option>
          <option value="5">Mayo</option>
          <option value="6">Junio</option>
          <option value="7">Julio</option>
          <option value="8">Agosto</option>
          <option value="9">Septiembre</option>
          <option value="10">Octubre</option>
          <option value="11">Noviembre</option>
          <option value="12">Diciembre</option>
        </select>

        <label htmlFor="year-select" style={{ marginLeft: '20px',marginRight: '10px' }}>Seleccionar Año: </label>
        <select id="year-select" value={selectedYear} onChange={handleYearChange}>
          <option value={2024}>2024</option>
          <option value={2025}>2025</option>
        </select>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={filteredData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip content={<CustomTooltip2 />} />
          <Legend content={<CustomLegend />}/>
          <Brush dataKey="name" height={30} stroke="#1a2276" fill='#d1d1d1' />
          <Bar dataKey="ordenes" fill="#8884d8" />
          <Bar dataKey="paquetes" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ExampleBarChart;