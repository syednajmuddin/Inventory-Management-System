import React, { useState } from 'react';
import { getSalesInsights } from '../../services/geminiService';
import type { Product, Sale } from '../../types';
import Spinner from '../shared/Spinner';

const AIInsightsView: React.FC<{ products: Product[]; sales: Sale[] }> = ({ products, sales }) => {
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const popularQueries = [
        "What's our most popular main course?",
        "Which appetizer is the top seller?",
        "Compare sales of drinks vs desserts.",
        "What were the total sales last Tuesday?",
    ];

    const handleQuerySubmit = async (e: React.FormEvent, q: string = query) => {
        e.preventDefault();
        if (!q.trim()) return;

        setIsLoading(true);
        setError('');
        setResponse('');
        try {
            const result = await getSalesInsights(q, products, sales);
            setResponse(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setIsLoading(false);
            setQuery('');
        }
    };
    
    const handlePopularQueryClick = (q: string) => {
        setQuery(q);
        handleQuerySubmit(new Event('submit') as unknown as React.FormEvent, q);
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg h-full flex flex-col">
            <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">AI Sales Insights</h1>
            <p className="mb-6 text-gray-600 dark:text-gray-400">Ask a question about your sales data in plain English.</p>
            
            <div className="flex flex-wrap gap-2 mb-6">
                {popularQueries.map(q => (
                    <button 
                        key={q}
                        onClick={() => handlePopularQueryClick(q)}
                        className="bg-gray-200 dark:bg-gray-700 text-sm px-3 py-1 rounded-full hover:bg-primary hover:text-white dark:hover:bg-indigo-600 transition-colors"
                    >
                        {q}
                    </button>
                ))}
            </div>

            <div className="flex-grow bg-gray-50 dark:bg-gray-900 rounded-lg p-4 overflow-y-auto mb-6">
                {isLoading && <Spinner />}
                {error && <p className="text-red-500">{error}</p>}
                {response && <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">{response}</div>}
                {!isLoading && !response && !error && <p className="text-gray-400 text-center">Your insights will appear here...</p>}
            </div>

            <form onSubmit={handleQuerySubmit} className="flex gap-4">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g., How much did we sell yesterday?"
                    className="flex-grow p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                    disabled={isLoading}
                />
                <button 
                    type="submit" 
                    className="bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-opacity-80 transition-colors disabled:bg-opacity-40"
                    disabled={isLoading}
                >
                    {isLoading ? 'Thinking...' : 'Ask'}
                </button>
            </form>
        </div>
    );
};

export default AIInsightsView;