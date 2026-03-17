
"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ShieldCheck, Eye, EyeOff, Lock, Mail, ChevronRight, ChevronLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useFirestore, useAuth } from '@/firebase';
import { seedDatabaseIfEmpty } from '@/lib/seed';
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
    experience: '',
    teamSize: '1',
    expertise: [] as string[],
    agreedToTerms: false,
    consentedToBackground: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleExpertiseChange = (type: string) => {
    setFormData(prev => {
      const exists = prev.expertise.includes(type);
      if (exists) {
        return { ...prev, expertise: prev.expertise.filter(t => t !== type) };
      }
      return { ...prev, expertise: [...prev.expertise, type] };
    });
  };

  const finishRegistration = async (uid: string, email: string) => {
    if (!db) return;

    const userData = {
      uid,
      email,
      role: 'Service Provider',
      firstName: formData.firstName,
      lastName: formData.lastName,
      createdAt: serverTimestamp(),
    };

    const providerData = {
      id: uid,
      email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phoneNumber: formData.phone,
      addressCity: formData.city,
      status: 'pending_approval',
      registrationDate: new Date().toISOString(),
      serviceAreaZipCodes: [],
      addressStreet: '',
      addressState: '',
      addressZip: '',
    };

    try {
      // Create user record for RBAC
      await setDoc(doc(db, 'users', uid), userData);
      // Create service provider record
      await setDoc(doc(db, 'serviceProviders', uid), providerData);
      
      // Optionally seed some initial data
      await seedDatabaseIfEmpty(db);

      toast({
        title: "Registration Complete",
        description: "Welcome to CleanSweep! Your application is being reviewed.",
      });
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Firestore Error:", error);
      toast({
        variant: "destructive",
        title: "Profile Creation Failed",
        description: "Your account was created but we couldn't save your profile. Please contact support.",
      });
    }
  };

  const handleAuthSubmit = async () => {
    if (!auth) return;
    if (formData.password !== formData.confirmPassword) {
      toast({ variant: "destructive", title: "Passwords Mismatch", description: "The passwords you entered do not match." });
      return;
    }

    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      // Immediately move to profile info step
      setStep(2);
    } catch (error: any) {
      console.error("Auth Error:", error);
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: error.message || "Could not create account.",
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
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        setFormData(prev => ({
          ...prev,
          email: result.user.email || '',
          firstName: result.user.displayName?.split(' ')[0] || '',
          lastName: result.user.displayName?.split(' ').slice(1).join(' ') || ''
        }));
        setStep(2);
      }
    } catch (error: any) {
      console.error("Google Auth Error:", error);
      toast({
        variant: "destructive",
        title: "Google Sign-In Failed",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (!auth?.currentUser) return;
    if (!formData.agreedToTerms || !formData.consentedToBackground) {
      toast({ variant: "destructive", title: "Agreement Required", description: "You must agree to the terms and background check." });
      return;
    }

    setLoading(true);
    await finishRegistration(auth.currentUser.uid, auth.currentUser.email!);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-6 lg:px-12 h-20 flex items-center bg-white border-b sticky top-0 z-50">
        <Link className="flex items-center gap-2" href="/">
          <Image 
            src="https://firebasestorage.googleapis.com/v0/b/studio-3673070449-f277c.firebasestorage.app/o/CleanSweep-Layer%2011%20copy.png?alt=media&token=e060532e-cc86-43f8-8780-76371d95c936"
            alt="CleanSweep Logo"
            width={200}
            height={50}
            priority
          />
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 bg-secondary/20">
        <div className="w-full max-w-xl">
          <Card className="shadow-2xl border-none rounded-[2rem] overflow-hidden bg-white">
            <CardHeader className="bg-primary/5 p-8 border-b text-center">
              <CardTitle className="text-2xl text-primary font-bold">
                {step === 1 && "Start Your Journey"}
                {step === 2 && "Tell us about yourself"}
                {step === 3 && "Skills & Legal"}
              </CardTitle>
              <CardDescription className="font-medium">
                {step === 1 && "Create your provider login credentials."}
                {step === 2 && "We need some basic info to get started."}
                {step === 3 && "Almost done! Finish your application."}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-8 space-y-6">
              {step === 1 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input id="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="name@example.com" className="pl-10 h-12" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                          id="password" 
                          type={showPassword ? "text" : "password"} 
                          value={formData.password} 
                          onChange={handleInputChange} 
                          className="pl-10 h-12"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                          id="confirmPassword" 
                          type={showPassword ? "text" : "password"} 
                          value={formData.confirmPassword} 
                          onChange={handleInputChange} 
                          className="pl-10 h-12"
                        />
                      </div>
                    </div>
                  </div>

                  <Button onClick={handleAuthSubmit} disabled={loading} className="w-full h-12 bg-primary rounded-xl font-bold shadow-lg shadow-primary/20">
                    {loading ? "Creating..." : "Next: Personal Info"}
                    <ChevronRight className="ml-2 w-4 h-4" />
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-muted-foreground font-bold">Or</span></div>
                  </div>

                  <Button variant="outline" onClick={handleGoogleSignup} disabled={loading} className="w-full h-12 rounded-xl border-primary/20 font-bold flex gap-2">
                    Continue with Google
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" value={formData.firstName} onChange={handleInputChange} className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" value={formData.lastName} onChange={handleInputChange} className="h-11" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" value={formData.phone} onChange={handleInputChange} className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" value={formData.city} onChange={handleInputChange} className="h-11" />
                  </div>
                  <Button onClick={() => setStep(3)} className="w-full h-12 bg-primary rounded-xl font-bold mt-4">
                    Next: Final Step
                  </Button>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label>Expertise</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {['Residential', 'Commercial', 'Deep Clean', 'Move Out'].map((type) => (
                        <div key={type} className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                          <Checkbox id={type} checked={formData.expertise.includes(type)} onCheckedChange={() => handleExpertiseChange(type)} />
                          <label htmlFor={type} className="text-sm font-medium cursor-pointer">{type}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-start space-x-3">
                      <Checkbox id="terms" checked={formData.agreedToTerms} onCheckedChange={(c) => setFormData(p => ({ ...p, agreedToTerms: !!c }))} />
                      <Label htmlFor="terms" className="text-xs leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 font-normal">
                        I agree to the <Link href="#" className="text-primary font-bold">Terms of Service</Link> and <Link href="#" className="text-primary font-bold">Privacy Policy</Link>.
                      </Label>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Checkbox id="background" checked={formData.consentedToBackground} onCheckedChange={(c) => setFormData(p => ({ ...p, consentedToBackground: !!c }))} />
                      <Label htmlFor="background" className="text-xs leading-none font-normal">
                        I consent to a <span className="font-bold">background check</span> as part of my application.
                      </Label>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Button variant="ghost" onClick={() => setStep(2)} className="flex-1 h-12 font-bold">Back</Button>
                    <Button onClick={handleFinalSubmit} disabled={loading} className="flex-[2] h-12 bg-primary rounded-xl font-bold">
                      {loading ? "Submitting..." : "Submit Application"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="p-8 pt-0 text-center flex flex-col gap-4">
              <p className="text-sm text-muted-foreground font-medium">
                Already have an account? <Link href="/login" className="text-primary font-bold hover:underline">Log in</Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
