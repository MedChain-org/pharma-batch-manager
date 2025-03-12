import React, { useState, useEffect } from "react";
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
import { QrCode, Download, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Drug } from "@/types/database";
import { fetchDrugsByManufacturer } from "@/lib/database";
import * as QRCodeLib from "qrcode";
import ManufacturerNavbar from "@/components/shared/NavBar/ManufacturerNavbar";

const GenerateQR: React.FC = () => {
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingQR, setGeneratingQR] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadDrugs();
    }
  }, [user]);

  const loadDrugs = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const drugsData = await fetchDrugsByManufacturer(user.id);
      setDrugs(drugsData);
    } catch (error) {
      console.error("Error loading drugs:", error);
      toast({
        title: "Error",
        description: "Failed to load drug batches. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async (drug: Drug) => {
    setGeneratingQR(drug.drug_id);
    try {
      // Create QR code data with drug information
      const qrData = {
        drug_id: drug.drug_id,
        name: drug.name,
        manufacturer: drug.manufacturer,
        batch_number: drug.batch_number,
        manufacture_date: drug.manufacture_date,
        expiry_date: drug.expiry_date,
        blockchain_tx_id: drug.blockchain_tx_id,
      };

      // Generate QR code as data URL
      const qrCodeDataUrl = await QRCodeLib.toDataURL(JSON.stringify(qrData), {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });

      // Create download link
      const link = document.createElement("a");
      link.href = qrCodeDataUrl;
      link.download = `qr-${drug.name}-${drug.batch_number}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "QR Code Generated",
        description: "QR code has been generated and downloaded successfully.",
      });
    } catch (error) {
      console.error("Error generating QR code:", error);
      toast({
        title: "Error",
        description: "Failed to generate QR code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGeneratingQR(null);
    }
  };

  return (
    <>
      <ManufacturerNavbar />
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gradient">
            Generate QR Codes
          </h1>
          <p className="text-muted-foreground">
            Generate QR codes for your drug batches for authentication and
            tracking
          </p>
        </div>

        <Card className="glass-card">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-xl">
            <CardTitle className="flex items-center gap-2">
              <QrCode size={18} />
              Drug Batches
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
              </div>
            ) : drugs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No drug batches found. Add some batches to generate QR codes.
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Batch Number</TableHead>
                      <TableHead>Manufacture Date</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Blockchain Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {drugs.map((drug) => (
                      <TableRow key={drug.drug_id}>
                        <TableCell className="font-medium">
                          {drug.name}
                        </TableCell>
                        <TableCell>{drug.batch_number}</TableCell>
                        <TableCell>
                          {new Date(drug.manufacture_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {new Date(drug.expiry_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              drug.blockchain_tx_id === "pending"
                                ? "outline"
                                : drug.blockchain_tx_id
                                ? "default"
                                : "destructive"
                            }
                          >
                            {drug.blockchain_tx_id === "pending"
                              ? "Pending"
                              : drug.blockchain_tx_id
                              ? "Verified"
                              : "Not Verified"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generateQRCode(drug)}
                            disabled={
                              generatingQR === drug.drug_id ||
                              !drug.blockchain_tx_id ||
                              drug.blockchain_tx_id === "pending"
                            }
                          >
                            {generatingQR === drug.drug_id ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Download className="mr-2 h-4 w-4" />
                                Generate QR
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default GenerateQR;
