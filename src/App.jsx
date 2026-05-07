import { useState } from "react";

const chapters = [
  {
    num: 1,
    title: "Why Terraform",
    emoji: "🤔",
    tldr: "Servers used to be set up by clicking around GUIs. That was a disaster. Infrastructure as Code (IaC) fixes this — you write code to build, change, and destroy servers. Terraform is the most popular IaC tool in the market.",
    analogy: "Think of it like Git for your infrastructure. Just as you wouldn't manually edit production code without version control, you shouldn't manually click through AWS without IaC.",
    keyPoints: [
      { icon: "💥", label: "The Old Way", text: "Ops team manually configures servers → servers drift → bugs appear → nobody knows what's deployed → 3am pager alerts begin." },
      { icon: "🛠️", label: "5 Types of IaC Tools", text: "Ad hoc scripts (Bash) → Config mgmt (Ansible/Chef/Puppet) → Server templates (Docker/Packer) → Orchestration (Kubernetes) → Provisioning (Terraform). Terraform is a PROVISIONING tool." },
      { icon: "🏆", label: "Why Terraform wins", text: "Masterless, agentless, declarative, works across AWS/Azure/GCP, huge community, and HCL is easy to read. Chef/Puppet need extra servers just to manage your servers — that's extra cost and complexity." },
      { icon: "📝", label: "Declarative vs Procedural", text: "Ansible (procedural): 'Add 5 more servers.' Terraform (declarative): 'I want 15 servers.' Terraform figures out what already exists and only creates the diff. Massive win for large infra." },
    ],
    careerTip: "Hiring managers at Standard Bank, Deloitte, and BCX love seeing Terraform on CVs. It signals you understand DevOps — not just clicking AWS buttons.",
    syntax: `# Tell Terraform what you want, not how to get there
resource "aws_instance" "web_server" {
  count         = 15           # Just change this from 10 to 15
  ami           = "ami-0abc123"
  instance_type = "t2.micro"
}
# terraform plan → preview the diff
# terraform apply → make it happen`,
  },
  {
    num: 2,
    title: "Getting Started with Terraform",
    emoji: "🚀",
    tldr: "Install Terraform, connect it to AWS, and deploy your first real server with a load balancer. The core loop: write HCL → terraform init → terraform plan → terraform apply.",
    analogy: "Like writing a recipe (HCL config), then handing it to a robot chef (Terraform) who figures out exactly what ingredients are missing and goes shopping before cooking.",
    keyPoints: [
      { icon: "🔁", label: "The Core Loop", text: "Write .tf file → terraform init (download providers) → terraform plan (preview changes, like 'git diff') → terraform apply (deploy) → terraform destroy (nuke it)." },
      { icon: "🧱", label: "Resources & Providers", text: "Provider = plugin that talks to AWS/Azure/GCP. Resource = the thing you're creating (server, database, S3 bucket). Everything in Terraform is a resource." },
      { icon: "📤", label: "Input & Output Variables", text: "Variables make your code reusable. Outputs expose values (like server IP) after deploy — very useful for scripts and other modules." },
      { icon: "🔗", label: "Data Sources", text: "Read-only queries for existing infrastructure. e.g. 'give me the latest Ubuntu AMI ID' — you don't create it, you just reference it." },
    ],
    careerTip: "In interviews, explain the terraform plan → apply workflow. It shows you understand 'infrastructure as code review' — a senior engineering concept.",
    syntax: `provider "aws" { region = "us-east-1" }

resource "aws_instance" "example" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t2.micro"

  user_data = <<-EOF
    #!/bin/bash
    echo "Hello World" > index.html
    nohup busybox httpd -f -p 8080 &
  EOF
}

output "public_ip" {
  value = aws_instance.example.public_ip
}`,
  },
  {
    num: 3,
    title: "How to Manage Terraform State",
    emoji: "💾",
    tldr: "Terraform tracks what it deployed in a 'state file'. By default it's local — dangerous for teams. You store it remotely in S3 + lock it with DynamoDB so two people can't deploy at the same time.",
    analogy: "The state file is like Terraform's memory. Without it, every deploy would be like amnesia — it would try to recreate everything from scratch. Remote state = shared memory for the whole team.",
    keyPoints: [
      { icon: "⚠️", label: "The Problem", text: "If state is local, only you can deploy. If two people deploy simultaneously, state file gets corrupted. If you lose the file, Terraform doesn't know what's deployed." },
      { icon: "🪣", label: "S3 + DynamoDB Solution", text: "Store state in S3 (versioned, encrypted, durable). Use DynamoDB as a lock (prevents two people running apply simultaneously). This is the AWS best practice." },
      { icon: "🔐", label: "State Contains Secrets", text: "CRITICAL: Passwords you pass to resources end up in plain text in state files. Always encrypt your S3 backend and restrict access tightly." },
      { icon: "🏗️", label: "Isolation via File Layout", text: "Don't put all environments (dev/staging/prod) in one state file. Separate folders = separate state files = breaking production while testing staging is impossible." },
    ],
    careerTip: "State management is what separates junior 'I just followed a tutorial' Terraform from production-grade Terraform. Mention S3 backend + DynamoDB locking in any cloud interview.",
    syntax: `# backend.tf — remote state in S3
terraform {
  backend "s3" {
    bucket         = "my-company-terraform-state"
    key            = "prod/web/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-state-locks"  # 🔒 locking
    encrypt        = true                      # 🔐 encrypted
  }
}`,
  },
  {
    num: 4,
    title: "Reusable Infrastructure with Modules",
    emoji: "🧩",
    tldr: "Modules are reusable Terraform packages — like functions in code. Instead of copy-pasting 200 lines of EC2 config for every environment, you write it once as a module and call it everywhere.",
    analogy: "Like npm packages but for cloud infrastructure. You publish a 'web-server-cluster' module once, and staging, production, and dev all just call it with different parameters.",
    keyPoints: [
      { icon: "📁", label: "Module Structure", text: "main.tf (resources), variables.tf (inputs), outputs.tf (what it returns). Any folder with .tf files is a module." },
      { icon: "🔄", label: "Module Inputs & Outputs", text: "Pass data IN via variables. Get data OUT via outputs. Modules are self-contained black boxes — you only interact through these." },
      { icon: "🏷️", label: "Module Versioning", text: "Store modules in Git. Use tags as versions (v0.0.1, v0.0.2). Staging uses v0.0.2 to test, prod stays on v0.0.1 until you're confident." },
      { icon: "🚫", label: "Inline Blocks vs Separate Resources", text: "GOTCHA: Never use inline blocks in modules (e.g. ingress rules inside security groups). Use separate resources instead — more flexible and extendable." },
    ],
    careerTip: "Modules = DRY infrastructure code. If someone asks 'how do you scale Terraform across environments' in an interview, say: modules + versioned Git tags + separate backends per environment.",
    syntax: `# Calling a module from staging/main.tf
module "web_cluster" {
  source        = "github.com/my-org/modules//web-cluster?ref=v0.0.2"
  
  cluster_name  = "staging-web"
  instance_type = "t2.micro"
  min_size      = 2
  max_size      = 4
}

# Use the module's output
output "load_balancer_url" {
  value = module.web_cluster.alb_dns_name
}`,
  },
  {
    num: 5,
    title: "Loops, If-Statements & Deployments",
    emoji: "🔁",
    tldr: "Terraform has its own way of doing loops and conditionals — it's not a normal programming language. You use count, for_each, and dynamic blocks. Also: zero-downtime deployments with create_before_destroy.",
    analogy: "It's like SQL — powerful but weird. You can't write a for loop like Python. Instead you say 'create 3 copies of this' and Terraform figures out the loop.",
    keyPoints: [
      { icon: "🔢", label: "count — simple loops", text: "count = 3 creates 3 identical resources. Access each with resource[0], resource[1], resource[2]. Problem: deleting from the middle causes a cascade rename." },
      { icon: "🗺️", label: "for_each — map-based loops", text: "Better than count for most things. Uses a map/set so each resource has a stable key — no cascade renaming. Use this for creating IAM users, subnets, etc." },
      { icon: "❓", label: "Conditionals", text: "count = var.enable_thing ? 1 : 0 — if enable_thing is true, create the resource; if false, delete it. Clean on/off switch." },
      { icon: "⚡", label: "Zero-Downtime Deployments", text: "create_before_destroy + min_elb_capacity = blue-green deployments. Terraform creates new servers, waits for them to pass health checks, THEN destroys old ones. No downtime." },
    ],
    careerTip: "for_each vs count is a senior-level Terraform topic. The answer: use for_each for almost everything, count only for simple on/off conditionals.",
    syntax: `# for_each — preferred for creating multiple resources
variable "user_names" {
  default = ["alice", "bob", "charlie"]
}

resource "aws_iam_user" "users" {
  for_each = toset(var.user_names)
  name     = each.value
}

# Conditional resource (on/off switch)
resource "aws_cloudwatch_alarm" "high_cpu" {
  count = var.enable_monitoring ? 1 : 0
  # ...
}`,
  },
  {
    num: 6,
    title: "Managing Secrets with Terraform",
    emoji: "🔐",
    tldr: "Never hardcode passwords in your .tf files. The 3 approaches: environment variables (quick), encrypted files with KMS (version-control safe), and secret managers like AWS Secrets Manager (best for production).",
    analogy: "Hardcoding passwords in Terraform is like leaving your house key under the doormat AND checking the photo into Instagram. Your state file is your biggest risk — it stores secrets in plain text.",
    keyPoints: [
      { icon: "❌", label: "NEVER DO THIS", text: "password = 'MyPassword123' in your .tf files. It'll be in your Git history, in your state file, visible to anyone." },
      { icon: "🌍", label: "Environment Variables", text: "export TF_VAR_db_password='secret' before running terraform. Simple, works for personal use. Not great for CI/CD pipelines." },
      { icon: "📁", label: "Encrypted Files + KMS", text: "Encrypt credentials with AWS KMS → commit the encrypted file to Git → Terraform decrypts at runtime. Version controlled + safe. Tool: sops." },
      { icon: "🏦", label: "AWS Secrets Manager", text: "Best for prod. Store secrets in AWS console, read them in Terraform via data source. Supports rotation, audit logs, and access control." },
    ],
    careerTip: "Security interviewers LOVE asking about secrets management. Don't just say 'use environment variables' — mention Secrets Manager + encrypted S3 backend. Shows production maturity.",
    syntax: `# Reading from AWS Secrets Manager (production approach)
data "aws_secretsmanager_secret_version" "db_creds" {
  secret_id = "prod/database/credentials"
}

locals {
  db = jsondecode(
    data.aws_secretsmanager_secret_version.db_creds.secret_string
  )
}

resource "aws_db_instance" "prod_db" {
  username = local.db.username  # ✅ From secrets manager
  password = local.db.password  # ✅ Never in plain text
}`,
  },
  {
    num: 7,
    title: "Working with Multiple Providers",
    emoji: "🌐",
    tldr: "Terraform isn't just AWS. One config can deploy to AWS + Kubernetes + Cloudflare at the same time. You can even use multiple AWS accounts simultaneously — dev and prod in one terraform apply.",
    analogy: "Providers are adapters. Like how your laptop has USB-C but you buy an adapter for HDMI — Terraform uses providers to 'speak the language' of any cloud or service.",
    keyPoints: [
      { icon: "🔌", label: "Multiple Providers", text: "Use provider aliases to deploy to multiple AWS regions or accounts in the same config. Critical for disaster recovery setups." },
      { icon: "☸️", label: "Kubernetes Provider", text: "Deploy your EKS cluster in Terraform, then immediately deploy apps into it using the Kubernetes provider in the same codebase. No switching tools." },
      { icon: "🐳", label: "Docker Provider", text: "You can pull and run Docker containers with Terraform. Useful for local dev environments and testing." },
      { icon: "⚡", label: "Provider Version Pinning", text: "Always pin provider versions! required_providers with version = '~> 4.0'. Cloud providers break things in major versions." },
    ],
    careerTip: "Multi-provider Terraform is advanced. Even mentioning it in an interview signals you've worked on real enterprise setups. 'We used Terraform to provision EKS and then deploy apps into it' = strong signal.",
    syntax: `terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"          # Pin the version!
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
  }
}

# Deploy to two AWS regions simultaneously
provider "aws" { region = "us-east-1" }
provider "aws" {
  alias  = "west"
  region = "us-west-2"
}

resource "aws_s3_bucket" "backup" {
  provider = aws.west             # Uses the aliased provider
  bucket   = "my-west-backup"
}`,
  },
  {
    num: 8,
    title: "Production-Grade Terraform Code",
    emoji: "🏭",
    tldr: "Real production Terraform isn't a 50-line main.tf. It's versioned modules, separate environments, provisioners for edge cases, and a clear folder structure. This chapter is 'how companies actually use Terraform'.",
    analogy: "Chapter 2 is IKEA furniture from the box. Chapter 8 is a professionally designed and built kitchen. Same basic idea, completely different quality and scale.",
    keyPoints: [
      { icon: "📂", label: "Folder Structure", text: "modules/ (reusable code) + live/ (actual deployments). Inside live: stage/, prod/, global/. Inside each: separate folders per service = separate state files." },
      { icon: "🔧", label: "Provisioners (Use Sparingly)", text: "local-exec (run script on your machine) and remote-exec (run script on the server via SSH). Last resort only — prefer User Data scripts for AWS EC2." },
      { icon: "📦", label: "Terraform Registry", text: "Community modules at registry.terraform.io. Don't reinvent the wheel — modules for RDS, VPC, EKS already exist. Just read them before using." },
      { icon: "🧪", label: "Examples Folder", text: "Every reusable module should have an examples/ folder showing real usage. This is also what your automated tests will run against." },
    ],
    careerTip: "When asked 'describe your Terraform setup at work' in interviews, mention: modules in separate repo, versioned with Git tags, separate backend per environment, examples folder with working code.",
    syntax: `# Production folder structure
live/
  stage/
    services/
      web-app/
        main.tf    # Calls module with staging settings
        vars.tf
    data-stores/
      mysql/
        main.tf    # Separate state file from above!
  prod/
    services/
      web-app/
        main.tf    # Same module, production settings, v0.0.1
modules/
  services/
    web-app/
      main.tf      # The actual code — written ONCE
      variables.tf
      outputs.tf
  data-stores/
    mysql/`,
  },
  {
    num: 9,
    title: "How to Test Terraform Code",
    emoji: "🧪",
    tldr: "Infrastructure code needs tests too. The testing pyramid: static analysis → unit tests (with mocks) → integration tests (real AWS, real deploys) → end-to-end tests. Tool of choice: Terratest (written in Go).",
    analogy: "You wouldn't ship app code without tests. But most teams ship infrastructure code without tests and wonder why prod breaks randomly. Testing Terraform = confidence that your modules actually work.",
    keyPoints: [
      { icon: "🔍", label: "Static Analysis (Free!)", text: "terraform validate, terraform plan, tfsec, checkov, terrascan. No AWS needed. Catches syntax errors, security misconfigs, bad practices." },
      { icon: "🧪", label: "Unit Tests with Terratest", text: "Written in Go. Deploy the module → run assertions → destroy. Slow (minutes, not seconds) because it deploys real AWS resources. Isolate with separate AWS accounts." },
      { icon: "🔗", label: "Integration Tests", text: "Test multiple modules working together. e.g. 'does the web app actually connect to the database?' These are slow (10-15 minutes) but catch real bugs." },
      { icon: "🎯", label: "Test Isolation", text: "Never run tests against your real staging/prod accounts. Dedicated test AWS account only. Use unique IDs to avoid resource name clashes between parallel test runs." },
    ],
    careerTip: "Most candidates don't mention Terraform testing at all. If you can say 'I wrote Terratest unit tests for our modules' — you immediately stand out. Even knowing the concept exists puts you ahead of 80% of applicants.",
    syntax: `// Terratest example (Go)
func TestWebServerModule(t *testing.T) {
  t.Parallel()
  
  terraformOptions := &terraform.Options{
    TerraformDir: "../modules/web-server",
    Vars: map[string]interface{}{
      "server_port": 8080,
    },
  }
  
  defer terraform.Destroy(t, terraformOptions)  // Always cleanup!
  terraform.InitAndApply(t, terraformOptions)
  
  serverUrl := terraform.Output(t, terraformOptions, "url")
  http_helper.HttpGetWithRetry(t, serverUrl, nil, 200, "Hello", 10, 5*time.Second)
}`,
  },
  {
    num: 10,
    title: "How to Use Terraform as a Team",
    emoji: "👥",
    tldr: "Terraform at scale = code reviews, CI/CD pipelines, automated testing, and tools like Atlantis (auto-runs plan on PRs) and Terragrunt (DRY backends and environments). The workflow mirrors app development.",
    analogy: "Solo Terraform is like coding in Notepad. Team Terraform is like coding with Git, PRs, CI/CD, linting, and code reviews. Same language, completely different discipline.",
    keyPoints: [
      { icon: "🔄", label: "The Team Workflow", text: "Write code → PR + code review → Atlantis auto-runs plan → reviewer sees plan output → approve + merge → CI auto-applies. Nobody runs terraform apply from their laptop." },
      { icon: "🌿", label: "Terragrunt (DRY Tool)", text: "Removes copy-paste between environments. Write module config once in terragrunt.hcl, call it from each env with different vars. Handles backend config DRYly." },
      { icon: "🔒", label: "CI Server Security", text: "Never give your CI server permanent AWS admin keys. Use IAM roles + OIDC (temporary credentials). Add approval gates before production deploys." },
      { icon: "🚦", label: "Promote Across Environments", text: "v0.0.6 → dev → tests pass → staging → tests pass → production. Always run plan before apply at each stage. Terraform doesn't auto-rollback on errors!" },
    ],
    careerTip: "Enterprise cloud roles at Standard Bank and Absa care a LOT about this chapter. Showing you understand 'how Terraform works in a team' = you won't break prod on day one.",
    syntax: `# terragrunt.hcl — one file per env, DRY config
terraform {
  source = "github.com/my-org/modules//web-app?ref=v0.0.6"
}

# Terragrunt auto-generates the S3 backend from root config
# No more copy-pasting backend config between environments!

inputs = {
  cluster_name   = "web-app-staging"
  instance_type  = "t2.micro"
  min_size       = 2
  max_size       = 4
  enable_monitoring = true
}

# Then: terragrunt plan → review → terragrunt apply`,
  },
];

const ACCENT = "#F4A621";
const BG = "#0c0c10";
const CARD = "#121218";
const BORDER = "#1e1e2e";

export default function TerraformBook() {
  const [active, setActive] = useState(0);
  const [showCode, setShowCode] = useState(false);
  const [quizMode, setQuizMode] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState(null);

  const ch = chapters[active];

  const quizQuestions = [
    { q: "What's the difference between declarative and procedural IaC?", a: "Declarative = describe the end state (Terraform). Procedural = describe the steps (Ansible). Terraform's declarative approach means you just say 'I want 15 servers' and it figures out the diff." },
    { q: "Why is S3 + DynamoDB the standard Terraform backend?", a: "S3 stores state with versioning + encryption. DynamoDB provides locking so two people can't run apply simultaneously, which would corrupt the state file." },
    { q: "for_each vs count — when to use each?", a: "Use for_each for almost everything (stable keys, no cascade renaming). Use count only for simple on/off conditionals (count = var.enable ? 1 : 0)." },
    { q: "Why do secrets end up in state files?", a: "Even if you read passwords from Secrets Manager, Terraform writes all resource attributes — including passwords — to the state file in plain text. Always encrypt your backend." },
    { q: "What's the point of Terragrunt?", a: "Reduces copy-paste between environments. Write backend config and module config once, reuse across dev/staging/prod with different variables. Also adds automatic retries and sops integration." },
  ];

  const quiz = quizQuestions[active % quizQuestions.length];

  return (
    <div style={{
      fontFamily: "'Courier New', monospace",
      background: BG,
      minHeight: "100vh",
      color: "#d0d0c8",
    }}>
      {/* Header */}
      <div style={{
        borderBottom: `1px solid ${BORDER}`,
        padding: "1rem 1.25rem 0.75rem",
        background: "#0e0e14",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
          <div>
            <span style={{ color: ACCENT, fontSize: "0.65rem", letterSpacing: "0.15em" }}>TERRAFORM: UP & RUNNING</span>
            <div style={{ fontSize: "0.8rem", color: "#5a5a6a", marginTop: "0.1rem" }}>680 pages → the good parts</div>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={() => { setQuizMode(!quizMode); setQuizAnswer(null); }} style={{
              padding: "0.35rem 0.75rem",
              background: quizMode ? ACCENT : "transparent",
              border: `1px solid ${quizMode ? ACCENT : BORDER}`,
              color: quizMode ? "#000" : "#5a5a6a",
              borderRadius: 3,
              fontSize: "0.65rem",
              letterSpacing: "0.08em",
              cursor: "pointer",
            }}>QUIZ</button>
          </div>
        </div>

        {/* Chapter tabs */}
        <div style={{ display: "flex", gap: "0.3rem", overflowX: "auto", paddingBottom: "0.25rem" }}>
          {chapters.map((c, i) => (
            <button key={i} onClick={() => { setActive(i); setShowCode(false); setQuizAnswer(null); }} style={{
              flexShrink: 0,
              padding: "0.3rem 0.6rem",
              background: active === i ? ACCENT : "transparent",
              border: `1px solid ${active === i ? ACCENT : BORDER}`,
              color: active === i ? "#000" : "#5a5a6a",
              borderRadius: 3,
              fontSize: "0.65rem",
              fontFamily: "monospace",
              cursor: "pointer",
              fontWeight: active === i ? 700 : 400,
            }}>CH{c.num}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "1.25rem" }}>

        {quizMode ? (
          /* QUIZ MODE */
          <div>
            <div style={{ marginBottom: "1rem" }}>
              <span style={{ fontSize: "0.65rem", color: ACCENT, letterSpacing: "0.1em" }}>QUICK FIRE QUESTION</span>
            </div>
            <div style={{
              background: CARD,
              border: `1px solid ${BORDER}`,
              borderRadius: 6,
              padding: "1.25rem",
              marginBottom: "1rem",
            }}>
              <div style={{ fontSize: "1rem", color: "#f0ede8", lineHeight: 1.6, marginBottom: "1.25rem" }}>
                {quiz.q}
              </div>
              {!quizAnswer ? (
                <button onClick={() => setQuizAnswer(quiz.a)} style={{
                  padding: "0.6rem 1.25rem",
                  background: ACCENT,
                  border: "none",
                  borderRadius: 3,
                  color: "#000",
                  fontSize: "0.75rem",
                  fontFamily: "monospace",
                  fontWeight: 700,
                  cursor: "pointer",
                  letterSpacing: "0.05em",
                }}>REVEAL ANSWER</button>
              ) : (
                <div style={{
                  padding: "0.9rem 1rem",
                  background: "#0a1a0a",
                  border: `1px solid #1a3a1a`,
                  borderRadius: 4,
                  fontSize: "0.85rem",
                  lineHeight: 1.7,
                  color: "#a0e0a0",
                }}>{quizAnswer}</div>
              )}
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {chapters.map((_, i) => (
                <button key={i} onClick={() => { setActive(i); setQuizAnswer(null); }} style={{
                  flex: 1, padding: "0.4rem", background: "transparent",
                  border: `1px solid ${BORDER}`, borderRadius: 3,
                  color: "#3a3a4a", fontSize: "0.6rem", cursor: "pointer",
                }}>Q{i + 1}</button>
              ))}
            </div>
          </div>
        ) : (
          /* CHAPTER VIEW */
          <div>
            {/* Chapter header */}
            <div style={{ marginBottom: "1.25rem" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", marginBottom: "0.4rem" }}>
                <span style={{ fontSize: "2rem" }}>{ch.emoji}</span>
                <div>
                  <div style={{ fontSize: "0.65rem", color: "#5a5a6a", letterSpacing: "0.1em" }}>CHAPTER {ch.num}</div>
                  <h2 style={{ margin: 0, fontSize: "1.2rem", color: "#f0ede8", fontFamily: "monospace" }}>{ch.title}</h2>
                </div>
              </div>
            </div>

            {/* TL;DR */}
            <div style={{
              background: CARD,
              border: `1px solid ${ACCENT}33`,
              borderLeft: `3px solid ${ACCENT}`,
              borderRadius: "0 6px 6px 0",
              padding: "0.9rem 1rem",
              marginBottom: "1rem",
            }}>
              <div style={{ fontSize: "0.65rem", color: ACCENT, letterSpacing: "0.1em", marginBottom: "0.4rem" }}>TL;DR</div>
              <div style={{ fontSize: "0.88rem", lineHeight: 1.7 }}>{ch.tldr}</div>
            </div>

            {/* Analogy */}
            <div style={{
              background: "#0e1220",
              border: `1px solid #1e2a40`,
              borderRadius: 6,
              padding: "0.9rem 1rem",
              marginBottom: "1rem",
            }}>
              <div style={{ fontSize: "0.65rem", color: "#4a7aaa", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>💡 THE ANALOGY</div>
              <div style={{ fontSize: "0.85rem", lineHeight: 1.7, color: "#8ab0d8", fontStyle: "italic" }}>{ch.analogy}</div>
            </div>

            {/* Key points */}
            <div style={{ marginBottom: "1rem" }}>
              <div style={{ fontSize: "0.65rem", color: "#5a5a6a", letterSpacing: "0.1em", marginBottom: "0.6rem" }}>KEY CONCEPTS</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {ch.keyPoints.map((pt, i) => (
                  <div key={i} style={{
                    background: CARD,
                    border: `1px solid ${BORDER}`,
                    borderRadius: 5,
                    padding: "0.8rem 1rem",
                    display: "flex",
                    gap: "0.75rem",
                  }}>
                    <span style={{ fontSize: "1.1rem", flexShrink: 0, marginTop: "0.1rem" }}>{pt.icon}</span>
                    <div>
                      <div style={{ fontSize: "0.75rem", color: "#f0ede8", fontWeight: 700, marginBottom: "0.2rem" }}>{pt.label}</div>
                      <div style={{ fontSize: "0.82rem", color: "#8888a0", lineHeight: 1.6 }}>{pt.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Career tip */}
            <div style={{
              background: "#120e1a",
              border: `1px solid #2a1a3a`,
              borderRadius: 6,
              padding: "0.9rem 1rem",
              marginBottom: "1rem",
            }}>
              <div style={{ fontSize: "0.65rem", color: "#a060e0", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>🎯 CAREER TIP</div>
              <div style={{ fontSize: "0.85rem", lineHeight: 1.7, color: "#c090e8" }}>{ch.careerTip}</div>
            </div>

            {/* Code toggle */}
            <button onClick={() => setShowCode(!showCode)} style={{
              width: "100%",
              padding: "0.7rem",
              background: "transparent",
              border: `1px solid ${BORDER}`,
              borderRadius: 5,
              color: showCode ? ACCENT : "#5a5a6a",
              fontSize: "0.72rem",
              fontFamily: "monospace",
              letterSpacing: "0.08em",
              cursor: "pointer",
              marginBottom: showCode ? "0.75rem" : "0",
            }}>
              {showCode ? "▲ HIDE CODE EXAMPLE" : "▼ SHOW CODE EXAMPLE"}
            </button>

            {showCode && (
              <div style={{
                background: "#080810",
                border: `1px solid ${BORDER}`,
                borderRadius: 5,
                padding: "1rem",
                overflow: "auto",
              }}>
                <pre style={{
                  margin: 0,
                  fontSize: "0.75rem",
                  lineHeight: 1.7,
                  color: "#c8e6a0",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}>{ch.syntax}</pre>
              </div>
            )}

            {/* Nav */}
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.25rem" }}>
              <button onClick={() => { setActive(Math.max(0, active - 1)); setShowCode(false); }} disabled={active === 0} style={{
                flex: 1, padding: "0.6rem", background: "transparent",
                border: `1px solid ${active === 0 ? "#1a1a2a" : BORDER}`,
                color: active === 0 ? "#2a2a3a" : "#6a6a7a",
                borderRadius: 4, fontSize: "0.7rem", fontFamily: "monospace",
                cursor: active === 0 ? "default" : "pointer",
              }}>← PREV</button>
              <div style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.65rem", color: "#3a3a4a",
              }}>{active + 1} / {chapters.length}</div>
              <button onClick={() => { setActive(Math.min(chapters.length - 1, active + 1)); setShowCode(false); }} disabled={active === chapters.length - 1} style={{
                flex: 1, padding: "0.6rem", background: active === chapters.length - 1 ? "transparent" : ACCENT,
                border: `1px solid ${active === chapters.length - 1 ? "#1a1a2a" : ACCENT}`,
                color: active === chapters.length - 1 ? "#2a2a3a" : "#000",
                borderRadius: 4, fontSize: "0.7rem", fontFamily: "monospace",
                fontWeight: 700, cursor: active === chapters.length - 1 ? "default" : "pointer",
              }}>NEXT →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
