
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart, Calendar, Clock, ShieldCheck } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative pt-28 pb-20 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[30%] -right-[10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-accent/5 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Hero Content */}
          <div className="flex-1 max-w-2xl">
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-sm font-medium text-primary mb-6 animate-fade-in">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
              Real-time auction monitoring system
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 animate-fade-in [animation-delay:150ms]">
              Track & Participate in<br />
              <span className="text-gradient">Live Auctions</span> Seamlessly
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-lg animate-fade-in [animation-delay:300ms]">
              Monitor multiple auctions in real-time, place bids, and discover great deals across platforms with our secure and intuitive auction system.
            </p>

            <div className="flex flex-wrap gap-4 mb-12 animate-fade-in [animation-delay:450ms]">
              <Button size="lg" className="rounded-full group">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-full">
                Explore Auctions
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-fade-in [animation-delay:600ms]">
              <div className="text-center">
                <p className="text-3xl font-bold text-gradient">10K+</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Active Users</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gradient">5K+</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Daily Auctions</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gradient">99%</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Secure Transactions</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gradient">24/7</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Support</p>
              </div>
            </div>
          </div>

          {/* Hero Image/Graphic */}
          <div className="flex-1 w-full max-w-xl animate-fade-in [animation-delay:300ms] relative">
            <div className="glass dark:glass-dark rounded-2xl p-6 shadow-xl relative overflow-hidden animate-float">
              <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-br from-primary/30 to-accent/10 blur-2xl rounded-full -z-10"></div>

              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold">Live Auction Status</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Real-time monitoring</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-medium flex items-center">
                  <span className="h-2 w-2 rounded-full bg-green-500 mr-1.5 animate-pulse"></span>
                  Live
                </span>
              </div>

              <div className="space-y-6">
                {/* Sample auction items */}
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4 gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-md bg-gradient-to-br ${item === 1 ? 'from-blue-500 to-purple-500' :
                          item === 2 ? 'from-amber-500 to-orange-500' :
                            'from-green-500 to-teal-500'
                        } flex items-center justify-center text-white font-medium`}>
                        #{item}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">Vintage Watch Collection</h4>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>Ends in 2h 45m</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900 dark:text-gray-100">₹1,250</div>
                      <span className="text-xs text-green-600 dark:text-green-400">+₹50 ↑</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Today</span>
                  </div>
                  <div className="flex items-center">
                    <BarChart className="h-4 w-4 mr-1" />
                    <span>125 Bids</span>
                  </div>
                  <div className="flex items-center">
                    <ShieldCheck className="h-4 w-4 mr-1" />
                    <span>Secured</span>
                  </div>
                </div>
                <Button size="sm" variant="ghost" className="text-primary">View All</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
