import React from 'react';
import logo from '../../assets/logo.png';
import { Container, Row, Col } from 'reactstrap';

const LoadingPage = () => {
  return (
    <div className="page-content">
        <Container fluid className="mt-4">   
            <Row>   
                <Col md="12" className="d-flex justify-content-center align-items-center">
                    <img src={logo} alt="Logo" style={styles.logo} />
                </Col>
            </Row>  
        </Container>
    </div>
  );
};

const styles = {
    logo: {
        width: '500px', 
      },
};
export default LoadingPage;
