
"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ShieldCheck, Eye, EyeOff, Lock, Mail, ChevronRight, Sparkles, MapPin, Phone, User, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useFirestore, useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';

export default function Register() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const db = useFirestore();
  const auth = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    city: '',
    agreedToTerms: false,
    consentedToBackground: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const initializeUserProfile = async (uid: string, email: string, firstName: string, lastName: string) => {
    if (!db) return;
    
    // Create RBAC User Document
    await setDoc(doc(db, 'users', uid), {
      uid,
      email,
      role: 'Service Provider',
      firstName,
      lastName,
      createdAt: serverTimestamp(),
    });

    // Create Domain Entity Document
    await setDoc(doc(db, 'serviceProviders', uid), {
      id: uid,
      email,
      firstName,
      lastName,
      phoneNumber: formData.phone || '',
      addressCity: formData.city || '',
      status: 'pending_approval',
      registrationDate: new Date().toISOString(),
      serviceAreaZipCodes: [],
      averageRating: 0,
    });
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setErrorDetails(null);
    
    if (formData.password !== formData.confirmPassword) {
      toast({ variant: "destructive", title: "Passwords Mismatch", description: "The passwords do not match." });
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      setStep(2);
    } catch (error: any) {
      console.error("Signup Error:", error);
      if (error.code === 'auth/operation-not-allowed' || error.message.includes('signup-are-blocked')) {
        setErrorDetails("Registration is blocked for this project. This usually means the 'Identity Toolkit API' is restricted in Google Cloud or 'User registration' is disabled in Firebase Auth settings.");
      } else {
        setErrorDetails(error.message);
      }
      
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.code || "An unexpected error occurred.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    if (!auth || !db) return;
    setLoading(true);
    setErrorDetails(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        const [first, ...rest] = (result.user.displayName || "").split(" ");
        await initializeUserProfile(result.user.uid, result.user.email!, first, rest.join(" "));
        router.push("/dashboard");
      }
    } catch (error: any) {
      setErrorDetails(error.message);
      toast({ variant: "destructive", title: "Sign-in Error", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth?.currentUser || !db) return;

    if (!formData.agreedToTerms || !formData.consentedToBackground) {
      toast({ variant: "destructive", title: "Action Required", description: "Please accept the terms." });
      return;
    }

    setLoading(true);
    try {
      await initializeUserProfile(
        auth.currentUser.uid, 
        auth.currentUser.email!, 
        formData.firstName, 
        formData.lastName
      );
      router.push("/dashboard");
    } catch (error: any) {
      setErrorDetails(error.message);
      toast({ variant: "destructive", title: "Profile Error", description: "Failed to save details." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-6 lg:px-12 h-20 flex items-center bg-white border-b sticky top-0 z-50">
        <Link href="/">
          <Image 
            src="https://firebasestorage.googleapis.com/v0/b/studio-3673070449-f277c.firebasestorage.app/o/brand%2Fcleansweep-logo.png?alt=media"
            alt="CleanSweep Logo"
            width={180}
            height={45}
            priority
          />
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 bg-secondary/20">
        <Card className="w-full max-w-xl shadow-2xl border-none rounded-[2rem] overflow-hidden bg-white mb-8">
          <CardHeader className="bg-primary/5 p-8 border-b text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Sparkles className="w-6 h-6" />
              </div>
            </div>
            <CardTitle className="text-2xl text-primary font-bold font-headline">
              {step === 1 ? "Provider Registration" : "Service Profile"}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-8 space-y-6">
            {errorDetails && (
              <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800 rounded-xl">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Registration Blocked</AlertTitle>
                <AlertDescription className="text-xs">
                  {errorDetails}
                </AlertDescription>
              </Alert>
            )}

            {step === 1 ? (
              <div className="space-y-6">
                <form onSubmit={handleEmailSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Work Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="pro@cleansweep.com" className="pl-10 h-12 rounded-xl" required />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input id="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleInputChange} className="pl-10 h-12 rounded-xl" required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input id="confirmPassword" type={showPassword ? "text" : "password"} value={formData.confirmPassword} onChange={handleInputChange} className="h-12 rounded-xl" required />
                    </div>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-14 bg-primary text-white hover:bg-primary/90 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20">
                    {loading ? "Connecting..." : "Continue Registration"}
                    <ChevronRight className="ml-2 w-5 h-5" />
                  </Button>
                </form>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-4 text-muted-foreground font-bold">Or</span></div>
                </div>

                <Button variant="outline" onClick={handleGoogleSignup} disabled={loading} className="w-full h-14 rounded-2xl border-primary/20 font-bold text-lg">
                  <Image src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width={20} height={20} className="mr-3" />
                  Sign up with Google
                </Button>
              </div>
            ) : (
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="firstName" value={formData.firstName} onChange={handleInputChange} className="pl-10 h-12 rounded-xl" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" value={formData.lastName} onChange={handleInputChange} className="h-12 rounded-xl" required />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" value={formData.phone} onChange={handleInputChange} className="h-12 rounded-xl" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" value={formData.city} onChange={handleInputChange} className="h-12 rounded-xl" required />
                  </div>
                </div>
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-start space-x-3">
                    <Checkbox id="terms" checked={formData.agreedToTerms} onCheckedChange={(c) => setFormData(p => ({ ...p, agreedToTerms: !!c }))} />
                    <Label htmlFor="terms" className="text-sm font-medium leading-tight">Accept Provider Terms</Label>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Checkbox id="background" checked={formData.consentedToBackground} onCheckedChange={(c) => setFormData(p => ({ ...p, consentedToBackground: !!c }))} />
                    <Label htmlFor="background" className="text-sm font-medium leading-tight">Consent to Background Check</Label>
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full h-14 bg-accent text-accent-foreground hover:bg-accent/90 rounded-2xl font-bold text-lg">
                  {loading ? "Finalizing..." : "Complete Application"}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="p-8 pt-0 flex flex-col items-center border-t bg-secondary/5">
            <p className="text-sm text-muted-foreground font-medium pt-6">
              Already have an account? <Link href="/login" className="text-primary font-bold hover:underline">Log in</Link>
            </p>
          </CardFooter>
        </Card>


      </main>
    </div>
  );
}
