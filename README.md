<div align="center">

<img src="https://placehold.co/1200x280/6a0dad/ffffff?text=SkillVerse+%F0%9F%8E%AE&font=montserrat" alt="SkillVerse Banner" width="100%"/>

<br/>

# 🎮 SkillVerse

### *Live a Day. Learn a Life.*

**A browser-based life-simulation game that turns everyday decisions into real-world skills.**

Built for **IEEE WIE ILS 2026 National Hackathon** — *Empower to Inspire: Thriving Together for an Inclusive and Sustainable Future*

<br/>

![Team](https://img.shields.io/badge/Team-The%20CodeX-6a0dad?style=for-the-badge)
![Problem Statement](https://img.shields.io/badge/PS--3-Gamified%20Vocational%20Learning-c2185b?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Prototype%20Build-ff69b4?style=for-the-badge)

![Engine](https://img.shields.io/badge/Engine-Phaser%203-8b5cf6?style=flat-square&logo=phaser&logoColor=white)
![Language](https://img.shields.io/badge/Language-TypeScript%20%2F%20JavaScript-3178c6?style=flat-square&logo=typescript&logoColor=white)
![Hosting](https://img.shields.io/badge/Hosted%20on-GitHub%20Pages%20%7C%20Vercel-181717?style=flat-square&logo=github&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-2e7d32?style=flat-square)

</div>

<br/>

## 🌸 Table of Contents

- [What is SkillVerse?](#-what-is-skillverse)
- [The Problem](#-the-problem)
- [World Previews](#-world-previews)
- [How It Works](#-how-it-works)
- [The Five Pillars](#-the-five-pillars-skill-dashboard)
- [What Makes It Different](#-what-makes-it-different)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Roadmap / Build Milestones](#-roadmap--build-milestones)
- [Expected Impact](#-expected-impact)
- [Team](#-meet-the-team)
- [Getting Started](#-getting-started)
- [License](#-license)

<br/>

## 🌱 What is SkillVerse?

> SkillVerse is a **web-based life-simulation game** where a child lives one complete virtual day — waking up, doing chores, attending school, tending a farm, selling goods at the market, and reflecting at night on what they've learned.

Instead of quizzes and textbook recall, players are dropped into realistic scenarios — *a leaking pipe, a scarce water source, a tough negotiation* — and must **choose**. Every choice has a visible, lasting consequence on their character, their world, and their evolving skill profile.

**Learning happens through experience, not instruction.** 🌟

<br/>

## 🎯 The Problem

Children learn concepts in class but rarely get the chance to *practice* them — decision-making, money management, digital literacy, sustainability, and entrepreneurial thinking are all skills built through repetition, not memorization.

This gap is echoed by real frameworks, not just our assumption:

| Source | What it says |
|---|---|
| 🇮🇳 **NEP 2020** | Mandates experiential & vocational learning from Grade 6 onward |
| 🏛️ **Ministry of Education** | Calls for vocational education to be more accessible, flexible & inclusive |
| 🌍 **UNICEF India** | Identifies decision-making, empathy, teamwork & goal-setting as core life skills best learned through real practice |

SkillVerse gives children a **safe, low-risk sandbox** to make decisions, see consequences, and learn from mistakes — right when habits are forming (ages 11–14).

<br/>

## 🖼️ World Previews

> 🎨 *Mockups below are placeholder art — final in-game visuals are being built in Phaser 3.*

<table>
<tr>
<td align="center" width="33%">
<img src="https://placehold.co/380x220/2e7d32/ffffff?text=%F0%9F%8F%A0+Home+World&font=montserrat" width="100%"/>
<br/><b>🏠 Home World</b><br/><sub>Leaking pipes · Waste sorting · Safety</sub>
</td>
<td align="center" width="33%">
<img src="https://placehold.co/380x220/1565c0/ffffff?text=%F0%9F%8F%AB+School+World&font=montserrat" width="100%"/>
<br/><b>🏫 School World</b><br/><sub>Coding · Teamwork · Communication</sub>
</td>
<td align="center" width="33%">
<img src="https://placehold.co/380x220/558b2f/ffffff?text=%F0%9F%8C%BE+Farm+World&font=montserrat" width="100%"/>
<br/><b>🌾 Farm World</b><br/><sub>Planting · Water budgeting · Weather</sub>
</td>
</tr>
<tr>
<td align="center" width="33%">
<img src="https://placehold.co/380x220/c2185b/ffffff?text=%F0%9F%9B%92+Market+World&font=montserrat" width="100%"/>
<br/><b>🛒 Market World</b><br/><sub>Negotiation · Pricing · Promotion</sub>
</td>
<td align="center" width="33%">
<img src="https://placehold.co/380x220/6a0dad/ffffff?text=%E2%9C%A8+Dream+World&font=montserrat" width="100%"/>
<br/><b>✨ Dream World</b><br/><sub>Imagine future goals & passions</sub>
</td>
<td align="center" width="33%">
<img src="https://placehold.co/380x220/e6a817/ffffff?text=%F0%9F%93%8A+Skill+Dashboard&font=montserrat" width="100%"/>
<br/><b>📊 Skill Dashboard</b><br/><sub>Five-pillar end-of-day review</sub>
</td>
</tr>
</table>

<br/>

## 🔄 How It Works

Every phase follows the same loop: **situation → decision → result → visible effect.**

```mermaid
flowchart TD
    A(["🌅 Wake Up"]) --> B["🏠 Home<br/><sub>Leaking pipes · Electricity · Waste sorting</sub>"]
    B --> C["🏫 School / Digital Lab<br/><sub>Communication · Collaboration · Coding</sub>"]
    C --> D["🌾 Farm<br/><sub>Planting · Water distribution · Weather</sub>"]
    D --> E["🛒 Market / Marketing<br/><sub>Negotiation · Money decisions · Promotion</sub>"]
    E --> F["📊 End-of-Day Review<br/><sub>Five-Pillar skill chart updates</sub>"]
    F --> G(["✨ Dream World<br/><sub>Imagine future goals</sub>"])
    G -->|Loop repeats · skills carry over| A

    style A fill:#ffd6e8,stroke:#c2185b,stroke-width:2px,color:#4a004a
    style B fill:#d9f2e6,stroke:#2e7d32,stroke-width:2px,color:#1b3a1f
    style C fill:#d9f2e6,stroke:#2e7d32,stroke-width:2px,color:#1b3a1f
    style D fill:#d9f2e6,stroke:#2e7d32,stroke-width:2px,color:#1b3a1f
    style E fill:#d9f2e6,stroke:#2e7d32,stroke-width:2px,color:#1b3a1f
    style F fill:#fff3cd,stroke:#e6a817,stroke-width:2px,color:#4a3800
    style G fill:#e6d9ff,stroke:#6a0dad,stroke-width:2px,color:#2a0033
```

The magic: skills and consequences **carry over** between worlds. A water-management mistake on the Farm can ripple into the Market. Nothing resets — the child is building *one persistent character*, not five disconnected mini-games.

<br/>

## 🌈 The Five Pillars (Skill Dashboard)

Success isn't tracked with marks — it's tracked across five growing skill pillars, visible to the child, parents, and teachers alike.

| Pillar | Icon | Built Through |
|---|:---:|---|
| **Life Skills** | 🧭 | Home chores, safety decisions, waste sorting |
| **Human Skills** | 🤝 | Teamwork, communication, empathy at School |
| **Digital Skills** | 💻 | Coding puzzles, typing, debugging in the Digital Lab |
| **Vocational Skills** | 🌾 | Farming, resource & water budgeting |
| **Entrepreneurial Skills** | 💰 | Negotiation, pricing, marketing at the Market |

<br/>

## 💡 What Makes It Different

<table>
<tr><th>Existing Solution</th><th>Approach</th><th>Where SkillVerse Goes Further</th></tr>
<tr><td>🧱 <b>Minecraft Education</b></td><td>Open-ended creative 3D platform</td><td>Replaces open sandbox with a <b>directed, consequence-driven</b> journey and a unified skill profile</td></tr>
<tr><td>🎬 <b>UNICEF CRIIIO 4 GOOD</b></td><td>Guided, curated animated content</td><td>Turns passive content into <b>repeated, playable scenarios</b> with real-time consequences</td></tr>
<tr><td>❓ <b>Quiz-based EdTech</b></td><td>Question → Answer → Score</td><td>Replaces the loop with <b>Situation → Decision → Consequence → Skill Growth → Reward → Progression</b></td></tr>
</table>

**The core innovation:** a **shared cross-world state** — a persistent architecture where your choices on the Farm genuinely affect your outcomes in the Market. One character. One evolving story. Real trade-offs.

<br/>

## 🏗️ System Architecture

```mermaid
flowchart LR
    subgraph Client["🖥️ Browser (Any Device)"]
        UI["Phaser 3 Game Engine<br/>(TypeScript / JavaScript)"]
        LS[("localStorage<br/>Game State")]
    end

    subgraph Worlds["🌍 Game Worlds"]
        Home["🏠 Home World"]
        School["🏫 School World"]
        Farm["🌾 Farm World"]
        Market["🛒 Market World"]
        Dream["✨ Dream World"]
    end

    UI --> Home & School & Farm & Market & Dream
    Home -. XP + Flags .-> LS
    School -. XP + Flags .-> LS
    Farm -. XP + Flags .-> LS
    Market -. XP + Flags .-> LS
    LS -. Reads shared state .-> UI

    UI --> Deploy["🚀 GitHub Pages / Vercel / itch.io"]

    style Client fill:#f3e8ff,stroke:#6a0dad,stroke-width:2px
    style Worlds fill:#e8f8f0,stroke:#2e7d32,stroke-width:2px
    style LS fill:#fff3cd,stroke:#e6a817,stroke-width:2px
```

No backend, no paid APIs, no special hardware — it runs entirely client-side in a browser.

<br/>

## 🛠️ Tech Stack

<div align="center">

![Phaser](https://img.shields.io/badge/Phaser%203-8b5cf6?style=for-the-badge&logo=phaser&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-222?style=for-the-badge&logo=github&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000?style=for-the-badge&logo=vercel&logoColor=white)

</div>

| Layer | Choice | Why |
|---|---|---|
| **Game Engine** | Phaser 3 | Mature, browser-native, built-in physics & animation |
| **Logic** | JavaScript / TypeScript | Fast iteration, huge ecosystem |
| **Persistence** | Browser `localStorage` | Zero backend cost, works offline |
| **Hosting** | GitHub Pages / Vercel / itch.io | Free, one-URL deployment |
| **AI/IoT** | ❌ None (by design) | Keeps the prototype lightweight, portable & reliable |

<br/>

## 🗓️ Roadmap / Build Milestones

```mermaid
gantt
    dateFormat  X
    axisFormat %s h
    section Hackathon Build (36h)
    Setup core data, UI, repo         :m1, 0, 4h
    Build world mechanics             :m2, after m1, 14h
    Full integration & playtest       :m3, after m2, 4h
    Bug fixes & accessibility polish  :m4, after m3, 12h
    Final testing & demo prep         :m5, after m4, 2h
```

| Risk | Mitigation |
|---|---|
| 🔗 Integration failure across 5 worlds | Lock shared game-state schema upfront; integrate at hour 18, not the end |
| 📈 Scope creep | Hard cap: 2–4 mechanics per world |
| 🎨 Inconsistent mechanics | Shared UI kit + one branch per world with PR merges |
| 📡 Unreliable network | Maintain a working local build at all times |

<br/>

## 🌍 Expected Impact

- 🎒 **Primary users:** School children (11–14 initially, expanding to ages 3–16)
- 👩‍🏫 **Secondary users:** Teachers & parents, via a live skill-progress dashboard
- 🌐 **Access:** Runs on any browser — school lab PC, classroom laptop, or home phone. No install, no high-speed internet required
- 🏘️ **Reach:** Urban, semi-urban, and resource-constrained communities alike

**Key metrics we'll track:** completion rate · repeat-session rate · skill transfer to real tasks · five-pillar growth · learner sentiment · educator feedback.

<br/>

## 👩‍💻 Meet the Team — *The CodeX*

**Sardar Vallabhbhai National Institute of Technology · Surat, Gujarat**

| Avatar | Member | Role | Owns |
|:---:|---|---|---|
| <img src="https://placehold.co/80x80/6a0dad/ffffff?text=SS&font=montserrat" width="60"/> | **Samridh Sethi** *(Lead)* | 🏫 School World Lead | Communication & Digital Lab: body-language challenge, teamwork game, typing & coding puzzles |
| <img src="https://placehold.co/80x80/2e7d32/ffffff?text=SM&font=montserrat" width="60"/> | **Shiva Shankar Malekar** | 🏠 Home World Lead | Water-leak event, electrical-safety decisions, waste-sorting |
| <img src="https://placehold.co/80x80/558b2f/ffffff?text=SP&font=montserrat" width="60"/> | **Shaurya Prajapati** | 🌾 Farm World Lead | Crop grid, water-budget allocation, weather events, sustainability dashboard |
| <img src="https://placehold.co/80x80/c2185b/ffffff?text=AS&font=montserrat" width="60"/> | **Arpita Soholkar** | 🛒 Market World Lead | Sell-to-buyer flow, negotiation mini-game, profit calculation |
| <img src="https://placehold.co/80x80/1565c0/ffffff?text=LC&font=montserrat" width="60"/> | **Lavanya Choukiker** | 📣 Marketing Lead | Ad creation, packaging mini-games, customer-reaction scoring |
| <img src="https://placehold.co/80x80/e6a817/ffffff?text=SP&font=montserrat" width="60"/> | **Shreya Patil** | ⚙️ Systems & Integration Lead | Shared game-state schema, day loop, XP/coins/badges |

<br/>

## 🚀 Getting Started

```bash
# clone the repo
git clone https://github.com/<your-org>/skillverse.git
cd skillverse

# install dependencies
npm install

# run locally
npm run dev
```

Then open the local URL in your browser and start your first in-game day! 🌅

<br/>

## 📜 License

This project is submitted for the **IEEE WIE ILS 2026 National Hackathon**. License to be finalized by the team — MIT recommended for open collaboration.

<br/>

<div align="center">

### 🌸 *Powering Solutions. Empowering Women. Shaping Tomorrow.* 🌸

Made with 💜 by **Team The CodeX**

</div>
