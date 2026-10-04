with open('src/features/science/components/ScienceHub.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = '''const SCIENCE_BRANCHES = [
  { id: "biology", name: "Biology", icon: "??", color: "bg-emerald-500", available: true, description: "Explore life and how living things work." },
  { id: "physics", name: "Physics", icon: "??", color: "bg-blue-500", available: true, description: "Discover the laws of motion and energy." },
  { id: "chemistry", name: "Chemistry", icon: "??", color: "bg-purple-500", available: false, description: "Mix elements and understand matter." },
  { id: "earth", name: "Earth & Env.", icon: "??", color: "bg-amber-500", available: false, description: "Learn about our planet and climate." },
  { id: "space", name: "Space Science", icon: "??", color: "bg-slate-800", available: false, description: "Journey into the universe and beyond." },
];'''

replacement = '''const SCIENCE_BRANCHES = [
  { id: "biology", name: "Biology", icon: "??", color: "bg-emerald-500", available: true, description: "Explore life and how living things work." },
  { id: "physics", name: "Physics", icon: "??", color: "bg-blue-500", available: true, description: "Discover the laws of motion and energy." },
  { id: "chemistry", name: "Chemistry", icon: "??", color: "bg-purple-500", available: true, description: "Mix elements and understand matter." }
];'''

content = content.replace(target, replacement)

with open('src/features/science/components/ScienceHub.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated ScienceHub")
