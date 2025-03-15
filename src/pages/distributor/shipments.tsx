import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Loader2,
  QrCode,
  Truck,
  AlertCircle,
  Shield,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchShipmentsByDistributor,
  updateShipmentStatus,
} from "@/lib/database";
import { Shipment, ShipmentStatusUpdate } from "@/types/database";
import QRCodeLib from "qrcode";
import DistributorNavbar from "@/components/shared/NavBar/DistributorNavbar";

const ShipmentsPage = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(
    null
  );
  const [selectedShipmentForQR, setSelectedShipmentForQR] =
    useState<Shipment | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadShipments();
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
          "shipments-qr-code-container"
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

  const loadShipments = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const shipmentsData = await fetchShipmentsByDistributor(user.id);
      setShipments(shipmentsData);
    } catch (error) {
      console.error("Error loading shipments:", error);
      toast({
        title: "Error",
        description: "Failed to load shipments. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
        "Distribution Center",
        user.id
      );

      if (updated) {
        toast({
          title: "Success",
          description: `Shipment status updated and verified on blockchain!`,
        });

        // Refresh data
        await loadShipments();
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

  const handleGenerateQR = (shipment: Shipment) => {
    setSelectedShipmentForQR(shipment);
    toast({
      title: "QR Code Generated",
      description: "QR code for shipment verification has been generated.",
    });
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

  const filteredShipments = shipments.filter((shipment) => {
    if (statusFilter === "all") return true;
    return shipment.status === statusFilter;
  });

  return (
    <div className="min-h-screen bg-background">
      <DistributorNavbar />
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gradient">Shipments</h1>
          <p className="text-muted-foreground">
            Track and manage your drug shipments
          </p>
        </div>

        <Card className="glass-card">
          <CardHeader className="bg-gradient-to-r from-accent/10 to-accent/5 rounded-t-xl">
            <div className="flex justify-between items-center">
              <CardTitle>Shipment Tracking</CardTitle>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="animate-spin h-8 w-8 text-accent" />
              </div>
            ) : filteredShipments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No shipments found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Shipment ID</TableHead>
                      <TableHead>Receiver</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ship Date</TableHead>
                      <TableHead>Drugs</TableHead>
                      <TableHead>Blockchain Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredShipments.map((shipment) => (
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
                              size="sm"
                              className="flex items-center gap-1 relative z-30 hover:bg-primary hover:text-primary-foreground transition-colors"
                              onClick={() => handleGenerateQR(shipment)}
                            >
                              <QrCode size={14} />
                              Generate QR
                            </Button>
                            {shipment.status === "pending" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1 relative z-30 hover:bg-primary hover:text-primary-foreground transition-colors"
                                onClick={() =>
                                  handleUpdateStatus(
                                    shipment.shipment_id,
                                    "in_transit"
                                  )
                                }
                              >
                                <Truck size={14} />
                                Ship
                              </Button>
                            )}
                            {shipment.status === "in_transit" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1 relative z-30 hover:bg-primary hover:text-primary-foreground transition-colors"
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
                    id="shipments-qr-code-container"
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
                          "shipments-qr-code-container"
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
                          "shipments-qr-code-container"
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
    </div>
  );
};

export default ShipmentsPage;
