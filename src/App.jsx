import React, { useState, useEffect } from 'react';
import { Wallet, ArrowDownUp, Plus, Minus, TrendingUp, Info, ExternalLink, Menu, X, Settings, ChevronDown, Clock, Search, Upload, Trash2, Copy, CheckCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Simulasi koneksi wallet dan data
const TOKENS = {
  pathUSD: { address: '0x20c0000000000000000000000000000000000000', symbol: 'pathUSD', decimals: 6, logo: '💵' },
  alphaUSD: { address: '0x20c0000000000000000000000000000000000001', symbol: 'AlphaUSD', decimals: 6, logo: '🅰️' },
  betaUSD: { address: '0x20c0000000000000000000000000000000000002', symbol: 'BetaUSD', decimals: 6, logo: '🅱️' }
};

// Simulasi price history untuk chart
const generatePriceHistory = () => {
  const data = [];
  let price = 1.0;
  for (let i = 0; i < 24; i++) {
    price = price + (Math.random() - 0.5) * 0.01;
    data.push({
      time: `${i}:00`,
      price: price.toFixed(4)
    });
  }
  return data;
};

function App() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [activeTab, setActiveTab] = useState('swap');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Modals state
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showTokenImport, setShowTokenImport] = useState(false);
  const [showTokenSelect, setShowTokenSelect] = useState(false);
  const [selectingToken, setSelectingToken] = useState(null); // 'from' or 'to'
  
  // Settings
  const [slippage, setSlippage] = useState('0.5');
  const [customSlippage, setCustomSlippage] = useState('');
  const [deadline, setDeadline] = useState('20');
  
  // Token import
  const [importAddress, setImportAddress] = useState('');
  const [customTokens, setCustomTokens] = useState([]);
  
  // Swap state
  const [fromToken, setFromToken] = useState('pathUSD');
  const [toToken, setToToken] = useState('alphaUSD');
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  
  // Liquidity state
  const [liquidityToken, setLiquidityToken] = useState('alphaUSD');
  const [liquidityAmount, setLiquidityAmount] = useState('');
  const [lpBalance, setLpBalance] = useState('0');
  
  // Chart data
  const [priceHistory, setPriceHistory] = useState(generatePriceHistory());
  
  // Transaction history
  const [transactions, setTransactions] = useState([
    { id: 1, type: 'Swap', from: 'pathUSD', to: 'AlphaUSD', amount: '100', time: '2 min ago', status: 'Success' },
    { id: 2, type: 'Add Liquidity', from: 'AlphaUSD', to: '', amount: '50', time: '15 min ago', status: 'Success' },
    { id: 3, type: 'Swap', from: 'BetaUSD', to: 'pathUSD', amount: '75', time: '1 hour ago', status: 'Success' },
  ]);
  
  // Pool stats (simulated)
  const [poolStats, setPoolStats] = useState({
    userTokenReserve: '50000',
    validatorTokenReserve: '48500',
    totalLiquidity: '100000',
    volume24h: '125000',
    fees24h: '375'
  });

  // Get all available tokens (default + custom)
  const allTokens = { ...TOKENS, ...customTokens };

  // Connect Wallet
  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        const address = accounts[0];
        setWalletAddress(address);
        setWalletConnected(true);
        setLpBalance('0');
        
        alert('✅ Wallet Connected!\n\nAddress: ' + address + '\n\n⚠️ Demo Mode: Transactions are simulated.\nFor real transactions, connect to Tempo testnet.');
        
      } else {
        alert('⚠️ MetaMask Not Detected!\n\nPlease install MetaMask extension to connect your wallet.\n\nFor demo purposes, a mock wallet will be created.');
        
        const mockAddress = '0x' + Math.random().toString(16).substr(2, 40);
        setWalletAddress(mockAddress);
        setWalletConnected(true);
        setLpBalance('1450.50');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      
      if (error.code === 4001) {
        alert('❌ Connection Rejected\n\nYou rejected the connection request.');
      } else {
        alert('❌ Connection Failed\n\n' + error.message);
      }
    }
  };

  const disconnectWallet = () => {
    setWalletConnected(false);
    setWalletAddress('');
    setLpBalance('0');
  };

  // Calculate swap output with slippage
  useEffect(() => {
    if (fromAmount && !isNaN(fromAmount)) {
      const slippagePercent = parseFloat(customSlippage || slippage) / 100;
      const output = parseFloat(fromAmount) * 0.997; // 0.3% fee
      const withSlippage = output * (1 - slippagePercent);
      setToAmount(withSlippage.toFixed(6));
    } else {
      setToAmount('');
    }
  }, [fromAmount, slippage, customSlippage]);

  // Swap tokens
  const handleSwap = () => {
    if (!walletConnected) {
      alert('⚠️ Wallet Not Connected\n\nPlease connect your wallet first!');
      return;
    }
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      alert('⚠️ Invalid Amount\n\nPlease enter a valid amount!');
      return;
    }
    
    const confirmSwap = confirm(
      `🔄 Confirm Swap\n\n` +
      `From: ${fromAmount} ${allTokens[fromToken].symbol}\n` +
      `To: ${toAmount} ${allTokens[toToken].symbol}\n` +
      `Fee: ${(parseFloat(fromAmount) * 0.003).toFixed(6)} ${allTokens[fromToken].symbol}\n` +
      `Slippage: ${customSlippage || slippage}%\n\n` +
      `⚠️ DEMO MODE: This is a simulated transaction.\n\n` +
      `Proceed?`
    );
    
    if (!confirmSwap) return;
    
    // Add to transaction history
    const newTx = {
      id: Date.now(),
      type: 'Swap',
      from: allTokens[fromToken].symbol,
      to: allTokens[toToken].symbol,
      amount: fromAmount,
      time: 'Just now',
      status: 'Success'
    };
    setTransactions([newTx, ...transactions]);
    
    alert('✅ Transaction Submitted!\n\n' +
          `Swap: ${fromAmount} ${allTokens[fromToken].symbol} → ${toAmount} ${allTokens[toToken].symbol}\n\n` +
          '⏳ Processing...\n\n' +
          '💡 In production, check your wallet for confirmation.');
    
    setFromAmount('');
    setToAmount('');
  };

  // Add liquidity
  const handleAddLiquidity = () => {
    if (!walletConnected) {
      alert('⚠️ Wallet Not Connected\n\nPlease connect your wallet first!');
      return;
    }
    if (!liquidityAmount || parseFloat(liquidityAmount) <= 0) {
      alert('⚠️ Invalid Amount\n\nPlease enter a valid amount!');
      return;
    }
    
    const confirmAdd = confirm(
      `➕ Confirm Add Liquidity\n\n` +
      `Amount: ${liquidityAmount} ${allTokens[liquidityToken].symbol}\n` +
      `Pool: ${allTokens[liquidityToken].symbol} / pathUSD\n\n` +
      `⚠️ DEMO MODE: This is a simulated transaction.\n\n` +
      `Proceed?`
    );
    
    if (!confirmAdd) return;
    
    const newLpBalance = (parseFloat(lpBalance) + parseFloat(liquidityAmount)).toFixed(2);
    setLpBalance(newLpBalance);
    
    // Add to history
    const newTx = {
      id: Date.now(),
      type: 'Add Liquidity',
      from: allTokens[liquidityToken].symbol,
      to: '',
      amount: liquidityAmount,
      time: 'Just now',
      status: 'Success'
    };
    setTransactions([newTx, ...transactions]);
    
    alert(`✅ Liquidity Added!\n\n` +
          `Added: ${liquidityAmount} ${allTokens[liquidityToken].symbol}\n` +
          `New LP Balance: ${newLpBalance} LP\n\n` +
          `💡 In production, LP tokens will be minted to your wallet.`);
    
    setLiquidityAmount('');
  };

  // Remove liquidity
  const handleRemoveLiquidity = () => {
    if (!walletConnected) {
      alert('⚠️ Wallet Not Connected\n\nPlease connect your wallet first!');
      return;
    }
    if (!liquidityAmount || parseFloat(liquidityAmount) <= 0) {
      alert('⚠️ Invalid Amount\n\nPlease enter a valid amount!');
      return;
    }
    if (parseFloat(liquidityAmount) > parseFloat(lpBalance)) {
      alert('Insufficient LP balance!');
      return;
    }
    
    const newLpBalance = (parseFloat(lpBalance) - parseFloat(liquidityAmount)).toFixed(2);
    setLpBalance(newLpBalance);
    
    // Add to history
    const newTx = {
      id: Date.now(),
      type: 'Remove Liquidity',
      from: allTokens[liquidityToken].symbol,
      to: '',
      amount: liquidityAmount,
      time: 'Just now',
      status: 'Success'
    };
    setTransactions([newTx, ...transactions]);
    
    alert(`✅ Liquidity Removed!\n\nRemoved: ${liquidityAmount} LP tokens\n\nNew LP Balance: ${newLpBalance} LP tokens`);
    setLiquidityAmount('');
  };

  const switchTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
  };

  // Import custom token
  const handleImportToken = () => {
    if (!importAddress || importAddress.length !== 42 || !importAddress.startsWith('0x')) {
      alert('⚠️ Invalid Address\n\nPlease enter a valid token contract address.');
      return;
    }
    
    // Simulate token import
    const newToken = {
      address: importAddress,
      symbol: 'CUSTOM' + Math.floor(Math.random() * 1000),
      decimals: 6,
      logo: '🪙'
    };
    
    setCustomTokens({...customTokens, [newToken.symbol.toLowerCase()]: newToken});
    alert(`✅ Token Imported!\n\nSymbol: ${newToken.symbol}\nAddress: ${importAddress}`);
    setImportAddress('');
    setShowTokenImport(false);
  };

  // Select token from modal
  const handleSelectToken = (tokenKey) => {
    if (selectingToken === 'from') {
      setFromToken(tokenKey);
    } else if (selectingToken === 'to') {
      setToToken(tokenKey);
    } else if (selectingToken === 'liquidity') {
      setLiquidityToken(tokenKey);
    }
    setShowTokenSelect(false);
  };

  // Copy address
  const copyAddress = (address) => {
    navigator.clipboard.writeText(address);
    alert('📋 Address Copied!');
  };

  return (
    <div className="min-h-screen bg-[#0d111c]">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-[120px] -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] top-1/3 -right-64 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] bottom-0 left-1/3 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-gray-800/50 bg-[#0d111c]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Tempo</span>
              </div>

              {/* Desktop Menu */}
              <nav className="hidden md:flex space-x-1">
                <button onClick={() => setActiveTab('swap')} className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'swap' ? 'bg-gray-800/50 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800/30'}`}>
                  Swap
                </button>
                <button onClick={() => setActiveTab('liquidity')} className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'liquidity' ? 'bg-gray-800/50 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800/30'}`}>
                  Liquidity
                </button>
                <button onClick={() => setActiveTab('pools')} className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'pools' ? 'bg-gray-800/50 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800/30'}`}>
                  Pools
                </button>
              </nav>
            </div>

            <div className="flex items-center space-x-3">
              <button onClick={() => setShowHistory(true)} className="hidden sm:flex items-center space-x-2 px-4 py-2 rounded-xl bg-gray-800/50 border border-gray-700/50 text-gray-300 hover:bg-gray-700/50 transition">
                <Clock className="w-4 h-4" />
              </button>
              
              <button onClick={() => setShowSettings(true)} className="hidden sm:flex items-center space-x-2 px-4 py-2 rounded-xl bg-gray-800/50 border border-gray-700/50 text-gray-300 hover:bg-gray-700/50 transition">
                <Settings className="w-4 h-4" />
              </button>
              
              {walletConnected ? (
                <div className="flex items-center space-x-2">
                  <div className="hidden sm:flex items-center bg-gray-800/50 border border-gray-700/50 px-4 py-2 rounded-xl">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm font-medium text-white">
                      {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                    </span>
                  </div>
                  <button onClick={disconnectWallet} className="bg-gray-800/50 border border-gray-700/50 text-gray-300 px-4 py-2 rounded-xl hover:bg-gray-700/50 transition text-sm font-medium">
                    Disconnect
                  </button>
                </div>
              ) : (
                <button onClick={connectWallet} className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-5 py-2.5 rounded-xl hover:from-pink-600 hover:to-purple-700 transition font-medium flex items-center space-x-2 shadow-lg shadow-pink-500/20">
                  <Wallet className="w-4 h-4" />
                  <span>Connect</span>
                </button>
              )}
              
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-gray-300">
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <nav className="md:hidden pb-4 space-y-1">
              <button onClick={() => { setActiveTab('swap'); setMobileMenuOpen(false); }} className={`block w-full text-left px-4 py-2 rounded-lg ${activeTab === 'swap' ? 'bg-gray-800/50 text-white' : 'text-gray-400'}`}>
                Swap
              </button>
              <button onClick={() => { setActiveTab('liquidity'); setMobileMenuOpen(false); }} className={`block w-full text-left px-4 py-2 rounded-lg ${activeTab === 'liquidity' ? 'bg-gray-800/50 text-white' : 'text-gray-400'}`}>
                Liquidity
              </button>
              <button onClick={() => { setActiveTab('pools'); setMobileMenuOpen(false); }} className={`block w-full text-left px-4 py-2 rounded-lg ${activeTab === 'pools' ? 'bg-gray-800/50 text-white' : 'text-gray-400'}`}>
                Pools
              </button>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Chart */}
          <div className="lg:col-span-2">
            <div className="bg-[#191b1f] rounded-3xl shadow-2xl border border-gray-800/50 p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">{allTokens[fromToken].symbol} / {allTokens[toToken].symbol}</h3>
                  <div className="text-2xl font-bold text-white">$1.0024 <span className="text-green-400 text-sm ml-2">+0.24%</span></div>
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 rounded-lg bg-gray-800/50 text-gray-400 hover:text-white text-sm">1H</button>
                  <button className="px-3 py-1 rounded-lg bg-gray-800/50 text-gray-400 hover:text-white text-sm">1D</button>
                  <button className="px-3 py-1 rounded-lg bg-pink-500/20 text-pink-400 text-sm">1W</button>
                  <button className="px-3 py-1 rounded-lg bg-gray-800/50 text-gray-400 hover:text-white text-sm">1M</button>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={priceHistory}>
                  <XAxis dataKey="time" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} domain={['dataMin - 0.01', 'dataMax + 0.01']} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="price" stroke="#ec4899" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Trading Card */}
            <div className="bg-[#191b1f] rounded-3xl shadow-2xl border border-gray-800/50 p-4">
              {/* Swap Tab */}
              {activeTab === 'swap' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-white">Swap</h2>
                    <button onClick={() => setShowSettings(true)} className="p-2 hover:bg-gray-800/50 rounded-lg transition">
                      <Settings className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>

                  {/* From Token */}
                  <div className="mb-1">
                    <div className="bg-[#0d111c] rounded-2xl p-4 border border-gray-800/50 hover:border-gray-700/50 transition">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-400">From</span>
                        <span className="text-sm text-gray-400">Balance: 1,000.00</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <input
                          type="number"
                          value={fromAmount}
                          onChange={(e) => setFromAmount(e.target.value)}
                          placeholder="0.0"
                          className="bg-transparent text-3xl font-semibold outline-none text-white w-full"
                        />
                        <button 
                          onClick={() => { setSelectingToken('from'); setShowTokenSelect(true); }}
                          className="flex items-center space-x-2 bg-gray-800/80 hover:bg-gray-700/80 px-3 py-2 rounded-xl transition ml-2"
                        >
                          <span className="text-2xl">{allTokens[fromToken].logo}</span>
                          <span className="text-white font-medium">{allTokens[fromToken].symbol}</span>
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Switch Button */}
                  <div className="flex justify-center -my-3 relative z-10">
                    <button
                      onClick={switchTokens}
                      className="bg-[#191b1f] border-4 border-[#0d111c] rounded-xl p-2 hover:bg-gray-800/50 transition"
                    >
                      <ArrowDownUp className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>

                  {/* To Token */}
                  <div className="mb-4">
                    <div className="bg-[#0d111c] rounded-2xl p-4 border border-gray-800/50 hover:border-gray-700/50 transition">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-400">To</span>
                        <span className="text-sm text-gray-400">Balance: 500.00</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <input
                          type="number"
                          value={toAmount}
                          readOnly
                          placeholder="0.0"
                          className="bg-transparent text-3xl font-semibold outline-none text-white w-full"
                        />
                        <button 
                          onClick={() => { setSelectingToken('to'); setShowTokenSelect(true); }}
                          className="flex items-center space-x-2 bg-gray-800/80 hover:bg-gray-700/80 px-3 py-2 rounded-xl transition ml-2"
                        >
                          <span className="text-2xl">{allTokens[toToken].logo}</span>
                          <span className="text-white font-medium">{allTokens[toToken].symbol}</span>
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Price Info */}
                  {fromAmount && toAmount && (
                    <div className="bg-[#0d111c] rounded-xl p-3 mb-4 border border-gray-800/30">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Rate</span>
                        <span className="text-white font-medium">1 {allTokens[fromToken].symbol} = 0.997 {allTokens[toToken].symbol}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Fee (0.3%)</span>
                        <span className="text-white font-medium">{(parseFloat(fromAmount) * 0.003).toFixed(6)} {allTokens[fromToken].symbol}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Slippage Tolerance</span>
                        <span className="text-white font-medium">{customSlippage || slippage}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Min received</span>
                        <span className="text-white font-medium">{toAmount} {allTokens[toToken].symbol}</span>
                      </div>
                    </div>
                  )}

                  {/* Swap Button */}
                  <button
                    onClick={handleSwap}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 rounded-2xl font-bold text-lg hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg shadow-pink-500/20"
                  >
                    {walletConnected ? 'Swap' : 'Connect Wallet'}
                  </button>
                </div>
              )}

              {/* Liquidity Tab */}
              {activeTab === 'liquidity' && (
                <div>
                  <h2 className="text-lg font-semibold text-white mb-4">Add Liquidity</h2>

                  {/* LP Balance */}
                  <div className="bg-gradient-to-r from-pink-500/10 to-purple-600/10 rounded-2xl p-4 mb-4 border border-pink-500/20">
                    <div className="text-sm text-gray-400 mb-1">Your LP Balance</div>
                    <div className="text-2xl font-bold text-white">{lpBalance} LP</div>
                  </div>

                  {/* Pool Selection */}
                  <div className="mb-4">
                    <label className="block text-sm text-gray-400 mb-2">Pool</label>
                    <button 
                      onClick={() => { setSelectingToken('liquidity'); setShowTokenSelect(true); }}
                      className="w-full bg-[#0d111c] rounded-2xl p-4 border border-gray-800/50 hover:border-gray-700/50 transition flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{allTokens[liquidityToken].logo}</span>
                        <span className="text-white font-medium">{allTokens[liquidityToken].symbol} / pathUSD</span>
                      </div>
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>

                  {/* Amount Input */}
                  <div className="mb-4">
                    <label className="block text-sm text-gray-400 mb-2">Amount</label>
                    <div className="bg-[#0d111c] rounded-2xl p-4 border border-gray-800/50 hover:border-gray-700/50 transition">
                      <input
                        type="number"
                        value={liquidityAmount}
                        onChange={(e) => setLiquidityAmount(e.target.value)}
                        placeholder="0.0"
                        className="bg-transparent text-3xl font-semibold outline-none text-white w-full mb-2"
                      />
                      <div className="text-sm text-gray-400">Available: 1,000.00 {allTokens[liquidityToken].symbol}</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button
                      onClick={handleAddLiquidity}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-green-500/20"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Add</span>
                    </button>
                    <button
                      onClick={handleRemoveLiquidity}
                      className="bg-gray-800/80 border border-gray-700/50 text-white py-3 rounded-xl font-bold hover:bg-gray-700/80 transition-all flex items-center justify-center space-x-2"
                    >
                      <Minus className="w-5 h-5" />
                      <span>Remove</span>
                    </button>
                  </div>

                  {/* Info Box */}
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                    <div className="flex items-start space-x-2">
                      <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-300">
                        First liquidity provider must burn 1,000 units (~$0.002) to prevent pool attacks.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Pools Tab */}
              {activeTab === 'pools' && (
                <div>
                  <h2 className="text-lg font-semibold text-white mb-4">Top Pools</h2>

                  {/* Pool Cards */}
                  <div className="space-y-3">
                    <div className="bg-[#0d111c] rounded-2xl p-4 border border-gray-800/50 hover:border-gray-700/50 transition cursor-pointer">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="text-white font-semibold mb-1">AlphaUSD / pathUSD</div>
                          <div className="text-sm text-gray-400">Fee: 0.30%</div>
                        </div>
                        <div className="bg-green-500/10 text-green-400 px-2 py-1 rounded text-xs font-medium">
                          Active
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs text-gray-400 mb-1">TVL</div>
                          <div className="text-white font-semibold">${poolStats.totalLiquidity}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400 mb-1">Volume 24h</div>
                          <div className="text-white font-semibold">${poolStats.volume24h}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400 mb-1">Fees 24h</div>
                          <div className="text-green-400 font-semibold">${poolStats.fees24h}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400 mb-1">APR</div>
                          <div className="text-white font-semibold">12.4%</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#0d111c] rounded-2xl p-4 border border-gray-800/50 hover:border-gray-700/50 transition cursor-pointer opacity-60">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="text-white font-semibold mb-1">BetaUSD / pathUSD</div>
                          <div className="text-sm text-gray-400">Fee: 0.30%</div>
                        </div>
                        <div className="bg-yellow-500/10 text-yellow-400 px-2 py-1 rounded text-xs font-medium">
                          Low Liquidity
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs text-gray-400 mb-1">TVL</div>
                          <div className="text-white font-semibold">$25,000</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400 mb-1">Volume 24h</div>
                          <div className="text-white font-semibold">$5,420</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400 mb-1">Fees 24h</div>
                          <div className="text-green-400 font-semibold">$16.26</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400 mb-1">APR</div>
                          <div className="text-white font-semibold">8.2%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            {/* Info Card */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-amber-200 mb-1">Demo Mode</div>
                  <p className="text-sm text-gray-400">
                    This is a demo interface. Connect to Tempo testnet for real transactions.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-[#191b1f] rounded-2xl p-4 border border-gray-800/50">
              <h3 className="text-white font-semibold mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => setShowTokenImport(true)}
                  className="w-full bg-gray-800/50 hover:bg-gray-700/50 text-white py-2 px-3 rounded-lg transition text-sm flex items-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Import Token</span>
                </button>
                <button 
                  onClick={() => setShowHistory(true)}
                  className="w-full bg-gray-800/50 hover:bg-gray-700/50 text-white py-2 px-3 rounded-lg transition text-sm flex items-center space-x-2"
                >
                  <Clock className="w-4 h-4" />
                  <span>View History</span>
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-[#191b1f] rounded-2xl p-4 border border-gray-800/50">
              <h3 className="text-white font-semibold mb-3">Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">TVL</span>
                  <span className="text-white font-medium">$125,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">24h Volume</span>
                  <span className="text-white font-medium">$130,420</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">24h Fees</span>
                  <span className="text-green-400 font-medium">$391.26</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Active Pools</span>
                  <span className="text-white font-medium">2</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#191b1f] rounded-3xl border border-gray-800/50 max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Settings</h2>
              <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Slippage Tolerance */}
            <div className="mb-6">
              <label className="text-white font-medium mb-3 block">Slippage Tolerance</label>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {['0.1', '0.5', '1.0', '5.0'].map(value => (
                  <button
                    key={value}
                    onClick={() => { setSlippage(value); setCustomSlippage(''); }}
                    className={`py-2 px-3 rounded-lg font-medium transition ${
                      slippage === value && !customSlippage
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
                    }`}
                  >
                    {value}%
                  </button>
                ))}
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={customSlippage}
                  onChange={(e) => setCustomSlippage(e.target.value)}
                  placeholder="Custom"
                  className="flex-1 bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2 text-white placeholder-gray-500 outline-none focus:border-pink-500"
                />
                <span className="text-gray-400">%</span>
              </div>
            </div>

            {/* Transaction Deadline */}
            <div className="mb-6">
              <label className="text-white font-medium mb-3 block">Transaction Deadline</label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="flex-1 bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-2 text-white outline-none focus:border-pink-500"
                />
                <span className="text-gray-400">minutes</span>
              </div>
            </div>

            <button
              onClick={() => setShowSettings(false)}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-xl font-bold hover:from-pink-600 hover:to-purple-700 transition"
            >
              Save Settings
            </button>
          </div>
        </div>
      )}

      {/* Transaction History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#191b1f] rounded-3xl border border-gray-800/50 max-w-2xl w-full p-6 max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Transaction History</h2>
              <button onClick={() => setShowHistory(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No transactions yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map(tx => (
                  <div key={tx.id} className="bg-[#0d111c] rounded-xl p-4 border border-gray-800/50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="text-white font-semibold">{tx.type}</div>
                        <div className="text-sm text-gray-400">
                          {tx.from} {tx.to && `→ ${tx.to}`}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-medium">{tx.amount}</div>
                        <div className="flex items-center space-x-1 text-xs">
                          <CheckCircle className="w-3 h-3 text-green-400" />
                          <span className="text-green-400">{tx.status}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">{tx.time}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Token Import Modal */}
      {showTokenImport && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#191b1f] rounded-3xl border border-gray-800/50 max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Import Token</h2>
              <button onClick={() => setShowTokenImport(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <label className="text-white font-medium mb-3 block">Token Contract Address</label>
              <input
                type="text"
                value={importAddress}
                onChange={(e) => setImportAddress(e.target.value)}
                placeholder="0x..."
                className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-pink-500"
              />
              <p className="text-xs text-gray-400 mt-2">Enter the token contract address to import</p>
            </div>

            {/* Custom Tokens List */}
            {Object.keys(customTokens).length > 0 && (
              <div className="mb-6">
                <label className="text-white font-medium mb-3 block">Imported Tokens</label>
                <div className="space-y-2">
                  {Object.values(customTokens).map((token, idx) => (
                    <div key={idx} className="bg-gray-800/50 rounded-lg p-3 flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{token.logo}</span>
                        <div>
                          <div className="text-white font-medium">{token.symbol}</div>
                          <div className="text-xs text-gray-400">{token.address.slice(0, 10)}...</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          const newTokens = {...customTokens};
                          delete newTokens[token.symbol.toLowerCase()];
                          setCustomTokens(newTokens);
                        }}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleImportToken}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-xl font-bold hover:from-pink-600 hover:to-purple-700 transition"
            >
              Import Token
            </button>
          </div>
        </div>
      )}

      {/* Token Select Modal */}
      {showTokenSelect && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#191b1f] rounded-3xl border border-gray-800/50 max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Select Token</h2>
              <button onClick={() => setShowTokenSelect(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Search */}
            <div className="mb-4">
              <div className="flex items-center bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-3">
                <Search className="w-5 h-5 text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Search token..."
                  className="bg-transparent text-white placeholder-gray-500 outline-none w-full"
                />
              </div>
            </div>

            {/* Token List */}
            <div className="space-y-2 max-h-96 overflow-auto">
              {Object.entries(allTokens).map(([key, token]) => (
                <button
                  key={key}
                  onClick={() => handleSelectToken(key)}
                  className="w-full bg-gray-800/50 hover:bg-gray-700/50 rounded-lg p-3 flex items-center justify-between transition"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{token.logo}</span>
                    <div className="text-left">
                      <div className="text-white font-medium">{token.symbol}</div>
                      <div className="text-xs text-gray-400">{token.address.slice(0, 10)}...</div>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); copyAddress(token.address); }}
                    className="text-gray-400 hover:text-white"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowTokenImport(true)}
              className="w-full mt-4 bg-pink-500/20 border border-pink-500/30 text-pink-400 py-3 rounded-xl font-bold hover:bg-pink-500/30 transition flex items-center justify-center space-x-2"
            >
              <Upload className="w-5 h-5" />
              <span>Import Custom Token</span>
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800/50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © 2024 Tempo DEX - Built on Tempo Protocol
            </div>
            <div className="flex items-center space-x-6">
              <a href="https://docs.tempo.xyz" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition text-sm flex items-center space-x-1">
                <span>Docs</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a href="https://github.com/tempoxyz" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition text-sm flex items-center space-x-1">
                <span>GitHub</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a href="https://twitter.com/tempo" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition text-sm">
                Twitter
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;