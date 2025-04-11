import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Container } from 'react-bootstrap';
import '../styles/layout.css';

export default function MainLayout() {
  return (
    <div className="d-flex flex-column min-vh-100 bg-dark text-light">
      <Header />
      
      <main className="flex-grow-1">
        <Container className="py-4">
          <Outlet />
        </Container>
      </main>
      
      <Footer />
    </div>
  );
}
