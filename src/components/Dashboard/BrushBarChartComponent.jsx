import React, { PureComponent } from 'react';
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

const data = [
  { name: '1', ordenes: 300, paquetes: 456 },
  { name: '2', ordenes: 145, paquetes: 230 },
  { name: '3', ordenes: 100, paquetes: 345 },
  { name: '4', ordenes: 8, paquetes: 450 },
  { name: '5', ordenes: 100, paquetes: 321 },
  { name: '6', ordenes: 9, paquetes: 235 },
  { name: '7', ordenes: 53, paquetes: 267 },
  { name: '8', ordenes: 252, paquetes: 378 },
  { name: '9', ordenes: 79, paquetes: 210 },
  { name: '10', ordenes: 294, paquetes: 23 },
  { name: '12', ordenes: 43, paquetes: 45 },
  { name: '13', ordenes: 74, paquetes: 90 },
  { name: '14', ordenes: 71, paquetes: 130 },
  { name: '15', ordenes: 117, paquetes: 11 },
  { name: '16', ordenes: 186, paquetes: 107 },
  { name: '17', ordenes: 16, paquetes: 450 },
  { name: '18', ordenes: 125, paquetes: 400 },
  { name: '19', ordenes: 222, paquetes: 366 },
  { name: '20', ordenes: 372, paquetes: 486 },
  { name: '21', ordenes: 182, paquetes: 512 },
  { name: '22', ordenes: 164, paquetes: 302 },
  { name: '23', ordenes: 316, paquetes: 425 },
  { name: '24', ordenes: 131, paquetes: 467 },
  { name: '25', ordenes: 291, paquetes: 190 },
  { name: '26', ordenes: 47, paquetes: 194 },
  { name: '27', ordenes: 415, paquetes: 371 },
  { name: '28', ordenes: 182, paquetes: 376 },
  { name: '29', ordenes: 93, paquetes: 295 },
  { name: '30', ordenes: 99, paquetes: 322 },
  { name: '31', ordenes: 52, paquetes: 246 },
];

export default class ExampleBarChart extends PureComponent {
  render() {
    return (
      <div style={{ width: '100%', height: '400px' }}> {/* Ajusta el tamaño aquí */}
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            width={500}
            height={300}
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend verticalAlign="top" wrapperStyle={{ lineHeight: '40px' }} />
            <ReferenceLine y={0} stroke="#000" />
            <Brush dataKey="name" height={30} stroke="#8884d8" />
            <Bar dataKey="ordenes" fill="#8884d8" />
            <Bar dataKey="paquetes" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }
}
