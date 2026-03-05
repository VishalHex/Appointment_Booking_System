import React from 'react';

export default function FormField({ label, error, children }) {
  return (
    <div className="form-field">
      {label && <label>{label}</label>}
      {children}
      {error && <div className="form-error">{error}</div>}
    </div>
  );
}
