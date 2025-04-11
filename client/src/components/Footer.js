import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faDiscord, faTwitter } from '@fortawesome/free-brands-svg-icons';
import '../styles/footer.css';

export default function Footer() {
  return (
    <footer className="py-4 mt-5 bg-black text-center text-light">
      <Container>
        <Row>
          <Col md={4} className="mb-3 mb-md-0">
            <h5 className="text-gradient">RiikonBot</h5>
            <p className="text-secondary mb-0">A modular Discord bot with extensible package management</p>
          </Col>
          
          <Col md={4} className="mb-3 mb-md-0">
            <h5 className="text-gradient">Quick Links</h5>
            <ul className="list-unstyled">
              <li><Link to="/" className="text-decoration-none text-secondary">Home</Link></li>
              <li><Link to="/dashboard" className="text-decoration-none text-secondary">Dashboard</Link></li>
              <li><Link to="/admin" className="text-decoration-none text-secondary">Admin Panel</Link></li>
            </ul>
          </Col>
          
          <Col md={4}>
            <h5 className="text-gradient">Connect</h5>
            <div className="d-flex justify-content-center">
              <a href="#" className="text-light mx-2">
                <FontAwesomeIcon icon={faGithub} className="fs-4" />
              </a>
              <a href="#" className="text-light mx-2">
                <FontAwesomeIcon icon={faDiscord} className="fs-4" />
              </a>
              <a href="#" className="text-light mx-2">
                <FontAwesomeIcon icon={faTwitter} className="fs-4" />
              </a>
            </div>
          </Col>
        </Row>
        
        <div className="border-top border-secondary mt-4 pt-3">
          <p className="mb-0 text-secondary">
            RiikonBot &copy; {new Date().getFullYear()} | Created by Riikon Team
          </p>
        </div>
      </Container>
    </footer>
  );
}
