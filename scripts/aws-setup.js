const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

class AWSSetup {
  constructor() {
    this.deploymentMethods = {
      'ecs': 'Amazon ECS with Fargate',
      'eb': 'Elastic Beanstalk',
      'ec2': 'EC2 with Docker',
      'eks': 'Amazon EKS (Kubernetes)'
    };
  }

  createDockerCompose() {
    console.log(chalk.blue('📝 Creating AWS-ready docker-compose.yml...'));
    
    const awsCompose = `version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "80:3000"
    environment:
      NODE_ENV: production
      PORT: 3000
      MONGODB_URI: \${MONGODB_URI}
      JWT_SECRET: \${JWT_SECRET}
      JWT_EXPIRES_IN: \${JWT_EXPIRES_IN:-7d}
      BCRYPT_ROUNDS: \${BCRYPT_ROUNDS:-12}
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
        reservations:
          memory: 256M
          cpus: '0.25'
    logging:
      driver: awslogs
      options:
        awslogs-group: "/aws/ecs/primrose"
        awslogs-region: us-east-1
        awslogs-stream-prefix: "ecs"
`;

    fs.writeFileSync('docker-compose.aws.yml', awsCompose);
    console.log(chalk.green('✅ Created docker-compose.aws.yml'));
  }

  createECSTaskDefinition() {
    console.log(chalk.blue('📝 Creating ECS task definition...'));
    
    const taskDefinition = {
      family: "primrose-backend",
      networkMode: "awsvpc",
      requiresCompatibilities: ["FARGATE"],
      cpu: "256",
      memory: "512",
      executionRoleArn: "arn:aws:iam::YOUR_ACCOUNT:role/ecsTaskExecutionRole",
      taskRoleArn: "arn:aws:iam::YOUR_ACCOUNT:role/ecsTaskRole",
      containerDefinitions: [
        {
          name: "primrose-app",
          image: "YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/primrose-backend:latest",
          portMappings: [
            {
              containerPort: 3000,
              protocol: "tcp"
            }
          ],
          environment: [
            { name: "NODE_ENV", value: "production" },
            { name: "PORT", value: "3000" }
          ],
          secrets: [
            {
              name: "JWT_SECRET",
              valueFrom: "arn:aws:secretsmanager:us-east-1:YOUR_ACCOUNT:secret:primrose/jwt-secret"
            },
            {
              name: "MONGODB_URI",
              valueFrom: "arn:aws:secretsmanager:us-east-1:YOUR_ACCOUNT:secret:primrose/mongodb-uri"
            }
          ],
          logConfiguration: {
            logDriver: "awslogs",
            options: {
              "awslogs-group": "/aws/ecs/primrose",
              "awslogs-region": "us-east-1",
              "awslogs-stream-prefix": "ecs"
            }
          },
          healthCheck: {
            command: ["CMD-SHELL", "node -e \"require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })\""],
            interval: 30,
            timeout: 5,
            retries: 3,
            startPeriod: 60
          }
        }
      ]
    };

    fs.writeFileSync('aws/ecs-task-definition.json', JSON.stringify(taskDefinition, null, 2));
    console.log(chalk.green('✅ Created aws/ecs-task-definition.json'));
  }

  createCloudFormationTemplate() {
    console.log(chalk.blue('📝 Creating CloudFormation template...'));
    
    const template = {
      AWSTemplateFormatVersion: "2010-09-09",
      Description: "Primrose Backend Infrastructure",
      Parameters: {
        Environment: {
          Type: "String",
          Default: "production",
          AllowedValues: ["staging", "production"]
        },
        VpcId: {
          Type: "AWS::EC2::VPC::Id",
          Description: "VPC ID for the application"
        },
        SubnetIds: {
          Type: "List<AWS::EC2::Subnet::Id>",
          Description: "Subnet IDs for the application"
        }
      },
      Resources: {
        ECSCluster: {
          Type: "AWS::ECS::Cluster",
          Properties: {
            ClusterName: { "Fn::Sub": "primrose-${Environment}" }
          }
        },
        ALB: {
          Type: "AWS::ElasticLoadBalancingV2::LoadBalancer",
          Properties: {
            Name: { "Fn::Sub": "primrose-alb-${Environment}" },
            Scheme: "internet-facing",
            Type: "application",
            Subnets: { Ref: "SubnetIds" },
            SecurityGroups: [{ Ref: "ALBSecurityGroup" }]
          }
        },
        ALBSecurityGroup: {
          Type: "AWS::EC2::SecurityGroup",
          Properties: {
            GroupDescription: "Security group for ALB",
            VpcId: { Ref: "VpcId" },
            SecurityGroupIngress: [
              {
                IpProtocol: "tcp",
                FromPort: 80,
                ToPort: 80,
                CidrIp: "0.0.0.0/0"
              },
              {
                IpProtocol: "tcp",
                FromPort: 443,
                ToPort: 443,
                CidrIp: "0.0.0.0/0"
              }
            ]
          }
        },
        ECSService: {
          Type: "AWS::ECS::Service",
          Properties: {
            ServiceName: { "Fn::Sub": "primrose-service-${Environment}" },
            Cluster: { Ref: "ECSCluster" },
            TaskDefinition: { Ref: "ECSTaskDefinition" },
            DesiredCount: 2,
            LaunchType: "FARGATE",
            NetworkConfiguration: {
              AwsvpcConfiguration: {
                Subnets: { Ref: "SubnetIds" },
                SecurityGroups: [{ Ref: "ECSSecurityGroup" }],
                AssignPublicIp: "ENABLED"
              }
            },
            LoadBalancers: [
              {
                ContainerName: "primrose-app",
                ContainerPort: 3000,
                TargetGroupArn: { Ref: "ALBTargetGroup" }
              }
            ]
          }
        }
      },
      Outputs: {
        LoadBalancerDNS: {
          Description: "DNS name of the load balancer",
          Value: { "Fn::GetAtt": ["ALB", "DNSName"] }
        }
      }
    };

    if (!fs.existsSync('aws')) {
      fs.mkdirSync('aws');
    }

    fs.writeFileSync('aws/cloudformation-template.json', JSON.stringify(template, null, 2));
    console.log(chalk.green('✅ Created aws/cloudformation-template.json'));
  }

  createDeploymentScripts() {
    console.log(chalk.blue('📝 Creating AWS deployment scripts...'));
    
    const deployScript = `#!/bin/bash
# AWS Deployment Script for Primrose Backend

set -e

ENVIRONMENT=\${1:-production}
AWS_REGION=\${2:-us-east-1}
AWS_ACCOUNT_ID=\${3:-YOUR_ACCOUNT_ID}

echo "🚀 Deploying Primrose Backend to AWS (\$ENVIRONMENT)"

# Build and push Docker image to ECR
echo "📦 Building and pushing Docker image..."
aws ecr get-login-password --region \$AWS_REGION | docker login --username AWS --password-stdin \$AWS_ACCOUNT_ID.dkr.ecr.\$AWS_REGION.amazonaws.com

docker build -t primrose-backend .
docker tag primrose-backend:latest \$AWS_ACCOUNT_ID.dkr.ecr.\$AWS_REGION.amazonaws.com/primrose-backend:latest
docker push \$AWS_ACCOUNT_ID.dkr.ecr.\$AWS_REGION.amazonaws.com/primrose-backend:latest

# Deploy CloudFormation stack
echo "🏗️  Deploying CloudFormation stack..."
aws cloudformation deploy \\
  --template-file aws/cloudformation-template.json \\
  --stack-name primrose-\$ENVIRONMENT \\
  --parameter-overrides Environment=\$ENVIRONMENT \\
  --capabilities CAPABILITY_IAM \\
  --region \$AWS_REGION

# Update ECS service
echo "🔄 Updating ECS service..."
aws ecs update-service \\
  --cluster primrose-\$ENVIRONMENT \\
  --service primrose-service-\$ENVIRONMENT \\
  --force-new-deployment \\
  --region \$AWS_REGION

echo "✅ Deployment completed!"
echo "🌐 Check AWS Console for load balancer URL"
`;

    fs.writeFileSync('aws/deploy.sh', deployScript);
    console.log(chalk.green('✅ Created aws/deploy.sh'));
  }

  createTerraformConfig() {
    console.log(chalk.blue('📝 Creating Terraform configuration...'));
    
    const terraformMain = `terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Variables
variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "primrose"
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

# VPC and networking
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "\${var.app_name}-vpc-\${var.environment}"
    Environment = var.environment
  }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name        = "\${var.app_name}-igw-\${var.environment}"
    Environment = var.environment
  }
}

resource "aws_subnet" "public" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.\${count.index + 1}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  map_public_ip_on_launch = true

  tags = {
    Name        = "\${var.app_name}-public-subnet-\${count.index + 1}-\${var.environment}"
    Environment = var.environment
  }
}

# Outputs
output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = aws_subnet.public[*].id
}
`;

    if (!fs.existsSync('terraform')) {
      fs.mkdirSync('terraform');
    }

    fs.writeFileSync('terraform/main.tf', terraformMain);
    console.log(chalk.green('✅ Created terraform/main.tf'));
  }

  generateDocumentation() {
    console.log(chalk.blue('📝 Creating AWS deployment documentation...'));
    
    const documentation = `# AWS Deployment Guide

## Prerequisites

1. **AWS CLI** installed and configured
2. **Docker** installed
3. **AWS Account** with appropriate permissions
4. **ECR Repository** created for the application

## Deployment Options

### Option 1: Amazon ECS with Fargate (Recommended)

\`\`\`bash
# 1. Create ECR repository
aws ecr create-repository --repository-name primrose-backend

# 2. Deploy using CloudFormation
./aws/deploy.sh production us-east-1 YOUR_ACCOUNT_ID
\`\`\`

### Option 2: Terraform Infrastructure

\`\`\`bash
cd terraform
terraform init
terraform plan -var="environment=production"
terraform apply
\`\`\`

### Option 3: Elastic Beanstalk

\`\`\`bash
# Initialize EB application
eb init primrose-backend
eb create production-env
eb deploy
\`\`\`

## Environment Variables

Set these in AWS Systems Manager Parameter Store or Secrets Manager:

- \`JWT_SECRET\` - Strong random string (256-bit)
- \`MONGODB_URI\` - MongoDB connection string
- \`ALLOWED_ORIGINS\` - Production domain URLs

## Monitoring

- **CloudWatch Logs**: Application logs
- **CloudWatch Metrics**: Container metrics
- **X-Ray**: Distributed tracing (optional)
- **AWS Config**: Compliance monitoring

## Security Checklist

- [ ] Secrets stored in AWS Secrets Manager
- [ ] VPC with private subnets
- [ ] Security groups with minimal access
- [ ] IAM roles with least privilege
- [ ] WAF configured for web application firewall
- [ ] SSL/TLS certificates from ACM

## Cost Optimization

- Use Fargate Spot for non-production
- Configure auto-scaling policies
- Set up CloudWatch billing alarms
- Use reserved capacity for predictable workloads

## Disaster Recovery

- Multi-AZ deployment
- Automated backups
- Cross-region replication (if needed)
- Infrastructure as Code for rapid recovery
`;

    fs.writeFileSync('aws/README.md', documentation);
    console.log(chalk.green('✅ Created aws/README.md'));
  }

  async setupAWS() {
    console.log(chalk.blue('🏗️  Setting up AWS deployment infrastructure...\n'));
    
    try {
      // Create AWS directory
      if (!fs.existsSync('aws')) {
        fs.mkdirSync('aws');
      }

      this.createDockerCompose();
      this.createECSTaskDefinition();
      this.createCloudFormationTemplate();
      this.createDeploymentScripts();
      this.createTerraformConfig();
      this.generateDocumentation();

      console.log(chalk.green('\n✅ AWS setup completed!\n'));
      
      console.log(chalk.blue('📋 Next Steps:'));
      console.log('1. Update AWS account IDs in the configuration files');
      console.log('2. Create ECR repository: aws ecr create-repository --repository-name primrose-backend');
      console.log('3. Store secrets in AWS Secrets Manager');
      console.log('4. Review and customize CloudFormation template');
      console.log('5. Deploy using: ./aws/deploy.sh production');
      
      console.log(chalk.blue('\n📖 Documentation:'));
      console.log('- AWS deployment guide: aws/README.md');
      console.log('- CloudFormation template: aws/cloudformation-template.json');
      console.log('- Terraform config: terraform/main.tf');
      
    } catch (error) {
      console.error(chalk.red('❌ AWS setup failed:'), error.message);
      return 1;
    }
    
    return 0;
  }
}

// Command line interface
async function main() {
  const setup = new AWSSetup();
  const exitCode = await setup.setupAWS();
  process.exit(exitCode);
}

if (require.main === module) {
  main();
}

module.exports = { AWSSetup }; 