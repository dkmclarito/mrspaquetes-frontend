import React from 'react';
import { Card, CardBody, CardTitle, CardText, Badge, Row, Col } from 'reactstrap';

const DetailsCard = ({ title, description, iconName, typeCard, statusText, onPress }) => {
    const cardColors = {
        primary: '#04aad6',
        success: '#15b79f',
        danger: '#f04437',
        warning: '#fb9c0c',
        info: '#635bff',
        default: 'transparent',
    };

    const backgroundColor = cardColors[typeCard] || cardColors.default;

    return (
        <Row>
        <Col md="12" >
        <Card style={{ borderLeft: `6px solid ${backgroundColor}`, marginBottom: '1rem' }} onClick={onPress}>
            <CardBody>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    
                    <div style={{ flex: 1 }}>
                        <CardTitle style={{ textAlign: 'left' }} tag="h5">{title}</CardTitle>
                        {Array.isArray(description) ? (
                            description.map((item, index) => (
                                <CardText style={{ textAlign: 'left' }} key={index}>
                                    <strong>{item.key}:</strong> {item.value}
                                </CardText>
                            ))
                        ) : (
                            <CardText>{description}</CardText>
                        )}
                    </div>
                </div>
                {statusText && (
                    <Badge color={typeCard} style={{ float: 'right' }}>
                        {statusText}
                    </Badge>
                )}
            </CardBody>
        </Card>
        </Col>
        </Row>
    );
};

export default DetailsCard;