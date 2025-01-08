import RegisterPatientForm from "@/components/RegisterPatientForm";

export default function RegisterPatient() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
        margin: 0,
        padding: 0,
      }}
    >
      <RegisterPatientForm />
    </div>
  );
}
