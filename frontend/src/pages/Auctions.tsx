
import Navbar from "@/components/Navbar";
import LiveAuctions from "@/components/LiveAuctions";
import Categories from "@/components/Categories";
import Footer from "@/components/Footer";

const Auctions = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-20">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-6">Auctions</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-12 max-w-3xl">
            Discover a wide range of auctions from various categories. Bid on items you love
            and track external auctions all in one place.
          </p>
        </div>
        <LiveAuctions />
        <Categories />
      </main>
      <Footer />
    </div>
  );
};

export default Auctions;
