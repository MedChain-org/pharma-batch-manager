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
  User as UserIcon,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchPrescriptionsByDoctor,
  fetchDrugs,
  addPrescription,
  fetchPatientByEmail,
  fetchManufacturerById,
} from "@/lib/database";
import { Prescription, Drug, User } from "@/types/database";
import { Textarea } from "@/components/ui/textarea";
import QRCodeLib from "qrcode";

const DoctorDashboard = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [selectedDrugs, setSelectedDrugs] = useState<Drug[]>([]);
  const [patientEmail, setPatientEmail] = useState("");
  const [patientDetails, setPatientDetails] = useState<User | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPrescription, setSelectedPrescription] =
    useState<Prescription | null>(null);
  const [searchingPatient, setSearchingPatient] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const [manufacturerNames, setManufacturerNames] = useState<{
    [key: string]: string;
  }>({});

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

      // Load manufacturer names
      const manufacturerIds = [
        ...new Set(drugsData.map((drug) => drug.manufacturer)),
      ];
      const manufacturerData: { [key: string]: string } = {};

      await Promise.all(
        manufacturerIds.map(async (id) => {
          const manufacturer = await fetchManufacturerById(id);
          if (manufacturer) {
            manufacturerData[id] = manufacturer.name;
          }
        })
      );

      setManufacturerNames(manufacturerData);
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

  const handlePatientEmailChange = (email: string) => {
    setPatientEmail(email);
    if (!email) {
      setPatientDetails(null);
    }
  };

  const handleSearchPatient = async () => {
    if (!patientEmail || !patientEmail.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setSearchingPatient(true);
    try {
      const patient = await fetchPatientByEmail(patientEmail);
      if (patient) {
        setPatientDetails(patient);
        toast({
          title: "Patient Found",
          description: `Found patient: ${patient.name}`,
        });
      } else {
        setPatientDetails(null);
        toast({
          title: "Patient Not Found",
          description: "No active patient found with this email.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching patient:", error);
      setPatientDetails(null);
      toast({
        title: "Error",
        description: "Failed to search for patient. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSearchingPatient(false);
    }
  };

  const handleCreatePrescription = async () => {
    if (!user) return;

    if (selectedDrugs.length === 0 || !patientDetails) {
      toast({
        title: "Validation Error",
        description: "Please select drugs and enter a valid patient email.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const today = new Date();
      const expiryDate = new Date();
      expiryDate.setMonth(today.getMonth() + 6);

      const newPrescription = await addPrescription({
        patient_id: patientDetails.id,
        doctor_id: user.id,
        drug_ids: selectedDrugs.map((drug) => drug.drug_id),
        issue_date: today.toISOString(),
        expiry_date: expiryDate.toISOString(),
        notes: notes,
      });

      if (newPrescription) {
        toast({
          title: "Success",
          description: "Prescription created successfully!",
        });

        // Reset form
        setSelectedDrugs([]);
        setPatientEmail("");
        setPatientDetails(null);
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
    return { status: "confirmed", message: "Verified on blockchain" };
  };

  useEffect(() => {
    const generateQRCode = async () => {
      if (!selectedPrescription) return;

      try {
        // Create QR code data with prescription information
        const qrData = {
          prescription_id: selectedPrescription.prescription_id,
          patient_id: selectedPrescription.patient_id,
          doctor_id: selectedPrescription.doctor_id,
          drug_ids: selectedPrescription.drug_ids,
          issue_date: selectedPrescription.issue_date,
          expiry_date: selectedPrescription.expiry_date,
          notes: selectedPrescription.notes,
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
        const qrContainer = document.getElementById(
          "prescription-qr-container"
        );
        if (qrContainer) {
          qrContainer.innerHTML = `<img src="${qrCodeDataUrl}" alt="QR Code for Prescription ${selectedPrescription.prescription_id}" style="width: 100%; height: 100%; object-fit: contain;" />`;
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
  }, [selectedPrescription]);

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
                    Active Prescriptions
                  </span>
                  <span className="text-2xl font-semibold">
                    {loading
                      ? "-"
                      : prescriptions.filter(
                          (p) =>
                            !p.dispensed && new Date(p.expiry_date) > new Date()
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
                    Patient Email
                  </label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter patient's email address"
                        value={patientEmail}
                        onChange={(e) =>
                          handlePatientEmailChange(e.target.value)
                        }
                        type="email"
                        className="w-full"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSearchPatient();
                          }
                        }}
                      />
                      <Button
                        onClick={handleSearchPatient}
                        disabled={searchingPatient || !patientEmail}
                        className="relative z-20 hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        {searchingPatient ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Search"
                        )}
                      </Button>
                    </div>
                    {patientDetails && (
                      <div className="flex items-center gap-2 p-3 bg-secondary/10 rounded-lg">
                        <UserIcon size={16} className="text-primary" />
                        <div>
                          <div className="font-medium">
                            {patientDetails.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ID: {patientDetails.id} • Email:{" "}
                            {patientDetails.email}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
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
                            if (drug.blockchain_tx_id) {
                              return (
                                <TableRow
                                  key={drug.drug_id}
                                  className={
                                    isSelected
                                      ? "bg-accent/10 hover:bg-accent/5 relative z-10 transition-colors cursor-pointer"
                                      : "hover:bg-secondary/5 relative z-10 transition-colors cursor-pointer"
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
                                  <TableCell>
                                    {manufacturerNames[drug.manufacturer] ||
                                      "Loading..."}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <Shield
                                        size={12}
                                        className="text-primary"
                                      />
                                      <span>Blockchain Verified</span>
                                    </div>
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
                    submitting || selectedDrugs.length === 0 || !patientEmail
                  }
                  className="w-full relative z-20 hover:bg-primary hover:text-primary-foreground transition-colors"
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
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prescriptions.map((prescription) => (
                      <TableRow
                        key={prescription.prescription_id}
                        className="hover:bg-accent/5 relative z-10 transition-colors"
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
                        <TableCell>
                          {Array.isArray(prescription.drug_ids)
                            ? prescription.drug_ids.length
                            : typeof prescription.drug_ids === "string"
                            ? JSON.parse(prescription.drug_ids).length
                            : 0}
                        </TableCell>
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
                          <div className="flex space-x-2 relative z-20">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleViewPrescription(prescription)
                              }
                              className="relative z-30 hover:bg-primary hover:text-primary-foreground transition-colors"
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
                  className="relative z-30 hover:bg-primary/10 transition-colors"
                >
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-center">
                    <div
                      id="prescription-qr-container"
                      className="w-64 h-64"
                    ></div>
                  </div>
                  <div className="mt-4">
                    <div className="bg-secondary/10 p-4 rounded-lg">
                      <h3 className="text-sm font-medium mb-2">
                        Prescription Verification
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        This QR code contains the prescription details and
                        blockchain verification. Pharmacists can scan this to
                        verify authenticity and dispense medication.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">
                      Prescription Details
                    </h3>
                  </div>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        Patient ID
                      </div>
                      <div className="font-medium">
                        {selectedPrescription.patient_id}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        Issue Date
                      </div>
                      <div className="font-medium">
                        {new Date(
                          selectedPrescription.issue_date
                        ).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        Expiry Date
                      </div>
                      <div className="font-medium">
                        {new Date(
                          selectedPrescription.expiry_date
                        ).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        Status
                      </div>
                      <div className="font-medium">
                        {selectedPrescription.dispensed ? (
                          <Badge
                            variant="default"
                            className="flex items-center gap-1"
                          >
                            <Check size={12} />
                            Dispensed
                          </Badge>
                        ) : new Date(selectedPrescription.expiry_date) <
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
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 relative z-30 hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => {
                        const qrContainer = document.getElementById(
                          "prescription-qr-container"
                        );
                        if (qrContainer) {
                          const printWindow = window.open("", "_blank");
                          if (printWindow) {
                            printWindow.document.write(`
                              <html>
                                <head>
                                  <title>QR Code - Prescription ${selectedPrescription.prescription_id}</title>
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
                      className="flex-1 relative z-30 hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => {
                        const qrContainer = document.getElementById(
                          "prescription-qr-container"
                        );
                        if (qrContainer) {
                          const img = qrContainer.querySelector("img");
                          if (img) {
                            const link = document.createElement("a");
                            link.href = img.src;
                            link.download = `prescription-${selectedPrescription.prescription_id}.png`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }
                        }
                      }}
                    >
                      Download QR
                    </Button>
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
