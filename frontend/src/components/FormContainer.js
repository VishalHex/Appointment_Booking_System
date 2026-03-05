import React from 'react';
import './FormContainer.css';

export default function FormContainer({ children }) {
  return (
    <div className="form-container">
      {children}
    </div>
  );
}
