import React from 'react';
import ReactDOM from 'react-dom/client';
import { SharedLayout } from './components/Global'

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <SharedLayout></SharedLayout>
  </React.StrictMode>
);
