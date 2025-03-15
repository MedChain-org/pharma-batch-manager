import React, { useState, useEffect } from "react";
import DistributorNavbar from "@/components/shared/NavBar/DistributorNavbar";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  QrCode,
  Truck,
  AlertCircle,
  ArrowRight,
  Shield,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchDrugs,
  fetchShipmentsByDistributor,
  fetchUsersByRole,
  addShipment,
  updateShipmentStatus,
} from "@/lib/database";
import { Drug, Shipment, ShipmentStatusUpdate, User } from "@/types/database";
import QRCodeLib from "qrcode";

const DistributorDashboard = () => {
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [selectedDrugs, setSelectedDrugs] = useState<Drug[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [pharmacists, setPharmacists] = useState<User[]>([]);
  const [selectedPharmacist, setSelectedPharmacist] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(
    null
  );
  const [selectedShipmentForQR, setSelectedShipmentForQR] =
    useState<Shipment | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    const generateQRCode = async () => {
      if (!selectedShipmentForQR) return;

      try {
        const qrData = {
          shipment_id: selectedShipmentForQR.shipment_id,
          drug_ids: selectedShipmentForQR.drug_ids,
          sender: selectedShipmentForQR.sender,
          receiver: selectedShipmentForQR.receiver,
          status: selectedShipmentForQR.status,
          ship_date: selectedShipmentForQR.ship_date,
          blockchain_tx_id: selectedShipmentForQR.blockchain_tx_id,
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

        const qrContainer = document.getElementById(
          "distributor-qr-code-container"
        );
        if (qrContainer) {
          qrContainer.innerHTML = `<img src="${qrCodeDataUrl}" alt="QR Code for Shipment ${selectedShipmentForQR.shipment_id}" style="width: 100%; height: 100%; object-fit: contain;" />`;
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
  }, [selectedShipmentForQR, toast]);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Load available drugs (only manufactured ones)
      const drugsData = await fetchDrugs();
      setDrugs(drugsData);

      // Load shipments by the distributor
      const shipmentsData = await fetchShipmentsByDistributor(user.id);
      setShipments(shipmentsData);

      // Load pharmacists for shipping
      const pharmacistsData = await fetchUsersByRole("pharmacist");
      setPharmacists(pharmacistsData);
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

  const handleSelectDrug = (drug: Drug) => {
    if (selectedDrugs.find((d) => d.drug_id === drug.drug_id)) {
      setSelectedDrugs(selectedDrugs.filter((d) => d.drug_id !== drug.drug_id));
    } else {
      setSelectedDrugs([...selectedDrugs, drug]);
    }
  };

  const handleCreateShipment = async () => {
    if (!user) return;

    if (selectedDrugs.length === 0 || !selectedPharmacist) {
      toast({
        title: "Validation Error",
        description:
          "Please select drugs and a pharmacist to receive the shipment.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const newShipment = await addShipment({
        drug_ids: selectedDrugs.map((drug) => drug.drug_id),
        sender: user.id,
        receiver: selectedPharmacist,
        status: "pending",
        ship_date: new Date().toISOString(),
      });

      if (newShipment) {
        toast({
          title: "Success",
          description: "New shipment registered on blockchain successfully!",
        });

        // Reset selection
        setSelectedDrugs([]);
        setSelectedPharmacist("");

        // Refresh data
        await loadData();
      }
    } catch (error) {
      console.error("Error creating shipment:", error);
      toast({
        title: "Error",
        description: "Failed to create shipment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (
    shipmentId: string,
    status: ShipmentStatusUpdate["status"]
  ) => {
    if (!user) return;

    try {
      const updated = await updateShipmentStatus(
        shipmentId,
        status,
        "Distribution Center", // You could make this dynamic based on user data
        user.id
      );

      if (updated) {
        toast({
          title: "Success",
          description: `Shipment status updated and verified on blockchain!`,
        });

        // Refresh data
        await loadData();
      }
    } catch (error) {
      console.error("Error updating shipment status:", error);
      toast({
        title: "Error",
        description: "Failed to update shipment status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewShipment = (shipment: Shipment) => {
    setSelectedShipment(shipment);
  };

  const getBlockchainStatus = (shipment: Shipment) => {
    const txId = shipment.blockchain_tx_id;
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
      case "pending":
        return "outline";
      case "in_transit":
        return "secondary";
      case "delivered":
        return "default";
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

  const handleGenerateQR = (shipment: Shipment) => {
    setSelectedShipmentForQR(shipment);
    toast({
      title: "QR Code Generated",
      description: "QR code for shipment verification has been generated.",
    });
  };

  return (
    <>
      <DistributorNavbar />
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gradient">
            Distributor Dashboard
          </h1>
          <p className="text-muted-foreground">
            Track and verify drug shipments on the blockchain
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="col-span-1 md:col-span-1 glass-card">
            <CardHeader className="bg-gradient-to-r from-accent/10 to-accent/5 rounded-t-xl">
              <CardTitle className="flex items-center gap-2">
                <Shield size={18} />
                Blockchain Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Shipments</span>
                  <span className="text-2xl font-semibold">
                    {loading ? "-" : shipments.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    Blockchain Verified
                  </span>
                  <span className="text-2xl font-semibold">
                    {loading
                      ? "-"
                      : shipments.filter(
                          (s) =>
                            s.blockchain_tx_id &&
                            s.blockchain_tx_id !== "pending"
                        ).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">In Transit</span>
                  <span className="text-2xl font-semibold">
                    {loading
                      ? "-"
                      : shipments.filter((s) => s.status === "in_transit")
                          .length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Delivered</span>
                  <span className="text-2xl font-semibold">
                    {loading
                      ? "-"
                      : shipments.filter((s) => s.status === "delivered")
                          .length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1 md:col-span-2 glass-card">
            <CardHeader className="bg-gradient-to-r from-accent/10 to-accent/5 rounded-t-xl">
              <CardTitle className="flex items-center gap-2">
                <Truck size={18} />
                Create Blockchain-Verified Shipment
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-4">
                <Select
                  value={selectedPharmacist}
                  onValueChange={setSelectedPharmacist}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select pharmacist to receive shipment" />
                  </SelectTrigger>
                  <SelectContent>
                    {pharmacists.map((pharmacist) => (
                      <SelectItem key={pharmacist.id} value={pharmacist.id}>
                        {pharmacist.name || pharmacist.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">
                    Select Verified Drugs to Ship
                  </h3>
                  <Badge variant="outline" className="ml-2">
                    {selectedDrugs.length} selected
                  </Badge>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Drug</TableHead>
                        <TableHead>Batch</TableHead>
                        <TableHead>Blockchain Status</TableHead>
                        <TableHead>Expiry</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {drugs.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center text-muted-foreground h-24"
                          >
                            No drugs available for shipment
                          </TableCell>
                        </TableRow>
                      ) : (
                        drugs.map((drug) => {
                          const isSelected = selectedDrugs.some(
                            (d) => d.drug_id === drug.drug_id
                          );

                          // Only show drugs that are verified on blockchain (not pending)
                          if (
                            drug.blockchain_tx_id !== "pending" &&
                            drug.blockchain_tx_id
                          ) {
                            return (
                              <TableRow
                                key={drug.drug_id}
                                className={
                                  isSelected
                                    ? "bg-accent/10 hover:bg-accent/20"
                                    : "hover:bg-secondary/5"
                                }
                                onClick={() => handleSelectDrug(drug)}
                              >
                                <TableCell>
                                  <div className="flex items-center justify-center">
                                    {isSelected ? (
                                      <div className="w-5 h-5 rounded-full bg-accent"></div>
                                    ) : (
                                      <div className="w-5 h-5 rounded-full border-2 border-muted"></div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="font-medium">
                                  {drug.name}
                                </TableCell>
                                <TableCell>{drug.batch_number}</TableCell>
                                <TableCell>
                                  <Badge
                                    variant="default"
                                    className="capitalize"
                                  >
                                    Verified
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {new Date(
                                    drug.expiry_date
                                  ).toLocaleDateString()}
                                </TableCell>
                              </TableRow>
                            );
                          }
                          return null;
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <Button
                onClick={handleCreateShipment}
                className="w-full mt-4"
                disabled={
                  submitting ||
                  selectedDrugs.length === 0 ||
                  !selectedPharmacist
                }
              >
                {submitting ? (
                  <div className="flex items-center">
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Registering Shipment...
                  </div>
                ) : (
                  "Register Shipment on Blockchain"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-card">
          <CardHeader className="bg-gradient-to-r from-accent/10 to-accent/5 rounded-t-xl">
            <CardTitle className="flex items-center gap-2">
              <QrCode size={18} />
              Blockchain-Verified Shipments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="animate-spin h-8 w-8 text-accent" />
              </div>
            ) : shipments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No shipments found. Create your first shipment above.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Shipment ID</TableHead>
                      <TableHead>Receiving Pharmacist</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Shipping Date</TableHead>
                      <TableHead>Drugs Included</TableHead>
                      <TableHead>Blockchain Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shipments.map((shipment) => (
                      <TableRow
                        key={shipment.shipment_id}
                        className="hover:bg-accent/5"
                      >
                        <TableCell className="font-medium">
                          {shipment.shipment_id.slice(0, 8)}...
                        </TableCell>
                        <TableCell>{shipment.receiver}</TableCell>
                        <TableCell>
                          <StatusBadge status={shipment.status} />
                        </TableCell>
                        <TableCell>
                          {new Date(shipment.ship_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {Array.isArray(shipment.drug_ids)
                            ? shipment.drug_ids.length
                            : 0}{" "}
                          drugs
                        </TableCell>
                        <TableCell>
                          {shipment.blockchain_tx_id === "pending" ? (
                            <Badge
                              variant="outline"
                              className="flex items-center gap-1"
                            >
                              <Loader2 size={12} className="animate-spin" />
                              Pending
                            </Badge>
                          ) : shipment.blockchain_tx_id ? (
                            <Badge
                              variant="default"
                              className="flex items-center gap-1"
                            >
                              <Shield size={12} className="text-green-500" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge
                              variant="destructive"
                              className="flex items-center gap-1"
                            >
                              <AlertCircle size={12} className="text-red-500" />
                              Not Verified
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              className="flex items-center gap-1 relative z-30 hover:bg-primary hover:text-primary-foreground transition-colors"
                              size="sm"
                              onClick={() => handleViewShipment(shipment)}
                            >
                              View
                            </Button>

                            {shipment.status === "pending" && (
                              <Button
                                variant="outline"
                                className="flex items-center gap-1 relative z-30 hover:bg-primary hover:text-primary-foreground transition-colors"
                                size="sm"
                                onClick={() =>
                                  handleUpdateStatus(
                                    shipment.shipment_id,
                                    "in_transit"
                                  )
                                }
                              >
                                Ship
                              </Button>
                            )}

                            {shipment.status === "in_transit" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleUpdateStatus(
                                    shipment.shipment_id,
                                    "delivered"
                                  )
                                }
                              >
                                Mark Delivered
                              </Button>
                            )}

                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1"
                              onClick={() => handleGenerateQR(shipment)}
                            >
                              <QrCode size={14} />
                              Generate QR
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {selectedShipment && (
          <Card className="glass-card">
            <CardHeader className="bg-gradient-to-r from-accent/10 to-accent/5 rounded-t-xl">
              <div className="flex justify-between items-center">
                <CardTitle>Shipment Supply Chain Tracking</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedShipment(null)}
                >
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-medium">
                  Shipment ID: {selectedShipment.shipment_id.slice(0, 8)}...
                </h3>
                <p className="text-sm text-muted-foreground">
                  Blockchain Transaction: {selectedShipment.blockchain_tx_id}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium mb-2">
                    Supply Chain Journey
                  </h4>
                  <div className="relative pb-2">
                    <div className="absolute left-2.5 top-0 h-full w-0.5 bg-accent/20"></div>

                    <div className="mb-6 ml-6 relative">
                      <div className="absolute -left-4 top-0.5 w-2 h-2 rounded-full bg-accent"></div>
                      <div className="text-sm">
                        <div className="font-medium">Registered</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(
                            selectedShipment.timestamp
                          ).toLocaleDateString()}{" "}
                          {new Date(
                            selectedShipment.timestamp
                          ).toLocaleTimeString()}
                        </div>
                        <div className="text-xs mt-1">
                          Created by {selectedShipment.sender}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`mb-6 ml-6 relative ${
                        selectedShipment.status === "pending"
                          ? "opacity-50"
                          : ""
                      }`}
                    >
                      <div
                        className={`absolute -left-4 top-0.5 w-2 h-2 rounded-full ${
                          selectedShipment.status !== "pending"
                            ? "bg-accent"
                            : "border border-accent/50 bg-background"
                        }`}
                      ></div>
                      <div className="text-sm">
                        <div className="font-medium">Shipped</div>
                        <div className="text-xs text-muted-foreground">
                          {selectedShipment.status !== "pending"
                            ? "Shipment in transit"
                            : "Pending"}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`ml-6 relative ${
                        selectedShipment.status !== "delivered"
                          ? "opacity-50"
                          : ""
                      }`}
                    >
                      <div
                        className={`absolute -left-4 top-0.5 w-2 h-2 rounded-full ${
                          selectedShipment.status === "delivered"
                            ? "bg-accent"
                            : "border border-accent/50 bg-background"
                        }`}
                      ></div>
                      <div className="text-sm">
                        <div className="font-medium">Delivered</div>
                        <div className="text-xs text-muted-foreground">
                          {selectedShipment.status === "delivered"
                            ? "Successfully delivered to pharmacy"
                            : "Pending delivery"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Shipment Details</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">From:</span>
                      <span className="font-medium">
                        Distributor ({selectedShipment.sender})
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">To:</span>
                      <span className="font-medium">
                        Pharmacy ({selectedShipment.receiver})
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Ship Date:</span>
                      <span className="font-medium">
                        {new Date(
                          selectedShipment.ship_date
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Current Status:
                      </span>
                      <StatusBadge status={selectedShipment.status} />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Drugs Included:
                      </span>
                      <span className="font-medium">
                        {Array.isArray(selectedShipment.drug_ids)
                          ? selectedShipment.drug_ids.length
                          : 0}{" "}
                        drugs
                      </span>
                    </div>
                  </div>

                  <div className="bg-secondary/10 p-4 rounded-lg mt-4">
                    <h4 className="text-sm font-medium mb-2">
                      Blockchain Verification
                    </h4>
                    <div className="flex items-center gap-2">
                      {selectedShipment.blockchain_tx_id === "pending" ? (
                        <>
                          <Loader2
                            size={16}
                            className="animate-spin text-amber-500"
                          />
                          <span className="text-sm">
                            Pending blockchain confirmation
                          </span>
                        </>
                      ) : selectedShipment.blockchain_tx_id ? (
                        <>
                          <Shield size={16} className="text-green-500" />
                          <span className="text-sm">
                            Verified on blockchain
                          </span>
                        </>
                      ) : (
                        <>
                          <AlertCircle size={16} className="text-red-500" />
                          <span className="text-sm">
                            Not verified on blockchain
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 flex items-center gap-1"
                      onClick={() => handleGenerateQR(selectedShipment)}
                    >
                      <QrCode size={14} />
                      Generate QR
                    </Button>
                    {selectedShipment.status === "pending" && (
                      <Button
                        className="flex-1 flex items-center gap-1"
                        onClick={() => {
                          handleUpdateStatus(
                            selectedShipment.shipment_id,
                            "in_transit"
                          );
                          setSelectedShipment(null);
                        }}
                      >
                        <Truck size={14} />
                        Ship Now
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedShipmentForQR && (
          <Card className="glass-card">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-xl">
              <div className="flex justify-between items-center">
                <CardTitle>Shipment Verification QR Code</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedShipmentForQR(null)}
                >
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-center">
                  <div
                    id="distributor-qr-code-container"
                    className="w-48 h-48"
                  ></div>
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">
                      Shipment ID: {selectedShipmentForQR.shipment_id}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Blockchain Transaction ID:{" "}
                      {selectedShipmentForQR.blockchain_tx_id}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        Status
                      </div>
                      <div className="font-medium capitalize">
                        {selectedShipmentForQR.status.replace("_", " ")}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        Ship Date
                      </div>
                      <div className="font-medium">
                        {new Date(
                          selectedShipmentForQR.ship_date
                        ).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        Number of Drugs
                      </div>
                      <div className="font-medium">
                        {selectedShipmentForQR.drug_ids.length}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        Blockchain Status
                      </div>
                      <div className="font-medium flex items-center gap-1">
                        {getBlockchainStatus(selectedShipmentForQR).status ===
                        "confirmed" ? (
                          <>
                            <CheckCircle size={16} className="text-green-500" />
                            <span>Verified on blockchain</span>
                          </>
                        ) : getBlockchainStatus(selectedShipmentForQR)
                            .status === "pending" ? (
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
                        const qrContainer = document.getElementById(
                          "distributor-qr-code-container"
                        );
                        if (qrContainer) {
                          const printWindow = window.open("", "_blank");
                          if (printWindow) {
                            printWindow.document.write(`
                              <html>
                                <head>
                                  <title>QR Code - Shipment ${selectedShipmentForQR.shipment_id}</title>
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
                        const qrContainer = document.getElementById(
                          "distributor-qr-code-container"
                        );
                        if (qrContainer) {
                          const img = qrContainer.querySelector("img");
                          if (img) {
                            const link = document.createElement("a");
                            link.href = img.src;
                            link.download = `qr-shipment-${selectedShipmentForQR.shipment_id}.png`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }
                        }
                      }}
                    >
                      Download QR Code
                    </Button>
                  </div>

                  <div className="bg-secondary/10 p-4 rounded-lg">
                    <div className="text-sm font-medium mb-2">
                      Verification Instructions
                    </div>
                    <p className="text-sm text-muted-foreground">
                      This QR code contains the shipment details and can be
                      scanned to verify the shipment's authenticity and track
                      its status on the blockchain.
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

export default DistributorDashboard;
