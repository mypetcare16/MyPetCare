"use client";

const WATI_API_URL = "https://live-mt-server.wati.io/320742";
const WATI_API_TOKEN = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwYmI2NTg2Yi1lYmFjLTQzMzctOWU4ZS04ZjE1YjY1MTRjM2UiLCJ1bmlxdWVfbmFtZSI6Im15bWVkaXJlY29yZHNAZ21haWwuY29tIiwibmFtZWlkIjoibXltZWRpcmVjb3Jkc0BnbWFpbC5jb20iLCJlbWFpbCI6Im15bWVkaXJlY29yZHNAZ21haWwuY29tIiwiYXV0aF90aW1lIjoiMTAvMjUvMjAyNCAxNDowMzo0OSIsInRlbmFudF9pZCI6IjMyMDc0MiIsImRiX25hbWUiOiJtdC1wcm9kLVRlbmFudHMiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJBRE1JTklTVFJBVE9SIiwiZXhwIjoyNTM0MDIzMDA4MDAsImlzcyI6IkNsYXJlX0FJIiwiYXVkIjoiQ2xhcmVfQUkifQ.zr5Gq6X8SQLxG3uZ3356m6P5bKwpd-zG_9Dx8nQUCyo";

interface SendTemplateMessageResponse {
  result: boolean;
  messageId: string;
}

interface TemplateParameter {
  name: string;
  value: string;
}

async function sendTemplateMessage(
  phoneNumber: string,
  templateName: string,
  parameters: TemplateParameter[]
): Promise<SendTemplateMessageResponse> {
  console.log(`Attempting to send template message to ${phoneNumber}`);
  const url = `${WATI_API_URL}/api/v1/sendTemplateMessage?whatsappNumber=${phoneNumber}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": WATI_API_TOKEN,
      },
      body: JSON.stringify({
        template_name: templateName,
        broadcast_name: "prescription_broadcast",
        parameters: parameters,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to send template message: ${response.status}, ${errorText}`);
      throw new Error(`Failed to send template message: ${response.status}, ${errorText}`);
    }

    console.log(`Template message sent successfully to ${phoneNumber}`);
    return await response.json() as SendTemplateMessageResponse;
  } catch (error) {
    console.error(`Error in sendTemplateMessage: ${error}`);
    throw error;
  }
}

export async function sendPrescriptionToWhatsApp(
  phoneNumber: string,
  doctorName: string,
  pdfLink: string,
  patientName: string
): Promise<void> {
  try {
    const parameters: TemplateParameter[] = [
      { name: "doctor", value: doctorName },
      { name: "pdflink", value: pdfLink },
      { name: "patientname", value: patientName },
    ];

    const result = await sendTemplateMessage(phoneNumber, "enhanced_prescription", parameters);
    console.log("WhatsApp send result:", result);
  } catch (error) {
    console.error("Error sending to WhatsApp:", error);
    throw error;
  }
}

