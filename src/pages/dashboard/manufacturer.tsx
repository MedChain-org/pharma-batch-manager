import React, { useState, useEffect, useMemo } from "react";
import ManufacturerNavbar from "@/components/shared/NavBar/ManufacturerNavbar";
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
import {
  Loader2,
  QrCode,
  AlertTriangle,
  Shield,
  CheckCircle,
  Search,
  Calendar,
  X,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Drug, DrugStatusUpdate } from "@/types/database";
import {
  addDrug,
  fetchDrugsByManufacturer,
  fetchDrugStatusUpdates,
  addDrugStatusUpdate,
  fetchDrugById,
} from "@/lib/database";
import QRCodeLib from "qrcode";

const ManufacturerDashboard = () => {
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [newDrug, setNewDrug] = useState<Partial<Drug>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [statusUpdates, setStatusUpdates] = useState<
    Record<string, DrugStatusUpdate[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [pendingDrugIds, setPendingDrugIds] = useState<string[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadDrugs();
    }
  }, [user]);

  // Polling mechanism for pending drugs
  useEffect(() => {
    if (pendingDrugIds.length === 0) return;

    // Set up polling for each pending drug
    const POLLING_INTERVAL = 5000; // 5 seconds

    const pollingTimer = setInterval(async () => {
      let updatedPendingIds = [...pendingDrugIds];
      let drugsUpdated = false;

      // Check each pending drug for status updates
      for (const drugId of pendingDrugIds) {
        const updatedDrug = await fetchDrugById(drugId);

        if (updatedDrug && updatedDrug.blockchain_tx_id !== "pending") {
          // Drug has been verified on blockchain
          drugsUpdated = true;

          // Remove this drug ID from pending list
          updatedPendingIds = updatedPendingIds.filter((id) => id !== drugId);

          // Update the drugs list with the updated drug
          setDrugs((prevDrugs) =>
            prevDrugs.map((drug) =>
              drug.drug_id === drugId ? updatedDrug : drug
            )
          );

          // Notify user that verification is complete
          toast({
            title: "Blockchain Verification Complete",
            description: `${updatedDrug.name} (Batch: ${updatedDrug.batch_number}) has been verified on the blockchain.`,
          });
        }
      }

      // Update the pending drug IDs list
      if (drugsUpdated) {
        setPendingDrugIds(updatedPendingIds);
      }

      // If no more pending drugs, clear the interval
      if (updatedPendingIds.length === 0) {
        clearInterval(pollingTimer);
      }
    }, POLLING_INTERVAL);

    // Clean up the interval when the component unmounts or when pendingDrugIds changes
    return () => clearInterval(pollingTimer);
  }, [pendingDrugIds, toast]);

  useEffect(() => {
    const generateQRCode = async () => {
      if (!selectedDrug) return;

      try {
        // Create QR code data with drug information
        const qrData = {
          drug_id: selectedDrug.drug_id,
          name: selectedDrug.name,
          manufacturer: selectedDrug.manufacturer,
          batch_number: selectedDrug.batch_number,
          manufacture_date: selectedDrug.manufacture_date,
          expiry_date: selectedDrug.expiry_date,
          blockchain_tx_id: selectedDrug.blockchain_tx_id,
        };

        // Generate QR code as data URL
        const qrCodeDataUrl = await QRCodeLib.toDataURL(
          JSON.stringify(qrData),
          {
            width: 300,
            margin: 2,
            color: {
              dark: "#000000",
              light: "#ffffff",
            },
          }
        );

        // Create and insert QR code image
        const qrContainer = document.getElementById("qr-code-container");
        if (qrContainer) {
          qrContainer.innerHTML = `<img src="${qrCodeDataUrl}" alt="QR Code for ${selectedDrug.name}" style="width: 100%; height: 100%; object-fit: contain;" />`;
        }
      } catch (error) {
        console.error("Error generating QR code:", error);
        toast({
          title: "Error",
          description: "Failed to generate QR code. Please try again.",
          variant: "destructive",
        });
      }
    };

    generateQRCode();
  }, [selectedDrug]);

  const loadDrugs = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const drugsData = await fetchDrugsByManufacturer(user.id);
      setDrugs(drugsData);

      // Find pending drugs and add their IDs to pendingDrugIds state
      const pendingDrugs = drugsData.filter(
        (drug) => drug.blockchain_tx_id === "pending"
      );
      if (pendingDrugs.length > 0) {
        setPendingDrugIds(pendingDrugs.map((drug) => drug.drug_id));
      }

      // Fetch status updates for each drug
      const updatesMap: Record<string, DrugStatusUpdate[]> = {};

      await Promise.all(
        drugsData.map(async (drug) => {
          const updates = await fetchDrugStatusUpdates(drug.drug_id);
          updatesMap[drug.drug_id] = updates;
        })
      );

      setStatusUpdates(updatesMap);
    } catch (error) {
      console.error("Error loading drugs:", error);
      toast({
        title: "Error",
        description: "Failed to load drug data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddDrug = async () => {
    if (!user) return;

    if (
      !newDrug.name ||
      !newDrug.batch_number ||
      !newDrug.manufacture_date ||
      !newDrug.expiry_date
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const drugData = await addDrug({
        name: newDrug.name || "",
        manufacturer: user.id,
        manufacture_date: newDrug.manufacture_date || "",
        expiry_date: newDrug.expiry_date || "",
        batch_number: newDrug.batch_number || "",
      });

      if (drugData) {
        toast({
          title: "Success",
          description: "New drug batch added successfully to blockchain!",
        });

        // Add the new drug to the pending list for polling
        setPendingDrugIds((prev) => [...prev, drugData.drug_id]);

        // Add the new drug to the state immediately
        setDrugs((prev) => [drugData, ...prev]);

        // Reset form
        setNewDrug({});
      }
    } catch (error) {
      console.error("Error adding drug:", error);
      toast({
        title: "Error",
        description: "Failed to add drug batch. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateQR = (drug: Drug) => {
    setSelectedDrug(drug);
    toast({
      title: "QR Code Generated",
      description: "QR code for drug authentication has been generated.",
    });
  };

  const getBlockchainStatus = (drug: Drug) => {
    const txId = drug.blockchain_tx_id;
    if (txId === "pending") {
      return { status: "pending", message: "Pending blockchain confirmation" };
    } else if (txId) {
      return { status: "confirmed", message: "Verified on blockchain" };
    } else {
      return { status: "failed", message: "Not on blockchain" };
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "manufactured":
        return "default";
      case "in_transit":
        return "secondary";
      case "delivered":
        return "default";
      case "dispensed":
        return "info";
      default:
        return "outline";
    }
  };

  const StatusBadge = ({ status }: { status: string }) => (
    <Badge
      variant={getStatusBadgeVariant(status) as any}
      className="capitalize"
    >
      {status.replace("_", " ")}
    </Badge>
  );

  const BlockchainStatusBadge = ({ drug }: { drug: Drug }) => {
    const status = getBlockchainStatus(drug);
    return (
      <div className="flex items-center gap-1">
        {status.status === "confirmed" ? (
          <CheckCircle size={14} className="text-green-500" />
        ) : status.status === "pending" ? (
          <Loader2 size={14} className="animate-spin text-amber-500" />
        ) : (
          <AlertTriangle size={14} className="text-red-500" />
        )}
        <Badge
          variant={
            status.status === "confirmed"
              ? "default"
              : status.status === "pending"
              ? "outline"
              : "destructive"
          }
          className="capitalize"
        >
          {status.status}
        </Badge>
      </div>
    );
  };

  // Filter drugs based on search criteria
  const filteredDrugs = useMemo(() => {
    return drugs.filter((drug) => {
      const matchesSearch =
        searchQuery === "" ||
        drug.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        drug.batch_number.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDateRange =
        (!startDate ||
          new Date(drug.manufacture_date) >= new Date(startDate)) &&
        (!endDate || new Date(drug.manufacture_date) <= new Date(endDate));

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "verified" &&
          drug.blockchain_tx_id &&
          drug.blockchain_tx_id !== "pending") ||
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
            Manufacturer Dashboard
          </h1>
          <p className="text-muted-foreground">
            Register and authenticate drug batches on the blockchain
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="col-span-1 md:col-span-1 glass-card">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-xl">
              <CardTitle className="flex items-center gap-2">
                <Shield size={18} />
                Blockchain Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Batches</span>
                  <span className="text-2xl font-semibold">
                    {loading ? "-" : drugs.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    Blockchain Verified
                  </span>
                  <span className="text-2xl font-semibold">
                    {loading
                      ? "-"
                      : drugs.filter(
                          (d) =>
                            d.blockchain_tx_id &&
                            d.blockchain_tx_id !== "pending"
                        ).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    Pending Verification
                  </span>
                  <span className="text-2xl font-semibold">
                    {loading
                      ? "-"
                      : drugs.filter((d) => d.blockchain_tx_id === "pending")
                          .length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1 md:col-span-2 glass-card">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-xl">
              <CardTitle>Register New Drug Batch on Blockchain</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  placeholder="Drug Name"
                  value={newDrug.name || ""}
                  onChange={(e) =>
                    setNewDrug({ ...newDrug, name: e.target.value })
                  }
                />
                <Input
                  placeholder="Batch Number"
                  value={newDrug.batch_number || ""}
                  onChange={(e) =>
                    setNewDrug({ ...newDrug, batch_number: e.target.value })
                  }
                />
                <Input
                  type="date"
                  placeholder="Manufacturing Date"
                  value={newDrug.manufacture_date || ""}
                  onChange={(e) =>
                    setNewDrug({ ...newDrug, manufacture_date: e.target.value })
                  }
                />
                <Input
                  type="date"
                  placeholder="Expiry Date"
                  value={newDrug.expiry_date || ""}
                  onChange={(e) =>
                    setNewDrug({ ...newDrug, expiry_date: e.target.value })
                  }
                />
              </div>
              <Button
                onClick={handleAddDrug}
                className="mt-4 w-full sm:w-auto"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding to Blockchain...
                  </>
                ) : (
                  "Register Batch on Blockchain"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-card">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-xl flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <QrCode size={18} />
              Blockchain Verified Drug Batches
            </CardTitle>
          </CardHeader>
          <CardContent>
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
              {(searchQuery ||
                startDate ||
                endDate ||
                statusFilter !== "all") && (
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
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredDrugs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {drugs.length === 0
                  ? "No drugs found. Add your first drug batch above."
                  : "No matching results found."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Drug Name</TableHead>
                      <TableHead>Batch Number</TableHead>
                      <TableHead>Manufacture Date</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Latest Status</TableHead>
                      <TableHead>Blockchain Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDrugs.map((drug) => {
                      const updates = statusUpdates[drug.drug_id] || [];
                      const latestStatus =
                        updates.length > 0 ? updates[0].status : "manufactured";

                      return (
                        <TableRow
                          key={drug.drug_id}
                          className="hover:bg-accent/5 relative z-10 transition-colors"
                        >
                          <TableCell className="font-medium">
                            {drug.name}
                          </TableCell>
                          <TableCell>{drug.batch_number}</TableCell>
                          <TableCell>
                            {new Date(
                              drug.manufacture_date
                            ).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {new Date(drug.expiry_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={latestStatus} />
                          </TableCell>
                          <TableCell>
                            <BlockchainStatusBadge drug={drug} />
                          </TableCell>
                          <TableCell className="relative z-20">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1 relative z-30 hover:bg-primary hover:text-primary-foreground transition-colors"
                              onClick={() => handleGenerateQR(drug)}
                            >
                              <QrCode size={14} />
                              Generate QR
                            </Button>
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

        {selectedDrug && (
          <Card className="glass-card">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-xl">
              <div className="flex justify-between items-center">
                <CardTitle>Authentication QR Code</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDrug(null)}
                >
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-center">
                  <div id="qr-code-container" className="w-48 h-48"></div>
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">
                      {selectedDrug.name} - Batch {selectedDrug.batch_number}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Blockchain Transaction ID: {selectedDrug.blockchain_tx_id}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        Manufacturer
                      </div>
                      <div className="font-medium">MediPharm Inc.</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        Manufacture Date
                      </div>
                      <div className="font-medium">
                        {new Date(
                          selectedDrug.manufacture_date
                        ).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        Expiry Date
                      </div>
                      <div className="font-medium">
                        {new Date(
                          selectedDrug.expiry_date
                        ).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        Blockchain Status
                      </div>
                      <div className="font-medium flex items-center gap-1">
                        {getBlockchainStatus(selectedDrug).status ===
                        "confirmed" ? (
                          <>
                            <CheckCircle size={16} className="text-green-500" />
                            <span>Verified on blockchain</span>
                          </>
                        ) : getBlockchainStatus(selectedDrug).status ===
                          "pending" ? (
                          <>
                            <Loader2
                              size={16}
                              className="animate-spin text-amber-500"
                            />
                            <span>Pending confirmation</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle size={16} className="text-red-500" />
                            <span>Not on blockchain</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        const qrContainer =
                          document.getElementById("qr-code-container");
                        if (qrContainer) {
                          const printWindow = window.open("", "_blank");
                          if (printWindow) {
                            printWindow.document.write(`
                              <html>
                                <head>
                                  <title>QR Code - ${selectedDrug.name}</title>
                                  <style>
                                    body { display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; }
                                    img { max-width: 100%; height: auto; }
                                  </style>
                                </head>
                                <body>
                                  ${qrContainer.innerHTML}
                                </body>
                              </html>
                            `);
                            printWindow.document.close();
                            printWindow.print();
                          }
                        }
                      }}
                    >
                      Print QR Code
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={async () => {
                        const qrContainer =
                          document.getElementById("qr-code-container");
                        if (qrContainer) {
                          const img = qrContainer.querySelector("img");
                          if (img) {
                            const link = document.createElement("a");
                            link.href = img.src;
                            link.download = `qr-${selectedDrug.name}-${selectedDrug.batch_number}.png`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }
                        }
                      }}
                    >
                      Download for Package
                    </Button>
                  </div>

                  <div className="bg-secondary/10 p-4 rounded-lg">
                    <div className="text-sm font-medium mb-2">
                      Authentication Instructions
                    </div>
                    <p className="text-sm text-muted-foreground">
                      This QR code should be printed and attached to each drug
                      package in this batch. Consumers and stakeholders can scan
                      it to verify authenticity and track the drug's journey
                      through the supply chain.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

export default ManufacturerDashboard;
