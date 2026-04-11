import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Upload, ImageIcon, Trash2, Eye, LogOut, Plus } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { cn } from '@/lib/utils';

// Helper function to format currency in rupees
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

interface Image {
  url: string;
  public_id: string;
  alt?: string;
}

const EditAuction = () => {
  const { auctionId } = useParams<{ auctionId: string }>();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { emitProductUpdate } = useSocket();

  const [loading, setLoading] = useState(true);
  const [formSubmitting, setFormSubmitting] = useState(false);
  interface AuctionData {
    seller_id: { id: string };
    title: string;
    description: string;
    category: string;
    starting_price: number;
    bid_increment: number;
    condition: string;
    start_time: string;
    end_time: string;
    images: Image[];
    total_bids: number;
  }

  const [auction, setAuction] = useState<AuctionData | null>(null);

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

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [uploadedImages, setUploadedImages] = useState<Image[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // Fetch auction details or set up for new auction
  useEffect(() => {
    const setupAuction = async () => {
      // If auctionId is 'new', we're creating a new auction
      if (auctionId === 'new') {
        setLoading(false);
        return;
      }

      // Otherwise, fetch existing auction details
      if (!auctionId) {
        toast.error('No auction ID provided');
        navigate('/seller-dashboard');
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem('auth-token');
        const response = await fetch(`http://localhost:8080/api/auctions/${auctionId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch auction details');
        }

        const data = await response.json();
        const auction = data.auction;

        // Check if the auction belongs to the current user
        if (auction.seller_id.id !== user?.id) {
          toast.error('You do not have permission to edit this auction');
          navigate('/seller-dashboard');
          return;
        }

        setAuction(auction);

        // Format dates for datetime-local input
        const formatDateForInput = (dateString: string) => {
          const date = new Date(dateString);
          return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDThh:mm
        };

        // Populate form data
        setFormData({
          title: auction.title || '',
          description: auction.description || '',
          category: auction.category || '',
          starting_price: auction.starting_price?.toString() || '',
          bid_increment: auction.bid_increment?.toString() || '',
          condition: auction.condition || '',
          start_time: formatDateForInput(auction.start_time) || '',
          end_time: formatDateForInput(auction.end_time) || ''
        });

        // Set uploaded images
        if (auction.images && auction.images.length > 0) {
          setUploadedImages(auction.images);
        }

      } catch (error) {
        console.error('Error fetching auction:', error);
        toast.error('Failed to load auction details');
        navigate('/seller-dashboard');
      } finally {
        setLoading(false);
      }
    };

    setupAuction();
  }, [auctionId, navigate, user?.id]);

  // Handle input changes
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

    // Clear error for this field when user selects
    if (formErrors[id]) {
      setFormErrors(prev => ({
        ...prev,
        [id]: ''
      }));
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(filesArray);

      // Create preview URLs
      const urls = filesArray.map(file => URL.createObjectURL(file));
      setPreviewUrls(urls);
    }
  };

  // Upload images to Cloudinary
  const uploadImages = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    const uploadedImgs: Image[] = [];

    try {
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'bidblaze_uploads');

        const response = await fetch('https://api.cloudinary.com/v1_1/dkgbqtgpy/image/upload', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error('Failed to upload image');
        }

        const data = await response.json();
        uploadedImgs.push({
          url: data.secure_url,
          public_id: data.public_id
        });
      }

      // Add new images to existing ones
      setUploadedImages(prev => [...prev, ...uploadedImgs]);

      // Clear selected files and previews
      setSelectedFiles([]);
      setPreviewUrls([]);

      toast.success('Images uploaded successfully');

      // Clear any image-related errors
      if (formErrors.images) {
        setFormErrors(prev => ({ ...prev, images: '' }));
      }

    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  // Remove an uploaded image
  const removeUploadedImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
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
    if (!formData.condition) errors.condition = 'Condition is required';
    if (!formData.start_time) errors.start_time = 'Start time is required';
    if (!formData.end_time) errors.end_time = 'End time is required';
    else if (new Date(formData.start_time) >= new Date(formData.end_time)) {
      errors.end_time = 'End time must be after start time';
    }

    // Require at least 5 uploaded images
    if (uploadedImages.length < 5) {
      errors.images = 'Please upload at least 5 images';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleUpdateAuction = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setFormSubmitting(true);

      const auctionData = {
        ...formData,
        starting_price: parseFloat(formData.starting_price),
        bid_increment: parseFloat(formData.bid_increment),
        images: uploadedImages
      };

      const token = localStorage.getItem('auth-token');

      // Determine if we're creating a new auction or updating an existing one
      const isNewAuction = auctionId === 'new';
      const url = isNewAuction
        ? 'http://localhost:8080/api/auctions'
        : `http://localhost:8080/api/auctions/${auctionId}`;

      const method = isNewAuction ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(auctionData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errMsg = errorData.message || (Array.isArray(errorData.errors) && errorData.errors.length > 0 ? errorData.errors.map((e: { msg: string }) => e.msg).join(', ') : `Failed to ${isNewAuction ? 'create' : 'update'} auction`);
        throw new Error(errMsg);
      }

      const data = await response.json();
      const actionId = isNewAuction ? data.auction.id : auctionId;

      // Emit socket event for product update
      emitProductUpdate(actionId, { action: isNewAuction ? 'create' : 'update' });

      toast.success(`Auction ${isNewAuction ? 'created' : 'updated'} successfully!`);
      navigate('/seller-dashboard');

    } catch (error) {
      console.error(`Error ${auctionId === 'new' ? 'creating' : 'updating'} auction: `, error);
      toast.error(error instanceof Error ? error.message : `Failed to ${auctionId === 'new' ? 'create' : 'update'} auction`);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleLogout = () => {
    signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-950 dark:via-blue-950/10 dark:to-gray-900">
        <Navbar />
        <div className="container mx-auto px-4 py-8 pt-20">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg shadow-sm"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-950 dark:via-blue-950/10 dark:to-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8 pt-20">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/seller-dashboard')}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border-blue-200/20 dark:border-blue-700/30 overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 to-indigo-600"></div>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
              {auctionId === 'new' ? 'Create New Auction' : 'Edit Auction'}
            </CardTitle>
            <CardDescription>
              {auctionId === 'new' ? 'Fill in the details to create a new auction' : 'Update the details of your auction'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Auction Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter auction title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={formErrors.title ? 'border-red-500' : ''}
                  />
                  {formErrors.title && <p className="text-red-500 text-xs mt-1">{formErrors.title}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => handleSelectChange(value, 'category')}>
                    <SelectTrigger className={formErrors.category ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="watches">Watches</SelectItem>
                      <SelectItem value="art">Art</SelectItem>
                      <SelectItem value="jewelry">Jewelry</SelectItem>
                      <SelectItem value="cars">Cars</SelectItem>
                      <SelectItem value="books">Books</SelectItem>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="collectibles">Collectibles</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {formErrors.category && <p className="text-red-500 text-xs mt-1">{formErrors.category}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your item in detail..."
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className={formErrors.description ? 'border-red-500' : ''}
                />
                {formErrors.description && <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="starting_price">Starting Price (₹)</Label>
                  <Input
                    id="starting_price"
                    type="number"
                    placeholder="1000"
                    min="100"
                    value={formData.starting_price}
                    onChange={handleInputChange}
                    className={formErrors.starting_price ? 'border-red-500' : ''}
                    disabled={auction?.total_bids > 0} // Disable if auction has bids
                  />
                  {formErrors.starting_price && <p className="text-red-500 text-xs mt-1">{formErrors.starting_price}</p>}
                  {auction?.total_bids > 0 && (
                    <p className="text-amber-500 text-xs mt-1">Starting price cannot be changed once bids are placed</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bid_increment">Bid Increment (₹)</Label>
                  <Input
                    id="bid_increment"
                    type="number"
                    placeholder="100"
                    min="1"
                    value={formData.bid_increment}
                    onChange={handleInputChange}
                    className={formErrors.bid_increment ? 'border-red-500' : ''}
                    disabled={auction?.total_bids > 0} // Disable if auction has bids
                  />
                  {formErrors.bid_increment && <p className="text-red-500 text-xs mt-1">{formErrors.bid_increment}</p>}
                  {auction?.total_bids > 0 && (
                    <p className="text-amber-500 text-xs mt-1">Bid increment cannot be changed once bids are placed</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="condition">Condition</Label>
                  <Select
                    value={formData.condition}
                    onValueChange={(value) => handleSelectChange(value, 'condition')}
                  >
                    <SelectTrigger className={formErrors.condition ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="like_new">Like New</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                  {formErrors.condition && <p className="text-red-500 text-xs mt-1">{formErrors.condition}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="start_time">Start Time</Label>
                  <Input
                    id="start_time"
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={handleInputChange}
                    className={formErrors.start_time ? 'border-red-500' : ''}
                  />
                  {formErrors.start_time && <p className="text-red-500 text-xs mt-1">{formErrors.start_time}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_time">End Time</Label>
                  <Input
                    id="end_time"
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={handleInputChange}
                    className={formErrors.end_time ? 'border-red-500' : ''}
                  />
                  {formErrors.end_time && <p className="text-red-500 text-xs mt-1">{formErrors.end_time}</p>}
                </div>
              </div>

              {/* Image upload section */}
              <div className="space-y-2">
                <Label>Product Images (Required)</Label>
                <div className="border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg p-4 text-center">
                  <Upload className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Upload at least 5 images of your product (you can add more)
                  </p>
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="product-images"
                  />
                  <Label
                    htmlFor="product-images"
                    className="cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium inline-block"
                  >
                    <ImageIcon className="h-4 w-4 mr-1 inline" />
                    Select Images
                  </Label>
                </div>
                {formErrors.images && <p className="text-red-500 text-xs mt-1">{formErrors.images}</p>}
              </div>

              {/* Preview selected images */}
              {previewUrls.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Images</Label>
                  <div className="grid grid-cols-3 gap-4">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Preview ${index + 1} `}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
                            setPreviewUrls(previewUrls.filter((_, i) => i !== index));
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={uploadImages}
                    disabled={uploading || selectedFiles.length === 0}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
                  >
                    {uploading ? 'Uploading...' : 'Upload Selected Images'}
                  </Button>
                </div>
              )}

              {/* Display uploaded images */}
              {uploadedImages.length > 0 && (
                <div className="space-y-2">
                  <Label>Uploaded Images</Label>
                  <div className="grid grid-cols-3 gap-4">
                    {uploadedImages.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img.url}
                          alt={`Uploaded ${index + 1} `}
                          className="w-full h-24 object-cover rounded-lg border-2 border-green-500"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeUploadedImage(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                          Uploaded
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                onClick={handleUpdateAuction}
                disabled={formSubmitting}
              >
                {formSubmitting ? (auctionId === 'new' ? 'Creating...' : 'Updating...') : (
                  <>{auctionId === 'new' ? 'Create Auction' : 'Update Auction'}</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default EditAuction;