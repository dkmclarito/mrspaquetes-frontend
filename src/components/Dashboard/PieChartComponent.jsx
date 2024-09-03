import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardBody, CardTitle } from 'reactstrap';

const defaultData = [
  { estado: 'Normal', cantidad: 60 },
  { estado: 'Express', cantidad: 25 }
];

const PieChartComponent = ({ data = defaultData }) => {
  const formattedData = Array.isArray(data) && data.length > 0 ? data : defaultData;

  const COLORS = ['#FFBB28', '#0088FE', '#FFBB28'];

  return (
    <Card>
      <CardBody>
        <CardTitle tag="h5">Tipos de Ordenes</CardTitle>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={formattedData}
              dataKey="cantidad"
              nameKey="estado"
              outerRadius={100}
              fill="#8884d8"
              label              
            >
              {formattedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip/>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
};

export default PieChartComponent;
