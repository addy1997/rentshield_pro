import { GoogleGenAI, Type } from "@google/genai";

export const analyzeContract = async (fileData: string, mimeType: string = 'image/jpeg'): Promise<{ isSafe: boolean; score: number; summary: string; issues: string[] }> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: fileData
            }
          },
          {
            text: `You are an expert UK housing lawyer in 2026. The Renters' Rights Act 2026 is in effect.
            Analyze this tenancy agreement document.
            
            Determine a 'Tenant Health Score' from 0 to 100.
            - 100 = Perfectly compliant, tenant-friendly.
            - < 50 = Illegal clauses or high risk.
            
            Look specifically for:
            1. Section 21 clauses (Illegal).
            2. Fixed terms longer than allowed (Illegal).
            3. Excessive rent review clauses.
            4. Illegal fees.

            Return a JSON object with:
            - isSafe: boolean
            - score: number (0-100)
            - summary: string (short analysis)
            - issues: string[] (list of specific illegal clauses found)`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isSafe: { type: Type.BOOLEAN },
            score: { type: Type.NUMBER },
            summary: { type: Type.STRING },
            issues: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text);
  } catch (error) {
    console.error("Contract analysis failed:", error);
    return {
      isSafe: false,
      score: 0,
      summary: "Could not analyze document. Please ensure the image is clear.",
      issues: ["Analysis failed"]
    };
  }
};

export const askQuestion = async (question: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an expert UK housing lawyer in 2026. The Renters' Rights Act 2026 is in effect.
      Answer the following question from a tenant accurately and concisely based on UK housing law.
      Question: ${question}`,
    });

    return response.text || "I'm sorry, I couldn't generate an answer.";
  } catch (error) {
    console.error("Ask question failed:", error);
    return "I'm sorry, I couldn't process your question at this time.";
  }
};

export const analyzeHazard = async (imageBase64: string): Promise<{ type: string; severity: 'Low' | 'Medium' | 'High' | 'Critical'; description: string }> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: imageBase64
            }
          },
          {
            text: `Analyze this image of a potential housing hazard in the UK.
            Under Awaab's Law (2026), categorize this hazard.
            Return JSON with:
            - type: string (e.g., "Black Mould", "Structural Leak", "Broken Boiler")
            - severity: "Low" | "Medium" | "High" | "Critical"
            - description: string (brief assessment of the risk to health)`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
         responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING },
            severity: { type: Type.STRING, enum: ['Low', 'Medium', 'High', 'Critical'] },
            description: { type: Type.STRING }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text);
  } catch (error) {
    console.error("Hazard analysis failed:", error);
    return {
      type: "Unknown",
      severity: "Medium",
      description: "AI could not identify the hazard clearly."
    };
  }
};

export const detectBiddingWar = async (fileData: string, mimeType: string = 'image/jpeg'): Promise<{ isIllegal: boolean; evidence: string }> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: fileData
            }
          },
          {
            text: `Analyze this document/screenshot (WhatsApp, Email, or SMS).
            Does this show a landlord or agent encouraging a "Bidding War" (asking for more rent than advertised) or pitting tenants against each other?
            This is illegal under the 2026 Renters' Rights Act.
            Return JSON:
            - isIllegal: boolean
            - evidence: string (quote the specific text that proves the violation)`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
         responseSchema: {
          type: Type.OBJECT,
          properties: {
            isIllegal: { type: Type.BOOLEAN },
            evidence: { type: Type.STRING }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text);
  } catch (error) {
    console.error("Bidding analysis failed:", error);
    return {
      isIllegal: false,
      evidence: "Could not analyze screenshot."
    };
  }
};

export const analyzeEPC = async (fileData: string, mimeType: string = 'image/jpeg'): Promise<{ score: string; comfort: number; compliance: boolean; summary: string }> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: mimeType, data: fileData } },
          { text: `Analyze this document or image of a home interior (radiator, window, insulation) or an EPC document.
            Estimate the 'Comfort Level' (0-100) based on visible insulation, glazing, or heating quality.
            Determine if it likely meets the 2026 UK EPC 'C' rating mandate.
            
            Return JSON:
            - score: string (estimated EPC rating A-G, or 'Unknown')
            - comfort: number (0-100)
            - compliance: boolean (true if likely C or above)
            - summary: string (brief explanation of the thermal efficiency observed)`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.STRING },
            comfort: { type: Type.NUMBER },
            compliance: { type: Type.BOOLEAN },
            summary: { type: Type.STRING }
          }
        }
      }
    });

    const text = response.text;
    if(!text) throw new Error("No response from AI");
    return JSON.parse(text);
  } catch (error) {
    console.error("EPC analysis failed", error);
    return { score: '?', comfort: 0, compliance: false, summary: "Analysis failed. Try a clearer image of a window or radiator." };
  }
};

export const generateResponse = async (tone: string, context: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Draft an email response to a landlord in a ${tone} tone.
      Context: ${context}.
      Cite the UK Renters' Rights Act 2026 or Awaab's Law where appropriate.
      Keep it concise and professional.`,
    });
    return response.text || "Could not generate response.";
  } catch (error) {
    console.error("Response generation failed:", error);
    return "Error generating response. Please try again.";
  }
};

export const analyzeRentIncrease = async (currentRent: number, newRent: number, location: string): Promise<{ isFair: boolean; advice: string; letter: string }> => {
  try {
     const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
     const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        Current Rent: £${currentRent}.
        Proposed Rent: £${newRent}.
        Location: ${location}.
        
        Task:
        1. Calculate the percentage increase.
        2. Based on general UK inflation/market trends for 2026, is this excessive?
        3. Draft a "Section 13 Rejection Letter" if it's too high, or a negotiation letter if moderate.
        
        Return JSON:
        {
          "isFair": boolean,
          "advice": string (short advice),
          "letter": string (the draft letter)
        }
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isFair: { type: Type.BOOLEAN },
            advice: { type: Type.STRING },
            letter: { type: Type.STRING }
          }
        }
      }
     });
     const text = response.text;
     if(!text) throw new Error("No response");
     return JSON.parse(text);
  } catch (e) {
     return { isFair: true, advice: "Could not calculate.", letter: "" };
  }
};

export const generateDisputeLetter = async (issue: string, evidence: string, amount: number): Promise<{ advice: string; letter: string }> => {
  try {
     const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
     const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        Issue: ${issue}.
        Evidence: ${evidence}.
        Disputed Amount: £${amount}.
        
        Task:
        1. Give brief advice on how to submit this to the Tenancy Deposit Scheme (TDS).
        2. Draft a formal dispute letter to the landlord/agency demanding the return of the deposit.
        
        Return JSON:
        {
          "advice": string,
          "letter": string
        }
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            advice: { type: Type.STRING },
            letter: { type: Type.STRING }
          }
        }
      }
     });
     const text = response.text;
     if(!text) throw new Error("No response");
     return JSON.parse(text);
  } catch (e) {
     return { advice: "Could not generate advice.", letter: "Error generating letter." };
  }
};

export const translateLandlordSpeak = async (text: string): Promise<{ translation: string; legalStanding: string }> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        Analyze this text from a landlord: "${text}".
        
        1. Translate it into plain English/Real meaning (cynical but accurate).
        2. Assess the legal standing under UK Renters Rights Act 2026.
        
        Return JSON:
        {
           "translation": string,
           "legalStanding": string
        }
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            translation: { type: Type.STRING },
            legalStanding: { type: Type.STRING }
          }
        }
      }
    });
    const resText = response.text;
    if(!resText) throw new Error("No response");
    return JSON.parse(resText);
  } catch (e) {
    return { translation: "Error analyzing.", legalStanding: "Unknown" };
  }
};

export const identifyLocation = async (lat: number, lng: number): Promise<string> => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`, {
      headers: {
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && data.address) {
      const neighborhood = data.address.neighbourhood || data.address.suburb || data.address.village || data.address.town || '';
      const city = data.address.city || data.address.county || data.address.state || '';
      
      if (neighborhood && city) {
        return `${neighborhood}, ${city}`;
      } else if (city) {
        return city;
      } else if (neighborhood) {
        return neighborhood;
      } else if (data.display_name) {
        // Fallback to a shortened version of display_name
        const parts = data.display_name.split(',');
        if (parts.length >= 2) {
          return `${parts[0].trim()}, ${parts[1].trim()}`;
        }
        return data.display_name;
      }
    }
    
    return "Unknown Area";
  } catch (error) {
    console.error("Location identification failed:", error);
    return "United Kingdom";
  }
};