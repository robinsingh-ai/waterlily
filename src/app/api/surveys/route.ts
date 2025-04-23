import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { createSurvey, getUserSurveys } from "@/lib/firestore";
import { initAdminApp } from "@/lib/firebase-admin";

// Initialize Firebase Admin once
initAdminApp();

// GET /api/surveys - Get all surveys for the current user
export async function GET(req: NextRequest) {
  try {
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
    
    // Verify the token and get the user
    const decodedToken = await getAuth().verifyIdToken(token);
    const userId = decodedToken.uid;
    
    // Get the user's surveys
    const surveys = await getUserSurveys(userId);
    
    return NextResponse.json(surveys);
  } catch (error) {
    console.error('Error getting surveys:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/surveys - Create a new survey
export async function POST(req: NextRequest) {
  try {
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
    
    // Verify the token and get the user
    const decodedToken = await getAuth().verifyIdToken(token);
    const userId = decodedToken.uid;
    
    // Get the request body
    const data = await req.json();
    const { title, description, questions } = data;
    
    // Validate the request body
    if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create the survey
    const surveyId = await createSurvey({
      title,
      description,
      questions,
      createdBy: userId
    });
    
    return NextResponse.json(
      { id: surveyId, title, description, questions, createdBy: userId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating survey:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
