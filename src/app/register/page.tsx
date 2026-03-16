
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ShieldCheck, ArrowRight, ArrowLeft, Building, User, Mail, Phone, MapPin } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Register() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Application Submitted",
        description: "We've received your application. Our team will review it and get back to you within 48 hours.",
      });
      window.location.href = "/dashboard";
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-6 border-b bg-white">
        <Link className="flex items-center gap-2 w-fit" href="/">
          <ShieldCheck className="text-primary w-8 h-8" />
          <span className="text-2xl font-bold text-primary font-headline">CleanPro Connect</span>
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
                <span className={`text-sm font-medium hidden sm:inline ${step === s ? 'text-primary' : 'text-muted-foreground'}`}>
                  {s === 1 ? 'Personal' : s === 2 ? 'Experience' : 'Verification'}
                </span>
                {s < 3 && <div className="w-8 h-px bg-muted" />}
              </div>
            ))}
          </div>

          <Card className="shadow-xl border-none">
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle className="text-2xl text-primary font-headline">
                  {step === 1 && "Personal Information"}
                  {step === 2 && "Experience & Services"}
                  {step === 3 && "Verification & Agreement"}
                </CardTitle>
                <CardDescription>
                  {step === 1 && "Tell us about yourself so we can start your application."}
                  {step === 2 && "Let us know your skills and what services you can provide."}
                  {step === 3 && "Finalize your application by verifying your identity."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {step === 1 && (
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" placeholder="John" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" placeholder="Doe" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" placeholder="john@example.com" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" type="tel" placeholder="(555) 000-0000" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City of Operation</Label>
                      <Input id="city" placeholder="e.g. Chicago, IL" required />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label>Cleaning Type Expertise</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {['Residential', 'Commercial', 'Deep Clean', 'Move In/Out'].map((type) => (
                          <div key={type} className="flex items-center space-x-2 border p-3 rounded-md hover:bg-accent/5 cursor-pointer">
                            <Checkbox id={type} />
                            <label htmlFor={type} className="text-sm font-medium leading-none cursor-pointer">
                              {type}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="experience">Years of Professional Experience</Label>
                      <Input id="experience" type="number" placeholder="0" min="0" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="teamSize">Team Size (if any)</Label>
                      <Input id="teamSize" type="number" placeholder="1" min="1" required />
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="grid gap-6">
                    <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                      <h4 className="font-bold text-primary flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" /> Legal Agreement
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        By applying, you agree to undergo a standard background check and provide proof of identity. You acknowledge that you are applying as an independent service provider and not an employee of CleanPro National.
                      </p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Checkbox id="terms" required />
                      <label htmlFor="terms" className="text-sm text-muted-foreground leading-tight">
                        I agree to the <Link href="#" className="text-primary hover:underline">Terms of Service</Link> and <Link href="#" className="text-primary hover:underline">Privacy Policy</Link>.
                      </label>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Checkbox id="background" required />
                      <label htmlFor="background" className="text-sm text-muted-foreground leading-tight">
                        I consent to a professional background check.
                      </label>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between border-t p-6">
                {step > 1 ? (
                  <Button type="button" variant="outline" onClick={prevStep} disabled={loading}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                ) : (
                  <div />
                )}
                {step < 3 ? (
                  <Button type="button" onClick={nextStep} className="bg-primary">
                    Next <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={loading} className="bg-primary px-8">
                    {loading ? "Processing..." : "Submit Application"}
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
