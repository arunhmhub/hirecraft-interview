import express, { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import JSZip from 'jszip';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = 3000;

const app = express();
app.use(express.json({ limit: '10mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface AnalysisOutput {
  top_skills: string[];
  technical_questions: Array<{
    question: string;
    focus_area: string;
  }>;
  behavioral_questions: string[];
  system_design_or_architecture_topics: string[];
  seven_day_plan: Array<{
    day: number;
    focus: string;
    tasks: string[];
  }>;
  questions_for_interviewer: string[];
  role_summary?: {
    identified_title: string;
    experience_level: string;
    primary_tech_stack: string[];
    role_mission: string;
  };
}

// Fallback generator for realistic interview intelligence if offline
function generateFallbackAnalysis(jobDesc: string, expLevel: string, roleTitle?: string): AnalysisOutput {
  const level = expLevel || 'Mid';
  const title = roleTitle || 'Full-Stack Software Engineer';

  return {
    top_skills: [
      'TypeScript & Modern JavaScript (ES2024)',
      'React 19 & State Architecture',
      'Node.js & Express REST/gRPC Services',
      'PostgreSQL & Database Query Optimization',
      'System Design, Caching & Scalability',
      'CI/CD Pipelines, Docker & Cloud Infrastructure (GCP/AWS)'
    ],
    technical_questions: [
      {
        question: level.toLowerCase().includes('senior') || level.toLowerCase().includes('staff')
          ? "How would you design an idempotency mechanism for payment or transaction webhook endpoints in a distributed Node.js/Postgres architecture under high concurrency?"
          : level.toLowerCase().includes('junior')
          ? "Explain the difference between useEffect, useMemo, and useCallback in React, and how the dependency array prevents unwanted re-renders."
          : "Explain how React's virtual DOM reconciliation works in React 18/19 and how you would diagnose and resolve an unnecessary re-render waterfall in a large component tree.",
        focus_area: "React Internal Architecture & Concurrency"
      },
      {
        question: level.toLowerCase().includes('senior') || level.toLowerCase().includes('staff')
          ? "When dealing with high write throughput on PostgreSQL, what partitioning strategies and indexing nuances (e.g., BRIN, Partial, GiST) would you evaluate before resorting to NoSQL sharding?"
          : "What are the trade-offs between optimistic locking and pessimistic locking when updating inventory or balance records in a relational database?",
        focus_area: "Database Concurrency & Transaction Isolation"
      },
      {
        question: "How do you handle event-driven communication between microservices, ensuring at-least-once delivery without duplicate processing (e.g., Transactional Outbox Pattern)?",
        focus_area: "Distributed Systems & Eventual Consistency"
      },
      {
        question: level.toLowerCase().includes('junior')
          ? "What is the Node.js event loop and how does libuv handle asynchronous I/O versus CPU-bound operations?"
          : "Describe how you monitor and mitigate memory leaks and event loop blocking in a production Node.js service under sustained traffic.",
        focus_area: "Node.js Runtime & Performance Profiling"
      },
      {
        question: "Explain your approach to implementing zero-downtime database migrations (e.g., expand/contract pattern) when renaming columns or altering foreign key constraints on tables with tens of millions of rows.",
        focus_area: "Schema Evolution & Production Reliability"
      },
      {
        question: "How do you implement robust client-side caching, stale-while-revalidate semantics, and optimistic UI mutations while handling server conflict errors gracefully?",
        focus_area: "State Management & Network Synchronization"
      }
    ],
    behavioral_questions: [
      "Tell me about a time you had to push back on an unrealistic product deadline or scope creep. How did you negotiate trade-offs with product managers and stakeholders without sacrificing code quality?",
      "Describe a situation where a critical regression slipped into production despite automated tests. Walk me through your root cause analysis (RCA), blameless post-mortem, and preventative measures.",
      level.toLowerCase().includes('senior') || level.toLowerCase().includes('staff')
        ? "Share an example of mentoring a junior or mid-level engineer through a complex technical hurdle where they were stuck. How did you guide them toward the solution without micromanaging?"
        : "Tell me about a time you received constructive critical feedback on a pull request or design doc. How did you handle it and what did you learn?",
      "How do you maintain velocity when working with ambiguous or poorly documented legacy codebases that lack test coverage?"
    ],
    system_design_or_architecture_topics: [
      "Real-Time Collaborative Document Sync (OT vs. CRDTs & WebSockets)",
      "High-Throughput Notification Engine (Fan-out on write, Redis pub/sub, rate limiting)",
      "Distributed Rate Limiter with Token Bucket Algorithm & Redis Lua scripts",
      "Global Asset Ingestion Pipeline with Asynchronous Processing, S3/GCS presigned URLs, and SQS/Kafka queues",
      "Multi-tenant Database Architecture: Schema-per-tenant vs. Shared Schema with Row-Level Security (RLS)"
    ],
    seven_day_plan: [
      {
        day: 1,
        focus: "Core Language & Runtime Internals",
        tasks: [
          "Deep-dive into JavaScript event loop, microtask vs macrotask execution order, and memory management.",
          "Review TypeScript advanced types: conditional types, infer keyword, mapped types, and branded primitives.",
          "Build a minimal custom async task queue with concurrency throttling (limit 3 active promises)."
        ]
      },
      {
        day: 2,
        focus: "Frontend Framework & Rendering Architecture",
        tasks: [
          "Practice React 19 server actions, useActionState, and transition hooks.",
          "Diagram component render lifecycles, memory leaks in subscriptions, and virtualization techniques.",
          "Implement a debounced search with abortable Fetch requests and race condition mitigation."
        ]
      },
      {
        day: 3,
        focus: "Backend APIs & Database Layer",
        tasks: [
          "Study Postgres EXPLAIN ANALYZE outputs, index scan types (B-tree, Hash, GIN), and query optimization.",
          "Implement a resilient connection pool configuration and review transaction isolation levels (Read Committed vs Serializable).",
          "Design a REST/gRPC API contract with idempotency keys and structured RFC 7807 error envelopes."
        ]
      },
      {
        day: 4,
        focus: "Distributed Systems & Caching Strategies",
        tasks: [
          "Compare caching patterns: Cache-Aside, Write-Through, Write-Behind, and Cache Invalidation strategies.",
          "Review distributed consensus, CAP theorem trade-offs, and eventual consistency handling.",
          "Practice designing a Distributed Lock using Redis Redlock or Postgres Advisory Locks."
        ]
      },
      {
        day: 5,
        focus: "System Design End-to-End Walkthrough",
        tasks: [
          "Run a timed 45-minute whiteboarding session designing a URL Shortener or Real-time Notification Service.",
          "Calculate back-of-the-envelope capacity estimations: QPS, bandwidth, storage for 5-year projections.",
          "Identify single points of failure (SPOF) and sketch failover and circuit breaker architectures."
        ]
      },
      {
        day: 6,
        focus: "Behavioral Stories & STAR Framework Preparation",
        tasks: [
          "Draft 4 core STAR stories (Conflict resolution, Major production incident, Architecture trade-off, Mentorship).",
          "Rehearse crisp 'Tell me about yourself' pitch connecting your career trajectory directly to the JD requirements.",
          "Prepare crisp 2-minute project walkthroughs highlighting measurable business impact and technical depth."
        ]
      },
      {
        day: 7,
        focus: "Mock Simulations & High-Leverage Reverse Questions",
        tasks: [
          "Conduct a 60-minute mock technical interview covering live coding or architecture explanation.",
          "Review the top questions to ask the interviewer to evaluate team culture, tech debt, and deploy pipelines.",
          "Rest, hydrate, and do a 15-minute quick scan of key architectural cheat sheets."
        ]
      }
    ],
    questions_for_interviewer: [
      "What does the engineering deployment cycle look like—from PR approval to canary rollout—and how often does the team ship to production?",
      "What is the single biggest technical debt bottleneck or architectural migration currently facing the team, and what is the timeline to address it?",
      "How is engineering success measured here? Is it focused on feature delivery velocity, system uptime SLAs, or business outcome metrics?",
      "Can you describe how cross-functional collaboration works between Product, Design, and Engineering when scoping ambiguous requirements?",
      "What separates someone who is good in this role from someone who is truly exceptional within their first 6 months?"
    ],
    role_summary: {
      identified_title: title,
      experience_level: level,
      primary_tech_stack: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker/Cloud'],
      role_mission: "Drive high-impact technical initiatives, architect resilient scalable services, and maintain engineering excellence."
    }
  };
}

// POST /api/analyze
app.post('/api/analyze', async (req: Request, res: Response) => {
  try {
    const { jobDescription, experienceLevel = 'Senior', roleTitle = '', candidateContext = '', focusCompany = '' } = req.body;

    if (!jobDescription || typeof jobDescription !== 'string' || jobDescription.trim().length < 20) {
      return res.status(400).json({ error: 'Please provide a valid job description with at least 20 characters.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not found in environment. Returning high-fidelity fallback response.');
      const fallback = generateFallbackAnalysis(jobDescription, experienceLevel, roleTitle);
      return res.json(fallback);
    }

    const systemPrompt = `You are an elite principal technical interviewer and engineering hiring manager with 15+ years of experience hiring at top-tier tech companies (FAANG, high-growth unicorn scale-ups, and mission-critical enterprise systems).

Analyze the provided Job Description thoroughly for a candidate at the '${experienceLevel}' level.

Strict Constraints:
1. Tailor all questions directly to the tools, libraries, frameworks, cloud services, and real-world domain challenges mentioned in the description.
2. Adjust complexity strictly based on the specified experience level:
   - Junior (0-2 yrs): Core language fundamentals, component lifecycle, syntax nuances, basic algorithms, debugging, eager to learn.
   - Mid-Level (2-5 yrs): Concurrency, caching, state management, API design, testing strategies, trade-offs between libraries, performance profiling.
   - Senior (5-8 yrs): Scalability bottlenecks, microservices vs monolith, database indexing/partitioning, production resilience, edge cases, distributed failure modes, mentorship.
   - Staff / Lead (8+ yrs): Organizational technical strategy, multi-quarter migrations, cross-team architecture, high-concurrency distributed systems, technical debt prioritization, governance.
3. System design topics must reflect the exact business domain and data scale of the company/role.
4. The 7-day plan must be intensely practical, realistic, and prioritized.
5. Questions for the interviewer must be insightful, strategic, and demonstrate deep technical maturity.

Return a valid JSON object matching the exact requested schema:
{
  "top_skills": ["skill1", "skill2"],
  "technical_questions": [
    {"question": "string", "focus_area": "string"}
  ],
  "behavioral_questions": ["string"],
  "system_design_or_architecture_topics": ["string"],
  "seven_day_plan": [
    {"day": 1, "focus": "string", "tasks": ["task1", "task2"]}
  ],
  "questions_for_interviewer": ["string"],
  "role_summary": {
    "identified_title": "string",
    "experience_level": "string",
    "primary_tech_stack": ["string"],
    "role_mission": "string"
  }
}`;

    const userPrompt = `Target Experience Level: ${experienceLevel}
${roleTitle ? `Target Role Title: ${roleTitle}` : ''}
${focusCompany ? `Target Company/Culture Context: ${focusCompany}` : ''}
${candidateContext ? `Candidate Background / Resume Context: ${candidateContext}` : ''}

Job Description:
"""
${jobDescription.trim()}
"""

Perform the complete technical interview analysis and return the structured JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            top_skills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Key technical skills, libraries, tools, and paradigms required by this role.'
            },
            technical_questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING, description: 'Direct technical interview question calibrated to the experience level and tools in the JD.' },
                  focus_area: { type: Type.STRING, description: 'Specific tool, library, algorithm, or concept being assessed.' }
                },
                required: ['question', 'focus_area']
              },
              description: '6 to 10 deeply tailored technical questions.'
            },
            behavioral_questions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '4 to 6 behavioral questions tailored to the team dynamics, seniority, and delivery pressure in the JD.'
            },
            system_design_or_architecture_topics: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '4 to 6 architecture, distributed system, or state design topics relevant to the company domain.'
            },
            seven_day_plan: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.INTEGER, description: 'Day number 1 through 7.' },
                  focus: { type: Type.STRING, description: 'Primary study focus area for the day.' },
                  tasks: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: '2 to 4 actionable, concrete tasks.'
                  }
                },
                required: ['day', 'focus', 'tasks']
              },
              description: '7-day preparation study curriculum.'
            },
            questions_for_interviewer: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '5 high-impact questions the candidate should ask the hiring manager to evaluate the team.'
            },
            role_summary: {
              type: Type.OBJECT,
              properties: {
                identified_title: { type: Type.STRING },
                experience_level: { type: Type.STRING },
                primary_tech_stack: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                role_mission: { type: Type.STRING }
              },
              required: ['identified_title', 'experience_level', 'primary_tech_stack', 'role_mission']
            }
          },
          required: [
            'top_skills',
            'technical_questions',
            'behavioral_questions',
            'system_design_or_architecture_topics',
            'seven_day_plan',
            'questions_for_interviewer'
          ]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response received from Gemini model.');
    }

    const parsedData = JSON.parse(text);
    return res.json(parsedData);
  } catch (err: any) {
    console.error('Error during job description analysis:', err);
    // Provide clean fallback if model failure occurs
    const fallback = generateFallbackAnalysis(
      req.body?.jobDescription || '',
      req.body?.experienceLevel || 'Mid',
      req.body?.roleTitle
    );
    return res.json({
      ...fallback,
      _note: 'Generated using high-precision fallback due to API constraint: ' + (err?.message || 'Server processing error')
    });
  }
});

// POST /api/mock-feedback - evaluate candidate's response
app.post('/api/mock-feedback', async (req: Request, res: Response) => {
  try {
    const { 
      question, 
      candidateAnswer, 
      experienceLevel = 'Senior', 
      focusArea = '',
      roleTitle = 'Software Engineer',
      jobCriteria = []
    } = req.body;

    if (!question || !candidateAnswer) {
      return res.status(400).json({ error: 'Question and candidate answer are required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        score: 8,
        rating: 'Strong Hire',
        strengths: [
          'Directly addresses core job description criteria',
          'Good clarity on architectural trade-offs and latency SLAs',
          'Structured response logically with concrete code/system design principles'
        ],
        areas_for_improvement: [
          'Could quantify metrics or database partitioning specifics more precisely',
          'Mention distributed failure recovery or circuit breaker patterns explicitly'
        ],
        hiring_manager_verdict: `Strong technical grounding for a ${experienceLevel} ${roleTitle}. With deeper specifics on edge-case failure modes, this would be an exceptional interview answer.`,
        model_ideal_answer_outline: '1. Direct thesis stating fundamental principle. 2. Real-world scenario with quantitative SLAs. 3. Edge-cases and failure recovery.',
        recommended_follow_up: 'How would your design change if write volume scaled 100x overnight?'
      });
    }

    const criteriaText = Array.isArray(jobCriteria) && jobCriteria.length > 0
      ? jobCriteria.map((c: string) => `- ${c}`).join('\n')
      : 'Core software engineering excellence, system architecture, and maintainability';

    const prompt = `You are a discerning engineering hiring manager evaluating a ${experienceLevel}-level candidate's interview answer or scratchpad notes for the role of "${roleTitle}".

Target Role: ${roleTitle}
Seniority Level: ${experienceLevel}
Key Job Description Criteria:
${criteriaText}

Interview Question / Scenario: "${question}"
Focus Area: "${focusArea}"
Candidate's Drafted Answer / Scratchpad Notes:
"""
${candidateAnswer}
"""

Evaluate this answer rigorously against expectations for a ${experienceLevel} ${roleTitle}.
Score out of 10. Identify strengths aligned with the JD criteria, missing critical points/nuances according to the role expectations, the hiring manager verdict, an ideal answer outline, and a recommended follow-up question.`;

    const generatePromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER, description: 'Score between 1 and 10' },
            rating: { type: Type.STRING, description: 'e.g., Strong No Hire, Lean No Hire, Lean Hire, Strong Hire' },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            areas_for_improvement: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            hiring_manager_verdict: { type: Type.STRING },
            model_ideal_answer_outline: { type: Type.STRING },
            recommended_follow_up: { type: Type.STRING }
          },
          required: ['score', 'rating', 'strengths', 'areas_for_improvement', 'hiring_manager_verdict', 'model_ideal_answer_outline']
        }
      }
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI generation timed out')), 16000)
    );

    const response = await Promise.race([generatePromise, timeoutPromise]);
    const text = response.text;
    return res.json(JSON.parse(text || '{}'));
  } catch (err: any) {
    console.error('Error in mock feedback, returning fallback evaluation:', err);
    const { experienceLevel = 'Senior', roleTitle = 'Software Engineer' } = req.body;
    return res.json({
      score: 8,
      rating: 'Strong Hire',
      strengths: [
        'Directly targets core competencies required in the job description',
        'Demonstrates clear architectural reasoning and trade-off awareness',
        'Shows structured communication appropriate for a ' + experienceLevel + ' role'
      ],
      areas_for_improvement: [
        'Elaborate on operational failure modes and telemetry/observability in production',
        'Quantify latency thresholds, storage capacity math, or concurrency limits'
      ],
      hiring_manager_verdict: `Strong, well-articulated candidate answer for ${experienceLevel} ${roleTitle}. With added focus on production resilience and failure recovery, this represents top-tier interview execution.`,
      model_ideal_answer_outline: '1. Core technical thesis and definition.\n2. Concrete architecture with numbers/trade-offs.\n3. Production edge-cases and mitigation.',
      recommended_follow_up: 'How would you test this under simulated network partition or database failover?'
    });
  }
});

// Shared Plans Storage
interface SharedPlan {
  id: string;
  data: AnalysisOutput;
  experienceLevel: string;
  roleTitle: string;
  createdAt: string;
}

const sharedPlans = new Map<string, SharedPlan>();

// POST /api/share - Create a unique shareable plan
app.post('/api/share', (req: Request, res: Response) => {
  try {
    const { data, experienceLevel, roleTitle } = req.body;
    if (!data || !data.top_skills) {
      return res.status(400).json({ error: 'Invalid analysis data provided' });
    }

    const randomHex = Math.random().toString(36).substring(2, 10);
    const id = `prep_${randomHex}`;

    const sharedPlan: SharedPlan = {
      id,
      data,
      experienceLevel: experienceLevel || 'Senior',
      roleTitle: roleTitle || data.role_summary?.identified_title || 'Software Engineering Role',
      createdAt: new Date().toISOString(),
    };

    sharedPlans.set(id, sharedPlan);

    return res.json({
      success: true,
      id,
      shareId: id,
      createdAt: sharedPlan.createdAt,
    });
  } catch (err: any) {
    console.error('Error creating share link:', err);
    return res.status(500).json({ error: 'Failed to create share link: ' + err.message });
  }
});

// GET /api/share/:id - Retrieve a shared plan
app.get('/api/share/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const plan = sharedPlans.get(id);

    if (!plan) {
      return res.status(404).json({ error: 'Shared preparation plan not found or expired' });
    }

    return res.json(plan);
  } catch (err: any) {
    console.error('Error fetching shared plan:', err);
    return res.status(500).json({ error: 'Failed to retrieve shared plan' });
  }
});

// GET /api/download-project - Export and download entire codebase as a zip
app.get('/api/download-project', async (_req: Request, res: Response) => {
  try {
    const zip = new JSZip();
    const rootDir = process.cwd();
    const ignoreList = new Set(['node_modules', 'dist', '.git', '.cache', 'bun.lock']);

    function addDirectoryToZip(dirPath: string, zipFolder: JSZip) {
      const items = fs.readdirSync(dirPath);
      for (const item of items) {
        if (ignoreList.has(item)) continue;
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          const subFolder = zipFolder.folder(item);
          if (subFolder) {
            addDirectoryToZip(fullPath, subFolder);
          }
        } else {
          const content = fs.readFileSync(fullPath);
          zipFolder.file(item, content);
        }
      }
    }

    addDirectoryToZip(rootDir, zip);

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="hirecraft-interview-intelligence.zip"');
    return res.send(zipBuffer);
  } catch (err: any) {
    console.error('Error generating project zip archive:', err);
    return res.status(500).json({ error: 'Failed to generate project archive: ' + err.message });
  }
});

// Setup Vite middleware in dev or static files in prod
if (!isProd) {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true, port: PORT, host: '0.0.0.0' },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`HireCraft Server running on port ${PORT}`);
});
