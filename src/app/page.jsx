"use client";
import React from "react";

function MainComponent() {
  const [swapFrom, setSwapFrom] = useState("MATIC");
  const [swapTo, setSwapTo] = useState("USDC");
  const [amount, setAmount] = useState("");
  const [receiving, setReceiving] = useState("");
  const [account, setAccount] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("swap");
  const [orderType, setOrderType] = useState("buy");
  const [price, setPrice] = useState("");
  const [orderAmount, setOrderAmount] = useState("");
  const [selectedGas, setSelectedGas] = useState("normal");
  const [gasOptions] = useState({
    slow: { price: "30", time: "5-10 min", selected: false },
    normal: { price: "45", time: "2-5 min", selected: true },
    fast: { price: "60", time: "30sec-2min", selected: false },
  });
  const [orders, setOrders] = useState({
    buy: [
      { price: "1950.00", amount: "0.5", total: "975.00" },
      { price: "1945.00", amount: "1.2", total: "2334.00" },
      { price: "1940.00", amount: "0.8", total: "1552.00" },
    ],
    sell: [
      { price: "1960.00", amount: "0.3", total: "588.00" },
      { price: "1965.00", amount: "0.9", total: "1768.50" },
      { price: "1970.00", amount: "0.6", total: "1182.00" },
    ],
  });

  const checkIfWalletIsConnected = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          await switchToPolygon();
          setError("");
        }
      }
    } catch (err) {
      console.error("Error checking wallet connection:", err);
    }
  };

  const switchToPolygon = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x89" }], // Polygon Mainnet
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x89",
                chainName: "Polygon Mainnet",
                nativeCurrency: {
                  name: "MATIC",
                  symbol: "MATIC",
                  decimals: 18,
                },
                rpcUrls: ["https://polygon-rpc.com/"],
                blockExplorerUrls: ["https://polygonscan.com/"],
              },
            ],
          });
        } catch (addError) {
          setError("Failed to add Polygon network");
        }
      } else {
        setError("Failed to switch to Polygon network");
      }
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
        await switchToPolygon();
        setError("");
      } catch (err) {
        setError("Failed to connect wallet");
      }
    } else if (window.location.href.includes("https://metamask.app.link")) {
      setError("Please use MetaMask browser menu to connect");
    } else {
      window.location.href = `https://metamask.app.link/dapp/${window.location.href}`;
    }
  };

  const handleSwitch = () => {
    const tempFrom = swapFrom;
    setSwapFrom(swapTo);
    setSwapTo(tempFrom);
  };
  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  const calculateReceiving = (amt) => {
    if (!amt) return "";
    return (parseFloat(amt) * 1950).toString();
  };
  const placeOrder = () => {
    if (!price || !orderAmount) {
      setError("Please enter both price and amount");
      return;
    }

    const newOrder = {
      price: parseFloat(price).toFixed(2),
      amount: orderAmount,
      total: (parseFloat(price) * parseFloat(orderAmount)).toFixed(2),
    };

    setOrders((prev) => ({
      ...prev,
      [orderType]: [...prev[orderType], newOrder].sort((a, b) =>
        orderType === "buy"
          ? parseFloat(b.price) - parseFloat(a.price)
          : parseFloat(a.price) - parseFloat(b.price)
      ),
    }));

    setPrice("");
    setOrderAmount("");
  };

  useEffect(() => {
    setReceiving(calculateReceiving(amount));
  }, [amount]);

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div className="min-h-screen bg-[#000000] text-white p-2 sm:p-4">
      <div className="flex flex-col gap-4 max-w-[1400px] mx-auto">
        <div className="w-full">
          <div className="bg-[#1A1825] rounded-2xl p-3 sm:p-6 shadow-xl mb-4 sm:mb-6">
            <div className="h-[300px] sm:h-[400px] bg-[#211F2D] rounded-xl mb-4">
              <div className="h-full flex items-center justify-center text-[#6E7087]">
                Price Chart
              </div>
            </div>
            <div className="flex gap-2 sm:gap-4">
              <button
                className={`flex-1 px-2 sm:px-4 py-2 rounded-xl text-sm sm:text-base ${
                  activeTab === "swap" ? "bg-[#7B3FE4]" : "bg-[#211F2D]"
                }`}
                onClick={() => setActiveTab("swap")}
              >
                Swap
              </button>
              <button
                className={`flex-1 px-2 sm:px-4 py-2 rounded-xl text-sm sm:text-base ${
                  activeTab === "orders" ? "bg-[#7B3FE4]" : "bg-[#211F2D]"
                }`}
                onClick={() => setActiveTab("orders")}
              >
                Orders
              </button>
            </div>
          </div>
        </div>

        <div className="w-full sm:max-w-[480px] mx-auto">
          {activeTab === "swap" ? (
            <div className="bg-[#1A1825] rounded-2xl p-4 sm:p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl font-bold font-inter">
                  Swap
                </h1>
                <div className="flex items-center gap-2 sm:gap-4">
                  {account && (
                    <span className="bg-[#334155] px-2 sm:px-4 py-1 sm:py-2 rounded-xl text-xs sm:text-sm">
                      {formatAddress(account)}
                    </span>
                  )}
                  <button className="text-[#94a3b8] hover:text-white">
                    <i className="fas fa-gear text-lg sm:text-xl"></i>
                  </button>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className="bg-[#211F2D] rounded-xl p-4">
                  <div className="flex justify-between">
                    <input
                      type="number"
                      className="bg-transparent text-2xl outline-none w-[60%]"
                      placeholder="0.0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                    <button className="flex items-center bg-[#1A1825] rounded-xl px-3 py-1">
                      <img
                        src="/matic-logo.png"
                        alt="Polygon MATIC logo"
                        className="w-6 h-6 mr-2"
                      />
                      <span>{swapFrom}</span>
                      <i className="fas fa-chevron-down ml-2"></i>
                    </button>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={handleSwitch}
                    className="bg-[#1e293b] p-2 rounded-lg hover:bg-[#334155]"
                  >
                    <i className="fas fa-arrow-down"></i>
                  </button>
                </div>

                <div className="bg-[#211F2D] rounded-xl p-4">
                  <div className="flex justify-between">
                    <input
                      type="number"
                      className="bg-transparent text-2xl outline-none w-[60%]"
                      placeholder="0.0"
                      value={receiving}
                      onChange={(e) => setReceiving(e.target.value)}
                    />
                    <button className="flex items-center bg-[#1A1825] rounded-xl px-3 py-1">
                      <img
                        src="/usdc-logo.png"
                        alt="USDC logo"
                        className="w-6 h-6 mr-2"
                      />
                      <span>{swapTo}</span>
                      <i className="fas fa-chevron-down ml-2"></i>
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="text-red-500 text-sm text-center">
                    {error}
                  </div>
                )}

                <button
                  onClick={connectWallet}
                  className="w-full bg-[#7B3FE4] hover:bg-[#6935C4] text-white font-bold py-4 px-4 rounded-xl"
                >
                  {account ? "Swap" : "Connect Wallet"}
                </button>
              </div>

              <div className="mt-4 p-3 bg-[#334155] rounded-xl text-sm space-y-3">
                <div className="flex justify-between text-[#94a3b8]">
                  <span>Expected Output</span>
                  <span>0 {swapTo}</span>
                </div>
                <div className="flex justify-between text-[#94a3b8]">
                  <span>Price Impact</span>
                  <span>0.00%</span>
                </div>
                <div className="pt-2 border-t border-[#1e293b]">
                  <div className="flex justify-between text-[#94a3b8] mb-2">
                    <span>Gas Fee</span>
                    <span>{gasOptions[selectedGas].price} GWEI</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setSelectedGas("slow")}
                      className={`p-2 rounded-lg text-xs ${
                        selectedGas === "slow"
                          ? "bg-[#7B3FE4]"
                          : "bg-[#1e293b] hover:bg-[#2a3441]"
                      }`}
                    >
                      <div>Slow</div>
                      <div className="text-[#94a3b8]">
                        {gasOptions.slow.time}
                      </div>
                    </button>
                    <button
                      onClick={() => setSelectedGas("normal")}
                      className={`p-2 rounded-lg text-xs ${
                        selectedGas === "normal"
                          ? "bg-[#7B3FE4]"
                          : "bg-[#1e293b] hover:bg-[#2a3441]"
                      }`}
                    >
                      <div>Normal</div>
                      <div className="text-[#94a3b8]">
                        {gasOptions.normal.time}
                      </div>
                    </button>
                    <button
                      onClick={() => setSelectedGas("fast")}
                      className={`p-2 rounded-lg text-xs ${
                        selectedGas === "fast"
                          ? "bg-[#7B3FE4]"
                          : "bg-[#1e293b] hover:bg-[#2a3441]"
                      }`}
                    >
                      <div>Fast</div>
                      <div className="text-[#94a3b8]">
                        {gasOptions.fast.time}
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#1A1825] rounded-2xl p-4 sm:p-6 shadow-xl">
              <div className="flex gap-4 mb-6">
                <button
                  className={`flex-1 py-2 rounded-xl ${
                    orderType === "buy" ? "bg-[#7B3FE4]" : "bg-[#211F2D]"
                  }`}
                  onClick={() => setOrderType("buy")}
                >
                  Buy
                </button>
                <button
                  className={`flex-1 py-2 rounded-xl ${
                    orderType === "sell" ? "bg-[#7B3FE4]" : "bg-[#211F2D]"
                  }`}
                  onClick={() => setOrderType("sell")}
                >
                  Sell
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <div className="bg-[#334155] rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[#94a3b8]">Price</span>
                    <input
                      type="number"
                      className="bg-transparent text-right outline-none"
                      placeholder="0.0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                    <span className="ml-2">USDC</span>
                  </div>
                </div>

                <div className="bg-[#334155] rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[#94a3b8]">Amount</span>
                    <input
                      type="number"
                      className="bg-transparent text-right outline-none"
                      placeholder="0.0"
                      value={orderAmount}
                      onChange={(e) => setOrderAmount(e.target.value)}
                    />
                    <span className="ml-2">ETH</span>
                  </div>
                </div>
              </div>

              <button
                onClick={account ? placeOrder : connectWallet}
                className={`w-full font-bold py-3 sm:py-4 px-4 rounded-xl bg-[#7B3FE4] hover:bg-[#6935C4] text-sm sm:text-base`}
              >
                {account ? `Place ${orderType} order` : "Connect Wallet"}
              </button>
              <div className="mt-4 sm:mt-6">
                <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">
                  Order Book
                </h3>
                <div className="space-y-2">
                  {orders[orderType].map((order, index) => (
                    <div
                      key={index}
                      className="bg-[#334155] rounded-xl p-2 sm:p-3 flex justify-between text-sm"
                    >
                      <span>{order.price}</span>
                      <span>{order.amount}</span>
                      <span>{order.total}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MainComponent;