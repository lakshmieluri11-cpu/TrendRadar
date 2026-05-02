/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { Product, VideoScript, ProductionPackage, DailyReport } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function researchDailyTrends(): Promise<DailyReport> {
  const model = "gemini-3-flash-preview";
  
  const response = await ai.models.generateContent({
    model,
    contents: "Identify the Top 20 trending & high-selling products right now on Amazon/Global marketplaces for viral social media content (gadgets, home hacks, tech, beauty). Identify products with high 'wow' factor. Then select the Top 3 based on viral potential. Format as JSON.",
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          trendingProducts: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                trendingReason: { type: Type.STRING },
                targetAudience: { type: Type.STRING },
                painPoint: { type: Type.STRING },
                category: { type: Type.STRING },
                viralScore: { type: Type.NUMBER },
              },
              required: ["id", "name", "trendingReason", "targetAudience", "painPoint", "category", "viralScore"]
            }
          },
          topPickIds: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["trendingProducts", "topPickIds"]
      }
    }
  });

  const data = JSON.parse(response.text);
  const products: Product[] = data.trendingProducts;
  const topPicks = products.filter(p => data.topPickIds.includes(p.id));

  return {
    date: new Date().toLocaleDateString(),
    trendingProducts: products,
    topPicks: topPicks
  };
}

export async function generateVideoPackage(product: Product): Promise<{ script: VideoScript, package: ProductionPackage }> {
  const model = "gemini-3-flash-preview";
  
  const response = await ai.models.generateContent({
    model,
    contents: `Generate a high-converting 60-second video script and YouTube production package for this product:
    Name: ${product.name}
    Category: ${product.category}
    Pain Point: ${product.painPoint}
    
    Structure the script:
    1. HOOK (0–3 sec): Pattern interrupt/curiosity
    2. PROBLEM (3–10 sec): Relatable struggle
    3. SOLUTION INTRO (10–20 sec): Dramatic intro
    4. FEATURES + BENEFITS (20–45 sec): Outcomes over specs
    5. SOCIAL PROOF (45–55 sec): Trust/Stats
    6. CTA (55–60 sec): Urgent link click
    
    Also generate YouTube metadata and production instructions for AI video tools (Runway/HeyGen).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          script: {
            type: Type.OBJECT,
            properties: {
              productId: { type: Type.STRING },
              productName: { type: Type.STRING },
              hook: { type: Type.STRING },
              problem: { type: Type.STRING },
              solution: { type: Type.STRING },
              features: { type: Type.STRING },
              socialProof: { type: Type.STRING },
              cta: { type: Type.STRING },
              totalDuration: { type: Type.STRING }
            },
            required: ["hook", "problem", "solution", "features", "socialProof", "cta"]
          },
          productionPackage: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
              visualInstructions: { type: Type.STRING },
              avatarDialogue: { type: Type.STRING },
              voiceStyle: { type: Type.STRING }
            },
            required: ["title", "description", "tags", "hashtags", "visualInstructions", "avatarDialogue", "voiceStyle"]
          }
        },
        required: ["script", "productionPackage"]
      }
    }
  });

  const data = JSON.parse(response.text);
  return {
    script: { ...data.script, productId: product.id, productName: product.name, totalDuration: "60s" },
    package: data.productionPackage
  };
}
