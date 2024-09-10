import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import AuthService from '../../services/authService';

const API_URL = import.meta.env.VITE_API_URL;

const BarChartComponent = () => {
  const [LaUnion, setLaUnion] = useState(0);
  const [Morazan, setMorazan] = useState(0);
  const [SanMiguel, setSanMiguel] = useState(0);
  const [Usulutan, setUsulutan] = useState(0);

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const token = AuthService.getCurrentUser();

        const Envios = await axios.get(`${API_URL}/dashboard/delivered_by_department`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        //console.log('Datos del Dashboard:', Envios.data.departamentos[0].paquetes);

        setLaUnion(Envios.data.departamentos[0].paquetes);
        setMorazan(Envios.data.departamentos[1].paquetes);
        setSanMiguel(Envios.data.departamentos[2].paquetes);
        setUsulutan(Envios.data.departamentos[3].paquetes);
        
      } catch (error) {
        console.error("Error al obtener los datos:", error);
      }
    };

    fetchDatos();
  }, []);

  const data = [
    { name: 'Usulután', paquetes: Usulutan },
    { name: 'San Miguel', paquetes: SanMiguel },
    { name: 'Morazán', paquetes: Morazan },
    { name: 'La Unión', paquetes: LaUnion }
  ];

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
