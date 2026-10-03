import { JobPreset } from '../types';

export const SAMPLE_JOB_DESCRIPTIONS: JobPreset[] = [
  {
    id: 'senior-fullstack',
    title: 'Senior Full-Stack Engineer (Fintech & Payments)',
    company_type: 'High-Growth Fintech Unicorn',
    experience_level: 'Senior',
    tags: ['React 19', 'TypeScript', 'Node.js', 'PostgreSQL', 'Kafka', 'AWS'],
    description: `About the Role:
We are seeking a Senior Full-Stack Engineer to join our Core Ledger and Payment Services team. You will be responsible for architecting and executing high-throughput, fault-tolerant financial transaction systems processing over $500M in daily transaction volume with sub-100ms P99 latency.

Key Responsibilities:
- Design, build, and maintain mission-critical distributed services in Node.js/TypeScript and Go.
- Architect real-time, responsive web applications using React 19, TypeScript, and state synchronization pipelines with WebSockets.
- Optimize and scale relational databases (PostgreSQL) using connection pooling, table partitioning, and advanced indexing for heavy write workloads.
- Implement robust event-driven workflows with Apache Kafka, ensuring exactly-once processing semantics and transactional outbox patterns.
- Partner with Product and Security to implement zero-trust authentication, KYC verification, and rigorous PCI-DSS compliance standards.
- Mentor junior and mid-level engineers, drive RFC architecture reviews, and participate in an on-call rotation with blameless post-mortems.

Requirements:
- 5+ years of production experience shipping high-scale web applications and distributed backend microservices.
- Mastery of TypeScript across the entire stack (Node.js and modern React).
- Deep experience with relational data modeling, query optimization, ACID transactions, and database migration strategies in PostgreSQL.
- Proven experience with distributed messaging systems (Kafka, RabbitMQ, or AWS SQS).
- Solid understanding of Docker, Kubernetes, CI/CD pipelines, and cloud services (AWS or GCP).
- Strong empathy for developer velocity, automated testing (unit, integration, e2e), and clean architecture.`
  },
  {
    id: 'junior-frontend',
    title: 'Junior Frontend Developer (Web Platform)',
    company_type: 'Modern SaaS Platform',
    experience_level: 'Junior',
    tags: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'REST APIs', 'Vitest'],
    description: `About the Role:
We are looking for a curious and motivated Junior Frontend Developer to join our Growth and Onboarding engineering team. You will collaborate closely with UI/UX designers and senior engineers to build delighting, accessible, and fast web experiences for hundreds of thousands of users.

What You Will Do:
- Build modular, accessible UI components in React and TypeScript using Tailwind CSS.
- Integrate frontend views with RESTful and GraphQL backend APIs, handling loading, error, and optimistic states smoothly.
- Write unit and component tests with Vitest and React Testing Library to ensure visual and logic stability.
- Participate in code reviews, bug triages, and team sprint planning.
- Optimize web vitals, image delivery, and client-side performance.

What We Look For:
- 0 to 2 years of professional or strong internship/project experience in frontend web development.
- Strong fundamentals in modern JavaScript (ES6+), HTML5 semantic markup, and CSS3 / Tailwind CSS.
- Hands-on familiarity with React hooks (useState, useEffect, useMemo, custom hooks).
- Basic understanding of Git, pull requests, and branch workflows.
- Eagerness to learn, ask thoughtful questions, and receive constructive code feedback.`
  },
  {
    id: 'mid-backend-systems',
    title: 'Mid-Level Backend Engineer (Distributed Systems)',
    company_type: 'Cloud Infrastructure & Developer Tools',
    experience_level: 'Mid',
    tags: ['Go / Golang', 'gRPC', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes'],
    description: `About the Role:
Our Infrastructure Platform team is hiring a Mid-Level Backend Engineer to expand our global API gateway and edge telemetry pipeline. You will help build services that ingest, validate, and route billions of events every day with high availability.

Responsibilities:
- Develop microservices and concurrent worker pools in Go (Golang) communicating over gRPC and Protobuf.
- Design resilient caching layers using Redis (cache-aside, token bucket rate limiters, distributed locks).
- Maintain and tune PostgreSQL schemas, writing performant SQL migrations and monitoring index bloat.
- Instrument services with OpenTelemetry, Prometheus metrics, and Grafana dashboards for proactive incident alerting.
- Work with Docker containers deployed on Kubernetes via Helm charts and GitHub Actions CI/CD.

Qualifications:
- 2-4 years of software development experience with backend systems (Go, Java, or Rust preferred).
- Solid grasp of concurrency paradigms (goroutines, channels, race condition mitigation, mutexes).
- Working knowledge of HTTP/2, REST, and gRPC communication protocols.
- Experience with relational databases and key-value datastores.
- Comfort with Linux environments, shell scripting, and containerized deployments.`
  },
  {
    id: 'staff-ml-platform',
    title: 'Staff AI/ML Platform Engineer',
    company_type: 'Generative AI & Enterprise Intelligence Lab',
    experience_level: 'Staff / Lead',
    tags: ['Python', 'PyTorch', 'Vector DBs', 'Kubernetes GPU', 'Triton', 'LLM Ops'],
    description: `About the Role:
We are looking for a Staff AI/ML Platform Engineer to lead the architecture of our next-generation enterprise Generative AI inference and fine-tuning platform. You will steer technical roadmaps across distributed GPU clusters, vector embeddings pipelines, and low-latency agent orchestration engines.

What You Will Lead:
- Architect scalable model serving infrastructure supporting Triton Inference Server, vLLM, and TensorRT-LLM with dynamic batching and speculative decoding.
- Design petabyte-scale vector indexing and semantic retrieval pipelines using Milvus/Pinecone and distributed embeddings cache.
- Build resilient agent execution runtimes supporting multi-step tool calling, guardrails, and streaming response delivery.
- Set cross-organizational standards for ML observability, token economics, latency SLIs, and GPU cluster utilization.
- Guide engineering leads and senior engineers through complex multi-quarter infrastructure transformations.

Requirements:
- 8+ years of engineering experience with at least 3 years focused on production ML/AI infrastructure and distributed systems.
- Deep expertise in Kubernetes GPU scheduling, CUDA drivers, and container virtualization for deep learning workloads.
- Mastery of distributed storage, streaming systems (Kafka), and hybrid search architectures.
- Track record of writing technical strategy documents, RFCs, and driving cross-functional alignment across AI Research and Product teams.`
  }
];
