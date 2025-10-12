import { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  TrendingUp, 
  Users, 
  Activity, 
  RefreshCw, 
  AlertCircle,
  BarChart3,
  Clock,
  ChevronDown,
  Radio
} from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@/lib/stores/useUser';
import type { 
  DashboardOverview, 
  EventsTimeline, 
  TopUser, 
  ConversionFunnel, 
  RealtimeMetrics,
  AnalyticsEventType 
} from 'shared/types';

const API_BASE = '/api';

const AnalyticsDashboard = () => {
  const { isLoggedIn } = useUser();
  
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [realtime, setRealtime] = useState<RealtimeMetrics | null>(null);
  const [timeline, setTimeline] = useState<EventsTimeline | null>(null);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [funnel, setFunnel] = useState<ConversionFunnel | null>(null);
  
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [loadingRealtime, setLoadingRealtime] = useState(true);
  const [loadingTimeline, setLoadingTimeline] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingFunnel, setLoadingFunnel] = useState(true);
  
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [timelineInterval, setTimelineInterval] = useState<'hourly' | 'daily' | 'weekly'>('daily');
  const [dateRange, setDateRange] = useState<'7' | '30' | '90'>('7');
  const [eventTypeFilter, setEventTypeFilter] = useState<AnalyticsEventType | 'all'>('all');
  const [funnelType, setFunnelType] = useState<'purchase' | 'airdrop' | 'guild_join'>('purchase');
  
  const getAuthHeaders = () => {
    const token = localStorage.getItem('gxcoin_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };
  
  const handleAuthError = useCallback(() => {
    toast.error('Authentication required', {
      description: 'Please login to view analytics'
    });
  }, []);
  
  const fetchOverview = useCallback(async () => {
    try {
      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000).toISOString();
      
      const response = await fetch(
        `${API_BASE}/analytics/dashboard/overview?startDate=${startDate}&endDate=${endDate}`,
        { headers: getAuthHeaders() }
      );
      
      if (response.status === 401) {
        handleAuthError();
        return;
      }
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch overview');
      }
      
      const data = await response.json();
      setOverview(data.data);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load overview';
      setError(message);
      toast.error('Overview Error', { description: message });
    } finally {
      setLoadingOverview(false);
    }
  }, [dateRange, handleAuthError]);
  
  const fetchRealtime = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_BASE}/analytics/dashboard/realtime`,
        { headers: getAuthHeaders() }
      );
      
      if (response.status === 401) {
        handleAuthError();
        return;
      }
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch realtime metrics');
      }
      
      const data = await response.json();
      setRealtime(data.data);
    } catch (err) {
      console.error('Realtime fetch error:', err);
    } finally {
      setLoadingRealtime(false);
      setIsRefreshing(false);
    }
  }, [handleAuthError]);
  
  const fetchTimeline = useCallback(async () => {
    try {
      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000).toISOString();
      const eventType = eventTypeFilter === 'all' ? undefined : eventTypeFilter;
      
      const params = new URLSearchParams({
        startDate,
        endDate,
        interval: timelineInterval,
        ...(eventType && { eventType })
      });
      
      const response = await fetch(
        `${API_BASE}/analytics/dashboard/timeline?${params}`,
        { headers: getAuthHeaders() }
      );
      
      if (response.status === 401) {
        handleAuthError();
        return;
      }
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch timeline');
      }
      
      const data = await response.json();
      setTimeline(data.data);
    } catch (err) {
      console.error('Timeline fetch error:', err);
    } finally {
      setLoadingTimeline(false);
    }
  }, [dateRange, timelineInterval, eventTypeFilter, handleAuthError]);
  
  const fetchTopUsers = useCallback(async () => {
    try {
      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000).toISOString();
      
      const response = await fetch(
        `${API_BASE}/analytics/dashboard/top-users?startDate=${startDate}&endDate=${endDate}&limit=10`,
        { headers: getAuthHeaders() }
      );
      
      if (response.status === 401) {
        handleAuthError();
        return;
      }
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch top users');
      }
      
      const data = await response.json();
      setTopUsers(data.data);
    } catch (err) {
      console.error('Top users fetch error:', err);
    } finally {
      setLoadingUsers(false);
    }
  }, [dateRange, handleAuthError]);
  
  const fetchFunnel = useCallback(async () => {
    try {
      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - parseInt(dateRange) * 24 * 60 * 60 * 1000).toISOString();
      
      const response = await fetch(
        `${API_BASE}/analytics/dashboard/funnel?funnelType=${funnelType}&startDate=${startDate}&endDate=${endDate}`,
        { headers: getAuthHeaders() }
      );
      
      if (response.status === 401) {
        handleAuthError();
        return;
      }
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch funnel');
      }
      
      const data = await response.json();
      setFunnel(data.data);
    } catch (err) {
      console.error('Funnel fetch error:', err);
    } finally {
      setLoadingFunnel(false);
    }
  }, [dateRange, funnelType, handleAuthError]);
  
  useEffect(() => {
    if (!isLoggedIn) {
      handleAuthError();
      return;
    }
    
    fetchOverview();
    fetchTimeline();
    fetchTopUsers();
    fetchFunnel();
  }, [isLoggedIn, fetchOverview, fetchTimeline, fetchTopUsers, fetchFunnel, handleAuthError]);
  
  useEffect(() => {
    if (!isLoggedIn) return;
    
    fetchRealtime();
    const realtimeInterval = setInterval(() => {
      setIsRefreshing(true);
      fetchRealtime();
    }, 10000);
    
    return () => clearInterval(realtimeInterval);
  }, [isLoggedIn, fetchRealtime]);
  
  useEffect(() => {
    if (!isLoggedIn) return;
    
    const overviewInterval = setInterval(fetchOverview, 30000);
    return () => clearInterval(overviewInterval);
  }, [isLoggedIn, fetchOverview]);
  
  const handleRetry = () => {
    setLoadingOverview(true);
    setLoadingRealtime(true);
    setLoadingTimeline(true);
    setLoadingUsers(true);
    setLoadingFunnel(true);
    setError(null);
    
    fetchOverview();
    fetchRealtime();
    fetchTimeline();
    fetchTopUsers();
    fetchFunnel();
  };
  
  const getConversionColor = (rate: number) => {
    if (rate >= 70) return 'text-green-400';
    if (rate >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  if (!isLoggedIn) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-blue-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-gray-400">
              Real-time growth metrics and user insights
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge 
              variant="outline" 
              className={`${isRefreshing ? 'animate-pulse' : ''} bg-green-500/20 text-green-400 border-green-500/50`}
            >
              <Radio className="w-3 h-3 mr-1" />
              LIVE
            </Badge>
            
            <Select value={dateRange} onValueChange={(value: '7' | '30' | '90') => setDateRange(value)}>
              <SelectTrigger className="w-[140px] bg-black/40 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>
        
        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-400">{error}</p>
            </div>
            <Button 
              onClick={handleRetry}
              variant="outline"
              size="sm"
              className="border-red-500/50 text-red-400 hover:bg-red-500/20"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </motion.div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-black/40 border-gray-700 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Total Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingOverview ? (
                  <Skeleton className="h-10 w-24" />
                ) : (
                  <div className="text-3xl font-bold text-white">
                    {overview?.totalEvents.toLocaleString() || 0}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-black/40 border-gray-700 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Unique Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingOverview ? (
                  <Skeleton className="h-10 w-24" />
                ) : (
                  <div className="text-3xl font-bold text-white">
                    {overview?.uniqueUsers.toLocaleString() || 0}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-black/40 border-gray-700 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Active Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingOverview ? (
                  <Skeleton className="h-10 w-24" />
                ) : (
                  <div className="text-3xl font-bold text-white">
                    {overview?.activeSessions.toLocaleString() || 0}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-black/40 border-gray-700 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Events/Min
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingRealtime ? (
                  <Skeleton className="h-10 w-24" />
                ) : (
                  <div className="text-3xl font-bold text-green-400">
                    {realtime?.eventRate.toFixed(1) || '0.0'}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-black/40 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Radio className={`w-5 h-5 ${isRefreshing ? 'animate-pulse text-green-400' : 'text-gray-400'}`} />
                  Real-time Metrics
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Updated every 10 seconds
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingRealtime ? (
                  <div className="space-y-3">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ) : realtime ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-blue-500/10 rounded-lg">
                      <span className="text-gray-300">Events (Last 5 min)</span>
                      <span className="text-2xl font-bold text-blue-400">
                        {realtime.eventsLast5Minutes}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg">
                      <span className="text-gray-300">Active Users (Last 10 min)</span>
                      <span className="text-2xl font-bold text-green-400">
                        {realtime.activeUsers}
                      </span>
                    </div>
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Top Event Types</h4>
                      <div className="space-y-2">
                        {realtime.topEventTypes.map((event, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-sm text-gray-300">{event.eventType}</span>
                            <Badge variant="secondary">{event.count}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    No realtime data available
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-black/40 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Event Type Breakdown</CardTitle>
                <CardDescription className="text-gray-400">
                  Distribution by event category
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingOverview ? (
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                ) : overview?.eventsByType.length ? (
                  <div className="space-y-3">
                    {overview.eventsByType.map((event, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">{event.eventType}</span>
                          <span className="text-gray-400">{event.percentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${event.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    No event data available
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-black/40 border-gray-700 backdrop-blur-sm">
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Events Timeline
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Event activity over time
                  </CardDescription>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Select value={timelineInterval} onValueChange={(value: 'hourly' | 'daily' | 'weekly') => setTimelineInterval(value)}>
                    <SelectTrigger className="w-[120px] bg-black/40 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={eventTypeFilter} onValueChange={(value: any) => setEventTypeFilter(value)}>
                    <SelectTrigger className="w-[150px] bg-black/40 border-gray-700 text-white">
                      <SelectValue placeholder="All Events" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      <SelectItem value="all">All Events</SelectItem>
                      <SelectItem value="PURCHASE">Purchases</SelectItem>
                      <SelectItem value="AIRDROP_CLAIM">Airdrops</SelectItem>
                      <SelectItem value="GUILD_ACTION">Guild Actions</SelectItem>
                      <SelectItem value="NFT_MINT">NFT Mints</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingTimeline ? (
                <Skeleton className="h-[300px] w-full" />
              ) : timeline?.data.length ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timeline.data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="timestamp" 
                      stroke="#9CA3AF"
                      tick={{ fill: '#9CA3AF' }}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        if (timelineInterval === 'hourly') {
                          return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                        }
                        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      }}
                    />
                    <YAxis stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                      labelStyle={{ color: '#F3F4F6' }}
                    />
                    <Legend wrapperStyle={{ color: '#9CA3AF' }} />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      dot={{ fill: '#10B981', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-400">
                  No timeline data available
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="bg-black/40 border-gray-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Top Users</CardTitle>
              <CardDescription className="text-gray-400">
                Most active users by event count
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingUsers ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : topUsers.length ? (
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-400">Rank</TableHead>
                      <TableHead className="text-gray-400">User</TableHead>
                      <TableHead className="text-gray-400">Events</TableHead>
                      <TableHead className="text-gray-400">Last Active</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topUsers.map((user, index) => (
                      <TableRow key={index} className="border-gray-700">
                        <TableCell className="text-white font-medium">#{index + 1}</TableCell>
                        <TableCell className="text-white">
                          {user.isAnonymous ? (
                            <span className="text-gray-400 italic">Anonymous</span>
                          ) : (
                            user.username || `User ${user.userId}`
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{user.eventCount.toLocaleString()}</Badge>
                        </TableCell>
                        <TableCell className="text-gray-400 text-sm">
                          {formatDate(user.lastActive)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No user data available
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="bg-black/40 border-gray-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Conversion Funnels</CardTitle>
              <CardDescription className="text-gray-400">
                Track user journey and conversion rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={funnelType} onValueChange={(value: any) => setFunnelType(value)}>
                <TabsList className="bg-gray-800 mb-6">
                  <TabsTrigger value="purchase">Purchase</TabsTrigger>
                  <TabsTrigger value="airdrop">Airdrop</TabsTrigger>
                  <TabsTrigger value="guild_join">Guild Join</TabsTrigger>
                </TabsList>
                
                <TabsContent value={funnelType} className="mt-0">
                  {loadingFunnel ? (
                    <div className="space-y-4">
                      {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                      ))}
                    </div>
                  ) : funnel?.stages.length ? (
                    <div className="space-y-4">
                      {funnel.stages.map((stage, index) => (
                        <motion.div 
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="relative"
                        >
                          <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white font-bold">
                              {index + 1}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="text-white font-medium">{stage.stage}</h4>
                                <div className="flex items-center gap-4">
                                  <span className="text-gray-400">{stage.count.toLocaleString()} users</span>
                                  <span className={`font-bold ${getConversionColor(stage.conversionRate)}`}>
                                    {stage.conversionRate.toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                              
                              <div className="w-full bg-gray-700 rounded-full h-3">
                                <div 
                                  className={`h-3 rounded-full transition-all ${
                                    stage.conversionRate >= 70 
                                      ? 'bg-green-500' 
                                      : stage.conversionRate >= 40 
                                      ? 'bg-yellow-500' 
                                      : 'bg-red-500'
                                  }`}
                                  style={{ width: `${stage.conversionRate}%` }}
                                />
                              </div>
                              
                              {stage.dropoffRate > 0 && (
                                <p className="text-sm text-gray-400 mt-1">
                                  {stage.dropoffRate.toFixed(1)}% drop-off
                                </p>
                              )}
                            </div>
                          </div>
                          
                          {index < funnel.stages.length - 1 && (
                            <div className="flex justify-center my-2">
                              <ChevronDown className="w-6 h-6 text-gray-600" />
                            </div>
                          )}
                        </motion.div>
                      ))}
                      
                      <div className="mt-6 p-4 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg border border-green-500/30">
                        <div className="flex justify-between items-center">
                          <span className="text-white font-medium">Overall Conversion Rate</span>
                          <span className="text-2xl font-bold text-green-400">
                            {funnel.overallConversionRate.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      No funnel data available for this type
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
