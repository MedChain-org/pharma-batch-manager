import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Input } from "@/components/ui/input";
import { Search, MapPin, Calendar, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import ManufacturerNavbar from "@/components/shared/NavBar/ManufacturerNavbar";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchUsersByRole,
  fetchDrugsByManufacturer,
  fetchShipments,
  addShipment,
  addShipmentStatusUpdate,
} from "@/lib/database";
import { User, Shipment, Drug } from "@/types/database";

interface BatchStatistics {
  totalBatches: number;
  revertedBatches: number;
  transferringBatches: number;
  transferredBatches: number;
}

const SupplyChain: React.FC = () => {
  const [selectedDistributor, setSelectedDistributor] = useState<string>("");
  const [distributionMode, setDistributionMode] = useState<"direct" | "fixed">(
    "direct"
  );
  const [distributors, setDistributors] = useState<User[]>([]);
  const [nameSearchQuery, setNameSearchQuery] = useState<string>("");
  const [locationSearchQuery, setLocationSearchQuery] = useState<string>("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [batchStats, setBatchStats] = useState<BatchStatistics>({
    totalBatches: 0,
    revertedBatches: 0,
    transferringBatches: 0,
    transferredBatches: 0,
  });
  const [selectedPharmacist, setSelectedPharmacist] = useState<string>("");
  const [pharmacistSearchQuery, setPharmacistSearchQuery] =
    useState<string>("");
  const [pharmacistLocationQuery, setPharmacistLocationQuery] =
    useState<string>("");
  const [pharmacistStatus, setPharmacistStatus] = useState<string>("all");
  const [pharmacists, setPharmacists] = useState<User[]>([]);
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch distributors
      const distributorsData = await fetchUsersByRole("distributor");
      setDistributors(distributorsData);

      // Fetch pharmacists
      const pharmacistsData = await fetchUsersByRole("pharmacist");
      setPharmacists(pharmacistsData);

      // Fetch drugs and shipments to calculate statistics
      const drugsData = await fetchDrugsByManufacturer(user?.id || "");
      setDrugs(drugsData);

      const shipmentsData = await fetchShipments();
      setShipments(shipmentsData);

      // Filter shipments that include this manufacturer's drugs
      const manufacturerDrugIds = drugsData.map((drug) => drug.drug_id);
      const relevantShipments = shipmentsData.filter((shipment) => {
        // Ensure drug_ids is an array and handle potential null/undefined values
        const shipmentDrugIds = Array.isArray(shipment.drug_ids)
          ? shipment.drug_ids
          : [];
        return shipmentDrugIds.some((id) => manufacturerDrugIds.includes(id));
      });

      // Calculate statistics
      const pending = relevantShipments.filter(
        (s) => s.status === "pending"
      ).length;
      const inTransit = relevantShipments.filter(
        (s) => s.status === "in_transit"
      ).length;
      const delivered = relevantShipments.filter(
        (s) => s.status === "delivered"
      ).length;
      const reverted = 0; // No specific "reverted" status in our data model, so defaulting to 0

      // Count unique drugs in shipments
      const uniqueDrugsInShipments = new Set(
        relevantShipments.flatMap((shipment) =>
          Array.isArray(shipment.drug_ids) ? shipment.drug_ids : []
        )
      );

      setBatchStats({
        totalBatches: drugsData.length,
        revertedBatches: reverted,
        transferringBatches: uniqueDrugsInShipments.size,
        transferredBatches: delivered,
      });
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load supply chain data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDistributorChange = (value: string) => {
    setSelectedDistributor(value);
  };

  const handleModeChange = (value: "direct" | "fixed") => {
    setDistributionMode(value);
  };

  const handleNameSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameSearchQuery(e.target.value.toLowerCase());
  };

  const handleLocationSearchChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setLocationSearchQuery(e.target.value.toLowerCase());
  };

  const handlePharmacistSearchChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPharmacistSearchQuery(e.target.value.toLowerCase());
  };

  const handlePharmacistLocationChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPharmacistLocationQuery(e.target.value.toLowerCase());
  };

  const handlePharmacistChange = (value: string) => {
    setSelectedPharmacist(value);
  };

  const handleCreateDistributionChannel = async () => {
    if (!user) return;

    if (!selectedDistributor) {
      toast({
        title: "Validation Error",
        description: "Please select a distributor.",
        variant: "destructive",
      });
      return;
    }

    if (distributionMode === "fixed" && !selectedPharmacist) {
      toast({
        title: "Validation Error",
        description: "Please select a pharmacist for fixed distribution.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      // For demonstration, create a shipment for all drugs not yet in transit
      const drugsToShip = drugs.filter((drug) => {
        // Check if drug is not in any active shipment
        return !shipments.some(
          (shipment) =>
            shipment.drug_ids.includes(drug.drug_id) &&
            shipment.status !== "delivered"
        );
      });

      if (drugsToShip.length === 0) {
        toast({
          title: "No Eligible Drugs",
          description: "No drugs available for shipment.",
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }

      const drugIdsToShip = drugsToShip.map((drug) => drug.drug_id);

      // Create a shipment
      const receiver =
        distributionMode === "fixed" ? selectedPharmacist : selectedDistributor;
      const shipmentData = await addShipment({
        drug_ids: drugIdsToShip,
        sender: user.id,
        receiver,
        status: "in_transit",
        ship_date: new Date().toISOString().split("T")[0],
      });

      if (shipmentData) {
        // Add initial shipment status update
        await addShipmentStatusUpdate({
          shipment_id: shipmentData.shipment_id,
          status: "in_transit",
          location: "Manufacturing Facility",
          updated_by: user.id,
        });

        toast({
          title: "Success",
          description: "Distribution channel created successfully!",
        });

        // Refresh data
        loadData();
      }
    } catch (error) {
      console.error("Error creating distribution channel:", error);
      toast({
        title: "Error",
        description: "Failed to create distribution channel. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredDistributors = distributors.filter((distributor) => {
    const nameMatch = distributor.name
      .toLowerCase()
      .includes(nameSearchQuery.toLowerCase());
    const locationMatch = true; // No location field in the User type, so not filtering by location
    const statusMatch =
      selectedStatus === "all" ||
      (selectedStatus === "active" && distributor.active) ||
      (selectedStatus === "inactive" && !distributor.active);
    return nameMatch && locationMatch && statusMatch;
  });

  const filteredPharmacists = pharmacists.filter((pharmacist) => {
    const nameMatch = pharmacist.name
      .toLowerCase()
      .includes(pharmacistSearchQuery.toLowerCase());
    const locationMatch = true; // No specific location field
    const statusMatch =
      pharmacistStatus === "all" ||
      (pharmacistStatus === "active" && pharmacist.active) ||
      (pharmacistStatus === "inactive" && !pharmacist.active);
    return nameMatch && locationMatch && statusMatch;
  });

  // Get distributor's location from the name for display purposes
  const getLocationFromName = (name: string) => {
    // This is a simplification. In a real app, you'd store and fetch actual location data
    const cityMap: Record<string, string> = {
      Mumbai: "Mumbai",
      Delhi: "Delhi",
      Bangalore: "Bangalore",
      Chennai: "Chennai",
      Hyderabad: "Hyderabad",
      Kolkata: "Kolkata",
      Pune: "Pune",
      Ahmedabad: "Ahmedabad",
    };

    for (const [city, location] of Object.entries(cityMap)) {
      if (name.includes(city)) {
        return location;
      }
    }

    return "Unknown Location";
  };

  return (
    <>
      <ManufacturerNavbar />
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gradient">
            Supply Chain Management
          </h1>
          <p className="text-muted-foreground">
            Manage your distribution channels and track batch transfers
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Loading supply chain data...</span>
          </div>
        ) : (
          <>
            {/* Batch Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Batches
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {batchStats.totalBatches}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Reverted Batches
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {batchStats.revertedBatches}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Transferring
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {batchStats.transferringBatches}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Transferred
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {batchStats.transferredBatches}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Distribution Mode Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Distribution Channel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex space-x-4">
                    <Button
                      variant={
                        distributionMode === "direct" ? "default" : "outline"
                      }
                      onClick={() => handleModeChange("direct")}
                    >
                      Direct Distribution
                    </Button>
                    <Button
                      variant={
                        distributionMode === "fixed" ? "default" : "outline"
                      }
                      onClick={() => handleModeChange("fixed")}
                    >
                      Fixed Distributor
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {distributionMode === "direct" ? (
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search and select distributor..."
                          className="pl-8 bg-white w-full"
                          value={nameSearchQuery}
                          onChange={handleNameSearchChange}
                        />
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search and select distributor..."
                            className="pl-8 bg-white w-full"
                            value={nameSearchQuery}
                            onChange={handleNameSearchChange}
                          />
                        </div>
                        <div className="relative">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search and select pharmacist..."
                            className="pl-8 bg-white w-full"
                            value={pharmacistSearchQuery}
                            onChange={handlePharmacistSearchChange}
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        {nameSearchQuery && (
                          <div className="border rounded-md max-h-[200px] overflow-y-auto bg-white">
                            {filteredDistributors.length > 0 ? (
                              filteredDistributors.map((dist) => (
                                <button
                                  key={dist.id}
                                  className={cn(
                                    "w-full px-4 py-2 text-left hover:bg-muted/50 flex items-center justify-between",
                                    selectedDistributor === dist.id &&
                                      "bg-muted"
                                  )}
                                  onClick={() =>
                                    handleDistributorChange(dist.id)
                                  }
                                >
                                  <span>{dist.name}</span>
                                  <Badge
                                    variant={
                                      dist.active ? "default" : "secondary"
                                    }
                                  >
                                    {getLocationFromName(dist.name)}
                                  </Badge>
                                </button>
                              ))
                            ) : (
                              <div className="px-4 py-2 text-muted-foreground">
                                No distributors found
                              </div>
                            )}
                          </div>
                        )}

                        {selectedDistributor && (
                          <div className="flex items-center gap-2 p-2 bg-muted/10 rounded-md mt-2">
                            <span>Selected: </span>
                            <Badge variant="outline">
                              {
                                distributors.find(
                                  (d) => d.id === selectedDistributor
                                )?.name
                              }
                            </Badge>
                          </div>
                        )}
                      </div>

                      {distributionMode === "fixed" && (
                        <div>
                          {pharmacistSearchQuery && (
                            <div className="border rounded-md max-h-[200px] overflow-y-auto bg-white">
                              {filteredPharmacists.length > 0 ? (
                                filteredPharmacists.map((pharm) => (
                                  <button
                                    key={pharm.id}
                                    className={cn(
                                      "w-full px-4 py-2 text-left hover:bg-muted/50 flex items-center justify-between",
                                      selectedPharmacist === pharm.id &&
                                        "bg-muted"
                                    )}
                                    onClick={() =>
                                      handlePharmacistChange(pharm.id)
                                    }
                                  >
                                    <span>{pharm.name}</span>
                                    <Badge
                                      variant={
                                        pharm.active ? "default" : "secondary"
                                      }
                                    >
                                      {getLocationFromName(pharm.name)}
                                    </Badge>
                                  </button>
                                ))
                              ) : (
                                <div className="px-4 py-2 text-muted-foreground">
                                  No pharmacists found
                                </div>
                              )}
                            </div>
                          )}

                          {selectedPharmacist && (
                            <div className="flex items-center gap-2 p-2 bg-muted/10 rounded-md mt-2">
                              <span>Selected: </span>
                              <Badge variant="outline">
                                {
                                  pharmacists.find(
                                    (p) => p.id === selectedPharmacist
                                  )?.name
                                }
                              </Badge>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={handleCreateDistributionChannel}
                      disabled={
                        submitting ||
                        !selectedDistributor ||
                        (distributionMode === "fixed" && !selectedPharmacist)
                      }
                      className="mt-4"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Distribution Channel"
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Distributors Table */}
            <Card>
              <CardHeader>
                <CardTitle>Registered Distributors</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Search Filters */}
                <div className="flex flex-wrap gap-4 items-center mb-6 bg-muted/5 p-4 rounded-lg">
                  <div className="relative flex-1 min-w-[240px]">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by distributor name..."
                      className="pl-8 bg-white"
                      value={nameSearchQuery}
                      onChange={handleNameSearchChange}
                    />
                  </div>
                  <div className="relative flex-1 min-w-[240px]">
                    <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by location..."
                      className="pl-8 bg-white"
                      value={locationSearchQuery}
                      onChange={handleLocationSearchChange}
                      disabled={true} // Disabled since location isn't available in the data model
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-[200px] justify-start text-left font-normal bg-white",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {startDate
                            ? format(startDate, "dd-MM-yyyy")
                            : "Start date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-[200px] justify-start text-left font-normal bg-white",
                            !endDate && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "dd-MM-yyyy") : "End date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <Select
                      value={selectedStatus}
                      onValueChange={setSelectedStatus}
                    >
                      <SelectTrigger className="w-[160px] bg-white">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDistributors.map((distributor) => (
                      <TableRow key={distributor.id}>
                        <TableCell>{distributor.name}</TableCell>
                        <TableCell>{distributor.email}</TableCell>
                        <TableCell>
                          {new Date(
                            distributor.created_at
                          ).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              distributor.active ? "default" : "secondary"
                            }
                          >
                            {distributor.active ? "active" : "inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            className="relative z-20"
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredDistributors.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center py-4 text-muted-foreground"
                        >
                          No distributors found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Pharmacists Table - Only visible in Fixed Distribution Mode */}
            {distributionMode === "fixed" && (
              <Card>
                <CardHeader>
                  <CardTitle>Registered Pharmacists</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Search Filters */}
                  <div className="flex flex-wrap gap-4 items-center mb-6 bg-muted/5 p-4 rounded-lg">
                    <div className="relative flex-1 min-w-[240px]">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by pharmacist name..."
                        className="pl-8 bg-white"
                        value={pharmacistSearchQuery}
                        onChange={handlePharmacistSearchChange}
                      />
                    </div>
                    <div className="relative flex-1 min-w-[240px]">
                      <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by location..."
                        className="pl-8 bg-white"
                        value={pharmacistLocationQuery}
                        onChange={handlePharmacistLocationChange}
                        disabled={true} // Disabled since location isn't available in the data model
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={pharmacistStatus}
                        onValueChange={setPharmacistStatus}
                      >
                        <SelectTrigger className="w-[160px] bg-white">
                          <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPharmacists.map((pharmacist) => (
                        <TableRow key={pharmacist.id}>
                          <TableCell>{pharmacist.name}</TableCell>
                          <TableCell>{pharmacist.email}</TableCell>
                          <TableCell>
                            {new Date(
                              pharmacist.created_at
                            ).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                pharmacist.active ? "default" : "secondary"
                              }
                            >
                              {pharmacist.active ? "active" : "inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handlePharmacistChange(pharmacist.id)
                              }
                            >
                              Select
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredPharmacists.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center py-4 text-muted-foreground"
                          >
                            No pharmacists found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default SupplyChain;
