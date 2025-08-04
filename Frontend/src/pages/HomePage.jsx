import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { LineChart, PieChart, Wallet, CreditCard, PiggyBank, Lightbulb, TrendingUp, DollarSign, CheckCircle, ArrowRight, Sparkles, HandCoins, BarChart2, ShieldCheck } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login'); 
  };

  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Refs for Intersection Observer
  const sectionRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1, 
        rootMargin: '0px',
      }
    );

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect(); 
  }, []);

  const displayMessage = (message) => {
    setErrorMessage(message);
    setShowError(true);
    setTimeout(() => {
      setShowError(false);
      setErrorMessage('');
    }, 5000); // Hide message after 5 seconds
  };

  // Function to call the Gemini API for financial advice
  const getFinancialAdvice = async () => {
    if (!aiPrompt.trim()) {
      displayMessage("Please enter a question or topic for financial advice.");
      return;
    }

    setIsLoading(true);
    setAiResponse(''); // Clear previous response
    setShowError(false); // Hide any previous error

    let chatHistory = [];
    // Enhanced prompt to strictly focus on financial advice
    chatHistory.push({ role: "user", parts: [{ text: `As a financial advisor AI, provide a concise, professional, and helpful financial tip or answer to the following question. If the question is not directly related to personal finance, budgeting, investments, savings, or financial planning, politely state that you can only provide financial advice. Question: "${aiPrompt}"` }] });

    const payload = { contents: chatHistory };
    const apiKey = "AIzaSyDAUT8G6bNxEGVc2_wT6hsnAsKJ9P-9aJw";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    try {
      let response;
      let retries = 0;
      const maxRetries = 5;
      const baseDelay = 1000;

      while (retries < maxRetries) {
        response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          break; // Success, exit loop
        } else if (response.status === 429) {
          const delay = baseDelay * Math.pow(2, retries);
          await new Promise(resolve => setTimeout(resolve, delay));
          retries++;
        } else {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
      }

      if (!response.ok) {
        throw new Error('Failed to fetch AI response after multiple retries.');
      }

      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
        result.candidates[0].content && result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0) {
        const text = result.candidates[0].content.parts[0].text;
        setAiResponse(text);
      } else {
        displayMessage("Sorry, I couldn't generate a financial tip right now. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching AI response:", error);
      displayMessage("An error occurred while getting financial advice. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-inter text-gray-800 overflow-x-hidden">
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(40px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideInLeft {
            from { opacity: 0; transform: translateX(-50px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes slideInRight {
            from { opacity: 0; transform: translateX(50px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.8); }
            to { opacity: 1; transform: scale(1); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          @keyframes rotateIn {
            from { opacity: 0; transform: rotate(-15deg) scale(0.8); }
            to { opacity: 1; transform: rotate(0deg) scale(1); }
          }
          @keyframes blurToClear {
            from { filter: blur(10px); opacity: 0; }
            to { filter: blur(0px); opacity: 1; }
          }

          /* Base animation classes for elements that will be observed */
          .animate-on-scroll {
            opacity: 0;
            transition: opacity 0.8s ease-out, transform 0.8s ease-out, filter 0.8s ease-out;
          }

          /* Specific animations triggered by 'is-visible' */
          .animate-on-scroll.is-visible.fade-in {
            animation: fadeIn 1s ease-out forwards;
          }
          .animate-on-scroll.is-visible.fade-in-up {
            animation: fadeInUp 0.8s ease-out forwards;
          }
          .animate-on-scroll.is-visible.slide-in-left {
            animation: slideInLeft 0.8s ease-out forwards;
          }
          .animate-on-scroll.is-visible.slide-in-right {
            animation: slideInRight 0.8s ease-out forwards;
          }
          .animate-on-scroll.is-visible.scale-in {
            animation: scaleIn 0.8s ease-out forwards;
          }
          .animate-on-scroll.is-visible.rotate-in {
            animation: rotateIn 0.8s ease-out forwards;
          }
          .animate-on-scroll.is-visible.blur-to-clear {
            animation: blurToClear 1s ease-out forwards;
          }

          .animate-pulse-slow {
            animation: pulse 2s infinite ease-in-out;
          }

          /* Staggered animation delays */
          .animate-delay-100 { animation-delay: 0.1s; }
          .animate-delay-200 { animation-delay: 0.2s; }
          .animate-delay-300 { animation-delay: 0.3s; }
          .animate-delay-400 { animation-delay: 0.4s; }
          .animate-delay-500 { animation-delay: 0.5s; }
          .animate-delay-600 { animation-delay: 0.6s; }
          .animate-delay-700 { animation-delay: 0.7s; }
          .animate-delay-800 { animation-delay: 0.8s; }
        `}
      </style>

      {/* Custom Message Box */}
      {showError && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-lg shadow-xl z-50 animate-fade-in-up">
          {errorMessage}
        </div>
      )}

      {/* Navbar */}
      <nav className="bg-white shadow-sm py-4 px-6 md:px-12 flex justify-between items-center rounded-b-xl animate-fade-in fixed top-0 left-0 w-full z-50">
        <div className="flex items-center space-x-2">
          <DollarSign className="h-8 w-8 text-purple-700" />
          <span className="text-2xl font-bold text-gray-900">FinanceFlow</span>
        </div>
        <div className="hidden md:flex space-x-8">
          <a href="#features" className="text-gray-600 hover:text-purple-700 font-medium transition duration-300">Features</a>
          <a href="#how-it-works" className="text-gray-600 hover:text-purple-700 font-medium transition duration-300">How it Works</a>
          <a href="#contact" className="text-gray-600 hover:text-purple-700 font-medium transition duration-300">Contact</a>
        </div>
        <button className="bg-purple-700 hover:bg-purple-800 text-white font-semibold py-2 px-6 rounded-full shadow-md transition duration-300 ease-in-out transform hover:scale-105"
        onClick={handleGetStarted} >
          Get STarted
        </button>
      </nav>

      {/* Hero Section */}
      <header className="relative bg-gradient-to-br from-purple-700 to-indigo-800 text-white py-20 px-6 md:px-12 overflow-hidden rounded-b-3xl shadow-lg">
        <div className="absolute inset-0 opacity-10">
          {/* Abstract background pattern for visual appeal */}
          <svg className="w-full h-full" fill="none" viewBox="0 0 100 100">
            <defs>
              <pattern id="pattern-circles" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="currentColor" />
              </pattern>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#pattern-circles)" />
          </svg>
        </div>
        <div className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10 p-6 md:p-12">
          <div ref={el => sectionRefs.current[0] = el} className="text-center md:text-left md:w-1/2 animate-on-scroll fade-in-up">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
              Take Control of Your Finances with <span className="text-yellow-300">FinanceFlow</span>
            </h1>
            <p className="text-lg md:text-xl mb-10 opacity-90">
              Effortlessly manage your income, expenses, budgets, and savings goals. Achieve financial clarity and peace of mind.
            </p>
            <button className="bg-white text-purple-700 hover:bg-gray-100 font-bold py-3 px-8 rounded-full text-lg shadow-xl transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-300"
            onClick={handleGetStarted}>
              Get Started Now
            </button>
          </div>
          <div ref={el => sectionRefs.current[1] = el} className="md:w-1/2 flex justify-center animate-on-scroll scale-in animate-delay-200">
            <img
              src="./logo.png"
              alt="FinanceFlow Dashboard Screenshot"
              className="rounded-xl shadow-2xl border-4 border-purple-300 max-w-full h-auto"
              onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400/6D28D9/FFFFFF/png?text=Dashboard'; }}
            />
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 md:px-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 ref={el => sectionRefs.current[2] = el} className="text-4xl font-bold text-center mb-16 text-gray-900 animate-on-scroll fade-in-up">Powerful Features Designed for You</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">

            {/* Feature Card 1: Dashboard */}
            <div ref={el => sectionRefs.current[3] = el} className="bg-gray-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition duration-300 ease-in-out transform hover:-translate-y-2 border border-gray-100 animate-on-scroll fade-in-up animate-delay-100">
              <div className="bg-purple-100 p-4 rounded-full inline-flex mb-6">
                <LineChart className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">Intuitive Dashboard</h3>
              <p className="text-gray-700 leading-relaxed">
                Get a comprehensive overview of your financial health at a glance. Track income, expenses, and balance with interactive charts and trends.
              </p>
            </div>

            {/* Feature Card 2: Transactions */}
            <div ref={el => sectionRefs.current[4] = el} className="bg-gray-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition duration-300 ease-in-out transform hover:-translate-y-2 border border-gray-100 animate-on-scroll fade-in-up animate-delay-200">
              <div className="bg-green-100 p-4 rounded-full inline-flex mb-6">
                <CreditCard className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">Effortless Transactions</h3>
              <p className="text-gray-700 leading-relaxed">
                Log and categorize all your transactions with ease. Apply filters, export data, and keep a detailed record of every financial movement.
              </p>
            </div>

            {/* Feature Card 3: Budgets */}
            <div ref={el => sectionRefs.current[5] = el} className="bg-gray-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition duration-300 ease-in-out transform hover:-translate-y-2 border border-gray-100 animate-on-scroll fade-in-up animate-delay-300">
              <div className="bg-red-100 p-4 rounded-full inline-flex mb-6">
                <PieChart className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">Smart Budgeting</h3>
              <p className="text-gray-700 leading-relaxed">
                Set realistic budgets for different categories and monitor your spending against them. Stay on track and avoid overspending.
              </p>
            </div>

            {/* Feature Card 4: Subscriptions */}
            <div ref={el => sectionRefs.current[6] = el} className="bg-gray-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition duration-300 ease-in-out transform hover:-translate-y-2 border border-gray-100 animate-on-scroll fade-in-up animate-delay-400">
              <div className="bg-blue-100 p-4 rounded-full inline-flex mb-6">
                <Wallet className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">Subscription Management</h3>
              <p className="text-gray-700 leading-relaxed">
                Never miss a payment or forget a subscription. Track all your recurring expenses in one place and manage them efficiently.
              </p>
            </div>

            {/* Feature Card 5: Goals & Savings */}
            <div ref={el => sectionRefs.current[7] = el} className="bg-gray-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition duration-300 ease-in-out transform hover:-translate-y-2 border border-gray-100 animate-on-scroll fade-in-up animate-delay-500">
              <div className="bg-yellow-100 p-4 rounded-full inline-flex mb-6">
                <PiggyBank className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">Goals & Savings Tracking</h3>
              <p className="text-gray-700 leading-relaxed">
                Define your financial goals and track your progress towards them. Whether it's a new gadget or a dream vacation, FinanceFlow helps you save.
              </p>
            </div>

            {/* Feature Card 6: AI Insights */}
            <div ref={el => sectionRefs.current[8] = el} className="bg-gray-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition duration-300 ease-in-out transform hover:-translate-y-2 border border-gray-100 animate-on-scroll fade-in-up animate-delay-600">
              <div className="bg-indigo-100 p-4 rounded-full inline-flex mb-6">
                <Lightbulb className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">Intelligent AI Insights</h3>
              <p className="text-gray-700 leading-relaxed">
                Leverage AI-powered insights to understand your spending habits, identify saving opportunities, and make smarter financial decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Security Section - NEW! */}
      <section id="trust-security" className="py-20 px-6 md:px-12 bg-purple-700 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 ref={el => sectionRefs.current[20] = el} className="text-4xl font-bold mb-16 animate-on-scroll fade-in-up">
            Your Financial Data, Secured.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div ref={el => sectionRefs.current[21] = el} className="p-8 rounded-2xl bg-purple-600 shadow-xl animate-on-scroll scale-in animate-delay-100">
              <ShieldCheck className="h-12 w-12 text-white mx-auto mb-6" />
              <h3 className="text-2xl font-semibold mb-4">Bank-Grade Encryption</h3>
              <p className="text-purple-100 leading-relaxed">
                We use advanced encryption protocols to ensure your data is always protected and private.
              </p>
            </div>
            <div ref={el => sectionRefs.current[22] = el} className="p-8 rounded-2xl bg-purple-600 shadow-xl animate-on-scroll scale-in animate-delay-200">
              <HandCoins className="h-12 w-12 text-white mx-auto mb-6" />
              <h3 className="text-2xl font-semibold mb-4">Data Privacy Guarantee</h3>
              <p className="text-purple-100 leading-relaxed">
                Your financial information is never shared or sold to third parties. Your trust is our priority.
              </p>
            </div>
            <div ref={el => sectionRefs.current[23] = el} className="p-8 rounded-2xl bg-purple-600 shadow-xl animate-on-scroll scale-in animate-delay-300">
              <BarChart2 className="h-12 w-12 text-white mx-auto mb-6" />
              <h3 className="text-2xl font-semibold mb-4">Secure Infrastructure</h3>
              <p className="text-purple-100 leading-relaxed">
                Built on a robust and secure cloud infrastructure designed for maximum reliability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6 md:px-12 bg-gray-100">
        <div className="max-w-6xl mx-auto">
          <h2 ref={el => sectionRefs.current[9] = el} className="text-4xl font-bold text-center mb-16 text-gray-900 animate-on-scroll fade-in-up">How FinanceFlow Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div ref={el => sectionRefs.current[10] = el} className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-md border border-gray-200 animate-on-scroll fade-in-up animate-delay-100">
              <div className="bg-purple-200 p-5 rounded-full inline-flex mb-6">
                <CheckCircle className="h-10 w-10 text-purple-700" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-gray-900">1. Sign Up & Connect</h3>
              <p className="text-gray-700 leading-relaxed">
                Create your free FinanceFlow account in minutes. Securely connect your bank accounts for seamless data import.
              </p>
            </div>

            {/* Step 2 */}
            <div ref={el => sectionRefs.current[11] = el} className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-md border border-gray-200 animate-on-scroll fade-in-up animate-delay-200">
              <div className="bg-green-200 p-5 rounded-full inline-flex mb-6">
                <TrendingUp className="h-10 w-10 text-green-700" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-gray-900">2. Track & Categorize</h3>
              <p className="text-gray-700 leading-relaxed">
                Automatically track your income and expenses. Easily categorize transactions to understand where your money goes.
              </p>
            </div>

            {/* Step 3 */}
            <div ref={el => sectionRefs.current[12] = el} className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-md border border-gray-200 animate-on-scroll fade-in-up animate-delay-300">
              <div className="bg-yellow-200 p-5 rounded-full inline-flex mb-6">
                <PiggyBank className="h-10 w-10 text-yellow-700" />
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-gray-900">3. Budget & Achieve</h3>
              <p className="text-gray-700 leading-relaxed">
                Set personalized budgets, monitor your spending, and set financial goals to achieve your dreams faster.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-gradient-to-r from-purple-600 to-indigo-700 py-20 px-6 md:px-12 text-center text-white rounded-t-3xl shadow-lg">
        <div ref={el => sectionRefs.current[27] = el} className="max-w-3xl mx-auto animate-on-scroll fade-in-up">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Financial Future?</h2>
          <p className="text-xl mb-10 opacity-90">
            Join thousands of users who are already achieving their financial goals with FinanceFlow.
          </p>
          <button className="bg-white text-purple-700 hover:bg-gray-100 font-bold py-3 px-10 rounded-full text-lg shadow-xl transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-300"
          onClick={handleGetStarted}>
            Get Started - It's Free!
          </button>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-300 py-12 px-6 md:px-12 shadow-lg">
        <div className="max-w-7xl mx-auto">
          {/* Main Footer Content */}
          <div className="flex flex-col md:flex-row justify-between items-start mb-10 gap-8 md:gap-16">
            {/* Brand Section */}
            <div className="flex-shrink-0 md:w-1/3 lg:w-1/4">
              <div className="flex items-center mb-4">
                {/* Logo SVG */}
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="mr-2">
                  <path d="M16 4L20 8H12L16 4Z" fill="currentColor" />
                  <path d="M8 12L12 16L8 20V12Z" fill="currentColor" />
                  <path d="M24 12V20L20 16L24 12Z" fill="currentColor" />
                  <path d="M16 28L12 24H20L16 28Z" fill="currentColor" />
                  <circle cx="16" cy="16" r="3" fill="currentColor" />
                </svg>
                <span className="text-3xl font-bold tracking-tight text-white">FinanceFlow</span>
              </div>
              <p className="text-gray-400 leading-relaxed text-sm">
                Take control of your finances with our comprehensive personal finance management platform.
              </p>
            </div>

            {/* Links Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 flex-grow">
              {/* Product Links */}
              <div className="link-group">
                <h4 className="font-bold text-lg mb-4 text-gray-200">Product</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#features" className="hover:text-white transition duration-300">Features</a></li>
                  <li><a href="#pricing" className="hover:text-white transition duration-300">Pricing</a></li>
                  <li><a href="#security" className="hover:text-white transition duration-300">Security</a></li>
                  <li><a href="#integrations" className="hover:text-white transition duration-300">Integrations</a></li>
                </ul>
              </div>

              {/* Company Links */}
              <div className="link-group">
                <h4 className="font-bold text-lg mb-4 text-gray-200">Company</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#about" className="hover:text-white transition duration-300">About</a></li>
                  <li><a href="#careers" className="hover:text-white transition duration-300">Careers</a></li>
                  <li><a href="#blog" className="hover:text-white transition duration-300">Blog</a></li>
                  <li><a href="#press" className="hover:text-white transition duration-300">Press</a></li>
                </ul>
              </div>

              {/* Support Links */}
              <div className="link-group">
                <h4 className="font-bold text-lg mb-4 text-gray-200">Support</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#help" className="hover:text-white transition duration-300">Help Center</a></li>
                  <li><a href="#contact" className="hover:text-white transition duration-300">Contact</a></li>
                  <li><a href="#status" className="hover:text-white transition duration-300">Status</a></li>
                  <li><a href="#community" className="hover:text-white transition duration-300">Community</a></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p className="mb-4 md:mb-0">&copy; {new Date().getFullYear()} FinanceFlow. All rights reserved.</p>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              <a href="#privacy" className="hover:text-white transition duration-300">Privacy Policy</a>
              <a href="#terms" className="hover:text-white transition duration-300">Terms of Service</a>
              <a href="#cookies" className="hover:text-white transition duration-300">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
