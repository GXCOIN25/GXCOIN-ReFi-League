import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Star, Shield, Zap, CreditCard, CheckCircle2, Sparkles, Award, Gem } from "lucide-react";
import Confetti from "react-confetti";

interface CardTier {
  name: string;
  color: string;
  contribution: string;
  features: string[];
  spending: string;
  creditLimit: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface EnrollmentData {
  fullName: string;
  email: string;
  phoneNumber?: string;
  selectedTier: string;
  hasAnchorOwnership: boolean;
  contributionLevel: string;
  cardType: "debit" | "credit";
  acceptedTerms: boolean;
}

interface BlackCardEnrollmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: EnrollmentData) => void;
}

const tiers: CardTier[] = [
  {
    name: "Bronze Recruit",
    color: "#cd7f32",
    contribution: "$175+",
    features: [
      "Patent licensing profit sharing",
      "Eco-warrior reward multipliers",
      "Real-time impact dashboard",
      "GXCOIN staking rewards"
    ],
    spending: "$500 - $5,000",
    creditLimit: "$5,000",
    icon: Shield
  },
  {
    name: "Silver Defender",
    color: "#c0c0c0",
    contribution: "$500+",
    features: [
      "All Bronze benefits",
      "VIP Concierge services 24/7",
      "Self-custody security protocol"
    ],
    spending: "$5,000 - $25,000",
    creditLimit: "$25,000",
    icon: Star
  },
  {
    name: "Gold Guardian",
    color: "#ffd700",
    contribution: "$1,000+",
    features: [
      "All Silver benefits",
      "Global premium event access",
      "Bitcoin cashback on all purchases"
    ],
    spending: "$25,000 - $100,000",
    creditLimit: "$100,000",
    icon: Award
  },
  {
    name: "Platinum Champion",
    color: "#e5e4e2",
    contribution: "$5,000+",
    features: [
      "All Gold benefits",
      "$500,000 spending power limit",
      "Private wealth management"
    ],
    spending: "$100,000 - $500,000",
    creditLimit: "$500,000",
    icon: Crown
  },
  {
    name: "Diamond Legend",
    color: "#b9f2ff",
    contribution: "$10,000+",
    features: [
      "All Platinum benefits",
      "Unlimited spending power",
      "Dedicated wealth concierge",
      "Exclusive patent access"
    ],
    spending: "Unlimited",
    creditLimit: "Unlimited",
    icon: Gem
  }
];

const contributionLevels = [
  "$0 - $174",
  "$175 - $499",
  "$500 - $999",
  "$1,000 - $4,999",
  "$5,000 - $9,999",
  "$10,000+"
];

export default function BlackCardEnrollmentForm({ isOpen, onClose, onSubmit }: BlackCardEnrollmentFormProps) {
  const [formData, setFormData] = useState<EnrollmentData>({
    fullName: "",
    email: "",
    phoneNumber: "",
    selectedTier: "",
    hasAnchorOwnership: false,
    contributionLevel: "",
    cardType: "debit",
    acceptedTerms: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showConfetti, setShowConfetti] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.selectedTier) {
      newErrors.selectedTier = "Please select a tier";
    }

    if (!formData.acceptedTerms) {
      newErrors.acceptedTerms = "You must accept the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setShowConfetti(true);

    setTimeout(() => {
      if (onSubmit) {
        onSubmit(formData);
      }
      
      setTimeout(() => {
        setShowConfetti(false);
        setIsSubmitting(false);
        onClose();
        
        setFormData({
          fullName: "",
          email: "",
          phoneNumber: "",
          selectedTier: "",
          hasAnchorOwnership: false,
          contributionLevel: "",
          cardType: "debit",
          acceptedTerms: false
        });
      }, 3000);
    }, 500);
  };

  const selectedTierData = tiers.find(t => t.name === formData.selectedTier);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900 via-black to-gray-800 border-yellow-500/50">
        {showConfetti && (
          <Confetti
            width={typeof window !== 'undefined' ? window.innerWidth : 300}
            height={typeof window !== 'undefined' ? window.innerHeight : 200}
            recycle={false}
            numberOfPieces={500}
          />
        )}
        
        <DialogHeader>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <DialogTitle className="text-3xl font-bold text-center bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-400 bg-clip-text text-transparent">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CreditCard className="h-8 w-8 text-yellow-400" />
                <span>GXCOIN Premium Visa Black Card</span>
                <Sparkles className="h-8 w-8 text-yellow-400" />
              </div>
            </DialogTitle>
            <DialogDescription className="text-center text-gray-300 text-lg">
              Join the elite ranks of eco-warriors with patent-powered rewards
            </DialogDescription>
          </motion.div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8 mt-6">
          {/* Tier Selection */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Label className="text-xl font-bold text-yellow-400 mb-4 block">
              Select Your Tier
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {tiers.map((tier, index) => {
                  const TierIcon = tier.icon;
                  const isSelected = formData.selectedTier === tier.name;
                  
                  return (
                    <motion.div
                      key={tier.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index, duration: 0.4 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        className={`cursor-pointer transition-all duration-300 ${
                          isSelected
                            ? 'border-2 shadow-2xl ring-2 ring-offset-2 ring-offset-black'
                            : 'border hover:border-opacity-70'
                        }`}
                        style={{
                          borderColor: tier.color,
                          backgroundColor: isSelected ? `${tier.color}20` : 'rgba(0,0,0,0.5)'
                        }}
                        onClick={() => {
                          setFormData({ ...formData, selectedTier: tier.name });
                          setErrors({ ...errors, selectedTier: "" });
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div style={{ color: tier.color }}>
                                <TierIcon className="h-6 w-6" />
                              </div>
                              <h3 
                                className="font-bold text-lg"
                                style={{ color: tier.color }}
                              >
                                {tier.name}
                              </h3>
                            </div>
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              >
                                <CheckCircle2 className="h-6 w-6 text-green-400" />
                              </motion.div>
                            )}
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-gray-300">
                              <span>Contribution:</span>
                              <span className="font-semibold" style={{ color: tier.color }}>
                                {tier.contribution}
                              </span>
                            </div>
                            <div className="flex justify-between text-gray-300">
                              <span>Credit Limit:</span>
                              <span className="font-semibold text-green-400">
                                {tier.creditLimit}
                              </span>
                            </div>
                            <div className="flex justify-between text-gray-300">
                              <span>Spending:</span>
                              <span className="font-semibold text-blue-400">
                                {tier.spending}
                              </span>
                            </div>
                          </div>

                          <div className="mt-3 pt-3 border-t border-gray-700">
                            <p className="text-xs text-gray-400 mb-2 font-semibold">Features:</p>
                            <ul className="space-y-1">
                              {tier.features.slice(0, 3).map((feature, i) => (
                                <li key={i} className="flex items-start gap-1 text-xs text-gray-300">
                                  <Star className="h-3 w-3 text-yellow-400 flex-shrink-0 mt-0.5" />
                                  <span>{feature}</span>
                                </li>
                              ))}
                              {tier.features.length > 3 && (
                                <li className="text-xs text-gray-400 italic">
                                  +{tier.features.length - 3} more benefits
                                </li>
                              )}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
            {errors.selectedTier && (
              <p className="text-red-400 text-sm mt-2">{errors.selectedTier}</p>
            )}
          </motion.div>

          {/* Selected Tier Summary */}
          <AnimatePresence>
            {selectedTierData && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-gradient-to-r from-yellow-500/10 via-green-500/10 to-blue-500/10 border border-yellow-500/30 rounded-lg p-4"
              >
                <h4 className="text-lg font-bold text-yellow-400 mb-3 flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Your Selected Tier: {selectedTierData.name}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-300 mb-2 font-semibold">All Features:</p>
                    <ul className="space-y-1">
                      {selectedTierData.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                          <Star className="h-4 w-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-black/30 rounded-lg p-3">
                      <p className="text-xs text-gray-400">Credit Limit</p>
                      <p className="text-2xl font-bold text-green-400">{selectedTierData.creditLimit}</p>
                    </div>
                    <div className="bg-black/30 rounded-lg p-3">
                      <p className="text-xs text-gray-400">Annual Spending Range</p>
                      <p className="text-lg font-bold text-blue-400">{selectedTierData.spending}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Personal Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="space-y-4"
          >
            <Label className="text-xl font-bold text-yellow-400 block">
              Personal Information
            </Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName" className="text-gray-300">
                  Full Name <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => {
                    setFormData({ ...formData, fullName: e.target.value });
                    setErrors({ ...errors, fullName: "" });
                  }}
                  className="bg-gray-800/50 border-gray-700 text-white mt-1"
                  placeholder="Enter your full name"
                />
                {errors.fullName && (
                  <p className="text-red-400 text-sm mt-1">{errors.fullName}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email" className="text-gray-300">
                  Email Address <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    setErrors({ ...errors, email: "" });
                  }}
                  className="bg-gray-800/50 border-gray-700 text-white mt-1"
                  placeholder="your.email@example.com"
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phoneNumber" className="text-gray-300">
                  Phone Number <span className="text-gray-500">(Optional)</span>
                </Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="bg-gray-800/50 border-gray-700 text-white mt-1"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div>
                <Label htmlFor="contributionLevel" className="text-gray-300">
                  Current Environmental Contribution
                </Label>
                <Select
                  value={formData.contributionLevel}
                  onValueChange={(value) => setFormData({ ...formData, contributionLevel: value })}
                >
                  <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white mt-1">
                    <SelectValue placeholder="Select contribution level" />
                  </SelectTrigger>
                  <SelectContent>
                    {contributionLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>

          {/* Card Type Selection */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="space-y-3"
          >
            <Label className="text-xl font-bold text-yellow-400 block">
              Preferred Card Type
            </Label>
            <RadioGroup
              value={formData.cardType}
              onValueChange={(value: "debit" | "credit") => 
                setFormData({ ...formData, cardType: value })
              }
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div>
                <Card className="cursor-pointer border-2 hover:border-green-500 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="debit" id="debit" />
                      <Label htmlFor="debit" className="cursor-pointer flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-white">Debit Card</p>
                            <p className="text-sm text-gray-400">$500 - $500,000 USD</p>
                          </div>
                          <CreditCard className="h-8 w-8 text-green-400" />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Direct spending from your balance
                        </p>
                      </Label>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card className="cursor-pointer border-2 hover:border-blue-500 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="credit" id="credit" />
                      <Label htmlFor="credit" className="cursor-pointer flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-white">Credit Card</p>
                            <p className="text-sm text-gray-400">$5,000 - $500,000 USD</p>
                          </div>
                          <CreditCard className="h-8 w-8 text-blue-400" />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Build credit with crypto rewards
                        </p>
                      </Label>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </RadioGroup>
          </motion.div>

          {/* Additional Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="space-y-4"
          >
            <div className="flex items-start space-x-3 bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <Checkbox
                id="anchorOwnership"
                checked={formData.hasAnchorOwnership}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, hasAnchorOwnership: checked as boolean })
                }
              />
              <div className="flex-1">
                <Label htmlFor="anchorOwnership" className="cursor-pointer text-white font-semibold">
                  I own GXCOIN Anchor tokens
                </Label>
                <p className="text-sm text-gray-300 mt-1">
                  Unlock enhanced rewards and multipliers with GXCOIN Anchor ownership
                </p>
              </div>
              <Crown className="h-6 w-6 text-green-400 flex-shrink-0" />
            </div>

            <div className="flex items-start space-x-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <Checkbox
                id="terms"
                checked={formData.acceptedTerms}
                onCheckedChange={(checked) => {
                  setFormData({ ...formData, acceptedTerms: checked as boolean });
                  setErrors({ ...errors, acceptedTerms: "" });
                }}
              />
              <div className="flex-1">
                <Label htmlFor="terms" className="cursor-pointer text-white font-semibold">
                  I accept the Terms & Conditions <span className="text-red-400">*</span>
                </Label>
                <p className="text-sm text-gray-300 mt-1">
                  I agree to the GXCOIN Premium Visa Black Card terms, privacy policy, and patent licensing agreements
                </p>
              </div>
            </div>
            {errors.acceptedTerms && (
              <p className="text-red-400 text-sm mt-1">{errors.acceptedTerms}</p>
            )}
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="pt-4"
          >
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-yellow-600 via-yellow-500 to-orange-500 hover:from-yellow-500 hover:via-yellow-400 hover:to-orange-400 text-white font-bold text-lg py-6 min-h-[56px] shadow-2xl transition-all duration-300 hover:shadow-yellow-500/50"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="h-5 w-5" />
                  </motion.div>
                  Processing Application...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Submit Application
                  <Sparkles className="h-5 w-5" />
                </span>
              )}
            </Button>

            <p className="text-center text-xs text-gray-400 mt-4">
              Your application will be reviewed within 24-48 hours. Selected applicants will receive
              their GXCOIN Premium Visa Black Card with exclusive patent-powered rewards.
            </p>
          </motion.div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
