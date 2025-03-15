import { useState, useEffect, useMemo } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  fetchDrugById,
  addDrugStatusUpdate,
  addShipment,
  addShipmentStatusUpdate,
  fetchShipments,
} from "@/lib/database";
import QRCodeLib from "qrcode";
import ManufacturerNavbar from "@/components/shared/NavBar/ManufacturerNavbar";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Shipment, ShipmentStatusUpdate } from "@/types/database";

interface DrugBatch {
  id: string;
  name: string;
  batchNumber: string;
  manufacturingDate: string;
  expiryDate: string;
  quantity: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
}

const DrugBatches = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [newDrug, setNewDrug] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [statusUpdates, setStatusUpdates] = useState<
    Record<string, DrugStatusUpdate[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [pendingDrugIds, setPendingDrugIds] = useState<string[]>([]);

  // Batch Management specific state
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [shipmentMap, setShipmentMap] = useState<Record<string, Shipment>>({});
  const [batchSearchQuery, setBatchSearchQuery] = useState<string>("");
  const [batchStartDate, setBatchStartDate] = useState<Date | undefined>();
  const [batchEndDate, setBatchEndDate] = useState<Date | undefined>();
  const [selectedBatchStatus, setSelectedBatchStatus] = useState<string>("all");
  const [isLoadingBatches, setIsLoadingBatches] = useState<boolean>(true);

  const { toast } = useToast();
  const { user } = useAuth();

  // Sample data - replace with actual data from your backend
  const drugBatches: DrugBatch[] = [
    {
      id: "1",
      name: "Paracetamol",
      batchNumber: "PCM2024001",
      manufacturingDate: "2024-01-15",
      expiryDate: "2026-01-15",
      quantity: 10000,
      status: "In Stock",
    },
    {
      id: "2",
      name: "Amoxicillin",
      batchNumber: "AMX2024002",
      manufacturingDate: "2024-02-01",
      expiryDate: "2025-02-01",
      quantity: 500,
      status: "Low Stock",
    },
  ];

  useEffect(() => {
    if (user) {
      loadDrugs();
    }
  }, [user]);

  // Polling mechanism for pending drugs
  useEffect(() => {
    if (pendingDrugIds.length === 0) return;

    const POLLING_INTERVAL = 5000; // 5 seconds

    const pollingTimer = setInterval(async () => {
      let updatedPendingIds = [...pendingDrugIds];
      let drugsUpdated = false;

      for (const drugId of pendingDrugIds) {
        const updatedDrug = await fetchDrugById(drugId);

        if (updatedDrug && updatedDrug.blockchain_tx_id !== "pending") {
          drugsUpdated = true;
          updatedPendingIds = updatedPendingIds.filter((id) => id !== drugId);
          setDrugs((prevDrugs) =>
            prevDrugs.map((drug) =>
              drug.drug_id === drugId ? updatedDrug : drug
            )
          );

          toast({
            title: "Blockchain Verification Complete",
            description: `${updatedDrug.name} (Batch: ${updatedDrug.batch_number}) has been verified on the blockchain.`,
          });
        }
      }

      if (drugsUpdated) {
        setPendingDrugIds(updatedPendingIds);
      }

      if (updatedPendingIds.length === 0) {
        clearInterval(pollingTimer);
      }
    }, POLLING_INTERVAL);

    return () => clearInterval(pollingTimer);
  }, [pendingDrugIds, toast]);

  useEffect(() => {
    const generateQRCode = async () => {
      if (!selectedDrug) return;

      try {
        const qrData = {
          drug_id: selectedDrug.drug_id,
          name: selectedDrug.name,
          manufacturer: selectedDrug.manufacturer,
          batch_number: selectedDrug.batch_number,
          manufacture_date: selectedDrug.manufacture_date,
          expiry_date: selectedDrug.expiry_date,
          blockchain_tx_id: selectedDrug.blockchain_tx_id,
        };

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
    setIsLoadingBatches(true);
    try {
      // Fetch drugs created by the manufacturer
      const drugsData = await fetchDrugsByManufacturer(user.id);
      setDrugs(drugsData);

      const pendingDrugs = drugsData.filter(
        (drug) => drug.blockchain_tx_id === "pending"
      );
      if (pendingDrugs.length > 0) {
        setPendingDrugIds(pendingDrugs.map((drug) => drug.drug_id));
      }

      const updatesMap: Record<string, DrugStatusUpdate[]> = {};
      await Promise.all(
        drugsData.map(async (drug) => {
          const updates = await fetchDrugStatusUpdates(drug.drug_id);
          updatesMap[drug.drug_id] = updates;
        })
      );

      setStatusUpdates(updatesMap);

      // Fetch all shipments for batch management
      const allShipments = await fetchShipments();
      setShipments(allShipments);

      // Create a map of shipments by drug_id for quick lookup
      const shipmentsByDrug: Record<string, Shipment> = {};
      allShipments.forEach((shipment) => {
        shipment.drug_ids.forEach((drugId) => {
          shipmentsByDrug[drugId] = shipment;
        });
      });
      setShipmentMap(shipmentsByDrug);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load drug data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsLoadingBatches(false);
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
        // Manually create a shipment for the new drug
        try {
          const shipmentData = await addShipment({
            drug_ids: [drugData.drug_id],
            sender: user.id,
            receiver: user.id, // Initially set to the manufacturer until assigned
            status: "pending",
            ship_date: new Date().toISOString().split("T")[0], // Current date in YYYY-MM-DD format
          });

          if (shipmentData) {
            // Add initial shipment status update
            await addShipmentStatusUpdate({
              shipment_id: shipmentData.shipment_id,
              status: "pending",
              location: "Manufacturing Facility",
              updated_by: user.id,
            });

            toast({
              title: "Success",
              description: "New drug batch and shipment added successfully!",
            });
          }
        } catch (shipmentError) {
          console.error("Error creating shipment:", shipmentError);
          toast({
            title: "Warning",
            description:
              "Drug added but failed to create shipment automatically.",
            variant: "destructive",
          });
        }

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

  // Filter drugs for batch management section
  const filteredBatches = useMemo(() => {
    return drugs.filter((drug) => {
      // Search filter
      const matchesSearch =
        drug.name.toLowerCase().includes(batchSearchQuery.toLowerCase()) ||
        drug.drug_id.toLowerCase().includes(batchSearchQuery.toLowerCase()) ||
        drug.batch_number
          .toLowerCase()
          .includes(batchSearchQuery.toLowerCase());

      // Date filter
      const manufactureDate = new Date(drug.manufacture_date);
      const afterStartDate =
        !batchStartDate || manufactureDate >= batchStartDate;
      const beforeEndDate = !batchEndDate || manufactureDate <= batchEndDate;

      // Status filter - using shipment status
      const shipment = shipmentMap[drug.drug_id];
      const status = shipment?.status || "pending";
      const matchesStatus =
        selectedBatchStatus === "all" || status === selectedBatchStatus;

      return matchesSearch && afterStartDate && beforeEndDate && matchesStatus;
    });
  }, [
    drugs,
    batchSearchQuery,
    batchStartDate,
    batchEndDate,
    selectedBatchStatus,
    shipmentMap,
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Stock":
        return "bg-green-100 text-green-800";
      case "Low Stock":
        return "bg-yellow-100 text-yellow-800";
      case "Out of Stock":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Function to determine the status badge color for batch management
  const getBatchStatusBadge = (drugId: string) => {
    const shipment = shipmentMap[drugId];
    if (!shipment) return <Badge variant="outline">In Stock</Badge>;

    switch (shipment.status) {
      case "pending":
        return <Badge variant="secondary">In Stock</Badge>;
      case "in_transit":
        return <Badge variant="default">In Transit</Badge>;
      case "delivered":
        return <Badge variant="outline">Delivered</Badge>;
      default:
        return <Badge variant="outline">In Stock</Badge>;
    }
  };

  // Function to display the blockchain status for batch management
  const getBatchBlockchainStatus = (drug: Drug) => {
    if (!drug.blockchain_tx_id) {
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" /> Not Verified
        </Badge>
      );
    }

    if (drug.blockchain_tx_id === "pending") {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Loader2 className="h-3 w-3 animate-spin" /> Verifying
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="flex items-center gap-1">
        <Shield className="h-3 w-3" /> Verified
      </Badge>
    );
  };

  // Helper to render a date in a human-readable format
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd-MM-yyyy");
    } catch {
      return dateString;
    }
  };

  // Calculate quantity (placeholder - in a real app this might come from inventory data)
  const getQuantity = (drug: Drug) => {
    // Extract the numeric part from the batch number
    const batchNumber = drug.batch_number;
    const numericPart = batchNumber.match(/\d+/);
    return numericPart ? parseInt(numericPart[0]) : 0;
  };

  // Function to determine if a drug is expired
  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  return (
    <>
      <ManufacturerNavbar />
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Drug Batches</h1>
        </div>

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

        {/* New Batch Management Component Integration */}
        <Card className="rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-xl">
            <CardTitle>Batch Management</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* Search bar */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search batches..."
                  className="pl-8"
                  value={batchSearchQuery}
                  onChange={(e) => setBatchSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !batchStartDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {batchStartDate
                      ? format(batchStartDate, "dd-MM-yyyy")
                      : "Manufacturing Date From"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={batchStartDate}
                    onSelect={setBatchStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !batchEndDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {batchEndDate
                      ? format(batchEndDate, "dd-MM-yyyy")
                      : "Manufacturing Date To"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={batchEndDate}
                    onSelect={setBatchEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Select
                value={selectedBatchStatus}
                onValueChange={setSelectedBatchStatus}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">In Stock</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-xl overflow-hidden border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="rounded-tl-lg">Drug ID</TableHead>
                    <TableHead>Drug Name</TableHead>
                    <TableHead>Manufacturing Date</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="rounded-tr-lg">
                      Blockchain Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingBatches ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10">
                        <div className="flex justify-center items-center">
                          <Loader2 className="h-6 w-6 animate-spin mr-2" />
                          <span>Loading batches...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredBatches.length > 0 ? (
                    filteredBatches.map((drug) => (
                      <TableRow
                        key={drug.drug_id}
                        className="hover:bg-accent/5 "
                      >
                        <TableCell className="font-medium">
                          {drug.drug_id}
                        </TableCell>
                        <TableCell>{drug.name}</TableCell>
                        <TableCell>
                          {formatDate(drug.manufacture_date)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              isExpired(drug.expiry_date) ? "text-red-500" : ""
                            }
                          >
                            {formatDate(drug.expiry_date)}
                          </span>
                        </TableCell>
                        <TableCell>{getQuantity(drug)}</TableCell>
                        <TableCell>
                          {getBatchStatusBadge(drug.drug_id)}
                        </TableCell>
                        <TableCell>{getBatchBlockchainStatus(drug)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-10 text-muted-foreground"
                      >
                        No batches found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
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

export default DrugBatches;
