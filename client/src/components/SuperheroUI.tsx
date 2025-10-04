import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useHeroes } from "@/lib/stores/useHeroes";
import { useContribution } from "@/lib/stores/useContribution";
import { useUser } from "@/lib/stores/useUser";
import { Zap, Shield, Crown, Star, Award, User, LogOut } from "lucide-react";

interface SuperheroUIProps {
  currentTab?: string;
}

export default function SuperheroUI({ currentTab = "home" }: SuperheroUIProps) {
  // OVERLAY COMPLETELY DISABLED - Fixed blocking issue on Heroes tab
  // The overlay cards (rank, user info, portfolio) were blocking the hero grid
  // This component now returns null to ensure full visibility of all tabs
  return null;
}
