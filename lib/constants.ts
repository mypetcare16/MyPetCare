import { PersonStanding, Plus } from "lucide-react";

export const ROLES = [
  {
    id: "doctor",
    value: "Doctor",
    label: "Doctor",
    icon: Plus,
  },
  {
    id: "patient",
    value: "Patient",
    label: "Patient",
    icon: PersonStanding,
  },
];

export const GENDERS = [
  {
    id: "male",
    value: "Male",
  },
  {
    id: "female",
    value: "Female",
  },
  {
    id: "other",
    value: "Other",
  },
];

export const SUGGESTIONS = [
  {
    id: 1,
    displayText: "How does cancer starts to show?",
  },
  {
    id: 2,
    displayText:
      "Learn about conditions like diabetes, hypertension, or arthritis",
  },
  {
    id: 3,
    displayText: "Find tips for mental health and wellness",
  },
  {
    id: 4,
    displayText: "Explore treatment options for common conditions",
  },
];

export const AI_SEARCH_PROMPT = `
You are a medical assistant AI. Based on the given context, generate a detailed and accurate response to the user's question. Additionally, provide 3-5 relevant and related question-and-answer pairs that users might find helpful. 
### User's Question:
{{userQuestion}}
### Context:
{{context}}
### Your Response Format:
{
  "content": "Answer to the user's question in a detailed and concise manner.",
  "qna": [
    {
      "sequenceNumber": "1",
      "question": "Suggested related question 1",
      "answer": "Answer to suggested question 1"
    },
    {
      "sequenceNumber": "2",
      "question": "Suggested related question 2",
      "answer": "Answer to suggested question 2"
    },
    {
      "sequenceNumber": "1",
      "question": "Suggested related question 3",
      "answer": "Answer to suggested question 3"
    }
  ]
}
`;
