"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, Plus, X, FileText } from "lucide-react";
import { format } from "date-fns";
import { Id } from "@/convex/_generated/dataModel";
import { jsPDF } from "jspdf";

interface BillingPageProps {
  patientId: number;
}

interface BillItem {
  name: string;
  cost: number;
}

interface Bill {
  _id: Id<"bills">;
  billNumber: string;
  date: string;
  items: BillItem[];
  total: number;
  pdfStorageId?: string;
}

interface UserDetails {
  clinicName?: string;
  address?: string;
  phone?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  specialization?: string;
  licenseNumber?: string;
  stateRegistrationNumber?: string;
  logo?: string;
}

export default function BillingPage({ patientId }: BillingPageProps) {
  const { user } = useUser();
  const doctorId = user?.id;

  const bills = useQuery(api.bills.getBillsForPatient, {
    patientId: patientId.toString(),
  });
  const createBill = useMutation(api.bills.createBill);
  const updateBillPdf = useMutation(api.bills.updateBillPdf);
  const generateUploadUrl = useMutation(api.bills.generateUploadUrl);
  const getFileUrl = useMutation(api.bills.getFileUrl);
  const generateFileUrl = useMutation(api.bills.getFileUrl);

  const [newItems, setNewItems] = useState<BillItem[]>([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemCost, setNewItemCost] = useState("");
  const [newBillId, setNewBillId] = useState<Id<"bills"> | null>(null);

  const newBill = useQuery(
    api.bills.getBillById,
    newBillId ? { billId: newBillId } : "skip"
  );

  const userDetails = useQuery(api.users.getUserDetails, {
    userId: doctorId ?? "",
  });

  const handleAddItem = () => {
    if (newItemName && newItemCost) {
      setNewItems([
        ...newItems,
        { name: newItemName, cost: parseFloat(newItemCost) },
      ]);
      setNewItemName("");
      setNewItemCost("");
    }
  };

  const handleRemoveItem = (index: number) => {
    setNewItems(newItems.filter((_, i) => i !== index));
  };

  const generatePDF = async (bill: Bill) => {
    const doc = new jsPDF();
    const margin = 10;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const lineHeight = 7;
    let yPos = 30;

    const details: UserDetails = userDetails ?? {};
    const clinicName = details.clinicName || "HealthCare Clinic";
    const clinicAddress =
      details.address || "123 Medical Street, Healthville, HC 12345";
    const clinicPhone = details.phone || "+1 (555) 123-4567";
    const clinicEmail = details.email || "info@healthcareclinic.com";

    const doctorName =
      details.firstName && details.lastName
        ? `Dr. ${details.firstName} ${details.lastName}`
        : "Dr. Jane Smith";
    const doctorSpecialty = details.specialization || "General Practitioner";
    const doctorLicense = details.licenseNumber
      ? `License No: ${details.licenseNumber}`
      : "License No: MD12345";
    const RegistrationNumber =
      details.stateRegistrationNumber || "General Practitioner";

    const addHeader = async () => {
      doc.setFillColor(240, 240, 240);
      doc.rect(0, 0, pageWidth, 25, "F");

      let logoWidth = 0;
      let logoHeight = 0;
      let textStartX = margin;

      if (details.logo) {
        try {
          const logoUrl = await generateFileUrl({
            storageId: details.logo,
          });
          if (logoUrl) {
            const img = new Image();
            img.crossOrigin = "anonymous";
            await new Promise<void>((resolve, reject) => {
              img.onload = () => resolve();
              img.onerror = reject;
              img.src = logoUrl;
            });

            const aspectRatio = img.width / img.height;
            logoHeight = 20;
            logoWidth = logoHeight * aspectRatio;

            doc.addImage(img, "PNG", margin, 2.5, logoWidth, logoHeight);
            textStartX = margin + logoWidth + 5;
          }
        } catch (error) {
          console.error("Error loading logo:", error);
        }
      }

      const availableWidth = pageWidth - textStartX - margin;

      doc.setTextColor(0, 0, 0);

      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(clinicName, textStartX + availableWidth / 2, 8, {
        align: "center",
      });

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(clinicAddress, textStartX + availableWidth / 2, 14, {
        align: "center",
      });

      doc.setFontSize(8);
      doc.text(
        `Phone: ${clinicPhone} | Email: ${clinicEmail}`,
        textStartX + availableWidth / 2,
        20,
        { align: "center" }
      );

      doc.setDrawColor(0);
      doc.line(margin, 25, pageWidth - margin, 25);
      yPos = 35;
    };

    const addText = (text: string, indent = 0, bold = false, fontSize = 12) => {
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setFontSize(fontSize);
      const lines = doc.splitTextToSize(text, pageWidth - margin * 2 - indent);
      lines.forEach((line: string) => {
        if (yPos > pageHeight - margin * 2 - 30) addNewPage();
        doc.text(line, margin + indent, yPos);
        yPos += lineHeight;
      });
    };

    const addSection = (title: string, content: string) => {
      if (yPos + lineHeight * 3 > pageHeight - margin * 2 - 30) addNewPage();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(33, 150, 243);
      doc.text(`• ${title}`, margin, yPos);
      yPos += lineHeight;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      addText(content, 10);
      yPos += 5;
    };

    const addFooter = (pageNo: number, totalPages: number) => {
      const footerY = pageHeight - margin - 20;
      doc.setFillColor(240, 240, 240);
      doc.rect(0, footerY - 5, pageWidth, 25, "F");
      doc.setFontSize(9);
      doc.text(doctorName, margin, footerY);
      doc.text(doctorSpecialty, margin, footerY + 5);
      doc.text(doctorLicense, margin, footerY + 10);
      doc.text(RegistrationNumber, margin, footerY + 15);

      doc.text(
        `Page ${pageNo} of ${totalPages}`,
        pageWidth - margin,
        footerY + 10,
        { align: "right" }
      );
      doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
    };

    const addNewPage = () => {
      doc.addPage();
      yPos = 30;
      addHeader();
    };

    await addHeader();

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Bill", pageWidth / 2, yPos, { align: "center" });
    yPos += lineHeight * 2;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Bill Number: ${bill.billNumber}`, margin, yPos);
    yPos += lineHeight;
    doc.text(`Date: ${format(new Date(bill.date), "PPP")}`, margin, yPos);
    yPos += lineHeight * 2;

    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPos, pageWidth - margin * 2, 10, "F");
    doc.setFont("helvetica", "bold");
    doc.text("Item", margin + 5, yPos + 7);
    doc.text("Cost", pageWidth - margin - 30, yPos + 7);
    yPos += 15;

    doc.setFont("helvetica", "normal");
    bill.items.forEach((item) => {
      doc.text(item.name, margin + 5, yPos);
      doc.text(`₹${item.cost.toFixed(2)}`, pageWidth - margin - 30, yPos, {
        align: "right",
      });
      yPos += 10;
      if (yPos > pageHeight - 40) addNewPage();
    });

    yPos += 5;
    doc.setFont("helvetica", "bold");
    doc.text("Total:", margin + 5, yPos);
    doc.text(`₹${bill.total.toFixed(2)}`, pageWidth - margin - 30, yPos, {
      align: "right",
    });

    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      addFooter(i, totalPages);
    }

    return doc.output("blob");
  };

  const handleCreateBill = async () => {
    if (newItems.length > 0 && doctorId) {
      const createdBillId = await createBill({
        userId: doctorId,
        patientId: patientId.toString(),
        items: newItems,
      });

      setNewBillId(createdBillId);
    }
  };

  useEffect(() => {
    const generateAndUploadPDF = async () => {
      if (newBill) {
        const pdfBlob = await generatePDF(newBill);

        const uploadUrl = await generateUploadUrl();

        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/pdf",
          },
          body: pdfBlob,
        });

        if (!result.ok) {
          throw new Error("Failed to upload file");
        }

        const { storageId } = await result.json();

        await updateBillPdf({ billId: newBill._id, pdfStorageId: storageId });

        setNewItems([]);
        setNewBillId(null);
      }
    };

    if (newBill) {
      generateAndUploadPDF();
    }
  }, [newBill]);

  const handleViewBill = async (bill: Bill) => {
    if (bill.pdfStorageId) {
      const url = await getFileUrl({ storageId: bill.pdfStorageId });
      if (url) {
        window.open(url, "_blank");
      }
    } else {
      console.error("PDF not found for this bill");
    }
  };

  if (!user) {
    return <div>Loading user information...</div>;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Billing</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Create New Bill</h3>
          <div className="flex space-x-2 mb-2">
            <Input
              placeholder="Item name"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Cost"
              value={newItemCost}
              onChange={(e) => setNewItemCost(e.target.value)}
            />
            <Button
              className="bg-blue-500 hover:bg-blue-600"
              onClick={handleAddItem}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {newItems.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>₹{item.cost.toFixed(2)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button
            onClick={handleCreateBill}
            className="mt-2 bg-blue-500 hover:bg-blue-600 text-white"
          >
            Create Bill
          </Button>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Previous Bills</h3>
          <ScrollArea className="h-[300px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bill Number</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bills?.map((bill) => (
                  <TableRow key={bill._id}>
                    <TableCell>{bill.billNumber}</TableCell>
                    <TableCell>{format(new Date(bill.date), "PPP")}</TableCell>
                    <TableCell>₹{bill.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewBill(bill)}
                      >
                        <FileText className="mr-2 h-4 w-4" /> View PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
