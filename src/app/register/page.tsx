
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
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useFirestore, useAuth } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { seedDatabaseIfEmpty } from '@/lib/seed';

export default function Register() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const db = useFirestore();
  const auth = useAuth();

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

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !auth) return;
    
    // Final validation check for checkboxes
    if (!formData.agreedToTerms || !formData.consentedToBackground) {
      toast({
        variant: "destructive",
        title: "Agreement Required",
        description: "Please accept the terms and background check consent to continue.",
      });
      return;
    }

    setLoading(true);

    try {
      // 1. Create Authentication User
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // 2. Create User Profile with explicit Service Provider Role
      const userDocRef = doc(db, 'users', user.uid);
      const userData = {
        uid: user.uid,
        email: formData.email,
        role: 'Service Provider',
        firstName: formData.firstName,
        lastName: formData.lastName,
        createdAt: serverTimestamp(),
      };

      setDoc(userDocRef, userData).catch(err => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: userDocRef.path,
          operation: 'create',
          requestResourceData: userData,
        }));
      });

      // 3. Create Service Provider Application Details
      const providerDocRef = doc(db, 'serviceProviders', user.uid);
      const { password, agreedToTerms, consentedToBackground, ...providerDataWithoutExtras } = formData;
      const providerData = {
        ...providerDataWithoutExtras,
        uid: user.uid,
        status: 'pending',
        createdAt: serverTimestamp(),
      };

      setDoc(providerDocRef, providerData, { merge: true })
        .then(async () => {
          await seedDatabaseIfEmpty(db);
          setLoading(false);
          toast({
            title: "Account Created Successfully",
            description: "Your service provider application has been submitted.",
          });
          window.location.href = "/dashboard";
        })
        .catch(async (serverError) => {
          setLoading(false);
          const permissionError = new FirestorePermissionError({
            path: providerDocRef.path,
            operation: 'create',
            requestResourceData: providerData,
          } satisfies SecurityRuleContext);

          errorEmitter.emit('permission-error', permissionError);
        });

    } catch (authError: any) {
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: authError.message || "An error occurred during account creation.",
      });
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

      <main className="flex-1 flex items-center justify-center p-6">
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
            <form onSubmit={handleSubmit}>
              <CardHeader className="bg-primary/5 p-8">
                <CardTitle className="text-2xl text-primary font-bold">
                  {step === 1 && "Account Information"}
                  {step === 2 && "Experience & Services"}
                  {step === 3 && "Final Verification"}
                </CardTitle>
                <CardDescription className="font-medium">
                  {step === 1 && "Create your login and tell us about yourself."}
                  {step === 2 && "Share your professional skills and service availability."}
                  {step === 3 && "Finalize your application and agree to terms."}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                {step === 1 && (
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="John" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Doe" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="john@example.com" required />
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
                          required 
                          minLength={6}
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
                      <Input id="phone" type="tel" value={formData.phone} onChange={handleInputChange} placeholder="(555) 000-0000" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City of Operation</Label>
                      <Input id="city" value={formData.city} onChange={handleInputChange} placeholder="e.g. Chicago, IL" required />
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
                      <Input id="experience" type="number" value={formData.experience} onChange={handleInputChange} placeholder="0" min="0" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="teamSize">Team Size</Label>
                      <Input id="teamSize" type="number" value={formData.teamSize} onChange={handleInputChange} placeholder="1" min="1" required />
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
                        By submitting, you agree to a standard background check. You acknowledge that you are applying as an independent service provider and not an employee of CleanSweep.
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
                  <Button type="button" variant="outline" onClick={prevStep} disabled={loading} className="rounded-xl px-6 h-12">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                ) : (
                  <div />
                )}
                {step < 3 ? (
                  <Button 
                    type="button" 
                    onClick={() => {
                      if (step === 1 && (!formData.email || !formData.password || !formData.firstName)) {
                        toast({ variant: "destructive", title: "Missing fields", description: "Please fill out all required fields." });
                        return;
                      }
                      nextStep();
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
