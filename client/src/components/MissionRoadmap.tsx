import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { missions } from "@/data/ranks";
import { CheckCircle, Circle, Lock, Target, Trophy, Users, DollarSign } from "lucide-react";

export default function MissionRoadmap() {
  const getMissionIcon = (missionId: string, completed: boolean) => {
    const baseClasses = "h-6 w-6";
    const iconColor = completed ? "text-green-400" : "text-blue-400";
    
    switch (missionId) {
      case 'beta-launch':
        return <Target className={`${baseClasses} ${iconColor}`} />;
      case 'dex-release':
        return <Trophy className={`${baseClasses} ${iconColor}`} />;
      case 'community-million':
        return <Users className={`${baseClasses} ${iconColor}`} />;
      case 'billion-assets':
        return <DollarSign className={`${baseClasses} ${iconColor}`} />;
      default:
        return <Circle className={`${baseClasses} ${iconColor}`} />;
    }
  };

  const getTimelineDate = (missionId: string) => {
    switch (missionId) {
      case 'beta-launch': return 'Q3 2025';
      case 'dex-release': return 'Q4 2025';
      case 'community-million': return 'Q2 2026';
      case 'billion-assets': return '2027 Target';
      default: return 'TBD';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <Card className="bg-black/80 backdrop-blur-sm border-green-500/30">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-white">
            Mission Roadmap
          </CardTitle>
          <p className="text-center text-gray-400">
            Track the progress of GXCOIN's regenerative finance revolution
          </p>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Progress Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {missions.filter(m => m.completed).length}
              </div>
              <div className="text-sm text-gray-400">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {missions.filter(m => !m.completed && m.unlocked).length}
              </div>
              <div className="text-sm text-gray-400">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400">
                {missions.filter(m => !m.unlocked).length}
              </div>
              <div className="text-sm text-gray-400">Locked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {Math.round(missions.reduce((acc, m) => acc + m.progress, 0) / missions.length)}%
              </div>
              <div className="text-sm text-gray-400">Overall</div>
            </div>
          </div>

          {/* Mission Timeline */}
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-500 via-blue-500 to-gray-600" />
            
            <div className="space-y-8">
              {missions.map((mission, index) => (
                <motion.div
                  key={mission.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className="relative flex items-start gap-6"
                >
                  {/* Timeline Node */}
                  <div className={`
                    relative z-10 flex items-center justify-center w-16 h-16 rounded-full border-4
                    ${mission.completed 
                      ? 'bg-green-500 border-green-400' 
                      : mission.unlocked 
                      ? 'bg-blue-500/20 border-blue-400' 
                      : 'bg-gray-800 border-gray-600'
                    }
                  `}>
                    {mission.completed ? (
                      <CheckCircle className="h-8 w-8 text-white" />
                    ) : mission.unlocked ? (
                      getMissionIcon(mission.id, false)
                    ) : (
                      <Lock className="h-6 w-6 text-gray-400" />
                    )}
                  </div>

                  {/* Mission Content */}
                  <div className="flex-1 pb-8">
                    <Card className={`
                      transition-all duration-300 
                      ${mission.completed 
                        ? 'bg-green-500/10 border-green-500/50' 
                        : mission.unlocked 
                        ? 'bg-blue-500/10 border-blue-500/50' 
                        : 'bg-gray-900/50 border-gray-700'
                      }
                    `}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className={`text-lg font-bold ${
                              mission.completed ? 'text-green-400' :
                              mission.unlocked ? 'text-white' : 'text-gray-400'
                            }`}>
                              {mission.title}
                            </h3>
                            <Badge variant="outline" className="text-xs mt-1">
                              {getTimelineDate(mission.id)}
                            </Badge>
                          </div>
                          <Badge 
                            variant={mission.completed ? "default" : "outline"}
                            className={
                              mission.completed ? 'bg-green-500' :
                              mission.unlocked ? 'border-blue-400 text-blue-400' :
                              'border-gray-600 text-gray-400'
                            }
                          >
                            {mission.completed ? 'Complete' : 
                             mission.unlocked ? 'Active' : 'Locked'}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-300 mb-4">
                          {mission.description}
                        </p>

                        {mission.unlocked && !mission.completed && (
                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Progress:</span>
                              <span className={mission.progress > 75 ? 'text-green-400' : 'text-blue-400'}>
                                {mission.progress}%
                              </span>
                            </div>
                            <Progress 
                              value={mission.progress} 
                              className="h-2"
                            />
                          </div>
                        )}

                        <div className="flex justify-between items-center">
                          <div className="text-sm text-gray-400">
                            Reward: <span className="text-purple-400">{mission.reward}</span>
                          </div>
                          {mission.completed && (
                            <Badge variant="outline" className="text-green-400 border-green-400">
                              <Trophy className="h-3 w-3 mr-1" />
                              Earned
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center p-6 bg-gradient-to-r from-green-900/30 to-blue-900/30 rounded-lg border border-green-500/30"
          >
            <h3 className="text-xl font-bold text-white mb-2">
              Join the Mission
            </h3>
            <p className="text-gray-300 mb-4">
              Every contribution accelerates our progress toward a regenerative future
            </p>
            <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              1M Community • $1B Regenerated • 2027 Target
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
}
