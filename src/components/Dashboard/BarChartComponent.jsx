// src/components/Dashboard/BarChartComponent.jsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Datos de ejemplo
const data = [
  { name: 'Usulután', paquetes: 120 },
  { name: 'San Miguel', paquetes: 150 },
  { name: 'Morazán', paquetes: 100 },
  { name: 'La Unión', paquetes: 80 }
];

const BarChartComponent = () => {
  return (
    <div>
      <h2>Comparación de Envíos de Paquetes</h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="paquetes" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChartComponent;
