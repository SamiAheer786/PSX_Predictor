import CompanyOverview from './pages/CompanyOverview';

function App() {
    return (
        <div className="min-h-screen bg-slate-900 text-slate-100">
            <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-blue-500 tracking-tight">AskAnalyst</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold tracking-wider">CLONE</span>
                    </div>
                    <div className="text-sm text-slate-400">PKR Market Data</div>
                </div>
            </nav>
            <CompanyOverview />
        </div>
    );
}

export default App;
