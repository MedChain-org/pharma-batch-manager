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
import { Badge } from "@/components/ui/badge";

interface Prescription {
  id: string;
  patientName: string;
  doctorName: string;
  medication: string;
  dosage: string;
  frequency: string;
  status: "pending" | "dispensed" | "cancelled";
  dateIssued: string;
  dateDispensed?: string;
}

const PharmacistDashboard = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const handleDispensePrescription = (id: string) => {
    setPrescriptions(
      prescriptions.map((prescription) =>
        prescription.id === id
          ? {
              ...prescription,
              status: "dispensed",
              dateDispensed: new Date().toISOString().split("T")[0],
            }
          : prescription
      )
    );
  };

  const filteredPrescriptions = prescriptions.filter(
    (prescription) =>
      prescription.patientName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      prescription.medication.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "dispensed":
        return "bg-green-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Pharmacist Dashboard</h1>

      <Card>
        <CardHeader>
          <CardTitle>Prescription Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Search prescriptions by patient name or medication..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient Name</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Medication</TableHead>
                <TableHead>Dosage</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Date Issued</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPrescriptions.map((prescription) => (
                <TableRow key={prescription.id}>
                  <TableCell>{prescription.patientName}</TableCell>
                  <TableCell>{prescription.doctorName}</TableCell>
                  <TableCell>{prescription.medication}</TableCell>
                  <TableCell>{prescription.dosage}</TableCell>
                  <TableCell>{prescription.frequency}</TableCell>
                  <TableCell>{prescription.dateIssued}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(prescription.status)}>
                      {prescription.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {prescription.status === "pending" && (
                      <Button
                        onClick={() =>
                          handleDispensePrescription(prescription.id)
                        }
                        variant="outline"
                        size="sm"
                      >
                        Dispense
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dispensing History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient Name</TableHead>
                <TableHead>Medication</TableHead>
                <TableHead>Date Dispensed</TableHead>
                <TableHead>Dispensed By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prescriptions
                .filter((p) => p.status === "dispensed")
                .map((prescription) => (
                  <TableRow key={prescription.id}>
                    <TableCell>{prescription.patientName}</TableCell>
                    <TableCell>{prescription.medication}</TableCell>
                    <TableCell>{prescription.dateDispensed}</TableCell>
                    <TableCell>Current Pharmacist</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PharmacistDashboard;
