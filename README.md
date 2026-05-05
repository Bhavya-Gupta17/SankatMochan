# ⚡ SankatMochan: Autonomous Multi-Agent Negotiation for Crisis Resource Allocation

## 📌 Overview

This project simulates a **decentralized multi-agent system** for allocating limited resources (e.g., power) among critical infrastructures such as hospitals, emergency services, water supply, residential areas, and industry during crisis scenarios.

The system combines:

* A **rule-based simulation engine** for real-time allocation
* **AI-powered reasoning using Claude (LLM)** for intelligent decision-making and explainability

---

## 🎯 Objectives

* Efficient allocation of limited resources under constraints
* Simulation of **real-world infrastructure dependencies**
* Support **adaptive and intelligent decision-making**
* Provide **explainable insights** into allocation decisions

---

## 🧠 AIML Contribution

This project falls under the **Artificial Intelligence & Machine Learning domain** due to:

* 🤖 **Multi-Agent AI System**
  Each infrastructure is modeled as an independent agent making decisions.

* 🧠 **LLM-based Reasoning (Claude Integration)**
  Uses a pretrained large language model from Anthropic to:

  * Generate agent behavior dynamically
  * Perform negotiation and decision-making
  * Provide explainable outputs

* 🔍 **Explainable AI (XAI)**
  Displays reasoning behind decisions for transparency.

* ⚙️ **Heuristic + AI Hybrid System**
  Combines deterministic simulation with intelligent AI inference.

---

## 🏗️ System Architecture

```
User Input (UI)
      ↓
Simulation Engine (Rule-Based Agents)
      ↓
Agentic Claude Pipeline (AI Layer)
      ↓
Multi-Agent Negotiation
      ↓
Final Allocation + Reasoning
      ↓
Visualization Dashboard
```

---

## 🔁 Working Pipeline

1. **User inputs** scenario parameters (demand, event type, total resources)
2. **Simulation engine** computes baseline allocation using auction-based logic
3. **Claude AI layer**:

   * Dynamically generates agents
   * Produces independent proposals
   * Performs centralized arbitration
4. System outputs:

   * Optimized allocation
   * Risk analysis
   * AI-generated explanations

---

## 🌐 Decentralized Agent Design

* Each infrastructure is treated as an **independent agent**
* Agents:

  * Compute priorities
  * Submit bids
  * Compete for resources
* Interaction happens via:

  * Shared resource pool
  * Dependency graph
  * Negotiation mechanism

---

## 🧩 Key Features

* ⚡ Real-time simulation
* 🧠 AI-powered multi-agent negotiation
* 📊 Fairness & efficiency metrics
* 🔗 Dependency graph & cascade failure analysis
* 🤖 Claude-based intelligent reasoning
* 📈 Interactive visualization dashboard

---

## 🛠️ Tech Stack

**Frontend**

* React + TypeScript
* Tailwind CSS
* Vite

**Core Engine**

* TypeScript simulation engine
* Rule-based allocation logic

**AI Layer**

* Claude API (LLM)
* Prompt-based multi-agent orchestration

---

## 🚀 How It Works with Claude

* No model training is performed
* Uses **pretrained LLM inference**
* Agents are created dynamically via prompts
* Each agent generates independent decisions
* Final allocation is resolved through AI arbitration

---

## 📊 Use Cases

* Disaster management systems
* Smart grid optimization
* Urban infrastructure planning
* Emergency resource allocation

---

## 🏁 Conclusion

This project demonstrates how **multi-agent systems + AI reasoning** can be combined to solve complex real-world problems. By integrating simulation with LLM-based intelligence, it provides a scalable and explainable approach to crisis resource management.

---
