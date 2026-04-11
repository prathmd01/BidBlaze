
import { useState } from "react";
import { Button } from "@/components/ui/button";

// Sample categories data
const CATEGORIES = [
  {
    id: "watches",
    name: "Watches",
    description: "Luxury and collectible timepieces",
    imageUrl: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&q=80&w=600&h=400",
    itemCount: 253
  },
  {
    id: "art",
    name: "Art",
    description: "Fine art, paintings, and sculptures",
    imageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=600&h=400",
    itemCount: 189
  },
  {
    id: "jewelry",
    name: "Jewelry",
    description: "Precious metals and gemstone pieces",
    imageUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=600&h=400",
    itemCount: 147
  },
  {
    id: "cars",
    name: "Cars",
    description: "Vintage, classic, and luxury automobiles",
    imageUrl: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=600&h=400",
    itemCount: 92
  },
  {
    id: "books",
    name: "Books",
    description: "Rare books, first editions, and manuscripts",
    imageUrl: "https://images.unsplash.com/photo-1550399105-c4db5fb85c18?auto=format&fit=crop&q=80&w=600&h=400",
    itemCount: 128
  },
  {
    id: "furniture",
    name: "Furniture",
    description: "Antique and designer furniture",
    imageUrl: "https://images.unsplash.com/photo-1540809799-7d3a5e0115c4?auto=format&fit=crop&q=80&w=600&h=400",
    itemCount: 116
  },
  {
    id: "electronics",
    name: "Electronics",
    description: "Vintage and collectible electronic items",
    imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=600&h=400",
    itemCount: 87
  },
  {
    id: "sports",
    name: "Sports",
    description: "Sports memorabilia and collectibles",
    imageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=600&h=400",
    itemCount: 95
  },
  {
    id: "luxury-cars",
    name: "Luxury Cars",
    description: "Premium and exotic automobiles",
    imageUrl: "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&q=80&w=600&h=400",
    itemCount: 78
  },
  {
    id: "classic-cars",
    name: "Classic Cars",
    description: "Vintage and classic automobile collectibles",
    imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600&h=400",
    itemCount: 65
  },
  {
    id: "paintings",
    name: "Paintings",
    description: "Original paintings from renowned artists",
    imageUrl: "https://images.unsplash.com/photo-1579762715118-a6f1d4b934f1?auto=format&fit=crop&q=80&w=600&h=400",
    itemCount: 104
  },
  {
    id: "modern-art",
    name: "Modern Art",
    description: "Contemporary and modern art pieces",
    imageUrl: "https://images.unsplash.com/photo-1501084817091-a4f3d1d19e07?auto=format&fit=crop&q=80&w=600&h=400",
    itemCount: 83
  },
  {
    id: "luxury-homes",
    name: "Luxury Homes",
    description: "Exclusive properties and estates",
    imageUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=600&h=400",
    itemCount: 42
  },
  {
    id: "historic-properties",
    name: "Historic Properties",
    description: "Heritage buildings and historic estates",
    imageUrl: "https://images.unsplash.com/photo-1600607688969-a48377e0d24e?auto=format&fit=crop&q=80&w=600&h=400",
    itemCount: 38
  },
  {
    id: "sculptures",
    name: "Sculptures",
    description: "Fine art sculptures and installations",
    imageUrl: "https://images.unsplash.com/photo-1544413164-48043e676633?auto=format&fit=crop&q=80&w=600&h=400",
    itemCount: 76
  },
  {
    id: "antiques",
    name: "Antiques",
    description: "Rare and valuable historical items",
    imageUrl: "https://images.unsplash.com/photo-1505323686786-3a92f478f009?auto=format&fit=crop&q=80&w=600&h=400",
    itemCount: 122
  }
];

const Categories = () => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  
  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Browse Categories</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Explore auctions by category and find exactly what you're looking for
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.map((category) => (
            <div 
              key={category.id}
              className="group relative rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
              onMouseEnter={() => setHoveredCategory(category.id)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <div 
                className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-80 transition-opacity duration-300"
              />
              
              <img 
                src={category.imageUrl} 
                alt={category.name} 
                className="w-full h-64 object-cover transform transition-transform duration-500 group-hover:scale-110"
              />
              
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="text-xl font-bold mb-1">{category.name}</h3>
                <p className={`text-sm text-gray-200 mb-3 transition-all duration-300 ${
                  hoveredCategory === category.id ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0 overflow-hidden'
                }`}>
                  {category.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm">{category.itemCount} items</span>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="bg-white/10 backdrop-blur-sm border-white/30 hover:bg-white/20 transition-colors"
                  >
                    View All
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
