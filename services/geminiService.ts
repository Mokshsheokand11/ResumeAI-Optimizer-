
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, JobDetails } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeResume = async (
  resumeDataBase64: string,
  mimeType: string,
  jobDetails: JobDetails
): Promise<AnalysisResult> => {
  // gemini-3-flash-preview is highly capable for multimodal document understanding including PDFs.
  const modelName = "gemini-3-flash-preview"; 

  const prompt = `
    Act as an expert Recruiter and Technical Resume Specialist. 
    Analyze the provided resume document (PDF or image) against the specified job description.
    
    Job Context:
    - Target Role: ${jobDetails.title}
    - Company: ${jobDetails.company || 'Confidential'}
    - Full Job Description: ${jobDetails.description}

    Your goal is to provide a comprehensive audit of the candidate's document.
    
    Audit Tasks:
    1. Extract and process all content from the document (OCR if needed).
    2. Rate the resume from 0-100 based on its content relevance, formatting, and alignment with the job.
    3. Provide a high-level summary of the candidate's suitability.
    4. List key strengths found and critical weaknesses to address.
    5. Provide actionable improvements categorized by 'category' (e.g., Experience, Skills, Education, Formatting) with their estimated impact (High, Medium, Low).
    6. Identify specific spelling, typographical, or grammatical errors (provide original text, suggested fix, and context).
    7. Analyze job alignment: 
       - Identify specific high-value keywords missing from the resume.
       - Provide a list of recommended industry keywords to add.
       - Calculate a match percentage.
       - Provide a concise role fit summary.

    IMPORTANT: If the file is not a resume or is completely unreadable, provide a score of 0.
    Format the response strictly as a JSON object matching the provided schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: resumeDataBase64,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.NUMBER },
            summary: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvements: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  description: { type: Type.STRING },
                  impact: { type: Type.STRING },
                },
                required: ["category", "description", "impact"],
              },
            },
            spellingErrors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  original: { type: Type.STRING },
                  suggestion: { type: Type.STRING },
                  context: { type: Type.STRING },
                },
                required: ["original", "suggestion", "context"],
              },
            },
            jobAlignment: {
              type: Type.OBJECT,
              properties: {
                matchPercentage: { type: Type.NUMBER },
                missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                suggestedKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                roleFitSummary: { type: Type.STRING },
              },
              required: ["matchPercentage", "missingKeywords", "suggestedKeywords", "roleFitSummary"],
            },
          },
          required: [
            "overallScore",
            "summary",
            "strengths",
            "weaknesses",
            "improvements",
            "spellingErrors",
            "jobAlignment",
          ],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response text from AI. Document might be too large or complex.");
    
    return JSON.parse(text) as AnalysisResult;
  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    if (error.message?.includes("400") || error.message?.includes("INVALID_ARGUMENT")) {
      throw new Error("The document could not be processed. Ensure the file is a standard PDF or clear image under 69MB.");
    }
    throw error;
  }
};
