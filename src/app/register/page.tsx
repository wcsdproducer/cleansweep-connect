"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowRight, ArrowLeft, ShieldCheck, Eye, EyeOff, Lock, Mail, User, Phone, MapPin } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { useFirestore, useAuth } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { seedDatabaseIfEmpty } from '@/lib/seed';
import { useRouter } from 'next/navigation';

export default function Register() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [createdUser, setCreatedUser] = useState<FirebaseUser | null>(null);
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

  // Track auth state to handle Step 1 completion
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && step === 1) {
        setCreatedUser(user);
        setStep(2);
      }
    });
    return () => unsubscribe();
  }, [auth, step]);

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

  const validateAuthStep = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      toast({ variant: "destructive", title: "Required", description: "Please fill in all authentication fields." });
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast({ variant: "destructive", title: "Mismatch", description: "Passwords do not match." });
      return false;
    }
    if (formData.password.length < 6) {
      toast({ variant: "destructive", title: "Weak Password", description: "Password must be at least 6 characters." });
      return false;
    }
    return true;
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !validateAuthStep()) return;

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      // Step 2 will be triggered by onAuthStateChanged
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

  const handleGoogleSignup = async () => {
    if (!auth) return;
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
      // Step 2 will be triggered by onAuthStateChanged
    } catch (error: any) {
      console.error("Google Signup Error:", error);
      if (error.code !== 'auth/popup-closed-by-user') {
        toast({
          variant: "destructive",
          title: "Google Login Failed",
          description: error.code === 'auth/unauthorized-domain' 
            ? "This domain is not authorized. Please add it to your Firebase Console."
            : error.message,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.city) {
      toast({ variant: "destructive", title: "Required", description: "Please fill in all profile fields." });
      return;
    }
    setStep(3);
  };

  const handleStep3Submit = async () => {
    if (!formData.experience || !formData.teamSize || formData.expertise.length === 0) {
      toast({ variant: "destructive", title: "Required", description: "Please provide your experience details." });
      return;
    }
    setStep(4);
  };

  const handleFinalSubmit = async () => {
    if (!createdUser || !db) return;
    if (!formData.agreedToTerms || !formData.consentedToBackground) {
      toast({ variant: "destructive", title: "Agreement Required", description: "Please accept the terms and background check." });
      return;
    }

    setLoading(true);
    const uid = createdUser.uid;
    const email = createdUser.email || formData.email;

    const userData = {
      uid,
      email,
      role: 'Service Provider',
      firstName: formData.firstName,
      lastName: formData.lastName,
      createdAt: serverTimestamp(),
    };

    const providerData = {
      uid,
      email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      city: formData.city,
      experience: formData.experience,
      teamSize: formData.teamSize,
      expertise: formData.expertise,
      status: 'pending',
      createdAt: serverTimestamp(),
    };

    try {
      const userDocRef = doc(db, 'users', uid);
      const providerDocRef = doc(db, 'serviceProviders', uid);

      await setDoc(userDocRef, userData, { merge: true });
      await setDoc(providerDocRef, providerData, { merge: true });

      seedDatabaseIfEmpty(db).catch(err => console.warn("Seeding failed", err));

      toast({
        title: "Success!",
        description: "Your provider profile is being reviewed.",
      });
      router.push("/dashboard");
    } catch (error: any) {
      const permissionError = new FirestorePermissionError({
        path: `users/${uid}`,
        operation: 'create',
      });
      errorEmitter.emit('permission-error', permissionError);
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
            width={220}
            height={60}
            priority
          />
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 bg-secondary/20">
        <div className="w-full max-w-xl">
          <div className="flex justify-between items-center mb-8 px-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  step === s ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/20' : 
                  step > s ? 'bg-accent text-white' : 'bg-muted text-muted-foreground'
                }`}>
                  {s}
                </div>
                <span className={`text-xs font-bold hidden sm:inline ${step === s ? 'text-primary' : 'text-muted-foreground'}`}>
                  {s === 1 ? 'Account' : s === 2 ? 'Profile' : s === 3 ? 'Experience' : 'Legal'}
                </span>
                {s < 4 && <div className="w-8 h-px bg-muted" />}
              </div>
            ))}
          </div>

          <Card className="shadow-2xl border-none rounded-[2rem] overflow-hidden bg-white">
            <CardHeader className="bg-primary/5 p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl text-primary font-bold">
                    {step === 1 && "Start Your Journey"}
                    {step === 2 && "Profile Basics"}
                    {step === 3 && "Professional Skills"}
                    {step === 4 && "Final Review"}
                  </CardTitle>
                  <CardDescription className="text-sm font-medium">
                    {step === 1 && "Create your provider login credentials."}
                    {step === 2 && "Tell us who you are and where you work."}
                    {step === 3 && "Showcase your professional background."}
                    {step === 4 && "Agree to our terms and conditions."}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-8 space-y-6">
              {step === 1 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input id="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="name@example.com" className="pl-10 h-11" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input 
                            id="password" 
                            type={showPassword ? "text" : "password"} 
                            value={formData.password} 
                            onChange={handleInputChange} 
                            placeholder="Min 6 characters" 
                            className="pl-10 h-11"
                          />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
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
                            placeholder="Repeat password" 
                            className="pl-10 h-11"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-muted-foreground font-bold">Or</span></div>
                  </div>

                  <Button 
                    variant="outline" 
                    type="button" 
                    className="w-full h-11 rounded-xl border-primary/20 font-bold flex gap-2"
                    onClick={handleGoogleSignup}
                    disabled={loading}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12.16-4.53z" />
                    </svg>
                    Continue with Google
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input id="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="Alex" className="pl-10 h-11" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input id="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Smith" className="pl-10 h-11" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="phone" type="tel" value={formData.phone} onChange={handleInputChange} placeholder="(555) 000-0000" className="pl-10 h-11" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City of Operation</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="city" value={formData.city} onChange={handleInputChange} placeholder="Chicago, IL" className="pl-10 h-11" />
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label>Service Expertise</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {['Residential', 'Commercial', 'Deep Clean', 'Move In/Out'].map((type) => (
                        <div key={type} className="flex items-center space-x-3 border p-4 rounded-xl hover:bg-primary/5 cursor-pointer transition-all">
                          <Checkbox 
                            id={type} 
                            checked={formData.expertise.includes(type)} 
                            onCheckedChange={() => handleExpertiseChange(type)}
                          />
                          <label htmlFor={type} className="text-sm font-bold cursor-pointer leading-none">
                            {type}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="experience">Years of Experience</Label>
                      <Input id="experience" type="number" value={formData.experience} onChange={handleInputChange} placeholder="0" min="0" className="h-11" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="teamSize">Team Size</Label>
                      <Input id="teamSize" type="number" value={formData.teamSize} onChange={handleInputChange} placeholder="1" min="1" className="h-11" />
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <div className="p-5 bg-secondary/50 rounded-2xl border-l-4 border-primary">
                    <h4 className="font-bold text-primary flex items-center gap-2 mb-2">
                      <ShieldCheck className="w-5 h-5" /> Terms & Verification
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      To maintain the highest quality of service on CleanSweep, all providers must pass a professional background check and agree to our independent contractor agreement.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 p-2">
                      <Checkbox 
                        id="terms" 
                        checked={formData.agreedToTerms}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, agreedToTerms: !!checked }))}
                      />
                      <label htmlFor="terms" className="text-sm text-muted-foreground font-medium leading-tight cursor-pointer">
                        I agree to the <Link href="#" className="text-primary hover:underline">Terms of Service</Link> and <Link href="#" className="text-primary hover:underline">Privacy Policy</Link>.
                      </label>
                    </div>
                    <div className="flex items-start space-x-3 p-2">
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
                </div>
              )}
            </CardContent>

            <CardFooter className="flex justify-between border-t p-8 bg-white">
              {step > 1 ? (
                <Button type="button" variant="ghost" onClick={() => setStep(s => s - 1)} disabled={loading} className="px-6 h-12 font-bold text-muted-foreground">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
              ) : (
                <div />
              )}
              
              {step === 1 && (
                <Button onClick={handleAuthSubmit} disabled={loading} className="bg-primary px-8 h-12 rounded-xl font-bold shadow-lg shadow-primary/20">
                  {loading ? "Creating Account..." : "Create Account"}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              )}
              {step === 2 && (
                <Button onClick={handleStep2Submit} className="bg-primary px-8 h-12 rounded-xl font-bold">
                  Next Step
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              )}
              {step === 3 && (
                <Button onClick={handleStep3Submit} className="bg-primary px-8 h-12 rounded-xl font-bold">
                  Review & Sign
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              )}
              {step === 4 && (
                <Button onClick={handleFinalSubmit} disabled={loading} className="bg-primary px-10 h-12 rounded-xl font-bold shadow-xl shadow-primary/30">
                  {loading ? "Finalizing..." : "Submit Application"}
                </Button>
              )}
            </CardFooter>
          </Card>
          
          <p className="text-center mt-6 text-sm text-muted-foreground">
            Already have an account? <Link href="/login" className="text-primary font-bold hover:underline">Sign In</Link>
          </p>
        </div>
      </main>
    </div>
  );
}