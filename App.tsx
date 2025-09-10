import React, { useState, useEffect, useCallback } from 'react';
import { View, Product, Sale } from './types';
import dbService from './services/mockDbService';
import POSView from './components/pos/POSView';
import InventoryView from './components/inventory/InventoryView';
import ReportsView from './components/reports/ReportsView';
import AIInsightsView from './components/ai/AIInsightsView';
import Spinner from './components/shared/Spinner';
import { PosIcon, InventoryIcon, ReportsIcon, AIIcon } from './components/shared/Icons';

const NavItem: React.FC<{
  view: View;
  currentView: View;
  setView: (view: View) => void;
  icon: React.ReactNode;
}> = ({ view, currentView, setView, icon }) => (
  <button
    onClick={() => setView(view)}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left transition-colors ${
      currentView === view
        ? 'bg-primary text-white shadow-md'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
    }`}
  >
    {icon}
    <span className="font-semibold">{view}</span>
  </button>
);

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.POS);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
        const [productsData, salesData] = await Promise.all([
            dbService.getProducts(),
            dbService.getSales(),
        ]);
        setProducts(productsData);
        setSales(salesData);
    } catch (error) {
        console.error("Failed to fetch data:", error);
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderView = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-full">
          <Spinner />
        </div>
      );
    }

    switch (currentView) {
      case View.POS:
        return <POSView products={products} onSaleComplete={fetchData} />;
      case View.Inventory:
        return <InventoryView products={products} onDataChange={fetchData} />;
      case View.Reports:
        return <ReportsView products={products} sales={sales} />;
      case View.AIInsights:
        return <AIInsightsView products={products} sales={sales} />;
      default:
        return <POSView products={products} onSaleComplete={fetchData}/>;
    }
  };

  return (
    <div className="flex h-screen bg-light dark:bg-dark text-gray-900 dark:text-gray-100 font-sans">
      <nav className="w-64 bg-white dark:bg-gray-800 p-4 flex flex-col shadow-lg">
        <div className="flex items-center gap-3 mb-8 px-2">
            <svg className="w-9 h-9 text-primary" viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 25 L80 25 L20 75 L80 75" stroke="currentColor" strokeWidth="12" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h1 className="text-2xl font-bold tracking-tight text-gray-800 dark:text-white">Zamzama</h1>
        </div>
        <div className="flex flex-col gap-2">
            <NavItem view={View.POS} currentView={currentView} setView={setCurrentView} icon={<PosIcon />} />
            <NavItem view={View.Inventory} currentView={currentView} setView={setCurrentView} icon={<InventoryIcon />} />
            <NavItem view={View.Reports} currentView={currentView} setView={setCurrentView} icon={<ReportsIcon />} />
            <NavItem view={View.AIInsights} currentView={currentView} setView={setCurrentView} icon={<AIIcon />} />
        </div>
        <div className="mt-auto text-center text-xs text-gray-400">
            <p>&copy; 2024 Zamzama Restaurant</p>
        </div>
      </nav>
      <main className="flex-1 p-6 overflow-hidden">
        {renderView()}
      </main>
    </div>
  );
};

export default App;