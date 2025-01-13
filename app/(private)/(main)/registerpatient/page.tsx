import RegisterPatientForm from "@/components/RegisterPatientForm";
import SearchComponent from "@/components/registrationdesk_comp/SearchComponent";

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
      <SearchComponent />
      {/* <RegisterPatientForm /> */}
    </div>
  );
}
