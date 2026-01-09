import React from 'react';

export default function Layout({ children }) {
    return (
        <div className="app-container">
            <header className="app-header">
                <h1>40k Token Generator</h1>
                <p className="subtitle">List to STL Converter</p>
            </header>
            <main className="app-content">
                {children}
            </main>
            <footer className="app-footer">
                <p>Built for the Emperor</p>
            </footer>
        </div>
    );
}
