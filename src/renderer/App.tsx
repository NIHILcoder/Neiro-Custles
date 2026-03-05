// src/renderer/App.tsx
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Home }       from './pages/Home';
import { Persona }    from './pages/Persona';
import { Vault }      from './pages/Vault';
import { SelfEditor } from './pages/SelfEditor';

export function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/"            element={<Navigate to="/home" replace />} />
          <Route path="/home"        element={<Home />} />
          <Route path="/persona"     element={<Persona />} />
          <Route path="/vault"       element={<Vault />} />
          <Route path="/self-editor" element={<SelfEditor />} />
          <Route path="*"            element={<Navigate to="/home" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}
