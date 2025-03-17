import React, { useState, useEffect } from "react";
import PharmacistNavbar from "@/components/shared/NavBar/PharmacistNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Shield,
  AlertTriangle,
  Search,
  LucideShieldCheck,
  Clock,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchPrescriptions,
  fetchShipmentsByDistributor,
  updatePrescriptionDispensedStatus,
} from "@/lib/database";
import { Prescription, Shipment, Drug } from "@/types/database";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PharmacistDashboard = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Load prescriptions
      const prescriptionsData = await fetchPrescriptions();
      setPrescriptions(prescriptionsData);

      // Load shipments for this pharmacist
      const shipmentsData = await fetchShipmentsByDistributor(user.id);
      setShipments(shipmentsData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDispense = async (prescription: Prescription) => {
    if (!user) return;

    // Check if prescription is blockchain verified
    if (
      !prescription.blockchain_tx_id ||
      prescription.blockchain_tx_id === "pending"
    ) {
      toast({
        title: "Verification Error",
        description:
          "Cannot dispense prescription that is not verified on blockchain.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const success = await updatePrescriptionDispensedStatus(
        prescription.prescription_id,
        true,
        user.id
      );

      if (success) {
        toast({
          title: "Success",
          description: "Prescription dispensed and recorded on blockchain!",
        });

        // Refresh data
        await loadData();
      }
    } catch (error) {
      console.error("Error dispensing prescription:", error);
      toast({
        title: "Error",
        description: "Failed to dispense prescription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "delivered":
        return "default";
      case "in_transit":
        return "secondary";
      case "pending":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PharmacistNavbar />
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gradient">
            Pharmacist Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your inventory and track shipments
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="glass-card">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-xl">
              <CardTitle className="flex items-center gap-2">
                <LucideShieldCheck size={18} />
                Recent Shipments
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="animate-spin h-8 w-8 text-primary" />
                </div>
              ) : shipments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No recent shipments
                </div>
              ) : (
                <div className="space-y-4">
                  {shipments.slice(0, 5).map((shipment) => (
                    <div
                      key={shipment.shipment_id}
                      className="flex items-center justify-between py-2"
                    >
                      <div>
                        <div className="font-medium">
                          {shipment.shipment_id.slice(0, 8)}...
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(shipment.ship_date).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge variant={getStatusBadgeVariant(shipment.status)}>
                        {shipment.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-xl">
              <CardTitle className="flex items-center gap-2">
                <Clock size={18} />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Add recent activity items here */}
                <div className="text-center py-8 text-muted-foreground">
                  No recent activity
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-xl">
              <CardTitle className="flex items-center gap-2">
                <Shield size={18} />
                Blockchain Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <div className="text-sm">Network: Connected</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <div className="text-sm">Last Sync: Just now</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <div className="text-sm">Verified Transactions: 123</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PharmacistDashboard;
