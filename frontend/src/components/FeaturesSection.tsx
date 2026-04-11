
import {
  Clock,
  Shield,
  Zap,
  Globe,
  MessageSquare,
  CreditCard,
  Bell,
  BarChart3
} from "lucide-react";

const FEATURES = [
  {
    icon: Clock,
    title: "Real-Time Updates",
    description: "Monitor auctions in real-time with instant bid notifications and time tracking."
  },
  {
    icon: Shield,
    title: "Secure Transactions",
    description: "Fully secure payments with Razorpay integration and fraud protection systems."
  },
  {
    icon: Zap,
    title: "Auto-Bidding",
    description: "Set your maximum bid and let our system automatically bid for you."
  },
  {
    icon: Globe,
    title: "External Auctions",
    description: "Track and monitor auctions on external platforms with easy redirection."
  },
  {
    icon: MessageSquare,
    title: "AI Support",
    description: "Get instant help from our AI-powered chatbot for any questions."
  },
  {
    icon: CreditCard,
    title: "Secure KYC",
    description: "Enhanced security with KYC verification for sellers and high-value bidders."
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Receive customized alerts for bids, outbids, and auction results."
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track your auction performance with detailed analytics and reports."
  }
];

const FeatureCard = ({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) => {
  return (
    <div className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
};

const FeaturesSection = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4">Powerful Auction Features</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Our platform combines cutting-edge technology with user-friendly design to provide the best auction experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
