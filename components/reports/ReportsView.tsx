import React, { useMemo } from 'react';
import type { Product, Sale } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Metric Card Component
const MetricCard: React.FC<{ title: string; value: string | number; description: string }> = ({ title, value, description }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{description}</p>
    </div>
);

const ReportsView: React.FC<{ products: Product[]; sales: Sale[] }> = ({ products, sales }) => {

    const reportData = useMemo(() => {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        const salesToday = sales.filter(s => s.timestamp.startsWith(todayStr));
        const totalSalesToday = salesToday.length;
        const totalRevenueToday = salesToday.reduce((acc, sale) => acc + sale.total, 0);

        // Sales by day for chart
        const salesByDay: { [key: string]: { sales: number; revenue: number } } = {};
        sales.forEach(sale => {
            const day = new Date(sale.timestamp).toLocaleDateString('en-US', { weekday: 'short' });
            if (!salesByDay[day]) {
                salesByDay[day] = { sales: 0, revenue: 0 };
            }
            salesByDay[day].sales += 1;
            salesByDay[day].revenue += sale.total;
        });
        
        const chartData = Object.entries(salesByDay).map(([name, value]) => ({ name, ...value })).reverse();

        // Top selling products
        const productSales: { [key:string]: { quantity: number; name: string } } = {};
        sales.forEach(sale => {
            sale.items.forEach(item => {
                const product = products.find(p => p.id === item.productId);
                if (product) {
                    if (!productSales[item.productId]) {
                        productSales[item.productId] = { quantity: 0, name: product.name };
                    }
                    productSales[item.productId].quantity += item.quantity;
                }
            });
        });
        const topSellingProducts = Object.values(productSales).sort((a, b) => b.quantity - a.quantity).slice(0, 5);

        // Low stock products
        const lowStockProducts = products.filter(p => p.stock <= 10).sort((a,b) => a.stock - b.stock);

        return { totalSalesToday, totalRevenueToday, chartData, topSellingProducts, lowStockProducts };
    }, [products, sales]);

    return (
        <div className="p-6 bg-gray-100 dark:bg-gray-900 rounded-lg h-full overflow-y-auto">
            <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Reports & Analytics</h1>
            
            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <MetricCard title="Total Sales Today" value={reportData.totalSalesToday} description="Number of transactions today."/>
                <MetricCard title="Total Revenue Today" value={`$${reportData.totalRevenueToday.toFixed(2)}`} description="Total income from sales today."/>
            </div>
            
            {/* Sales Chart */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
                 <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Daily Sales Performance</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportData.chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" orientation="left" stroke="#2c3e50" />
                        <YAxis yAxisId="right" orientation="right" stroke="#f39c12" />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="revenue" fill="#2c3e50" name="Revenue ($)" />
                        <Bar yAxisId="right" dataKey="sales" fill="#f39c12" name="Sales (Count)" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Top Selling & Low Stock */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Top Selling Products</h2>
                    <ul>
                        {reportData.topSellingProducts.map(p => (
                            <li key={p.name} className="flex justify-between py-2 border-b dark:border-gray-700">
                                <span className="text-gray-700 dark:text-gray-300">{p.name}</span>
                                <span className="font-semibold text-gray-900 dark:text-white">{p.quantity} sold</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Low Stock Alerts</h2>
                     <ul>
                        {reportData.lowStockProducts.map(p => (
                            <li key={p.id} className="flex justify-between py-2 border-b dark:border-gray-700">
                                <span className="text-gray-700 dark:text-gray-300">{p.name}</span>
                                <span className="font-semibold text-red-500">{p.stock} remaining</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ReportsView;