import {collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy, Timestamp, DocumentData, QueryDocumentSnapshot} from "firebase/firestore";
import { db } from "./firebase";



export interface Question {
    id: string;
    text: 'text' | 'multipleChoice';
    question:string
    options?: string[];
}

export interface Survey {
    id?: string;
    title: string;
    description: string;
    questions: Question[];
    createdBy: string;
    createdAt?: Timestamp;
    
}

export interface Answer{
    questionId: string;
    answer: string | string[];
}

export interface Response{
    id?: string;
    surveyId: string;
    answers: Answer[];
    respondedEmail: string;
    createdAt?: Timestamp;
}


const surveyConverter = {
    toFirestore: (survey: Survey) : DocumentData => {
        const santizedQuestions = survey.questions.map((q) => ({
            id: q.id,
            text: q.text,
            question: q.question,
            ...(q.text === 'multipleChoice' && q.options && q.options.length >0 ? {options: q.options} : {})
        }));

        return {
            title: survey.title,
            description: survey.description,
            questions: santizedQuestions,
            createdBy: survey.createdBy,
            createdAt: survey.createdAt || Timestamp.now(),
        }
    },
    fromFirestore: (snapshot: QueryDocumentSnapshot) => {
        const data = snapshot.data();
        return {
            id: snapshot.id,
            title: data.title || '',
            description: data.description || '',
            questions: Array.isArray(data.questions) ? data.questions : [],
            createdBy: data.createdBy || '',
            createdAt: data.createdAt || Timestamp.now(),
        }
    }
}

const responseConverter = {
    toFirestore: (response: Response) : DocumentData => {
        return {
            surveyId: response.surveyId,
            answers: response.answers || [],
            respondedEmail: response.respondedEmail || null,
            createdAt: response.createdAt || Timestamp.now(),
        }
    },
    fromFirestore: (snapshot: QueryDocumentSnapshot) => {
        const data = snapshot.data();
        return {
            id: snapshot.id,
            surveyId: data.surveyId || '',
            answers: Array.isArray(data.answers) ? data.answers : [],
            respondedEmail: data.respondedEmail || '',
            createdAt: data.createdAt || Timestamp.now(),
        }
    }
}


// Surevy

export async function createSurvey(survey: Survey): Promise<string> {
    try{
        const surveyCol = collection(db, 'surveys');
        const docRef = await addDoc(surveyCol, surveyConverter.toFirestore(survey));
        return docRef.id;
    } catch (error) {
        console.error('Error creating survey:', error);
        throw error;
    }
}

export async function getSurvey(id: string): Promise<Survey | null> {
    try{
        const docRef = doc(db, 'surveys', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()){
            return {id: docSnap.id, ...docSnap.data() as Survey};
        } else{
            return null;
        }
    } catch (error) {
        console.error('Error getting survey:', error);
        throw error;
    }
}

export async function getUserSurveys(userId: string): Promise<Survey[]> {
    try{
        const surveyCol = collection(db, 'surveys');
        const q = query(surveyCol, where('createdBy', '==', userId), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data() as Survey}));
    } catch (error) {
        console.error('Error getting user surveys:', error);
        throw error;
    }
}

export async function updateSurvey(id: string, survey: Partial<Survey>): Promise<void> {
    try{
        const docRef = doc(db, 'surveys', id);
        
        const{id: _, ...surveyData} = survey;
        await updateDoc(docRef, surveyData);
    } catch (error) {
        console.error('Error updating survey:', error);
        throw error;
    }
}


export async function deleteSurvey(id: string): Promise<void> {
    try{
        const docRef = doc(db, 'surveys', id);
        await deleteDoc(docRef);
    } catch (error) {
        console.error('Error deleting survey:', error);
        throw error;
    }
}

// Response

export async function submitResponse(response: Response): Promise<string> {
    try{
        const responseCol = collection(db, 'responses');
        const docRef = await addDoc(responseCol, responseConverter.toFirestore(response));
        return docRef.id;
    } catch (error) {
        console.error('Error submitting response:', error);
        throw error;
    }
}

export async function getSurveyResponses(surveyId: string): Promise<Response[]> {
    try{
        const responseCol = collection(db, 'responses');
        const q = query(responseCol, where('surveyId', '==', surveyId), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data() 
        }as Response));
    } catch (error) {
        console.error('Error getting survey responses:', error);
        return [];
    }
}










