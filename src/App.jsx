import React, { useState, useEffect } from 'react';
import { Wallet, ArrowDownUp, Plus, Minus, TrendingUp, Info, ExternalLink, Menu, X, Settings, ChevronDown, Clock, Search, Upload, Trash2, Copy, CheckCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// --- INTEGRASI WAGMI ---
import { useAccount, useConnect, useDisconnect, useSendTransactionSync, useBalance } from 'wagmi';

const TOKENS = {
  pathUSD: { address: '0x20c0000000000000000000000000000000000000', symbol: 'pathUSD', decimals: 6, logo: '💵' },
  alphaUSD: { address: '0x20c0000000000000000000000000000000000001', symbol: 'AlphaUSD', decimals: 6, logo: '🅰️' },
  betaUSD: { address: '0x20c0000000000000000000000000000000000002', symbol: 'BetaUSD', decimals: 6, logo: '🅱️' }
};

const generatePriceHistory = () => {
  const data = [];
  let price = 1.0;
  for (let i = 0; i < 24; i++) {
    price = price + (Math.random() - 0.5) * 0.01;
    data.push({ time: `${i}:00`, price: price.toFixed(4) });
  }
  return data;
};

function App() {
  // --- WAGMI HOOKS (Koneksi Wallet Asli) ---
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { sendTransactionSync } = useSendTransactionSync();
  const { data: balanceData } = useBalance({ address });

  // --- UI STATE ---
  const [activeTab, setActiveTab] = useState('swap');
  const [fromToken, setFromToken] = useState('pathUSD');
  const [toToken, setToToken] = useState('alphaUSD');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [priceHistory] = useState(generatePriceHistory());

  // Logika kalkulasi harga
  useEffect(() => {
    if (fromAmount && !isNaN(fromAmount)) {
      const output = parseFloat(fromAmount) * 0.997; 
      setToAmount(output.toFixed(6));
    } else {
      setToAmount('');
    }
  }, [fromAmount]);

  // --- FUNGSI KONEKSI WALLET ---
  const handleConnect = () => {
    // Cari connector 'injected' (MetaMask/Browser Wallet)
    const injectedConnector = connectors.find((c) => c.id === 'injected');
    if (injectedConnector) {
      connect({ connector: injectedConnector });
    } else {
      alert("Wallet tidak ditemukan. Silakan pasang MetaMask.");
    }
  };

  // --- FUNGSI SWAP (REAL BLOCKCHAIN CALL) ---
  const handleSwap = () => {
    if (!isConnected) {
      handleConnect();
      return;
    }

    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      alert('Masukkan jumlah token!');
      return;
    }

    try {
      // Mengirim transaksi ke blockchain melalui wallet (MetaMask)
      sendTransactionSync({
        calls: [
          {
            to: TOKENS[toToken].address,
            data: '0x', // Ganti dengan bytecode kontrak swap asli Anda nanti
            value: 0n,
          }
        ],
      });
      alert('Permintaan swap dikirim ke wallet Anda!');
    } catch (error) {
      console.error("Gagal swap:", error);
      alert('Gagal: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d111c] text-white font-sans">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-[120px] -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] top-1/3 -right-64 animate-pulse"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-gray-800/50 bg-[#0d111c]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-pink-500/20">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">Tempo DEX</span>
            </div>
            <nav className="hidden md:flex space-x-4">
              <button onClick={() => setActiveTab('swap')} className={`px-4 py-2 rounded-lg transition ${activeTab === 'swap' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'}`}>Swap</button>
              <button onClick={() => setActiveTab('liquidity')} className={`px-4 py-2 rounded-lg transition ${activeTab === 'liquidity' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'}`}>Liquidity</button>
            </nav>
          </div>

          <div className="flex items-center space-x-3">
            {isConnected ? (
              <div className="flex items-center space-x-2">
                <div className="hidden sm:block bg-gray-800/50 border border-gray-700/50 px-4 py-2 rounded-xl text-sm font-medium">
                  {balanceData?.formatted.slice(0, 6)} {balanceData?.symbol}
                </div>
                <div className="bg-gray-800/50 border border-gray-700/50 px-4 py-2 rounded-xl text-sm font-mono text-pink-400">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </div>
                <button onClick={() => disconnect()} className="p-2 text-gray-400 hover:text-red-400 transition">
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button onClick={handleConnect} className="bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-2.5 rounded-xl font-bold flex items-center space-x-2 shadow-lg shadow-pink-500/30 hover:scale-105 transition-transform">
                <Wallet className="w-4 h-4" />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Chart Section */}
          <div className="bg-[#191b1f] rounded-3xl border border-gray-800/50 p-6 mb-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">{TOKENS[fromToken].symbol} / {TOKENS[toToken].symbol} Price</h3>
              <div className="text-green-400 font-mono">+0.24%</div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={priceHistory}>
                <XAxis dataKey="time" hide />
                <YAxis hide domain={['dataMin', 'dataMax']} />
                <Tooltip contentStyle={{ backgroundColor: '#0d111c', border: '1px solid #374151', borderRadius: '12px' }} />
                <Line type="monotone" dataKey="price" stroke="#ec4899" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Swap Interface */}
          <div className="bg-[#191b1f] rounded-3xl border border-gray-800/50 p-6 shadow-2xl">
            {/* Pay Input */}
            <div className="mb-2 bg-[#0d111c] rounded-2xl p-4 border border-gray-800 focus-within:border-pink-500/50 transition-colors">
              <div className="flex justify-between text-xs text-gray-500 mb-2 uppercase font-bold tracking-wider"><span>You Pay</span></div>
              <div className="flex items-center">
                <input type="number" value={fromAmount} onChange={(e) => setFromAmount(e.target.value)} placeholder="0.0" className="bg-transparent text-4xl font-bold outline-none w-full" />
                <button className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-2xl transition">
                  <span className="text-xl">{TOKENS[fromToken].logo}</span>
                  <span className="font-bold">{TOKENS[fromToken].symbol}</span>
                </button>
              </div>
            </div>

            {/* Switch Icon */}
            <div className="flex justify-center -my-5 relative z-10">
              <button 
                onClick={() => {setFromToken(toToken); setToToken(fromToken)}}
                className="bg-[#191b1f] border-4 border-[#0d111c] rounded-2xl p-3 hover:rotate-180 transition-transform duration-300 shadow-xl"
              >
                <ArrowDownUp className="w-5 h-5 text-pink-500" />
              </button>
            </div>

            {/* Receive Input */}
            <div className="mt-2 mb-6 bg-[#0d111c] rounded-2xl p-4 border border-gray-800 focus-within:border-pink-500/50 transition-colors">
              <div className="flex justify-between text-xs text-gray-500 mb-2 uppercase font-bold tracking-wider"><span>You Receive</span></div>
              <div className="flex items-center">
                <input type="number" value={toAmount} readOnly placeholder="0.0" className="bg-transparent text-4xl font-bold outline-none w-full text-gray-400" />
                <button className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-2xl transition">
                  <span className="text-xl">{TOKENS[toToken].logo}</span>
                  <span className="font-bold">{TOKENS[toToken].symbol}</span>
                </button>
              </div>
            </div>

            {/* Action Button */}
            <button 
              onClick={handleSwap} 
              className="w-full bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 py-5 rounded-2xl font-black text-xl shadow-lg shadow-purple-500/20 hover:opacity-90 active:scale-[0.98] transition-all"
            >
              {isConnected ? 'CONFIRM SWAP' : 'CONNECT WALLET'}
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-pink-500/20 rounded-lg">
                <Info className="text-pink-400 w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold mb-1 text-sm">Mainnet Mode</h4>
                <p className="text-xs text-gray-400 leading-relaxed">Pastikan wallet Anda terhubung ke jaringan Tempo. Transaksi akan muncul di MetaMask untuk konfirmasi.</p>
              </div>
            </div>
          </div>
          
          <div className="bg-[#191b1f] border border-gray-800/50 rounded-2xl p-5">
            <h4 className="font-bold text-sm mb-4">Transaction Details</h4>
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Price Impact</span>
                <span className="text-green-400">&lt; 0.01%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Slippage Tolerance</span>
                <span className="text-gray-300">0.5%</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;