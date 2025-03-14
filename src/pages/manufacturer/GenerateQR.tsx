import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { QrCode, Download, Loader2, Search, Calendar, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Drug } from "@/types/database";
import { fetchDrugsByManufacturer } from "@/lib/database";
import * as QRCodeLib from "qrcode";
import ManufacturerNavbar from "@/components/shared/NavBar/ManufacturerNavbar";

const GenerateQR: React.FC = () => {
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingQR, setGeneratingQR] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadDrugs();
    }
  }, [user]);

  useEffect(() => {
    drugs.forEach((drug) => {
      console.log("Drug:", {
        drug_id: drug.drug_id,
        blockchain_tx_id: drug.blockchain_tx_id,
        generatingQR,
        isDisabled:
          generatingQR === drug.drug_id ||
          !drug.blockchain_tx_id ||
          drug.blockchain_tx_id === "pending",
      });
    });
  }, [drugs, generatingQR]);

  const loadDrugs = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const drugsData = await fetchDrugsByManufacturer(user.id);
      setDrugs(drugsData);
    } catch (error) {
      console.error("Error loading drugs:", error);
      toast({
        title: "Error",
        description: "Failed to load drug batches. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async (drug: Drug) => {
    setGeneratingQR(drug.drug_id);
    try {
      // Create QR code data with drug information
      const qrData = {
        drug_id: drug.drug_id,
        name: drug.name,
        manufacturer: drug.manufacturer,
        batch_number: drug.batch_number,
        manufacture_date: drug.manufacture_date,
        expiry_date: drug.expiry_date,
        blockchain_tx_id: drug.blockchain_tx_id,
      };

      // Generate QR code as data URL
      const qrCodeDataUrl = await QRCodeLib.toDataURL(JSON.stringify(qrData), {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });

      // Create download link
      const link = document.createElement("a");
      link.href = qrCodeDataUrl;
      link.download = `qr-${drug.name}-${drug.batch_number}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "QR Code Generated",
        description: "QR code has been generated and downloaded successfully.",
      });
    } catch (error) {
      console.error("Error generating QR code:", error);
      toast({
        title: "Error",
        description: "Failed to generate QR code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGeneratingQR(null);
    }
  };

  // Filter drugs based on search criteria
  const filteredDrugs = useMemo(() => {
    return drugs.filter(drug => {
      const matchesSearch = searchQuery === "" || 
        drug.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        drug.batch_number.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDateRange = (!startDate || new Date(drug.manufacture_date) >= new Date(startDate)) &&
        (!endDate || new Date(drug.manufacture_date) <= new Date(endDate));

      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "verified" && drug.blockchain_tx_id && drug.blockchain_tx_id !== "pending") ||
        (statusFilter === "pending" && drug.blockchain_tx_id === "pending");

      return matchesSearch && matchesDateRange && matchesStatus;
    });
  }, [drugs, searchQuery, startDate, endDate, statusFilter]);

  return (
    <>
      <ManufacturerNavbar />
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gradient">
            QR Codes Generated
          </h1>
          <p className="text-muted-foreground">
            Generate QR codes for your drug batches for authentication and tracking
          </p>
        </div>

        <Card className="glass-card">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-xl">
            <CardTitle className="flex items-center gap-2">
              <QrCode size={18} />
              Drug Batches
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* Search Section */}
            <div className="mb-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by drug name or batch number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="flex-1"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="flex-1"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="all">All Status</option>
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              {(searchQuery || startDate || endDate || statusFilter !== "all") && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Found {filteredDrugs.length} results
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("");
                      setStartDate("");
                      setEndDate("");
                      setStatusFilter("all");
                    }}
                    className="text-sm"
                  >
                    Clear filters
                  </Button>
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
              </div>
            ) : filteredDrugs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {drugs.length === 0 ? "No drug batches found. Add some batches to generate QR codes." : "No matching results found."}
              </div>
            ) : (
              <div className="rounded-md border relative z-10">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Batch Number</TableHead>
                      <TableHead>Manufacture Date</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Blockchain Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDrugs.map((drug) => (
                      <TableRow key={drug.drug_id} className="relative z-10">
                        <TableCell className="font-medium">
                          {drug.name}
                        </TableCell>
                        <TableCell>{drug.batch_number}</TableCell>
                        <TableCell>
                          {new Date(drug.manufacture_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {new Date(drug.expiry_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              drug.blockchain_tx_id === "pending"
                                ? "outline"
                                : drug.blockchain_tx_id
                                ? "default"
                                : "destructive"
                            }
                          >
                            {drug.blockchain_tx_id === "pending"
                              ? "Pending"
                              : drug.blockchain_tx_id
                              ? "Verified"
                              : "Not Verified"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right relative z-20">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generateQRCode(drug)}
                            disabled={
                              generatingQR === drug.drug_id ||
                              !drug.blockchain_tx_id ||
                              drug.blockchain_tx_id === "pending"
                            }
                            className={`relative z-30 ${
                              generatingQR === drug.drug_id ||
                              !drug.blockchain_tx_id ||
                              drug.blockchain_tx_id === "pending"
                                ? "opacity-50 cursor-not-allowed"
                                : "opacity-100 cursor-pointer hover:bg-primary hover:text-primary-foreground"
                            }`}
                          >
                            {generatingQR === drug.drug_id ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Download className="mr-2 h-4 w-4" />
                                Download QR
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default GenerateQR;
