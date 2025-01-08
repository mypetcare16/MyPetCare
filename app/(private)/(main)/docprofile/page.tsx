"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Check,
  ChevronRight,
  Hospital,
  Upload,
  UserCircle,
  Stethoscope,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface UserData {
  _id?: string;
  _creationTime?: number;
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  role?: "Doctor" | "Patient" | "Desk" | "Admin";
  phone?: string;
  specialization?: string;
  licenseNumber?: string;
  yearsOfPractice?: number;
  practiceType?: "Private" | "Hospital" | "Clinic";
  bio?: string;
  clinicName?: string;
  logo?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  website?: string;
  hospitalId?: string;
  stateRegistrationNumber?: string;
  nmcRegistrationId?: string;
  licenseExpiryDate?: string;
  certificateStorageId?: string;
  signatureStorageId?: string;
}

export default function DoctorProfileUpdate() {
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const router = useRouter();

  const user = useQuery(api.users.currentUser);
  const updateUser = useMutation(api.users.updateUser);
  const generateUploadUrl = useMutation(api.labReports.generateUploadUrl);
  const generateFileUrl = useMutation(api.prescriptions.generateFileUrl);

  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fileUrls, setFileUrls] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (user) {
      setUserData(user);
      fetchFileUrls(user);
    }
  }, [user]);

  const fetchFileUrls = async (userData: UserData) => {
    const urlPromises = [
      userData.profileImageUrl &&
        generateFileUrl({ storageId: userData.profileImageUrl }),
      userData.logo && generateFileUrl({ storageId: userData.logo }),
      userData.certificateStorageId &&
        generateFileUrl({ storageId: userData.certificateStorageId }),
      userData.signatureStorageId &&
        generateFileUrl({ storageId: userData.signatureStorageId }),
    ];

    const [profileImageUrl, logoUrl, certificateUrl, signatureUrl] =
      await Promise.all(urlPromises);

    setFileUrls({
      profileImageUrl: profileImageUrl || "",
      logo: logoUrl || "",
      certificateStorageId: certificateUrl || "",
      signatureStorageId: signatureUrl || "",
    });
  };

  const handleInputChange = (
    field: keyof UserData,
    value: string | number | undefined
  ) => {
    setUserData((prev) => {
      if (!prev) return null;
      if (field === "practiceType") {
        const practiceType = value as UserData["practiceType"];
        return practiceType ? { ...prev, [field]: practiceType } : prev;
      }
      return { ...prev, [field]: value };
    });
  };

  const handleFileUpload = async (
    field:
      | "profileImageUrl"
      | "logo"
      | "certificateStorageId"
      | "signatureStorageId",
    file: File
  ) => {
    setIsUploading(true);
    try {
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

      // Update the userData state with the new storageId
      handleInputChange(field, storageId);

      // Fetch and update the file URL
      const fileUrl = await generateFileUrl({ storageId });
      setFileUrls((prev) => ({ ...prev, [field]: fileUrl }));

      toast({
        title: "Success",
        description: `${fileType === "image" ? "Image" : "File"} uploaded successfully.`,
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Error",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!userData) return;

    setIsLoading(true);
    try {
      // Remove fields that are not in the mutation args
      const { _id, _creationTime, email, role, ...updateData } = userData;

      // Remove any undefined values
      const cleanedUpdateData = Object.fromEntries(
        Object.entries(updateData).filter(([_, v]) => v !== undefined)
      );

      await updateUser(cleanedUpdateData as unknown as UserData);
      toast({
        title: "Success",
        description: "Your profile has been updated successfully.",
      });
      setStep(4); // Move to completion step
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadVideos = () => {
    router.push("/videospage");
  };

  if (!userData) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="relative min-h-screen top-10">
      <div className="max-w-7xl mx-auto">
        <Button
          className="absolute top-4 right-4 bg-blue-600"
          onClick={handleUploadVideos}
        >
          Upload Videos
        </Button>
        <div className="mb-8">
          <div className="flex justify-center space-x-8">
            {[
              { icon: UserCircle, label: "Personal Info" },
              { icon: Stethoscope, label: "Professional Info" },
              { icon: Hospital, label: "Practice Info" },
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    step > index ? "bg-blue-600 text-white" : "bg-gray-200"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                </div>
                <span className="mt-2 text-sm">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <Card className="border-0 shadow-lg">
          {step === 1 && (
            <>
              <CardHeader className="w-screen">
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Please provide your basic contact information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={userData.firstName || ""}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={userData.lastName || ""}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userData.email}
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={userData.phone || ""}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2 col-span-1 md:col-span-2 lg:col-span-3">
                    <Label htmlFor="profileImageUrl">Profile Picture</Label>
                    <div className="flex items-center space-x-4">
                      {fileUrls.profileImageUrl && (
                        <img
                          src={fileUrls.profileImageUrl}
                          alt="Profile"
                          className="h-16 w-16 rounded-full object-cover"
                        />
                      )}
                      <Label
                        htmlFor="profileImageUrl"
                        className="flex cursor-pointer items-center space-x-2 rounded-md border border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                      >
                        <Upload className="h-4 w-4" />
                        <span>Upload Picture</span>
                        <Input
                          id="profileImageUrl"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) =>
                            e.target.files &&
                            handleFileUpload(
                              "profileImageUrl",
                              e.target.files[0]
                            )
                          }
                        />
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {step === 2 && (
            <>
              <CardHeader className="w-screen">
                <CardTitle>Professional Information</CardTitle>
                <CardDescription>
                  Tell us about your medical practice and credentials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="specialization">Specialization</Label>
                    <Input
                      id="specialization"
                      value={userData.specialization || ""}
                      onChange={(e) =>
                        handleInputChange("specialization", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber">
                      Medical License Number
                    </Label>
                    <Input
                      id="licenseNumber"
                      value={userData.licenseNumber || ""}
                      onChange={(e) =>
                        handleInputChange("licenseNumber", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="yearsOfPractice">Years of Practice</Label>
                    <Input
                      id="yearsOfPractice"
                      type="number"
                      value={userData.yearsOfPractice || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "yearsOfPractice",
                          parseInt(e.target.value)
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Practice Type</Label>
                    <RadioGroup
                      value={userData.practiceType || ""}
                      onValueChange={(value) =>
                        handleInputChange(
                          "practiceType",
                          value as UserData["practiceType"]
                        )
                      }
                    >
                      <div className="flex space-x-4">
                        {["Private", "Hospital", "Clinic"].map((type) => (
                          <div
                            key={type}
                            className="flex items-center space-x-2"
                          >
                            <RadioGroupItem
                              value={type}
                              id={type.toLowerCase()}
                            />
                            <Label htmlFor={type.toLowerCase()}>{type}</Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stateRegistrationNumber">
                      State Medical Council Registration No.
                    </Label>
                    <Input
                      id="stateRegistrationNumber"
                      value={userData.stateRegistrationNumber || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "stateRegistrationNumber",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nmcRegistrationId">
                      NMC Registration ID
                    </Label>
                    <Input
                      id="nmcRegistrationId"
                      value={userData.nmcRegistrationId || ""}
                      onChange={(e) =>
                        handleInputChange("nmcRegistrationId", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="licenseExpiryDate">
                      License Expiry Date
                    </Label>
                    <Input
                      id="licenseExpiryDate"
                      type="date"
                      value={userData.licenseExpiryDate || ""}
                      onChange={(e) =>
                        handleInputChange("licenseExpiryDate", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2 col-span-1 md:col-span-2 lg:col-span-3">
                    <Label htmlFor="certificateStorageId">
                      Upload Your Certificate
                    </Label>
                    <div className="flex items-center space-x-4">
                      {fileUrls.certificateStorageId && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            window.open(fileUrls.certificateStorageId, "_blank")
                          }
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Certificate
                        </Button>
                      )}
                      <Label
                        htmlFor="certificateStorageId"
                        className="flex cursor-pointer items-center space-x-2 rounded-md border border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                      >
                        <Upload className="h-4 w-4" />
                        <span>
                          {isUploading ? "Uploading..." : "Upload Certificate"}
                        </span>
                        <Input
                          id="certificateStorageId"
                          type="file"
                          className="hidden"
                          accept=".pdf,image/*"
                          onChange={(e) =>
                            e.target.files &&
                            handleFileUpload(
                              "certificateStorageId",
                              e.target.files[0]
                            )
                          }
                          disabled={isUploading}
                        />
                      </Label>
                    </div>
                  </div>
                  <div className="space-y-2 col-span-1 md:col-span-2 lg:col-span-3">
                    <Label htmlFor="signatureStorageId">
                      Upload Your Signature
                    </Label>
                    <div className="flex items-center space-x-4">
                      {fileUrls.signatureStorageId && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            window.open(fileUrls.signatureStorageId, "_blank")
                          }
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Signature
                        </Button>
                      )}
                      <Label
                        htmlFor="signatureStorageId"
                        className="flex cursor-pointer items-center space-x-2 rounded-md border border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                      >
                        <Upload className="h-4 w-4" />
                        <span>
                          {isUploading ? "Uploading..." : "Upload Signature"}
                        </span>
                        <Input
                          id="signatureStorageId"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) =>
                            e.target.files &&
                            handleFileUpload(
                              "signatureStorageId",
                              e.target.files[0]
                            )
                          }
                          disabled={isUploading}
                        />
                      </Label>
                    </div>
                  </div>
                  <div className="space-y-2 col-span-1 md:col-span-2 lg:col-span-3">
                    <Label htmlFor="bio">Professional Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell us about your experience and expertise..."
                      value={userData.bio || ""}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      className="h-32"
                    />
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {step === 3 && (
            <>
              <CardHeader className="w-screen">
                <CardTitle>Practice Information</CardTitle>
                <CardDescription>
                  Enter your practice location details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="clinicName">Clinic/Hospital Name</Label>
                    <Input
                      id="clinicName"
                      value={userData.clinicName || ""}
                      onChange={(e) =>
                        handleInputChange("clinicName", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2 col-span-1 md:col-span-2 lg:col-span-3">
                    <Label htmlFor="logo">Practice Logo</Label>
                    <div className="flex items-center space-x-4">
                      {fileUrls.logo && (
                        <img
                          src={fileUrls.logo}
                          alt="Logo"
                          className="h-16 w-16 rounded object-contain"
                        />
                      )}
                      <Label
                        htmlFor="logo"
                        className="flex cursor-pointer items-center space-x-2 rounded-md border border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                      >
                        <Upload className="h-4 w-4" />
                        <span>Upload Logo</span>
                        <Input
                          id="logo"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) =>
                            e.target.files &&
                            handleFileUpload("logo", e.target.files[0])
                          }
                        />
                      </Label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      value={userData.address || ""}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={userData.city || ""}
                      onChange={(e) =>
                        handleInputChange("city", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={userData.state || ""}
                      onChange={(e) =>
                        handleInputChange("state", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={userData.zipCode || ""}
                      onChange={(e) =>
                        handleInputChange("zipCode", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Practice Website</Label>
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://"
                      value={userData.website || ""}
                      onChange={(e) =>
                        handleInputChange("website", e.target.value)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {step === 4 && (
            <>
              <CardHeader className="w-screen">
                <CardTitle>All Set!</CardTitle>
                <CardDescription>
                  Your profile has been updated successfully
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <div className="mb-4 rounded-full bg-green-100 p-3">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Profile Updated</h3>
                <p className="text-center text-muted-foreground">
                  Your profile information has been successfully updated.
                </p>
              </CardContent>
            </>
          )}

          <CardFooter className="flex justify-between">
            {step > 1 && step < 4 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            )}
            {step < 3 ? (
              <Button
                className="ml-auto bg-blue-600"
                onClick={() => setStep(step + 1)}
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : step === 3 ? (
              <Button
                className="ml-auto bg-blue-600"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? "Updating..." : "Update Profile"}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                className="ml-auto bg-blue-600"
                onClick={() => (window.location.href = "/dashboard")}
              >
                Go to Dashboard
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
