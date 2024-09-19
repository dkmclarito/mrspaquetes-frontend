import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardBody, CardTitle } from 'reactstrap';
import axios from 'axios';
import AuthService from '../../services/authService';
import '../Dashboard/Dashboard.css'

const API_URL = import.meta.env.VITE_API_URL;

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p>{`${payload[0].name} : ${payload[0].value}`}</p>
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

const PieChartComponent = () => {
  const [Normal, setNormal] = useState(0);
  const [Express, setExpress] = useState(0);

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const token = AuthService.getCurrentUser();

        const TipoNormal = await axios.get(`${API_URL}/ordenes`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const ordenesNormales = TipoNormal.data.data.filter((orden) =>
          orden.detalles.every(
            (detalle) => detalle.tipo_entrega === "Entrega Normal"
          )
        );
        
        const TipoExpress = await axios.get(`${API_URL}/ordenes`, {
          headers: { Authorization: `Bearer ${token}` },
        });       
  
        const ordenesExpress = TipoExpress.data.data.filter((orden) =>
          orden.detalles.some(
            (detalle) => detalle.tipo_entrega === "Entrega Express"
          )
        );

        //console.log('Datos del Dashboard:', Tipos.data.data.length);        
        setNormal(ordenesNormales.length);        
        setExpress(ordenesExpress.length);
        
      } catch (error) {
        console.error("Error al obtener los datos:", error);
      }
    };

    fetchDatos();
  }, []);

  const data = [
    { estado: 'Normal', cantidad: Normal || 0},
    { estado: 'Express', cantidad: Express || 0}
  ];
 
  const formattedData = Array.isArray(data) && data.length > 0 ? data : defaultData;

  const COLORS = ['#198754', '#0088FE', '#FFBB28'];

  return (
    <Card>
      <CardBody className='graficaPastel'>
        <CardTitle style={{ textAlign: 'center', fontSize: '20px' }} tag="h5">Tipos de Ordenes</CardTitle>
        <ResponsiveContainer width="100%" height={394}>
          <PieChart className='pieG'>
            <Pie
              data={formattedData}
              dataKey="cantidad"
              nameKey="estado"
              outerRadius={170}
              fill="#8884d8"
              label              
            >
              {formattedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />}/>
          </PieChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
};

export default PieChartComponent;
