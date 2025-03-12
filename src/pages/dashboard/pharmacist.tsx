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
  QrCode,
  CheckCircle,
  Shield,
  AlertTriangle,
  Search,
  Scan,
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
  const [activeTab, setActiveTab] = useState("verify");
  const [selectedPrescription, setSelectedPrescription] =
    useState<Prescription | null>(null);
  const [qrValue, setQrValue] = useState("");
  const [verificationResult, setVerificationResult] = useState<{
    status: "success" | "error" | "waiting" | "scanning";
    message: string;
    prescription?: Prescription;
  }>({
    status: "waiting",
    message: "Scan or enter a QR code to verify a prescription",
  });
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

        // Reset verification state after successful dispensing
        if (
          selectedPrescription?.prescription_id === prescription.prescription_id
        ) {
          setVerificationResult({
            status: "waiting",
            message: "Scan or enter a QR code to verify a prescription",
          });
          setSelectedPrescription(null);
          setQrValue("");
        }

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

  const handleVerifyPrescription = () => {
    setVerificationResult({
      status: "scanning",
      message: "Scanning prescription...",
    });

    // Simulate blockchain verification process
    setTimeout(() => {
      // In a real application, this would verify the QR code against the blockchain
      const foundPrescription = prescriptions.find(
        (p) => p.prescription_id.toLowerCase() === qrValue.toLowerCase()
      );

      if (foundPrescription) {
        // Check if it's already dispensed
        if (foundPrescription.dispensed) {
          setVerificationResult({
            status: "error",
            message: "This prescription has already been dispensed.",
            prescription: foundPrescription,
          });
        }
        // Check if it's expired
        else if (new Date(foundPrescription.expiry_date) < new Date()) {
          setVerificationResult({
            status: "error",
            message: "This prescription has expired.",
            prescription: foundPrescription,
          });
        }
        // Check if it's verified on blockchain
        else if (
          !foundPrescription.blockchain_tx_id ||
          foundPrescription.blockchain_tx_id === "pending"
        ) {
          setVerificationResult({
            status: "error",
            message: "This prescription is not verified on blockchain.",
            prescription: foundPrescription,
          });
        }
        // All checks pass
        else {
          setVerificationResult({
            status: "success",
            message: "Prescription successfully verified on blockchain!",
            prescription: foundPrescription,
          });
          setSelectedPrescription(foundPrescription);
        }
      } else {
        setVerificationResult({
          status: "error",
          message: "Invalid prescription ID. Not found in database.",
        });
      }
    }, 1500);
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

  const renderVerificationUI = () => {
    return (
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-1 glass-card">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-xl">
            <CardTitle className="flex items-center gap-2">
              <Shield size={18} />
              Verify Prescriptions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="pb-4 text-sm text-muted-foreground">
              Scan a prescription QR code or enter the prescription ID to verify
              its authenticity on the blockchain.
            </div>

            <div className="bg-black/5 dark:bg-white/5 rounded-lg p-6 flex flex-col items-center justify-center">
              <div className="w-48 h-48 border-2 border-dashed border-primary/50 rounded-lg flex items-center justify-center mb-4">
                <QrCode size={64} className="text-primary/50" />
              </div>
              <Button variant="outline" className="w-full">
                <Scan className="mr-2 h-4 w-4" />
                Scan QR Code
              </Button>
            </div>

            <div className="text-center text-xs text-muted-foreground">or</div>

            <div>
              <div className="space-y-3">
                <Input
                  placeholder="Enter Prescription ID"
                  value={qrValue}
                  onChange={(e) => setQrValue(e.target.value)}
                  className="w-full"
                />
                <Button
                  onClick={handleVerifyPrescription}
                  disabled={
                    !qrValue.trim() || verificationResult.status === "scanning"
                  }
                  className="w-full"
                >
                  {verificationResult.status === "scanning" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Verify Prescription
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`col-span-1 lg:col-span-2 glass-card`}>
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-xl">
            <CardTitle className="flex items-center gap-2">
              <LucideShieldCheck size={18} />
              Blockchain Verification Results
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* Verification Status Display */}
            <div
              className={`rounded-lg p-6 mb-6 ${
                verificationResult.status === "success"
                  ? "bg-green-500/10"
                  : verificationResult.status === "error"
                  ? "bg-red-500/10"
                  : verificationResult.status === "scanning"
                  ? "bg-blue-500/10"
                  : "bg-secondary/10"
              }`}
            >
              <div className="flex flex-col items-center justify-center text-center gap-2">
                {verificationResult.status === "success" && (
                  <CheckCircle size={48} className="text-green-500" />
                )}
                {verificationResult.status === "error" && (
                  <AlertTriangle size={48} className="text-red-500" />
                )}
                {verificationResult.status === "scanning" && (
                  <Loader2 size={48} className="text-blue-500 animate-spin" />
                )}
                {verificationResult.status === "waiting" && (
                  <QrCode size={48} className="text-primary/50" />
                )}

                <h3 className="text-xl font-semibold mt-2">
                  {verificationResult.status === "success"
                    ? "Verified!"
                    : verificationResult.status === "error"
                    ? "Verification Failed"
                    : verificationResult.status === "scanning"
                    ? "Verifying..."
                    : "Awaiting Verification"}
                </h3>

                <p className="text-muted-foreground mt-1">
                  {verificationResult.message}
                </p>
              </div>
            </div>

            {/* Prescription Details */}
            {selectedPrescription && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Patient ID
                    </div>
                    <div className="font-medium">
                      {selectedPrescription.patient_id}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Doctor ID
                    </div>
                    <div className="font-medium">
                      {selectedPrescription.doctor_id}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Issue Date
                    </div>
                    <div className="font-medium">
                      {new Date(
                        selectedPrescription.issue_date
                      ).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Expiry Date
                    </div>
                    <div className="font-medium">
                      {new Date(
                        selectedPrescription.expiry_date
                      ).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Blockchain Verification
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedPrescription.blockchain_tx_id === "pending" ? (
                      <>
                        <Loader2
                          size={16}
                          className="animate-spin text-amber-500"
                        />
                        <span className="text-sm">
                          Pending blockchain confirmation
                        </span>
                      </>
                    ) : selectedPrescription.blockchain_tx_id ? (
                      <>
                        <Shield size={16} className="text-green-500" />
                        <span className="text-sm">
                          Verified on blockchain (TX:{" "}
                          {selectedPrescription.blockchain_tx_id.slice(0, 10)}
                          ...)
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle size={16} className="text-red-500" />
                        <span className="text-sm">
                          Not verified on blockchain
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Prescribed Drugs
                  </div>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Drug ID</TableHead>
                          <TableHead>Verification</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedPrescription.drug_ids.map((drugId, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              {drugId.slice(0, 10)}...
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="default"
                                className="flex items-center gap-1"
                              >
                                <Shield size={12} />
                                Verified
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {selectedPrescription.notes && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">
                      Dosage Instructions
                    </div>
                    <div className="bg-secondary/10 p-3 rounded-lg whitespace-pre-wrap">
                      {selectedPrescription.notes}
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => handleDispense(selectedPrescription)}
                  disabled={
                    submitting || verificationResult.status !== "success"
                  }
                  className="w-full mt-4"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Dispense Medication"
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderPrescriptionsUI = () => {
    return (
      <Card className="glass-card mt-6">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-xl">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle size={18} />
            Blockchain-Verified Prescriptions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : prescriptions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No prescriptions found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Prescription ID</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Blockchain Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prescriptions.map((prescription) => (
                    <TableRow
                      key={prescription.prescription_id}
                      className="hover:bg-primary/5"
                    >
                      <TableCell className="font-medium">
                        {prescription.prescription_id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>{prescription.patient_id}</TableCell>
                      <TableCell>
                        {prescription.doctor_id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        {new Date(prescription.issue_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {prescription.dispensed ? (
                          <Badge
                            variant="default"
                            className="flex items-center gap-1"
                          >
                            <CheckCircle size={12} />
                            Dispensed
                          </Badge>
                        ) : new Date(prescription.expiry_date) < new Date() ? (
                          <Badge
                            variant="destructive"
                            className="flex items-center gap-1"
                          >
                            <Clock size={12} />
                            Expired
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="flex items-center gap-1"
                          >
                            <Clock size={12} />
                            Active
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {prescription.blockchain_tx_id === "pending" ? (
                          <Badge
                            variant="outline"
                            className="flex items-center gap-1"
                          >
                            <Loader2 size={12} className="animate-spin" />
                            Pending
                          </Badge>
                        ) : prescription.blockchain_tx_id ? (
                          <Badge
                            variant="default"
                            className="flex items-center gap-1"
                          >
                            <Shield size={12} />
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
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={
                              prescription.dispensed ||
                              new Date(prescription.expiry_date) < new Date() ||
                              !prescription.blockchain_tx_id ||
                              prescription.blockchain_tx_id === "pending"
                            }
                            onClick={() => {
                              setQrValue(prescription.prescription_id);
                              setVerificationResult({
                                status: "success",
                                message: "Prescription verified on blockchain!",
                                prescription: prescription,
                              });
                              setSelectedPrescription(prescription);
                              setActiveTab("verify");
                            }}
                          >
                            Verify & Dispense
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
    );
  };

  return (
    <>
      <PharmacistNavbar />
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gradient">
            Pharmacist Dashboard
          </h1>
          <p className="text-muted-foreground">
            Verify and dispense authentic blockchain-verified medications
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="col-span-1 glass-card">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-xl">
              <CardTitle className="flex items-center gap-2">
                <Shield size={18} />
                Blockchain Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    Total Prescriptions
                  </span>
                  <span className="text-2xl font-semibold">
                    {loading ? "-" : prescriptions.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    Blockchain Verified
                  </span>
                  <span className="text-2xl font-semibold">
                    {loading
                      ? "-"
                      : prescriptions.filter(
                          (p) =>
                            p.blockchain_tx_id &&
                            p.blockchain_tx_id !== "pending"
                        ).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Dispensed</span>
                  <span className="text-2xl font-semibold">
                    {loading
                      ? "-"
                      : prescriptions.filter((p) => p.dispensed).length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1 md:col-span-2 glass-card">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-xl">
              <CardTitle>Pharmacy Management</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger
                    value="verify"
                    className="flex items-center gap-1"
                  >
                    <QrCode size={14} />
                    Verify & Dispense
                  </TabsTrigger>
                  <TabsTrigger
                    value="prescriptions"
                    className="flex items-center gap-1"
                  >
                    <CheckCircle size={14} />
                    Prescription History
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {activeTab === "verify" && renderVerificationUI()}
        {activeTab === "prescriptions" && renderPrescriptionsUI()}
      </div>
    </>
  );
};

export default PharmacistDashboard;
