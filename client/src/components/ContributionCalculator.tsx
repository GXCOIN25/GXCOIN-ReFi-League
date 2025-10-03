import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useContribution } from "@/lib/stores/useContribution";
import { useAudio } from "@/lib/stores/useAudio";
import { Calculator, Droplet, TreePine, Zap, Recycle, Globe } from "lucide-react";

export default function ContributionCalculator() {
  const [simulatedAmount, setSimulatedAmount] = useState([500]);
  const { addContribution, calculateImpact, getCurrentRank } = useContribution();
  const { playSuccess } = useAudio();
  
  const simulatedImpact = calculateImpact(simulatedAmount[0]);
  const allRanks = useContribution.getState().getCurrentRank();
  const simulatedRank = allRanks;

  const handleContribute = () => {
    addContribution(simulatedAmount[0]);
    playSuccess();
  };

  const impactItems = [
    {
      icon: <Droplet className="h-5 w-5 text-blue-400" />,
      label: "Plastic Removed",
      value: simulatedImpact.plasticRemoved,
      unit: "gallons",
      color: "text-blue-400"
    },
    {
      icon: <Globe className="h-5 w-5 text-green-400" />,
      label: "Carbon Offset",
      value: simulatedImpact.carbonOffset,
      unit: "tons CO₂",
      color: "text-green-400"
    },
    {
      icon: <Zap className="h-5 w-5 text-yellow-400" />,
      label: "Renewable Energy",
      value: simulatedImpact.renewableEnergy,
      unit: "kWh",
      color: "text-yellow-400"
    },
    {
      icon: <TreePine className="h-5 w-5 text-emerald-400" />,
      label: "Trees Planted",
      value: simulatedImpact.treesPlanted,
      unit: "trees",
      color: "text-emerald-400"
    },
    {
      icon: <Recycle className="h-5 w-5 text-purple-400" />,
      label: "Water Purified",
      value: simulatedImpact.waterPurified,
      unit: "gallons",
      color: "text-purple-400"
    }
  ];

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <Card className="bg-black/80 backdrop-blur-sm border-green-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Calculator className="h-6 w-6 text-green-400" />
            Impact Calculator
          </CardTitle>
          <p className="text-gray-400">
            See the real-world impact of your contribution
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Contribution Amount */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-white">
                Contribution Amount
              </label>
              <Badge 
                variant="outline" 
                style={{ 
                  color: simulatedRank.color, 
                  borderColor: simulatedRank.color 
                }}
              >
                {simulatedRank.name}
              </Badge>
            </div>
            
            <div className="space-y-4">
              <Slider
                value={simulatedAmount}
                onValueChange={setSimulatedAmount}
                max={10000}
                min={175}
                step={25}
                className="w-full"
              />
              
              <div className="flex items-center gap-2">
                <span className="text-white">$</span>
                <Input
                  type="number"
                  value={simulatedAmount[0]}
                  onChange={(e) => setSimulatedAmount([parseInt(e.target.value) || 175])}
                  className="text-white bg-gray-900 border-gray-700"
                  min={175}
                  max={10000}
                />
              </div>
            </div>
          </div>

          {/* Impact Visualization */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Your Impact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {impactItems.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-lg bg-gray-900/50 border border-gray-700"
                >
                  <div className="flex items-center gap-3 mb-2">
                    {item.icon}
                    <span className="text-sm text-gray-300">{item.label}</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-2xl font-bold ${item.color}`}>
                      {item.value.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-400">{item.unit}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Rank Benefits Preview */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-700">
            <h4 className="text-white font-medium mb-2">Unlocked Benefits:</h4>
            <div className="space-y-1 text-sm">
              {simulatedRank.benefits.slice(0, 3).map((benefit: string, index: number) => (
                <div key={index} className="flex items-center gap-2 text-gray-300">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: simulatedRank.color }}
                  />
                  {benefit}
                </div>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <Button
            onClick={handleContribute}
            className="w-full bg-gradient-to-r from-green-600 to-green-400 hover:from-green-500 hover:to-green-300 text-white font-semibold py-3"
            size="lg"
          >
            Contribute ${simulatedAmount[0].toLocaleString()} & Make Impact
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
