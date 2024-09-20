import React, { useEffect, useState } from 'react';
import { useParams, useNavigate  } from 'react-router-dom';
import { Spinner, Alert, Container, Row, Col, Card, CardBody, CardTitle, ListGroup, ListGroupItem, Button } from 'reactstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = import.meta.env.VITE_API_URL;

const PaquetesTrackingScreen = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [paquetes, setPaquetes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async (url, options) => {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        return await response.json();
    };

    const mapPaquetesToTimeline = (paquetes) => {
        const groupedPaquetes = paquetes.reduce((acc, paquete) => {
            const date = new Date(paquete.fecha_movimiento).setHours(0, 0, 0, 0);
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push({
                title: paquete.estado,
                subtitle: paquete.numero_ingreso,
                date: new Date(paquete.fecha_movimiento).getTime(),
            });
            return acc;
        }, {});

        return Object.keys(groupedPaquetes).map(date => ({
            date: parseInt(date, 10),
            data: groupedPaquetes[date],
        }));
    };

    useEffect(() => {
        const getPaquetes = async () => {
            try {
                const response = await fetchData(
                    `${API_URL}/paquete/tracking-paquete/${id}`,
                    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                );
                const timelineData = mapPaquetesToTimeline(response);
                setPaquetes(timelineData);
            } catch (error) {
                setError("No tienes órdenes disponibles!");
                toast.error(error.message);
            } finally {
                setLoading(false);
            }
        };
        getPaquetes();
    }, [id]);

    if (loading) {
        return <Spinner color="primary" />;
    }

    return (
        <Container>
            <Row>
                <Col>
                    {error && <Alert color="danger">{error}</Alert>}
                    {paquetes.map((item, index) => (
                        <Card key={index} style={{ marginBottom: '1rem' }}>
                            <CardBody>
                                <CardTitle tag="h5">Fecha: {new Date(item.date).toLocaleDateString()}</CardTitle>
                                <ListGroup>
                                    {item.data.map((paquete, idx) => (
                                        <ListGroupItem key={idx}>
                                            <strong>{paquete.title}</strong> - {paquete.subtitle}
                                        </ListGroupItem>
                                    ))}
                                </ListGroup>
                            </CardBody>
                        </Card>
                    ))}
                </Col>
            </Row>
            <Button color="primary" onClick={() => navigate('/TrackingPage')} style={{ marginTop: '1rem' }}>
                Regresar
            </Button>
            <ToastContainer />
        </Container>
    );
};

export default PaquetesTrackingScreen;
