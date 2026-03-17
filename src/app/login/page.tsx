
"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase';
import { Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const auth = useAuth();
  const db = useFirestore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !db) return;

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Verify Role
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();

      if (userData?.role !== 'Service Provider') {
        await signOut(auth);
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "This application is restricted to Service Providers only.",
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "Login successful.",
        });
        window.location.href = "/dashboard";
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message || "Invalid credentials.",
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

      <main className="flex-1 flex items-center justify-center p-6 bg-secondary/30">
        <Card className="w-full max-w-md shadow-2xl border-none rounded-[2rem] overflow-hidden bg-white">
          <CardHeader className="bg-primary/5 p-8 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl text-primary font-bold tracking-tight">Provider Login</CardTitle>
            <CardDescription className="font-medium">
              Access your service provider dashboard.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="p-8 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    className="pl-10 h-12"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link href="#" className="text-xs text-primary hover:underline font-bold">Forgot Password?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    className="pl-10 h-12"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
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
            </CardContent>
            <CardFooter className="p-8 pt-0 flex flex-col gap-4">
              <Button type="submit" disabled={loading} className="w-full h-12 bg-primary rounded-xl font-bold shadow-lg shadow-primary/20">
                {loading ? "Authenticating..." : "Sign In"}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Don't have a provider account?{" "}
                <Link href="/register" className="text-primary font-bold hover:underline">Apply Now</Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
}
