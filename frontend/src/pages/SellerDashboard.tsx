import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { formatRupees } from '@/lib/currency';
import { useSocket } from '@/contexts/SocketContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Plus,
  Upload,
  Image as ImageIcon,
  DollarSign,
  Clock,
  Users,
  Settings,
  LogOut,
  Eye,
  Edit,
  Trash2,
  Package,
  TrendingUp,
  Info,
  Tag,
  BarChart,
  Loader2
} from 'lucide-react';
import NavbarHeader from '@/components/dashboard/NavbarHeader';
import HeroStats from '@/components/dashboard/HeroStats';
import ListingsTable, { ListingRow } from '@/components/dashboard/ListingsTable';
import AnalyticsSection from '@/components/dashboard/AnalyticsSection';
import NotificationsPanel from '@/components/dashboard/NotificationsPanel';
// Sidebar removed; navigation moved into account dropdown

interface Bid {
  _id: string;
  auction_id: string;
  bidder_id: {
    _id: string;
    full_name: string;
    email: string;
  };
  amount: number;
  is_winning: boolean;
  bid_time: string;
  status: string;
}

interface Auction {
  _id: string;
  title: string;
  description: string;
  category: string;
  starting_price: number;
  current_price: number;
  bid_increment: number;
  condition: string;
  status: string;
  images: Array<{
    url: string;
    public_id: string;
    alt?: string;
  }>;
  start_time: string;
  end_time: string;
  total_bids: number;
  createdAt: string;
  bids?: Bid[];
}

const SellerDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, loading: authLoading } = useAuth();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
  const [bidDialogOpen, setBidDialogOpen] = useState<boolean>(false);
  const [loadingBids, setLoadingBids] = useState<boolean>(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<Array<{ url: string, public_id: string }>>([]);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const { emitProductUpdate, emitImageUpdate } = useSocket();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    starting_price: '',
    bid_increment: '',
    condition: '',
    start_time: '',
    end_time: ''
  });
  const [categoryAttributes, setCategoryAttributes] = useState<Record<string, string | number | boolean>>({});

  // Form validation state
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Hydrate auctions with real bids and build recent activity notifications
  const hydrateBidsAndNotifications = async (
    auctionsList: Auction[]
  ): Promise<{ updatedAuctions: Auction[]; recentNotifications: { id: string; message: string; time: string }[] }> => {
    const token = localStorage.getItem('auth-token');
    const updatedAuctions: Auction[] = [];
    const allBids: (Bid & { auctionTitle: string })[] = [];

    for (const auction of auctionsList) {
      try {
        const res = await fetch(`http://localhost:8080/api/bids/auction/${auction._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          const bids: Bid[] = (data.bids || []).slice();
          // Mark the highest bid as winning
          if (bids.length > 0) {
            const highestAmount = Math.max(...bids.map(b => b.amount));
            bids.forEach(b => { b.is_winning = b.amount === highestAmount; });
          }
          updatedAuctions.push({ ...auction, bids });
          bids.forEach(b => allBids.push({ ...b, auctionTitle: auction.title }));
        } else {
          updatedAuctions.push(auction);
        }
      } catch {
        updatedAuctions.push(auction);
      }
    }

    // Build recent notifications from real bids only
    const recent = allBids
      .sort((a, b) => new Date(b.bid_time).getTime() - new Date(a.bid_time).getTime())
      .slice(0, 10)
      .map((b) => ({
        id: b._id,
        message: `${b.bidder_id.full_name} placed ${formatPrice(b.amount)} on ${b.auctionTitle}${b.is_winning ? ' (highest)' : ''}`,
        time: new Date(b.bid_time).toLocaleTimeString(),
      }));

    return { updatedAuctions, recentNotifications: recent };
  };

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth-token');
      const response = await fetch('http://localhost:8080/api/auctions/seller', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const { updatedAuctions, recentNotifications } = await hydrateBidsAndNotifications(data.auctions);
        setAuctions(updatedAuctions);
        setNotifications(recentNotifications);
      } else {
        console.error('Failed to fetch auctions');
        if (response.status === 401) {
          navigate('/auth');
        }
      }
    } catch (error) {
      console.error('Error fetching auctions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/auth');
      } else if (user.role !== 'seller') {
        toast.error("Access denied. Seller account required.");
        navigate('/');
      } else {
        fetchAuctions();
      }
    }
  }, [user, authLoading, navigate]);

  // Function to fetch bid details for a specific auction
  const fetchBidDetails = async (auctionId: string) => {
    setLoadingBids(true);
    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch(`http://localhost:8080/api/bids/auction/${auctionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();

        // Sort bids in ascending order by amount (lowest to highest)
        const sortedBids = [...data.bids].sort((a, b) => a.amount - b.amount);

        // Mark the highest bid
        if (sortedBids.length > 0) {
          // Find the highest bid amount
          const highestBidAmount = Math.max(...sortedBids.map(bid => bid.amount));

          // Mark bids with the highest amount
          sortedBids.forEach(bid => {
            bid.is_winning = bid.amount === highestBidAmount;
          });
        }

        // Find the auction and update it with bid details
        const updatedAuctions = auctions.map(auction => {
          if (auction._id === auctionId) {
            return { ...auction, bids: sortedBids };
          }
          return auction;
        });

        setAuctions(updatedAuctions);

        // Set the selected auction for the dialog
        const auction = updatedAuctions.find(a => a._id === auctionId);
        if (auction) {
          setSelectedAuction(auction);
          setBidDialogOpen(true);
        }
      }
    } catch (error) {
      console.error('Error fetching bid details:', error);
      toast.error('Failed to load bid details');
    } finally {
      setLoadingBids(false);
    }
  };

  // Function to delete an auction
  const deleteAuction = async (auctionId: string) => {
    // Find the auction to check if it has bids
    const auctionToDelete = auctions.find(auction => auction._id === auctionId);

    if (auctionToDelete && auctionToDelete.total_bids > 0) {
      toast.error('Cannot delete auctions with existing bids');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this auction? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('auth-token');
      const response = await fetch(`http://localhost:8080/api/auctions/${auctionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Remove the auction from the state
        setAuctions(auctions.filter(auction => auction._id !== auctionId));
        toast.success('Auction deleted successfully');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete auction');
      }
    } catch (error) {
      console.error('Error deleting auction:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete auction');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const remaining = Math.max(0, 10 - uploadedImages.length);
    const allowed = files.slice(0, remaining);
    if (files.length > remaining) {
      toast.error(`You can upload up to 10 images. ${remaining} more allowed.`);
    }
    setSelectedFiles(allowed);
    const urls = allowed.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const uploadImages = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one image');
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('images', file);
      });

      const token = localStorage.getItem('auth-token');
      const response = await fetch('http://localhost:8080/api/images/upload-multiple', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload images');
      }

      const data = await response.json();
      const uploadedImgs = data.images.map((img: { url: string; public_id: string }) => ({
        url: img.url,
        public_id: img.public_id
      }));

      setUploadedImages(uploadedImgs);
      toast.success(`${uploadedImgs.length} images uploaded successfully`);

      // Clear the file input
      setSelectedFiles([]);

      // Keep the preview URLs to show the uploaded images
      return uploadedImgs;
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
      return [];
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));

    // Clear error for this field when user types
    if (formErrors[id]) {
      setFormErrors(prev => ({
        ...prev,
        [id]: ''
      }));
    }
  };

  // Handle select changes
  const handleSelectChange = (value: string, id: string) => {
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    setCategoryAttributes({});

    // Clear error for this field when user selects
    if (formErrors[id]) {
      setFormErrors(prev => ({
        ...prev,
        [id]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.category) errors.category = 'Category is required';
    if (!formData.starting_price) errors.starting_price = 'Starting price is required';
    else if (parseFloat(formData.starting_price) < 100) errors.starting_price = 'Starting price must be at least ₹100';
    if (!formData.bid_increment) errors.bid_increment = 'Bid increment is required';
    else if (parseFloat(formData.bid_increment) < 1) errors.bid_increment = 'Bid increment must be at least ₹1';
    if (formData.category !== 'other' && !formData.condition) errors.condition = 'Condition is required';
    if (!formData.start_time) errors.start_time = 'Start time is required';
    if (!formData.end_time) errors.end_time = 'End time is required';
    else if (new Date(formData.start_time) >= new Date(formData.end_time)) {
      errors.end_time = 'End time must be after start time';
    }
    if (formData.category === 'vehicle') {
      if (!categoryAttributes.date_of_manufacture) errors.date_of_manufacture = 'Date of manufacture is required';
      if (!categoryAttributes.total_distance_driven && categoryAttributes.total_distance_driven !== 0) errors.total_distance_driven = 'Total distance driven is required';
    }
    if (formData.category === 'electronics') {
      if (!categoryAttributes.date_of_manufacture) errors.date_of_manufacture = 'Date of manufacture is required';
      if (typeof categoryAttributes.warranty_valid === 'undefined') errors.warranty_valid = 'Warranty info is required';
    }
    if (formData.category === 'art') {
      if (!categoryAttributes.artist_name) errors.artist_name = 'Artist name is required';
      if (!categoryAttributes.year_created && categoryAttributes.year_created !== 0) errors.year_created = 'Year created is required';
    }
    if (formData.category === 'watch') {
      if (!categoryAttributes.year_of_manufacture && categoryAttributes.year_of_manufacture !== 0) errors.year_of_manufacture = 'Year of manufacture is required';
      if (!categoryAttributes.movement_type) errors.movement_type = 'Movement type is required';
    }

    // Require between 1 and 10 uploaded images
    if (uploadedImages.length < 1) {
      errors.images = 'Please upload at least 1 image';
    }
    if (uploadedImages.length > 10) {
      errors.images = 'Maximum 10 images allowed';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleCreateAuction = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setFormSubmitting(true);

      const categoryMap: Record<string, string> = {
        vehicle: 'cars',
        watch: 'watches'
      };
      const conditionMap: Record<string, string> = {
        mint: 'new',
        excellent: 'like_new',
        good: 'good',
        fair: 'fair',
        'like-new': 'like_new',
        refurbished: 'good',
        used: 'fair',
        new: 'new',
        like_new: 'like_new',
        poor: 'poor'
      };

      const normalizedCategory = categoryMap[formData.category] || formData.category;
      const normalizedCondition = conditionMap[formData.condition] || formData.condition || 'good';

      const auctionData = {
        ...formData,
        category: normalizedCategory,
        condition: normalizedCondition,
        starting_price: parseFloat(formData.starting_price),
        bid_increment: parseFloat(formData.bid_increment),
        images: uploadedImages,
        attributes: categoryAttributes
      };

      const token = localStorage.getItem('auth-token');
      const response = await fetch('http://localhost:8080/api/auctions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(auctionData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errMsg = errorData.message || (Array.isArray(errorData.errors) ? errorData.errors.map((e: { msg: string }) => e.msg).join(', ') : 'Failed to create auction');
        throw new Error(errMsg);
      }

      const data = await response.json();

      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        starting_price: '',
        bid_increment: '',
        condition: '',
        start_time: '',
        end_time: ''
      });
      setCategoryAttributes({});
      setUploadedImages([]);
      setPreviewUrls([]);

      // Emit socket event for product update
      emitProductUpdate(data.auction._id, { action: 'create' });

      toast.success('Auction created successfully!');

      // Refresh auctions list
      fetchAuctions();

      // Switch to auctions tab
      const auctionsTab = document.querySelector('[data-state="inactive"][value="my-auctions"]');
      if (auctionsTab instanceof HTMLElement) {
        auctionsTab.click();
      }

    } catch (error) {
      console.error('Error creating auction:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create auction');
    } finally {
      setFormSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'ended': return 'bg-gray-100 text-gray-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price: number) => {
    return formatRupees(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Derived data for modern dashboard UI
  const totalListings = auctions.length;
  const activeAuctions = auctions.filter(a => a.status === 'active').length;
  const totalBids = auctions.reduce((sum, a) => sum + a.total_bids, 0);
  const totalRevenue = formatPrice(auctions.reduce((sum, a) => sum + (a.current_price || 0), 0));

  const [notifications, setNotifications] = useState<{ id: string; message: string; time: string }[]>([]);

  const rows: ListingRow[] = auctions.map((a) => {
    const highestBid = a.bids && a.bids.length > 0 ? Math.max(...a.bids.map(b => b.amount)) : a.current_price || a.starting_price;
    const topBidder = a.bids && a.bids.length > 0 ? a.bids.reduce((prev, curr) => (curr.amount > prev.amount ? curr : prev)).bidder_id.full_name : '—';
    return {
      id: a._id,
      imageUrl: a.images?.[0]?.url || '/placeholder.svg',
      name: a.title,
      category: a.category,
      currentBid: formatPrice(highestBid),
      highestBidderName: topBidder,
      status: (a.status || 'draft').charAt(0).toUpperCase() + (a.status || 'draft').slice(1),
    };
  });

  // Remove fake live simulation; notifications come from real bids via hydration

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950/10 to-gray-900">
        <NavbarHeader userName={user?.full_name || user?.email?.split('@')[0]} onLogout={handleLogout} />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map(i => <div key={i} className="h-40 rounded-2xl bg-white/5 border border-blue-500/20" />)}
          </div>
        </div>
      </div>
    );
  }

  const searchParams = new URLSearchParams(location.search);
  const defaultTab = (searchParams.get('tab') as 'create' | 'my-auctions' | 'analytics') || 'create';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950/10 to-gray-900 font-exo">
      <NavbarHeader userName={user?.full_name || user?.email?.split('@')[0]} onLogout={handleLogout} />
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue={defaultTab} className="space-y-8">
          <TabsList>
            <TabsTrigger value="create">Create Auction</TabsTrigger>
            <TabsTrigger value="my-auctions">My Auctions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <Card className="border-blue-500/20 bg-white/5">
              <CardHeader>
                <CardTitle>Create a new auction</CardTitle>
                <CardDescription>Provide item details, timing, and images</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" value={formData.title} onChange={handleInputChange} placeholder="e.g. 2018 BMW M3" />
                    {formErrors.title && <p className="text-red-500 text-xs">{formErrors.title}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(v) => handleSelectChange(v, 'category')}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vehicle">Vehicle</SelectItem>
                        <SelectItem value="electronics">Electronics</SelectItem>
                        <SelectItem value="art">Art</SelectItem>
                        <SelectItem value="watch">Watch</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {formErrors.category && <p className="text-red-500 text-xs">{formErrors.category}</p>}
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" value={formData.description} onChange={handleInputChange} placeholder="Describe the item" />
                    {formErrors.description && <p className="text-red-500 text-xs">{formErrors.description}</p>}
                  </div>
                </div>

                {formData.category === 'vehicle' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="dom">Date of manufacture</Label>
                      <Input id="dom" type="date" value={(categoryAttributes.date_of_manufacture as string) || ''} onChange={(e) => setCategoryAttributes(prev => ({ ...prev, date_of_manufacture: e.target.value }))} />
                      {formErrors.date_of_manufacture && <p className="text-red-500 text-xs">{formErrors.date_of_manufacture}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="distance">Total distance driven (km)</Label>
                      <Input id="distance" type="number" min={0} value={(categoryAttributes.total_distance_driven as number) ?? ''} onChange={(e) => setCategoryAttributes(prev => ({ ...prev, total_distance_driven: Number(e.target.value) }))} />
                      {formErrors.total_distance_driven && <p className="text-red-500 text-xs">{formErrors.total_distance_driven}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="condition">Condition</Label>
                      <Select value={formData.condition} onValueChange={(v) => handleSelectChange(v, 'condition')}>
                        <SelectTrigger id="condition">
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mint">Mint</SelectItem>
                          <SelectItem value="excellent">Excellent</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
                        </SelectContent>
                      </Select>
                      {formErrors.condition && <p className="text-red-500 text-xs">{formErrors.condition}</p>}
                    </div>
                  </div>
                )}

                {formData.category === 'electronics' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="edom">Date of manufacture</Label>
                      <Input id="edom" type="date" value={(categoryAttributes.date_of_manufacture as string) || ''} onChange={(e) => setCategoryAttributes(prev => ({ ...prev, date_of_manufacture: e.target.value }))} />
                      {formErrors.date_of_manufacture && <p className="text-red-500 text-xs">{formErrors.date_of_manufacture}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="warranty">Warranty valid</Label>
                      <Select value={String(categoryAttributes.warranty_valid ?? '')} onValueChange={(v) => setCategoryAttributes(prev => ({ ...prev, warranty_valid: v === 'true' }))}>
                        <SelectTrigger id="warranty">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Yes</SelectItem>
                          <SelectItem value="false">No</SelectItem>
                        </SelectContent>
                      </Select>
                      {formErrors.warranty_valid && <p className="text-red-500 text-xs">{formErrors.warranty_valid}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="condition2">Condition</Label>
                      <Select value={formData.condition} onValueChange={(v) => handleSelectChange(v, 'condition')}>
                        <SelectTrigger id="condition2">
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="like-new">Like New</SelectItem>
                          <SelectItem value="refurbished">Refurbished</SelectItem>
                          <SelectItem value="used">Used</SelectItem>
                        </SelectContent>
                      </Select>
                      {formErrors.condition && <p className="text-red-500 text-xs">{formErrors.condition}</p>}
                    </div>
                  </div>
                )}

                {formData.category === 'art' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="artist">Artist name</Label>
                      <Input id="artist" value={(categoryAttributes.artist_name as string) || ''} onChange={(e) => setCategoryAttributes(prev => ({ ...prev, artist_name: e.target.value }))} />
                      {formErrors.artist_name && <p className="text-red-500 text-xs">{formErrors.artist_name}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="year">Year created</Label>
                      <Input id="year" type="number" value={(categoryAttributes.year_created as number) ?? ''} onChange={(e) => setCategoryAttributes(prev => ({ ...prev, year_created: Number(e.target.value) }))} />
                      {formErrors.year_created && <p className="text-red-500 text-xs">{formErrors.year_created}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="condition3">Condition</Label>
                      <Select value={formData.condition} onValueChange={(v) => handleSelectChange(v, 'condition')}>
                        <SelectTrigger id="condition3">
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="excellent">Excellent</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
                        </SelectContent>
                      </Select>
                      {formErrors.condition && <p className="text-red-500 text-xs">{formErrors.condition}</p>}
                    </div>
                  </div>
                )}

                {formData.category === 'watch' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="wyear">Year of manufacture</Label>
                      <Input id="wyear" type="number" value={(categoryAttributes.year_of_manufacture as number) ?? ''} onChange={(e) => setCategoryAttributes(prev => ({ ...prev, year_of_manufacture: Number(e.target.value) }))} />
                      {formErrors.year_of_manufacture && <p className="text-red-500 text-xs">{formErrors.year_of_manufacture}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="movement">Movement type</Label>
                      <Select value={(categoryAttributes.movement_type as string) || ''} onValueChange={(v) => setCategoryAttributes(prev => ({ ...prev, movement_type: v }))}>
                        <SelectTrigger id="movement">
                          <SelectValue placeholder="Select movement" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="automatic">Automatic</SelectItem>
                          <SelectItem value="manual">Manual</SelectItem>
                          <SelectItem value="quartz">Quartz</SelectItem>
                        </SelectContent>
                      </Select>
                      {formErrors.movement_type && <p className="text-red-500 text-xs">{formErrors.movement_type}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="condition4">Condition</Label>
                      <Select value={formData.condition} onValueChange={(v) => handleSelectChange(v, 'condition')}>
                        <SelectTrigger id="condition4">
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mint">Mint</SelectItem>
                          <SelectItem value="excellent">Excellent</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                        </SelectContent>
                      </Select>
                      {formErrors.condition && <p className="text-red-500 text-xs">{formErrors.condition}</p>}
                    </div>
                  </div>
                )}

                {formData.category === 'other' && null}

                <Separator className="my-4" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="starting_price">Starting price (₹)</Label>
                    <Input id="starting_price" type="number" min={0} value={formData.starting_price} onChange={handleInputChange} />
                    {formErrors.starting_price && <p className="text-red-500 text-xs">{formErrors.starting_price}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bid_increment">Bid increment (₹)</Label>
                    <Input id="bid_increment" type="number" min={1} value={formData.bid_increment} onChange={handleInputChange} />
                    {formErrors.bid_increment && <p className="text-red-500 text-xs">{formErrors.bid_increment}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="start_time">Start time</Label>
                    <Input id="start_time" type="datetime-local" value={formData.start_time} onChange={handleInputChange} />
                    {formErrors.start_time && <p className="text-red-500 text-xs">{formErrors.start_time}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_time">End time</Label>
                    <Input id="end_time" type="datetime-local" value={formData.end_time} onChange={handleInputChange} />
                    {formErrors.end_time && <p className="text-red-500 text-xs">{formErrors.end_time}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Images</Label>
                  <div className="flex items-center gap-3">
                    <Input type="file" multiple onChange={handleFileSelect} />
                    <Button variant="secondary" onClick={uploadImages} disabled={uploading}>{uploading ? 'Uploading...' : 'Upload selected'}</Button>
                  </div>
                  {formErrors.images && <p className="text-red-500 text-xs">{formErrors.images}</p>}
                  {previewUrls.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                      {previewUrls.map((url, i) => (
                        <div key={i} className="aspect-square rounded-lg overflow-hidden border border-blue-500/20">
                          <img src={url} alt={String(i)} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                  {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                      {uploadedImages.map((img, i) => (
                        <div key={img.public_id || i} className="aspect-square rounded-lg overflow-hidden border border-green-500/20">
                          <img src={img.url} alt={img.public_id} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleCreateAuction} disabled={formSubmitting}>{formSubmitting ? 'Creating...' : 'Create Auction'}</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="my-auctions" className="space-y-6">
            <HeroStats
              totalListings={totalListings}
              activeAuctions={activeAuctions}
              totalBids={totalBids}
              totalRevenue={totalRevenue}
            />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <ListingsTable
                  rows={rows}
                  onView={(id) => navigate(`/auction/${id}`)}
                  onViewBids={(id) => fetchBidDetails(id)}
                  onDelete={(id) => deleteAuction(id)}
                />
              </div>
              <NotificationsPanel notifications={notifications} />
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsSection
              bidsOverTime={[4, 6, 3, 8, 12, 9, 14, 10, 16, 20, 18]}
              topItems={[
                { name: 'Vintage Watch', value: 85 },
                { name: 'Art Piece', value: 72 },
                { name: 'Sports Car', value: 64 },
                { name: 'NFT', value: 58 },
              ]}
              revenueTrend={[1, 2, 3, 2, 5, 6, 8, 7, 9, 12, 15]}
            />
          </TabsContent>

        </Tabs>
        <footer className="pt-6 border-t border-blue-500/20 text-center text-xs text-gray-500">Powered by BidBlaze • © 2025</footer>
      </main>
      {/* Bid History Dialog */}
      <Dialog open={bidDialogOpen} onOpenChange={setBidDialogOpen}>
        <DialogContent className="sm:max-w-md bg-gray-900 border-blue-500/20 text-white">
          <DialogHeader>
            <DialogTitle>Bid History</DialogTitle>
            <DialogDescription className="text-gray-400">
              View all bids for <span className="text-blue-400 font-medium">{selectedAuction?.title}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-3 my-4 custom-scrollbar">
            {selectedAuction?.bids && selectedAuction.bids.length > 0 ? (
              selectedAuction.bids.slice().reverse().map((bid, index) => (
                <div
                  key={bid._id || index}
                  className={`p-3 rounded-lg border ${bid.is_winning
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-white/5 border-white/10'
                    } flex justify-between items-center`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-200">{bid.bidder_id.full_name}</span>
                      {bid.is_winning && (
                        <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30 text-[10px] h-5">
                          Highest
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(bid.bid_time).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${bid.is_winning ? 'text-green-400' : 'text-gray-300'}`}>
                      {formatPrice(bid.amount)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {bid.bidder_id.email}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No bids placed yet.
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button variant="secondary" onClick={() => setBidDialogOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SellerDashboard;
