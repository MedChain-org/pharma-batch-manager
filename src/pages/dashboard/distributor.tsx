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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Shipment {
  shipment_id: string;
  drug_ids: string[];
  sender: string;
  receiver: string;
  status: string;
  ship_date: string;
  blockchain_tx_id: string;
  timestamp: string;
  shipment_timestamp: string;
}

interface ShipmentStatusUpdate {
  id: string;
  shipment_id: string;
  status: string;
  location: string;
  updated_by: string;
  blockchain_tx_id: string;
  timestamp: string;
}

const DistributorDashboard = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [newShipment, setNewShipment] = useState<Partial<Shipment>>({});
  const [statusUpdates, setStatusUpdates] = useState<ShipmentStatusUpdate[]>(
    []
  );

  const handleAddShipment = () => {
    // TODO: Integrate with Supabase
    const shipment: Shipment = {
      shipment_id: Date.now().toString(),
      drug_ids: [], // TODO: Add drug selection functionality
      sender: "Current Distributor", // Will come from auth user
      receiver: newShipment.receiver || "",
      status: "pending",
      ship_date: newShipment.ship_date || "",
      blockchain_tx_id: "pending", // Will be updated when blockchain integration is added
      timestamp: new Date().toISOString(),
      shipment_timestamp: new Date().toISOString(),
    };

    // Add initial status update
    const statusUpdate: ShipmentStatusUpdate = {
      id: Date.now().toString(),
      shipment_id: shipment.shipment_id,
      status: "pending",
      location: "Distribution Center", // TODO: Get from user profile
      updated_by: "Current User", // TODO: Get from auth
      blockchain_tx_id: "pending",
      timestamp: new Date().toISOString(),
    };

    setShipments([...shipments, shipment]);
    setStatusUpdates([...statusUpdates, statusUpdate]);
    setNewShipment({});
  };

  const updateShipmentStatus = (
    shipmentId: string,
    status: string,
    location: string
  ) => {
    // TODO: Integrate with Supabase
    const statusUpdate: ShipmentStatusUpdate = {
      id: Date.now().toString(),
      shipment_id: shipmentId,
      status,
      location,
      updated_by: "Current User", // TODO: Get from auth
      blockchain_tx_id: "pending",
      timestamp: new Date().toISOString(),
    };

    setStatusUpdates([...statusUpdates, statusUpdate]);
    setShipments(
      shipments.map((shipment) =>
        shipment.shipment_id === shipmentId ? { ...shipment, status } : shipment
      )
    );
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Distributor Dashboard</h1>

      <Card>
        <CardHeader>
          <CardTitle>Track Shipments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Shipment ID</TableHead>
                <TableHead>Receiver</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ship Date</TableHead>
                <TableHead>Current Location</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shipments.map((shipment) => {
                const latestStatus = statusUpdates
                  .filter(
                    (update) => update.shipment_id === shipment.shipment_id
                  )
                  .sort(
                    (a, b) =>
                      new Date(b.timestamp).getTime() -
                      new Date(a.timestamp).getTime()
                  )[0];

                return (
                  <TableRow key={shipment.shipment_id}>
                    <TableCell>{shipment.shipment_id}</TableCell>
                    <TableCell>{shipment.receiver}</TableCell>
                    <TableCell>
                      {latestStatus?.status || shipment.status}
                    </TableCell>
                    <TableCell>{shipment.ship_date}</TableCell>
                    <TableCell>
                      {latestStatus?.location || "Distribution Center"}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={latestStatus?.status || shipment.status}
                        onValueChange={(value) =>
                          updateShipmentStatus(
                            shipment.shipment_id,
                            value,
                            latestStatus?.location || "Distribution Center"
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Update Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_transit">In Transit</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Create New Shipment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="Receiver"
              value={newShipment.receiver || ""}
              onChange={(e) =>
                setNewShipment({ ...newShipment, receiver: e.target.value })
              }
            />
            <Input
              type="date"
              placeholder="Ship Date"
              value={newShipment.ship_date || ""}
              onChange={(e) =>
                setNewShipment({ ...newShipment, ship_date: e.target.value })
              }
            />
          </div>
          <Button onClick={handleAddShipment}>Create Shipment</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DistributorDashboard;
