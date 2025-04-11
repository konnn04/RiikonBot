import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faHome, faGauge, faGear, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import '../styles/header.css';

export default function Header() {
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await axios.get('/auth/logout', { withCredentials: true });
      window.location.href = '/'; // Full page reload to clear auth state
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  return (
    <header>
      <Navbar expand="lg" variant="dark" className="navbar-custom">
        <Container>
          <Navbar.Brand as={Link} to="/" className="navbar-brand-gradient">
            <FontAwesomeIcon icon={faRobot} className="me-2" />
            RiikonBot
          </Navbar.Brand>
          
          <Navbar.Toggle aria-controls="navbarNav" />
          
          <Navbar.Collapse id="navbarNav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">
                <FontAwesomeIcon icon={faHome} className="me-1" />
                Home
              </Nav.Link>
              <Nav.Link as={Link} to="/dashboard">
                <FontAwesomeIcon icon={faGauge} className="me-1" />
                Dashboard
              </Nav.Link>
              {isAdmin && (
                <Nav.Link as={Link} to="/admin">
                  <FontAwesomeIcon icon={faGear} className="me-1" />
                  Admin
                </Nav.Link>
              )}
            </Nav>
            
            <div className="d-flex align-items-center">
              {currentUser ? (
                <Dropdown>
                  <Dropdown.Toggle as="a" className="dropdown-toggle d-flex align-items-center text-light text-decoration-none" id="userDropdown">
                    {currentUser.avatar ? (
                      <img 
                        src={`https://cdn.discordapp.com/avatars/${currentUser.discordId}/${currentUser.avatar}.png`}
                        className="rounded-circle me-2" 
                        width="32" 
                        height="32" 
                        alt="Avatar" 
                      />
                    ) : (
                      <div className="rounded-circle me-2 d-flex align-items-center justify-content-center user-avatar">
                        {currentUser.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {currentUser.username}
                  </Dropdown.Toggle>
                  
                  <Dropdown.Menu variant="dark" align="end">
                    <Dropdown.Item as={Link} to="/dashboard">
                      <FontAwesomeIcon icon={faGauge} className="me-2" />
                      Dashboard
                    </Dropdown.Item>
                    
                    {isAdmin && (
                      <>
                        <Dropdown.Item as={Link} to="/admin">
                          <FontAwesomeIcon icon={faGear} className="me-2" />
                          Admin Panel
                        </Dropdown.Item>
                        <Dropdown.Divider />
                      </>
                    )}
                    
                    <Dropdown.Item onClick={handleLogout}>
                      <FontAwesomeIcon icon={faRightFromBracket} className="me-2" />
                      Logout
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <a href="/auth/login" className="btn btn-outline-light">
                  <i className="bi bi-discord me-2"></i>
                  Login with Discord
                </a>
              )}
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
}
