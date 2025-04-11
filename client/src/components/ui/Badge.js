import React from 'react';
import styled from 'styled-components';

const StyledBadge = styled.span`
  font-weight: 500;
  padding: 0.5em 0.8em;
  
  &.bg-success {
    background: linear-gradient(135deg, #10b981, #059669) !important;
  }
  
  &.bg-secondary {
    background: linear-gradient(135deg, #64748b, #475569) !important;
  }
  
  &.bg-primary {
    background: linear-gradient(135deg, #6d28d9, #8b5cf6) !important;
  }
`;

export default function Badge({ type = 'bg-primary', extraClasses = '', children }) {
  return (
    <StyledBadge className={`badge ${type} ${extraClasses}`}>
      {children}
    </StyledBadge>
  );
}
