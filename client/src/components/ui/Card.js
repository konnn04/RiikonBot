import React from 'react';
import { Card as BootstrapCard } from 'react-bootstrap';
import styled from 'styled-components';

const StyledCard = styled(BootstrapCard)`
  background-color: var(--dark-card);
  border: 1px solid var(--dark-border);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  }
  
  .card-header {
    background-color: rgba(0, 0, 0, 0.2);
    border-bottom: 1px solid var(--dark-border);
  }
`;

export default function Card({ title, content, footer, extraClasses = '' }) {
  return (
    <StyledCard className={extraClasses}>
      {title && (
        <BootstrapCard.Header>
          <h5 className="mb-0">{title}</h5>
        </BootstrapCard.Header>
      )}
      <BootstrapCard.Body>
        {content}
      </BootstrapCard.Body>
      {footer && (
        <BootstrapCard.Footer>
          {footer}
        </BootstrapCard.Footer>
      )}
    </StyledCard>
  );
}
