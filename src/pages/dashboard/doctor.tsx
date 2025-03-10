import React, { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  medicalHistory: string;
  lastVisit: string;
}

interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes: string;
  dateIssued: string;
}

const DoctorDashboard = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [newPrescription, setNewPrescription] = useState<Partial<Prescription>>(
    {}
  );
  const [searchTerm, setSearchTerm] = useState("");

  const handleAddPrescription = () => {
    if (!selectedPatient) return;

    const patient = patients.find((p) => p.id === selectedPatient);
    if (!patient) return;

    const prescription: Prescription = {
      id: Date.now().toString(),
      patientId: selectedPatient,
      patientName: patient.name,
      medication: newPrescription.medication || "",
      dosage: newPrescription.dosage || "",
      frequency: newPrescription.frequency || "",
      duration: newPrescription.duration || "",
      notes: newPrescription.notes || "",
      dateIssued: new Date().toISOString().split("T")[0],
    };

    setPrescriptions([...prescriptions, prescription]);
    setNewPrescription({});
  };

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Doctor Dashboard</h1>

      <Card>
        <CardHeader>
          <CardTitle>Patient Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Last Visit</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>{patient.name}</TableCell>
                  <TableCell>{patient.age}</TableCell>
                  <TableCell>{patient.gender}</TableCell>
                  <TableCell>{patient.lastVisit}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPatient(patient.id)}
                    >
                      Select
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Write Prescription</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select value={selectedPatient} onValueChange={setSelectedPatient}>
              <SelectTrigger>
                <SelectValue placeholder="Select Patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Medication"
              value={newPrescription.medication || ""}
              onChange={(e) =>
                setNewPrescription({
                  ...newPrescription,
                  medication: e.target.value,
                })
              }
            />
            <Input
              placeholder="Dosage"
              value={newPrescription.dosage || ""}
              onChange={(e) =>
                setNewPrescription({
                  ...newPrescription,
                  dosage: e.target.value,
                })
              }
            />
            <Input
              placeholder="Frequency"
              value={newPrescription.frequency || ""}
              onChange={(e) =>
                setNewPrescription({
                  ...newPrescription,
                  frequency: e.target.value,
                })
              }
            />
            <Input
              placeholder="Duration"
              value={newPrescription.duration || ""}
              onChange={(e) =>
                setNewPrescription({
                  ...newPrescription,
                  duration: e.target.value,
                })
              }
            />
            <Textarea
              placeholder="Notes"
              value={newPrescription.notes || ""}
              onChange={(e) =>
                setNewPrescription({
                  ...newPrescription,
                  notes: e.target.value,
                })
              }
              className="col-span-2"
            />
          </div>
          <Button onClick={handleAddPrescription} disabled={!selectedPatient}>
            Issue Prescription
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Prescriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Medication</TableHead>
                <TableHead>Dosage</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Date Issued</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prescriptions.map((prescription) => (
                <TableRow key={prescription.id}>
                  <TableCell>{prescription.patientName}</TableCell>
                  <TableCell>{prescription.medication}</TableCell>
                  <TableCell>{prescription.dosage}</TableCell>
                  <TableCell>{prescription.frequency}</TableCell>
                  <TableCell>{prescription.duration}</TableCell>
                  <TableCell>{prescription.dateIssued}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorDashboard;
