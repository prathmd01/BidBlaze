import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  Camera,
  Save,
  ArrowLeft,
  Shield,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

// Validation schema for user profile
const userProfileSchema = z.object({
  full_name: z.string().min(2, { message: "Full name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip_code: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
});

// Validation schema for seller profile
const sellerProfileSchema = z.object({
  business_name: z.string().min(2, { message: "Business name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip_code: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  bio: z.string().max(500, { message: "Bio cannot exceed 500 characters" }).optional(),
  website: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal('')),
});

const ProfileEdit = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Choose schema based on user role
  const schema = user?.role === 'seller' ? sellerProfileSchema : userProfileSchema;

  type FormValues = {
    full_name?: string;
    business_name?: string;
    email: string;
    phone?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      zip_code?: string;
      country?: string;
    };
    bio?: string;
    website?: string;
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: user?.full_name || '',
      business_name: user?.business_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: {
        street: user?.address?.street || '',
        city: user?.address?.city || '',
        state: user?.address?.state || '',
        zip_code: user?.address?.zip_code || '',
        country: user?.address?.country || '',
      },
      bio: user?.bio || '',
      website: user?.website || '',
    },
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Set form values when user data is available
    form.reset({
      full_name: user.full_name || '',
      business_name: user.business_name || '',
      email: user.email || '',
      phone: user.phone || '',
      address: {
        street: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        zip_code: user.address?.zip_code || '',
        country: user.address?.country || '',
      },
      bio: user.bio || '',
      website: user.website || '',
    });
  }, [user, navigate, form]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('image', file);

    const token = localStorage.getItem('auth-token');
    const response = await fetch('/api/images/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload avatar');
    }

    const data = await response.json();
    return data.image.url;
  };

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      let avatarUrl = user?.avatar_url;

      // Upload new avatar if selected
      if (selectedFile) {
        setUploading(true);
        avatarUrl = await uploadAvatar(selectedFile);
        setUploading(false);
      }

      // Prepare update data
      const updateData = {
        ...values,
        avatar_url: avatarUrl,
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined || updateData[key] === '') {
          delete updateData[key];
        }
      });

      const token = localStorage.getItem('auth-token');
      const response = await fetch(`/api/users/${user?.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        toast.success('Profile updated successfully!');
        // Refresh user data
        window.location.reload();
      } else {
        let description = 'Unknown error';
        try {
          const error = await response.json();
          description = error.message || (error.errors && error.errors[0]?.msg) || description;
        } catch {
          void 0;
        }
        toast.error('Failed to update profile', { description });
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const getUserDisplayName = () => {
    if (user?.full_name) return user.full_name;
    if (user?.business_name) return user.business_name;
    if (user?.email) return user.email.split('@')[0];
    return "User";
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getKycStatusColor = (status?: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getKycStatusIcon = (status?: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <AlertCircle className="h-4 w-4" />;
      case 'rejected': return <AlertCircle className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 dark:from-gray-900 dark:via-red-900/20 dark:to-orange-900/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Edit Profile
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Update your account information
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border-red-200/20 dark:border-red-700/30">
              <CardHeader className="text-center">
                <div className="relative inline-block">
                  <Avatar className="h-24 w-24 mx-auto mb-4">
                    <AvatarImage src={previewUrl || user.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-2xl">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full p-0 border-2 border-white dark:border-gray-800"
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                  >
                    <Camera className="h-3 w-3" />
                  </Button>
                  <Input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {getUserDisplayName()}
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  {user.email}
                </CardDescription>
                <div className="flex items-center justify-center space-x-2 mt-2">
                  <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                    {user.role === 'seller' ? 'Seller' : 'User'}
                  </Badge>
                  {user.role === 'seller' && user.kyc_status && (
                    <Badge className={getKycStatusColor(user.kyc_status)}>
                      {getKycStatusIcon(user.kyc_status)}
                      <span className="ml-1 capitalize">{user.kyc_status}</span>
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center space-x-3 text-sm">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">{user.phone}</span>
                    </div>
                  )}
                  {user.address && (
                    <div className="flex items-start space-x-3 text-sm">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {user.address.street && `${user.address.street}, `}
                        {user.address.city && `${user.address.city}, `}
                        {user.address.state && `${user.address.state} `}
                        {user.address.zip_code && `${user.address.zip_code}`}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Edit Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border-red-200/20 dark:border-red-700/30">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {user.role === 'seller' ? 'Business Information' : 'Personal Information'}
                </CardTitle>
                <CardDescription>
                  Update your {user.role === 'seller' ? 'business' : 'personal'} details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
                      {user.role === 'seller' ? (
                        <>
                          <Building2 className="h-5 w-5 mr-2 text-red-600" />
                          Business Details
                        </>
                      ) : (
                        <>
                          <User className="h-5 w-5 mr-2 text-red-600" />
                          Personal Details
                        </>
                      )}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={user.role === 'seller' ? 'business_name' : 'full_name'}>
                          {user.role === 'seller' ? 'Business Name' : 'Full Name'}
                        </Label>
                        <Input
                          id={user.role === 'seller' ? 'business_name' : 'full_name'}
                          {...form.register(user.role === 'seller' ? 'business_name' : 'full_name')}
                          placeholder={user.role === 'seller' ? 'Enter business name' : 'Enter full name'}
                        />
                        {form.formState.errors[user.role === 'seller' ? 'business_name' : 'full_name'] && (
                          <p className="text-sm text-red-600">
                            {form.formState.errors[user.role === 'seller' ? 'business_name' : 'full_name']?.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          {...form.register('email')}
                          placeholder="Enter email address"
                        />
                        {form.formState.errors.email && (
                          <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        {...form.register('phone')}
                        placeholder="Enter phone number"
                      />
                    </div>


                    {user.role === 'seller' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea
                            id="bio"
                            {...form.register('bio')}
                            placeholder="Tell us about your business"
                            className="resize-none"
                          />
                          {form.formState.errors.bio && (
                            <p className="text-sm text-red-600">{form.formState.errors.bio.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="website">Website</Label>
                          <Input
                            id="website"
                            {...form.register('website')}
                            placeholder="https://example.com"
                          />
                          {form.formState.errors.website && (
                            <p className="text-sm text-red-600">{form.formState.errors.website.message}</p>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  <Separator />

                  {/* Address Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-red-600" />
                      Address Information
                    </h3>

                    <div className="space-y-2">
                      <Label htmlFor="street">Street Address</Label>
                      <Input
                        id="street"
                        {...form.register('address.street')}
                        placeholder="Enter street address"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          {...form.register('address.city')}
                          placeholder="Enter city"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="state">State/Province</Label>
                        <Input
                          id="state"
                          {...form.register('address.state')}
                          placeholder="Enter state"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="zip_code">ZIP/Postal Code</Label>
                        <Input
                          id="zip_code"
                          {...form.register('address.zip_code')}
                          placeholder="Enter ZIP code"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        {...form.register('address.country')}
                        placeholder="Enter country"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end space-x-4 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate(-1)}
                      className="border-gray-200 text-gray-600 hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading || uploading}
                      className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                    >
                      {loading || uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {uploading ? 'Uploading...' : 'Saving...'}
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div >
  );
};

export default ProfileEdit;
