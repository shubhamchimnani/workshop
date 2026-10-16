import { getDateOffset, getTodayString } from '../types/task.js';

export function getInitialTasks() {
  const today = getTodayString();
  const yesterday = getDateOffset(-1);
  const threeDaysAgo = getDateOffset(-3);
  const tomorrow = getDateOffset(1);
  const inThreeDays = getDateOffset(3);
  const inFourDays = getDateOffset(4);
  const inSixDays = getDateOffset(6);
  const inEightDays = getDateOffset(8);
  const twoDaysAgo = getDateOffset(-2);
  const fourDaysAgo = getDateOffset(-4);

  return [
    {
      id: 'CD-101',
      title: 'Rotate AWS KMS root keys for SOC-2 Type II audit compliance',
      description: 'Audit team flagged 3 master customer keys approaching the 365-day rotation threshold. Coordinate rotation schedule with devops to prevent downtime.',
      dueDate: yesterday, // Overdue
      requester: 'Elena Rostova (Head of SecOps)',
      priority: 'Urgent',
      effort: 'Medium',
      status: 'In Progress',
      tags: ['Security', 'SOC-2', 'AWS'],
      createdAt: getDateOffset(-7)
    },
    {
      id: 'CD-102',
      title: 'Patch Redis token-bucket rate limiter bypass on /v2/checkout',
      description: 'Load testing identified burst traffic bypass when parallel requests hit edge clusters simultaneously. Add atomic EVAL scripts.',
      dueDate: today, // Due Today
      requester: 'Marcus Vance (Platform Architect)',
      priority: 'Urgent',
      effort: 'Small',
      status: 'To Do',
      tags: ['Backend', 'Redis', 'P0'],
      createdAt: getDateOffset(-2)
    },
    {
      id: 'CD-103',
      title: 'Migrate legacy Auth0 tenant to Okta Enterprise SAML 2.0 SSO',
      description: 'Enterprise tier customers need single sign-on with directory sync. Complete metadata exchange and staging identity provider test.',
      dueDate: today, // Due Today
      requester: 'Sarah Chen (VP Engineering)',
      priority: 'High',
      effort: 'Large',
      status: 'In Review',
      tags: ['Auth', 'Enterprise', 'SAML'],
      createdAt: getDateOffset(-5)
    },
    {
      id: 'CD-104',
      title: 'Fix race condition in Stripe webhook retry queue during billing spikes',
      description: 'Customer invoice double-charging edge case during synchronous db lock contention. Wrap webhook processing in distributed Redlock.',
      dueDate: threeDaysAgo, // Overdue
      requester: 'Derrick Zhang (Billing Lead)',
      priority: 'Urgent',
      effort: 'Medium',
      status: 'To Do',
      tags: ['Billing', 'Stripe', 'Reliability'],
      createdAt: getDateOffset(-6)
    },
    {
      id: 'CD-105',
      title: 'Benchmark Elasticsearch query latency degradation on p99 metrics',
      description: 'Aggregations across 14M search documents spiked from 42ms to 280ms after shard rebalancing. Revisit index routing keys.',
      dueDate: tomorrow,
      requester: 'Priya Patel (Data Infra)',
      priority: 'High',
      effort: 'Medium',
      status: 'In Progress',
      tags: ['Search', 'Elastic', 'Infra'],
      createdAt: getDateOffset(-3)
    },
    {
      id: 'CD-106',
      title: 'Resolve memory leak in WebSocket notification daemon under 50k conns',
      description: 'Node.js GC pauses reaching 1.8s. Heap dumps show uncleaned EventEmitters on disconnected client sockets.',
      dueDate: inThreeDays,
      requester: 'Liam O\'Connor (Realtime Lead)',
      priority: 'High',
      effort: 'Large',
      status: 'In Progress',
      tags: ['Node.js', 'Realtime', 'Perf'],
      createdAt: getDateOffset(-4)
    },
    {
      id: 'CD-107',
      title: 'Fix iOS Safari viewport scroll bounce clipping fixed bottom action bar',
      description: 'CSS dvh vs vh issue on mobile web checkout sheet. Ensure interactive keyboard resize does not obscure primary CTA button.',
      dueDate: inFourDays,
      requester: 'Chloe Dubois (Staff Mobile Eng)',
      priority: 'Medium',
      effort: 'Small',
      status: 'In Review',
      tags: ['Frontend', 'iOS', 'CSS'],
      createdAt: getDateOffset(-1)
    },
    {
      id: 'CD-108',
      title: 'Prepare Q4 multi-region Kubernetes capacity forecast & cost model',
      description: 'Compile node group utilization across us-east-1 and eu-central-1 for FinOps review ahead of annual budget renewal.',
      dueDate: inSixDays,
      requester: 'Kenji Takahashi (FinOps)',
      priority: 'Medium',
      effort: 'Large',
      status: 'To Do',
      tags: ['Cloud', 'K8s', 'FinOps'],
      createdAt: getDateOffset(-3)
    },
    {
      id: 'CD-109',
      title: 'Coordinate with Legal DPO on automated GDPR 30-day user purge script',
      description: 'Ensure soft-deleted accounts have cascading hard deletion scheduled across PostgreSQL, S3 asset buckets, and audit logs.',
      dueDate: inEightDays,
      requester: 'Hannah Schmidt (Compliance & Legal)',
      priority: 'Medium',
      effort: 'Medium',
      status: 'To Do',
      tags: ['Legal', 'GDPR', 'Compliance'],
      createdAt: getDateOffset(-2)
    },
    {
      id: 'CD-110',
      title: 'Bundle size optimization: Tree-shake legacy moment.js and lodash',
      description: 'Initial JS bundle exceeded 450kB budget. Migrate remaining date calculations to date-fns and remove duplicate bundle chunks.',
      dueDate: twoDaysAgo,
      requester: 'Tyler Brooks (Frontend Lead)',
      priority: 'Low',
      effort: 'Small',
      status: 'Done',
      tags: ['Frontend', 'Performance'],
      createdAt: getDateOffset(-10)
    },
    {
      id: 'CD-111',
      title: 'Implement zero-downtime blue/green deployment pipeline for Postgres',
      description: 'Add automated pre-migration backward-compatible validation check to CI/CD before running Prisma schema migrations.',
      dueDate: yesterday,
      requester: 'DevOps On-Call Team',
      priority: 'High',
      effort: 'Large',
      status: 'Done',
      tags: ['DevOps', 'Postgres', 'CI/CD'],
      createdAt: getDateOffset(-8)
    },
    {
      id: 'CD-112',
      title: 'Draft RFC for event-driven async notification service architecture',
      description: 'Synthesize requirements from Product, Mobile, and Growth teams. Propose Kafka vs AWS SQS/SNS comparison matrix.',
      dueDate: fourDaysAgo,
      requester: 'Sarah Chen (VP Engineering)',
      priority: 'Low',
      effort: 'Medium',
      status: 'Done',
      tags: ['Architecture', 'RFC', 'Kafka'],
      createdAt: getDateOffset(-12)
    }
  ];
}

export const SAMPLE_PROMPTS = [
  {
    title: 'Sprint Retro & Security Action Items',
    text: `Sprint Retro commitments with Sarah Chen:
1. Urgent: Patch the JWT refresh token replay vulnerability on auth service before Friday, Derrick Zhang requested, Small effort.
2. Elena wants an automated Terraform script to enforce AWS bucket encryption by next Monday, Medium effort.
3. High priority: Benchmark cold start latency on Lambda edge workers by tomorrow, Tyler Brooks, Large effort.`
  },
  {
    title: 'Mobile App 2.4 Release Sync',
    text: `Meeting notes with Chloe Dubois (Staff Mobile Eng):
- High: Update Apple push notification certificate before Thursday. Assigned to Liam O'Connor. Medium effort.
- Urgent: Fix keyboard dismiss gesture freezing on Android 14 checkout view, due by today. Small effort.
- Kenji requested we document the in-app analytics event naming schema by next week, Small effort.`
  },
  {
    title: 'Quick Ad-hoc Request',
    text: `Hannah Schmidt from legal says we need to update the GDPR cookie consent modal banner text by tomorrow, Small effort.`
  }
];
