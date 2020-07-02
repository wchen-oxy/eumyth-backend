import React from 'react';
import { Container, Row, Col } from "react-bootstrap";
import DanteEditor from 'Dante2';

const dantet = () => {
  return (
    <Container>
      <Row>
        <Col sm={12} className="dante">
          <DanteEditor 
           
          />
        </Col>
      </Row>
    </Container>
  );
};

export default dantet;