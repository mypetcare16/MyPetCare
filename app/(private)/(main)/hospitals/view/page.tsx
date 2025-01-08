"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
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
import { toast } from "@/hooks/use-toast";
import { Id } from "@/convex/_generated/dataModel";

export default function ViewHospitals() {
  const hospitals = useQuery(api.hospitals.list);
  const updateHospital = useMutation(api.hospitals.update);
  const deleteHospital = useMutation(api.hospitals.remove);
  const [editingId, setEditingId] = useState<Id<"hospitals"> | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    type: "General" | "Specialized" | "Clinic";
    city: string;
    state: string;
  }>({
    name: "",
    type: "General",
    city: "",
    state: "",
  });

  const handleEdit = (hospital: {
    _id: Id<"hospitals">;
    name: string;
    type: "General" | "Specialized" | "Clinic";
    city: string;
    state: string;
  }) => {
    setEditingId(hospital._id);
    setEditForm({
      name: hospital.name,
      type: hospital.type,
      city: hospital.city,
      state: hospital.state,
    });
  };

  const handleSave = async () => {
    if (!editingId) return;
    try {
      await updateHospital({
        id: editingId,
        ...editForm,
        address: "",
        zipCode: "",
        phoneNumber: "",
        email: "",
        emergencyServices: false,
        specialties: [],
      });
      toast({
        title: "Success",
        description: "Hospital updated successfully.",
      });
      setEditingId(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update hospital.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: Id<"hospitals">) => {
    if (confirm("Are you sure you want to delete this hospital?")) {
      try {
        await deleteHospital({ id });
        toast({
          title: "Hospital Deleted",
          description: "The hospital has been successfully deleted.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "An error occurred while deleting the hospital.",
          variant: "destructive",
        });
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]:
        name === "type"
          ? (value as "General" | "Specialized" | "Clinic")
          : value,
    }));
  };

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">View Hospitals</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>City</TableHead>
            <TableHead>State</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {hospitals?.map((hospital) => (
            <TableRow key={hospital._id}>
              <TableCell>
                {editingId === hospital._id ? (
                  <Input
                    name="name"
                    value={editForm.name}
                    onChange={handleInputChange}
                  />
                ) : (
                  hospital.name
                )}
              </TableCell>
              <TableCell>
                {editingId === hospital._id ? (
                  <select
                    name="type"
                    value={editForm.type}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        type: e.target.value as
                          | "General"
                          | "Specialized"
                          | "Clinic",
                      }))
                    }
                    className="w-full p-2 border rounded"
                  >
                    <option value="General">General</option>
                    <option value="Specialized">Specialized</option>
                    <option value="Clinic">Clinic</option>
                  </select>
                ) : (
                  hospital.type
                )}
              </TableCell>
              <TableCell>
                {editingId === hospital._id ? (
                  <Input
                    name="city"
                    value={editForm.city}
                    onChange={handleInputChange}
                  />
                ) : (
                  hospital.city
                )}
              </TableCell>
              <TableCell>
                {editingId === hospital._id ? (
                  <Input
                    name="state"
                    value={editForm.state}
                    onChange={handleInputChange}
                  />
                ) : (
                  hospital.state
                )}
              </TableCell>
              <TableCell>
                {editingId === hospital._id ? (
                  <Button
                    onClick={handleSave}
                    className="bg-green-500 hover:bg-green-600 text-white mr-2"
                  >
                    Save
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleEdit(hospital)}
                    className="bg-blue-500 hover:bg-blue-600 text-white mr-2"
                  >
                    Edit
                  </Button>
                )}
                <Button
                  onClick={() => handleDelete(hospital._id)}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
