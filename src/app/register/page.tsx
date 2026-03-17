
"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ShieldCheck, Eye, EyeOff, Lock, Mail, ChevronRight, Sparkles, MapPin, Phone, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useFirestore, useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';

export default function Register() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    
    // 1. Create RBAC User Document (for Dashboard layout verification)
    await setDoc(doc(db, 'users', uid), {
      uid,
      email,
      role: 'Service Provider',
      firstName,
      lastName,
      createdAt: serverTimestamp(),
    });

    // 2. Create Domain Entity Document (for business logic)
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
    
    if (formData.password !== formData.confirmPassword) {
      toast({ variant: "destructive", title: "Passwords Mismatch", description: "The passwords do not match." });
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      setStep(2); // Move to profile details step
    } catch (error: any) {
      console.error("Signup Error:", error);
      let message = "Could not create account. Please ensure Identity Toolkit API is enabled in Google Cloud Console.";
      if (error.code === 'auth/email-already-in-use') message = "This email is already registered.";
      if (error.code === 'auth/weak-password') message = "Password should be at least 6 characters.";
      
      toast({
        variant: "destructive",
        title: "Registration Error",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    if (!auth || !db) return;
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        const [first, ...rest] = (result.user.displayName || "").split(" ");
        await initializeUserProfile(result.user.uid, result.user.email!, first, rest.join(" "));
        toast({ title: "Welcome!", description: "Account created with Google." });
        router.push("/dashboard");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Google Sign-in Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth?.currentUser || !db) return;

    if (!formData.agreedToTerms || !formData.consentedToBackground) {
      toast({ variant: "destructive", title: "Action Required", description: "Please accept the terms and background check." });
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

      toast({ title: "Application Submitted", description: "Welcome to the CleanSweep network!" });
      router.push("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Profile Save Error",
        description: "Your account was created but your profile details failed to save. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-6 lg:px-12 h-20 flex items-center bg-white border-b sticky top-0 z-50">
        <Link className="flex items-center gap-2" href="/">
          <Image 
            src="https://firebasestorage.googleapis.com/v0/b/studio-3673070449-f277c.firebasestorage.app/o/CleanSweep-Layer%2011%20copy.png?alt=media&token=e060532e-cc86-43f8-8780-76371d95c936"
            alt="CleanSweep Logo"
            width={180}
            height={45}
            priority
          />
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 bg-secondary/20">
        <Card className="w-full max-w-xl shadow-2xl border-none rounded-[2rem] overflow-hidden bg-white">
          <CardHeader className="bg-primary/5 p-8 border-b text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Sparkles className="w-6 h-6" />
              </div>
            </div>
            <CardTitle className="text-2xl text-primary font-bold font-headline">
              {step === 1 ? "Provider Registration" : "Tell Us About Your Business"}
            </CardTitle>
            <CardDescription className="font-bold text-muted-foreground">
              {step === 1 ? "Step 1: Create your secure account." : "Step 2: Complete your service profile."}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8">
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
                  <Button type="submit" disabled={loading} className="w-full h-14 bg-primary text-white hover:bg-primary/90 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 transition-all active:scale-95">
                    {loading ? "Creating Account..." : "Continue Registration"}
                    <ChevronRight className="ml-2 w-5 h-5" />
                  </Button>
                </form>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-4 text-muted-foreground font-bold">Or Join with</span></div>
                </div>

                <Button variant="outline" onClick={handleGoogleSignup} disabled={loading} className="w-full h-14 rounded-2xl border-primary/20 font-bold text-lg hover:bg-primary/5 transition-all">
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
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="phone" value={formData.phone} onChange={handleInputChange} className="pl-10 h-12 rounded-xl" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Primary Service City</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="city" value={formData.city} onChange={handleInputChange} className="pl-10 h-12 rounded-xl" required />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-start space-x-3">
                    <Checkbox id="terms" checked={formData.agreedToTerms} onCheckedChange={(c) => setFormData(p => ({ ...p, agreedToTerms: !!c }))} />
                    <Label htmlFor="terms" className="text-sm font-medium leading-tight cursor-pointer">
                      I agree to the <Link href="#" className="text-primary font-bold hover:underline">Provider Agreement</Link>.
                    </Label>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Checkbox id="background" checked={formData.consentedToBackground} onCheckedChange={(c) => setFormData(p => ({ ...p, consentedToBackground: !!c }))} />
                    <Label htmlFor="background" className="text-sm font-medium leading-tight cursor-pointer">
                      I consent to a background check to maintain network safety.
                    </Label>
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full h-14 bg-accent text-accent-foreground hover:bg-accent/90 rounded-2xl font-bold text-lg shadow-xl shadow-accent/20 transition-all active:scale-95">
                  {loading ? "Initializing Profile..." : "Complete Application"}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="p-8 pt-0 flex flex-col items-center gap-4 border-t bg-secondary/5">
            <p className="text-sm text-muted-foreground font-medium pt-6">
              Already have an account? <Link href="/login" className="text-primary font-bold hover:underline">Log in to Portal</Link>
            </p>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
