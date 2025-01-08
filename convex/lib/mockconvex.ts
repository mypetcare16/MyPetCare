import { api } from '../_generated/api';
import { ConvexHttpClient } from 'convex/browser';
import { query } from '../_generated/server';

const convexUrl = 'https://rightful-alligator-842.convex.cloud'

if (!convexUrl) {
  throw new Error('NEXT_PUBLIC_CONVEX_URL is not set. Please check your environment variables.');
}

export const convex = new ConvexHttpClient(convexUrl);
// Initialize the Convex client

export async function checkDoctorAvailability(command: string, args: { doctorId: string; appointmentDate: string }) {
  try {
    let result;

    switch (command) {
      case 'get_availablity': {
        result = await convex.query(api.appointment.checkDoctorAvailability, args);
        console.log('Checking doctor availability:', result);
        break;
      }


      default: {
        console.error(`Unknown command: ${command}`);
        result = { error: 'Invalid command' };
      }
    }

    return { result };

  } catch (error) {
    console.error('Error executing command:', error);
    return { error: 'Couldnt Execute this Command' };
  }
}

