"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { PatientDetailsModal } from "@/components/PatientDetailsModal";
import { Id } from "@/convex/_generated/dataModel";
import { Patient } from "@/types/patient";

export default function PatientSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] =
    useState<Id<"patients"> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
        ...patient,
        id: patient._id,
      }));

      if (searchTerm) {
        const lowercaseSearchTerm = searchTerm.toLowerCase();
        const filteredPatients = mappedPatients.filter(
          (patient) =>
            patient.patientId?.toString().includes(lowercaseSearchTerm) ||
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
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPatientId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto mt-10 px-4 py-1 w-screen">
        <div className="rounded-lg bg-white p-6 shadow-sm mb-9">
          <div className="space-y-2 mb-6">
            <label className="text-lg font-medium">Search Patients</label>
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
                  <th className="px-4 py-2 text-left text-sm font-medium">
                    ID
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium">
                    Name
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
                      <td className="px-4 py-2 text-sm">
                        {patient.patientId?.toString()}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {`${patient.firstName} ${patient.middleName || ""} ${patient.lastName}`}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {patient.phoneNumber}
                      </td>
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
                    <td colSpan={4} className="px-4 py-2 text-sm text-center">
                      No patients found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      {selectedPatientId && (
        <PatientDetailsModal
          patientId={selectedPatientId}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
