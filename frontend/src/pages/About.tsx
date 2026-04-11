
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, ShieldCheck, CreditCard, RefreshCw, DollarSign, CheckCircle } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-20">
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h1 className="text-4xl font-bold mb-6">About BidBlaze</h1>
              <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed text-lg">
                BidBlaze is a premier real-time auction platform that ensures security, transparency, 
                and fairness in every transaction through strict verification processes and secure payment handling.
              </p>
            </div>
            
            {/* Security & Verification Section */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold mb-8 text-center">Security & Verification</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <ShieldCheck className="w-8 h-8 text-green-600 mr-3" />
                    <h3 className="text-xl font-bold">Strict KYC for Sellers</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    All sellers must complete a comprehensive KYC (Know Your Customer) verification process 
                    before they can list any items on our platform. This ensures authenticity and builds 
                    trust in our marketplace.
                  </p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <Shield className="w-8 h-8 text-blue-600 mr-3" />
                    <h3 className="text-xl font-bold">Mandatory 2FA</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    Both users and sellers must enable Two-Factor Authentication (2FA) to enhance 
                    account security and protect against unauthorized access to your account.
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Security Section */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold mb-8 text-center">Secure Payment Process</h2>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-8 mb-8">
                <div className="flex items-center mb-6">
                  <CreditCard className="w-10 h-10 text-blue-600 mr-4" />
                  <h3 className="text-2xl font-bold">20% Security Deposit</h3>
                </div>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <p className="leading-relaxed">
                    To participate in any auction, users must deposit 20% of the item's value before bidding. 
                    This ensures serious participation and protects both buyers and sellers.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3 mt-1">
                        <span className="text-blue-600 font-bold">1</span>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Deposit Held</h4>
                        <p className="text-sm">Amount is securely held during the auction</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-3 mt-1">
                        <span className="text-green-600 font-bold">2</span>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">If You Lose</h4>
                        <p className="text-sm">Full refund within 24 hours</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mr-3 mt-1">
                        <span className="text-purple-600 font-bold">3</span>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">If You Win</h4>
                        <p className="text-sm">Amount adjusted in final payment</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <RefreshCw className="w-8 h-8 text-green-600 mr-3" />
                  <h3 className="text-xl font-bold">Powered by Razorpay</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  All payments are processed securely through Razorpay, ensuring your financial information 
                  is protected with industry-standard encryption. We temporarily hold your deposit in a 
                  secure escrow system until the auction concludes.
                </p>
              </div>
            </div>

            {/* Platform Fees Section */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold mb-8 text-center">Transparent Pricing</h2>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <DollarSign className="w-8 h-8 text-yellow-600 mr-3" />
                  <h3 className="text-xl font-bold">Platform Commission</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  BidBlaze charges a fixed commission fee to sellers only after a successful auction. 
                  This ensures that sellers only pay when they make a sale, and buyers participate 
                  without additional platform fees.
                </p>
                <div className="bg-white dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    <strong>Note:</strong> Commission rates vary by item category and are clearly displayed 
                    before listing. No hidden fees or surprise charges.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  At BidBlaze, our mission is to revolutionize online auctions by providing a real-time, 
                  secure, and user-friendly platform that brings together buyers, sellers, and auction 
                  enthusiasts. We strive to:
                </p>
                <ul className="text-gray-600 dark:text-gray-300 mb-6 space-y-2 list-disc pl-6">
                  <li>Simplify the auction process by centralizing auction listings from multiple platforms</li>
                  <li>Ensure transparency and fairness through fraud detection, KYC verification, and secure payments</li>
                  <li>Empower users with real-time updates using WebSockets and AI-driven analytics</li>
                  <li>Enhance accessibility with seamless bidding, external auction tracking, and a future mobile app</li>
                  <li>Create a trusted marketplace where every transaction is secure, efficient, and hassle-free</li>
                </ul>
              </div>
              <div className="rounded-xl overflow-hidden shadow-lg">
                <img 
                  src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=1200&h=800" 
                  alt="BidBlaze Team" 
                  className="w-full h-auto"
                />
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 mb-16">
              <h2 className="text-2xl font-bold mb-6 text-center">Key Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
                  <h3 className="font-bold text-lg mb-3">Real-Time Bidding</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Experience seamless, live auction updates without page refreshes.
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
                  <h3 className="font-bold text-lg mb-3">External Auction Tracking</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Monitor auctions from multiple platforms all in one place.
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
                  <h3 className="font-bold text-lg mb-3">Secure Transactions</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Safe and reliable payment processing for all transactions.
                  </p>
                </div>
              </div>
            </div>

            {/* Fairness & Transparency Section */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-8 mb-16">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Fairness & Transparency Guarantee</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto">
                  BidBlaze is committed to ensuring fairness and transparency in every transaction. 
                  Our platform uses advanced algorithms to detect suspicious activities, maintains 
                  complete auction histories, and provides real-time updates to all participants. 
                  With our secure escrow system, verified seller network, and transparent fee structure, 
                  you can bid with confidence knowing that every auction is conducted with the highest 
                  standards of integrity and security.
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-6">Ready to Start Bidding?</h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link to="/auctions">Explore Auctions</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/user-signup">Create an Account</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
