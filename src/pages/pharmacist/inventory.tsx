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
  Search,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { fetchDrugsByPharmacist } from "@/lib/database";
import { Drug } from "@/types/database";

const InventoryPage = () => {
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadInventory();
    }
  }, [user]);

  const loadInventory = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const drugsData = await fetchDrugsByPharmacist(user.id);
      setDrugs(drugsData);
    } catch (error) {
      console.error("Error loading inventory:", error);
      toast({
        title: "Error",
        description: "Failed to load inventory. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getExpiryStatus = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const monthsUntilExpiry = Math.floor(
      (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30)
    );

    if (monthsUntilExpiry < 0) {
      return "expired";
    } else if (monthsUntilExpiry < 3) {
      return "expiring_soon";
    } else {
      return "valid";
    }
  };

  const getQuantityFromBatchNumber = (batchNumber: string) => {
    const matches = batchNumber.match(/\d+/);
    return matches ? parseInt(matches[0]) : 0;
  };

  const filteredDrugs = drugs.filter((drug) => {
    const matchesSearch =
      drug.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drug.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drug.batch_number.toLowerCase().includes(searchQuery.toLowerCase());

    const expiryStatus = getExpiryStatus(drug.expiry_date);
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "expired" && expiryStatus === "expired") ||
      (statusFilter === "expiring_soon" && expiryStatus === "expiring_soon") ||
      (statusFilter === "valid" && expiryStatus === "valid");

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background">
      <PharmacistNavbar />
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gradient">Drug Inventory</h1>
          <p className="text-muted-foreground">
            Track and manage your drug inventory
          </p>
        </div>

        <Card className="glass-card">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-xl">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <CardTitle>Inventory Management</CardTitle>
              <div className="flex gap-4">
                <div className="w-[200px]">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="valid">Valid</SelectItem>
                      <SelectItem value="expiring_soon">
                        Expiring Soon
                      </SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative w-[250px]">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search drugs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredDrugs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No drugs found in inventory
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Drug Name</TableHead>
                      <TableHead>Batch Number</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Manufacturer</TableHead>
                      <TableHead>Manufacture Date</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Blockchain Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDrugs.map((drug) => {
                      const expiryStatus = getExpiryStatus(drug.expiry_date);
                      const quantity = getQuantityFromBatchNumber(
                        drug.batch_number
                      );
                      return (
                        <TableRow
                          key={drug.drug_id}
                          className="hover:bg-primary/5"
                        >
                          <TableCell className="font-medium">
                            {drug.name}
                          </TableCell>
                          <TableCell>{drug.batch_number}</TableCell>
                          <TableCell>{quantity}</TableCell>
                          <TableCell>{drug.manufacturer}</TableCell>
                          <TableCell>
                            {new Date(
                              drug.manufacture_date
                            ).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {new Date(drug.expiry_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {expiryStatus === "expired" ? (
                              <Badge
                                variant="destructive"
                                className="flex items-center gap-1"
                              >
                                <AlertTriangle size={12} />
                                Expired
                              </Badge>
                            ) : expiryStatus === "expiring_soon" ? (
                              <Badge
                                variant="secondary"
                                className="flex items-center gap-1"
                              >
                                <AlertCircle size={12} />
                                Expiring Soon
                              </Badge>
                            ) : (
                              <Badge
                                variant="default"
                                className="flex items-center gap-1"
                              >
                                <CheckCircle size={12} />
                                Valid
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {drug.blockchain_tx_id === "pending" ? (
                              <Badge
                                variant="outline"
                                className="flex items-center gap-1"
                              >
                                <Loader2 size={12} className="animate-spin" />
                                Pending
                              </Badge>
                            ) : drug.blockchain_tx_id ? (
                              <Badge
                                variant="default"
                                className="flex items-center gap-1"
                              >
                                <CheckCircle size={12} />
                                Verified
                              </Badge>
                            ) : (
                              <Badge
                                variant="destructive"
                                className="flex items-center gap-1"
                              >
                                <AlertTriangle size={12} />
                                Not Verified
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-card">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-xl">
              <CardTitle>Inventory Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Drugs</span>
                  <span className="text-2xl font-semibold">
                    {drugs.reduce(
                      (total, drug) =>
                        total + getQuantityFromBatchNumber(drug.batch_number),
                      0
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Expiring Soon</span>
                  <span className="text-2xl font-semibold">
                    {drugs
                      .filter(
                        (drug) =>
                          getExpiryStatus(drug.expiry_date) === "expiring_soon"
                      )
                      .reduce(
                        (total, drug) =>
                          total + getQuantityFromBatchNumber(drug.batch_number),
                        0
                      )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Expired</span>
                  <span className="text-2xl font-semibold">
                    {drugs
                      .filter(
                        (drug) =>
                          getExpiryStatus(drug.expiry_date) === "expired"
                      )
                      .reduce(
                        (total, drug) =>
                          total + getQuantityFromBatchNumber(drug.batch_number),
                        0
                      )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-xl">
              <CardTitle>Blockchain Status</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    Verified on Blockchain
                  </span>
                  <span className="text-2xl font-semibold">
                    {
                      drugs.filter(
                        (drug) =>
                          drug.blockchain_tx_id &&
                          drug.blockchain_tx_id !== "pending"
                      ).length
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    Pending Verification
                  </span>
                  <span className="text-2xl font-semibold">
                    {
                      drugs.filter(
                        (drug) => drug.blockchain_tx_id === "pending"
                      ).length
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    Not on Blockchain
                  </span>
                  <span className="text-2xl font-semibold">
                    {drugs.filter((drug) => !drug.blockchain_tx_id).length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-xl">
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={loadInventory}
                >
                  <Loader2 className="mr-2 h-4 w-4" />
                  Refresh Inventory
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InventoryPage;
