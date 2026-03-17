
"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowRight, ArrowLeft, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useFirestore, useAuth } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
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

  const validateStep1 = () => {
    const { firstName, lastName, email, password, phone, city } = formData;
    if (!firstName || !lastName || !email || !password || !phone || !city) {
      toast({ variant: "destructive", title: "Missing Information", description: "Please fill out all personal details." });
      return false;
    }
    if (password.length < 6) {
      toast({ variant: "destructive", title: "Weak Password", description: "Password must be at least 6 characters." });
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const { experience, teamSize, expertise } = formData;
    if (!experience || !teamSize || expertise.length === 0) {
      toast({ variant: "destructive", title: "Missing Information", description: "Please provide your experience and at least one expertise." });
      return false;
    }
    return true;
  };

  const createProviderProfile = async (uid: string, email: string, firstName: string, lastName: string, additionalData: any = {}) => {
    if (!db) return;
    
    const userData = {
      uid,
      email,
      role: 'Service Provider',
      firstName,
      lastName,
      createdAt: serverTimestamp(),
    };

    const providerData = {
      ...additionalData,
      uid,
      email,
      firstName,
      lastName,
      status: 'pending',
      createdAt: serverTimestamp(),
    };

    const userDocRef = doc(db, 'users', uid);
    const providerDocRef = doc(db, 'serviceProviders', uid);

    // Non-blocking writes following guidelines
    setDoc(userDocRef, userData, { merge: true })
      .catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: userDocRef.path,
          operation: 'create',
          requestResourceData: userData,
        }));
      });

    setDoc(providerDocRef, providerData, { merge: true })
      .catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: providerDocRef.path,
          operation: 'create',
          requestResourceData: providerData,
        }));
      });
      
    // Seed if necessary, but don't block registration success
    seedDatabaseIfEmpty(db).catch(err => console.warn("Seeding failed", err));
    
    toast({
      title: "Registration Initiated",
      description: "Welcome to CleanSweep.",
    });
    router.push("/dashboard");
  };

  const handleGoogleSignup = async () => {
    if (!auth || !db) return;
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const [firstName = '', ...lastNameParts] = (user.displayName || '').split(' ');
      const lastName = lastNameParts.join(' ');

      await createProviderProfile(user.uid, user.email || '', firstName, lastName);
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        toast({
          variant: "destructive",
          title: "Google Registration Failed",
          description: error.message,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !auth) return;
    
    if (!formData.agreedToTerms || !formData.consentedToBackground) {
      toast({
        variant: "destructive",
        title: "Agreement Required",
        description: "Please accept the terms and background check consent.",
      });
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const { password: _, agreedToTerms: __, consentedToBackground: ___, ...rest } = formData;
      await createProviderProfile(userCredential.user.uid, formData.email, formData.firstName, formData.lastName, rest);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error.message,
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
            width={140}
            height={40}
            priority
          />
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 bg-secondary/20">
        <div className="w-full max-w-xl">
          <div className="flex justify-between items-center mb-8 px-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  step === s ? 'bg-primary text-white' : 
                  step > s ? 'bg-accent text-white' : 'bg-muted text-muted-foreground'
                }`}>
                  {s}
                </div>
                <span className={`text-sm font-bold hidden sm:inline ${step === s ? 'text-primary' : 'text-muted-foreground'}`}>
                  {s === 1 ? 'Personal' : s === 2 ? 'Experience' : 'Agreement'}
                </span>
                {s < 3 && <div className="w-8 h-px bg-muted" />}
              </div>
            ))}
          </div>

          <Card className="shadow-2xl border-none rounded-[2rem] overflow-hidden bg-white">
            <CardHeader className="bg-primary/5 p-8">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl text-primary font-bold">
                    {step === 1 && "Account Information"}
                    {step === 2 && "Experience & Services"}
                    {step === 3 && "Final Verification"}
                  </CardTitle>
                  <CardDescription className="font-medium">
                    {step === 1 && "Create your login or use Google."}
                    {step === 2 && "Share your professional skills."}
                    {step === 3 && "Finalize your application."}
                  </CardDescription>
                </div>
                {step === 1 && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="rounded-xl border-primary/20 bg-white hover:bg-primary/5 font-bold flex gap-2"
                    onClick={handleGoogleSignup}
                    disabled={loading}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12.16-4.53z" />
                    </svg>
                    Google Signup
                  </Button>
                )}
              </div>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="p-8 space-y-6">
                {step === 1 && (
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="John" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Doe" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="john@example.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input 
                          id="password" 
                          type={showPassword ? "text" : "password"} 
                          value={formData.password} 
                          onChange={handleInputChange} 
                          placeholder="Min 6 characters" 
                        />
                        <button 
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" type="tel" value={formData.phone} onChange={handleInputChange} placeholder="(555) 000-0000" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City of Operation</Label>
                      <Input id="city" value={formData.city} onChange={handleInputChange} placeholder="e.g. Chicago, IL" />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label>Expertise</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {['Residential', 'Commercial', 'Deep Clean', 'Move In/Out'].map((type) => (
                          <div key={type} className="flex items-center space-x-2 border p-4 rounded-xl hover:bg-primary/5 cursor-pointer transition-colors">
                            <Checkbox 
                              id={type} 
                              checked={formData.expertise.includes(type)} 
                              onCheckedChange={() => handleExpertiseChange(type)}
                            />
                            <label htmlFor={type} className="text-sm font-bold cursor-pointer">
                              {type}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="experience">Years of Experience</Label>
                      <Input id="experience" type="number" value={formData.experience} onChange={handleInputChange} placeholder="0" min="0" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="teamSize">Team Size</Label>
                      <Input id="teamSize" type="number" value={formData.teamSize} onChange={handleInputChange} placeholder="1" min="1" />
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="grid gap-6">
                    <div className="p-6 bg-secondary/50 rounded-2xl space-y-3">
                      <h4 className="font-bold text-primary flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5" /> Provider Agreement
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        By submitting, you agree to a standard background check and acknowledge independent provider status.
                      </p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Checkbox 
                        id="terms" 
                        checked={formData.agreedToTerms}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, agreedToTerms: !!checked }))}
                      />
                      <label htmlFor="terms" className="text-sm text-muted-foreground font-medium leading-tight cursor-pointer">
                        I agree to the <Link href="#" className="text-primary hover:underline">Terms of Service</Link> and <Link href="#" className="text-primary hover:underline">Privacy Policy</Link>.
                      </label>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Checkbox 
                        id="background" 
                        checked={formData.consentedToBackground}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, consentedToBackground: !!checked }))}
                      />
                      <label htmlFor="background" className="text-sm text-muted-foreground font-medium leading-tight cursor-pointer">
                        I consent to a professional background check.
                      </label>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between border-t p-8 bg-white">
                {step > 1 ? (
                  <Button type="button" variant="outline" onClick={() => setStep(s => s - 1)} disabled={loading} className="rounded-xl px-6 h-12">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                ) : (
                  <div />
                )}
                {step < 3 ? (
                  <Button 
                    type="button" 
                    onClick={() => {
                      if (step === 1 && validateStep1()) setStep(2);
                      else if (step === 2 && validateStep2()) setStep(3);
                    }} 
                    className="bg-primary rounded-xl px-8 h-12 shadow-lg shadow-primary/20"
                  >
                    Next <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={loading} className="bg-primary rounded-xl px-10 h-12 shadow-xl shadow-primary/30">
                    {loading ? "Creating Account..." : "Complete Registration"}
                  </Button>
                )}
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
}
