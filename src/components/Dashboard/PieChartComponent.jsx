import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardBody, CardTitle } from 'reactstrap';
import axios from 'axios';
import AuthService from '../../services/authService';

const API_URL = import.meta.env.VITE_API_URL;

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
    { estado: 'Normal', cantidad: Normal },
    { estado: 'Express', cantidad: Express }
  ];
 
  const formattedData = Array.isArray(data) && data.length > 0 ? data : defaultData;

  const COLORS = ['#FFBB28', '#0088FE', '#FFBB28'];

  return (
    <Card>
      <CardBody>
        <CardTitle style={{ textAlign: 'center' }} tag="h5">Tipos de Ordenes</CardTitle>
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
