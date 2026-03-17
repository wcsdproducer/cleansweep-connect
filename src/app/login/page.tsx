
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
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
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
          description: "This account is not authorized as a Service Provider.",
        });
        return;
      }
      
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Verification Error:", error);
      toast({
        variant: "destructive",
        title: "Login Error",
        description: "Verification failed. Please try again.",
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
        description: "Invalid email or password.",
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
            height={45}
            priority
          />
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 bg-secondary/30">
        <Card className="w-full max-w-md shadow-2xl border-none rounded-[2.5rem] overflow-hidden bg-white">
          <CardHeader className="bg-primary/5 p-10 text-center border-b">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-3xl bg-white shadow-lg flex items-center justify-center text-primary">
                <ShieldCheck className="w-8 h-8" />
              </div>
            </div>
            <CardTitle className="text-3xl text-primary font-bold">Provider Portal</CardTitle>
            <CardDescription className="font-bold text-muted-foreground">Manage your cleaning empire.</CardDescription>
          </CardHeader>
          <CardContent className="p-10 space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-bold">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 h-12 rounded-xl" required />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link href="#" className="text-xs text-primary font-bold hover:underline">Forgot Password?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 h-12 rounded-xl" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full h-14 bg-primary text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]">
                {loading ? "Verifying..." : "Log In"}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </form>
            <div className="relative flex items-center py-4">
              <div className="flex-grow border-t border-muted"></div>
              <span className="flex-shrink mx-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Or Secure Login</span>
              <div className="flex-grow border-t border-muted"></div>
            </div>
            <Button variant="outline" onClick={handleGoogleLogin} disabled={loading} className="w-full h-14 rounded-2xl font-bold text-lg border-primary/20 hover:bg-primary/5">
              <Image src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width={24} height={24} className="mr-3" />
              Google Portal
            </Button>
          </CardContent>
          <CardFooter className="p-10 pt-0 text-center">
            <p className="w-full text-sm font-medium text-muted-foreground">
              Not a partner yet? <Link href="/register" className="text-primary font-bold hover:underline">Apply to Join CleanSweep</Link>
            </p>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
