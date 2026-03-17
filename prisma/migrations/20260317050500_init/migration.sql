-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "DiagnosticSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "topicId" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "messages" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DiagnosticSession_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "KnowledgeProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "topicId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "strengths" TEXT NOT NULL DEFAULT '[]',
    "weaknesses" TEXT NOT NULL DEFAULT '[]',
    "misconceptions" TEXT NOT NULL DEFAULT '[]',
    "rawAssessment" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "KnowledgeProfile_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LearningPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "topicId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LearningPlan_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LearningPiece" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "planId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LearningPiece_planId_fkey" FOREIGN KEY ("planId") REFERENCES "LearningPlan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContentVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pieceId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "mdxContent" TEXT NOT NULL,
    "jsxComponents" TEXT NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "generationReason" TEXT NOT NULL DEFAULT 'initial',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ContentVersion_pieceId_fkey" FOREIGN KEY ("pieceId") REFERENCES "LearningPiece" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pieceId" TEXT NOT NULL,
    "contentVersionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "expectedAnswer" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Exercise_pieceId_fkey" FOREIGN KEY ("pieceId") REFERENCES "LearningPiece" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Exercise_contentVersionId_fkey" FOREIGN KEY ("contentVersionId") REFERENCES "ContentVersion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Evaluation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "exerciseId" TEXT NOT NULL,
    "userAnswer" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "feedback" TEXT NOT NULL,
    "triggeredRegen" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Evaluation_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RateLimitLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agentName" TEXT NOT NULL,
    "tokensUsed" INTEGER NOT NULL DEFAULT 0,
    "costEstimate" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeProfile_topicId_key" ON "KnowledgeProfile"("topicId");

-- CreateIndex
CREATE UNIQUE INDEX "LearningPlan_topicId_key" ON "LearningPlan"("topicId");
