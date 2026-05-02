/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  trendingReason: string;
  targetAudience: string;
  painPoint: string;
  category: string;
  viralScore: number; // 1-10
  imageUrl?: string;
}

export interface VideoScript {
  productId: string;
  productName: string;
  hook: string;
  problem: string;
  solution: string;
  features: string;
  socialProof: string;
  cta: string;
  totalDuration: string;
}

export interface ProductionPackage {
  title: string;
  description: string;
  tags: string[];
  hashtags: string[];
  visualInstructions: string;
  avatarDialogue: string;
  voiceStyle: string;
}

export interface DailyReport {
  date: string;
  trendingProducts: Product[];
  topPicks: Product[];
}
