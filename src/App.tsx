import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { MotionConfig } from 'motion/react';
import { RegimenProvider } from './context/RegimenContext';
import { CookieConsentProvider } from './context/CookieConsentContext';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { resolveRouterBasename } from './utils/assetUrl';

const routerBasename = resolveRouterBasename();

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter basename={routerBasename}>
        <CookieConsentProvider>
          <RegimenProvider>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route
                  path="/products"
                  element={<HomePage initialSection="products" />}
                />
                <Route
                  path="/products/:slug"
                  element={<ProductDetailPage />}
                />
                <Route
                  path="/responsible-use"
                  element={<HomePage initialSection="responsible-use" />}
                />
                <Route
                  path="/contact"
                  element={<HomePage initialSection="contact" />}
                />
                <Route
                  path="/consultations"
                  element={<HomePage initialSection="contact" />}
                />
                <Route
                  path="/disclaimer"
                  element={<HomePage initialSection="disclaimer" />}
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </RegimenProvider>
        </CookieConsentProvider>
      </BrowserRouter>
    </MotionConfig>
  );
}
