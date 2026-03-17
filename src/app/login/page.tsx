
"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { signInWithEmailAndPassword, signOut, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase';
import { Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();

  const handlePostAuth = async (uid: string) => {
    if (!db || !auth) return;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      const userData = userDoc.data();

      if (!userData || userData.role !== 'Service Provider') {
        await signOut(auth);
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "This account is not registered as a Service Provider.",
        });
        return;
      }
      
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Verification Error:", error);
      toast({
        variant: "destructive",
        title: "Login Error",
        description: "Could not verify your account permissions.",
      });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;

    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await handlePostAuth(result.user.uid);
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

  const handleGoogleLogin = async () => {
    if (!auth) return;
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        await handlePostAuth(result.user.uid);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Google Login Failed",
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
            width={180}
            height={50}
            priority
          />
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 bg-secondary/30">
        <Card className="w-full max-w-md shadow-2xl border-none rounded-[2rem] overflow-hidden bg-white">
          <CardHeader className="bg-primary/5 p-8 text-center">
            <CardTitle className="text-2xl text-primary font-bold">Provider Login</CardTitle>
            <CardDescription className="font-medium">Welcome back, Pro!</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 h-12" required />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link href="#" className="text-xs text-primary font-bold">Forgot?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 h-12" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full h-12 bg-primary rounded-xl font-bold">
                {loading ? "Signing in..." : "Log In"}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </form>
            <div className="relative my-6 text-center">
              <span className="bg-white px-2 text-xs text-muted-foreground font-bold uppercase tracking-widest">Or</span>
              <div className="absolute inset-0 top-1/2 -z-10 border-t border-muted" />
            </div>
            <Button variant="outline" onClick={handleGoogleLogin} className="w-full h-12 rounded-xl font-bold flex gap-2">
              Continue with Google
            </Button>
          </CardContent>
          <CardFooter className="p-8 pt-0">
            <p className="text-center w-full text-sm text-muted-foreground">
              New here? <Link href="/register" className="text-primary font-bold hover:underline">Apply to Join</Link>
            </p>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
