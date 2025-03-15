import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Search, MapPin, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import ManufacturerNavbar from "@/components/shared/NavBar/ManufacturerNavbar";

interface Distributor {
  id: string;
  name: string;
  location: string;
  status: 'active' | 'inactive';
}

interface BatchStatistics {
  totalBatches: number;
  revertedBatches: number;
  transferringBatches: number;
  transferredBatches: number;
}

const SupplyChain: React.FC = () => {
  const [selectedDistributor, setSelectedDistributor] = useState<string>("");
  const [distributionMode, setDistributionMode] = useState<'direct' | 'fixed'>('direct');
  const [distributors, setDistributors] = useState<Distributor[]>([]);
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
  const [pharmacistSearchQuery, setPharmacistSearchQuery] = useState<string>("");
  const [pharmacists, setPharmacists] = useState<Array<{ id: string; name: string; location: string; status: 'active' | 'inactive' }>>([]);

  // Mock data - Replace with actual API calls
  useEffect(() => {
    // Fetch distributors
    setDistributors([
      { id: '1', name: 'Distributor A', location: 'Mumbai', status: 'active' },
      { id: '2', name: 'Distributor B', location: 'Delhi', status: 'active' },
      { id: '3', name: 'Distributor C', location: 'Bangalore', status: 'inactive' },
    ]);

    // Fetch pharmacists
    setPharmacists([
      { id: '1', name: 'Pharmacist A', location: 'Mumbai', status: 'active' },
      { id: '2', name: 'Pharmacist B', location: 'Delhi', status: 'active' },
      { id: '3', name: 'Pharmacist C', location: 'Bangalore', status: 'inactive' },
    ]);

    // Fetch batch statistics
    setBatchStats({
      totalBatches: 100,
      revertedBatches: 5,
      transferringBatches: 10,
      transferredBatches: 85,
    });
  }, []);

  const handleDistributorChange = (value: string) => {
    setSelectedDistributor(value);
  };

  const handleModeChange = (value: 'direct' | 'fixed') => {
    setDistributionMode(value);
  };

  const handleNameSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameSearchQuery(e.target.value.toLowerCase());
  };

  const handleLocationSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocationSearchQuery(e.target.value.toLowerCase());
  };

  const handlePharmacistSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPharmacistSearchQuery(e.target.value.toLowerCase());
  };

  const handlePharmacistChange = (value: string) => {
    setSelectedPharmacist(value);
  };

  const filteredDistributors = distributors.filter((distributor) => {
    const nameMatch = distributor.name.toLowerCase().includes(nameSearchQuery.toLowerCase());
    const locationMatch = distributor.location.toLowerCase().includes(locationSearchQuery.toLowerCase());
    const statusMatch = selectedStatus === "all" || distributor.status === selectedStatus;
    return nameMatch && locationMatch && statusMatch;
  });

  const filteredPharmacists = pharmacists.filter((pharmacist) => {
    return pharmacist.name.toLowerCase().includes(pharmacistSearchQuery.toLowerCase());
  });

  return (
    <>
      <ManufacturerNavbar />
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gradient">Supply Chain Management</h1>
          <p className="text-muted-foreground">
            Manage your distribution channels and track batch transfers
          </p>
        </div>

        {/* Batch Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Batches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{batchStats.totalBatches}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reverted Batches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{batchStats.revertedBatches}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transferring</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{batchStats.transferringBatches}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transferred</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{batchStats.transferredBatches}</div>
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
                  variant={distributionMode === 'direct' ? 'default' : 'outline'}
                  onClick={() => handleModeChange('direct')}
                >
                  Direct Distribution
                </Button>
                <Button
                  variant={distributionMode === 'fixed' ? 'default' : 'outline'}
                  onClick={() => handleModeChange('fixed')}
                >
                  Fixed Distributor
                </Button>
              </div>

              <div className="space-y-2">
                {distributionMode === 'direct' ? (
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
                                selectedDistributor === dist.id && "bg-muted"
                              )}
                              onClick={() => handleDistributorChange(dist.id)}
                            >
                              <span>{dist.name}</span>
                              <Badge variant={dist.status === 'active' ? 'default' : 'secondary'}>
                                {dist.location}
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
                          {distributors.find(d => d.id === selectedDistributor)?.name}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {distributionMode === 'fixed' && (
                    <div>
                      {pharmacistSearchQuery && (
                        <div className="border rounded-md max-h-[200px] overflow-y-auto bg-white">
                          {filteredPharmacists.length > 0 ? (
                            filteredPharmacists.map((pharm) => (
                              <button
                                key={pharm.id}
                                className={cn(
                                  "w-full px-4 py-2 text-left hover:bg-muted/50 flex items-center justify-between",
                                  selectedPharmacist === pharm.id && "bg-muted"
                                )}
                                onClick={() => handlePharmacistChange(pharm.id)}
                              >
                                <span>{pharm.name}</span>
                                <Badge variant={pharm.status === 'active' ? 'default' : 'secondary'}>
                                  {pharm.location}
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
                            {pharmacists.find(p => p.id === selectedPharmacist)?.name}
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}
                </div>
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
                      {startDate ? format(startDate, "dd-MM-yyyy") : "Start date"}
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
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
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
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDistributors.map((distributor) => (
                  <TableRow key={distributor.id}>
                    <TableCell>{distributor.name}</TableCell>
                    <TableCell>{distributor.location}</TableCell>
                    <TableCell>
                      <Badge variant={distributor.status === 'active' ? 'default' : 'secondary'}>
                        {distributor.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredDistributors.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                      No distributors found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default SupplyChain; 