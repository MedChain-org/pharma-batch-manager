import React, { useState, useEffect } from "react";
import DoctorNavbar from "@/components/shared/NavBar/DoctorNavbar";
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
  Check,
  Calendar,
  Clock,
  Shield,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchPrescriptionsByDoctor,
  fetchDrugs,
  addPrescription,
} from "@/lib/database";
import { Prescription, Drug } from "@/types/database";
import { Textarea } from "@/components/ui/textarea";

const DoctorDashboard = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [selectedDrugs, setSelectedDrugs] = useState<Drug[]>([]);
  const [patientId, setPatientId] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPrescription, setSelectedPrescription] =
    useState<Prescription | null>(null);
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
      const prescriptionsData = await fetchPrescriptionsByDoctor(user.id);
      setPrescriptions(prescriptionsData);

      // Load drugs for prescribing
      const drugsData = await fetchDrugs();
      setDrugs(drugsData);
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

  const handleCreatePrescription = async () => {
    if (!user) return;

    if (selectedDrugs.length === 0 || !patientId) {
      toast({
        title: "Validation Error",
        description: "Please select drugs and enter a patient ID.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const today = new Date();
      // Set expiry date to 6 months from now
      const expiryDate = new Date();
      expiryDate.setMonth(today.getMonth() + 6);

      const newPrescription = await addPrescription({
        patient_id: patientId,
        doctor_id: user.id,
        drug_ids: selectedDrugs.map((drug) => drug.drug_id),
        issue_date: today.toISOString(),
        expiry_date: expiryDate.toISOString(),
        notes: notes,
      });

      if (newPrescription) {
        toast({
          title: "Success",
          description: "Prescription registered on blockchain successfully!",
        });

        // Reset form
        setSelectedDrugs([]);
        setPatientId("");
        setNotes("");

        // Refresh data
        await loadData();
      }
    } catch (error) {
      console.error("Error creating prescription:", error);
      toast({
        title: "Error",
        description: "Failed to create prescription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewPrescription = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
  };

  const getBlockchainStatus = (prescription: Prescription) => {
    const txId = prescription.blockchain_tx_id;
    if (txId === "pending") {
      return { status: "pending", message: "Pending blockchain confirmation" };
    } else if (txId) {
      return { status: "confirmed", message: "Verified on blockchain" };
    } else {
      return { status: "failed", message: "Not on blockchain" };
    }
  };

  return (
    <>
      <DoctorNavbar />
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gradient">Doctor Dashboard</h1>
          <p className="text-muted-foreground">
            Create blockchain-verified prescriptions to prevent counterfeiting
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="col-span-1 glass-card">
            <CardHeader className="bg-gradient-to-r from-accent/10 to-accent/5 rounded-t-xl">
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
            <CardHeader className="bg-gradient-to-r from-accent/10 to-accent/5 rounded-t-xl">
              <CardTitle className="flex items-center gap-2">
                <QrCode size={18} />
                Create Blockchain Prescription
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Patient ID
                  </label>
                  <Input
                    placeholder="Enter patient's unique identifier"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Select Verified Drugs
                  </label>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12"></TableHead>
                          <TableHead>Drug Name</TableHead>
                          <TableHead>Manufacturer</TableHead>
                          <TableHead>Authenticity</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {drugs.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={4}
                              className="text-center h-20 text-muted-foreground"
                            >
                              No verified drugs available
                            </TableCell>
                          </TableRow>
                        ) : (
                          drugs.map((drug) => {
                            const isSelected = selectedDrugs.some(
                              (d) => d.drug_id === drug.drug_id
                            );

                            // Only show blockchain verified drugs
                            if (
                              drug.blockchain_tx_id &&
                              drug.blockchain_tx_id !== "pending"
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
                                  <TableCell>{drug.manufacturer}</TableCell>
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
                              );
                            }
                            return null;
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Selected {selectedDrugs.length} drugs
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Dosage Instructions
                  </label>
                  <Textarea
                    placeholder="Enter detailed instructions for patient"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="resize-none"
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleCreatePrescription}
                  disabled={
                    submitting || selectedDrugs.length === 0 || !patientId
                  }
                  className="w-full"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering on Blockchain...
                    </>
                  ) : (
                    "Create Blockchain Prescription"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-card">
          <CardHeader className="bg-gradient-to-r from-accent/10 to-accent/5 rounded-t-xl">
            <CardTitle className="flex items-center gap-2">
              <Shield size={18} />
              Blockchain-Verified Prescriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-accent" />
              </div>
            ) : prescriptions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No prescriptions found. Create your first prescription above.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Prescription ID</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Drugs</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Blockchain Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prescriptions.map((prescription) => (
                      <TableRow
                        key={prescription.prescription_id}
                        className="hover:bg-accent/5"
                      >
                        <TableCell className="font-medium">
                          {prescription.prescription_id.slice(0, 8)}...
                        </TableCell>
                        <TableCell>{prescription.patient_id}</TableCell>
                        <TableCell>
                          {new Date(
                            prescription.issue_date
                          ).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{prescription.drug_ids.length}</TableCell>
                        <TableCell>
                          {prescription.dispensed ? (
                            <Badge
                              variant="default"
                              className="flex items-center gap-1"
                            >
                              <Check size={12} />
                              Dispensed
                            </Badge>
                          ) : new Date(prescription.expiry_date) <
                            new Date() ? (
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
                              <Calendar size={12} />
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
                              <AlertCircle size={12} />
                              Not Verified
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleViewPrescription(prescription)
                              }
                            >
                              View
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

        {selectedPrescription && (
          <Card className="glass-card">
            <CardHeader className="bg-gradient-to-r from-accent/10 to-accent/5 rounded-t-xl">
              <div className="flex justify-between items-center">
                <CardTitle>Prescription Authentication QR</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPrescription(null)}
                >
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-center">
                    {/* This would be a real QR code in production */}
                    <div className="w-64 h-64 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAMAAABrrFhUAAAAA1BMVEX///+nxBvIAAAASElEQVR4nO3BMQEAAADCoPVPbQlPoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABeA8XKAAFZcBBuAAAAAElFTkSuQmCC')] bg-contain"></div>
                  </div>
                  <div className="mt-4">
                    <div className="bg-secondary/10 p-4 rounded-lg">
                      <h3 className="text-sm font-medium mb-2">
                        Prescription Verification
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        This QR code can be used by pharmacists to verify
                        prescription authenticity on the blockchain. The patient
                        should present this QR code when having the prescription
                        filled.
                      </p>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 flex items-center gap-1"
                      >
                        <QrCode size={14} />
                        Download QR
                      </Button>
                      <Button className="flex-1">Send to Patient</Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium">
                      Prescription Details
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      ID: {selectedPrescription.prescription_id}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
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
                        Status
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedPrescription.dispensed ? (
                          <>
                            <Badge
                              variant="default"
                              className="flex items-center gap-1"
                            >
                              <Check size={12} />
                              Dispensed
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              by{" "}
                              {selectedPrescription.dispensed_by || "Unknown"}{" "}
                              on{" "}
                              {selectedPrescription.dispensed_at
                                ? new Date(
                                    selectedPrescription.dispensed_at
                                  ).toLocaleDateString()
                                : "Unknown date"}
                            </span>
                          </>
                        ) : new Date(selectedPrescription.expiry_date) <
                          new Date() ? (
                          <Badge variant="destructive">Expired</Badge>
                        ) : (
                          <Badge variant="outline">Active</Badge>
                        )}
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
                              {selectedPrescription.blockchain_tx_id.slice(
                                0,
                                10
                              )}
                              ...)
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
                            {selectedPrescription.drug_ids.map(
                              (drugId, index) => (
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
                              )
                            )}
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

export default DoctorDashboard;
