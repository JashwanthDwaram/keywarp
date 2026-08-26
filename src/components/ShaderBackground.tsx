import React from 'react';

export const ShaderBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 bg-bg pointer-events-none" aria-hidden="true" />
  );
};
