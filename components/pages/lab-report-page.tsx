"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusIcon, Eye, XCircle, Loader2, FileIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

type LabReport = {
  _id: string;
  date: string;
  notes: string;
  storageId: string;
  fileUrl?: string | null;
  fileType: "pdf" | "image";
  fileName: string;
  createdAt: number;
};

type NotificationType = {
  message: string;
  type: "success" | "error";
};

interface LabReportPageProps {
  patientId: number | null; // Changed to accept number | null
}

export default function LabReportPage({ patientId }: LabReportPageProps) {
  const reports = useQuery(api.labReports.list);
  const addReport = useMutation(api.labReports.add);
  const generateUploadUrl = useMutation(api.labReports.generateUploadUrl);

  const [isUploading, setIsUploading] = useState(false);
  const [notification, setNotification] = useState<NotificationType | null>(
    null
  );
  const [newReport, setNewReport] = useState<Partial<LabReport>>({
    date: new Date().toISOString().split("T")[0],
    notes: "",
    storageId: "",
    fileType: "pdf",
    fileName: "",
  });
  // Filter reports for the specific patientId
  const filteredReports =
    reports?.filter((report) => report.patientId === String(patientId)) || [];

  // Handle file upload to Convex storage
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const fileType = file.type.startsWith("image/") ? "image" : "pdf";

      // Get upload URL from Convex
      const uploadUrl = await generateUploadUrl();

      // Upload file to Convex storage
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!result.ok) {
        throw new Error("Failed to upload file");
      }

      // Get the storage ID from the response
      const { storageId } = await result.json();

      setNewReport((prev) => ({
        ...prev,
        storageId,
        fileType,
        fileName: file.name,
      }));

      setNotification({
        message: "File uploaded successfully",
        type: "success",
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      setNotification({
        message: "Failed to upload file. Please try again.",
        type: "error",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpload = async () => {
    if (!newReport.notes || !newReport.storageId || patientId === null) return;

    try {
      // Convert patientId to string
      const patientIdAsString = String(patientId);

      await addReport({
        patientId: patientIdAsString,
        date: newReport.date!,
        notes: newReport.notes,
        storageId: newReport.storageId,
        fileType: newReport.fileType!,
        fileName: newReport.fileName!,
      });

      setNewReport({
        date: new Date().toISOString().split("T")[0],
        notes: "",
        storageId: "",
        fileType: "pdf",
        fileName: "",
      });

      setNotification({
        message: "Lab report uploaded successfully",
        type: "success",
      });
    } catch (error) {
      console.error("Error adding report:", error);
      setNotification({
        message: "Failed to add report. Please try again.",
        type: "error",
      });
    }
  };

  const ViewReport = ({ report }: { report: LabReport }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Eye className="mr-2 h-4 w-4" />
          View
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Lab Report</DialogTitle>
          <DialogDescription>
            Date: {new Date(report.date).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>File Name</Label>
            <p className="text-sm text-muted-foreground">{report.fileName}</p>
          </div>
          <div className="grid gap-2">
            <Label>Notes</Label>
            <p className="text-sm text-muted-foreground">{report.notes}</p>
          </div>
          <div className="grid gap-2">
            <Label>Report Content</Label>
            {report.fileUrl ? (
              report.fileType === "pdf" ? (
                <iframe
                  src={report.fileUrl}
                  className="w-full h-[600px] rounded-md border"
                  title="PDF Report"
                />
              ) : (
                <div className="flex items-center justify-center bg-gray-100 rounded-md p-4">
                  <FileIcon className="h-12 w-12 text-gray-400" />
                  <p className="ml-2 text-sm text-gray-600">
                    Image preview not available
                  </p>
                </div>
              )
            ) : (
              <p className="text-sm text-muted-foreground">
                File content not available
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  if (!reports) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-1xl">
          Lab Reports for Patient ID: {patientId}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {notification && (
          <Alert
            className={`mb-4 ${notification.type === "success" ? "bg-green-50" : "bg-red-50"}`}
          >
            <AlertDescription className="flex items-center justify-between">
              <span>{notification.message}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setNotification(null)}
                className="h-auto p-1 hover:bg-transparent"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Upload New Report</h3>
          <div className="grid gap-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={newReport.date}
                onChange={(e) =>
                  setNewReport((prev) => ({ ...prev, date: e.target.value }))
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <Textarea
                id="notes"
                value={newReport.notes}
                onChange={(e) =>
                  setNewReport((prev) => ({ ...prev, notes: e.target.value }))
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="file" className="text-right">
                File
              </Label>
              <div className="col-span-3">
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,image/*"
                  disabled={isUploading}
                />
                {isUploading && (
                  <p className="text-sm text-muted-foreground">Uploading...</p>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-4">
              <Button variant="outline" onClick={handleUpload}>
                Upload Report
              </Button>
            </div>
          </div>
        </div>

        <ScrollArea>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>File</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <TableRow key={report._id}>
                    <TableCell>{report.date}</TableCell>
                    <TableCell>{report.notes}</TableCell>
                    <TableCell>{report.fileName}</TableCell>
                    <TableCell>
                      <ViewReport report={report} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4}>
                    No reports available for this patient
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
