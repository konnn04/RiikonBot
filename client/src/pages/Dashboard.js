import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Button } from 'react-bootstrap';
import axios from 'axios';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faActivity, faBox, faGear, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import '../styles/dashboard.css';

export default function Dashboard() {
  const [packages, setPackages] = useState([]);
  const [botStatus, setBotStatus] = useState({
    uptime: 0,
    serverCount: 0,
    status: 'online'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/dashboard', { withCredentials: true });
        setPackages(response.data.packages);
        setBotStatus(response.data.botStatus);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center mt-5"><div className="spinner-border text-light" role="status"></div></div>;
  }

  return (
    <>
      <h1 className="mb-4"><span className="text-gradient">Dashboard</span></h1>
      
      <Row className="mt-4">
        <Col md={4}>
          <Card 
            title={
              <div className="d-flex align-items-center">
                <FontAwesomeIcon icon={faActivity} className="me-2" />
                Bot Status
              </div>
            }
            content={
              <>
                <div className="d-flex justify-content-between mb-3">
                  <span><strong>Status:</strong></span>
                  <Badge type="bg-success">Online</Badge>
                </div>
                <div className="d-flex justify-content-between mb-3">
                  <span><strong>Uptime:</strong></span>
                  <span>{Math.floor(botStatus.uptime / 3600000)}h {Math.floor((botStatus.uptime % 3600000) / 60000)}m</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span><strong>Servers:</strong></span>
                  <Badge type="bg-primary">{botStatus.serverCount}</Badge>
                </div>
              </>
            }
            extraClasses="mb-4"
          />
        </Col>
        
        <Col md={8}>
          <Card
            title={
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faBox} className="me-2" />
                  <h5 className="mb-0">Installed Packages</h5>
                </div>
              </div>
            }
            content={
              packages && packages.length > 0 ? (
                <div className="list-group">
                  {packages.map(pkg => (
                    <div key={pkg.name} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-1 text-gradient">{pkg.name}</h6>
                        <p className="mb-1 text-secondary small">{pkg.description}</p>
                      </div>
                      <div className="d-flex gap-2">
                        {pkg.enabled && pkg.hasWebRoutes && (
                          <Link to={`/packages/${pkg.name}`} className="btn btn-sm btn-primary">
                            <FontAwesomeIcon icon={faGear} className="me-1" /> Configure
                          </Link>
                        )}
                        <Link to={`/packages/${pkg.name}`} className="btn btn-sm btn-outline-light">
                          <FontAwesomeIcon icon={faInfoCircle} className="me-1" /> Details
                        </Link>
                        <Badge type={pkg.enabled ? 'bg-success' : 'bg-secondary'}>
                          {pkg.enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-4">
                  <FontAwesomeIcon icon={faBox} className="fs-1 text-secondary mb-3" />
                  <p className="text-secondary">No packages installed</p>
                  <Link to="/admin" className="btn btn-primary btn-sm">Install Packages</Link>
                </div>
              )
            }
          />
        </Col>
      </Row>
    </>
  );
}
