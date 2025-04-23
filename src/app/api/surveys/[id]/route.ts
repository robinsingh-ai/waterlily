import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getSurvey, updateSurvey, deleteSurvey } from "@/lib/firestore";
import { initAdminApp } from "@/lib/firebase-admin";

// Initialize Firebase Admin once
initAdminApp();

interface Params {
  params: {
    id: string;
  };
}

// GET /api/surveys/[id] - Get a specific survey
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    
    // Get the survey
    const survey = await getSurvey(id);
    
    if (!survey) {
      return NextResponse.json(
        { error: 'Survey not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(survey);
  } catch (error) {
    console.error('Error getting survey:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/surveys/[id] - Update a specific survey
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    
    // Get the authorization token
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization token' },
        { status: 401 }
      );
    }
    
    // Extract the token
    const token = authHeader.split(' ')[1];
    
    // Get the request body
    const data = await req.json();
    
    // Get the survey
    const survey = await getSurvey(id);
    
    if (!survey) {
      return NextResponse.json(
        { error: 'Survey not found' },
        { status: 404 }
      );
    }
    
    // Verify ownership
    try {
      const decodedToken = await getAuth().verifyIdToken(token);
      if (survey.createdBy !== decodedToken.uid) {
        return NextResponse.json(
          { error: 'Unauthorized to update this survey' },
          { status: 403 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    // Update the survey
    await updateSurvey(id, data);
    
    return NextResponse.json(
      { id, ...data },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating survey:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/surveys/[id] - Delete a specific survey
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = params;
    
    // Get the authorization token
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization token' },
        { status: 401 }
      );
    }
    
    // Extract the token
    const token = authHeader.split(' ')[1];
    
    // Get the survey
    const survey = await getSurvey(id);
    
    if (!survey) {
      return NextResponse.json(
        { error: 'Survey not found' },
        { status: 404 }
      );
    }
    
    // Verify ownership
    try {
      const decodedToken = await getAuth().verifyIdToken(token);
      if (survey.createdBy !== decodedToken.uid) {
        return NextResponse.json(
          { error: 'Unauthorized to delete this survey' },
          { status: 403 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    // Delete the survey
    await deleteSurvey(id);
    
    return NextResponse.json(
      { message: 'Survey deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting survey:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 