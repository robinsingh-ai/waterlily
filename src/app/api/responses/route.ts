import { NextRequest, NextResponse } from "next/server";
import { getSurvey, submitResponse } from "@/lib/firestore";

// POST /api/responses

export async function POST(req: NextRequest) {

    try{
        const data = await req.json();
        const {surveyId, answers, respondedEmail} = data;

       if (!surveyId || !answers || !Array.isArray(answers) || answers.length === 0){
        return NextResponse.json(
            {error:'Missing required fields'},
            {status:400}
        );
    }

    const survey = await getSurvey(surveyId);
    if (!survey){
        return NextResponse.json(
            {error:'Survey not found'},
            {status:404}
        );
    }



    const responseId = await submitResponse({
       surveyId,
       answers, 
       respondedEmail,
        
    });

    return NextResponse.json({
        id:responseId,
        surveyId,
        answers, 
        respondedEmail,
     
    },
    {status:201}
    );

} catch (error) {
    console.error('Error submitting response:', error);
    return NextResponse.json({error:'Internal server error'}, {status:500});
}
}