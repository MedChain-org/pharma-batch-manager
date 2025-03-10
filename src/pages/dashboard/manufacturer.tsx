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

interface Drug {
  drug_id: string;
  name: string;
  manufacturer: string;
  manufacture_date: string;
  expiry_date: string;
  batch_number: string;
  blockchain_tx_id: string;
  timestamp: string;
}

interface DrugStatusUpdate {
  drug_id: string;
  status: "manufactured" | "in_transit" | "delivered" | "dispensed";
  location: string;
  updated_by: string;
  blockchain_tx_id: string;
  timestamp: string;
}

const ManufacturerDashboard = () => {
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [newDrug, setNewDrug] = useState<Partial<Drug>>({});
  const [statusUpdates, setStatusUpdates] = useState<DrugStatusUpdate[]>([]);

  const handleAddDrug = () => {
    // TODO: Integrate with Supabase
    const drug: Drug = {
      drug_id: Date.now().toString(),
      name: newDrug.name || "",
      manufacturer: "Current Manufacturer", // Will come from auth user
      manufacture_date: newDrug.manufacture_date || "",
      expiry_date: newDrug.expiry_date || "",
      batch_number: newDrug.batch_number || "",
      blockchain_tx_id: "pending", // Will be updated when blockchain integration is added
      timestamp: new Date().toISOString(),
    };

    // Add initial status update
    const statusUpdate: DrugStatusUpdate = {
      drug_id: drug.drug_id,
      status: "manufactured",
      location: "Manufacturing Facility", // TODO: Get from user profile
      updated_by: "Current User", // TODO: Get from auth
      blockchain_tx_id: "pending",
      timestamp: new Date().toISOString(),
    };

    setDrugs([...drugs, drug]);
    setStatusUpdates([...statusUpdates, statusUpdate]);
    setNewDrug({});
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Manufacturer Dashboard</h1>

      <Card>
        <CardHeader>
          <CardTitle>Add New Drug Batch</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="Drug Name"
              value={newDrug.name || ""}
              onChange={(e) => setNewDrug({ ...newDrug, name: e.target.value })}
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
          <Button onClick={handleAddDrug}>Add Drug Batch</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Drug Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Drug Name</TableHead>
                <TableHead>Batch Number</TableHead>
                <TableHead>Manufacturing Date</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drugs.map((drug) => {
                const latestStatus = statusUpdates
                  .filter((update) => update.drug_id === drug.drug_id)
                  .sort(
                    (a, b) =>
                      new Date(b.timestamp).getTime() -
                      new Date(a.timestamp).getTime()
                  )[0];

                return (
                  <TableRow key={drug.drug_id}>
                    <TableCell>{drug.name}</TableCell>
                    <TableCell>{drug.batch_number}</TableCell>
                    <TableCell>{drug.manufacture_date}</TableCell>
                    <TableCell>{drug.expiry_date}</TableCell>
                    <TableCell>
                      {latestStatus?.status || "manufactured"}
                    </TableCell>
                    <TableCell>
                      {latestStatus?.location || "Manufacturing Facility"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManufacturerDashboard;
