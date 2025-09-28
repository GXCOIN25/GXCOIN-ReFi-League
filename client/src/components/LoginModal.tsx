import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/lib/stores/useUser";
import { useContribution } from "@/lib/stores/useContribution";
import { useHeroes } from "@/lib/stores/useHeroes";
import { Loader2, User, Wallet, AlertCircle } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  
  const { register, login, isLoading, error, setError } = useUser();
  const { loadUserData } = useContribution();
  const { loadUserNFTs } = useHeroes();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      if (isSignup) {
        await register({ username, password, walletAddress: walletAddress || undefined });
      } else {
        await login({ username, password });
      }
      
      // Load user data after successful login/signup
      await loadUserData();
      await loadUserNFTs();
      
      onClose();
    } catch (err) {
      console.error('Login/signup failed:', err);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    try {
      // Create a demo user for testing
      await register({ 
        username: `demo_${Date.now()}`, 
        password: 'demo123',
        walletAddress: `0x${Math.random().toString(16).substr(2, 40)}`
      });
      
      // Load user data after successful registration
      await loadUserData();
      await loadUserNFTs();
      
      onClose();
    } catch (err) {
      console.error('Demo login failed:', err);
    }
  };


  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="bg-black/90 border-green-500/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-green-400 flex items-center gap-2 justify-center">
                <User className="h-6 w-6" />
                {isSignup ? 'Join the ReFi League' : 'Welcome Back, Hero'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500 rounded-md">
                  <div className="flex items-center gap-2 text-red-400">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{error}</span>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-white">
                    {isSignup ? 'Username' : 'User ID or Username'}
                  </Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={isSignup ? 'Choose a username' : 'Enter user ID or username'}
                    className="bg-gray-900 border-gray-700 text-white"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="bg-gray-900 border-gray-700 text-white"
                    required
                  />
                </div>
                
                {isSignup && (
                  <div className="space-y-2">
                    <Label htmlFor="wallet" className="text-white flex items-center gap-2">
                      <Wallet className="h-4 w-4" />
                      Wallet Address (Optional)
                    </Label>
                    <Input
                      id="wallet"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      placeholder="0x..."
                      className="bg-gray-900 border-gray-700 text-white"
                    />
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-500 text-white"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSignup ? 'Create Hero Account' : 'Enter ReFi League'}
                </Button>
              </form>
              
              <div className="space-y-3">
                <div className="text-center">
                  <span className="text-gray-400">or</span>
                </div>
                
                <Button 
                  onClick={handleDemoLogin}
                  variant="outline" 
                  className="w-full border-blue-500 text-blue-400 hover:bg-blue-500/10"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Try Demo Account
                </Button>
                
                <div className="text-center">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setIsSignup(!isSignup);
                      setError(null);
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    {isSignup ? 'Already have an account? Sign in' : 'New hero? Create account'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}