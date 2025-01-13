"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { PatientDetailsModal } from "@/components/PatientDetailsModal";
import { Id } from "@/convex/_generated/dataModel";
import { Patient } from "@/types/patient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import RegisterPatientForm from "../RegisterPatientForm";

export default function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] =
    useState<Id<"patients"> | null>(null);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const { user } = useUser();
  const userId = user?.id || "";

  const hospitalId = useQuery(api.users.getHospitalIdByUserId, { userId });

  const allPatients = useQuery(
    api.patients.getAllPatientsByUserAndHospital,
    hospitalId ? { userId, hospitalId } : "skip"
  );

  useEffect(() => {
    if (allPatients && Array.isArray(allPatients)) {
      const mappedPatients: Patient[] = allPatients.map((patient) => ({
        id: patient._id,
        patientId: patient.patientId?.toString(),
        firstName: patient.firstName || "",
        middleName: patient.middleName,
        lastName: patient.lastName || "",
        phoneNumber: patient.phoneNumber || "",
        email: patient.email,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        houseNo: patient.houseNo,
        gramPanchayat: patient.gramPanchayat,
        village: patient.village,
        tehsil: patient.tehsil,
        district: patient.district,
        state: patient.state,
        systolic: patient.systolic,
        diastolic: patient.diastolic,
        heartRate: patient.heartRate,
        temperature: patient.temperature,
        oxygenSaturation: patient.oxygenSaturation,
        allergies: patient.allergies,
        chronicConditions: patient.chronicConditions,
        pastSurgeries: patient.pastSurgeries,
        familyHistory: patient.familyHistory,
        petName: patient.petName || "",
        petBreed: patient.petBreed,
        petSpecies: patient.petSpecies,
        petAge: patient.petAge,
        petGender: patient.petGender,
        petDob: patient.petDob || "",
        petMicrochipNo: patient.petMicrochipNo,
      }));

      if (searchTerm) {
        const lowercaseSearchTerm = searchTerm.toLowerCase();
        const filteredPatients = mappedPatients.filter(
          (patient) =>
            patient.patientId?.includes(lowercaseSearchTerm) ||
            patient.firstName.toLowerCase().includes(lowercaseSearchTerm) ||
            patient.lastName.toLowerCase().includes(lowercaseSearchTerm) ||
            patient.phoneNumber.includes(searchTerm)
        );
        setSearchResults(filteredPatients);
      } else {
        setSearchResults(mappedPatients);
      }
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, allPatients]);

  const handleViewDetails = (patientId: Id<"patients">) => {
    setSelectedPatientId(patientId);
    setIsPatientModalOpen(true);
  };

  const handleClosePatientModal = () => {
    setIsPatientModalOpen(false);
    setSelectedPatientId(null);
  };

  const handleOpenRegisterModal = () => {
    setIsRegisterModalOpen(true);
  };

  const handleCloseRegisterModal = () => {
    setIsRegisterModalOpen(false);
  };

  return (
    <div className="min-h-screen w-full bg-gray-100 p-6">
      <div className="bg-white rounded-lg shadow-md w-full h-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Search Pet</h2>
          <Button className="bg-blue-500" onClick={handleOpenRegisterModal}>
            <Plus className="mr-2 h-4 w-4 " /> Add New Pet
          </Button>
        </div>
        <div className="space-y-2 mb-6">
          <div className="flex space-x-2">
            <Input
              placeholder="Enter ID, Name, or Phone Number"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow"
            />
            <Button variant="outline" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Results Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-2 text-left text-sm font-medium">ID</th>
                <th className="px-4 py-2 text-left text-sm font-medium">
                  Pet Name
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium">
                  Parent Name
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium">
                  Phone Number
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {searchResults.length > 0 ? (
                searchResults.map((patient) => (
                  <tr key={patient.id.toString()} className="border-b">
                    <td className="px-4 py-2 text-sm">{patient.patientId}</td>
                    <td className="px-4 py-2 text-sm">{patient.petName}</td>
                    <td className="px-4 py-2 text-sm">
                      {`${patient.firstName} ${patient.middleName || ""} ${patient.lastName}`}
                    </td>
                    <td className="px-4 py-2 text-sm">{patient.phoneNumber}</td>
                    <td className="px-4 py-2 text-sm">
                      <Button
                        variant="link"
                        className="text-blue-500 hover:text-blue-700"
                        onClick={() => handleViewDetails(patient.id)}
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-2 text-sm text-center">
                    No Pet found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedPatientId && (
        <PatientDetailsModal
          patientId={selectedPatientId}
          isOpen={isPatientModalOpen}
          onClose={handleClosePatientModal}
        />
      )}

      <Dialog open={isRegisterModalOpen} onOpenChange={setIsRegisterModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Register New Pet</DialogTitle>
          </DialogHeader>
          <RegisterPatientForm onClose={handleCloseRegisterModal} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
