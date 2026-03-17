
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ShieldCheck, Eye, EyeOff, Lock, Mail, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
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

  // Handle step transitions and auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && step === 1) {
        setStep(2);
      }
    });
    return () => unsubscribe();
  }, [auth, step]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    
    if (formData.password !== formData.confirmPassword) {
      toast({ variant: "destructive", title: "Passwords Mismatch", description: "The passwords you entered do not match." });
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      // step 2 is triggered by useEffect listener
    } catch (error: any) {
      console.error("Signup Error:", error);
      let message = "Could not create account. Please check your project settings.";
      if (error.code === 'auth/email-already-in-use') message = "This email is already registered.";
      if (error.message?.includes('signup-are-blocked')) {
        message = "Signup is currently blocked. Please ensure Identity Toolkit API is enabled in Google Cloud Console.";
      }
      
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    if (!auth) return;
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Google Sign-In Failed",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth?.currentUser || !db) return;

    if (!formData.agreedToTerms || !formData.consentedToBackground) {
      toast({ variant: "destructive", title: "Agreement Required", description: "You must agree to all terms." });
      return;
    }

    setLoading(true);
    const uid = auth.currentUser.uid;
    const email = auth.currentUser.email!;

    try {
      // Create user record for RBAC
      await setDoc(doc(db, 'users', uid), {
        uid,
        email,
        role: 'Service Provider',
        firstName: formData.firstName,
        lastName: formData.lastName,
        createdAt: serverTimestamp(),
      });

      // Create service provider record
      await setDoc(doc(db, 'serviceProviders', uid), {
        id: uid,
        email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phone,
        addressCity: formData.city,
        status: 'pending_approval',
        registrationDate: new Date().toISOString(),
      });

      toast({
        title: "Application Submitted",
        description: "Welcome to CleanSweep! Redirecting to your dashboard...",
      });
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Firestore Save Error:", error);
      toast({
        variant: "destructive",
        title: "Profile Save Error",
        description: "Your account was created but we couldn't save your details. Please try again.",
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
            <CardTitle className="text-2xl text-primary font-bold">
              {step === 1 ? "Start Your Journey" : "Complete Your Profile"}
            </CardTitle>
            <CardDescription className="font-medium text-base">
              {step === 1 ? "Create your professional account today." : "Tell us a bit more to get approved."}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            {step === 1 ? (
              <form onSubmit={handleAuthSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Work Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="alex@example.com" className="pl-10 h-12 rounded-xl" required />
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
                      <Label htmlFor="confirmPassword">Confirm</Label>
                      <Input id="confirmPassword" type={showPassword ? "text" : "password"} value={formData.confirmPassword} onChange={handleInputChange} className="h-12 rounded-xl" required />
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full h-14 bg-primary text-white hover:bg-primary/90 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20">
                  {loading ? "Initializing..." : "Register with Email"}
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Button>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-4 text-muted-foreground font-bold">Or continue with</span></div>
                </div>

                <Button type="button" variant="outline" onClick={handleGoogleSignup} disabled={loading} className="w-full h-14 rounded-2xl border-primary/20 font-bold text-lg hover:bg-primary/5">
                  <Image src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width={20} height={20} className="mr-3" />
                  Google Account
                </Button>
              </form>
            ) : (
              <form onSubmit={handleFinalSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" value={formData.firstName} onChange={handleInputChange} className="h-12 rounded-xl" required />
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
                    <Label htmlFor="city">Primary City</Label>
                    <Input id="city" value={formData.city} onChange={handleInputChange} className="h-12 rounded-xl" required />
                  </div>
                </div>
                
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-start space-x-3">
                    <Checkbox id="terms" checked={formData.agreedToTerms} onCheckedChange={(c) => setFormData(p => ({ ...p, agreedToTerms: !!c }))} />
                    <Label htmlFor="terms" className="text-sm font-medium leading-tight cursor-pointer">
                      I agree to the <Link href="#" className="text-primary font-bold hover:underline">Terms of Service</Link> and Provider Agreement.
                    </Label>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Checkbox id="background" checked={formData.consentedToBackground} onCheckedChange={(c) => setFormData(p => ({ ...p, consentedToBackground: !!c }))} />
                    <Label htmlFor="background" className="text-sm font-medium leading-tight cursor-pointer">
                      I consent to a professional <span className="font-bold">background check</span> for verification.
                    </Label>
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full h-14 bg-accent text-accent-foreground hover:bg-accent/90 rounded-2xl font-bold text-lg shadow-xl shadow-accent/20">
                  {loading ? "Saving Profile..." : "Submit Application"}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="p-8 pt-0 flex justify-center border-t bg-secondary/5 mt-4">
            <p className="text-sm text-muted-foreground font-medium pt-6">
              Already have a Pro account? <Link href="/login" className="text-primary font-bold hover:underline">Log in here</Link>
            </p>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
