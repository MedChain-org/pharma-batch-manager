import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ManufacturerNavbar from "@/components/shared/NavBar/ManufacturerNavbar";

interface DrugBatch {
  id: string;
  name: string;
  batchNumber: string;
  manufacturingDate: string;
  expiryDate: string;
  quantity: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

const DrugBatches = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Sample data - replace with actual data from your backend
  const drugBatches: DrugBatch[] = [
    {
      id: '1',
      name: 'Paracetamol',
      batchNumber: 'PCM2024001',
      manufacturingDate: '2024-01-15',
      expiryDate: '2026-01-15',
      quantity: 10000,
      status: 'In Stock',
    },
    {
      id: '2',
      name: 'Amoxicillin',
      batchNumber: 'AMX2024002',
      manufacturingDate: '2024-02-01',
      expiryDate: '2025-02-01',
      quantity: 500,
      status: 'Low Stock',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock':
        return 'bg-green-100 text-green-800';
      case 'Low Stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'Out of Stock':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <ManufacturerNavbar />
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Drug Batches</h1>
        </div>

        <Card className="rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-xl">
            <CardTitle>Batch Management</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 mb-6">
              <Input
                placeholder="Search batches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm rounded-lg"
              />
            </div>

            <div className="rounded-xl overflow-hidden border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="rounded-tl-lg">Batch Number</TableHead>
                    <TableHead>Drug Name</TableHead>
                    <TableHead>Manufacturing Date</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead className="rounded-tr-lg">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {drugBatches.map((batch, index) => (
                    <TableRow 
                      key={batch.id}
                      className={index === drugBatches.length - 1 ? "last:rounded-b-lg" : ""}
                    >
                      <TableCell className="font-medium">{batch.batchNumber}</TableCell>
                      <TableCell>{batch.name}</TableCell>
                      <TableCell>{batch.manufacturingDate}</TableCell>
                      <TableCell>{batch.expiryDate}</TableCell>
                      <TableCell>{batch.quantity}</TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(batch.status)} rounded-lg px-3 py-1`}>
                          {batch.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default DrugBatches; 