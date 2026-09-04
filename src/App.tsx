import React, { useState, useEffect } from 'react';
import { BackgroundGrid } from './components/BackgroundGrid.js';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';

// Pages
import { HomePage } from './pages/HomePage.js';
import { PricingPage } from './pages/PricingPage.js';
import { CustomPlanPage } from './pages/CustomPlanPage.js';
import { FeaturesPage } from './pages/FeaturesPage.js';
import { TeamPage } from './pages/TeamPage.js';
import { LocationsPage } from './pages/LocationsPage.js';
import { SupportPage } from './pages/SupportPage.js';
import { CheckoutPage } from './pages/CheckoutPage.js';
import { PaymentPage } from './pages/PaymentPage.js';
import { AdminLoginPage } from './pages/AdminLoginPage.js';
import { ServerControlPage } from './pages/ServerControlPage.js';
import { AdminOperationsPage } from './pages/AdminOperationsPage.js';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [navState, setNavState] = useState<any>(null);

  // Sync hash routing if desired or state routing
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname || '/';
      setCurrentPath(path);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (path: string, state?: any) => {
    setNavState(state || null);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContent = () => {
    // 1. Dynamic Server Control Page: /dashboard/servers/:id
    if (currentPath.startsWith('/dashboard/servers/')) {
      const serverId = currentPath.replace('/dashboard/servers/', '');
      return <ServerControlPage serverId={serverId} onNavigate={handleNavigate} />;
    }

    // 2. Dynamic Payment Page: /payment/:id
    if (currentPath.startsWith('/payment/')) {
      const orderId = currentPath.replace('/payment/', '');
      return <PaymentPage orderId={orderId} onNavigate={handleNavigate} />;
    }

    // 3. Static & Dashboard Routes
    switch (currentPath) {
      case '/':
        return <HomePage onNavigate={handleNavigate} />;
      case '/pricing':
        return <PricingPage onNavigate={handleNavigate} />;
      case '/custom-plan':
        return <CustomPlanPage onNavigate={handleNavigate} />;
      case '/features':
        return <FeaturesPage onNavigate={handleNavigate} />;
      case '/team':
        return <TeamPage onNavigate={handleNavigate} />;
      case '/locations':
        return <LocationsPage onNavigate={handleNavigate} />;
      case '/support':
        return <SupportPage onNavigate={handleNavigate} />;
      case '/checkout':
        return <CheckoutPage initialState={navState} onNavigate={handleNavigate} />;
      case '/admin-login':
        return <AdminLoginPage onNavigate={handleNavigate} />;
      case '/admin':
        return <AdminOperationsPage onNavigate={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col selection:bg-[#FF5500] selection:text-white">
      <BackgroundGrid />
      <Navbar currentPath={currentPath} onNavigate={handleNavigate} />
      <main className="flex-1 z-10">{renderContent()}</main>
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
