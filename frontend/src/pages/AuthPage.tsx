import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Gavel, Eye, EyeOff, User, AtSign, Lock, Building2, Phone, ArrowRight } from "lucide-react";

const userSignupSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const sellerSignupSchema = z.object({
  businessName: z.string().min(2, { message: "Business name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type LoginValues = z.infer<typeof loginSchema>;
type UserSignupValues = z.infer<typeof userSignupSchema>;
type SellerSignupValues = z.infer<typeof sellerSignupSchema>;

const AuthPage = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [userType, setUserType] = useState<'user' | 'seller'>('user');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Separate forms to prevent shared state between login and signup
  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const signupForm = useForm<UserSignupValues | SellerSignupValues>({
    resolver: zodResolver(userType === 'user' ? userSignupSchema : sellerSignupSchema),
    defaultValues: userType === 'user'
      ? { fullName: '', email: '', phone: '', password: '', confirmPassword: '' }
      : { businessName: '', email: '', phone: '', password: '', confirmPassword: '' },
  });

  const onLoginSubmit = async (values: LoginValues) => {
    setIsLoading(true);
    try {
      const { error } = await signIn(values.email, values.password, userType === 'user' ? 'user' : 'seller');
      if (error) {
        toast.error("Sign in failed", { description: error || "Please check your credentials and try again." });
      } else {
        toast.success("Welcome back!", { description: "You have successfully signed in." });
        if (userType === 'seller') {
          navigate("/seller-dashboard");
        } else {
          navigate("/");
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const onSignupSubmit = async (values: UserSignupValues | SellerSignupValues) => {
    setIsLoading(true);
    try {
      if (userType === 'user') {
        const userValues = values as UserSignupValues;
        const { error } = await signUp(userValues.email, userValues.password, userValues.fullName, 'user');
        if (error) {
          toast.error("Sign up failed", { description: error || "Please try again later" });
        } else {
          toast.success("Account created!", { description: "You can now sign in." });
          setMode('login');
        }
      } else {
        const sellerValues = values as SellerSignupValues;
        const { error } = await signUp(sellerValues.email, sellerValues.password, sellerValues.businessName, 'seller');
        if (error) {
          toast.error("Sign up failed", { description: error || "Please try again later" });
        } else {
          toast.success("Seller account created!", { description: "You can now sign in as a seller." });
          setMode('login');
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden bg-black">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2787&auto=format&fit=crop"
          alt="Luxury Auction Background"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80" />
      </div>

      {/* Animated Background Blobs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-red-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-orange-600/20 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/30 mb-4">
            <Gavel className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            <span className="bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">Bid</span>Blaze
          </h1>
          <p className="text-white/60 text-sm text-center">
            {mode === 'login' ? 'Welcome back to the premium auction platform' : 'Join the world\'s most exclusive marketplace'}
          </p>
        </div>

        {/* Glassmorphism Card */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          {/* Toggle Switch */}
          <div className="flex p-1 bg-black/20 m-4 rounded-xl">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${mode === 'login'
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-white/50 hover:text-white/80'
                }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${mode === 'signup'
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-white/50 hover:text-white/80'
                }`}
            >
              Create Account
            </button>
          </div>

          <div className="p-6 pt-2">
            {mode === 'login' ? (
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  {/* User Type Selection for Login */}
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setUserType('user')}
                      className={`py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 border ${userType === 'user'
                          ? 'bg-white/10 border-red-500/50 text-white shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                          : 'bg-transparent border-white/10 text-white/60 hover:text-white hover:bg-white/5'
                        }`}
                    >
                      Buyer
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserType('seller')}
                      className={`py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 border ${userType === 'seller'
                          ? 'bg-white/10 border-orange-500/50 text-white shadow-[0_0_10px_rgba(249,115,22,0.2)]'
                          : 'bg-transparent border-white/10 text-white/60 hover:text-white hover:bg-white/5'
                        }`}
                    >
                      Seller
                    </button>
                  </div>

                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/80">Email</FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <AtSign className="absolute left-3 top-3 h-4 w-4 text-white/40 group-focus-within:text-white/80 transition-colors" />
                            <Input
                              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:bg-white/10 focus:border-white/30 transition-all"
                              placeholder="Enter your email"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/80">Password</FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-white/40 group-focus-within:text-white/80 transition-colors" />
                            <Input
                              type={showPassword ? "text" : "password"}
                              className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:bg-white/10 focus:border-white/30 transition-all"
                              placeholder="Enter your password"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-3 text-white/40 hover:text-white/80 transition-colors"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-semibold py-6 shadow-lg shadow-red-500/20 transition-all duration-300 hover:scale-[1.02]"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span>Sign In</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    )}
                  </Button>
                </form>
              </Form>
            ) : (
              <div className="space-y-4">
                {/* User Type Selection */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button
                    onClick={() => setUserType('user')}
                    className={`p-3 rounded-xl border transition-all duration-300 flex flex-col items-center gap-2 ${userType === 'user'
                      ? 'bg-white/10 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                  >
                    <User className={`h-5 w-5 ${userType === 'user' ? 'text-red-400' : 'text-white/60'}`} />
                    <span className={`text-xs font-medium ${userType === 'user' ? 'text-white' : 'text-white/60'}`}>Buyer</span>
                  </button>
                  <button
                    onClick={() => setUserType('seller')}
                    className={`p-3 rounded-xl border transition-all duration-300 flex flex-col items-center gap-2 ${userType === 'seller'
                      ? 'bg-white/10 border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.2)]'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                  >
                    <Building2 className={`h-5 w-5 ${userType === 'seller' ? 'text-orange-400' : 'text-white/60'}`} />
                    <span className={`text-xs font-medium ${userType === 'seller' ? 'text-white' : 'text-white/60'}`}>Seller</span>
                  </button>
                </div>

                <Form {...signupForm}>
                  <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-3">
                    {userType === 'user' ? (
                      <FormField
                        control={signupForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="relative group">
                                <User className="absolute left-3 top-3 h-4 w-4 text-white/40 group-focus-within:text-white/80 transition-colors" />
                                <Input
                                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:bg-white/10 focus:border-white/30 transition-all"
                                  placeholder="Full Name"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ) : (
                      <FormField
                        control={signupForm.control}
                        name="businessName"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="relative group">
                                <Building2 className="absolute left-3 top-3 h-4 w-4 text-white/40 group-focus-within:text-white/80 transition-colors" />
                                <Input
                                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:bg-white/10 focus:border-white/30 transition-all"
                                  placeholder="Business Name"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={signupForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative group">
                              <AtSign className="absolute left-3 top-3 h-4 w-4 text-white/40 group-focus-within:text-white/80 transition-colors" />
                              <Input
                                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:bg-white/10 focus:border-white/30 transition-all"
                                placeholder="Email Address"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={signupForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="relative group">
                              <Phone className="absolute left-3 top-3 h-4 w-4 text-white/40 group-focus-within:text-white/80 transition-colors" />
                              <Input
                                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:bg-white/10 focus:border-white/30 transition-all"
                                placeholder="Phone Number"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={signupForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="relative group">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-white/40 group-focus-within:text-white/80 transition-colors" />
                                <Input
                                  type={showConfirmPassword ? "text" : "password"}
                                  className="pl-10 pr-8 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:bg-white/10 focus:border-white/30 transition-all"
                                  placeholder="Password"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={signupForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="relative group">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-white/40 group-focus-within:text-white/80 transition-colors" />
                                <Input
                                  type={showConfirmPassword ? "text" : "password"}
                                  className="pl-10 pr-8 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:bg-white/10 focus:border-white/30 transition-all"
                                  placeholder="Confirm"
                                  {...field}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  className="absolute right-2 top-3 text-white/40 hover:text-white/80 transition-colors"
                                >
                                  {showConfirmPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-semibold py-6 shadow-lg shadow-red-500/20 transition-all duration-300 hover:scale-[1.02] mt-2"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Creating Account...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>Create Account</span>
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      )}
                    </Button>
                  </form>
                </Form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;