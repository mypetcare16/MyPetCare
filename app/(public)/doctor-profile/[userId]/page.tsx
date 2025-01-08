import { DoctorProfile } from "@/components/doctor-profile";

export default function DoctorProfilePage({
  params,
}: {
  params: { userId: string };
}) {
  return <DoctorProfile userId={params.userId} />;
}
