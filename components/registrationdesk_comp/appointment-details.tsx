import { format, parse } from "date-fns";

interface Appointment {
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  service?: string;
  isTeleconsultation: boolean;
  speciality?: string;
  referredBy?: string;
  location?: string;
  notes?: string;
  reasonForVisit?: string;
  insuranceDetails?: string;
}

interface AppointmentDetailsProps {
  appointment: Appointment | null;
}

export default function AppointmentDetails({
  appointment,
}: AppointmentDetailsProps) {
  if (!appointment) return <div>No appointment details available.</div>;

  const formatAppointmentTime = (timeString: string) => {
    const [startTime, endTime] = timeString.split(" - ");
    const parsedStartTime = parse(startTime, "hh:mm a", new Date());
    const parsedEndTime = parse(endTime, "hh:mm a", new Date());
    return `${format(parsedStartTime, "h:mm a")} - ${format(parsedEndTime, "h:mm a")}`;
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Appointment Details</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold">Date & Time</h3>
          <p>{format(new Date(appointment.appointmentDate), "MMMM d, yyyy")}</p>
          <p>{formatAppointmentTime(appointment.appointmentTime)}</p>
        </div>
        <div>
          <h3 className="font-semibold">Status</h3>
          <p>{appointment.status}</p>
        </div>
        <div>
          <h3 className="font-semibold">Service</h3>
          <p>{appointment.service || "N/A"}</p>
        </div>
        <div>
          <h3 className="font-semibold">Type</h3>
          <p>
            {appointment.isTeleconsultation ? "Teleconsultation" : "In-person"}
          </p>
        </div>
        {appointment.speciality && (
          <div>
            <h3 className="font-semibold">Speciality</h3>
            <p>{appointment.speciality}</p>
          </div>
        )}
        {appointment.referredBy && (
          <div>
            <h3 className="font-semibold">Referred By</h3>
            <p>{appointment.referredBy}</p>
          </div>
        )}
        {appointment.location && (
          <div>
            <h3 className="font-semibold">Location</h3>
            <p>{appointment.location}</p>
          </div>
        )}
        {appointment.notes && (
          <div className="col-span-2">
            <h3 className="font-semibold">Notes</h3>
            <p>{appointment.notes}</p>
          </div>
        )}
        {appointment.reasonForVisit && (
          <div className="col-span-2">
            <h3 className="font-semibold">Reason for Visit</h3>
            <p>{appointment.reasonForVisit}</p>
          </div>
        )}
        {appointment.insuranceDetails && (
          <div className="col-span-2">
            <h3 className="font-semibold">Insurance Details</h3>
            <p>{appointment.insuranceDetails}</p>
          </div>
        )}
      </div>
    </div>
  );
}
